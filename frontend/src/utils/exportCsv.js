/**
 * Export an array of objects as CSV and trigger a download.
 * @param {Array<Object>} data - rows to export.
 * @param {string} filename - name for the downloaded file.
 */
export default function exportCsv(data, filename = 'export.csv') {
  if (!Array.isArray(data) || data.length === 0) {
    alert('No data to export.');
    return;
  }
  const header = Object.keys(data[0]);
  const csvRows = [header.join(',')];
  data.forEach((row) => {
    const values = header.map((field) => {
      const val = row[field];
      // Escape double quotes
      const escaped = String(val).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  });
  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
