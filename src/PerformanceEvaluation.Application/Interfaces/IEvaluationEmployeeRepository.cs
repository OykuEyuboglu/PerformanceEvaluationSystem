using PerformanceEvaluation.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PerformanceEvaluation.Application.Interfaces;

public interface IEvaluatorEmployeeRepository : IRepository<EvaluatorEmployee>
{
    Task<IEnumerable<EvaluatorEmployee>> GetByEvaluatorIdAsync(int evaluatorId);
    Task<bool> ExistsAsync(int evaluatorId, int employeeId);
}