using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PerformanceEvaluation.Application.DTOs.Criteria
{
    public class CreatePerformanceCategoryDto

    {

        public string Name { get; set; } = string.Empty;

        public decimal Weight { get; set; }

    }

}
