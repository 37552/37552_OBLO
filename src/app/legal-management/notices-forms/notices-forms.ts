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
import { TableModule } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { FileUploadModule } from 'primeng/fileupload';
import { OnlyNumberDirective } from '../../shared/directive/only-number.directive';
import { OnlyStringDirective } from '../../shared/directive/only-string.directive';
import { BreadcrumbModule } from 'primeng/breadcrumb';

@Component({
  selector: 'app-notices-forms',
  imports: [
    TableTemplate,
    TableModule,
    IconFieldModule,
    CardModule,
    InputIconModule,
    InputTextModule,
    ButtonModule,
    FileUploadModule,
    OnlyNumberDirective,
    OnlyStringDirective,
    BreadcrumbModule,
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
    Dialog
  ],


  providers: [
    ConfirmationService,
    MessageService
  ],
  templateUrl: './notices-forms.html',
  styleUrl: './notices-forms.scss'
})

export class NoticesForms {
  @ViewChild('resumeFileUpload') resumeFileUpload: any;

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
  groupListArray = []
  noticetypeDrp = [];
  statusDrp = [];
  partyMaster = [];
  caseDetailsDrp= [];
  contractTypeDrp= [];
  searchValue: string = '';

  
  showResumeUploadDialog = false;
  selectedResumeFile: File | null = null;
  uploadedResumeUrl: string | null = null;
  isUploadingResume = false;
  selectedRowDetails: any[] = [];

  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true, },
    { key: 'noticeCode', header: 'Notice', isVisible: true, isSortable: false },
    { key: 'noticeType', header: 'Notice Type', isVisible: true, isSortable: false },
    { key: 'subject', header: 'Notice Subject', isVisible: true, isSortable: false },
    { key: 'dateSentReceive', header: 'Date Sent/Date Received', isVisible: true, isSortable: false },
    { key: 'sentBy', header: 'Sent By', isVisible: true, isSortable: false },
    { key: 'sentTo', header: 'Sent To', isVisible: true, isSortable: false },
    { key: 'linkCase', header: 'Linked Case', isVisible: true, isSortable: false },
    { key: 'linkContract', header: 'Linked Contract', isVisible: true, isSortable: false },
    { key: 'legalOwnerName', header: 'Name (from Legal Owner)', isVisible: true, isSortable: false },
    { key: 'remarks', header: 'Remarks', isVisible: true, isSortable: false },
    { key: 'noticeStatus', header: 'Status', isVisible: true, isSortable: false },
    { key: 'jsonDetails', header: 'Attachment', isVisible: true, isSortable: false, isCustom: true }
  ];

  pageNo = 1;
  pageSize = 5;
  searchText = '';
  totalCount = 0;
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  itemDailog: boolean = false


  constructor(private fb: FormBuilder,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private message: MessageService,
    private configService: ConfigService,
    public Customvalidation: Customvalidation,
    private cdr: ChangeDetectorRef) {

    this.groupMasterForm1 = this.fb.group({
      noticetype: ['', Validators.required],
      noticesubject: ['', [Validators.required, noInvalidPipelineName()]],
      dateRecived: ['', Validators.required],
      sentBy: ['', Validators.required],
      sentTo: ['', Validators.required],
      status: ['', Validators.required],
      linkedCase: [''],
      linkedcontract: ['', Validators.required],
      nameFromLegarOwner: ['', [Validators.required, noInvalidPipelineName()]],
      remarks: ['', [Validators.required, noInvalidPipelineName()]],
      attachment: ['', Validators.required],
    });

  }

  get f() { return this.groupMasterForm1.controls }

  ngOnInit(): void {
    this.getTableData(true);
    this.getNoticeType()
    this.getSatus()
    this.getPartyTypeMaster()
    this.getContractMaster()
    this.getCaseDetailsMaster()
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  getNoticeType() {
    this.userService.getQuestionPaper(`uspGetNoticesTypes`).subscribe((res: any) => {
      this.noticetypeDrp = res['table'];
    })
  }

  getSatus() {
    this.userService.getQuestionPaper(`uspGetNoticeStatusMaster`).subscribe((res: any) => {
      this.statusDrp = res['table'];
    })
  }

  getPartyTypeMaster() {
    this.userService.getQuestionPaper(`uspGetPartyTypeMaster`).subscribe((res: any) => {
      this.partyMaster = res['table'];
    })
  }

  getContractMaster() {
    this.userService.getQuestionPaper(`uspContractTypeDetailsMaster`).subscribe((res: any) => {
      this.contractTypeDrp = res['table'];
    })
  }

  getCaseDetailsMaster() {
    this.userService.getQuestionPaper(`uspGetCaseDetailsMaster`).subscribe((res: any) => {
      this.caseDetailsDrp = res['table'];
    })
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
      const roleId = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
      const query = `appUserId=${userId}|appUserRole=${roleId}|districtId=${sessionStorage.getItem('District')}|searchText=${this.searchText}|pageIndex=${this.pageNo}|size=${this.pageSize}`;      
      this.userService.getQuestionPaper(`uspGetNoticeDetails|${query}`).subscribe({
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
      // this.data = [];
      // this.totalCount = 0;
      // sessionStorage.clear();
      // localStorage.clear();
      // this.router.navigate(['/login']);
    }
  }

  
  showDialog(view: string, data: any) {
    this.selectedIndex = data;
    this.visible = true;
    this.postType = view;
    this.header =
      view === 'add' ? 'Add' : view === 'update' ? 'Update' : 'View';
    this.headerIcon =
      view === 'add' ? 'pi pi-plus' : view === 'update' ? 'pi pi-pencil' : 'pi pi-eye';

    if (view === 'add') {
      this.groupMasterForm1.reset();
      this.groupMasterForm1.enable();
    }
    else {
      if (view === 'view') {
        this.groupMasterForm1.disable();
      }
      else {
        this.groupMasterForm1.enable();
      }

      const cleanDate = data.dateSentReceive ? data.dateSentReceive.split('T')[0] : '';
      this.groupMasterForm1.patchValue({
        noticetype: data.noticeTypeId || '',
        noticesubject: data.subject || '',
        dateRecived:cleanDate,
        sentBy: data.sentById || '',
        sentTo: data.sentToId || '',
        status: data.noticeStatusId || '',
        linkedCase: data.linkCaseId || '',
        linkedcontract: data.linkContractId || '',
        nameFromLegarOwner: data.legalOwnerName || '',
        remarks: data.remarks || '',
        attachment: data.attachment || ''
      });

    }
    document.body.style.overflow = 'hidden'; // prevent background scroll
  }


  getFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

              this.groupMasterForm1.patchValue({
                attachment: relativePath
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
    this.groupMasterForm1.patchValue({
      attachment: ''
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


  onDrawerHide() {
    document.body.style.overflow = 'visible'; // restore scroll
    this.groupMasterForm1.enable();
    this.groupMasterForm1.reset();
    this.uploadedResumeUrl = '';
    this.selectedResumeFile = null;
    this.showResumeUploadDialog = false;
    this.cdr.detectChanges();
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
        }
      },
    });
  }

  onClear() {
    this.groupMasterForm1.reset()
  }

  blockTyping(event: KeyboardEvent) {
    event.preventDefault();
  }
  
  openCalendar(event: any) {
    event.target.showPicker();  // Browser ka built-in date picker open karega
  }
  


  onSubmit(event: any) {
    if (!this.groupMasterForm1.valid) {
      this.groupMasterForm1.markAllAsTouched();
      return;
    }

    const form = this.groupMasterForm1.value;
    this.paramvaluedata =
    `subject=${form.noticesubject}|` +
    `noticeTypeId=${form.noticetype}|` +
    `date=${form.dateRecived}|` +
    `sentById=${form.sentBy}|` +
    `sentToId=${form.sentTo}|` +
    `noticeStatusId=${form.status}|` +
    `linkCaseId=${form.linkedCase ? form.linkedCase : 0}|` +
    `linkContractId=${form.linkedcontract}|` +
    `ownerName=${form.nameFromLegarOwner}|` +
    `remarks=${form.remarks}|` +
    `attachment=${form.attachment}`;  
    this.openConfirmation('Confirm?', 'Are you sure you want to proceed?', '1', '1', event);
  }


  openDetailModal(rowData: any) {
    this.itemDailog = true;
  
    if (typeof rowData.attachment === 'string' && rowData.attachment.includes('[')) {
      try {
        this.selectedRowDetails = JSON.parse(rowData.attachment);
      } catch (e) {
        console.error('Error parsing attachment JSON:', e);
        this.selectedRowDetails = [];
      }
    }
    // If it's a single string path like '202511\\ICOMSAMS\\CandidateResume\\file.pdf'
    else if (typeof rowData.attachment === 'string' && rowData.attachment.trim() !== '') {
      this.selectedRowDetails = [{ resumeUpload: rowData.attachment }];
    }
    // If no attachment
    else {
      this.selectedRowDetails = [];
    }
  }
  

  submitcall() {
    this.isFormLoading = true;
    let query = '';
    let SP = '';

    if (this.postType === 'update') {
      query = `action=update|${this.paramvaluedata}|Id=${this.selectedIndex.id}|userId=${sessionStorage.getItem('userId')}`;
      SP = `uspUpdateDeleteNoticesDetails`;
    }
    else {
      query = `${this.paramvaluedata}|userId=${sessionStorage.getItem('userId')}`;
      SP = `uspPostNoticesDetails`;
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
      } else if (resultarray[0] == "2") {
        this.message.add({ severity: 'warn', summary: 'Warn', detail: resultarray[1] || datacom });
      }
      else {
        this.message.add({ severity: 'warn', summary: 'Warn', detail: datacom, });
      }
    });

  }


  deleteData() {
    try {
      this.isFormLoading = true;
      const selected = this.selectedIndex; // your selected notice object
      const query = 
        `action=delete|` +
        `subject=${selected.subject}|` +
        `noticeTypeId=${selected.noticeTypeId}|` +
        `date=${selected.dateSentReceive.split('T')[0]}|` + // only date part
        `sentById=${selected.sentById}|` +
        `sentToId=${selected.sentToId}|` +
        `linkCaseId=${selected.linkCaseId}|` +
        `linkContractId=${selected.linkContractId}|` +
        `ownerName=${selected.legalOwnerName}|` +
        `remarks=${selected.remarks}|` +
        `attachment=${selected.attachment}|` +
        `noticeStatusId=${selected.noticeStatusId}|` +
        `Id=${selected.id}|` +
        `userId=${sessionStorage.getItem('userId') || 0}`;
      this.userService.SubmitPostTypeData(`uspUpdateDeleteNoticesDetails`, query, 'header').subscribe({
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
      // this.message.add({
      //   severity: 'error',
      //   summary: 'Error',
      //   detail: 'Unexpected error occurred. Please log in again.',
      //   life: 3000
      // });
      // sessionStorage.clear();
      // localStorage.clear();
      // this.router.navigate(['/login']);
    }
  }

  
  showGrouplist(data: any) {
    this.itemDailog = true
    this.groupListArray = JSON.parse(data?.childDetails)
  }

}
