using PerformanceEvaluation.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PerformanceEvaluation.Application.Interfaces;

public interface IEvaluationRepository : IRepository<Evaluation>
{
    Task<Evaluation?> GetByIdWithDetailsAsync(int id);
    Task<IEnumerable<Evaluation>> GetByEmployeeIdAsync(int employeeId);
    Task<IEnumerable<Evaluation>> GetAllWithDetailsAsync();
}