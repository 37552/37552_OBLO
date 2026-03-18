import { Component, OnInit } from '@angular/core';
import { Breadcrumb } from 'primeng/breadcrumb';
import { UserService } from '../../shared/user-service';
import { ExcelService } from '../../shared/excel.service';
import { SelectModule } from 'primeng/select';
import { FormsModule, NgForm } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-bank-transfer-report',
  standalone: true,
  imports: [
    Breadcrumb,
    SelectModule,
    FormsModule,
    ButtonModule,
    CommonModule,
    TableModule,
    ProgressSpinnerModule
  ],
  templateUrl: './bank-transfer-report.html',
  styleUrl: './bank-transfer-report.scss',
  providers: [ExcelService]
})
export class BankTransferReport implements OnInit {

  param: any;
  FormName: any;
  FormValue: any;
  menulabel: any;

  selectedOrg: string = '';
  selectedMonth: string = '';

  organisationDrpData: any[] = [];
  monthDrpData: any[] = [];

  tblData: any[] = [];
  tableHeaders: string[] = [];

  showTabledata: boolean = false;
  noDatafoundCard: boolean = false;
  loading: boolean = false;


  breadcrumbItems: any[] = [];
  constructor(private userService: UserService, private excelService: ExcelService) { }

  ngOnInit(): void {
    this.param = sessionStorage.getItem("menuItem");
    let paramjs = JSON.parse(this.param);
    this.FormName = paramjs.formName
    this.FormValue = paramjs.formValue
    this.menulabel = paramjs.menu;

    this.breadcrumbItems = [
      { label: 'Home', url: '/' },
      { label: this.FormName, url: '/payroll-reports' },
      { label: this.menulabel, url: '/bank-transfer-report' }
    ];

    this.getOrgData()
    this.getmonthData()

  }

  generateReport(form: NgForm) {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    const payload = {
      orgId: form.value.organisation,
      month: form.value.month
    };

    this.loading = true;
    this.showTabledata = true;
    this.noDatafoundCard = false;

    this.userService.getQuestionPaper(`uspReportSalaryComplianceData|orgId=${payload.orgId}|month=${payload.month}`).subscribe({
      next: (res: any) => {
        if (!res || !res.table2 || res.table2.length === 0) {
          this.noDatafoundCard = true;
          this.tblData = [];
          this.loading = false;
          return;
        }

        this.tblData = res.table2;
        this.tableHeaders = Object.keys(this.tblData[0]);

        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.noDatafoundCard = true;
        this.loading = false;
      }
    });
  }

  resetReport(form: NgForm) {
    form.resetForm();
    this.tblData = [];
    this.showTabledata = false;
    this.noDatafoundCard = false;
  }

  getOrgData() {
    this.userService.getQuestionPaper('uspGetEmployeeCtcDrp|action=ORG').subscribe((res: any) => {
      this.organisationDrpData = res?.table || [];
    });
  }

  getmonthData() {
    this.userService.getQuestionPaper('uspGetEmployeeCtcDrp|action=MONTH').subscribe((res: any) => {
      this.monthDrpData = res?.table || [];
    });
  }

  exportAsXLSX(): void {
    if (this.tblData.length > 0) {
      this.excelService.exportAsExcelFile(this.tblData, 'Bank_Transfer_Report');
    }
  }
  exportAsXLSXCustom(): void {
    this.excelService.exportAsExcelFile(this.tblData, this.FormName.toString());
  }
}
