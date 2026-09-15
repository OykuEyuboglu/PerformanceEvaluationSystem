using System.Net;
using System.Net.Http.Json;
using FluentAssertions;

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
}