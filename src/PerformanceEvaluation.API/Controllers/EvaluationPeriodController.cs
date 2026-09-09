using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PerformanceEvaluation.Application.DTOs.EvaluatorEmployee;
using PerformanceEvaluation.Application.Interfaces;
using Swashbuckle.AspNetCore.Annotations;

namespace PerformanceEvaluation.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EvaluationPeriodsController(
    IEvaluationPeriodService evaluationPeriodService) : ControllerBase
{
    [Authorize(Roles = "Admin,Evaluator")]
    [HttpGet]
    [SwaggerOperation(
        Summary = "Tüm değerlendirme dönemlerini getir",
        Description = "Sistemde tanımlı tüm performans değerlendirme dönemlerini listeler.")]
    public async Task<IActionResult> GetAll()
    {
        var result = await evaluationPeriodService.GetAllAsync();

        return Ok(result);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    [SwaggerOperation(
        Summary = "Yeni değerlendirme dönemi oluştur",
        Description = "Admin tarafından yeni bir performans değerlendirme dönemi oluşturur.")]
    public async Task<IActionResult> Create(
        [FromBody] CreateEvaluationPeriodDto dto)
    {
        var result = await evaluationPeriodService.CreateAsync(dto);

        return CreatedAtAction(
            nameof(GetAll),
            new { id = result.Id },
            result);
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    [SwaggerOperation(Summary = "Değerlendirme dönemini güncelle")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateEvaluationPeriodDto dto)
    {
        var result = await evaluationPeriodService.UpdateAsync(id, dto);
        return Ok(result);
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    [SwaggerOperation(Summary = "Değerlendirme dönemini sil")]
    public async Task<IActionResult> Delete(int id)
    {
        await evaluationPeriodService.DeleteAsync(id);
        return NoContent();
    }
}