declare module 'pdf-parse' {
  interface PDFInfo {
    Title?: string;
    Author?: string;
    Subject?: string;
    Keywords?: string;
    Creator?: string;
    Producer?: string;
    CreationDate?: string;
    ModDate?: string;
  }

  interface PDFMetadata {
    metadata?: Record<string, unknown>;
  }

  interface PDFData {
    numpages: number;
    numrender: number;
    info: PDFInfo;
    metadata: PDFMetadata;
    version: string;
    text: string;
  }

  function pdf(
    dataBuffer: Buffer | Uint8Array | ArrayBuffer,
    options?: Record<string, unknown>
  ): Promise<PDFData>;

  export = pdf;
}
