using AutoMapper;
using Microsoft.Extensions.DependencyInjection;
using PerformanceEvaluation.Application.Interfaces;
using PerformanceEvaluation.Application.Mapping;
using PerformanceEvaluation.Application.Services;

namespace PerformanceEvaluation.API.Extensions;

public static class ServiceExtensions
{
    public static IServiceCollection AddApplicationServices(
        this IServiceCollection services)
    {
        services.AddAutoMapper(cfg =>
        {
            cfg.AddProfile<MappingProfile>();
        });

        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<ICriteriaService, CriteriaService>();
        services.AddScoped<IEvaluationService, EvaluationService>();
        services.AddScoped<IReportService, ReportService>();
        services.AddScoped<IExportService, ExportService>();
        services.AddScoped<IEvaluatorEmployeeService, EvaluatorEmployeeService>();
        services.AddScoped<IEvaluationPeriodService, EvaluationPeriodService>();
        services.AddScoped<IDepartmentService, DepartmentService>();
        services.AddScoped<IJobPositionService, JobPositionService>();

        return services;
    }
}