using System.ComponentModel.DataAnnotations;

namespace PerformanceEvaluation.Application.DTOs
{
    public class LoginRequestDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}

