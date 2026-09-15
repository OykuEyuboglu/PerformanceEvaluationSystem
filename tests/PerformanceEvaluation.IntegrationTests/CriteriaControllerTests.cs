using FluentAssertions;
using System.Net;
using System.Net.Http.Json;

namespace PerformanceEvaluation.IntegrationTests;

public class CriteriaControllerTests
    : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;

    public CriteriaControllerTests(
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
    [InlineData("Admin", HttpStatusCode.OK)]
    [InlineData("Evaluator", HttpStatusCode.OK)]
    [InlineData("Employee", HttpStatusCode.Forbidden)]
    public async Task GetCategories_RoleKontrolu(
        string role,
        HttpStatusCode expected)
    {
        var client = CreateClient(role);

        var response =
            await client.GetAsync(
                "/api/criteria/categories");

        response.StatusCode.Should().Be(expected);
    }

    [Theory]
    [InlineData("Admin", HttpStatusCode.OK)]
    [InlineData("Evaluator", HttpStatusCode.OK)]
    [InlineData("Employee", HttpStatusCode.Forbidden)]
    public async Task GetCriteria_RoleKontrolu(
        string role,
        HttpStatusCode expected)
    {
        var client = CreateClient(role);

        var response =
            await client.GetAsync(
                "/api/criteria/criteria");

        response.StatusCode.Should().Be(expected);
    }

    [Theory]
    [InlineData("Admin", HttpStatusCode.BadRequest)]
    [InlineData("Evaluator", HttpStatusCode.Forbidden)]
    [InlineData("Employee", HttpStatusCode.Forbidden)]
    public async Task CreateCategory_YetkiKontrolu(
        string role,
        HttpStatusCode expected)
    {
        var client = CreateClient(role);

        var response =
            await client.PostAsJsonAsync(
                "/api/criteria/categories",
                new
                {
                    Name = "",
                    Weight = 0,
                    IsActive = true
                });

        response.StatusCode.Should().Be(expected);
    }

    [Theory]
    [InlineData("Admin", HttpStatusCode.BadRequest)]
    [InlineData("Evaluator", HttpStatusCode.Forbidden)]
    [InlineData("Employee", HttpStatusCode.Forbidden)]
    public async Task CreateCriterion_YetkiKontrolu(
        string role,
        HttpStatusCode expected)
    {
        var client = CreateClient(role);

        var response =
            await client.PostAsJsonAsync(
                "/api/criteria/criteria",
                new
                {
                    Name = "",
                    PerformanceCategoryId = 0,
                    IsActive = true,
                    JobPositionDescriptions =
                        Array.Empty<object>()
                });

        response.StatusCode.Should().Be(expected);
    }
}