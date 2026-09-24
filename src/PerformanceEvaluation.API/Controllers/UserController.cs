using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PerformanceEvaluation.Application.DTOs.User;
using PerformanceEvaluation.Application.Interfaces;
using Swashbuckle.AspNetCore.Annotations;

namespace PerformanceEvaluation.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class UserController(IUserService userService) : ControllerBase
{
    [HttpGet]
    [SwaggerOperation(Summary = "Tüm kullanıcıları getir")]
    public async Task<IActionResult> GetAll()
    {
        var users = await userService.GetAllAsync();
        return Ok(users);
    }

    [HttpGet("{id}")]
    [SwaggerOperation(Summary = "ID ile kullanıcı getir")]
    public async Task<IActionResult> GetById(int id)
    {
        var user = await userService.GetByIdAsync(id);
        return Ok(user);
    }

    [HttpPost]
    [SwaggerOperation(Summary = "Yeni kullanıcı oluştur")]
    public async Task<IActionResult> Create([FromBody] CreateUserDto dto)
    {
        var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);
        var user = await userService.CreateAsync(dto, userId);
        return CreatedAtAction(nameof(GetById), new { id = user.Id }, user);
    }

    [HttpPut("{id}")]
    [SwaggerOperation(Summary = "Kullanıcı bilgilerini tamamen güncelle")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateUserDto dto)
    {
        var user = await userService.UpdateAsync(id, dto);
        return Ok(user);
    }

    [HttpPatch("{id}")]
    [SwaggerOperation(Summary = "Kullanıcı bilgilerini kısmi olarak güncelle")]
    public async Task<IActionResult> Patch(int id, [FromBody] UpdatePatchUserDto dto)
    {
        var user = await userService.PatchAsync(id, dto);
        return Ok(user);
    }

    [HttpDelete("{id}")]
    [SwaggerOperation(
    Summary = "Kullanıcıyı sil",
    Description = "Admin tarafından belirtilen kullanıcıyı sistemden siler.")]
    public async Task<IActionResult> Delete(int id)
    {
        await userService.DeleteAsync(id);

        return NoContent();
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id}/password")]
    public async Task<IActionResult> ChangePassword(
    int id,
    [FromBody] ChangePasswordDto dto)
    {
        await userService.ChangePasswordAsync(id, dto.NewPassword);

        return Ok(new
        {
            message = "Şifre başarıyla güncellendi."
        });
    }
}