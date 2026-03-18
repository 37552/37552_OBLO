import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { UserService } from '../../shared/user-service';
import { ExcelService } from '../../shared/excel.service';
import { LoadingService } from '../../shared/loading.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { TableTemplate, TableColumn } from '../../table-template/table-template';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-final-attendance',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    BreadcrumbModule,
    DatePickerModule,
    SelectModule,
    TableModule,
    ButtonModule,
    TableTemplate,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: './final-attendance.html',
  styleUrl: './final-attendance.scss',
})
export class FinalAttendance implements OnInit {
  // Services using inject()
  private userService = inject(UserService);
  private excelService = inject(ExcelService);
  private loadingService = inject(LoadingService);
  private messageService = inject(MessageService);

  // Signals for state management
  menulabel = signal<string>('');
  formlable = signal<string>('');
  fromDate = signal<Date | undefined>(undefined);
  toDate = signal<Date | undefined>(undefined);
  isSubmitted = signal(false);
  isLoading = signal(false);
  viewData = signal(false);
  noDatafoundCard = signal(false);

  org = signal<any[]>([]);
  emp = signal<any[]>([]);
  selectedOrg = signal<any>(null);
  selectedEmp = signal<any>(null);

  allFinalTableData = signal<any[]>([]);
  filteredTableData = signal<any[]>([]);
  paginatedTableData = signal<any[]>([]);
  tableHeaders = signal<any[]>([]);
  columns = signal<TableColumn[]>([]);

  pageNo = signal(1);
  pageSize = signal(10);
  totalCount = signal(0);
  searchText = signal('');
  sortColumn = signal('');
  sortDirection = signal<'asc' | 'desc'>('asc');

  currRole = JSON.parse(sessionStorage.getItem('currentRole')!);
  roleID = this.currRole['rolDes'];

  isInvalid(field: string): boolean {
    if (field === 'fromDate') return this.isSubmitted() && !this.fromDate();
    if (field === 'toDate') return this.isSubmitted() && !this.toDate();
    return false;
  }

  ngOnInit(): void {
    const paramString = sessionStorage.getItem('menuItem');
    if (paramString) {
      const param = JSON.parse(paramString);
      this.menulabel.set(param.menu);
      this.formlable.set(param.formName);
    }
    this.getDropdownOrg();
  }

  getDropdownOrg() {
    const userId = sessionStorage.getItem('userId');
    const query = `id=0|role=${this.roleID}|AppUserId=${userId}`;
    this.userService
      .getQuestionPaper(`uspGetEmpFinalAttendanceDrp|${query}`)
      .subscribe((res: any) => {
        this.org.set(res.table);
        this.emp.set(res.table1);
      });
  }

  getDrpdownEmp() {
    const userId = sessionStorage.getItem('userId');
    const orgId = this.selectedOrg()?.drpValue;
    const query = `id=${orgId}|role=${this.roleID}|orgId=${orgId}|AppUserId=${userId}`;

    this.userService
      .getQuestionPaper(`uspGetEmpFinalAttendanceDrp|${query}`)
      .subscribe((res: any) => {
        this.emp.set(res.table1);
      });
  }

  showData() {
    this.isSubmitted.set(true);
    const from = this.fromDate();
    const to = this.toDate();

    if (!from || !to) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill all required fields',
      });
      return;
    }

    this.isLoading.set(true);
    const userId = sessionStorage.getItem('userId');
    const query = `DateFrom=${from.toISOString().split('T')[0]}|DateTo=${to.toISOString().split('T')[0]}|AppUserId=${userId}|EmpId=${this.selectedEmp()?.drpValue || 0}`;

    this.userService.getDataFromServer(`uspGetSalaryDays|${query}`).subscribe(
      (res: any) => {
        this.isLoading.set(false);
        const data = res['table']?.map((item: any, index: number) => ({
          sno: index + 1,
          ...item,
        })) || [];

        this.allFinalTableData.set(data);
        this.filteredTableData.set([...data]);
        this.totalCount.set(data.length);
        this.viewData.set(true);

        if (data.length === 0) {
          this.noDatafoundCard.set(true);
          this.paginatedTableData.set([]);
        } else {
          this.noDatafoundCard.set(false);
          const headers = Object.keys(res['table'][0]);
          this.tableHeaders.set(headers);
          this.columns.set([
            { key: 'sno', header: 'S.No', isVisible: true, isSortable: false },
            ...headers
              .filter((header) => header !== 'id')
              .map((header) => ({
                key: header,
                header: header,
                isVisible: true,
                isSortable: true,
              })),
          ]);
          this.searchText.set('');
          this.sortColumn.set('');
          this.sortDirection.set('asc');
          this.pageNo.set(1);
          this.updatePaginatedData();
        }
      },
      (error) => {
        this.isLoading.set(false);
        console.error('Error fetching data:', error);
      },
    );
  }

  onPageChange(page: number): void {
    this.pageNo.set(page);
    this.updatePaginatedData();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.pageNo.set(1);
    this.updatePaginatedData();
  }

  onSearchChange(text: string): void {
    this.searchText.set(text);
    this.pageNo.set(1);
    const currentSearchText = this.searchText();
    if (!currentSearchText) {
      this.filteredTableData.set([...this.allFinalTableData()]);
    } else {
      const searchLower = currentSearchText.toLowerCase();
      const filtered = this.allFinalTableData().filter((row) => {
        return Object.values(row).some((val) =>
          String(val).toLowerCase().includes(searchLower),
        );
      });
      this.filteredTableData.set(filtered);
    }
    this.totalCount.set(this.filteredTableData().length);
    this.updatePaginatedData();
  }

  onSortChange(event: { column: string; direction: 'asc' | 'desc' }): void {
    this.sortColumn.set(event.column);
    this.sortDirection.set(event.direction);

    const currentSortColumn = this.sortColumn();
    const currentSortDirection = this.sortDirection();

    if (currentSortColumn) {
      const sorted = [...this.filteredTableData()].sort((a, b) => {
        const valA = a[currentSortColumn];
        const valB = b[currentSortColumn];

        if (valA === valB) return 0;
        if (valA == null) return 1;
        if (valB == null) return -1;

        const comparison = String(valA).localeCompare(String(valB), undefined, {
          numeric: true,
          sensitivity: 'base',
        });

        return currentSortDirection === 'asc' ? comparison : -comparison;
      });
      this.filteredTableData.set(sorted);
    }
    this.updatePaginatedData();
  }

  private updatePaginatedData(): void {
    const start = (this.pageNo() - 1) * this.pageSize();
    const end = start + this.pageSize();
    this.paginatedTableData.set(this.filteredTableData().slice(start, end));
  }

  exportAsXLSX(): void {
    this.excelService.exportAsExcelFile(this.filteredTableData(), this.formlable());
  }
}
