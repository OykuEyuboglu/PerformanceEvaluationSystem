using FluentAssertions;
using Moq;
using PerformanceEvaluation.Application.DTOs.EvaluatorEmployee;
using PerformanceEvaluation.Application.Interfaces;
using PerformanceEvaluation.Application.Services;
using PerformanceEvaluation.Domain.Entities;

namespace PerformanceEvaluation.UnitTests.Services;

public class EvaluationPeriodServiceTests
{
    private readonly Mock<IRepository<EvaluationPeriod>> _repository = new();
    private readonly Mock<IEvaluationRepository> _evaluationRepository = new();

    private readonly EvaluationPeriodService _sut;

    public EvaluationPeriodServiceTests()
    {
        _sut = new EvaluationPeriodService(
            _repository.Object,
            _evaluationRepository.Object);
    }

    private static EvaluationPeriod BuildPeriod(
        int id = 1,
        string name = "2026 Q1",
        DateTime? start = null,
        DateTime? end = null)
    {
        return new EvaluationPeriod
        {
            Id = id,
            Name = name,
            StartDate = start ?? new DateTime(2026, 1, 1),
            EndDate = end ?? new DateTime(2026, 3, 31)
        };
    }

    [Fact]
    public async Task GetAllAsync_DonemlerVarsa_TumunuDondurmeli()
    {
        var periods = new List<EvaluationPeriod>
        {
            BuildPeriod(1, "2026 Q1"),
            BuildPeriod(2, "2026 Q2")
        };

        _repository
            .Setup(r => r.GetAllAsync())
            .ReturnsAsync(periods);

        var result = await _sut.GetAllAsync();

        result.Should().HaveCount(2);
        result
            .Select(p => p.Name)
            .Should()
            .Contain(new[] { "2026 Q1", "2026 Q2" });
    }

    [Fact]
    public async Task CreateAsync_GecerliTarihlerle_DonemOlusturmali()
    {
        EvaluationPeriod? captured = null;

        _repository
            .Setup(r => r.AddAsync(It.IsAny<EvaluationPeriod>()))
            .Callback<EvaluationPeriod>(p => captured = p)
            .Returns(Task.CompletedTask);

        _repository
            .Setup(r => r.SaveChangesAsync())
            .ReturnsAsync(true);

        var dto = new CreateEvaluationPeriodDto
        {
            Name = "2026 Q3",
            StartDate = new DateTime(2026, 7, 1),
            EndDate = new DateTime(2026, 9, 30)
        };

        var result = await _sut.CreateAsync(dto);

        captured.Should().NotBeNull();
        captured!.Name.Should().Be("2026 Q3");

        result.Name.Should().Be("2026 Q3");
        result.StartDate.Should().Be(new DateTime(2026, 7, 1));
        result.EndDate.Should().Be(new DateTime(2026, 9, 30));

        _repository.Verify(
            r => r.AddAsync(It.IsAny<EvaluationPeriod>()),
            Times.Once);

        _repository.Verify(
            r => r.SaveChangesAsync(),
            Times.Once);
    }

    [Fact]
    public async Task CreateAsync_BitisTarihiBaslangictanOnceyse_InvalidOperationExceptionFirlatmali()
    {
        var dto = new CreateEvaluationPeriodDto
        {
            Name = "Geçersiz Dönem",
            StartDate = new DateTime(2026, 6, 1),
            EndDate = new DateTime(2026, 1, 1)
        };

        var act = async () => await _sut.CreateAsync(dto);

        await act
            .Should()
            .ThrowAsync<InvalidOperationException>();

        _repository.Verify(
            r => r.AddAsync(It.IsAny<EvaluationPeriod>()),
            Times.Never);
    }

    [Fact]
    public async Task CreateAsync_BaslangicVeBitisAyniGunse_DonemOlusturmali()
    {
        _repository
            .Setup(r => r.AddAsync(It.IsAny<EvaluationPeriod>()))
            .Returns(Task.CompletedTask);

        _repository
            .Setup(r => r.SaveChangesAsync())
            .ReturnsAsync(true);

        var dto = new CreateEvaluationPeriodDto
        {
            Name = "Tek Günlük Dönem",
            StartDate = new DateTime(2026, 5, 1),
            EndDate = new DateTime(2026, 5, 1)
        };

        var act = async () => await _sut.CreateAsync(dto);

        await act
            .Should()
            .NotThrowAsync();
    }

    [Fact]
    public async Task UpdateAsync_GecerliVerilerle_DonemiGuncellemeli()
    {
        var existing = BuildPeriod(4, "Eski İsim");

        _repository
            .Setup(r => r.GetByIdAsync(4))
            .ReturnsAsync(existing);

        _repository
            .Setup(r => r.SaveChangesAsync())
            .ReturnsAsync(true);

        var dto = new UpdateEvaluationPeriodDto
        {
            Name = "Yeni İsim",
            StartDate = new DateTime(2026, 4, 1),
            EndDate = new DateTime(2026, 6, 30)
        };

        var result = await _sut.UpdateAsync(4, dto);

        existing.Name.Should().Be("Yeni İsim");
        existing.StartDate.Should().Be(new DateTime(2026, 4, 1));
        existing.EndDate.Should().Be(new DateTime(2026, 6, 30));

        result.Name.Should().Be("Yeni İsim");

        _repository.Verify(
            r => r.Update(existing),
            Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_BitisTarihiBaslangictanOnceyse_InvalidOperationExceptionFirlatmali()
    {
        var dto = new UpdateEvaluationPeriodDto
        {
            Name = "Geçersiz",
            StartDate = new DateTime(2026, 8, 1),
            EndDate = new DateTime(2026, 7, 1)
        };

        var act = async () => await _sut.UpdateAsync(1, dto);

        await act
            .Should()
            .ThrowAsync<InvalidOperationException>();

        _repository.Verify(
            r => r.GetByIdAsync(It.IsAny<int>()),
            Times.Never);
    }

    [Fact]
    public async Task UpdateAsync_DonemYoksa_KeyNotFoundExceptionFirlatmali()
    {
        _repository
            .Setup(r => r.GetByIdAsync(It.IsAny<int>()))
            .ReturnsAsync((EvaluationPeriod?)null);

        var dto = new UpdateEvaluationPeriodDto
        {
            Name = "Herhangi",
            StartDate = new DateTime(2026, 1, 1),
            EndDate = new DateTime(2026, 2, 1)
        };

        var act = async () => await _sut.UpdateAsync(99, dto);

        await act
            .Should()
            .ThrowAsync<KeyNotFoundException>();
    }

    [Fact]
    public async Task DeleteAsync_BagliDegerlendirmeYoksa_DonemiSilmeli()
    {
        var existing = BuildPeriod(6);

        _repository
            .Setup(r => r.GetByIdAsync(6))
            .ReturnsAsync(existing);

        _evaluationRepository
            .Setup(r =>
                r.FindAsync(
                    It.IsAny<System.Linq.Expressions.Expression<Func<Evaluation, bool>>>()))
            .ReturnsAsync(new List<Evaluation>());

        _repository
            .Setup(r => r.SaveChangesAsync())
            .ReturnsAsync(true);

        await _sut.DeleteAsync(6);

        _repository.Verify(
            r => r.Remove(existing),
            Times.Once);

        _repository.Verify(
            r => r.SaveChangesAsync(),
            Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_BagliDegerlendirmelerVarsa_InvalidOperationExceptionFirlatmali()
    {
        var existing = BuildPeriod(7);

        _repository
            .Setup(r => r.GetByIdAsync(7))
            .ReturnsAsync(existing);

        _evaluationRepository
            .Setup(r =>
                r.FindAsync(
                    It.IsAny<System.Linq.Expressions.Expression<Func<Evaluation, bool>>>()))
            .ReturnsAsync(new List<Evaluation>
            {
                new Evaluation()
            });

        var act = async () => await _sut.DeleteAsync(7);

        await act
            .Should()
            .ThrowAsync<InvalidOperationException>();

        _repository.Verify(
            r => r.Remove(It.IsAny<EvaluationPeriod>()),
            Times.Never);

        _repository.Verify(
            r => r.SaveChangesAsync(),
            Times.Never);
    }

    [Fact]
    public async Task DeleteAsync_DonemYoksa_KeyNotFoundExceptionFirlatmali()
    {
        _repository
            .Setup(r => r.GetByIdAsync(It.IsAny<int>()))
            .ReturnsAsync((EvaluationPeriod?)null);

        var act = async () => await _sut.DeleteAsync(999);

        await act
            .Should()
            .ThrowAsync<KeyNotFoundException>();
    }
}