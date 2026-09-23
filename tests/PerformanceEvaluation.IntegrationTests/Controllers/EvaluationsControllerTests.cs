using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;
using PerformanceEvaluation.API.Controllers;
using PerformanceEvaluation.Application.DTOs.Evaluation;
using PerformanceEvaluation.Application.Interfaces;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Claims;

namespace PerformanceEvaluation.IntegrationTests;

public class EvaluationsControllerTests
    : IClassFixture<TestWebApplicationFactory>
{
    private readonly TestWebApplicationFactory _factory;

    public EvaluationsControllerTests(
        TestWebApplicationFactory factory)
    {
        _factory = factory;
    }

    private HttpClient CreateClient(
        string role,
        int userId = 1)
    {
        var client =
            _factory.CreateClient();

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

    [Theory]
    [InlineData("Evaluator")]
    [InlineData("Employee")]
    public async Task ApproveBulk_SadeceAdminErisilebilir(
        string role)
    {
        var client =
            CreateClient(role);

        var response =
            await client.PatchAsJsonAsync(
                "/api/evaluations/approve-bulk",
                new
                {
                    Ids = new[] { 1, 2, 3 }
                });

        response.StatusCode
            .Should()
            .Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task ApproveBulk_AdminErisimineIzinVerilmeli()
    {
        var client =
            CreateClient("Admin");

        var response =
            await client.PatchAsJsonAsync(
                "/api/evaluations/approve-bulk",
                new
                {
                    Ids = Array.Empty<int>()
                });

        response.StatusCode
            .Should()
            .NotBe(HttpStatusCode.Forbidden);
    }
    private static EvaluationsController CreateController(
        Mock<IEvaluationService> serviceMock)
    {
        return new EvaluationsController(
            serviceMock.Object);
    }

    private static void SetUser(
        EvaluationsController controller,
        string role,
        int userId)
    {
        var claims =
            new[]
            {
                new Claim(
                    ClaimTypes.NameIdentifier,
                    userId.ToString()),

                new Claim(
                    ClaimTypes.Role,
                    role)
            };

        controller.ControllerContext =
            new ControllerContext
            {
                HttpContext =
                    new DefaultHttpContext
                    {
                        User =
                            new ClaimsPrincipal(
                                new ClaimsIdentity(
                                    claims,
                                    "Test"))
                    }
            };
    }

    [Fact]
    public async Task Create_Basarili_CreatedAtActionDonmeli()
    {
        var serviceMock =
            new Mock<IEvaluationService>();

        var controller =
            CreateController(serviceMock);

        SetUser(
            controller,
            "Evaluator",
            1);

        var dto =
            new CreateEvaluationDto
            {
                EmployeeId = 2,
                EvaluationPeriodId = 1,
                Comment = "Test",
                Scores =
                    new List<EvaluationDetailInputDto>()
            };

        var evaluation =
            new EvaluationDto
            {
                Id = 10
            };

        serviceMock
            .Setup(x =>
                x.CreateAsync(
                    dto,
                    It.IsAny<ClaimsPrincipal>()))
            .ReturnsAsync(evaluation);

        var result =
            await controller.Create(dto);

        result.Should()
            .BeOfType<CreatedAtActionResult>();

        var createdResult =
            (CreatedAtActionResult)result;

        createdResult.Value
            .Should()
            .BeSameAs(evaluation);

        createdResult.ActionName
            .Should()
            .Be(nameof(
                EvaluationsController.GetById));

        createdResult.RouteValues!
            ["id"]
            .Should()
            .Be(10);

        serviceMock.Verify(
            x =>
                x.CreateAsync(
                    dto,
                    It.IsAny<ClaimsPrincipal>()),
            Times.Once);
    }

    [Fact]
    public async Task GetAll_Basarili_OkDonmeli()
    {
        var serviceMock =
            new Mock<IEvaluationService>();

        var controller =
            CreateController(serviceMock);

        var expected =
            new PagedResultDto<EvaluationDto>
            {
                Items =
                    new List<EvaluationDto>(),

                Page = 1,
                PageSize = 10,
                TotalCount = 0,
                TotalPages = 0
            };

        serviceMock
            .Setup(x =>
                x.GetAllAsync(
                    null,
                    1,
                    10))
            .ReturnsAsync(expected);

        var result =
            await controller.GetAll();

        result.Should()
            .BeOfType<OkObjectResult>();

        var okResult =
            (OkObjectResult)result;

        okResult.Value
            .Should()
            .BeSameAs(expected);

        serviceMock.Verify(
            x =>
                x.GetAllAsync(
                    null,
                    1,
                    10),
            Times.Once);
    }

    [Fact]
    public async Task GetAll_Parametrelerle_Calisabilmeli()
    {
        var serviceMock =
            new Mock<IEvaluationService>();

        var controller =
            CreateController(serviceMock);

        var expected =
            new PagedResultDto<EvaluationDto>
            {
                Items =
                    new List<EvaluationDto>(),

                Page = 2,
                PageSize = 20,
                TotalCount = 40,
                TotalPages = 2
            };

        serviceMock
            .Setup(x =>
                x.GetAllAsync(
                    5,
                    2,
                    20))
            .ReturnsAsync(expected);

        var result =
            await controller.GetAll(
                5,
                2,
                20);

        result.Should()
            .BeOfType<OkObjectResult>();

        var okResult =
            (OkObjectResult)result;

        okResult.Value
            .Should()
            .BeSameAs(expected);

        serviceMock.Verify(
            x =>
                x.GetAllAsync(
                    5,
                    2,
                    20),
            Times.Once);
    }

    [Fact]
    public async Task GetMine_Basarili_OkDonmeli()
    {
        var serviceMock =
            new Mock<IEvaluationService>();

        var controller =
            CreateController(serviceMock);

        SetUser(
            controller,
            "Employee",
            2);

        var expected =
            new List<EvaluationDto>();

        serviceMock
            .Setup(x =>
                x.GetMyEvaluationsAsync(
                    It.IsAny<ClaimsPrincipal>()))
            .ReturnsAsync(expected);

        var result =
            await controller.GetMine();

        result.Should()
            .BeOfType<OkObjectResult>();

        var okResult =
            (OkObjectResult)result;

        okResult.Value
            .Should()
            .BeSameAs(expected);

        serviceMock.Verify(
            x =>
                x.GetMyEvaluationsAsync(
                    It.IsAny<ClaimsPrincipal>()),
            Times.Once);
    }

    [Fact]
    public async Task GetById_Basarili_OkDonmeli()
    {
        var serviceMock =
            new Mock<IEvaluationService>();

        var controller =
            CreateController(serviceMock);

        SetUser(
            controller,
            "Employee",
            2);

        var expected =
            new EvaluationDto
            {
                Id = 1
            };

        serviceMock
            .Setup(x =>
                x.GetByIdAsync(
                    1,
                    It.IsAny<ClaimsPrincipal>()))
            .ReturnsAsync(expected);

        var result =
            await controller.GetById(1);

        result.Should()
            .BeOfType<OkObjectResult>();

        var okResult =
            (OkObjectResult)result;

        okResult.Value
            .Should()
            .BeSameAs(expected);

        serviceMock.Verify(
            x =>
                x.GetByIdAsync(
                    1,
                    It.IsAny<ClaimsPrincipal>()),
            Times.Once);
    }

    [Fact]
    public async Task GetMyPeriodEvaluations_Basarili_OkDonmeli()
    {
        var serviceMock =
            new Mock<IEvaluationService>();

        var controller =
            CreateController(serviceMock);

        SetUser(
            controller,
            "Evaluator",
            7);

        var expected =
            new List<EvaluationDto>();

        serviceMock
            .Setup(x =>
                x.GetByEvaluatorAndPeriodAsync(
                    7,
                    3,
                    It.IsAny<ClaimsPrincipal>()))
            .ReturnsAsync(expected);

        var result =
            await controller
                .GetMyPeriodEvaluations(3);

        result.Should()
            .BeOfType<OkObjectResult>();

        var okResult =
            (OkObjectResult)result;

        okResult.Value
            .Should()
            .BeSameAs(expected);

        serviceMock.Verify(
            x =>
                x.GetByEvaluatorAndPeriodAsync(
                    7,
                    3,
                    It.IsAny<ClaimsPrincipal>()),
            Times.Once);
    }

    [Fact]
    public async Task GetMyPeriodEvaluations_NameIdentifierYoksa_SubClaimKullanilmali()
    {
        var serviceMock =
            new Mock<IEvaluationService>();

        var controller =
            CreateController(serviceMock);

        var identity =
            new ClaimsIdentity(
                new[]
                {
                new Claim(
                    "sub",
                    "7"),

                new Claim(
                    ClaimTypes.Role,
                    "Evaluator")
                },
                "Test");

        controller.ControllerContext =
            new ControllerContext
            {
                HttpContext =
                    new DefaultHttpContext
                    {
                        User =
                            new ClaimsPrincipal(identity)
                    }
            };

        var expected =
            new List<EvaluationDto>();

        serviceMock
            .Setup(x =>
                x.GetByEvaluatorAndPeriodAsync(
                    7,
                    3,
                    It.IsAny<ClaimsPrincipal>()))
            .ReturnsAsync(expected);

        var result =
            await controller
                .GetMyPeriodEvaluations(3);

        result
            .Should()
            .BeOfType<OkObjectResult>();

        var okResult =
            (OkObjectResult)result;

        okResult.Value
            .Should()
            .BeSameAs(expected);

        serviceMock.Verify(
            x =>
                x.GetByEvaluatorAndPeriodAsync(
                    7,
                    3,
                    It.IsAny<ClaimsPrincipal>()),
            Times.Once);
    }

    [Fact]
    public async Task GetMyPeriodEvaluations_ClaimYoksa_UnauthorizedExceptionFirlatmali()
    {
        var serviceMock =
            new Mock<IEvaluationService>();

        var controller =
            CreateController(serviceMock);

        var identity =
            new ClaimsIdentity(
                new[]
                {
                    new Claim(
                        ClaimTypes.Role,
                        "Evaluator")
                },
                "Test");

        controller.ControllerContext =
            new ControllerContext
            {
                HttpContext =
                    new DefaultHttpContext
                    {
                        User =
                            new ClaimsPrincipal(identity)
                    }
            };

        var act = async () =>
            await controller
                .GetMyPeriodEvaluations(3);

        await act.Should()
            .ThrowAsync<UnauthorizedAccessException>()
            .WithMessage(
                "Kullanıcı kimliği bulunamadı.");

        serviceMock.Verify(
            x =>
                x.GetByEvaluatorAndPeriodAsync(
                    It.IsAny<int>(),
                    It.IsAny<int>(),
                    It.IsAny<ClaimsPrincipal>()),
            Times.Never);
    }

    [Fact]
    public async Task Approve_Basarili_OkDonmeli()
    {
        var serviceMock =
            new Mock<IEvaluationService>();

        var controller =
            CreateController(serviceMock);

        var expected =
            new EvaluationDto
            {
                Id = 1
            };

        serviceMock
            .Setup(x =>
                x.ApproveAsync(1))
            .ReturnsAsync(expected);

        var result =
            await controller.Approve(1);

        result.Should()
            .BeOfType<OkObjectResult>();

        var okResult =
            (OkObjectResult)result;

        okResult.Value
            .Should()
            .BeSameAs(expected);

        serviceMock.Verify(
            x =>
                x.ApproveAsync(1),
            Times.Once);
    }

    [Fact]
    public async Task ApproveBulk_Basarili_OkDonmeli()
    {
        var serviceMock =
            new Mock<IEvaluationService>();

        var controller =
            CreateController(serviceMock);

        var ids =
            new List<int>
            {
                1,
                2,
                3
            };

        serviceMock
            .Setup(x =>
                x.ApproveManyAsync(ids))
            .ReturnsAsync(3);

        var request =
            new EvaluationsController
                .BulkApproveRequest(ids);

        var result =
            await controller
                .ApproveBulk(request);

        result.Should()
            .BeOfType<OkObjectResult>();

        var okResult =
            (OkObjectResult)result;

        okResult.Value
            .Should()
            .NotBeNull();

        var property =
            okResult.Value!
                .GetType()
                .GetProperty("approvedCount");

        property.Should()
            .NotBeNull();

        property!
            .GetValue(okResult.Value)
            .Should()
            .Be(3);

        serviceMock.Verify(
            x =>
                x.ApproveManyAsync(ids),
            Times.Once);
    }
}