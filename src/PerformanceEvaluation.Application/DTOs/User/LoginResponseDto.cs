using DocumentFormat.OpenXml.Office2016.Drawing.ChartDrawing;
using PerformanceEvaluation.Application.DTOs.Department;
using PerformanceEvaluation.Application.DTOs.JobPosition;
using PerformanceEvaluation.Application.Interfaces;
using PerformanceEvaluation.Application.Services;
using PerformanceEvaluation.Domain.Entities;
using System.Runtime.InteropServices;

namespace PerformanceEvaluation.Application.DTOs.User
{
    public class LoginResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
        public UserDto User { get; set; } = null!;
    }
}