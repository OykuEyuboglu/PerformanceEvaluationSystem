using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ClosedXML.Excel;
using global::PerformanceEvaluation.Application.Interfaces;

namespace PerformanceEvaluation.Application.Services
{
    public class ExportService : IExportService
    {
        private readonly IReportService _reportService;

        public ExportService(IReportService reportService)
        {
            _reportService = reportService;
        }

        public async Task<byte[]> ExportDepartmentRankingToExcelAsync(
            int evaluationPeriodId)
        {
            var rankings =
                await _reportService.GetDepartmentRankingAsync(
                    evaluationPeriodId);

            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("Departman Sıralaması");

            worksheet.Cell(1, 1).Value = "Sıra";
            worksheet.Cell(1, 2).Value = "Ad Soyad";
            worksheet.Cell(1, 3).Value = "Departman";
            worksheet.Cell(1, 4).Value = "Pozisyon";
            worksheet.Cell(1, 5).Value = "Ortalama Skor";
            worksheet.Cell(1, 6).Value = "Değerlendirme Sayısı";

            var headerRow = worksheet.Row(1);
            headerRow.Style.Font.Bold = true;
            headerRow.Style.Fill.BackgroundColor = XLColor.LightGray;

            var row = 2;
            foreach (var item in rankings)
            {
                worksheet.Cell(row, 1).Value = item.Rank;
                worksheet.Cell(row, 2).Value = item.EmployeeName;
                worksheet.Cell(row, 3).Value = item.DepartmentName;
                worksheet.Cell(row, 4).Value = item.JobPositionName ?? "-";
                worksheet.Cell(row, 5).Value = item.AverageScore;
                worksheet.Cell(row, 6).Value = item.EvaluationCount;
                row++;
            }

            worksheet.Columns().AdjustToContents();

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            return stream.ToArray();
        }
    }

}