using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PerformanceEvaluation.Application.DTOs.Criteria
{
    public class UpdatePerformanceCriterionDto
    {
        public string Name { get; set; } = string.Empty;

        public bool IsActive { get; set; }

        public List<CriterionJobPositionInputDto> JobPositionDescriptions { get; set; } = new();

    }
}
