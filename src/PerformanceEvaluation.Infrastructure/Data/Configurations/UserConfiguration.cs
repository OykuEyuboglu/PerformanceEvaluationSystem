using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using PerformanceEvaluation.Domain.Entities;

namespace PerformanceEvaluation.Infrastructure.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.Property(u => u.FirstName).IsRequired().HasMaxLength(100);
        builder.Property(u => u.LastName).IsRequired().HasMaxLength(100);
        builder.Property(u => u.Email).IsRequired().HasMaxLength(200);
        builder.HasIndex(u => u.Email).IsUnique();

        builder.Property(u => u.Role)
            .HasConversion<int>()
            .HasColumnType("int");

        builder.HasOne<User>()
    .WithMany()
    .HasForeignKey(u => u.CreatedBy)
    .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(u => u.Department)
            .WithMany(d => d.Users)
            .HasForeignKey(u => u.DepartmentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(u => u.JobPosition)
            .WithMany(jp => jp.Users)
            .HasForeignKey(u => u.JobPositionId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired(false);
    }
}