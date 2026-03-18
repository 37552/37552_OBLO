import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingService } from '../../shared/loading.service';
import { BreadcrumbModule } from "primeng/breadcrumb";
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TableTemplate } from '../../table-template/table-template';
import { CommonModule } from '@angular/common';
import { UserService } from '../../shared/user-service';
import { DialogModule } from 'primeng/dialog';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { DrawerModule } from 'primeng/drawer';
import { TableColumn } from '../../table-template/table-template';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ExcelService } from '../../shared/excel.service';

@Component({
  selector: 'app-leave-application',
  imports: [
    BreadcrumbModule,
    ButtonModule,
    TooltipModule,
    TableTemplate,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    DialogModule,
    DrawerModule,
    SelectModule,
    DatePickerModule,
    TextareaModule,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService, ExcelService],
  templateUrl: './leave-application.html',
  styleUrl: './leave-application.scss'
})
export class LeaveApplication {


  visible: boolean = false;
  header: string = '';
  headerIcon: string = '';
  postType: string = '';

  param: any;
  menulabel: any = '';
  formlable: any = '';

  breadcrumbItems: any[] = [];
  isLoading: boolean = false;
  leaveForm!: FormGroup;
  minDate: Date = new Date(new Date().setDate(new Date().getDate() - 10));

  sessionFrom: any;
  sessionTo: any;
  leaveTypedata: any;
  selectedCc: any;

  constructor(
    private loadingService: LoadingService,
    private router: Router,
    private userService: UserService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private excelService: ExcelService
  ) {
    this.initForm();
  }

  initForm() {
    this.leaveForm = this.fb.group({
      dateFrom: [new Date(), Validators.required],
      dateTo: [new Date(), Validators.required],
      sessionFrom: ['', Validators.required],
      sessionTo: ['', Validators.required],
      leaveType: ['', Validators.required],
      ccTo: [null],
      reason: ['', [Validators.required, Validators.minLength(12), Validators.maxLength(200)]]
    });
  }

  ngOnInit(): void {
    this.loadingService.startLoading();
    this.param = sessionStorage.getItem('menuItem');
    if (this.param) {
      let paramjs = JSON.parse(this.param);
      this.menulabel = paramjs.menu;
      this.formlable = paramjs.formName;
    }

    this.breadcrumbItems = [
      { label: 'Home', routerLink: '/home' },
      { label: this.menulabel, routerLink: '/ess' },
      { label: this.formlable }
    ];
    this.loadingService.stopLoading();
    this.getViewData();
    this.getDrpData();
  }


  getAttendanceData() {
    this.loadingService.startLoading();
    this.loadingService.stopLoading();
  }

  sessionDrp: any;
  ccDrp: any;
  leaveTypeDrp: any;
  leaveStatus: any;

  getDrpData() {
    this.userService.getQuestionPaper(`uspLeaveApplyGetDrp|UserId=${sessionStorage.getItem('userId')}`).subscribe((res: any) => {
      this.sessionDrp = res['table3'];
      this.ccDrp = res['table2'];
      this.leaveTypeDrp = res['table'];
      this.leaveStatus = res['table1'][0].drpValue;

      // Set defaults if chips aren't selected
      if (this.sessionDrp?.length > 0) {
        this.selectSessionFrom(this.sessionDrp[0].drpValue);
        this.selectSessionTo(this.sessionDrp[0].drpValue);
      }
      if (this.leaveTypeDrp?.length > 0) {
        this.selectLeaveType(this.leaveTypeDrp[0].drpValue);
      }
    });
  }

  selectSessionFrom(val: any) {
    this.sessionFrom = val;
    this.leaveForm.patchValue({ sessionFrom: val });
  }

  selectSessionTo(val: any) {
    this.sessionTo = val;
    this.leaveForm.patchValue({ sessionTo: val });
  }

  selectLeaveType(val: any) {
    this.leaveTypedata = val;
    this.leaveForm.patchValue({ leaveType: val });
  }

  onDateFromChange() {
    const from = this.leaveForm.get('dateFrom')?.value;
    const to = this.leaveForm.get('dateTo')?.value;
    if (from && to && from > to) {
      this.leaveForm.patchValue({ dateTo: from });
    }
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

  noDatafoundCard: boolean = false;
  tblData: any[] = [];
  tableHeaders: any[] = [];

  getViewData(showLoader: boolean = true) {
    if (showLoader) {
      this.isLoading = true;
      this.loadingService.startLoading();
    }
    this.userService.getQuestionPaper(`uspGetLeaveApplyData|userId=${sessionStorage.getItem('userId')}`).subscribe((res: any) => {
      if (Object.keys(res).length === 0) {
        setTimeout(() => {
          this.noDatafoundCard = true;
          this.isLoading = false;
          this.loadingService.stopLoading();
        }, 1000);
      }
      else {
        setTimeout(() => {
          this.tblData = res['table'];
          this.totalCount = this.tblData.length;
          if (this.tblData.length > 0) {
            const dynamicCols = Object.keys(this.tblData[0])
              .filter(key => key.toLowerCase() !== 'id')
              .map(key => {
                const header = key.split(/(?=[A-Z])|_/).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                const isLongText = key.toLowerCase() === 'reason' || key.toLowerCase() === 'remarks';
                return {
                  key: isLongText ? 'jsonDetails' : key,
                  header: header,
                  isVisible: true,
                  isSortable: true,
                  isCustom: isLongText
                };
              });

            this.tableHeaders = [
              { key: 'rowNo', header: 'S.no', isVisible: true, isSortable: false },
              ...dynamicCols,
              { key: 'actions', header: 'Action', isVisible: true, isSortable: false, isCustom: true }
            ];

            // Add row numbers and expansion state to data
            this.tblData = this.tblData.map((item, index) => ({
              ...item,
              rowNo: index + 1,
              isExpanded: false
            }));
          }
          if (this.tblData.length <= 0) {
            this.noDatafoundCard = true;
            this.isLoading = false;
            this.loadingService.stopLoading();
          }
          else {
            this.noDatafoundCard = false;
            this.isLoading = false;
            this.loadingService.stopLoading();
          }
        }, 0);
      }
    })
  }
  onDrawerHide() {
    this.visible = false;
  }

  showDialog(type: string, data: any) {
    this.visible = true;
    this.header = type == 'add' ? 'Add Leave Application' : 'Edit Leave Application';
    this.headerIcon = type == 'add' ? 'pi pi-plus' : 'pi pi-pencil';
    this.postType = type;
    if (type == 'edit') {
      //this.editData = data;
    }
  }


  onSubmit() {
    if (this.leaveForm.invalid) {
      this.leaveForm.markAllAsTouched();
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please fill all required fields correctly.' });
      return;
    }

    this.confirmationService.confirm({
      message: 'Are you sure you want to submit this leave application?',
      header: 'Confirm Submission',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const formVal = this.leaveForm.value;
        const formatDate = (date: Date) => {
          const d = new Date(date);
          return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
        };

        const query = [
          `leaveStatus=${this.leaveStatus}`,
          `dateFrom=${formatDate(formVal.dateFrom)}`,
          `dateTo=${formatDate(formVal.dateTo)}`,
          `sessionFrom=${formVal.sessionFrom}`,
          `sessionTo=${formVal.sessionTo}`,
          `leaveType=${formVal.leaveType}`,
          `leaveReason=${formVal.reason}`,
          `ccTo=${formVal.ccTo?.drpValue || ''}`,
          `userId=${sessionStorage.getItem('userId')}`
        ].join('|');

        this.loadingService.startLoading();
        this.userService.SubmitPostTypeNotification(`uspLeaveApplySubmit`, query, this.formlable).subscribe((res: any) => {
          this.loadingService.stopLoading();
          if (res && res.includes("Data Saved.-success")) {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: res ? res : 'Data saved successfully!' });
            this.visible = false;
            const sFrom = this.sessionDrp?.[0]?.drpValue;
            const sTo = this.sessionDrp?.[0]?.drpValue;
            const lType = this.leaveTypeDrp?.[0]?.drpValue;

            this.leaveForm.reset({
              dateFrom: new Date(),
              dateTo: new Date(),
              sessionFrom: sFrom,
              sessionTo: sTo,
              leaveType: lType
            });

            this.sessionFrom = sFrom;
            this.sessionTo = sTo;
            this.leaveTypedata = lType;

            this.getViewData();
          } else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: res });
          }
        });
      }
    });
  }

  onWithdraw(id: any) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to withdraw this leave application?',
      header: 'Confirm Withdrawal',
      icon: 'pi pi-info-circle',

      accept: () => {

        this.loadingService.startLoading();

        const orgId = sessionStorage.getItem('Organization');
        const query = `orgid=${orgId}|leaveId=${id}|appUserId=${sessionStorage.getItem('userId')}`;

        this.userService
          .SubmitPostTypeNotification('uspPostLeaveWithdraw', query, this.formlable)
          .subscribe({

            next: (res: any) => {

              if (res && res.includes("Data Saved.-success")) {

                this.messageService.add({
                  severity: 'success',
                  summary: 'Success',
                  detail: res ? res : 'Your leave application has been withdrawn successfully!'
                });

                // refresh table
                this.getViewData();

              } else {

                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: res || 'Something went wrong please try again later'
                });

              }

            },

            error: () => {

              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Something went wrong please try again later'
              });

            },

            complete: () => {
              this.loadingService.stopLoading();
            }

          });

      },

      reject: () => {

        this.messageService.add({
          severity: 'warn',
          summary: 'Cancelled',
          detail: 'You have cancelled your leave application withdrawal'
        });

      }
    });
  }

  pageNo: number = 1;
  pageSize: number = 10;
  totalCount: number = 0;
  searchText: string = '';
  onPageChange(newPage: number) {
    this.pageNo = newPage;
    this.getViewData(true);
  }

  onPageSizeChange(newSize: number) {
    this.pageSize = newSize;
    this.pageNo = 1;
    this.getViewData(true);
  }

  onSearchChange(search: string) {
    this.searchText = search;
    this.pageNo = 1;
    this.getViewData(false);
  }

  exportAsXLSXCustom(): void {
    const fileName = this.formlable || 'Leave_Applications';
    const excelArr = this.tblData.map((data, index) => {
      return {
        'S.No.': index + 1,
        'Date From': data['date From'] || data.dateFrom,
        'Date To': data['date To'] || data.dateTo,
        'From Session': data['from Session'] || data.fromSession,
        'To Session': data['to Session'] || data.toSession,
        'Leave Type': data['leave Type'] || data.leaveType,
        'Reason': data['reason'] || data.reason,
        'Cc To': data['cc To'] || data.ccTo,
        'Status': data['leave Status'] || data.leaveStatus
      };
    });
    this.excelService.exportAsExcelFile(excelArr, fileName);
  }
}
