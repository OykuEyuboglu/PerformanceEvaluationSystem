using Microsoft.EntityFrameworkCore;

using Microsoft.EntityFrameworkCore.Metadata.Builders;

using PerformanceEvaluation.Domain.Entities;

namespace PerformanceEvaluation.Infrastructure.Data.Configurations;

public class DepartmentConfiguration : IEntityTypeConfiguration<Department>

{
    public void Configure(EntityTypeBuilder<Department> builder)

    {

        builder.Property(d => d.Name).IsRequired().HasMaxLength(100);

        builder.HasIndex(d => d.Name).IsUnique();

    }

}