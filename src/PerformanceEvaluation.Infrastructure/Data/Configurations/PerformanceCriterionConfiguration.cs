using Microsoft.EntityFrameworkCore;

using Microsoft.EntityFrameworkCore.Metadata.Builders;

using PerformanceEvaluation.Domain.Entities;

namespace PerformanceEvaluation.Infrastructure.Data.Configurations;

public class PerformanceCriterionConfiguration : IEntityTypeConfiguration<PerformanceCriterion>

{

    public void Configure(EntityTypeBuilder<PerformanceCriterion> builder)

    {

        builder.Property(c => c.Name).IsRequired().HasMaxLength(150);

        builder.HasOne(c => c.PerformanceCategory)

            .WithMany(cat => cat.Criteria)

            .HasForeignKey(c => c.PerformanceCategoryId)

            .OnDelete(DeleteBehavior.Cascade);

    }

}