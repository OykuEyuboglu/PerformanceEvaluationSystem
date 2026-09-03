using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PerformanceEvaluation.Application.DTOs.Evaluation
{
    public class EvaluationDetailInputDto
    {
        public int PerformanceCriterionId { get; set; }
        public int Score { get; set; } // 1-5
    }
}
