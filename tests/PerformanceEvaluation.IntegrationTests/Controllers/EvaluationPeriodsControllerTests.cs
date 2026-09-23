using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Moq;
using PerformanceEvaluation.API.Controllers;
using PerformanceEvaluation.Application.DTOs.EvaluatorEmployee;
using PerformanceEvaluation.Application.Interfaces;

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

    [Fact]
    public async Task GetAll_Direct_ReturnsOk()
    {
        var service =
            new Mock<IEvaluationPeriodService>();

        service
            .Setup(x => x.GetAllAsync())
            .ReturnsAsync(new List<EvaluationPeriodDto>());

        var controller =
            new EvaluationPeriodsController(
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
    public async Task Create_Direct_ReturnsCreatedAtAction()
    {
        var service =
            new Mock<IEvaluationPeriodService>();

        var dto =
            new CreateEvaluationPeriodDto
            {
                Name = "Test Dönemi",
                StartDate = DateTime.Now,
                EndDate = DateTime.Now.AddDays(30)
            };

        var expected =
            new EvaluationPeriodDto
            {
                Id = 1,
                Name = dto.Name,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate
            };

        service
            .Setup(x => x.CreateAsync(dto))
            .ReturnsAsync(expected);

        var controller =
            new EvaluationPeriodsController(
                service.Object);

        var result =
            await controller.Create(dto);

        var createdResult =
            result
                .Should()
                .BeOfType<CreatedAtActionResult>()
                .Subject;

        createdResult.ActionName
            .Should()
            .Be(nameof(EvaluationPeriodsController.GetAll));

        createdResult.Value
            .Should()
            .Be(expected);

        service.Verify(
            x => x.CreateAsync(dto),
            Times.Once);
    }

    [Fact]
    public async Task Update_Direct_ReturnsOk()
    {
        var service =
            new Mock<IEvaluationPeriodService>();

        var dto =
            new UpdateEvaluationPeriodDto
            {
                Name = "Güncellenmiş Dönem",
                StartDate = DateTime.Now,
                EndDate = DateTime.Now.AddDays(60)
            };

        var expected =
            new EvaluationPeriodDto
            {
                Id = 5,
                Name = dto.Name,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate
            };

        service
            .Setup(x => x.UpdateAsync(5, dto))
            .ReturnsAsync(expected);

        var controller =
            new EvaluationPeriodsController(
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
    public async Task Delete_Direct_ReturnsNoContent()
    {
        var service =
            new Mock<IEvaluationPeriodService>();

        service
            .Setup(x => x.DeleteAsync(10))
            .Returns(Task.CompletedTask);

        var controller =
            new EvaluationPeriodsController(
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