// Type declarations for modules that don't have @types packages
declare module 'docx' {
  export interface Document {
    // Add docx Document interface properties as needed
  }
  export interface Paragraph {
    // Add Paragraph interface properties as needed
  }
  export interface Packer {
    // Add Packer interface properties as needed
    toBlob(doc: Document): Promise<Blob>;
  }
  export interface TextRun {
    // Add TextRun interface properties as needed
  }
  export interface Table {
    // Add Table interface properties as needed
  }
  
  export const Document: any;
  export const Paragraph: any;
  export const Packer: any;
  export const TextRun: any;
  export const Table: any;
}

declare module 'jspdf-autotable' {
  export default function autoTable(jsPDF: any, options: any): void;
}
