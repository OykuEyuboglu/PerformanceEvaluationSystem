using PerformanceEvaluation.Application.Interfaces;
using PerformanceEvaluation.Domain.Entities;
using PerformanceEvaluation.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace PerformanceEvaluation.Infrastructure.Repositories;

public class UserRepository : Repository<User>, IUserRepository
{
    private new readonly AppDbContext _context;

    public UserRepository(AppDbContext context)
        : base(context)
    {
        _context = context;
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Email == email);
    }

    public async Task<IEnumerable<User>> GetEmployeesByEvaluatorIdAsync(int evaluatorId)
    {
        return await _context.EvaluatorEmployees
            .Where(x => x.EvaluatorId == evaluatorId)
            .Select(x => x.Employee)
            .ToListAsync();
    }
}