import { Component, ChangeDetectorRef, signal } from '@angular/core';
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

@Component({
  selector: 'app-cases-litigation-forms',
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
    Dialog
  ],
  providers: [
    ConfirmationService,
    MessageService
  ],
  templateUrl: './cases-litigation-forms.html',
  styleUrl: './cases-litigation-forms.scss'
})

export class CasesLitigationForms {
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

  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true, },
    { key: 'caseCode', header: 'Case ID', isVisible: true, isSortable: false },
    { key: 'caseTittle', header: 'Case Tittle', isVisible: true, isSortable: false },
    { key: 'caseType', header: 'Case Type', isVisible: true, isSortable: false },
    { key: 'courtName', header: 'Court', isVisible: true, isSortable: false },
    { key: 'fillingDate', header: 'Filling Date', isVisible: true, isSortable: false },
    { key: 'caseStatus', header: 'Status', isVisible: true, isSortable: false },
    { key: 'officialCaseNo', header: 'Case Number', isVisible: true, isSortable: false },
    { key: 'partyName', header: 'Opponent', isVisible: true, isSortable: false },
    { key: 'nxtHearingDate', header: 'Next Hearing Date', isVisible: true, isSortable: false },
    { key: 'legalTeamName', header: 'Name (from Internal Legal Team)', isVisible: true, isSortable: false },
    { key: 'remarks', header: 'Remarks', isVisible: true, isSortable: false },
  ];

  pageNo = 1;
  pageSize = 5;
  searchText = '';
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  showAddBtn = signal(false)

  caseMasterDrp: any = []
  caseStatusDrp: any = []
  courtDrp: any = [];
  legalTeamMaster: any = [];
  partyTypesdrp: any = [];
  childArrData: any[] = [];

  previousGroupType: any;
  selectedrowIndex: any
  selectedItemEdit = null
  slectedEdtIndex = null
  itemDailog: boolean = false

  constructor(private fb: FormBuilder,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private message: MessageService,
    public Customvalidation: Customvalidation,
    private cdr: ChangeDetectorRef) {

    this.groupMasterForm1 = this.fb.group({
      caseTitle: ['', [Validators.required, noInvalidPipelineName()]],
      caseType: ['', [Validators.required]],
      courttype: ['', [Validators.required]],
      fillingDate: ['', [Validators.required]],
      statusId: ['', [Validators.required]],
      caseNumber: ['', [Validators.required, noInvalidPipelineName()]],
      opponentId: ['', [Validators.required]],
      nextHearingDate: ['', [Validators.required]],
      remarks: ['', [Validators.required, noInvalidPipelineName()]],
      legalTeamId: ['', [Validators.required]],
    });

  }

  get f() { return this.groupMasterForm1.controls }


  ngOnInit(): void {
    this.getTableData(true);
    this.getCaseMasterType();
    this.getCaseStatusMaster();
    this.getCourtMaster();
    this.getLegalTeamMaster();
    this.getPartyTypeMaster();
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  getCaseMasterType() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
    this.userService.getQuestionPaper(`uspGetCaseTypeMaster`).subscribe((res: any) => {
      this.caseMasterDrp = res['table']
    })

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
  }

  getCaseStatusMaster() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
    this.userService.getQuestionPaper(`uspGetCaseStatusMaster`).subscribe((res: any) => {
      this.caseStatusDrp = res['table']
    })

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
  }

  blockTyping(event: KeyboardEvent) {
    event.preventDefault();
  }
  
  openCalendar(event: any) {
    event.target.showPicker();  // Browser ka built-in date picker open karega
  }
  


  getCourtMaster() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
    this.userService.getQuestionPaper(`uspGetCourtMaster`).subscribe((res: any) => {
      this.courtDrp = res['table']
      console.log("dsfh====",res);
      
    })

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
  }

  getPartyTypeMaster() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
    this.userService.getQuestionPaper(`uspGetPartyTypeMaster`).subscribe((res: any) => {
      this.partyTypesdrp = res['table']
    })

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
  }

  getLegalTeamMaster() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
    this.userService.getQuestionPaper(`uspGetLegalTeamMaster`).subscribe((res: any) => {
      this.legalTeamMaster = res['table']
    })

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
  }

  getTableData(isTrue: boolean) {
    try {
      if (isTrue) {
        this.isLoading = true;
      } 
      else {
        this.pageNo = 1;
      }
      const roleId = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
      const query = `appUserId=${sessionStorage.getItem('userId')}|appUserRole=${roleId}|districtId=${sessionStorage.getItem('District')}|searchText=${this.searchText}|pageIndex=${this.pageNo}|size=${this.pageSize}|sortColumn=${this.sortColumn || ''}|sortDirection=${this.sortDirection || ''}|activity=header`;      
      this.userService.getQuestionPaper(`uspGetCasesDetails|${query}`).subscribe({
        next: (res: any) => { 
          console.log("fhsh=====",res);
                       
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

      const cleanDate = data.fillingDate ? data.fillingDate.split('T')[0] : '';
      const nxtHearingDate = data.nxtHearingDate ? data.nxtHearingDate.split('T')[0] : '';

      this.groupMasterForm1.patchValue({
        caseTitle: data.caseTittle || '',
        caseType: data.caseTypeId || '',
        courttype: data.courtId || '',
        fillingDate:cleanDate,
        statusId: data.caseStatusId || '',
        caseNumber: data.officialCaseNo || '',
        opponentId: data.opponentPartId || '',
        nextHearingDate:nxtHearingDate,
        remarks: data.remarks || '',
        legalTeamId: data.legalTeamId || '',
      });
    }
    document.body.style.overflow = 'hidden'
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
    this.childArrData = []
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
        } else if (option === '4') {
          this.childArrData = []
        }
        else if (option === '5') {
          this.childArrData.splice(this.selectedrowIndex, 1);
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
  
    const formValues = this.groupMasterForm1.value;
    const toStr = (val: any) => (val !== null && val !== undefined ? val.toString().trim() : '');
    const caseTitle = toStr(formValues.caseTitle);
    const caseType = toStr(formValues.caseType);
    const courttype = toStr(formValues.courttype);
    const fillingDate = formValues.fillingDate? formValues.fillingDate.toString().split('T')[0]: '';
    const statusId = toStr(formValues.statusId);
    const caseNumber = toStr(formValues.caseNumber);
    const opponentId = toStr(formValues.opponentId);
    const nextHearingDate = formValues.nextHearingDate? formValues.nextHearingDate.toString().split('T')[0]: '';
    const legalTeamId = toStr(formValues.legalTeamId);
    const remarks = toStr(formValues.remarks);
  
    this.paramvaluedata =
      `caseTittle=${caseTitle}` +
      `|caseTypeId=${caseType}` +
      `|courtId=${courttype}` +
      `|fillingDate=${fillingDate}` +
      `|caseStatusId=${statusId}` +
      `|officialCaseNo=${caseNumber}` +
      `|opponentPartyId=${opponentId}` +
      `|nextHearingDate=${nextHearingDate}` +
      `|legalTeamId=${legalTeamId}` +
      `|linkHearingId=87678` +
      `|linkNoticeId=1000` +
      `|remarks=${remarks}`;  
    this.openConfirmation('Confirm?', 'Are you sure you want to proceed?', '1', '1', event);
  }

  submitcall() {
    try {
      this.isFormLoading = true;
      let query = '';
      let SP = '';

      if (this.postType === 'update') {
        query = `${this.paramvaluedata}|action=update|Id=${this.selectedIndex.id}|userId=${sessionStorage.getItem('userId')}`;
        SP = `uspUpdateDeleteCaseDetails`;
      }
      else {
        query = `${this.paramvaluedata}|userId=${sessionStorage.getItem('userId')}`;
        SP = `uspPostCasesDetails`;
      }
      this.userService.SubmitPostTypeData(SP, query, 'header').subscribe({
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

    } catch (error) {
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

  deleteData() {
    const selected = this.selectedIndex; // your selected row object
    const query = 
      `action=delete|` +
      `caseTittle=${selected.caseTittle}|` +
      `caseTypeId=${selected.caseTypeId}|` +
      `courtId=${selected.courtId}|` +
      `fillingDate=${selected.fillingDate}|` +
      `caseStatusId=${selected.caseStatusId}|` +
      `officialCaseNo=${selected.officialCaseNo}|` +
      `opponentPartyId=${selected.opponentPartId}|` +
      `nextHearingDate=${selected.nxtHearingDate}|` +
      `legalTeamId=${selected.legalTeamId}|` +
      `linkHearingId=${selected.linkHearingId}|` +
      `linkNoticeId=${selected.linkNoticeId}|` +
      `remarks=${selected.remarks}|` +
      `Id=${selected.id}|` +
      `userId=${sessionStorage.getItem('userId') || 0}`;
    // let query =`action=delete|nextHearingDate=''|legalTeamId=0|caseTypeId=0|linkNoticeId=0|linkHearingId=0|remarks=''|Id=${this.selectedIndex.id}|caseTittle=''|courtId=0|fillingDate=''|caseStatusId=0|officialCaseNo='0'|opponentPartyId=0|userId=${sessionStorage.getItem('userId')}`;
    this.userService.SubmitPostTypeData(`uspUpdateDeleteCaseDetails`, query, 'header').subscribe((datacom: any) => {
      this.isFormLoading = false;
      if (!datacom) return;
      const resultarray = datacom.split("-");
      if (resultarray[1] === "success") {
        this.getTableData(true);
        this.message.add({ severity: 'success', summary: 'Success', detail: 'Data deleted' });
        this.onDrawerHide();
      } else {
        this.message.add({ severity: 'warn', summary: 'Warn', detail: resultarray[1] || datacom, });
      }
    });
  }

  onDeleteRow(data: any, index: number) {
    this.selectedrowIndex = index
    this.openConfirmation("Confirm", "Are you sure want to delete?", '1', '5');
  }

  showGrouplist(data: any) {
    this.itemDailog = true;
    try {
      const custArray = JSON.parse(data?.customerDetails || '[]');
      this.groupListArray = custArray.flatMap((c: any) => c.ct.map((x: any) => ({
        CustomerId: x.CustomerId,
        CustomerValue: x.CustomerValue
      })));
    } catch (e) {
      console.error('Error parsing customerDetails', e);
      this.groupListArray = [];
    }
  }

}
