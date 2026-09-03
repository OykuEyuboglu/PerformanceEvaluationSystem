using FluentValidation;
using PerformanceEvaluation.Application.DTOs.Evaluation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PerformanceEvaluation.Application.Validators;

public class CreateEvaluationValidator : AbstractValidator<CreateEvaluationDto>
{
    public CreateEvaluationValidator()
    {
        RuleFor(x => x.EmployeeId)
            .GreaterThan(0).WithMessage("Çalışan seçilmelidir.");

        RuleFor(x => x.EvaluationPeriodId)
            .GreaterThan(0).WithMessage("Değerlendirme dönemi seçilmelidir.");

        RuleFor(x => x.Comment)
            .MaximumLength(1000);

        RuleFor(x => x.Scores)
            .NotEmpty().WithMessage("En az bir kriter puanlanmalıdır.");

        RuleForEach(x => x.Scores).ChildRules(score =>
        {
            score.RuleFor(s => s.PerformanceCriterionId).GreaterThan(0);
            score.RuleFor(s => s.Score)
                .InclusiveBetween(1, 5).WithMessage("Puan 1 ile 5 arasında olmalıdır.");
        });
    }
}