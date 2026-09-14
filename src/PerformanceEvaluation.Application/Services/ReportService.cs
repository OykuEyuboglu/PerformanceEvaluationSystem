using PerformanceEvaluation.Application.DTOs.Report;
using PerformanceEvaluation.Application.Interfaces;
using PerformanceEvaluation.Domain.Entities;
using PerformanceEvaluation.Domain.Enums;
using System.Security.Claims;

namespace PerformanceEvaluation.Application.Services;

public class ReportService : IReportService
{
    private readonly IEvaluationRepository _evaluationRepository;
    private readonly IUserRepository _userRepository;

    public ReportService(
        IEvaluationRepository evaluationRepository,
        IUserRepository userRepository)
    {
        _evaluationRepository = evaluationRepository;
        _userRepository = userRepository;
    }

    public async Task<IEnumerable<EmployeeRankingDto>> GetDepartmentRankingAsync(
        int evaluationPeriodId)
    {
        var evaluations =
            await _evaluationRepository.GetAllWithDetailsAsync();

        var filtered = evaluations
      .Where(e =>
          e.EvaluationPeriodId == evaluationPeriodId);

        return BuildRanking(filtered);
    }

    public async Task<IEnumerable<EmployeeRankingDto>> GetTeamRankingAsync(
        ClaimsPrincipal evaluatorClaims,
        int evaluationPeriodId)
    {
        var evaluatorId = int.Parse(
            evaluatorClaims.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? evaluatorClaims.FindFirst("sub")?.Value
            ?? throw new UnauthorizedAccessException(
                "Kullanıcı kimliği bulunamadı."));

        var managedEmployees =
            await _userRepository.GetEmployeesByEvaluatorIdAsync(
                evaluatorId);

        var managedIds =
            managedEmployees
                .Select(e => e.Id)
                .ToHashSet();

        var evaluations =
            await _evaluationRepository.GetAllWithDetailsAsync();

        var filtered = evaluations
     .Where(e =>
         managedIds.Contains(e.EmployeeId) &&
         e.EvaluationPeriodId == evaluationPeriodId);

        return BuildRanking(filtered);
    }

    private static IEnumerable<EmployeeRankingDto> BuildRanking(
        IEnumerable<Evaluation> evaluations)
    {
        var ranked = evaluations
            .GroupBy(e => e.Employee)
            .Select(g => new EmployeeRankingDto
            {
                EmployeeId = g.Key.Id,
                EmployeeName =
                    $"{g.Key.FirstName} {g.Key.LastName}",
                DepartmentName =
                    g.Key.Department?.Name ?? "Belirtilmemiş",
                JobPositionName =
                    g.Key.JobPosition?.Name,
                AverageScore =
                    Math.Round(g.Average(e => e.TotalScore), 2),
                EvaluationCount = g.Count()
            })
            .OrderByDescending(r => r.AverageScore)
            .ToList();

        for (int i = 0; i < ranked.Count; i++)
            ranked[i].Rank = i + 1;

        return ranked;
    }
}