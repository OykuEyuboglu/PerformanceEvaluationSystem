using PerformanceEvaluation.Domain.Common;
using PerformanceEvaluation.Domain.Enums;

namespace PerformanceEvaluation.Domain.Entities;

public class EvaluationPeriod : BaseEntity

{

    public string Name { get; set; } = string.Empty;

    public DateTime StartDate { get; set; }

    public DateTime EndDate { get; set; }

    public ICollection<Evaluation> Evaluations { get; set; } = new List<Evaluation>();

}