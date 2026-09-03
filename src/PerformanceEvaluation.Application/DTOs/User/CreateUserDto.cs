using PerformanceEvaluation.Domain.Enums;

namespace PerformanceEvaluation.Application.DTOs.User
{
    public class CreateUserDto
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public UserRole Role { get; set; }
        public int DepartmentId { get; set; }
        public int? JobPositionId { get; set; }
    }
}
