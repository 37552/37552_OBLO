import { Document, Paragraph, Packer, TextRun, Table } from "docx";
export class DocumentCreator {
  create(jsonColumns:any,jsonData:any,jsonColumnsLength:any,jsonDataLength:any) {
    // const document = new Document();
    // const table=document.createTable(jsonDataLength,jsonColumnsLength);

    for(let col=0;col<=jsonColumnsLength-1;col++) {
        // table.getCell(0, col).addContent(new Paragraph(jsonColumns[col].title));
     }

     for(let row=0;row<=jsonDataLength-1;row++) {
      for(let col=0;col<=jsonColumnsLength-1;col++) {
          // table.getCell(row, col).addContent(new Paragraph(jsonData[row][jsonColumns[col].key]));
        }
     }
    return document;
  }
}