using AutoMapper;
using FluentAssertions;
using Moq;
using PerformanceEvaluation.Application.DTOs.Evaluation;
using PerformanceEvaluation.Application.Interfaces;
using PerformanceEvaluation.Application.Services;
using PerformanceEvaluation.Domain.Entities;
using PerformanceEvaluation.Domain.Enums;
using System.Security.Claims;

namespace PerformanceEvaluation.UnitTests.Services;

public class EvaluationServiceTests
{
    private readonly Mock<IEvaluationRepository> _evaluationRepository = new();
    private readonly Mock<IPerformanceCriterionRepository> _criterionRepository = new();
    private readonly Mock<IUserRepository> _userRepository = new();
    private readonly Mock<IRepository<EvaluationPeriod>> _evaluationPeriodRepository = new();
    private readonly Mock<IEvaluatorEmployeeRepository> _evaluatorEmployeeRepository = new();
    private readonly Mock<IMapper> _mapper = new();

    private readonly EvaluationService _sut;

    public EvaluationServiceTests()
    {
        _sut = new EvaluationService(
            _evaluationRepository.Object,
            _criterionRepository.Object,
            _userRepository.Object,
            _evaluatorEmployeeRepository.Object,
            _evaluationPeriodRepository.Object,
            _mapper.Object);
    }

    private static ClaimsPrincipal EvaluatorClaims(int evaluatorId)
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

    private static PerformanceCategory BuildCategory(
        int id,
        decimal weight,
        bool isActive = true)
    {
        return new PerformanceCategory
        {
            Id = id,
            Name = $"Kategori-{id}",
            Weight = weight,
            IsActive = isActive
        };
    }

    private static PerformanceCriterion BuildCriterion(
        int id,
        int categoryId,
        decimal categoryWeight,
        int jobPositionId,
        bool criterionActive = true,
        bool categoryActive = true)
    {
        var category = BuildCategory(
            categoryId,
            categoryWeight,
            categoryActive);

        return new PerformanceCriterion
        {
            Id = id,
            Name = $"Kriter-{id}",
            IsActive = criterionActive,
            PerformanceCategoryId = categoryId,
            PerformanceCategory = category,

            JobPositionDescriptions = new List<CriterionJobPosition>
            {
                new CriterionJobPosition
                {
                    JobPositionId = jobPositionId,
                    Description = $"Pozisyon açıklaması {id}"
                }
            }
        };
    }

    private static EvaluationPeriod BuildActivePeriod(int id = 1)
    {
        return new EvaluationPeriod
        {
            Id = id,
            Name = $"Test Dönemi {id}",
            StartDate = DateTime.Now.AddDays(-5),
            EndDate = DateTime.Now.AddDays(5)
        };
    }

    private static EvaluationPeriod BuildInactivePeriod(int id = 1)
    {
        return new EvaluationPeriod
        {
            Id = id,
            Name = $"Geçmiş Dönem {id}",
            StartDate = DateTime.Now.AddDays(-20),
            EndDate = DateTime.Now.AddDays(-10)
        };
    }

    private static User BuildEvaluator(
        int id = 1,
        bool isActive = true,
        UserRole role = UserRole.Evaluator)
    {
        return new User
        {
            Id = id,
            IsActive = isActive,
            Role = role
        };
    }

    private static User BuildEmployee(
        int id = 2,
        bool isActive = true,
        int? jobPositionId = 10)
    {
        return new User
        {
            Id = id,
            IsActive = isActive,
            JobPositionId = jobPositionId
        };
    }

    private void SetupValidCreateScenario(
        User? evaluator = null,
        User? employee = null,
        EvaluationPeriod? period = null,
        IEnumerable<PerformanceCriterion>? criteria = null)
    {
        evaluator ??= BuildEvaluator();
        employee ??= BuildEmployee();
        period ??= BuildActivePeriod();

        criteria ??= new[]
        {
            BuildCriterion(
                id: 1,
                categoryId: 1,
                categoryWeight: 100,
                jobPositionId: 10)
        };

        _userRepository
            .Setup(r => r.GetByIdAsync(evaluator.Id))
            .ReturnsAsync(evaluator);

        _userRepository
            .Setup(r => r.GetEmployeesByEvaluatorIdAsync(evaluator.Id))
            .ReturnsAsync(new List<User> { employee });

        _evaluationPeriodRepository
            .Setup(r => r.GetByIdAsync(period.Id))
            .ReturnsAsync(period);

        _criterionRepository
            .Setup(r => r.GetActiveWithDescriptionsAsync())
            .ReturnsAsync(criteria.ToList());

        _evaluationRepository
            .Setup(r =>
                r.ExistsByEvaluatorEmployeePeriodAsync(
                    evaluator.Id,
                    employee.Id,
                    period.Id))
            .ReturnsAsync(false);

        _evaluationRepository
            .Setup(r => r.AddAsync(It.IsAny<Evaluation>()))
            .Returns(Task.CompletedTask);

        _evaluationRepository
            .Setup(r => r.SaveChangesAsync())
            .ReturnsAsync(true);

        _evaluationRepository
            .Setup(r => r.GetByIdWithDetailsAsync(It.IsAny<int>()))
            .ReturnsAsync((Evaluation?)null);

        _mapper
            .Setup(m => m.Map<EvaluationDto>(It.IsAny<Evaluation>()))
            .Returns(new EvaluationDto());
    }

    private static CreateEvaluationDto BuildValidDto(
        int employeeId,
        int periodId,
        IEnumerable<EvaluationDetailInputDto> scores)
    {
        return new CreateEvaluationDto
        {
            EmployeeId = employeeId,
            EvaluationPeriodId = periodId,
            Comment = "Test değerlendirmesi",
            Scores = scores.ToList()
        };
    }

    [Fact]
    public async Task CreateAsync_GecerliVerilerle_DegerlendirmeOlusturmali()
    {
        Evaluation? capturedEvaluation = null;

        SetupValidCreateScenario();

        _evaluationRepository
            .Setup(r => r.AddAsync(It.IsAny<Evaluation>()))
            .Callback<Evaluation>(
                e => capturedEvaluation = e)
            .Returns(Task.CompletedTask);

        _evaluationRepository
            .Setup(r => r.GetByIdWithDetailsAsync(It.IsAny<int>()))
            .ReturnsAsync(() => capturedEvaluation);

        var dto = BuildValidDto(
            2,
            1,
            new[]
            {
                new EvaluationDetailInputDto
                {
                    PerformanceCriterionId = 1,
                    Score = 4
                }
            });

        await _sut.CreateAsync(
            dto,
            EvaluatorClaims(1));

        capturedEvaluation.Should().NotBeNull();

        capturedEvaluation!.EmployeeId
            .Should()
            .Be(2);

        capturedEvaluation.EvaluatorId
            .Should()
            .Be(1);

        capturedEvaluation.EvaluationPeriodId
            .Should()
            .Be(1);

        capturedEvaluation.Status
            .Should()
            .Be(EvaluationStatus.Submitted);

        capturedEvaluation.Details
            .Should()
            .HaveCount(1);

        capturedEvaluation.Details
            .First()
            .Score
            .Should()
            .Be(4);
    }

    [Fact]
    public async Task CreateAsync_EvaluatorBulunamazsa_UnauthorizedExceptionFirlatmali()
    {
        _userRepository
            .Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync((User?)null);

        var dto = BuildValidDto(
            2,
            1,
            new[]
            {
                new EvaluationDetailInputDto
                {
                    PerformanceCriterionId = 1,
                    Score = 4
                }
            });

        var act = () =>
            _sut.CreateAsync(
                dto,
                EvaluatorClaims(1));

        await act.Should()
            .ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("*bulunamadı*");
    }

    [Fact]
    public async Task CreateAsync_PasifEvaluator_DegerlendirmeYapamamali()
    {
        var evaluator = BuildEvaluator(
            id: 1,
            isActive: false);

        _userRepository
            .Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(evaluator);

        var dto = BuildValidDto(
            2,
            1,
            new[]
            {
                new EvaluationDetailInputDto
                {
                    PerformanceCriterionId = 1,
                    Score = 4
                }
            });

        var act = () =>
            _sut.CreateAsync(
                dto,
                EvaluatorClaims(1));

        await act.Should()
            .ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("*Pasif kullanıcı*");
    }

    [Fact]
    public async Task CreateAsync_EvaluatorOlmayanKullanici_DegerlendirmeYapamamali()
    {
        var user = BuildEvaluator(
            id: 1,
            role: UserRole.Employee);

        _userRepository
            .Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(user);

        var dto = BuildValidDto(
            2,
            1,
            new[]
            {
                new EvaluationDetailInputDto
                {
                    PerformanceCriterionId = 1,
                    Score = 4
                }
            });

        var act = () =>
            _sut.CreateAsync(
                dto,
                EvaluatorClaims(1));

        await act.Should()
            .ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("*yetkisine sahip değil*");
    }

    [Fact]
    public async Task CreateAsync_EvaluatorKendiEkibindeOlmayanCalisani_Degerlendirememeli()
    {
        var evaluator = BuildEvaluator();

        _userRepository
            .Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(evaluator);

        _userRepository
            .Setup(r => r.GetEmployeesByEvaluatorIdAsync(1))
            .ReturnsAsync(new List<User>());

        var dto = BuildValidDto(
            999,
            1,
            new[]
            {
                new EvaluationDetailInputDto
                {
                    PerformanceCriterionId = 1,
                    Score = 4
                }
            });

        var act = () =>
            _sut.CreateAsync(
                dto,
                EvaluatorClaims(1));

        await act.Should()
            .ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("*yetkiniz yok*");
    }

    [Fact]
    public async Task CreateAsync_PasifCalisan_Degerlendirilememeli()
    {
        var evaluator = BuildEvaluator();

        var employee = BuildEmployee(
            id: 2,
            isActive: false);

        _userRepository
            .Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(evaluator);

        _userRepository
            .Setup(r => r.GetEmployeesByEvaluatorIdAsync(1))
            .ReturnsAsync(new List<User> { employee });

        var dto = BuildValidDto(
            2,
            1,
            new[]
            {
                new EvaluationDetailInputDto
                {
                    PerformanceCriterionId = 1,
                    Score = 4
                }
            });

        var act = () =>
            _sut.CreateAsync(
                dto,
                EvaluatorClaims(1));

        await act.Should()
            .ThrowAsync<InvalidOperationException>()
            .WithMessage("*Pasif durumdaki çalışan*");
    }

    [Fact]
    public async Task CreateAsync_PozisyonuOlmayanCalisan_Degerlendirilememeli()
    {
        var employee = BuildEmployee(
            id: 2,
            jobPositionId: null);

        SetupValidCreateScenario(
            employee: employee);

        var dto = BuildValidDto(
            2,
            1,
            new[]
            {
                new EvaluationDetailInputDto
                {
                    PerformanceCriterionId = 1,
                    Score = 4
                }
            });

        var act = () =>
            _sut.CreateAsync(
                dto,
                EvaluatorClaims(1));

        await act.Should()
            .ThrowAsync<InvalidOperationException>()
            .WithMessage("*pozisyonu tanımlı olmadığı*");
    }

    [Fact]
    public async Task CreateAsync_DegerlendirmeDonemiBulunamazsa_KeyNotFoundExceptionFirlatmali()
    {
        SetupValidCreateScenario();

        _evaluationPeriodRepository
            .Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync((EvaluationPeriod?)null);

        var dto = BuildValidDto(
            2,
            1,
            new[]
            {
                new EvaluationDetailInputDto
                {
                    PerformanceCriterionId = 1,
                    Score = 4
                }
            });

        var act = () =>
            _sut.CreateAsync(
                dto,
                EvaluatorClaims(1));

        await act.Should()
            .ThrowAsync<KeyNotFoundException>()
            .WithMessage("*Değerlendirme dönemi bulunamadı*");
    }

    [Fact]
    public async Task CreateAsync_DonemAktifDegilse_DegerlendirmeYapilamamali()
    {
        SetupValidCreateScenario(
            period: BuildInactivePeriod());

        var dto = BuildValidDto(
            2,
            1,
            new[]
            {
                new EvaluationDetailInputDto
                {
                    PerformanceCriterionId = 1,
                    Score = 4
                }
            });

        var act = () =>
            _sut.CreateAsync(
                dto,
                EvaluatorClaims(1));

        await act.Should()
            .ThrowAsync<InvalidOperationException>()
            .WithMessage("*dönemi aktif değil*");
    }

    [Fact]
    public async Task CreateAsync_AyniCalisanAyniDonemdeDahaOnceDegerlendirilmisse_HataFirlatmali()
    {
        SetupValidCreateScenario();

        _evaluationRepository
            .Setup(r =>
                r.ExistsByEvaluatorEmployeePeriodAsync(
                    1,
                    2,
                    1))
            .ReturnsAsync(true);

        var dto = BuildValidDto(
            2,
            1,
            new[]
            {
                new EvaluationDetailInputDto
                {
                    PerformanceCriterionId = 1,
                    Score = 4
                }
            });

        var act = () =>
            _sut.CreateAsync(
                dto,
                EvaluatorClaims(1));

        await act.Should()
            .ThrowAsync<InvalidOperationException>()
            .WithMessage("*zaten bir değerlendirme bulunmaktadır*");
    }

    [Fact]
    public async Task CreateAsync_AktifKategoriAgirliklariYuzdeYuzDegilse_HataFirlatmali()
    {
        var criterion = BuildCriterion(
            id: 1,
            categoryId: 1,
            categoryWeight: 70,
            jobPositionId: 10);

        SetupValidCreateScenario(
            criteria: new[] { criterion });

        var dto = BuildValidDto(
            2,
            1,
            new[]
            {
                new EvaluationDetailInputDto
                {
                    PerformanceCriterionId = 1,
                    Score = 4
                }
            });

        var act = () =>
            _sut.CreateAsync(
                dto,
                EvaluatorClaims(1));

        await act.Should()
            .ThrowAsync<InvalidOperationException>()
            .WithMessage("*%100*");
    }

    [Fact]
    public async Task CreateAsync_SkorlarBosIse_HataFirlatmali()
    {
        SetupValidCreateScenario();

        var dto = new CreateEvaluationDto
        {
            EmployeeId = 2,
            EvaluationPeriodId = 1,
            Scores = new List<EvaluationDetailInputDto>()
        };

        var act = () =>
            _sut.CreateAsync(
                dto,
                EvaluatorClaims(1));

        await act.Should()
            .ThrowAsync<InvalidOperationException>()
            .WithMessage("*En az bir kriter*");
    }

    [Theory]
    [InlineData(0)]
    [InlineData(6)]
    [InlineData(-1)]
    [InlineData(10)]
    public async Task CreateAsync_Skor1Ve5ArasindaDegilse_HataFirlatmali(
        int score)
    {
        SetupValidCreateScenario();

        var dto = BuildValidDto(
            2,
            1,
            new[]
            {
                new EvaluationDetailInputDto
                {
                    PerformanceCriterionId = 1,
                    Score = score
                }
            });

        var act = () =>
            _sut.CreateAsync(
                dto,
                EvaluatorClaims(1));

        await act.Should()
            .ThrowAsync<InvalidOperationException>()
            .WithMessage("*1 ile 5*");
    }

    [Theory]
    [InlineData(1)]
    [InlineData(2)]
    [InlineData(3)]
    [InlineData(4)]
    [InlineData(5)]
    public async Task CreateAsync_GecerliSkorlar1Ve5Arasinda_KabulEdilmeli(
        int score)
    {
        Evaluation? capturedEvaluation = null;

        SetupValidCreateScenario();

        _evaluationRepository
            .Setup(r => r.AddAsync(It.IsAny<Evaluation>()))
            .Callback<Evaluation>(
                e => capturedEvaluation = e)
            .Returns(Task.CompletedTask);

        _evaluationRepository
            .Setup(r => r.GetByIdWithDetailsAsync(It.IsAny<int>()))
            .ReturnsAsync(() => capturedEvaluation);

        var dto = BuildValidDto(
            2,
            1,
            new[]
            {
                new EvaluationDetailInputDto
                {
                    PerformanceCriterionId = 1,
                    Score = score
                }
            });

        await _sut.CreateAsync(
            dto,
            EvaluatorClaims(1));

        capturedEvaluation.Should().NotBeNull();

        capturedEvaluation!
            .Details
            .First()
            .Score
            .Should()
            .Be(score);
    }

    [Fact]
    public async Task CreateAsync_AyniKriterBirdenFazlaPuanlanirsa_HataFirlatmali()
    {
        SetupValidCreateScenario();

        var dto = BuildValidDto(
            2,
            1,
            new[]
            {
                new EvaluationDetailInputDto
                {
                    PerformanceCriterionId = 1,
                    Score = 4
                },
                new EvaluationDetailInputDto
                {
                    PerformanceCriterionId = 1,
                    Score = 5
                }
            });

        var act = () =>
            _sut.CreateAsync(
                dto,
                EvaluatorClaims(1));

        await act.Should()
            .ThrowAsync<InvalidOperationException>()
            .WithMessage("*Aynı kriter*");
    }

    [Fact]
    public async Task CreateAsync_GecersizCriterionId_Gonderilirse_HataFirlatmali()
    {
        SetupValidCreateScenario();

        var dto = BuildValidDto(
            2,
            1,
            new[]
            {
                new EvaluationDetailInputDto
                {
                    PerformanceCriterionId = 999,
                    Score = 4
                }
            });

        var act = () =>
            _sut.CreateAsync(
                dto,
                EvaluatorClaims(1));

        await act.Should()
            .ThrowAsync<InvalidOperationException>()
            .WithMessage("*Geçersiz veya pasif*");
    }

    [Fact]
    public async Task CreateAsync_TumAktifKriterlerPuanlanmazsa_HataFirlatmali()
    {
        var criterion1 = BuildCriterion(
            id: 1,
            categoryId: 1,
            categoryWeight: 50,
            jobPositionId: 10);

        var criterion2 = BuildCriterion(
            id: 2,
            categoryId: 2,
            categoryWeight: 50,
            jobPositionId: 10);

        SetupValidCreateScenario(
            criteria: new[]
            {
                criterion1,
                criterion2
            });

        var dto = BuildValidDto(
            2,
            1,
            new[]
            {
                new EvaluationDetailInputDto
                {
                    PerformanceCriterionId = 1,
                    Score = 4
                }
            });

        var act = () =>
            _sut.CreateAsync(
                dto,
                EvaluatorClaims(1));

        await act.Should()
            .ThrowAsync<InvalidOperationException>()
            .WithMessage("*Tüm aktif kriterler*");
    }

    [Fact]
    public async Task CreateAsync_CalisaninPozisyonunaUygunKriterYoksa_HataFirlatmali()
    {
        var criterion = BuildCriterion(
            id: 1,
            categoryId: 1,
            categoryWeight: 100,
            jobPositionId: 99);

        SetupValidCreateScenario(
            criteria: new[] { criterion });

        var dto = BuildValidDto(
            2,
            1,
            new[]
            {
                new EvaluationDetailInputDto
                {
                    PerformanceCriterionId = 1,
                    Score = 4
                }
            });

        var act = () =>
            _sut.CreateAsync(
                dto,
                EvaluatorClaims(1));

        await act.Should()
            .ThrowAsync<InvalidOperationException>()
            .WithMessage("*pozisyonuna ait aktif performans kriteri*");
    }

    [Fact]
    public async Task CreateAsync_TekKategoriTekKriter_SkorDogruHesaplanmali()
    {
        Evaluation? capturedEvaluation = null;

        SetupValidCreateScenario();

        _evaluationRepository
            .Setup(r => r.AddAsync(It.IsAny<Evaluation>()))
            .Callback<Evaluation>(
                e => capturedEvaluation = e)
            .Returns(Task.CompletedTask);

        _evaluationRepository
            .Setup(r => r.GetByIdWithDetailsAsync(It.IsAny<int>()))
            .ReturnsAsync(() => capturedEvaluation);

        var dto = BuildValidDto(
            2,
            1,
            new[]
            {
                new EvaluationDetailInputDto
                {
                    PerformanceCriterionId = 1,
                    Score = 4
                }
            });

        await _sut.CreateAsync(
            dto,
            EvaluatorClaims(1));

        capturedEvaluation!
            .TotalScore
            .Should()
            .Be(4.00m);
    }

    [Fact]
    public async Task CreateAsync_IkiKategoriFarkliAgirlik_AgirlikliOrtalamaDogruHesaplanmali()
    {
        Evaluation? capturedEvaluation = null;

        var categoryA = BuildCategory(
            id: 1,
            weight: 70);

        var categoryB = BuildCategory(
            id: 2,
            weight: 30);

        var criterionA1 = BuildCriterion(
            id: 1,
            categoryId: 1,
            categoryWeight: 70,
            jobPositionId: 10);

        var criterionA2 = BuildCriterion(
            id: 2,
            categoryId: 1,
            categoryWeight: 70,
            jobPositionId: 10);

        var criterionB1 = BuildCriterion(
            id: 3,
            categoryId: 2,
            categoryWeight: 30,
            jobPositionId: 10);

        criterionA1.PerformanceCategory = categoryA;
        criterionA2.PerformanceCategory = categoryA;
        criterionB1.PerformanceCategory = categoryB;

        SetupValidCreateScenario(
            criteria: new[]
            {
                criterionA1,
                criterionA2,
                criterionB1
            });

        _evaluationRepository
            .Setup(r => r.AddAsync(It.IsAny<Evaluation>()))
            .Callback<Evaluation>(
                e => capturedEvaluation = e)
            .Returns(Task.CompletedTask);

        _evaluationRepository
            .Setup(r => r.GetByIdWithDetailsAsync(It.IsAny<int>()))
            .ReturnsAsync(() => capturedEvaluation);

        var dto = BuildValidDto(
            2,
            1,
            new[]
            {
                new EvaluationDetailInputDto
                {
                    PerformanceCriterionId = 1,
                    Score = 5
                },
                new EvaluationDetailInputDto
                {
                    PerformanceCriterionId = 2,
                    Score = 3
                },
                new EvaluationDetailInputDto
                {
                    PerformanceCriterionId = 3,
                    Score = 2
                }
            });

        await _sut.CreateAsync(
            dto,
            EvaluatorClaims(1));

        capturedEvaluation!
            .TotalScore
            .Should()
            .Be(3.40m);
    }

    [Fact]
    public async Task ApproveAsync_SubmittedDegerlendirmeyi_ApprovedYapmali()
    {
        var evaluation = new Evaluation
        {
            Id = 1,
            EmployeeId = 2,
            EvaluatorId = 1,
            EvaluationPeriodId = 1,
            Status = EvaluationStatus.Submitted,
            TotalScore = 4.20m
        };

        _evaluationRepository
            .Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(evaluation);

        _evaluationRepository
            .Setup(r => r.SaveChangesAsync())
            .ReturnsAsync(true);

        _evaluationRepository
            .Setup(r => r.GetByIdWithDetailsAsync(1))
            .ReturnsAsync(evaluation);

        _mapper
            .Setup(m => m.Map<EvaluationDto>(
                It.IsAny<Evaluation>()))
            .Returns(new EvaluationDto());

        await _sut.ApproveAsync(1);

        evaluation.Status
            .Should()
            .Be(EvaluationStatus.Approved);

        _evaluationRepository.Verify(
            r => r.Update(evaluation),
            Times.Once);

        _evaluationRepository.Verify(
            r => r.SaveChangesAsync(),
            Times.Once);
    }

    [Fact]
    public async Task ApproveAsync_SubmittedOlmayanDegerlendirme_Onaylanamamali()
    {
        var evaluation = new Evaluation
        {
            Id = 1,
            Status = EvaluationStatus.Approved
        };

        _evaluationRepository
            .Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(evaluation);

        var act = () =>
            _sut.ApproveAsync(1);

        await act.Should()
            .ThrowAsync<InvalidOperationException>()
            .WithMessage("*Sadece 'Gönderildi'*");
    }

    [Fact]
    public async Task ApproveAsync_DegerlendirmeBulunamazsa_KeyNotFoundExceptionFirlatmali()
    {
        _evaluationRepository
            .Setup(r => r.GetByIdAsync(999))
            .ReturnsAsync((Evaluation?)null);

        var act = () =>
            _sut.ApproveAsync(999);

        await act.Should()
            .ThrowAsync<KeyNotFoundException>()
            .WithMessage("*Değerlendirme bulunamadı*");
    }

    [Fact]
    public async Task ApproveManyAsync_SadeceSubmittedOlanlari_Onaylamali()
    {
        var submitted1 = new Evaluation
        {
            Id = 1,
            Status = EvaluationStatus.Submitted
        };

        var submitted2 = new Evaluation
        {
            Id = 2,
            Status = EvaluationStatus.Submitted
        };

        var alreadyApproved = new Evaluation
        {
            Id = 3,
            Status = EvaluationStatus.Approved
        };

        _evaluationRepository
            .Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(submitted1);

        _evaluationRepository
            .Setup(r => r.GetByIdAsync(2))
            .ReturnsAsync(submitted2);

        _evaluationRepository
            .Setup(r => r.GetByIdAsync(3))
            .ReturnsAsync(alreadyApproved);

        _evaluationRepository
            .Setup(r => r.SaveChangesAsync())
            .ReturnsAsync(true);

        var result = await _sut.ApproveManyAsync(
            new[] { 1, 2, 3 });

        result.Should().Be(2);

        submitted1.Status
            .Should()
            .Be(EvaluationStatus.Approved);

        submitted2.Status
            .Should()
            .Be(EvaluationStatus.Approved);

        alreadyApproved.Status
            .Should()
            .Be(EvaluationStatus.Approved);

        _evaluationRepository.Verify(
            r => r.Update(submitted1),
            Times.Once);

        _evaluationRepository.Verify(
            r => r.Update(submitted2),
            Times.Once);

        _evaluationRepository.Verify(
            r => r.Update(alreadyApproved),
            Times.Never);

        _evaluationRepository.Verify(
            r => r.SaveChangesAsync(),
            Times.Once);
    }

    [Fact]
    public async Task ApproveManyAsync_BulunamayanIdleri_Atlamali()
    {
        var submitted = new Evaluation
        {
            Id = 1,
            Status = EvaluationStatus.Submitted
        };

        _evaluationRepository
            .Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(submitted);

        _evaluationRepository
            .Setup(r => r.GetByIdAsync(999))
            .ReturnsAsync((Evaluation?)null);

        _evaluationRepository
            .Setup(r => r.SaveChangesAsync())
            .ReturnsAsync(true);

        var result = await _sut.ApproveManyAsync(
            new[] { 1, 999 });

        result.Should().Be(1);

        submitted.Status
            .Should()
            .Be(EvaluationStatus.Approved);
    }
}