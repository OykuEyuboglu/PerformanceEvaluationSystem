using PerformanceEvaluation.Domain.Common;

using PerformanceEvaluation.Domain.Enums;

namespace PerformanceEvaluation.Domain.Entities;

public class Evaluation : AuditableEntity

{
    public int EmployeeId { get; set; }

    public User Employee { get; set; } = null!;

    public int EvaluatorId { get; set; }

    public User Evaluator { get; set; } = null!;

    public int EvaluationPeriodId { get; set; }

    public EvaluationPeriod EvaluationPeriod { get; set; } = null!;

    public string? Comment { get; set; }

    public decimal TotalScore { get; set; } 

    public EvaluationStatus Status { get; set; } = EvaluationStatus.Draft;

    public ICollection<EvaluationDetail> Details { get; set; } = new List<EvaluationDetail>();

}