import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from '../../shared/user-service';
import { Customvalidation } from '../../shared/Validation';
import { TableTemplate, TableColumn } from '../../table-template/table-template';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { Popover } from 'primeng/popover';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Toast } from 'primeng/toast';

@Component({
  selector: 'app-unassigned-requests',
  standalone: true,
  imports: [
    TableTemplate,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    DialogModule,
    ButtonModule,
    SelectModule,
    MultiSelectModule,
    TableModule,
    InputTextModule,
    BreadcrumbModule,
    Popover,
    CheckboxModule,
    ConfirmDialog,
    Toast,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './unassigned-requests.html',
  styleUrl: './unassigned-requests.scss',
})
export class UnassignedRequests implements OnInit {
  @ViewChild('assignEmployeeModal') assignEmployeeModal!: TemplateRef<any>;

  param: any;
  menulabel: string = '';
  formlable: string = '';
  FormName: string = '';
  FormValue: string = '';
  postType: string = 'add';
  isView: boolean = true;
  paramvaluedata: string = '';

  pageNo: number = 1;
  searchText: string = '';
  pageSize: number = 10;
  allViewTableData: any[] = [];
  paginationCountData: any[] = [];
  pageNoData: any[] = [];
  totalCount: number = 0;
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  tableHeaders: string[] = [];
  selectedItem: any = null;
  data: any[] = [];
  allColumns: TableColumn[] = [];
  availableColumns: TableColumn[] = [];
  importantColumns: TableColumn[] = [];
  requiredColumnKeys: Set<string> = new Set();
  selectAllChecked: boolean = false;

  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true },
    { key: 'rowNo', header: 'S.No', isVisible: true, isSortable: false },
  ];

  selectedMachineData: any[] = [];
  showMachineModal: boolean = false;

  selectedAsset: any = null;
  assignForm: FormGroup;
  assignToDrp: any[] = [];
  assignDialogVisible: boolean = false;
  currentUserRole: string = '';
  isLoading: boolean = true;
  dashboardRoute: string = '/';
  breadcrumbItems: any[] = [];
  
  // breadcrumbItems = [
  //   { label: 'Home', routerLink: '/crm-admin-dashboard' },
  //   { label: 'Operations', routerLink: '' },
  //   { label: 'Unassigned Requests', routerLink: '' },
  // ];

  constructor(
    public Customvalidation: Customvalidation,
    private userService: UserService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private confirmationService: ConfirmationService,
    private message: MessageService
  ) {
    this.assignForm = this.fb.group({
      employee: ['', Validators.required],
    });
  }

  userRole: any = '';

  ngOnInit(): void {
    try {
      const userObj = JSON.parse(sessionStorage.getItem('UserInfo') || '{}');
      this.currentUserRole = userObj['currentRoleId'] || '';
      this.userRole = this.currentUserRole;

      this.param = sessionStorage.getItem('menuItem');
      if (this.param) {
        const paramjs = JSON.parse(this.param);
        this.FormName = paramjs.formName || 'Unassigned Requests';
        this.FormValue = paramjs.formValue || '';
        this.menulabel = paramjs.menu || 'Operations';
        // this.breadcrumbItems = [
        //   { label: 'Home', routerLink: '/crm-admin-dashboard' },
        //   { label: this.menulabel, routerLink: '' },
        //   { label: this.FormName, routerLink: '' },
        // ];
      }      
      if (this.currentUserRole == '104') {
        this.dashboardRoute = '/crm-admin-dashboard';
      } else if (this.currentUserRole == '100') {
        this.dashboardRoute = '/service-engineer-dashboard';
      }

      this.breadcrumbItems = [
        { label: 'Home', routerLink: this.dashboardRoute },
        { label: 'Operations', routerLink: '' },
        { label: 'Unassigned Requests', routerLink: '' },
      ];

      this.getViewData(true);
      this.getAssignToData();
    } catch (error) {
      console.error('Error in ngOnInit:', error);
      this.isLoading = false;
    }
    this.cdr.detectChanges();
  }

  refreshData(): void {
    this.pageNo = 1;
    this.searchText = '';
    this.getViewData(true);
    this.cdr.detectChanges();
  }

  getViewData(isTrue: boolean): void {
    try {
      if (isTrue) {
        this.isLoading = true;
      } else {
        this.pageNo = 1;
      }

      const query = `appUserId=${sessionStorage.getItem('userId')}|searchText=${
        this.searchText
      }|pageIndex=${Number(this.pageNo)}|size=${Number(this.pageSize)}`;

      this.userService.getQuestionPaper(`uspGetUnassignedServiceRequestsData|${query}`).subscribe(
        (res: any) => {
          this.allViewTableData = res['table1'] || [];
          this.paginationCountData = res['table'] || [];
          this.pageNoData = res['table2'] || [];

          if (this.allViewTableData.length > 0) {
            this.tableHeaders = Object.keys(this.allViewTableData[0]);
            this.data = this.allViewTableData.map((item: any, index: number) => ({
              ...item,
              rowNo: (this.pageNo - 1) * this.pageSize + index + 1,
            }));

            const dynamicColumns: TableColumn[] = this.tableHeaders
              .filter((h) => h !== 'rowNo' && h !== 'assetDetails' && h !== 'id')
              .map((header) => ({
                key: header,
                header: this.formatKey(header),
                isVisible: false,
                isSortable: false,
              }));

            dynamicColumns.push({
              key: 'assetDetails',
              header: 'Asset Details',
              isVisible: false,
              isSortable: false,
              isCustom: true,
            });

            this.requiredColumnKeys.add('actions');
            this.requiredColumnKeys.add('rowNo');

            const importantCount = 15;
            this.importantColumns = [];
            dynamicColumns.forEach((col, index) => {
              if (index < importantCount && !col.isCustom) {
                col.isVisible = true;
                this.requiredColumnKeys.add(col.key);
                this.importantColumns.push(col);
              }
            });

            this.allColumns = [
              { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true },
              { key: 'rowNo', header: 'S.No', isVisible: true, isSortable: false },
              ...dynamicColumns,
            ];

            this.availableColumns = dynamicColumns.filter(
              (col) => !this.requiredColumnKeys.has(col.key) && !col.isCustom
            );

            this.updateVisibleColumns();
          } else {
            this.data = [];
            this.allColumns = [];
            this.availableColumns = [];
          }

          this.totalCount = this.paginationCountData?.[0]?.totalCnt || 0;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        (err: HttpErrorResponse) => {
          this.isLoading = false;
          if (err.status === 403) {
            this.Customvalidation.loginroute(err.status);
          }
          this.cdr.detectChanges();
        }
      );
    } catch (error) {
      this.isLoading = false;
      console.error('Unexpected error:', error);
      this.cdr.detectChanges();
    }
  }

  getAssignToData(): void {
    this.userService
      .getQuestionPaper(
        `uspGetServiceRequestDropdownData|action=ASSIGNEDTO|appUserId=${sessionStorage.getItem(
          'userId'
        )}`
      )
      .subscribe(
        (res: any) => {
          this.assignToDrp = res['table'] || [];
          this.cdr.detectChanges();
        },
        (err: HttpErrorResponse) => {
          if (err.status === 403) {
            this.Customvalidation.loginroute(err.status);
          }
        }
      );
  }

  formatKey(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }

  onPageChange(newPage: number): void {
    this.pageNo = newPage;
    this.getViewData(true);
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize = newSize;
    this.pageNo = 1;
    this.getViewData(true);
  }

  onSearchChange(search: string): void {
    this.searchText = search;
    this.pageNo = 1;
    this.getViewData(false);
  }

  onSortChange(event: { column: string; direction: 'asc' | 'desc' }): void {
    this.sortColumn = event.column;
    this.sortDirection = event.direction;
    this.getViewData(true);
  }

  updateVisibleColumns(): void {
    this.columns = this.allColumns.filter((col) => col.isVisible);
    this.updateSelectAllState();
    this.cdr.detectChanges();
  }

  toggleColumnVisibility(column: TableColumn): void {
    if (this.requiredColumnKeys.has(column.key)) {
      return;
    }
    column.isVisible = !column.isVisible;
    this.updateVisibleColumns();
    this.cdr.detectChanges();
  }

  getSelectedColumnsCount(): number {
    return (
      this.importantColumns.length + this.availableColumns.filter((col) => col.isVisible).length
    );
  }

  toggleSelectAll(): void {
    if (this.selectAllChecked) {
      this.availableColumns.forEach((col) => {
        if (!this.requiredColumnKeys.has(col.key)) {
          col.isVisible = true;
        }
      });
    } else {
      this.availableColumns.forEach((col) => {
        if (!this.requiredColumnKeys.has(col.key)) {
          col.isVisible = false;
        }
      });
    }
    this.updateVisibleColumns();
    this.cdr.detectChanges();
  }

  updateSelectAllState(): void {
    if (this.availableColumns.length === 0) {
      this.selectAllChecked = false;
      return;
    }
    const selectableColumns = this.availableColumns.filter(
      (col) => !this.requiredColumnKeys.has(col.key)
    );
    this.selectAllChecked =
      selectableColumns.length > 0 && selectableColumns.every((col) => col.isVisible);
  }

  isColumnRequired(col: TableColumn): boolean {
    return this.requiredColumnKeys.has(col.key);
  }

  getSelectedAvailableColumns(): TableColumn[] {
    return this.availableColumns.filter((col) => col.isVisible);
  }

  getUnselectedAvailableColumns(): TableColumn[] {
    return this.availableColumns.filter((col) => {
      return !col.isVisible && !this.requiredColumnKeys.has(col.key);
    });
  }

  viewMachineDetails(row: any): void {
    try {
      if (typeof row === 'string') {
        this.selectedMachineData = JSON.parse(row);
      } else if (Array.isArray(row)) {
        this.selectedMachineData = row;
      } else {
        this.selectedMachineData = [row];
      }
      this.showMachineModal = true;
    } catch (error) {
      console.error('Error parsing machine details:', error);
      this.selectedMachineData = [];
      this.showMachineModal = true;
    }
  }

  closeMachineModal(): void {
    this.showMachineModal = false;
  }

  getModalKeys(obj: any): string[] {
    if (!obj || !Array.isArray(this.selectedMachineData) || this.selectedMachineData.length === 0) {
      return [];
    }
    return Object.keys(this.selectedMachineData[0]);
  }

  showAssignEmployeeModal(item: any): void {
    this.selectedAsset = item;
    this.assignDialogVisible = true;
    this.assignForm.reset();
  }

  closeAssignEmployeeModal(): void {
    this.assignDialogVisible = false;
    this.selectedAsset = null;
    this.assignForm.reset();
  }

  OnSubmitModal(): void {
    if (this.assignForm.invalid) {
      this.assignForm.markAllAsTouched();
      return;
    }

    const form = this.assignForm.value;
    const query = `appUserId=${sessionStorage.getItem('userId')}|ticketId=${
      this.selectedAsset?.id
    }|serviceEngineerId=${form.employee}`;
    const SP = `uspPostServiceTicketAssign`;

    this.isLoading = true;
    this.userService.SubmitPostTypeData(SP, query, this.FormName).subscribe(
      (datacom: any) => {
        this.isLoading = false;
        if (datacom) {
          const resultarray = datacom.split('-');
          if (resultarray[1] === 'success') {
            this.message.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Data Saved Successfully.',
              life: 3000,
            });
            this.getViewData(true);
            this.closeAssignEmployeeModal();
          } else {
            this.message.add({
              severity: 'warn',
              summary: 'Warning',
              detail: resultarray[1] || datacom,
              life: 3000,
            });
          }
        }
        this.cdr.detectChanges();
      },
      (err: HttpErrorResponse) => {
        this.isLoading = false;
        if (err.status === 403) {
          this.Customvalidation.loginroute(err.status);
        } else {
          this.message.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Something went wrong.',
            life: 3000,
          });
        }
        this.cdr.detectChanges();
      }
    );
  }

  selfAssignToEngineer(item: any): void {
    this.selectedAsset = item;
    this.confirmationService.confirm({
      message: 'Are you sure you want to take this request and assign it to yourself?',
      header: 'Confirm?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.OnSubmitSelfAssign();
      },
    });
  }

  OnSubmitSelfAssign(): void {
    this.isLoading = true;
    const query = `appUserId=${sessionStorage.getItem('userId')}|ticketId=${
      this.selectedAsset?.id
    }`;
    const SP = `uspPostServiceTicketSelfAssign`;

    this.userService.SubmitPostTypeData(SP, query, this.FormName).subscribe(
      (datacom: any) => {
        this.isLoading = false;
        if (datacom) {
          const resultarray = datacom.split('-');
          if (resultarray[1] === 'success') {
            this.message.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Request assigned to you.',
              life: 3000,
            });
            this.getViewData(true);
          } else {
            this.message.add({
              severity: 'warn',
              summary: 'Warning',
              detail: resultarray[1] || datacom,
              life: 3000,
            });
          }
        }
        this.cdr.detectChanges();
      },
      (err: HttpErrorResponse) => {
        this.isLoading = false;
        if (err.status === 403) {
          this.Customvalidation.loginroute(err.status);
        } else {
          this.message.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Something went wrong.',
            life: 3000,
          });
        }
        this.cdr.detectChanges();
      }
    );
  }
}
