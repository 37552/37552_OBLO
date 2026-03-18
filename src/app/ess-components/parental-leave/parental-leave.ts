import { Component, OnInit, inject, signal, computed, NgZone, ViewChild, TemplateRef, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormsModule, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

import { BreadcrumbModule } from 'primeng/breadcrumb';
import { DialogModule } from 'primeng/dialog';
import { DrawerModule } from 'primeng/drawer';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ButtonModule } from 'primeng/button';
import { TabsModule } from 'primeng/tabs';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService, ConfirmationService, MenuItem } from 'primeng/api';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';

import { UserService } from '../../shared/user-service';
import { Customvalidation } from '../../shared/Validation';
import { PopoverModule } from 'primeng/popover';
import { TableTemplate, TableColumn, Tab } from '../../table-template/table-template';

@Component({
  selector: 'app-parental-leave',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    BreadcrumbModule,
    DialogModule,
    DrawerModule,
    SelectModule,
    DatePickerModule,
    TextareaModule,
    ToastModule,
    ConfirmDialogModule,
    ButtonModule,
    TableTemplate,
    TabsModule,
    InputTextModule,
    TooltipModule,
    ProgressSpinnerModule,
    NgxSpinnerModule,
    PopoverModule

  ],
  providers: [MessageService, ConfirmationService, DatePipe],
  templateUrl: './parental-leave.html',
  styleUrl: './parental-leave.scss',
})
export class ParentalLeave implements OnInit {
  // Services
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private router = inject(Router);
  private spinner = inject(NgxSpinnerService);
  private msgService = inject(MessageService);
  private confirmService = inject(ConfirmationService);
  private datePipe = inject(DatePipe);
  public customValidation = inject(Customvalidation);

  // UI State Signals
  isLoading = signal(false);
  isDrawerVisible = signal(false);
  postType = signal<'add' | 'update' | 'view'>('add');

  tabs = signal<Tab[]>([
    { label: 'Pending Request', count: 0, value: 'pending', icon: 'pi pi-clock' },
    { label: 'Processed Request', count: 0, value: 'proceed', icon: 'pi pi-check-circle' }
  ]);
  activeTab = signal<string | number>('pending');

  header = signal('');
  headerIcon = signal('');

  // Table Signals
  allViewTableData = signal<any[]>([]);
  totalCount = signal(0);
  pageNo = signal(1);
  pageSize = signal(10);
  searchText = signal('');

  // Breadcrumb
  breadcrumbItems = signal<MenuItem[]>([]);
  FormName = signal('');
  menulabel = signal('');

  // Dropdown Data
  leaveTypeDrp = signal<any[]>([]);
  ccDrp = signal<any[]>([]);
  sessionDrp = signal<any[]>([]);
  leaveStatus = signal('');

  // Permissions & Workflow
  wfId = signal<string | null>(null);
  wfLevel = signal<string | null>(null);
  isApprove = signal(0);
  isForward = signal(0);
  isReject = signal(0);
  isReturn = signal(0);
  isSave = signal(0);
  isCreator = signal(false);

  // Modals / Dialogs
  displayApprovalDialog = signal(false);
  displayHistoryDialog = signal(false);
  displayFileUpload = signal(false);

  selectedItem = signal<any>(null);
  approalHistoryData = signal<any>(null);
  approvalRemarks = signal('');
  isValidRemark = signal(true);

  // Form
  parentalLeaveForm: FormGroup;

  // File Upload State
  selectedFileNames = signal<string[]>([]);
  filesToUpload: File[] = [];

  constructor() {
    this.parentalLeaveForm = this.fb.group({
      leaveType: ['', Validators.required],
      dateFrom: [null, Validators.required],
      dateTo: [null, Validators.required],
      ccTo: [''],
      remarks: [''],
      attachment: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadMenuParams();
    this.getPermissions();
    this.getTableData(true);
    this.getDropdownData();
    this.updateTabCounts();
  }

  // ─── Data Loading ───────────────────────────────────────

  private loadMenuParams() {
    const paramStr = sessionStorage.getItem('menuItem');
    if (paramStr) {
      const params = JSON.parse(paramStr);
      this.FormName.set(params.formName);
      this.menulabel.set(params.menu);

      this.breadcrumbItems.set([
        { label: 'Home', icon: 'pi pi-home', routerLink: '/home' },
        { label: params.menu },
        { label: params.formName }
      ]);
    }
  }

  getPermissions() {
    const roleId = this.getCurrentRoleId();
    this.userService
      .getQuestionPaper(`uspGetPermissionByactivity_role|actitvityName=${this.FormName()}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${roleId}`)
      .subscribe({
        next: (res: any) => {
          const data = res.table?.[0];
          if (data) {
            this.wfId.set(data.wfId);
            this.wfLevel.set(data.wfLevel);
            this.isApprove.set(data.wfApprove);
            this.isForward.set(data.wfForword);
            this.isReject.set(data.wfReject);
            this.isReturn.set(data.wfReturn);
            this.isSave.set(data.wfSave);
          }
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 403) this.customValidation.loginroute(err.status);
        }
      });
  }

  getTableData(showLoader: boolean = false) {
    if (showLoader) this.spinner.show();
    this.isLoading.set(true);

    const roleId = this.getCurrentRoleId();
    const procedure = this.activeTab() === 'pending' ? 'uspGetParentalLeaveDetail' : 'uspGetParentalLeaveProcessed';
    const query = `orgId=${sessionStorage.getItem('Organization')}|appUserId=${sessionStorage.getItem('userId')}|districtId=${sessionStorage.getItem('District')}|searchText=${this.searchText()}|pageIndex=${this.pageNo()}|size=${this.pageSize()}|appUserRole=${roleId}`;

    this.userService.getQuestionPaper(`${procedure}|${query}`).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        this.isLoading.set(false);

        const data = res['table1'] || [];
        this.allViewTableData.set(data.map((item: any) => ({
          ...item,
          approvalDetail: typeof item.approvalDetail === 'string' ? JSON.parse(item.approvalDetail) : item.approvalDetail
        })));

        this.totalCount.set(res['table']?.[0]?.totalCount || this.allViewTableData().length);
        this.isCreator.set(res['table4']?.[0]?.wfLevel === 'Creator');

        // Update count for current tab
        const currentTabs = this.tabs();
        const activeIdx = currentTabs.findIndex(t => t.value === this.activeTab());
        if (activeIdx > -1) {
          currentTabs[activeIdx].count = this.totalCount();
          this.tabs.set([...currentTabs]);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.spinner.hide();
        this.isLoading.set(false);
        if (err.status === 403) this.customValidation.loginroute(err.status);
      }
    });
  }

  getDropdownData() {
    this.userService.getQuestionPaper(`uspLeaveApplyGetDrp|UserId=${sessionStorage.getItem('userId')}`).subscribe((res: any) => {
      this.sessionDrp.set(res['table3'] || []);
      this.leaveTypeDrp.set((res['table4'] || []).map((opt: any) => ({ label: opt.drpOption, value: opt.drpValue })));
      this.ccDrp.set((res['table2'] || []).map((opt: any) => ({ label: opt.drpOption, value: opt.drpValue })));
      this.leaveStatus.set(res['table1']?.[0]?.drpValue || '');
    });
  }

  updateTabCounts() {
    const roleId = this.getCurrentRoleId();
    const query = `orgId=${sessionStorage.getItem('Organization')}|appUserId=${sessionStorage.getItem('userId')}|districtId=${sessionStorage.getItem('District')}|searchText=|pageIndex=1|size=1|appUserRole=${roleId}`;

    // Pending Count
    this.userService.getQuestionPaper(`uspGetParentalLeaveDetail|${query}`).subscribe((res: any) => {
      const count = res['table']?.[0]?.totalCount || 0;
      const t = this.tabs();
      t[0].count = count;
      this.tabs.set([...t]);
    });

    // Processed Count
    this.userService.getQuestionPaper(`uspGetParentalLeaveProcessed|${query}`).subscribe((res: any) => {
      const count = res['table']?.[0]?.totalCount || 0;
      const t = this.tabs();
      t[1].count = count;
      this.tabs.set([...t]);
    });
  }

  // ─── Actions ─────────────────────────────────────────────

  onTabChange(tab: any) {
    this.activeTab.set(tab);
    this.pageNo.set(1);
    this.getTableData(true);
  }

  toggleView(mode: 'add' | 'update' | 'view') {
    this.postType.set(mode);
    this.header.set(mode === 'add' ? 'Add Parental Leave' : mode === 'update' ? 'Update Parental Leave' : 'View Parental Leave');
    this.headerIcon.set(mode === 'add' ? 'pi pi-plus' : mode === 'update' ? 'pi pi-pencil' : 'pi pi-eye');

    if (mode === 'add') {
      this.parentalLeaveForm.reset();
      this.parentalLeaveForm.enable();
    }
    this.isDrawerVisible.set(true);
  }

  onDrawerHide() {
    this.isDrawerVisible.set(false);
    this.parentalLeaveForm.reset();
  }

  goBackToTable() {
    this.isDrawerVisible.set(false);
    this.parentalLeaveForm.reset();
    this.getTableData(true);
  }

  getViewDetails(item: any, mode: 'view' | 'update') {
    this.selectedItem.set(item);
    this.postType.set(mode);
    this.header.set(mode === 'update' ? 'Update Parental Leave' : 'View Parental Leave');
    this.headerIcon.set(mode === 'update' ? 'pi pi-pencil' : 'pi pi-eye');

    this.parentalLeaveForm.patchValue({
      leaveType: item.leaveTypeId || item.leaveType,
      dateFrom: item.dateFrom ? new Date(item.dateFrom) : null,
      dateTo: item.dateTo ? new Date(item.dateTo) : null,
      remarks: item.reason,
      attachment: item.document,
      ccTo: item.ccTo || item.cc
    });

    if (mode === 'view') {
      this.parentalLeaveForm.disable();
    } else {
      this.parentalLeaveForm.enable();
    }
    this.isDrawerVisible.set(true);
  }

  selectLeaveType(val: any) {
    if (this.postType() === 'view') return;
    this.parentalLeaveForm.get('leaveType')?.setValue(val);
  }

  exportAsXLSXCustom() {
    // Legacy export logic if needed, or placeholders
    this.msgService.add({ severity: 'info', summary: 'Export', detail: 'Exporting data...' });
  }

  // ─── Form Submission ─────────────────────────────────────

  onFormSubmit() {
    if (this.parentalLeaveForm.invalid) {
      this.parentalLeaveForm.markAllAsTouched();
      this.msgService.add({ severity: 'error', summary: 'Error', detail: 'Please fill all required fields' });
      return;
    }

    this.confirmService.confirm({
      message: 'Are you sure you want to proceed?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.executeSubmit()
    });
  }

  private executeSubmit() {
    this.spinner.show();
    const val = this.parentalLeaveForm.value;
    const orgId = sessionStorage.getItem('Organization');
    const userId = sessionStorage.getItem('userId');
    const roleId = this.getCurrentRoleId();

    const dateFrom = this.datePipe.transform(val.dateFrom, 'yyyy-MM-dd');
    const dateTo = this.datePipe.transform(val.dateTo, 'yyyy-MM-dd');

    const params = `leaveStatus=${this.leaveStatus()}|leaveType=${val.leaveType}|leaveReason=${val.remarks || ''}|ccTo=${val.ccTo || ''}|dateFrom=${dateFrom}|dateTo=${dateTo}|document=${val.attachment}`;

    let query = ``;
    let SP = ``;

    if (this.postType() === 'update') {
      query = `id=${this.selectedItem().id}|orgid=${orgId}|${params}|appUserId=${userId}|appUserRole=${roleId}|activity=${this.FormName()}|districtId=${sessionStorage.getItem('District')}`;
      SP = `uspUpdateLeaveApplication`;
    } else {
      query = `${params}|orgid=${orgId}|appUserId=${userId}|appUserRole=${roleId}|activity=${this.FormName()}|districtId=${sessionStorage.getItem('District')}`;
      SP = `uspPostLeaveApplication`;
    }

    this.userService.SubmitPostTypeData(SP, query, this.FormName()).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        if (res.includes('success')) {
          this.msgService.add({ severity: 'success', summary: 'Success', detail: 'Request submitted successfully' });
          this.goBackToTable();
        } else {
          this.msgService.add({ severity: 'warn', summary: 'Alert', detail: res });
        }
      },
      error: (err) => {
        this.spinner.hide();
        this.msgService.add({ severity: 'error', summary: 'Error', detail: 'Something went wrong' });
      }
    });
  }

  // ─── Workflow Actions ─────────────────────────────────────

  openApprovalModal(item: any) {
    this.selectedItem.set(item);
    this.approvalRemarks.set('');
    this.isValidRemark.set(true);
    this.displayApprovalDialog.set(true);
  }

  onApprovalDecision(action: string) {
    const remark = this.approvalRemarks().trim();
    if ((action === 'Reject' || action === 'Return') && !remark) {
      this.isValidRemark.set(false);
      return;
    }

    this.confirmService.confirm({
      message: `Are you sure you want to ${action}?`,
      header: 'Confirmation',
      accept: () => this.executeWorkflowAction(action)
    });
  }

  private executeWorkflowAction(action: string) {
    this.spinner.show();
    const wfStatusId = this.getWfStatusId(action);
    const roleId = this.getCurrentRoleId();
    const orgId = sessionStorage.getItem('Organization');
    const userId = sessionStorage.getItem('userId');

    const query = `orgid=${orgId}|appUserId=${userId}|approvalRemarks=${this.approvalRemarks()}|id=${this.selectedItem().id}|appUserRole=${roleId}|activity=${this.FormName()}|wfStatusId=${wfStatusId}`;

    this.userService.SubmitPostTypeData(`uspPostParentalLeaveApproval`, query, this.FormName()).subscribe({
      next: (res: any) => {
        this.spinner.hide();
        if (res.includes('success')) {
          this.msgService.add({ severity: 'success', summary: 'Success', detail: `Request ${action}ed` });
          this.displayApprovalDialog.set(false);
          this.getTableData(true);
        } else {
          this.msgService.add({ severity: 'warn', summary: 'Alert', detail: res });
        }
      },
      error: () => this.spinner.hide()
    });
  }

  // ─── File Handling ─────────────────────────────────────

  onFileSelect(event: any) {
    this.filesToUpload = Array.from(event.target.files);
    this.selectedFileNames.set(this.filesToUpload.map(f => f.name));
  }

  uploadFile() {
    if (this.filesToUpload.length === 0) return;

    this.spinner.show();
    this.userService.MastrtfileuploadNew(this.filesToUpload, 'parentalLeaveDoc').subscribe({
      next: (res: any) => {
        this.spinner.hide();
        const parts = res.split('-');
        if (parts[0] === '1') {
          this.parentalLeaveForm.patchValue({ attachment: parts[1] });
          this.msgService.add({ severity: 'success', summary: 'Uploaded', detail: 'File uploaded successfully' });
          this.displayFileUpload.set(false);
        } else {
          this.msgService.add({ severity: 'error', summary: 'Error', detail: parts[1] });
        }
      },
      error: () => this.spinner.hide()
    });
  }

  viewAttachment(url: string) {
    if (url) {
      window.open('https://elocker.nobilitasinfotech.com/' + url, '_blank');
    } else {
      this.msgService.add({ severity: 'warn', summary: 'Alert', detail: 'File not found' });
    }
  }

  removeAttachment() {
    this.parentalLeaveForm.patchValue({ attachment: '' });
    this.selectedFileNames.set([]);
    this.filesToUpload = [];
  }

  // ─── Helpers ───────────────────────────────────────────

  private getCurrentRoleId(): string {
    const role = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
    return role.roleId || '';
  }

  private getWfStatusId(action: string): number {
    switch (action) {
      case 'Approve': return 1;
      case 'Forward': return 6;
      case 'Reject': return 3;
      case 'Return': return 4;
      default: return 0;
    }
  }

  openApprovalHistory(item: any) {
    this.approalHistoryData.set(item);
    this.displayHistoryDialog.set(true);
  }

  // Table events
  onPageChange(event: any) {
    this.pageNo.set(event.first / event.rows + 1);
    this.pageSize.set(event.rows);
    this.getTableData(false);
  }

  onSearchChange(text: string) {
    this.searchText.set(text);
    this.pageNo.set(1);
    this.getTableData(false);
  }

  // Table headers based on requirements
  get tableColumns(): TableColumn[] {
    return [
      { key: 'actions', header: 'Action', isVisible: true, isCustom: true },
      { key: 'serialNo', header: 'Serial No', isVisible: true, isSortable: true },
      { key: 'empName', header: 'Employee', isVisible: true, isSortable: true },
      { key: 'organisation', header: 'Organisation', isVisible: true, isSortable: true },
      { key: 'department', header: 'Department', isVisible: true, isSortable: true },
      { key: 'designation', header: 'Designation', isVisible: true, isSortable: true },
      { key: 'gender', header: 'Gender', isVisible: true, isSortable: true },

      { key: 'leaveType', header: 'Leave Type', isVisible: true, isSortable: true },
      { key: 'leaveStatus', header: 'Leave Status', isVisible: true, isSortable: true },
      { key: 'dateFrom', header: 'Date From', isVisible: true, isSortable: true, },
      { key: 'dateTo', header: 'Date To', isVisible: true, isSortable: true, },
      { key: 'cc', header: 'CC To', isVisible: true, isSortable: true },
      { key: 'reason', header: 'Reason', isVisible: true },
    ];
  }
}
