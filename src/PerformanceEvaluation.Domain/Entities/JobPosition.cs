using PerformanceEvaluation.Domain.Common;

namespace PerformanceEvaluation.Domain.Entities;

// Developer / QA / Analyst — sistem rolünden (UserRole) bağımsız iş pozisyonu
public class JobPosition : BaseEntity
{
    public string Name { get; set; } = string.Empty;

    public int DepartmentId { get; set; }

    public Department Department { get; set; } = null!;

    public ICollection<User> Users { get; set; } = new List<User>();

    public ICollection<CriterionJobPosition> CriterionDescriptions { get; set; }
        = new List<CriterionJobPosition>();
}