using PerformanceEvaluation.Application.DTOs.JobPosition;
using PerformanceEvaluation.Application.Interfaces;
using PerformanceEvaluation.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PerformanceEvaluation.Application.Services
{
    public class JobPositionService : IJobPositionService
    {
        private readonly IRepository<JobPosition> _repository;

        public JobPositionService(IRepository<JobPosition> repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<JobPositionDto>> GetAllAsync()
        {
            var positions = await _repository.GetAllAsync();

            return positions
                .OrderBy(p => p.Name)
                .Select(p => new JobPositionDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    DepartmentId = p.DepartmentId
                });
        }
    }
}
