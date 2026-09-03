using FluentValidation;
using PerformanceEvaluation.Application.DTOs.User;

namespace PerformanceEvaluation.Application.Validators.User;

public class LoginValidator : AbstractValidator<LoginRequestDto>
{
    public LoginValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email boş olamaz.");
         //   .EmailAddress().WithMessage("Geçerli bir email adresi giriniz.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Şifre boş olamaz.");
    }
}