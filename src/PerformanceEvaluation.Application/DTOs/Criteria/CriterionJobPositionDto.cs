using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PerformanceEvaluation.Application.DTOs.Criteria
{
    public class CriterionJobPositionDto
    {
        public int JobPositionId { get; set; }

        public string JobPositionName { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;

    }
}
