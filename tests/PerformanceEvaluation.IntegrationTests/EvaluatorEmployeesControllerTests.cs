using FluentAssertions;
using System.Net;
using System.Net.Http.Json;

namespace PerformanceEvaluation.IntegrationTests;

public class EvaluatorEmployeesControllerTests
    : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;

    public EvaluatorEmployeesControllerTests(
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

        return client;
    }

    [Theory]
    [InlineData("Evaluator")]
    [InlineData("Employee")]
    public async Task Assign_SadeceAdmin(
        string role)
    {
        var client = CreateClient(role);

        var response =
            await client.PostAsJsonAsync(
                "/api/evaluatoremployees",
                new
                {
                    EvaluatorId = 1,
                    EmployeeId = 2
                });

        response.StatusCode
            .Should()
            .Be(HttpStatusCode.Forbidden);
    }

    [Theory]
    [InlineData("Admin", 1)]
    [InlineData("Evaluator", 1)]
    public async Task GetByEvaluatorId_AdminVeEvaluatorErisilebilir(
        string role,
        int userId)
    {
        var client = CreateClient(role, userId);

        var response =
            await client.GetAsync(
                $"/api/evaluatoremployees/{userId}");

        response.StatusCode
            .Should()
            .NotBe(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task GetByEvaluatorId_EmployeeErisememeli()
    {
        var client = CreateClient("Employee");

        var response =
            await client.GetAsync(
                "/api/evaluatoremployees/1");

        response.StatusCode
            .Should()
            .Be(HttpStatusCode.Forbidden);
    }

    [Theory]
    [InlineData("Evaluator")]
    [InlineData("Employee")]
    public async Task Remove_SadeceAdmin(
        string role)
    {
        var client = CreateClient(role);

        var response =
            await client.DeleteAsync(
                "/api/evaluatoremployees/1/2");

        response.StatusCode
            .Should()
            .Be(HttpStatusCode.Forbidden);
    }
}