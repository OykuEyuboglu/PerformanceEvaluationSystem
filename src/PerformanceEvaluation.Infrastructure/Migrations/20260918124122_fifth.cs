using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PerformanceEvaluation.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class fifth : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DepartmentId",
                table: "JobPositions",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_JobPositions_DepartmentId",
                table: "JobPositions",
                column: "DepartmentId");

            migrationBuilder.AddForeignKey(
                name: "FK_JobPositions_Departments_DepartmentId",
                table: "JobPositions",
                column: "DepartmentId",
                principalTable: "Departments",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_JobPositions_Departments_DepartmentId",
                table: "JobPositions");

            migrationBuilder.DropIndex(
                name: "IX_JobPositions_DepartmentId",
                table: "JobPositions");

            migrationBuilder.DropColumn(
                name: "DepartmentId",
                table: "JobPositions");
        }
    }
}
