
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

// PrimeNG
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DrawerModule } from 'primeng/drawer';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService, MenuItem } from 'primeng/api';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

// Project
import { UserService } from '../../shared/user-service';
import { Customvalidation } from '../../shared/Validation';
import { TableTemplate, TableColumn, Tab } from '../../table-template/table-template';

@Component({
  selector: 'app-attendance-regularization-action',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BreadcrumbModule,
    ButtonModule,
    SelectModule,
    ToastModule,
    ConfirmDialogModule,
    DrawerModule,
    TagModule,
    TooltipModule,
    NgxSpinnerModule,
    TableTemplate
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './attendance-regularization-action.html',
  styleUrl: './attendance-regularization-action.scss'
})
export class AttendanceRegularizationAction implements OnInit {

  // UI State
  breadcrumbItems: MenuItem[] = [];
  activeTab: string = 'pending';
  isLoading = false;
  displayHistory = false;
  approalHistoryData: any = null;

  // Data
  userId = sessionStorage.getItem('userId');
  orgId: string | null = null;
  empId: string | null = null;

  drpOptions: any[] = [];
  selectedEmpId: string = '';

  attendanceRegularizeForm!: FormGroup;
  regAttendanceData: any[] = [];
  processedData: any[] = [];
  regularizeData: any[] = [];

  // Pagination
  pageSize = 10;
  currentPage = 1;
  searchText = '';

  // Flags
  showTableData = false;
  enableSubmitBtn = false;
  noDatafoundCard = false;

  displayData: any[] = [];
  filteredTotal: number = 0;

  // Tabs
  tabs: Tab[] = [
    { label: 'Pending Request', value: 'pending', icon: 'pi pi-clock' },
    { label: 'Processed Request', value: 'proceed', icon: 'pi pi-check-circle' }
  ];

  // Table Columns
  pendingHeaders: TableColumn[] = [
    { key: 'rowNo', header: 'S.No.', isVisible: true },
    { key: 'actions', header: 'History', isVisible: true, isCustom: true },
    { key: 'serialNo', header: 'Serial No.' },
    { key: 'attendDateFormatted', header: 'Date' },
    { key: 'attendDay', header: 'Day' },
    { key: 'in', header: 'In Time' },
    { key: 'out', header: 'Out Time' },
    { key: 'reason', header: 'User Remarks' },
    { key: 'jsonDetails', header: 'Action', isCustom: true },
    { key: 'jsonDetails1', header: 'Remarks', isCustom: true }
  ];

  processedHeaders: TableColumn[] = [
    { key: 'rowNo', header: 'S.No.', isVisible: true },
    { key: 'actions', header: 'Action', isVisible: true, isCustom: true },
    { key: 'serialNo', header: 'Serial No' },
    { key: 'dateLabelFormatted', header: 'Date' },
    { key: 'dayName', header: 'Day' },
    { key: 'in', header: 'In Time' },
    { key: 'out', header: 'Out Time' },
    { key: 'reason', header: 'Remarks' },
    { key: 'jsonDetails', header: 'Status', isCustom: true }
  ];

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private messageService: MessageService,
    private customValidation: Customvalidation,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadSession();
    this.loadBreadcrumb();
    this.getEmployeeDropdown();
  }

  // ================= COMMON =================

  get roleId(): string {
    return JSON.parse(sessionStorage.getItem('currentRole') || '{}')?.roleId;
  }

  private handleApi(call: Observable<any>, success: (res: any) => void) {
    this.isLoading = true;
    this.spinner.show();

    call.subscribe({
      next: (res) => {
        success(res);
        this.isLoading = false;
        this.spinner.hide();
      },
      error: (err) => {
        this.isLoading = false;
        this.spinner.hide();
        this.handleError(err);
      }
    });
  }

  parseJSON(data: any) {
    try {
      return typeof data === 'string' ? JSON.parse(data) : data;
    } catch {
      return [];
    }
  }

  // ================= INIT =================

  loadSession() {
    const user = JSON.parse(sessionStorage.getItem('UserInfo') || '{}');
    this.orgId = user?.orgMasterId || sessionStorage.getItem('Organization');
    this.empId = user?.empId || sessionStorage.getItem('empId');
  }

  initForm() {
    this.attendanceRegularizeForm = this.fb.group({
      status: [''],
      remark: ['']
    });
  }

  loadBreadcrumb() {
    this.breadcrumbItems = [
      { label: 'Home', routerLink: '/home' },
      { label: 'Attendance', routerLink: '/ess' },
      { label: 'Regularization Action' }
    ];
  }

  // ================= API =================

  getEmployeeDropdown() {
    const query = `uspAttendaceRegularizeToBeApprdGetList|UserId=${this.userId}|roleId=${this.roleId}|orgId=${this.orgId}`;

    this.handleApi(
      this.userService.getQuestionPaper(query),
      (res) => {
        this.drpOptions = res.table || [];
        this.getPendingData();
      }
    );
  }

  getPendingData() {
    const query = `uspAttendanceRegularizationGetListPending|UserId=${this.userId}|EmpId=${this.selectedEmpId || 0}|RoleId=${this.roleId}|orgId=${this.orgId}`;

    this.handleApi(
      this.userService.getQuestionPaper(query),
      (res) => {
        this.regAttendanceData = (res.table || []).map((item: any) => {
          const d = item.attendDate ? new Date(item.attendDate) : null;
          return {
            ...item,
            attendDateFormatted: d ? d.toLocaleDateString('en-GB').replace(/\//g, '-') : '',
            active: 0,
            approvalDetail: this.parseJSON(item.approvalDetail)
          };
        });

        this.showTableData = true;
        this.updateDisplayData();
      }
    );

    this.initForm();
  }

  getProcessedData() {
    const query = `uspAttendanceRegularizationGetListProcessed|UserId=${this.userId}|RoleId=${this.roleId}|EmpId=0|orgId=${this.orgId}`;

    this.handleApi(
      this.userService.getQuestionPaper(query),
      (res) => {
        this.processedData = (res.table || []).map((e: any) => {
          const d = e.dateLabel ? new Date(e.dateLabel) : null;
          return {
            ...e,
            dateLabelFormatted: d ? d.toLocaleDateString('en-GB').replace(/\//g, '-') : '',
            approvalDetail: this.parseJSON(e.approvalDetail)
          };
        });
        this.updateDisplayData();
      }
    );
  }

  updateDisplayData() {
    const raw = this.activeTab === 'pending' ? this.regAttendanceData : this.processedData;
    let filtered = raw;

    if (this.searchText) {
      const keys = ['serialNo', 'reason', 'in', 'out'];
      const search = this.searchText.toLowerCase();
      filtered = raw.filter(item =>
        keys.some(k => String(item[k] || '').toLowerCase().includes(search))
      );
    }

    this.filteredTotal = filtered.length;
    const start = (this.currentPage - 1) * this.pageSize;
    this.displayData = filtered.slice(start, start + this.pageSize)
      .map((item, i) => ({ ...item, rowNo: start + i + 1 }));

    this.cdr.detectChanges();
  }

  // ================= TABLE =================

  // Removed getters to fix NG0100 error

  // ================= EVENTS =================

  onTabChange(tab: string) {
    this.activeTab = tab;
    this.currentPage = 1;
    this.searchText = '';

    if (tab === 'proceed') {
      this.getProcessedData();
    } else {
      this.getPendingData();
    }
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.updateDisplayData();
  }

  onPageSizeChange(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
    this.updateDisplayData();
  }

  onSearchChange(val: string) {
    this.searchText = val;
    this.currentPage = 1;
    this.updateDisplayData();
  }

  // ================= ACTION =================

  getRegulaizeRowData(event: any, date: any   , index: number) {
    const status = event.target.value;

    if (!status) {
      this.messageService.add({ severity: 'warn', summary: 'Alert', detail: 'Select Action' });
      return;
    }

    const obj = { absentDate: date, status, remark: '' };
 
    
    const existingIndex = this.regularizeData.findIndex(i => i.absentDate === date);
    existingIndex > -1 ? this.regularizeData[existingIndex] = obj : this.regularizeData.push(obj);

    this.enableSubmitBtn = this.regularizeData.length > 0;
  }

  onChangeRemark(event: any, date: any, index: number) {
    const item = this.regularizeData.find(i => i.absentDate === date);
    if (item) item.remark = event.target.value;
  }

  submitAttendance() {

    const invalid = this.regularizeData.find(i => i.status === '3' && !i.remark);
    if (invalid) {
      this.messageService.add({ severity: 'warn', summary: 'Alert', detail: 'Remark required for reject' });
      return;
    }

    const data = this.regularizeData.map(i =>
      `${i.absentDate.split('T')[0]}^${i.status}^${i.remark || ''}`
    ).toString();

    const query = `UserId=${this.userId}|EmpId=${this.selectedEmpId}|DateRange=${data}|RoleId=${this.roleId}|orgId=${this.orgId}`;

    this.handleApi(
      this.userService.SubmitPostTypeNotification('uspAttendaceRegularizeApprdToBeSubmitted', query, ''),
      (res) => {
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Submitted Successfully' });
        this.regularizeData = [];
        this.enableSubmitBtn = false;
        this.getPendingData();
      }
    );
  }

  openApprovalHistoryModal(data: any) {
    this.approalHistoryData = data;
    this.displayHistory = true;
  }

  getSeverity(code: number) {
    return code === 1 ? 'success' : code === 3 ? 'danger' : 'warn';
  }

  handleError(err: HttpErrorResponse) {
    if (err.status === 403) {
      this.customValidation.loginroute(err.status);
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: err.error?.message || 'Something went wrong'
      });
    }
  }
}
