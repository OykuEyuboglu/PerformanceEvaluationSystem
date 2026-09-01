using PerformanceEvaluation.Domain.Common;
using PerformanceEvaluation.Domain.Enums;

namespace PerformanceEvaluation.Domain.Entities;

public class CriterionJobPosition : BaseEntity

{

    public int PerformanceCriterionId { get; set; }

    public PerformanceCriterion PerformanceCriterion { get; set; } = null!;

    public int JobPositionId { get; set; }

    public JobPosition JobPosition { get; set; } = null!;

    public string Description { get; set; } = string.Empty;

}