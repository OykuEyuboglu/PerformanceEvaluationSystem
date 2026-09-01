using Microsoft.EntityFrameworkCore;

using Microsoft.EntityFrameworkCore.Metadata.Builders;

using PerformanceEvaluation.Domain.Entities;

namespace PerformanceEvaluation.Infrastructure.Data.Configurations;

public class CriterionJobPositionConfiguration : IEntityTypeConfiguration<CriterionJobPosition>

{

    public void Configure(EntityTypeBuilder<CriterionJobPosition> builder)

    {

        builder.Property(cjp => cjp.Description).IsRequired().HasMaxLength(500);

        builder.HasOne(cjp => cjp.PerformanceCriterion)

            .WithMany(c => c.JobPositionDescriptions)

            .HasForeignKey(cjp => cjp.PerformanceCriterionId)

            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(cjp => cjp.JobPosition)

            .WithMany(jp => jp.CriterionDescriptions)

            .HasForeignKey(cjp => cjp.JobPositionId)

            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(cjp => new { cjp.PerformanceCriterionId, cjp.JobPositionId }).IsUnique();

    }

}