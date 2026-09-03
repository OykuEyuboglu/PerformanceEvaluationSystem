using FluentValidation;
using PerformanceEvaluation.Application.DTOs.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PerformanceEvaluation.Application.Validators.Criteria
{
    public class CreatePerformanceCategoryValidator : AbstractValidator<CreatePerformanceCategoryDto>
    {
        public CreatePerformanceCategoryValidator()
        {

            RuleFor(x => x.Name)

                .NotEmpty().WithMessage("Ana başlık adı boş olamaz.")

                .MaximumLength(150);

            RuleFor(x => x.Weight)

                .InclusiveBetween(0, 100).WithMessage("Ağırlık 0 ile 100 arasında olmalıdır.");

        }

    }
}