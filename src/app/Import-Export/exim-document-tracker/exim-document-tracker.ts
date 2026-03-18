import { Component, ChangeDetectorRef, signal, ViewChild } from '@angular/core';
import { TableTemplate, TableColumn } from '../../table-template/table-template';
import { ButtonModule } from 'primeng/button';
import { Popover } from 'primeng/popover';
import { Tooltip } from "primeng/tooltip";
import { Dialog } from 'primeng/dialog';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { CardModule } from 'primeng/card';
import { DrawerModule } from 'primeng/drawer';
import { UserService } from '../../shared/user-service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Toast } from 'primeng/toast';
import { MultiSelectModule } from 'primeng/multiselect';
import { noInvalidPipelineName, Customvalidation } from '../../shared/Validation';
import { ConfigService } from '../../shared/config.service';
import { HttpErrorResponse } from '@angular/common/http';
import { FileUploadModule } from 'primeng/fileupload';
import { TableModule } from 'primeng/table';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface DropdownOption {
  drpOption: string;
  drpValue: string;
}

@Component({
  selector: 'app-exim-document-tracker',
  imports: [
    TableTemplate,
    CardModule,
    ButtonModule,
    DrawerModule,
    Popover,
    FormsModule,
    FileUploadModule,
    CommonModule,
    ReactiveFormsModule,
    SelectModule,
    DatePickerModule,
    ConfirmDialog,
    ProgressSpinner,
    MultiSelectModule,
    Toast,
    Tooltip,
    TableModule,
    Dialog
  ],
  providers: [
    ConfirmationService,
    MessageService
  ],
  templateUrl: './exim-document-tracker.html',
  styleUrl: './exim-document-tracker.scss'
})


export class EximDocumentTracker {
  @ViewChild('FileUpload') FileUpload: any;
  @ViewChild('handoverUpload') handoverUpload: any;
  isLoading = true;
  visible: boolean = false;
  postType: string = '';
  header: any = '';
  selectedIndex: any = [];
  headerIcon: string = 'pi pi-plus';
  paramvaluedata: string = '';
  isFormLoading: boolean = false;
  data: any[] = [];
  groupMasterForm1: FormGroup;
  DocumentDetails: FormGroup;
  groupListArray = []
  groupListArray1 = []
  editingProcessLossIndex: number | null = null;

  documentList: any[] = [];

  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true, },
    { key: 'documentId', header: 'Sequance', isVisible: true, isSortable: false },
    { key: 'orderType', header: 'Order Type', isVisible: true, isSortable: false },
    { key: 'salesOrder', header: 'Sales Order', isVisible: true, isSortable: false },
    { key: 'purchaseOrder', header: 'Purchase Order', isVisible: true, isSortable: false },
    { key: 'customer', header: 'Customer Name', isVisible: true, isSortable: false },
    { key: 'country', header: 'Country', isVisible: true, isSortable: false },
    { key: 'shipmentDate', header: 'Shipment Date', isVisible: true, isSortable: false },
    { key: 'jsonDetails', header: 'Document Details and Status', isVisible: true, isSortable: false, isCustom: true },
  ];



  pageNo = 1;
  pageSize = 5;
  searchText = '';
  totalCount = 0;
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  courtType = [];
  partyNamedrp = []
  stateNameDrp = []
  cityDrp = []
  itemDailog: boolean = false
  itemDailog1: boolean = false

  uploadMasterDrp = [];
  salesOrderDrp = [];
  orderTypeDrp = [];
  purchaseOrderDrp = []
  customerMaster = []
  supplierNameDrp = []
  countryMasterDrp = []

  documnetMasterDrp: DropdownOption[] = []
  documentStatusDrp: DropdownOption[] = []
  handoverUsersDrp: DropdownOption[] = []
  handoverMethod: DropdownOption[] = []


  uploadedResumeUrl: SafeResourceUrl | null = null;
  uploadedResumeUrl1: SafeResourceUrl | null = null;

  showResumeUploadDialog = false;
  showResumeUploadDialog1 = false;

  selectedResumeFile: File | null = null;
  selectedResumeFile1: File | null = null;

  isUploadingResume = false;
  isUploadingResume1 = false;

  selectedRowDetails: any[] = [];
  selectedRowDetails1: any[] = [];

  eximDocumentDrp = [];
  childArrData: any[] = [];
  childArrData1: any[] = [];


  tableData: any[] = [];
  editIndex: number = -1;

  editingIndex: number | null = null;


  constructor(private fb: FormBuilder,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private message: MessageService,
    public Customvalidation: Customvalidation,
    private configService: ConfigService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef) {

    this.groupMasterForm1 = this.fb.group({
      orderType: ['', Validators.required,],
      salesOrder: ['', Validators.required],
      purchaseOrder: ['', Validators.required],
      customerName: ['', Validators.required],
      countryName: ['', Validators.required],
      shipmentDate: ['', Validators.required],
    });

    this.DocumentDetails = this.fb.group({
      documentName: ['', Validators.required,],
      isMandatory: ['', Validators.required],
      statusId: ['', Validators.required],
      uploadedBy: ['', Validators.required],
      uploadDate: ['', Validators.required],
      handoverRequired: ['', Validators.required],
      handoverBy: ['', Validators.required],
      handoverToId: ['', Validators.required],
      handoverDate: ['', Validators.required],
      handoverMethod: ['', Validators.required],
      clearanceStatus: [''],
      remarks: ['', [Validators.required, noInvalidPipelineName()]],
      fileUploadControl: ['', [Validators.required]],
      handoverUploadControl: ['', [Validators.required]],
    });

  }

  get f() { return this.groupMasterForm1.controls }
  get f1() { return this.DocumentDetails.controls }


  ngOnInit(): void {
    this.getTableData(true);
    this.GetOrderTypeMaster()
    this.GeSalesOrder()
    this.GetPurchaseOrder()
    this.GetCustomerName()
    this.GetCountryMaster()
    this.GetDocumentMaster()
    this.GetDocumentStatus()
    this.GethandoverUsers()
    this.GetHandoverMethod()
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  showDialog(view: string, data: any) {
    this.selectedIndex = data;
    this.visible = true;
    this.postType = view;
    this.header = view === 'add' ? 'Add' : view === 'update' ? 'Update' : 'View';
    this.headerIcon = view === 'add' ? 'pi pi-plus' : view === 'update' ? 'pi pi-pencil' : 'pi pi-eye';

    // ---------- ADD MODE ----------
    if (view === 'add') {
      this.groupMasterForm1.reset();
      this.groupMasterForm1.enable();

      this.DocumentDetails.reset();
      this.DocumentDetails.enable();

      this.tableData = [];

      this.uploadedResumeUrl = null;
      this.uploadedResumeUrl1 = null;

      return;
    }

    // ---------- VIEW / UPDATE MODE ----------
    if (view === 'view') {
      this.groupMasterForm1.disable();
      this.DocumentDetails.disable();
    } else {
      this.groupMasterForm1.enable();
      this.DocumentDetails.enable();
    }

    // Patch main form
    this.groupMasterForm1.patchValue({
      orderType: data.orderTypeId || '',
      salesOrder: data.salesOrderId || '',
      purchaseOrder: data.purchaseOrderId || '',
      customerName: data.customerId || '',
      countryName: data.countryId || '',
      shipmentDate: data.shipmentDate || '',
    });

    if (data.documentDetails) {
      let docArray: any[] = [];

      if (typeof data.documentDetails === "string") {
        try {
          docArray = JSON.parse(data.documentDetails);
        } catch (e) {
          console.error("Invalid JSON in documentDetails", e);
          docArray = [];
        }
      }

      else if (Array.isArray(data.documentDetails)) {
        docArray = data.documentDetails;
      }
      
      this.tableData = docArray.map((d: any) => ({
        documentName: d.documentName,
        statusName: d.DocumentStatus,
        uploadedByName: d.uploadedBy,
        handoverByName: d.handOverBy,
        handoverToName: d.handOverTo,
        handoverMethodName: d.handOVerMethod,

        eximdocumentId: d.eximdocumentId,
        documentStatusId: d.documentStatusId,
        uploadedById: d.uploadedById,
        handOverById: d.handOverById,
        handOverToId: d.handOverToId,
        handOverMethodId: d.handOverMethodId,

        uploadDate: d.uploadDate,
        handOverDate: d.handOverDate,
        remarks: d.remarks,
        clearanceStatus: d.clearanceStatus,
        isMandataory: d.isMandataory,
        handoverRequired: d.handoverRequired,
        fileUploadControl: d.uploadFile,
        handoverUploadControl: d.handOverProof
      }));
    }

    document.body.style.overflow = 'hidden';
  }

  
  addOrUpdateRow() {
    if (this.DocumentDetails.invalid) {
      this.DocumentDetails.markAllAsTouched();
      return;
    }

    const f = this.DocumentDetails.value;

    const row = {
      documentName: this.documnetMasterDrp.find(x => x.drpValue == f.documentName)?.drpOption,
      statusName: this.documentStatusDrp.find(x => x.drpValue == f.statusId)?.drpOption,
      uploadedByName: this.handoverUsersDrp.find(x => x.drpValue == f.uploadedBy)?.drpOption,
      handoverByName: this.handoverUsersDrp.find(x => x.drpValue == f.handoverBy)?.drpOption,
      handoverToName: this.handoverUsersDrp.find(x => x.drpValue == f.handoverToId)?.drpOption,
      handoverMethodName: this.handoverMethod.find(x => x.drpValue == f.handoverMethod)?.drpOption,

      eximdocumentId: f.documentName,
      documentStatusId: f.statusId,
      uploadedById: f.uploadedBy,
      handOverById: f.handoverBy,
      handOverToId: f.handoverToId,
      handOverMethodId: f.handoverMethod,

      uploadDate: f.uploadDate,
      handOverDate: f.handoverDate,
      clearanceStatus: f.clearanceStatus,
      remarks: f.remarks,
      isMandataory: f.isMandatory,
      handoverRequired: f.handoverRequired,
      fileUploadControl: this.uploadedResumeUrl,
      handoverUploadControl: this.uploadedResumeUrl1
    };

    if (this.editIndex > -1) {
      this.tableData[this.editIndex] = row;
      this.editIndex = -1;
    } else {
      this.tableData.push(row);
    }

    // Reset form and uploaded files
    this.DocumentDetails.reset();

    this.uploadedResumeUrl = null;     // ✅ clear uploaded file URL
    this.uploadedResumeUrl1 = null;    // ✅ clear handover proof URL
    this.selectedResumeFile = null;    // ✅ clear selected file reference
    this.selectedResumeFile1 = null;   // ✅ clear selected handover file reference
  }

  editRow(index: number) {
    const row = this.tableData[index];
    this.uploadedResumeUrl = row.fileUploadControl;
    this.uploadedResumeUrl1 = row.handoverUploadControl;

    this.DocumentDetails.patchValue({
      documentName: row.eximdocumentId,
      statusId: row.documentStatusId,
      uploadedBy: row.uploadedById,
      uploadDate: row.uploadDate,
      handoverBy: row.handOverById,
      handoverToId: row.handOverToId,
      handoverDate: row.handOverDate,
      handoverMethod: row.handOverMethodId,
      clearanceStatus: row.clearanceStatus,
      remarks: row.remarks,
      isMandatory: row.isMandataory,
      handoverRequired: row.handoverRequired,
      fileUploadControl: this.uploadedResumeUrl,       // keep raw value for upload component
      handoverUploadControl: this.uploadedResumeUrl1 // keep raw value for upload component
    });

    this.editIndex = index;
  }


  onSubmit(event: any) {
    this.groupMasterForm1.markAllAsTouched();

    if (!this.groupMasterForm1.valid) {
      return;
    }

    if (this.tableData.length === 0) {
      this.DocumentDetails.markAllAsTouched();
      if (!this.DocumentDetails.valid) {
        console.warn("Please Enter Document Details Data.");
        this.message.add({
          severity: 'warn',
          detail: 'Please Enter Document Details Data.'
        });
        return;
      }
    }

    if (this.tableData.length === 0) {
      this.message.add({
        severity: 'warn',
        detail: 'Please add at least one document using Add (+) button before submitting.'
      });
      return;
    }

    // Form values
    const orderType = this.groupMasterForm1.get('orderType')?.value;
    const purchaseOrder = this.groupMasterForm1.get('purchaseOrder')?.value;
    const salesOrder = this.groupMasterForm1.get('salesOrder')?.value;
    const customerName = this.groupMasterForm1.get('customerName')?.value;
    const countryName = this.groupMasterForm1.get('countryName')?.value;
    const shipmentDate = this.groupMasterForm1.get('shipmentDate')?.value?.trim() || '';

    const documentDetailsJsonArray = this.tableData.map(row => ({
      eximdocumentId: row.eximdocumentId,
      isMandataory: row.isMandataory ? 1 : 0,
      handoverRequired: row.handoverRequired ? 1 : 0,
      documentStatusId: row.documentStatusId,
      uploadedById: row.uploadedById,
      uploadDate: row.uploadDate,
      uploadFile: row.fileUploadControl,
      handOverById: row.handOverById,
      handOverToId: row.handOverToId,
      handOverDate: row.handOverDate,
      handOverProof: row.handoverUploadControl,
      handOverMethodId: row.handOverMethodId,
      clearanceStatus: row.clearanceStatus || '',
      remarks: row.remarks
    }));

    const documentsJson = JSON.stringify(documentDetailsJsonArray);
    this.paramvaluedata = `orderTypeId=${orderType}|purchaseOrderId=${purchaseOrder}|salesOrderId=${salesOrder}|customerId=${customerName}|countryId=${countryName}|shipmentDate=${shipmentDate}|documentsJson=${documentsJson}`;
    this.openConfirmation('Confirm?', 'Are you sure you want to proceed?', '1', '1', event);
  }

  
  submitcall() {
    this.isFormLoading = true;
    let query = '';
    let SP = '';

    if (this.postType === 'update') {
      query = `${this.paramvaluedata}|Id=${this.selectedIndex.id}|userId=${sessionStorage.getItem('userId')}`;
      SP = `uspUpdateEximDocsTrack`;
    }
    else {
      query = `${this.paramvaluedata}|userId=${sessionStorage.getItem('userId')}`;
      SP = `uspPostEximDocsTrack`;
    }
    this.userService.SubmitPostTypeData(SP, query, 'header').subscribe((datacom: any) => {
      this.isFormLoading = false;
      if (!datacom) return;
      const resultarray = datacom.split("-");
      if (resultarray[1] === "success") {
        this.getTableData(false);
        this.message.add({
          severity: 'success',
          summary: 'Success',
          detail: this.postType === 'update' ? 'Data Updated Successfully.' : 'Data Saved Successfully.',
        });
        this.onDrawerHide();
      }
      else if (resultarray[0] == "2") {
        this.message.add({ severity: 'warn', summary: 'Warn', detail: resultarray[1] || datacom });
      }
      else {
        this.message.add({ severity: 'warn', summary: 'Warn', detail: datacom, });
      }
    });

  }


  deleteRow(index: number) {
    this.tableData.splice(index, 1);
  }

  onCheckboxChange(fieldName: string, event: any) {
    const isChecked = event.target.checked;
    this.groupMasterForm1.get(fieldName)?.setValue(isChecked);
  }

  onResumeFileSelect(event: any) {
    if (event.files && event.files.length > 0) {
      this.selectedResumeFile = event.files[0];
      this.cdr.detectChanges();
    }
  }

  clearResumeSelection() {
    this.selectedResumeFile = null;
    if (this.FileUpload) {
      this.FileUpload.clear();
    }
    this.cdr.detectChanges();
  }


  onResumeFileSelect1(event: any) {
    if (event.files && event.files.length > 0) {
      this.selectedResumeFile1 = event.files[0];
      this.cdr.detectChanges();
    }
  }

  clearResumeSelection1() {
    this.selectedResumeFile1 = null;
    if (this.handoverUpload) {
      this.handoverUpload.clear();
    }
    this.cdr.detectChanges();
  }

  uploadResume() {
    try {
      if (!this.selectedResumeFile) {
        this.message.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'Please select a resume file.',
          life: 3000
        });
        return;
      }

      this.isUploadingResume = true;
      this.cdr.detectChanges();

      const filesArray: File[] = [this.selectedResumeFile];
      const folderName = 'FileUpload';
      this.userService.MastrtfileuploadNew(filesArray, folderName).subscribe({
        next: (datacom: any) => {
          this.isUploadingResume = false;

          try {
            if (!datacom) {
              this.message.add({
                severity: 'warn',
                summary: 'Warning',
                detail: 'No response received from server.',
                life: 3000
              });
              return;
            }

            const resultarray = datacom.split('-');

            if (resultarray[0] === '1') {
              const relativePath = resultarray[1].toString();
              const fullUrl = this.normalizeImagePath(relativePath);
              this.DocumentDetails.patchValue({
                fileUploadControl: relativePath
              });
              this.uploadedResumeUrl = fullUrl;
              this.message.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Resume uploaded successfully!',
                life: 3000
              });

              this.closeResumeUploadDialog();
            } else {
              this.message.add({
                severity: 'warn',
                summary: 'Warning',
                detail: resultarray[1] || datacom,
                life: 3000
              });
            }
          } catch (innerErr) {
            console.error('Error processing resume upload response:', innerErr);
            this.message.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Something went wrong while processing the upload response.',
              life: 3000
            });
          }

          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => {
          this.isUploadingResume = false;
          console.error('Resume upload error:', err);

          try {
            if (err.status === 401 || err.status === 403) {
              const msg = err.status === 401 ? 'You are not authorized!' : 'Access forbidden!';
              this.message.add({
                severity: 'error',
                summary: 'Error',
                detail: msg,
                life: 3000
              });
            } else {
              this.message.add({
                severity: 'error',
                summary: 'Error',
                detail: err.message.toString(),
                life: 3000
              });
            }
          } catch (innerErr) {
            console.error('Error handling upload error response:', innerErr);
            this.message.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Unexpected error while handling upload failure.',
              life: 3000
            });
          }

          this.cdr.detectChanges();
        }
      });

    } catch (error: any) {
      console.error('Unexpected error in uploadResume():', error);
      this.isUploadingResume = false;
      this.message.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Something went wrong while uploading resume.',
        life: 3000
      });

      this.cdr.detectChanges();
    }
  }

  removeResume() {
    this.uploadedResumeUrl = '';
    this.DocumentDetails.patchValue({
      fileUploadControl: ''
    });
    this.message.add({
      severity: 'info',
      summary: 'Removed',
      detail: 'Resume removed successfully.',
      life: 2000
    });
  }

  uploadResume1() {
    try {
      if (!this.selectedResumeFile1) {
        this.message.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'Please select a resume file.',
          life: 3000
        });
        return;
      }
      this.isUploadingResume1 = true;
      this.cdr.detectChanges();
      const filesArray: File[] = [this.selectedResumeFile1];
      const folderName = 'handoverFile';
      this.userService.MastrtfileuploadNew(filesArray, folderName).subscribe({
        next: (datacom: any) => {
          this.isUploadingResume1 = false;
          try {
            if (!datacom) {
              this.message.add({
                severity: 'warn',
                summary: 'Warning',
                detail: 'No response received from server.',
                life: 3000
              });
              return;
            }
            const resultarray = datacom.split('-');
            if (resultarray[0] === '1') {
              const relativePath = resultarray[1].toString();
              const fullUrl = this.normalizeImagePath(relativePath);
              this.DocumentDetails.patchValue({
                handoverUploadControl: relativePath
              });
              this.uploadedResumeUrl1 = fullUrl;
              this.message.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Resume uploaded successfully!',
                life: 3000
              });
              this.closeResumeUploadDialog1();
            }
            else {
              this.message.add({
                severity: 'warn',
                summary: 'Warning',
                detail: resultarray[1] || datacom,
                life: 3000
              });
            }
          }
          catch (innerErr) {
            console.error('Error processing resume upload response:', innerErr);
            this.message.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Something went wrong while processing the upload response.',
              life: 3000
            });
          }
          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => {
          this.isUploadingResume1 = false;
          console.error('Resume upload error:', err);
          try {
            if (err.status === 401 || err.status === 403) {
              const msg = err.status === 401 ? 'You are not authorized!' : 'Access forbidden!';
              this.message.add({
                severity: 'error',
                summary: 'Error',
                detail: msg,
                life: 3000
              });
            } else {
              this.message.add({
                severity: 'error',
                summary: 'Error',
                detail: err.message.toString(),
                life: 3000
              });
            }
          } catch (innerErr) {
            console.error('Error handling upload error response:', innerErr);
            this.message.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Unexpected error while handling upload failure.',
              life: 3000
            });
          }

          this.cdr.detectChanges();
        }
      });
    } catch (error: any) {
      console.error('Unexpected error in uploadResume():', error);
      this.isUploadingResume1 = false;
      this.message.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Something went wrong while uploading resume.',
        life: 3000
      });
      this.cdr.detectChanges();
    }
  }

  removeResume1() {
    this.uploadedResumeUrl1 = '';
    this.DocumentDetails.patchValue({
      handoverUploadControl: ''
    });
    this.message.add({
      severity: 'info',
      summary: 'Removed',
      detail: 'Resume removed successfully.',
      life: 2000
    });
  }

  normalizeImagePath(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) {
      return path;
    }
    let normalizedPath = path.replace(/\\/g, '/');
    normalizedPath = normalizedPath.replace(/([^:]\/)\/+/g, '$1');
    return this.configService.baseUrl + normalizedPath;
  }

  getFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getFileSize1(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }


  openResumeUploadDialog() {
    this.showResumeUploadDialog = true;
    this.selectedResumeFile = null;
    this.cdr.detectChanges();
  }

  closeResumeUploadDialog() {
    this.showResumeUploadDialog = false;
    this.selectedResumeFile = null;
    this.cdr.detectChanges();
  }


  openResumeUploadDialog1() {
    this.showResumeUploadDialog1 = true;
    this.selectedResumeFile1 = null;
    this.cdr.detectChanges();
  }

  closeResumeUploadDialog1() {
    this.showResumeUploadDialog1 = false;
    this.selectedResumeFile1 = null;
    this.cdr.detectChanges();
  }


  allowOnlyNumbers(event: KeyboardEvent) {
    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];
    if (allowedKeys.includes(event.key)) {
      return;
    }

    const regex = /^[0-9.]$/;
    if (!regex.test(event.key)) {
      event.preventDefault();
    }
  }


  GetOrderTypeMaster() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
    this.userService.getQuestionPaper(`uspGetOrderTypeMaster`).subscribe((res: any) => {
      this.orderTypeDrp = res['table'];
    })

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  GeSalesOrder() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
    this.userService.getQuestionPaper(`uspGetSalesOrderimpexdrpData`).subscribe((res: any) => {
      this.salesOrderDrp = res['table'];
    })

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }


  GetPurchaseOrder() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
    this.userService.getQuestionPaper(`uspGetPurchaseOrder`).subscribe((res: any) => {
      this.purchaseOrderDrp = res['table'];
    })

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  GetCustomerName() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
    this.userService.getQuestionPaper(`uspGetEximCustomerMaster`).subscribe((res: any) => {
      this.customerMaster = res['table'];
    })

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  GetCountryMaster() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
    this.userService.getQuestionPaper(`uspGetCountryMaster`).subscribe((res: any) => {
      this.countryMasterDrp = res['table'];
    })

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  GetDocumentMaster() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
    this.userService.getQuestionPaper(`EximDocumentsDetailsMaster`).subscribe((res: any) => {
      this.documnetMasterDrp = res['table'];
    })

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  GetDocumentStatus() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
    this.userService.getQuestionPaper(`EximDocumentsStatusMaster`).subscribe((res: any) => {
      this.documentStatusDrp = res['table'];
    })

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  GethandoverUsers() {
    let userId = sessionStorage.getItem('userId') || '';
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
    this.userService.getQuestionPaper(`uspGetApplicationUsers|userID=${userId}`).subscribe((res: any) => {
      this.handoverUsersDrp = res['table'];
    })

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  GetHandoverMethod() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
    this.userService.getQuestionPaper(`uspHandoverMethodMaster`).subscribe((res: any) => {
      this.handoverMethod = res['table'];
    })

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  openCalendar(event: any) {
    event.target.showPicker();
  }

  blockTyping(event: KeyboardEvent) {
    event.preventDefault();
  }

  getTableData(isTrue: boolean) {
    try {
      if (isTrue) {
        this.isLoading = true;
      }
      else {
        this.pageNo = 1;
      }
      const userId = sessionStorage.getItem('userId') || '';
      const query = `appUserId=${userId}|appUserRole=${JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId}|districtId=${sessionStorage.getItem('District') || ''}|searchText=${this.searchText}|pageIndex=${this.pageNo}|size=${this.pageSize}`;
      this.userService.getQuestionPaper(`uspGetEximDocumentsTracker|${query}`).subscribe({
        next: (res: any) => {
          try { 
            setTimeout(() => {
              this.data = res?.table1 || [];
              this.totalCount = res?.table?.[0]?.totalCnt || this.data.length;
            }, 0);
          }
          catch (innerErr) {
            console.error('Error processing response:', innerErr);
            this.data = [];
            this.totalCount = 0;
          } finally {
            setTimeout(() => {
              this.isLoading = false;
              this.cdr.detectChanges();
            }, 1000);
          }
        },
        error: (err) => {
          console.error('API call failed:', err);
          this.isLoading = false;
          if (err.status === 403) {
            this.Customvalidation.loginroute(err.status);
          } else {
            this.data = [];
            this.totalCount = 0;
          }
        }
      });

    }
    catch (error) {
      console.error('Unexpected error in getTableData():', error);
      this.isLoading = false;
    }
  }

  onDrawerHide() {
    document.body.style.overflow = 'visible'; // restore scroll
    this.groupMasterForm1.enable();
    this.groupMasterForm1.reset();

    this.DocumentDetails.enable();
    this.DocumentDetails.reset();
    this.tableData = []
    this.uploadedResumeUrl = null;
    this.uploadedResumeUrl1 = null;
    this.editIndex = -1
    this.visible = false;
  }

  isInvalid(field: string): boolean {
    const control = this.groupMasterForm1.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }


  onPageChange(newPage: number) {
    this.pageNo = newPage;
    this.getTableData(true);
  }


  onPageSizeChange(newSize: number) {
    this.pageSize = newSize;
    this.pageNo = 1; // reset to first page
    this.getTableData(true); // fetch data from API again
  }


  onSearchChange(search: string) {
    this.searchText = search;
    this.pageNo = 1;
    this.getTableData(false);
  }


  onSortChange(event: { column: string, direction: 'asc' | 'desc' }) {
    this.sortColumn = event.column;
    this.sortDirection = event.direction;
    this.getTableData(true);
  }


  deleteItem(item: any) {
    this.selectedIndex = item;
    this.openConfirmation("Confirm", "Are you sure want to delete?", '1', '2');
  }


  openConfirmation(title: string, msg: string, id: any, option?: string, event?: any) {
    this.confirmationService.confirm({
      target: event?.target as EventTarget,
      message: msg,
      header: title,
      closable: true,
      closeOnEscape: true,
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: { label: 'No', severity: 'secondary', outlined: true },
      acceptButtonProps: { label: 'Yes' },
      accept: () => {
        if (option === '1') {
          this.submitcall();
        }
        else if (option === '2') {
          this.deleteData();
        }
        else if (option === '4') {
        }
        else if (option === '5') {
          this.groupMasterForm1.reset()
          this.DocumentDetails.reset()
        }
      },
    });
  }


  onClear() {
    this.groupMasterForm1.reset()
    this.DocumentDetails.reset()
  }


  deleteData() {
    let query = `id=${this.selectedIndex.id}|userId=${sessionStorage.getItem('userId')}`;
    this.userService.SubmitPostTypeData(`uspDeleteEximDocsTrack`, query, 'header').subscribe((datacom: any) => {
      this.isFormLoading = false;
      if (!datacom) return;
      const resultarray = datacom.split("-");
      if (resultarray[1] === "success") {
        this.getTableData(true);
        this.message.add({ severity: 'success', summary: 'Success', detail: 'Data deleted' });
        this.onDrawerHide();
      }
      else {
        this.message.add({ severity: 'warn', summary: 'Warn', detail: resultarray[1] || datacom, });
      }
    });
  }

  showGrouplist(data: any) {
    this.itemDailog = true;
    if (typeof data.documentDetails === 'string') {
      try {
        data.documentDetails = JSON.parse(data.documentDetails);
      } catch {
        data.documentDetails = [];
      }
    }
    else if (!Array.isArray(data.documentDetails)) {
      data.documentDetails = [];
    }
    this.groupListArray = data.documentDetails;
  }

}
