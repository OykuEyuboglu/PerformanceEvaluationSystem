using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PerformanceEvaluation.Application.DTOs.EvaluatorEmployee
{
    public class EvaluatorEmployeeDto
    {
        public int Id { get; set; }

        public int EvaluatorId { get; set; }
        public string EvaluatorName { get; set; } = string.Empty;

        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
    }
}