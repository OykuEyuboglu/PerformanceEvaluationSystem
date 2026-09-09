using Microsoft.EntityFrameworkCore;
using PerformanceEvaluation.Application.Interfaces;
using PerformanceEvaluation.Domain.Entities;
using PerformanceEvaluation.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PerformanceEvaluation.Infrastructure.Repositories
{
    public class EvaluationRepository : Repository<Evaluation>, IEvaluationRepository
    {
        public EvaluationRepository(AppDbContext context) : base(context) { }

        public async Task<Evaluation?> GetByIdWithDetailsAsync(int id) =>
            await _dbSet
                .Include(e => e.Employee)
                .Include(e => e.Evaluator)
                .Include(e => e.EvaluationPeriod)
                .Include(e => e.Details)
                    .ThenInclude(d => d.PerformanceCriterion)
                        .ThenInclude(c => c.PerformanceCategory)
                .FirstOrDefaultAsync(e => e.Id == id);

        public async Task<IEnumerable<Evaluation>> GetByEmployeeIdAsync(
    int employeeId) =>
    await _dbSet
        .Include(e => e.Employee)
            .ThenInclude(u => u.Department)
        .Include(e => e.Employee)
            .ThenInclude(u => u.JobPosition)
        .Include(e => e.Evaluator)
        .Include(e => e.EvaluationPeriod)
        .Include(e => e.Details)
            .ThenInclude(d => d.PerformanceCriterion)
                .ThenInclude(c => c.PerformanceCategory)
        .Where(e => e.EmployeeId == employeeId)
        .ToListAsync();

        public async Task<IEnumerable<Evaluation>> GetAllWithDetailsAsync()
        {
            return await _dbSet
                .Include(e => e.Employee)
                    .ThenInclude(u => u.Department)
                .Include(e => e.Employee)
                    .ThenInclude(u => u.JobPosition)
                .Include(e => e.Evaluator)
                    .ThenInclude(u => u.Department)
                .Include(e => e.EvaluationPeriod)
                .Include(e => e.Details)
                    .ThenInclude(d => d.PerformanceCriterion)
                        .ThenInclude(c => c.PerformanceCategory)
                .ToListAsync();
        }

        public async Task<bool> ExistsByEvaluatorEmployeePeriodAsync(int evaluatorId, int employeeId, int evaluationPeriodId)
        {
            return await _dbSet.AnyAsync(e =>
                e.EvaluatorId == evaluatorId &&
                e.EmployeeId == employeeId &&
                e.EvaluationPeriodId == evaluationPeriodId);
        }

        public async Task<IEnumerable<Evaluation>> GetByEvaluatorAndPeriodAsync(
            int evaluatorId,
            int evaluationPeriodId)
        {
            return await _dbSet
                .Include(e => e.Employee)
                .Include(e => e.Evaluator)
                .Include(e => e.EvaluationPeriod)
                .Include(e => e.Details)
                    .ThenInclude(d => d.PerformanceCriterion)
                        .ThenInclude(c => c.PerformanceCategory)
                .Where(e =>
                    e.EvaluatorId == evaluatorId &&
                    e.EvaluationPeriodId == evaluationPeriodId)
                .ToListAsync();
        }
    }
}
