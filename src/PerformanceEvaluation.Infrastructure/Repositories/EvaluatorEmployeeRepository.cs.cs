using Microsoft.EntityFrameworkCore;
using PerformanceEvaluation.Application.Interfaces;
using PerformanceEvaluation.Domain.Entities;
using PerformanceEvaluation.Infrastructure.Data;

namespace PerformanceEvaluation.Infrastructure.Repositories;

public class EvaluatorEmployeeRepository
    : Repository<EvaluatorEmployee>, IEvaluatorEmployeeRepository
{
    public EvaluatorEmployeeRepository(AppDbContext context)
        : base(context)
    {
    }

    public async Task<IEnumerable<EvaluatorEmployee>> GetByEvaluatorIdAsync(
        int evaluatorId)
    {
        return await _dbSet
            .Include(x => x.Employee)
            .Include(x => x.Evaluator)
            .Where(x => x.EvaluatorId == evaluatorId)
            .ToListAsync();
    }

    public async Task<bool> ExistsAsync(
        int evaluatorId,
        int employeeId)
    {
        return await _dbSet.AnyAsync(x =>
            x.EvaluatorId == evaluatorId &&
            x.EmployeeId == employeeId);
    }
}