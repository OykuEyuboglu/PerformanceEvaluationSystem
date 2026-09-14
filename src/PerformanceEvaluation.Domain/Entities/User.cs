using PerformanceEvaluation.Domain.Common;
using PerformanceEvaluation.Domain.Enums;

namespace PerformanceEvaluation.Domain.Entities;

public class User : AuditableEntity
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public bool IsActive { get; set; } = true;

    public int DepartmentId { get; set; }
    public Department Department { get; set; } = null!;

    public int? JobPositionId { get; set; }
    public JobPosition? JobPosition { get; set; }
    public bool IsDeleted { get; set; } = false;
    public ICollection<EvaluatorEmployee> ManagedEmployees { get; set; } = new List<EvaluatorEmployee>();
    public ICollection<EvaluatorEmployee> Evaluators { get; set; } = new List<EvaluatorEmployee>();

    public ICollection<Evaluation> EvaluationsReceived { get; set; } = new List<Evaluation>();
    public ICollection<Evaluation> EvaluationsGiven { get; set; } = new List<Evaluation>();
}