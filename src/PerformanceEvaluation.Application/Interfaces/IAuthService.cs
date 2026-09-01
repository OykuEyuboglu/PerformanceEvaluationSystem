using PerformanceEvaluation.Application.DTOs;

namespace PerformanceEvaluation.Application.Interfaces;

public interface IAuthService
{
    Task<LoginResponseDto> LoginAsync(LoginRequestDto request);
}