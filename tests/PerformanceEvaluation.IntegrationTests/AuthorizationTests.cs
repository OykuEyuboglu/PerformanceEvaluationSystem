using FluentAssertions;
using System.Net;
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

        return client;
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

}