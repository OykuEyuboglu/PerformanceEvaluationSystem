using PerformanceEvaluation.Application.DTOs.User;

namespace PerformanceEvaluation.Application.Interfaces;

public interface IAuthService
{
    Task<LoginResponseDto> LoginAsync(LoginRequestDto request);
}