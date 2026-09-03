using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PerformanceEvaluation.Application.DTOs.Report
{
    public class EmployeeRankingDto
    {
        public int Rank { get; set; }
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
        public string DepartmentName { get; set; } = string.Empty;
        public string? JobPositionName { get; set; }
        public decimal AverageScore { get; set; }
        public int EvaluationCount { get; set; }
    }
}
