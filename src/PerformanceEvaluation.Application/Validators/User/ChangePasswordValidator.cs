using FluentValidation;
using PerformanceEvaluation.Application.DTOs.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PerformanceEvaluation.Application.Validators.User
{
    public class ChangePasswordValidator : AbstractValidator<ChangePasswordDto>
    {
        public ChangePasswordValidator()
        {
            RuleFor(x => x.NewPassword)
                .NotEmpty()
                .WithMessage("Şifre gereklidir")

                .MinimumLength(8)
                .WithMessage("Şifre en az 8 karakter olmalı")

                .MaximumLength(256)
                .WithMessage("Şifre maksimum 256 karakter olabilir")

                .Matches(@"[A-Z]")
                .WithMessage("Şifre en az bir büyük harf içermeli")

                .Matches(@"[a-z]")
                .WithMessage("Şifre en az bir küçük harf içermeli")

                .Matches(@"[0-9]")
                .WithMessage("Şifre en az bir sayı içermeli")

                .Matches(@"[!@#$%^&*()_+\-=\[\]{};':""\|,.<>\/?]")
                .WithMessage("Şifre en az bir özel karakter içermeli");
        }
    }
}
