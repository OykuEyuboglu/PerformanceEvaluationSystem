using Microsoft.EntityFrameworkCore;

using Microsoft.EntityFrameworkCore.Metadata.Builders;

using PerformanceEvaluation.Domain.Entities;

namespace PerformanceEvaluation.Infrastructure.Data.Configurations;

public class EvaluationDetailConfiguration : IEntityTypeConfiguration<EvaluationDetail>

{

    public void Configure(EntityTypeBuilder<EvaluationDetail> builder)

    {

        builder.Property(d => d.Score).IsRequired();

        builder.HasOne(d => d.Evaluation)

            .WithMany(e => e.Details)

            .HasForeignKey(d => d.EvaluationId)

            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(d => d.PerformanceCriterion)

            .WithMany(c => c.EvaluationDetails)

            .HasForeignKey(d => d.PerformanceCriterionId)

            .OnDelete(DeleteBehavior.Restrict);

    }

}