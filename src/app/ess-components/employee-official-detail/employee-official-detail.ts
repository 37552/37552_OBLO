import { Component, OnInit } from '@angular/core';
import { UserService } from '../../shared/user-service';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { LoadingService } from '../../shared/loading.service';
import { TableTemplate } from '../../table-template/table-template';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { NoDataFound } from "../../no-data-found/no-data-found";

@Component({
  selector: 'app-employee-official-detail',
  standalone: true,
  imports: [
    BreadcrumbModule,
    TableTemplate,
    CommonModule,
    ToastModule,
    ButtonModule,
    FormsModule,
    InputTextModule,
    NoDataFound
  ],
  providers: [MessageService],
  templateUrl: './employee-official-detail.html',
  styleUrl: './employee-official-detail.scss',
})
export class EmployeeOfficialDetail implements OnInit {
  constructor(
    private userService: UserService,
    private loadingService: LoadingService,
    private messageService: MessageService,
  ) { }

  userId = sessionStorage.getItem('userId');
  param: any;
  menulabel: string = '';
  formlable: string = '';
  breadcrumbItems: any[] = [];

  showTabledata = false;
  allEmpTableData: any[] = [];
  empTableData: any[] = [];
  tableHeaders: any[] = [];
  noDatafoundCard = false;
  isLoading = false;

  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  tableSearchText: string = '';

  searchText: string = '';
  pageNo: number = 1;
  pageSize: number = 10;
  totalCount: number = 0;

  ngOnInit() {
    this.param = sessionStorage.getItem('menuItem');
    if (this.param) {
      const paramjs = JSON.parse(this.param);
      this.menulabel = paramjs.menu;
      this.formlable = paramjs.formName;
    }

    this.breadcrumbItems = [
      { label: 'Home', routerLink: '/home' },
      { label: this.menulabel },
      { label: this.formlable },
    ];
  }

  showAllEmployees() {
    let searchVal = this.searchText.trim();
    // if (searchVal === '') {
    //   searchVal = '0';
    // }

    this.isLoading = true;
    this.loadingService.startLoading();
    this.showTabledata = true;
    this.noDatafoundCard = false;

    this.userService
      .getQuestionPaper('uspEmployeeOfficialDetail|filterText=' + searchVal)
      .subscribe(
        (res: any) => {
          this.allEmpTableData = res['table'] || [];

          if (this.allEmpTableData.length > 0) {
            const dynamicCols = Object.keys(this.allEmpTableData[0])
              .filter((key) => key.toLowerCase() !== 'id' && key.toLowerCase() !== 'profile')
              .map((key) => {
                const header = key
                  .split(/(?=[A-Z])|_/)
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ');
                return {
                  key: key,
                  header: header,
                  isVisible: true,
                  isSortable: true,
                  isCustom: false,
                };
              });

            this.tableHeaders = [
              { key: 'rowNo', header: 'S.No', isVisible: true, isSortable: true },
              ...dynamicCols,
            ];

            this.allEmpTableData = this.allEmpTableData.map((item, index) => ({
              ...item,
              rowNo: index + 1,
            }));

            this.noDatafoundCard = false;
          } else {
            this.noDatafoundCard = true;
          }
          this.isLoading = false;
          this.loadingService.stopLoading();

          this.pageNo = 1;
          this.applyModifications();
        },
        (err: any) => {
          this.isLoading = false;
          this.loadingService.stopLoading();
          this.noDatafoundCard = true;
          if (err.status === 403) {
            // handle 403 login route if Customvalidation service is required
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to fetch employee details.',
            });
          }
        },
      );
  }

  onSearchData() {
    if (!this.searchText.trim()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation',
        detail: 'Please enter name or email.',
      });
      return;
    }
    this.pageNo = 1;
    this.showAllEmployees();
  }

  onReset() {
    this.searchText = '';
    this.pageNo = 1;
    this.showAllEmployees();
  }

  applyModifications() {
    let filteredData = [...this.allEmpTableData];

    if (this.tableSearchText) {
      const lowerSearch = this.tableSearchText.toLowerCase();
      filteredData = filteredData.filter((item) => {
        return Object.values(item).some(
          (val) => val && val.toString().toLowerCase().includes(lowerSearch),
        );
      });
    }

    if (this.sortColumn) {
      filteredData.sort((a, b) => {
        let valA = a[this.sortColumn];
        let valB = b[this.sortColumn];
        if (valA == null) valA = '';
        if (valB == null) valB = '';

        if (typeof valA === 'string' && typeof valB === 'string') {
          return this.sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    this.totalCount = filteredData.length;

    const startIndex = (this.pageNo - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.empTableData = filteredData.slice(startIndex, endIndex);
  }

  // --- Table Template Event Handlers ---
  onPageChange(newPage: number) {
    this.pageNo = newPage;
    this.applyModifications();
  }

  onPageSizeChange(newSize: number) {
    this.pageSize = newSize;
    this.pageNo = 1;
    this.applyModifications();
  }

  onSearchChange(search: string) {
    this.tableSearchText = search;
    this.pageNo = 1;
    this.applyModifications();
  }

  onSortChange(event: { column: string; direction: 'asc' | 'desc' }) {
    this.sortColumn = event.column;
    this.sortDirection = event.direction;
    this.applyModifications();
  }
}
