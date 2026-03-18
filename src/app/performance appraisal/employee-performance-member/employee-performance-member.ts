import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TableTemplate, TableColumn } from '../../table-template/table-template';
import { ButtonModule } from 'primeng/button';
import { Popover } from 'primeng/popover';
import { Tooltip } from 'primeng/tooltip';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Toast } from 'primeng/toast';
import { BreadcrumbModule } from 'primeng/breadcrumb';

import { ConfirmationService, MessageService } from 'primeng/api';
import { UserService } from './../../shared/user-service';

interface QuarterOption {
  empId: string;
  id: number;
  appraisalPeriodId: number;
  appraisalFor: string;
  financialYear: string;
  quarterNo: number;
}

@Component({
  selector: 'app-employee-performance-member',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableTemplate,
    ButtonModule,
    Popover,
    Tooltip,
    ConfirmDialog,
    Toast,
    BreadcrumbModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './employee-performance-member.html',
  styleUrl: './employee-performance-member.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeePerformanceMember implements OnInit {

  isLoading = true;
  isLoadingMetaData = false;
  data: any[] = [];
  pendingMetaData: QuarterOption[] = [];
  filteredQuarters: QuarterOption[] = [];
  
  showQuarterDropdown = false;
  quarterSearch = '';
  
  pageNo = 1;
  pageSize = 10;
  totalCount = 0;
  searchText = '';
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  selectedAction = 'uspGetPendingEmployeeAppraisals';

  columns: TableColumn[] = [
    { key: 'sno', header: 'S.No.', isVisible: true },
    { key: 'employeeName', header: 'Employee Name', isVisible: true },
    { key: 'designation', header: 'Designation', isVisible: true },
    { key: 'department', header: 'Department', isVisible: true },
    { key: 'company', header: 'Company', isVisible: true },
    { key: 'hod', header: 'HOD', isVisible: true },
    { key: 'appraisalPeriod', header: 'Appraisal Period', isVisible: true },
    { key: 'financialYear', header: 'Financial Year', isVisible: true },
    { key: 'status', header: 'Status', isVisible: true },
    {
      key: 'jsonDetails',
      header: 'View Data',
      isVisible: true,
      isCustom: true,
      isSortable: false
    }
  ];

  statusTabs = [
    {
      label: 'Pending Appraisals',
      value: 'PENDING',
      procedure: 'uspGetPendingEmployeeAppraisals',
      icon: 'pi pi-clock',
      color: 'orange'
    },
    {
      label: 'Completed Appraisals',
      value: 'APPROVED',
      procedure: 'uspGetCompletedEmployeeAppraisals',
      icon: 'pi pi-check-circle',
      color: 'green'
    }
  ];

  breadcrumbItems = [
    { label: 'Employee Performance' },
    { label: 'Member', disabled: true }
  ];

  constructor(
    private userService: UserService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.selectedAction === 'uspGetPendingEmployeeAppraisals'
      ? this.getPendingAppraisals()
      : this.getCompletedAppraisals();
  }

  getPendingAppraisals(): void {
    this.isLoading = true;
    this.isLoadingMetaData = true;
    const roleId = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
    const userId = sessionStorage.getItem('userId');
    const query = `uspGetPendingEmployeeAppraisals|appUserId=${userId}|appUserRole=${roleId}`;

    this.userService.getQuestionPaper(query).subscribe({
      next: (res: any) => {
        this.data = (res.table || []).map((r: any, i: number) => ({
          sno: i + 1,
          employeeName: r.employee,
          designation: r.designation,
          department: r.department,
          company: r.companyName,
          hod: r.hodName,
          appraisalPeriod: r.appraisalFor,
          financialYear: r.financialYear,
          status: r.status,
          jsonDetails: r,
           empId: r.empId,
           id: r.id,
           appraisalPeriodId: r.appraisalPeriodId,
        }));

        this.pendingMetaData = (res.table || []).map((r: any): QuarterOption => ({
          empId: r.empId,
          id: r.id,
          appraisalPeriodId: r.appraisalPeriodId,
          appraisalFor: r.appraisalFor,
          financialYear: r.financialYear,
          quarterNo: r.quarterNo
        }));

        this.filteredQuarters = [...this.pendingMetaData];
        this.totalCount = this.data.length;
        this.isLoading = false;
        this.isLoadingMetaData = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.isLoadingMetaData = false;
        this.cdr.detectChanges();
      }
    });
  }

  getCompletedAppraisals(): void {
    this.isLoading = true;
    const roleId = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
    const userId = sessionStorage.getItem('userId');
    const query = `uspGetCompletedEmployeeAppraisals|appUserId=${userId}|appUserRole=${roleId}`;
    
    this.userService.getQuestionPaper(query).subscribe({
      next: (res: any) => {
        this.data = (res.table || []).map((r: any, i: number) => ({
          sno: i + 1,
          employeeName: r.employee,
          designation: r.designation,
          department: r.department,
          company: r.companyName,
          hod: r.hodName,
          appraisalPeriod: r.appraisalFor,
          financialYear: r.financialYear,
          status: r.status,
          jsonDetails: r,
          appraisalPeriodId:r.appraisalPeriodId,
          id:r.id
        }));

        this.totalCount = this.data.length;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  navigateToAppraisal(row: any): void {
    debugger
    this.router.navigate(['/employee-performance'], {
      queryParams: {
        empId: row.empId,
        id: row.id,
        finelSubmitted: false,
        AppraisalPeriodid: row.appraisalPeriodId,
        financialYear: row.financialYear
      }
    });
  }

  selectQuarter(quarter: QuarterOption): void {
    debugger
    this.showQuarterDropdown = false;
    this.navigateToAppraisal(quarter);
  }

viewPackageDetails(row: any): void {
  this.navigateToAppraisal({
    empId: row.empId,
    id: row.id,
    appraisalPeriodId: row.appraisalPeriodId,
    financialYear: row.financialYear
  });
}


  toggleQuarterDropdown(): void {
    this.showQuarterDropdown = !this.showQuarterDropdown;
    if (this.showQuarterDropdown) {
      this.filterQuarters();
    }
  }

  filterQuarters(): void {
    const search = this.quarterSearch.toLowerCase().trim();
    if (!search) {
      this.filteredQuarters = [...this.pendingMetaData];
    } else {
      this.filteredQuarters = this.pendingMetaData.filter(q =>
        q.appraisalFor.toLowerCase().includes(search) ||
        q.financialYear.toLowerCase().includes(search)
      );
    }
    this.cdr.detectChanges();
  }

  onChangeTabs(tabValue: string): void {
    const tab = this.statusTabs.find(t => t.value === tabValue);
    if (!tab) return;
    this.selectedAction = tab.procedure;
    this.pageNo = 1;
    this.quarterSearch = '';
    this.showQuarterDropdown = false;
    this.loadData();
  }

  onPageChange(p: number) { 
    this.pageNo = p; 
  }
  
  onPageSizeChange(s: number) { 
    this.pageSize = s; 
  }
  
  onSearchChange(t: string) { 
    this.searchText = t; 
  }
  
  onSortChange(e: any) {
    this.sortColumn = e.column;
    this.sortDirection = e.direction;
  }

  openApprovalDialog(item: any): void {
    this.navigateToAppraisal(item.jsonDetails);
  }
}