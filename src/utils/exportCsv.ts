const escapeCsvValue = (value: unknown): string => {
  const text = value === null || value === undefined ? '' : String(value)
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function recordsToCsv<T>(
  records: readonly T[],
  columns: readonly (keyof T)[],
): string {
  const header = columns.map((column) => escapeCsvValue(String(column))).join(',')
  const rows = records.map((record) =>
    columns.map((column) => escapeCsvValue(record[column])).join(','),
  )
  return [header, ...rows].join('\r\n')
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
