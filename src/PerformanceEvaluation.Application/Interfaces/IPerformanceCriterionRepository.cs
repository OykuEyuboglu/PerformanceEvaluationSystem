using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using global::PerformanceEvaluation.Domain.Entities;

namespace PerformanceEvaluation.Application.Interfaces;

public interface IPerformanceCriterionRepository : IRepository<PerformanceCriterion>
{
    Task<IEnumerable<PerformanceCriterion>> GetAllWithDescriptionsAsync();
    Task<PerformanceCriterion?> GetByIdWithDescriptionsAsync(int id);
}