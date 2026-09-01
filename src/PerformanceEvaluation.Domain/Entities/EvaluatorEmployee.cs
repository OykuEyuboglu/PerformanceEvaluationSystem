using PerformanceEvaluation.Domain.Common;

namespace PerformanceEvaluation.Domain.Entities;

// Evaluator - Employee ilişkisi (FR6 icin)
public class EvaluatorEmployee : BaseEntity
{
    public int EvaluatorId { get; set; }
    public User Evaluator { get; set; } = null!;

    public int EmployeeId { get; set; }
    public User Employee { get; set; } = null!;
}