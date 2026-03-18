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

interface DropdownItem {
  drpValue: number;
  drpOption: string;
}


@Component({
  selector: 'app-technical-bid-submission',
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
  templateUrl: './technical-bid-submission.html',
  styleUrl: './technical-bid-submission.scss'
})


export class TechnicalBidSubmission {
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
    { key: 'tenderTittle', header: 'Tender Tittle', isVisible: true, isSortable: false },
    { key: 'complianceRemarks', header: 'Compliance Remarks', isVisible: true, isSortable: false },
    { key: 'submissionDate', header: 'Submission Date', isVisible: true, isSortable: false },
    { key: 'jsonDetails', header: 'Document Details', isVisible: true, isSortable: false, isCustom: true },
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
  tenderTypeDrp: DropdownItem[] = [];
  tenderDocument: DropdownItem[] = [];

  documentStatusDrp: DropdownOption[] = []
  handoverUsersDrp: DropdownOption[] = []
  handoverMethod: DropdownOption[] = []



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
  uploadedResumeUrl: SafeResourceUrl | null = null;
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
      tenderType: ['', Validators.required],
      customerName: [''],
      submissionDate: ['', Validators.required]
    });

    this.DocumentDetails = this.fb.group({
      documentName: ['', Validators.required],
      fileUploadControl: ['', Validators.required]
    });

  }

  get f() { return this.groupMasterForm1.controls }
  get f1() { return this.DocumentDetails.controls }


  ngOnInit(): void {
    this.getTableData(true);
    this.GetTypeMaster()
    this.GeTenderDocumentOrder()
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
  
    if (view === 'add') {
      this.groupMasterForm1.reset();
      this.groupMasterForm1.enable();
      this.DocumentDetails.reset();
      this.DocumentDetails.enable();
      this.tableData = [];
      this.uploadedResumeUrl = null;
      return;
    }
  
    if (view === 'view') {
      this.groupMasterForm1.disable();
      this.DocumentDetails.disable();
    } else {
      this.groupMasterForm1.enable();
      this.DocumentDetails.enable();
    }
  
    this.groupMasterForm1.patchValue({
      tenderType: data.tenderId || '',
      customerName: data.complianceRemarks || '',
      submissionDate: data.submissionDate || '',
    });
  
    // ---------- Patch tableData ----------
    let docArray: any[] = [];
  
    if (data.docJson) {
      if (typeof data.docJson === 'string') {
        try {
          docArray = JSON.parse(data.docJson);
        } catch (e) {
          console.error("Invalid docJson", e);
          docArray = [];
        }
      } else if (Array.isArray(data.docJson)) {
        docArray = data.docJson;
      }
    }
  
    // Delay to ensure dialog renders first
    setTimeout(() => {
      this.tableData = docArray.map(doc => ({
        documentName: doc.documentTypeId,
        documentNameText: doc.DocumentType,
        fileUploadControl: doc.Document,
        fileUrl: `https://elocker.nobilitasinfotech.com/${doc.Document}`
      }));
  
      this.cdr.detectChanges(); // make sure view updates immediately
    }, 0);
  
    document.body.style.overflow = 'hidden';
  }
  

  addDocument1() {
    this.DocumentDetails.markAllAsTouched();

    if (!this.DocumentDetails.valid) return;

    const docValue = this.DocumentDetails.get('documentName')?.value;

    const documentData = {
      documentName: docValue,
      documentNameText: this.tenderDocument.find(doc => doc.drpValue === docValue)?.drpOption || '',
      fileUploadControl: this.DocumentDetails.get('fileUploadControl')?.value,
      fileUrl: this.uploadedResumeUrl
    };

    if (this.editIndex > -1) {
      // Update existing row
      this.tableData[this.editIndex] = documentData;
      this.editIndex = -1; // Reset after updating
    } else {
      // Add new row
      this.tableData.push(documentData);
    }

    // Reset form
    this.DocumentDetails.reset();
    this.uploadedResumeUrl = null;
    this.selectedResumeFile = null;
  }

  addDocument() {
    this.DocumentDetails.markAllAsTouched();
    if (!this.DocumentDetails.valid) return;
  
    const docValue = this.DocumentDetails.get('documentName')?.value;
  
    const documentData = {
      documentName: docValue,
      documentNameText: this.tenderDocument.find(doc => doc.drpValue === docValue)?.drpOption || '',
      fileUploadControl: this.DocumentDetails.get('fileUploadControl')?.value,
      fileUrl: this.uploadedResumeUrl
    };
  
    if (this.editIndex > -1) {
      this.tableData[this.editIndex] = documentData;
      this.editIndex = -1;
    } else {
      this.tableData.push(documentData);
    }
  
    this.DocumentDetails.reset();
    this.uploadedResumeUrl = null;
    this.selectedResumeFile = null;
  }


  editDocument(index: number) {
    const doc = this.tableData[index];

    // Populate DocumentDetails form
    this.DocumentDetails.patchValue({
      documentName: doc.documentName,
      fileUploadControl: doc.fileUploadControl
    });

    this.uploadedResumeUrl = doc.fileUrl;
    this.selectedResumeFile = doc.fileUploadControl;

    this.editIndex = index; // Track which row to update
  }

  removeDocument(index: number) {
    this.tableData.splice(index, 1);
  }

  removeResume() {
    this.uploadedResumeUrl = '';
    this.DocumentDetails.patchValue({
      fileUploadControl: ''
    });
  }


  onSubmit(event: any) {
    this.groupMasterForm1.markAllAsTouched();

    if (!this.groupMasterForm1.valid) return;

    if (this.tableData.length === 0) {
      this.message.add({
        severity: 'warn',
        detail: 'Please add at least one document details using Add (+) button before submitting.'
      });
      return;
    }

    const tenderId = this.groupMasterForm1.get('tenderType')?.value;
    const complianceRemarks = this.groupMasterForm1.get('customerName')?.value?.trim() || '';
    const submissionDate = this.groupMasterForm1.get('submissionDate')?.value;

    const docJsonArray = this.tableData.map(row => ({
      docTypeId: row.documentName,
      techDocument: row.fileUploadControl?.name || row.fileUploadControl
    }));

    const docJson = JSON.stringify(docJsonArray);
    this.paramvaluedata = `tenderId=${tenderId}|complianceRemarks=${complianceRemarks}|submissionDate=${submissionDate}|docJson=${docJson}`;
    this.openConfirmation(
      'Confirm?',
      'Are you sure you want to proceed?',
      '1',
      '1',
      event
    );

  }


  submitcall() {
    this.isFormLoading = true;
    let query = '';
    let SP = '';

    if (this.postType === 'update') {
      query = `${this.paramvaluedata}|Id=${this.selectedIndex.id}|userId=${sessionStorage.getItem('userId')}`;
      SP = `uspUpdateTechBidSubmission`;
    }
    else {
      query = `${this.paramvaluedata}|userId=${sessionStorage.getItem('userId')}`;
      SP = `uspPostTechBidSubmission`;
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

  GetTypeMaster() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
    this.userService.getQuestionPaper(`uspGetTenderMaster`).subscribe((res: any) => {
      this.tenderTypeDrp = res['table'];
    })

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  GeTenderDocumentOrder() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
    this.userService.getQuestionPaper(`uspGetTenderDocumentMaster`).subscribe((res: any) => {
      this.tenderDocument = res['table'];
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
      const currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
      const roleId = currentRole?.roleId || '';
      const userId = sessionStorage.getItem('userId') || '';
      const districtId = sessionStorage.getItem('District') || '';

      const query = `appUserId=${userId}|appUserRole=${roleId}|districtId=${districtId}|searchText=${this.searchText}|pageIndex=${this.pageNo}|size=${this.pageSize}`;
      this.userService.getQuestionPaper(`uspGetTechBidDetails|${query}`).subscribe({
        next: (res: any) => { 
          try {
            setTimeout(() => {
              this.data = res?.table1 || [];
              this.totalCount = res?.table?.[0]?.totalCnt || this.data.length;
              this.cdr.detectChanges();
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
    this.editIndex = -1
    this.visible = false;
  }


  isInvalid(field: string): boolean {
    const control = this.groupMasterForm1.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  isInvalid1(field: string): boolean {
    const control = this.DocumentDetails.get(field);
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
    this.userService.SubmitPostTypeData(`uspDeleteTechBidSubmission`, query, 'header').subscribe((datacom: any) => {
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
    if (typeof data.docJson === 'string') {
      try {
        data.docJson = JSON.parse(data.docJson);
      } catch {
        data.docJson = [];
      }
    }
    else if (!Array.isArray(data.docJson)) {
      data.docJson = [];
    }
    this.groupListArray = data.docJson;
  }


  viewAttachment(url: string) {
    if (url) {
      window.open('https://elocker.nobilitasinfotech.com/' + url, '_blank');
    }
  }



}
