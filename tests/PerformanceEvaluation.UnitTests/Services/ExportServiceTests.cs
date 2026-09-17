using ClosedXML.Excel;
using FluentAssertions;
using Moq;
using PerformanceEvaluation.Application.DTOs.Report;
using PerformanceEvaluation.Application.Interfaces;
using PerformanceEvaluation.Application.Services;
using System.Security.Claims;

namespace PerformanceEvaluation.UnitTests.Services;

public class ExportServiceTests
{
    private readonly Mock<IReportService> _reportService;
    private readonly ExportService _sut;

    public ExportServiceTests()
    {
        _reportService = new Mock<IReportService>();
        _sut = new ExportService(_reportService.Object);
    }

    // =========================================================
    // HELPERS
    // =========================================================

    private static EmployeeRankingDto BuildRanking(
        int rank,
        int employeeId,
        string employeeName,
        string departmentName = "IT",
        string? jobPositionName = "Yazılım Geliştirici",
        decimal averageScore = 4.5m,
        int evaluationCount = 1)
    {
        return new EmployeeRankingDto
        {
            Rank = rank,
            EmployeeId = employeeId,
            EmployeeName = employeeName,
            DepartmentName = departmentName,
            JobPositionName = jobPositionName,
            AverageScore = averageScore,
            EvaluationCount = evaluationCount
        };
    }

    private static ClaimsPrincipal CreateEvaluatorClaims(int evaluatorId)
    {
        return new ClaimsPrincipal(
            new ClaimsIdentity(
                new[]
                {
                    new Claim(
                        ClaimTypes.NameIdentifier,
                        evaluatorId.ToString()),

                    new Claim(
                        ClaimTypes.Role,
                        "Evaluator")
                },
                "Test"));
    }

    // =========================================================
    // DEPARTMENT RANKING EXPORT
    // =========================================================

    [Fact]
    public async Task ExportDepartmentRankingToExcelAsync_ShouldCallReportServiceWithCorrectPeriodId()
    {
        // Arrange
        const int evaluationPeriodId = 5;

        _reportService
            .Setup(x => x.GetDepartmentRankingAsync(evaluationPeriodId))
            .ReturnsAsync(new List<EmployeeRankingDto>());

        // Act
        await _sut.ExportDepartmentRankingToExcelAsync(evaluationPeriodId);

        // Assert
        _reportService.Verify(
            x => x.GetDepartmentRankingAsync(evaluationPeriodId),
            Times.Once);
    }

    [Fact]
    public async Task ExportDepartmentRankingToExcelAsync_ShouldReturnValidExcelFile()
    {
        // Arrange
        _reportService
            .Setup(x => x.GetDepartmentRankingAsync(It.IsAny<int>()))
            .ReturnsAsync(new List<EmployeeRankingDto>());

        // Act
        var result =
            await _sut.ExportDepartmentRankingToExcelAsync(1);

        // Assert
        result.Should().NotBeNull();
        result.Should().NotBeEmpty();

        using var stream = new MemoryStream(result);
        using var workbook = new XLWorkbook(stream);

        workbook.Worksheets.Should().HaveCount(1);
    }

    [Fact]
    public async Task ExportDepartmentRankingToExcelAsync_ShouldCreateCorrectWorksheetAndHeaders()
    {
        // Arrange
        _reportService
            .Setup(x => x.GetDepartmentRankingAsync(It.IsAny<int>()))
            .ReturnsAsync(new List<EmployeeRankingDto>());

        // Act
        var result =
            await _sut.ExportDepartmentRankingToExcelAsync(1);

        // Assert
        using var stream = new MemoryStream(result);
        using var workbook = new XLWorkbook(stream);

        var worksheet = workbook.Worksheets.First();

        worksheet.Name.Should().Be("Departman Sıralaması");

        worksheet.Cell(1, 1).GetString().Should().Be("Sıra");
        worksheet.Cell(1, 2).GetString().Should().Be("Ad Soyad");
        worksheet.Cell(1, 3).GetString().Should().Be("Departman");
        worksheet.Cell(1, 4).GetString().Should().Be("Pozisyon");
        worksheet.Cell(1, 5).GetString().Should().Be("Ortalama Skor");
        worksheet.Cell(1, 6).GetString().Should().Be("Değerlendirme Sayısı");

        worksheet.Row(1).Style.Font.Bold.Should().BeTrue();
    }

    [Fact]
    public async Task ExportDepartmentRankingToExcelAsync_ShouldWriteRankingDataCorrectly()
    {
        // Arrange
        var rankings = new List<EmployeeRankingDto>
        {
            BuildRanking(
                1,
                101,
                "Ayşe Yılmaz",
                "IT",
                "Yazılım Geliştirici",
                4.75m,
                3),

            BuildRanking(
                2,
                102,
                "Mehmet Demir",
                "İK",
                null,
                4.10m,
                2)
        };

        _reportService
            .Setup(x => x.GetDepartmentRankingAsync(It.IsAny<int>()))
            .ReturnsAsync(rankings);

        // Act
        var result =
            await _sut.ExportDepartmentRankingToExcelAsync(1);

        // Assert
        using var stream = new MemoryStream(result);
        using var workbook = new XLWorkbook(stream);

        var worksheet = workbook.Worksheets.First();

        // First employee
        worksheet.Cell(2, 1).GetValue<int>().Should().Be(1);
        worksheet.Cell(2, 2).GetString().Should().Be("Ayşe Yılmaz");
        worksheet.Cell(2, 3).GetString().Should().Be("IT");
        worksheet.Cell(2, 4).GetString().Should().Be("Yazılım Geliştirici");
        worksheet.Cell(2, 5).GetValue<decimal>().Should().Be(4.75m);
        worksheet.Cell(2, 6).GetValue<int>().Should().Be(3);

        // Second employee
        worksheet.Cell(3, 1).GetValue<int>().Should().Be(2);
        worksheet.Cell(3, 2).GetString().Should().Be("Mehmet Demir");
        worksheet.Cell(3, 3).GetString().Should().Be("İK");
        worksheet.Cell(3, 4).GetString().Should().Be("-");
        worksheet.Cell(3, 5).GetValue<decimal>().Should().Be(4.10m);
        worksheet.Cell(3, 6).GetValue<int>().Should().Be(2);

        // No third data row
        worksheet.Cell(4, 1).IsEmpty().Should().BeTrue();
    }

    [Fact]
    public async Task ExportDepartmentRankingToExcelAsync_ShouldWriteDashWhenJobPositionIsNull()
    {
        // Arrange
        var rankings = new List<EmployeeRankingDto>
        {
            BuildRanking(
                1,
                101,
                "Mehmet Demir",
                "İK",
                null,
                4.10m,
                2)
        };

        _reportService
            .Setup(x => x.GetDepartmentRankingAsync(It.IsAny<int>()))
            .ReturnsAsync(rankings);

        // Act
        var result =
            await _sut.ExportDepartmentRankingToExcelAsync(1);

        // Assert
        using var stream = new MemoryStream(result);
        using var workbook = new XLWorkbook(stream);

        var worksheet = workbook.Worksheets.First();

        worksheet.Cell(2, 4).GetString().Should().Be("-");
    }

    [Fact]
    public async Task ExportDepartmentRankingToExcelAsync_ShouldContainOnlyHeadersWhenThereIsNoData()
    {
        // Arrange
        _reportService
            .Setup(x => x.GetDepartmentRankingAsync(It.IsAny<int>()))
            .ReturnsAsync(new List<EmployeeRankingDto>());

        // Act
        var result =
            await _sut.ExportDepartmentRankingToExcelAsync(1);

        // Assert
        using var stream = new MemoryStream(result);
        using var workbook = new XLWorkbook(stream);

        var worksheet = workbook.Worksheets.First();

        worksheet.Cell(1, 1).GetString().Should().Be("Sıra");
        worksheet.Cell(1, 2).GetString().Should().Be("Ad Soyad");
        worksheet.Cell(1, 3).GetString().Should().Be("Departman");
        worksheet.Cell(1, 4).GetString().Should().Be("Pozisyon");
        worksheet.Cell(1, 5).GetString().Should().Be("Ortalama Skor");
        worksheet.Cell(1, 6).GetString().Should().Be("Değerlendirme Sayısı");

        worksheet.Cell(2, 1).IsEmpty().Should().BeTrue();
    }

    // =========================================================
    // TEAM RANKING EXPORT
    // =========================================================

    [Fact]
    public async Task ExportTeamRankingToExcelAsync_ShouldCallReportServiceWithCorrectParameters()
    {
        // Arrange
        var claims = CreateEvaluatorClaims(10);
        const int evaluationPeriodId = 7;

        _reportService
            .Setup(x => x.GetTeamRankingAsync(
                claims,
                evaluationPeriodId))
            .ReturnsAsync(new List<EmployeeRankingDto>());

        // Act
        await _sut.ExportTeamRankingToExcelAsync(
            claims,
            evaluationPeriodId);

        // Assert
        _reportService.Verify(
            x => x.GetTeamRankingAsync(
                claims,
                evaluationPeriodId),
            Times.Once);
    }

    [Fact]
    public async Task ExportTeamRankingToExcelAsync_ShouldReturnValidExcelFile()
    {
        // Arrange
        var claims = CreateEvaluatorClaims(10);

        _reportService
            .Setup(x => x.GetTeamRankingAsync(
                It.IsAny<ClaimsPrincipal>(),
                It.IsAny<int>()))
            .ReturnsAsync(new List<EmployeeRankingDto>());

        // Act
        var result =
            await _sut.ExportTeamRankingToExcelAsync(
                claims,
                1);

        // Assert
        result.Should().NotBeNull();
        result.Should().NotBeEmpty();

        using var stream = new MemoryStream(result);
        using var workbook = new XLWorkbook(stream);

        workbook.Worksheets.Should().HaveCount(1);
    }

    [Fact]
    public async Task ExportTeamRankingToExcelAsync_ShouldCreateCorrectWorksheetAndHeaders()
    {
        // Arrange
        var claims = CreateEvaluatorClaims(10);

        _reportService
            .Setup(x => x.GetTeamRankingAsync(
                It.IsAny<ClaimsPrincipal>(),
                It.IsAny<int>()))
            .ReturnsAsync(new List<EmployeeRankingDto>());

        // Act
        var result =
            await _sut.ExportTeamRankingToExcelAsync(
                claims,
                1);

        // Assert
        using var stream = new MemoryStream(result);
        using var workbook = new XLWorkbook(stream);

        var worksheet = workbook.Worksheets.First();

        worksheet.Name.Should().Be("Ekip Sıralaması");

        worksheet.Cell(1, 1).GetString().Should().Be("Sıra");
        worksheet.Cell(1, 2).GetString().Should().Be("Ad Soyad");
        worksheet.Cell(1, 3).GetString().Should().Be("Departman");
        worksheet.Cell(1, 4).GetString().Should().Be("Pozisyon");
        worksheet.Cell(1, 5).GetString().Should().Be("Ortalama Skor");
        worksheet.Cell(1, 6).GetString().Should().Be("Değerlendirme Sayısı");

        worksheet.Row(1).Style.Font.Bold.Should().BeTrue();
    }

    [Fact]
    public async Task ExportTeamRankingToExcelAsync_ShouldWriteRankingDataCorrectly()
    {
        // Arrange
        var claims = CreateEvaluatorClaims(10);

        var rankings = new List<EmployeeRankingDto>
        {
            BuildRanking(
                1,
                201,
                "Elif Kara",
                "IT",
                "Analist",
                4.0m,
                1)
        };

        _reportService
            .Setup(x => x.GetTeamRankingAsync(
                It.IsAny<ClaimsPrincipal>(),
                It.IsAny<int>()))
            .ReturnsAsync(rankings);

        // Act
        var result =
            await _sut.ExportTeamRankingToExcelAsync(
                claims,
                1);

        // Assert
        using var stream = new MemoryStream(result);
        using var workbook = new XLWorkbook(stream);

        var worksheet = workbook.Worksheets.First();

        worksheet.Name.Should().Be("Ekip Sıralaması");

        worksheet.Cell(2, 1).GetValue<int>().Should().Be(1);
        worksheet.Cell(2, 2).GetString().Should().Be("Elif Kara");
        worksheet.Cell(2, 3).GetString().Should().Be("IT");
        worksheet.Cell(2, 4).GetString().Should().Be("Analist");
        worksheet.Cell(2, 5).GetValue<decimal>().Should().Be(4.0m);
        worksheet.Cell(2, 6).GetValue<int>().Should().Be(1);
    }

    [Fact]
    public async Task ExportTeamRankingToExcelAsync_ShouldWriteDashWhenJobPositionIsNull()
    {
        // Arrange
        var claims = CreateEvaluatorClaims(10);

        var rankings = new List<EmployeeRankingDto>
        {
            BuildRanking(
                1,
                201,
                "Elif Kara",
                "IT",
                null,
                4.0m,
                1)
        };

        _reportService
            .Setup(x => x.GetTeamRankingAsync(
                It.IsAny<ClaimsPrincipal>(),
                It.IsAny<int>()))
            .ReturnsAsync(rankings);

        // Act
        var result =
            await _sut.ExportTeamRankingToExcelAsync(
                claims,
                1);

        // Assert
        using var stream = new MemoryStream(result);
        using var workbook = new XLWorkbook(stream);

        var worksheet = workbook.Worksheets.First();

        worksheet.Cell(2, 4).GetString().Should().Be("-");
    }

    [Fact]
    public async Task ExportTeamRankingToExcelAsync_ShouldContainOnlyHeadersWhenThereIsNoData()
    {
        // Arrange
        var claims = CreateEvaluatorClaims(10);

        _reportService
            .Setup(x => x.GetTeamRankingAsync(
                It.IsAny<ClaimsPrincipal>(),
                It.IsAny<int>()))
            .ReturnsAsync(new List<EmployeeRankingDto>());

        // Act
        var result =
            await _sut.ExportTeamRankingToExcelAsync(
                claims,
                1);

        // Assert
        using var stream = new MemoryStream(result);
        using var workbook = new XLWorkbook(stream);

        var worksheet = workbook.Worksheets.First();

        worksheet.Cell(1, 1).GetString().Should().Be("Sıra");
        worksheet.Cell(1, 2).GetString().Should().Be("Ad Soyad");
        worksheet.Cell(1, 3).GetString().Should().Be("Departman");
        worksheet.Cell(1, 4).GetString().Should().Be("Pozisyon");
        worksheet.Cell(1, 5).GetString().Should().Be("Ortalama Skor");
        worksheet.Cell(1, 6).GetString().Should().Be("Değerlendirme Sayısı");

        worksheet.Cell(2, 1).IsEmpty().Should().BeTrue();
    }
}