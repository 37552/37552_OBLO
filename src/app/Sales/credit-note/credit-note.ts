import { Component, ChangeDetectorRef, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { TableTemplate, TableColumn } from '../../table-template/table-template';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { Popover } from 'primeng/popover';
import { Tooltip } from "primeng/tooltip";
import { Dialog } from 'primeng/dialog';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CardModule } from 'primeng/card';
import { DrawerModule } from 'primeng/drawer';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Toast } from 'primeng/toast';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { SkeletonModule } from 'primeng/skeleton';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';

// Services
import { UserService } from '../../shared/user-service';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-credit-note',
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
    BreadcrumbModule,
    SkeletonModule,
    DatePickerModule,
    DialogModule
  ],
  providers: [
    ConfirmationService,
    MessageService
  ],
  templateUrl: './credit-note.html',
  styleUrls: ['./credit-note.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreditNote implements OnInit, OnDestroy {
  isLoading = true;
  isFormLoading = false;
  visible: boolean = false;
  postType: string = '';
  header: string = '';
  headerIcon: string = '';
  paramvaluedata: string = '';
  data: any[] = [];
  selectedIndex: any = null;
  creditNoteForm: FormGroup;
  returnHeaders: any[] = [];
  bins: any[] = [];
  selectedReturnDetails: any = null;
  creditNoteItems: any[] = [];
  jsonDetailsVisible: boolean = false;
  selectedItemDetails: any = null;
  
  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true },
    { key: 'crNo', header: 'Credit Note No', isVisible: true },  
    { key: 'soNo', header: 'Sales Order No', isVisible: true },  
    { key: 'customer', header: 'Customer', isVisible: true },   
    { key: 'totalAmount', header: 'Total Amount', isVisible: true },
    { key: 'reason', header: 'Reason', isVisible: true },
    { key: 'jsonDetails', header: 'Credit Note Details', isVisible: true, isSortable: false, isCustom: true }
  ];
  
  pageNo = 1;
  pageSize = 5;
  searchText = '';
  totalCount = 0;
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  searchTimeout: any;
  debounceTime = 500;
  
  breadcrumbItems!: { label: string; disabled?: boolean }[];
  FormName: string = '';
  menulabel: string = '';
  param: string | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private message: MessageService,
    private cdr: ChangeDetectorRef
  ) {
    this.creditNoteForm = this.fb.group({
      id: [0],
      returnId: [null, Validators.required],
      soHeaderId: [null],
      customerId: [null],
      creditNoteDate: [null],
      reason: ['', Validators.required],
      status: ['']
    });
  }

  get f() { return this.creditNoteForm.controls }

  ngOnInit(): void {
    this.param = sessionStorage.getItem("menuItem");
    if (this.param) {
      let paramjs = JSON.parse(this.param);
      this.FormName = paramjs.formName;
      this.menulabel = paramjs.menu;
    }
    
    this.breadcrumbItems = [
      { label: this.menulabel },
      { label: this.FormName, disabled: true }
    ];
    
    this.loadDropdowns();
    this.getTableData(true);
    
    setTimeout(() => {
      if (this.isLoading) {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    }, 1000);
  }

  loadDropdowns(): void {
    this.loadReturnHeaders();
    this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblWarehouseBinLocation`).subscribe({
      next: (res: any) => {
        this.bins = res['table'] || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading bins:', err);
        this.bins = [];
      }
    });
  }

  loadReturnHeaders(): void {
    const currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
    const roleId = currentRole?.roleId || '';
    const userId = sessionStorage.getItem('userId') || '';
    this.userService.getQuestionPaper(`uspGetReturnForCreditNote|action=RETURNHEAD|id=0|appUserId=${userId}|appUserRole=${roleId}`)
      .subscribe({
        next: (res: any) => {
          this.returnHeaders = res['table'] || [];
          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error loading return headers:', err);
          this.returnHeaders = [];
          this.message.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load return headers'
          });
          this.cdr.detectChanges();
        }
      });
  }

  onReturnChange(event: any): void {
    const returnId = event.value;
    
    if (!returnId) {
      this.resetReturnData();
      return;
    }
    
    this.isFormLoading = true;
    const currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
    const roleId = currentRole?.roleId || '';
    const userId = sessionStorage.getItem('userId') || '';
    
    this.userService.getQuestionPaper(`uspGetReturnForCreditNote|action=RETURNDETAIL|id=${returnId}|appUserId=${userId}|appUserRole=${roleId}`)
      .subscribe({
        next: (res: any) => {
          if (res['table'] && res['table'].length > 0) {
            this.selectedReturnDetails = res['table'][0];
            this.patchFormData();
            this.loadReturnItems();
          }
          this.isFormLoading = false;
          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error loading return details:', err);
          this.message.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load return details'
          });
          this.isFormLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  private resetReturnData(): void {
    this.selectedReturnDetails = null;
    this.creditNoteItems = [];
    this.creditNoteForm.patchValue({
      soHeaderId: null,
      customerId: null,
      reason: ''
    });
    this.cdr.detectChanges();
  }

  private patchFormData(): void {
    if (!this.selectedReturnDetails) return;
    
    this.creditNoteForm.patchValue({
      soHeaderId: this.selectedReturnDetails.soHeaderId,
      customerId: this.selectedReturnDetails.customerId,
      reason: this.selectedReturnDetails.reason || ''
    });
    this.refreshFormBinding();
  }

  private loadReturnItems(): void {
    if (!this.selectedReturnDetails || !this.selectedReturnDetails.soRetun) {
      this.creditNoteItems = [];
      return;
    }
    
    try {
      const returnItems = JSON.parse(this.selectedReturnDetails.soRetun);
      this.creditNoteItems = returnItems.map((item: any) => ({
        id: item.id || 0,
        returnChildId: item.id,
        soChildId: item.soChildId,
        itemCodeId: item.itemCodeId,
        itemId: item.itemiD,
        itemName: item.itemName || '',
        quantity: item.quantity || 0,
        unitPrice: item.UnitPrice || 0,
        lineTotal: (item.quantity || 0) * (item.UnitPrice || 0),
        reason: item.reason || this.selectedReturnDetails.reason || '',
        binId: null,
        binLocation: null,
        selected: false
      }));
      
      // If in view/update mode, match selected items
      if (this.postType === 'view' || this.postType === 'update') {
        this.matchSelectedItems();
      }
    } catch (error) {
      console.error('Error parsing return items:', error);
      this.creditNoteItems = [];
    }
    
    this.cdr.detectChanges();
  }

  private matchSelectedItems(): void {
    if (this.selectedIndex && this.selectedIndex.creditNoteDetails) {
      const existingDetails = this.selectedIndex.creditNoteDetails;
      
      this.creditNoteItems.forEach(item => {
        const existingItem = existingDetails.find((detail: any) => 
          detail.returnChildId === item.returnChildId || 
          detail.soChildId === item.soChildId
        );
        
        if (existingItem) {
          item.selected = true;
          item.binId = existingItem.binId;
          item.binLocation = existingItem.binLocation;
          // Preserve existing values if available
          item.quantity = existingItem.quantity || item.quantity;
          item.unitPrice = existingItem.unitPrice || item.unitPrice;
          item.reason = existingItem.reason || item.reason;
          item.lineTotal = (item.quantity || 0) * (item.unitPrice || 0);
        }
      });
    }
  }

  toggleAllItems(isChecked: boolean): void {
    this.creditNoteItems.forEach(item => {
      if (this.postType !== 'view') {
        item.selected = isChecked;
        if (isChecked) {
          item.binId = null;
        }
      }
    });
    this.cdr.detectChanges();
  }

  onItemSelectionChange(item: any, isChecked: boolean): void {
    if (this.postType !== 'view') {
      item.selected = isChecked;
      item.binId = isChecked ? null : undefined;
    }
    this.cdr.detectChanges();
  }

  get selectedItems(): any[] {
    return this.creditNoteItems.filter(item => item.selected);
  }

  get totalAmount(): number {
    return this.selectedItems.reduce((sum, item) => sum + item.lineTotal, 0);
  }

  getTableData(isTrue: boolean): void {
    if (isTrue) {
      this.isLoading = true;
      this.cdr.detectChanges();
    } else {
      this.pageNo = 1;
    }

    const currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
    const roleId = currentRole?.roleId || '';
    const userId = sessionStorage.getItem('userId') || '';
    let query = `searchText=${this.searchText}|pageIndex=${this.pageNo}|size=${this.pageSize}|appUserId=${userId}|appUserRole=${roleId}`;
    this.userService.getQuestionPaper(`uspGetCreditNote|${query}`).subscribe({
      next: (res: any) => {
        try {
          const rawData = res?.table1 || res?.table || [];
          this.data = rawData.map((item: any) => {
            let creditNoteDetails: any[] = [];
            let totalAmount = 0;
            if (item.creditNoteDetail) {
              try {
                creditNoteDetails = JSON.parse(item.creditNoteDetail);
                totalAmount = creditNoteDetails.reduce((sum, detail) => 
                  sum + ((detail.Quantity || 0) * (detail.UnitPrice || 0)), 0);
                creditNoteDetails = creditNoteDetails.map((detail: any) => {
                  return {
                    id: detail.id || 0,
                    creditNoteHeaderId: item.id,
                    returnChildId: detail.returnChildId,
                    itemCodeId: detail.itemCodeId,
                    item: detail.item || detail.Item || '',
                    itemCode: detail.ItemCode || '',
                    quantity: detail.Quantity || 0,
                    unitPrice: detail.UnitPrice || 0,
                    binId: detail.binId,
                    binLocation: detail.bin || '',
                    makerCode: detail.makerCode || '',
                    make: detail.make || ''
                  };
                });
              } catch (parseError) {
                console.error('Error parsing creditNoteDetail:', parseError);
                creditNoteDetails = [];
              }
            }
            
            return {
              ...item,
              id: item.id,
              crNo: item.crNo || '',  
              soNumber: item.soNo || '',  
              soHeaderId: item.soHeaderId,
              customerName: item.customer || '',  
              customerId: item.customerId,
              creditNoteDate: item.creditNoteDate,
              totalAmount: totalAmount,
              status: item.status || '',
              reason: item.reason || '',
              creditNoteDetails: creditNoteDetails,
              organisation: item.organisation || '',
              soReturnNo: item.soReturnNo
            };
          });
          
          // Get total count from table property
          this.totalCount = res?.table?.[0]?.totalCnt || 
                           res?.table?.[0]?.totalCount || 
                           this.data.length;

        } catch (innerErr) {
          console.error('Error processing credit note data:', innerErr);
          this.data = [];
          this.totalCount = 0;
          this.message.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: 'Failed to process credit note data.' 
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
          detail: 'Failed to load credit notes.' 
        });
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  showDialog(view: string, data: any): void {
    this.isFormLoading = true;
    this.cdr.detectChanges();

    if (view == 'add') {
      this.visible = true;
      this.postType = view;
      this.header = 'Add Credit Note';
      this.headerIcon = 'pi pi-plus';
      this.creditNoteForm.reset({ 
        id: 0,
        creditNoteDate: '',
        status: ''
      });
      this.selectedReturnDetails = null;
      this.creditNoteItems = [];
      this.isFormLoading = false;
      this.cdr.detectChanges();
    } else {
      this.visible = true;
      this.postType = view;
      this.header = view === 'update' ? 'Update Credit Note' : 'View Credit Note';
      this.headerIcon = view === 'update' ? 'pi pi-pencil' : 'pi pi-eye';
      this.selectedIndex = data;

      if (view === 'view') {
        this.creditNoteForm.disable();
      } else {
        this.creditNoteForm.enable();
      }

      // Clear previous data
      this.selectedReturnDetails = null;
      this.creditNoteItems = [];
      
      // Initialize with existing data
      this.initializeCreditNoteDetails(data);
    }
    document.body.style.overflow = 'hidden';
  }

  private initializeCreditNoteDetails(data: any): void {
    try {
      const details = data.creditNoteDetails || (data.creditNoteDetail ? JSON.parse(data.creditNoteDetail) : []);
      
      if (details && details.length > 0) {
        this.creditNoteItems = details.map((detail: any) => ({
          id: detail.id || 0,
          returnChildId: detail.returnChildId || detail.id,
          soChildId: detail.soChildId,
          itemCodeId: detail.itemCodeId,
          itemId: detail.itemId || detail.itemiD,
          itemName: detail.item || detail.Item || '',
          quantity: detail.Quantity || detail.quantity || 0,
          unitPrice: detail.UnitPrice || detail.unitPrice || 0,
          lineTotal: (detail.Quantity || detail.quantity || 0) * (detail.UnitPrice || detail.unitPrice || 0),
          reason: detail.reason || '',
          binId: detail.binId,
          binLocation: detail.binLocation || detail.bin || '',
          selected: true  
        }));

        // Patch form values for view/update
        this.patchFormValuesForViewUpdate(data);
        
        if (data.returnId) {
          this.loadReturnForEdit(data.returnId);
        } else {
          this.isFormLoading = false;
          this.refreshFormBinding();
        }
      } else {
        this.creditNoteItems = [];
        this.patchFormValuesForViewUpdate(data);
        this.isFormLoading = false;
        this.refreshFormBinding();
      }
    } catch (parseError) {
      console.error('Error parsing credit note details:', parseError);
      this.creditNoteItems = [];
      this.patchFormValuesForViewUpdate(data);
      this.isFormLoading = false;
      this.refreshFormBinding();
    }
    this.cdr.detectChanges();
  }

private patchFormValuesForViewUpdate(data: any): void {
  debugger
  const patchData = {
    id: data.id || 0,
    returnId: data.returnId || null,
    soHeaderId: data.soHeaderId || null,
    customerId: data.customerId || null,
    creditNoteDate: data.returnDate ? new Date(data.returnDate) : null, 
    reason: data.reason || '',
    status: data.status || '' 
  };

  this.creditNoteForm.patchValue(patchData);
  this.refreshFormBinding();
}

  private loadReturnForEdit(returnId: number): void {
    const currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
    const roleId = currentRole?.roleId || '';
    const userId = sessionStorage.getItem('userId') || '';
    
    this.userService.getQuestionPaper(`uspGetReturnForCreditNote|action=RETURNDETAIL|id=${returnId}|appUserId=${userId}|appUserRole=${roleId}`)
      .subscribe({
        next: (res: any) => {
          if (res['table'] && res['table'].length > 0) {
            this.selectedReturnDetails = res['table'][0];
            if (this.postType === 'view' || this.postType === 'update') {
              const returnData = res['table'][0];
              const formData = {
                returnId: returnData.id,
                soHeaderId: returnData.soHeaderId,
                customerId: returnData.customerId,
                reason: returnData.reason || this.creditNoteForm.get('reason')?.value
              };
              this.creditNoteForm.patchValue(formData);
              this.refreshFormBinding();
            }
          }
          this.isFormLoading = false;
          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error loading return details:', err);
          this.isFormLoading = false;
          this.cdr.detectChanges();
        }
      });
     }

          getReturnNoLabel(): string {
          if (this.selectedReturnDetails?.soReturnNo) {
            return this.selectedReturnDetails.soReturnNo;
          }
          const selected = this.returnHeaders.find(h => h.drpValue === this.creditNoteForm.get('returnId')?.value);
          return selected ? selected.drpOption : '';
        }
        

     get totalSelectedQuantity(): number {
       return this.selectedItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
     }

  refreshFormBinding(): void {
    this.creditNoteForm.updateValueAndValidity();
    this.cdr.markForCheck();
    this.cdr.detectChanges();
  }

  onSubmit(event: any): void {
    if (!this.creditNoteForm.valid) {
      this.creditNoteForm.markAllAsTouched();
      this.scrollToFirstInvalidControl();
      this.cdr.detectChanges();
      return;
    }
    
    if (this.selectedItems.length === 0) {
      this.message.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select at least one item'
      });
      return;
    }

    const invalidItems = this.selectedItems.filter(item => !item.binId);
    if (invalidItems.length > 0) {
      this.message.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select bin for all selected items'
      });
      return;
    }

    const formData = this.creditNoteForm.getRawValue();

    const creditNoteItemsJson = this.selectedItems.map(item => ({
      id: item.id || 0,
      returnChildId: item.returnChildId,
      itemCodeId: item.itemCodeId,
      binId: item.binId,
      Quantity: item.quantity,
      UnitPrice: item.unitPrice,
      reason: item.reason
    }));

    const roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId || '';
    const userId = sessionStorage.getItem('userId') || '';
    
    if (this.postType === 'add') {
      this.paramvaluedata = `returnId=${formData.returnId}|soHeaderId=${formData.soHeaderId}|CustomerId=${formData.customerId}|creditNoteDate=${this.formatDate(formData.creditNoteDate)}|reason=${formData.reason}|status=${formData.status}|creditNoteChildJson=${JSON.stringify(creditNoteItemsJson)}|appUserId=${userId}|appUserRole=${roleID}`;
    } else {
      this.paramvaluedata = `id=${formData.id}|returnId=${formData.returnId}|soHeaderId=${formData.soHeaderId}|CustomerId=${formData.customerId}|creditNoteDate=${this.formatDate(formData.creditNoteDate)}|reason=${formData.reason}|status=${formData.status}|creditNoteChildJson=${JSON.stringify(creditNoteItemsJson)}|appUserId=${userId}|appUserRole=${roleID}`;
    }
    
    this.openConfirmation('Confirm?', "Are you sure you want to proceed?", '1', '1', event);
  }

  private scrollToFirstInvalidControl(): void {
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
    const controls = this.creditNoteForm.controls;
    for (const controlName in controls) {
      const control = controls[controlName];
      if (control.invalid && (control.touched || control.dirty)) {
        return controlName;
      }
    }
    return null;
  }

  openConfirmation(title: string, msg: string, id: any, option?: string, event?: any): void {
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

  submitcall(): void {
    this.isFormLoading = true;
    this.cdr.detectChanges();

    const SP = this.postType === 'update' ? 'uspUpdateCreditNote' : 'uspPostCreditNote';

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
                ? 'Credit Note Updated Successfully.'
                : 'Credit Note Created Successfully.',
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
              ? 'Credit Note Updated Successfully.'
              : 'Credit Note Created Successfully.',
          });
          this.onDrawerHide();
        } else if (datacom.result === 2) {
          this.message.add({
            severity: 'warn',
            summary: 'Warn',
            detail: datacom.msg || 'Operation failed.',
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
          detail: 'Failed to save credit note data.',
        });
        this.isFormLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  deleteData(): void {
    const roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId || '';
    let query = `action=DELETE|id=${this.selectedIndex.id || 0}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${roleID}`;
    this.userService.SubmitPostTypeData(`uspDeleteCreditNote`, query, 'header').subscribe({
      next: (datacom: any) => {
        this.isFormLoading = false;
        if (!datacom) return;
        if (datacom.result === 1) {
          this.getTableData(true);
          this.message.add({ severity: 'success', summary: 'Success', detail: 'Credit Note deleted successfully' });
          this.onDrawerHide();
        } else {
          this.message.add({ severity: 'warn', summary: 'Warn', detail: datacom.msg || 'Delete failed', });
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Delete error:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete credit note.' });
        this.isFormLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onDrawerHide(): void {
    document.body.style.overflow = 'visible';
    this.creditNoteForm.enable();
    this.visible = false;
    this.onClear();
    this.cdr.detectChanges();
  }

  onPageChange(newPage: number): void {
    this.pageNo = newPage;
    this.getTableData(true);
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize = newSize;
    this.pageNo = 1;
    this.getTableData(true);
  }

  onSortChange(event: { column: string, direction: 'asc' | 'desc' }): void {
    this.sortColumn = event.column;
    this.sortDirection = event.direction;
    this.getTableData(true);
  }

  isInvalid(field: string): boolean {
    const control = this.creditNoteForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onClear(): void {
    this.creditNoteForm.reset({
      id: 0,
      creditNoteDate:'',
      status: ''
    });
    this.selectedReturnDetails = null;
    this.creditNoteItems = [];
    this.cdr.detectChanges();
  }

  onSearchChange(search: string): void {
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

  clearSearch(): void {
    this.searchText = '';
    this.pageNo = 1;
    this.getTableData(false);
    this.cdr.markForCheck();
  }

  viewCreditNoteDetails(item: any): void {
    let parsedDetails: any[] = [];
    
    if (item.creditNoteDetail) {
      try {
        parsedDetails = JSON.parse(item.creditNoteDetail);
      } catch (err) {
        console.error('Invalid creditNoteDetail JSON:', err);
        parsedDetails = [];
      }
    } else if (item.creditNoteDetails) {
      parsedDetails = item.creditNoteDetails;
    }

    const normalizedDetails = parsedDetails.map((p: any) => ({
      item: p.item || p.Item || '',
      itemCode: p.ItemCode || '',
      quantity: p.Quantity || 0,
      unitPrice: p.UnitPrice || 0,
      binLocation: p.bin || '',
      makerCode: p.makerCode || '',
      make: p.make || ''
    }));

    const totalAmount = normalizedDetails.reduce((sum: number, detail: any) => 
      sum + (detail.quantity * detail.unitPrice), 0);

    this.selectedItemDetails = {
      crNo: item.crNo,  
      soNumber: item.soNo,  
      customerName: item.customer,  
      organisation: item.organisation || '',
      creditNoteDate: item.creditNoteDate,
      totalAmount: totalAmount,
      status: item.status || '',
      reason: item.reason || '',
      creditNoteDetails: normalizedDetails
    };

    this.jsonDetailsVisible = true;
    this.cdr.detectChanges();
  }

  closeJsonDetails(): void {
    this.jsonDetailsVisible = false;
    this.selectedItemDetails = null;
    this.cdr.detectChanges();
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  ngOnDestroy(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }
}