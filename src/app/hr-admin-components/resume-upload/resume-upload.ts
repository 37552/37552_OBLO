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
import { HttpErrorResponse } from '@angular/common/http';
import { TableModule } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { FileUploadModule } from 'primeng/fileupload';
import { ConfigService } from '../../shared/config.service';
import { OnlyNumberDirective } from '../../shared/directive/only-number.directive';
import { OnlyStringDirective } from '../../shared/directive/only-string.directive';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { Tab } from '../../table-template/table-template';

interface CandidateDetails {
  candidateName: string;
  applyFor: string;
  candidateEmail: string;
  candidatePhone: string;
  experience: string;
  ctc: string;
  expectedCTC: string;
  negotiableCTC: string;
  noticePeriod: string;
  remarks: string;
  resumeUpload: string;
}

@Component({
  selector: 'app-resume-upload',
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
    MultiSelectModule,
    Toast,
    Tooltip,
    Dialog,
    TableModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    FileUploadModule,
    OnlyNumberDirective,
    OnlyStringDirective,
    BreadcrumbModule
  ],
  providers: [
    ConfirmationService,
    MessageService
  ],
  templateUrl: './resume-upload.html',
  styleUrl: './resume-upload.scss'
})
export class ResumeUpload {
  @ViewChild('resumeFileUpload') resumeFileUpload: any;
  breadcrumbItems!: ({ label: any; disabled?: undefined; } | { label: any; disabled: boolean; })[];
  pageNo = 1;
  pageSize = 5;
  searchText = '';
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  menulabel: any;
  FormName: any;
  FormValue: any;
  param: string = '';
  isLoading = true;
  visible: boolean = false;
  postType: string = '';
  header: any = '';
  selectedIndex: any = [];
  headerIcon: string = 'pi pi-plus';
  paramvaluedata: string = '';
  isFormLoading: boolean = false;
  data: any[] = [];
  candidateResumeForm: FormGroup;
  groupListArray = []
  totalCount = 0;
  qualificationDrp: any = [];
  indentNumber: any = [];
  divisionDrp: any = [];
  departmentDrp: any = [];
  designationDrp: any = [];
  profileDrp: any = [];
  locationDrp: any = [];
  reportingTo: any = [];
  itemDailog: boolean = false;
  indentDrp = [];
  appliedForDrp = [];
  showResumeUploadDialog = false;
  selectedResumeFile: File | null = null;
  uploadedResumeUrl: string | null = null;
  isUploadingResume = false;
  candidateDetailsArray: any[] = [];
  indentNo: any;
  selectedRowDetails: any[] = [];
  searchValue: string = '';

  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true, },
    { key: 'indentNo', header: 'Indent No', isVisible: true, isSortable: false },
    { key: 'division', header: 'Division', isVisible: true, isSortable: false },
    { key: 'department', header: 'Department', isVisible: true, isSortable: false },
    { key: 'profile', header: 'Profile', isVisible: true, isSortable: false },
    { key: 'location', header: 'Location', isVisible: true, isSortable: false },
    { key: 'reporting', header: 'Reporting', isVisible: true, isSortable: false },
    { key: 'jsonDetails', header: 'Details', isVisible: true, isSortable: false, isCustom: true }
  ]

  constructor(private fb: FormBuilder,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private message: MessageService,
    public Customvalidation: Customvalidation,
    private configService: ConfigService,
    private cdr: ChangeDetectorRef) {

    this.candidateResumeForm = this.fb.group({
      candidateNameControl: ['', [Validators.required, noInvalidPipelineName(), Validators.minLength(3), Validators.maxLength(35)]],
      applyForIdControl: ['', [Validators.required]],
      candidateEmailControl: ['', [Validators.required, Validators.pattern('^[A-Za-z0-9._%-]+@[A-Za-z0-9._%-]+\\.[a-z]{2,3}$')]],
      candidateMobileNoControl: ['', [Validators.required, Validators.pattern('^((\\+91-?)|0)?[6-9]{1}[0-9]{9}$')]],
      prevExpControl: ['', Validators.required],
      currentCtcControl: ['', Validators.required],
      expectCtcControl: ['', Validators.required],
      negoCtcControl: ['', Validators.required],
      noticePeriodControl: ['', [Validators.required, noInvalidPipelineName()]],
      remarkControl: ['', Validators.required],
      resumeUploadControl: ['', [Validators.required]],
    });

  }

  onCtcChange(event: any) {
    const expected = +this.candidateResumeForm.get('expectCtcControl')?.value;
    const negotiable = +this.candidateResumeForm.get('negoCtcControl')?.value;

    const negoControl = this.candidateResumeForm.get('negoCtcControl');

    if (expected && negotiable && negotiable > expected) {
      negoControl?.setErrors({ ...negoControl.errors, greaterThanExpected: true });
    } else {
      if (negoControl?.hasError('greaterThanExpected')) {
        const errors = { ...negoControl.errors };
        delete errors['greaterThanExpected'];
        negoControl.setErrors(Object.keys(errors).length ? errors : null);
      }
    }
  }
  get f() { return this.candidateResumeForm.controls }

  ngOnInit(): void {
    this.param = sessionStorage.getItem('menuItem') ?? '';
    let paramjs = JSON.parse(this.param);
    this.menulabel = paramjs.menu;
    this.FormName = paramjs.formName;
    this.FormValue = paramjs.formValue;
    this.getTableData(true);
    this.getDropDownData();
    this.breadcrumbItems = [
      { label: this.menulabel },
      { label: this.FormName, disabled: true }
    ];
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  getDropDownData() {
    this.isLoading = true;

    try {
      const roleId = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
      const userId = sessionStorage.getItem('userId');

      this.userService
        .getQuestionPaper(`uspGetResourceResumeUploadDetails|appUserId=${userId}|appUserRole=${roleId}`)
        .subscribe({
          next: (res: any) => {
            try {
              this.indentDrp = res['table'];
              this.appliedForDrp = res['table1'];
            } catch (innerErr) {
              console.error('Error processing dropdown response:', innerErr);
            }
          },
          error: (err) => {
            console.error('Error fetching dropdown data:', err);
            this.isLoading = false;
            this.cdr.detectChanges();
          },
          complete: () => {
            this.isLoading = false;
            this.cdr.detectChanges();
          },
        });
    } catch (err) {
      console.error('Unexpected error in getDropDownData:', err);
      this.isLoading = false;
      this.cdr.detectChanges();
    }

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }



  isInvalid(field: string): boolean {
    const control =
      this.candidateResumeForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getTableData(isTrue: boolean) {
    try {
      if (isTrue) this.isLoading = true;
      else this.pageNo = 1;

      const userId = sessionStorage.getItem('userId') || '';
      const roleId = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
      const query = `searchText=${this.searchText}|pageIndex=${this.pageNo}|size=${this.pageSize}|appUserId=${userId}|appUserRole=${roleId}|districtId=${sessionStorage.getItem('District')}`;

      const spName = this.activeTabValue === 0
        ? 'uspGetResourceResumeViewDetails'
        : 'uspGetResourceResumeViewDetailsProcessed';

      this.userService.getQuestionPaper(`${spName}|${query}`).subscribe({
        next: (res: any) => {
          try {
            this.data = res?.table1 || [];
            this.totalCount = res?.table?.[0]?.totalCnt || this.data.length;
            this.updateTabCount();

          } catch (innerErr) {
            console.error('Error processing response:', innerErr);
            this.data = [];
            this.totalCount = 0;
          } finally {
            this.isLoading = false;
            this.cdr.detectChanges();
          }
        },
        error: (err) => {
          console.error('API call failed:', err);
          this.isLoading = false;
          if (err.status === 403) this.Customvalidation.loginroute(err.status);
          else { this.data = []; this.totalCount = 0; }
        }
      });

      this.cdr.detectChanges();
    } catch (error) {
      console.error('Unexpected error in getTableData():', error);
      this.isLoading = false;
    }
    this.cdr.detectChanges();
  }

  getTabCounts() {
    const userId = sessionStorage.getItem('userId') || '';
    const roleId = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;

    const query =
      `searchText=` +
      `|pageIndex=1` +
      `|size=1` +
      `|districtId=${sessionStorage.getItem('District')}` +
      `|appUserId=${userId}` +
      `|appUserRole=${roleId}`;

    // Pending API
    this.userService
      .getQuestionPaper(`uspGetResourceResumeViewDetails|${query}`)
      .subscribe((res: any) => {
        const count = res?.table?.[0]?.totalCnt || 0;
        const pendingTab = this.tabs.find(t => t.value === 0);
        if (pendingTab) pendingTab.count = count;
      });

    // Processed API
    this.userService
      .getQuestionPaper(`uspGetResourceResumeViewDetailsProcessed|${query}`)
      .subscribe((res: any) => {
        const count = res?.table?.[0]?.totalCnt || 0;
        const processedTab = this.tabs.find(t => t.value === 1);
        if (processedTab) processedTab.count = count;
      });
  }


  showDialog(view: string, data: any) {
    this.indentNo = data.id;
    this.selectedIndex = data;
    this.visible = true;
    this.postType = view;
    this.header = view === 'add' ? 'Add Candidate' : view === 'update' ? 'Update' : 'View';
    this.headerIcon = view === 'add' ? 'pi pi-plus' : view === 'update' ? 'pi pi-pencil' : 'pi pi-eye';

    if (view === 'add') {
      this.candidateResumeForm.reset();
      this.candidateResumeForm.enable();

    } else {
      if (view === 'view') {
        this.candidateResumeForm.disable();
      } else {
        this.candidateResumeForm.enable();
      }
    }

    document.body.style.overflow = 'hidden';
  }


  onPageChange(newPage: number) {
    this.pageNo = newPage;
    this.getTableData(true);
  }

  onPageSizeChange(newSize: number) {
    this.pageSize = newSize;
    this.pageNo = 1;
    this.getTableData(true);
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

  onDrawerHide() {
    document.body.style.overflow = 'visible';
    this.visible = false;
    this.candidateResumeForm.enable();
    this.candidateResumeForm.reset();
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
        }
        else if (option === '4') {
        }
        else if (option === '5') {
          this.candidateResumeForm.reset()
        }
      },
      reject: () => {
        if (option === '4') {
        }
      }
    });
  }



  onSubmit(event: any) {
    if (!this.candidateResumeForm.valid) {
      this.candidateResumeForm.markAllAsTouched();
      return;
    }

    this.paramvaluedata = ''
    this.candidateDetailsArray = [];

    let candidateName = this.candidateResumeForm.get(`candidateNameControl`)?.value ?? [];
    let applyFor = this.candidateResumeForm.get(`applyForIdControl`)?.value ?? [];
    let candidateEmail = this.candidateResumeForm.get(`candidateEmailControl`)?.value ?? [];
    let candidatePhone = this.candidateResumeForm.get(`candidateMobileNoControl`)?.value ?? [];
    let experience = this.candidateResumeForm.get(`prevExpControl`)?.value ?? [];
    let ctc = this.candidateResumeForm.get(`currentCtcControl`)?.value ?? [];
    let expectedCTC = this.candidateResumeForm.get(`expectCtcControl`)?.value ?? [];
    let negotiableCTC = this.candidateResumeForm.get(`negoCtcControl`)?.value ?? [];
    let noticePeriod = this.candidateResumeForm.get(`noticePeriodControl`)?.value ?? [];
    let remarks = this.candidateResumeForm.get(`remarkControl`)?.value ?? [];
    let resumeUpload = this.candidateResumeForm.get(`resumeUploadControl`)?.value ?? [];

    const itemVar: CandidateDetails = {
      candidateName,
      applyFor,
      candidateEmail,
      candidatePhone,
      experience,
      ctc,
      expectedCTC,
      negotiableCTC,
      noticePeriod,
      remarks,
      resumeUpload
    };

    this.candidateDetailsArray.push(itemVar);
    this.openConfirmation('Confirm?', 'Are you sure you want to proceed?', '1', '1', event);
  }


  submitcall() {
    try {
      this.isFormLoading = true;
      let query = '';
      let SP = '';

      let candidateJson = JSON.stringify(this.candidateDetailsArray)
      query = `indentNoId=${this.indentNo}|appUserId=${sessionStorage.getItem('userId')}|resumeJson=${candidateJson}`
      SP = `uspPostResourceResumeDetails`;

      this.userService.SubmitPostTypeData(SP, query, this.FormName).subscribe({
        next: (datacom: any) => {
          this.isFormLoading = false;
          try {
            if (!datacom) return;
            const resultarray = datacom.split('-');
            if (resultarray[1] === 'success') {
              this.getTableData(false);
              this.message.add({
                severity: 'success',
                summary: 'Success',
                detail: this.postType === 'update' ? 'Data Updated Successfully.' : 'Data Saved Successfully.',
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
            console.warn('Unauthorized or Forbidden - redirecting to login...');
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
              detail: 'Something went wrong.',
              life: 3000
            });
          }
        }
      });
    } catch (error: any) {
      console.error('Unexpected error in submitcall():', error);
      this.isFormLoading = false;
      this.message.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Something went wrong',
        life: 3000
      });
    }
  }
  activeTabValue: number = 0;

  onTabChange(newValue: string | number) {
    this.activeTabValue = Number(newValue);
    this.pageNo = 1;
    this.searchText = '';
    this.getTableData(true);
  }

  tabs: Tab[] = [
    { label: 'Pending Request', count: 0, value: 0 },
    { label: 'Processed Request', count: 0, value: 1 }
  ];

  updateTabCount() {
    const activeTab = this.tabs.find(tab => tab.value === this.activeTabValue);
    if (activeTab) {
      activeTab.count = this.totalCount;
    }
  }

  onClear() {
    this.candidateResumeForm.reset();
  }

  openDetailModal(rowData: any) {
    this.itemDailog = true;
    if (typeof rowData.details === 'string') {
      try {
        rowData.details = JSON.parse(rowData.details);
      } catch {
        rowData.details = [];
      }
    } else if (!Array.isArray(rowData.details)) {
      rowData.details = [];
    }

    this.selectedRowDetails = rowData.details;
  }

  // --- Open/Close Dialog ---
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

  // --- File Selection ---
  onResumeFileSelect(event: any) {
    if (event.files && event.files.length > 0) {
      this.selectedResumeFile = event.files[0];
      this.cdr.detectChanges();
    }
  }

  // --- Clear Selection ---
  clearResumeSelection() {
    this.selectedResumeFile = null;
    if (this.resumeFileUpload) {
      this.resumeFileUpload.clear();
    }
    this.cdr.detectChanges();
  }

  // --- Upload Resume ---
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
      const folderName = 'CandidateResume';

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

              this.candidateResumeForm.patchValue({
                resumeUploadControl: relativePath
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
    this.candidateResumeForm.patchValue({
      resumeUploadControl: ''
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

}

