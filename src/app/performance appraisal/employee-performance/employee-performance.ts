import { Component, OnInit, ChangeDetectorRef, ViewChildren, QueryList } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, FormControl, Validators, AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MultiSelectModule } from 'primeng/multiselect';
import { UserService } from '../../shared/user-service';
import { ExcelService } from '../../shared/excel.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import Swal from 'sweetalert2';

interface DropdownOption {
  drpValue: any;
  drpOption: string;
  kpi?: string;
  measurementIndex?: string;
}

interface AppraisalTopic {
  label: string;
  instructions: string;
}

@Component({
  selector: 'app-employee-performance',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    DatePickerModule,
    RadioButtonModule,
    ToastModule,
    ProgressSpinnerModule,
    TableModule,
    DialogModule,
    ConfirmDialogModule,
    BreadcrumbModule,
    MultiSelectModule,
  ],
  providers: [MessageService, ConfirmationService, ExcelService, DatePipe],
  templateUrl: './employee-performance.html',
  styleUrls: ['./employee-performance.scss']
})
export class EmployeePerformance implements OnInit {
  @ViewChildren('sharedKraDropdown') sharedKraDropdowns!: QueryList<any>;

  isLoading = false;
  visible = false;
  postType = '';
  header = '';
  headerIcon = 'pi pi-plus';
  isFormLoading = false;
  activeTab = 'first';
  innerActiveTab = 0;
  finalsubmitted = false;
  finalSubmittedByHOD = false;
  breadcrumbItems: any[] = [];
  home = { icon: 'pi pi-home', routerLink: '/' };
  appraisalForm!: FormGroup;
  sectionIForm!: FormGroup;
  sectionIIForm!: FormGroup;
  appraisalTopicsForm!: FormGroup;
  menulabel = '';
  FormName = '';
  FormValue = '';
  employeeID: any;
  PerformamceHeadId: number | null = null;
  appraisalId: number | null = null;
  PerformanceIDofappraise: any;
  paramvaluedata = '';
  appraisalPeriodId: number | null = null;

  basicInfoTabs: DropdownOption[] = [
    { drpValue: 10000, drpOption: 'Section I' },
    { drpValue: 10001, drpOption: 'Section II' }
  ];

  sectionValue: number | null = null;
  Radiobuttonsection1: any[] = [];
  table3: DropdownOption[] = [];
  table4: DropdownOption[] = [];
  CompetencyAssessment: any[]=[];
  table8: any[] = [];
  table9: any[] = [];
  table10: any[] = [];
  table11: any[] = [];
  Comptenance: any[] = [];
  isTotalWeightageInvalid = false;
  Questiondata: any[] = [];
  QuestionDataTable: any[] = [];
  QuestionDataTableSectionIII: any[] = [];
  QuestionDataTableTopics: any[] = [];
  groupData: any[] = [];
  appraisalTopics: AppraisalTopic[] = [
    {
      label: 'a. Strengths (Minimum 3)',
      instructions: `List your strengths. Emphasize what makes you distinctive and how that leads to your success at work.`
    },
    {
      label: 'b. Areas of Improvement (Minimum 3)',
      instructions: 'Identify the key areas where improvement is needed. Be honest and constructive.'
    },
    {
      label: 'c. Personal Development Plan (Minimum 3)',
      instructions: 'Outline plans for self-development like training, certifications, mentoring, etc.'
    },
    {
      label: 'd. Areas for Job Rotation / Career Growth(Minimum 3)',
      instructions: 'Mention departments/roles you are interested in exploring for growth.'
    }
  ];

  // Role Properties
  isAppraisee = false;
  isAppraiser = false;
  isHOD = false;
  hasNoHOD = false;

  // KRA Management
  availableKPIs: { [index: number]: any[] } = {};
  selectedKRAValues: Set<number> = new Set();
  previousKRAValues: { [key: number]: number | null } = {};
  hasShownFirstTabModal = false;
  hasShownSubmitConfirmation = false;
  private isInitializing = false;
  visitedTabs: string[] = ['first'];
  hrAppraisalData: any;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private excelService: ExcelService,
    private cdr: ChangeDetectorRef,
    private datePipe: DatePipe,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeComponent();
    this.initializeForms();
    this.computeRoles();
    this.getEmployeeId();
    this.Radiobutton();
  }

  private initializeComponent(): void {
    const param = sessionStorage.getItem('menuItem');
    if (param) {
      const paramjs = JSON.parse(param);
      this.menulabel = paramjs.menu;
      this.FormName = paramjs.formName;
      this.FormValue = paramjs.formValue;
    }
    this.breadcrumbItems = [
      { label: this.menulabel },
      { label: this.FormName }
    ];
  }

  private initializeForms(): void {
    this.appraisalForm = this.createAppraisalForm();
    this.sectionIForm = this.createSectionIForm();
    this.sectionIIForm = this.createSectionIIForm();
    this.appraisalTopicsForm = this.createAppraisalTopicsForm();
    this.appraisalForm.disable();
  }

  getTabIcon(tabName: string): string {
    if (tabName === 'Section I') {
      return 'pi pi-chart-line';
    } else if (tabName === 'Section II') {
      return 'pi pi-th-large';
    }
    return 'pi pi-circle';
  }

  private createAppraisalForm(): FormGroup {
    return this.fb.group({
      employeeName: ['', Validators.required],
      employeeId: ['', Validators.required],
      department: ['', Validators.required],
      designation: ['', Validators.required],
      dateOfSelfAppraisal: [null, Validators.required],
      dateOfAppraisalByAppraiser: [null, Validators.required],
      dateOfAppraisalByReviewer: [null, Validators.required],
      reportingAuthorityName: ['', Validators.required],
      reportingAuthorityDesignation: ['', Validators.required],
      reviewerName: ['', Validators.required],
      reviewerDesignation: ['', Validators.required],
      financialYear: ['', Validators.required],
      appraisalFor: ['', Validators.required]
    });
  }

  private createSectionIForm(): FormGroup {
    return this.fb.group({
      performanceIndicators: this.fb.array([], this.weightageValidator())
    });
  }

  private createSectionIIForm(): FormGroup {
    return this.fb.group({
      competencyIndicators: this.fb.array([])
    });
  }

  private createAppraisalTopicsForm(): FormGroup {
    const topicsArray = this.fb.array(
      this.appraisalTopics.map(() => this.createTopicFormGroup())
    );
    return this.fb.group({
      topics: topicsArray
    });
  }

  private createTopicFormGroup(): FormGroup {
    return this.fb.group({
      id: [0],
      instructions: ['', Validators.required],
      selfAssessment: ['', Validators.required],
      appraiserRemarks: ['', Validators.required]
    });
  }

  get indicators(): FormArray {
    return this.sectionIForm.get('performanceIndicators') as FormArray;
  }

  get competencyIndicators(): FormArray {
    return this.sectionIIForm.get('competencyIndicators') as FormArray;
  }

  get topics(): FormArray {
    return this.appraisalTopicsForm.get('topics') as FormArray;
  }

  private weightageValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const formArray = control as FormArray;
      if (!formArray || formArray.length === 0) return null;
      const total = formArray.controls.reduce((sum, ctrl) => {
        const weightageControl = ctrl.get('weightage');
        if (!weightageControl) return sum;
        const val = parseFloat(weightageControl.value || 0);
        return sum + (isNaN(val) ? 0 : val);
      }, 0);
      return total > 100 ? { weightageExceeded: true } : null;
    };
  }

  private getEmployeeId(): void {
    this.route.queryParams.subscribe(params => {
      const sessionUserId = sessionStorage.getItem('userId');

      if (params['empId']) {
        this.employeeID = params['empId'];
      } else if (sessionUserId) {
        this.employeeID = sessionUserId;
      }
      this.PerformanceIDofappraise = params['id'];
      this.finalSubmittedByHOD = params['finelSubmitted'] === 'true';

      if (params['AppraisalPeriodid']) {
        this.appraisalPeriodId = Number(params['AppraisalPeriodid']);
      }

      if (params['financialYear']) {
        this.appraisalForm.get('financialYear')?.setValue(params['financialYear']);
      }

      if (this.PerformanceIDofappraise) {
        this.PerformamceHeadId = this.PerformanceIDofappraise;
      }

      this.Userdata();
    });
  }

  Userdata(): void {
    let userId = sessionStorage.getItem('userId');
    this.userService.getQuestionPaper(`uspGetPMSInitialMasters|action=USERDETAIL|appUserId=${this.employeeID}|id=0`)
      .subscribe((res: any) => {
        if (res?.table?.length > 0) {
          const data = res.table[0] || {};
          const data1 = Array.isArray(res.table6) ? res.table6[0] : null;

          this.table9 = res.table9 || [];
          this.table4 = Array.isArray(res.table4) ? res.table4 : [];
          this.table8 = Array.isArray(res.table8) ? res.table8 : [];
          this.table10 = Array.isArray(res.table10) ? res.table10 : [];
          this.table11 = Array.isArray(res.table11) ? res.table11 : [];
          this.hrAppraisalData = data1;

          this.appraisalForm.patchValue({
            employeeName: data.empName || '',
            employeeId: data.empId || '',
            department: data.department || '',
            designation: data.designation || '',
            reportingAuthorityName: data.appraiserName || '',
            reportingAuthorityDesignation: data.appraiserDesignation || '',
            reviewerName: data.reviewerName || '',
            reviewerDesignation: data.reviewerDesignation || ''
          });

          if (this.PerformanceIDofappraise) {
            this.PerformanceAppraiserDate(this.PerformanceIDofappraise);
          }

          if (this.appraisalPeriodId) {
            const matchedPeriod = this.table9.find((item: any) =>
              Number(item.id) === this.appraisalPeriodId
            );
            if (matchedPeriod) {
              this.appraisalForm.patchValue({
                financialYear: matchedPeriod.financialYear || '',
                appraisalFor: matchedPeriod.appraisalFor || ''
              });
            } else {
              const data9 = this.table9[0];
              if (data9) {
                this.appraisalForm.patchValue({
                  financialYear: data9.financialYear || '',
                  appraisalFor: data9.appraisalFor || ''
                });
              }
            }
          }

          this.updateTopicsFormDisabledState();
          this.handleNoHODDisable();

          if (this.finalSubmittedByHOD) {
            this.PerformamceHead();
          } else {
            this.enableAllFormsBasedOnRole();
          }
        }
      });
  }

  PerformanceAppraiserDate(performanceIDofappraise: number) {
    const userId = sessionStorage.getItem('userId');
    const Role = JSON.parse(sessionStorage.getItem('currentRole')!).roleId;

    this.userService.getQuestionPaper(
      `uspGetPerformanceAppraiserDate|performanceHeadId=${performanceIDofappraise}|appUserRole=${Role}`
    ).subscribe({
      next: (res: any) => {
        debugger
        if (res?.table && Array.isArray(res.table) && res.table.length > 0) {
          const dateData = res.table[0];
          const selfAssessmentDate = this.datePipe.transform(dateData.selfAssessmentDate, 'yyyy-MM-dd');
          const appraiserDate = this.datePipe.transform(dateData.appraiserDate, 'yyyy-MM-dd');
          const reviewerDate = this.datePipe.transform(dateData.reviewerDate, 'yyyy-MM-dd');

          this.appraisalForm.patchValue({
            dateOfSelfAppraisal: selfAssessmentDate ? new Date(selfAssessmentDate) : null,
            dateOfAppraisalByAppraiser: appraiserDate ? new Date(appraiserDate) : null,
            dateOfAppraisalByReviewer: reviewerDate ? new Date(reviewerDate) : null
          });
        }
      }
    });
  }

  Radiobutton(): void {
    this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblPMSRatingMaster`).subscribe((res: any) => {
      const sortedData = res['table'].sort((a: any, b: any) => b.drpOption.localeCompare(a.drpOption));
      this.Radiobuttonsection1 = sortedData;
      this.cdr.detectChanges();
    });
  }

  computeRoles(): void {
    const currentRoleStr = sessionStorage.getItem('currentRole');
    this.isAppraiser = false;
    this.isHOD = false;
    this.isAppraisee = false;

    if (currentRoleStr) {
      try {
        const currentRole = JSON.parse(currentRoleStr);
        const rolDes = (currentRole.rolDes || '').toUpperCase().trim();

        if (rolDes.includes('MANAGER') || rolDes.includes('APPRAISER')) {
          this.isAppraiser = true;
        } else if (rolDes.includes('HOD') || rolDes.includes('HEAD')) {
          this.isHOD = true;
        } else {
          this.isAppraisee = true;
        }
      } catch (error) {
        this.isAppraisee = true;
      }
    } else {
      this.isAppraisee = true;
    }
  }

  private enableAllFormsBasedOnRole(): void {
    if (this.sectionIForm) {
      this.sectionIForm.enable();
      this.updateSectionIFormState();
    }

    if (this.sectionIIForm) {
      this.sectionIIForm.enable();
      this.updateSectionIIFormState();
    }

    if (this.appraisalTopicsForm) {
      this.appraisalTopicsForm.enable();
      this.updateTopicsFormDisabledState();
    }
  }

  private updateSectionIFormState(): void {
    if (this.indicators && this.indicators.controls) {
      this.indicators.controls.forEach((control: AbstractControl) => {
        if (control instanceof FormGroup) {
          this.updateFormControlStates(control);
        }
      });
    }
  }

  private updateSectionIIFormState(): void {
    if (this.competencyIndicators && this.competencyIndicators.controls) {
      this.competencyIndicators.controls.forEach((control: AbstractControl) => {
        if (control instanceof FormGroup) {
          this.updateFormControlStates(control);
        }
      });
    }
  }

  private updateFormControlStates(formGroup: FormGroup): void {
    const shouldDisableForHOD = this.isHOD;
    const isFormSubmitted = this.finalsubmitted || this.finalSubmittedByHOD;

    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control) {
        let shouldDisable = false;

        if (key.includes('appraiser') || key === 'AppraisersRemarks') {
          shouldDisable = this.isAppraisee || shouldDisableForHOD || isFormSubmitted;
        } else if (key.includes('reviewer')) {
          shouldDisable = !this.isHOD || isFormSubmitted || this.isAppraisee;
        } else if (key.includes('self') || key === 'SelfAssessment') {
          shouldDisable = !this.isAppraisee || shouldDisableForHOD || isFormSubmitted;
        } else if (key === 'kra' || key === 'weightage' || key === 'selfSharedKRA') {
          shouldDisable = !this.isAppraisee || shouldDisableForHOD || isFormSubmitted;
        }

        if (shouldDisable) {
          control.disable({ emitEvent: false });
        } else {
          control.enable({ emitEvent: false });
        }
      }
    });
  }

  private handleNoHODDisable(): void {
    if (this.hasNoHOD && this.isAppraiser) {
      setTimeout(() => {
        if (this.sectionIForm) this.sectionIForm.disable();
        if (this.sectionIIForm) this.sectionIIForm.disable();
        if (this.appraisalTopicsForm) this.appraisalTopicsForm.disable();
      }, 100);
    }
  }

  get isAddKPIDisabled(): boolean {
    if (!this.isAppraisee || this.finalsubmitted || this.finalSubmittedByHOD) {
      return true;
    }
    return this.selectedKRAValues.size >= this.table3.length;
  }

  addIndicator(): void {
    const currentSection = this.getCurrentSection();
    if (currentSection?.drpValue === 10000) {
      if (this.selectedKRAValues.size >= this.table3.length) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'All available KRAs have been selected'
        });
        return;
      }

      const newIndex = this.indicators.length;
      this.indicators.push(this.createIndicator(currentSection.drpValue, null));
      this.previousKRAValues[newIndex] = null;
      this.availableKPIs[newIndex] = [];
      this.indicators.updateValueAndValidity();
      this.cdr.detectChanges();
    }
  }

  removeIndicator(index: number): void {
    if (!this.indicators || this.indicators.length <= 1) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'At least one row is required'
      });
      return;
    }

    const kraValue = this.indicators.at(index).get('kra')?.value;
    if (kraValue) {
      this.selectedKRAValues.delete(Number(kraValue));
    }

    this.indicators.removeAt(index);
    delete this.previousKRAValues[index];
    
    // Reindex previousKRAValues
    const newPreviousValues: { [key: number]: number | null } = {};
    this.indicators.controls.forEach((_, i) => {
      const currentKRA = this.indicators.at(i).get('kra')?.value;
      newPreviousValues[i] = currentKRA ? Number(currentKRA) : null;
    });
    this.previousKRAValues = newPreviousValues;
    
    this.cdr.detectChanges();
  }

  onKRAChange(index: number): void {
    if (!this.indicators || index >= this.indicators.length) return;

    const newValue = Number(this.indicators.at(index).get('kra')?.value) || null;
    const previousValue = this.previousKRAValues[index];

    if (previousValue !== null && previousValue !== newValue) {
      this.selectedKRAValues.delete(previousValue);
    }

    if (newValue !== null) {
      this.selectedKRAValues.add(newValue);
    }

    this.previousKRAValues[index] = newValue;
    this.cdr.detectChanges();
  }

  getAvailableKRAs(currentIndex: number): any[] {
    if (!this.indicators || currentIndex >= this.indicators.length) {
      return this.table3 || [];
    }

    const currentSelectedValue = this.indicators.at(currentIndex).get('kra')?.value;
    return (this.table3 || []).filter(kra => {
      if (kra.drpValue == currentSelectedValue) {
        return true;
      }
      return !this.selectedKRAValues.has(kra.drpValue);
    });
  }

  getKPIsForKRA(kraId: number): any[] {
    if (!kraId || !this.table3 || this.table3.length === 0) {
      return [];
    }

    const selectedKRA = this.table3.find(kra => kra.drpValue == kraId);
    if (!selectedKRA || !selectedKRA.kpi) {
      return [];
    }

    const kpiString = selectedKRA.kpi.trim();
    const measurementString = selectedKRA.measurementIndex ? selectedKRA.measurementIndex.trim() : '';
    const kpiParts = kpiString.split(/^\s*\d+\.\s*/gm).filter(p => p.trim());
    const measurementParts = measurementString.split(/^\s*\d+\.\s*/gm).filter(p => p.trim());

    return kpiParts.map((kpi, i) => ({
      drpValue: i + 1,
      drpOption: kpi.trim(),
      measurementIndex: measurementParts[i] ? measurementParts[i].trim() : ''
    }));
  }

  getCurrentSection(): DropdownOption | undefined {
    return this.basicInfoTabs.find(s => s.drpOption === this.activeTab);
  }

  get totalWeightageCompleted(): number {
    if (!this.indicators || !this.indicators.controls) {
      return 0;
    }
    const total = this.indicators.controls.reduce((sum, ctrl) => {
      const weightageControl = ctrl.get('weightage');
      if (!weightageControl) return sum;
      const val = parseFloat(weightageControl.value);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
    return Math.round(total * 100) / 100;
  }

  calculateWeightedRating(weightage: number, rating: number): number {
    if (!weightage || !rating) return 0;
    const weight = parseFloat(weightage.toString());
    const rate = parseFloat(rating.toString());
    return (weight * rate) / 100;
  }

  getTotalWeightedRating(type: 'self' | 'appraiser' | 'reviewer'): number {
    if (!this.sectionIForm || !this.indicators) return 0;
    return this.indicators.controls.reduce((total, group: any) => {
      const weightage = parseFloat(group.get('weightage')?.value) || 0;
      const rating = parseFloat(group.get(`${type}Rating`)?.value) || 0;
      const weighted = this.calculateWeightedRating(weightage, rating);
      return total + (isNaN(weighted) ? 0 : weighted);
    }, 0);
  }

  getTotalCompetencyWeightedRating(type: 'self' | 'appraiser' | 'reviewer'): number {
    if (!this.sectionIIForm || !this.competencyIndicators) return 0;
    return this.competencyIndicators.controls.reduce((total, group: any) => {
      const weightage = 10;
      const rating = parseFloat(group.get(`${type}Rating`)?.value) || 0;
      const weighted = this.calculateWeightedRating(weightage, rating);
      return total + (isNaN(weighted) ? 0 : weighted);
    }, 0);
  }

  getFinalCombinedScore(type: 'self' | 'appraiser' | 'reviewer'): number {
    const kraScore = (this.getTotalWeightedRating(type) * (this.table11[0]?.kra / 100)) || 0;
    const competencyScore = (this.getTotalCompetencyWeightedRating(type) * (this.table11[0]?.competencies / 100)) || 0;
    return kraScore + competencyScore;
  }

// ... [Previous code remains the same until createIndicator method]

  createIndicator(sectionId: number, row?: any): FormGroup {
    const shouldDisableForHOD = this.isHOD;
    const isFormSubmitted = this.finalsubmitted || this.finalSubmittedByHOD;
    let sharedKRAIds: number[] = [];

    if (sectionId === 10000) {
      let sharedKRAArray: any[] = [];
if (row?.sharedKra) {
  sharedKRAIds = row.sharedKra
    .toString()
    .split(',')
    .map((id: string) => Number(id.trim()))
    .filter((id: number) => !isNaN(id));
}

      const group = this.fb.group({
        id: [row?.id || 0],
        kra: [{
          value: row?.kraId || '',
          disabled: shouldDisableForHOD || isFormSubmitted || !this.isAppraisee
        }, Validators.required],
        weightage: [{
          value: row?.weightage || '',
          disabled: shouldDisableForHOD || isFormSubmitted || !this.isAppraisee
        }, Validators.required],
        selfSharedKRA: [{
          value: sharedKRAArray,
          disabled: shouldDisableForHOD || isFormSubmitted || !this.isAppraisee
        }, Validators.required],
        selfRemark: [{
          value: row?.selfRemark || '',
          disabled: shouldDisableForHOD || isFormSubmitted || !this.isAppraisee
        }, this.isAppraisee && !shouldDisableForHOD && !isFormSubmitted ? [Validators.required] : []],
        selfRating: [{
          value: row?.selfRating || '',
          disabled: shouldDisableForHOD || isFormSubmitted || !this.isAppraisee
        }, this.isAppraisee && !shouldDisableForHOD && !isFormSubmitted ? [Validators.required] : []],
        appraiserRemark: [{
          value: row?.appraiserRemark || '',
          disabled: shouldDisableForHOD || isFormSubmitted || this.isAppraisee
        }, !this.isAppraisee && !shouldDisableForHOD && !isFormSubmitted ? [Validators.required] : []],
        appraiserRating: [{
          value: row?.appraiserRating || '',
          disabled: shouldDisableForHOD || isFormSubmitted || this.isAppraisee
        }, !this.isAppraisee && !shouldDisableForHOD && !isFormSubmitted ? [Validators.required] : []],
        reviewerRemark: [{
          value: row?.reviewerRemark || '',
          disabled: !shouldDisableForHOD || isFormSubmitted
        }, shouldDisableForHOD && !isFormSubmitted ? [Validators.required] : []],
        reviewerRating: [{
          value: row?.reviewerRating || '',
          disabled: !shouldDisableForHOD || isFormSubmitted
        }, shouldDisableForHOD && !isFormSubmitted ? [Validators.required] : []]
      });
      
      this.updateFormControlStates(group);
      return group;
    }
    return this.fb.group({});
  }

  

  validateSectionI(): boolean {
    this.sectionIForm.markAllAsTouched();
    if (this.sectionIForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill all required fields in Section I.'
      });
      return false;
    }

     if (this.totalWeightageCompleted !== 100) {
    this.isTotalWeightageInvalid = true;
    return false;
  }

    return true;
  }

  validateSectionII(): boolean {
    this.sectionIIForm.markAllAsTouched();
    this.appraisalTopicsForm.markAllAsTouched();

    if (this.sectionIIForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill all required fields in Section II Competency Assessment.'
      });
      return false;
    }

    if (this.appraisalTopicsForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill all required fields in Topics and Assessments.'
      });
      return false;
    }

    return true;
  }

  gotoNextTab(): void {
    const tabsOrder = ['first', ...this.basicInfoTabs.map((tab: DropdownOption) => tab.drpOption)];
    const currentIndex = tabsOrder.indexOf(this.activeTab);

    if (currentIndex < tabsOrder.length - 1) {
      const nextTab = tabsOrder[currentIndex + 1];
      this.activeTab = nextTab;

      if (!this.visitedTabs.includes(nextTab)) {
        this.visitedTabs.push(nextTab);
      }

      const selectedSection = this.basicInfoTabs.find(s => s.drpOption === nextTab);
      if (selectedSection) {
        this.loadSectionData(selectedSection.drpValue);
      }
    }
  }

  goToPreviousTab(): void {
    const tabsOrder = ['first', ...this.basicInfoTabs.map((tab: DropdownOption) => tab.drpOption)];
    const currentIndex = tabsOrder.indexOf(this.activeTab);

    if (currentIndex > 0) {
      const previousTab = tabsOrder[currentIndex - 1];
      this.activeTab = previousTab;

      if (previousTab !== 'first') {
        const selectedSection = this.basicInfoTabs.find(s => s.drpOption === previousTab);
        if (selectedSection) {
          this.loadSectionData(selectedSection.drpValue);
        }
      }
    }
  }

  switchTab(tabId: string): void {
    this.isLoading = true;
    if (this.isTabDisabled(tabId)) {
      this.isLoading = false;
      return;
    }
    this.activeTab = tabId;

    if (tabId === 'first') {
      this.isLoading = false;
      return;
    }

    const section = this.getSectionByTabId(tabId);
    if (section) {
      this.sectionValue = section.drpValue;
      this.ensureFormsInitialized();

      if (!this.isDataLoadedForSection(tabId)) {
        this.QuestionData(section.drpValue, this.PerformamceHeadId!);
      } else {
        this.reapplyFormStates();
        this.isLoading = false;
      }
    } else {
      this.isLoading = false;
    }
  }

  private getSectionByTabId(tabId: string): DropdownOption | undefined {
    return this.basicInfoTabs.find(s => s.drpOption === tabId);
  }

   isTabDisabled(tabId: string): boolean {
    return !this.visitedTabs.includes(tabId) && tabId !== 'first';
  }

  private loadSectionData(sectionId: number): void {
    if (this.PerformamceHeadId !== null) {
      this.QuestionData(sectionId, this.PerformamceHeadId);
    }
  }

  private isDataLoadedForSection(tabId: string): boolean {
    return (tabId === 'Section I' && this.QuestionDataTable.length > 0) ||
           (tabId === 'Section II' && (this.QuestionDataTableSectionIII.length > 0 || this.QuestionDataTableTopics.length > 0));
  }

  private reapplyFormStates(): void {
    this.updateSectionIFormState();
    this.updateSectionIIFormState();
    this.updateTopicsFormDisabledState();
  }

  private ensureFormsInitialized(): void {
    if (!this.sectionIForm) {
      this.sectionIForm = this.createSectionIForm();
    }
    if (!this.sectionIIForm) {
      this.sectionIIForm = this.createSectionIIForm();
    }
    if (!this.appraisalTopicsForm) {
      this.appraisalTopicsForm = this.createAppraisalTopicsForm();
    }
  }

  QuestionData(selectedSectionId: number, PerformamceHeadId: number): void {
    if (!selectedSectionId || this.isInitializing) {
      this.isLoading = false;
      return;
    }

    this.isInitializing = true;
    let userId = sessionStorage.getItem('userId');
    let Role = JSON.parse(sessionStorage.getItem('currentRole') || '{}')?.roleId;

    this.userService.getQuestionPaper(
      `uspGetKRAQuestionAnswer|performanceHeadId=${PerformamceHeadId}|appUserId=${this.employeeID}|appUserRoleId=${Role}`
    ).subscribe({
      next: (res: any) => {
        if (res) {
          this.Questiondata = res.table || [];
          this.QuestionDataTable = res.table || [];
          this.QuestionDataTableSectionIII = res.table2 || [];
          this.QuestionDataTableTopics = res.table1 || [];
          this.CompetencyAssessment  = res.table4 || [];
          this.table3 = res.table3 || [];
          this.Comptenance = res.table5 || [];

          if (this.activeTab === 'Section I') {
            this.initializeSectionIData();
            setTimeout(() => {
             this.repatchSharedKRA();
           }, 0);
          } else if (this.activeTab === 'Section II') {
            this.initializeSectionIICompetency();
            this.patchTopicsForm(this.QuestionDataTableTopics);
          }

          setTimeout(() => {
            this.reapplyFormStates();
            this.isLoading = false;
            this.isInitializing = false;
            this.cdr.detectChanges();
          }, 500);
        } else {
          this.groupData = [];
          this.isLoading = false;
          this.isInitializing = false;
        }
      },
      error: (err: HttpErrorResponse) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load questions'
        });
        this.isLoading = false;
        this.isInitializing = false;
      }
    });
  }

   private repatchSharedKRA(): void {
     this.indicators.controls.forEach((ctrl, index) => {
       const row = this.QuestionDataTable[index];
       if (row?.sharedKra) {
         const sharedIds = row.sharedKra
           .split(',')
           .map((id: string) => Number(id.trim()))
           .filter(Boolean);
   
         ctrl.get('selfSharedKRA')?.setValue(sharedIds, { emitEvent: false });
       }
     });
   }


  private initializeSectionIData(): void {
    let sharedKRAIds: number[] = [];
    debugger
    if (!this.sectionIForm) {
      this.sectionIForm = this.createSectionIForm();
    }
    const indicatorsArray = this.indicators;
    const needsRebuild = this.needsFormRebuild();
    if (needsRebuild) {
      while (indicatorsArray.length !== 0) {
        indicatorsArray.removeAt(0);
      }
      this.selectedKRAValues.clear();
      this.previousKRAValues = {};
      this.availableKPIs = {};
    }

    if (this.QuestionDataTable?.length > 0) {
      this.QuestionDataTable.forEach((row: any, index: number) => {
        if (needsRebuild) {
          if (row.kraId) {
            this.selectedKRAValues.add(Number(row.kraId));
            this.previousKRAValues[index] = Number(row.kraId);
          }
          const indicatorGroup = this.createIndicator(this.sectionValue || 10000, row);
          indicatorsArray.push(indicatorGroup);
        } else if (indicatorsArray.at(index)) {
          let sharedKRAArray: any[] = [];
          if (row.sharedKra) {
         sharedKRAIds = row.sharedKra
           .toString()
           .split(',')
           .map((id: string) => Number(id.trim()))
           .filter((id: number) => !isNaN(id));
           }
          indicatorsArray.at(index).patchValue({
            id: row.id || 0,
            kra: row.kraId || '',
            weightage: row.weightage || '',
           selfSharedKRA: sharedKRAIds,
            selfRemark: row.selfRemark || '',
            selfRating: row.selfRating || '',
            appraiserRemark: row.appraiserRemark || '',
            appraiserRating: row.appraiserRating || '',
            reviewerRemark: row.reviewerRemark || '',
            reviewerRating: row.reviewerRating || ''
          }, { emitEvent: false });
        }
      });
    } else if (this.table3 && this.table3.length > 0 && indicatorsArray.length === 0) {
      this.addInitialIndicator();
    }

    this.sectionIForm.updateValueAndValidity({ emitEvent: false });
    this.cdr.detectChanges();
  }

private initializeSectionIICompetency(): void {
  const competencyArray = this.competencyIndicators;
  while (competencyArray.length > 0) {
    competencyArray.removeAt(0);
  }

  // Use CompetencyAssessment (table4 - saved data) if it exists
  if (this.CompetencyAssessment && this.CompetencyAssessment.length > 0) {
    this.CompetencyAssessment.forEach((competencyData: any, index: number) => {
      const competencyGroup = this.createCompetencyIndicator(competencyData);
      competencyArray.push(competencyGroup);
    });
  } 
  // Otherwise use Comptenance (table5 - master list) for empty form
  else if (this.Comptenance && this.Comptenance.length > 0) {
    this.Comptenance.forEach((competency: any, index: number) => {
      const competencyGroup = this.createCompetencyIndicator(null);
      competencyArray.push(competencyGroup);
    });
  }

  // Patch values from CompetencyAssessment
  if (this.CompetencyAssessment?.length > 0) {
    setTimeout(() => {
      this.CompetencyAssessment.forEach((row: any, index: number) => {
        if (competencyArray.at(index)) {
          // Handle API field names correctly
          const selfRating = row.salfRateing || row.selfRating || '';
          const appraiserRating = row.appraiserRating || '';
          const reviewerRating = row.reviewerRating || '';
          
          competencyArray.at(index).patchValue({
            id: row.id || 0,
            SelfAssessment: row.selfRemark || '',
            selfRating: selfRating,
            AppraisersRemarks: row.appraiserRemark || '',
            appraiserRating: appraiserRating,
            reviewerRemark: row.reviewerRemark || '',
            reviewerRating: reviewerRating
          }, { emitEvent: false });
        }
      });
      this.sectionIIForm.markAsPristine();
      this.sectionIIForm.markAsUntouched();
      this.sectionIIForm.updateValueAndValidity({ emitEvent: false });
    }, 100);
  }
}

  private needsFormRebuild(): boolean {
    const currentLength = this.indicators.length;
    const dataLength = this.QuestionDataTable?.length || 0;

    if (currentLength !== dataLength) {
      return true;
    }

    for (let i = 0; i < currentLength; i++) {
      const formKRA = this.indicators.at(i).get('kra')?.value;
      const dataKRA = this.QuestionDataTable[i]?.kraId;
      if (formKRA != dataKRA) {
        return true;
      }
    }

    return false;
  }

  private addInitialIndicator(): void {
    const currentSection = this.getCurrentSection();
    if (currentSection?.drpValue === 10000) {
      const newIndex = this.indicators.length;
      this.indicators.push(this.createIndicator(currentSection.drpValue, null));
      this.previousKRAValues[newIndex] = null;
      this.availableKPIs[newIndex] = [];
      this.indicators.updateValueAndValidity();
      this.cdr.detectChanges();
    }
  }

  private createCompetencyIndicator(row?: any, index?: number): FormGroup {
    const shouldDisableForHOD = this.isHOD;
    const isFormSubmitted = this.finalsubmitted || this.finalSubmittedByHOD;

    const group = this.fb.group({
      id: new FormControl(row?.id || 0),
      SelfAssessment: new FormControl({
        value: row?.selfAssessment || row?.selfRemark || '',
        disabled: shouldDisableForHOD || isFormSubmitted || !this.isAppraisee
      }, this.isAppraisee && !shouldDisableForHOD && !isFormSubmitted ? [Validators.required] : []),
      selfRating: new FormControl({
        value: row?.selfRating || row?.salfRateing || '',
        disabled: shouldDisableForHOD || isFormSubmitted || !this.isAppraisee
      }, this.isAppraisee && !shouldDisableForHOD && !isFormSubmitted ? [Validators.required] : []),
      AppraisersRemarks: new FormControl({
        value: row?.appraiserRemarks || row?.appraiserRemark || '',
        disabled: shouldDisableForHOD || isFormSubmitted || this.isAppraisee
      }, !this.isAppraisee && !shouldDisableForHOD && !isFormSubmitted ? [Validators.required] : []),
      appraiserRating: new FormControl({
        value: row?.appraiserRating || '',
        disabled: shouldDisableForHOD || isFormSubmitted || this.isAppraisee
      }, !this.isAppraisee && !shouldDisableForHOD && !isFormSubmitted ? [Validators.required] : []),
      reviewerRemark: new FormControl({
        value: row?.reviewerRemark || '',
        disabled: !shouldDisableForHOD || isFormSubmitted
      }, shouldDisableForHOD && !isFormSubmitted ? [Validators.required] : []),
      reviewerRating: new FormControl({
        value: row?.reviewerRating || '',
        disabled: !shouldDisableForHOD || isFormSubmitted
      }, shouldDisableForHOD && !isFormSubmitted ? [Validators.required] : [])
    });

    this.updateFormControlStates(group);
    return group;
  }

  patchTopicsForm(table1: any[]): void {
    if (!this.appraisalTopicsForm || !this.topics) {
      return;
    }

    while (this.topics.length < this.appraisalTopics.length) {
      this.topics.push(this.createTopicFormGroup());
    }

    if (table1 && table1.length > 0) {
      table1.forEach((row: any, index: number) => {
        if (index < this.topics.length && this.topics.at(index)) {
          this.topics.at(index).patchValue({
            id: row.id || 0,
            instructions: row.text || this.appraisalTopics[index]?.instructions || '',
            selfAssessment: row.selfAssessment || '',
            appraiserRemarks: row.appraiserRemarks || row.appraisersRemarks || ''
          }, { emitEvent: false });
        }
      });
    } else {
      this.appraisalTopics.forEach((topic, index) => {
        if (index < this.topics.length) {
          const currentInstructions = this.topics.at(index).get('instructions')?.value;
          if (!currentInstructions) {
            this.topics.at(index).patchValue({
              instructions: topic.instructions
            }, { emitEvent: false });
          }
        }
      });
    }

    this.appraisalTopicsForm.markAsPristine();
    this.appraisalTopicsForm.markAsUntouched();
    this.appraisalTopicsForm.updateValueAndValidity({ emitEvent: false });
    this.updateTopicsFormDisabledState();
    this.cdr.detectChanges();
  }

  private updateTopicsFormDisabledState(): void {
    if (!this.appraisalTopicsForm || !this.topics || this.topics.length === 0) {
      return;
    }

    const isFormSubmitted = this.finalsubmitted || this.finalSubmittedByHOD;
    const shouldDisableForHOD = this.isHOD;

    this.topics.controls.forEach(topic => {
      const instructions = topic.get('instructions');
      const selfAssessment = topic.get('selfAssessment');
      const appraiserRemarks = topic.get('appraiserRemarks');

      const disableInstructions = shouldDisableForHOD || isFormSubmitted || !this.isAppraisee;
      const disableSelf = shouldDisableForHOD || isFormSubmitted || !this.isAppraisee;
      const disableAppraiser = shouldDisableForHOD || isFormSubmitted || this.isAppraisee;

      if (disableInstructions) instructions?.disable({ emitEvent: false });
      else instructions?.enable({ emitEvent: false });

      if (disableSelf) selfAssessment?.disable({ emitEvent: false });
      else selfAssessment?.enable({ emitEvent: false });

      if (disableAppraiser) appraiserRemarks?.disable({ emitEvent: false });
      else appraiserRemarks?.enable({ emitEvent: false });
    });

    this.appraisalTopicsForm.updateValueAndValidity({ emitEvent: false });
    this.cdr.detectChanges();
  }

  handleNextClick(): void {
    this.isFormLoading = true;

    try {
      if (this.activeTab === 'first') {
        this.handleFirstTabSubmission();
      } else {
        this.handleSectionTabSubmission();
      }
    } catch (err) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Something went wrong during navigation!'
      });
      this.isFormLoading = false;
    }
  }

  private handleFirstTabSubmission(): void {
    this.appraisalForm.markAllAsTouched();

    if (this.appraisalForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill all required fields in Employee Details.'
      });
      this.isFormLoading = false;
      return;
    }

    if (!this.hasShownFirstTabModal) {
      this.hasShownFirstTabModal = true;
      sessionStorage.setItem('firstTabModalShown', 'true');
      this.isFormLoading = false;
      this.showFirstTabModal();
      return;
    }

    this.submitcall();
  }

  private handleSectionTabSubmission(): void {
    const currentSection = this.getCurrentSection();
    if (currentSection) {
      this.sectionValue = currentSection.drpValue as number;
    }

    if (this.activeTab === 'Section I') {
      if (!this.validateSectionI()) {
        this.isFormLoading = false;
        return;
      }
      this.submitSectionIData();
    } else if (this.activeTab === 'Section II') {
      if (!this.validateSectionII()) {
        this.isFormLoading = false;
        return;
      }
      this.submitSectionIIData();
    }
  }

  submitcall(): void {
    if (!this.isAppraisee) {
      this.gotoNextTab();
      return;
    }

    this.isFormLoading = true;
    this.values();

    this.userService.SubmitPostTypeData(
      'uspPostKRAPerformanceHead',
      this.paramvaluedata,
      this.FormName
    ).subscribe({
      next: (res: any) => {
        this.isFormLoading = false;
        if (res) {
          const resultarray = res.split("-");
          const statusCode = parseInt(resultarray[0] || '0', 10);
         this.PerformamceHead();
          if (statusCode === 1) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Data saved successfully of - ' + this.activeTab
            });
            
          } 
          // else if (statusCode === 2) {
          //   this.messageService.add({
          //     severity: 'info',
          //     summary: 'Info',
          //     detail: 'Appraisal already initiated. Proceeding to ratings.'
          //   });
          //   this.PerformamceHead();
          // } else {
          //   this.messageService.add({
          //     severity: 'error',
          //     summary: 'Error',
          //     detail: `Server response: ${res}`
          //   });
          // }
        }
      },
      error: (err) => {
        this.isFormLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `API call failed: ${err.message}`
        });
      }
    });
  }

  private values(): void {
    const empMasterID = sessionStorage.getItem('userId');
    const districtId = sessionStorage.getItem('District');
    const roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}')?.roleId;

    let appraisalPeriodId = this.appraisalPeriodId;
    if (!appraisalPeriodId) {
      const data9 = Array.isArray(this.table9) && this.table9.length > 0 ? this.table9[0] : null;
      appraisalPeriodId = data9 ? data9.id : 0;
    }

    this.paramvaluedata = `appraisalPeriodId=${appraisalPeriodId}|appUserId=${empMasterID}|appRoleId=${roleID}|districtId=${districtId}`;
  }

  PerformamceHead(): void {
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'User ID not found in session'
      });
      return;
    }

    let appraisalId = this.appraisalPeriodId;
    if (!appraisalId) {
      const data9 = Array.isArray(this.table9) && this.table9.length > 0 ? this.table9[0] : null;
      appraisalId = data9 ? data9.id : 0;
    }

    const endpoint = `uspGetCurrentKRAPerformanceHead|appraisalPeriodId=${appraisalId}|appUserId=${userId}`;
    this.userService.getQuestionPaper(endpoint)
      .subscribe((res: any) => {
        if (res?.table?.length > 0) {
          this.PerformamceHeadId = res.table[0].id;
          this.finalsubmitted = res.table[0].finelSubmitted;

          if (this.finalsubmitted || this.finalSubmittedByHOD) {
            this.disableAllForms();
            // this.messageService.add({
            //   severity: 'warn',
            //   summary: 'Action Required',
            //   detail: 'Your employee Performance Appraisal form has been successfully submitted. No further changes allowed.'
            // });
          } else {
            this.enableAllFormsBasedOnRole();
          }
        }
        this.gotoNextTab();
      });
  }

  private submitSectionIData(): void {
    const performanceResults = this.getPerformanceResults();
    this.submitcallMain([], performanceResults, [], [], [], false);
  }

  private submitSectionIIData(): void {
    const performanceResults = this.getPerformanceResults();
    const competentJson = this.prepareCompetencyJson();
    const section3jsonData: any[] = [];

    this.topics.controls.forEach((topicControl: AbstractControl, index: number) => {
      const topicGroup = topicControl as FormGroup;
      const rawValues = topicGroup.getRawValue();

      section3jsonData.push({
        id: rawValues.id || 0,
        sectionThreeId: index + 1,
        text: rawValues.instructions || '',
        selfAssessment: rawValues.selfAssessment || '',
        appraisersRemarks: rawValues.appraiserRemarks || ''
      });
    });

    this.submitcallMain([], performanceResults, section3jsonData, competentJson, section3jsonData, false);
  }

  private getPerformanceResults(): any[] {
    return this.indicators.controls.map((control: AbstractControl, index: number) => {
      const group = control as FormGroup;
      const rawValues = group.getRawValue();
      const dataRow = this.QuestionDataTable?.[index];
      const rowId = dataRow?.id ?? 0;
      const selfRating = parseFloat(rawValues.selfRating) || 0;
      const appraiserRating = parseFloat(rawValues.appraiserRating) || 0;
      const reviewerRating = parseFloat(rawValues.reviewerRating) || 0;
      const weightage = parseFloat(rawValues.weightage) || 0;

      const sharedKraIds = Array.isArray(rawValues.selfSharedKRA)
        ? rawValues.selfSharedKRA
            .map((x: any) => (typeof x === 'object' ? x.drpValue : x))
            .join(',')
        : '';

      return {
        id: rawValues.id || rowId,
        kra: rawValues.kra || '',
        kpi: 0,
        weightage: weightage,
        objective: '',
        sharedKra: sharedKraIds,
        selfRemark: rawValues.selfRemark || '',
        selfRating: selfRating,
        wtSelfRating: (weightage * selfRating) / 100,
        appraiserRemark: rawValues.appraiserRemark || '',
        appraiserRating: appraiserRating,
        wtAppraiserRating: (weightage * appraiserRating) / 100,
        reviewerRemark: rawValues.reviewerRemark || '',
        reviewerRating: reviewerRating,
        wtReviewerRating: (weightage * reviewerRating) / 100,
      };
    }).filter(item => item.kra);
  }

// Continuation of Employee Performance Component

  private prepareCompetencyJson(): any[] {
    if (!this.competencyIndicators) return [];

    return this.competencyIndicators.controls.map((control: AbstractControl, index: number) => {
      const group = control as FormGroup;
      const rawValues = group.getRawValue();

      const selfRating = parseFloat(rawValues.selfRating) || 0;
      const appraiserRating = parseFloat(rawValues.appraiserRating) || 0;
      const reviewerRating = parseFloat(rawValues.reviewerRating) || 0;
      const weightage = 10;

      return {
        id: rawValues.id || 0,
        competentId: this.Comptenance[index]?.id || 0,
        selfRemark: rawValues.SelfAssessment || '',
        selfRating: selfRating,
        wtSelfRating: (weightage * selfRating) / 100,
        appraiserRemark: rawValues.AppraisersRemarks || '',
        appraiserRating: appraiserRating,
        wtAppraiserRating: (weightage * appraiserRating) / 100,
        reviewerRemark: rawValues.reviewerRemark || '',
        reviewerRating: reviewerRating,
        wtReviewerRating: (weightage * reviewerRating) / 100
      };
    });
  }

  showSubmitConfirmation(): void {
  if (this.finalsubmitted || this.finalSubmittedByHOD) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Already Submitted',
      detail: 'This appraisal has already been submitted and cannot be modified.'
    });
    return;
  }
  this.appraisalForm.markAllAsTouched();
  this.sectionIForm.markAllAsTouched();
  this.sectionIIForm.markAllAsTouched();
  this.appraisalTopicsForm.markAllAsTouched();
  if (this.appraisalForm.invalid) {
    this.messageService.add({
      severity: 'error',
      summary: 'Validation Error',
      detail: 'Please fill all required fields in Employee Details.'
    });
    return;
  }

  if (this.totalWeightageCompleted !== 100) {
    this.messageService.add({
      severity: 'warn',
      summary: 'Total Weightage',
      detail: `Total weightage is ${this.totalWeightageCompleted}%. It must be exactly 100%.`
    });
    return;
  }

  if (this.sectionIForm.invalid) {
    this.messageService.add({
      severity: 'error',
      summary: 'Validation Error',
      detail: 'Please fill all required fields in Section I.'
    });
    return;
  }

  if (this.sectionIIForm.invalid) {
    this.messageService.add({
      severity: 'error',
      summary: 'Validation Error',
      detail: 'Please fill all required fields in Section II Competency Assessment.'
    });
    return;
  }

  if (this.appraisalTopicsForm.invalid) {
    this.messageService.add({
      severity: 'error',
      summary: 'Validation Error',
      detail: 'Please fill all required fields in Topics and Assessments.'
    });
    return;
  }

  this.confirmationService.confirm({
    message: 'Are you sure you want to submit the appraisal? Once submitted, you cannot make further changes.',
    header: 'Confirm Submission',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Yes, Submit',
    rejectLabel: 'Cancel',
    acceptButtonStyleClass: 'p-button-success',
    rejectButtonStyleClass: 'p-button-secondary',
    accept: () => {
      this.finalSubmitAppraisal();
    },
    reject: () => {
      this.messageService.add({
        severity: 'info',
        summary: 'Cancelled',
        detail: 'Appraisal submission cancelled'
      });
    }
  });
}

private finalSubmitAppraisal(): void {
  this.isFormLoading = true;
  
  try {
    const performanceResults = this.getPerformanceResults();
    const competentJson = this.prepareCompetencyJson();
    const section3jsonData: any[] = [];

    this.topics.controls.forEach((topicControl: AbstractControl, index: number) => {
      const topicGroup = topicControl as FormGroup;
      const rawValues = topicGroup.getRawValue();

      section3jsonData.push({
        id: rawValues.id || 0,
        sectionThreeId: index + 1,
        text: rawValues.instructions || '',
        selfAssessment: rawValues.selfAssessment || '',
        appraisersRemarks: rawValues.appraiserRemarks || ''
      });
    });
    this.submitcallMain([], performanceResults, section3jsonData, competentJson, section3jsonData, true);
    
  } catch (error) {
    this.isFormLoading = false;
    this.messageService.add({
      severity: 'error',
      summary: 'Submission Error',
      detail: 'Failed to submit appraisal. Please try again.'
    });
  }
}

  submitcallMain(
    result: any = [],
    performanceResults: any = [],
    SectionIIIdata: any = [],
    competentJson: any = [],
    topicsData: any = [],
    finelSubmittedcall: boolean = false
  ): void {
    setTimeout(() => {
      if (this.finalsubmitted === true || this.finalSubmittedByHOD) {
        this.isFormLoading = false;
        this.gotoNextTab();
        return;
      }

      const Performancedata = JSON.stringify(performanceResults);
      const Sectiondata = JSON.stringify(SectionIIIdata);
      const competentData = JSON.stringify(competentJson);
      const topicsJson = JSON.stringify(topicsData);
      const finelSubmitted = this.isHOD && this.isLastTab();
      const Role = JSON.parse(sessionStorage.getItem('currentRole') || '{}')?.roleId;

      const query = `performanceHeadId=${this.PerformamceHeadId}|section3json=${topicsJson}|selfassessment=${Performancedata}|competentJson=${competentData}|appUserId=${sessionStorage.getItem('userId')}|finelSubmitted=${finelSubmitted}|appUserRole=${Role}`;

      this.userService.SubmitPostTypeData(
        `uspPostKRAQuestionAnswer`,
        query,
        this.FormName
      ).subscribe({
        next: (res: any) => {
          this.isFormLoading = false;
          if (res) {
            const resultarray = res.split("-");
            if (resultarray[1] === "success") {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Data saved successfully for - ' + this.activeTab
              });

              if (finelSubmitted) {
                this.router.navigate(['/employee-performance-member']);
                return;
              }

              if (this.sectionValue && this.PerformamceHeadId) {
                this.QuestionData(this.sectionValue, this.PerformamceHeadId);
              }
              this.gotoNextTab();
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: `Server error: ${res}`
              });
            }
          }
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Something went wrong!'
          });
          this.isFormLoading = false;
        }
      });
    }, 100);
  }

  private showFirstTabModal(): void {
    this.confirmationService.confirm({
      message: 'Please review all information before proceeding to the next section.',
      header: 'Review Information',
      icon: 'pi pi-info-circle',
      acceptButtonProps: { label: 'Continue', icon: 'pi pi-check' },
      rejectVisible: false,
      accept: () => {
        this.submitcall();
      }
    });
  }

  private disableAllForms(): void {
    if (this.appraisalForm) this.appraisalForm.disable();
    if (this.sectionIForm) this.sectionIForm.disable();
    if (this.sectionIIForm) this.sectionIIForm.disable();
    if (this.appraisalTopicsForm) this.appraisalTopicsForm.disable();
    this.finalsubmitted = true;
  }

  isLastTab(): boolean {
    const tabsOrder = ['first', ...this.basicInfoTabs.map((tab: DropdownOption) => tab.drpOption)];
    return this.activeTab === tabsOrder[tabsOrder.length - 1];
  }

  returnToAppraisalView(): void {
    window.history.back();
  }

  trackByIndex(index: number): number {
    return index;
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.appraisalForm.get(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }


  downloadAsExcel() {
  let Role = JSON.parse(sessionStorage.getItem('currentRole') || '{}')?.roleId;
 
  this.userService.getQuestionPaper(
    `uspGetKRAQuestionAnswer|performanceHeadId=${this.PerformanceIDofappraise}|appUserId=${this.employeeID}|appUserRoleId=${Role}`
  ).subscribe({
    next: (res: any) => {
      if (res) {
        const sectionIData = res.table || [];
        const sectionIIData = res.table4 || [];
        const competenciesMaster = res.table5 || this.Comptenance || [];
        const topicsData = res.table1 || [];
       
        if (sectionIData.length === 0 && sectionIIData.length === 0 && topicsData.length === 0) {
          Swal.fire('Warning', 'No data available for export. Please complete the appraisal sections first.', 'warning');
          return;
        }
       
        this.processExcelDataFixed(sectionIData, sectionIIData, competenciesMaster, topicsData);
      } else {
        Swal.fire('Error', 'No data available for export', 'error');
      }
    },
    error: (err) => {
      Swal.fire('Error', 'Failed to fetch data for export', 'error');
    }
  });
}

private processExcelDataFixed(
  sectionIData: any[],
  sectionIIData: any[],
  competenciesMaster: any[],
  topicsData: any[]
): void {
  try {
    const sectionIExcelData = this.prepareSectionIExcelData(sectionIData);
    const sectionIIExcelData = this.prepareSectionIIExcelData(sectionIIData, competenciesMaster);
    const topicsExcelData = this.prepareTopicsExcelData(topicsData);
   
    const htmlContent = this.generateExcelHTML(sectionIExcelData, sectionIIExcelData, topicsExcelData);
    this.triggerExcelDownload(htmlContent);
   
    Swal.fire({
      icon: 'success',
      title: 'Excel Downloaded Successfully!',
      showConfirmButton: true,
      timer: 2000
    });
  } catch (error) {
    Swal.fire('Error', 'Failed to process Excel data', 'error');
  }
}

private prepareSectionIExcelData(tableData: any[]): any[] {
  if (!tableData || tableData.length === 0) {
    if (this.indicators && this.indicators.length > 0) {
      return this.indicators.controls.map((control, index) => {
        const rawValues = (control as FormGroup).getRawValue();
        const kraName = this.getKRAName(rawValues.kra);
        const kpis = this.getKPIsForKRA(rawValues.kra);
        const kpiText = kpis.map(kpi => `• ${kpi.drpOption}`).join('\n');
       
        return {
          serialNo: index + 1,
          kra: kraName,
          keyDeliverables: kpiText,
          weightage: rawValues.weightage || '0',
          selfSharedKRA: this.getSharedKRANames(rawValues.selfSharedKRA),
          selfRating: rawValues.selfRating || '0',
          selfWeightedRating: this.calculateWeightedRatingForExcel(rawValues.weightage, rawValues.selfRating),
          selfFeedback: rawValues.selfRemark || '',
          appraiserRating: rawValues.appraiserRating || '0',
          appraiserWeightedRating: this.calculateWeightedRatingForExcel(rawValues.weightage, rawValues.appraiserRating),
          appraiserFeedback: rawValues.appraiserRemark || '',
          reviewerRating: rawValues.reviewerRating || '0',
          reviewerWeightedRating: this.calculateWeightedRatingForExcel(rawValues.weightage, rawValues.reviewerRating),
          reviewerFeedback: rawValues.reviewerRemark || ''
        };
      });
    }
    return [];
  }
  return tableData.map((row, index) => {
    const kraName = this.getKRAName(row.kraId || row.kra);
    const kpis = this.getKPIsForKRA(row.kraId || row.kra);
    const kpiText = kpis.map(kpi => `• ${kpi.drpOption}`).join('\n');
   
    return {
      serialNo: index + 1,
      kra: kraName,
      keyDeliverables: kpiText,
      weightage: row.weightage || '0',
      selfSharedKRA: this.getSharedKRANames(row.selfSharedKRA || row.sharedKra),
      selfRating: row.selfRating || '0',
      selfWeightedRating: this.calculateWeightedRatingForExcel(row.weightage, row.selfRating),
      selfFeedback: row.selfRemark || '',
      appraiserRating: row.appraiserRating || '0',
      appraiserWeightedRating: this.calculateWeightedRatingForExcel(row.weightage, row.appraiserRating),
      appraiserFeedback: row.appraiserRemark || '',
      reviewerRating: row.reviewerRating || '0',
      reviewerWeightedRating: this.calculateWeightedRatingForExcel(row.weightage, row.reviewerRating),
      reviewerFeedback: row.reviewerRemark || ''
    };
  });
}

private prepareSectionIIExcelData(competencyData: any[], competenciesMaster: any[]): any[] {
  if (!competencyData || competencyData.length === 0) {
    if (this.competencyIndicators && this.competencyIndicators.length > 0) {
      return this.competencyIndicators.controls.map((control, index) => {
        const rawValues = (control as FormGroup).getRawValue();
        const competency = competenciesMaster[index] || this.Comptenance[index] || {};
       
        return {
          serialNo: index + 1,
          competencyTitle: competency.copetencies || `Competency ${index + 1}`,
          selfRating: rawValues.selfRating || '0',
          selfWeightedRating: this.calculateWeightedRatingForExcel(10, rawValues.selfRating),
          selfFeedback: rawValues.SelfAssessment || '',
          appraiserRating: rawValues.appraiserRating || '0',
          appraiserWeightedRating: this.calculateWeightedRatingForExcel(10, rawValues.appraiserRating),
          appraiserFeedback: rawValues.AppraisersRemarks || '',
          reviewerRating: rawValues.reviewerRating || '0',
          reviewerWeightedRating: this.calculateWeightedRatingForExcel(10, rawValues.reviewerRating),
          reviewerFeedback: rawValues.reviewerRemark || ''
        };
      });
    }
    return [];
  }
  return competencyData.map((row, index) => {
    const competency = competenciesMaster.find(comp => comp.id === row.competentId) ||
                      competenciesMaster[index] ||
                      this.Comptenance[index] || {};
   
    return {
      serialNo: index + 1,
      competencyTitle: competency.copetencies || `Competency ${index + 1}`,
      selfRating: row.salfRateing?.toString() || row.selfRating?.toString() || '0',
      selfWeightedRating: this.calculateWeightedRatingForExcel(10, row.salfRateing || row.selfRating),
      selfFeedback: row.selfRemark || row.selfAssessment || '',
      appraiserRating: row.appraiserRating?.toString() || '0',
      appraiserWeightedRating: this.calculateWeightedRatingForExcel(10, row.appraiserRating),
      appraiserFeedback: row.appraiserRemark || row.appraiserRemarks || '',
      reviewerRating: row.reviewerRating?.toString() || '0',
      reviewerWeightedRating: this.calculateWeightedRatingForExcel(10, row.reviewerRating),
      reviewerFeedback: row.reviewerRemark || ''
    };
  });
}

private prepareTopicsExcelData(topicsData: any[]): any[] {
  const defaultTopics = [
    'a. Strengths (Minimum 3)',
    'b. Areas of Improvement (Minimum 3)',
    'c. Personal Development Plan (Minimum 3)',
    'd. Areas for Job Rotation / Career Growth (Minimum 3)'
  ];
  if (!topicsData || topicsData.length === 0) {
    if (this.topics && this.topics.length > 0) {
      return this.topics.controls.map((control, index) => {
        const rawValues = (control as FormGroup).getRawValue();
        return {
          serialNo: index + 1,
          topic: defaultTopics[index] || `Topic ${index + 1}`,
          instructions: rawValues.instructions || '',
          selfAssessment: rawValues.selfAssessment || '',
          appraiserRemarks: rawValues.appraiserRemarks || ''
        };
      });
    }
    return [];
  }
  return topicsData.map((topic, index) => {
    return {
      serialNo: index + 1,
      topic: defaultTopics[index] || `Topic ${index + 1}`,
      instructions: topic.text || topic.instructions || '',
      selfAssessment: topic.selfAssessment || '',
      appraiserRemarks: topic.appraiserRemarks || topic.appraisersRemarks || ''
    };
  });
}

private generateExcelHTML(sectionIData: any[], sectionIIData: any[], topicsData: any[]): string {
  const sectionITableHTML = this.generateSectionITableHTML(sectionIData);
  const sectionIITableHTML = this.generateSectionIITableHTML(sectionIIData);
  const topicsTableHTML = this.generateTopicsTableHTML(topicsData);
  
  return `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:x="urn:schemas-microsoft-com:office:excel"
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="UTF-8">
      <title>Employee Appraisal Report</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 12px; margin: 20px; color: #000000; }
        table { border-collapse: collapse; table-layout: fixed; width: 100%; max-width: 1400px; margin-bottom: 20px; }
        th, td { border: 1px solid #000; padding: 8px; text-align: left; vertical-align: top; height: auto; min-height: 25px; line-height: 1.2; overflow: hidden; color: #000000; }
        th { color: #000000; font-weight: bold; background-color: #D3D3D3; }
        .table-heading th { background-color: #D3D3D3; font-size: 14px; text-align: center; color: #000000; }
        .table-subheading th { background-color: #D3D3D3; font-size: 12px; color: #000000; }
        .section-header {
          background-color: #ecf0f1;
          padding: 10px;
          margin: 20px 0 10px 0;
          font-weight: bold;
          font-size: 16px;
          border-left: 4px solid #D3D3D3;
          color: #000000;
        }
        .total-row { background-color: #f8f9fa; font-weight: bold; color: #000000; }
        .kpi-list { margin: 0; padding-left: 15px; white-space: pre-line; color: #000000; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .page-break { page-break-before: always; }
        .employee-info th, .employee-info td { width: auto; min-width: 150px; color: #000000; }
        .employee-info th { background-color: #D3D3D3; }
        .signature-section {
          margin-top: 50px;
          width: 100%;
          max-width: 1400px;
        }
        .signature-table {
          width: 100%;
          border: none;
          margin-top: 30px;
        }
        .signature-table td {
          border: none;
          padding: 20px;
          text-align: center;
          vertical-align: bottom;
        }
        .signature-line {
          border-top: 1px solid #000;
          width: 200px;
          margin: 50px auto 5px auto;
        }
        .signature-label {
          font-weight: bold;
          margin-top: 5px;
        }
      </style>
    </head>
    <body>
      <h1 style="text-align: center; color: #0f6cbd; margin-bottom: 30px;">
        Employee Performance Appraisal Report
      </h1>
     
      <!-- Employee Information - Extended Version -->
      <div class="section-header">Employee Information</div>
      <table class="employee-info">
        <tr>
          <th style="width: 15%;">Employee Name</th>
          <td style="width: 20%;">${this.appraisalForm.get('employeeName')?.value || ''}</td>
          <th style="width: 15%;">Employee ID</th>
          <td style="width: 20%;">${this.appraisalForm.get('employeeId')?.value || ''}</td>
          <th style="width: 15%;">Department</th>
          <td style="width: 15%;">${this.appraisalForm.get('department')?.value || ''}</td>
          <th>Designation</th>
          <td>${this.appraisalForm.get('designation')?.value || ''}</td>
        </tr>
        <tr>
          <th>Reporting Authority</th>
          <td>${this.appraisalForm.get('reportingAuthorityName')?.value || ''}</td>
          <th>Reporting Designation</th>
          <td>${this.appraisalForm.get('reportingAuthorityDesignation')?.value || ''}</td>
          <th>Reviewer Name</th>
          <td>${this.appraisalForm.get('reviewerName')?.value || ''}</td>
          <th>Reviewer Designation</th>
          <td>${this.appraisalForm.get('reviewerDesignation')?.value || ''}</td>
        </tr>
        <tr>
          <th>Financial Year</th>
          <td>${this.appraisalForm.get('financialYear')?.value || ''}</td>
          <th>Appraisal Period</th>
          <td>${this.appraisalForm.get('appraisalFor')?.value || ''}</td>
        </tr>
      </table>
      <br style="mso-special-character:page-break;" />
      <!-- Section I: KRA -->
      <div class="section-header">Section I - Key Result Areas (KRA ${this.table11[0]?.kra || 0}%)</div>
      ${sectionITableHTML}
      
<br style="mso-special-character:page-break;" />
      
      <!-- Section II: Competencies -->
      <div class="section-header">Section II - Competency Assessment (${this.table11[0]?.competencies || 0}%)</div>
      ${sectionIITableHTML}
      
<br style="mso-special-character:page-break;" />
      
      <!-- Topics and Assessments -->
      <div class="section-header">Topics and Assessments</div>
      ${topicsTableHTML}


<br style="mso-special-character:page-break;" />
<br style="mso-special-character:page-break;" />

<div class="signature-section">
  <table class="signature-table" style="width:100%; border-collapse:collapse;">
    <tr>
      <!-- Signature by label on left -->
      <td colspan="3" style="width:15%; border:none; text-align:left; vertical-align:bottom; padding: 20px;">
        <div style="font-size: 14px; font-weight: bold; color: #0f6cbd;">Signature by</div>
      </td>

      <!-- Employee -->
      <td colspan="3" style="width:28%; border:none; text-align:center; vertical-align:bottom; padding: 20px;">
        <div class="signature-label" style="color: #0f6cbd;">
          ${this.appraisalForm.get('employeeName')?.value || (this.hrAppraisalData?.table?.[0]?.empName || 'Employee')}
        </div>
        <div style="height: 40px;"></div>
        <hr style="width:100%; max-width:250px; height:1px; margin:0 auto 5px auto; border:none; background-color:black;">
        <div class="signature-label" style="color: #0f6cbd;">Employee</div>
      </td>

      <!-- Appraiser -->
      <td colspan="3" style="width:28%; border:none; text-align:center; vertical-align:bottom; padding: 20px;">
        <div class="signature-label" style="color: #0f6cbd;">
          ${this.appraisalForm.get('reportingAuthorityName')?.value || (this.hrAppraisalData?.table?.[0]?.appraiserName || 'Appraiser')}
        </div>
        <div style="height: 40px;"></div>
        <hr style="width:100%; max-width:250px; height:1px; margin:0 auto 5px auto; border:none; background-color:black;">
        <div class="signature-label" style="color: #0f6cbd;">Appraiser</div>
      </td>

      <!-- Reviewer -->
      <td colspan="3" style="width:28%; border:none; text-align:center; vertical-align:bottom; padding: 20px;">
        <div class="signature-label" style="color: #0f6cbd;">
          ${this.appraisalForm.get('reviewerName')?.value || (this.hrAppraisalData?.table?.[0]?.reviewerName || 'Reviewer')}
        </div>
        <div style="height: 40px;"></div>
        <hr style="width:100%; max-width:250px; height:1px; margin:0 auto 5px auto; border:none; background-color:black;">
        <div class="signature-label" style="color: #0f6cbd;">Reviewer</div>
      </td>
    </tr>
  </table>
</div>




    </body>
    </html>
  `;
}

private generateSectionITableHTML(data: any[]): string {
  if (!data || data.length === 0) {
    return '<p style="color: red; font-weight: bold;">No Section I data available. Please complete Section I before exporting.</p>';
  }
  const totalSelfRating = data.reduce((sum, row) => sum + (parseFloat(row.selfWeightedRating) || 0), 0);
  const totalAppraiserRating = data.reduce((sum, row) => sum + (parseFloat(row.appraiserWeightedRating) || 0), 0);
  const totalReviewerRating = data.reduce((sum, row) => sum + (parseFloat(row.reviewerWeightedRating) || 0), 0);
  const kraPercentage = this.table11[0]?.kra || 0;
  return `
    <table>
      <thead>
        <tr class="table-heading">
          <th colspan="4" class="text-center">Key Responsibilities and Performance Indicators</th>
          <th colspan="4" class="text-center">Self-Assessment</th>
          <th colspan="3" class="text-center">Appraiser Assessment</th>
          <th colspan="3" class="text-center">Reviewer Assessment</th>
        </tr>
        <tr class="table-subheading">
          <th style="width: 20px;">#</th>
          <th style="width: 80px;">KRA</th>
          <th style="width: 150px;">Key Deliverables (KPIs)</th>
          <th style="width: 40px;">Weightage%</th>
          <th style="width: 80px;">Shared KRA</th>
          <th style="width: 40px;">Self Rating</th>
          <th style="width: 50px;">Wt. Rating</th>
          <th style="width: 100px;">Self Feedback</th>
          <th style="width: 40px;">Rating</th>
          <th style="width: 50px;">Wt. Rating</th>
          <th style="width: 100px;">Appraiser Feedback</th>
          <th style="width: 40px;">Rating</th>
          <th style="width: 50px;">Wt. Rating</th>
          <th style="width: 100px;">Reviewer Feedback</th>
        </tr>
      </thead>
      <tbody>
        ${data.map(row => `
          <tr>
            <td class="text-center">${row.serialNo}</td>
            <td>${row.kra}</td>
            <td><div class="kpi-list">${row.keyDeliverables}</div></td>
            <td class="text-center">${row.weightage}</td>
            <td>${row.selfSharedKRA}</td>
            <td class="text-center">${row.selfRating}</td>
            <td class="text-center">${row.selfWeightedRating}</td>
            <td style="white-space: pre-wrap;">${row.selfFeedback}</td>
            <td class="text-center">${row.appraiserRating}</td>
            <td class="text-center">${row.appraiserWeightedRating}</td>
            <td style="white-space: pre-wrap;">${row.appraiserFeedback}</td>
            <td class="text-center">${row.reviewerRating}</td>
            <td class="text-center">${row.reviewerWeightedRating}</td>
            <td style="white-space: pre-wrap;">${row.reviewerFeedback}</td>
          </tr>
        `).join('')}
      </tbody>
      <tfoot>
        <tr class="total-row">
          <td colspan="6" class="text-right"></td>
          <td class="text-center"><strong>${totalSelfRating.toFixed(2)}</strong></td>
          <td colspan="2" class="text-right"></td>
          <td class="text-center"><strong>${totalAppraiserRating.toFixed(2)}</strong></td>
          <td colspan="2" class="text-right"></td>
          <td class="text-center"><strong>${totalReviewerRating.toFixed(2)}</strong></td>
          <td></td>
        </tr>
        <tr class="total-row">
          <td colspan="6" class="text-right"> Overall KRA wt. (${this.table11[0]?.kra || 0})</td>
          <td class="text-center" style="background-color: #87CEEB;"><strong>${(totalSelfRating * (kraPercentage / 100)).toFixed(2)}</strong></td>
          <td colspan="2"  class="text-right"></td>
          <td class="text-center"  style="background-color:yellow;"><strong>${(totalAppraiserRating * (kraPercentage / 100)).toFixed(2)}</strong></td>
          <td colspan="2" class="text-right"></td>
          <td class="text-center"  style="background-color: #90EE90;"><strong>${(totalReviewerRating * (kraPercentage / 100)).toFixed(2)}</strong></td>
          <td></td>
        </tr>
      </tfoot>
    </table>
  `;
}

private generateSectionIITableHTML(data: any[]): string {


  const totalSelfRating = data.reduce((sum, row) => sum + (parseFloat(row.selfWeightedRating) || 0), 0);
  const totalAppraiserRating = data.reduce((sum, row) => sum + (parseFloat(row.appraiserWeightedRating) || 0), 0);
  const totalReviewerRating = data.reduce((sum, row) => sum + (parseFloat(row.reviewerWeightedRating) || 0), 0);
  const competencyPercentage = this.table11[0]?.competencies || 0;
  const kraPercentage = this.table11[0]?.kra || 0;

  const sectionIData = this.prepareSectionIExcelData([]);
  const totalKraSelf = sectionIData.reduce((sum, row) => sum + (parseFloat(row.selfWeightedRating) || 0), 0);
  const totalKraAppraiser = sectionIData.reduce((sum, row) => sum + (parseFloat(row.appraiserWeightedRating) || 0), 0);
  const totalKraReviewer = sectionIData.reduce((sum, row) => sum + (parseFloat(row.reviewerWeightedRating) || 0), 0);
  
  const finalSelf = (totalKraSelf * (kraPercentage / 100)) + (totalSelfRating * (competencyPercentage / 100));
  const finalAppraiser = (totalKraAppraiser * (kraPercentage / 100)) + (totalAppraiserRating * (competencyPercentage / 100));
  const finalReviewer = (totalKraReviewer * (kraPercentage / 100)) + (totalReviewerRating * (competencyPercentage / 100));

  return `
    <table>
      <thead>
        <tr class="table-heading">
          <th colspan="5" class="text-center">Self-Assessment</th>
          <th colspan="3" class="text-center">Appraiser Assessment</th>
          <th colspan="3" class="text-center">Reviewer Assessment</th>
        </tr>
        <tr class="table-subheading">
          <th style="width: 20px;">#</th>
          <th style="width: 150px;">Competency Title</th>
          <th style="width: 50px;">Self Rating</th>
          <th style="width: 50px;">Wt. Rating</th>
          <th style="width: 150px;">Self Feedback</th>
          <th style="width: 50px;">Rating</th>
          <th style="width: 50px;">Wt. Rating</th>
          <th style="width: 120px;">Appraiser Feedback</th>
          <th style="width: 50px;">Rating</th>
          <th style="width: 50px;">Wt. Rating</th>
          <th style="width: 120px;">Reviewer Feedback</th>
        </tr>
      </thead>
      <tbody>
        ${data.map(row => `
          <tr>
            <td class="text-center">${row.serialNo}</td>
            <td><strong>${row.competencyTitle}</strong></td>
            <td class="text-center">${row.selfRating}</td>
            <td class="text-center">${row.selfWeightedRating}</td>
            <td style="white-space: pre-wrap;">${row.selfFeedback}</td>
            <td class="text-center">${row.appraiserRating}</td>
            <td class="text-center">${row.appraiserWeightedRating}</td>
            <td style="white-space: pre-wrap;">${row.appraiserFeedback}</td>
            <td class="text-center">${row.reviewerRating}</td>
            <td class="text-center">${row.reviewerWeightedRating}</td>
            <td style="white-space: pre-wrap;">${row.reviewerFeedback}</td>
          </tr>
        `).join('')}
      </tbody>
      <tfoot>
        <tr class="total-row">
          <td colspan="3" class="text-right"></td>
          <td class="text-center"><strong>${totalSelfRating.toFixed(2)}</strong></td>
          <td colspan="2" class="text-right"></td>
          <td class="text-center"><strong>${totalAppraiserRating.toFixed(2)}</strong></td>
          <td colspan="2" class="text-right"></td>
          <td class="text-center"><strong>${totalReviewerRating.toFixed(2)}</strong></td>
          <td></td>
        </tr> 
        <tr class="total-row">
          <td colspan="3" class="text-right">Overall Competency wrt (${this.table11[0]?.competencies || 0}%)</td>
          <td class="text-center" style="background-color: #87CEEB;"><strong>${(totalSelfRating * (competencyPercentage / 100)).toFixed(2)}</strong></td>
          <td colspan="2" class="text-right"></td>
          <td class="text-center"  style="background-color:yellow"><strong>${(totalAppraiserRating * (competencyPercentage / 100)).toFixed(2)}</strong></td>
          <td colspan="2" class="text-right"></td>
          <td class="text-center" style="background-color: #90EE90;"><strong>${(totalReviewerRating * (competencyPercentage / 100)).toFixed(2)}</strong></td>
          <td></td>
        </tr>
        <tr class="static-competency-row">
              <td colspan="3" class="text-right"><strong>Number of Competencies(10)</strong></td>
              <td colspan="7"></td>
              <td></td>
          </tr>

        <tr class="total-row">
          <td colspan="3" class="text-right"><strong>FINAL RATING SCORE:</strong></td>
          <td class="text-center" style="font-size: 14px; font-weight: bold; background-color: #87CEEB;">${finalSelf.toFixed(2)}</td>
          <td colspan="2" class="text-right"></td>
          <td class="text-center" style="font-size: 14px; font-weight: bold; background-color:yellow">${finalAppraiser.toFixed(2)}</td>
          <td colspan="2" class="text-right"></td>
          <td class="text-center" style="font-size: 14px; font-weight: bold; background-color: #90EE90;">${finalReviewer.toFixed(2)}</td>
          <td></td>
        </tr>
      </tfoot>
    </table>
  `;
}

private generateTopicsTableHTML(data: any[]): string {
  if (!data || data.length === 0) {
    return '<p style="color: red; font-weight: bold;">No topics data available. Please complete all topics before exporting.</p>';
  }
  return `
    <table>
      <thead>
        <tr class="table-heading">
          <th style="width: 20px;" class="text-center">#</th>
          <th class="text-center" style="width: 200px;">Topic</th>
          <th class="text-center" style="width: 300px;">Self Assessment</th>
          <th class="text-center" style="width: 300px;">Appraiser's Remarks</th>
        </tr>
      </thead>
      <tbody>
        ${data.map(topic => `
          <tr>
            <td class="text-center">${topic.serialNo}</td>
            <td>
              <strong>${topic.topic}</strong><br><br>
              <em style="color: #666;">${topic.instructions}</em>
            </td>
            <td style="white-space: pre-wrap;">${topic.selfAssessment}</td>
            <td style="white-space: pre-wrap;">${topic.appraiserRemarks}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

private triggerExcelDownload(htmlContent: string): void {
  const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const employeeName = this.appraisalForm.get('employeeName')?.value || 'Employee';
  const employeeId = this.appraisalForm.get('employeeId')?.value || 'ID';
  const currentDate = new Date().toISOString().split('T')[0];
 
  link.href = url;
  link.download = `Performance_Appraisal_${employeeName}_${employeeId}_${currentDate}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

private getKRAName(kraId: number): string {
  if (!kraId || !this.table3 || this.table3.length === 0) {
    return 'N/A';
  }
  const kra = this.table3.find(item => item.drpValue == kraId);
  return kra ? kra.drpOption : `KRA ${kraId}`;
}

private getSharedKRANames(sharedKRAString: string | string[]): string {
  if (!sharedKRAString) return 'None';
  let sharedKRAIds: string[];
  if (Array.isArray(sharedKRAString)) {
    sharedKRAIds = sharedKRAString.map(id => id.toString());
  } else {
    sharedKRAIds = sharedKRAString.toString().split(',').map(id => id.trim());
  }
 
  if (!this.table10 || this.table10.length === 0) {
    return sharedKRAIds.join(', ');
  }
 
  const kraNames = sharedKRAIds.map(id => {
    const kra = this.table10.find(item => item.drpValue == parseInt(id));
    return kra ? kra.drpOption : `Shared KRA ${id}`;
  }).filter(name => name);
 
  return kraNames.length > 0 ? kraNames.join(', ') : 'None';
}

private calculateWeightedRatingForExcel(weightage: any, rating: any): string {
  if (!weightage || !rating) return '0.00';
 
  const weight = parseFloat(weightage.toString());
  const rate = parseFloat(rating.toString());
 
  if (isNaN(weight) || isNaN(rate)) return '0.00';
 
  return ((weight * rate) / 100).toFixed(2);
}
}