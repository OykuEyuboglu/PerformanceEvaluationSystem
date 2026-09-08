using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PerformanceEvaluation.Application.Interfaces;
using Swashbuckle.AspNetCore.Annotations;

namespace PerformanceEvaluation.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class JobPositionsController(IJobPositionService jobPositionService) : ControllerBase
    {
        [HttpGet]
        [SwaggerOperation(Summary = "Tüm iş pozisyonlarını getir")]
        public async Task<IActionResult> GetAll()
        {
            var positions = await jobPositionService.GetAllAsync();
            return Ok(positions);
        }
    }
}