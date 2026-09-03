using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PerformanceEvaluation.Application.DTOs.Evaluation;

public class EvaluationDetailDto
{
    public int PerformanceCriterionId { get; set; }
    public string CriterionName { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public int Score { get; set; }
}
