import * as XLSX from 'xlsx';

export interface ExportColumn {
  key: string;
  header: string;
  transform?: (value: any, row: any) => string | number;
}

/**
 * Export data to Excel file
 * @param data - Array of objects to export
 * @param columns - Column configuration for export
 * @param filename - Name of the file (without extension)
 * @param sheetName - Name of the Excel sheet
 */
export function exportToExcel(
  data: any[],
  columns: ExportColumn[],
  filename: string,
  sheetName: string = 'Sheet1'
) {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Transform data based on column configuration
  const exportData = data.map((row) => {
    const transformedRow: Record<string, any> = {};
    columns.forEach((col) => {
      const value = row[col.key];
      transformedRow[col.header] = col.transform
        ? col.transform(value, row)
        : (value ?? '');
    });
    return transformedRow;
  });

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(exportData);

  // Auto-size columns
  const colWidths = columns.map((col) => {
    const maxLength = Math.max(
      col.header.length,
      ...exportData.map((row) => String(row[col.header] || '').length)
    );
    return { wch: Math.min(maxLength + 2, 50) };
  });
  ws['!cols'] = colWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Generate filename with date
  const date = new Date().toISOString().split('T')[0];
  const fullFilename = `${filename}_${date}.xlsx`;

  // Save file
  XLSX.writeFile(wb, fullFilename);
}

/**
 * Export data to CSV file
 * @param data - Array of objects to export
 * @param columns - Column configuration for export
 * @param filename - Name of the file (without extension)
 */
export function exportToCSV(
  data: any[],
  columns: ExportColumn[],
  filename: string
) {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Create headers
  const headers = columns.map((col) => col.header);

  // Transform data
  const rows = data.map((row) => {
    return columns.map((col) => {
      const value = row[col.key];
      const transformedValue = col.transform
        ? col.transform(value, row)
        : (value ?? '');
      // Escape quotes and wrap in quotes if contains comma
      const stringValue = String(transformedValue);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    });
  });

  // Combine headers and rows
  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const date = new Date().toISOString().split('T')[0];
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${date}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}
