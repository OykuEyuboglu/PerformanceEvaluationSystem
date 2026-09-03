using PerformanceEvaluation.Application.DTOs.EvaluatorEmployee;
using PerformanceEvaluation.Application.Interfaces;
using PerformanceEvaluation.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PerformanceEvaluation.Application.Services
{
    public class EvaluationPeriodService : IEvaluationPeriodService
    {
        private readonly IRepository<EvaluationPeriod> _repository;

        public EvaluationPeriodService(
            IRepository<EvaluationPeriod> repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<EvaluationPeriodDto>> GetAllAsync()
        {
            var periods = await _repository.GetAllAsync();

            return periods.Select(p => new EvaluationPeriodDto
            {
                Id = p.Id,
                Name = p.Name,
                StartDate = p.StartDate,
                EndDate = p.EndDate
            });
        }

        public async Task<EvaluationPeriodDto> CreateAsync(
            CreateEvaluationPeriodDto dto)
        {
            if (dto.EndDate < dto.StartDate)
                throw new InvalidOperationException(
                    "Bitiş tarihi başlangıç tarihinden önce olamaz.");

            var period = new EvaluationPeriod
            {
                Name = dto.Name,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate
            };

            await _repository.AddAsync(period);
            await _repository.SaveChangesAsync();

            return new EvaluationPeriodDto
            {
                Id = period.Id,
                Name = period.Name,
                StartDate = period.StartDate,
                EndDate = period.EndDate
            };
        }
    }
}