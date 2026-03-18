import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

import { UserService } from '../../shared/user-service';
import { ToastModule } from 'primeng/toast';
import { PopoverModule } from 'primeng/popover';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';

import { TableTemplate, TableColumn } from '../../table-template/table-template';
import { DrawerModule } from 'primeng/drawer';
import { DialogModule } from 'primeng/dialog';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { Customvalidation } from '../../shared/Validation';
@Component({
  selector: 'app-expense-request-details',
  standalone: true,
  imports: [
    CommonModule,
    BreadcrumbModule,
    ButtonModule,
    ConfirmDialogModule,
    TableTemplate,
    ToastModule,
    PopoverModule,
    DrawerModule,
    DialogModule,
    CheckboxModule,
    SelectModule,
    FormsModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    TextareaModule,
  ],
  providers: [ConfirmationService, DatePipe],
  templateUrl: './expense-request-details.html',
  styleUrl: './expense-request-details.scss',
})
export class ExpenseRequestDetails implements OnInit {
  FormName = '';
  FormValue = '';
  menulabel = '';
  currentRole = 0;
  districtId = 0;
  header = '';
  headerIcon = '';
  breadcrumbItems: any[] = [];
  selectedRequest: 'pending' | 'completed' | 'bank' = 'pending';

  pendingData: any[] = [];
  completedData: any[] = [];
  bankData: any[] = [];

  viewData: any[] = [];

  constructor(
    private router: Router,
    private userService: UserService,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
    private Customvalidation: Customvalidation,
    private confirmationService: ConfirmationService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.getBankDrp();
    this.currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
    this.districtId = JSON.parse(sessionStorage.getItem('District') || '{}');
    if (this.currentRole == 86 || this.currentRole == 79) {
      this.selectedRequest = 'pending';
    } else {
      this.selectedRequest = 'completed';
    }
    
    // Update column visibility based on current role
    this.updateColumnVisibility();
    
    const menuItem = sessionStorage.getItem('menuItem');
    if (menuItem) {
      const paramjs = JSON.parse(menuItem);
      this.FormName = paramjs.formName;
      this.FormValue = paramjs.formValue;
      this.menulabel = paramjs.menu;
      // Use FormName from menuItem if available, otherwise use default
      if (this.FormName) {
        this.formlable = this.FormName;
      }
    }

    // default tab load
    this.breadcrumbItems = [
      { label: 'Home', title: 'Home' },
      { label: this.FormName, title: this.FormName },
      { label: 'Expense Request Details', title: 'Expense Request Details' },
    ];
    this.onChangeRequestTab(this.selectedRequest);

    // Load bank dropdown if role is 86
    if (this.currentRole === 86) {
      this.getBankDrp();
    }
    this.getRequestForBankData();
    this.getRequestForCompleted();
    this.getRequestForApproval();
  }

  updateColumnVisibility(): void {
    // Update visibility for approvedImprest and approvedStatus columns based on current role
    const approvedImprestColumn = this.pendingDataColumns.find(col => col.key === 'approvedImprest');
    const approvedStatusColumn = this.pendingDataColumns.find(col => col.key === 'approvedStatus');
    
    if (approvedImprestColumn) {
      approvedImprestColumn.isVisible = this.currentRole == 79;
    }
    if (approvedStatusColumn) {
      approvedStatusColumn.isVisible = this.currentRole == 79;
    }
  }

  onChangeRequestTab(tab: 'pending' | 'completed' | 'bank'): void {
    this.selectedRequest = tab;
    if (tab === 'pending') {
      this.getRequestForApproval();
    } else if (tab === 'bank') {
      this.getRequestForBankData();
    } else if (tab === 'completed') {
      this.getRequestForCompleted();
    }
    this.cdr.detectChanges();
  }

  visible = false;
  isView = false;
  postType: 'view' | 'update' = 'view';
  isViewMode = false;
  isLoading = false;
  selectedItem: any = null;

  // Disbursed Details Dialog
  showDisbursedDialog = false;
  disbursedDetailsData: any[] = [];

  // Checkbox Selection State (Bank Table)
  selectedBankRows: Set<any> = new Set();
  selectAllBankRows: boolean = false;

  // Bank Payment Dropdown
  travelByDrp: any[] = [];
  selectedBankForPayment: string = '';
  kotakCustomerNo: string = '';

  // Form fields
  givenAmount: string = '';
  remarks: string = '';
  source: string = '';
  destination: string = '';
  travelMode: string = '';
  accDetails: string = '';
  carNumber: string = '';
  driverName: string = '';
  driverNumber: string = '';
  ticketImage: string = '';
  accomodationImage: string = '';

  // Employee details
  parsedEmployeeDetails: any[] = [];

  // Travel by dropdown
  travelByDrpforGEadmin: any[] = [];

  // Form label
  formlable: string = 'Expense Request Details';

  getViewDetails(item: any, type: 'view' | 'update'): void {
    this.postType = type;
    this.isViewMode = type === 'view';
    this.isView = false;
    this.visible = true;
    this.isLoading = true;

    // Get request ID from item
    const requestId = item.id || item.requestId || item.reqId;

    if (!requestId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Request ID is missing',
      });
      this.isLoading = false;
      return;
    }

    // Fetch full details from API
    const userId = sessionStorage.getItem('userId');
    const districtId = sessionStorage.getItem('District');
    const roleId = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
    const query = `uspGetExpenseRequestForApproval|appUserId=${userId}|appUserRole=${roleId}|districtId=${districtId}|requestId=${requestId}`;

    this.userService.getQuestionPaper(query).subscribe({
      next: (res: any) => {
        const fullData = res?.table?.[0] || item;
        this.selectedItem = fullData;
        this.showDialog(type, fullData);
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        // If API fails, use the item data from table
        this.selectedItem = item;
        this.showDialog(type, item);
        this.isLoading = false;
      },
    });
  }

  showDialog(type: 'view' | 'update', data?: any): void {
    this.postType = type;
    this.isViewMode = type === 'view';
    this.isView = false;
    this.visible = true;

    // Dynamic header text & icon
    if (type === 'update') {
      this.header = 'Booking Entry Details';
      this.headerIcon = 'pi pi-pencil';
    } else {
      this.header = 'View Expense Request';
      this.headerIcon = 'pi pi-eye';
    }

    if (data) {
      this.selectedItem = data;
      this.initializeFormData(data);
    }

    // Load travel by dropdown for role 79
    if (this.currentRole === 79) {
      this.getTravelByDrp();
    }

    this.isLoading = false;
    this.cdr.detectChanges();
  }

  initializeFormData(data: any): void {
    // Initialize form fields from selected item
    this.givenAmount = data.disbursedAmt || '';
    this.remarks = '';
    this.source = data.travelSource || data.Source || '';
    this.destination = data.travelDestination || data.destination || '';
    this.travelMode = data.travelById || '';
    this.accDetails = data.accomodationDetails || '';
    this.carNumber = data.carNumber || '';
    this.driverName = data.driverName || '';
    this.driverNumber = data.driverNumber || '';
    this.ticketImage = data.ticketImage || '';
    this.accomodationImage = data.accomodationImage || '';

    // Parse employee details
    try {
      if (data.employeeDetails) {
        this.parsedEmployeeDetails =
          typeof data.employeeDetails === 'string'
            ? JSON.parse(data.employeeDetails)
            : data.employeeDetails || [];
      } else {
        this.parsedEmployeeDetails = [];
      }
    } catch (e) {
      this.parsedEmployeeDetails = [];
    }

    // Parse imprest history
    try {
      if (data.imprestHistory) {
        this.selectedItem.history =
          typeof data.imprestHistory === 'string'
            ? JSON.parse(data.imprestHistory)
            : data.imprestHistory || [];
      } else if (data.history) {
        this.selectedItem.history =
          typeof data.history === 'string' ? JSON.parse(data.history) : data.history || [];
      } else {
        this.selectedItem.history = [];
      }
    } catch (e) {
      this.selectedItem.history = [];
    }
  }

  onDrawerHide(): void {
    this.visible = false;
    this.selectedItem = null;
    // Reset form fields
    this.givenAmount = '';
    this.remarks = '';
    this.source = '';
    this.destination = '';
    this.travelMode = '';
    this.accDetails = '';
    this.carNumber = '';
    this.driverName = '';
    this.driverNumber = '';
    this.ticketImage = '';
    this.accomodationImage = '';
    this.parsedEmployeeDetails = [];
  }

  getTravelByDrp(): void {
    const roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
    this.userService
      .getQuestionPaper(
        `uspGetExpanseMaster|action=TRAVELTYPE|id=0|appUserId=${sessionStorage.getItem(
          'userId'
        )}|districtId=${sessionStorage.getItem('District')}|appUserRole=${roleID}`
      )
      .subscribe({
        next: (res: any) => {
          this.travelByDrpforGEadmin = res?.table || [];
          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => {},
      });
  }

  fileupload(folderName: string, fieldName: string): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.pdf,.doc,.docx';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.userService.MastrtfileuploadNew([file], folderName).subscribe({
          next: (res: any) => {
            const responseStr = String(res);
            const parts = responseStr.split('-');
            if (parts[0] === '1' && parts[1]) {
              const uploadedPath = parts[1].trim();
              if (fieldName === 'TravelTicket') {
                this.ticketImage = uploadedPath;
              } else if (fieldName === 'Accommodation') {
                this.accomodationImage = uploadedPath;
              }
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'File uploaded successfully',
              });
              this.cdr.detectChanges();
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: parts[1] || 'Failed to upload file',
              });
            }
          },
          error: (err: any) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to upload file',
            });
          },
        });
      }
    };
    input.click();
  }

  viewAttachment(url: string): void {
    if (url) {
      window.open(url, '_blank');
    }
  }

  removeAttachment(fieldName: string): void {
    if (fieldName === 'ticketImage') {
      this.ticketImage = '';
    } else if (fieldName === 'accomomodationImage') {
      this.accomodationImage = '';
    }
    this.cdr.detectChanges();
  }

  allowOnlyNumbers(event: KeyboardEvent): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  getTotalDisbursed(): number {
    // Calculate total disbursed amount from history
    if (this.selectedItem?.history && Array.isArray(this.selectedItem.history)) {
      return this.selectedItem.history.reduce((sum: number, item: any) => {
        return sum + (Number(item.disbursedAmt) || 0);
      }, 0);
    }
    return 0;
  }

  validateDisbursedTotal(): boolean {
    if (!this.givenAmount) return true; // Allow empty for now
    const total = this.getTotalDisbursed() + Number(this.givenAmount);
    const approved = Number(this.selectedItem?.approvedImprest || 0);
    return total <= approved;
  }

  onSubmit(): void {
    if (!this.givenAmount) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Amount is required',
      });
      return;
    }
    const approvedImprest = this.selectedItem.approvedImprest || this.selectedItem.imprest || 0;
    if (Number(this.givenAmount) > Number(approvedImprest)) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Disbursed Amount cannot be greater than Approved Imprest.',
      });
      return;
    }

    if (!this.remarks || this.remarks.trim() === '') {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Remarks are required',
      });
      return;
    }

    this.confirmationService.confirm({
      header: 'Confirm Disbursal',
      message: `You are about to disburse an amount of ₹${this.givenAmount}.\n\nDo you want to continue?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        this.submitDisbursal();
      },
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Cancelled',
          detail: 'Disbursal cancelled',
        });
      },
    });
  }

  submitDisbursal(): void {
    const userId = sessionStorage.getItem('userId');
    const districtId = sessionStorage.getItem('District');
    const requestId =
      this.selectedItem.id || this.selectedItem.requestId || this.selectedItem.reqId;
    const amount = this.givenAmount;
    const remarks = this.remarks;

    if (!requestId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Request ID is missing',
      });
      return;
    }

    const raw = `appUserId=${userId}|districtId=${districtId}|requestId=${requestId}|amount=${amount}|remarks=${remarks}`;
    this.isLoading = true;
    this.userService
      .SubmitPostTypeData('uspPostExpenseDisbursedDetails', raw, this.formlable)
      .subscribe({
        next: (res: any) => {
          this.isLoading = false;
          const responseStr = String(res || '').trim();

          // Check multiple success formats
          if (
            responseStr === 'Data Saved.-success' ||
            responseStr.toLowerCase().includes('success') ||
            responseStr.startsWith('1-')
          ) {
            const resultArray = responseStr.split('-');
            const message =
              resultArray.length > 1 ? resultArray.slice(1).join('-') : 'Data saved successfully!';

            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: message,
            });
            this.onDrawerHide();
            this.onChangeRequestTab(this.selectedRequest);
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: responseStr || 'Failed to save data',
            });
          }
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error?.message || err.message || 'Failed to save data',
          });
        },
      });
  }

  onAdminSubmit(): void {
    if (!this.remarks || this.remarks.trim() === '') {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Remarks are required',
      });
      return;
    }

    this.confirmationService.confirm({
      header: 'Confirm Submission',
      message: `You are about to submit ticket details.\n\nDo you want to continue?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        this.submitAdminDetails();
      },
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Cancelled',
          detail: 'Submission cancelled',
        });
      },
    });
  }

  submitAdminDetails(): void {
    const userId = sessionStorage.getItem('userId');
    const districtId = sessionStorage.getItem('District');
    const requestId =
      this.selectedItem.id || this.selectedItem.requestId || this.selectedItem.reqId;

    if (!requestId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Request ID is missing',
      });
      return;
    }

    this.isLoading = true;
    const raw =
      `ticketImage=${this.ticketImage || ''}` +
      `|accomodationImage=${this.accomodationImage || ''}` +
      `|source=${this.source || ''}` +
      `|destination=${this.destination || ''}` +
      `|travelModeId=${this.travelMode || 0}` +
      `|accomodationDetails=${this.accDetails || ''}` +
      `|carNumber=${this.carNumber || ''}` +
      `|driverName=${this.driverName || ''}` +
      `|driverNumber=${this.driverNumber || ''}` +
      `|appUserId=${userId}` +
      `|districtId=${districtId}` +
      `|requestId=${requestId}` +
      `|remarks=${this.remarks}`;

    this.userService
      .SubmitPostTypeData('uspPostExpenseTicketsDetails', raw, this.formlable)
      .subscribe({
        next: (res: any) => {
          this.isLoading = false;
          const responseStr = String(res || '').trim();

          // Check multiple success formats
          if (
            responseStr === 'Data Saved.-success' ||
            responseStr.toLowerCase().includes('success') ||
            responseStr.startsWith('1-')
          ) {
            const resultArray = responseStr.split('-');
            const message =
              resultArray.length > 1 ? resultArray.slice(1).join('-') : 'Data saved successfully!';

            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: message,
            });
            this.onDrawerHide();
            this.onChangeRequestTab(this.selectedRequest);
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: responseStr || 'Failed to save data',
            });
          }
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error?.message || err.message || 'Failed to save data',
          });
        },
      });
  }

  pendingDataColumns: TableColumn[] = [

    //  <th>S.no</th>
    // <th>Action</th>
    // <th>Request Number</th>
    // <th>Request Type</th>
    // <th>Employee Name</th>
    // <th>From Date</th>
    // <th>To Date</th>
    // <th>Request Date</th>
    // <th>Approval Date</th>
    // <th>Purpose</th>
    // <th *ngIf="currentRole == 86">Approved Imprest</th>
    // <th *ngIf="currentRole == 86">Approved Status</th>
    // <th>Ledger</th>
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true },
    { key: 'sno', header: 'S.No', isVisible: true, isSortable: false },
    { key: 'reqNo', header: 'Request Number', isVisible: true, isSortable: false },
    { key: 'requestType', header: 'Request Type', isVisible: true, isSortable: false },
    { key: 'employeeName', header: 'Employee Name', isVisible: true, isSortable: false },
    { key: 'fromDate', header: 'From Date', isVisible: true, isSortable: false },
    { key: 'toDate', header: 'To Date', isVisible: true, isSortable: false },
    { key: 'requestDate', header: 'Request Date', isVisible: true, isSortable: false },
    { key: 'approvalDate', header: 'Approval Date', isVisible: true, isSortable: false },
    { key: 'purpose', header: 'Purpose', isVisible: true, isSortable: false },
    { key: 'approvedImprest', header: 'Approved Imprest', isVisible: false, isSortable: false },
    { key: 'approvedStatus', header: 'Approved Status', isVisible: false, isSortable: false },
    { key: 'ledger', header: 'Ledger', isVisible: true, isSortable: false },


   
  ];

  bankDataColumns: TableColumn[] = [
    { key: 'checkbox', header: '', isVisible: true, isSortable: false, isCustom: true },
  //  { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true },
    { key: 'sno', header: 'S.No', isVisible: true, isSortable: false },
    { key: 'reqNo', header: 'Request No.', isVisible: true, isSortable: false },
    { key: 'employeeName', header: 'Employee Name', isVisible: true, isSortable: false },
    { key: 'purpose', header: 'Purpose', isVisible: true, isSortable: false },
    { key: 'disbursedAmt', header: 'Disbursed Amount', isVisible: true, isSortable: false },
    { key: 'bankName', header: 'Bank Name', isVisible: true, isSortable: false },
    { key: 'account', header: 'Account Number', isVisible: true, isSortable: false },
    { key: 'ifsc', header: 'IFSC Code', isVisible: true, isSortable: false },
    { key: 'toProject', header: 'To Project', isVisible: true, isSortable: false },
    { key: 'accomodation', header: 'Accomodation', isVisible: true, isSortable: false },
    { key: 'returnTicket', header: 'Return Ticket', isVisible: true, isSortable: false },
    { key: 'localConveyance', header: 'Local Conveyance', isVisible: true, isSortable: false },
    // { key: 'employeeDetails', header: 'Employee Details', isVisible: true, isSortable: false },
    { key: 'ticketDetails', header: 'Ticket Details', isVisible: true, isSortable: false },
    //{ key: 'disbursedDetails', header: 'Disbursed Details', isVisible: true, isSortable: false },
    { key: 'reimbDetails', header: 'Reimbursed Details', isVisible: true, isSortable: false },

    { key: 'fromDate', header: 'From Date', isVisible: true, isSortable: false },
    { key: 'toDate', header: 'To Date', isVisible: true, isSortable: false },
  ];

  completedDataColumns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true },
    { key: 'sno', header: 'S.No', isVisible: true, isSortable: false },
    { key: 'reqNo', header: 'Request Number', isVisible: true, isSortable: false },
    { key: 'requestType', header: 'Request Type', isVisible: true, isSortable: false },
    { key: 'employeeName', header: 'Employee Name', isVisible: true, isSortable: false },
    { key: 'fromDate', header: 'From Date', isVisible: true, isSortable: false },
    { key: 'toDate', header: 'To Date', isVisible: true, isSortable: false },
    { key: 'purpose', header: 'Purpose', isVisible: true, isSortable: false },
    { key: 'imprest', header: 'Approved Imprest', isVisible: true, isSortable: false },
    { key: 'approvedStatus', header: 'Approved Status', isVisible: true, isSortable: false },
    { key: 'approvalRemarks', header: 'Approval Remarks', isVisible: true, isSortable: false },
    { key: 'travelSource', header: 'Source', isVisible: true, isSortable: false },
    { key: 'travelDestination', header: 'Destination', isVisible: true, isSortable: false },
    {
      key: 'employeeDetails',
      header: 'Employee Details',
      isVisible: true,
      isSortable: false,
      isCustom: true,
    },
    {
      key: 'ticketDetails',
      header: 'Ticket Details',
      isVisible: true,
      isSortable: false,
      isCustom: true,
    },
    {
      key: 'disbursedDetails',
      header: 'Disbursed Details',
      isVisible: true,
      isSortable: false,
      isCustom: true,
    },
  ];

  getRequestForApproval(): void {
    const query = `uspGetExpenseRequestForApproval|appUserId=${sessionStorage.getItem(
      'userId'
    )}|appUserRole=${
      JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId
    }|districtId=${sessionStorage.getItem('District')}|processed=0`;
    this.userService.getQuestionPaper(query).subscribe((res: any) => {
      this.pendingData = res?.table || [];
      this.pendingData.forEach((item: any, index: number) => {
        item.sno = index + 1;
      });
      this.cdr.detectChanges();
    });
  }

  tableColumns: string[] = [];

  getRequestForBankData(): void {
    const query = `uspGetExpenseRequestForBankData|appUserId=${sessionStorage.getItem(
      'userId'
    )}|appUserRole=${
      JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId
    }|districtId=${sessionStorage.getItem('District')}`;

    this.userService.getQuestionPaper(query).subscribe((res: any) => {
      this.bankData = res?.table || [];

      if (this.bankData.length > 0) {
        // Extract column names dynamically
        this.tableColumns = Object.keys(this.bankData[0]);

        // Add serial number and initialize checkbox state
        this.bankData.forEach((item: any, index: number) => {
          item.sno = index + 1;
          // Ensure selected property is always initialized
          if (item.selected === undefined || item.selected === null) {
            item.selected = false;
          }
          // Create a unique identifier for tracking
          if (!item.uniqueId) {
            item.uniqueId = `bank_${index}_${Date.now()}_${Math.random()}`;
          }
        });

        // Ensure sno comes first
        this.tableColumns = ['sno', ...this.tableColumns.filter((c) => c !== 'sno')];
      }
      // Reset selection state when data reloads
      this.selectedBankRows.clear();
      this.selectAllBankRows = false;
      this.cdr.detectChanges();
    });
  }

  getRequestForCompleted(): void {
    const query = `uspGetExpenseRequestForApproval|appUserId=${sessionStorage.getItem(
      'userId'
    )}|appUserRole=${
      JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId
    }|districtId=${sessionStorage.getItem('District')}|processed=1`;
    this.userService.getQuestionPaper(query).subscribe((res: any) => {
      this.completedData = res?.table || [];
      this.completedData.forEach((item: any, index: number) => {
        item.sno = index + 1;
      });
      this.cdr.detectChanges();
    });
  }

  openDisbursedDetailsDialog(item: any): void {
    try {
      if (item.disbursedDetails) {
        this.disbursedDetailsData =
          typeof item.disbursedDetails === 'string'
            ? JSON.parse(item.disbursedDetails)
            : item.disbursedDetails || [];
      } else {
        this.disbursedDetailsData = [];
      }
    } catch (e) {
      this.disbursedDetailsData = [];
    }
    this.showDisbursedDialog = true;
  }

  getTotalDisbursedAmount(): number {
    return this.disbursedDetailsData.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  }

  // Bank Table Checkbox Methods
  onBankRowSelectChange(item: any, selected: boolean): void {
    // Find the item in bankData array and update it
    const itemIndex = this.bankData.findIndex(
      (row: any) =>
        row === item ||
        (row.uniqueId && item.uniqueId && row.uniqueId === item.uniqueId) ||
        (row.sno && item.sno && row.sno === item.sno)
    );

    if (itemIndex !== -1) {
      // Update the item in the array
      this.bankData[itemIndex].selected = selected;

      // Update Set with the item from array
      if (selected) {
        this.selectedBankRows.add(this.bankData[itemIndex]);
      } else {
        // Remove from Set
        const itemToRemove = Array.from(this.selectedBankRows).find(
          (row: any) =>
            row === this.bankData[itemIndex] ||
            (row.uniqueId &&
              this.bankData[itemIndex].uniqueId &&
              row.uniqueId === this.bankData[itemIndex].uniqueId)
        );
        if (itemToRemove) {
          this.selectedBankRows.delete(itemToRemove);
        }
      }
    } else {
      // Fallback: update item directly
      item.selected = selected;
      if (selected) {
        this.selectedBankRows.add(item);
      } else {
        this.selectedBankRows.delete(item);
      }
    }

    // Update header checkbox state immediately
    this.updateSelectAllBankState();

    // Force change detection
    this.cdr.detectChanges();
  }

  onSelectAllBankRowsChange(selectAll: boolean): void {
    if (!this.bankData || this.bankData.length === 0) {
      this.selectAllBankRows = false;
      return;
    }

    // Clear the set first
    this.selectedBankRows.clear();

    // Update all items in bankData
    this.bankData.forEach((item: any) => {
      item.selected = selectAll;
      // Add to Set if selecting
      if (selectAll) {
        this.selectedBankRows.add(item);
      }
    });

    // Update header checkbox state
    this.selectAllBankRows = selectAll;

    // Create a new array reference to trigger change detection
    this.bankData = [...this.bankData];

    // Force change detection
    this.cdr.detectChanges();
  }

  updateSelectAllBankState(): void {
    if (!this.bankData || this.bankData.length === 0) {
      this.selectAllBankRows = false;
      return;
    }

    // Check if all items are selected
    const allSelected = this.bankData.every((item: any) => item.selected === true);
    this.selectAllBankRows = allSelected;

    // Also check if Set size matches bankData length
    if (allSelected && this.selectedBankRows.size !== this.bankData.length) {
      // If all are selected but Set doesn't match, update Set
      this.selectedBankRows.clear();
      this.bankData.forEach((item: any) => {
        if (item.selected) {
          this.selectedBankRows.add(item);
        }
      });
    }
  }

  getSelectedBankRows(): any[] {
    return Array.from(this.selectedBankRows);
  }

  getSelectedBankRowsCount(): number {
    return this.selectedBankRows.size;
  }

  // Bank Dropdown Methods
  getBankDrp(): void {
    const userId = sessionStorage.getItem('userId');
    const roleId = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
    const query = `uspGetBankForPayment|action=BANK|appUserId=${userId}|appUserRole=${roleId}`;

    this.userService.getQuestionPaper(query).subscribe({
      next: (res: any) => {
        this.travelByDrp = res?.table || [];
        // Extract Kotak customer number if available
        const kotakBank = this.travelByDrp.find(
          (bank: any) => bank.drpOption?.toUpperCase().includes('KOTAK') && bank.customerNo
        );
        if (kotakBank) {
          this.kotakCustomerNo = kotakBank.customerNo;
        }
      },
      error: (err: HttpErrorResponse) => {
        this.travelByDrp = [];
      },
    });
  }

  refreshBankData() {
    this.getRequestForBankData();
  }

  refreshPendingData() {
    this.getRequestForApproval();
  }

  refreshCompletedData() {
    this.getRequestForCompleted();
  }

  onBankSelectionChanged() {
    this.onProcessPayment();
    setTimeout(() => {
      this.exportSelectedAsExcel();
    }, 200);
  }

  onProcessPayment() {
    if (this.selectedBankRows.size === 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please select at least one row',
      });
      return;
    }

    const selectedBank = this.selectedBankForPayment;
    if (!selectedBank) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please select a bank',
      });
      return;
    }

    let selectedData: any[] = [];
    this.selectedBankRows.forEach((item: any) => {
      const rowData = { ...item };
      rowData.selectedBank = selectedBank;
      selectedData.push(rowData);
    });

    const jsonData = JSON.stringify(selectedData);
    const userId = sessionStorage.getItem('userId');
    const raw = `downloadJson=${jsonData}|appUserId=${userId}|appUserRole=${this.currentRole}`;

    this.isLoading = true;
    this.userService
      .SubmitPostTypeData('uspPostPaymentSettlementDataForImprest', raw, this.formlable)
      .subscribe(
        (res: any) => {
          if (res === 'Data Saved.-success' || res.includes('success')) {
            setTimeout(() => {
              this.isLoading = false;
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Payment settlement processed successfully!',
              });
              this.selectedBankRows.clear();
              this.updateSelectAllBankState();
              this.getRequestForApproval();
              this.getRequestForCompleted();
            }, 2000);
          } else {
            setTimeout(() => {
              this.isLoading = false;
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: res || 'Error processing payment settlement',
              });
            }, 2000);
          }
        },
        (err: HttpErrorResponse) => {
          this.isLoading = false;
          if (err.status === 403) {
            this.Customvalidation.loginroute(err.status);
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'An error occurred while processing payment',
            });
          }
        }
      );
  }

  exportSelectedAsExcel(): void {
    if (this.selectedBankRows.size === 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please select at least one row to export',
      });
      return;
    }

    const selectedBank = this.selectedBankForPayment;
    if (!selectedBank) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please select a bank before exporting',
      });
      return;
    }

    const bankName = this.getBankNameFromValue(selectedBank);
    let selectedData: any[] = [];

    this.selectedBankRows.forEach((item: any) => {
      const rowData: any = {
        empName: item.employeeName || item.empName || '',
        empCode: item.employeeCode || item.empCode || '',
        accountNo: item.account || item.accountNo || '',
        amount: item.disbursedAmt || item.amount || 0,
        ifsc: item.ifsc || '',
        bankName: item.bankName || '',
        branchName: item.branchName || '',
        email: item.email || '',
        purpose: item.purpose || '',
        transactionDate: item.transactionDate || null,
        ...item,
      };
      selectedData.push(rowData);
    });

    const formattedData = this.formatDataForBank(selectedData, bankName, selectedBank);
    this.downloadTableAsExcel(formattedData, bankName);
  }

  private downloadTableAsExcel(data: any[], bankName: string): void {
    if (!data || data.length === 0) return;
    const isArrayFormat = Array.isArray(data[0]);

    let tableHTML = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="UTF-8">
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheets>
            </x:ExcelWorkbook>
          </xml>
        <![endif]-->
        <style>
          table {
            border-collapse: collapse;
            width: 100%;
          }
          th {
            background-color: #2E86C1;
            color: white;
            font-weight: bold;
            padding: 8px;
            text-align: center;
            border: 1px solid #1B4F72;
          }
          td {
            padding: 6px;
            border: 1px solid #ddd;
            text-align: left;
          }
          tr:nth-child(even) {
            background-color: #f2f2f2;
          }
        </style>
      </head>
      <body>
        <table border="1">
    `;

    if (isArrayFormat) {
      tableHTML += '<tbody>';

      data.forEach((row) => {
        tableHTML += '<tr>';
        row.forEach((cell: any) => {
          const value = cell || '';
          tableHTML += `<td>${this.escapeExcelValue(value)}</td>`;
        });
        tableHTML += '</tr>';
      });
    } else {
      tableHTML += '<thead><tr>';
      const headers = Object.keys(data[0]);
      headers.forEach((header) => {
        tableHTML += `<th>${this.escapeExcelValue(header)}</th>`;
      });

      tableHTML += '</tr></thead><tbody>';

      data.forEach((row) => {
        tableHTML += '<tr>';
        headers.forEach((header) => {
          const value = row[header] || '';
          tableHTML += `<td>${this.escapeExcelValue(value)}</td>`;
        });
        tableHTML += '</tr>';
      });
    }

    tableHTML += `
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([tableHTML], {
      type: 'application/vnd.ms-excel',
    });

    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    const formName = this.formlable || 'ExpenseRequest';
    const displayBankName = bankName || 'Unknown Bank';
    const sanitizedBankName = displayBankName.replace(/\s+/g, '_');
    const timestamp = new Date().getTime();
    const fileName = `${formName}_${sanitizedBankName}_${timestamp}.xls`;

    link.href = url;
    link.download = fileName;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);

    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: `Selected records exported for ${displayBankName}`,
    });

    setTimeout(() => {
      this.resetBankSelection();
    }, 500);
  }

  resetBankSelection(): void {
    this.selectedBankRows.clear();
    this.selectAllBankRows = false;

    this.selectedBankForPayment = '';

    this.bankData.forEach((item: any) => {
      item.selected = false;
    });

    this.cdr.detectChanges();
  }

  private escapeExcelValue(value: any): string {
    if (value === null || value === undefined) return '';

    const stringValue = String(value);
    return stringValue
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private getBankNameFromValue(bankValue: any): string {
    if (!bankValue || !this.travelByDrp || this.travelByDrp.length === 0) {
      return 'Unknown Bank';
    }

    const bank = this.travelByDrp.find((option: any) => {
      const optionValue = option.drpValue;
      const searchValue = bankValue;

      if (String(optionValue) === String(searchValue)) {
        return true;
      }

      const optionNum = Number(optionValue);
      const searchNum = Number(searchValue);
      if (!isNaN(optionNum) && !isNaN(searchNum) && optionNum === searchNum) {
        return true;
      }

      return false;
    });

    const bankName = bank?.drpOption || 'Unknown Bank';
    return bankName;
  }

  formatDataForBank(data: any[], bankName: string, bankCode: string): any[] {
    const normalizedBankName = bankName.toUpperCase().trim();

    const hdfcLikeBanks = ['HDFC BANK'];
    const yesBanks = ['YES BANK'];
    const kotakBanks = ['KOTAK MAHINDRA BANK LIMITED'];

    const isHDFCLike = hdfcLikeBanks.some((b) => normalizedBankName.includes(b.toUpperCase()));
    const isYesBank = yesBanks.some((b) => normalizedBankName.includes(b.toUpperCase()));
    const isKotakBank = kotakBanks.some((b) => normalizedBankName.includes(b.toUpperCase()));

    if (isHDFCLike) {
      return this.formatForHDFCLikeBanks(data, normalizedBankName);
    } else if (isYesBank) {
      return this.formatForYesBank(data, normalizedBankName);
    } else if (isKotakBank) {
      return this.formatForKotakBank(data, normalizedBankName);
    } else {
      return this.formatForOtherBanks(data, bankName);
    }
  }

  formatForKotakBank(data: any[], bankName: string): any[] {
    const formattedData: any[] = [];

    data.forEach((row, index) => {
      const currentDate = new Date();
      const day = String(currentDate.getDate()).padStart(2, '0');
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const year = currentDate.getFullYear();
      const formattedDate = `${day}/${month}/${year}`;
      const cleanedName = this.cleanBeneficiaryName(row.empName || '');
      const nameEmpCodeField = `${cleanedName} ${row.empCode || ''}`.trim();

      const formattedRow = [
        this.kotakCustomerNo || 'LIONSL1',
        'VENPAY',
        'NEFT',
        '',
        formattedDate,
        '',
        row.accountNo || '',
        this.parseAmount(row.amount),
        'M',
        '',
        nameEmpCodeField,
        '',
        row.ifsc || '',
        row.accountNo || '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        nameEmpCodeField,
        nameEmpCodeField,
      ];

      formattedData.push(formattedRow);
    });

    return formattedData;
  }

  formatForYesBank(data: any[], bankName: string): any[] {
    const formattedData: any[] = [];
    formattedData.push(new Array(14).fill(''));
    data.forEach((row, index) => {
      const currentDate = new Date();
      const day = String(currentDate.getDate()).padStart(2, '0');
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const year = currentDate.getFullYear();
      const formattedDate = `${day}/${month}/${year}`;
      const cleanedName = this.cleanBeneficiaryName(row.empName || '');
      const apiDate = row.transactionDate
        ? this.formatDateForYesBank(row.transactionDate)
        : formattedDate;
      const nameDateField = `${cleanedName}  ${apiDate}`;

      const formattedRow = [
        '',
        '',
        '',
        row.ifsc || '',
        row.accountNo || '',
        cleanedName,
        '',
        '',
        '',
        '',
        nameDateField,
        apiDate,
        this.parseAmount(row.amount),
        cleanedName,
      ];

      formattedData.push(formattedRow);
    });

    return formattedData;
  }

  formatForHDFCLikeBanks(data: any[], bankName: string): any[] {
    return data.map((row, index) => {
      const currentDate = new Date();
      const day = String(currentDate.getDate()).padStart(2, '0');
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const year = currentDate.getFullYear();
      const formattedDate = `${day}/${month}/${year}`;

      const transactionType = 'N';
      const empCode = row.empCode || row.employeeCode || '';
      const accountNo = row.accountNo || row.account || '';
      const amount = row.amount || row.disbursedAmt || 0;
      const empName = row.empName || row.employeeName || '';
      const purpose = row.purpose || '';
      const ifsc = row.ifsc || '';
      const bankNameValue = row.bankName || '';
      const branchName = row.branchName || '';
      const email = row.email || '';

      const formattedRow = {
        'Transaction Type (N – NFET, R – RTGS & I - Fund Transfer in HDFC Bank account)':
          transactionType,
        'Beneficiary Code': empCode,
        'Beneficiary Account Number': accountNo,
        'Instrument Amount': this.parseAmount(amount),
        'Beneficiary Name': this.cleanBeneficiaryName(empName),
        'Drawee Location': '',
        'Print Location': '',
        'Bene Address 1': '',
        'Bene Address 2': '',
        'Bene Address 3': '',
        'Bene Address 4': '',
        'Bene Address 5': '',
        'Instruction Reference Number': `REF${currentDate.getTime()}${index}`,
        'Customer Reference Number': (purpose || '').substring(0, 20),
        'Payment details 1': '',
        'Payment details 2': '',
        'Payment details 3': '',
        'Payment details 4': '',
        'Payment details 5': '',
        'Payment details 6': '',
        'Payment details 7': '',
        'Cheque Number': '',
        'Chq / Trn Date': formattedDate,
        'MICR Number': '',
        'IFSC Code': ifsc,
        'Bene Bank Name': bankNameValue,
        'Bene Bank Branch Name': branchName,
        'Beneficiary email id': email,
      };
      return formattedRow;
    });
  }

  formatForOtherBanks(data: any[], bankName: string): any[] {
    return data.map((row, index) => {
      const currentDate = new Date();
      const day = String(currentDate.getDate()).padStart(2, '0');
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const year = currentDate.getFullYear();
      const formattedDate = `${day}/${month}/${year}`;

      return {
        'S.No': index + 1,
        'Employee Name': row.empName || row.employeeName || '',
        'Employee Code': row.empCode || row.employeeCode || '',
        Purpose: row.purpose || '',
        Amount: this.parseAmount(row.amount || row.disbursedAmt || 0),
        'Bank Name': row.bankName || '',
        'Account Number': row.accountNo || row.account || '',
        'IFSC Code': row.ifsc || '',
        'Transaction Date': formattedDate,
      };
    });
  }

  private formatDateForYesBank(dateString: any): string {
    if (!dateString) {
      const currentDate = new Date();
      const day = String(currentDate.getDate()).padStart(2, '0');
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const year = currentDate.getFullYear();
      return `${day}/${month}/${year}`;
    }

    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      const currentDate = new Date();
      const day = String(currentDate.getDate()).padStart(2, '0');
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const year = currentDate.getFullYear();
      return `${day}/${month}/${year}`;
    }
  }

  cleanBeneficiaryName(name: string): string {
    if (!name) return '';
    return name
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 40);
  }

  parseAmount(amount: any): number {
    if (typeof amount === 'number') {
      return amount;
    }
    if (typeof amount === 'string') {
      const parsed = parseFloat(amount.replace(/,/g, ''));
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }
}
