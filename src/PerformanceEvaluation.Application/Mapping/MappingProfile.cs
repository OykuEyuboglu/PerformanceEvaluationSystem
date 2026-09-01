using AutoMapper;
using PerformanceEvaluation.Application.DTOs;
using PerformanceEvaluation.Domain.Entities;

namespace PerformanceEvaluation.Application.Mapping;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<User, UserDto>()
            .ForMember(dest => dest.DepartmentName, opt => opt.MapFrom(src => src.Department.Name))
            .ForMember(dest => dest.JobPositionName, opt => opt.MapFrom(src => src.JobPosition != null ? src.JobPosition.Name : null))
            .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role.ToString()));
    }
}