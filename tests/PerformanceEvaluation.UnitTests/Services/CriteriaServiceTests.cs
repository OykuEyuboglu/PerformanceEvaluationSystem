using AutoMapper;
using Moq;
using PerformanceEvaluation.Application.DTOs.Criteria;
using PerformanceEvaluation.Application.Interfaces;
using PerformanceEvaluation.Application.Services;
using PerformanceEvaluation.Domain.Entities;
using System.Linq.Expressions;

namespace PerformanceEvaluation.UnitTests.Services;

public class CriteriaServiceTests
{
    private readonly Mock<IPerformanceCategoryRepository> _categoryRepositoryMock;
    private readonly Mock<IPerformanceCriterionRepository> _criterionRepositoryMock;
    private readonly Mock<IMapper> _mapperMock;

    private readonly CriteriaService _service;

    public CriteriaServiceTests()
    {
        _categoryRepositoryMock =
            new Mock<IPerformanceCategoryRepository>();

        _criterionRepositoryMock =
            new Mock<IPerformanceCriterionRepository>();

        _mapperMock =
            new Mock<IMapper>();

        _service = new CriteriaService(
            _categoryRepositoryMock.Object,
            _criterionRepositoryMock.Object,
            _mapperMock.Object);
    }

    [Fact]
    public async Task GetAllCategoriesAsync_KategorileriGetirmeli()
    {
        var categories = new List<PerformanceCategory>
        {
            new()
            {
                Id = 1,
                Name = "Teknik Yetkinlik",
                Weight = 40,
                IsActive = true
            },
            new()
            {
                Id = 2,
                Name = "Takım Çalışması",
                Weight = 30,
                IsActive = true
            }
        };

        var categoryDtos = new List<PerformanceCategoryDto>
        {
            new()
            {
                Id = 1,
                Name = "Teknik Yetkinlik",
                Weight = 40,
                IsActive = true
            },
            new()
            {
                Id = 2,
                Name = "Takım Çalışması",
                Weight = 30,
                IsActive = true
            }
        };

        _categoryRepositoryMock
            .Setup(x => x.GetAllAsync())
            .ReturnsAsync(categories);

        _mapperMock
            .Setup(x =>
                x.Map<IEnumerable<PerformanceCategoryDto>>(categories))
            .Returns(categoryDtos);

        var result =
            await _service.GetAllCategoriesAsync();

        Assert.NotNull(result);

        var resultList = result.ToList();

        Assert.Equal(2, resultList.Count);
        Assert.Equal(
            "Teknik Yetkinlik",
            resultList[0].Name);
        Assert.Equal(
            40,
            resultList[0].Weight);

        _categoryRepositoryMock.Verify(
            x => x.GetAllAsync(),
            Times.Once);

        _mapperMock.Verify(
            x => x.Map<IEnumerable<PerformanceCategoryDto>>(categories),
            Times.Once);
    }

    [Fact]
    public async Task CreateCategoryAsync_GecerliKategoriOlusturmali()
    {
        var dto = new CreatePerformanceCategoryDto
        {
            Name = "Teknik Yetkinlik",
            Weight = 40
        };

        _categoryRepositoryMock
            .Setup(x => x.GetAllAsync())
            .ReturnsAsync(new List<PerformanceCategory>());

        _categoryRepositoryMock
            .Setup(x => x.AddAsync(
                It.IsAny<PerformanceCategory>()))
            .Returns(Task.CompletedTask);

        _categoryRepositoryMock
            .Setup(x => x.SaveChangesAsync())
            .ReturnsAsync(true);

        var expectedDto = new PerformanceCategoryDto
        {
            Id = 1,
            Name = dto.Name,
            Weight = dto.Weight,
            IsActive = true
        };

        _mapperMock
            .Setup(x =>
                x.Map<PerformanceCategoryDto>(
                    It.IsAny<PerformanceCategory>()))
            .Returns(expectedDto);

        var result =
            await _service.CreateCategoryAsync(dto);

        Assert.NotNull(result);
        Assert.Equal("Teknik Yetkinlik", result.Name);
        Assert.Equal(40, result.Weight);
        Assert.True(result.IsActive);

        _categoryRepositoryMock.Verify(
            x => x.AddAsync(
                It.Is<PerformanceCategory>(c =>
                    c.Name == "Teknik Yetkinlik" &&
                    c.Weight == 40 &&
                    c.IsActive)),
            Times.Once);

        _categoryRepositoryMock.Verify(
            x => x.SaveChangesAsync(),
            Times.Once);
    }

    [Fact]
    public async Task CreateCategoryAsync_Agirlik100denBuyukse_HataFirlatmali()
    {
        var dto = new CreatePerformanceCategoryDto
        {
            Name = "Teknik",
            Weight = 101
        };

        _categoryRepositoryMock
            .Setup(x => x.GetAllAsync())
            .ReturnsAsync(new List<PerformanceCategory>());

        var exception =
            await Assert.ThrowsAsync<InvalidOperationException>(
                () => _service.CreateCategoryAsync(dto));

        Assert.Equal(
            "Kategori ağırlığı 0 ile 100 arasında olmalıdır.",
            exception.Message);

        _categoryRepositoryMock.Verify(
            x => x.AddAsync(
                It.IsAny<PerformanceCategory>()),
            Times.Never);

        _categoryRepositoryMock.Verify(
            x => x.SaveChangesAsync(),
            Times.Never);
    }

    [Fact]
    public async Task CreateCategoryAsync_AgirlikNegatifse_HataFirlatmali()
    {
        var dto = new CreatePerformanceCategoryDto
        {
            Name = "Teknik",
            Weight = -1
        };

        _categoryRepositoryMock
            .Setup(x => x.GetAllAsync())
            .ReturnsAsync(new List<PerformanceCategory>());

        var exception =
            await Assert.ThrowsAsync<InvalidOperationException>(
                () => _service.CreateCategoryAsync(dto));

        Assert.Equal(
            "Kategori ağırlığı 0 ile 100 arasında olmalıdır.",
            exception.Message);

        _categoryRepositoryMock.Verify(
            x => x.AddAsync(
                It.IsAny<PerformanceCategory>()),
            Times.Never);
    }

    [Fact]
    public async Task CreateCategoryAsync_AktifKategoriToplami100uGecerse_HataFirlatmali()
    {
        var existingCategories = new List<PerformanceCategory>
        {
            new()
            {
                Id = 1,
                Name = "Teknik",
                Weight = 70,
                IsActive = true
            },
            new()
            {
                Id = 2,
                Name = "Takım",
                Weight = 20,
                IsActive = true
            }
        };

        var dto = new CreatePerformanceCategoryDto
        {
            Name = "İletişim",
            Weight = 20
        };

        _categoryRepositoryMock
            .Setup(x => x.GetAllAsync())
            .ReturnsAsync(existingCategories);

        var exception =
            await Assert.ThrowsAsync<InvalidOperationException>(
                () => _service.CreateCategoryAsync(dto));

        Assert.Equal(
            "Aktif kategori ağırlıklarının toplamı 100'ü geçemez.",
            exception.Message);

        _categoryRepositoryMock.Verify(
            x => x.AddAsync(
                It.IsAny<PerformanceCategory>()),
            Times.Never);
    }

    [Fact]
    public async Task CreateCategoryAsync_PasifKategorileriToplamaDahilEtmemeli()
    {
        var existingCategories = new List<PerformanceCategory>
        {
            new()
            {
                Id = 1,
                Name = "Teknik",
                Weight = 70,
                IsActive = true
            },
            new()
            {
                Id = 2,
                Name = "Pasif Kategori",
                Weight = 100,
                IsActive = false
            }
        };

        var dto = new CreatePerformanceCategoryDto
        {
            Name = "İletişim",
            Weight = 30
        };

        _categoryRepositoryMock
            .Setup(x => x.GetAllAsync())
            .ReturnsAsync(existingCategories);

        _categoryRepositoryMock
            .Setup(x => x.AddAsync(
                It.IsAny<PerformanceCategory>()))
            .Returns(Task.CompletedTask);

        _categoryRepositoryMock
            .Setup(x => x.SaveChangesAsync())
            .ReturnsAsync(true);

        _mapperMock
            .Setup(x =>
                x.Map<PerformanceCategoryDto>(
                    It.IsAny<PerformanceCategory>()))
            .Returns(new PerformanceCategoryDto
            {
                Id = 3,
                Name = dto.Name,
                Weight = dto.Weight,
                IsActive = true
            });

        var result =
            await _service.CreateCategoryAsync(dto);

        Assert.NotNull(result);
        Assert.Equal(30, result.Weight);

        _categoryRepositoryMock.Verify(
            x => x.AddAsync(
                It.Is<PerformanceCategory>(c =>
                    c.Name == "İletişim" &&
                    c.Weight == 30)),
            Times.Once);
    }


    [Fact]
    public async Task UpdateCategoryAsync_KategoriBulunamazsa_KeyNotFoundExceptionFirlatmali()
    {
        _categoryRepositoryMock
            .Setup(x => x.GetByIdAsync(99))
            .ReturnsAsync((PerformanceCategory?)null);

        var dto = new UpdatePerformanceCategoryDto
        {
            Name = "Yeni",
            Weight = 40,
            IsActive = true
        };

        var exception =
            await Assert.ThrowsAsync<KeyNotFoundException>(
                () => _service.UpdateCategoryAsync(99, dto));

        Assert.Equal(
            "Ana başlık bulunamadı.",
            exception.Message);
    }

    [Fact]
    public async Task UpdateCategoryAsync_AktifKategori_Guncellenmeli()
    {
        var category = new PerformanceCategory
        {
            Id = 1,
            Name = "Eski",
            Weight = 30,
            IsActive = true
        };

        var dto = new UpdatePerformanceCategoryDto
        {
            Name = "Yeni",
            Weight = 50,
            IsActive = true
        };

        _categoryRepositoryMock
            .Setup(x => x.GetByIdAsync(1))
            .ReturnsAsync(category);

        _categoryRepositoryMock
            .Setup(x => x.GetAllAsync())
            .ReturnsAsync(new List<PerformanceCategory>
            {
                category
            });

        _categoryRepositoryMock
            .Setup(x => x.SaveChangesAsync())
            .ReturnsAsync(true);

        _mapperMock
            .Setup(x =>
                x.Map<PerformanceCategoryDto>(category))
            .Returns(new PerformanceCategoryDto
            {
                Id = 1,
                Name = "Yeni",
                Weight = 50,
                IsActive = true
            });

        var result =
            await _service.UpdateCategoryAsync(1, dto);

        Assert.Equal("Yeni", category.Name);
        Assert.Equal(50, category.Weight);
        Assert.True(category.IsActive);

        Assert.Equal("Yeni", result.Name);

        _categoryRepositoryMock.Verify(
            x => x.Update(category),
            Times.Once);

        _categoryRepositoryMock.Verify(
            x => x.SaveChangesAsync(),
            Times.Once);
    }

    [Fact]
    public async Task UpdateCategoryAsync_PasifYapilirken_AgirlikKontroluYapilmamali()
    {
        var category = new PerformanceCategory
        {
            Id = 1,
            Name = "Teknik",
            Weight = 40,
            IsActive = true
        };

        var dto = new UpdatePerformanceCategoryDto
        {
            Name = "Teknik",
            Weight = 150,
            IsActive = false
        };

        _categoryRepositoryMock
            .Setup(x => x.GetByIdAsync(1))
            .ReturnsAsync(category);

        _categoryRepositoryMock
            .Setup(x => x.SaveChangesAsync())
            .ReturnsAsync(true);

        _mapperMock
            .Setup(x =>
                x.Map<PerformanceCategoryDto>(category))
            .Returns(new PerformanceCategoryDto
            {
                Id = 1,
                Name = "Teknik",
                Weight = 150,
                IsActive = false
            });

        var result =
            await _service.UpdateCategoryAsync(1, dto);

        Assert.Equal(150, category.Weight);
        Assert.False(category.IsActive);
        Assert.False(result.IsActive);

        _categoryRepositoryMock.Verify(
            x => x.GetAllAsync(),
            Times.Never);

        _categoryRepositoryMock.Verify(
            x => x.Update(category),
            Times.Once);

        _categoryRepositoryMock.Verify(
            x => x.SaveChangesAsync(),
            Times.Once);
    }


    [Fact]
    public async Task GetAllCriteriaAsync_KriterleriGetirmeli()
    {
        var criteria = new List<PerformanceCriterion>
        {
            new()
            {
                Id = 1,
                Name = "Kod Kalitesi",
                PerformanceCategoryId = 1,
                IsActive = true
            },
            new()
            {
                Id = 2,
                Name = "Test Kalitesi",
                PerformanceCategoryId = 1,
                IsActive = true
            }
        };

        var criterionDtos =
            new List<PerformanceCriterionDto>
            {
                new()
                {
                    Id = 1,
                    Name = "Kod Kalitesi",
                    PerformanceCategoryId = 1
                },
                new()
                {
                    Id = 2,
                    Name = "Test Kalitesi",
                    PerformanceCategoryId = 1
                }
            };

        _criterionRepositoryMock
            .Setup(x => x.GetAllWithDescriptionsAsync())
            .ReturnsAsync(criteria);

        _mapperMock
            .Setup(x =>
                x.Map<IEnumerable<PerformanceCriterionDto>>(criteria))
            .Returns(criterionDtos);

        var result =
            await _service.GetAllCriteriaAsync();

        var resultList = result.ToList();

        Assert.Equal(2, resultList.Count);
        Assert.Equal(
            "Kod Kalitesi",
            resultList[0].Name);

        _criterionRepositoryMock.Verify(
            x => x.GetAllWithDescriptionsAsync(),
            Times.Once);
    }

    [Fact]
    public async Task CreateCriterionAsync_GecerliKriterOlusturmali()
    {
        var dto = new CreatePerformanceCriterionDto
        {
            Name = "Kod Kalitesi",
            PerformanceCategoryId = 1,
            JobPositionDescriptions = new List<CriterionJobPositionInputDto>
            {
                new()
                {
                    JobPositionId = 10,
                    Description = "Temiz ve sürdürülebilir kod yazar."
                }
            }
        };

        var category = new PerformanceCategory
        {
            Id = 1,
            Name = "Teknik Yetkinlik",
            Weight = 50,
            IsActive = true
        };

        var createdCriterion = new PerformanceCriterion
        {
            Id = 100,
            Name = "Kod Kalitesi",
            PerformanceCategoryId = 1,
            IsActive = true
        };

        var expectedDto = new PerformanceCriterionDto
        {
            Id = 100,
            Name = "Kod Kalitesi",
            PerformanceCategoryId = 1,
            IsActive = true
        };

        _categoryRepositoryMock
            .Setup(x => x.GetByIdAsync(1))
            .ReturnsAsync(category);

        _criterionRepositoryMock
            .Setup(x => x.AddAsync(
                It.IsAny<PerformanceCriterion>()))
            .Callback<PerformanceCriterion>(criterion =>
            {
                criterion.Id = 100;
            })
            .Returns(Task.CompletedTask);

        _criterionRepositoryMock
            .Setup(x => x.SaveChangesAsync())
            .ReturnsAsync(true);

        _criterionRepositoryMock
            .Setup(x => x.GetByIdWithDescriptionsAsync(100))
            .ReturnsAsync(createdCriterion);

        _mapperMock
            .Setup(x =>
                x.Map<PerformanceCriterionDto>(createdCriterion))
            .Returns(expectedDto);

        var result =
            await _service.CreateCriterionAsync(dto);

        Assert.NotNull(result);
        Assert.Equal(100, result.Id);
        Assert.Equal("Kod Kalitesi", result.Name);

        _criterionRepositoryMock.Verify(
            x => x.AddAsync(
                It.Is<PerformanceCriterion>(criterion =>
                    criterion.Name == "Kod Kalitesi" &&
                    criterion.PerformanceCategoryId == 1 &&
                    criterion.IsActive &&
                    criterion.JobPositionDescriptions.Count == 1 &&
                    criterion.JobPositionDescriptions.First().JobPositionId == 10 &&
                    criterion.JobPositionDescriptions.First().Description ==
                        "Temiz ve sürdürülebilir kod yazar.")),
            Times.Once);

        _criterionRepositoryMock.Verify(
            x => x.SaveChangesAsync(),
            Times.Once);

        _criterionRepositoryMock.Verify(
            x => x.GetByIdWithDescriptionsAsync(100),
            Times.Once);
    }

    [Fact]
    public async Task CreateCriterionAsync_KategoriBulunamazsa_KeyNotFoundExceptionFirlatmali()
    {
        var dto = new CreatePerformanceCriterionDto
        {
            Name = "Kod Kalitesi",
            PerformanceCategoryId = 99
        };

        _categoryRepositoryMock
            .Setup(x => x.GetByIdAsync(99))
            .ReturnsAsync((PerformanceCategory?)null);

        var exception =
            await Assert.ThrowsAsync<KeyNotFoundException>(
                () => _service.CreateCriterionAsync(dto));

 
        Assert.Equal(
            "Ana başlık bulunamadı.",
            exception.Message);

        _criterionRepositoryMock.Verify(
            x => x.AddAsync(
                It.IsAny<PerformanceCriterion>()),
            Times.Never);
    }

    [Fact]
    public async Task UpdateCriterionAsync_KriterBulunamazsa_KeyNotFoundExceptionFirlatmali()
    {
        _criterionRepositoryMock
            .Setup(x => x.GetByIdWithDescriptionsAsync(99))
            .ReturnsAsync((PerformanceCriterion?)null);

        var dto = new UpdatePerformanceCriterionDto
        {
            Name = "Yeni Kriter",
            IsActive = true
        };

        var exception =
            await Assert.ThrowsAsync<KeyNotFoundException>(
                () => _service.UpdateCriterionAsync(99, dto));

        Assert.Equal(
            "Kriter bulunamadı.",
            exception.Message);
    }

    [Fact]
    public async Task UpdateCriterionAsync_KriterVeAciklamalarGuncellenmeli()
    {
        var criterion = new PerformanceCriterion
        {
            Id = 1,
            Name = "Eski Kriter",
            IsActive = true,
            PerformanceCategoryId = 1,
            JobPositionDescriptions =
                new List<CriterionJobPosition>
                {
                    new()
                    {
                        JobPositionId = 5,
                        Description = "Eski açıklama"
                    }
                }
        };

        var dto = new UpdatePerformanceCriterionDto
        {
            Name = "Yeni Kriter",
            IsActive = false,
            JobPositionDescriptions =
                new List<CriterionJobPositionInputDto>
                {
                    new()
                    {
                        JobPositionId = 10,
                        Description = "Yeni açıklama"
                    },
                    new()
                    {
                        JobPositionId = 20,
                        Description = "İkinci açıklama"
                    }
                }
        };

        _criterionRepositoryMock
            .Setup(x => x.GetByIdWithDescriptionsAsync(1))
            .ReturnsAsync(criterion);

        _criterionRepositoryMock
            .Setup(x => x.SaveChangesAsync())
            .ReturnsAsync(true);

        _criterionRepositoryMock
            .Setup(x => x.GetByIdWithDescriptionsAsync(1))
            .ReturnsAsync(criterion);

        _mapperMock
            .Setup(x =>
                x.Map<PerformanceCriterionDto>(criterion))
            .Returns(new PerformanceCriterionDto
            {
                Id = 1,
                Name = "Yeni Kriter",
                IsActive = false,
                PerformanceCategoryId = 1
            });

        var result =
            await _service.UpdateCriterionAsync(1, dto);

        Assert.Equal(
            "Yeni Kriter",
            criterion.Name);

        Assert.False(criterion.IsActive);

        Assert.Equal(
            2,
            criterion.JobPositionDescriptions.Count);

        Assert.Contains(
            criterion.JobPositionDescriptions,
            x =>
                x.JobPositionId == 10 &&
                x.Description == "Yeni açıklama");

        Assert.Contains(
            criterion.JobPositionDescriptions,
            x =>
                x.JobPositionId == 20 &&
                x.Description == "İkinci açıklama");

        _criterionRepositoryMock.Verify(
            x => x.Update(criterion),
            Times.Once);

        _criterionRepositoryMock.Verify(
            x => x.SaveChangesAsync(),
            Times.Once);

        Assert.Equal(
            "Yeni Kriter",
            result.Name);
    }

    [Fact]
    public async Task DeleteCategoryAsync_KategoriSilinebiliyorsa_Silmeli()
    {
        var category = new PerformanceCategory
        {
            Id = 1,
            Name = "Teknik",
            Weight = 50,
            IsActive = true
        };

        _categoryRepositoryMock
            .Setup(x => x.GetByIdAsync(1))
            .ReturnsAsync(category);

        _criterionRepositoryMock
            .Setup(x => x.FindAsync(
                It.IsAny<Expression<Func<PerformanceCriterion, bool>>>()))
            .ReturnsAsync(Array.Empty<PerformanceCriterion>());

        _categoryRepositoryMock
            .Setup(x => x.SaveChangesAsync())
            .ReturnsAsync(true);

        await _service.DeleteCategoryAsync(1);

        _categoryRepositoryMock.Verify(
            x => x.Remove(category),
            Times.Once);

        _categoryRepositoryMock.Verify(
            x => x.SaveChangesAsync(),
            Times.Once);
    }

    [Fact]
    public async Task DeleteCategoryAsync_KategoriBulunamazsa_KeyNotFoundExceptionFirlatmali()
    {
        _categoryRepositoryMock
            .Setup(x => x.GetByIdAsync(99))
            .ReturnsAsync((PerformanceCategory?)null);

        var exception =
            await Assert.ThrowsAsync<KeyNotFoundException>(
                () => _service.DeleteCategoryAsync(99));

        Assert.Equal(
            "Ana başlık bulunamadı.",
            exception.Message);

        _categoryRepositoryMock.Verify(
            x => x.Remove(It.IsAny<PerformanceCategory>()),
            Times.Never);
    }

    [Fact]
    public async Task DeleteCategoryAsync_BagliKriterVarsa_Silinmemeli()
    {
        var category = new PerformanceCategory
        {
            Id = 1,
            Name = "Teknik",
            Weight = 50,
            IsActive = true
        };

        var criterion = new PerformanceCriterion
        {
            Id = 10,
            Name = "Kod Kalitesi",
            PerformanceCategoryId = 1
        };

        _categoryRepositoryMock
            .Setup(x => x.GetByIdAsync(1))
            .ReturnsAsync(category);

        _criterionRepositoryMock
            .Setup(x => x.FindAsync(
                It.IsAny<Expression<Func<PerformanceCriterion, bool>>>()))
            .ReturnsAsync(new[] { criterion });

        var exception =
            await Assert.ThrowsAsync<InvalidOperationException>(
                () => _service.DeleteCategoryAsync(1));

        Assert.Equal(
            "Bu ana başlığa bağlı kriterler bulunduğu için silinemez.",
            exception.Message);

        _categoryRepositoryMock.Verify(
            x => x.Remove(It.IsAny<PerformanceCategory>()),
            Times.Never);

        _categoryRepositoryMock.Verify(
            x => x.SaveChangesAsync(),
            Times.Never);
    }

    [Fact]
    public async Task DeleteCriterionAsync_KullanilmamisKriteriSilmeli()
    {
        var criterion = new PerformanceCriterion
        {
            Id = 1,
            Name = "Kod Kalitesi",
            PerformanceCategoryId = 1
        };

        _criterionRepositoryMock
            .Setup(x => x.GetByIdWithDescriptionsAsync(1))
            .ReturnsAsync(criterion);

        _criterionRepositoryMock
            .Setup(x => x.HasEvaluationDetailsAsync(1))
            .ReturnsAsync(false);

        _criterionRepositoryMock
            .Setup(x => x.SaveChangesAsync())
            .ReturnsAsync(true);

        await _service.DeleteCriterionAsync(1);

        _criterionRepositoryMock.Verify(
            x => x.Remove(criterion),
            Times.Once);

        _criterionRepositoryMock.Verify(
            x => x.SaveChangesAsync(),
            Times.Once);
    }

    [Fact]
    public async Task DeleteCriterionAsync_KriterBulunamazsa_KeyNotFoundExceptionFirlatmali()
    {
        _criterionRepositoryMock
            .Setup(x => x.GetByIdWithDescriptionsAsync(99))
            .ReturnsAsync((PerformanceCriterion?)null);

        var exception =
            await Assert.ThrowsAsync<KeyNotFoundException>(
                () => _service.DeleteCriterionAsync(99));

        Assert.Equal(
            "Kriter bulunamadı.",
            exception.Message);

        _criterionRepositoryMock.Verify(
            x => x.Remove(It.IsAny<PerformanceCriterion>()),
            Times.Never);
    }

    [Fact]
    public async Task DeleteCriterionAsync_DegerlendirmedeKullanilmissa_Silinmemeli()
    {
        var criterion = new PerformanceCriterion
        {
            Id = 1,
            Name = "Kod Kalitesi",
            PerformanceCategoryId = 1
        };

        _criterionRepositoryMock
            .Setup(x => x.GetByIdWithDescriptionsAsync(1))
            .ReturnsAsync(criterion);

        _criterionRepositoryMock
            .Setup(x => x.HasEvaluationDetailsAsync(1))
            .ReturnsAsync(true);

        var exception =
            await Assert.ThrowsAsync<InvalidOperationException>(
                () => _service.DeleteCriterionAsync(1));

        Assert.Equal(
            "Değerlendirmelerde kullanılmış kriter silinemez.",
            exception.Message);

        _criterionRepositoryMock.Verify(
            x => x.Remove(It.IsAny<PerformanceCriterion>()),
            Times.Never);

        _criterionRepositoryMock.Verify(
            x => x.SaveChangesAsync(),
            Times.Never);
    }
}