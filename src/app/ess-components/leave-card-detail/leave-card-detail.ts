import { Component } from '@angular/core';
import { UserService } from '../../shared/user-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { ExcelService } from '../../shared/excel.service';

@Component({
  selector: 'app-leave-card-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BreadcrumbModule,
    SelectModule,
    DatePickerModule,
    ButtonModule,
    TableModule
  ],
  templateUrl: './leave-card-detail.html',
  styleUrl: './leave-card-detail.scss'
})



export class LeaveCardDetail {

  constructor(
    private userService: UserService,
    private excelService: ExcelService
  ) { }

  menulabel: any;
  formlable: any;
  param: any;

  // Filters
  selectedEmp: any;
  fromDate: Date = new Date(new Date().getFullYear(), 0, 1); // Default to Jan 1st
  toDate: Date = new Date();

  // Data
  empTableData: any[] = [];
  empDrp: any[] = [];
  userId = sessionStorage.getItem('userId');

  // UI State
  showTabledata: boolean = false;
  noDatafoundCard: boolean = false;

  // Summary Info
  eName: string = '';
  eCode: string = '';
  eDepartment: string = '';

  ngOnInit() {
    this.getDropdownEmp();
    this.param = sessionStorage.getItem('menuItem');
    if (this.param) {
      let paramjs = JSON.parse(this.param);
      this.menulabel = paramjs.menu;
      this.formlable = paramjs.formName;
    }
  }

  getDropdownEmp() {
    let roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
    this.userService.getQuestionPaper(`uspGetDepartmentDetail|userId=${this.userId}|roleId=${roleID}`).subscribe(
      (res) => {
        this.empDrp = res['table2'];
      }
    );
  }

  checkData() {
    if (!this.selectedEmp) return;

    this.showTabledata = true;
    this.noDatafoundCard = false;

    // Set summary info from selected employee
    this.eName = this.selectedEmp.employeeName;
    this.eCode = this.selectedEmp.empCode || 'N/A';
    this.eDepartment = this.selectedEmp.department || 'N/A';

    const fDate = this.fromDate.toISOString().split('T')[0];
    const tDate = this.toDate.toISOString().split('T')[0];

    const query = `empId=${this.selectedEmp.id}|fromDate=${fDate}|toDate=${tDate}`;

    this.userService.getQuestionPaper(`uspGetLeaveCardDetail|${query}`).subscribe(res => {
      this.empTableData = res['table'] || [];
      if (this.empTableData.length === 0) {
        this.noDatafoundCard = true;
      }
    });
  }

  exportToExcel() {
    if (this.empTableData.length > 0) {
      this.excelService.exportAsExcelFile(this.empTableData, `Leave_Card_${this.eCode}`);
    }
  }
}
