using PerformanceEvaluation.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PerformanceEvaluation.Application.DTOs.User
{
    public class UpdatePatchUserDto
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public UserRole? Role { get; set; }
        public int? DepartmentId { get; set; }
        public int? JobPositionId { get; set; }
        public bool? IsActive { get; set; }
    }

}
