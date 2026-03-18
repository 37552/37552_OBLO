import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DrawerModule } from 'primeng/drawer';
import { InputTextModule } from 'primeng/inputtext';
import { IftaLabelModule } from 'primeng/iftalabel';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { PopoverModule } from 'primeng/popover';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableTemplate, TableColumn } from '../../table-template/table-template';

import { UserService } from '../../shared/user-service';
import { Customvalidation } from '../../shared/Validation';

@Component({
  selector: 'app-office-request',
  standalone: true,
  imports: [
    CommonModule,
    BreadcrumbModule,
    DrawerModule,
    DatePickerModule,
    InputTextModule,
    ButtonModule,
    IftaLabelModule,
    ReactiveFormsModule,
    SelectModule,
    FormsModule,
    InputNumberModule,
    ConfirmDialogModule,
    ToastModule,
    TableModule,
    TableTemplate,
    PopoverModule,
  ],
  templateUrl: './office-request.html',
  styleUrl: './office-request.scss',
  providers: [DatePipe, ConfirmationService, MessageService],
})
export class OfficeRequest implements OnInit {
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private userService: UserService,
    private datePipe: DatePipe,
    private Customvalidation: Customvalidation,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) { }

  /* ================= UI FLAGS ================= */
  showEmployeeSection = true;
  showDateSection = true;

  visible = false;
  dialogType: 'add' | 'update' | 'view' = 'add';
  header = 'Add Office Request';
  headerIcon = 'pi pi-plus';
  selectedItem: any = null;
  FormName = '';
  actitvityName = 'Office Request';
  isProccess = false;
  historyDrawerVisible = false;
  approvalHistory: any[] = [];

  /* ================= FORM ================= */
  priceListForm: any;
  empName = '';

  /* ================= DROPDOWN ================= */
  travelByDrpAll: any[] = [];

  /* ================= TABLE ================= */
  viewData: any[] = [];
  allViewTableData: any[] = [];
  paginationCountData: any[] = [];
  pageNoData: any[] = [];
  totalCount = 0;
  pageNo = 1;
  pageSize = 10;
  searchText = '';
  isLoading = false;
  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true },
    { key: 'sno', header: 'S.No', isVisible: true, isSortable: false },
    { key: 'reqNo', header: 'Request No', isVisible: true, isSortable: false },
    { key: 'employeeName', header: 'Employee Name', isVisible: true, isSortable: false },
    { key: 'wfLevel', header: 'WF Level', isVisible: true, isSortable: false },
    { key: 'isoPurpose', header: 'ISO Purpose', isVisible: true, isSortable: false },
    { key: 'purpose', header: 'Purpose', isVisible: true, isSortable: false },
    { key: 'fromDate', header: 'From Date', isVisible: true, isSortable: false },
    { key: 'toDate', header: 'To Date', isVisible: true, isSortable: false },
    { key: 'imprest', header: 'Imprest', isVisible: true, isSortable: false },
    { key: 'approvedStatus', header: 'Status', isVisible: true, isSortable: false },
  ];

  /* ================= BREADCRUMB ================= */
  get breadcrumbItems(): any[] {
    return [
      { label: 'Home', url: '/', title: 'Home' },
      { label: 'Raise Ticket', url: '/raise-ticket', title: 'Raise Ticket' },
      { label: this.actitvityName, title: this.actitvityName },
    ];
  }

  /* ================= INIT ================= */
  ngOnInit() {
    const params = this.route.snapshot.queryParams;
    if (params['formName']) {
      this.FormName = params['formName'];
    }
    if (params['name']) {
      this.actitvityName = params['name'];
    }

    const userInfo = JSON.parse(sessionStorage.getItem('UserInfo') || '{}');
    this.empName = Array.isArray(userInfo)
      ? userInfo.length > 0
        ? userInfo[0].empnam
        : ''
      : userInfo?.empnam || '';

    this.initForm();
    this.getTravelByDrp();
    this.getAllViewData(true);
  }

  initForm() {
    this.priceListForm = this.fb.group({
      name: [{ value: this.empName, disabled: true }, Validators.required],
      purpose: ['', Validators.required],
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required],
      imprest: [null, [Validators.required, Validators.min(1)]],
      otherPurpose: [''],
    });
  }

  /* ================= DIALOG ================= */
  showDialog(type: 'add' | 'update' | 'view', data: any) {
    this.dialogType = type;
    this.visible = true;
    this.selectedItem = data || null;
    this.priceListForm.reset();
    this.priceListForm.enable();

    if (type === 'add') {
      this.header = 'Add ' + this.FormName + ' Request';
      this.headerIcon = 'pi pi-plus';
      this.priceListForm.patchValue({
        name: this.empName,
      });
    } else {
      this.header = type === 'update' ? 'Update ' + this.FormName + ' Request' : 'View ' + this.FormName + ' Request';
      this.headerIcon = type === 'update' ? 'pi pi-pencil' : 'pi pi-eye';
      if (data) {
        setTimeout(() => {
          this.loadDataForEdit(data);
          if (type === 'view') {
            this.priceListForm.disable();
          }
        }, 100);
      } else {
        if (type === 'view') {
          this.priceListForm.disable();
        }
      }
    }
  }

  loadDataForEdit(data: any) {
    const nameControl = this.priceListForm.get('name');
    if (nameControl?.disabled) {
      nameControl.enable();
    }

    let fromDate: Date | null = null;
    let toDate: Date | null = null;

    if (data.fromDate) {
      try {
        if (data.fromDate instanceof Date) {
          fromDate = data.fromDate;
        } else if (typeof data.fromDate === 'string') {
          const dateStr = data.fromDate.trim();
          if (dateStr) {
            const dateValue = new Date(dateStr);
            if (!isNaN(dateValue.getTime())) {
              fromDate = dateValue;
            }
          }
        }
      } catch (error) {
        console.error('Error parsing fromDate:', error);
      }
    }

    if (data.toDate) {
      try {
        if (data.toDate instanceof Date) {
          toDate = data.toDate;
        } else if (typeof data.toDate === 'string') {
          const dateStr = data.toDate.trim();
          if (dateStr) {
            const dateValue = new Date(dateStr);
            if (!isNaN(dateValue.getTime())) {
              toDate = dateValue;
            }
          }
        }
      } catch (error) {
        console.error('Error parsing toDate:', error);
      }
    }

    this.priceListForm.patchValue(
      {
        name: data.employeeName || data.name || this.empName,
        purpose: data.isoPurposeId || data.purpose || '',
        fromDate: fromDate,
        toDate: toDate,
        imprest: data.imprest || null,
        otherPurpose: data.otherPurpose || '',
      },
      { emitEvent: false }
    );

    if (nameControl && this.dialogType === 'view') {
      nameControl.disable();
    }

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 200);
  }

  /* ================= DROPDOWN ================= */
  getTravelByDrp() {
    this.userService
      .getQuestionPaper(`uspGetFillDrpDown|table=tblExpenseIsoPurposeMaster`)
      .subscribe({
        next: (res: any) => {
          this.travelByDrpAll = res['table'] || [];
          this.cdr.detectChanges();
        },
        error: (err: any) => { },
      });
  }

  /* ================= API ================= */
  getAllViewData(isTrue: boolean): void {
    try {
      if (isTrue) {
        this.isLoading = true;
        this.cdr.markForCheck();
      } else {
        this.pageNo = 1;
      }

      const userRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
      const query = `uspGetOfficeExpenseRequest|searchText=${this.searchText || ''
        }|pageIndex=${Number(this.pageNo)}|size=${Number(
          this.pageSize
        )}|districtId=${sessionStorage.getItem('District')}|appUserId=${sessionStorage.getItem(
          'userId'
        )}|appUserRole=${userRole}`;

      this.userService.getQuestionPaper(query).subscribe({
        next: (res: any) => {
          this.allViewTableData = res['table1'] || [];
          this.paginationCountData = res['table'] || [];
          this.pageNoData = res['table2'] || [];

          if (Array.isArray(this.allViewTableData)) {
            this.allViewTableData = this.allViewTableData.map((e: any, idx: number) => {
              const fromDate = e.fromDate ? this.datePipe.transform(e.fromDate, 'dd-MM-yyyy') : '';
              const toDate = e.toDate ? this.datePipe.transform(e.toDate, 'dd-MM-yyyy') : '';
              return {
                ...e,
                sno: idx + 1 + (this.pageNo - 1) * this.pageSize,
                fromDate: fromDate,
                toDate: toDate,
              };
            });
          }

          this.viewData = [...this.allViewTableData];
          this.totalCount =
            res['table']?.[0]?.totalCount ??
            res['table']?.[0]?.totalCnt ??
            this.allViewTableData.length;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          this.isLoading = false;
          this.viewData = [];
          this.allViewTableData = [];
          this.totalCount = 0;
          if (err.status === 403) {
            this.Customvalidation.loginroute(err.status);
          }
          this.cdr.detectChanges();
        },
      });
    } catch (error) {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  onPageChange(page: number): void {
    this.pageNo = page;
    this.getAllViewData(false);
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageNo = 1;
    this.getAllViewData(false);
  }

  onsearchChange(event: any): void {
    this.searchText = event.value || '';
    this.pageNo = 1;
    this.getAllViewData(false);
  }

  openHistoryDrawer(item: any): void {
    this.selectedItem = item;
    try {
      const historyRaw =
        item?.approvalDetail || item?.approvaldetail || item?.approvalHistory || '[]';
      this.approvalHistory =
        typeof historyRaw === 'string' ? JSON.parse(historyRaw || '[]') : historyRaw || [];
    } catch (error) {
      console.error('Error parsing approval detail:', error);
      this.approvalHistory = [];
    }
    this.historyDrawerVisible = true;
    this.cdr.detectChanges();
  }

  closeHistoryDrawer(): void {
    this.historyDrawerVisible = false;
    this.approvalHistory = [];
    this.selectedItem = null;
  }

  /* ================= SUBMIT ================= */
  onSubmit() {
    this.priceListForm.markAllAsTouched();

    if (this.priceListForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please fill required fields',
      });
      return;
    }

    const formValue = this.priceListForm.getRawValue();

    const fromDate = new Date(formValue.fromDate);
    const toDate = new Date(formValue.toDate);

    if (fromDate > toDate) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Alert',
        detail: "'To Date' should be greater than 'From Date'",
      });
      return;
    }

    const isUpdate = this.dialogType === 'update';

    this.confirmationService.confirm({
      header: isUpdate ? 'Confirm Update' : 'Confirm',
      message: isUpdate
        ? 'Do you want to update this request?'
        : 'Do you want to submit this request?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => this.submitAfterConfirm(),
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Cancelled',
          detail: isUpdate ? 'Request update cancelled' : 'Request submission cancelled',
        });
      },
    });
  }

  submitAfterConfirm() {
    const userRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
    const appUserId = sessionStorage.getItem('userId') || '';

    const fromDate =
      this.datePipe.transform(this.priceListForm.get('fromDate')?.value, 'yyyy-MM-dd') || '';
    const toDate =
      this.datePipe.transform(this.priceListForm.get('toDate')?.value, 'yyyy-MM-dd') || '';
    const isoPurposeId = this.priceListForm.get('purpose')?.value || '';
    const otherPurposeValue = this.priceListForm.get('otherPurpose')?.value || '';
    const purposeValue = isoPurposeId == 10010 ? otherPurposeValue || '' : '0';
    const imprest = this.priceListForm.get('imprest')?.value || 0;

    const employeeJSON = JSON.stringify([]);

    let paramvaluedata = '';

    if (this.dialogType === 'add') {
      paramvaluedata =
        `requestTypeId=10002` +
        `|ticketId=0` +
        `|fromDate=${fromDate}` +
        `|toDate=${toDate}` +
        `|purpose=${purposeValue}` +
        `|isoPurposeId=${isoPurposeId}` +
        `|imprest=${imprest}` +
        `|appUserId=${appUserId}` +
        `|travelSource=0` +
        `|travelDestination=0` +
        `|travelModeId=0` +
        `|toProject=0` +
        `|toProjectId=0` +
        `|timePrefSlot=0` +
        `|returnTicket=0` +
        `|returnTime=` +
        `|accomodation=0` +
        `|prefTime=` +
        `|returnTimePrefId=0` +
        `|accFromDate=` +
        `|accToDate=` +
        `|localConveyance=0` +
        `|fromLocation=0` +
        `|toLocation=0` +
        `|expenseFor=0` +
        `|appUserRole=${userRole}` +
        `|activity=${this.actitvityName}` +
        `|employeeJSON=${employeeJSON}`;
    } else {
      paramvaluedata =
        `id=${this.selectedItem?.id || 0}` +
        `|requestTypeId=10002` +
        `|ticketId=${this.selectedItem?.id || 0}` +
        `|fromDate=${fromDate}` +
        `|toDate=${toDate}` +
        `|purpose=${purposeValue}` +
        `|isoPurposeId=${isoPurposeId}` +
        `|imprest=${imprest}` +
        `|appUserId=${appUserId}` +
        `|travelSource=0` +
        `|travelDestination=0` +
        `|travelModeId=0` +
        `|toProject=0` +
        `|toProjectId=0` +
        `|timePrefSlot=0` +
        `|returnTicket=0` +
        `|returnTime=` +
        `|accomodation=0` +
        `|prefTime=` +
        `|returnTimePrefId=0` +
        `|accFromDate=` +
        `|accToDate=` +
        `|localConveyance=0` +
        `|fromLocation=0` +
        `|toLocation=0` +
        `|expenseFor=0` +
        `|appUserRole=${userRole}` +
        `|activity=${this.actitvityName}` +
        `|employeeJSON=${employeeJSON}`;
    }

    this.submitcall(paramvaluedata);
  }

  /* ================= FINAL API CALL ================= */
  submitcall(paramvaluedata: string) {
    if (this.isProccess) {
      return;
    }

    this.isProccess = true;
    const SP = this.dialogType === 'add' ? 'uspPostExpenseRequest' : 'uspPostUpdateExpenseRequest';

    this.userService.SubmitPostTypeData(SP, paramvaluedata, this.FormName).subscribe({
      next: (datacom: any) => {
        if (datacom != '') {
          const resultarray = datacom.split('-');

          if (resultarray[1] == 'success') {
            setTimeout(() => {
              let successMessage = '';
              if (this.dialogType === 'update') {
                successMessage = 'Data Updated Successfully.';
              } else {
                successMessage = 'Data Saved Successfully.';
                const currentHour = new Date().getHours();
                if (currentHour >= 18) {
                  successMessage +=
                    ' This request was submitted outside of regular business hours (after 6:00 PM). It will be reviewed and processed on the next working day. For urgent assistance, please contact the Administration staff directly.';
                }
              }

              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: successMessage,
              });

              this.isProccess = false;
              this.priceListForm.reset();
              this.priceListForm.patchValue({
                name: this.empName,
              });
              this.visible = false;
              this.selectedItem = null;
              this.getAllViewData(false);
            }, 500);
          } else if (resultarray[0] == '2') {
            setTimeout(() => {
              this.isProccess = false;
              this.messageService.add({
                severity: 'warn',
                summary: 'Alert',
                detail: resultarray[1] || 'Warning',
              });
            }, 1000);
          } else {
            this.isProccess = false;
            this.messageService.add({
              severity: 'warn',
              summary: 'Alert',
              detail: datacom || 'Warning',
            });
          }
        } else {
          this.isProccess = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Something went wrong!',
          });
        }
      },
      error: (err: any) => {
        setTimeout(() => {
          this.isProccess = false;
        }, 500);

        if (err.status == 401) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'You are not authorized!',
          });
        } else if (err.status == 403) {
          this.Customvalidation.loginroute(err.status);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error?.message?.toString() || err.message || 'Something went wrong',
          });
        }
      },
    });
  }

  /* ================= RESET ================= */
  onReset() {
    this.priceListForm.reset();
    this.priceListForm.patchValue({
      name: this.empName,
    });
  }
}
