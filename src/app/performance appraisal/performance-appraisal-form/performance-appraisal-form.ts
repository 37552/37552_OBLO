import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators, FormArray, FormControl, AbstractControl, ValidatorFn } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CardModule } from 'primeng/card';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Toast } from 'primeng/toast';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { DatePickerModule } from 'primeng/datepicker';
import { CheckboxModule } from 'primeng/checkbox';
import { UserService } from '../../shared/user-service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

import Swal from 'sweetalert2';

import { ToastrService } from 'ngx-toastr';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

interface WizardStep {
  label: string;
  description: string;
  icon: string;
  completed: boolean;
}

interface TabConfig {
  label: string;
  icon: string;
}

interface AppraisalTopic {
  label: string;
  instructions: string;
}

interface DropdownOption {
  drpValue: any;
  drpOption: string;
  kpi?: string;
}

interface Question {
  questionId: number;
  question: string;
  controlTypeId: number;
  answerDetails: any[];
  currentAnswer: any[];
  subGroupId?: number;
  categoryId?: number;
  questionTypeId?: number;
}

@Component({
  selector: 'app-performance-appraisal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    Dialog,
    ConfirmDialog,
    SelectModule,
    InputTextModule,
    InputNumberModule,
    CardModule,
    ProgressSpinner,
    Toast,
    BreadcrumbModule,
    DatePickerModule,
    CheckboxModule
  ],
  providers: [ConfirmationService, MessageService, DatePipe],
  templateUrl: './performance-appraisal-form.html'
})
export class PerformanceAppraisalComponent implements OnInit {

  // Dynamic tabs from API
  basicInfoTabs: any[] = [];
  activeTab = 0;

  // Inner tabs for appraisal sections
  appraisalTabs: TabConfig[] = [
    { label: 'Section I', icon: 'pi pi-question-circle' },
    { label: 'Section II', icon: 'pi pi-chart-bar' },
    { label: 'Section III', icon: 'pi pi-briefcase' }
  ];
  innerActiveTab = 0;

  appraisalForm: FormGroup;
  sectionIForm: FormGroup;
  sectionIIForm: FormGroup;

  visible = false;
  postType = '';
  header = '';
  headerIcon = 'pi pi-plus';
  isFormLoading = false;

  isLoading = true;
  breadcrumbItems: any[] = [];
  home: any = { icon: 'pi pi-home', routerLink: '/' };

  // Data properties
  groupData: any[] = [];
  Questiondata: any[] = [];
  Radiobuttonsection1: any[] = [];
  table4: DropdownOption[] = [];
  availableKPIs: { [index: number]: any[] } = {};
  selectedKRAValues: Set<number> = new Set();
  previousKRAValues: { [key: number]: number | null } = {};

  // New properties for the integrated functions
  hrAppraisalData: any = {};
  hasShownFirstTabModal = false;
  sectionValue: any;
  QuestionDataTable: any[] = [];
  QuestionDataTableSectionIII: any[] = [];
  paramvaluedata: string = '';

  appraisalTopics: AppraisalTopic[] = [
    {
      label: 'a. Strengths (Minimum 3)',
      instructions: 'List your strengths. Emphasize what makes you distinctive and how that leads to your success at work.'
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
      label: 'd. Areas for Job Rotation / Career Growth (Minimum 3)',
      instructions: 'Mention departments/roles you are interested in exploring for growth.'
    }
  ];

  // Role properties
  isAppraisee = false;
  isAppraiser = false;
  isHOD = false;
  hasNoHOD = false;
  finalsubmitted = false;

  // Form properties
  param: string | null = null;
  FormName: any;
  FormValue: any;
  menulabel: any;
  employeeID: any;
  PerformamceHeadId: number | null = null;
  appraisalId: number | null = null;

  // UI helpers
  isButtonsDisabled = false;
  PerformanceIDofappraise: any;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private message: MessageService,
    private cdr: ChangeDetectorRef,
    private datePipe: DatePipe,
    private toastr: ToastrService,
    private route: ActivatedRoute,
  ) {
    this.appraisalForm = this.createAppraisalForm();
    this.sectionIForm = this.fb.group({});
    this.sectionIIForm = this.createSectionIIForm();
  }

  ngOnInit(): void {
    this.initializeComponent();
    this.loadDropdowns();
    this.checkFirstTabModal();
    this.getEmployeeId();
  }

  private checkFirstTabModal(): void {
    const firstTabModalShown = sessionStorage.getItem('firstTabModalShown');
    this.hasShownFirstTabModal = firstTabModalShown === 'true';
  }
  private getEmployeeId(): void {
    this.route.queryParams.subscribe(params => {
      const sessionUserId = sessionStorage.getItem('userId');
      if (params['empId']) {
        this.employeeID = params['empId'];
      } 
      else if (this.employeeID) {
        if (this.employeeID === sessionUserId) {
        } else {
        }
      } else if (sessionUserId) {
        this.employeeID = sessionUserId;
      } else {
      }
      this.PerformanceIDofappraise = params['id'];
      if (this.PerformanceIDofappraise) {
        this.PerformamceHeadId = this.PerformanceIDofappraise;
      }
    });
  }
  private initializeComponent(): void {
    this.param = sessionStorage.getItem("menuItem");
    if (this.param) {
      let paramjs = JSON.parse(this.param);
      this.FormName = paramjs.formName;
      this.FormValue = paramjs.formValue;
      this.menulabel = paramjs.menu;
    }

    this.breadcrumbItems = [
      { label: this.menulabel },
      { label: this.FormName, disabled: true }
    ];

    this.cdr.detectChanges();
  }

  private createAppraisalForm(): FormGroup {
    return this.fb.group({
      employeeName: ['', [Validators.required]],
      employeeId: ['', [Validators.required]],
      department: ['', [Validators.required]],
      designation: ['', [Validators.required]],
      company: ['', [Validators.required]],
      dojGroup: [null, [Validators.required]],
      dojCompany: [null, [Validators.required]],
      dojDept: [null, [Validators.required]],
      appraisalFrom: [null, [Validators.required]],
      appraisalTo: [null, [Validators.required]],
      reportingAuthorityName: ['', [Validators.required]],
      reportingAuthorityDesignation: ['', [Validators.required]],
      reviewerName: ['', [Validators.required]],
      reviewerDesignation: ['', [Validators.required]]
    });
  }

  private createSectionIIForm(): FormGroup {
    return this.fb.group({
      performanceIndicators: this.fb.array([], this.weightageValidator())
    });
  }

  private weightageValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const formArray = control as FormArray;
      if (formArray.length === 0) return null;

      const total = formArray.controls.reduce((sum, ctrl) => {
        const val = parseFloat(ctrl.get('weightage')?.value || '0');
        return sum + (isNaN(val) ? 0 : val);
      }, 0);

      return total > 100 ? { weightageExceeded: true } : null;
    };
  }

  loadDropdowns(): void {
    this.Radiobutton();
    this.Userdata();
  }

  Radiobutton() {
    this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblPMSRatingMaster`).subscribe((res: any) => {
      const sortedData = res?.table?.sort((a: any, b: any) => b.drpOption.localeCompare(a.drpOption)) || [];
      this.Radiobuttonsection1 = sortedData;
      this.cdr.detectChanges();
    });
  }

Userdata() {
  let userId = sessionStorage.getItem('userId');
  this.userService.getQuestionPaper(`uspGetPMSInitialMasters|action=USERDETAIL|appUserId=${userId}|id=0`)
    .subscribe((res: any) => {
      if (res?.table?.length > 0) {
        const data = res.table[0] || {};
        const data2 = Array.isArray(res.table6) ? res.table6[0] : null;
        this.hrAppraisalData = data2; 
        const data1 = Array.isArray(res.table6) ? res.table6[0] : null;
        this.basicInfoTabs = res.table2 || []; 
        this.appraisalForm.patchValue({
          employeeName: data.empName || '',
          employeeId: data.empId || '',
          department: data.department || '',
          designation: data.designation || '',
          company: data.companyName || '',
          dojGroup: data.doj ? new Date(data.doj) : null,
          dojCompany: data.doj ? new Date(data.doj) : null,
          dojDept: data.doj ? new Date(data.doj) : null,
          reportingAuthorityName: data.appraiserName || '',
          reportingAuthorityDesignation: data.appraiserDesignation || '',
          reviewerName: data.reviewerName || '',
          reviewerDesignation: data.reviewerDesignation || ''
        });
        if (data1) {
          this.appraisalId = data1.id;
          this.appraisalForm.patchValue({
            appraisalFrom: data1.appraisalFrom ? new Date(data1.appraisalFrom) : null,
            appraisalTo: data1.appraisalTo ? new Date(data1.appraisalTo) : null
          });
        }
        this.computeRoles();
      }
    });
}


isLastTab(): boolean {
  return this.activeTab === this.basicInfoTabs.length - 1;
}

  computeRoles(): void {
    const storedUserId = sessionStorage.getItem('userId');
    const numericStoredUserId = Number(storedUserId);
    this.isAppraisee = storedUserId !== null && this.employeeID == numericStoredUserId;
    const currentUserData = JSON.parse(sessionStorage.getItem('UserInfo') || '{}');
    const currentUserName = currentUserData.empnam?.trim() || '';
    const reviewerName = this.appraisalForm.get('reviewerName')?.value?.trim() || '';
    const appraiserName = this.appraisalForm.get('reportingAuthorityName')?.value?.trim() || '';

    this.isAppraiser = currentUserName === appraiserName && !this.isAppraisee;
    this.isHOD = currentUserName === reviewerName && appraiserName !== reviewerName && !this.isAppraisee;
    this.hasNoHOD = !reviewerName || reviewerName === appraiserName;
  }


  getTabClass(index: number): string {
    const baseClasses = 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center';
    if (index === this.activeTab) {
      return `${baseClasses} border-blue-500 text-blue-600`;
    } else {
      return `${baseClasses} border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300`;
    }
  }

  getInnerTabClass(index: number): string {
    const baseClasses = 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center';
    if (index === this.innerActiveTab) {
      return `${baseClasses} border-blue-500 text-blue-600`;
    } else {
      return `${baseClasses} border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300`;
    }
  }

  getTabIcon(tabName: string): string {
    const iconMap: { [key: string]: string } = {
      'Section I': 'pi pi-user',
      'Section II': 'pi pi-chart-line',
      'Section IV': 'pi pi-file',
      'Section V': 'pi pi-check-circle'
    };
    return iconMap[tabName] || 'pi pi-file';
  }

  setActiveTab(index: number): void {
    this.activeTab = index;
    if (index === 0) {
    } else if (index === 1) {
      this.initializeFormSectionI();
    } else if (index === 2) {
      // Review tab
    }
    this.cdr.detectChanges();
  }

  setInnerActiveTab(index: number): void {
    this.innerActiveTab = index;
    if (index === 0) {
      this.initializeFormSectionI();
    } else if (index === 1) {
      this.initializeFormSectionII();
    } else if (index === 2) {
      this.initializeFormSectionIII();
    }
    this.cdr.detectChanges();
  }

  // Integrated Functions
handleNextClick(): void {
  setTimeout(() => {
    try {
      if (!this.hrAppraisalData || Object.keys(this.hrAppraisalData).length === 0) {
        this.message.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'PMS has not been initialized by the HR team.'
        });
        this.isFormLoading = false;
        return;
      }

      if (this.activeTab === this.basicInfoTabs.length) {
        if (this.appraisalForm.invalid) {
          Object.keys(this.appraisalForm.controls).forEach(field => {
            const control = this.appraisalForm.get(field);
            control?.markAsTouched({ onlySelf: true });
          });
          this.message.add({
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
          this.showFirstTabModal();
          this.isFormLoading = false;
          return;
        }
        this.submitcall();
        return; 
      }

      const currentSection = this.basicInfoTabs[this.activeTab]?.drpOption;
      if (currentSection) {
        this.sectionValue = this.basicInfoTabs[this.activeTab]?.drpValue;
      }

      const filteredQuestions = this.Questiondata.filter(q => this.checkisAppraisee(q));
      const result = filteredQuestions.map((q) => {
        let answerId: any;
        let answerText: any;

        if (q.controlTypeId === 10000) { 
          answerId = this.sectionIForm.get('textSection' + q.questionId)?.value;
          answerText = q.answerDetails.find((a: { answerId: any }) => a.answerId === answerId)?.answer;
        } else {
          answerText = this.sectionIForm.get('textSection' + q.questionId)?.value;
          answerId = q.answerDetails[0]?.answerId;
        }

        return {
          questionId: q.questionId,
          answerId,
          answerText,
          questionType: q.questionTypeId
        };
      });

      let SectionIIIdata: any[] = [];
      let performanceResults: any[] = [];

      if (currentSection === 'Section I') {
        const sectionIValid = this.validateSectionI?.() ?? true;
        const sectionIIValid = this.validateSectionII?.() ?? true;

        if (sectionIValid && sectionIIValid) {
          if (this.totalWeightageCompleted !== 100) {
            this.isFormLoading = false;
            this.confirmationService.confirm({
              message: `Total weightage of KRA is ${this.totalWeightageCompleted}%. It must be exactly 100%.`,
              header: 'Total Weightage',
              icon: 'pi pi-exclamation-triangle',
              acceptButtonProps: { label: 'OK', icon: 'pi pi-check' },
              rejectVisible: false
            });
            return;
          }

          performanceResults = this.indicators.controls.map((control: AbstractControl, index: number) => {
            const group = control as FormGroup;
            const dataRow = this.QuestionDataTable[index];
            const rowId = dataRow?.id ?? 0;
            return {
              id: group.get('id')?.value || rowId,
              kra: group.get('kra')?.value || '',
              weightage: group.get('weightage')?.value || '',
              selfRemark: group.get('selfRemark')?.value || '',
              selfRating: group.get('selfRating')?.value || '',
              appraiserRemark: group.get('appraiserRemark')?.value || '',
              appraiserRating: group.get('appraiserRating')?.value || ''
            };
          });

          const finalResult = this.isAppraisee ? result : [];
          this.submitcallMain(finalResult, performanceResults, SectionIIIdata, false);
        } else {
          this.isFormLoading = false;
        }
        return;
      }

      if (['Section II', 'Section IV'].includes(currentSection)) {
        const sectionValid = this.validateSectionI?.() ?? true;
        if (sectionValid) {
          this.submitcallMain(result, performanceResults, SectionIIIdata, false);
        } else {
          this.isFormLoading = false;
        }
        return;
      }

      if (['Section V'].includes(currentSection)) {
        const sectionValid = this.validateSectionI?.() ?? true;
        if (sectionValid) {
          this.submitcallMain(result, performanceResults, SectionIIIdata, true);
        } else {
          this.isFormLoading = false;
        }
        return;
      }

      if (['Section III'].includes(currentSection)) {
        const sectionValid = this.validateSectionIII();
        if (sectionValid) {
          SectionIIIdata = this.indicators.controls.map((control: AbstractControl, index: number) => {
            const group = control as FormGroup;
            const dataRow = this.QuestionDataTableSectionIII?.[index];
            const rowId = dataRow?.id ?? 0;
            return {
              id: group.get('id')?.value || rowId,
              text: group.get('Topic')?.value || '',
              selfAssessment: group.get('SelfAssessment')?.value || '',
              appraisersRemarks: group.get('AppraisersRemarks')?.value || ''
            };
          });
          this.submitcallMain(result, performanceResults, SectionIIIdata, false);
        } else {
          this.isFormLoading = false;
        }
        return;
      }

    } catch (err) {
      this.message.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Something went wrong!'
      });
      this.isFormLoading = false;
    }
  }, 0);
}

submitcall(): void {
  this.values();

  if (!this.isAppraisee) {
    console.log('User is not appraisee, skipping API call');
    this.isFormLoading = false;
    this.nextTab();
    return;
  }
  this.isFormLoading = true;
  this.userService.SubmitPostTypeData(
    'uspPostPerformanceHead',
    this.paramvaluedata,
    this.FormName
  ).subscribe({
    next: (res: any) => {
      this.isFormLoading = false;

      if (res) {
        const resultarray = res.split("-");
        if (resultarray[1] === "success" || resultarray[0] === "1") {
          this.message.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Employee details saved successfully!'
          });

          this.PerformamceHead();
        } else {
          this.message.add({
            severity: 'error',
            summary: 'Error',
            detail: resultarray[1] || 'Failed to save employee details'
          });
        }
      }
    },
    error: (err) => {
      this.isFormLoading = false;
      this.message.add({
        severity: 'error',
        summary: 'Error',
        detail: `API call failed: ${err.message || 'Unknown error'}`
      });
    }
  });
}

  submitcallMain(result: any, performanceResults: any, SectionIIIdata: any, finelSubmittedcall: boolean) {
    setTimeout(() => {
      const activeTabLabel = this.basicInfoTabs[this.activeTab]?.drpOption || '';

      if (this.finalsubmitted === true) {
        this.gotoNextTab?.();
        return;
      }

      if (activeTabLabel === 'Section III' && !this.isAppraisee) {
        const allFieldsEmpty = this.indicators.controls.every((control: AbstractControl) => {
          const selfAssessment = control.get('SelfAssessment')?.value?.toString().trim();
          const topic = control.get('Topic')?.value?.toString().trim();
          return !selfAssessment && !topic;
        });

        if (allFieldsEmpty) {
          Swal.fire({
            icon: 'warning',
            title: 'Waiting for Appraisee',
            html: 'Please wait for the appraisee to complete <b>Section III</b> (Topic and Self Assessment).',
            confirmButtonText: 'OK',
            confirmButtonColor: '#3085d6'
          });
          return;
        }
      }

      else if (activeTabLabel === 'Section I' && !this.isAppraisee) {
        const allFieldsEmpty = this.indicators.controls.every((control: AbstractControl) => {
          const selfRemark = control.get('selfRemark')?.value?.toString().trim();
          const selfRating = control.get('selfRating')?.value?.toString().trim();
          return !selfRemark && !selfRating;
        });

        if (allFieldsEmpty) {
          Swal.fire({
            icon: 'warning',
            title: 'Waiting for Appraisee',
            html: 'Please wait for the appraisee to complete <b>Section I</b> (Remarks and Rating).',
            confirmButtonText: 'OK',
            confirmButtonColor: '#3085d6'
          });
          return;
        }
      }

      if (activeTabLabel === 'Section IV' && this.isAppraisee) {
        const hasEmptyAppraiserQuestions = this.Questiondata.some((q: any) => {
          return !this.checkisAppraisee(q) && (!q.currentAnswer || q.currentAnswer.length === 0);
        });

        if (hasEmptyAppraiserQuestions) {
          Swal.fire({
            icon: 'info',
            title: 'Waiting for Appraiser',
            html: 'Please wait for the appraiser to complete Section IV.',
            confirmButtonText: 'OK',
            confirmButtonColor: '#3085d6'
          });
          return;
        }
      }

      const data = JSON.stringify(result);
      const Performancedata = JSON.stringify(performanceResults);
      const Sectiondata = JSON.stringify(SectionIIIdata);
      const finelSubmitted = this.isHOD && activeTabLabel === 'Section V';
      const query = `performanceHeadId=${this.PerformamceHeadId}|answerJson=${data}|section3json=${Sectiondata}|selfassessment=${Performancedata}|finelSubmitted=${finelSubmitted}|appUserId=${sessionStorage.getItem('userId')}`;
      this.userService.SubmitPostTypeData(
        `uspPostQuestionAnswer`,
        query,
        this.FormName
      ).subscribe({
        next: (res: any) => {
          if (res) {
            const resultarray = res.split("-");
            if (resultarray[1] === "success") {
              if (activeTabLabel === 'Section I') {
                if (this.isAppraisee) {
                  const hasEmptyAppraiserFields = this.indicators.controls.some((control: AbstractControl) => {
                    const remark = control.get('appraiserRemark')?.value?.toString().trim();
                    const rating = control.get('appraiserRating')?.value?.toString().trim();
                    return !remark || !rating;
                  });

                  if (hasEmptyAppraiserFields) {
                    Swal.fire({
                      icon: 'info',
                      title: 'Waiting for Appraiser',
                      html: 'Your data has been saved successfully. Please wait for the appraiser to fill their assessment (Remarks and Rating) in Section I.',
                      confirmButtonText: 'OK',
                      confirmButtonColor: '#3085d6'
                    });
                    return;
                  }

                  if (!this.hasUnansweredOtherSectionQuestions?.()) {
                    this.toastr.success('Data saved successfully of - ' + activeTabLabel);
                    this.gotoNextTab?.();
                  } else {
                    Swal.fire({
                      icon: 'info',
                      title: 'Waiting for Appraiser',
                      html: 'Your data has been saved successfully. Please wait for the appraiser to fill their assessment in the ' + activeTabLabel,
                      confirmButtonText: 'OK',
                      confirmButtonColor: '#3085d6'
                    });
                  }
                  return;
                }

                if (!this.isAppraisee) {
                  const hasEmptySelfFields = this.indicators.controls.some((control: AbstractControl) => {
                    const remark = control.get('selfRemark')?.value?.toString().trim();
                    const rating = control.get('selfRating')?.value?.toString().trim();
                    return !remark || !rating;
                  });

                  if (hasEmptySelfFields) {
                    Swal.fire({
                      icon: 'warning',
                      title: 'Incomplete Self Assessment',
                      html: 'Your data has been saved successfully. Please wait for the appraisee to complete their self-assessment (Remarks and Rating) in Section I.',
                      confirmButtonText: 'OK',
                      confirmButtonColor: '#3085d6'
                    }).then(() => {
                      this.isButtonsDisabled = true;
                    });
                    return;
                  }

                  if (!this.hasUnansweredOtherSectionQuestions?.()) {
                    this.toastr.success('Data saved successfully of - ' + activeTabLabel);
                    this.gotoNextTab?.();
                  } else {
                    Swal.fire({
                      icon: 'info',
                      title: 'Waiting for Appraiser',
                      html: 'Your data has been saved successfully. Please wait for the appraiser to fill their assessment in the ' + activeTabLabel,
                      confirmButtonText: 'OK',
                      confirmButtonColor: '#3085d6'
                    });
                  }
                  return;
                }
              }

              if (activeTabLabel === 'Section III') {
                if (this.isAppraisee) {
                  const hasEmptyAppraiserRemarks = this.indicators.controls.some((control: AbstractControl) => {
                    const remarks = control.get('AppraisersRemarks')?.value?.toString().trim();
                    return !remarks;
                  });

                  if (hasEmptyAppraiserRemarks) {
                    Swal.fire({
                      icon: 'info',
                      title: 'Waiting for Appraiser',
                      html: 'Your data has been saved successfully. Please wait for the appraiser to fill their remarks in Section III.',
                      confirmButtonText: 'OK',
                      confirmButtonColor: '#3085d6'
                    });
                    return;
                  }

                  if (!this.hasUnansweredOtherSectionQuestions?.()) {
                    this.toastr.success('Data saved successfully of - ' + activeTabLabel);
                    this.gotoNextTab?.();
                  } else {
                    Swal.fire({
                      icon: 'info',
                      title: 'Waiting for Appraiser',
                      html: 'Your data has been saved successfully. Please wait for the appraiser to fill their assessment in the ' + activeTabLabel,
                      confirmButtonText: 'OK',
                      confirmButtonColor: '#3085d6'
                    });
                  }
                  return;
                }

                if (!this.isAppraisee) {
                  const hasEmptySelfAssessment = this.indicators.controls.some((control: AbstractControl) => {
                    const selfAssessment = control.get('SelfAssessment')?.value?.toString().trim();
                    return !selfAssessment;
                  });

                  if (hasEmptySelfAssessment) {
                    Swal.fire({
                      icon: 'warning',
                      title: 'Incomplete Self Assessment',
                      html: 'Your data has been saved successfully. Please wait for the appraisee to complete their self-assessment in Section III.',
                      confirmButtonText: 'OK',
                      confirmButtonColor: '#3085d6'
                    }).then(() => {
                      this.isButtonsDisabled = true;
                    });
                    return;
                  }

                  if (!this.hasUnansweredOtherSectionQuestions?.()) {
                    this.toastr.success('Data saved successfully of - ' + activeTabLabel);
                    this.gotoNextTab?.();
                  } else {
                    Swal.fire({
                      icon: 'info',
                      title: 'Waiting for Appraiser',
                      html: 'Your data has been saved successfully. Please wait for the appraiser to fill their assessment in the ' + activeTabLabel,
                      confirmButtonText: 'OK',
                      confirmButtonColor: '#3085d6'
                    });
                  }
                  return;
                }
              }

              if (!this.hasUnansweredOtherSectionQuestions?.()) {
                this.toastr.success('Data saved successfully of - ' + activeTabLabel);
                this.gotoNextTab?.();
              } else {
                Swal.fire({
                  icon: 'info',
                  title: 'Waiting for Appraiser',
                  html: 'Your data has been saved successfully. Please wait for the appraiser to fill their assessment in the ' + activeTabLabel,
                  confirmButtonText: 'OK',
                  confirmButtonColor: '#3085d6'
                });
              }

            } else {
              this.toastr.error(`Server error: ${res}`);
            }
          }
        },
        error: (err) => {
          this.toastr.error('Something went wrong!');
        }
      });
    }, 100);
  }

PerformamceHead() {
  const userId = sessionStorage.getItem('userId');
  if (!userId) {
    this.toastr.error('User ID not found in session', 'Error');
    return;
  }
  const endpoint = `uspGetCurrentPerformanceHead|appraisalPeriodId=${this.appraisalId}|appUserId=${userId}`;
  this.userService.getQuestionPaper(endpoint)
    .pipe(
      catchError(error => {
        return throwError(() => error);
      })
    )
    .subscribe((res: any) => {
      if (res?.table?.length > 0) {
        this.PerformamceHeadId = res.table[0].id;
        const firstSectionValue = this.basicInfoTabs?.[0]?.drpValue;
        if (this.PerformamceHeadId) {
          this.QuestionData(firstSectionValue, this.PerformamceHeadId);
        }
        this.finalsubmitted = res.table[0].finelSubmitted;
        if (this.finalsubmitted === true) {
          this.sectionIForm.disable();
          this.sectionIIForm.disable();
          Swal.fire({
            icon: 'warning',
            title: 'Action Required',
            html: 'Your Performance Appraisal form has been successfully submitted by your Appraiser or Reviewer. Hence you can\'t perform any further action on Performance Appraisal form',
            confirmButtonText: 'OK',
            confirmButtonColor: '#3085d6'
          });
        } else {
          this.sectionIForm.enable();
          this.sectionIIForm.enable();
        }
      }
      this.gotoNextTab?.();
    });
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

  private checkisAppraisee(question: any): boolean {
    return this.isAppraisee;
  }

  private validateSectionI(): boolean {
    return this.sectionIForm.valid;
  }

  private validateSectionIII(): boolean {
    return true;
  }

  private submitcallMainFallback(result: any[], performanceResults: any[], sectionIIIdata: any[], isFinal: boolean): void {
    this.isFormLoading = true;
    console.log('Submitting data fallback:', { result, performanceResults, sectionIIIdata, isFinal });
    if (!isFinal) {
      this.nextTab();
    }
    this.isFormLoading = false;
  }

private values(): void {
  const formData = this.appraisalForm.getRawValue();
  
  console.log('Form data:', formData);
  const formatDate = (date: any) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

const empMasterID = sessionStorage.getItem('userId');
const districtId = sessionStorage.getItem('District');
const appraisalFrom = this.datePipe.transform(this.appraisalForm.get('appraisalFrom')?.value, 'yyyy-MM-dd');
const appraisalTo = this.datePipe.transform(this.appraisalForm.get('appraisalTo')?.value, 'yyyy-MM-dd');

this.paramvaluedata = `appUserId=${empMasterID}|districtId=${districtId}|appraisalFrom=${appraisalFrom}|appraisalTo=${appraisalTo}|appraisalPeriodId=${this.appraisalId}`;

console.log('Built parameter string:', this.paramvaluedata);
}

  nextTab(): void {
    if (this.activeTab < this.basicInfoTabs.length - 1) {
      this.activeTab++;
      this.cdr.detectChanges();
    }
  }

  previousTab(): void {
    if (this.activeTab > 0) {
      this.activeTab--;
      this.cdr.detectChanges();
    }
  }

  validateCurrentTab(): boolean {
    if (this.activeTab === 0) {
      if (this.appraisalForm.invalid) {
        this.appraisalForm.markAllAsTouched();
        this.message.add({
          severity: 'error',
          summary: 'Validation Error',
          detail: 'Please fill all required fields in Employee & Appraisal Details'
        });
        this.scrollToFirstInvalidControl();
        return false;
      }
      return true;
    } else if (this.activeTab === 1) {
      // Validate appraisal sections
      if (this.innerActiveTab === 1 && !this.validateSectionII()) {
        return false;
      }
      return true;
    }
    return true;
  }

  private validateSectionII(): boolean {
    if (this.sectionIIForm.invalid) {
      this.sectionIIForm.markAllAsTouched();
      this.message.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please complete all required fields in Section II'
      });
      return false;
    }

    if (this.totalWeightageCompleted !== 100) {
      this.message.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: `Total weightage must be exactly 100%. Current total: ${this.totalWeightageCompleted}%`
      });
      return false;
    }

    return true;
  }

  private scrollToFirstInvalidControl(): void {
    const firstInvalidControl = Object.keys(this.appraisalForm.controls).find(key =>
      this.appraisalForm.get(key)?.invalid
    );

    if (firstInvalidControl) {
      const element = document.querySelector(`[formControlName="${firstInvalidControl}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        (element as HTMLElement).focus();
      }
    }
  }

  // Section I Methods
  initializeFormSectionI(): void {
    this.sectionIForm = this.fb.group({});

    this.Questiondata.forEach((question: Question) => {
      const controlName = 'textSection' + question.questionId;
      let controlValue: any = '';

      if (question.controlTypeId === 10002) {
        controlValue = question.currentAnswer?.length ? question.currentAnswer[0]?.answerText : '';
      } else if (question.controlTypeId === 10000) {
        controlValue = question.currentAnswer?.length ? question.currentAnswer[0]?.AnswerId : '';
      }

      const control = new FormControl(controlValue, Validators.required);
      this.sectionIForm.addControl(controlName, control);

      if (!this.isAppraisee || this.finalsubmitted) {
        control.disable();
      }
    });
  }

  // Section II Methods
  initializeFormSectionII(): void {
    this.sectionIIForm = this.fb.group({
      performanceIndicators: this.fb.array([], this.weightageValidator())
    });

    const indicatorsArray = this.indicators;
    indicatorsArray.clear();

    // Add initial indicator if empty
    if (indicatorsArray.length === 0) {
      this.addIndicator();
    }
  }

  // Section III Methods
  initializeFormSectionIII(): void {
    this.sectionIIForm = this.fb.group({
      performanceIndicators: this.fb.array([], this.weightageValidator())
    });

    const indicatorsArray = this.indicators;
    indicatorsArray.clear();

    // Add topics for Section III
    this.appraisalTopics.forEach((topic, index) => {
      const indicatorGroup = this.fb.group({
        Topic: ['', this.isAppraisee ? Validators.required : []],
        SelfAssessment: ['', this.isAppraisee ? Validators.required : []],
        AppraisersRemarks: ['', !this.isAppraisee ? Validators.required : []]
      });

      indicatorsArray.push(indicatorGroup);
    });
  }

  // Form Array Methods
  get indicators(): FormArray {
    return this.sectionIIForm.get('performanceIndicators') as FormArray;
  }

  addIndicator(): void {
    const indicatorGroup = this.fb.group({
      kra: ['', Validators.required],
      weightage: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      selfRemark: ['', this.isAppraisee ? Validators.required : []],
      selfRating: ['', this.isAppraisee ? Validators.required : []],
      appraiserRemark: ['', !this.isAppraisee ? Validators.required : []],
      appraiserRating: ['', !this.isAppraisee ? Validators.required : []]
    });

    this.indicators.push(indicatorGroup);
    const newIndex = this.indicators.length - 1;
    this.previousKRAValues[newIndex] = null;
    this.availableKPIs[newIndex] = [];
  }

  removeIndicator(index: number): void {
    if (this.indicators.length > 1) {
      const kraValue = this.indicators.at(index).get('kra')?.value;
      if (kraValue) {
        this.selectedKRAValues.delete(Number(kraValue));
      }
      delete this.availableKPIs[index];
      delete this.previousKRAValues[index];
      this.indicators.removeAt(index);
      this.indicators.updateValueAndValidity();
      this.cdr.detectChanges();
    }
  }

  onKRAChange(index: number): void {
    const newValue = Number(this.indicators.at(index).get('kra')?.value) || null;
    const previousValue = this.previousKRAValues[index];

    if (previousValue !== null && previousValue !== newValue) {
      this.selectedKRAValues.delete(previousValue);
    }

    if (newValue !== null) {
      this.selectedKRAValues.add(newValue);
    }

    this.previousKRAValues[index] = newValue;
    const selectedKRA = this.table4.find(kra => kra.drpValue == newValue);

    if (selectedKRA) {
      try {
        this.availableKPIs[index] = JSON.parse(selectedKRA.kpi || '[]') || [];
      } catch (error) {
        this.availableKPIs[index] = [];
      }
    } else {
      this.availableKPIs[index] = [];
    }

    this.cdr.detectChanges();
  }

  getAvailableKRAs(currentIndex: number): DropdownOption[] {
    const currentSelectedValue = this.indicators.at(currentIndex).get('kra')?.value;
    return this.table4.filter(kra => {
      if (kra.drpValue == currentSelectedValue) {
        return true;
      }
      return !this.selectedKRAValues.has(kra.drpValue);
    });
  }

  getKRAName(kraId: number): string {
    const kra = this.table4.find(k => k.drpValue === kraId);
    return kra ? kra.drpOption : 'Unknown KRA';
  }

  get totalWeightageCompleted(): number {
    const total = this.indicators.controls.reduce((sum, ctrl) => {
      const val = parseFloat(ctrl.get('weightage')?.value || '0');
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
    return Math.round(total * 100) / 100; // Round to 2 decimal places
  }

  // Form Validation
  isInvalid(field: string): boolean {
    const control = this.appraisalForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  // Data Loading Methods
  QuestionData(selectedSectionId: number, PerformamceHeadId: number): void {
    if (!selectedSectionId) return;

    let userId = sessionStorage.getItem('userId');
    let Role = JSON.parse(sessionStorage.getItem('currentRole') || '{}')?.roleId;


    this.userService.getQuestionPaper(
      `uspGetQuestionAnswer|performanceHeadId=${PerformamceHeadId}|appUserId=${this.employeeID}|appUserRoleId=${Role}`
    ).subscribe({
      next: (res: any) => {
        if (res?.table && Array.isArray(res.table)) {
          this.Questiondata = res.table;
          this.table4 = res.table4 || [];

          this.Questiondata.forEach((question: any) => {
            if (typeof question.answerDetails === 'string') {
              question.answerDetails = JSON.parse(question.answerDetails);
            }
            if (typeof question.currentAnswer === 'string') {
              question.currentAnswer = JSON.parse(question.currentAnswer);
            }
          });

          this.initializeFormSectionI();
        }
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.message.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load questions'
        });
        this.isLoading = false;
      }
    });
  }

  GroupData(selectedSectionId: number): void {
    if (!selectedSectionId) return;

    let userId = sessionStorage.getItem('userId');
    if (!userId) return;

    this.userService.getQuestionPaper(`uspGetPMSInitialMasters|action=GROUP|appUserId=${userId}|id=${selectedSectionId}`)
      .subscribe((res: any) => {
        if (res?.table?.length > 0) {
          this.groupData = res.table;
          this.groupData.forEach(group => {
            if (typeof group.column1 === 'string') {
              group.column1 = JSON.parse(group.column1);
            }
          });
        } else {
          this.groupData = [];
        }
      });
  }

  // Dialog Methods
  showDialog(view: string, data: any = null): void {
    this.isFormLoading = true;
    this.activeTab = 0;
    this.innerActiveTab = 0;

    if (view === 'add') {
      this.initializeAddMode();
    } else {
      this.initializeEditViewMode(view, data);
    }
  }

  private initializeAddMode(): void {
    this.visible = true;
    this.postType = 'add';
    this.header = 'Create Performance Appraisal';
    this.headerIcon = 'pi pi-plus';
    this.appraisalForm.reset();
    this.appraisalForm.enable();
    this.sectionIForm = this.fb.group({});
    this.sectionIIForm = this.createSectionIIForm();
    this.indicators.clear();
    this.addIndicator();
    this.isFormLoading = false;
    this.cdr.detectChanges();
  }

  private initializeEditViewMode(view: string, data: any): void {
    this.visible = true;
    this.postType = view;
    this.header = view === 'update' ? 'Update Performance Appraisal' : 'View Performance Appraisal';
    this.headerIcon = view === 'update' ? 'pi pi-pencil' : 'pi pi-eye';

    if (view === 'view') {
      this.appraisalForm.disable();
      this.sectionIIForm.disable();
    } else {
      this.appraisalForm.enable();
    }

    this.loadAppraisalData(data);
  }

  private loadAppraisalData(data: any): void {
    // Implement data loading logic based on your data structure
    if (data) {
      this.appraisalForm.patchValue({
        employeeName: data.employeeName || '',
        employeeId: data.employeeId || '',
        department: data.department || '',
        designation: data.designation || '',
        company: data.company || '',
        dojGroup: data.dojGroup || null,
        dojCompany: data.dojCompany || null,
        dojDept: data.dojDept || null,
        appraisalFrom: data.appraisalFrom || null,
        appraisalTo: data.appraisalTo || null,
        reportingAuthorityName: data.reportingAuthorityName || '',
        reportingAuthorityDesignation: data.reportingAuthorityDesignation || '',
        reviewerName: data.reviewerName || '',
        reviewerDesignation: data.reviewerDesignation || ''
      });

      this.PerformamceHeadId = data.id;
    }

    this.isFormLoading = false;
    this.cdr.detectChanges();
  }

  onSubmit(event: Event): void {
    event.preventDefault();

    if (this.validateCurrentTab() && this.appraisalForm.valid) {
      this.openConfirmation(
        'Confirm Performance Appraisal',
        'Are you sure you want to submit this performance appraisal?',
        'submit'
      );
    } else {
      this.message.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please complete all required fields before submitting.'
      });
    }
  }

  private submitAppraisal(): void {
    this.isFormLoading = true;

    // Prepare data for submission
    const formData = this.appraisalForm.getRawValue();
    const sectionIData = this.prepareSectionIData();
    const sectionIIData = this.prepareSectionIIData();

    const query = this.buildSubmissionQuery(formData, sectionIData, sectionIIData);

    this.userService.SubmitPostTypeData('uspPostPerformanceAppraisal', query, this.FormName)
      .subscribe({
        next: (response: any) => {
          this.isFormLoading = false;
          this.handleSubmitResponse(response);
        },
        error: (error: HttpErrorResponse) => {
          this.isFormLoading = false;
          this.message.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to submit performance appraisal. Please try again.'
          });
        }
      });
  }

  private prepareSectionIData(): any[] {
    const result: any[] = [];
    Object.keys(this.sectionIForm.controls).forEach(controlName => {
      if (controlName.startsWith('textSection')) {
        const questionId = controlName.replace('textSection', '');
        const control = this.sectionIForm.get(controlName);
        result.push({
          questionId: parseInt(questionId),
          answer: control?.value
        });
      }
    });
    return result;
  }

  private prepareSectionIIData(): any[] {
    return this.indicators.controls.map((control, index) => {
      return {
        kra: control.get('kra')?.value,
        weightage: control.get('weightage')?.value,
        selfRemark: control.get('selfRemark')?.value,
        selfRating: control.get('selfRating')?.value,
        appraiserRemark: control.get('appraiserRemark')?.value,
        appraiserRating: control.get('appraiserRating')?.value
      };
    });
  }

  private buildSubmissionQuery(formData: any, sectionIData: any[], sectionIIData: any[]): string {
    const userId = sessionStorage.getItem('userId');
    const districtId = sessionStorage.getItem('District');
    const roleId = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;

    let query = `appUserId=${userId}`;
    query += `|districtId=${districtId}`;
    query += `|appUserRole=${roleId}`;
    query += `|employeeName=${encodeURIComponent(formData.employeeName)}`;
    query += `|employeeId=${encodeURIComponent(formData.employeeId)}`;
    query += `|department=${encodeURIComponent(formData.department)}`;
    query += `|designation=${encodeURIComponent(formData.designation)}`;
    query += `|company=${encodeURIComponent(formData.company)}`;
    query += `|dojGroup=${formData.dojGroup}`;
    query += `|dojCompany=${formData.dojCompany}`;
    query += `|dojDept=${formData.dojDept}`;
    query += `|appraisalFrom=${formData.appraisalFrom}`;
    query += `|appraisalTo=${formData.appraisalTo}`;
    query += `|reportingAuthorityName=${encodeURIComponent(formData.reportingAuthorityName)}`;
    query += `|reportingAuthorityDesignation=${encodeURIComponent(formData.reportingAuthorityDesignation)}`;
    query += `|reviewerName=${encodeURIComponent(formData.reviewerName)}`;
    query += `|reviewerDesignation=${encodeURIComponent(formData.reviewerDesignation)}`;
    query += `|sectionIData=${JSON.stringify(sectionIData)}`;
    query += `|sectionIIData=${JSON.stringify(sectionIIData)}`;

    if (this.PerformamceHeadId) {
      query += `|performanceHeadId=${this.PerformamceHeadId}`;
    }

    return query;
  }

  private handleSubmitResponse(response: any): void {
    if (response && typeof response === 'string') {
      const resultArray = response.split('-');
      if (resultArray[0] === '1') {
        this.message.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Performance appraisal submitted successfully!'
        });
        this.onDrawerHide();
      } else {
        this.message.add({
          severity: 'error',
          summary: 'Error',
          detail: resultArray[1] || 'Failed to submit appraisal'
        });
      }
    } else {
      this.message.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Performance appraisal processed successfully!'
      });
      this.onDrawerHide();
    }
  }

  openConfirmation(title: string, msg: string, action: string): void {
    this.confirmationService.confirm({
      message: msg,
      header: title,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Yes', icon: 'pi pi-check' },
      rejectButtonProps: { label: 'No', icon: 'pi pi-times', severity: 'secondary' },
      accept: () => {
        if (action === 'submit') {
          this.submitAppraisal();
        }
      }
    });
  }

  onDrawerHide(): void {
    this.visible = false;
    this.activeTab = 0;
    this.innerActiveTab = 0;
    this.appraisalForm.reset();
    this.appraisalForm.enable();
    this.sectionIForm = this.fb.group({});
    this.sectionIIForm = this.createSectionIIForm();
    this.indicators.clear();
    this.cdr.detectChanges();
  }

  trackByIndex(index: number): number {
    return index;
  }

  // placeholder for hasUnansweredOtherSectionQuestions used in merged logic
  private hasUnansweredOtherSectionQuestions(): boolean {
    // implement logic or keep as false if not used
    // For now return false to allow progression unless overridden
    return false;
  }

  // placeholder gotoNextTab to be used by merged logic
  private gotoNextTab(): void {
    this.nextTab();
  }
}
