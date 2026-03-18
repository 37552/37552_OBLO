import { Component, ChangeDetectorRef, AfterViewInit, ChangeDetectionStrategy, ViewChild, TemplateRef } from '@angular/core';
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
import { HttpErrorResponse } from '@angular/common/http';
import { ConfigService } from '../../shared/config.service';
import { OnlyNumberDirective } from '../../shared/directive/only-number.directive';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { SkeletonModule } from 'primeng/skeleton';
import { MultiSelectModule } from 'primeng/multiselect';
import { DatePickerModule } from 'primeng/datepicker';
import { Drawer } from 'primeng/drawer';

@Component({
  selector: 'app-picklist',
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
    DatePickerModule,
    Drawer
  ],
  providers: [
    ConfirmationService,
    MessageService
  ],
  templateUrl: './picklist.html',
  styleUrl: './picklist.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Picklist {
  isLoading = true;
  visible: boolean = false;
  postType: string = '';
  header: any = '';
  selectedIndex: any = [];
  headerIcon: string = 'pi pi-plus';
  paramvaluedata: string = '';
  isFormLoading: boolean = false;
  data: any[] = [];
  picklistForm: FormGroup;
  
  // JSON Details Drawer
  jsonDetailsVisible: boolean = false;
  selectedItemDetails: any = null;
  jsonSectionType: 'picklist' | null = null;
  
  // Dropdown arrays
  salesOrders: any[] = [];
  warehouses: any[] = [];
  binLocations: any[] = [];
  items: any[] = [];
  units: any[] = [];
  
  selectedPicklistDetails: any[] = [];
  
  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true },
    { key: 'text', header: 'Picklist No', isVisible: true },
    { key: 'soNumber', header: 'Sales Order No', isVisible: true },
    { key: 'warehouse', header: 'Warehouse', isVisible: true },
    { key: 'remarks', header: 'Remarks', isVisible: true },
    { key: 'createdDate', header: 'Created Date', isVisible: true },
    { key: 'status', header: 'Status', isVisible: true },
    { key: 'jsonDetails', header: 'Picklist Details', isVisible: true, isSortable: false, isCustom: true }
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
    private cdr: ChangeDetectorRef
  ) {
    this.picklistForm = this.fb.group({
      id: [0],
      soHeaderId: [null, Validators.required],
      warehouseId: [null, Validators.required],
      remarks: ['']
    });
  }

  get f() { return this.picklistForm.controls }

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
    this.getOrders();
    setTimeout(() => {
      if (this.isLoading) {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    }, 1000);
  }

  loadDropdowns() {
    const dropdownConfigs = [
      { key: 'warehouses', table: 'tblWarehouseMaster' },
      { key: 'items', table: 'tblmaterialmaster' },
      { key: 'units', table: 'tblUnitMaster' }
    ];

    dropdownConfigs.forEach(config => {
      this.userService.getQuestionPaper(`uspGetFillDrpDown|table=${config.table}`).subscribe({
        next: (res: any) => {
          (this as any)[config.key] = res['table'] || [];
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(`Error loading ${config.key}:`, err);
        }
      });
    });
  }

  binlocationdrp() {
    const warehouseId = this.picklistForm.get('warehouseId')?.value;

    if (!warehouseId) {
      this.binLocations = [];
      return;
    }

    this.userService
      .getQuestionPaper(`uspGetFillDrpDown|table=tblWarehouseBinLocation|filterValue=${warehouseId}|filterColumn=warehouseId`)
      .subscribe({
        next: (res: any) => {
          this.binLocations = res['table'] || [];
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error loading bin locations:', err);
        }
      });
  }

  onChangeDoc(event: any): void {
    const docNoId = event.value;

    if (!docNoId) {
      this.picklistForm.patchValue({
        warehouseId: null
      });
      this.picklistForm.get('warehouseId')?.enable(); 
      this.binLocations = []; 
      return;
    }
    this.isFormLoading = true;
    this.userService
      .getQuestionPaper(`uspGetSelectedSalesOrderDetails|soId=${docNoId}`)
      .subscribe({
        next: (res: any) => {
          if (res.table?.length) {
            const data = res.table[0];
            this.patchFormData(data);
            this.binlocationdrp();
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

  private patchFormData(data: any): void {
    this.picklistForm.patchValue({
      warehouseId: data.warehouseId || null
    });

    if (data.warehouseId) {
      this.picklistForm.get('warehouseId')?.disable();
    } else {
      this.picklistForm.get('warehouseId')?.enable();
    }
  }

  onItemChange(event: any, index: number) {
    const itemId = event.value;
    const detail = this.selectedPicklistDetails[index];
    if (!itemId) {
      detail.makerCodes = [];
      detail.makerCodeId = null;
      this.cdr.detectChanges();
      return;
    }

    detail.makerCodeId = null;
    detail.makerCodes = [];
    
    this.loadMakerCodes(itemId, index);
  }

  loadMakerCodes(itemId: number, index: number) {
    const currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
    const roleId = currentRole?.roleId || '';
    const userId = sessionStorage.getItem('userId') || '';
    
    this.userService.getQuestionPaper(`uspGetMatReqMasters|action=MAKERCODE|itemId=${itemId}|appUserId=${userId}|appUserRole=${roleId}`)
      .subscribe({
        next: (res: any) => {
          const makerCodes = res?.['table'] || [];
          this.selectedPicklistDetails[index].makerCodes = makerCodes;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.selectedPicklistDetails[index].makerCodes = [];
          this.message.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load maker codes for the selected item.'
          });
          this.cdr.detectChanges();
        }
      });
  }

  getOrders() {
    this.userService.getQuestionPaper(`uspGetSalesOrderDrp|districtID=${sessionStorage.getItem('District')}`)
      .subscribe({
        next: (res: any) => {
          this.salesOrders = res?.['table'] || [];
          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => {
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
    
    this.userService.getQuestionPaper(`uspGetPicklist|${query}`).subscribe({
      next: (res: any) => {
        try {
          this.data = res?.table1 || [];
          this.data = this.data.map(item => {    
            let picklistDetails: any[] = [];
            if (item.pickListDetails) {
              try {
                picklistDetails = JSON.parse(item.pickListDetails);   
                picklistDetails = picklistDetails.map((detail: any) => { 
                  return {
                    id: detail.id || 0,
                    pickListHeaderId: detail.pickListHeaderId,
                    binLocationId: detail.binLocationId,
                    binLocation: detail.binlocation || detail.binLocation || '',
                    itemId: detail.itemId,
                    itemCodeId: detail.itemId, 
                    item: detail.item || '',
                    ItemCode: detail.ItemCode || '',
                    makerCodeId: detail.itemCodeId, 
                    makerCode: detail.makercode || '',
                    make: detail.make || '',
                    unitId: detail.unitId,
                    unit: detail.uom || '',
                    requiredQty: detail.requiredQty || 0,
                    quantity: detail.Quantity || detail.quantity || 0,
                    remarks: detail.tolrence || detail.remarks || '',
                    warehouseId: detail.warehouseId,
                    warehouse: detail.warehouse || ''
                  };
                });
              } catch (parseError) {
                picklistDetails = [];
              }
            }
            
            return {
              ...item,
              id: item.id,
              text: item.pickListNo || '',
              soNumber: item.soNo || '',
              soHeaderId: item.soHeaderId,
              warehouse: item.warehouse || '',
              warehouseId: item.warehouseId,
              remarks: item.remarks || '',
              createdDate: item.picklistDate ? this.formatDate(item.picklistDate) : '',
              status: 'Active',
              picklistDetails: picklistDetails 
            };
          });
          
          this.totalCount = res?.table?.[0]?.totalCnt || 0;

        } catch (innerErr) {
          console.error('Error processing picklist data:', innerErr);
          this.data = [];
          this.totalCount = 0;
          this.message.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: 'Failed to process picklist data.' 
          });
        } finally {
          setTimeout(() => {
            this.isLoading = false;
            this.cdr.detectChanges();
          }, 1000);
        }
      },
      error: (err) => {
        this.message.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'Failed to load picklists.' 
        });
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private formatDate(dateString: string): string {
    try {
      const [day, month, year] = dateString.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return date.toLocaleDateString();
    } catch (e) {
      return dateString; 
    }
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
      this.header = 'Add Picklist';
      this.headerIcon = 'pi pi-plus';
      this.picklistForm.reset({ id: 0 });
      this.selectedPicklistDetails = [];
      this.isFormLoading = false;
      this.cdr.detectChanges();
    } else {
      this.visible = true;
      this.postType = view;
      this.header = view === 'update' ? 'Update Picklist' : 'View Picklist';
      this.headerIcon = view === 'update' ? 'pi pi-pencil' : 'pi pi-eye';
      this.selectedIndex = data;

      if (view === 'view') {
        this.picklistForm.disable();
      } else {
        this.picklistForm.enable();
      }

      const patchData = {
        id: data.id || 0,
        soHeaderId: data.soHeaderId || null,
        warehouseId: data.warehouseId || null,
        remarks: data.remarks || ''
      };
      this.picklistForm.patchValue(patchData);
      if (patchData.warehouseId) {
        this.binlocationdrp();
      }

      setTimeout(() => {
        this.initializePicklistDetails(data);
      }, 500);
    }
    document.body.style.overflow = 'hidden';
  }

  private initializePicklistDetails(data: any): void {
    try {
      
      if (data.picklistDetails && data.picklistDetails.length > 0) {
        this.selectedPicklistDetails = data.picklistDetails.map((detail: any) => {
          const picklistDetail = {
            id: detail.id || 0,
            binLocationId: detail.binLocationId,
            binLocation: detail.binLocation || detail.binlocation,
            itemCodeId: detail.itemId, 
            item: detail.item,
            makerCodeId: detail.makerCodeId, 
            makerCode: detail.makerCode || detail.make || '',
            unitId: detail.unitId,
            unit: detail.unit || detail.uom,
            requiredQty: detail.requiredQty,
            quantity: detail.quantity || detail.Quantity,
            remarks: detail.remarks || detail.tolrence || '',
            makerCodes: [] 
          };
  
          if (detail.itemId) {
            this.loadMakerCodesForExistingItem(detail.itemId, picklistDetail);
          } else {
            this.cdr.detectChanges();
          }
          
          return picklistDetail;
        });
      } else {
        this.selectedPicklistDetails = [];
      }
    } catch (parseError) {
      this.selectedPicklistDetails = [];
    }
  }

  private loadMakerCodesForExistingItem(itemId: number, picklistDetail: any): void {
    const currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
    const roleId = currentRole?.roleId || '';
    const userId = sessionStorage.getItem('userId') || '';
    const savedMakerCodeId = picklistDetail.makerCodeId;
    
    this.userService.getQuestionPaper(`uspGetMatReqMasters|action=MAKERCODE|itemId=${itemId}|appUserId=${userId}|appUserRole=${roleId}`)
      .subscribe({
        next: (res: any) => {
          const makerCodes = res?.['table'] || [];
          picklistDetail.makerCodes = makerCodes;
          if (savedMakerCodeId && makerCodes.length > 0) {
            const exists = makerCodes.find((code: any) => code.drpvalue == savedMakerCodeId);
            if (!exists) {
              picklistDetail.makerCodeId = null;
            }
          }
          
          this.isFormLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          picklistDetail.makerCodes = [];
          picklistDetail.makerCodeId = null;
          this.isFormLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  onSubmit(event: any) {
    if (!this.picklistForm.valid) {
      this.picklistForm.markAllAsTouched();
      this.scrollToFirstInvalidControl();
      this.cdr.detectChanges();
      return;
    }
    
    if (this.selectedPicklistDetails.length === 0) {
      this.message.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Add item details'
      });
      return;
    }

    let invalidRow = this.selectedPicklistDetails.find(detail =>
      !detail.binLocationId ||
      !detail.itemCodeId ||
      !detail.unitId ||
      !detail.requiredQty ||
      detail.requiredQty <= 0 ||
      detail.quantity < 0
    );

    if (invalidRow) {
      this.message.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please fill all required fields in picklist details.'
      });
      return;
    }
    
    const formData = this.picklistForm.getRawValue();
    
    const picklistDetailJSON = this.selectedPicklistDetails.map(detail => {
      
      return {
        id: detail.id || 0,
        binLocationId: detail.binLocationId,
        itemCodeId: detail.makerCodeId, 
        unitId: detail.unitId,
        requiredQty: detail.requiredQty,
        quantity: detail.quantity,
        remarks: detail.remarks
      };
    });

    const roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId || '';
    const userId = sessionStorage.getItem('userId') || '';
    
    if (this.postType === 'add') {
      this.paramvaluedata = `soHeaderId=${formData.soHeaderId}|warehouseId=${formData.warehouseId}|remarks=${formData.remarks}|picklistDetailJson=${JSON.stringify(picklistDetailJSON)}|appUserId=${userId}|appUserRole=${roleID}`;
    } else {
      this.paramvaluedata = `id=${formData.id}|soHeaderId=${formData.soHeaderId}|warehouseId=${formData.warehouseId}|remarks=${formData.remarks}|picklistDetailJson=${JSON.stringify(picklistDetailJSON)}|appUserId=${userId}|appUserRole=${roleID}`;
    }
    this.openConfirmation('Confirm?', "Are you sure you want to proceed?", '1', '1', event);
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
    const controls = this.picklistForm.controls;
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
    const SP = this.postType === 'update' ? 'uspPostUpdatePicklist' : 'uspPostPicklist';
    this.userService.SubmitPostTypeData(SP, this.paramvaluedata, 'header').subscribe({
      next: (datacom: any) => {
        this.isFormLoading = false;
        if (!datacom) return;
        const resultarray = datacom.split("-");
        if (resultarray[1] === "success") {
          this.getTableData(false);
          this.message.add({
            severity: 'success',
            summary: 'Success',
            detail: this.postType === 'update'
              ? 'Picklist Updated Successfully.'
              : 'Picklist Created Successfully.',
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

        this.cdr.detectChanges();
      },
      error: (err) => {
        this.message.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to save picklist data.',
        });
        this.isFormLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  deleteData() {
    const roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId || '';
    let query = `action=DELETE|id=${this.selectedIndex.id || 0}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${roleID}`;
    this.userService.SubmitPostTypeData(`uspDeletePicklist`, query, 'header').subscribe({
      next: (datacom: any) => {
        this.isFormLoading = false;
        if (!datacom) return;
        if (datacom.result === 1) {
          this.getTableData(true);
          this.message.add({ severity: 'success', summary: 'Success', detail: 'Picklist deleted successfully' });
          this.onDrawerHide();
        } else {
          this.message.add({ severity: 'warn', summary: 'Warn', detail: datacom.msg || 'Delete failed', });
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Delete error:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete picklist.' });
        this.isFormLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onDrawerHide() {
    document.body.style.overflow = 'visible';
    this.picklistForm.enable();
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
    const control = this.picklistForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onClear() {
    this.picklistForm.reset({
      id: 0
    });
    this.selectedPicklistDetails = [];
    this.cdr.detectChanges();
  }

  addPicklistDetail() {
    this.selectedPicklistDetails.push({ 
      binLocationId: null, 
      itemCodeId: null, 
      makerCodeId: null, 
      makerCodes: [],
      unitId: null, 
      requiredQty: null, 
      quantity: null, 
      remarks: '' 
    });
  }

  removePicklistDetail(index: number) {
    this.selectedPicklistDetails.splice(index, 1);
  }

  viewPicklistDetails(item: any) {
    this.selectedItemDetails = {
      text: item.text || item.pickListNo,
      soNumber: item.soNumber || item.soNo,
      warehouse: item.warehouse,
      remarks: item.remarks,
      createdDate: item.createdDate || item.picklistDate,
      status: item.status || 'Active',
      picklistDetails: item.picklistDetails || []
    };
    
    this.jsonSectionType = 'picklist';
    this.jsonDetailsVisible = true;
    this.cdr.detectChanges();
  }

  closeJsonDetails() {
    this.jsonDetailsVisible = false;
    this.selectedItemDetails = null;
    this.jsonSectionType = null;
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }
}