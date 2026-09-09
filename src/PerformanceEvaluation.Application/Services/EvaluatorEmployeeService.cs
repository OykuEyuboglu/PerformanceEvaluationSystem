using PerformanceEvaluation.Application.DTOs.EvaluatorEmployee;
using PerformanceEvaluation.Application.Interfaces;
using PerformanceEvaluation.Domain.Common;
using PerformanceEvaluation.Domain.Entities;
using PerformanceEvaluation.Domain.Enums;
using System.Security.Claims;

namespace PerformanceEvaluation.Application.Services;

public class EvaluatorEmployeeService : IEvaluatorEmployeeService
{
    private readonly IEvaluatorEmployeeRepository _repository;
    private readonly IUserRepository _userRepository;

    public EvaluatorEmployeeService(
        IEvaluatorEmployeeRepository repository,
        IUserRepository userRepository)
    {
        _repository = repository;
        _userRepository = userRepository;
    }

    public async Task<EvaluatorEmployeeDto> AssignAsync(
        AssignEvaluatorEmployeeDto dto)
    {
        var evaluator = await _userRepository.GetByIdAsync(dto.EvaluatorId)
            ?? throw new KeyNotFoundException(
                "Evaluator bulunamadı.");

        var employee = await _userRepository.GetByIdAsync(dto.EmployeeId)
            ?? throw new KeyNotFoundException(
                "Employee bulunamadı.");

        if (evaluator.Role != UserRole.Evaluator)
            throw new InvalidOperationException(
                "Seçilen kullanıcı Evaluator rolünde değil.");

        if (employee.Role != UserRole.Employee)
            throw new InvalidOperationException(
                "Seçilen kullanıcı Employee rolünde değil.");

        if (!evaluator.IsActive)
            throw new InvalidOperationException(
                "Pasif bir Evaluator'a çalışan atanamaz.");

        if (!employee.IsActive)
            throw new InvalidOperationException(
                "Pasif bir Employee değerlendiriciye atanamaz.");

        if (dto.EvaluatorId == dto.EmployeeId)
            throw new InvalidOperationException(
                "Evaluator kendisine atanamaz.");

        var alreadyExists = await _repository.ExistsAsync(
            dto.EvaluatorId,
            dto.EmployeeId);

        if (alreadyExists)
            throw new InvalidOperationException(
                "Bu çalışan zaten bu Evaluator'a atanmış.");

        var assignment = new EvaluatorEmployee
        {
            EvaluatorId = dto.EvaluatorId,
            EmployeeId = dto.EmployeeId
        };

        await _repository.AddAsync(assignment);
        await _repository.SaveChangesAsync();

        return new EvaluatorEmployeeDto
        {
            Id = assignment.Id,
            EvaluatorId = evaluator.Id,
            EvaluatorName = $"{evaluator.FirstName} {evaluator.LastName}",
            EmployeeJobPositionId = employee.JobPositionId,
            EmployeeJobPositionName = employee.JobPosition.Name,
            EmployeeId = employee.Id,
            EmployeeName = $"{employee.FirstName} {employee.LastName}"
        };
    }

    public async Task<IEnumerable<EvaluatorEmployeeDto>> GetByEvaluatorIdAsync(
        int evaluatorId,
        ClaimsPrincipal userClaims)
    {
        var userId = int.Parse(
            userClaims.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? userClaims.FindFirst("sub")?.Value
            ?? throw new UnauthorizedAccessException(
                "Kullanıcı kimliği bulunamadı."));

        var role = userClaims.FindFirst(ClaimTypes.Role)?.Value;

        // Admin tüm Evaluator'ların ekiplerini görebilir.
        if (role == "Admin")
        {
            // Devam et.
        }
        // Evaluator sadece kendi ekibini görebilir.
        else if (role == "Evaluator")
        {
            if (evaluatorId != userId)
                throw new ForbiddenAccessException(
                    "Başka bir Evaluator'ın ekibini görüntüleme yetkiniz yok.");
        }
        else
        {
            throw new ForbiddenAccessException(
                "Bu bilgileri görüntüleme yetkiniz yok.");
        }

        var assignments =
            await _repository.GetByEvaluatorIdAsync(evaluatorId);

        return assignments.Select(x => new EvaluatorEmployeeDto
        {
            Id = x.Id,
            EvaluatorId = x.EvaluatorId,
            EvaluatorName =
                $"{x.Evaluator.FirstName} {x.Evaluator.LastName}",
            EmployeeJobPositionId = x.Employee.JobPositionId,
            EmployeeJobPositionName = x.Employee.JobPosition?.Name,
            EmployeeId = x.EmployeeId,
            EmployeeName =
                $"{x.Employee.FirstName} {x.Employee.LastName}"
        });
    }

    public async Task RemoveAsync(
        int evaluatorId,
        int employeeId)
    {
        var assignments = await _repository.FindAsync(x =>
            x.EvaluatorId == evaluatorId &&
            x.EmployeeId == employeeId);

        var assignment = assignments.FirstOrDefault()
            ?? throw new KeyNotFoundException(
                "Evaluator-Employee ataması bulunamadı.");

        _repository.Remove(assignment);

        await _repository.SaveChangesAsync();
    }
}