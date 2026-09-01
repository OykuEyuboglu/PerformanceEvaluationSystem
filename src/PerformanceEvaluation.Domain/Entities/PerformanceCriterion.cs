using PerformanceEvaluation.Domain.Common;

namespace PerformanceEvaluation.Domain.Entities;

public class PerformanceCriterion : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;

    public int PerformanceCategoryId { get; set; }
    public PerformanceCategory PerformanceCategory { get; set; } = null!;

    public ICollection<EvaluationDetail> EvaluationDetails { get; set; } = new List<EvaluationDetail>();
    public ICollection<CriterionJobPosition> JobPositionDescriptions { get; set; } = new List<CriterionJobPosition>();
}