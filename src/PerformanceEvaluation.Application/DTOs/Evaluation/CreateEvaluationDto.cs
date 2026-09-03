using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PerformanceEvaluation.Application.DTOs.Evaluation;

public class CreateEvaluationDto
{
    public int EmployeeId { get; set; }
    public int EvaluationPeriodId { get; set; }
    public string? Comment { get; set; }
    public List<EvaluationDetailInputDto> Scores { get; set; } = new();
}
