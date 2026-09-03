using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PerformanceEvaluation.Application.DTOs.EvaluatorEmployee;
using PerformanceEvaluation.Application.Interfaces;
using Swashbuckle.AspNetCore.Annotations;

namespace PerformanceEvaluation.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class EvaluatorEmployeesController(
    IEvaluatorEmployeeService evaluatorEmployeeService) : ControllerBase
{
    [Authorize(Roles = "Admin")]
    [HttpPost]
    [SwaggerOperation(
        Summary = "Evaluator'a çalışan atar",
        Description = "Admin tarafından bir çalışan Evaluator'a atanır.")]
    public async Task<IActionResult> Assign(
        [FromBody] AssignEvaluatorEmployeeDto dto)
    {
        var result = await evaluatorEmployeeService.AssignAsync(dto);

        return Ok(result);
    }

    [HttpGet("{evaluatorId}")]
    [SwaggerOperation(
        Summary = "Evaluator'ın ekibindeki çalışanları getir",
        Description = "Admin tüm Evaluator'ların ekiplerini, Evaluator ise yalnızca kendi ekibini görüntüleyebilir.")]
    public async Task<IActionResult> GetByEvaluatorId(
        int evaluatorId)
    {
        var result =
            await evaluatorEmployeeService.GetByEvaluatorIdAsync(
                evaluatorId,
                User);

        return Ok(result);
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{evaluatorId}/{employeeId}")]
    [SwaggerOperation(
        Summary = "Evaluator-Employee atamasını kaldır",
        Description = "Admin tarafından Evaluator ile çalışan arasındaki atama kaldırılır.")]
    public async Task<IActionResult> Remove(
        int evaluatorId,
        int employeeId)
    {
        await evaluatorEmployeeService.RemoveAsync(
            evaluatorId,
            employeeId);

        return NoContent();
    }
}