using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PerformanceEvaluation.Application.DTOs.Criteria
{
    public class CriterionJobPositionInputDto
    {
        public int JobPositionId { get; set; }

        public string Description { get; set; } = string.Empty;

    }
}
