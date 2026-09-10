using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Security.Claims;

namespace PerformanceEvaluation.Application.Interfaces;

public interface IExportService
{
    Task<byte[]> ExportDepartmentRankingToExcelAsync(int evaluationPeriodId);
    Task<byte[]> ExportTeamRankingToExcelAsync(ClaimsPrincipal evaluatorClaims, int evaluationPeriodId);
}