using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using PerformanceEvaluation.Application.Interfaces;
using PerformanceEvaluation.Domain.Entities;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace PerformanceEvaluation.Infrastructure.Security;

public class JwtTokenGenerator : IJwtTokenGenerator
{
    private readonly IConfiguration _configuration;

    public JwtTokenGenerator(IConfiguration configuration)
    {

        _configuration = configuration;

    }

    public (string Token, DateTime ExpiresAt) GenerateToken(User user)
    {

        var jwtSettings = _configuration.GetSection("Jwt");

        var secret = jwtSettings["Secret"]!;

        var expirationMinutes = int.Parse(jwtSettings["ExpirationMinutes"]!);

        var claims = new List<Claim>
        {

            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),

            new(JwtRegisteredClaimNames.Email, user.Email),

            new(ClaimTypes.Role, user.Role.ToString()),

            new("departmentId", user.DepartmentId.ToString())

        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var expiresAt = DateTime.UtcNow.AddMinutes(expirationMinutes);

        var token = new JwtSecurityToken(

            issuer: jwtSettings["Issuer"],

            audience: jwtSettings["Audience"],

            claims: claims,

            expires: expiresAt,

            signingCredentials: creds);

        return (new JwtSecurityTokenHandler().WriteToken(token), expiresAt);

    }
}