
import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Breadcrumb } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { UserService } from '../../shared/user-service';
import { Customvalidation } from '../../shared/Validation';
import { HttpErrorResponse } from '@angular/common/http';

import { TableTemplate, TableColumn } from '../../table-template/table-template';
import { DrawerModule } from 'primeng/drawer';

@Component({
  selector: 'app-arrear-report',
  standalone: true,
  imports: [
    Breadcrumb,
    SelectModule,
    ButtonModule,
    FormsModule,
    CommonModule,
    TableTemplate,
    DrawerModule
  ],
  templateUrl: './arrear-report.html',
  styleUrl: './arrear-report.scss'
})

export class ArrearReport implements OnInit {

  @ViewChild('arrearForm') arrearForm!: NgForm;

  showTabledata: boolean = false;
  noDatafoundCard: boolean = false;
  tblData: any[] = [];
  tableHeaders: TableColumn[] = [];
  loading: boolean = false;
  visible: boolean = false;
  isMaximized: boolean = false;
  header: string = 'Search Arrear Report';
  headerIcon: string = 'pi pi-search';

  // Table properties
  pageSize: number = 10;
  pageNo: number = 1;
  totalCount: number = 0;

  constructor(
    private userService: UserService,
    private Customvalidation: Customvalidation,

  ) { }

  breadcrumbItems = [
    { label: 'Home', routerLink: '/' },
    { label: 'Reports', routerLink: '/reports' },
    { label: 'Arrear Report', routerLink: '/reports/arrear-report' }
  ];


  organization: any;
  employee: any;
  month: any;
  year: any;
  param: any;
  FormName: any;
  FormValue: any;
  menulabel: any;

  OrganisationData: any[] = [];
  EmployeeData: any[] = [];
  monthDrpData: any[] = [];
  yearDrpData: any[] = [];


  ngOnInit(): void {
    this.param = sessionStorage.getItem('menuItem');
    if (this.param) {
      let paramjs = JSON.parse(this.param);
      this.FormName = paramjs.formName;
      this.FormValue = paramjs.formValue;
      this.menulabel = paramjs.menu;
    }

    this.getOrgData();
  }

  showDialog() {
    this.visible = true;
    this.isMaximized = false;
  }

  onDrawerHide() {
    this.visible = false;
  }

  toggleMaximize() {
    this.isMaximized = !this.isMaximized;
  }

  getDrawerWidth() {
    return this.isMaximized ? '100%' : '60%';
  }

  resetForm(form?: NgForm) {
    this.organization = null;
    this.employee = null;
    this.month = null;
    this.year = null;
    this.tblData = [];
    this.tableHeaders = [];
    this.showTabledata = false;
    this.noDatafoundCard = false;
    if (form) {
      form.resetForm();
    }
  }


  getOrgData() {
    this.userService.getQuestionPaper('uspGetEmployeeCtcDrp|action=ORG').subscribe((res: any) => {
      this.OrganisationData = res['table'] || [];

      this.userService.getQuestionPaper('uspGetFillDrpDown|table=tblMonthMaster')
        .subscribe((res: any) => {
          this.monthDrpData = res['table'] || [];
        });

      // Load Years
      this.userService.getQuestionPaper('uspGetFillDrpDown|table=tblYearMaster')
        .subscribe((res: any) => {
          this.yearDrpData = res['table'] || [];

        });

    })
  }

  onChangeOrg() {
    this.employee = null;   // reset employee

    if (!this.organization) {
      this.EmployeeData = [];
      return;
    }

    this.userService
      .getQuestionPaper('uspGetEmployeeCtcDrp|action=EMPLOYEE|orgId=' + this.organization)
      .subscribe((res: any) => {
        this.EmployeeData = res['table'] || [];
      });
  }

  searchReport(form: NgForm) {
    this.loading = true;
    if (form.invalid) {
      form.form.markAllAsTouched();
      return;
    }

    let orgId = this.organization;
    let month = this.month ? this.month : 0;
    let year = this.year;
    let emp = this.employee ? this.employee : 0;

    this.showTabledata = true;
    this.visible = false; // Close drawer on search


    this.loading = true; // Ensure loading is true for table template

    this.userService.getQuestionPaper('uspGetArrearReport|orgId=' + orgId + '|year=' + year + '|month=' + month + '|empId=' + emp).subscribe((res: any) => {
      if (!res || Object.keys(res).length === 0 || !res['table'] || res['table'].length === 0) {
        setTimeout(() => {
          this.noDatafoundCard = true;
          this.loading = false;

          this.tblData = [];
          this.totalCount = 0;
        }, 1000);
      }
      else {
        this.tblData = res['table'] || [];
        this.totalCount = this.tblData.length;
        if (this.tblData.length > 0) {
          // Generate columns dynamically
          const firstRow = this.tblData[0];
          this.tableHeaders = Object.keys(firstRow).map(key => ({
            key: key,
            header: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim(), // Simple title case
            isSortable: true,
            isVisible: true
          })).filter(col => !['id', 'org', 'site', 'duration'].includes(col.key)); // Exclude specific columns

          this.noDatafoundCard = false;
          setTimeout(() => {
            this.loading = false;

          }, 1000);
        } else {
          this.noDatafoundCard = true;

        }
      }

    },
      (err: HttpErrorResponse) => {

        if (err.status == 403) {
          this.Customvalidation.loginroute(err.status);
        }
      })
  }
}