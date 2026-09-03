using PerformanceEvaluation.Application.DTOs.Criteria;
using PerformanceEvaluation.Application.Interfaces;
using PerformanceEvaluation.Domain.Entities;
using AutoMapper;

namespace PerformanceEvaluation.Application.Services;

public class CriteriaService : ICriteriaService
{
    private readonly IPerformanceCategoryRepository _categoryRepository;
    private readonly IPerformanceCriterionRepository _criterionRepository;
    private readonly IMapper _mapper;

    public CriteriaService(
        IPerformanceCategoryRepository categoryRepository,
        IPerformanceCriterionRepository criterionRepository,
        IMapper mapper)
    {
        _categoryRepository = categoryRepository;
        _criterionRepository = criterionRepository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<PerformanceCategoryDto>> GetAllCategoriesAsync()
    {
        var categories = await _categoryRepository.GetAllAsync();
        return _mapper.Map<IEnumerable<PerformanceCategoryDto>>(categories);
    }

    public async Task<PerformanceCategoryDto> CreateCategoryAsync(CreatePerformanceCategoryDto dto)
    {
        var category = new PerformanceCategory
        {
            Name = dto.Name,
            Weight = dto.Weight,
            IsActive = true
        };

        await _categoryRepository.AddAsync(category);
        await _categoryRepository.SaveChangesAsync();

        return _mapper.Map<PerformanceCategoryDto>(category);
    }

    public async Task<PerformanceCategoryDto> UpdateCategoryAsync(int id, UpdatePerformanceCategoryDto dto)
    {
        var category = await _categoryRepository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Ana başlık bulunamadı.");

        category.Name = dto.Name;
        category.Weight = dto.Weight;
        category.IsActive = dto.IsActive;

        _categoryRepository.Update(category);
        await _categoryRepository.SaveChangesAsync();

        return _mapper.Map<PerformanceCategoryDto>(category);
    }

    public async Task<IEnumerable<PerformanceCriterionDto>> GetAllCriteriaAsync()
    {
        var criteria = await _criterionRepository.GetAllWithDescriptionsAsync();
        return _mapper.Map<IEnumerable<PerformanceCriterionDto>>(criteria);
    }

    public async Task<PerformanceCriterionDto> CreateCriterionAsync(CreatePerformanceCriterionDto dto)
    {
        var categoryExists = await _categoryRepository.GetByIdAsync(dto.PerformanceCategoryId)
            ?? throw new KeyNotFoundException("Ana başlık bulunamadı.");

        var criterion = new PerformanceCriterion
        {
            Name = dto.Name,
            PerformanceCategoryId = dto.PerformanceCategoryId,
            IsActive = true,
            JobPositionDescriptions = dto.JobPositionDescriptions.Select(jd => new CriterionJobPosition
            {
                JobPositionId = jd.JobPositionId,
                Description = jd.Description
            }).ToList()
        };

        await _criterionRepository.AddAsync(criterion);
        await _criterionRepository.SaveChangesAsync();

        var created = await _criterionRepository.GetByIdWithDescriptionsAsync(criterion.Id);
        return _mapper.Map<PerformanceCriterionDto>(created);
    }

    public async Task<PerformanceCriterionDto> UpdateCriterionAsync(int id, UpdatePerformanceCriterionDto dto)
    {
        var criterion = await _criterionRepository.GetByIdWithDescriptionsAsync(id)
            ?? throw new KeyNotFoundException("Kriter bulunamadı.");

        criterion.Name = dto.Name;
        criterion.IsActive = dto.IsActive;

        criterion.JobPositionDescriptions.Clear();
        foreach (var jd in dto.JobPositionDescriptions)
        {
            criterion.JobPositionDescriptions.Add(new CriterionJobPosition
            {
                JobPositionId = jd.JobPositionId,
                Description = jd.Description
            });
        }

        _criterionRepository.Update(criterion);
        await _criterionRepository.SaveChangesAsync();

        var updated = await _criterionRepository.GetByIdWithDescriptionsAsync(id);
        return _mapper.Map<PerformanceCriterionDto>(updated);
    }
}