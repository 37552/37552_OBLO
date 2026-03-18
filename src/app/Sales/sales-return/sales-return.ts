import { Component, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
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
import { HttpErrorResponse } from '@angular/common/http';
import { DatePickerModule } from 'primeng/datepicker';
import { Drawer } from 'primeng/drawer';
import { BreadcrumbModule } from 'primeng/breadcrumb';

@Component({
  selector: 'app-sales-return',
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
    Dialog,
    DatePickerModule,
    Drawer,
    BreadcrumbModule
  ],
  providers: [
    ConfirmationService,
    MessageService
  ],
  templateUrl: './sales-return.html',
  styleUrl: './sales-return.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SalesReturn {
  isLoading = true;
  visible: boolean = false;
  postType: string = '';
  header: any = '';
  selectedIndex: any = [];
  headerIcon: string = 'pi pi-plus';
  paramvaluedata: string = '';
  isFormLoading: boolean = false;
  data: any[] = [];
  salesReturnForm: FormGroup;
  maxDate: Date = new Date();
  salesOrderSummary: any = null;
  
  // Return Details Dialog
  returnDetailsVisible: boolean = false;
  selectedReturnDetails: any = null;
  
  // Dropdown arrays
  salesOrders: any[] = [];
  CustomerOptions: any[] = [];
  // Static delivery statuses
  deliveryStatuses: any[] = [
    { drpOption: 'Approved', drpValue: 10001 },
    { drpOption: 'Cancelled', drpValue: 10007 }
  ];
  selectedReturnItems: any[] = [];
  
  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true },
    { key: 'text', header: 'Return No', isVisible: true },
    { key: 'soNo', header: 'Sales Order No', isVisible: true },
    { key: 'customerName', header: 'Customer', isVisible: true },
    { key: 'returnDate', header: 'Return Date', isVisible: true },
    { key: 'totalAmount', header: 'Total Amount', isVisible: true },
    { key: 'reason', header: 'Reason', isVisible: true },
    { key: 'status', header: 'Status', isVisible: true },
    { key: 'jsonDetails', header: 'Return Details', isVisible: true, isSortable: false, isCustom: true }
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
    private message: MessageService,
    private cdr: ChangeDetectorRef
  ) {
    this.salesReturnForm = this.fb.group({
      id: [0],
      soHeaderId: [null, Validators.required],
      customerId: [null, Validators.required],
      deliveryStatusId: [null, Validators.required],
      returnDate: [null, Validators.required],
      reason: ['', Validators.required],
      totalAmount: [0]
    });
  }

  get f() { return this.salesReturnForm.controls; }

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
    this.loadDropdowns();
    this.getTableData(true);
    this.cdr.detectChanges();
    
    setTimeout(() => {
      if (this.isLoading) {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    }, 1000);
  }

  loadDropdowns() {
    this.getSalesOrders();
    this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblCustomerMasterHeader`).subscribe({
      next: (res: any) => {
        this.CustomerOptions = res['table'] || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading status options:', err);
        this.CustomerOptions = [];
      }
    });

    // Delivery statuses are now static - removed API call
    this.cdr.detectChanges();
  }

  getSalesOrders() {
    this.userService.getQuestionPaper(`uspGetSalesOrderForReturnDrp`)
      .subscribe({
        next: (res: any) => {
          this.salesOrders = res?.['table'] || [];
          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error loading sales orders:', err);
          this.salesOrders = [];
          if (err.status == 403) {
            this.message.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Access denied to load sales orders'
            });
          }
          this.cdr.detectChanges();
        }
      });
  }

  onSalesOrderChange(event: any): void {
    const soHeaderId = event.value;

    if (!soHeaderId) {
      this.salesReturnForm.patchValue({
        customerId: null,
        customerName: '',
        customerAddress: '',
        contactPerson: '',
        contactMobile: '',
        warehouse: ''
      });
      this.selectedReturnItems = [];
      this.salesOrderSummary = null;
      return;
    }

    this.isFormLoading = true;
    this.userService
      .getQuestionPaper(`uspGetSelectedSalesOrderDetails|soId=${soHeaderId}`)
      .subscribe({
        next: (res: any) => {
          if (res.table?.length) {
            const headerData = res.table[0];
            this.patchFormData(headerData);
            
            // Load items from table1
            if (res.table1?.length) {
              this.loadSalesOrderItems(res.table1);
            }
            
            // Calculate sales order summary
            this.calculateSalesOrderSummary(res.table1);
          }
          this.isFormLoading = false;
          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error loading sales order details:', err);
          this.isFormLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  loadSalesOrderItems(items: any[]) {
    this.selectedReturnItems = items.map((item: any) => ({
      soChildId: item.id,
      itemCodeId: item.itemCodeId || item.itemId,
      item: item.item || '',
      uom: item.uom || '',
      orderedQuantity: item.quantity || 0,
      returnQuantity: 0, // Will be populated from existing return data if editing
      rate: item.rate || item.unitPrice || 0,
      itemReason: '', // Will be populated from existing return data if editing
      total: item.total || (item.quantity * item.rate) || 0
    }));
  }

  calculateSalesOrderSummary(items: any[]) {
    if (!items || items.length === 0) {
      this.salesOrderSummary = null;
      return;
    }

    const totalItems = items.length;
    const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const totalAmount = items.reduce((sum, item) => {
      const itemTotal = item.total || (item.quantity * item.rate) || 0;
      return sum + itemTotal;
    }, 0);

    this.salesOrderSummary = {
      totalItems: totalItems,
      totalQuantity: totalQuantity,
      totalAmount: totalAmount
    };
  }

  private patchFormData(data: any): void {
    this.salesReturnForm.patchValue({
      customerId: data.customerId || null,
      customerName: data.customer || data.customerName || '',
      customerAddress: data.customerAddress || '',
      contactPerson: data.contactPerson || '',
      contactMobile: data.contactMobile || '',
      warehouse: data.warehouse || ''
    });
  }

  calculateItemTotal(item: any) {
    // Validate return quantity
    if (item.returnQuantity > item.orderedQuantity) {
      item.returnQuantity = item.orderedQuantity;
    }
    if (item.returnQuantity < 0) {
      item.returnQuantity = 0;
    }
    
    // Update total amount in form
    const totalAmount = this.getTotalReturnAmount();
    this.salesReturnForm.patchValue({ totalAmount: totalAmount });
    
    this.cdr.detectChanges();
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
    
    this.userService.getQuestionPaper(`uspGetSalesOrdeReurn|${query}`).subscribe({
      next: (res: any) => {
        try {
          this.data = res?.table1 || [];
          
          this.data = this.data.map(item => {
            let returnItems: any[] = [];
            let totalAmount = 0;
            
            if (item.soRetun) {
              try {
                returnItems = JSON.parse(item.soRetun);
                totalAmount = returnItems.reduce((sum, returnItem) => {
                  return sum + ((returnItem.quantity || 0) * (returnItem.UnitPrice || 0));
                }, 0);
              } catch (parseError) {
                console.error('Error parsing soRetun JSON:', parseError);
                returnItems = [];
              }
            }
            
            return {
              ...item,
              id: item.id,
              text: item.soReturnNo || item.text || '',
              soNo: item.soNo || '',
              soHeaderId: item.soHeaderId,
              customerName: item.customer || item.customerName || '',
              customerId: item.customerId,
              returnDate: item.returnDate || '',
              totalAmount: totalAmount || item.totalAmount || 0,
              reason: item.reason || '',
              status: item.status || '',
              statusId: item.statusId,
              returnItems: returnItems
            };
          });
          
          this.totalCount = res?.table?.[0]?.totalCnt || 
                           res?.table?.[0]?.totalCount || 
                           this.data.length;

        } catch (innerErr) {
          console.error('Error processing return data:', innerErr);
          this.data = [];
          this.totalCount = 0;
          this.message.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: 'Failed to process return data.' 
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
          detail: 'Failed to load sales returns.' 
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

  showDialog(view: string, data: any) {
    this.isFormLoading = true;
    this.cdr.detectChanges();

    if (view == 'add') {
      this.visible = true;
      this.postType = view;
      this.header = 'Add Sales Return';
      this.headerIcon = 'pi pi-plus';
      this.salesReturnForm.reset({ 
        id: 0, 
        totalAmount: 0,
        deliveryStatusId: null,
      });
      this.selectedReturnItems = [];
      this.salesOrderSummary = null;
      this.isFormLoading = false;
      this.cdr.detectChanges();
    } else {
      this.visible = true;
      this.postType = view;
      this.header = view === 'update' ? 'Update Sales Return' : 'View Sales Return';
      this.headerIcon = view === 'update' ? 'pi pi-pencil' : 'pi pi-eye';
      this.selectedIndex = data;

      if (view === 'view') {
        this.salesReturnForm.disable();
      } else {
        this.salesReturnForm.enable();
      }

      const patchData = {
        id: data.id || 0,
        soHeaderId: data.soHeaderId || null,
        customerId: data.customerId || null,
        customerName: data.customerName || '',
        returnDate: data.returnDate ? new Date(data.returnDate) : null,
        reason: data.reason || '',
        totalAmount: data.totalAmount || 0,
        deliveryStatusId: data.statusId || null
      };

      this.salesReturnForm.patchValue(patchData);
      
      if (data.soHeaderId) {
        this.loadExistingReturnData(data);
      }
      
      this.isFormLoading = false;
    }
    document.body.style.overflow = 'hidden';
  }

  loadExistingReturnData(data: any) {
    // Load the original sales order details
    const soHeaderId = data.soHeaderId;
    if (soHeaderId) {
      this.userService
        .getQuestionPaper(`uspGetSelectedSalesOrderDetails|soId=${soHeaderId}`)
        .subscribe({
          next: (res: any) => {
            if (res.table?.length) {
              const headerData = res.table[0];
              this.patchFormData(headerData);
              
              // Load items from table1
              if (res.table1?.length) {
                this.loadSalesOrderItems(res.table1);
                this.loadReturnChildItems(data);
              }
              
              // Calculate sales order summary
              this.calculateSalesOrderSummary(res.table1);
            }
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Error loading existing return data:', err);
          }
        });
    }
  }

  loadReturnChildItems(data: any) {
    // Parse soRetun JSON from the existing data
    if (data.soRetun) {
      try {
        const parsedReturnItems = JSON.parse(data.soRetun);
        
        if (parsedReturnItems.length > 0 && this.selectedReturnItems.length > 0) {
          this.selectedReturnItems = this.selectedReturnItems.map(item => {
            const returnItem = parsedReturnItems.find((ri: any) => ri.soChildId === item.soChildId);
            if (returnItem) {
              return {
                ...item,
                returnQuantity: returnItem.quantity || 0,
                itemReason: returnItem.reason || '',
                id: returnItem.id || 0
              };
            }
            return item;
          });
        } else if (data.id) {
          // Fallback: Load from API if soRetun is empty
          this.loadReturnChildItemsFromApi(data.id);
        }
        
        // Recalculate total amount
        const totalAmount = this.getTotalReturnAmount();
        this.salesReturnForm.patchValue({ totalAmount: totalAmount });
        
      } catch (err) {
        console.error('Error parsing soRetun JSON:', err);
        // Fallback to API call
        if (data.id) {
          this.loadReturnChildItemsFromApi(data.id);
        }
      }
    } else if (data.id) {
      // Load from API if soRetun is not available
      this.loadReturnChildItemsFromApi(data.id);
    }
    
    this.cdr.detectChanges();
  }

  loadReturnChildItemsFromApi(returnHeaderId: number) {
    this.userService.getQuestionPaper(`uspGetSOReturnChild|returnHeaderId=${returnHeaderId}`)
      .subscribe({
        next: (res: any) => {
          if (res.table?.length && this.selectedReturnItems.length > 0) {
            this.selectedReturnItems = this.selectedReturnItems.map(item => {
              const returnItem = res.table.find((ri: any) => ri.soChildId === item.soChildId);
              if (returnItem) {
                return {
                  ...item,
                  returnQuantity: returnItem.quantity || 0,
                  itemReason: returnItem.reason || '',
                  id: returnItem.id || 0
                };
              }
              return item;
            });

            const totalAmount = this.getTotalReturnAmount();
            this.salesReturnForm.patchValue({ totalAmount: totalAmount });
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error loading return child items from API:', err);
          this.cdr.detectChanges();
        }
      });
  }

  viewReturnDetails(item: any) {
    let parsedReturnItems: any[] = [];

    if (item.soRetun) {
      try {
        parsedReturnItems = JSON.parse(item.soRetun);
      } catch (err) {
        console.error('Invalid soRetun JSON:', err);
        parsedReturnItems = [];
      }
    } else if (item.returnItems) {
      parsedReturnItems = item.returnItems;
    }

    this.selectedReturnDetails = {
      soReturnNo: item.soReturnNo || item.text,
      soNo: item.soNo,
      customer: item.customer || item.customerName,
      returnDate: item.returnDate,
      reason: item.reason,
      status: item.status,
      returnItems: parsedReturnItems
    };

    this.returnDetailsVisible = true;
    this.cdr.detectChanges();
  }

  getReturnItemsTotal(items: any[]): number {
    return items.reduce((total, item) => {
      return total + ((item.quantity || 0) * (item.UnitPrice || 0));
    }, 0);
  }

  closeReturnDetails() {
    this.returnDetailsVisible = false;
    this.selectedReturnDetails = null;
    this.cdr.detectChanges();
  }

  onSubmit(event: any) {
    if (!this.salesReturnForm.valid) {
      this.salesReturnForm.markAllAsTouched();
      this.scrollToFirstInvalidControl();
      this.cdr.detectChanges();
      return;
    }
    
    if (this.selectedReturnItems.length === 0) {
      this.message.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'No items selected for return.'
      });
      return;
    }

    const hasReturnItems = this.selectedReturnItems.some(item => 
      item.returnQuantity && item.returnQuantity > 0
    );

    if (!hasReturnItems) {
      this.message.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please specify return quantity for at least one item.'
      });
      return;
    }

    const invalidItems = this.selectedReturnItems.filter(item => 
      item.returnQuantity && 
      (item.returnQuantity < 0 || item.returnQuantity > item.orderedQuantity)
    );

    if (invalidItems.length > 0) {
      this.message.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Return quantity cannot be negative or exceed ordered quantity.'
      });
      return;
    }
    
    const formData = this.salesReturnForm.getRawValue();
    const returnDetailJSON = this.selectedReturnItems
      .filter(item => item.returnQuantity > 0)
      .map(item => ({
        ...(this.postType !== 'add' && { id: item.id || 0 }),
        soChildId: item.soChildId,
        itemCodeId: item.itemCodeId,
        Quantity: item.returnQuantity,
        UnitPrice: item.rate,
        reason: item.itemReason || ''
      }));

    const roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId || '';
    const userId = sessionStorage.getItem('userId') || '';
    
    if (this.postType === 'add') {
      this.paramvaluedata = `soHeaderId=${formData.soHeaderId}|CustomerId=${formData.customerId}|returnDate=${this.formatDate(formData.returnDate)}|totalAmount=${formData.totalAmount}|reason=${formData.reason}|statusId=${formData.deliveryStatusId}|soReturnDetailJson=${JSON.stringify(returnDetailJSON)}|appUserId=${userId}|appUserRole=${roleID}`;
    } else {
      this.paramvaluedata = `id=${formData.id}|soHeaderId=${formData.soHeaderId}|CustomerId=${formData.customerId}|returnDate=${this.formatDate(formData.returnDate)}|totalAmount=${formData.totalAmount}|reason=${formData.reason}|statusId=${formData.deliveryStatusId}|soReturnDetailJson=${JSON.stringify(returnDetailJSON)}|appUserId=${userId}|appUserRole=${roleID}`;
    }
    
    this.openConfirmation('Confirm?', "Are you sure you want to proceed?", '1', '1', event);
  }

  private formatDate(date: Date): string {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
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
    const controls = this.salesReturnForm.controls;
    for (const controlName in controls) {
      const control = controls[controlName];
      if (control.invalid && (control.touched || control.dirty)) {
        return controlName;
      }
    }
    return null;
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
        } else if (option === '2') {
          this.deleteData();
        }
      },
      reject: () => {
      }
    });
  }

  submitcall() {
    this.isFormLoading = true;
    this.cdr.detectChanges();

    const SP = this.postType === 'update' ? 'uspPostUpdateSalesOrderReturn' : 'uspPostSalesOrderReturn';

    this.userService.SubmitPostTypeData(SP, this.paramvaluedata, 'header').subscribe({
      next: (datacom: any) => {
        this.isFormLoading = false;
        if (!datacom) return;
        if (typeof datacom === 'string' && datacom.includes('-')) {
          const resultarray = datacom.split("-");
          
          if (resultarray[1] === "success") {
            this.getTableData(false);
            this.message.add({
              severity: 'success',
              summary: 'Success',
              detail: this.postType === 'update'
                ? 'Sales Return Updated Successfully.'
                : 'Sales Return Created Successfully.',
            });
            this.onDrawerHide();
          } else if (resultarray[0] == "2") {
            this.message.add({
              severity: 'warn',
              summary: 'Warn',
              detail: resultarray[1] || datacom
            });
          } else {
            this.message.add({
              severity: 'warn',
              summary: 'Warn',
              detail: datacom,
            });
          }
        } 
        else if (datacom.result === 1) {
          this.getTableData(false);
          this.message.add({
            severity: 'success',
            summary: 'Success',
            detail: this.postType === 'update'
              ? 'Sales Return Updated Successfully.'
              : 'Sales Return Created Successfully.',
          });
          this.onDrawerHide();
        } else if (datacom.result === 2) {
          this.message.add({
            severity: 'warn',
            summary: 'Warn',
            detail: datacom.msg ||'',
          });
        } else {
          this.message.add({
            severity: 'warn',
            summary: 'Warn',
            detail: datacom.errormessage || 'Unknown error occurred.',
          });
        }

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Submit error:', err);
        this.message.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to save sales return data.',
        });
        this.isFormLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  deleteData() {
    const roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId || '';
    let query = `action=DELETE|id=${this.selectedIndex.id || 0}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${roleID}`;
    this.userService.SubmitPostTypeData(`uspDeleteSOReturn`, query, 'header').subscribe({
      next: (datacom: any) => {
        this.isFormLoading = false;
        if (!datacom) return;
        if (datacom.result === 1) {
          this.getTableData(true);
          this.message.add({ severity: 'success', summary: 'Success', detail: 'Sales return deleted successfully' });
          this.onDrawerHide();
        } else {
          this.message.add({ severity: 'warn', summary: 'Warn', detail: datacom.msg || 'Delete failed', });
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Delete error:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete sales return.' });
        this.isFormLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onDrawerHide() {
    document.body.style.overflow = 'visible';
    this.salesReturnForm.enable();
    this.visible = false;
    this.onClear();
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
    const control = this.salesReturnForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onClear() {
    this.salesReturnForm.reset({
      id: 0,
      totalAmount: 0,
      deliveryStatusId: null,
    });
    this.selectedReturnItems = [];
    this.salesOrderSummary = null;
    this.cdr.detectChanges();
  }

  getTotalReturnQuantity(): number {
    return this.selectedReturnItems.reduce((total, item) => total + (item.returnQuantity || 0), 0);
  }

  getTotalReturnAmount(): number {
    return this.selectedReturnItems.reduce((total, item) => 
      total + ((item.returnQuantity || 0) * (item.rate || 0)), 0
    );
  }

  getReturnItemCount(): number {
    return this.selectedReturnItems.filter(item => item.returnQuantity > 0).length;
  }

  ngOnDestroy() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }
}