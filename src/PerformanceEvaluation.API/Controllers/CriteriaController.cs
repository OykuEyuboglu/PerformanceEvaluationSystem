using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PerformanceEvaluation.Application.DTOs.Criteria;
using PerformanceEvaluation.Application.Interfaces;
using Swashbuckle.AspNetCore.Annotations;

namespace PerformanceEvaluation.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class CriteriaController(ICriteriaService criteriaService) : ControllerBase
{
    [HttpGet("categories")]
    [SwaggerOperation(Summary = "Tüm performans kategorilerini getir")]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await criteriaService.GetAllCategoriesAsync();
        return Ok(categories);
    }

    [HttpPost("categories")]
    [SwaggerOperation(Summary = "Yeni performans kategorisi oluştur")]
    public async Task<IActionResult> CreateCategory([FromBody] CreatePerformanceCategoryDto dto)
    {
        var category = await criteriaService.CreateCategoryAsync(dto);
        return CreatedAtAction(nameof(GetCategories), new { }, category);
    }

    [HttpPut("categories/{id}")]
    [SwaggerOperation(Summary = "Performans kategorisini güncelle")]
    public async Task<IActionResult> UpdateCategory(
        int id,
        [FromBody] UpdatePerformanceCategoryDto dto)
    {
        var category = await criteriaService.UpdateCategoryAsync(id, dto);
        return Ok(category);
    }

    [HttpGet("criteria")]
    [SwaggerOperation(Summary = "Tüm performans kriterlerini getir")]
    public async Task<IActionResult> GetCriteria()
    {
        var criteria = await criteriaService.GetAllCriteriaAsync();
        return Ok(criteria);
    }

    [HttpPost("criteria")]
    [SwaggerOperation(Summary = "Yeni performans kriteri oluştur")]
    public async Task<IActionResult> CreateCriterion(
        [FromBody] CreatePerformanceCriterionDto dto)
    {
        var criterion = await criteriaService.CreateCriterionAsync(dto);
        return CreatedAtAction(nameof(GetCriteria), new { }, criterion);
    }

    [HttpPut("criteria/{id}")]
    [SwaggerOperation(Summary = "Performans kriterini güncelle")]
    public async Task<IActionResult> UpdateCriterion(
        int id,
        [FromBody] UpdatePerformanceCriterionDto dto)
    {
        var criterion = await criteriaService.UpdateCriterionAsync(id, dto);
        return Ok(criterion);
    }
}