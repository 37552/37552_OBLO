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
  selector: 'app-letter-of-acceptance',
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
  templateUrl: './letter-of-acceptance.html',
  styleUrl: './letter-of-acceptance.scss'
})


export class LetterOfAcceptance {
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
    { key: 'orgName', header: 'Organization', isVisible: true, isSortable: false },
    { key: 'tender', header: 'Tender', isVisible: true, isSortable: false },
    { key: 'loaNo', header: 'Letter Of Acceptance Number', isVisible: true, isSortable: false },
    { key: 'loaDate', header: 'Letter Of Acceptance Date', isVisible: true, isSortable: false },
    { key: 'approvalDate', header: 'Approval Date', isVisible: true, isSortable: false },
    { key: 'acceptedValue', header: 'Accepted Value', isVisible: true, isSortable: false },
    { key: 'validityFrom', header: 'Validity From', isVisible: true, isSortable: false },
    { key: 'validityTo', header: 'Validity To', isVisible: true, isSortable: false },
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

  tenderTypeDrp= [];
  organizationDrp= [];
  minValidityToDate: string | null = null;
  minApprovalDate: string | null = null;

  constructor(private fb: FormBuilder,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private message: MessageService,
    public Customvalidation: Customvalidation,
    private cdr: ChangeDetectorRef) {

    this.groupMasterForm1 = this.fb.group({
      ordId: ['', Validators.required],
      tenderId: ['', Validators.required],
      loanNo: ['', [Validators.required, noInvalidPipelineName()]],
      loanDate:['', Validators.required],
      approvaldate:['', Validators.required],
      acceptedValue: ['', [
        Validators.required,
        Validators.pattern(/^\d+(\.\d{1,2})?$/)
      ]],
      validityFrom:['', Validators.required],
      validityTo:['', Validators.required],
    });

  }


onLoanDateChange() {
  const loanDate = this.groupMasterForm1.get('loanDate')?.value;
  if (loanDate) {
    // Set min date for "Approval Date" as selected "Letter Of Acceptance Date"
    this.minApprovalDate = loanDate;

    // Optionally, reset approval date if it's before new loanDate
    const approvalDate = this.groupMasterForm1.get('approvaldate')?.value;
    if (approvalDate && approvalDate < loanDate) {
      this.groupMasterForm1.get('approvaldate')?.setValue('');
    }
  } else {
    this.minApprovalDate = null;
  }
}


  onValidityFromChange() {
    const fromDate = this.groupMasterForm1.get('validityFrom')?.value;
    if (fromDate) {
      // Set min date for "Validity To" as selected "Validity From"
      this.minValidityToDate = fromDate;
      
      // Optionally, reset validityTo if it's before new fromDate
      const toDate = this.groupMasterForm1.get('validityTo')?.value;
      if (toDate && toDate < fromDate) {
        this.groupMasterForm1.get('validityTo')?.setValue('');
      }
    } else {
      this.minValidityToDate = null;
    }
  }


  blockTyping(event: KeyboardEvent) {
    event.preventDefault();
  }


  openCalendar(event: any) {
    event.target.showPicker();
  }


  toUppercase(controlName: string) {
    const control = this.groupMasterForm1.get(controlName);
    if (control?.value) {
      control.setValue(control.value.toUpperCase(), { emitEvent: false });
    }
  }


  get f() { return this.groupMasterForm1.controls }

  ngOnInit(): void {
    this.getTableData(true);
    this.GetTypeMaster()
    this.GetorganizationMaster()
    setTimeout(() => {
      this.isLoading = false;
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


  GetTypeMaster() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
    this.userService.getQuestionPaper(`uspGetTenderMaster`).subscribe((res: any) => {
      this.tenderTypeDrp = res['table'];
    })

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
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
      const currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
      const roleId = currentRole?.roleId || '';
      const userId = sessionStorage.getItem('userId') || '';
      const districtId = sessionStorage.getItem('District') || '';

      const query = `appUserId=${userId}|appUserRole=${roleId}|districtId=${districtId}|searchText=${this.searchText}|pageIndex=${this.pageNo}|size=${this.pageSize}`;
      this.userService.getQuestionPaper(`uspGetLetterOfAcceptance|${query}`).subscribe({
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


  showDialog(view: string, data: any) {
    this.selectedIndex = data;
    this.visible = true;
    this.postType = view;
    this.header = view === 'add' ? 'Add' : view === 'update' ? 'Update' : 'View';
    this.headerIcon = view === 'add' ? 'pi pi-plus' : view === 'update' ? 'pi pi-pencil' : 'pi pi-eye';

    if (view === 'add') {
      this.groupMasterForm1.reset();
      this.groupMasterForm1.enable();
    } else {
      if (view === 'view') {
        this.groupMasterForm1.disable();
      } else {
        this.groupMasterForm1.enable();
      }
      this.groupMasterForm1.patchValue({
        ordId: data.orgId || '',
        tenderId: data.tenderId || '',
        loanNo: data.loaNo || '',
        loanDate: data.loaDate || '',
        approvaldate: data.approvalDate || '',
        acceptedValue: data.acceptedValue || '',
        validityFrom: data.validityFrom || '',
        validityTo: data.validityTo || '',
      })
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

    let orgId = this.groupMasterForm1.get('ordId')?.value;
    const tenderId = String(this.groupMasterForm1.get('tenderId')?.value || '').trim();
    const loaNo = String(this.groupMasterForm1.get('loanNo')?.value || '').trim();
    const loaDate = String(this.groupMasterForm1.get('loanDate')?.value || '').trim();
    const approvalDate = String(this.groupMasterForm1.get('approvaldate')?.value || '').trim();
    const acceptedValue = String(this.groupMasterForm1.get('acceptedValue')?.value || '').trim();
    const validityFrom = String(this.groupMasterForm1.get('validityFrom')?.value || '').trim();
    const validityTo = String(this.groupMasterForm1.get('validityTo')?.value || '').trim();

    this.paramvaluedata = `orgId=${orgId}|tenderId=${tenderId}|loaNo=${loaNo}|loaDate=${loaDate}|approvalDate=${approvalDate}|acceptedValue=${acceptedValue}|validityFrom=${validityFrom}|validityTo=${validityTo}`;
    this.openConfirmation('Confirm?', 'Are you sure you want to proceed?', '1', '1', event);
  }



  submitcall() {
    this.isFormLoading = true;
    let query = '';
    let SP = '';

    if (this.postType === 'update') {
      query = `${this.paramvaluedata}|id=${this.selectedIndex.id}|userId=${sessionStorage.getItem('userId')}`;
      SP = `uspUpdatetLetterOfAccept`;
    }
    else {
      query = `${this.paramvaluedata}|userId=${sessionStorage.getItem('userId')}`;
      SP = `uspPostLetterOfAccept`;
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
      let query = `Id=${this.selectedIndex.id}|userID=${sessionStorage.getItem('userId')}`;
      this.userService.SubmitPostTypeData(`uspDeleteLetterOfAccept`, query, 'header').subscribe({
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
