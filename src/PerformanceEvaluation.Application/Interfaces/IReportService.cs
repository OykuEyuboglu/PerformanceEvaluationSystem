using PerformanceEvaluation.Application.DTOs.Report;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace PerformanceEvaluation.Application.Interfaces
{
    public interface IReportService
    {
        Task<IEnumerable<EmployeeRankingDto>> GetDepartmentRankingAsync(
         int evaluationPeriodId);

        Task<IEnumerable<EmployeeRankingDto>> GetTeamRankingAsync(
            ClaimsPrincipal evaluatorClaims,
            int evaluationPeriodId);

    }
}
