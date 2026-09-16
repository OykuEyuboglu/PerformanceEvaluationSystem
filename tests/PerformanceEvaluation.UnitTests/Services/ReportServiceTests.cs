using FluentAssertions;
using Moq;
using PerformanceEvaluation.Application.Interfaces;
using PerformanceEvaluation.Application.Services;
using PerformanceEvaluation.Domain.Entities;
using PerformanceEvaluation.Domain.Enums;
using System.Security.Claims;

namespace PerformanceEvaluation.UnitTests.Services;

public class ReportServiceTests
{
    private readonly Mock<IEvaluationRepository> _evaluationRepository = new();
    private readonly Mock<IUserRepository> _userRepository = new();

    private readonly ReportService _sut;

    public ReportServiceTests()
    {
        _sut = new ReportService(
            _evaluationRepository.Object,
            _userRepository.Object);
    }

    // ---------------------------------------------------------
    // HELPERS
    // ---------------------------------------------------------

    private static User BuildEmployee(
        int id,
        string firstName = "AYSE",
        string lastName = "YILMAZ",
        string departmentName = "IT",
        string? jobPositionName = "Yazılım Geliştirici")
    {
        return new User
        {
            Id = id,
            FirstName = firstName,
            LastName = lastName,
            Role = UserRole.Employee,
            Department = new Department { Id = 1, Name = departmentName },
            JobPosition = jobPositionName is null
                ? null
                : new JobPosition { Id = 1, Name = jobPositionName }
        };
    }

    private static Evaluation BuildEvaluation(
        User employee,
        decimal totalScore,
        int evaluationPeriodId = 1)
    {
        return new Evaluation
        {
            EmployeeId = employee.Id,
            Employee = employee,
            EvaluationPeriodId = evaluationPeriodId,
            Status = EvaluationStatus.Approved,
            TotalScore = totalScore
        };
    }

    private static ClaimsPrincipal EvaluatorClaims(int evaluatorId)
    {
        return new ClaimsPrincipal(
            new ClaimsIdentity(
                new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, evaluatorId.ToString()),
                    new Claim(ClaimTypes.Role, "Evaluator")
                },
                "Test"));
    }

    // ===========================================================
    // DEPARTMENT RANKING
    // ===========================================================

    [Fact]
    public async Task GetDepartmentRankingAsync_TekCalisanTekDegerlendirme_OrtalamaSkorDogruOlmali()
    {
        var employee = BuildEmployee(1);

        _evaluationRepository
            .Setup(r => r.GetAllWithDetailsAsync())
            .ReturnsAsync(new List<Evaluation>
            {
                BuildEvaluation(employee, 4m)
            });

        var result = (await _sut.GetDepartmentRankingAsync(1)).ToList();

        result.Should().HaveCount(1);
        result[0].EmployeeId.Should().Be(1);
        result[0].AverageScore.Should().Be(4m);
        result[0].EvaluationCount.Should().Be(1);
        result[0].Rank.Should().Be(1);
    }

    [Fact]
    public async Task GetDepartmentRankingAsync_AyniCalisaninBirdenFazlaDegerlendirmesi_OrtalamaHesaplanmali()
    {
        var employee = BuildEmployee(1);

        _evaluationRepository
            .Setup(r => r.GetAllWithDetailsAsync())
            .ReturnsAsync(new List<Evaluation>
            {
                BuildEvaluation(employee, 4m),
                BuildEvaluation(employee, 5m),
                BuildEvaluation(employee, 3m)
            });

        var result = (await _sut.GetDepartmentRankingAsync(1)).ToList();

        result.Should().HaveCount(1);
        // (4 + 5 + 3) / 3 = 4.00
        result[0].AverageScore.Should().Be(4m);
        result[0].EvaluationCount.Should().Be(3);
    }

    [Fact]
    public async Task GetDepartmentRankingAsync_KesirliOrtalama_IkiOndalikYuvarlanmali()
    {
        var employee = BuildEmployee(1);

        _evaluationRepository
            .Setup(r => r.GetAllWithDetailsAsync())
            .ReturnsAsync(new List<Evaluation>
            {
                BuildEvaluation(employee, 4m),
                BuildEvaluation(employee, 4m),
                BuildEvaluation(employee, 5m)
            });

        var result = (await _sut.GetDepartmentRankingAsync(1)).ToList();

        // (4 + 4 + 5) / 3 = 4.3333... -> 4.33
        result[0].AverageScore.Should().Be(4.33m);
    }

    [Fact]
    public async Task GetDepartmentRankingAsync_BirdenFazlaCalisan_AzalanSirayaGoreSiralanipRankAtanmali()
    {
        var lowScorer = BuildEmployee(1, "DUSUK", "SKOR");
        var midScorer = BuildEmployee(2, "ORTA", "SKOR");
        var highScorer = BuildEmployee(3, "YUKSEK", "SKOR");

        _evaluationRepository
            .Setup(r => r.GetAllWithDetailsAsync())
            .ReturnsAsync(new List<Evaluation>
            {
                BuildEvaluation(lowScorer, 2m),
                BuildEvaluation(midScorer, 3.5m),
                BuildEvaluation(highScorer, 5m)
            });

        var result = (await _sut.GetDepartmentRankingAsync(1)).ToList();

        result.Should().HaveCount(3);
        result[0].EmployeeId.Should().Be(3);
        result[0].Rank.Should().Be(1);
        result[1].EmployeeId.Should().Be(2);
        result[1].Rank.Should().Be(2);
        result[2].EmployeeId.Should().Be(1);
        result[2].Rank.Should().Be(3);
    }

    [Fact]
    public async Task GetDepartmentRankingAsync_FarkliDonemdekiDegerlendirmeler_HaricTutulmali()
    {
        var employee = BuildEmployee(1);

        _evaluationRepository
            .Setup(r => r.GetAllWithDetailsAsync())
            .ReturnsAsync(new List<Evaluation>
            {
                BuildEvaluation(employee, 5m, evaluationPeriodId: 1),
                BuildEvaluation(employee, 1m, evaluationPeriodId: 2)
            });

        var result = (await _sut.GetDepartmentRankingAsync(1)).ToList();

        result.Should().HaveCount(1);
        result[0].AverageScore.Should().Be(5m);
        result[0].EvaluationCount.Should().Be(1);
    }

    [Fact]
    public async Task GetDepartmentRankingAsync_DonemeAitDegerlendirmeYoksa_BosListeDonmeli()
    {
        var employee = BuildEmployee(1);

        _evaluationRepository
            .Setup(r => r.GetAllWithDetailsAsync())
            .ReturnsAsync(new List<Evaluation>
            {
                BuildEvaluation(employee, 5m, evaluationPeriodId: 99)
            });

        var result = await _sut.GetDepartmentRankingAsync(1);

        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetDepartmentRankingAsync_DepartmanAtanmamissa_BelirtilmemisYazmali()
    {
        var employee = BuildEmployee(1, departmentName: "IT");
        employee.Department = null!;

        _evaluationRepository
            .Setup(r => r.GetAllWithDetailsAsync())
            .ReturnsAsync(new List<Evaluation>
            {
                BuildEvaluation(employee, 4m)
            });

        var result = (await _sut.GetDepartmentRankingAsync(1)).ToList();

        result[0].DepartmentName.Should().Be("Belirtilmemiş");
    }

    // ===========================================================
    // TEAM RANKING
    // ===========================================================

    [Fact]
    public async Task GetTeamRankingAsync_SadeceEvaluatoreAtanmisCalisanlariIcermeli()
    {
        var managedEmployee = BuildEmployee(1, "EKIP", "UYESI");
        var otherEmployee = BuildEmployee(2, "BASKA", "EKIP");

        _userRepository
            .Setup(r => r.GetEmployeesByEvaluatorIdAsync(10))
            .ReturnsAsync(new List<User> { managedEmployee });

        _evaluationRepository
            .Setup(r => r.GetAllWithDetailsAsync())
            .ReturnsAsync(new List<Evaluation>
            {
                BuildEvaluation(managedEmployee, 4m),
                BuildEvaluation(otherEmployee, 5m)
            });

        var result = (await _sut.GetTeamRankingAsync(
            EvaluatorClaims(10),
            evaluationPeriodId: 1)).ToList();

        result.Should().HaveCount(1);
        result[0].EmployeeId.Should().Be(1);
    }

    [Fact]
    public async Task GetTeamRankingAsync_DonemVeEkipFiltresiBirlikteUygulanmali()
    {
        var managedEmployee = BuildEmployee(1);

        _userRepository
            .Setup(r => r.GetEmployeesByEvaluatorIdAsync(10))
            .ReturnsAsync(new List<User> { managedEmployee });

        _evaluationRepository
            .Setup(r => r.GetAllWithDetailsAsync())
            .ReturnsAsync(new List<Evaluation>
            {
                BuildEvaluation(managedEmployee, 4m, evaluationPeriodId: 1),
                BuildEvaluation(managedEmployee, 1m, evaluationPeriodId: 2)
            });

        var result = (await _sut.GetTeamRankingAsync(
            EvaluatorClaims(10),
            evaluationPeriodId: 1)).ToList();

        result.Should().HaveCount(1);
        result[0].AverageScore.Should().Be(4m);
        result[0].EvaluationCount.Should().Be(1);
    }

    [Fact]
    public async Task GetTeamRankingAsync_EkipteKimseYoksa_BosListeDonmeli()
    {
        _userRepository
            .Setup(r => r.GetEmployeesByEvaluatorIdAsync(10))
            .ReturnsAsync(new List<User>());

        _evaluationRepository
            .Setup(r => r.GetAllWithDetailsAsync())
            .ReturnsAsync(new List<Evaluation>
            {
                BuildEvaluation(BuildEmployee(2), 5m)
            });

        var result = await _sut.GetTeamRankingAsync(
            EvaluatorClaims(10),
            evaluationPeriodId: 1);

        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetTeamRankingAsync_KullaniciKimligiYoksa_UnauthorizedAccessExceptionFirlatmali()
    {
        var claimsWithoutId = new ClaimsPrincipal(new ClaimsIdentity());

        var act = async () => await _sut.GetTeamRankingAsync(
            claimsWithoutId,
            evaluationPeriodId: 1);

        await act.Should().ThrowAsync<UnauthorizedAccessException>();
    }
}