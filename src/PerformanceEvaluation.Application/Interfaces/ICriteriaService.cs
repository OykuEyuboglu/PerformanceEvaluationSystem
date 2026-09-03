using global::PerformanceEvaluation.Application.DTOs.Criteria;
using PerformanceEvaluation.Application.DTOs.Criteria;

namespace PerformanceEvaluation.Application.Interfaces;

public interface ICriteriaService
{
    Task<IEnumerable<PerformanceCategoryDto>> GetAllCategoriesAsync();
    Task<PerformanceCategoryDto> CreateCategoryAsync(CreatePerformanceCategoryDto dto);
    Task<PerformanceCategoryDto> UpdateCategoryAsync(int id, UpdatePerformanceCategoryDto dto);

    Task<IEnumerable<PerformanceCriterionDto>> GetAllCriteriaAsync();
    Task<PerformanceCriterionDto> CreateCriterionAsync(CreatePerformanceCriterionDto dto);
    Task<PerformanceCriterionDto> UpdateCriterionAsync(int id, UpdatePerformanceCriterionDto dto);
}
