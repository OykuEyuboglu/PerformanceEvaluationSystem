using PerformanceEvaluation.Domain.Entities;

namespace PerformanceEvaluation.Application.Interfaces;

public interface IUserRepository : IRepository<User>
{
    Task<User?> GetByEmailAsync(string email);
    Task<IEnumerable<User>> GetEmployeesByEvaluatorIdAsync(int evaluatorId);
}