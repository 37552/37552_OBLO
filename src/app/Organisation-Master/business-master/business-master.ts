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
  selector: 'app-business-master',
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
    Dialog
  ],
  providers: [
    ConfirmationService,
    MessageService,
    
  ],
  templateUrl: './business-master.html',
  styleUrl: './business-master.scss',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BusinessMaster {
  isLoading = true;
  visible: boolean = false;
  postType: string = '';
  header: any = '';
  selectedIndex: any = [];
  headerIcon: string = 'pi pi-plus';
  paramvaluedata: string = '';
  isFormLoading: boolean = false;
  data: any[] = [];
  sbuForm: FormGroup;
  sbuTypes: any[] = [];
  sbuOwners: any[] = [];
  kpis: any[] = [];
  kpimapping: any[] = [];
  revenueOptions = [
    { value: true, name: 'Yes' },
    { value: false, name: 'No' }
  ];
  
  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isCustom: true },
    { key: 'sbuName', header: 'SBU Name', isVisible: true },
    { key: 'sbuType', header: 'SBU Type', isVisible: true },
    { key: 'owner', header: 'SBU Owner', isVisible: true },
    { key: 'jsonDetails', header: 'KPI Details', isVisible: true, isCustom: true }
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
  kpiDialogVisible: boolean = false;
  kpiListArray: any[] = [];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private message: MessageService,
    private cdr: ChangeDetectorRef
  ) {
    this.sbuForm = this.fb.group({
      id: [0],
      sbuName: ['', Validators.required],
      sbuTypeId: [null, Validators.required],
      isRevenueGenerating: [null, Validators.required],
      sbuOwnerId: [null, Validators.required],
      kpiIds: [[], Validators.required],
      mappingId: [0]
    });
  }

  get f() { return this.sbuForm.controls }

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
  }

  loadDropdowns() {
    // Load SBU Types
    this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblSbuTypeMaster`).subscribe({
      next: (res: any) => {
        const rawTypes = res['table'] || [];
        this.sbuTypes = rawTypes.map((item: any) => ({
          id: item.drpValue,
          name: item.drpOption
        }));
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading SBU types:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to load SBU types.' });
      }
    });

    // Load SBU Owners (typically employees or users)
    this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblEmployeeMaster`).subscribe({
      next: (res: any) => {
        const rawOwners = res['table'] || [];
        this.sbuOwners = rawOwners.map((item: any) => ({
          id: item.drpValue,
          name: item.drpOption
        }));
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading SBU owners:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to load SBU owners.' });
      }
    });

    // Load KPIs from tblSbuGoalKpiMaster
    this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblSbuGoalKpiMaster`).subscribe({
      next: (res: any) => {
        const rawKpis = res['table'] || [];
        this.kpis = rawKpis.map((item: any) => ({
          id: item.drpValue,
          name: item.drpOption
        }));
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading KPIs:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to load KPIs.' });
      }
    });

    // Load KPI Mapping from tblSbuKpiMapping
    this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblSbuKpiMapping`).subscribe({
      next: (res: any) => {
        const rawMapping = res['table'] || [];
        this.kpimapping = rawMapping.map((item: any) => ({
          id: item.drpValue,
          name: item.drpOption
        }));
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading KPI mapping:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to load KPI mapping.' });
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
  
  this.userService.getQuestionPaper(`uspGetSbuDetails|${query}`).subscribe({
    next: (res: any) => {
      try {
        this.data = res?.table1 || [];
        this.data = this.data.map(item => {
          let kpiDetails = '';
          let kpiIds: number[] = [];
          let mappingIds: number[] = [];

          if (item.kpiMapping && item.kpiMapping !== '[]') {
            try {
              const kpis = JSON.parse(item.kpiMapping);
              if (Array.isArray(kpis) && kpis.length > 0) {
                // FIX: Use kpiName instead of kpi
                kpiDetails = kpis.map((kpi: any) => kpi.kpiName).join(', ');
                kpiIds = kpis.map((kpi: any) => kpi.kpiId);
                mappingIds = kpis.map((kpi: any) => kpi.mappingId);
              }
            } catch (e) {
              console.error('Error parsing KPI mapping JSON:', e);
              kpiDetails = 'Error parsing KPIs';
            }
          }

          return {
            ...item,
            kpiDetails: kpiDetails,
            kpiIds: kpiIds,
            mappingIds: mappingIds,
            sbuType: item.sbuType || 'Not specified',
            owner: item.owner || 'Not assigned'
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
      this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to load SBUs.' });
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
    this.header = 'Add SBU';
    this.headerIcon = 'pi pi-plus';
    this.sbuForm.reset({
      id: 0,
      kpiIds: [],
      mappingId: 0
    });
    this.isFormLoading = false;
    this.cdr.detectChanges();
  } else {
    this.visible = true;
    this.postType = view;
    this.header = view === 'update' ? 'Update SBU' : 'View SBU';
    this.headerIcon = view === 'update' ? 'pi pi-pencil' : 'pi pi-eye';
    this.selectedIndex = data;
   
    if (view === 'view') {
      this.sbuForm.disable();
    } else {
      this.sbuForm.enable();
    }

    // Parse KPI mapping from API response
    let kpiIds: number[] = [];
    let mappingIds: number[] = []; // Store all mapping IDs

    if (data.kpiMapping && data.kpiMapping !== '[]') {
      try {
        const kpis = JSON.parse(data.kpiMapping);
        if (Array.isArray(kpis) && kpis.length > 0) {
          kpiIds = kpis.map((kpi: any) => kpi.kpiId);
          mappingIds = kpis.map((kpi: any) => kpi.mappingId);
        }
      } catch (e) {
        console.error('Error parsing KPI mapping JSON:', e);
      }
    }

    // Store mapping IDs in a separate property for later use
    this.selectedIndex.mappingIds = mappingIds;

    // Patch form with data
    const patchData = {
      id: data.id || 0,
      sbuName: data.sbuName || '',
      sbuTypeId: data.sbuTypeId || null,
      isRevenueGenerating: data.isRevenueGenerating || null,
      sbuOwnerId: data.sbuOwnerId || null,
      kpiIds: kpiIds,
      mappingId: mappingIds.length > 0 ? mappingIds[0] : 0 // Still set first one for form, but we'll use all in submit
    };

    this.sbuForm.patchValue(patchData);
    this.isFormLoading = false;
    this.cdr.detectChanges();
  }
  document.body.style.overflow = 'hidden';
}

onSubmit(event: any) {
  if (!this.sbuForm.valid) {
    this.sbuForm.markAllAsTouched();
    this.cdr.detectChanges();
    return;
  }

  const formValues = this.sbuForm.value;
  let kpiJson = [];
  
  if (this.postType === 'add') { 0
    kpiJson = (formValues.kpiIds || []).map((kpiId: number) => ({
      kpiId: kpiId,
      mappingId: 0
    }));
  } else {
    const existingKpis = this.selectedIndex.kpiMapping && this.selectedIndex.kpiMapping !== '[]' 
      ? JSON.parse(this.selectedIndex.kpiMapping) 
      : [];
    const existingMappingIds = this.selectedIndex.mappingIds || [];
    kpiJson = (formValues.kpiIds || []).map((kpiId: number, index: number) => {
      const existingKpi = existingKpis.find((kpi: any) => kpi.kpiId === kpiId);
      return {
        kpiId: kpiId,
        mappingId: existingKpi ? existingKpi.mappingId : 0
      };
    });
  }

  const idParam = this.postType === 'add'
    ? 'id=0|' 
    : this.postType === 'update'
    ? `id=${formValues.id}|`
    : '';

  const isRevenueGenerating = formValues.isRevenueGenerating ? 1 : 0;
  this.paramvaluedata = `${idParam}sbuName=${formValues.sbuName}|sbuTypeId=${formValues.sbuTypeId}|isRevenueGenerating=${isRevenueGenerating}|sbuOwnerId=${formValues.sbuOwnerId}|kpiJson=${JSON.stringify(kpiJson)}`;
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
    
    let query = `${this.paramvaluedata}|appUserId=${userId}|appRoleId=${roleID}`;
    let SP = 'uspPostSbuMaster';
   
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
            detail: this.postType === 'update' ? 'SBU Updated Successfully.' : 'SBU Saved Successfully.',
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
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to save SBU data.' });
        this.isFormLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onDrawerHide() {
    document.body.style.overflow = 'visible';
    this.sbuForm.enable();
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
    const control = this.sbuForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onClear() {
    this.sbuForm.reset({
      id: 0,
      kpiIds: [],
      mappingId: 0
    });
    this.cdr.detectChanges();
  }



showKpiList(data: any) {
  this.kpiDialogVisible = true;
  try {
    if (data.kpiMapping && data.kpiMapping !== '[]') {
      this.kpiListArray = JSON.parse(data.kpiMapping);
    } else {
      this.kpiListArray = [];
    }
  } catch (e) {
    console.error('Error parsing KPI mapping JSON:', e);
    this.kpiListArray = [];
  }
  this.cdr.detectChanges();
}


  ngOnDestroy() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }
}