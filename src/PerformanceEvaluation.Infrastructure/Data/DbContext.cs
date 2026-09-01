using Microsoft.EntityFrameworkCore;
using PerformanceEvaluation.Domain.Entities;

namespace PerformanceEvaluation.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<JobPosition> JobPositions => Set<JobPosition>();
    public DbSet<EvaluatorEmployee> EvaluatorEmployees => Set<EvaluatorEmployee>();
    public DbSet<PerformanceCategory> PerformanceCategories => Set<PerformanceCategory>();
    public DbSet<PerformanceCriterion> PerformanceCriteria => Set<PerformanceCriterion>();
    public DbSet<CriterionJobPosition> CriterionJobPositions => Set<CriterionJobPosition>();
    public DbSet<EvaluationPeriod> EvaluationPeriods => Set<EvaluationPeriod>();
    public DbSet<Evaluation> Evaluations => Set<Evaluation>();
    public DbSet<EvaluationDetail> EvaluationDetails => Set<EvaluationDetail>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}