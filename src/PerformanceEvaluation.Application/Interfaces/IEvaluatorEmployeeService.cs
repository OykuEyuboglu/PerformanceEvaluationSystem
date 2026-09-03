using PerformanceEvaluation.Application.DTOs.EvaluatorEmployee;
using System.Security.Claims;

namespace PerformanceEvaluation.Application.Interfaces;

public interface IEvaluatorEmployeeService
{
    Task<EvaluatorEmployeeDto> AssignAsync(
        AssignEvaluatorEmployeeDto dto);

    Task<IEnumerable<EvaluatorEmployeeDto>> GetByEvaluatorIdAsync(
        int evaluatorId,
        ClaimsPrincipal userClaims);

    Task RemoveAsync(
        int evaluatorId,
        int employeeId);
}