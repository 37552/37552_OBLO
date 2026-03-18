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
  selector: 'app-designation-master',
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
  templateUrl: './designation-master.html',
  styleUrl: './designation-master.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DesignationMaster {
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
  designationCards: any[] = [];
  selectedDesignation: any = null;
  selectedDesignationOrganizations: any[] = [];
  currentOrganizationIds: number[] = [];
  availableOrganizations: any[] = [];
  isDesignationMapped: boolean = false;
  designationLevels: any[] = [];
  organizations: any[] = [];
  designationForm: FormGroup;
  parsedOrganizations: any[] = [];
  pageNo = 1;
  pageSize = 20; 
  searchText = '';
  totalCount = 0;
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  searchTimeout: any;
  debounceTime = 500;
  
  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true },
    { key: 'designation', header: 'Designation Name', isVisible: true, isSortable: true },
    { key: 'designationLevel', header: 'Designation Level', isVisible: true, isSortable: true }
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
    this.designationForm = this.fb.group({
      desigName: ['', Validators.required],
      designationLevelId: [null, Validators.required],
      organizations: [[]]
    });
  }

  get f() { return this.designationForm.controls }

  get filteredOrganizations() {
    if (!this.currentOrganizationIds?.length) {
      return this.organizations;
    }
    return this.organizations.filter(org => !this.currentOrganizationIds.includes(org.id));
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
    this.loadDesignationLevels();
    this.loadOrganizations();
    this.getDesignationCards();
    this.cdr.detectChanges();
  }

  loadDesignationLevels() {
    this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblDesignationLevelMaster`).subscribe({
      next: (res: any) => {
        const rawLevels = res['table'] || [];
        this.designationLevels = rawLevels.map((level: any) => ({
          id: level.drpValue,
          name: level.drpOption
        }));
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading designation levels:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to load designation levels.' });
      }
    });
  }

  loadOrganizations() {
    this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblOrgMaster`).subscribe({
      next: (res: any) => {
        const rawOrgs = res['table'] || [];
        this.organizations = rawOrgs.map((org: any) => ({
          id: org.drpValue,
          name: org.drpOption
        }));
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading organizations:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to load organizations.' });
      }
    });
  }

  getDesignationCards() {
    this.isLoading = true;
    this.cdr.detectChanges();
    
    const currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
    const roleId = currentRole?.roleId || '';
    const userId = sessionStorage.getItem('userId') || '';
    const districtId = sessionStorage.getItem('District') || '';
    
    let query = `searchText=${this.searchText}|pageIndex=${this.pageNo}|size=${this.pageSize}|districtId=${districtId}|appUserId=${userId}|appUserRole=${roleId}`;
    
    console.log('API Query:', query); // Debug log
    
    this.userService.getQuestionPaper(`uspGetDesignation|${query}`).subscribe({
      next: (res: any) => {
        try {
          console.log('API Response:', res); // Debug log
          
          this.designationCards = res?.table1 || [];
          this.totalCount = res?.table?.[0]?.totalCnt || this.designationCards.length;
          
          // Map the API field names to our expected field names
          this.designationCards = this.designationCards.map(item => ({
            ...item,
            desigName: item.designation, // Map designation to desigName for form compatibility
            id: item.id,
            designationLevel: item.designationLevel,
            mapStatus: item.mapStatus
          }));

          console.log('Processed Designations:', this.designationCards); // Debug log
          
        } catch (innerErr) {
          console.error('Error processing response:', innerErr);
          this.designationCards = [];
          this.totalCount = 0;
        } finally {
          setTimeout(() => {
            this.isLoading = false;
            this.cdr.detectChanges();
          }, 1000);
        }
      },
      error: (err) => {
        console.error('Error loading designations:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to load designations.' });
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Pagination methods
  onPageChange(newPage: number) {
    this.pageNo = newPage;
    this.getDesignationCards();
  }

  onPageSizeChange(newSize: number) {
    this.pageSize = newSize;
    this.pageNo = 1; // Reset to first page when changing page size
    this.getDesignationCards();
  }

  onSearchChange(search: string) {
    this.searchText = search;
    this.pageNo = 1; // Reset to first page when searching
    
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    this.searchTimeout = setTimeout(() => {
      this.getDesignationCards();
    }, this.debounceTime);
  }

  goToFirstPage() {
    if (this.pageNo !== 1) {
      this.pageNo = 1;
      this.getDesignationCards();
    }
  }

  goToLastPage() {
    if (this.pageNo !== this.totalPages) {
      this.pageNo = this.totalPages;
      this.getDesignationCards();
    }
  }

  goToPreviousPage() {
    if (this.pageNo > 1) {
      this.pageNo--;
      this.getDesignationCards();
    }
  }

  goToNextPage() {
    if (this.pageNo < this.totalPages) {
      this.pageNo++;
      this.getDesignationCards();
    }
  }

  // Add this method to your DesignationMaster class
  getDisplayRange(): string {
    const start = (this.pageNo - 1) * this.pageSize + 1;
    const end = Math.min(this.pageNo * this.pageSize, this.totalCount);
    return `Showing ${start} - ${end} of ${this.totalCount} designations`;
  }

  openDesignationDetails(desig: any) {
    this.selectedDesignation = desig;
    this.isDesignationMapped = desig.mapStatus === 1;

    try {
      this.parsedOrganizations = desig.organization ? JSON.parse(desig.organization) : [];
    } catch {
      this.parsedOrganizations = [];
    }

    if (desig.mapStatus === 0) {
      this.loadDesignationOrganizations(desig.id);
    }

    this.detailsDrawerVisible = true;
    this.cdr.detectChanges();
  }

  loadDesignationOrganizations(desigId: number) {
    const roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId || 0;
    const userId = sessionStorage.getItem('userId') || '';
    
    let query = `desigId=${desigId}|appUserId=${userId}|appUserRole=${roleID}`;
    
    this.userService.getQuestionPaper(`uspGetDesignationOrganizations|${query}`).subscribe({
      next: (res: any) => {
        const rawOrganizations = res?.table || [];
        this.selectedDesignationOrganizations = rawOrganizations.map((org: any) => ({
          id: org.orgId,
          name: org.orgName || `Organization ${org.orgId}`
        }));
        this.currentOrganizationIds = rawOrganizations.map((org: any) => org.orgId);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading designation organizations:', err);
        this.selectedDesignationOrganizations = [];
        this.currentOrganizationIds = [];
        this.cdr.detectChanges();
      }
    });
  }

  addOrganizationMapping() {
    if (this.availableOrganizations.length === 0) {
      this.message.add({ 
        severity: 'warn', 
        summary: 'Warning', 
        detail: 'Please select at least one organization.' 
      });
      return;
    }

    this.isFormLoading = true;
    this.cdr.detectChanges();

    const roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId || 0;
    const userId = sessionStorage.getItem('userId') || '';

    const orgDesigJson = this.availableOrganizations.map((orgId: any) => ({
      desigOrgId: orgId
    }));
    
    let query = `id=${this.selectedDesignation.id}|orgDesigJson=${JSON.stringify(orgDesigJson)}|appUserId=${userId}`;
    
    this.userService.SubmitPostTypeData('uspPostDesignationOrgMapping', query, 'header').subscribe({
      next: (datacom: any) => {
        this.isFormLoading = false;
        
        if (!datacom) {
          this.message.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: 'Failed to add organization mapping.' 
          });
          return;
        }
        
        const resultarray = datacom.split("-");
        if (resultarray[1] === "success") {
          this.loadDesignationOrganizations(this.selectedDesignation.id);
          this.availableOrganizations = [];
          this.message.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Organization mapping added successfully.'
          });
          this.selectedDesignation.mapStatus = 1;
          this.isDesignationMapped = true;
        } else {
          this.message.add({ 
            severity: 'warn', 
            summary: 'Warning', 
            detail: resultarray[1] || 'Failed to add organization mapping.' 
          });
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Add mapping error:', err);
        this.message.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'Failed to add organization mapping.' 
        });
        this.isFormLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  removeOrganizationMapping(orgId: number) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to remove this organization mapping?',
      header: 'Confirm Removal',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.isFormLoading = true;
        this.cdr.detectChanges();

        const roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId || 0;
        const userId = sessionStorage.getItem('userId') || '';
        
        let query = `desigId=${this.selectedDesignation.id}|orgId=${orgId}|appUserId=${userId}|appUserRole=${roleID}`;
        
        this.userService.SubmitPostTypeData('uspDeleteDesignationOrgMapping', query, 'header').subscribe({
          next: (datacom: any) => {
            this.isFormLoading = false;
            
            if (!datacom) {
              this.message.add({ 
                severity: 'error', 
                summary: 'Error', 
                detail: 'Failed to remove organization mapping.' 
              });
              return;
            }
            
            const resultarray = datacom.split("-");
            if (resultarray[1] === "success") {
              this.loadDesignationOrganizations(this.selectedDesignation.id);
              this.message.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Organization mapping removed successfully.'
              });
              if (this.currentOrganizationIds.length === 0) {
                this.selectedDesignation.mapStatus = 0;
                this.isDesignationMapped = false;
              }
            } else {
              this.message.add({ 
                severity: 'warn', 
                summary: 'Warning', 
                detail: resultarray[1] || 'Failed to remove organization mapping.' 
              });
            }
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Remove mapping error:', err);
            this.message.add({ 
              severity: 'error', 
              summary: 'Error', 
              detail: 'Failed to remove organization mapping.' 
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
    this.selectedDesignation = null;
    this.selectedDesignationOrganizations = [];
    this.currentOrganizationIds = [];
    this.availableOrganizations = [];
    this.isDesignationMapped = false;
    this.cdr.detectChanges();
  }

  showDialog(view: string, data: any) {
    this.isFormLoading = true;
    this.cdr.detectChanges();
   
    if (view == 'add') {
      this.visible = true;
      this.postType = view;
      this.header = 'Add Designation';
      this.headerIcon = 'pi pi-plus';
      this.designationForm.reset();
      this.isFormLoading = false;
      this.cdr.detectChanges();
    }
    document.body.style.overflow = 'hidden';
  }

  onSubmit(event: any) {
    if (!this.designationForm.valid) {
      this.designationForm.markAllAsTouched();
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
    
    const selectedOrganizations = this.designationForm.value.organizations || [];
    const orgDesigJson = selectedOrganizations.map((orgId: any) => ({
      desigOrgId: orgId
    }));
    
    let query = `designationLevelId=${this.designationForm.value.designationLevelId}|desigName=${this.designationForm.value.desigName}|appUserId=${userId}|appUserRole=${roleID}`;
   
    this.userService.SubmitPostTypeData('uspPostDesignationMaster', query, 'header').subscribe({
      next: (datacom: any) => {
        this.isFormLoading = false;
        if (!datacom) return;
        
        const resultarray = datacom.split("-");
        if (resultarray[1] === "success") {
         this.getDesignationCards();
          this.message.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Designation saved successfully.'
          });
          this.onDrawerHide();
        } else if (resultarray[0] == "2") {
         this.message.add({ severity: 'warn', summary: 'Warn', detail: resultarray[1] || datacom });
        } else {
          this.message.add({ severity: 'warn', summary: 'Warn', detail:datacom });
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Submit error:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to save designation data.' });
        this.isFormLoading = false;
        this.cdr.detectChanges();
      }
    });
  }


  extractDesignationId(response: any): number {
    try {
      const parts = response.split('-');
      return parseInt(parts[0]);
    } catch (e) {
      console.error('Error extracting designation ID:', e);
      return 0;
    }
  }

  onDrawerHide() {
    document.body.style.overflow = 'visible';
    this.designationForm.enable();
    this.visible = false;
    this.designationForm.reset();
    this.cdr.detectChanges();
  }

  isInvalid(field: string): boolean {
    const control = this.designationForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  ngOnDestroy() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }
}