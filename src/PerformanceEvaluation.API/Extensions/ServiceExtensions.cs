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

        return services;
    }
}