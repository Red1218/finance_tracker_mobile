import { ICsvReportGenerator } from '../../application';
import { RawLedgerRow } from '../../domain';

export class CsvReportGeneratorImpl implements ICsvReportGenerator {
  public async generateCsv(rows: RawLedgerRow[]): Promise<string> {
    const headers = ['Transaction Date', 'Type', 'Category Name', 'Amount', 'Account Name', 'Description', 'Status'];
    const csvLines: string[] = [headers.join(',')];

    for (const row of rows) {
      const line = [
        this.escapeCsvField(row.transactionDate),
        this.escapeCsvField(row.type),
        this.escapeCsvField(row.categoryName),
        row.amount.toFixed(2),
        this.escapeCsvField(row.accountName),
        this.escapeCsvField(row.description),
        this.escapeCsvField(row.status),
      ].join(',');
      csvLines.push(line);
    }

    const csvContent = csvLines.join('\n');
    // Emulates generating local file URI
    const fileUri = `file:///tmp_exports/finance_export_${Date.now()}.csv`;
    return fileUri;
  }

  private escapeCsvField(field: string): string {
    if (!field) return '""';
    const escaped = field.replace(/"/g, '""');
    return `"${escaped}"`;
  }
}
