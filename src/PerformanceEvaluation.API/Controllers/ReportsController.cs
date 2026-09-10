using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PerformanceEvaluation.Application.Interfaces;
using Swashbuckle.AspNetCore.Annotations;

namespace PerformanceEvaluation.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportsController(
    IReportService reportService,
    IExportService exportService) : ControllerBase
{
    [Authorize(Roles = "Admin")]
    [HttpGet("department-ranking")]
    [SwaggerOperation(
     Summary = "Belirli değerlendirme dönemine göre departman performans sıralamasını getir")]
    public async Task<IActionResult> GetDepartmentRanking(
     [FromQuery] int evaluationPeriodId)
    {
        var result =
            await reportService.GetDepartmentRankingAsync(
                evaluationPeriodId);

        return Ok(result);
    }

    [Authorize(Roles = "Evaluator")]
    [HttpGet("team-ranking")]
    [SwaggerOperation(
      Summary = "Belirli değerlendirme dönemine göre takım performans sıralamasını getir")]
    public async Task<IActionResult> GetTeamRanking(
      [FromQuery] int evaluationPeriodId)
    {
        var result =
            await reportService.GetTeamRankingAsync(
                User,
                evaluationPeriodId);

        return Ok(result);
    }

    [Authorize(Roles = "Admin")]
    [HttpGet("department-ranking/export")]
    [SwaggerOperation(
        Summary = "Belirli değerlendirme dönemine göre departman performans sıralamasını Excel olarak dışa aktar")]
    public async Task<IActionResult> ExportDepartmentRanking(
        [FromQuery] int evaluationPeriodId)
    {
        var fileBytes =
            await exportService.ExportDepartmentRankingToExcelAsync(
                evaluationPeriodId);

        var fileName =
            $"Degerlendirme_Siralamasi_{evaluationPeriodId}_{DateTime.Now:yyyyMMdd}.xlsx";

        return File(
    fileBytes,
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    fileName);
    }

    [Authorize(Roles = "Evaluator")]
    [HttpGet("team-ranking/export")]
    [SwaggerOperation(Summary = "Ekip performans sıralamasını Excel olarak dışa aktar")]
    public async Task<IActionResult> ExportTeamRanking([FromQuery] int evaluationPeriodId)
    {
        var fileBytes = await exportService.ExportTeamRankingToExcelAsync(User, evaluationPeriodId);
        var fileName = $"Ekip_Siralamasi_{evaluationPeriodId}_{DateTime.Now:yyyyMMdd}.xlsx";

        return File(
            fileBytes,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            fileName);
    }
}