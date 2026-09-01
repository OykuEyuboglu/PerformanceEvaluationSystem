using Microsoft.EntityFrameworkCore;

using Microsoft.EntityFrameworkCore.Metadata.Builders;

using PerformanceEvaluation.Domain.Entities;

namespace PerformanceEvaluation.Infrastructure.Data.Configurations;

public class EvaluationPeriodConfiguration : IEntityTypeConfiguration<EvaluationPeriod>

{

    public void Configure(EntityTypeBuilder<EvaluationPeriod> builder)

    {

        builder.Property(p => p.Name).IsRequired().HasMaxLength(50);

    }

}