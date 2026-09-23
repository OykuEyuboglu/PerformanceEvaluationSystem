using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using PerformanceEvaluation.API.Controllers;
using PerformanceEvaluation.Application.DTOs.User;
using PerformanceEvaluation.Application.Interfaces;
using PerformanceEvaluation.Domain.Enums;

namespace PerformanceEvaluation.IntegrationTests;

public class UserControllerTests
    : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;

    public UserControllerTests(
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
    [InlineData("Evaluator", HttpStatusCode.Forbidden)]
    [InlineData("Employee", HttpStatusCode.Forbidden)]
    public async Task GetAll_SadeceAdmin(
        string role,
        HttpStatusCode expected)
    {
        var client = CreateClient(role);

        var response =
            await client.GetAsync(
                "/api/user");

        response.StatusCode
            .Should()
            .Be(expected);
    }

    [Theory]
    [InlineData("Admin", HttpStatusCode.NotFound)]
    [InlineData("Evaluator", HttpStatusCode.Forbidden)]
    [InlineData("Employee", HttpStatusCode.Forbidden)]
    public async Task GetById_SadeceAdmin(
           string role,
        HttpStatusCode expected)
    {
        var client = CreateClient(role);

        var response =
            await client.GetAsync(
                "/api/user/1");

        response.StatusCode
            .Should()
            .Be(expected);
    }

    [Theory]
    [InlineData("Evaluator")]
    [InlineData("Employee")]
    public async Task Create_SadeceAdmin(
        string role)
    {
        var client = CreateClient(role);

        var dto =
            new CreateUserDto
            {
                FirstName = "Test",
                LastName = "User",
                Email = $"test-{Guid.NewGuid()}@example.com",
                Password = "Test123!Password",
                Role = UserRole.Employee,
                DepartmentId = 1,
                JobPositionId = 1
            };

        var response =
            await client.PostAsJsonAsync(
                "/api/user",
                dto);

        response.StatusCode
            .Should()
            .Be(HttpStatusCode.Forbidden);
    }

    [Theory]
    [InlineData("Evaluator")]
    [InlineData("Employee")]
    public async Task Update_SadeceAdmin(
        string role)
    {
        var client = CreateClient(role);

        var dto =
            new UpdateUserDto
            {
                FirstName = "Test",
                LastName = "Updated",
                Role = UserRole.Employee,
                DepartmentId = 1,
                JobPositionId = 1,
                IsActive = true
            };

        var response =
            await client.PutAsJsonAsync(
                "/api/user/99999",
                dto);

        response.StatusCode
            .Should()
            .Be(HttpStatusCode.Forbidden);
    }

    [Theory]
    [InlineData("Evaluator")]
    [InlineData("Employee")]
    public async Task Patch_SadeceAdmin(
        string role)
    {
        var client = CreateClient(role);

        var dto =
            new UpdatePatchUserDto
            {
                IsActive = false
            };

        var response =
            await client.PatchAsJsonAsync(
                "/api/user/99999",
                dto);

        response.StatusCode
            .Should()
            .Be(HttpStatusCode.Forbidden);
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
                "/api/user/99999");

        response.StatusCode
            .Should()
            .Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task GetAll_Direct_ReturnsOk()
    {
        var service =
            new Mock<IUserService>();

        service
            .Setup(x => x.GetAllAsync())
            .ReturnsAsync(new List<UserDto>());

        var controller =
            new UserController(
                service.Object);

        var result =
            await controller.GetAll();

        var okResult =
            result
                .Should()
                .BeOfType<OkObjectResult>()
                .Subject;

        okResult.Value
            .Should()
            .NotBeNull();

        service.Verify(
            x => x.GetAllAsync(),
            Times.Once);
    }

    [Fact]
    public async Task GetById_Direct_ReturnsOk()
    {
        var service =
            new Mock<IUserService>();

        var expected =
            new UserDto
            {
                Id = 1
            };

        service
            .Setup(x => x.GetByIdAsync(1))
            .ReturnsAsync(expected);

        var controller =
            new UserController(
                service.Object);

        var result =
            await controller.GetById(1);

        var okResult =
            result
                .Should()
                .BeOfType<OkObjectResult>()
                .Subject;

        okResult.Value
            .Should()
            .Be(expected);

        service.Verify(
            x => x.GetByIdAsync(1),
            Times.Once);
    }

    [Fact]
    public async Task Create_Direct_ReturnsCreatedAtAction()
    {
        var service =
            new Mock<IUserService>();

        var dto =
            new CreateUserDto
            {
                FirstName = "Test",
                LastName = "User",
                Email = "test@example.com",
                Password = "Test123!Password",
                Role = UserRole.Employee,
                DepartmentId = 1,
                JobPositionId = 1
            };

        var expected =
            new UserDto
            {
                Id = 10
            };

        service
            .Setup(x => x.CreateAsync(dto, 1))
            .ReturnsAsync(expected);

        var controller =
            new UserController(
                service.Object);

        var claims =
            new[]
            {
                new System.Security.Claims.Claim(
                    System.Security.Claims.ClaimTypes.NameIdentifier,
                    "1")
            };

        controller.ControllerContext =
            new ControllerContext
            {
                HttpContext =
                    new DefaultHttpContext
                    {
                        User =
                            new System.Security.Claims.ClaimsPrincipal(
                                new System.Security.Claims.ClaimsIdentity(
                                    claims,
                                    "Test"))
                    }
            };

        var result =
            await controller.Create(dto);

        var createdResult =
            result
                .Should()
                .BeOfType<CreatedAtActionResult>()
                .Subject;

        createdResult.ActionName
            .Should()
            .Be(nameof(UserController.GetById));

        createdResult.Value
            .Should()
            .Be(expected);

        service.Verify(
            x => x.CreateAsync(dto, 1),
            Times.Once);
    }

    [Fact]
    public async Task Update_Direct_ReturnsOk()
    {
        var service =
            new Mock<IUserService>();

        var dto =
            new UpdateUserDto
            {
                FirstName = "Updated",
                LastName = "User",
                Role = UserRole.Employee,
                DepartmentId = 1,
                JobPositionId = 1,
                IsActive = true
            };

        var expected =
            new UserDto
            {
                Id = 5
            };

        service
            .Setup(x => x.UpdateAsync(5, dto))
            .ReturnsAsync(expected);

        var controller =
            new UserController(
                service.Object);

        var result =
            await controller.Update(5, dto);

        var okResult =
            result
                .Should()
                .BeOfType<OkObjectResult>()
                .Subject;

        okResult.Value
            .Should()
            .Be(expected);

        service.Verify(
            x => x.UpdateAsync(5, dto),
            Times.Once);
    }

    [Fact]
    public async Task Patch_Direct_ReturnsOk()
    {
        var service =
            new Mock<IUserService>();

        var dto =
            new UpdatePatchUserDto
            {
                IsActive = false
            };

        var expected =
            new UserDto
            {
                Id = 5
            };

        service
            .Setup(x => x.PatchAsync(5, dto))
            .ReturnsAsync(expected);

        var controller =
            new UserController(
                service.Object);

        var result =
            await controller.Patch(5, dto);

        var okResult =
            result
                .Should()
                .BeOfType<OkObjectResult>()
                .Subject;

        okResult.Value
            .Should()
            .Be(expected);

        service.Verify(
            x => x.PatchAsync(5, dto),
            Times.Once);
    }

    [Fact]
    public async Task Delete_Direct_ReturnsNoContent()
    {
        var service =
            new Mock<IUserService>();

        service
            .Setup(x => x.DeleteAsync(10))
            .Returns(Task.CompletedTask);

        var controller =
            new UserController(
                service.Object);

        var result =
            await controller.Delete(10);

        result
            .Should()
            .BeOfType<NoContentResult>();

        service.Verify(
            x => x.DeleteAsync(10),
            Times.Once);
    }
}