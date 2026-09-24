using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PerformanceEvaluation.Application.DTOs.User
{
    public class ChangePasswordDto
    {
        public string NewPassword { get; set; } = string.Empty;
    }
}
