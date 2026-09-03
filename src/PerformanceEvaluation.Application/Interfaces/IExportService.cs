using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PerformanceEvaluation.Application.Interfaces;

public interface IExportService
{
    Task<byte[]> ExportDepartmentRankingToExcelAsync(
        int evaluationPeriodId);
}