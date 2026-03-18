import { Component, ChangeDetectorRef } from '@angular/core';
import { TableTemplate, TableColumn, Tab } from '../../table-template/table-template';
import { ButtonModule } from 'primeng/button';
import { Popover } from 'primeng/popover';
import { Tooltip } from "primeng/tooltip";
import { Dialog } from 'primeng/dialog';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { CardModule } from 'primeng/card';
import { DrawerModule } from 'primeng/drawer';
import { UserService } from '../../shared/user-service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Toast } from 'primeng/toast';
import { MultiSelectModule } from 'primeng/multiselect';
import { Customvalidation, noInvalidPipelineName } from '../../shared/Validation';
import { TableModule } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { TabsModule } from 'primeng/tabs';
import { RadioButtonModule } from 'primeng/radiobutton';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-interview-assessment',
  imports: [
    TableTemplate,
    CardModule,
    ButtonModule,
    DrawerModule,
    Popover,
    CommonModule,
    SelectModule,
    DatePickerModule,
    ConfirmDialog,
    ProgressSpinner,
    MultiSelectModule,
    Toast,
    Tooltip,
    Dialog,
    TableModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    FormsModule,
    ReactiveFormsModule,
    TagModule,
    TabsModule,
    RadioButtonModule,
    BreadcrumbModule
  ],
  providers: [
    ConfirmationService,
    MessageService,
    DatePipe
  ],
  templateUrl: './interview-assessment.html',
  styleUrl: './interview-assessment.scss'
})
export class InterviewAssessment {
  breadcrumbItems!: ({ label: any; disabled?: undefined; } | { label: any; disabled: boolean; })[];
  pageNo = 1;
  pageSize = 5;
  searchText = '';
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  menulabel: any;
  FormName: any;
  FormValue: any;
  param: string = '';
  isLoading = true;
  visible: boolean = false;
  postType: string = '';
  header: any = '';
  selectedIndex: any = [];
  headerIcon: string = 'pi pi-plus';
  paramvaluedata: string = '';
  isFormLoading: boolean = false;
  data: any[] = [];
  detailData: any[] = [];
  evaluationForm: FormGroup;
  totalCount = 0;
  detailTotalCount = 0;
  detailPageNo = 1;
  detailPageSize = 5;
  detailSearchText = '';
  evaluateDailog: boolean = false;
  selectedDetails: any[] = [];
  selectedParentId: number | null = null;
  candidateId: any;
  indentNoId: any;
  hodQuestions: any[] = [];
  hrQuestions: any[] = [];
  userRole: string = '';
  technicalRecommendation: string = '';
  hrDecision: string = '';
  evaluationDisabled: boolean = false;
  hodStatus: any;
  hrStatus: any;

  // --- Main table tabs & columns ---
  activeTabValue: number = 0;

  tabs: Tab[] = [
    { label: 'Pending Request', count: 0, value: 0 },
    { label: 'Processed Request', count: 0, value: 1 }
  ];

  columns: TableColumn[] = [
    { key: 'jsonDetails', header: 'Candidate Details', isVisible: true, isSortable: false, isCustom: true },
    { key: 'indentNo', header: 'Indent No', isVisible: true, isSortable: false },
    { key: 'division', header: 'Division', isVisible: true, isSortable: false },
    { key: 'department', header: 'Department', isVisible: true, isSortable: false },
    { key: 'profile', header: 'Profile', isVisible: true, isSortable: false },
    { key: 'location', header: 'Location', isVisible: true, isSortable: false },
    { key: 'reporting', header: 'Reporting', isVisible: true, isSortable: false },
  ];

  // --- Detail table columns (inside drawer) ---
  detailColumns: TableColumn[] = [
    { key: 'actions', header: 'Action', isVisible: true, isSortable: false, isCustom: true },
    { key: 'candidateName', header: 'Name', isVisible: true, isSortable: false },
    { key: 'candidateEmail', header: 'Email', isVisible: true, isSortable: false },
    { key: 'candidatePhone', header: 'Phone', isVisible: true, isSortable: false },
    { key: 'applyFor', header: 'Apply For', isVisible: true, isSortable: false },
    { key: 'experience', header: 'Experience', isVisible: true, isSortable: false },
    { key: 'currentCTC', header: 'CTC', isVisible: true, isSortable: false },
    { key: 'expectedCTC', header: 'Expected CTC', isVisible: true, isSortable: false },
    { key: 'negotiableCTC', header: 'Negotiable CTC', isVisible: true, isSortable: false },
    { key: 'noticePeriod', header: 'Notice Period', isVisible: true, isSortable: false },
    { key: 'remarks', header: 'Remarks', isVisible: true, isSortable: false },
    { key: 'jsonDetails', header: 'Resume', isVisible: true, isSortable: false, isCustom: true },
    { key: 'interviewDate', header: 'Interview Date', isVisible: true, isSortable: false },
    { key: 'interviewTime', header: 'Interview Time', isVisible: true, isSortable: false },
  ];

  constructor(private fb: FormBuilder,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private message: MessageService,
    public Customvalidation: Customvalidation,
    private cdr: ChangeDetectorRef,
    private datePipe: DatePipe) {

    this.evaluationForm = fb.group({})

  }

  get f() { return this.evaluationForm.controls }


  ngOnInit(): void {
    this.param = sessionStorage.getItem('menuItem') ?? '';
    let paramjs = JSON.parse(this.param);
    this.menulabel = paramjs.menu;
    this.FormName = paramjs.formName;
    this.FormValue = paramjs.formValue;
    this.getTableData(true);
    this.getTabCounts();
    const userData = JSON.parse(sessionStorage.getItem('UserInfo') || '{}');
    this.userRole = userData?.currentRole?.trim() || '';
    this.breadcrumbItems = [
      { label: this.menulabel },
      { label: this.FormName, disabled: true }
    ];
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  getTableData(isPaginated: boolean) {
    try {
      if (isPaginated) {
        this.isLoading = true;
      } else {
        this.pageNo = 1;
      }

      const userId = sessionStorage.getItem('userId') || '';
      const roleId = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
      const districtId = sessionStorage.getItem('District') || '';

      const query = `searchText=${encodeURIComponent(this.searchText)}|pageIndex=${this.pageNo}|size=${this.pageSize}|appUserRole=${roleId}|appUserId=${userId}|districtId=${districtId}`;

      const spName = this.activeTabValue === 0
        ? 'uspGetResumeForAssessment'
        : 'uspGetResumeForAssessmentProcessed';

      this.userService.getQuestionPaper(`${spName}|${query}`).subscribe({
        next: (res: any) => {
          try {
            this.data = (res?.table1 || []).map((item: any) => ({
              ...item,
              details: item.details ? JSON.parse(item.details) : []
            }));

            this.totalCount = res?.table?.[0]?.totalCnt || this.data.length;
            this.updateTabCount();
          } catch (innerErr) {
            console.error('Error processing response:', innerErr);
            this.data = [];
            this.totalCount = 0;
          } finally {
            this.isLoading = false;
            this.cdr.detectChanges();
          }
        },

      });
    } catch (error) {
      console.error('Unexpected error in getTableData():', error);
      this.isLoading = false;
    }
  }

  getTabCounts() {
    const userId = sessionStorage.getItem('userId') || '';
    const roleId = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
    const districtId = sessionStorage.getItem('District') || '';

    const query = `searchText=|pageIndex=1|size=1|appUserRole=${roleId}|appUserId=${userId}|districtId=${districtId}`;

    const pendingApi = this.userService.getQuestionPaper(`uspGetResumeForAssessment|${query}`);
    const processedApi = this.userService.getQuestionPaper(`uspGetResumeForAssessmentProcessed|${query}`);

    forkJoin([pendingApi, processedApi]).subscribe(([pendingRes, processedRes]: any) => {

      this.tabs[0].count = pendingRes?.table?.[0]?.totalCnt || 0;
      this.tabs[1].count = processedRes?.table?.[0]?.totalCnt || 0;

      this.cdr.detectChanges();
    });
  }

  onTabChange(newValue: string | number) {
    this.activeTabValue = Number(newValue);
    this.pageNo = 1;
    this.searchText = '';
    this.getTableData(true);
  }

  updateTabCount() {
    const activeTab = this.tabs.find(tab => tab.value === this.activeTabValue);
    if (activeTab) {
      activeTab.count = this.totalCount;
    }
  }

  onPageChange(newPage: number) {
    this.pageNo = newPage;
    this.getTableData(true);
  }

  onPageSizeChange(newSize: number) {
    this.pageSize = newSize;
    this.pageNo = 1;
    this.getTableData(true);
  }

  onSearchChange(search: string) {
    this.searchText = search;
    this.pageNo = 1;
    this.getTableData(false);
  }

  onSortChange(event: { column: string, direction: 'asc' | 'desc' }) {
    this.sortColumn = event.column;
    this.sortDirection = event.direction;
    this.getTableData(true);
  }

  // --- Detail table pagination/search ---
  onDetailPageChange(newPage: number) {
    this.detailPageNo = newPage;
    this.detailData = this.selectedDetails.slice(
      (newPage - 1) * this.detailPageSize,
      newPage * this.detailPageSize
    );
  }

  onDetailPageSizeChange(newSize: number) {
    this.detailPageSize = newSize;
    this.detailPageNo = 1;
    this.detailData = this.selectedDetails.slice(0, newSize);
  }

  onDetailSearchChange(search: string) {
    this.detailSearchText = search;
    const lower = search.toLowerCase();
    const filtered = this.selectedDetails.filter(c =>
      (c.candidateName || '').toLowerCase().includes(lower) ||
      (c.candidateEmail || '').toLowerCase().includes(lower) ||
      (c.applyFor || '').toLowerCase().includes(lower)
    );
    this.detailData = filtered.slice(0, this.detailPageSize);
    this.detailTotalCount = filtered.length;
    this.detailPageNo = 1;
  }

  openConfirmation(title: string, msg: string, id: any, option?: string, event?: any) {
    this.confirmationService.confirm({
      target: event?.target as EventTarget,
      message: msg,
      header: title,
      closable: true,
      closeOnEscape: true,
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: { label: 'No', severity: 'secondary', outlined: true },
      acceptButtonProps: { label: 'Yes' },
      accept: () => {
        if (option === '1') {
          this.submitcall();
        }
        else if (option === '2') {
        }
        else if (option === '4') {
        }
        else if (option === '5') {
          this.evaluationForm.reset()
        }
      },
      reject: () => {
        if (option === '4') {
        }
      }
    });
  }

  openCandidateDetail(item: any) {
    this.visible = true;
    this.selectedDetails = item.details || [];
    this.detailData = this.selectedDetails.slice(0, this.detailPageSize);
    this.detailTotalCount = this.selectedDetails.length;
    this.detailPageNo = 1;
    this.detailSearchText = '';
    document.body.style.overflow = 'hidden';
    this.selectedParentId = item.id;
  }

  onDrawerHide() {
    document.body.style.overflow = 'visible';
    this.visible = false;
    this.selectedDetails = [];
    this.selectedParentId = null;
  }

  openEvaluationModal(resumeId: any) {
    this.evaluateDailog = true;
    this.candidateId = resumeId;
    this.getDrpData();
  }

  getDrpData() {
    const roleId = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;

    this.userService.getQuestionPaper(
      `uspGetInterviewQuestions|resumeId=${this.candidateId}|appUserRole=${roleId}|appUserId=${sessionStorage.getItem('userId')}`
    ).subscribe(
      (res: any) => {
        if (res) {

          // --- Parse questions ---
          const questions = res.table1.map((q: any) => {
            let answerDetail = [];
            let currAnswer = '';
            try { answerDetail = JSON.parse(q.answerDetail); } catch (e) { console.warn('Cannot parse answerDetail', q.questionId); }

            if (q.currAnswer) {
              try {
                const curr = typeof q.currAnswer === 'string' ? JSON.parse(q.currAnswer) : q.currAnswer;
                if (Array.isArray(curr) && curr.length > 0) {
                  if (q.control === 'Radio') currAnswer = curr[0].answerText || '';
                  else if (q.control === 'TextArea') currAnswer = curr[0].c?.otherQuestionText || '';
                }
              } catch (e) { console.warn('Cannot parse currAnswer', q.questionId); }
            }

            return { ...q, answerDetail, currAnswer };
          });

          this.hodQuestions = questions.filter((q: any) => q.questionFor === 'HOD');
          this.hrQuestions = questions.filter((q: any) => q.questionFor === 'HR');

          if (res.table2 && res.table2.length > 0) {
            const status = res.table2[0];

            this.hodStatus = status.hodStatus !== null ? status.hodStatus.toString() : '';
            this.hrStatus = status.hrStatus !== null ? status.hrStatus.toString() : '';

            // Normalize boolean to '1'/'0'
            if (this.hodStatus === 'true') this.hodStatus = '1';
            if (this.hodStatus === 'false') this.hodStatus = '0';
            if (this.hrStatus === 'true') this.hrStatus = '1';
            if (this.hrStatus === 'false') this.hrStatus = '0';

            // Disable evaluation if HR has already decided
            this.evaluationDisabled = status.hrStatus === true || status.hrStatus === false;

            // HOD Recommendation
            if (this.hodStatus === '1') this.technicalRecommendation = 'Recommended';
            else if (this.hodStatus === '0') this.technicalRecommendation = 'Not Recommended';
            else this.technicalRecommendation = '';

            // HR Final Decision
            if (this.hrStatus === '1') this.hrDecision = 'Selected';
            else if (this.hrStatus === '0') this.hrDecision = 'Rejected';
            else this.hrDecision = '';
          }
          else {
            this.evaluationDisabled = false;
            this.technicalRecommendation = '';
            this.hrDecision = '';
            this.hodStatus = '';
            this.hrStatus = '';
          }
        }
      },
      (err: HttpErrorResponse) => {
        if (err.status === 403) {
          this.Customvalidation.loginroute(err.status);
        }
      }
    );
  }

  onSubmit(event: any) {
    let invalid = false;

    // --- Validate HOD answers ---
    if (this.userRole === 'HOD') {
      for (const q of this.hodQuestions) {
        if (!q.currAnswer || q.currAnswer.toString().trim() === '') {
          invalid = true;
          break;
        }
      }
      if (!this.technicalRecommendation || this.technicalRecommendation.trim() === '') {
        invalid = true;
      }
    }

    // --- Validate HR answers ---
    if (this.userRole === 'HR Admin') {
      for (const q of this.hrQuestions) {
        if (!q.currAnswer || q.currAnswer.toString().trim() === '') {
          invalid = true;
          break;
        }
      }
      if (!this.hrDecision || this.hrDecision.trim() === '') {
        invalid = true;
      }
    }

    if (invalid) {
      this.message.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please answer all questions before submitting.',
        life: 3000
      });
      return;
    }

    // --- Prepare answers payload ---
    const answers: any[] = [];

    const processQuestions = (questions: any[]) => {
      questions.forEach(q => {
        if (q.control === 'Radio') {
          const selected = q.answerDetail.find((a: any) => a.answer === q.currAnswer);
          answers.push({
            questionId: q.questionId,
            answerId: selected ? selected.answerId : '',
            answerText: q.currAnswer || '',
            otherQuestionText: ''
          });
        } else if (q.control === 'TextArea') {
          let answerId = '';
          try {
            const details: any[] = typeof q.answerDetail === 'string' ? JSON.parse(q.answerDetail) : q.answerDetail;
            if (Array.isArray(details) && details.length > 0) {
              answerId = details[0].answerId;
            }
          } catch (e) {
            console.warn('Cannot parse answerDetail for question', q.questionId);
          }
          answers.push({
            questionId: q.questionId,
            answerId: answerId,
            answerText: '',
            otherQuestionText: q.currAnswer || ''
          });
        }
      });
    };

    if (this.userRole === 'HOD') processQuestions(this.hodQuestions);
    if (this.userRole === 'HR Admin') processQuestions(this.hrQuestions);

    // --- Preserve and normalize previous statuses ---
    let hodStatusStr = this.hodStatus?.toString() ?? '';
    let hrStatusStr = this.hrStatus?.toString() ?? '';

    // Convert old boolean values to string form
    if (hodStatusStr === 'true') hodStatusStr = '1';
    if (hodStatusStr === 'false') hodStatusStr = '0';
    if (hrStatusStr === 'true') hrStatusStr = '1';
    if (hrStatusStr === 'false') hrStatusStr = '0';

    // --- Update only the current role's status ---
    if (this.userRole === 'HOD') {
      hodStatusStr =
        this.technicalRecommendation === 'Recommended'
          ? '1'
          : this.technicalRecommendation === 'Not Recommended'
            ? '0'
            : hodStatusStr;
    }

    if (this.userRole === 'HR Admin') {
      hrStatusStr =
        this.hrDecision === 'Selected'
          ? '1'
          : this.hrDecision === 'Rejected'
            ? '0'
            : hrStatusStr;
    }

    // --- Save normalized statuses back ---
    this.hodStatus = hodStatusStr;
    this.hrStatus = hrStatusStr;

    // --- Build query string ---
    const roleId = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
    let paramQuery = '';
    paramQuery = `resumeId=${this.candidateId}|answerJson=${JSON.stringify(answers)}|hrStatus=${hrStatusStr}|hodStatus=${hodStatusStr}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${roleId}`;
    this.paramvaluedata = paramQuery;
    this.openConfirmation('Confirm?', 'Are you sure you want to proceed?', '1', '1', event);
  }

  submitcall() {
    try {
      this.isFormLoading = true;
      let query = '';
      let SP = '';

      query = `${this.paramvaluedata}`;
      SP = `uspPostInterviewAssesmentForm`;

      this.userService.SubmitPostTypeData(SP, query, this.FormName).subscribe({
        next: (datacom: any) => {
          this.isFormLoading = false;
          try {
            if (!datacom) return;
            const resultarray = datacom.split('-');
            if (resultarray[1] === 'success') {
              this.getTableData(false);
              this.message.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Data Saved Successfully.',
                life: 3000
              });

              if (this.userRole === 'HR Admin') {
                this.evaluationDisabled = true;
              }

              this.evaluateDailog = false;
              this.onDrawerHide();
            } else {
              this.message.add({
                severity: 'warn',
                summary: 'Warning',
                detail: resultarray[1] || datacom,
                life: 3000
              });
            }
          } catch (innerErr) {
            console.error('Error processing response:', innerErr);
            this.message.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Something went wrong while processing response.',
              life: 3000
            });
          }
        },
        error: (err) => {
          this.isFormLoading = false;
          console.error('API call failed:', err);

          if (err.status === 401 || err.status === 403) {
            console.warn('Unauthorized or Forbidden - redirecting to login...');
            this.message.add({
              severity: 'error',
              summary: 'Session Expired',
              detail: 'Your session has expired. Please log in again.',
              life: 3000
            });
            this.Customvalidation.loginroute(err.status);
          } else {
            this.message.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Something went wrong.',
              life: 3000
            });
          }
        }
      });
    } catch (error: any) {
      console.error('Unexpected error in submitcall():', error);
      this.isFormLoading = false;
      this.message.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Something went wrong',
        life: 3000
      });
    }
  }

  onClear() {
    this.evaluationForm.reset();
    this.hodQuestions.forEach(q => q.currAnswer = null);
    this.hrQuestions.forEach(q => q.currAnswer = null);
    this.technicalRecommendation = '';
    this.hrDecision = '';
  }

}

