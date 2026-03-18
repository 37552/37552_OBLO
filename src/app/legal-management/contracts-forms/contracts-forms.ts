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
  selector: 'app-contracts-forms',
  imports: [
    TableTemplate,
    CardModule,
    TableModule,
    ButtonModule,
    FileUploadModule,
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
  templateUrl: './contracts-forms.html',
  styleUrl: './contracts-forms.scss'
})

export class ContractsForms {
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


  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true, },
    { key: 'contractCode', header: 'Contract', isVisible: true, isSortable: false },
    { key: 'tittle', header: 'Tittle', isVisible: true, isSortable: false },
    { key: 'contractType', header: 'Contract Type ', isVisible: true, isSortable: false },
    { key: 'department', header: 'Department', isVisible: true, isSortable: false },
    { key: 'startDate', header: 'Start Date', isVisible: true, isSortable: false },
    { key: 'endDate', header: 'End Date', isVisible: true, isSortable: false },
    { key: 'legalOwner', header: 'Legal Owner', isVisible: true, isSortable: false },
    { key: 'legalTeamName', header: 'Name (from Legal Team)', isVisible: true, isSortable: false },
    { key: 'partyName', header: 'Parties Involved', isVisible: true, isSortable: false },
    { key: 'renewalDate', header: 'Renewal Date', isVisible: true, isSortable: false },
    { key: 'signedDate', header: 'Signed Date', isVisible: true, isSortable: false },
    { key: 'contractStatus', header: 'Status', isVisible: true, isSortable: false },
    { key: 'arbitrationTittle', header: 'Arbitration', isVisible: true, isSortable: false },
    { key: 'noticeCode', header: 'Notices', isVisible: true, isSortable: false },
    { key: 'remarks', header: 'Remarks', isVisible: true, isSortable: false },
    { key: 'jsonDetails', header: 'Attachment', isVisible: true, isSortable: false, isCustom: true }
  ];


  pageNo = 1;
  pageSize = 5;
  searchText = '';
  totalCount = 0;
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  contractDrp = [];
  partyNamedrp = []
  internaldrp = []
  pangstindrp = []
  contractStatus = []
  partyTypesdrp= []
  departmentDrp= []
  partyMasterDrp= []
  noticesDrp= []
  legalTeamDrp= []
  arbitrationDrp= []

  showResumeUploadDialog = false;
  selectedResumeFile: File | null = null;
  uploadedResumeUrl: string | null = null;
  isUploadingResume = false;
  selectedRowDetails: any[] = [];

  previousGroupType: any;
  selectedrowIndex: any
  selectedItemEdit = null
  slectedEdtIndex = null
  itemDailog: boolean = false


  constructor(private fb: FormBuilder,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private message: MessageService,
    private configService: ConfigService,
    public Customvalidation: Customvalidation,
    private cdr: ChangeDetectorRef) {

      this.groupMasterForm1 = this.fb.group(
        {
          title: ['', [Validators.required, noInvalidPipelineName()]],
          contacttype: ['', Validators.required],
          department: ['', Validators.required],
          startDate: ['', Validators.required],
          endDate: ['', Validators.required],
          legalOwner: ['', [Validators.required, noInvalidPipelineName()]],
          legalName: ['', Validators.required],
          partiesInvoled: ['', Validators.required],
          renewalDate: ['', Validators.required],
          signedDate: ['', Validators.required],
          statusId: ['', Validators.required],
          arbitration: [''],
          notice: [''],
          remarks: ['', [Validators.required, noInvalidPipelineName()]],
          attachment: ['', Validators.required],
        },
        { validators: this.endDateAfterStartDateValidator } // <-- Apply here
      );      
  }

  get f() { return this.groupMasterForm1.controls }

  endDateAfterStartDateValidator(formGroup: FormGroup) {
    const start = formGroup.get('startDate')?.value;
    const end = formGroup.get('endDate')?.value;
  
    if (start && end && new Date(end) < new Date(start)) {
      return { endBeforeStart: true };
    }
    return null;
  }
  

  ngOnInit(): void {
    this.getTableData(true);
    this.getContractTypeMaster()
    this.getDepartmentLis()
    this.getStatusMaster()
    this.getPartyTypeMaster()
    this.getNoticesMaster()
    this.getLegalTeamDrp()
    this.getGetarbitrationMaster()
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }


  getContractTypeMaster() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
    this.userService.getQuestionPaper(`uspGetContractTypeMaster`).subscribe((res: any) => {
      this.contractDrp = res['table'];
    })

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  getDepartmentLis() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
    this.userService.getQuestionPaper(`uspGetDepartmentList`).subscribe((res: any) => {
      this.departmentDrp = res['table'];      
    })

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  getStatusMaster() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
    this.userService.getQuestionPaper(`uspGetContractStatusMaster`).subscribe((res: any) => {
      this.contractStatus = res['table'];
    })

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  getPartyTypeMaster() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
    this.userService.getQuestionPaper(`uspGetPartyTypeMaster`).subscribe((res: any) => {
      this.partyMasterDrp = res['table'];
      console.log("partyMasterDrp=========",res);
      
    })

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }
  
  getGetarbitrationMaster() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
    this.userService.getQuestionPaper(`uspGetarbitrationDetailsMaster`).subscribe((res: any) => {
      this.arbitrationDrp = res['table'];      
    })

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  getNoticesMaster() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
    this.userService.getQuestionPaper(`uspGetNoticesDetailsMaster`).subscribe((res: any) => {
      this.noticesDrp = res['table'];
    })

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  getLegalTeamDrp() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
    this.userService.getQuestionPaper(`uspGetLegalTeamMaster`).subscribe((res: any) => {
      this.legalTeamDrp = res['table'];      
    })

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
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
      const query = `searchText=${this.searchText}|pageIndex=${this.pageNo}|size=${this.pageSize}|appUserRole=${roleId}|appUserId=${userId}`;
      this.userService.getQuestionPaper(`uspGetContractsDetails|${query}`).subscribe({
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
    if (view == 'add') {
      this.visible = true;
      this.postType = view;
      this.header = view === 'add' ? 'Add' : (view === 'update' ? 'Update' : 'View');
      this.headerIcon = view === 'add' ? 'pi pi-plus' : (view === 'update' ? 'pi pi-pencil' : 'pi pi-eye');
    }
    else {
      this.visible = true;
      this.postType = view;
      this.header = view === 'add' ? 'Add' : (view === 'update' ? 'Update' : 'View');
      this.headerIcon = view === 'add' ? 'pi pi-plus' : (view === 'update' ? 'pi pi-pencil' : 'pi pi-eye');

      this.selectedIndex = data;
      if (view === 'view') {
        this.groupMasterForm1.disable();
      }
      else {
        this.groupMasterForm1.enable();
        this.groupMasterForm1.get('groupType')?.disable();
      }

      this.groupMasterForm1.patchValue({
        title: data.tittle || '',
        contacttype: data.contractTypeId || '',
        department: data.departmentId || '',
        startDate: data.startDate || '',
        endDate: data.endDate || '',
        legalOwner: data.legalOwner || '',
        legalName: data.legalTeamId || '',
        partiesInvoled: data.partyId || '',
        renewalDate: data.renewalDate || '',
        signedDate: data.signedDate || '',
        statusId: data.contractStatusID || '',
        arbitration: data.arbitrationId || '',
        notice: data.noticeId || '',
        remarks: data.remarks || '',
        attachment: data.attachment || ''
      });
    }
    document.body.style.overflow = 'hidden'
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
    this.groupMasterForm1.reset(); // clear all form fields
    this.groupMasterForm1.enable(); // make form editable again
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
    // Safe trim function
    const safeTrim = (v: any) => (typeof v === 'string' ? v.trim() : v || '');
    const title = safeTrim(this.groupMasterForm1.get('title')?.value);
    const contacttype = this.groupMasterForm1.get('contacttype')?.value || '';
    const department = this.groupMasterForm1.get('department')?.value || '';
    const startDate = this.groupMasterForm1.get('startDate')?.value || '';
    const endDate = this.groupMasterForm1.get('endDate')?.value || '';
    const legalOwner = safeTrim(this.groupMasterForm1.get('legalOwner')?.value);
    const legalName = safeTrim(this.groupMasterForm1.get('legalName')?.value);
    const partiesInvoled = this.groupMasterForm1.get('partiesInvoled')?.value || '';
    const renewalDate = this.groupMasterForm1.get('renewalDate')?.value || '';
    const signedDate = this.groupMasterForm1.get('signedDate')?.value || '';
    const statusId = this.groupMasterForm1.get('statusId')?.value || '';
    const arbitration = this.groupMasterForm1.get('arbitration')?.value || 0;
    const remarks = safeTrim(this.groupMasterForm1.get('remarks')?.value);
    const notice = this.groupMasterForm1.get('notice')?.value || 0;
    const attachment = this.groupMasterForm1.get('attachment')?.value || '';    
    this.paramvaluedata =
      `tittle=${title}|` +
      `contractTypeId=${contacttype}|` +
      `departmentId=${department}|` +
      `startDate=${startDate}|` +
      `endDate=${endDate}|` +
      `legalOwner=${legalOwner}|` +
      `legalTeamId=${legalName}|` +
      `partyId=${partiesInvoled}|` +
      `renewalDate=${renewalDate}|` +
      `signDate=${signedDate}|` +
      `contractStatusId=${statusId}|` +
      `arbitrationId=${arbitration}|` +
      `remarks=${remarks}|` +
      `attachment=${attachment}|` +
      `noticeId=${notice}`;
    this.openConfirmation('Confirm?', 'Are you sure you want to proceed?', '1', '1', event);
  }
  

  submitcall() {
    this.isFormLoading = true;
    let query = '';
    let SP = '';

    if (this.postType === 'update') {
      query = `action=update|${this.paramvaluedata}|id=${this.selectedIndex.id}|userID=${sessionStorage.getItem('userId')}`;
      SP = `uspUpdateDeleteContractDetails`;
    }
    else {
      query = `${this.paramvaluedata}|userID=${sessionStorage.getItem('userId')}}`;
      SP = `uspPostContractTypeDetails`;
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
      let query = `Id=${this.selectedIndex.id}|userId=${sessionStorage.getItem('userId')}`;
      this.userService.SubmitPostTypeData(`uspDeleteLegalContractDetails`, query, 'header').subscribe({
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
