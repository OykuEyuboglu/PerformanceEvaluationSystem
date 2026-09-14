using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PerformanceEvaluation.Application.DTOs.Evaluation;
using PerformanceEvaluation.Application.Interfaces;
using Swashbuckle.AspNetCore.Annotations;

namespace PerformanceEvaluation.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EvaluationsController(
    IEvaluationService evaluationService) : ControllerBase
{
    [Authorize(Roles = "Evaluator")]
    [HttpPost]
    [SwaggerOperation(Summary = "Yeni performans değerlendirmesi oluştur")]
    public async Task<IActionResult> Create(
        [FromBody] CreateEvaluationDto dto)
    {
        var result = await evaluationService.CreateAsync(dto, User);

        return CreatedAtAction(
            nameof(GetById),
            new { id = result.Id },
            result);
    }

    [Authorize(Roles = "Admin")]
    [HttpGet]
    [SwaggerOperation(Summary = "Tüm performans değerlendirmelerini getir")]
    public async Task<IActionResult> GetAll()
    {
        var result = await evaluationService.GetAllAsync();
        return Ok(result);
    }

    [Authorize(Roles = "Employee")]
    [HttpGet("my")]
    [SwaggerOperation(Summary = "Çalışanın kendi performans değerlendirmelerini getir")]
    public async Task<IActionResult> GetMine()
    {
        var result = await evaluationService.GetMyEvaluationsAsync(User);
        return Ok(result);
    }

    [HttpGet("{id}")]
    [SwaggerOperation(Summary = "ID ile performans değerlendirmesini getir")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await evaluationService.GetByIdAsync(id, User);
        return Ok(result);
    }

    [Authorize(Roles = "Evaluator")]
    [HttpGet("my-period/{evaluationPeriodId}")]
    [SwaggerOperation(
    Summary = "Evaluator'ın seçilen dönemdeki değerlendirmelerini getir")]
    public async Task<IActionResult> GetMyPeriodEvaluations(
    int evaluationPeriodId)
    {
        var evaluatorId = int.Parse(
            User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("sub")?.Value
            ?? throw new UnauthorizedAccessException(
                "Kullanıcı kimliği bulunamadı."));

        var result =
            await evaluationService.GetByEvaluatorAndPeriodAsync(
                evaluatorId,
                evaluationPeriodId,
                User);

        return Ok(result);
    }

    [Authorize(Roles = "Admin")]
    [HttpPatch("{id}/approve")]
    [SwaggerOperation(Summary = "Değerlendirmeyi onayla")]
    public async Task<IActionResult> Approve(int id)
    {
        var result = await evaluationService.ApproveAsync(id);
        return Ok(result);
    }
}