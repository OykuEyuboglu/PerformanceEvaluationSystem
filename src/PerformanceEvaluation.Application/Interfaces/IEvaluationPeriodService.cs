using PerformanceEvaluation.Application.DTOs.EvaluatorEmployee;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PerformanceEvaluation.Application.Interfaces
{
    public interface IEvaluationPeriodService
    {
        Task<IEnumerable<EvaluationPeriodDto>> GetAllAsync();

        Task<EvaluationPeriodDto> CreateAsync(CreateEvaluationPeriodDto dto);
        Task<EvaluationPeriodDto> UpdateAsync(int id, UpdateEvaluationPeriodDto dto);
        Task DeleteAsync(int id);
    }
}