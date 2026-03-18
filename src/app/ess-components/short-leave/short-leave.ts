import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { TabsModule } from 'primeng/tabs';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService, MenuItem } from 'primeng/api';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { HttpErrorResponse } from '@angular/common/http';
import { DrawerModule } from 'primeng/drawer';
import { TextareaModule } from 'primeng/textarea';
import { TableTemplate } from '../../table-template/table-template';
import { SelectButtonModule } from 'primeng/selectbutton';

import { UserService } from '../../shared/user-service';
import { ExcelService } from '../../shared/excel.service';
import { Customvalidation } from '../../shared/Validation';

@Component({
  selector: 'app-short-leave',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BreadcrumbModule,
    TableTemplate,
    ButtonModule,
    DatePickerModule,
    SelectModule,
    InputTextModule,
    ToastModule,
    ConfirmDialogModule,
    TagModule,
    TabsModule,
    TooltipModule,
    NgxSpinnerModule,
    DrawerModule,
    TextareaModule,
    SelectButtonModule
  ],
  providers: [MessageService, ConfirmationService, ExcelService],
  templateUrl: './short-leave.html',
  styleUrl: './short-leave.scss'
})
export class ShortLeave implements OnInit {
  // UI State
  breadcrumbItems: MenuItem[] = [];
  // Drawer State (Matching LeaveApplication)
  visible: boolean = false;
  header: string = '';
  headerIcon: string = '';
  loading: boolean = false;
  noDatafoundCard: boolean = false;

  // Form
  shortLeaveForm: FormGroup;
  minDate: Date = new Date();
  sessionFrom: any;

  // Data
  userId = sessionStorage.getItem('userId');
  orgId = sessionStorage.getItem('Organization');
  ccData: any[] = [];
  sessionData: any[] = [];
  empShortLeaveData: any[] = [];

  menulabel: string = 'ESS';
  formlabel: string = 'Short Leave';

  pageNo: number = 1;
  pageSize: number = 10;
  totalCount: number = 0;
  searchText: string = '';
  tableHeaders: any[] = [];

  onPageChange(newPage: number) {
    this.pageNo = newPage;
    this.getAppliedShortLeave();
  }

  onPageSizeChange(newSize: number) {
    this.pageSize = newSize;
    this.pageNo = 1;
    this.getAppliedShortLeave();
  }

  onSearchChange(search: string) {
    this.searchText = search;
    this.pageNo = 1;
    this.getAppliedShortLeave();
  }

  isExpanded(item: any): boolean {
    return !!item.isExpanded;
  }

  toggleExpand(item: any): void {
    item.isExpanded = !item.isExpanded;
  }

  getWordCount(text: string): number {
    if (!text) return 0;
    return text.trim().split(/\s+/).length;
  }

  getTruncatedText(text: string, limit: number = 20): string {
    if (!text) return '';
    const words = text.trim().split(/\s+/);
    if (words.length <= limit) return text;
    return words.slice(0, limit).join(' ') + '...';
  }

  constructor(
    private userService: UserService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef,
    private excelService: ExcelService,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private customValidation: Customvalidation
  ) {
    this.shortLeaveForm = this.fb.group({
      date: [new Date(), Validators.required],
      sessionId: [null, Validators.required],
      ccId: [null],
      reason: ['', [Validators.required, Validators.maxLength(100)]]
    });
  }

  ngOnInit() {
    this.loadSessionParams();
    this.updateBreadcrumbs();
    this.getDropDownData();
    this.getAppliedShortLeave();
  }

  loadSessionParams() {
    const param = sessionStorage.getItem('menuItem');
    if (param) {
      let paramjs = JSON.parse(param);
      this.menulabel = paramjs.menu;
      this.formlabel = paramjs.formName;
    }
  }

  updateBreadcrumbs() {
    this.breadcrumbItems = [
      { label: 'Home', routerLink: '/home' },
      { label: this.menulabel, routerLink: '/ess' },
      { label: this.formlabel, styleClass: 'font-bold text-blue-600' }
    ];
  }

  getDropDownData() {
    this.userService.getQuestionPaper(`uspGetShortLeaveDrp|UserId=${this.userId}`).subscribe(
      (res: any) => {
        this.ccData = res['table'] || [];
        this.sessionData = res['table1'] || [];
        if (this.sessionData.length > 0) {
          this.selectSession(this.sessionData[0].drpValue);
        }
        this.cdr.detectChanges();
      },
      (err: HttpErrorResponse) => this.handleError(err)
    );
  }

  selectSession(val: any) {
    this.sessionFrom = val;
    this.shortLeaveForm.patchValue({ sessionId: val });
  }

  getAppliedShortLeave() {
    this.spinner.show();
    this.loading = true;
    this.userService.getQuestionPaper(
      `uspGetAppliedShortLeave|UserId=${this.userId}|orgId=${this.orgId}`
    ).subscribe(
      (res: any) => {
        if (res && res['table'] && res['table'].length > 0) {
          this.empShortLeaveData = res['table'];
          this.totalCount = this.empShortLeaveData.length;

          this.empShortLeaveData.forEach((element, index) => {
            // Processing date display
            if (element.date && element.date.includes('T')) {
              const [yyyy, mm, dd] = element.date.split('T')[0].split('-');
              element.formattedDate = `${dd}-${mm}-${yyyy}`;
            } else if (element.date) {
              const parts = element.date.split('-');
              if (parts.length === 3 && parts[0].length === 4) {
                element.formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
              } else {
                element.formattedDate = element.date;
              }
            }

            if (element.ccTo == 0) element.ccTo = '--';
            if (!element.reason || element.reason === ' ') element.reason = '--';

            // Determine if action (withdraw) is allowed
            let shortLeaveDate = new Date(element.date);
            let currDate = new Date();
            if (shortLeaveDate.getMonth() === currDate.getMonth() && shortLeaveDate.getFullYear() === currDate.getFullYear()) {
              element.allowAction = true;
            } else {
              element.allowAction = false;
            }
            element.rowNo = index + 1;
            element.isExpanded = false;
          });

          const dynamicCols = Object.keys(this.empShortLeaveData[0])
            .filter(key => !['id', 'statusId', 'allowAction', 'date', 'rowNo', 'isExpanded'].includes(key))
            .map(key => {
              let header = key.split(/(?=[A-Z])|_/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
              if (key === 'ccTo') header = 'CC To';
              if (key === 'formattedDate') header = 'Date';

              const isLongText = key.toLowerCase() === 'reason';
              const isStatus = key.toLowerCase() === 'status';

              return {
                key: isLongText ? 'jsonDetails' : (isStatus ? 'jsonDetails1' : key),
                header: header,
                isVisible: true,
                isSortable: true,
                isCustom: isLongText || isStatus
              };
            });

          this.tableHeaders = [
            { key: 'rowNo', header: 'S.no', isVisible: true, isSortable: false },
            ...dynamicCols,
            { key: 'actions', header: 'Action', isVisible: true, isSortable: false, isCustom: true }
          ];

          this.noDatafoundCard = false;
        } else {
          this.empShortLeaveData = [];
          this.totalCount = 0;
          this.tableHeaders = [];
          this.noDatafoundCard = true;
        }
        this.spinner.hide();
        this.loading = false;
        this.cdr.detectChanges();
      },
      (err: HttpErrorResponse) => {
        this.spinner.hide();
        this.loading = false;
        this.handleError(err);
      }
    );
  }

  submitLeaveData() {
    if (this.shortLeaveForm.invalid) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please fill all mandatory fields.' });
      return;
    }

    const formValue = this.shortLeaveForm.value;
    const selectedDate = new Date(formValue.date);
    const formattedDate = selectedDate.toISOString().split('T')[0];

    const reason = formValue.reason.trim();
    const sessionId = formValue.sessionId;
    const ccTo = formValue.ccId?.drpValue || 0;

    this.spinner.show();
    const query = `orgId=${this.orgId}|id=0|action=APPLY|date=${formattedDate}|sessionId=${sessionId}|ccTo=${ccTo}|reason=${reason}|appUserId=${this.userId}`;

    this.userService.SubmitPostTypeNotification(`uspPostShortLeaveApply`, query, this.formlabel).subscribe(
      (res: any) => {
        this.spinner.hide();
        if (res.includes("success")) {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Short Leave applied successfully.' });
          this.visible = false;
          this.resetForm();
          this.getAppliedShortLeave();
        } else {
          this.messageService.add({ severity: 'warn', summary: 'Alert', detail: res || res });
        }
      },
      (err: HttpErrorResponse) => {
        this.spinner.hide();
        this.handleError(err);
      }
    );
  }
  showDialog(data: any, item: any) {
    if (data === 'add') {
      this.visible = true;
      this.header = 'Add Short Leave';
      this.headerIcon = 'pi pi-plus';
      this.resetForm();
    }
  }

  resetForm() {
    this.shortLeaveForm.reset({ date: new Date() });
    if (this.sessionData.length > 0) {
      this.selectSession(this.sessionData[0].drpValue);
    }
  }
  // Unified export method
  exportAsXLSX() {
    if (this.empShortLeaveData.length > 0) {
      this.excelService.exportAsExcelFile(this.empShortLeaveData, 'Short_Leave_History');
    } else {
      this.messageService.add({ severity: 'info', summary: 'No Data', detail: 'No history available to export.' });
    }
  }
  withdrawShortLeave(data: any) {
    this.confirmationService.confirm({
      message: `Are you sure you want to withdraw this short leave request for ${data.formattedDate}?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.spinner.show();
        const query = `orgId=${this.orgId}|id=${data.id}|action=WITHDRAW|date=${data.date}|sessionId=${data.sessionId || 0}|ccTo=${data.ccTo || 0}|reason=${data.reason || ' '}|appUserId=${this.userId}`;

        this.userService.SubmitPostTypeNotification(`uspPostShortLeaveApply`, query, this.formlabel).subscribe(
          (res: any) => {
            this.spinner.hide();
            if (res.includes("success")) {
              this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Short Leave withdrawn successfully.' });
              this.getAppliedShortLeave();
            } else {
              this.messageService.add({ severity: 'warn', summary: 'Alert', detail: res.split("-")[0] || res });
            }
          },
          (err: HttpErrorResponse) => {
            this.spinner.hide();
            this.handleError(err);
          }
        );
      }
    });
  }

  get hasData() {
    return this.empShortLeaveData && this.empShortLeaveData.length > 0;
  }

  getStatusSeverity(status: string): "success" | "info" | "warn" | "danger" | "secondary" {
    if (!status) return 'secondary';
    const s = status.toLowerCase();
    if (s.includes('approve') || s.includes('success')) return 'success';
    if (s.includes('pending') || s.includes('applied')) return 'warn';
    if (s.includes('reject') || s.includes('withdraw')) return 'danger';
    return 'info';
  }

  private handleError(err: HttpErrorResponse) {
    if (err.status === 403) {
      this.customValidation.loginroute(err.status);
    } else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: err.error?.message || 'Something went wrong!' });
    }
  }
}
