using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace PerformanceEvaluation.IntegrationTests;

public class TestAuthHandler
    : AuthenticationHandler<AuthenticationSchemeOptions>
{
    public const string SchemeName = "Test";

    public const string RoleHeader = "X-Test-Role";
    public const string UserIdHeader = "X-Test-UserId";

    public TestAuthHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder)
        : base(options, logger, encoder)
    {
    }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var role = Request.Headers[RoleHeader].FirstOrDefault();

        var userIdHeader =
            Request.Headers[UserIdHeader].FirstOrDefault();

        if (string.IsNullOrWhiteSpace(role))
        {
            return Task.FromResult(
                AuthenticateResult.NoResult());
        }

        var userId = 1;

        if (!string.IsNullOrWhiteSpace(userIdHeader) &&
            int.TryParse(userIdHeader, out var parsedUserId))
        {
            userId = parsedUserId;
        }

        var claims = new[]
        {
            new Claim(
                ClaimTypes.NameIdentifier,
                userId.ToString()),

            new Claim(
                "sub",
                userId.ToString()),

            new Claim(
                ClaimTypes.Role,
                role),
        };

        var identity = new ClaimsIdentity(
            claims,
            SchemeName);

        var principal =
            new ClaimsPrincipal(identity);

        var ticket =
            new AuthenticationTicket(
                principal,
                SchemeName);

        return Task.FromResult(
            AuthenticateResult.Success(ticket));
    }
}