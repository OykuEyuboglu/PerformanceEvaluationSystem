using AutoMapper;
using PerformanceEvaluation.Application.DTOs.Evaluation;
using PerformanceEvaluation.Application.Interfaces;
using PerformanceEvaluation.Domain.Entities;
using PerformanceEvaluation.Domain.Enums;
using System.Security.Claims;

namespace PerformanceEvaluation.Application.Services;

public class EvaluationService : IEvaluationService
{
    private readonly IEvaluationRepository _evaluationRepository;
    private readonly IPerformanceCriterionRepository _criterionRepository;
    private readonly IUserRepository _userRepository;
    private readonly IRepository<EvaluationPeriod> _evaluationPeriodRepository;
    private readonly IEvaluatorEmployeeRepository _evaluatorEmployeeRepository;
    private readonly IMapper _mapper;

    public EvaluationService(
        IEvaluationRepository evaluationRepository,
        IPerformanceCriterionRepository criterionRepository,
        IUserRepository userRepository,
        IEvaluatorEmployeeRepository evaluatorEmployeeRepository,
        IRepository<EvaluationPeriod> evaluationPeriodRepository,
        IMapper mapper)
    {
        _evaluationRepository = evaluationRepository;
        _criterionRepository = criterionRepository;
        _userRepository = userRepository;
        _evaluatorEmployeeRepository = evaluatorEmployeeRepository;
        _evaluationPeriodRepository = evaluationPeriodRepository;
        _mapper = mapper;
    }

    public async Task<EvaluationDto> CreateAsync(
        CreateEvaluationDto dto,
        ClaimsPrincipal evaluatorClaims)
    {
        var evaluatorId = int.Parse(
            evaluatorClaims.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? evaluatorClaims.FindFirst("sub")?.Value
            ?? throw new UnauthorizedAccessException(
                "Kullanıcı kimliği bulunamadı."));

        var evaluator = await _userRepository.GetByIdAsync(evaluatorId);

        if (evaluator is null)
            throw new UnauthorizedAccessException(
                "Evaluator kullanıcısı bulunamadı.");

        if (!evaluator.IsActive)
            throw new UnauthorizedAccessException(
                "Pasif kullanıcı değerlendirme yapamaz.");

        if (evaluator.Role != UserRole.Evaluator)
            throw new UnauthorizedAccessException(
                "Bu kullanıcı değerlendirme yapma yetkisine sahip değil.");

        var managedEmployees =
            await _userRepository.GetEmployeesByEvaluatorIdAsync(evaluatorId);

        if (!managedEmployees.Any(e => e.Id == dto.EmployeeId))
            throw new UnauthorizedAccessException(
                "Bu çalışanı değerlendirme yetkiniz yok.");

        var employee = managedEmployees
            .First(e => e.Id == dto.EmployeeId);

        if (!employee.IsActive)
            throw new InvalidOperationException(
                "Pasif durumdaki çalışan değerlendirilemez.");

        var evaluationPeriod =
            await _evaluationPeriodRepository.GetByIdAsync(
                dto.EvaluationPeriodId);

        if (evaluationPeriod is null)
            throw new KeyNotFoundException(
                "Değerlendirme dönemi bulunamadı.");

        var alreadyEvaluated =
    await _evaluationRepository.ExistsByEvaluatorEmployeePeriodAsync(
        evaluatorId,
        dto.EmployeeId,
        dto.EvaluationPeriodId);

        if (alreadyEvaluated)
        {
            throw new InvalidOperationException(
                "Bu çalışan için seçilen değerlendirme döneminde zaten bir değerlendirme bulunmaktadır.");
        }

        if (DateTime.Now.Date < evaluationPeriod.StartDate.Date ||
            DateTime.Now.Date > evaluationPeriod.EndDate.Date)
        {
            throw new InvalidOperationException(
                "Değerlendirme dönemi aktif değil.");
        }

        var criteria =
            (await _criterionRepository.GetActiveWithDescriptionsAsync())
            .Where(c => c.PerformanceCategory.IsActive)
            .ToList();

        var activeCategories = criteria
            .Select(c => c.PerformanceCategory)
            .DistinctBy(c => c.Id)
            .ToList();

        var totalActiveWeight = activeCategories
            .Sum(c => c.Weight);

        if (totalActiveWeight != 100)
        {
            throw new InvalidOperationException(
                $"Aktif performans kategorilerinin ağırlık toplamı %100 olmalıdır. Mevcut toplam: %{totalActiveWeight}");
        }

        var criteriaLookup = criteria.ToDictionary(c => c.Id);

        if (!dto.Scores.Any())
            throw new InvalidOperationException(
                "En az bir kriter puanlanmalıdır.");

        if (dto.Scores.Any(x => x.Score < 1 || x.Score > 5))
            throw new InvalidOperationException(
                "Kriter puanları 1 ile 5 arasında olmalıdır.");

        if (employee.JobPositionId is null)
        {
            throw new InvalidOperationException(
                "Çalışanın pozisyonu tanımlı olmadığı için değerlendirme yapılamaz.");
        }

        var employeeJobPositionId = employee.JobPositionId.Value;

        var validCriterionIds = criteria
            .Where(c => c.JobPositionDescriptions.Any(
                d => d.JobPositionId == employeeJobPositionId))
            .Select(c => c.Id)
            .ToHashSet();

        if (!validCriterionIds.Any())
        {
            throw new InvalidOperationException(
                "Çalışanın pozisyonuna ait aktif performans kriteri bulunamadı.");
        }

        var activeCriterionIds = validCriterionIds;

        var submittedCriterionIds = dto.Scores
            .Select(s => s.PerformanceCriterionId)
            .ToList();

        if (submittedCriterionIds.Count !=
            submittedCriterionIds.Distinct().Count())
        {
            throw new InvalidOperationException(
                "Aynı kriter birden fazla kez puanlanamaz.");
        }

        if (submittedCriterionIds.Any(
            id => !activeCriterionIds.Contains(id)))
        {
            throw new InvalidOperationException(
                "Geçersiz veya pasif bir kriter puanlandı.");
        }

        if (submittedCriterionIds.Count != activeCriterionIds.Count)
        {
            throw new InvalidOperationException(
                "Tüm aktif kriterler puanlanmalıdır.");
        }

        var detailsWithCategory = dto.Scores.Select(s =>
        {
            var criterion =
                criteriaLookup.TryGetValue(
                    s.PerformanceCriterionId,
                    out var c)
                ? c
                : throw new KeyNotFoundException(
                    $"Kriter bulunamadı: {s.PerformanceCriterionId}");

            return new
            {
                s.PerformanceCriterionId,
                s.Score,
                criterion.PerformanceCategoryId,
                Weight = criterion.PerformanceCategory.Weight
            };
        }).ToList();

        var totalScore = detailsWithCategory
            .GroupBy(d => new
            {
                d.PerformanceCategoryId,
                d.Weight
            })
            .Sum(g =>
                (decimal)g.Average(x => x.Score)
                * (g.Key.Weight / 100m));

        var evaluation = new Evaluation
        {
            EmployeeId = dto.EmployeeId,
            EvaluatorId = evaluatorId,
            EvaluationPeriodId = dto.EvaluationPeriodId,
            Comment = dto.Comment,
            CreatedAt = DateTime.Now,
            UpdatedAt = DateTime.Now,
            CreatedBy = evaluatorId,
            Status = EvaluationStatus.Submitted,
            TotalScore = Math.Round(totalScore, 2),
            Details = dto.Scores.Select(s => new EvaluationDetail
            {
                PerformanceCriterionId = s.PerformanceCriterionId,
                Score = s.Score
            }).ToList()
        };

        await _evaluationRepository.AddAsync(evaluation);
        await _evaluationRepository.SaveChangesAsync();

        var created =
            await _evaluationRepository.GetByIdWithDetailsAsync(
                evaluation.Id);

        return _mapper.Map<EvaluationDto>(created);
    }

    public async Task<IEnumerable<EvaluationDto>> GetAllAsync(int? evaluationPeriodId = null)
    {
        var evaluations = await _evaluationRepository.GetAllSummaryAsync(evaluationPeriodId);
        return _mapper.Map<IEnumerable<EvaluationDto>>(evaluations);
    }

    public async Task<IEnumerable<EvaluationDto>> GetByEvaluatorAndPeriodAsync(
    int evaluatorId,
    int evaluationPeriodId,
    ClaimsPrincipal evaluatorClaims)
    {
        var userId = int.Parse(
            evaluatorClaims.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? evaluatorClaims.FindFirst("sub")?.Value
            ?? throw new UnauthorizedAccessException(
                "Kullanıcı kimliği bulunamadı."));

        var role =
            evaluatorClaims.FindFirst(ClaimTypes.Role)?.Value;

        if (role != "Evaluator")
            throw new UnauthorizedAccessException(
                "Bu bilgileri görüntüleme yetkiniz yok.");

        if (userId != evaluatorId)
            throw new UnauthorizedAccessException(
                "Başka bir Evaluator'ın değerlendirmelerini görüntüleme yetkiniz yok.");

        var evaluations =
            await _evaluationRepository.GetByEvaluatorAndPeriodAsync(
                evaluatorId,
                evaluationPeriodId);

        return _mapper.Map<IEnumerable<EvaluationDto>>(evaluations);
    }

    public async Task<IEnumerable<EvaluationDto>> GetMyEvaluationsAsync(
        ClaimsPrincipal employeeClaims)
    {
        var employeeId = int.Parse(
            employeeClaims.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? employeeClaims.FindFirst("sub")?.Value
            ?? throw new UnauthorizedAccessException(
                "Kullanıcı kimliği bulunamadı."));

        var evaluations =
            await _evaluationRepository.GetByEmployeeIdAsync(employeeId);

        return _mapper.Map<IEnumerable<EvaluationDto>>(evaluations);
    }

    public async Task<EvaluationDto> GetByIdAsync(
        int id,
        ClaimsPrincipal userClaims)
    {
        var evaluation =
            await _evaluationRepository.GetByIdWithDetailsAsync(id)
            ?? throw new KeyNotFoundException(
                "Değerlendirme bulunamadı.");

        var userId = int.Parse(
            userClaims.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? userClaims.FindFirst("sub")?.Value
            ?? throw new UnauthorizedAccessException(
                "Kullanıcı kimliği bulunamadı."));

        var role =
            userClaims.FindFirst(ClaimTypes.Role)?.Value;

        if (role == "Admin")
        {
            return _mapper.Map<EvaluationDto>(evaluation);
        }

        if (role == "Employee")
        {
            if (evaluation.EmployeeId != userId)
                throw new UnauthorizedAccessException(
                    "Bu değerlendirmeyi görüntüleme yetkiniz yok.");

            return _mapper.Map<EvaluationDto>(evaluation);
        }

        if (role == "Evaluator")
        {
            var isAssignedEmployee =
                await _evaluatorEmployeeRepository.ExistsAsync(
                    userId,
                    evaluation.EmployeeId);

            if (!isAssignedEmployee)
                throw new UnauthorizedAccessException(
                    "Bu çalışanın değerlendirmesini görüntüleme yetkiniz yok.");

            return _mapper.Map<EvaluationDto>(evaluation);
        }

        throw new UnauthorizedAccessException(
            "Bu değerlendirmeyi görüntüleme yetkiniz yok.");
    }

    public async Task<EvaluationDto> ApproveAsync(int id)
    {
        var evaluation = await _evaluationRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Değerlendirme bulunamadı.");

        if (evaluation.Status != EvaluationStatus.Submitted)
            throw new InvalidOperationException(
                "Sadece 'Gönderildi' durumundaki değerlendirmeler onaylanabilir.");

        evaluation.Status = EvaluationStatus.Approved;
        evaluation.UpdatedAt = DateTime.Now;

        _evaluationRepository.Update(evaluation);
        await _evaluationRepository.SaveChangesAsync();

        var updated = await _evaluationRepository.GetByIdWithDetailsAsync(id);
        return _mapper.Map<EvaluationDto>(updated);
    }

    public async Task<int> ApproveManyAsync(IEnumerable<int> ids)
    {
        var approvedCount = 0;

        foreach (var id in ids)
        {
            var evaluation = await _evaluationRepository.GetByIdAsync(id);
            if (evaluation is null || evaluation.Status != EvaluationStatus.Submitted)
                continue;

            evaluation.Status = EvaluationStatus.Approved;
            evaluation.UpdatedAt = DateTime.Now;
            _evaluationRepository.Update(evaluation);
            approvedCount++;
        }

        await _evaluationRepository.SaveChangesAsync();
        return approvedCount;
    }
}