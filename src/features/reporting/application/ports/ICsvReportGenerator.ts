import { RawLedgerRow } from '../../domain';

export interface ICsvReportGenerator {
  generateCsv(rows: RawLedgerRow[]): Promise<string>; // Returns local file URI
}
