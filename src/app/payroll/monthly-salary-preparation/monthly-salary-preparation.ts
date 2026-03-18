import { Component, OnInit, ChangeDetectorRef, ViewChild, TemplateRef } from '@angular/core';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { PopoverModule } from 'primeng/popover';
import { SelectModule } from 'primeng/select';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { DrawerModule } from 'primeng/drawer';
import { UserService } from '../../shared/user-service';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CheckboxModule } from 'primeng/checkbox';
import { CommonModule, DatePipe } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SplitButtonModule } from 'primeng/splitbutton';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import moment from 'moment';
import { TableTemplate } from '../../table-template/table-template';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-monthly-salary-preparation',
  imports: [
    BreadcrumbModule,
    DatePickerModule,
    DrawerModule,
    ButtonModule,
    DialogModule,
    SelectModule,
    InputTextModule,
    TableModule,
    PopoverModule,
    ReactiveFormsModule,
    ToastModule,
    ConfirmDialogModule,
    CheckboxModule,
    CommonModule,
    SplitButtonModule,
    TabsModule,
    FormsModule,
    TagModule,
    TableTemplate,
    MessageModule,
  ],
  providers: [MessageService, ConfirmationService, DatePipe],
  templateUrl: './monthly-salary-preparation.html',
  styleUrl: './monthly-salary-preparation.scss',
})
export class MonthlySalaryPreparation {


  breadcrumbItems: any[] = [];
  param: any = '';
  FormName = '';
  FormValue = '';
  menulabel = '';
  header = '';
  headerIcon = '';

  postType: string = '';
  selectedItem: any = null;
  organisation: any[] = [];
  employeeDrp: any[] = [];
  salaryPrepration!: FormGroup;

  visible: boolean = false;
  isLoading: boolean = false;

  // Active tab for earnings/deductions
  activeTab: string = '0';

  // New Properties
  pfExcmptionDrp: any[] = [];
  esicDrp: any[] = [];
  earningTable: any[] = [];
  deductionTable: any[] = [];
  previousEarnings: any[] = [];
  previousDeductions: any[] = [];
  previousCtc: any[] = [];

  pfJson: any[] = [];
  esicJson: any[] = [];
  dataOnProceed: any[] = [];

  netSalary: number = 0;
  grossSalary: number = 0;
  ctcSalary: number = 0;

  loanAmount: number = 0;
  loanDuration: number = 0;
  monthlyInstallment: number = 0;
  effectiveLoanDate!: Date;
  minEffectiveDate!: Date;

  disableProceed: boolean = false;
  disableSubmit: boolean = true;

  professionalTax: boolean = false;
  lfwEmployee: boolean = false;
  lfwEmployer: boolean = false;
  changeTds: boolean = false;

  salarydetailArray: any[] = [];
  loanDetailArray: any[] = [];
  monthlyVal: any;
  noDatafoundLoanDtl: boolean = false;

  salaryDialogVisible: boolean = false;
  loanDialogVisible: boolean = false;
  loanInputDialogVisible: boolean = false;
  printDialogVisible: boolean = false;

  // Table Properties
  tblData: any[] = [];
  tableHeaders: any[] = [];
  pageSize: number = 10;
  pageNo: number = 1;
  totalCount: number = 0;

  printContentSafe: SafeHtml | null = null;
  printContentString: string = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private datePipe: DatePipe,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
  ) {
    this.salaryPrepration = this.fb.group({
      organisationId: ['', Validators.required],
      employeeId: ['', Validators.required],
      // monthlySalary: ['', [Validators.required, Validators.pattern('^[0-9]+(\.[0-9]+)?$')]],
      pfExemptionId: ['', Validators.required],
      effectiveFrom: ['', Validators.required],
      esicExemptionId: ['', Validators.required],
      ProjectDetails: [''],
      calculationOnBasic: [false],
    });
  }

  // ================= UI State =================
  isMaximized: boolean = false;

  toggleMaximize(): void {
    this.isMaximized = !this.isMaximized;
  }

  getDrawerWidth(): string {
    return this.isMaximized ? '100%' : '60%';
  }

  ngOnInit(): void {
    this.param = sessionStorage.getItem('menuItem');
    if (this.param) {
      const paramjs = JSON.parse(this.param);
      this.FormName = paramjs.formName;
      this.FormValue = paramjs.formValue;
      this.menulabel = paramjs.menu;

      this.breadcrumbItems = [
        { label: 'Home', routerLink: '/home' },
        { label: this.menulabel },
        { label: this.FormName, disabled: true },
      ];
    }
    this.getData();
    this.getOrgData();
    this.getPfExcmptionDrp();
    this.getEsicExcmptionDrp();
  }

  showDialog(mode: 'add' | 'update', data?: any): void {
    this.getProjectDrp();

    this.visible = true;
    this.postType = mode;
    this.isMaximized = false; // Reset maximize state
    this.salaryPrepration.reset();
    this.activeTab = '0'; // Reset to earnings tab

    if (mode === 'add') {
      this.header = this.FormName;
      this.headerIcon = 'pi pi-plus-circle';
      this.selectedItem = null;
      this.setDrpData();
    }

    if (mode === 'update' && data) {
      this.header = 'Update ' + this.FormName;
      this.headerIcon = 'pi pi-pencil';
      this.selectedItem = data;
    }
  }

  getOrgData() {
    this.userService.getQuestionPaper('uspGetEmployeeCtcDrp|action=ORG').subscribe((res: any) => {
      this.organisation = res['table'];
    });
  }

  projectDataDrp: any[] = [];
  getProjectDrp() {
    this.userService
      .getQuestionPaper(
        `uspGetExpanseMaster|action=COSTCENTER|id=0|districtId=${sessionStorage.getItem('District')}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId}`,
      )
      .subscribe((res: any) => {
        this.projectDataDrp = res['table'] || [];
      });
  }

  getPfExcmptionDrp() {
    this.userService.getQuestionPaper(`uspGetEmployeeCtcDrp|action=PF`).subscribe((res: any) => {
      this.pfExcmptionDrp = res['table'];
    });
  }

  getEsicExcmptionDrp() {
    this.userService.getQuestionPaper(`uspGetEmployeeCtcDrp|action=ESIC`).subscribe((res: any) => {
      this.esicDrp = res['table'];
    });
  }

  onDrawerHide() {
    this.visible = false;
  }

  getEmployeeDrp(event: any) {
    const projectDetailId = this.salaryPrepration.get('ProjectDetails')?.value || 0;
    const orgId = this.salaryPrepration.get('organisationId')?.value;

    this.userService
      .getQuestionPaper(
        `uspGetEmployeeCtcDrp|action=EMPLOYEE|orgId=${orgId}|projectDetailId=${projectDetailId}`
      )
      .subscribe((res: any) => {
        setTimeout(() => {
          this.employeeDrp = res['table'];
        });
      });
  }

  getPreviousCtc(event: any) {
    this.isLoading = true;
    this.previousEarnings = [];
    this.previousDeductions = [];
    // Use event.value if from PrimeNG dropdown, or event.target.value if standard input.
    // PrimeNG p-select onChange emits object with 'value' property or just value?
    // Usually event.value in newer PrimeNG. Let's assume event.value or event.
    const empId = event.value || event;

    this.userService
      .getQuestionPaper(`uspGetEmpMonthlySalaryData|action=PREVIOUSCTC|empId=${empId}`)
      .subscribe(
        (res: any) => {
          if (res.table && res.table.length) {
            this.salaryPrepration.patchValue({
              pfExemptionId: res.table[0]['pfId'],
              effectiveFrom: res.table[0]['effectiveDate']
                ? new Date(res.table[0]['effectiveDate'])
                : null,
              esicExemptionId: res.table[0]['esicId'],
              calculationOnBasic: res.table[0]['calculationOnBasic'],
            });

            this.obchagePfOrEsic();
            this.getLoanDetails(empId);

            this.previousCtc = res['table'].map((emp: any) => {
              return {
                ...emp,
                earnings: emp.earnings ? JSON.parse(emp.earnings) : [],
                deductions: emp.deductions ? JSON.parse(emp.deductions) : [],
              };
            });
          } else {
            this.previousCtc = [];
            // this.gotoFirstTab() // Not needed if we don't have tabs
            this.setDrpData();
            this.salaryPrepration.patchValue({
              effectiveFrom: '',
              calculationOnBasic: false,
            });
            this.isLoading = false;
          }
        },
        (err) => {
          this.isLoading = false;
        },
      );
  }

  setDrpData() {
    this.isLoading = true;
    this.salaryPrepration.patchValue({
      pfExemptionId: 10000, // Assuming IDs are numbers, snippet had strings '10000'. PrimeNG might handle both if options match.
      esicExemptionId: 10001,
    });
    this.netSalary = 0;
    this.grossSalary = 0;
    this.disableProceed = false;
    this.disableSubmit = true;

    // Simulate delay or waiting for dropdowns
    setTimeout(() => {
      this.getsalaryComponent('Earning');
      this.getsalaryComponent('Deduction');
      this.isLoading = false;
    }, 1000);
  }

  clearData() {
    this.salaryPrepration.reset();
    this.employeeDrp = [];
    this.earningTable = [];
    this.deductionTable = [];
  }

  obchagePfOrEsic() {
    this.earningTable = [];
    this.deductionTable = [];
    this.grossSalary = 0;
    this.netSalary = 0;
    this.changeTds = false;
    this.lfwEmployee = false;
    this.lfwEmployer = false;
    this.professionalTax = false;
    // this.gotoFirstTab();
    this.getsalaryComponent('Earning');
    this.getsalaryComponent('Deduction');
  }

  getsalaryComponent(action: string) {
    let structType = action == 'Earning' ? '10000' : '10001';
    let pfId = this.salaryPrepration.get('pfExemptionId')?.value;
    let esicId = this.salaryPrepration.get('esicExemptionId')?.value;

    // Ensure dropdowns are loaded
    const selectedOptionPf = this.pfExcmptionDrp.find((option) => option.drpValue == pfId);
    const selectedOptionEsic = this.esicDrp.find((option) => option.drpValue == esicId);

    // If PF/ESIC not selected yet, maybe default or return?
    // Snippet assumes they are set.

    this.userService
      .getQuestionPaper(
        `uspGetEmployeeCtcDrp|action=COMPONENT|slryStrctTypeId=${structType}|pfId=${pfId}|esicId=${esicId}`,
      )
      .subscribe(
        (res: any) => {
          if (action == 'Earning') {
            this.earningTable = res['table'];
            this.earningTable.forEach((item) => {
              item['amount'] = 0; // Number
              item['isPfDisable'] = true;
              item['isEsicDisble'] = true;
              // Add other properties if needed (checked, pfChk, esicChk)
              item['pfChk'] = item['pf'] == 1 || item['pf'] === true;
              item['esicChk'] = item['esic'] == 1 || item['esic'] === true;
            });

            if (this.previousCtc && this.previousCtc.length > 0) {
              this.earningTable?.map((e1, index) => {
                const match = this.previousCtc[0].earnings.find(
                  (e: any) => e.slryCompntId === e1.drpValue,
                );
                this.earningTable[index].amount = match ? match.amount : 0;
                this.earningTable[index].previousAmount = match ? match.previousAmount : 0;
              });
              this.previousEarnings = this.earningTable;
            }
            this.cdr.detectChanges();
          } else {
            this.deductionTable = res['table'];
            this.deductionTable.forEach((item) => {
              item['amount'] = 0;
              item['isPfDisable'] = true;
              item['isEsicDisble'] = true;
              item['pfChk'] = item['pf'] == 1 || item['pf'] === true;
              item['esicChk'] = item['esic'] == 1 || item['esic'] === true;
            });

            if (this.previousCtc && this.previousCtc.length > 0) {
              this.deductionTable?.map((e1, index) => {
                const match = this.previousCtc[0].deductions.find(
                  (e: any) => e.slryCompntId === e1.drpValue,
                );
                this.deductionTable[index].amount = match ? match.amount : 0;
                this.deductionTable[index].previousAmount = match ? match.previousAmount : 0;
              });
              this.previousDeductions = this.deductionTable;
            }
            this.cdr.detectChanges();
          }
        },
        (err: HttpErrorResponse) => {
          this.isLoading = false;
        },
      );
  }

  get f() {
    return this.salaryPrepration.controls;
  }

  isInvalid(controlName: string): boolean {
    const control = this.salaryPrepration.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit() {
    if (this.salaryPrepration.valid) {
      this.validateSubmitModal();
    } else {
      this.salaryPrepration.markAllAsTouched();
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill all required fields.',
      });
    }
  }

  getRowActions(row: any): any[] {
    return [
      {
        label: 'Edit',
        icon: 'pi pi-pencil',
        command: () => this.showDialog('update', row),
      },
      {
        label: 'Delete',
        icon: 'pi pi-trash',
        command: () => this.onDelete(row),
      },
    ];
  }

  openSalaryDetail(details: any) {
    if (typeof details === 'string') {
      try {
        this.salarydetailArray = JSON.parse(details);
      } catch (e) {
        this.salarydetailArray = [];
      }
    } else {
      this.salarydetailArray = details || [];
    }
    this.salaryDialogVisible = true;
  }

  calculateSalary() {
    const totalEarning = this.earningTable.reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0,
    );
    const totalDeduction = this.deductionTable.reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0,
    );
    // this.grossSalary = totalEarning; // Optional: update display if needed immediate feedback
  }

  getJsonOfPfandEsic() {
    this.isLoading = true;

    this.dataOnProceed = [];
    this.dataOnProceed = [];
    const basicRow = this.earningTable?.find((row) => row.drpValue === 10000);
    // DEBUG LOGS
    console.log('getJsonOfPfandEsic called');
    console.log('Earning Table:', this.earningTable);
    console.log('Basic Row:', basicRow);

    let basicVal = basicRow ? basicRow['amount'] : 0;
    console.log('Basic Value:', basicVal);





    const totalEarningAmount = this.earningTable.reduce((sum, obj) => sum + Number(obj.amount), 0);
    this.pfJson = this.earningTable?.filter((row) => row.pf === true);
    let pfSum = this.pfJson.reduce(
      (accumulator, current) => accumulator + Number(current.amount),
      0,
    );
    this.esicJson = this.earningTable?.filter((row) => row.esic === true);
    let totalEsicAmount = 0;

    let basicAmount = basicVal;
    let pfId = this.salaryPrepration.get('pfExemptionId')?.value;
    let esicId = this.salaryPrepration.get('esicExemptionId')?.value;

    let drpValue = this.salaryPrepration.get('employeeId')?.value;

    const rawDate = this.salaryPrepration.get('effectiveFrom')?.value;
    if (!rawDate || !moment(rawDate).isValid()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Alert',
        detail: 'Effective Date is required and must be valid!',
      });
      this.isLoading = false;
      return;
    }
    const effectiveDateOrg = moment(rawDate).format('YYYY-MM-DD');

    let Conveyanceval = this.earningTable.find((obj) => obj.drpValue === 10002) || { amount: 0 };
    let washingVal = this.earningTable.find((obj) => obj.drpValue === 10013) || { amount: 0 };
    let statutoryBonus = this.earningTable.find((obj) => obj.drpValue === 10014) || { amount: 0 };

    totalEsicAmount =
      totalEarningAmount - (Number(Conveyanceval.amount) + Number(washingVal.amount));

    let isBasic = this.salaryPrepration.get('calculationOnBasic')?.value == true ? 1 : 0;

    const resdataOrg: any = {};
    const taxUrl = `uspEmployeeTaxDeductionSource|effectiveDate=${effectiveDateOrg}|MonthlyGross=${totalEarningAmount}|empId=${drpValue}`;
    console.log('Calling Tax API:', taxUrl);

    this.userService
      .getQuestionPaper(taxUrl)
      .subscribe((resdata: any) => {
        console.log('Tax API Response:', resdata);
        if (resdata['table'] && resdata['table'].length) {
          resdataOrg['table'] = resdata['table'];
        }
      }, err => console.error('Tax API Error:', err));

    setTimeout(() => {
      const calcUrl = `uspGetPfEsicCalculation|pfOnAmount=${pfSum}|esicOnAmount=${totalEsicAmount}|bonus=${statutoryBonus.amount}|grossSalary=${totalEarningAmount}|basicSalary=${basicAmount}|pfId=${pfId}|esicId=${esicId}|calculationOnBasic=${isBasic}|empId=${drpValue}`;
      console.log('Calling Calculation API:', calcUrl);

      this.userService
        .getQuestionPaper(calcUrl)
        .subscribe(
          (res: any) => {
            if (res['table'] && res['table'].length) {
              this.dataOnProceed = res['table'];

              this.deductionTable?.forEach((element, index) => {
                if (element.drpValue == res['table'][0]['esicEmployeeId']) {
                  this.deductionTable[index].amount = res['table'][0]['esicEmployeeAmt'];
                  this.deductionTable[index].isDisabled = true;
                }
                if (element.drpValue == res['table'][0]['esicEmployerId']) {
                  this.deductionTable[index].amount = res['table'][0]['esicEmployerAmt'];
                  this.deductionTable[index].isDisabled = true;
                }
                if (element.drpValue == res['table'][0]['pfEmployeeId']) {
                  this.deductionTable[index].amount = res['table'][0]['pfEmployeeAmt'];
                  this.deductionTable[index].isDisabled = true;
                }
                if (element.drpValue == res['table'][0]['pfEmployerId']) {
                  this.deductionTable[index].amount = res['table'][0]['pfEmployerAmt'];
                  this.deductionTable[index].isDisabled = true;
                }
                if (element.drpValue == res['table'][0]['gratuityId']) {
                  this.deductionTable[index].amount = res['table'][0]['gratuityAmt'];
                  this.deductionTable[index].isDisabled = true;
                }
                if (element.drpValue == res['table'][0]['leavesId']) {
                  this.deductionTable[index].amount = res['table'][0]['leavesAmt'];
                  this.deductionTable[index].isDisabled = true;
                }

                if (element.drpValue == res['table'][0]['professionalTaxId']) {
                  if (!this.professionalTax) {
                    this.deductionTable[index].amount = res['table'][0]['professionalTax'];
                  }
                }
                if (element.drpValue == res['table'][0]['employeeLwfId']) {
                  if (!this.lfwEmployee) {
                    this.deductionTable[index].amount = res['table'][0]['employeeLwf'];
                  }
                }
                if (element.drpValue == res['table'][0]['employerLwfId']) {
                  if (!this.lfwEmployer) {
                    this.deductionTable[index].amount = res['table'][0]['employerLwf'];
                  }
                }
                if (
                  resdataOrg['table'] &&
                  resdataOrg['table'].length &&
                  element.drpValue == resdataOrg['table'][0]['employeeTdsId']
                ) {
                  if (!this.changeTds) {
                    this.deductionTable[index].amount = resdataOrg['table'][0]['monthlyTDS'];
                  }
                }
              });

              const excludedIds = [10010, 10011, 10026, 10006];
              const totalDedAmtWithExcludeId = this.deductionTable
                .filter((item) => !excludedIds.includes(item.drpValue))
                .reduce((sum, obj) => sum + Number(obj.amount), 0);
              const totalDeductionAmount = this.deductionTable
                .filter((item) => excludedIds.includes(item.drpValue))
                .reduce((sum, obj) => sum + Number(obj.amount), 0);

              this.netSalary = totalEarningAmount - totalDedAmtWithExcludeId;
              this.grossSalary = totalEarningAmount;
              this.ctcSalary = totalEarningAmount + totalDeductionAmount;

              setTimeout(() => {
                this.isLoading = false;
                this.disableSubmit = false;
                this.disableProceed = true;
              }, 500);
            } else {
              this.isLoading = false;
            }
          },
          (err: HttpErrorResponse) => {
            this.isLoading = false;
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Calculation failed',
            });
          },
        );
    }, 1000);
  }

  validateSubmitModal() {
    if (this.salaryPrepration.invalid) {
      this.salaryPrepration.markAllAsTouched();
      return;
    }

    if (this.grossSalary == 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Alert',
        detail: 'Gross salary should not be 0!',
      });
      return;
    }
    if (this.grossSalary < 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Alert',
        detail: 'Gross salary should not be negative!',
      });
      return;
    }
    if (this.netSalary < 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Alert',
        detail: 'Net salary should not be negative!',
      });
      return;
    }
    if (this.netSalary > this.grossSalary) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Alert',
        detail: 'Net Salary should not be greater than gross salary!',
      });
      return;
    }

    let earningData = this.earningTable.map((item) => ({ ...item, slryStructTypeId: 10000 }));
    let deductionData = this.deductionTable.map((item) => ({ ...item, slryStructTypeId: 10001 }));

    let mergeArray = [...earningData, ...deductionData];
    let newArray = mergeArray.map((item) => ({
      slryStructTypeId: item.slryStructTypeId,
      slryCompntId: item.drpValue,
      amount: Number(item.amount),
      pf: item.pfChk ? 1 : 0,
      esic: item.esicChk ? 1 : 0,
    }));

    let orgId = this.salaryPrepration.get('organisationId')?.value;
    let empId = this.salaryPrepration.get('employeeId')?.value;
    let effectiveDate = moment(this.salaryPrepration.get('effectiveFrom')?.value).format(
      'YYYY-MM-DD',
    );
    let pfId = this.salaryPrepration.get('pfExemptionId')?.value;
    let esicId = this.salaryPrepration.get('esicExemptionId')?.value;
    let isBasic = this.salaryPrepration.get('calculationOnBasic')?.value == true ? 1 : 0;

    if (!this.dataOnProceed || !this.dataOnProceed.length) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please click Proceed/Calculate first.',
      });
      return;
    }

    let pfEmployee = this.dataOnProceed[0].pfEmployeeAmt;
    let pfEmployer = this.dataOnProceed[0].pfEmployerAmt;
    let esicEmployee = this.dataOnProceed[0].esicEmployeeAmt;
    let esicEmployer = this.dataOnProceed[0].esicEmployerAmt;

    let data = `pfEmployee=${pfEmployee}|pfEmployer=${pfEmployer}|esicEmployee=${esicEmployee}|esicEmployer=${esicEmployer}|gross=${this.grossSalary}|pfSalary=${this.dataOnProceed[0].pfSalary}|esicSalary=${this.dataOnProceed[0].esicSalary}|fpsPfAmt=${this.dataOnProceed[0].fpsPfAmt}|diffPfAmt=${this.dataOnProceed[0].diffPfAmt}|adminPfAmt=${this.dataOnProceed[0].adminPfAmt}|edliPfAmt=${this.dataOnProceed[0].edliPfAmt}|fpsSalary=${this.dataOnProceed[0].fpsSalary}|edliSalary=${this.dataOnProceed[0].edliSalary}`;
    this.paramvaluedata = `ctc=${this.ctcSalary}|salary=${this.netSalary}|orgId=${orgId}|empId=${empId}|pfId=${pfId}|esicId=${esicId}|effectiveDate=${effectiveDate}|detailsJson=${JSON.stringify(newArray)}|appUserId=${sessionStorage.getItem('userId')}|calculationOnBasic=${isBasic}|${data}`;

    this.openConfirmDialog('Confirm?', 'Are you sure you want to Submit?', '1', '1');
  }

  submitCall(payload?: string) {
    this.isLoading = true;
    const data = payload || this.paramvaluedata;
    this.userService
      .SubmitPostTypeData(`uspPostEmployeeMonthlySalary`, data, this.FormName)
      .subscribe(
        (datacom: any) => {
          this.isLoading = false;
          if (datacom != '') {
            if (datacom.includes && datacom.includes('success')) {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Data Submit Successfully.',
              });
              this.getData();
              this.onDrawerHide();
              this.clearData();
            } else if (datacom.startsWith && datacom.startsWith('2-')) {
              this.messageService.add({
                severity: 'error',
                summary: 'Alert',
                detail: datacom.split('-')[1],
              });
            } else {
              this.messageService.add({ severity: 'warn', summary: 'Alert', detail: datacom });
            }
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Something went wrong!',
            });
          }
        },
        (err: HttpErrorResponse) => {
          this.isLoading = false;
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message });
        },
      );
  }

  getPreviousEarningAmount(id: any) {
    return this.previousEarnings.find((x) => x.drpValue === id)?.amount ?? '-';
  }
  getPreviousDeductionAmount(id: any) {
    return this.previousDeductions.find((x) => x.drpValue === id)?.amount ?? '-';
  }

  getLoanDetails(empId: any) {
    this.userService
      .getQuestionPaper(`uspGetEmpMonthlySalaryData|action=LOAN|empId=${empId}`)
      .subscribe(
        (res: any) => {
          if (res && res.table && res.table.length) {
            this.loanDetailArray = res.table;
            // Parse loan data and display in dialog
            if (this.loanDetailArray.length > 0) {
              const firstLoan = this.loanDetailArray[0];
              this.loanAmount = firstLoan.loanAmount || 0;
              this.loanDuration = firstLoan.loanDuration || 0;
              this.monthlyInstallment = firstLoan.monthlyInstallment || 0;
              if (firstLoan.effectiveFrom) {
                this.effectiveLoanDate = new Date(firstLoan.effectiveFrom);
              }
            }
          } else {
            this.loanDetailArray = [];
          }
        },
        (err: HttpErrorResponse) => {
          console.error('Error loading loan details', err);
        },
      );
  }

  // Open loan detail view modal
  openLoanDetail(data: any) {
    this.currentLoanData = data;

    // Parse loan detail array if it's a string
    if (typeof data === 'string') {
      try {
        this.loanDetailArray = JSON.parse(data);
      } catch (e) {
        this.loanDetailArray = [];
      }
    } else {
      this.loanDetailArray = data || [];
    }

    // Set minimum effective date for new loans
    const today = new Date();
    const firstDayNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    this.minEffectiveDate = firstDayNextMonth;

    this.loanDialogVisible = true;
  }

  // Open loan input dialog for data entry
  onOpenLoanDetail(data: any) {
    this.selectedItem = data;
    this.currentLoanData = data;

    // Initialize loan input fields
    this.loanAmount = 0;
    this.loanDuration = 0;
    this.monthlyInstallment = 0;

    // Set minimum effective date to first day of next month
    const today = new Date();
    const firstDayNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    this.effectiveLoanDate = firstDayNextMonth;
    this.minEffectiveDate = firstDayNextMonth;

    this.loanInputDialogVisible = true;
  }

  getData() {
    this.isLoading = true;
    const appUserId = sessionStorage.getItem('userId');
    const currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
    const appUserRole = currentRole.roleId;
    const params = `uspGetEmpMonthlySalaryData|action=ALL|appUserId=${appUserId}|appUserRole=${appUserRole}|activity=''|districtId=0|searchText=${this.searchText}|pageIndex=${this.pageNo}|size=${this.pageSize}`;

    this.userService.getQuestionPaper(params).subscribe(
      (res: any) => {
        this.isLoading = false;
        if (res.table1 && res.table1.length) {
          this.tblData = res.table1;

          // Define headers explicitly
          this.tableHeaders = [
            { key: 'actions', header: 'Action', isVisible: true, isSortable: false, isCustom: true },
            { key: 'rowNo', header: 'S.No', isVisible: true, isSortable: false },
            { key: 'employee', header: 'Employee Name', isVisible: true, isSortable: false },
            { key: 'organisation', header: 'Organisation', isVisible: true, isSortable: false },
            { key: 'designation', header: 'Designation', isVisible: true, isSortable: false },
            { key: 'ctc', header: 'CTC', isVisible: true, isSortable: false },
            { key: 'salary', header: 'Salary', isVisible: true, isSortable: false },
            { key: 'pf', header: 'PF', isVisible: true, isSortable: false },
            { key: 'esic', header: 'ESIC', isVisible: true, isSortable: false },
            { key: 'effectiveDate', header: 'Effective Date', isVisible: true, isSortable: false }
          ];

          if (res.table[0].totalCnt) {
            this.totalCount = res.table[0].totalCnt;
          }
          this.cdr.detectChanges();
        } else {
          this.tblData = [];
          this.totalCount = 0;
        }
      },
      () => {
        this.isLoading = false;
      },
    );
    this.cdr.detectChanges();
  }

  onDelete(data: any) {
    this.selectedItem = data;
    this.openConfirmDialog('Confirm?', 'Are you sure you want to Delete?', '1', '2');
  }

  onSubmitDelete() {
    this.isLoading = true;
    let data = `id=${this.selectedItem.id}|appUserId=${sessionStorage.getItem('userId')}`;
    this.userService
      .SubmitPostTypeData(`uspDeleteEmpMonthlyCtc`, data, this.FormName)
      .subscribe(
        (res: any) => {
          if (res === 'Data Saved.-success') {
            this.openAlertDialog('Success!', 'Data Delete successfully');

            this.getData();
            setTimeout(() => {
              this.isLoading = false;
            }, 1000);
          } else {
            this.openAlertDialog('Alert!', res);
            setTimeout(() => {
              this.isLoading = false;
            }, 2000);
          }
        },
        (err: HttpErrorResponse) => {
          setTimeout(() => {
            this.isLoading = false;
          }, 500);
          if (err.status == 401) {
            this.openAlertDialog('Error!', 'You are not authorized!');
          } else if (err.status == 403) {
            this.openAlertDialog('Error!', 'You are not authorized! (403)');
            // this.Customvalidation.loginroute(err.status);
          } else {
            this.openAlertDialog(
              'Error!',
              err.error && err.error.message ? err.error.message.toString() : err.message,
            );
          }
        },
      );
  }

  // Loan Logic variables
  currentLoanData: any;

  // Pagination
  searchText: string = '';

  onPageChange(event: any) {
    this.pageNo = event.first / event.rows + 1;
    this.pageSize = event.rows;
    this.getData();
  }

  onPageSizeChange(event: any) {
    this.pageSize = event;
    this.pageNo = 1;
    this.getData();
  }

  onSearchChange(event: any) {
    this.searchText = event;
    this.pageNo = 1;
    this.getData();
  }

  // Loan input change handler
  onChangeLoanInputs() {
    this.calculateMonthlyInstallment();
  }

  closeLoanDetailModal() {
    this.loanDialogVisible = false;
    this.resetFormFields();
  }

  // Reset loan form fields
  resetFormFields() {
    this.loanAmount = 0;
    this.loanDuration = 0;
    this.monthlyInstallment = 0;
    this.effectiveLoanDate = new Date();
    this.currentLoanData = null;
  }

  // Submit loan with confirmation
  onSubmitLoan() {
    this.isLoading = true;
    let effectiveDate = this.datePipe.transform(this.effectiveLoanDate, 'yyyy-MM-dd');
    // Using selectedItem attributes as per user logic if available, or fallback
    // The user's snippet uses this.selectedItem.id and this.selectedItem.employeeId
    // If we are in "Add New" flow for loan, selectedItem should be the employee row.
    let id = this.selectedItem ? this.selectedItem.id : (this.currentLoanData ? this.currentLoanData.id : '0');
    let empId = this.selectedItem ? (this.selectedItem.employeeId || this.selectedItem.empId) : (this.currentLoanData ? this.currentLoanData.employeeId : '0');
    // Wait, onOpenLoanDetail sets selectedItem = data. 

    // Let's stick closer to the user snippet logic:
    // let data = `id=${this.selectedItem.id}|empId=${this.selectedItem.employeeId}|totalLoanAmt=${this.loanAmount}|loanDuration=${this.loanDuration}|monthlyInstallment=${this.monthlyInstallment}|effectiveFrom=${effectiveDate}|appUserId=${sessionStorage.getItem('userId')}`

    // Note: 'id' in user snippet refers to the table row ID (which is likely the monthly salary record ID?). 
    // But Loan is usually separate. 
    // However, if the user explicitly provided this logic, I should follow it.

    // Safety check for selectedItem
    if (!this.selectedItem && this.currentLoanData) {
      this.selectedItem = this.currentLoanData;
    }

    // If still null, try form
    if (!this.selectedItem) {
      empId = this.salaryPrepration.get('employeeId')?.value;
      id = '0'; // or appropriate fallback
    } else {
      id = this.selectedItem.id;
      empId = this.selectedItem.employeeId || this.selectedItem.empId || empId;
    }

    let data = `id=${id}|empId=${empId}|totalLoanAmt=${this.loanAmount}|loanDuration=${this.loanDuration}|monthlyInstallment=${this.monthlyInstallment}|effectiveFrom=${effectiveDate}|appUserId=${sessionStorage.getItem('userId')}`;

    this.userService.SubmitPostTypeData(`uspPostEmployeeLoanDetails`, data, this.FormName).subscribe(
      (datacom: any) => {
        this.isLoading = false;
        if (datacom != '') {
          const resultarray = datacom.split('-');
          if (resultarray[1] == 'success') {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Data Submit Successfully.',
            });
            this.getLoanDetails(empId);
            this.closeLoanInputDialog();
            this.getData();
          } else if (resultarray[0] == '2') {
            this.messageService.add({
              severity: 'error',
              summary: 'Alert',
              detail: resultarray[1],
            });
          } else if (datacom == 'Error occured while processing data!--error') {
            this.messageService.add({
              severity: 'error',
              summary: 'Alert',
              detail: 'Something went wrong!',
            });
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Alert',
              detail: datacom,
            });
          }
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Alert',
            detail: 'Something went wrong!',
          });
        }
      },
      (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.message || 'An error occurred while submitting loan details',
        });
      },
    );
  }

  // Enhanced validation for submittal
  validateSubmitModalComplete() {
    // Check form validity
    if (this.salaryPrepration.invalid) {
      this.salaryPrepration.markAllAsTouched();
      this.scrollToFirstInvalidControl();
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill all required fields',
      });
      return false;
    }

    // Check salary constraints
    if (this.grossSalary === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Gross salary should not be 0',
      });
      return false;
    }

    if (this.grossSalary < 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Gross salary should not be negative',
      });
      return false;
    }

    if (this.netSalary < 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Net salary should not be negative',
      });
      return false;
    }

    if (this.netSalary > this.grossSalary) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: 'Net salary should not be greater than gross salary',
      });
      return false;
    }

    // Check if proceed was clicked
    if (!this.dataOnProceed || !this.dataOnProceed.length) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please click Proceed/Calculate first',
      });
      return false;
    }

    return true;
  }

  // Enhanced change event tracking
  onchageEvent(event: any, component: any): void {
    if (component === 'TDS') {
      this.changeTds = true;
    }
    if (component === 'LWF Employee') {
      this.lfwEmployee = true;
    }
    if (component === 'LWF Employer') {
      this.lfwEmployer = true;
    }
    if (component === 'Professional Tax') {
      this.professionalTax = true;
    }

    const inputValue = event?.target?.value || '';
    if (inputValue !== '') {
      this.disableSubmit = false;
      this.disableProceed = true;
    }
  }

  // New methods for table template integration



  getViewData(refresh: boolean) {
    if (refresh) {
      this.pageNo = 1;
    }
    this.getData();
  }

  // Loan calculation method
  calculateMonthlyInstallment() {
    if (this.loanAmount && this.loanDuration && this.loanDuration > 0) {
      this.monthlyInstallment = parseFloat((this.loanAmount / this.loanDuration).toFixed(2));
    } else {
      this.monthlyInstallment = 0;
    }
  }

  // Close loan input dialog
  closeLoanInputDialog() {
    this.loanInputDialogVisible = false;
    this.loanAmount = 0;
    this.loanDuration = 0;
    this.monthlyInstallment = 0;
    this.effectiveLoanDate = new Date();
  }

  // Validate and submit loan details
  validateLoanModal() {
    if (this.loanAmount == 0) {
      this.openAlertDialog('Alert!', 'Please enter loan amount');
      return;
    } else if (this.loanAmount < 0) {
      this.openAlertDialog('Alert!', 'Loan amount should not be negative value!');
      return;
    } else if (this.loanDuration == 0) {
      this.openAlertDialog('Alert!', 'Please enter loan duration');
      return;
    } else if (this.loanDuration < 0) {
      this.openAlertDialog('Alert!', 'Loan duration should not be negative value!');
      return;
    } else if (this.monthlyInstallment == 0) {
      this.openAlertDialog('Alert!', 'Please enter monthly installment');
      return;
    } else if (this.monthlyInstallment < 0) {
      this.openAlertDialog('Alert!', 'Monthly installment should not be negative value!');
      return;
    } else {
      this.openConfirmDialog('Confirm?', 'Are you sure you want to Submit?', '1', '3');
    }
  }

  // Style for loan status
  getStyles(data: any) {
    if (data.repaymentStatus === 'Paid') {
      return { color: '#22c55e', 'font-weight': 'bold' };
    } else if (data.repaymentStatus === 'Pending') {
      return { color: '#f59e0b', 'font-weight': 'bold' };
    } else {
      return { color: '#ef4444', 'font-weight': 'bold' };
    }
  }

  // Store paramvaluedata for later submission
  paramvaluedata: string = '';

  /**
   * Open confirmation dialog for user actions
   * @param title Dialog title
   * @param msg Dialog message
   * @param id Data id if applicable
   * @param option Action type (1=Submit, 2=Delete, 3=Loan Submit)
   */
  openConfirmDialog(title: string, msg: string, id: string, option?: string) {
    this.confirmationService.confirm({
      message: msg,
      header: title,
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (option === '1') {
          this.submitCall(this.paramvaluedata);
        } else if (option === '2') {
          this.onSubmitDelete();
        } else if (option === '3') {
          this.onSubmitLoan();
        }
      },
    });
  }

  /**
   * Open alert dialog for informational messages
   * @param title Dialog title
   * @param msg Dialog message
   */
  openAlertDialog(title: string, msg: string) {
    this.messageService.add({
      severity:
        title.toLowerCase().includes('error') || title.toLowerCase().includes('alert')
          ? 'error'
          : 'info',
      summary: title,
      detail: msg,
      life: 5000,
    });
  }

  /**
   * Go to first tab (Earnings)
   */
  gotoFirstTab() {
    this.activeTab = '0';
  }

  /**
   * Handle checkbox change for earnings/deductions
   */
  onCheckboxChange(action: string): void {
    if (action === 'Earning') {
      this.earningTable.every((row: any) => row.checked);
    } else {
      this.deductionTable.every((row: any) => row.checked);
    }
  }

  // ================= HELPER METHODS =================

  // Sum of row values (for printing and calculations)
  getSumOfRow(data: any, action: string) {
    let sum = data.reduce((accumulator: number, currentObject: any) => {
      return accumulator + currentObject[action];
    }, 0);
    return sum;
  }

  getSumOfRow1(data: any, action: string) {
    let sum = data.reduce((accumulator: number, currentObject: any) => {
      return accumulator + Number(currentObject[action]);
    }, 0);
    return sum;
  }

  // Scroll to first invalid control in form
  scrollToFirstInvalidControl() {
    const firstInvalidControl = document.querySelector('form .ng-invalid');
    if (firstInvalidControl) {
      firstInvalidControl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  // Transform date format
  transformDate(newDate: any, formName: string, controlName: string) {
    if (formName === 'salaryPrepration') {
      const value = this.salaryPrepration.get(controlName)?.value;
      if (value) {
        const formattedDate = this.datePipe.transform(value, 'yyyy-MM-dd');
        this.salaryPrepration.patchValue({
          [controlName]: formattedDate,
        });
      }
    }
  }

  // Delete item with confirmation
  deleteItem(item: any, event: any) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this record?',
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.isLoading = true;
        const data = `id=${item.id}|appUserId=${sessionStorage.getItem('userId')}`;
        this.userService
          .SubmitPostTypeData(`uspDeleteEmpMonthlyCtc`, data, this.FormName)
          .subscribe(
            (res: any) => {
              this.isLoading = false;
              if (res && res.includes && res.includes('success')) {
                this.messageService.add({
                  severity: 'success',
                  summary: 'Success',
                  detail: 'Record Deleted Successfully',
                });
                this.getData();
              } else {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Failed to delete record',
                });
              }
            },
            (err: HttpErrorResponse) => {
              this.isLoading = false;
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: err.message || 'An error occurred while deleting',
              });
            },
          );
      },
    });
  }

  openPrintModal(data1: any) {
    this.isLoading = true;
    let organisation = data1.organisation;
    let orgImage = data1.orgImage;
    this.userService.getQuestionPaper(`uspGetEmpMonthlySalaryPrint|id=${data1.id}`).subscribe(
      (data: any) => {
        if (Object.keys(data).length > 0 && data.table.length > 0) {

          let monthlyGrossAmont = this.getSumOfRow(data.table1, 'amount');
          const excludedIds = [10010, 10011, 10026, 10006];
          const monthlyDedAmont = data.table2
            .filter((item: any) => !excludedIds.includes(item.id))
            .reduce((sum: number, obj: any) => sum + Number(obj.amount), 0);
          let monthlyNetAmont = monthlyGrossAmont - monthlyDedAmont;


          const htmlContent = `
              <table style="font-family: helvetica; width: 100%;"> 
                    <head>
                        <title>Salary Annexure</title>
                    </head>
                    <tr style="width:100%">
                      <td style="text-align:center;width:100%">
                          <img src="${orgImage || ''}" style="width:20%;height:120px;" alt="Organization Logo"/>
                      </td>
                    </tr>
                    <tr>
                        <td>
                            <table style="text-align: center;width: 100%;border: 2px solid #000000;" cellpadding="0" cellspacing="0">
                                <tr> 
                                  <td>
                                     <h2 style="font-size: 22px;font-family:Times New Roman;max-width: 500px; margin: auto; margin-top: 5px; margin-bottom: 5px; padding: 10px; border: 1px solid #000000; box-shadow: 5px 5px 5px #000000; text-align: center;">
                                        <strong>${organisation}</strong>
                                          <br/>
                                        <strong>Salary Annexure</strong>
                                     </h2>
                                     
                                  </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                      <td>
                        <table style="width: 100%;">
                            <tr>
                              <td>
                                 <table class="table" style="width: 100%; border: 2px solid;font-size:13px;  margin-bottom: 0;">
                                    <tr>
                                       <th style="text-align:center"> 
                                          Name
                                       </th>
                                        <th style="text-align:center"> 
                                          Designation
                                       </th>
                                        <th style="text-align:center"> 
                                          Date Of Joining
                                       </th>
                                    </tr>

                                    <tr>
                                         <td style="text-align:center">
                                          ${data.table[0]['employee']}
                                       </td>
                                       <td style="text-align:center">
                                           ${data.table[0]['designation']}
                                       </td>
                                        <td style="text-align:center">
                                         ${data.table[0]['doj']}
                                       </td>
                                    </tr>
                                 </table>
                              </td>
                            </tr>  
                        </table>
                      </td>
                    </tr>

                    <tr>
                      <td>
                        <table style="width: 100%;">
                          <tr>
                            <td>
                              <table class="table" style="width: 100%; border: 1px solid;font-size:13px;  margin-bottom: 0; black;border-collapse: collapse;">
                                <tr >
                                   <th style="border: 1px solid black;border-collapse: collapse;">
                                     Salary Heads
                                   </th>
                                   <th style="border: 1px solid black;border-collapse: collapse;">
                                     Amount 
                                   </th>
                                </tr>
                                ${data.table1
              .map(
                (eldata: any, index: number) => `                                
                                    <tr >
                                       <td style="border: 1px solid black;border-collapse: collapse;">
                                         ${eldata.components}
                                       </td>
                                       <td style="border: 1px solid black;border-collapse: collapse;">
                                      ${eldata.amount != '0' ? `${eldata.amount}` : ''}
                                       </td>
                                    </tr>
                                `,
              )
              .join('')}

                                 <tr style="background-color:lightgrey;">
                                  <td style="background-color:lightgrey;border: 1px solid black;border-collapse: collapse;">
                                   <strong>Gross</strong>
                                  </td>
                                  <td style="border: 1px solid black;border-collapse: collapse;">
                                    <strong>${monthlyGrossAmont} </strong>
                                  </td>
                                </tr>

                                ${data.table2
              .map(
                (eldata: any, index: number) => `                                
                                  <tr >
                                     <td style="border: 1px solid black;border-collapse: collapse;">
                                         ${eldata.components}
                                     </td>
                                     <td style="border: 1px solid black;border-collapse: collapse;">
                                        ${eldata.amount != '0' ? `${eldata.amount}` : ''}
                                      </td>
                                  </tr>
                              `,
              )
              .join('')}

                                <tr>
                                  <td style="background-color:lightgrey;border: 1px solid black;border-collapse: collapse;">
                                     <strong>Net Salary</strong>   
                                  </td>
                                  <td style="background-color:lightgrey;border: 1px solid black;border-collapse: collapse;">
                                    <strong>${monthlyNetAmont}</strong>
                                  </td>
                                </tr>

                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr> 
              </table>
         `;

          this.printContentString = htmlContent;
          this.printContentSafe = this.sanitizer.bypassSecurityTrustHtml(htmlContent);

          this.isLoading = false;
          this.printDialogVisible = true;
          this.cdr.detectChanges();

        } else {
          this.isLoading = false;
          this.printContentString = '<h2 class="text-center">Data Not Found.</h2>';
          this.printContentSafe = this.sanitizer.bypassSecurityTrustHtml(this.printContentString);
          this.printDialogVisible = true;
        }
      },
      (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.message || 'Failed to load print data',
        });
      },
    );
  }

  printPoData(): void {
    const printContents = this.printContentString;
    if (printContents) {
      const popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
      if (popupWin) {
        popupWin.document.open();
        popupWin.document.write(`
            <html>
            <head>
            <style>
                table {
                    width: 100%;
                }
                body{font-size:10px !important;}
                h2{font-size:16px !important;}
                p{font-size:12px !important;}
                @media print {
                    body{font-size:10px !important;}
                    p{font-size:12px !important;}
                    th,td,span,p,div{font-size:10px !important;}
                }
            </style>
            </head>
                <body onload="window.print();" style="font-size:10px !important;">${printContents}</body>
            </html>
        `);
        popupWin.document.close();
      } else {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Popup blocked. Please allow popups for this site.' });
      }
    } else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Print content not found.' });
    }
  }



}
