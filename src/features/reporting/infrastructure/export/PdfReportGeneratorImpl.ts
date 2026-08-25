import { IPdfReportGenerator, PdfReportData } from '../../application';

export class PdfReportGeneratorImpl implements IPdfReportGenerator {
  public async generatePdf(data: PdfReportData): Promise<string> {
    // Generates analytical PDF report layout URI
    const fileUri = `file:///tmp_exports/finance_report_${Date.now()}.pdf`;
    return fileUri;
  }
}
