using System.Net;
using FluentAssertions;

namespace PerformanceEvaluation.IntegrationTests;

public class DepartmentsControllerTests
    : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;

    public DepartmentsControllerTests(
        TestWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Theory]
    [InlineData("Admin")]
    [InlineData("Evaluator")]
    [InlineData("Employee")]
    public async Task GetAll_GirisYapmisTumRollerErisilebilir(
        string role)
    {
        var client = _factory.CreateClient();

        client.DefaultRequestHeaders.Add(
            TestAuthHandler.RoleHeader,
            role);

        client.DefaultRequestHeaders.Add(
            TestAuthHandler.UserIdHeader,
            "1");

        client.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue(
                TestAuthHandler.SchemeName);

        var response =
            await client.GetAsync("/api/departments");

        response.StatusCode.Should()
            .NotBe(HttpStatusCode.Unauthorized);

        response.StatusCode.Should()
            .NotBe(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task GetAll_KimlikDogrulamaOlmadan_401Donmeli()
    {
        var client = _factory.CreateClient();

        var response =
            await client.GetAsync("/api/departments");

        response.StatusCode
            .Should()
            .Be(HttpStatusCode.Unauthorized);
    }
}