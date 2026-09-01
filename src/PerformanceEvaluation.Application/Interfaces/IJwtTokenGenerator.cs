using PerformanceEvaluation.Domain.Entities;

namespace PerformanceEvaluation.Application.Interfaces
{

    public interface IJwtTokenGenerator
    {
        (string Token, DateTime ExpiresAt) GenerateToken(User user);

    }
}
