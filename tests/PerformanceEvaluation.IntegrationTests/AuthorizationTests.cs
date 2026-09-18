using FluentAssertions;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace PerformanceEvaluation.IntegrationTests;

public class AuthorizationTests
    : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;

    public AuthorizationTests(
        TestWebApplicationFactory factory)
    {
        _factory = factory;
    }

    private HttpClient CreateClientAs(
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

    private static HttpClient CreateAnonymousClient(
        TestWebApplicationFactory factory)
    {
        return factory.CreateClient();
    }

    [Theory]
    [InlineData("Admin", HttpStatusCode.OK)]
    [InlineData("Evaluator", HttpStatusCode.OK)]
    [InlineData("Employee", HttpStatusCode.Forbidden)]
    public async Task GetCriteria_RollerDogruCalismali(
        string role,
        HttpStatusCode expected)
    {
        var client = CreateClientAs(role);

        var response =
            await client.GetAsync(
                "/api/criteria/criteria");

        response.StatusCode.Should().Be(expected);
    }

    [Theory]
    [InlineData("Admin", HttpStatusCode.OK)]
    [InlineData("Evaluator", HttpStatusCode.OK)]
    [InlineData("Employee", HttpStatusCode.OK)]
    public async Task GetDepartments_GirisYapanKullaniciErisebilmeli(
        string role,
        HttpStatusCode expected)
    {
        var client = CreateClientAs(role);

        var response =
            await client.GetAsync(
                "/api/departments");

        response.StatusCode.Should().Be(expected);
    }

    [Theory]
    [InlineData("Admin")]
    [InlineData("Evaluator")]
    [InlineData("Employee")]
    public async Task GetJobPositions_GirisYapanTumRollerErisebilmeli(
        string role)
    {
        var client = CreateClientAs(role);

        var response =
            await client.GetAsync("/api/jobpositions");

        response.StatusCode.Should().NotBe(HttpStatusCode.Forbidden);
        response.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GetJobPositions_KimlikDogrulamaOlmadan_401Donmeli()
    {
        var client = CreateAnonymousClient(_factory);

        var response = await client.GetAsync("/api/jobpositions");

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }


    [Theory]
    [InlineData("Admin", HttpStatusCode.Forbidden)]
    [InlineData("Employee", HttpStatusCode.Forbidden)]
    public async Task CreateEvaluation_SadeceEvaluatorErisebilir(
        string role,
        HttpStatusCode expected)
    {
        var client = CreateClientAs(role);

        var response =
            await client.PostAsJsonAsync(
                "/api/evaluations",
                new
                {
                    EmployeeId = 1,
                    EvaluationPeriodId = 1,
                    Comment = "",
                    Scores = Array.Empty<object>()
                });

        response.StatusCode.Should().Be(expected);
    }

    [Fact]
    public async Task CreateEvaluation_EvaluatorErisimineIzinVerilmeli()
    {
        var client = CreateClientAs("Evaluator");

        var response =
            await client.PostAsJsonAsync(
                "/api/evaluations",
                new
                {
                    EmployeeId = 1,
                    EvaluationPeriodId = 1,
                    Comment = "",
                    Scores = Array.Empty<object>()
                });

        response.StatusCode.Should().NotBe(HttpStatusCode.Forbidden);
        response.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);
    }

    [Theory]
    [InlineData("Evaluator", HttpStatusCode.Forbidden)]
    [InlineData("Employee", HttpStatusCode.Forbidden)]
    public async Task GetAllEvaluations_SadeceAdminErisebilir(
        string role,
        HttpStatusCode expected)
    {
        var client = CreateClientAs(role);

        var response = await client.GetAsync("/api/evaluations");

        response.StatusCode.Should().Be(expected);
    }

    [Theory]
    [InlineData("Admin", HttpStatusCode.Forbidden)]
    [InlineData("Evaluator", HttpStatusCode.Forbidden)]
    public async Task GetMyEvaluations_SadeceEmployeeErisebilir(
        string role,
        HttpStatusCode expected)
    {
        var client = CreateClientAs(role);

        var response = await client.GetAsync("/api/evaluations/my");

        response.StatusCode.Should().Be(expected);
    }

    [Theory]
    [InlineData("Evaluator", HttpStatusCode.Forbidden)]
    [InlineData("Employee", HttpStatusCode.Forbidden)]
    public async Task ApproveEvaluation_SadeceAdminErisebilir(
        string role,
        HttpStatusCode expected)
    {
        var client = CreateClientAs(role);

        var response =
            await client.PatchAsync(
                "/api/evaluations/1/approve",
                new StringContent(string.Empty));

        response.StatusCode.Should().Be(expected);
    }

    [Theory]
    [InlineData("Admin", HttpStatusCode.Forbidden)]
    [InlineData("Employee", HttpStatusCode.Forbidden)]
    public async Task GetMyPeriodEvaluations_SadeceEvaluatorErisebilir(
        string role,
        HttpStatusCode expected)
    {
        var client = CreateClientAs(role);

        var response =
            await client.GetAsync("/api/evaluations/my-period/1");

        response.StatusCode.Should().Be(expected);
    }

    [Theory]
    [InlineData("Evaluator")]
    [InlineData("Employee")]
    public async Task UpdateEvaluationPeriod_SadeceAdmin(
        string role)
    {
        var client = CreateClientAs(role);

        var response =
            await client.PutAsJsonAsync(
                "/api/evaluationperiods/1",
                new
                {
                    Name = "Yetki Testi",
                    StartDate = DateTime.Now,
                    EndDate = DateTime.Now.AddDays(30)
                });

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Theory]
    [InlineData("Evaluator", HttpStatusCode.Forbidden)]
    [InlineData("Employee", HttpStatusCode.Forbidden)]
    public async Task DepartmentRanking_SadeceAdminErisebilir(
        string role,
        HttpStatusCode expected)
    {
        var client = CreateClientAs(role);

        var response =
            await client.GetAsync(
                "/api/reports/department-ranking?evaluationPeriodId=1");

        response.StatusCode.Should().Be(expected);
    }

    [Fact]
    public async Task DepartmentRanking_AdminErisimineIzinVerilmeli()
    {
        var client = CreateClientAs("Admin");

        var response =
            await client.GetAsync(
                "/api/reports/department-ranking?evaluationPeriodId=1");

        response.StatusCode.Should().NotBe(HttpStatusCode.Forbidden);
        response.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);
    }

    [Theory]
    [InlineData("Admin", HttpStatusCode.Forbidden)]
    [InlineData("Employee", HttpStatusCode.Forbidden)]
    public async Task TeamRanking_SadeceEvaluatorErisebilir(
        string role,
        HttpStatusCode expected)
    {
        var client = CreateClientAs(role);

        var response =
            await client.GetAsync(
                "/api/reports/team-ranking?evaluationPeriodId=1");

        response.StatusCode.Should().Be(expected);
    }

    [Theory]
    [InlineData("Evaluator", HttpStatusCode.Forbidden)]
    [InlineData("Employee", HttpStatusCode.Forbidden)]
    public async Task ExportDepartmentRanking_SadeceAdminErisebilir(
        string role,
        HttpStatusCode expected)
    {
        var client = CreateClientAs(role);

        var response =
            await client.GetAsync(
                "/api/reports/department-ranking/export?evaluationPeriodId=1");

        response.StatusCode.Should().Be(expected);
    }

    [Theory]
    [InlineData("Admin", HttpStatusCode.Forbidden)]
    [InlineData("Employee", HttpStatusCode.Forbidden)]
    public async Task ExportTeamRanking_SadeceEvaluatorErisebilir(
        string role,
        HttpStatusCode expected)
    {
        var client = CreateClientAs(role);

        var response =
            await client.GetAsync(
                "/api/reports/team-ranking/export?evaluationPeriodId=1");

        response.StatusCode.Should().Be(expected);
    }

    [Fact]
    public async Task Reports_KimlikDogrulamaOlmadan_401Donmeli()
    {
        var client = CreateAnonymousClient(_factory);

        var response =
            await client.GetAsync(
                "/api/reports/department-ranking?evaluationPeriodId=1");

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Theory]
    [InlineData("Evaluator")]
    [InlineData("Employee")]
    public async Task GetAllUsers_SadeceAdmin(string role)
    {
        var client = CreateClientAs(role);

        var response = await client.GetAsync("/api/user");

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task GetAllUsers_AdminErisimineIzinVerilmeli()
    {
        var client = CreateClientAs("Admin");

        var response = await client.GetAsync("/api/user");

        response.StatusCode.Should().NotBe(HttpStatusCode.Forbidden);
        response.StatusCode.Should().NotBe(HttpStatusCode.Unauthorized);
    }

    [Theory]
    [InlineData("Evaluator")]
    [InlineData("Employee")]
    public async Task GetUserById_SadeceAdmin(string role)
    {
        var client = CreateClientAs(role);

        var response = await client.GetAsync("/api/user/1");

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Theory]
    [InlineData("Evaluator")]
    [InlineData("Employee")]
    public async Task CreateUser_SadeceAdmin(string role)
    {
        var client = CreateClientAs(role);

        var response =
            await client.PostAsJsonAsync(
                "/api/user",
                new
                {
                    FirstName = "",
                    LastName = "",
                    Email = "",
                    Password = "",
                    Role = 3,
                    DepartmentId = 0
                });

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Theory]
    [InlineData("Evaluator")]
    [InlineData("Employee")]
    public async Task UpdateUser_SadeceAdmin(string role)
    {
        var client = CreateClientAs(role);

        var response =
            await client.PutAsJsonAsync(
                "/api/user/1",
                new
                {
                    FirstName = "test",
                    LastName = "test",
                    Role = 3,
                    DepartmentId = 1,
                    IsActive = true
                });

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Theory]
    [InlineData("Evaluator")]
    [InlineData("Employee")]
    public async Task DeleteUser_SadeceAdmin(string role)
    {
        var client = CreateClientAs(role);

        var response = await client.DeleteAsync("/api/user/1");

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task User_KimlikDogrulamaOlmadan_401Donmeli()
    {
        var client = CreateAnonymousClient(_factory);

        var response = await client.GetAsync("/api/user");

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}