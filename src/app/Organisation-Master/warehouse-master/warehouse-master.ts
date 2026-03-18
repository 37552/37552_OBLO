import { Component, ChangeDetectorRef, AfterViewInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
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

@Component({
  selector: 'app-warehouse-master',
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
    SkeletonModule
  ],
  providers: [
    ConfirmationService,
    MessageService
  ],
  templateUrl: './warehouse-master.html',
  styleUrl: './warehouse-master.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WarehouseMaster {
  isLoading = true;
  visible: boolean = false;
  postType: string = '';
  header: any = '';
  selectedIndex: any = [];
  headerIcon: string = 'pi pi-plus';
  paramvaluedata: string = '';
  isFormLoading: boolean = false;
  data: any[] = [];
  warehouseForm: FormGroup; // Changed from branchForm to warehouseForm
  districts: any[] = []; // Changed from states to districts
  branches: any[] = []; // New field for branches
  orgMasters: any[] = []; // New field for organization masters
  inchargeUsers: any[] = []; // New field for incharge users
  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isCustom: true },
    { key: 'warehouseName', header: 'Warehouse Name', isVisible: true,  },
    { key: 'address1', header: 'Address 1', isVisible: true },
    { key: 'address2', header: 'Address 2', isVisible: true },
    { key: 'districtName', header: 'District', isVisible: true },
    { key: 'branchName', header: 'Branch', isVisible: true },
    { key: 'pincode', header: 'PIN Code', isVisible: true },
    { key: 'phone', header: 'Phone', isVisible: true },
    { key: 'inchargeName', header: 'Incharge', isVisible: true }
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
    this.warehouseForm = this.fb.group({
      id: [0], // numeric(18) - will be 0 for add, actual ID for update
      districtId: [null, Validators.required],   // int
      branchId: [null, Validators.required], // numeric(18)
      orgMasterId: [null, Validators.required], // numeric(18)
      warehouseName: ['', Validators.required], // varchar(100)
      inchargeId: [null, Validators.required], // numeric(18)
      address1: ['', Validators.required], // varchar(500)
      address2: ['',Validators.required], // varchar(500) - optional
      pincode: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]], // varchar(10)
      phone: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(15)]] // varchar(15)
    });
  }

  get f() { return this.warehouseForm.controls }

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
    // Load districts
    this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblDistrictMaster`).subscribe({
      next: (res: any) => {
        this.districts = res['table'] || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading districts:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to load districts.' });
      }
    });

    this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblGSTDetail`).subscribe({
      next: (res: any) => {
        this.branches = res['table'] || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading branches:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to load branches.' });
      }
    });

    // Load organization masters
    this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblOrgMaster`).subscribe({
      next: (res: any) => {
        this.orgMasters = res['table'] || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading organization masters:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to load organization masters.' });
      }
    });

    // Load incharge users
    this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblEmployeeMaster`).subscribe({
      next: (res: any) => {
        this.inchargeUsers = res['table'] || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading incharge users:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to load incharge users.' });
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
    let query = `appUserId=${userId}|appUserRole=${roleId}|districtId=${districtId}|pageIndex=${this.pageNo}|size=${this.pageSize}|searchText=${this.searchText}`;
    
    this.userService.getQuestionPaper(`uspGetWarehouse|${query}`).subscribe({
      next: (res: any) => {
        try {
          this.data = res?.table1 || [];
          this.data = this.data.map(item => ({
            ...item,
            districtName: item.disrtict,
            branchName: item.branchName,
            inchargeName: item.incharge,
            orgMasterName: item.orgMasterName,
            warehouseName: item.warehouseId,        
          }));
         
          this.totalCount = res?.table?.[0]?.totalCnt || this.data.length;
        } catch (innerErr) {
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
        console.error('Error loading table data:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to load warehouses.' });
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

  onSearchChangeImmediate(search: string) {
    this.searchText = search;
    this.pageNo = 1;
    this.getTableData(false);
  }

  showDialog(view: string, data: any) {
    this.isFormLoading = true;
    this.cdr.detectChanges();
   
    if (view == 'add') {
      this.visible = true;
      this.postType = view;
      this.header = 'Add Warehouse';
      this.headerIcon = 'pi pi-plus';
      this.warehouseForm.reset({
        id: 0 // Set ID to 0 for new records
      });
      this.isFormLoading = false;
      this.cdr.detectChanges();
    } else {
      this.visible = true;
      this.postType = view;
      this.header = view === 'update' ? 'Update Warehouse' : 'View Warehouse';
      this.headerIcon = view === 'update' ? 'pi pi-pencil' : 'pi pi-eye';
      this.selectedIndex = data;
     
      if (view === 'view') {
        this.warehouseForm.disable();
      } else {
        this.warehouseForm.enable();
      }

      // Patch form with data from get API - using actual ID for update
      const patchData = {
        id: data.id || 0, // This will be the actual ID from get API for updates
        districtId: data.districtId || null,
        branchId: data.branchId || null,
        orgMasterId: data.orgMasterId || null,
        warehouseName: data.warehouseName || '',
        inchargeId: data.inchargeId || null,
        address1: data.address1 || '',
        address2: data.address2 || '',
        pincode: data.pincode || '',
        phone: data.phone || ''
      };

      this.warehouseForm.patchValue(patchData);
      this.isFormLoading = false;
      this.cdr.detectChanges();
    }
    document.body.style.overflow = 'hidden';
  }

  onSubmit(event: any) {
    if (!this.warehouseForm.valid) {
      this.warehouseForm.markAllAsTouched();
      this.cdr.detectChanges();
      return;
    }
    
    const rawValues = this.warehouseForm.getRawValue();
    
    // Handle null/undefined values
    Object.keys(rawValues).forEach(key => {
      if (rawValues[key] === null || rawValues[key] === undefined) {
        rawValues[key] = '';
      }
    });

    // For add operation, ensure ID is 0
    if (this.postType === 'add') {
      rawValues.id = 0;
    }
   
    this.paramvaluedata = Object.entries(rawValues)
      .map(([key, value]) => `${key}=${value}`)
      .join('|');
    this.openConfirmation('Confirm?', "Are you sure you want to proceed?", '1', '1', event);
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
    const roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId || 0;
    let query = '';
    let SP = 'uspPostWarehouse'; // Changed stored procedure
    query = `${this.paramvaluedata}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${roleID}`;
   
    this.userService.SubmitPostTypeData(SP, query, 'header').subscribe({
      next: (datacom: any) => {
        this.isFormLoading = false;
        if (!datacom) return;
        const resultarray = datacom.split("-");
        if (resultarray[1] === "success") {
          this.getTableData(false);
          this.message.add({
            severity: 'success',
            summary: 'Success',
            detail: this.postType === 'update' ? 'Warehouse Updated Successfully.' : 'Warehouse Saved Successfully.',
          });
          this.onDrawerHide();
        } else if (resultarray[0] == "2") {
          this.message.add({ severity: 'warn', summary: 'Warn', detail: resultarray[1] || datacom });
        } else {
          this.message.add({ severity: 'warn', summary: 'Warn', detail: datacom, });
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Submit error:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to save warehouse data.' });
        this.isFormLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  deleteData() {
    const roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId || 0;
    let query = `action=DELETE|id=${this.selectedIndex.id || 0}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${roleID}`;
    this.userService.SubmitPostTypeData(`uspDeleteWarehouse`, query, 'header').subscribe({
      next: (datacom: any) => {
        this.isFormLoading = false;
        if (!datacom) return;
        const resultarray = datacom.split("-");
        if (resultarray[1] === "success") {
          this.getTableData(true);
          this.message.add({ severity: 'success', summary: 'Success', detail: 'Warehouse deleted successfully' });
          this.onDrawerHide();
        } else {
          this.message.add({ severity: 'warn', summary: 'Warn', detail: datacom, });
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Delete error:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete warehouse.' });
        this.isFormLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onDrawerHide() {
    document.body.style.overflow = 'visible';
    this.warehouseForm.enable();
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
    const control = this.warehouseForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onClear() {
    this.warehouseForm.reset({
      id: 0
    });
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }
}