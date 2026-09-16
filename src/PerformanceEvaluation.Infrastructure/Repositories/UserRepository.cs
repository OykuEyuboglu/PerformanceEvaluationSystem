using Microsoft.EntityFrameworkCore;
using PerformanceEvaluation.Application.Interfaces;
using PerformanceEvaluation.Domain.Entities;
using PerformanceEvaluation.Infrastructure.Data;

namespace PerformanceEvaluation.Infrastructure.Repositories;

public class UserRepository : Repository<User>, IUserRepository
{
    public UserRepository(AppDbContext context)
        : base(context)
    {
    }

    public new async Task<User?> GetByIdAsync(int id)
    {
        return await _context.Users
            .Include(u => u.Department)
            .Include(u => u.JobPosition)
            .FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted);
    }

    public new async Task<IEnumerable<User>> GetAllAsync()
    {
        return await _context.Users
            .Include(u => u.Department)
            .Include(u => u.JobPosition)
            .Where(u => !u.IsDeleted)
            .ToListAsync();
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _context.Users
            .Include(u => u.Department)
            .Include(u => u.JobPosition)
            .FirstOrDefaultAsync(u => u.Email == email && !u.IsDeleted);
    }

    public async Task<IEnumerable<User>> GetEmployeesByEvaluatorIdAsync(int evaluatorId)
    {
        return await _context.EvaluatorEmployees
            .Where(x => x.EvaluatorId == evaluatorId)
            .Select(x => x.Employee)
            .Where(u => !u.IsDeleted)
            .ToListAsync();
    }
}