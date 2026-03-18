export const fileTypes = {
    'image': ['jpg', 'jpeg', 'png', 'webp', 'bmp'],
    'excel': ['xls', 'xlsx'],
    'word': ['doc', 'docx'],
    'text': ['txt'],
    'pdf': ['pdf'],
    'video': ['mp4', 'mkv', 'webm', '3gp', 'ts', 'avi', 'mov', 'mts', 'm2ts', 'mxf']
  };
export class ObjectParam {
    TblName!: string;
    ColumnName!: string;
    ColumnType!: string;
    ColumnValue!: string;
    RequiredField!: string;
    ColSize!: string;
    ContType!: string;
    validation!: string;
    ColumnAliasName!: string;
    compareColumnAliasName!: string;
    CompareColumnName!: string;
    CompareColumnValue!: string;
    Rangestring!: string;
}

export class lstObjectParam{
    lstColumnList!: any[];
}
export interface UploadDoc {
    LlojiKampanjesId: number;
    FileToUpload: File; }
export class UserObjectParam {
    tbleName!: string;
    tbleAliasName!: string;
    tablePageStyle!: string;
    tableMailId!: string;
    tableWfId!: string;
    ColumnName!: string;
    DataType!: string;
    ColumnLength!: string;
    OriginalColumnLength!: string;
    ColumnAliasName!: string;
    Validation!: string;
    columnHide!: string;
    valueFillType!: string;
    dropDownChildtable!: string;
    dropDownQuery!: string;
    controlType!: string;
    isRequired!: string;
    isOriginalRequired!: string;
    compareColumnName!: string;
    range!: string;
    expressionJson!: string;
    tabGroup!: string;
}
export class dynamicformvalues {
    formName!: string;
    formValue!: string;
    menu!: string;
   
}
export class lstUserObjectParam{
    lstColumnList!: any[];
}
export class FormObjectParam {
    BaseTable!: string;
    formName!: string;
    sequence!: string;
    tableName!: string;
    parentTable!: string;
    tableAlias!: string;
    editTypeMethod!: string;
    isRequired!: string;
    id!: string;
    formNameId!: string;
}

export class lstFormObjectParam{
    lstFormColumnList!: any[];
}

export class FormFinalObjectParam {
    tbleName!: string;
    tbleSequence!: string;
    ColumnName!: string;
    ColumnValue!: string;
    
}
export class lstFormFinalObjectParam{
    lstColumnListfinal!: any[];
}

export class FormObjectSubmitParam {
    TblName!: string;
    ColumnName!: string;
    ColumnType!: string;
    ColumnValue!: string;
    RequiredField!: string;
    ColSize!: string;
    ContType!: string;
    sequence!: string;
    
}

export class lstFormObjectSubmitParam{
    lstFormColumnList!: any[];
}

export class GISFile {
    id!: string;
    fileName!: string;
}
export class lstGISFileObjectParam{
    lstColumnListfinal!: any[];
}

export class GISCoordinates {
    id!: string;
    lat!: string;
    long!: string;
    markericon!: string;
    beatId!: string;
    createdOn!: string;
    employeeId!: string;
    labels!: string;
    Sector!: string;
    Distance!: string;

}
 // Added by Bhawna for Material Issue,return or damage Screen //
 export class MaterialIssue
 {
     materialId!: number;
     issueQty!: number;
     id!: number;
     status!: string;
     returnQty!: number;
     statusReturnDamage!: string;
     entryQty!: number;
 }
 export class lstMaterialIssueObjectParam{
     lstColumnListMaterialfinal!: any[];
 }
 // Added by Bhawna for Material Issue,return or damage Screen //
//  export class GISCoordinatesAssets {
   
//     lat:string;
//     long:string;
//     markericon:string;
//     addedBy: string;
//     assetName: string;
//     assetType: string;
//     addedOn: string;
//     assetCategory: string;
//     img: string;

// }

 export const MY_DATE_FORMATS = {
    parse: {
      dateInput: 'DD-MM-YYYY',
    },
    display: {
      dateInput: 'YYYY-MM-DD',
      monthYearLabel: 'MMMM YYYY',
      dateA11yLabel: 'LL',
      monthYearA11yLabel: 'MMMM YYYY'
    },
};
export const MY_DATE_FORMATS1 = {
    parse: {
      dateInput: 'DD/MM/YYYY',
    },
    display: {
      dateInput: 'DD/MM/YYYY',
      monthYearLabel: 'MMMM YYYY',
      dateA11yLabel: 'LL',
      monthYearA11yLabel: 'MMMM YYYY'
    },
};
export const MY_DATE_FORMATS2 = {
    parse: {
      dateInput: 'DD-MM-YYYY',
    },
    display: {
      dateInput: 'DD-MM-YYYY',
      monthYearLabel: 'MMMM YYYY',
      dateA11yLabel: 'LL',
      monthYearA11yLabel: 'MMMM YYYY'
    },
};