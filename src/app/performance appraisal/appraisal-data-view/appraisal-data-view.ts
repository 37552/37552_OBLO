import { Component, ChangeDetectorRef, OnInit, OnDestroy, ChangeDetectionStrategy, HostListener, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Tooltip } from "primeng/tooltip";
import { Dialog } from 'primeng/dialog';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Toast } from 'primeng/toast';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { TabsModule } from 'primeng/tabs';
import { TableTemplate, TableColumn } from '../../table-template/table-template';
import { UserService } from '../../shared/user-service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { ConfigService } from '../../shared/config.service';
import { debounceTime, distinctUntilChanged, Subject, Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-appraisal-data-view',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    Tooltip,
    Dialog,
    ConfirmDialog,
    SelectModule,
    InputTextModule,
    CardModule,
    ProgressSpinner,
    Toast,
    BreadcrumbModule,
    TabsModule,
    TableTemplate,
  ],
  providers: [ConfirmationService, MessageService, DatePipe],
  templateUrl: './appraisal-data-view.html',
  styleUrl: './appraisal-data-view.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppraisalDataView implements OnInit, OnDestroy {
  isLoading = false;
  data: any[] = [];
  paginatedData: any[] = []; 
  columns: TableColumn[] = [
    { key: 'empName', header: 'Employee', isVisible: true },
    { key: 'department', header: 'Department', isVisible: true },
    { key: 'designation', header: 'Designation', isVisible: true},
    { key: 'doj', header: 'DOJ', isVisible: true },
    { key: 'jsonDetails',  header: ' Self Assessment', isVisible: true, isSortable: false, isCustom: true },
    { key: 'jsonDetails1',header: 'Appraiser', isVisible: true, isSortable: false, isCustom: true },
    {  key: 'jsonDetails2', header: 'Reviewer',  isVisible: true,  isSortable: false,  isCustom: true },
    { key: 'jsonDetails3', header: 'Actions', isVisible: true, isSortable: false,  isCustom: true },
  ];

  pageNo = 1;
  pageSize = 10;
  searchText = '';
  sortColumn: string = 'empName';
  sortDirection: 'asc' | 'desc' = 'asc';
  totalCount = 0;
  
  searchSubject = new Subject<string>();
  private searchSubscription?: Subscription;
  
  orgList: any[] = [];
  appraisalPeriodList: any[] = [];
  departmentList: any[] = [];
  selectedOrgId: any = 0;
  selectedAppraisalPeriodId: any = 0;
  selectedDeptId: any = 0;
  selectedItem: any = null;
  breadcrumbItems!: ({ label: any; disabled?: undefined; } | { label: any; disabled: boolean; })[];
  home: any = { icon: 'pi pi-home', routerLink: '/' };
  param: string | null = null;
  FormName: any;
  FormValue: any;
  menulabel: any;
  formlable: any;
  
  actionMenuOpen = false;

  @ViewChild('actionTemplateRef', { static: true }) actionTemplateRef!: TemplateRef<any>;
  @ViewChild('rowTemplateRef', { static: true }) rowTemplateRef!: TemplateRef<any>;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private message: MessageService,
    private cdr: ChangeDetectorRef,
    private configService: ConfigService,
    private datePipe: DatePipe,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.initializeComponent();
    this.getOrganisationDrp();
    this.getAppraisalPeriodDrp();
    this.getDepartmentDrp();
    this.searchSubscription = this.searchSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(searchText => {
        this.searchText = searchText;
        this.filterAndPaginateData();
      });
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  private initializeComponent(): void {
    this.param = sessionStorage.getItem("menuItem");
    if (this.param) {
      try {
        let paramjs = JSON.parse(this.param);
        this.FormName = paramjs.formName;
        this.FormValue = paramjs.formValue;
        this.menulabel = paramjs.menu;
        this.formlable = paramjs.formName;
      } catch (e) {
        console.error('Error parsing menu item:', e);
      }
       this.breadcrumbItems = [
      { label: this.menulabel },
      { label: this.FormName, disabled: true }
    ];
    }

    this.cdr.detectChanges();
  }

  getOrganisationDrp(): void {
    this.userService.getQuestionPaper(
      `uspGetFillDrpDown|table=tblOrgMaster`
    ).subscribe({
      next: (res: any) => {
        this.orgList = res.table || [];
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error loading organisation data:', err);
        this.message.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load organisation list.'
        });
      }
    });
  }

  getDepartmentDrp(): void {
    this.userService.getQuestionPaper(
      `uspGetFillDrpDown|table=tblDepartmentMaster`
    ).subscribe({
      next: (res: any) => {
        this.departmentList = res.table || [];
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error loading department data:', err);
        this.message.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load department list.'
        });
      }
    });
  }

  getAppraisalPeriodDrp(): void {
    this.userService.getQuestionPaper(
      `uspGetAppraisalPeriod|appUserId=${sessionStorage.getItem('userId')}`
    ).subscribe({
      next: (res: any) => {
        this.appraisalPeriodList = res.table || [];
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error loading appraisal period data:', err);
        this.message.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load appraisal period list.'
        });
      }
    });
  }

  getFilterData(): void {
    if (this.selectedOrgId == 0) {
      this.message.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select an Organisation.'
      });
      return;
    }

    if (this.selectedAppraisalPeriodId == 0) {
      this.message.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select an Appraisal Period.'
      });
      return;
    }

    this.isLoading = true;
    const roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
    const query = `uspReportPerformanceAppraisal|orgMasterId=${this.selectedOrgId}|departmentId=${this.selectedDeptId}|appraisalPeriodId=${this.selectedAppraisalPeriodId}|appUserId=${sessionStorage.getItem("userId")}|appUserRole=${roleID}`;

    this.userService.getQuestionPaper(query).subscribe({
      next: (res: any) => {
        const responseData = (res && res.table) ? res.table : [];
        this.data = responseData.map((item: any, index: number) => {
          return {
            id: item.id || index + 1,
            empid: item.empid || `EMP-${index + 1}`,
            empName: item.empName || 'N/A',
            department: item.department || 'N/A',
            designation: item.designation || 'N/A',
            doj: item.doj || null,
            selfAssessmentDate: item.selfAssessmentDate || null,
            apraisar: item.apraisar || null,  
            appraiserDate: item.appraiserDate || null,
            reviewer: item.reviewer || null,
            reviewerDate: item.reviewerDate || null,
            financialYear: item.financialYear || null,
            appraisalPeriodId: item.appraisalPeriodId || null,
            refNo: item.refNo || null
          };
        });
        this.totalCount = this.data.length;
        this.filterAndPaginateData();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error loading filter data:', err);
        this.isLoading = false;
        this.message.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load appraisal data.'
        });
        this.cdr.detectChanges();
      }
    });
  }

  viewPackageDetails(item: any): void {
    if (!item) {
      console.error('No item data provided');
      return;
    }
    
    this.router.navigate(['/employee-performance'], {
      queryParams: {
        empId: item.empid || item.id, 
        id: item.id,
        finelSubmitted: true,
        AppraisalPeriodid: item.appraisalPeriodId,
        financialYear: item.financialYear
      }
    });
  }

  filterAndPaginateData(): void {
    let filteredData = [...this.data];
    if (this.searchText.trim()) {
      const searchLower = this.searchText.toLowerCase().trim();
      filteredData = filteredData.filter(item => 
        (item.empName && item.empName.toLowerCase().includes(searchLower)) ||
        (item.empid && item.empid.toLowerCase().includes(searchLower)) ||
        (item.department && item.department.toLowerCase().includes(searchLower)) ||
        (item.designation && item.designation.toLowerCase().includes(searchLower))
      );
    }
    this.totalCount = filteredData.length;
    const startIndex = (this.pageNo - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedData = filteredData.slice(startIndex, endIndex);
    this.cdr.detectChanges();
  }

  onSearchChange(search: string): void {
    this.searchSubject.next(search);
  }

  onPageChange(newPage: number): void {
    this.pageNo = newPage;
    this.filterAndPaginateData();
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize = newSize;
    this.pageNo = 1; 
    this.filterAndPaginateData();
  }



  toggleActionMenu(event: Event, item: any): void {
    event.stopPropagation();
    this.actionMenuOpen = !this.actionMenuOpen;
    this.selectedItem = this.actionMenuOpen ? item : null;
    this.cdr.detectChanges();
  }

  processAppraisal(item: any): void {
    this.actionMenuOpen = false;
    
    this.confirmationService.confirm({
      message: `Are you sure you want to process appraisal for ${item.empName}?`,
      header: 'Confirm Process',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.message.add({
          severity: 'success',
          summary: 'Success',
          detail: `Appraisal process initiated for ${item.empName}`
        });
      }
    });
  }

  viewDetails(item: any): void {
    this.actionMenuOpen = false;
    console.log('Viewing details for:', item);
  }

  exportAppraisal(item: any): void {
    this.actionMenuOpen = false;
    console.log('Exporting appraisal for:', item);
  }

  @HostListener('document:click')
  closeActionMenu(): void {
    if (this.actionMenuOpen) {
      this.actionMenuOpen = false;
      this.selectedItem = null;
      this.cdr.detectChanges();
    }
  }
}