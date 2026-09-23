using PerformanceEvaluation.Application.DTOs.Evaluation;
using System.Security.Claims;

namespace PerformanceEvaluation.Application.Interfaces;

public interface IEvaluationService
{
    Task<EvaluationDto> CreateAsync(CreateEvaluationDto dto, ClaimsPrincipal evaluatorClaims);
    Task<PagedResultDto<EvaluationDto>> GetAllAsync(int? evaluationPeriodId, int page, int pageSize);
    Task<int> ApproveManyAsync(IEnumerable<int> ids);
    Task<IEnumerable<EvaluationDto>> GetMyEvaluationsAsync(ClaimsPrincipal employeeClaims);
    Task<EvaluationDto> GetByIdAsync(int id, ClaimsPrincipal userClaims);
    Task<IEnumerable<EvaluationDto>> GetByEvaluatorAndPeriodAsync(int evaluatorId, int evaluationPeriodId, ClaimsPrincipal evaluatorClaims);
    Task<EvaluationDto> ApproveAsync(int id);

}