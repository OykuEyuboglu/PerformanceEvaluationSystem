using FluentAssertions;
using System.Net;
using System.Net.Http.Json;
using System.Net.Http.Headers;

namespace PerformanceEvaluation.IntegrationTests;

public class EvaluationsControllerTests
    : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;

    public EvaluationsControllerTests(
        TestWebApplicationFactory factory)
    {
        _factory = factory;
    }

    private HttpClient CreateClient(
        string role,
        int userId = 1)
    {
        var client = _factory.CreateClient();

        client.DefaultRequestHeaders.Add(
            TestAuthHandler.RoleHeader,
            role);

        client.DefaultRequestHeaders.Add(
            TestAuthHandler.UserIdHeader,
            userId.ToString());

        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue(
                TestAuthHandler.SchemeName);

        return client;
    }

    [Theory]
    [InlineData("Evaluator")]
    [InlineData("Employee")]
    public async Task ApproveBulk_SadeceAdminErisilebilir(
        string role)
    {
        var client = CreateClient(role);

        var response =
            await client.PatchAsJsonAsync(
                "/api/evaluations/approve-bulk",
                new
                {
                    Ids = new[] { 1, 2, 3 }
                });

        response.StatusCode
            .Should()
            .Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task ApproveBulk_AdminErisimineIzinVerilmeli()
    {
        var client = CreateClient("Admin");

        var response =
            await client.PatchAsJsonAsync(
                "/api/evaluations/approve-bulk",
                new
                {
                    Ids = Array.Empty<int>()
                });

        response.StatusCode
            .Should()
            .NotBe(HttpStatusCode.Forbidden);
    }
}