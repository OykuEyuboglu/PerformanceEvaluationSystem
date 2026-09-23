using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Moq;
using PerformanceEvaluation.API.Controllers;
using PerformanceEvaluation.Application.DTOs.Criteria;
using PerformanceEvaluation.Application.Interfaces;
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

        response.StatusCode.Should()
            .Be(expected);
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

        response.StatusCode.Should()
            .Be(expected);
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

        response.StatusCode.Should()
            .Be(expected);
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

        response.StatusCode.Should()
            .Be(expected);
    }
    private static CriteriaController CreateController(
        Mock<ICriteriaService> serviceMock)
    {
        return new CriteriaController(
            serviceMock.Object);
    }

    [Fact]
    public async Task GetCategories_Basarili_OkDonmeli()
    {
        var serviceMock =
            new Mock<ICriteriaService>();

        var categories =
            new List<PerformanceCategoryDto>
            {
                new()
                {
                    Id = 1,
                    Name = "Teknik Yetkinlik",
                    Weight = 40,
                    IsActive = true
                }
            };

        serviceMock
            .Setup(x =>
                x.GetAllCategoriesAsync())
            .ReturnsAsync(categories);

        var controller =
            CreateController(serviceMock);

        var result =
            await controller.GetCategories();

        result.Should()
            .BeOfType<OkObjectResult>();

        var okResult =
            (OkObjectResult)result;

        okResult.Value
            .Should()
            .BeSameAs(categories);

        serviceMock.Verify(
            x => x.GetAllCategoriesAsync(),
            Times.Once);
    }

    [Fact]
    public async Task CreateCategory_Basarili_CreatedAtActionDonmeli()
    {
        var serviceMock =
            new Mock<ICriteriaService>();

        var dto =
            new CreatePerformanceCategoryDto
            {
                Name = "Teknik Yetkinlik",
                Weight = 40
            };

        var category =
            new PerformanceCategoryDto
            {
                Id = 1,
                Name = "Teknik Yetkinlik",
                Weight = 40,
                IsActive = true
            };

        serviceMock
            .Setup(x =>
                x.CreateCategoryAsync(dto))
            .ReturnsAsync(category);

        var controller =
            CreateController(serviceMock);

        var result =
            await controller.CreateCategory(dto);

        result.Should()
            .BeOfType<CreatedAtActionResult>();

        var createdResult =
            (CreatedAtActionResult)result;

        createdResult.Value
            .Should()
            .BeSameAs(category);

        createdResult.ActionName
            .Should()
            .Be(nameof(
                CriteriaController.GetCategories));

        serviceMock.Verify(
            x => x.CreateCategoryAsync(dto),
            Times.Once);
    }

    [Fact]
    public async Task UpdateCategory_Basarili_OkDonmeli()
    {
        var serviceMock =
            new Mock<ICriteriaService>();

        var dto =
            new UpdatePerformanceCategoryDto
            {
                Name = "Yeni Kategori",
                Weight = 50,
                IsActive = true
            };

        var category =
            new PerformanceCategoryDto
            {
                Id = 1,
                Name = "Yeni Kategori",
                Weight = 50,
                IsActive = true
            };

        serviceMock
            .Setup(x =>
                x.UpdateCategoryAsync(1, dto))
            .ReturnsAsync(category);

        var controller =
            CreateController(serviceMock);

        var result =
            await controller.UpdateCategory(
                1,
                dto);

        result.Should()
            .BeOfType<OkObjectResult>();

        var okResult =
            (OkObjectResult)result;

        okResult.Value
            .Should()
            .BeSameAs(category);

        serviceMock.Verify(
            x => x.UpdateCategoryAsync(1, dto),
            Times.Once);
    }

    [Fact]
    public async Task DeleteCategory_Basarili_NoContentDonmeli()
    {
        var serviceMock =
            new Mock<ICriteriaService>();

        serviceMock
            .Setup(x =>
                x.DeleteCategoryAsync(1))
            .Returns(Task.CompletedTask);

        var controller =
            CreateController(serviceMock);

        var result =
            await controller.DeleteCategory(1);

        result.Should()
            .BeOfType<NoContentResult>();

        serviceMock.Verify(
            x => x.DeleteCategoryAsync(1),
            Times.Once);
    }

    [Fact]
    public async Task GetCriteria_Basarili_OkDonmeli()
    {
        var serviceMock =
            new Mock<ICriteriaService>();

        var criteria =
            new List<PerformanceCriterionDto>
            {
                new()
                {
                    Id = 1,
                    Name = "Kod Kalitesi",
                    PerformanceCategoryId = 1,
                    IsActive = true
                }
            };

        serviceMock
            .Setup(x =>
                x.GetAllCriteriaAsync())
            .ReturnsAsync(criteria);

        var controller =
            CreateController(serviceMock);

        var result =
            await controller.GetCriteria();

        result.Should()
            .BeOfType<OkObjectResult>();

        var okResult =
            (OkObjectResult)result;

        okResult.Value
            .Should()
            .BeSameAs(criteria);

        serviceMock.Verify(
            x => x.GetAllCriteriaAsync(),
            Times.Once);
    }

    [Fact]
    public async Task CreateCriterion_Basarili_CreatedAtActionDonmeli()
    {
        var serviceMock =
            new Mock<ICriteriaService>();

        var dto =
            new CreatePerformanceCriterionDto
            {
                Name = "Kod Kalitesi",
                PerformanceCategoryId = 1,
                JobPositionDescriptions =
                    new List<CriterionJobPositionInputDto>()
            };

        var criterion =
            new PerformanceCriterionDto
            {
                Id = 1,
                Name = "Kod Kalitesi",
                PerformanceCategoryId = 1,
                IsActive = true
            };

        serviceMock
            .Setup(x =>
                x.CreateCriterionAsync(dto))
            .ReturnsAsync(criterion);

        var controller =
            CreateController(serviceMock);

        var result =
            await controller.CreateCriterion(dto);

        result.Should()
            .BeOfType<CreatedAtActionResult>();

        var createdResult =
            (CreatedAtActionResult)result;

        createdResult.Value
            .Should()
            .BeSameAs(criterion);

        createdResult.ActionName
            .Should()
            .Be(nameof(
                CriteriaController.GetCriteria));

        serviceMock.Verify(
            x => x.CreateCriterionAsync(dto),
            Times.Once);
    }

    [Fact]
    public async Task UpdateCriterion_Basarili_OkDonmeli()
    {
        var serviceMock =
            new Mock<ICriteriaService>();

        var dto =
            new UpdatePerformanceCriterionDto
            {
                Name = "Yeni Kriter",
                IsActive = true,
                JobPositionDescriptions =
                    new List<CriterionJobPositionInputDto>()
            };

        var criterion =
            new PerformanceCriterionDto
            {
                Id = 1,
                Name = "Yeni Kriter",
                PerformanceCategoryId = 1,
                IsActive = true
            };

        serviceMock
            .Setup(x =>
                x.UpdateCriterionAsync(1, dto))
            .ReturnsAsync(criterion);

        var controller =
            CreateController(serviceMock);

        var result =
            await controller.UpdateCriterion(
                1,
                dto);

        result.Should()
            .BeOfType<OkObjectResult>();

        var okResult =
            (OkObjectResult)result;

        okResult.Value
            .Should()
            .BeSameAs(criterion);

        serviceMock.Verify(
            x => x.UpdateCriterionAsync(1, dto),
            Times.Once);
    }

    [Fact]
    public async Task DeleteCriterion_Basarili_NoContentDonmeli()
    {
        var serviceMock =
            new Mock<ICriteriaService>();

        serviceMock
            .Setup(x =>
                x.DeleteCriterionAsync(1))
            .Returns(Task.CompletedTask);

        var controller =
            CreateController(serviceMock);

        var result =
            await controller.DeleteCriterion(1);

        result.Should()
            .BeOfType<NoContentResult>();

        serviceMock.Verify(
            x => x.DeleteCriterionAsync(1),
            Times.Once);
    }
}