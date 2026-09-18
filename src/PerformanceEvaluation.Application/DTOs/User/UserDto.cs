namespace PerformanceEvaluation.Application.DTOs.User;

public class UserDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public string DepartmentName { get; set; } = string.Empty;
    public int? JobPositionId { get; set; }
    public string? JobPositionName { get; set; }
}