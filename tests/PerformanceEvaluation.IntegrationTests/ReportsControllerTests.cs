using FluentAssertions;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;

namespace PerformanceEvaluation.IntegrationTests;

// NOT: Skor hesaplama doğruluğu (ortalama, sıralama vb.) zaten
// ReportServiceTests.cs içinde unit test seviyesinde kapsamlı şekilde
// test ediliyor. Burada amaç uçların gerçekten HTTP üzerinden
// erişilebilir olduğunu ve beklenen JSON şeklini (dizi) döndürdüğünü
// doğrulamak - yetkilendirme matrisi AuthorizationTests.cs'te ayrıca var.
public class ReportsControllerTests
    : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;

    public ReportsControllerTests(TestWebApplicationFactory factory)
    {
        _factory = factory;
    }

    private HttpClient CreateClientAs(string role)
    {
        var client = _factory.CreateClient();

        client.DefaultRequestHeaders.Add(TestAuthHandler.RoleHeader, role);
        client.DefaultRequestHeaders.Add(TestAuthHandler.UserIdHeader, "1");
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue(TestAuthHandler.SchemeName);

        return client;
    }

    [Fact]
    public async Task DepartmentRanking_VeriYokken_BosDiziDonmeli()
    {
        var client = CreateClientAs("Admin");

        var response = await client.GetAsync(
            "/api/reports/department-ranking?evaluationPeriodId=999999");

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        body.ValueKind.Should().Be(JsonValueKind.Array);
        body.GetArrayLength().Should().Be(0);
    }

    [Fact]
    public async Task TeamRanking_VeriYokken_BosDiziDonmeli()
    {
        var client = CreateClientAs("Evaluator");

        var response = await client.GetAsync(
            "/api/reports/team-ranking?evaluationPeriodId=999999");

        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        body.ValueKind.Should().Be(JsonValueKind.Array);
        body.GetArrayLength().Should().Be(0);
    }

    [Fact]
    public async Task DepartmentRankingExport_AdminErisimiIcinDosyaDonmeli()
    {
        var client = CreateClientAs("Admin");

        var response = await client.GetAsync(
            "/api/reports/department-ranking/export?evaluationPeriodId=999999");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        response.Content.Headers.ContentType.Should().NotBeNull();
    }

    [Fact]
    public async Task TeamRankingExport_EvaluatorErisimiIcinDosyaDonmeli()
    {
        var client = CreateClientAs("Evaluator");

        var response = await client.GetAsync(
            "/api/reports/team-ranking/export?evaluationPeriodId=999999");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        response.Content.Headers.ContentType.Should().NotBeNull();
    }
}