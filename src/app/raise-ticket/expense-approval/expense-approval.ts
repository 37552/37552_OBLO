import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { UserService } from '../../shared/user-service';
import { Customvalidation } from '../../shared/Validation';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { TableTemplate, TableColumn } from '../../table-template/table-template';
import { PopoverModule } from 'primeng/popover';
import { Router } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { DrawerModule } from 'primeng/drawer';

@Component({
  selector: 'app-expense-approval',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    BreadcrumbModule,
    ButtonModule,
    TableTemplate,
    PopoverModule,
    DialogModule,
    DrawerModule,
    ConfirmDialogModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './expense-approval.html',
  styleUrl: './expense-approval.scss',
})
export class ExpenseApproval implements OnInit {
  dataDialogRef: MatDialogRef<any> | null = null;
  @ViewChild('dataDialogTemplate1') dataDialogTemplate1!: TemplateRef<any>;
  @ViewChild('dataDialogTemplate3') dataDialogTemplate3!: TemplateRef<any>;

  breadcrumbItems: any[] = [
    { label: 'Home', title: 'Home' },
    { label: 'Raise Ticket', routerLink: '/raise-ticket', title: 'Raise Ticket' },
    { label: 'Expense Approval', routerLink: '/expense-approval', title: 'Expense Approval' },
  ];
  isView: boolean = true;
  pageSize: number = 10;
  pageNo: number = 1;
  totalCount: number = 0;
  historyList: any = [];
  searchText: string = '';
  pageNoData: any = [];
  showDeleteBtn: any = null;
  showActiveBtn: any = null;
  visibleDataDialog: boolean = false;
  constructor(
    private userService: UserService,
    public Customvalidation: Customvalidation,
    public dialog: MatDialog,
    private messageService: MessageService,
    private router: Router,
    private confirmationService: ConfirmationService
  ) {}
  param: string | null = null;
  menulabel: any;
  formlable: any;
  viewData: any[] = [];
  selectedItem: any = null;
  remarks: string = '';
  currentRole: Number = 0;
  showAdminHistoryModal = false;
  showFinanceHistoryModal = false;
  status: string = '';
  wfStatusId: number = 0;
  statusLabel: string = '';
  conveyanceChildData: any[] = [];
  lodgingChildData: any[] = [];
  laundryChildData: any[] = [];
  otherExpenseChildData: any[] = [];
  foodExpChildData: any;
  paginationCountData: any = [];
  imprestHistory: any[] = [];
  visibleViewDialog: boolean = false;
  visibleImprestHistoryDrawer: boolean = false;
  isViewMode: boolean = false;

  // table-template helpers
  isLoading = false;

  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true },
    { key: 'sno', header: 'S.No', isVisible: true, isSortable: false },
    { key: 'reqNo', header: 'Request Number', isVisible: true, isSortable: false },
    { key: 'text', header: 'Request Type', isVisible: true, isSortable: false },
    { key: 'employeeName', header: 'Employee Name', isVisible: true, isSortable: false },
    { key: 'fromDate', header: 'From Date', isVisible: true, isSortable: false },
    { key: 'toDate', header: 'To Date', isVisible: true, isSortable: false },
    { key: 'purpose', header: 'Purpose', isVisible: true, isSortable: false },
    { key: 'imprest', header: 'Imprest', isVisible: true, isSortable: false },
    { key: 'approvedImprest', header: 'Approved Imprest', isVisible: true, isSortable: false },
    { key: 'approvedStatus', header: 'Approval Status', isVisible: true, isSortable: false },
  ];

  ngOnInit(): void {
    this.param = sessionStorage.getItem('menuItem');
    const paramjs = this.param ? JSON.parse(this.param) : null;
    if (paramjs) {
      this.menulabel = paramjs.menu;
      this.formlable = paramjs.formName;
    }

    // Fallback: If formlable is not set, use default value
    if (!this.formlable) {
      this.formlable = 'Expense Approval';
      console.warn('Form name not found in sessionStorage, using default: Expense Approval');
    }

    this.onView();
  }

  goBack(): void {
    this.router.navigate(['/raise-ticket']);
  }
  openDataDialog(data: any) {
    // Auto-bind approvedImprest from data
    const requestedImprest = Number(data.imprest) || 0;
    const existingApprovedImprest = Number(data.approvedImprest) || 0;

    // Auto-bind: if approvedImprest exists (even if 0), use it; otherwise use requested imprest as default
    const approvedImprestValue =
      data.approvedImprest !== null && data.approvedImprest !== undefined
        ? existingApprovedImprest
        : requestedImprest;

    this.selectedItem = {
      ...data,
      approvedImprest: String(approvedImprestValue),
      imprest: requestedImprest,
    };
    this.status = '';
    this.remarks = '';
    this.visibleDataDialog = true;
  }

  onApprovedImprestChange(event: any) {
    const value = event.target.value;
    const requestedImprest = Number(this.selectedItem?.imprest) || 0;
    const enteredValue = Number(value) || 0;

    // If entered value is greater than requested, prevent it and set to requested amount
    if (enteredValue > requestedImprest) {
      this.selectedItem.approvedImprest = String(requestedImprest);
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: `Approved Imprest cannot exceed Requested Imprest (₹${requestedImprest})`,
      });
    }
    // Allow any value less than or equal to requested (including 0)
  }

  onApprovedImprestKeyPress(event: KeyboardEvent) {
    const charCode = event.charCode;
    // Allow only numbers
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
      return;
    }

    // Get current value and check if adding this digit would exceed max
    const currentValue = (event.target as HTMLTextAreaElement).value || '';
    const newValue = currentValue + String.fromCharCode(charCode);
    const requestedImprest = Number(this.selectedItem?.imprest) || 0;
    const enteredValue = Number(newValue) || 0;

    // Prevent typing if it would exceed requested imprest
    if (enteredValue > requestedImprest) {
      event.preventDefault();
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: `Approved Imprest cannot exceed Requested Imprest (₹${requestedImprest})`,
      });
    }
  }

  onView() {
    this.currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
    this.getViewData();
  }

  getViewData(isInitial: boolean = false) {
    try {
      if (isInitial) {
        this.pageNo = 1;
      }
      this.isLoading = true;
      const userRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
      const appUserId = sessionStorage.getItem('userId');
      const districtId = sessionStorage.getItem('District');
      const encodedSearchText = this.searchText;
      const procedure = 'uspGetExpenseRequestManager';
      const query = `searchText=${encodedSearchText}|pageIndex=${Number(this.pageNo)}|size=${Number(
        this.pageSize
      )}|districtId=${districtId}|appUserId=${appUserId}|appUserRole=${userRole}`;
      this.userService.getQuestionPaper(`${procedure}|${query}`).subscribe(
        (res: any) => {
          if (!res || Object.keys(res).length === 0 || !res['table1']?.length) {
            this.viewData = [];
            this.totalCount = 0;
            this.isLoading = false;
            return;
          }
          const rawData = res['table1'] as any[];
          this.viewData = rawData.map((item: any, idx: number) => ({
            ...item,
            sno: idx + 1 + (this.pageNo - 1) * this.pageSize,
            approvedImprest: Number(item.approvedImprest) || 0,
            approvalDetail: item.approvalDetail ? JSON.parse(item.approvalDetail) : [],
            ticketDetails: item.ticketDetails ? JSON.parse(item.ticketDetails) : [],
          }));
          this.paginationCountData = res['table'] || [];
          this.pageNoData = res['table2'] || [];
          this.totalCount =
            res['table']?.[0]?.totalCount ??
            res['table']?.[0]?.totalCnt ??
            (Array.isArray(rawData) ? rawData.length : 0);

          if (res['table3'] && res['table3'].length) {
            this.showDeleteBtn = res['table3'][0]['deleteBtn'];
            this.showActiveBtn = res['table3'][0]['activeBtn'];
          }
          this.isLoading = false;
        },
        (err: HttpErrorResponse) => {
          this.isLoading = false;
          if (err.status === 403) {
            this.Customvalidation.loginroute(err.status);
          } else {
            console.error('API Error:', err);
          }
        }
      );
    } catch (error) {
      this.isLoading = false;
      console.error('Unexpected error:', error);
    }
  }

  // table-template events
  onPageChange(page: number): void {
    this.pageNo = page;
    this.getViewData();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.pageNo = 1;
    this.getViewData();
  }

  onSearchChange(search: string): void {
    this.searchText = search || '';
    this.pageNo = 1;
    this.getViewData();
  }

  shouldDisableImprestButton(data: any): boolean {
    if (!data?.imprestHistory) return false;

    try {
      const history = JSON.parse(data.imprestHistory);
      const first = history[0];

      return first?.imprestFor === 'Initial' && first?.Status === '';
    } catch (e) {
      console.error('Invalid JSON in imprestHistory', e);
      return false;
    }
  }

  openViewDetailsModal(data: any) {
    // Open view-only dialog (read-only mode)
    this.selectedItem = { ...data };
    this.isViewMode = true;
    this.visibleViewDialog = true;
  }

  closeViewDialog() {
    this.visibleViewDialog = false;
    this.selectedItem = null;
    this.isViewMode = false;
  }

  openViewModal(data: any) {
    // Only allow opening approval dialog if status is Pending
    if (data.approvedStatus !== 'Pending') {
      this.messageService.add({
        severity: 'warn',
        summary: 'Not Allowed',
        detail: 'Approval is only allowed for requests with Pending status.',
      });
      return;
    }
    this.openDataDialog(data);
  }
  openApprovalModal(data: any) {
    const reimbDetailsArray = JSON.parse(data.reimbDetails);
    this.selectedItem = reimbDetailsArray[0];
    this.conveyanceChildData = this.selectedItem.conveyenceDetail
      ? this.selectedItem.conveyenceDetail
      : [];
    this.lodgingChildData = this.selectedItem.laudgingDetail
      ? this.selectedItem.laudgingDetail
      : [];
    this.foodExpChildData = this.selectedItem.foofExpDetail ? this.selectedItem.foofExpDetail : [];
    this.laundryChildData = this.selectedItem.laundryExpDetail
      ? this.selectedItem.laundryExpDetail
      : [];
    this.otherExpenseChildData = this.selectedItem.otherExpDetail
      ? this.selectedItem.otherExpDetail
      : [];

    const element = document.getElementById('navbar');
    if (element) {
      element.scrollIntoView();
    }

    this.dataDialogRef = this.dialog.open(this.dataDialogTemplate1, {
      disableClose: false,
      width: '50%',
      height: 'auto',
      hasBackdrop: true,
      panelClass: 'update-modal',
    });

    this.dataDialogRef.afterClosed().subscribe((result) => {
      this.selectedItem = null;
      this.conveyanceChildData = [];
      this.lodgingChildData = [];
      this.foodExpChildData = [];
      this.laundryChildData = [];
      this.otherExpenseChildData = [];
    });
  }
  openImprestModal(data: any) {
    this.selectedItem = data;
    if (data?.imprestHistory) {
      try {
        this.historyList = JSON.parse(data.imprestHistory).map((item: any) => ({
          ...item,
          originalStatus: item.Status || '',
          Status: item.Status || '',
        }));
      } catch (e) {
        console.error('Invalid JSON in imprestHistory', e);
        this.historyList = [];
      }
    } else {
      this.historyList = [];
    }
    this.visibleImprestHistoryDrawer = true;
  }

  closeImprestHistoryDrawer() {
    this.visibleImprestHistoryDrawer = false;
    this.selectedItem = null;
    this.historyList = [];
  }
  hasReimbDetails(data: any): boolean {
    try {
      const reimbDetailsArray = JSON.parse(data.reimbDetails);
      return Array.isArray(reimbDetailsArray) && reimbDetailsArray.length > 0;
    } catch (e) {
      return false;
    }
  }

  closeDataDialog() {
    this.visibleDataDialog = false;
    this.selectedItem = null;
    this.status = '';
    this.remarks = '';
    if (this.dataDialogRef) {
      this.dataDialogRef.close();
      this.dataDialogRef = null;
    }
  }

  resetForm() {
    if (this.selectedItem) {
      const requestedImprest = Number(this.selectedItem.imprest) || 0;
      this.selectedItem.approvedImprest = String(requestedImprest);
    }
    this.status = '';
    this.remarks = '';
  }

  openConfirmDialog(title: string, message: string, onAccept: () => void): void {
    this.confirmationService.confirm({
      message: message,
      header: title,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-primary',
      rejectButtonStyleClass: 'p-button-secondary',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        onAccept();
      },
      reject: () => {
        // User cancelled, do nothing
      },
    });
  }

  allowOnlyNumbers(event: KeyboardEvent) {
    const charCode = event.charCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  getNumber(value: any): number {
    return Number(value) || 0;
  }

  onSubmit() {
    this.messageService.add({
      severity: 'warn',
      summary: 'Validation',
      detail: 'Please fill all required fields before submitting.',
    });

    // Convert approvedImprest to number for validation
    const approvedImprest = Number(this.selectedItem?.approvedImprest) || 0;
    const requestedImprest = Number(this.selectedItem?.imprest) || 0;

    // Validation: Approved Imprest cannot exceed Requested Imprest
    if (approvedImprest > requestedImprest) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: `Approved Imprest (₹${approvedImprest}) cannot exceed Requested Imprest (₹${requestedImprest})`,
      });
      return;
    }

    // Set workflow status based on selected status
    if (this.status === '10000') {
      this.wfStatusId = 1;
      this.statusLabel = 'Approve';
    } else if (this.status === '10003') {
      this.wfStatusId = 3;
      this.statusLabel = 'Reject';
    }

    // Show confirmation dialog before submitting
    this.openConfirmDialog(
      'Confirm Approval?',
      `You are about to ${this.statusLabel} the imprest an amount of ₹${approvedImprest}.\n\nAre you sure you want to proceed?`,
      () => {
        this.proceedWithSubmit(approvedImprest);
      }
    );
  }

  proceedWithSubmit(approvedImprest: number) {
    // Get values from sessionStorage (with fallbacks)
    const userId = sessionStorage.getItem('userId') || '';
    const currentRoleData = sessionStorage.getItem('currentRole');
    let roleId = 0;
    try {
      if (currentRoleData) {
        roleId = JSON.parse(currentRoleData).roleId || 0;
      }
    } catch (e) {
      console.warn('Error parsing currentRole:', e);
    }

    // Ensure formlable is set (fallback to default)
    if (!this.formlable) {
      this.formlable = 'Expense Approval';
    }

    // Convert approvedImprest to number for API call
    const approvedImprestValue = Number(this.selectedItem?.approvedImprest) || 0;

    const remarks = (this.remarks || '').trim();
    const activity = (this.selectedItem?.text || '').trim();

    const raw =
      `id=${this.selectedItem.id}` +
      `|approvedStatus=${this.status}` +
      `|wfStatusId=${this.wfStatusId}` +
      `|approvedImprest=${approvedImprestValue}` +
      `|approvalRemarks=${remarks}` +
      `|appUserId=${userId}` +
      `|activity=${activity}` +
      `|appUserRole=${roleId}`;

    this.userService.SubmitPostTypeData('uspExpanseRequestApproval', raw, this.formlable).subscribe(
      (res: any) => {
        if (res === 'Data Saved.-success') {
          setTimeout(() => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Data saved successfully!',
            });
            this.clearData();
            this.closeDataDialog();
            this.getViewData();
          }, 2000);
        } else {
          setTimeout(() => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: res,
            });
          }, 2000);
        }
      },
      (err: HttpErrorResponse) => {
        console.log('API Error Details:');

        if (err.status === 401 || err.status === 403) {
          // Session expired or unauthorized - redirect to login immediately
          this.Customvalidation.loginroute(403);
        } else if (err.status === 0) {
          this.messageService.add({
            severity: 'error',
            summary: 'Network Error',
            detail:
              'Unable to connect to server. Please check your internet connection and try again.',
          });
        } else if (err.status === 400) {
          const errorMessage =
            err.error?.message ||
            err.error ||
            'Invalid request. Please check your input and try again.';
          this.messageService.add({
            severity: 'error',
            summary: 'Validation Error',
            detail: errorMessage,
          });
        } else if (err.status === 500) {
          const errorMessage =
            err.error?.message || err.error || 'Server error occurred. Please contact support.';
          this.messageService.add({
            severity: 'error',
            summary: 'Server Error',
            detail: errorMessage,
          });
        } else {
          const errorMessage =
            err.error?.message ||
            err.error?.error ||
            err.message ||
            err.error ||
            'An error occurred while processing your request';
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: errorMessage,
          });
        }
      }
    );
  }
  extendedimprestSubmit(item: any) {
    if (!item.approvedImprest || isNaN(item.approvedImprest)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Approved Imprest is required',
      });
      return;
    }
    if (!item.Status || item.Status === '0' || item.Status === '') {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Status is required',
      });
      return;
    }
    if (!item.approvalRemarks || item.approvalRemarks.trim() === '') {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Remarks are required',
      });
      return;
    }
    if (item.approvedImprest > item.imprest) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Approved Imprest cannot be greater than requested Imprest.',
      });
      return;
    }

    let wfStatusId = 0;
    let statusLabel = '';
    if (item.Status === 'Approved') {
      wfStatusId = 1;
      statusLabel = 'Approve';
    } else if (item.Status === 'Reject') {
      wfStatusId = 3;
      statusLabel = 'Reject';
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Invalid status selected',
      });
      return;
    }

    const confirmSubmit = window.confirm(
      `You are about to ${statusLabel} the imprest with an amount of ₹${item.approvedImprest}.\n\nDo you want to continue?`
    );
    if (!confirmSubmit) {
      return;
    }
    const userId = sessionStorage.getItem('userId');
    const imprestHistoryId = item.id;
    const raw =
      `id=${imprestHistoryId}` +
      `|wfStatusId=${wfStatusId}` +
      `|approvedImprest=${item.approvedImprest}` +
      `|appUserId=${userId}` +
      `|remark=${item.approvalRemarks}`;

    this.userService
      .SubmitPostTypeData('uspPostExpenseAdditionalApproval', raw, this.formlable)
      .subscribe(
        (res: any) => {
          if (typeof res === 'string' && res.toLowerCase().includes('success')) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Imprest approved successfully!',
            });
            this.closeDataDialog();
            this.getViewData();
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: res,
            });
          }
        },
        (err: HttpErrorResponse) => {
          if (err.status === 403) {
            this.Customvalidation.loginroute(err.status);
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Unexpected error occurred',
            });
          }
        }
      );
  }

  clearData(): void {
    this.status = '';
    this.remarks = '';
    this.wfStatusId = 0;
    this.statusLabel = '';
  }
  viewAttachment(url: string) {
    if (url) {
      window.open('https://elocker.nobilitasinfotech.com/' + url, '_blank');
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'File not exist!',
      });
    }
  }
  closeAccessoryModal() {
    this.showAdminHistoryModal = false;
    this.selectedItem = null;
    this.showFinanceHistoryModal = false;
  }
}
