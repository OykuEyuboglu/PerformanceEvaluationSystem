using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using PerformanceEvaluation.Application.DTOs.EvaluatorEmployee;

namespace PerformanceEvaluation.IntegrationTests;

public class EvaluationPeriodsControllerTests
    : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;

    public EvaluationPeriodsControllerTests(
        TestWebApplicationFactory factory)
    {
        _factory = factory;
    }

    private HttpClient CreateClient(string role)
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

        return client;
    }

    [Theory]
    [InlineData("Admin", HttpStatusCode.OK)]
    [InlineData("Evaluator", HttpStatusCode.OK)]
    [InlineData("Employee", HttpStatusCode.Forbidden)]
    public async Task GetAll_RoleKontrolu(
       string role,
       HttpStatusCode expected)
    {
        var client = CreateClient(role);

        var response =
            await client.GetAsync(
                "/api/evaluationperiods");

        response.StatusCode.Should().Be(expected);
    }

    [Theory]
    [InlineData("Evaluator", HttpStatusCode.Forbidden)]
    [InlineData("Employee", HttpStatusCode.Forbidden)]
    public async Task Create_SadeceAdmin(
        string role,
        HttpStatusCode expected)
    {
        var client = CreateClient(role);

        var dto = new CreateEvaluationPeriodDto
        {
            Name = "Yetki Test Dönemi",
            StartDate = DateTime.Now,
            EndDate = DateTime.Now.AddDays(30)
        };

        var response =
            await client.PostAsJsonAsync(
                "/api/evaluationperiods",
                dto);

        response.StatusCode.Should().Be(expected);
    }

    [Theory]
    [InlineData("Evaluator")]
    [InlineData("Employee")]
    public async Task Delete_SadeceAdmin(
        string role)
    {
        var client = CreateClient(role);

        var response =
            await client.DeleteAsync(
                "/api/evaluationperiods/99999");

        response.StatusCode
            .Should()
            .Be(HttpStatusCode.Forbidden);
    }
}