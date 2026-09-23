using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Moq;
using PerformanceEvaluation.API.Controllers;
using PerformanceEvaluation.Application.DTOs.User;
using PerformanceEvaluation.Application.Interfaces;

namespace PerformanceEvaluation.IntegrationTests;

public class AuthControllerTests
    : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;

    public AuthControllerTests(
        TestWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Login_BosRequest_400Donmeli()
    {
        var client = _factory.CreateClient();

        var response =
            await client.PostAsJsonAsync(
                "/api/auth/login",
                new
                {
                    Email = "",
                    Password = ""
                });

        response.StatusCode
            .Should()
            .Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Login_GecersizKullanici_401Donmeli()
    {
        var client = _factory.CreateClient();

        var response =
            await client.PostAsJsonAsync(
                "/api/auth/login",
                new
                {
                    Email = "notfound@vakifbank.com",
                    Password = "WrongPassword123!"
                });

        response.StatusCode
            .Should()
            .Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Login_Direct_ReturnsOk()
    {
        var service =
            new Mock<IAuthService>();

        var dto =
            new LoginRequestDto
            {
                Email = "test@example.com",
                Password = "Test123!Password"
            };

        var controller =
            new AuthController(
                service.Object);

        var result =
            await controller.Login(dto);

        result
            .Should()
            .BeOfType<OkObjectResult>();

        service.Verify(
            x => x.LoginAsync(dto),
            Times.Once);
    }
}