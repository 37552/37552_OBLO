import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  DestroyRef,
  inject
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { forkJoin } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { UserService } from '../../shared/user-service';
import { ExcelService } from '../../shared/excel.service';

interface ApiResponse {
  table?: any[];
  table2?: Record<string, any>[];
}

interface Organisation {
  orgId: number;
  orgName: string;
}

interface Month {
  monthId: number;
  monthName: string;
}

@Component({
  selector: 'app-esic-return-report',
  standalone: true,
  imports: [
    BreadcrumbModule,
    SelectModule,
    FormsModule,
    ButtonModule,
    CommonModule,
    TableModule,
    ProgressSpinnerModule
  ],
  templateUrl: './esic-return-report.html',
  styleUrl: './esic-return-report.scss',
  providers: [ExcelService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EsicReturnReport implements OnInit {

  private destroyRef = inject(DestroyRef);

  constructor(
    private userService: UserService,
    private excelService: ExcelService
  ) { }

  FormName: string = '';
  FormValue: string = '';
  menulabel: string = '';
  breadcrumbItems: any[] = [];
  selectedOrg: string | null = null;
  selectedMonth: string | null = null;

  tblData: Record<string, any>[] = [];
  tableHeaders: string[] = [];
  showTabledata: boolean = false;
  noDatafoundCard: boolean = false;
  loading: boolean = false;

  organisationDrpData: Organisation[] = [];
  monthDrpData: Month[] = [];

  ngOnInit(): void {
    this.loadInitialDropdownData();
    this.initializeMenuData();
  }

  private loadInitialDropdownData(): void {
    forkJoin({
      org: this.userService.getQuestionPaper<ApiResponse>('uspGetEmployeeCtcDrp|action=ORG'),
      month: this.userService.getQuestionPaper<ApiResponse>('uspGetEmployeeCtcDrp|action=MONTH')
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ org, month }) => {
          this.organisationDrpData = org?.table ?? [];
          this.monthDrpData = month?.table ?? [];
        },
        error: (err) => {
          console.error('Dropdown Load Error:', err);
        }
      });
  }

  private initializeMenuData(): void {
    const param = sessionStorage.getItem('menuItem');
    if (!param) return;

    try {
      const paramjs = JSON.parse(param);

      this.FormName = paramjs?.formName ?? '';
      this.FormValue = paramjs?.formValue ?? '';
      this.menulabel = paramjs?.menu ?? '';

      this.breadcrumbItems = [
        { label: 'Home', routerLink: '/home' },
        { label: this.menulabel, routerLink: '/payroll-reports' },
        { label: this.FormName }
      ];
    } catch (error) {
      console.error('Session parse error:', error);
    }
  }

  generateReport(form: NgForm): void {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    const { organisation: orgId, month } = form.value;

    this.loading = true;
    this.noDatafoundCard = false;
    this.tblData = [];
    this.tableHeaders = [];

    this.userService
      .getQuestionPaper<ApiResponse>(
        `uspReportSalaryComplianceData|orgId=${orgId}|month=${month}`
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const data = res?.table2 ?? [];

          if (data.length === 0) {
            this.noDatafoundCard = true;
            return;
          }

          this.tblData = data;
          this.tableHeaders = Object.keys(data[0]);
          this.showTabledata = true;
        },
        error: (err) => {
          console.error('Report Load Error:', err);
          this.noDatafoundCard = true;
        },
        complete: () => {
          this.loading = false;
        }
      });
  }

  resetReport(form: NgForm): void {
    form.resetForm();
    this.tblData = [];
    this.tableHeaders = [];
    this.showTabledata = false;
    this.noDatafoundCard = false;
  }

  exportAsXLSX(): void {
    if (this.tblData.length > 0) {
      this.excelService.exportAsExcelFile(this.tblData, 'ESIC_Return_Report');
    }
  }

  trackByFn(index: number): number {
    return index;
  }
}
