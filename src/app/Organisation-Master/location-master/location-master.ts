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
import { OnlyDecimalDirective } from '../../shared/directive/number-decimal.directive';

import { BreadcrumbModule } from 'primeng/breadcrumb';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-location-master',
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
    OnlyDecimalDirective
  ],
  providers: [
    ConfirmationService,
    MessageService
  ],
  templateUrl: './location-master.html',
  styleUrl: './location-master.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LocationMaster {
  isLoading = true;
  visible: boolean = false;
  postType: string = '';
  header: any = '';
  selectedIndex: any = [];
  headerIcon: string = 'pi pi-plus';
  paramvaluedata: string = '';
  isFormLoading: boolean = false;
  data: any[] = [];
  locationForm: FormGroup; // Changed from warehouseForm to locationForm
  districts: any[] = [];
  branches: any[] = [];
  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true,  isCustom: true },
    { key: 'officeLocation', header: 'Office Location', isVisible: true,  },
    { key: 'branchName', header: 'Branch', isVisible: true,  },
    { key: 'districtName', header: 'District', isVisible: true,  },
    { key: 'pincode', header: 'PIN Code', isVisible: true,  },
    { key: 'Address', header: 'Address', isVisible: true,},
    { key: 'latitude', header: 'Latitude', isVisible: true,  },
    { key: 'longitude', header: 'Longitude', isVisible: true,  }
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
    this.locationForm = this.fb.group({
      id: [0], // numeric(18) - will be 0 for add, actual ID for update
      officeLocation: [null, Validators.required], // numeric(18)
      branchId: [null, Validators.required], // numeric(18)
      latitude: [null, [Validators.required, Validators.pattern(/^-?\d{1,12}(\.\d{1,6})?$/)]], // numeric(18,6)
      longitude: [null, [Validators.required, Validators.pattern(/^-?\d{1,12}(\.\d{1,6})?$/)]], // numeric(18,6)
      districtId: [null, Validators.required], // int
      pincode: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]], // varchar(10)
      Address: ['', Validators.required] // varchar(500)
    });
  }

  get f() { return this.locationForm.controls }

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

    // Load branches
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
  
  this.userService.getQuestionPaper(`uspGetOfficeLocationDetails|${query}`).subscribe({
    next: (res: any) => {
      try {
        this.data = res?.table1 || [];
        this.data = this.data.map(item => ({
          ...item,
          districtName: item.district || item.districtName || '',
          branchName: item.branchName,  
          pincode: item.districtId || '',
          Address: item.address || ''
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
      this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to load office locations.' });
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
      this.header = 'Add Office Location';
      this.headerIcon = 'pi pi-plus';
      this.locationForm.reset({
        id: 0 // Set ID to 0 for new records
      });
      this.isFormLoading = false;
      this.cdr.detectChanges();
    } else {
      this.visible = true;
      this.postType = view;
      this.header = view === 'update' ? 'Update Office Location' : 'View Office Location';
      this.headerIcon = view === 'update' ? 'pi pi-pencil' : 'pi pi-eye';
      this.selectedIndex = data;
     
      if (view === 'view') {
        this.locationForm.disable();
      } else {
        this.locationForm.enable();
      }

      // Patch form with data from get API - using actual ID for update
      const patchData = {
        id: data.id || 0, // This will be the actual ID from get API for updates
        branchId: data.branchId || null,
        officeLocation: data.officeLocation || '',
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        districtId: data.districtId || null,
        pincode: data.pincode || '',
        Address: data.address || ''
      };

      this.locationForm.patchValue(patchData);
      this.isFormLoading = false;
      this.cdr.detectChanges();
    }
    document.body.style.overflow = 'hidden';
  }

  onSubmit(event: any) {
    if (!this.locationForm.valid) {
      this.locationForm.markAllAsTouched();
      this.cdr.detectChanges();
      return;
    }
    
    const rawValues = this.locationForm.getRawValue();
    
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
    let SP = 'uspPostOfficeLocation'; 
    query = `${this.paramvaluedata}|appUserId=${sessionStorage.getItem('userId')}|appRoleId=${roleID}`;
   
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
            detail: this.postType === 'update' ? 'Office Location Updated Successfully.' : 'Office Location Saved Successfully.',
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
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to save office location data.' });
        this.isFormLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  deleteData() {
    const roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId || 0;
    let query = `action=DELETE|id=${this.selectedIndex.id || 0}|appUserId=${sessionStorage.getItem('userId')}|appRoleId=${roleID}`;
    this.userService.SubmitPostTypeData(`uspDeleteOfficeLocation`, query, 'header').subscribe({
      next: (datacom: any) => {
        this.isFormLoading = false;
        if (!datacom) return;
        const resultarray = datacom.split("-");
        if (resultarray[1] === "success") {
          this.getTableData(true);
          this.message.add({ severity: 'success', summary: 'Success', detail: 'Office Location deleted successfully' });
          this.onDrawerHide();
        } else {
          this.message.add({ severity: 'warn', summary: 'Warn', detail: datacom, });
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Delete error:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete office location.' });
        this.isFormLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onDrawerHide() {
    document.body.style.overflow = 'visible';
    this.locationForm.enable();
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
    const control = this.locationForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onClear() {
    this.locationForm.reset({
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