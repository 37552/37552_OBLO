import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ConfirmationService, MessageService } from 'primeng/api';

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { TooltipModule } from 'primeng/tooltip';
import { DrawerModule } from 'primeng/drawer';
import { UserService } from '../../shared/user-service';

// Services 

@Component({
  selector: 'app-employee-salary-preparation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    TableModule,
    ButtonModule,
    SelectModule,
    InputTextModule,
    CheckboxModule,
    DialogModule,
    ToastModule,
    DrawerModule,
    ConfirmDialogModule,
    BreadcrumbModule,
    TooltipModule,
    FormsModule
  ],
  providers: [MessageService, ConfirmationService, DatePipe],
  templateUrl: './employee-salary-preparation.html',
  styleUrls: ['./employee-salary-preparation.scss']
})
// Re-trigger compilation
export class EmployeeSalaryPreparation implements OnInit {

  // Forms
  filterForm: FormGroup;
  attendancePresentForm: FormGroup;
  attendanceFhForm: FormGroup;
  attendanceShForm: FormGroup;
  leaveFdForm: FormGroup;
  leaveFhForm: FormGroup;
  leaveShForm: FormGroup;

  // Dropdown Data
  organisation: any[] = [];
  department: any[] = [];
  monthDrp: any[] = [];
  yearDrp: any[] = [];
  siteDrp: any[] = [];
  empDrp: any[] = [];
  projectDataDrp: any[] = [];
  leaveTypeDrp: any[] = [];

  // Table Data
  tblData: any[] = [];
  selectedRows: any[] = [];
  loading: boolean = false;
  noDatafoundCard: boolean = false;
  showTabledata: boolean = false;
  selectAllChecked: boolean = false;

  // UI/Layout
  breadcrumbItems: any[] = [];
  menulabel: string = '';
  FormName: string = '';
  showTotalDays: boolean = false;

  // Calendar / Action Modal
  displayCalendarModal: boolean = false;
  displayActionModal: boolean = false;
  viewDate: Date = new Date();
  monthlyData: any[] = [];
  events: any[] = [];
  selectedEmployee: any = null;
  currentActionView: string = 'ATTENDANCE'; // 'ATTENDANCE' or 'LEAVES'
  currentSubView: string = ''; // 'PRESENT', 'FIRSTHALF', etc.
  actionModalData: any = {};

  // Drawer
  visible: boolean = false;
  drawerSize: string = '60%';
  postType: string = 'Add';


  currentRole: any;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private datePipe: DatePipe,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    // Initialize Forms
    this.filterForm = this.fb.group({
      monthId: [null, Validators.required],
      yearId: [null, Validators.required],
      organisationId: [null, Validators.required],
      projectId: [null],
      empTypeId: [null],
      departmentId: [null],
      totalDays: ['']
    });

    this.attendancePresentForm = this.fb.group({ in: [''], out: [''] });
    this.attendanceFhForm = this.fb.group({ in: [''], out: [''] });
    this.attendanceShForm = this.fb.group({ in: [''], out: [''] });

    this.leaveFdForm = this.fb.group({ fromDate: [''], toDate: [''], sessionFrom: [''], sessionTo: [''], leaveType: [''] });
    this.leaveFhForm = this.fb.group({ fromDate: [''], toDate: [''], sessionFrom: [''], sessionTo: [''], leaveType: [''] });
    this.leaveShForm = this.fb.group({ fromDate: [''], toDate: [''], sessionFrom: [''], sessionTo: [''], leaveType: [''] });
  }

  ngOnInit(): void {
    const sessionMenu = sessionStorage.getItem("menuItem");
    if (sessionMenu) {
      const paramjs = JSON.parse(sessionMenu);
      this.FormName = paramjs.formName;
      this.menulabel = paramjs.menu;
      this.breadcrumbItems = [
        { label: 'Home', routerLink: '/home' },
        { label: this.menulabel },
        { label: this.FormName }
      ];
    }

    this.currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}');

    this.loadDropdowns();
  }

  loadDropdowns() {
    this.getDrpData();
    this.getMonthAndYear();
    this.getDepartmentData();
    this.getSiteData();
    this.getEmpType();
    this.getProjectDrp();
  }

  // --- API Calls for Dropdowns ---

  getDrpData() {
    this.userService.getQuestionPaper('uspGetEmployeeCtcDrp|action=ORG').subscribe({
      next: (res: any) => this.organisation = res['table'],
      error: (err) => this.handleError(err)
    });
  }

  getMonthAndYear() {
    this.userService.getQuestionPaper('uspGetEmployeeCtcDrp|action=MONTH').subscribe({
      next: (res: any) => {
        this.monthDrp = res['table'];
        this.yearDrp = res['table1'];
      },
      error: (err) => this.handleError(err)
    });
  }

  getDepartmentData() {
    this.userService.getQuestionPaper('uspGetDepartmentDetail').subscribe({
      next: (res: any) => this.department = res['table'],
      error: (err) => this.handleError(err)
    });
  }

  getSiteData() {
    this.userService.getQuestionPaper('uspGetFillDrpDown|table=tblOfficeLocationMaster').subscribe({
      next: (res: any) => this.siteDrp = res['table'],
      error: (err) => this.handleError(err)
    });
  }

  getEmpType() {
    this.userService.getQuestionPaper('uspGetFillDrpDown|table=tblEmpTypeMaster').subscribe({
      next: (res: any) => this.empDrp = res['table'],
      error: (err) => this.handleError(err)
    });
  }

  getProjectDrp() {
    const districtId = sessionStorage.getItem('District');
    const userId = sessionStorage.getItem('userId');
    const roleId = this.currentRole.roleId;

    this.userService.getQuestionPaper(`uspGetExpanseMaster|action=COSTCENTER|id=0|districtId=${districtId}|appUserId=${userId}|appUserRole=${roleId}`)
      .subscribe({
        next: (res: any) => this.projectDataDrp = res['table'] || [],
        error: (err) => this.handleError(err)
      });
  }

  // --- Search Logic ---

  onEmpTypeChange(event: any) {
    if (event.value == '10001') {
      this.showTotalDays = true;
    } else {
      this.showTotalDays = false;
      this.filterForm.patchValue({ totalDays: '' });
    }
  }

  onSearch() {
    if (this.filterForm.invalid) {
      this.filterForm.markAllAsTouched();
      this.messageService.add({ severity: 'error', summary: 'Validation', detail: 'Please select required fields.' });
      return;
    }

    this.loading = true;
    this.showTabledata = true;
    this.noDatafoundCard = false;
    this.tblData = [];
    this.selectAllChecked = false;

    const f = this.filterForm.value;
    const districtId = sessionStorage.getItem('District');
    const userId = sessionStorage.getItem('userId');
    const customTotalDays = f.totalDays || 0;

    const data = `month=${f.monthId}|year=${f.yearId}|orgId=${f.organisationId}|projectDetailId=${f.projectId || 0}|empTypeId=${f.empTypeId || 0}|customTotalDays=${customTotalDays}|department=${f.departmentId || 0}|districtId=${districtId}|UserId=${userId}`;

    this.userService.getQuestionPaper(`uspOrganizationalEmployeeSalary|${data}`).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res['table'] && res['table'].length > 0) {
          this.tblData = res['table'].map((item: any) => ({
            ...item,
            isChk: item.check === 'Y', // Assuming 'Y' meant checked/approved or pre-selected
            esicEmployeeAmt: 0,
            esicEmployerAmt: 0,
            pfEmployeeAmt: 0,
            pfEmployerAmt: 0,
            esicEmployeeId: 0,
            esicEmployerId: 0,
            pfEmployeeId: 0,
            pfEmployerId: 0
          }));
        } else {
          this.noDatafoundCard = true;
        }
      },
      error: (err) => {
        this.loading = false;
        this.handleError(err);
      }
    });
  }

  onReset() {
    this.filterForm.reset();
    this.showTabledata = false;
    this.noDatafoundCard = false;
    this.tblData = [];
  }


  get allApproved(): boolean {
    return this.tblData.length > 0 && this.tblData.every(r => r.isChk);
  }

  toggleSelectAll(event: any) {
    const checked = event.checked;
    this.tblData.forEach(r => r.isChk = checked);
  }

  get selectedCount(): number {
    return this.tblData ? this.tblData.filter(r => r.isChk).length : 0;
  }

  onActionToggle() {
    this.displayActionModal = !this.displayActionModal;
  }

  showDialog(type: string) {
    this.postType = type;
    this.visible = true;
    this.filterForm.reset();
  }

  toggleFullScreen() {
    this.drawerSize = this.drawerSize === '60%' ? '100%' : '60%';
  }

  onDrawerHide() {
    this.visible = false;
    this.drawerSize = '60%';
  }

  // --- Calculation Logic ---

  onDeductionChange(row: any, field: string) {
    const value = row[field];
    if (isNaN(value)) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Invalid number' });
      row[field] = 0;
      return;
    }

    if (field === 'otherAllowance' || field === 'otHours') {
      this.calcPfOrEsicForOtherAllowance(row, field);
    } else {
      this.recalculateSalary(row);
    }
  }

  calcPfOrEsicForOtherAllowance(row: any, action: string) {
    this.loading = true;
    const amount = action === 'otherAllowance' ? (row.otherAllowance || 0) : 0; // The stored procedure expects amount for allowance
    const otHours = action === 'otHours' ? (row.otHours || 0) : 0;
    const f = this.filterForm.value;

    const query = `uspCalculatePfEsicOnMonthlyComp|empId=${row.empId}|amount=${amount}|componentId=${row.otherAllowanceId}|month=${f.monthId}|year=${f.yearId}|otHours=${otHours}|paidDays=${row.paidDays}`;

    this.userService.getQuestionPaper(query).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res['table'] && res['table'].length > 0) {
          const data = res['table'][0];
          row.esicEmployeeAmt = data.esicEmployeeAmt;
          row.esicEmployerAmt = data.esicEmployerAmt;
          row.pfEmployeeAmt = data.pfEmployeeAmt;
          row.pfEmployerAmt = data.pfEmployerAmt;
          // Update Ids
          row.esicEmployeeId = data.esicEmployeeId;
          row.esicEmployerId = data.esicEmployerId;
          row.pfEmployeeId = data.pfEmployeeId;
          row.pfEmployerId = data.pfEmployerId;

          row.incentives = data.netOtSalary;

          this.recalculateSalary(row);
        }
      },
      error: (err) => {
        this.loading = false;
        this.handleError(err);
      }
    });
  }

  recalculateSalary(row: any) {
    let base = Number(row.referenceSalary) || 0;
    let otherAllowance = Number(row.otherAllowance) || 0;
    let relocation = Number(row.relocationAllowance) || 0;
    let ta = Number(row.ta) || 0;
    let otherDeduction = Number(row.otherDeduction) || 0;

    let pfEsicDeduction = (row.esicEmployeeAmt || 0) + (row.pfEmployerAmt || 0);
    let otSalary = row.incentives || 0;

    let total = base + otherAllowance + relocation + ta + otSalary - otherDeduction - pfEsicDeduction;

    row.monthlySalary = parseFloat(total.toFixed(2));

    if (row.monthlySalary < 0) {
      this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Salary is negative' });
    }
  }

  // --- Submit Logic ---

  onSubmitCall() {
    const selected = this.tblData.filter(r => r.isChk);
    if (selected.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'Selection', detail: 'Please select at least one employee.' });
      return;
    }

    this.confirmationService.confirm({
      message: 'Are you sure you want to submit salary preparation?',
      header: 'Confirm Submission',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.submitData(selected);
      }
    });
  }

  submitData(selectedRows: any[]) {
    this.loading = true;
    const f = this.filterForm.value;

    // Process details
    const detailData = selectedRows.map(item => ({
      empId: Number(item.empId),
      loanInstallment: Number(item.loanInstallment),
      loanInstallmentId: item.loanInstallmentId,
      relocationAllowance: Number(item.relocationAllowance) || 0,
      relocationAllowanceId: item.relocationAllowanceId,
      ta: Number(item.ta) || 0,
      taId: item.taId,
      otherAllowance: Number(item.otherAllowance) || 0,
      otherAllowanceId: item.otherAllowanceId,
      otherDeduction: Number(item.otherDeduction) || 0,
      otherDeductionId: item.otherDeductionId,
      monthlySalary: Number(item.monthlySalary),
      // PF/ESIC
      esicEmployeeAmt: item.esicEmployeeAmt,
      esicEmployerAmt: item.esicEmployerAmt,
      pfEmployeeAmt: item.pfEmployeeAmt,
      pfEmployerAmt: item.pfEmployerAmt,
      esicEmployeeId: item.esicEmployeeId,
      esicEmployerId: item.esicEmployerId,
      pfEmployeeId: item.pfEmployeeId,
      pfEmployerId: item.pfEmployerId,
      // Others
      arrear: item.totalArrear,
      arrearId: item.arrearId,
      bonusAmount: item.bonusAmount,
      bonusId: item.bonusId
    }));

    const empIds = selectedRows.map(obj => obj.empId).join(',');
    const districtId = sessionStorage.getItem('District');
    const userId = sessionStorage.getItem('userId');
    const customTotalDays = f.totalDays || 0;

    const payload = `month=${f.monthId}|year=${f.yearId}|projectDetailId=${f.projectId || 0}|empTypeId=${f.empTypeId || 0}|customTotalDays=${customTotalDays}|detailsJson=${JSON.stringify(detailData)}|orgId=${f.organisationId}|empId=${empIds}|UserId=${userId}|districtId=${districtId}`;

    this.userService.SubmitPostTypeData(`uspSalaryPreparationInsert`, payload, this.FormName).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res === "Data Saved.-success") {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Data saved successfully' });
          this.onSearch(); // Refresh
          this.cdr.detectChanges();
        } else {
          // Handle funky backend responses like "2-Some Error"
          const parts = res.split('-');
          if (parts[0] === '2') {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: parts[1] });
          } else {
            this.messageService.add({ severity: 'info', summary: 'Info', detail: res });
          }
        }
      },
      error: (err) => {
        this.loading = false;
        this.handleError(err);
      }
    });
    this.cdr.detectChanges();

  }


  openCalendarModal(row: any) {
    this.selectedEmployee = row;
    this.displayCalendarModal = true;
    this.loadCalendarData(row);
  }

  loadCalendarData(row: any) {
    this.loading = true;
    const f = this.filterForm.value;
    const year = this.yearDrp.find(y => y.drpValue == f.yearId)?.drpOption || new Date().getFullYear(); // Need to get value?? Logic used ID directly from form.

    this.userService.getQuestionPaper(`uspEmployeeAttendanceCalendar|empId=${row.empId}`).subscribe({
      next: (res: any) => {
        this.loading = false;
        // logic to process calendar events
        this.monthlyData = res['table'] || [];
      },
      error: () => this.loading = false
    });
  }

  // Helper
  handleError(err: HttpErrorResponse) {
    if (err.status === 403) {
      this.router.navigate(['/login']);

    } else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message || 'An error occurred' });
    }
  }
}
