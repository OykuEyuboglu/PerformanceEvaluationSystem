using PerformanceEvaluation.Domain.Common;

namespace PerformanceEvaluation.Domain.Entities;

public class EvaluationDetail : BaseEntity
{
    public int EvaluationId { get; set; }

    public Evaluation Evaluation { get; set; } = null!;

    public int PerformanceCriterionId { get; set; }

    public PerformanceCriterion PerformanceCriterion { get; set; } = null!;

    public int Score { get; set; }

}