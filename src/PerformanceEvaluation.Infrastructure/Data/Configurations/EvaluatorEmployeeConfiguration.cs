using Microsoft.EntityFrameworkCore;

using Microsoft.EntityFrameworkCore.Metadata.Builders;

using PerformanceEvaluation.Domain.Entities;

namespace PerformanceEvaluation.Infrastructure.Data.Configurations;

public class EvaluatorEmployeeConfiguration : IEntityTypeConfiguration<EvaluatorEmployee>

{
    public void Configure(EntityTypeBuilder<EvaluatorEmployee> builder)

    {

        builder.HasOne(ee => ee.Evaluator)

            .WithMany(u => u.ManagedEmployees)

            .HasForeignKey(ee => ee.EvaluatorId)

            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(ee => ee.Employee)

            .WithMany(u => u.Evaluators)

            .HasForeignKey(ee => ee.EmployeeId)

            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(ee => new { ee.EvaluatorId, ee.EmployeeId }).IsUnique();

    }

}