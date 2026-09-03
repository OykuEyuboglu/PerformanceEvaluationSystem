using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PerformanceEvaluation.Application.DTOs.Criteria
{

    public class PerformanceCriterionDto
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public bool IsActive { get; set; }

        public int PerformanceCategoryId { get; set; }

        public string PerformanceCategoryName { get; set; } = string.Empty;

        public List<CriterionJobPositionDto> JobPositionDescriptions { get; set; } = new();

    }
}
