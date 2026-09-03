using Microsoft.EntityFrameworkCore;
using PerformanceEvaluation.Application.Interfaces;
using PerformanceEvaluation.Domain.Entities;
using PerformanceEvaluation.Infrastructure.Data;

namespace PerformanceEvaluation.Infrastructure.Repositories;

public class PerformanceCriterionRepository : Repository<PerformanceCriterion>, IPerformanceCriterionRepository
{
    public PerformanceCriterionRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<PerformanceCriterion>> GetAllWithDescriptionsAsync() =>
        await _dbSet
            .Include(c => c.PerformanceCategory)
            .Include(c => c.JobPositionDescriptions)
                .ThenInclude(jd => jd.JobPosition)
            .ToListAsync();

    public async Task<PerformanceCriterion?> GetByIdWithDescriptionsAsync(int id) =>
        await _dbSet
            .Include(c => c.PerformanceCategory)
            .Include(c => c.JobPositionDescriptions)
                .ThenInclude(jd => jd.JobPosition)
            .FirstOrDefaultAsync(c => c.Id == id);
}