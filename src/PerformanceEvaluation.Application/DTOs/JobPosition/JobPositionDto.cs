namespace PerformanceEvaluation.Application.DTOs.JobPosition
{
    public class JobPositionDto
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public int DepartmentId { get; set; }
    }
}