using PerformanceEvaluation.Domain.Enums;

namespace PerformanceEvaluation.Application.DTOs
{
    public class CreateUserDto
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        // 1 = Admin, 2 = Evaluator, 3 = Employee
        public UserRole Role { get; set; }
        public int DepartmentId { get; set; }
        public int? JobPositionId { get; set; }
    }
}
