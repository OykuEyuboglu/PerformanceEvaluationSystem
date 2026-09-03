using FluentValidation;
using PerformanceEvaluation.Application.DTOs.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PerformanceEvaluation.Application.Validators.User
{
    public class CreateUserDtoValidator : AbstractValidator<CreateUserDto>
    {
        public CreateUserDtoValidator()
        {
            RuleFor(x => x.FirstName)
                .NotEmpty().WithMessage("Ad gereklidir")
                .MaximumLength(100).WithMessage("Ad maksimum 100 karakter olabilir");

            RuleFor(x => x.LastName)
                .NotEmpty().WithMessage("Soyad gereklidir")
                .MaximumLength(100).WithMessage("Soyad maksimum 100 karakter olabilir");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email gereklidir")
                .EmailAddress().WithMessage("Geçerli bir email adresi giriniz")
                .MaximumLength(200).WithMessage("Email maksimum 200 karakter olabilir");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Şifre gereklidir")
                .MinimumLength(8).WithMessage("Şifre en az 8 karakter olmalı")
                .MaximumLength(256).WithMessage("Şifre maksimum 256 karakter olabilir")
                .Matches(@"[A-Z]").WithMessage("Şifre en az bir büyük harf içermeli")
                .Matches(@"[a-z]").WithMessage("Şifre en az bir küçük harf içermeli")
                .Matches(@"[0-9]").WithMessage("Şifre en az bir sayı içermeli")
                .Matches(@"[!@#$%^&*()_+\-=\[\]{};':""\|,.<>\/?]")
                .WithMessage("Şifre en az bir özel karakter içermeli");

            RuleFor(x => x.Role)
                .IsInEnum()
                .WithMessage("Geçerli bir rol seçilmelidir.");

            RuleFor(x => x.DepartmentId)
                .GreaterThan(0).WithMessage("Departman seçimi gereklidir");

            RuleFor(x => x.JobPositionId)
                .GreaterThan(0).When(x => x.JobPositionId.HasValue)
                .WithMessage("Pozisyon ID geçerli olmalıdır");
        }
    }
}

