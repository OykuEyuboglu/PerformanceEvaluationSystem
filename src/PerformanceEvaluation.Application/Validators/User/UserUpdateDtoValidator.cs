using FluentValidation;
using PerformanceEvaluation.Application.DTOs.User;

public class UpdateUserValidator : AbstractValidator<UpdateUserDto>
{
    public UpdateUserValidator()
    {
        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("Ad boş olamaz.")
            .MaximumLength(100);

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Soyad boş olamaz.")
            .MaximumLength(100);

        RuleFor(x => x.Role)
            .IsInEnum()
            .WithMessage("Geçerli bir rol seçilmelidir.");

        RuleFor(x => x.DepartmentId)
            .GreaterThan(0).WithMessage("Departman seçilmelidir.");
    }
}