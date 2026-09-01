using Microsoft.EntityFrameworkCore;

using Microsoft.EntityFrameworkCore.Metadata.Builders;

using PerformanceEvaluation.Domain.Entities;

namespace PerformanceEvaluation.Infrastructure.Data.Configurations;

public class EvaluationConfiguration : IEntityTypeConfiguration<Evaluation>

{

    public void Configure(EntityTypeBuilder<Evaluation> builder)

    {

        builder.Property(e => e.Comment).HasMaxLength(1000);

        builder.Property(e => e.TotalScore).HasColumnType("decimal(5,2)");

        builder.Property(e => e.Status)

            .HasConversion<string>()

            .HasMaxLength(20);

        builder.HasOne(e => e.Employee)

            .WithMany(u => u.EvaluationsReceived)

            .HasForeignKey(e => e.EmployeeId)

            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.Evaluator)

            .WithMany(u => u.EvaluationsGiven)

            .HasForeignKey(e => e.EvaluatorId)

            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(e => e.EvaluationPeriod)

            .WithMany(p => p.Evaluations)

            .HasForeignKey(e => e.EvaluationPeriodId)

            .OnDelete(DeleteBehavior.Restrict);

    }

}