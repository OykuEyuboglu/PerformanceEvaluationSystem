using PerformanceEvaluation.Domain.Common;

namespace PerformanceEvaluation.Domain.Entities;

public class PerformanceCategory : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public decimal Weight { get; set; } 
    public bool IsActive { get; set; } = true;

    public ICollection<PerformanceCriterion> Criteria { get; set; } = new List<PerformanceCriterion>();
}