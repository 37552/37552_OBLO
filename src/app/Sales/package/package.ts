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
  selector: 'app-package',
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
  templateUrl: './package.html',
  styleUrl: './package.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Package {
  isLoading = true;
  visible: boolean = false;
  postType: string = '';
  header: any = '';
  selectedIndex: any = [];
  headerIcon: string = 'pi pi-plus';
  paramvaluedata: string = '';
  isFormLoading: boolean = false;
  data: any[] = [];
  packageForm: FormGroup;
  
  // JSON Details Drawer
  jsonDetailsVisible: boolean = false;
  selectedItemDetails: any = null;
  jsonSectionType: 'package' | null = null;
  
  // Dropdown arrays
  salesOrders: any[] = [];
  warehouses: any[] = [];
  picklists: any[] = [];
  items: any[] = [];
  units: any[] = [];
  
  selectedPackageDetails: any[] = [];
  
  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true },
    { key: 'text', header: 'Package No', isVisible: true },
    { key: 'soNo', header: 'Sales Order No', isVisible: true },
    { key: 'warehouse', header: 'Warehouse', isVisible: true },
    { key: 'pickList', header: 'Picklist No', isVisible: true },
    { key: 'packageWeight', header: 'Total Weight', isVisible: true },
    { key: 'packageVolume', header: 'Total Volume', isVisible: true },
    { key: 'remarks', header: 'Remarks', isVisible: true },
    { key: 'jsonDetails', header: 'Package Details', isVisible: true, isSortable: false, isCustom: true }
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
    this.packageForm = this.fb.group({
      id: [0],
      soHeaderId: [null, Validators.required],
      warehouseId: [null, Validators.required],
      picklistId: [null, Validators.required],
      remarks: ['']
    });
  }

  get f() { return this.packageForm.controls }

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
    
    // Load items with material master
    this.loadItems();
    this.loadPicklistsBySalesOrder();
  }

  loadItems() {
    this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblmaterialmaster`).subscribe({
      next: (res: any) => {
        this.items = res['table'] || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading items:', err);
        this.items = [];
      }
    });
  }

  loadPicklistsBySalesOrder(soHeaderId?: number) {
    let query = `table=tblPickListHeader`;
    if (soHeaderId) {
      query += `|filterValue=${soHeaderId}|filterColumn=soHeaderId`;
    }

    this.userService.getQuestionPaper(`uspGetFillDrpDown|${query}`)
      .subscribe({
        next: (res: any) => {
          try {
            this.picklists = res?.table || [];
            this.cdr.detectChanges();
          } catch (err) {
            console.error('Error loading picklists:', err);
            this.picklists = [];
          }
        },
        error: (err) => {
          console.error('Error loading picklists:', err);
          this.picklists = [];
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

  onChangeDoc(event: any): void {
    const docNoId = event.value;

    if (!docNoId) {
      this.packageForm.patchValue({
        warehouseId: null,
        picklistId: null
      });
      this.packageForm.get('warehouseId')?.enable();
      this.picklists = [];
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
            this.loadPicklistsBySalesOrder(docNoId);
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

  onItemChange(event: any, index: number) {
    const itemId = event.value;
    const detail = this.selectedPackageDetails[index];
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
          this.selectedPackageDetails[index].makerCodes = makerCodes;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.selectedPackageDetails[index].makerCodes = [];
          this.message.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load maker codes for the selected item.'
          });
          this.cdr.detectChanges();
        }
      });
  }

  private patchFormData(data: any): void {
    this.packageForm.patchValue({
      warehouseId: data.warehouseId || null
    });

    if (data.warehouseId) {
      this.packageForm.get('warehouseId')?.disable();
    } else {
      this.packageForm.get('warehouseId')?.enable();
    }
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
    
    this.userService.getQuestionPaper(`uspGetSalesOrderPackage|${query}`).subscribe({
      next: (res: any) => {
        try {
          this.data = res?.table1 || [];
          
          this.data = this.data.map(item => {
            let packageDetails: any[] = [];
            
            if (item.packageDetail) {
              try {
                packageDetails = JSON.parse(item.packageDetail);
                packageDetails = packageDetails.map((detail: any) => {
                  return {
                    id: detail.id || 0,
                    packageHeaderId: detail.packageHeaderId,
                    boxNo: detail.boxNo || '',
                    itemId: detail.itemId || detail.itemCodeId, 
                    itemCodeId: detail.itemId, 
                    item: detail.item || '',
                    makerCodeId: detail.itemCodeId, 
                    makerCode: detail.makerCode || detail.make || '',
                    unitId: detail.unitId,
                    unit: detail.unit || '',
                    quantity: detail.Quantity || detail.quantity || 0,
                    boxWeight: detail.boxWeight || 0,
                    boxVolume: detail.boxVolume || 0,
                    remarks: detail.tolrence || detail.remarks || ''
                  };
                });
              } catch (parseError) {
                console.error('Error parsing packageDetail:', parseError);
                packageDetails = [];
              }
            }
            
            const totalWeight = packageDetails.reduce((sum, detail) => sum + (detail.boxWeight || 0), 0);
            const totalVolume = packageDetails.reduce((sum, detail) => sum + (detail.boxVolume || 0), 0);
            const totalQuantity = packageDetails.reduce((sum, detail) => sum + (detail.quantity || 0), 0);
            
            return {
              ...item,
              id: item.id,
              text: item.text || '',
              soNumber: item.soNo || '',
              soHeaderId: item.soHeaderId,
              warehouse: item.warehouse || '',
              warehouseId: item.warehouseId,
              picklistNo: item.pickList || '',
              picklistId: item.picklistId,
              packageWeight: totalWeight,
              packageVolume: totalVolume,
              remarks: item.remarks || '',
              packageDetails: packageDetails,
              totalQuantity: totalQuantity
            };
          });
          
          this.totalCount = res?.table?.[0]?.totalCnt || 
                           res?.table?.[0]?.totalCount || 
                           this.data.length;

        } catch (innerErr) {
          console.error('Error processing package data:', innerErr);
          this.data = [];
          this.totalCount = 0;
          this.message.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: 'Failed to process package data.' 
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
          detail: 'Failed to load packages.' 
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
      this.header = 'Add Package';
      this.headerIcon = 'pi pi-plus';
      this.packageForm.reset({ id: 0 });
      this.packageForm.get('warehouseId')?.enable();
      this.selectedPackageDetails = [];
      this.picklists = [];
      this.isFormLoading = false;
      this.cdr.detectChanges();
    } else {
      this.visible = true;
      this.postType = view;
      this.header = view === 'update' ? 'Update Package' : 'View Package';
      this.headerIcon = view === 'update' ? 'pi pi-pencil' : 'pi pi-eye';
      this.selectedIndex = data;

      if (view === 'view') {
        this.packageForm.disable();
      } else {
        this.packageForm.enable();
      }

      const patchData = {
        id: data.id || 0,
        soHeaderId: data.soHeaderId || null,
        warehouseId: data.warehouseId || null,
        picklistId: data.picklistId || null,
        remarks: data.remarks || ''
      };

      this.packageForm.patchValue(patchData);
      
      if (data.soHeaderId) {
        this.loadPicklistsBySalesOrder(data.soHeaderId);
      }
      
      if (data.warehouseId) {
        this.packageForm.get('warehouseId')?.disable();
      }

      this.initializePackageDetails(data);
    }
    document.body.style.overflow = 'hidden';
  }

  private initializePackageDetails(data: any): void {
    try {
      const details = data.packageDetails || (data.packageDetail ? JSON.parse(data.packageDetail) : []);
      
      if (details && details.length > 0) {
        this.selectedPackageDetails = details.map((detail: any) => {
          const packageDetail = {
            id: detail.id || 0,
            boxNo: detail.boxNo || '',
            itemCodeId: detail.itemId, 
            item: detail.item,
            makerCodeId: detail.makerCodeId, 
            makerCode: detail.makerCode || detail.make || '',
            unitId: detail.unitId,
            unit: detail.unit || '',
            quantity: detail.Quantity || detail.quantity || 0,
            boxWeight: detail.boxWeight || 0,
            boxVolume: detail.boxVolume || 0,
            remarks: detail.tolrence || detail.remarks || '',
            makerCodes: []
          };

          if (detail.itemId) {
            this.loadMakerCodesForExistingItem(detail.itemId, packageDetail);
          } else {
            this.cdr.detectChanges();
          }
          
          return packageDetail;
        });
      } else {
        this.selectedPackageDetails = [];
      }
    } catch (parseError) {
      console.error('Error parsing package details:', parseError);
      this.selectedPackageDetails = [];
    }
  }

  private loadMakerCodesForExistingItem(itemId: number, packageDetail: any): void {
    const currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
    const roleId = currentRole?.roleId || '';
    const userId = sessionStorage.getItem('userId') || '';
    const savedMakerCodeId = packageDetail.makerCodeId;
    
    this.userService.getQuestionPaper(`uspGetMatReqMasters|action=MAKERCODE|itemId=${itemId}|appUserId=${userId}|appUserRole=${roleId}`)
      .subscribe({
        next: (res: any) => {
          const makerCodes = res?.['table'] || [];
          packageDetail.makerCodes = makerCodes;
          if (savedMakerCodeId && makerCodes.length > 0) {
            const exists = makerCodes.find((code: any) => code.drpvalue == savedMakerCodeId);
            if (!exists) {
              packageDetail.makerCodeId = null;
            }
          }
          
          this.isFormLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          packageDetail.makerCodes = [];
          packageDetail.makerCodeId = null;
          this.isFormLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  onSubmit(event: any) {
    if (!this.packageForm.valid) {
      this.packageForm.markAllAsTouched();
      this.scrollToFirstInvalidControl();
      this.cdr.detectChanges();
      return;
    }
    
    if (this.selectedPackageDetails.length === 0) {
      this.message.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Add package details'
      });
      return;
    }

    let invalidRow = this.selectedPackageDetails.find(detail =>
      !detail.boxNo ||
      !detail.itemId || // Check itemId instead of itemCodeId for item dropdown
      !detail.makerCodeId || // Check makerCodeId for maker code dropdown
      !detail.unitId ||
      !detail.boxWeight ||
      detail.boxWeight <= 0 ||
      !detail.boxVolume ||
      detail.boxVolume <= 0 ||
      !detail.quantity ||
      detail.quantity <= 0
    );

    // if (invalidRow) {
    //   this.message.add({
    //     severity: 'warn',
    //     summary: 'Warning',
    //     detail: 'Please fill all required fields in package details.'
    //   });
    //   return;
    // }
    
    const formData = this.packageForm.getRawValue();

    const packageDetailJSON = this.selectedPackageDetails.map(detail => ({
      id: detail.id || 0,
      boxNo: detail.boxNo,
      itemId: detail.itemId, 
      itemCodeId: detail.makerCodeId, 
      unitId: detail.unitId,
      boxWeight: detail.boxWeight,
      boxVolume: detail.boxVolume,
      quantity: detail.quantity,
      tolrence: detail.remarks
    }));

    const roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId || '';
    const userId = sessionStorage.getItem('userId') || '';
    
    if (this.postType === 'add') {
      this.paramvaluedata = `soHeaderId=${formData.soHeaderId}|warehouseId=${formData.warehouseId}|picklistId=${formData.picklistId}|remarks=${formData.remarks}|packageDetailJson=${JSON.stringify(packageDetailJSON)}|appUserId=${userId}|appUserRole=${roleID}`;
    } else {
      this.paramvaluedata = `id=${formData.id}|soHeaderId=${formData.soHeaderId}|warehouseId=${formData.warehouseId}|picklistId=${formData.picklistId}|remarks=${formData.remarks}|packageDetailJson=${JSON.stringify(packageDetailJSON)}|appUserId=${userId}|appUserRole=${roleID}`;
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
    const controls = this.packageForm.controls;
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

    const SP = this.postType === 'update' ? 'uspPostUpdateSOPackage' : 'uspPostSOPackage';

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
                ? 'Package Updated Successfully.'
                : 'Package Created Successfully.',
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
              ? 'Package Updated Successfully.'
              : 'Package Created Successfully.',
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
          detail: 'Failed to save package data.',
        });
        this.isFormLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  deleteData() {
    const roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId || '';
    let query = `action=DELETE|id=${this.selectedIndex.id || 0}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${roleID}`;
    this.userService.SubmitPostTypeData(`uspDeleteSOPackage`, query, 'header').subscribe({
      next: (datacom: any) => {
        this.isFormLoading = false;
        if (!datacom) return;
        if (datacom.result === 1) {
          this.getTableData(true);
          this.message.add({ severity: 'success', summary: 'Success', detail: 'Package deleted successfully' });
          this.onDrawerHide();
        } else {
          this.message.add({ severity: 'warn', summary: 'Warn', detail: datacom.msg || 'Delete failed', });
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Delete error:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete package.' });
        this.isFormLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onDrawerHide() {
    document.body.style.overflow = 'visible';
    this.packageForm.enable();
    this.packageForm.get('warehouseId')?.enable();
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
    const control = this.packageForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onClear() {
    this.packageForm.reset({
      id: 0
    });
    this.packageForm.get('warehouseId')?.enable();
    this.selectedPackageDetails = [];
    this.picklists = [];
    this.cdr.detectChanges();
  }

  addPackageDetail() {
    this.selectedPackageDetails.push({ 
      boxNo: '',
      itemId: null, 
      itemCodeId: null, 
      makerCodeId: null,
      makerCodes: [],
      unitId: null, 
      boxWeight: null, 
      boxVolume: null, 
      quantity: null, 
      remarks: '' 
    });
  }

  removePackageDetail(index: number) {
    this.selectedPackageDetails.splice(index, 1);
  }

  getTotalWeight(): number {
    return this.selectedPackageDetails.reduce((total, detail) => total + (detail.boxWeight || 0), 0);
  }

  getTotalVolume(): number {
    return this.selectedPackageDetails.reduce((total, detail) => total + (detail.boxVolume || 0), 0);
  }

  getTotalQuantity(): number {
    return this.selectedPackageDetails.reduce((total, detail) => total + (detail.quantity || 0), 0);
  }

viewPackageDetails(item: any) {
  let parsedDetails: any[] = [];

  if (item.packageDetail) {
    try {
      parsedDetails = JSON.parse(item.packageDetail);
    } catch (err) {
      console.error('Invalid packageDetail JSON:', err);
      parsedDetails = [];
    }
  } else if (item.packageDetails) {
    parsedDetails = item.packageDetails;
  }

  const normalizedDetails = parsedDetails.map((p: any) => ({
    boxNo: p.boxNo || '',
    item: p.item || p.itemName || '',
    makercode: p.makercode || p.make || '',
    uom: p.uom || p.unit || '',
    quantity: p.Quantity || p.quantity || 0,
    boxWeight: p.boxWeight || 0,
    boxVolume: p.boxVolume || 0,
    remarks: p.remarks || ''
  }));

  this.selectedItemDetails = {
    text: item.text,
    soNumber: item.soNo || item.soNumber,
    warehouse: item.warehouse,
    picklistNo: item.pickList || item.picklistNo,
    packageWeight: item.packageWeight || 0,
    packageVolume: item.packageVolume || 0,
    remarks: item.remarks || '',
    packageDetails: normalizedDetails
  };

  this.jsonSectionType = 'package';
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