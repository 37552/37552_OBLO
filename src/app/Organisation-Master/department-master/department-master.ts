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

@Component({
  selector: 'app-department-master',
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
  templateUrl: './department-master.html',
  styleUrl: './department-master.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DepartmentMaster {
  isLoading = true;
  visible: boolean = false;
  detailsDrawerVisible: boolean = false;
  postType: string = '';
  header: any = '';
  selectedIndex: any = [];
  headerIcon: string = 'pi pi-plus';
  paramvaluedata: string = '';
  isFormLoading: boolean = false;
  data: any[] = [];
  departmentCards: any[] = [];
  selectedDepartment: any = null;
  selectedDepartmentDivisions: any[] = [];
  currentDivisionIds: number[] = [];
  availableDivisions: any[] = [];
  isDepartmentMapped: boolean = false;
  divisions: any[] = [];
  departmentForm: FormGroup;
  parsedDivisions: any[] = [];

  // Pagination properties
  pageNo = 1;
  pageSize = 20; // Show 20 cards per page
  searchText = '';
  totalCount = 0;
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  searchTimeout: any;
  debounceTime = 500;
  
  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true },
    { key: 'deptName', header: 'Department Name', isVisible: true, isSortable: true },
    { key: 'deptCode', header: 'Department Code', isVisible: true, isSortable: true }
  ];
  
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
    this.departmentForm = this.fb.group({
      deptName: ['', Validators.required],
      deptCode: ['', Validators.required],
      divisions: [[], Validators.required]
    });
  }

  get f() { return this.departmentForm.controls }

  get filteredDivisions() {
    if (!this.currentDivisionIds?.length) {
      return this.divisions;
    }
    return this.divisions.filter(div => !this.currentDivisionIds.includes(div.id));
  }

  // Calculate total pages
  get totalPages() {
    return Math.ceil(this.totalCount / this.pageSize);
  }

  // Get visible page numbers for pagination
  get visiblePages(): number[] {
    const total = this.totalPages;
    const current = this.pageNo;
    const maxVisible = 5;

    if (total <= maxVisible) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    let start = Math.max(current - Math.floor(maxVisible / 2), 1);
    let end = Math.min(start + maxVisible - 1, total);

    if (end - start + 1 < maxVisible) {
      start = Math.max(end - maxVisible + 1, 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

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
    this.loadDivisions();
    this.getDepartmentCards();
    this.cdr.detectChanges();
  }

  loadDivisions() {
    this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tbldivisionMaster`).subscribe({
      next: (res: any) => {
        const rawDivisions = res['table'] || [];
        this.divisions = rawDivisions.map((div: any) => ({
          id: div.drpValue,
          name: div.drpOption
        }));
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading divisions:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to load divisions.' });
      }
    });
  }

  getDepartmentCards() {
    this.isLoading = true;
    this.cdr.detectChanges();
    
    const currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
    const roleId = currentRole?.roleId || '';
    const userId = sessionStorage.getItem('userId') || '';
    const districtId = sessionStorage.getItem('District') || '';
    
    let query = `searchText=${this.searchText}|pageIndex=${this.pageNo}|size=${this.pageSize}|districtId=${districtId}|appUserId=${userId}|appUserRole=${roleId}`;
    
    console.log('API Query:', query); 
    
    this.userService.getQuestionPaper(`uspGetDepartment|${query}`).subscribe({
      next: (res: any) => {
        try {
          console.log('API Response:', res); 
          
          this.departmentCards = res?.table1 || [];
          this.totalCount = res?.table?.[0]?.totalCnt || this.departmentCards.length;

          console.log('Processed Departments:', this.departmentCards); 
          
        } catch (innerErr) {
          console.error('Error processing response:', innerErr);
          this.departmentCards = [];
          this.totalCount = 0;
        } finally {
          setTimeout(() => {
            this.isLoading = false;
            this.cdr.detectChanges();
          }, 1000);
        }
      },
      error: (err) => {
        console.error('Error loading departments:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to load departments.' });
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Pagination methods
  onPageChange(newPage: number) {
    this.pageNo = newPage;
    this.getDepartmentCards();
  }

  onPageSizeChange(newSize: number) {
    this.pageSize = newSize;
    this.pageNo = 1; // Reset to first page when changing page size
    this.getDepartmentCards();
  }

  onSearchChange(search: string) {
    this.searchText = search;
    this.pageNo = 1; // Reset to first page when searching
    
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    this.searchTimeout = setTimeout(() => {
      this.getDepartmentCards();
    }, this.debounceTime);
  }

  goToFirstPage() {
    if (this.pageNo !== 1) {
      this.pageNo = 1;
      this.getDepartmentCards();
    }
  }

  goToLastPage() {
    if (this.pageNo !== this.totalPages) {
      this.pageNo = this.totalPages;
      this.getDepartmentCards();
    }
  }

  goToPreviousPage() {
    if (this.pageNo > 1) {
      this.pageNo--;
      this.getDepartmentCards();
    }
  }

  goToNextPage() {
    if (this.pageNo < this.totalPages) {
      this.pageNo++;
      this.getDepartmentCards();
    }
  }

  // Add this method to display range info
  getDisplayRange(): string {
    const start = (this.pageNo - 1) * this.pageSize + 1;
    const end = Math.min(this.pageNo * this.pageSize, this.totalCount);
    return `Showing ${start} - ${end} of ${this.totalCount} departments`;
  }

  openDepartmentDetails(dept: any) {
    this.selectedDepartment = dept;
    this.isDepartmentMapped = dept.mapStatus === 1;

    try {
      this.parsedDivisions = dept.division ? JSON.parse(dept.division) : [];
    } catch {
      this.parsedDivisions = [];
    }

    if (dept.mapStatus === 0) {
      this.loadDepartmentDivisions(dept.id);
    }

    this.detailsDrawerVisible = true;
    this.cdr.detectChanges();
  }

  loadDepartmentDivisions(deptId: number) {
    const roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId || 0;
    const userId = sessionStorage.getItem('userId') || '';
    
    let query = `deptId=${deptId}|appUserId=${userId}|appUserRole=${roleID}`;
    
    this.userService.getQuestionPaper(`uspGetDepartmentDivisions|${query}`).subscribe({
      next: (res: any) => {
        const rawDivisions = res?.table || [];
        this.selectedDepartmentDivisions = rawDivisions.map((div: any) => ({
          id: div.divisionId,
          name: div.divisionName || `Division ${div.divisionId}`
        }));
        this.currentDivisionIds = rawDivisions.map((div: any) => div.divisionId);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading department divisions:', err);
        this.selectedDepartmentDivisions = [];
        this.currentDivisionIds = [];
        this.cdr.detectChanges();
      }
    });
  }

  addDivisionMapping() {
    if (this.availableDivisions.length === 0) {
      this.message.add({ 
        severity: 'warn', 
        summary: 'Warning', 
        detail: 'Please select at least one division.' 
      });
      return;
    }

    this.isFormLoading = true;
    this.cdr.detectChanges();

    const roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId || 0;
    const userId = sessionStorage.getItem('userId') || '';

    const divisionJson = this.availableDivisions.map((divId: any) => ({
      divisionId: divId
    }));
    
    let query = `deptId=${this.selectedDepartment.id}|divisionJson=${JSON.stringify(divisionJson)}|appUserId=${userId}|appUserRole=${roleID}`;
    
    this.userService.SubmitPostTypeData('uspPostDepartmentOrgDivMapping', query, 'header').subscribe({
      next: (datacom: any) => {
        this.isFormLoading = false;
        
        if (!datacom) {
          this.message.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: 'Failed to add division mapping.' 
          });
          return;
        }
        
        const resultarray = datacom.split("-");
        if (resultarray[1] === "success") {
          this.loadDepartmentDivisions(this.selectedDepartment.id);
          this.availableDivisions = [];
          this.message.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Division mapping added successfully.'
          });
          this.selectedDepartment.mapStatus = 1;
          this.isDepartmentMapped = true;
        } else {
          this.message.add({ 
            severity: 'warn', 
            summary: 'Warning', 
            detail: resultarray[1] || 'Failed to add division mapping.' 
          });
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Add mapping error:', err);
        this.message.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'Failed to add division mapping.' 
        });
        this.isFormLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  removeDivisionMapping(divisionId: number) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to remove this division mapping?',
      header: 'Confirm Removal',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.isFormLoading = true;
        this.cdr.detectChanges();

        const roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId || 0;
        const userId = sessionStorage.getItem('userId') || '';
        
        let query = `deptId=${this.selectedDepartment.id}|divisionId=${divisionId}|appUserId=${userId}|appUserRole=${roleID}`;
        
        this.userService.SubmitPostTypeData('uspDeleteDepartmentDivisionMapping', query, 'header').subscribe({
          next: (datacom: any) => {
            this.isFormLoading = false;
            
            if (!datacom) {
              this.message.add({ 
                severity: 'error', 
                summary: 'Error', 
                detail: 'Failed to remove division mapping.' 
              });
              return;
            }
            
            const resultarray = datacom.split("-");
            if (resultarray[1] === "success") {
              this.loadDepartmentDivisions(this.selectedDepartment.id);
              this.message.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Division mapping removed successfully.'
              });
              if (this.currentDivisionIds.length === 0) {
                this.selectedDepartment.mapStatus = 0;
                this.isDepartmentMapped = false;
              }
            } else {
              this.message.add({ 
                severity: 'warn', 
                summary: 'Warning', 
                detail: resultarray[1] || 'Failed to remove division mapping.' 
              });
            }
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Remove mapping error:', err);
            this.message.add({ 
              severity: 'error', 
              summary: 'Error', 
              detail: 'Failed to remove division mapping.' 
            });
            this.isFormLoading = false;
            this.cdr.detectChanges();
          }
        });
      }
    });
  }

  onDetailsDrawerHide() {
    this.detailsDrawerVisible = false;
    this.selectedDepartment = null;
    this.selectedDepartmentDivisions = [];
    this.currentDivisionIds = [];
    this.availableDivisions = [];
    this.isDepartmentMapped = false;
    this.cdr.detectChanges();
  }

  showDialog(view: string, data: any) {
    this.isFormLoading = true;
    this.cdr.detectChanges();
   
    if (view == 'add') {
      this.visible = true;
      this.postType = view;
      this.header = 'Add Department';
      this.headerIcon = 'pi pi-plus';
      this.departmentForm.reset();
      this.isFormLoading = false;
      this.cdr.detectChanges();
    }
    document.body.style.overflow = 'hidden';
  }

  onSubmit(event: any) {
    if (!this.departmentForm.valid) {
      this.departmentForm.markAllAsTouched();
      this.cdr.detectChanges();
      return;
    }
    
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
    
    const selectedDivisions = this.departmentForm.value.divisions || [];
    const divisionJson = selectedDivisions.map((divId: any) => ({
      divisionId: divId
    }));
    
    let query = `deptName=${this.departmentForm.value.deptName}|deptCode=${this.departmentForm.value.deptCode}|divisionJson=${JSON.stringify(divisionJson)}|appUserId=${userId}|appUserRole=${roleID}`;
   
    this.userService.SubmitPostTypeData('uspPostDepartmentMaster', query, 'header').subscribe({
      next: (datacom: any) => {
        this.isFormLoading = false;
        if (!datacom) return;
        
        const resultarray = datacom.split("-");
        if (resultarray[1] === "success") {
          this.getDepartmentCards();
          this.message.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Department Saved Successfully.'
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
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to save department data.' });
        this.isFormLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onDrawerHide() {
    document.body.style.overflow = 'visible';
    this.departmentForm.enable();
    this.visible = false;
    this.departmentForm.reset();
    this.cdr.detectChanges();
  }

  isInvalid(field: string): boolean {
    const control = this.departmentForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  ngOnDestroy() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }
}