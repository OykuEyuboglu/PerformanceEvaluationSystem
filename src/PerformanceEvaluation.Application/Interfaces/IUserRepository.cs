using PerformanceEvaluation.Domain.Entities;

namespace PerformanceEvaluation.Application.Interfaces;

public interface IUserRepository : IRepository<User>
{
    Task<IEnumerable<User>> GetAllAsync();
    Task<User?> GetByIdAsync(int id);
    Task<User?> GetByEmailAsync(string email);
    Task<IEnumerable<User>> GetEmployeesByEvaluatorIdAsync(int evaluatorId);
}