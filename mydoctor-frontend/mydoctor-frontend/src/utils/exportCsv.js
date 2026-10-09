/**
 * Utility to export JavaScript arrays to CSV file and trigger instant browser download.
 *
 * @param {string} filename - Desired download file name (e.g. "appointments_export.csv")
 * @param {Array<{ key: string, label: string }>} columns - Column mapping
 * @param {Array<Object>} rows - Data objects
 */
export function exportToCsv(filename, columns, rows) {
  if (!rows || !rows.length) {
    alert('No data available to export.');
    return;
  }

  // Header row
  const headerRow = columns.map(c => `"${(c.label || c.key).replace(/"/g, '""')}"`).join(',');

  // Data rows
  const dataRows = rows.map(row => {
    return columns.map(col => {
      let val = row[col.key];
      if (val === undefined || val === null) val = '';
      if (typeof val === 'object') val = JSON.stringify(val);
      val = String(val).replace(/"/g, '""');
      return `"${val}"`;
    }).join(',');
  });

  const csvContent = '\uFEFF' + [headerRow, ...dataRows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
