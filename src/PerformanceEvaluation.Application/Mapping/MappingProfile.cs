using AutoMapper;
using PerformanceEvaluation.Application.DTOs.Criteria;
using PerformanceEvaluation.Application.DTOs.Evaluation;
using PerformanceEvaluation.Application.DTOs.User;
using PerformanceEvaluation.Domain.Entities;

namespace PerformanceEvaluation.Application.Mapping;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<User, UserDto>()
            .ForMember(dest => dest.DepartmentName,opt => opt.MapFrom(src =>src.Department != null ? src.Department.Name : null))
            .ForMember(dest => dest.JobPositionName, opt => opt.MapFrom(src => src.JobPosition != null ? src.JobPosition.Name : null))
            .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role.ToString()));

        CreateMap<PerformanceCategory, PerformanceCategoryDto>();

        CreateMap<PerformanceCriterion, PerformanceCriterionDto>()
            .ForMember(dest => dest.PerformanceCategoryName, opt => opt.MapFrom(src => src.PerformanceCategory != null ? src.PerformanceCategory.Name : null))
            .ForMember(dest => dest.JobPositionDescriptions, opt => opt.MapFrom(src => src.JobPositionDescriptions));

        CreateMap<CriterionJobPosition, CriterionJobPositionDto>()
           .ForMember(dest => dest.JobPositionName, opt => opt.MapFrom(src =>src.JobPosition != null ? src.JobPosition.Name : null));

        CreateMap<Evaluation, EvaluationDto>()
            .ForMember(dest => dest.EmployeeName,opt => opt.MapFrom(src => src.Employee != null ? $"{src.Employee.FirstName} {src.Employee.LastName}" : null))
            .ForMember(dest => dest.EvaluatorName, opt => opt.MapFrom(src => src.Evaluator != null ? $"{src.Evaluator.FirstName} {src.Evaluator.LastName}" : null))
            .ForMember(dest => dest.EvaluationPeriodName, opt => opt.MapFrom(src => src.EvaluationPeriod != null ? src.EvaluationPeriod.Name : null))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));

        CreateMap<EvaluationDetail, EvaluationDetailDto>()
            .ForMember(dest => dest.CriterionName, opt => opt.MapFrom(src => src.PerformanceCriterion != null ? src.PerformanceCriterion.Name : null))
            .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.PerformanceCriterion.PerformanceCategory != null ? src.PerformanceCriterion.PerformanceCategory.Name : null));
    }
}