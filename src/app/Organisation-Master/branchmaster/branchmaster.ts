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
  selector: 'app-branchmaster',
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
  templateUrl: './branchmaster.html',
  styleUrl: './branchmaster.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Branchmaster {
  isLoading = true;
  visible: boolean = false;
  postType: string = '';
  header: any = '';
  selectedIndex: any = [];
  headerIcon: string = 'pi pi-plus';
  paramvaluedata: string = '';
  isFormLoading: boolean = false;
  data: any[] = [];
  branchForm: FormGroup;
  states: any[] = [];
  cities: any[] = [];
  officeTypes: any[] = [];
  assignedUsers: any[] = [];
  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isCustom: true },
    { key: 'branchName', header: 'Branch Name', isVisible: true, },
    { key: 'address', header: 'Street 1', isVisible: true,  },
    { key: 'cityName', header: 'City', isVisible: true,  },
    { key: 'stateName', header: 'State', isVisible: true,  },
    { key: 'pinCode', header: 'ZIP Code', isVisible: true,},
    { key: 'GST', header: 'GST', isVisible: true,  },
    { key: 'officeTypeName', header: 'Office Type', isVisible: true, },
    
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
    this.branchForm = this.fb.group({
      id: [0],
      branchName: ['', Validators.required],
      stateId: [null, Validators.required],
      cityId: [null, Validators.required],
      address: ['', Validators.required],
      pinCode: ['', [Validators.required, Validators.minLength(6)]],
      GST: [null, Validators.required],
      officeTypeId: [null, Validators.required]
    });
  }

  get f() { return this.branchForm.controls }

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
    if (this.isLoading) {  // Only if still loading
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }, 1000);
  }

  loadDropdowns() {
    this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblStateMaster`).subscribe({
      next: (res: any) => {
        this.states = res['table'] || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading states:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to load states.' });
      }
    });
    this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblDistrictMaster`).subscribe({
      next: (res: any) => {
        this.cities = res['table'] || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading cities:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to load cities.' });
      }
    });
    this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblOfficeTypeMaster`).subscribe({
      next: (res: any) => {
        this.officeTypes = res['table'] || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading office types:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to load office types.' });
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
    this.userService.getQuestionPaper(`uspGetBranch|${query}`).subscribe({
      next: (res: any) => {
        try {
          this.data = res?.table1 || [];
          this.data = this.data.map(item => ({
            ...item,
            cityName: item.districtName,
            stateName: item.stateName,
            GST: item.gst,
            officeTypeName: item.officeType
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
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to load branches.' });
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

onSearchChange(search: string) {
  this.searchText = search;
  this.pageNo = 1;
  
  // Clear any existing timeout
  if (this.searchTimeout) {
    clearTimeout(this.searchTimeout);
  }
  
  // Debounce API call (keeps performance good; hits ~500ms after last keystroke)
  this.searchTimeout = setTimeout(() => {
    this.getTableData(false);
  }, this.debounceTime);
  
  // Optional: Explicitly mark for check (helps OnPush)
  this.cdr.markForCheck();
}

clearSearch() {
  this.searchText = '';
  this.pageNo = 1;
  this.getTableData(false);
  this.cdr.markForCheck();  // Add for OnPush
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
      this.header = 'Add Branch';
      this.headerIcon = 'pi pi-plus';
      this.branchForm.reset({
        id: 0,
        country: 'India'
      });
      this.assignedUsers = [];
      this.isFormLoading = false;
      this.cdr.detectChanges();
    } else {
      this.visible = true;
      this.postType = view;
      this.header = view === 'update' ? 'Update Branch' : 'View Branch';
      this.headerIcon = view === 'update' ? 'pi pi-pencil' : 'pi pi-eye';
      this.selectedIndex = data;
     
      if (view === 'view') {
        this.branchForm.disable();
      } else {
        this.branchForm.enable();
      }
      const patchData = {
        id: data.id || 0,
        branchName: data.branchName || '',
        address: data.address || '',
        street2: data.street2 || '',
        cityId: data.cityId || null,
        stateId: data.stateId || null,
        country: data.country || 'India',
        pinCode: data.pinCode || '',
        GST: data.GST || data.gst || '',
        officeTypeId: data.officeTypeId || null
      };
     this.branchForm.patchValue(patchData);
      this.isFormLoading = false;
      this.cdr.detectChanges();
    }
    document.body.style.overflow = 'hidden';
  }

  removeUser(index: number) {
    this.assignedUsers.splice(index, 1);
    this.cdr.detectChanges();
  }

  onSubmit(event: any) {
    if (!this.branchForm.valid) {
      this.branchForm.markAllAsTouched();
      this.cdr.detectChanges();
      return;
    }
    const rawValues = this.branchForm.getRawValue();
    Object.keys(rawValues).forEach(key => {
      if (rawValues[key] === null || rawValues[key] === undefined) {
        rawValues[key] = '';
      }
    });
   
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
    let SP = 'uspPostOrgBranch';
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
            detail: this.postType === 'update' ? 'Branch Updated Successfully.' : 'Branch Saved Successfully.',
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
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to save branch data.' });
        this.isFormLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  deleteData() {
    const roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId || 0;
    let query = `action=DELETE|id=${this.selectedIndex.id || 0}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${roleID}`;
    this.userService.SubmitPostTypeData(`uspDeleteOrgBranch`, query, 'header').subscribe({
      next: (datacom: any) => {
        this.isFormLoading = false;
        if (!datacom) return;
        const resultarray = datacom.split("-");
        if (resultarray[1] === "success") {
          this.getTableData(true);
          this.message.add({ severity: 'success', summary: 'Success', detail: 'Branch deleted successfully' });
          this.onDrawerHide();
        } else {
          this.message.add({ severity: 'warn', summary: 'Warn', detail: datacom, });
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Delete error:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete branch.' });
        this.isFormLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onDrawerHide() {
    document.body.style.overflow = 'visible';
    this.branchForm.enable();
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
    const control = this.branchForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onClear() {
    this.branchForm.reset({
      id: 0,
      country: 'India'
    });
    this.assignedUsers = [];
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }
}