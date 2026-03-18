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
import { Customvalidation, noInvalidPipelineName } from '../../shared/Validation';
import { ConfigService } from '../../shared/config.service';
import { HttpErrorResponse } from '@angular/common/http';
import { FileUploadModule } from 'primeng/fileupload';
import { TableModule } from 'primeng/table';


@Component({
  selector: 'app-tender-details',
  imports: [
    TableTemplate,
    CardModule,
    ButtonModule,
    DrawerModule,
    Popover,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    SelectModule,
    DatePickerModule,
    ConfirmDialog,
    ProgressSpinner,
    TableModule,
    MultiSelectModule,
    Toast,
    Tooltip,
    Dialog,
    FileUploadModule
  ],
  providers: [
    ConfirmationService,
    MessageService
  ],
  templateUrl: './tender-details.html',
  styleUrl: './tender-details.scss'
})

export class TenderDetails {
  @ViewChild('docFileUpload') docFileUpload: any;
  @ViewChild('addenumFileUpload') addenumFileUpload: any;

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
  eligiblityForm: FormGroup;
  schedulesForm: FormGroup;
  documentDetailsForm: FormGroup;
  feeEmdForm: FormGroup;
  totalCount = 0;


  showUploadDialog = false;
  selectedDocumentFile: File | null = null;
  uploadedDocumentUrl: string | null = null;
  isUploadingDocument = false;


  showAddenumDialog = false;
  selectedAddenumFile: File | null = null;
  uploadedAddenumUrl: string | null = null;
  isUploadingAddenum = false;


  activeTab: 'schedule' | 'fee' | 'eligibility' | 'document' = 'schedule';

  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true, },
    { key: 'tenderReferenceNo', header: 'Tender Ref No.', isVisible: true, isSortable: false },
    { key: 'tenderTittle', header: 'Title', isVisible: true, isSortable: false },
    { key: 'organization', header: 'Organization', isVisible: true, isSortable: false },
    { key: 'tenderType', header: 'Tender Type', isVisible: true, isSortable: false },
    { key: 'tenderCategory', header: 'Tender Category', isVisible: true, isSortable: false },
    { key: 'tenderCost', header: 'Tender Cost', isVisible: true, isSortable: false },
    { key: 'tenderStatus', header: 'Tender Status', isVisible: true, isSortable: false },
    { key: 'tenderDescription', header: 'Tender Description', isVisible: true, isSortable: false },
    { key: 'tenderIssueAuth', header: 'Tender Issue Authority', isVisible: true, isSortable: false },
    { key: 'jsonDetails', header: 'Schedule & Date', isVisible: true, isSortable: false, isCustom: true },
    { key: 'jsonDetails1', header: 'Tender Fee ', isVisible: true, isSortable: false, isCustom: true },
    { key: 'jsonDetails2', header: 'Eligibility & Qualification', isVisible: true, isSortable: false, isCustom: true },
    { key: 'jsonDetails3', header: 'Document Details', isVisible: true, isSortable: false, isCustom: true }
  ];


  pageNo = 1;
  pageSize = 5;
  searchText = '';
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  productTypedrp: any = []
  previousGroupType: any;
  selectedrowIndex: any

  itemDailog: boolean = false
  groupListArray = []

  itemDailog1: boolean = false
  groupListArray1 = []

  itemDailog2: boolean = false
  groupListArray2 = []

  itemDailog3: boolean = false
  groupListArray3 = []

  stateListDrp = [];
  districtListDrp = [];

  // eligibilityList
  eligibilityList: any[] = [];
  isEditMode = false;
  editIndex: number | null = null;

  // schedulesList
  schedulesList: any[] = [];
  isScheduleEditMode = false;
  scheduleEditIndex: number | null = null;

  // feeEmdList
  feeEmdList: any[] = [];
  isFeeEditMode = false;
  feeEditIndex: number | null = null;

  // documentList
  documentList: any[] = [];
  isDocumentEditMode = false;
  documentEditIndex: number | null = null;

  tableData: any[] = [];
  tableData1: any[] = [];
  tableData2: any[] = [];
  tableData3: any[] = [];

  tenderTypeDrp = [];
  tenderCategoryDrp = [];
  tenderStatusDrp = [];
  organizationDrp = [];
  paymentModeDrp = [];

  constructor(private fb: FormBuilder,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private message: MessageService,
    private configService: ConfigService,
    public Customvalidation: Customvalidation,
    private cdr: ChangeDetectorRef) {

    this.groupMasterForm1 = this.fb.group({
      refNo: ['', [Validators.required, noInvalidPipelineName()]],
      title: ['', [Validators.required, noInvalidPipelineName()]],
      organization: ['', Validators.required],
      tenderType: ['', Validators.required],
      tenderCost: ['', [
        Validators.required,
        Validators.pattern(/^\d+(\.\d{1,2})?$/)
      ]],
      tenderCategory: ['', Validators.required],
      tenderStatus: ['', Validators.required],
      authority: ['', [Validators.required, noInvalidPipelineName()]],
      description: ['', [Validators.required, noInvalidPipelineName()]],
    });

    this.eligiblityForm = this.fb.group({
      techEligib: ['', [Validators.required, noInvalidPipelineName()]],
      financialCriteria: ['', [Validators.required, noInvalidPipelineName()]],
      experCriteria: ['', [Validators.required, noInvalidPipelineName()]],
      mandatoryCertificates: ['', [Validators.required, noInvalidPipelineName()]],
      jointVentureAllowed: [false],
      oemManufactreCrt: ['', [Validators.required, noInvalidPipelineName()]],
    });

    this.schedulesForm = this.fb.group({
      nitPublishDate: ['', Validators.required],
      docDownStartDate: ['', Validators.required],
      bidSubStartDate: ['', Validators.required],
      bidSubEndDate: ['', Validators.required],
      bidOPeningDate: ['', Validators.required],
      finBidOPenDate: ['', Validators.required],
      preBidMeetingDate: ['', Validators.required],
      bidValidity: ['', [Validators.required, noInvalidPipelineName()]],
    });

    this.feeEmdForm = this.fb.group({
      tenderFeeAmount: ['', [
        Validators.required,
        Validators.pattern(/^\d+(\.\d{1,2})?$/)
      ]],
      emdAmount: ['', [
        Validators.required,
        Validators.pattern(/^\d+(\.\d{1,2})?$/)
      ]],
      paymentMode: [null, Validators.required],   // dropdown
      bankDetails: ['', [Validators.required, noInvalidPipelineName()]], // text input validation like eligibility
      refundRules: ['', [Validators.required, noInvalidPipelineName()]], // text input validation
      emdExemption: [false], // checkbox
    });

    this.documentDetailsForm = this.fb.group({
      uploadDocument: ['', Validators.required],
      documentType: ['', [Validators.required, noInvalidPipelineName()]], // dropdown
      specification: ['', [Validators.required, noInvalidPipelineName()]], // date picker
      TermsAndcondition: ['', [Validators.required, noInvalidPipelineName()]],
      addenumUpload: ['', Validators.required],
    });

  }


  get f() { return this.groupMasterForm1.controls }

  ngOnInit(): void {
    this.getTableData(true);
    this.GetStateList()
    this.GetTenderTypeMaster()
    this.GetTenderCategoryMaster()
    this.GetTenderStatusMaster()
    this.GetorganizationMaster()
    this.GetPaymentModeMaster()
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }



  GetTenderTypeMaster() {
    this.userService.getQuestionPaper(`uspGetTenderTypeMaster`).subscribe((res: any) => {
      this.tenderTypeDrp = res['table']
    })
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  GetTenderCategoryMaster() {
    this.userService.getQuestionPaper(`uspGetTenderCategoryMaster`).subscribe((res: any) => {
      this.tenderCategoryDrp = res['table']
    })
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  GetTenderStatusMaster() {
    this.userService.getQuestionPaper(`uspGetTenderStatusMaster`).subscribe((res: any) => {
      this.tenderStatusDrp = res['table']
    })
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  GetorganizationMaster() {
    this.userService.getQuestionPaper(`uspGetorganizationMaster`).subscribe((res: any) => {
      this.organizationDrp = res['table']
    })
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  GetPaymentModeMaster() {
    this.userService.getQuestionPaper(`uspGetPaymentModeMaster`).subscribe((res: any) => {
      this.paymentModeDrp = res['table']
    })
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  addEligibility() {
    if (this.eligiblityForm.invalid) {
      this.eligiblityForm.markAllAsTouched();
      return;
    }

    if (this.isEditMode && this.editIndex !== null) {
      // UPDATE
      this.eligibilityList[this.editIndex] = this.eligiblityForm.value;
      this.isEditMode = false;
      this.editIndex = null;
    } else {
      // ADD
      this.eligibilityList.push(this.eligiblityForm.value);
    }

    this.eligiblityForm.reset({
      jointVentureAllowed: false
    });
  }

  editEligibility(index: number) {
    this.isEditMode = true;
    this.editIndex = index;
    this.eligiblityForm.patchValue(this.eligibilityList[index]);
  }

  deleteEligibility(index: number) {
    this.eligibilityList.splice(index, 1);
  }

  addSchedule() {
    if (this.schedulesForm.invalid) {
      this.schedulesForm.markAllAsTouched();
      return;
    }

    if (this.isScheduleEditMode && this.scheduleEditIndex !== null) {
      // UPDATE
      this.schedulesList[this.scheduleEditIndex] = this.schedulesForm.value;
      this.isScheduleEditMode = false;
      this.scheduleEditIndex = null;
    } else {
      // ADD
      this.schedulesList.push(this.schedulesForm.value);
    }

    this.schedulesForm.reset();
  }

  editSchedule(index: number) {
    this.isScheduleEditMode = true;
    this.scheduleEditIndex = index;
    this.schedulesForm.patchValue(this.schedulesList[index]);
  }

  deleteSchedule(index: number) {
    this.schedulesList.splice(index, 1);
  }

  addFeeEmd() {
    if (this.feeEmdForm.invalid) {
      this.feeEmdForm.markAllAsTouched();
      return;
    }

    if (this.isFeeEditMode && this.feeEditIndex !== null) {
      // UPDATE
      this.feeEmdList[this.feeEditIndex] = this.feeEmdForm.value;
      this.isFeeEditMode = false;
      this.feeEditIndex = null;
    } else {
      // ADD
      this.feeEmdList.push(this.feeEmdForm.value);
    }

    this.feeEmdForm.reset();
  }

  editFeeEmd(index: number) {
    this.isFeeEditMode = true;
    this.feeEditIndex = index;
    this.feeEmdForm.patchValue(this.feeEmdList[index]);
  }

  deleteFeeEmd(index: number) {
    this.feeEmdList.splice(index, 1);
  }


  addDocumentDetails() {
    if (this.documentDetailsForm.invalid) {
      this.documentDetailsForm.markAllAsTouched();
      return;
    }

    const newDoc = {
      ...this.documentDetailsForm.value,
      // uploadDocumentUrl: this.uploadedDocumentUrl,
      uploadDocument:this.uploadedDocumentUrl,
      addenumUpload: this.uploadedAddenumUrl
    };

    if (this.isDocumentEditMode && this.documentEditIndex !== null) {
      // UPDATE
      this.documentList[this.documentEditIndex] = newDoc;
      this.isDocumentEditMode = false;
      this.documentEditIndex = null;
    } else {
      // ADD
      this.documentList.push(newDoc);
    }
    this.documentDetailsForm.reset();
    this.uploadedDocumentUrl = null;
    this.uploadedAddenumUrl = null;
  }


  editDocumentDetails(index: number) {
    this.isDocumentEditMode = true;
    this.documentEditIndex = index;
    const doc = this.documentList[index];
    this.uploadedDocumentUrl = doc.uploadDocument;
    this.uploadedAddenumUrl = doc.addenumUpload;

    this.documentDetailsForm.patchValue({
      uploadDocument: doc.uploadDocument,
      documentType: doc.documentType,
      specification: doc.specification,
      TermsAndcondition: doc.TermsAndcondition,
      addenumUpload: doc.addenumUpload
    });
  }


  deleteDocumentDetails(index: number) {
    this.documentList.splice(index, 1);
  }


  isDocumentDetails(controlName: string): boolean {
    const control = this.documentDetailsForm.get(controlName);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  // --- Open/Close Dialog ---
  openResumeUploadDialog1() {
    this.showAddenumDialog = true;
    this.selectedAddenumFile = null;
    this.cdr.detectChanges();
  }


  closeResumeUploadDialog1() {
    this.showAddenumDialog = false;
    this.selectedAddenumFile = null;
    this.cdr.detectChanges();
  }


  // --- File Selection ---
  onResumeFileSelect1(event: any) {
    if (event.files && event.files.length > 0) {
      this.selectedAddenumFile = event.files[0];
      this.cdr.detectChanges();
    }
  }

  // --- Clear Selection ---
  clearResumeSelection1() {
    this.selectedAddenumFile = null;
    if (this.addenumFileUpload) {
      this.addenumFileUpload.clear();
    }
    this.cdr.detectChanges();
  }

  // --- Upload Resume ---
  uploadResume1() {
    try {
      if (!this.selectedAddenumFile) {
        this.message.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'Please select a addenum file.',
          life: 3000
        });
        return;
      }

      this.isUploadingAddenum = true;
      this.cdr.detectChanges();

      const filesArray: File[] = [this.selectedAddenumFile];
      const folderName = 'CandidateResume';

      this.userService.MastrtfileuploadNew(filesArray, folderName).subscribe({
        next: (datacom: any) => {
          this.isUploadingAddenum = false;
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
              const fullUrl = this.normalizeImagePath1(relativePath);
              this.documentDetailsForm.patchValue({
                addenumUpload: relativePath
              });

              this.uploadedAddenumUrl = fullUrl;

              this.message.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Resume uploaded successfully!',
                life: 3000
              });

              this.closeResumeUploadDialog1();
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
          this.isUploadingAddenum = false;
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
      this.isUploadingAddenum = false;
      this.message.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Something went wrong while uploading resume.',
        life: 3000
      });

      this.cdr.detectChanges();
    }
  }

  normalizeImagePath1(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) {
      return path;
    }
    let normalizedPath = path.replace(/\\/g, '/');
    normalizedPath = normalizedPath.replace(/([^:]\/)\/+/g, '$1');
    return this.configService.baseUrl + normalizedPath;
  }

  getFileSize1(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  removeResume1() {
    this.uploadedAddenumUrl = '';
    this.documentDetailsForm.patchValue({
      addenumUpload: ''
    });
    this.message.add({
      severity: 'info',
      summary: 'Removed',
      detail: 'Resume removed successfully.',
      life: 2000
    });
  }

  // --- Open/Close Dialog ---
  openResumeUploadDialog() {
    this.showUploadDialog = true;
    this.selectedDocumentFile = null;
    this.cdr.detectChanges();
  }

  closeResumeUploadDialog() {
    this.showUploadDialog = false;
    this.selectedDocumentFile = null;
    this.cdr.detectChanges();
  }

  // --- File Selection ---
  onResumeFileSelect(event: any) {
    if (event.files && event.files.length > 0) {
      this.selectedDocumentFile = event.files[0];
      this.cdr.detectChanges();
    }
  }

  // --- Clear Selection ---
  clearResumeSelection() {
    this.selectedDocumentFile = null;
    if (this.docFileUpload) {
      this.docFileUpload.clear();
    }
    this.cdr.detectChanges();
  }

  // --- Upload Resume ---
  uploadResume() {
    try {
      if (!this.selectedDocumentFile) {
        this.message.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'Please select a resume file.',
          life: 3000
        });
        return;
      }

      this.isUploadingDocument = true;
      this.cdr.detectChanges();

      const filesArray: File[] = [this.selectedDocumentFile];
      const folderName = 'CandidateResume';

      this.userService.MastrtfileuploadNew(filesArray, folderName).subscribe({
        next: (datacom: any) => {
          this.isUploadingDocument = false;

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

              this.documentDetailsForm.patchValue({
                uploadDocument: relativePath
              });

              this.uploadedDocumentUrl = fullUrl;

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
          this.isUploadingDocument = false;
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
      this.isUploadingDocument = false;

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

  removeResume() {
    this.uploadedDocumentUrl = '';
    this.documentDetailsForm.patchValue({
      uploadDocument: ''
    });
    this.message.add({
      severity: 'info',
      summary: 'Removed',
      detail: 'Resume removed successfully.',
      life: 2000
    });
  }


  onCheckboxChange1(fieldName: string, event: any) {
    const isChecked = event.target.checked;
    this.eligiblityForm.get(fieldName)?.setValue(isChecked);
  }

  isEligiblityForm(controlName: string): boolean {
    const control = this.eligiblityForm.get(controlName);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  isFeeEmdForm(controlName: string): boolean {
    const control = this.feeEmdForm.get(controlName);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  isSchedulesForm(controlName: string): boolean {
    const control = this.schedulesForm.get(controlName);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  isDocumentForm(controlName: string): boolean {
    const control = this.documentDetailsForm.get(controlName);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }


  toUppercase(controlName: string) {
    const control = this.groupMasterForm1.get(controlName);
    if (control?.value) {
      control.setValue(control.value.toUpperCase(), { emitEvent: false });
    }
  }

  allowOnlyNumbers(event: any) {
    event.target.value = event.target.value.replace(/[^0-9]/g, '');
  }



  onCheckboxChange(fieldName: string, event: any) {
    const isChecked = event.target.checked;
    this.groupMasterForm1.get(fieldName)?.setValue(isChecked);
  }


  GetStateList() {
    this.userService.getQuestionPaper(`uspGetStateCityDrp|action=STATE|id=0`).subscribe((res: any) => {
      this.stateListDrp = res['table']
    })
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  onStateChange(event: any) {
    const stateId = event.value;
    this.GetDistrictList(stateId);
  }

  GetDistrictList(stateId: any, callback?: Function) {
    this.userService
      .getQuestionPaper(`uspGetCityList|action=CITY|id=${stateId}`)
      .subscribe((res: any) => {
        this.districtListDrp = res['table'] || [];
        if (callback) callback(); // district patch after list loaded
      });
  }


  allowOnlyNumberDecimal(event: KeyboardEvent) {
    const input = event.key;
    if (['Backspace', 'ArrowLeft', 'ArrowRight', 'Delete', 'Tab'].includes(input)) {
      return;
    }
    if (/^[0-9]$/.test(input)) {
      return;
    }
    if (input === '.') {
      const value = (event.target as HTMLInputElement).value;
      if (!value.includes('.')) {
        return;
      }
    }
    event.preventDefault();
  }

  blockInvalidPaste(event: ClipboardEvent) {
    const pasteData = event.clipboardData?.getData('text') ?? '';
    const valid = /^\d*\.?\d*$/.test(pasteData);

    if (!valid) {
      event.preventDefault();
    }
  }

  allowOnlyDigits(event: KeyboardEvent) {
    const input = event.key;

    // Allow control keys
    if (['Backspace', 'ArrowLeft', 'ArrowRight', 'Delete', 'Tab'].includes(input)) {
      return;
    }

    // Allow digits only
    if (/^[0-9]$/.test(input)) {
      return;
    }

    event.preventDefault();
  }

  blockNonDigitPaste(event: ClipboardEvent) {
    const paste = event.clipboardData?.getData('text') ?? '';
    if (!/^\d+$/.test(paste)) {
      event.preventDefault();
    }
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
      this.userService.getQuestionPaper(`uspGetTenderDetails|${query}`).subscribe({
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

  parseJson(value: any): any[] {
    if (!value) return [];
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return [];
      }
    }
    return Array.isArray(value) ? value : [];
  }



  showDialog(view: string, data: any) {
    this.selectedIndex = data;
    this.visible = true;
    this.postType = view;
    this.header = view === 'add' ? 'Add' : view === 'update' ? 'Update' : 'View';
    this.headerIcon = view === 'add' ? 'pi pi-plus' : view === 'update' ? 'pi pi-pencil' : 'pi pi-eye';

    this.eligibilityList = [];
    this.schedulesList = [];
    this.feeEmdList = [];
    this.documentList = [];

    if (view === 'add') return;

    this.groupMasterForm1.patchValue({
      refNo: data.tenderReferenceNo,
      title: data.tenderTittle,
      tenderCost: data.tenderCost,
      organization: data.organizationID,
      tenderType: data.tenderTypeID,
      tenderCategory: data.tenderCategoryId,
      tenderStatus: data.tenderStatusId,
      authority: data.tenderIssueAuth,
      description: data.tenderDescription
    });
    this.eligibilityList = this.parseJson(data.eligibleJson);
    this.schedulesList = this.parseJson(data.dateJson);

    this.feeEmdList = this.parseJson(data.feesjson).map(f => ({
      tenderFeeAmount: f.tenderFeeAmount,
      emdAmount: f.emdAmount,
      paymentMode: f.PaymentMode,
      bankDetails: f.bankDetails,
      refundRules: f.refundRules,
      emdExemption: f.emdExemption
    }));

    this.documentList = this.parseJson(data.docJson).map(d => ({
      uploadDocument: d.uploadDoc,
      addenumUpload: d.addendum,
      documentType: d.docType,
      specification: d.specification,
      TermsAndcondition: d.termsAndCondition
    }));    
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

  onDrawerHide() {
    document.body.style.overflow = 'visible'; // restore scroll
    this.groupMasterForm1.enable()
    this.groupMasterForm1.reset()

    this.eligiblityForm.enable()
    this.eligiblityForm.reset()

    this.schedulesForm.enable()
    this.schedulesForm.reset()

    this.feeEmdForm.enable()
    this.feeEmdForm.reset()

    this.documentDetailsForm.enable()
    this.documentDetailsForm.reset()

    this.schedulesList = []
    this.feeEmdList = []
    this.eligibilityList = []
    this.documentList = []

    this.visible = false;
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
          // this.childArrData = []
        }
        else if (option === '5') {
          this.groupMasterForm1.reset()
        }
      },
      reject: () => {
        if (option === '4') {
          this.groupMasterForm1.patchValue({
            groupType: this.previousGroupType
          })
        }
      }
    });
  }

  onClear() {
    this.groupMasterForm1.reset();
  }


  onSubmit(event: any) {
    if (!this.groupMasterForm1.valid) {
      this.groupMasterForm1.markAllAsTouched();
      return;
    }

    if (!this.schedulesList || this.schedulesList.length === 0) {
      this.message.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please add at least one Schedule entry.',
        life: 3000
      });
      return;
    }

    if (!this.feeEmdList || this.feeEmdList.length === 0) {
      this.message.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please add at least one Fee/EMD entry.',
        life: 3000
      });
      return;
    }


    if (!this.eligibilityList || this.eligibilityList.length === 0) {
      this.message.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please add at least one Eligibility entry.',
        life: 3000
      });
      return;
    }

    if (!this.documentList || this.documentList.length === 0) {
      this.message.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please add at least one Document entry.',
        life: 3000
      });
      return;
    }

    let organization = this.groupMasterForm1.get('organization')?.value;
    let tenderCategory = this.groupMasterForm1.get('tenderCategory')?.value;
    let tenderType = this.groupMasterForm1.get('tenderType')?.value;
    let tenderStatus = this.groupMasterForm1.get('tenderStatus')?.value;
    const refNo = String(this.groupMasterForm1.get('refNo')?.value || '').trim();
    const tenderCost = String(this.groupMasterForm1.get('tenderCost')?.value || '').trim();
    const title = String(this.groupMasterForm1.get('title')?.value || '').trim();
    const description = String(this.groupMasterForm1.get('description')?.value || '').trim();
    const authority = String(this.groupMasterForm1.get('authority')?.value || '').trim();
    const baseUrl = 'https://elocker.nobilitasinfotech.com/';

    const eligibleJson = JSON.stringify(this.eligibilityList.map(e => ({
      techEligib: e.techEligib,
      financialCriteria: e.financialCriteria,
      experCriteria: e.experCriteria,
      mandatoryCertificates: e.mandatoryCertificates,
      jointVentureAllowed: e.jointVentureAllowed,
      oemManufactreCrt: e.oemManufactreCrt
    })));

    const dateJson = JSON.stringify(this.schedulesList.map(s => ({
      nitPublishDate: s.nitPublishDate,
      docDownStartDate: s.docDownStartDate,
      bidSubStartDate: s.bidSubStartDate,
      bidSubEndDate: s.bidSubEndDate,
      bidOPeningDate: s.bidOPeningDate,
      finBidOPenDate: s.finBidOPenDate,
      preBidMeetingDate: s.preBidMeetingDate,
      bidValidity: s.bidValidity
    })));

    const feesJson = JSON.stringify(this.feeEmdList.map(f => ({
      tenderFeeAmount: f.tenderFeeAmount,
      emdAmount: f.emdAmount,
      emdExemption: f.emdExemption,
      paymentMode: f.paymentMode,
      bankDetails: f.bankDetails,
      refundRules: f.refundRules
    })));
    

    const docJson = JSON.stringify(this.documentList.map(d => ({
      uploadDoc: d.uploadDocument,
      docType: d.documentType,
      specification: d.specification,
      termsAndCondition: d.TermsAndcondition,
      addendum: d.addenumUpload
    })));

    this.paramvaluedata = `tenderReferenceNo=${refNo}|tenderCost=${tenderCost}|tenderTypeID=${tenderType}|tenderStatusId=${tenderStatus}|tenderTittle=${title}|organizationID=${organization}|tenderCategoryId=${tenderCategory}|tenderIssueAuth=${authority}|tenderDescription=${description}|docJson=${docJson}|eligibleJson=${eligibleJson}|feesjson=${feesJson}|dateJson=${dateJson}`;

    this.openConfirmation('Confirm?', 'Are you sure you want to proceed?', '1', '1', event);
  }


  submitcall() {
    this.isFormLoading = true;
    let query = '';
    let SP = '';

    if (this.postType === 'update') {
      query = `${this.paramvaluedata}|ID=${this.selectedIndex.id}|userId=${sessionStorage.getItem('userId')}`;
      SP = `uspUpdateTenderDetails`;
    }
    else {
      query = `${this.paramvaluedata}|userId=${sessionStorage.getItem('userId')}`;
      SP = `uspPostTenderDetails`;
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


  blockTyping(event: KeyboardEvent) {
    event.preventDefault();
  }


  openCalendar(event: any) {
    event.target.showPicker();
  }


  deleteData() {
    try {
      this.isFormLoading = true;
      let query = `ID=${this.selectedIndex.id}|userId=${sessionStorage.getItem('userId')}`;
      this.userService.SubmitPostTypeData(`uspDeleteTenderDetails`, query, 'header').subscribe({
        next: (datacom: any) => {
          this.isFormLoading = false;
          try {
            if (!datacom) return;
            const resultarray = datacom.split('-');
            if (resultarray[1] === 'success') {
              this.pageNo = 1;
              this.getTableData(true);
              this.message.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Data deleted successfully.',
                life: 3000
              });
              this.onDrawerHide();
            } else {
              this.message.add({
                severity: 'warn',
                summary: 'Warning',
                detail: resultarray[1] || datacom,
                life: 3000
              });
            }
          } catch (innerErr) {
            console.error('Error processing response:', innerErr);
            this.message.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Something went wrong while processing response.',
              life: 3000
            });
          }
        },
        error: (err) => {
          this.isFormLoading = false;
          console.error('API call failed:', err);
          if (err.status === 401 || err.status === 403) {
            this.message.add({
              severity: 'error',
              summary: 'Session Expired',
              detail: 'Your session has expired. Please log in again.',
              life: 3000
            });
            this.Customvalidation.loginroute(err.status);
          } else {
            this.message.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete data. Please try again later.',
              life: 3000
            });
          }
        }
      });

    } catch (error) {
      console.error('Unexpected error in deleteData():', error);
      this.isFormLoading = false;
    }
  }

  onDeleteRow(data: any, index: number) {
    this.selectedrowIndex = index
    this.openConfirmation("Confirm", "Are you sure want to delete?", '1', '5');
  }

  // 	Schedule & Date 
  showGrouplist(data: any) {
    this.itemDailog = true;
    if (typeof data.dateJson === 'string') {
      try {
        data.dateJson = JSON.parse(data.dateJson);
      } catch {
        data.dateJson = [];
      }
    }
    else if (!Array.isArray(data.dateJson)) {
      data.dateJson = [];
    }
    this.groupListArray = data.dateJson;
  }

  // 	Fee
  showGrouplist1(data: any) {
    this.itemDailog1 = true;
    if (typeof data.feesjson === 'string') {
      try {
        data.feesjson = JSON.parse(data.feesjson);
      } catch {
        data.feesjson = [];
      }
    }
    else if (!Array.isArray(data.feesjson)) {
      data.feesjson = [];
    }
    this.groupListArray1 = data.feesjson;
  }

  // Eligibility List 
  showGrouplist2(data: any) {    
    this.itemDailog2 = true;
    if (typeof data.eligibleJson === 'string') {
      try {
        data.eligibleJson = JSON.parse(data.eligibleJson);
      } catch {
        data.eligibleJson = [];
      }
    }
    else if (!Array.isArray(data.eligibleJson)) {
      data.eligibleJson = [];
    }
    this.groupListArray2 = data.eligibleJson;
  }


  // Document Details
  showGrouplist3(data: any) {
    this.itemDailog3 = true;
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
    this.groupListArray3 = data.docJson;
  }


}
