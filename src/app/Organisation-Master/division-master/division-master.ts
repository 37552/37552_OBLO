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
import { MultiSelect } from 'primeng/multiselect';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { DrawerModule } from 'primeng/drawer';
import { UserService } from '../../shared/user-service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Toast } from 'primeng/toast';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-division-master',
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
    MultiSelect,
    InputTextModule,
    ConfirmDialog,
    ProgressSpinner,
    Toast,
    Tooltip,
    BreadcrumbModule,
    SkeletonModule
  ],
  providers: [
    ConfirmationService,
    MessageService
  ],
  templateUrl: './division-master.html',
  styleUrl: './division-master.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DivisionMaster {
  isLoading = true;
  visible: boolean = false;
  postType: string = '';
  header: any = '';
  selectedIndex: any = [];
  headerIcon: string = 'pi pi-plus';
  paramvaluedata: string = '';
  isFormLoading: boolean = false;
  data: any[] = [];
  divisionForm: FormGroup;
  departmentOrganizations: any[] = [];
  
  columns: TableColumn[] = [
    { key: 'divisionName', header: 'Division Name', isVisible: true, isSortable: true },
    { key: 'departmentNames', header: 'Departments', isVisible: true, isSortable: false },
    { key: 'departmentCount', header: 'No. of Departments', isVisible: true, isSortable: false }
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
    this.divisionForm = this.fb.group({
      divisionName: ['', Validators.required],
      deptOrgIds: [[], Validators.required]
    });
  }

  get f() { return this.divisionForm.controls }

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
    this.loadDepartmentOrganizations();
    this.getTableData(true);
    this.cdr.detectChanges();
  }

  loadDepartmentOrganizations() {
    this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tbldepartmentMaster`).subscribe({
      next: (res: any) => {
        const rawDeptOrgs = res['table'] || [];
        this.departmentOrganizations = rawDeptOrgs.map((item: any) => ({
          id: item.drpValue,
          name: item.drpOption
        }));
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading department organizations:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to load department organizations.' });
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
    
    this.userService.getQuestionPaper(`uspGetDivisionMaster|${query}`).subscribe({
      next: (res: any) => {
        try {
          this.data = res?.table1 || [];
          this.data = this.data.map(item => {
            let departmentNames = 'No departments';
            let departmentCount = 0;
            let departmentIds: number[] = [];

            if (item.departmentJson) {
              try {
                const departments = JSON.parse(item.departmentJson);
                if (Array.isArray(departments) && departments.length > 0) {
                  departmentNames = departments.map((dept: any) => dept.deptName).join(', ');
                  departmentCount = departments.length;
                  departmentIds = departments.map((dept: any) => dept.deptId);
                }
              } catch (e) {
                console.error('Error parsing departmentJson:', e);
                departmentNames = 'Error parsing departments';
              }
            }

            return {
              ...item,
              divisionName: item.division,
              departmentNames: departmentNames,
              departmentCount: departmentCount,
              departmentIds: departmentIds,
              id: item.id
            };
          });
         
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
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to load divisions.' });
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

  showDialog(view: string, data: any) {
    this.isFormLoading = true;
    this.cdr.detectChanges();
   
    if (view == 'add') {
      this.visible = true;
      this.postType = view;
      this.header = 'Add Division';
      this.headerIcon = 'pi pi-plus';
      this.divisionForm.reset({
      });
      this.isFormLoading = false;
      this.cdr.detectChanges();
    } else {
      this.visible = true;
      this.postType = view;
      this.header = view === 'update' ? 'Update Division' : 'View Division';
      this.headerIcon = view === 'update' ? 'pi pi-pencil' : 'pi pi-eye';
      this.selectedIndex = data;
     
      if (view === 'view') {
        this.divisionForm.disable();
      } else {
        this.divisionForm.enable();
      }

      // Patch form with data from API response
      const patchData = {
        divisionName: data.divisionName || data.division || '',
        deptOrgIds: data.departmentIds || []
      };

      this.divisionForm.patchValue(patchData);
      this.isFormLoading = false;
      this.cdr.detectChanges();
    }
    document.body.style.overflow = 'hidden';
  }

  onSubmit(event: any) {
    if (!this.divisionForm.valid) {
      this.divisionForm.markAllAsTouched();
      this.cdr.detectChanges();
      return;
    }
    
    const formValues = this.divisionForm.value;
    
    // Prepare deptOrgIdJson in the required format
    const deptOrgIdJson = formValues.deptOrgIds.map((deptOrgId: number) => ({
      deptOrgId: deptOrgId
    }));
    
    // Include ID for update operations
    const idParam = this.postType === 'update' ? `id=${formValues.id}|` : '';
    
    this.paramvaluedata = `${idParam}divisionName=${formValues.divisionName}|deptOrgIdJson=${JSON.stringify(deptOrgIdJson)}`;
    
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
        }
      },
      reject: () => {}
    });
  }

  submitcall() {
    this.isFormLoading = true;
    this.cdr.detectChanges();
    
    const roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId || 0;
    const userId = sessionStorage.getItem('userId') || '';
    
    let query = `${this.paramvaluedata}|appUserId=${userId}|appUserRole=${roleID}`;
    let SP = 'uspPostDivisionMaster';
   
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
            detail: this.postType === 'update' ? 'Division Updated Successfully.' : 'Division Saved Successfully.',
          });
          this.onDrawerHide();
        } else if (resultarray[0] == "2") {
          this.message.add({ severity: 'warn', summary: 'Warn', detail: resultarray[1] || datacom });
        } else {
          this.message.add({ severity: 'warn', summary: 'Warn', detail: datacom });
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Submit error:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to save division data.' });
        this.isFormLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onDrawerHide() {
    document.body.style.overflow = 'visible';
    this.divisionForm.enable();
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
    const control = this.divisionForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onClear() {
    this.divisionForm.reset({
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