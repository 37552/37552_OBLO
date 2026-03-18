import { Component, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { TableTemplate, TableColumn } from '../../table-template/table-template';
import { ButtonModule } from 'primeng/button';
import { Popover } from 'primeng/popover';
import { Tooltip } from "primeng/tooltip";
import { Dialog } from 'primeng/dialog';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CardModule } from 'primeng/card';
import { DrawerModule } from 'primeng/drawer';
import { UserService } from '../../shared/user-service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Toast } from 'primeng/toast';
import { FileUploadModule } from 'primeng/fileupload';
import { ConfigService } from '../../shared/config.service';
import { OnlyNumberDirective } from '../../shared/directive/only-number.directive';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { SkeletonModule } from 'primeng/skeleton';
import { MultiSelectModule } from 'primeng/multiselect';
import { DatePickerModule } from 'primeng/datepicker';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-received-payments',
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
    InputTextModule,
    InputNumberModule,
    ConfirmDialog,
    ProgressSpinner,
    Toast,
    Tooltip,
    FileUploadModule,
    Dialog,
    OnlyNumberDirective,
    BreadcrumbModule,
    SkeletonModule,
    MultiSelectModule,
    DatePickerModule
  ],
  providers: [
    ConfirmationService,
    MessageService,
    DatePipe
  ],
  templateUrl: './received-payments.html',
  styleUrl: './received-payments.scss'
})
export class ReceivedPayments implements OnInit, OnDestroy {

  isLoading = true;
  visible: boolean = false;
  selectedItem: any = null;
  isFormLoading: boolean = false;
  data: any[] = [];
  paymentForm: FormGroup;
  drawerPosition: 'left' | 'right' | 'top' | 'bottom' = 'right';

  columns: TableColumn[] = [
    { key: 'actions', header: 'Actions', isVisible: true, isSortable: false, isCustom: true },
    { key: 'soText', header: 'Order Number', isVisible: true },
    { key: 'customerName', header: 'Customer Name', isVisible: true },
    { key: 'paymentAmt', header: 'Amount', isVisible: true },
    { key: 'paymentDate', header: 'Payment Date', isVisible: true },
    { key: 'voucherType', header: 'Voucher Type', isVisible: true },
    { key: 'status', header: 'Status', isVisible: true }
  ];

  pageNo = 1;
  pageSize = 5;
  searchText = '';
  totalCount = 0;
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  searchTimeout: any;
  debounceTime = 500;

  param: string | null = null;
  FormName: any;
  FormValue: any;
  menulabel: any;
  breadcrumbItems!: ({ label: any; disabled?: undefined; } | { label: any; disabled: boolean; })[];
  home: { icon: string; routerLink: string; } | undefined;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private configService: ConfigService,
    private message: MessageService,
    private cdr: ChangeDetectorRef,
    private datePipe: DatePipe
  ) {
    this.paymentForm = this.fb.group({
      id: [0],
      paymentDate: ['', Validators.required],
      soText: [''],
      customerName: [''],
      paymentAmt: [''],
      voucherType: [''],
      remarks: ['']
    });
  }

  get f() { return this.paymentForm.controls }

  ngOnInit(): void {
    this.param = sessionStorage.getItem("menuItem");
    if (this.param) {
      let paramjs = JSON.parse(this.param);
      this.FormName = paramjs.formName;
      this.FormValue = paramjs.formValue;
      this.menulabel = paramjs.menu;
    }
    this.breadcrumbItems = [
      { label: this.menulabel },
      { label: this.FormName, disabled: true }
    ];
    this.getTableData(true);
    this.cdr.detectChanges();
    setTimeout(() => {
      if (this.isLoading) {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    }, 1000);
  }

  getTableData(isTrue: boolean) {
    if (isTrue) {
      this.isLoading = true;
      this.cdr.detectChanges();
    } else {
      this.pageNo = 1;
    }

    const currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
    const roleId = currentRole?.roleId || '';
    const userId = sessionStorage.getItem('userId') || '';
    const districtId = sessionStorage.getItem('District') || '';

    let query = `searchText=${this.searchText}|pageIndex=${this.pageNo}|size=${this.pageSize}|districtId=${districtId}|appUserId=${userId}|appUserRole=${roleId}`;

    this.userService.getQuestionPaper(`uspGetSalesOrderReceivePayment|${query}`).subscribe({
      next: (res: any) => {
        try {
          this.data = res?.table1 || [];

          this.data = this.data.map(item => ({
            ...item,
            id: item.id || 0,
            paymentDate: item.paymentDate ? this.datePipe.transform(new Date(item.paymentDate), 'dd-MM-yyyy') : 'Not Paid',
            paymentDateObj: item.paymentDate ? new Date(item.paymentDate) : null,
            paymentAmt: item.paymentAmt ? `₹${parseFloat(item.paymentAmt).toFixed(2)}` : '₹0.00',
            soText: item.soText || 'N/A',
            customerName: item.customerName || 'N/A',
            voucherType: item.voucherType || 'N/A',
            status: item.status || 'Pending',
            customerAddress: item.customerAddress || '',
            remarks: item.remarks || '',
            soCreatedDate: item.soCreatedDate ? this.datePipe.transform(new Date(item.soCreatedDate), 'dd-MM-yyyy') : 'N/A',
            soId: item.soId || 0,
            tallyPaymentStatus: item.tallyPaymentStatus || false
          }));

          this.totalCount = res?.table?.[0]?.totalCnt ||
            res?.table1?.[0]?.totalCount ||
            this.data.length;

        } catch (innerErr) {
          console.error('Error processing response:', innerErr);
          this.data = [];
          this.totalCount = 0;
          this.message.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to process payment data.'
          });
        } finally {
          setTimeout(() => {
            this.isLoading = false;
            this.cdr.detectChanges();
          }, 1000);
        }
      },
      error: (err) => {
        console.error('Error loading table data:', err);
        this.message.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load payment data.'
        });
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSearchChange(search: string) {
    this.searchText = search;
    this.pageNo = 1;

    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      this.getTableData(false);
    }, this.debounceTime);

    this.cdr.markForCheck();
  }

  clearSearch() {
    this.searchText = '';
    this.pageNo = 1;
    this.getTableData(false);
    this.cdr.markForCheck();
  }

  showDrawer(view: string, data: any) {
    this.isFormLoading = true;
    this.cdr.detectChanges();

    this.visible = true;
    this.selectedItem = data;

    const patchData = {
      id: data.id || 0,
      paymentDate: data.paymentDateObj || '',
      soText: data.soText || '',
      customerName: data.customerName || '',
      paymentAmt: data.paymentAmt || '',
      voucherType: data.voucherType || '',
      remarks: data.remarks || '',
      customerAddress: data.customerAddress || '',
      soCreatedDate: data.soCreatedDate || '',
      soId: data.soId || 0,
      tallyPaymentStatus: data.tallyPaymentStatus || false
    };

    this.paymentForm.patchValue(patchData);
    this.isFormLoading = false;
    this.cdr.detectChanges();
  }

  onSubmit(event: any) {
    if (!this.paymentForm.valid) {
      this.paymentForm.markAllAsTouched();
      this.scrollToFirstInvalidControl();
      this.cdr.detectChanges();
      return;
    }

    const formData = this.paymentForm.getRawValue();
    const paymentDate = formData.paymentDate ? this.formatDate(formData.paymentDate) : '';
    const soId = this.selectedItem?.soId || 0;
    const id = formData.id

    const userId = sessionStorage.getItem('userId') || '';
    const roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId || 0;

    const paramvaluedata = `id=${id}|paymentDate=${paymentDate}|appUserId=${userId}|appRoleId=${roleID}`;

    this.openConfirmation('Confirm Update?', "Are you sure you want to update the payment date?", paramvaluedata, event);
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private scrollToFirstInvalidControl() {
    const firstInvalidControlName = this.findFirstInvalidControlName();
    if (firstInvalidControlName) {
      const element = document.querySelector(`input[formControlName="${firstInvalidControlName}"], select[formControlName="${firstInvalidControlName}"], textarea[formControlName="${firstInvalidControlName}"]`) as HTMLElement;
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus({ preventScroll: true });
        element.classList.add('p-invalid');
        setTimeout(() => element.classList.remove('p-invalid'), 3000);
      }
    }
  }

  private findFirstInvalidControlName(): string | null {
    const controls = this.paymentForm.controls;
    for (const controlName in controls) {
      const control = controls[controlName];
      if (control.invalid && (control.touched || control.dirty)) {
        return controlName;
      }
    }
    return null;
  }

  openConfirmation(title: string, msg: string, paramData: string, event?: any) {
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
        this.submitcall(paramData);
      },
      reject: () => {
        // Do nothing on reject
      }
    });
  }

  submitcall(paramData: string) {
    this.isFormLoading = true;
    this.cdr.detectChanges();

    const SP = 'uspPostReceivedPayment';

    this.userService.SubmitPostTypeData(SP, paramData, 'header').subscribe({
      next: (datacom: any) => {
        this.isFormLoading = false;
        if (!datacom) return;

        const resultarray = datacom.split('-');
        if (resultarray[1] === 'success') {
          this.getTableData(false);
          this.message.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Payment date updated successfully.',
          });
          this.onDrawerHide();
        } else if (resultarray[0] === '2') {
          this.message.add({
            severity: 'warn',
            summary: 'Warn',
            detail: resultarray[1] || datacom,
          });
        } else {
          this.message.add({
            severity: 'warn',
            summary: 'Warn',
            detail: datacom,
          });
        }

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Submit error:', err);
        this.message.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update payment date.',
        });
        this.isFormLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  onDrawerHide() {
    this.visible = false;
    this.paymentForm.reset({
      id: 0
    });
    this.cdr.detectChanges();
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

  onSortChange(event: { column: string, direction: 'asc' | 'desc' }) {
    this.sortColumn = event.column;
    this.sortDirection = event.direction;
    this.getTableData(true);
  }

  isInvalid(field: string): boolean {
    const control = this.paymentForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  ngOnDestroy() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }
}