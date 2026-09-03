using PerformanceEvaluation.Application.Interfaces;
using PerformanceEvaluation.Domain.Entities;
using PerformanceEvaluation.Infrastructure.Data;

namespace PerformanceEvaluation.Infrastructure.Repositories;

public class PerformanceCategoryRepository : Repository<PerformanceCategory>, IPerformanceCategoryRepository
{
    public PerformanceCategoryRepository(AppDbContext context) : base(context) { }
}