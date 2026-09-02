using PerformanceEvaluation.Domain.Enums;
namespace PerformanceEvaluation.Application.DTOs 
{ 
    public class UpdateUserDto 
    { 
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public UserRole Role { get; set; }
        public int DepartmentId { get; set; }
        public int? JobPositionId { get; set; }
        public bool IsActive { get; set; }
    }
}