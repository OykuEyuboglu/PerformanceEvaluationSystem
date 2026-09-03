using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PerformanceEvaluation.Application.DTOs.Evaluation
{
    public class EvaluationDto
    {
        public int Id { get; set; }
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
        public int EvaluatorId { get; set; }
        public string EvaluatorName { get; set; } = string.Empty;
        public string EvaluationPeriodName { get; set; } = string.Empty;
        public string? Comment { get; set; }
        public decimal TotalScore { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public List<EvaluationDetailDto> Details { get; set; } = new();
    }
}