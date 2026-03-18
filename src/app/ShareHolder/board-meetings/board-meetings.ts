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
import { ConfigService } from '../../shared/config.service';
import { FileUploadModule } from 'primeng/fileupload';
import { TableModule } from 'primeng/table';


@Component({
  selector: 'app-board-meetings',
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
    Dialog,
    TableModule
  ],
  providers: [
    ConfirmationService,
    MessageService
  ],
  templateUrl: './board-meetings.html',
  styleUrl: './board-meetings.scss'
})

export class BoardMeetings {
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
  totalCount = 0;
  minDate: string = '';
  organisationDrp = [];
  selectedRowDetails: any[] = [];

  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true, },
    { key: 'organization', header: 'Organisation', isVisible: true, isSortable: false },
    { key: 'meetingType', header: 'Meeting Type', isVisible: true, isSortable: false },
    { key: 'meetingDate', header: 'Meeting Date', isVisible: true, isSortable: false },
    { key: 'meetingMode', header: 'Mode', isVisible: true, isSortable: false },
    { key: 'agenda', header: 'Agenda', isVisible: true, isSortable: false },
    { key: 'jsonDetails', header: 'Attendance Sheet', isVisible: true, isSortable: false, isCustom: true }
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
  meetingTypeDrp = [];
  meetingModeDrp = [];

  showResumeUploadDialog = false;
  selectedResumeFile: File | null = null;
  uploadedResumeUrl: string | null = null;
  isUploadingResume = false;

  constructor(private fb: FormBuilder,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private message: MessageService,
    private configService: ConfigService,
    public Customvalidation: Customvalidation,
    private cdr: ChangeDetectorRef) {

    this.groupMasterForm1 = this.fb.group({
      organization: ['', Validators.required],
      mettingType: ['', Validators.required],
      meetingMode: ['', Validators.required],
      meetingDate: ['', Validators.required],
      agenda: ['', [Validators.required, noInvalidPipelineName()]],
      attechment: ['', Validators.required],
    });

  }

  get f() { return this.groupMasterForm1.controls }

  ngOnInit(): void {
    this.getTableData(true);
    this.getOrganization();
    this.GetMeetingTypeMaster()
    this.GetMeetingModeMaster()
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  getOrganization() {
    const currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
    const roleId = currentRole?.roleId || '';
    const userId = sessionStorage.getItem('userId') || '';
    const districtId = sessionStorage.getItem('District') || '';
    this.userService.getQuestionPaper(`uspGetOrganisationMaster|appUserId=${userId}|appUserRole=${roleId}|districtId=${districtId}`).subscribe((res: any) => {
      this.organisationDrp = res['table']
    })
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }


  GetMeetingTypeMaster() {
    const currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
    const roleId = currentRole?.roleId || '';
    const userId = sessionStorage.getItem('userId') || '';
    const districtId = sessionStorage.getItem('District') || '';
    this.userService.getQuestionPaper(`uspGetMeetingTypeMaster|appUserId=${userId}|appUserRole=${roleId}|districtId=${districtId}`).subscribe((res: any) => {
      this.meetingTypeDrp = res['table']
    })
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }


  GetMeetingModeMaster() {
    const currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
    const roleId = currentRole?.roleId || '';
    const userId = sessionStorage.getItem('userId') || '';
    const districtId = sessionStorage.getItem('District') || '';
    this.userService.getQuestionPaper(`uspGetMeetingModeMaster|appUserId=${userId}|appUserRole=${roleId}|districtId=${districtId}`).subscribe((res: any) => {
      this.meetingModeDrp = res['table']
    })
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
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
                attechment: relativePath
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


  removeResume() {
    this.uploadedResumeUrl = '';
    this.groupMasterForm1.patchValue({
      attechment: ''
    });
    this.message.add({
      severity: 'info',
      summary: 'Removed',
      detail: 'Resume removed successfully.',
      life: 2000
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
    if (['Backspace', 'ArrowLeft', 'ArrowRight', 'Delete', 'Tab'].includes(input)) {
      return;
    }
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
      const userId = sessionStorage.getItem('userId') || '';
      const roleId = currentRole?.roleId || '';
      const districtId = sessionStorage.getItem('District') || '';
      const query = `appUserId=${userId}|appUserRole=${roleId}|districtId=${districtId}|searchText=${this.searchText}|pageIndex=${this.pageNo}|size=${this.pageSize}`;
      this.userService.getQuestionPaper(`uspGetBoardMeetingDetails|${query}`).subscribe({
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
    this.header = view === 'add' ? 'Add' : view === 'update' ? 'Update' : 'View';
    this.headerIcon = view === 'add' ? 'pi pi-plus' : view === 'update' ? 'pi pi-pencil' : 'pi pi-eye';

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

      this.groupMasterForm1.patchValue({
        organization: data.organizationId || '',
        mettingType: data.meetingTypeId || '',
        meetingMode: data.meetingModeId || '',
        meetingDate: data.meetingDate || '',
        agenda: data.agenda || '',
        attechment: data.attendanceSheet || '',
      });
      this.uploadedResumeUrl = `https://elocker.nobilitasinfotech.com/${data?.attendanceSheet}`;
    }

    document.body.style.overflow = 'hidden'; // prevent background scroll
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
    this.selectedRowDetails = [];
    this.uploadedResumeUrl = '';
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

    let organization = this.groupMasterForm1.get('organization')?.value;
    let mettingType = this.groupMasterForm1.get('mettingType')?.value;
    let meetingMode = this.groupMasterForm1.get('meetingMode')?.value;
    const meetingDate = String(this.groupMasterForm1.get('meetingDate')?.value || '').trim();
    const agenda = String(this.groupMasterForm1.get('agenda')?.value || '').trim();
    const attechment = String(this.groupMasterForm1.get('attechment')?.value || '').trim();

    this.paramvaluedata = `orgID=${organization}|meetingTypeId=${mettingType}|meetingDate=${meetingDate}|meetingModeId=${meetingMode}|agenda=${agenda}|attendanceSheet=${attechment}`;
    this.openConfirmation('Confirm?', 'Are you sure you want to proceed?', '1', '1', event);
  }



  submitcall() {
    this.isFormLoading = true;
    let query = '';
    let SP = '';

    if (this.postType === 'update') {
      query = `${this.paramvaluedata}|Id=${this.selectedIndex.id}|userId=${sessionStorage.getItem('userId')}`;
      SP = `uspUpdateBoardMeetingDetails`;
    }
    else {
      query = `${this.paramvaluedata}|userId=${sessionStorage.getItem('userId')}`;
      SP = `uspPostBoardMeetingDetails`;
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
  

  deleteData() {
    try {
      this.isFormLoading = true;
      let query = `Id=${this.selectedIndex.id}|userId=${sessionStorage.getItem('userId')}`;
      this.userService.SubmitPostTypeData(`uspDeleteBoardMeetingDetails`, query, 'header').subscribe({
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

  openDetailModal(rowData: any) {
    this.itemDailog = true;

    if (typeof rowData.attendanceSheet === 'string' && rowData.attendanceSheet.includes('[')) {
      try {
        this.selectedRowDetails = JSON.parse(rowData.attendanceSheet);
      } catch (e) {
        console.error('Error parsing attachment JSON:', e);
        this.selectedRowDetails = [];
      }
    }
    else if (typeof rowData.attendanceSheet === 'string' && rowData.attendanceSheet.trim() !== '') {
      this.selectedRowDetails = [{ resumeUpload: rowData.attendanceSheet }];
    }
    else {
      this.selectedRowDetails = [];
    }
  }

  onDeleteRow(data: any, index: number) {
    this.selectedrowIndex = index
    this.openConfirmation("Confirm", "Are you sure want to delete?", '1', '5');
  }


}
