using FluentValidation;
using PerformanceEvaluation.Application.DTOs;

using PerformanceEvaluation.Domain.Enums;

namespace PerformanceEvaluation.Application.Validators;

public class CreateUserValidator : AbstractValidator<CreateUserDto>
{

    public CreateUserValidator()
    {

        RuleFor(x => x.FirstName)

            .NotEmpty().WithMessage("Ad boş olamaz.")

            .MaximumLength(100);

        RuleFor(x => x.LastName)

            .NotEmpty().WithMessage("Soyad boş olamaz.")

            .MaximumLength(100);

        RuleFor(x => x.Email)

            .NotEmpty().WithMessage("Email boş olamaz.")

            .EmailAddress().WithMessage("Geçerli bir email adresi giriniz.");

        RuleFor(x => x.Password)

            .NotEmpty().WithMessage("Şifre boş olamaz.")

            .MinimumLength(6).WithMessage("Şifre en az 6 karakter olmalıdır.");

        RuleFor(x => x.Role).IsInEnum().WithMessage("Geçerli bir rol seçilmelidir.");

        RuleFor(x => x.JobPositionId)
    .GreaterThan(0)
    .WithMessage("Pozisyon seçilmelidir.");

        RuleFor(x => x.DepartmentId)

            .GreaterThan(0).WithMessage("Departman seçilmelidir.");

    }

}