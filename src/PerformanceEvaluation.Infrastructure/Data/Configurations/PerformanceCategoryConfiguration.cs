using Microsoft.EntityFrameworkCore;

using Microsoft.EntityFrameworkCore.Metadata.Builders;

using PerformanceEvaluation.Domain.Entities;

namespace PerformanceEvaluation.Infrastructure.Data.Configurations;

public class PerformanceCategoryConfiguration : IEntityTypeConfiguration<PerformanceCategory>

{

    public void Configure(EntityTypeBuilder<PerformanceCategory> builder)

    {

        builder.Property(c => c.Name).IsRequired().HasMaxLength(150);

        builder.Property(c => c.Weight).HasColumnType("decimal(5,2)");

    }

}