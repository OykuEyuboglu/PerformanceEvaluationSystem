using FluentValidation;
using PerformanceEvaluation.Application.DTOs.Criteria;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PerformanceEvaluation.Application.Validators.Criteria
{
    public class CreatePerformanceCriterionValidator : AbstractValidator<CreatePerformanceCriterionDto>
    {

        public CreatePerformanceCriterionValidator()
        {

            RuleFor(x => x.Name)

                .NotEmpty().WithMessage("Kriter adı boş olamaz.")

                .MaximumLength(150);

            RuleFor(x => x.PerformanceCategoryId)

                .GreaterThan(0).WithMessage("Ana başlık seçilmelidir.");

            RuleForEach(x => x.JobPositionDescriptions).ChildRules(jp =>

            {

                jp.RuleFor(d => d.JobPositionId).GreaterThan(0);

                jp.RuleFor(d => d.Description)

                    .NotEmpty().WithMessage("Pozisyon açıklaması boş olamaz.")

                    .MaximumLength(500);

            });

        }

    }
}