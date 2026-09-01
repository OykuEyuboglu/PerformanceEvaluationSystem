using Microsoft.EntityFrameworkCore;

using Microsoft.EntityFrameworkCore.Metadata.Builders;

using PerformanceEvaluation.Domain.Entities;

namespace PerformanceEvaluation.Infrastructure.Data.Configurations;

public class JobPositionConfiguration : IEntityTypeConfiguration<JobPosition>

{

    public void Configure(EntityTypeBuilder<JobPosition> builder)

    {

        builder.Property(jp => jp.Name).IsRequired().HasMaxLength(100);

        builder.HasIndex(jp => jp.Name).IsUnique();

    }

}