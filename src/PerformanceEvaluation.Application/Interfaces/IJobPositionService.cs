using PerformanceEvaluation.Application.DTOs.JobPosition;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PerformanceEvaluation.Application.Interfaces
{
    public interface IJobPositionService
    {
        Task<IEnumerable<JobPositionDto>> GetAllAsync();
    }
}
