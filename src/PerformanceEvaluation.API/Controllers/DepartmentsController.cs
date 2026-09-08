using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PerformanceEvaluation.Application.Interfaces;
using Swashbuckle.AspNetCore.Annotations;

namespace PerformanceEvaluation.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DepartmentsController(IDepartmentService departmentService) : ControllerBase
    {
        [HttpGet]
        [SwaggerOperation(Summary = "Tüm departmanları getir")]
        public async Task<IActionResult> GetAll()
        {
            var departments = await departmentService.GetAllAsync();
            return Ok(departments);
        }
    }
}