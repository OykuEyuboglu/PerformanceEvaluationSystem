using PerformanceEvaluation.Domain.Common;

namespace PerformanceEvaluation.Domain.Entities;

// Developer / QA / Analyst — sistem rolünden (UserRole) bağımsız iş pozisyonu
public class JobPosition : BaseEntity
{
    public string Name { get; set; } = string.Empty;

    public ICollection<User> Users { get; set; } = new List<User>();
    public ICollection<CriterionJobPosition> CriterionDescriptions { get; set; } = new List<CriterionJobPosition>();
}