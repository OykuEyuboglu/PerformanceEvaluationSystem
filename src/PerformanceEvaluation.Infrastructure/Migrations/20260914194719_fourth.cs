using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PerformanceEvaluation.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class fourth : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "UX_Evaluations_Employee_Period",
                table: "Evaluations",
                columns: new[] { "EmployeeId", "EvaluationPeriodId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "UX_Evaluations_Employee_Period",
                table: "Evaluations");
        }
    }
}