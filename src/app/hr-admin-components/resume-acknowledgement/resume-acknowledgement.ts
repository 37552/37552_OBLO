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
import { Customvalidation } from '../../shared/Validation';
import { TableModule } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-resume-acknowledgement',
  imports: [
    TableTemplate,
    CardModule,
    ButtonModule,
    Popover,
    DrawerModule,
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
    BreadcrumbModule
  ],
  providers: [
    ConfirmationService,
    MessageService,
    DatePipe
  ],
  templateUrl: './resume-acknowledgement.html',
  styleUrl: './resume-acknowledgement.scss'
})
export class ResumeAcknowledgement {
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
  shortlistForm: FormGroup;
  totalCount = 0;
  shortlistDailog: boolean = false;
  interviewerDrp: any[] = [];
  modeOfInterView: any[] = [];
  locationDrp: any[] = [];
  selectedDetails: any[] = [];
  selectedParentId: number | null = null;
  candidateId: any;
  indentNoId: any;

  // --- Detail table state (inside drawer) ---
  detailData: any[] = [];
  detailTotalCount = 0;
  detailPageNo = 1;
  detailPageSize = 5;
  detailSearchText = '';

  // --- Tabs ---
  activeTabValue: number = 0;

  tabs: Tab[] = [
    { label: 'Pending Request', count: 0, value: 0 },
    { label: 'Processed Request', count: 0, value: 1 }
  ];

  // --- Main table columns ---
  columns: TableColumn[] = [
    { key: 'jsonDetails', header: 'Candidate Details', isVisible: true, isSortable: false, isCustom: true },
    { key: 'indentNo', header: 'Indent No', isVisible: true, isSortable: false },
    { key: 'division', header: 'Division', isVisible: true, isSortable: false },
    { key: 'department', header: 'Department', isVisible: true, isSortable: false },
    { key: 'profile', header: 'Profile', isVisible: true, isSortable: false },
    { key: 'location', header: 'Location', isVisible: true, isSortable: false },
    { key: 'reporting', header: 'Reporting', isVisible: true, isSortable: false },
  ];

  // --- Detail (drawer) table columns ---
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
    { key: 'profileStatus', header: 'Status', isVisible: true, isSortable: false },
  ];

  constructor(private fb: FormBuilder,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private message: MessageService,
    public Customvalidation: Customvalidation,
    private cdr: ChangeDetectorRef,
    private datePipe: DatePipe) {

    this.shortlistForm = this.fb.group({
      modeIdControl: ['', [Validators.required]],
      locationIdControl: ['', [Validators.required]],
      dateControl: ['', [Validators.required]],
      timeControl: ['', [Validators.required]],
      interviewerIdControl: ['', [Validators.required]],
    });

  }

  get f() { return this.shortlistForm.controls }


  ngOnInit(): void {
    this.param = sessionStorage.getItem('menuItem') ?? '';
    let paramjs = JSON.parse(this.param);
    this.menulabel = paramjs.menu;
    this.FormName = paramjs.formName;
    this.FormValue = paramjs.formValue;
    this.getTableData(true);
    this.breadcrumbItems = [
      { label: this.menulabel },
      { label: this.FormName, disabled: true }
    ];
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }


  getHeaderTableDrp() {
    this.isLoading = true;
    try {
      this.userService.getQuestionPaper(`uspGetEmployeeAttributesMasters|appUserId=${sessionStorage.getItem('userId')}`).subscribe({
        next: (res: any) => {
          try {
            this.interviewerDrp = res['table4'];
          } catch (innerErr) {
            console.error('Error while processing response:', innerErr);
          }
        },
        error: (err) => {
          console.error('Error fetching data:', err);
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    } catch (err) {
      console.error('Unexpected error in getHeaderTableDrp:', err);
      this.isLoading = false;
    }

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }


  getDrpData(data: any) {
    try {
      let candidateId = data.id;
      this.userService
        .getQuestionPaper(`uspGetResourceResumeAcknowledgeDetails|action=CANDIDATEDATA|id=${candidateId}`)
        .subscribe({
          next: (res: any) => {
            try {
              this.modeOfInterView = res['table1'];
              this.locationDrp = res['table2'];
            } catch (innerErr) {
              console.error('Error processing response data in getDrpData:', innerErr);
            }
          },
          error: (err: HttpErrorResponse) => {
            console.error('HTTP error in getDrpData:', err);

          },
        });
    } catch (error) {
      console.error('Unexpected error in getDrpData:', error);
    }
  }

  getTableData(isTrue: boolean) {

    if (isTrue) this.isLoading = true;
    else this.pageNo = 1;

    const userId = sessionStorage.getItem('userId') || '';
    const roleId = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
    const districtId = sessionStorage.getItem('District') || '';

    const query = `searchText=${this.searchText}|pageIndex=${this.pageNo}|size=${this.pageSize}|appUserRole=${roleId}|appUserId=${userId}|districtId=${districtId}`;

    const pendingApi = this.userService.getQuestionPaper(`uspGetResumeForAcknowledgement|${query}`);
    const processedApi = this.userService.getQuestionPaper(`uspGetResumeForAcknowledgementProcessed|${query}`);

    forkJoin({
      pending: pendingApi,
      processed: processedApi
    }).subscribe((res: any) => {

      // 👇 Count update for both tabs
      this.tabs[0].count = res.pending?.table?.[0]?.totalCnt || 0;
      this.tabs[1].count = res.processed?.table?.[0]?.totalCnt || 0;

      // 👇 Active tab ka data set karo
      const activeRes = this.activeTabValue === 0 ? res.pending : res.processed;

      this.data = (activeRes?.table1 || []).map((item: any) => ({
        ...item,
        details: item.details ? JSON.parse(item.details) : []
      }));

      this.totalCount = activeRes?.table?.[0]?.totalCnt || this.data.length;

      this.isLoading = false;
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

  // --- Detail table (inside drawer) handlers ---
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

  isInvalid(controlName: string): boolean {
    const control = this.shortlistForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
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
          this.shortlistForm.reset()
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

  openShorlistedModal(data: any, id: any) {
    this.shortlistDailog = true;
    this.candidateId = data.id;
    this.indentNoId = id;
    this.getDrpData(data);
    this.getHeaderTableDrp();
  }

  handleDialogClose() {
    this.shortlistForm.reset();
  }

  onClear() {
    this.shortlistForm.reset();
  }

  acknowledge(c: any, id: any) {
    this.onAcknowledgeMent(c, id);
    c.acknowledged = true;
    c.profileStatus = 'ACKNOWLEDGE';
  }

  shortlist(c: any, id: any) {
    this.openShorlistedModal(c, id);
  }

  reject(c: any, id: any) {
    this.onRejected(c, id);
    c.shortlistRejected = true;
  }

  onSubmit(event: any) {
    if (!this.shortlistForm.valid) {
      this.shortlistForm.markAllAsTouched();
      return;
    }

    const shortlistData = this.shortlistForm.value;
    const interviewDate = this.datePipe.transform(shortlistData.dateControl, 'yyyy-MM-dd');
    const interviewTime = this.datePipe.transform(shortlistData.timeControl, 'h:mm a');

    let paramQuery = '';
    paramQuery =
      `indentNoId=${this.indentNoId}` +
      `|candidateId=${this.candidateId}` +
      `|interviewDate=${interviewDate}` +
      `|interviewTime=${interviewTime}` +
      `|interviewMode=${shortlistData.modeIdControl}` +
      `|interviewLocation=${shortlistData.locationIdControl}` +
      `|interviewerId=${shortlistData.interviewerIdControl}` +
      `|profileStatus=10001` +
      `|appUserId=${sessionStorage.getItem('userId')}`;

    this.paramvaluedata = paramQuery;
    this.openConfirmation('Confirm?', 'Are you sure you want to proceed?', '1', '1', event);
  }

  submitcall() {
    try {
      this.isFormLoading = true;
      let query = '';
      let SP = '';

      query = `${this.paramvaluedata}`;
      SP = `uspPostResourceResumeAcknowledgement`;

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
              this.shortlistDailog = false;
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

  onAcknowledgeMent(data: any, id: any) {
    try {
      this.isFormLoading = true;
      let query = '';
      let SP = '';
      let candidateId = data.id;
      let indentNoId = id;

      query = `indentNoId=${indentNoId}|candidateId=${candidateId}|interviewDate=|interviewTime=|interviewMode=0|interviewLocation=0|interviewerId=0|profileStatus=10000|appUserId=${sessionStorage.getItem("userId")}`
      SP = `uspPostResourceResumeAcknowledgement`;

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

  onRejected(data: any, id: any) {
    try {
      this.isFormLoading = true;
      let query = '';
      let SP = '';
      let candidateId = data.id;
      let indentNoId = id;

      query = `indentNoId=${indentNoId}|candidateId=${candidateId}|interviewDate=|interviewTime=|interviewMode=0|interviewLocation=0|interviewerId=0|profileStatus=10002|appUserId=${sessionStorage.getItem("userId")}`
      SP = `uspPostResourceResumeAcknowledgement`;

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

}
