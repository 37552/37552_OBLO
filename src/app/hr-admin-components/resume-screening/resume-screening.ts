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
import { BreadcrumbModule } from 'primeng/breadcrumb';

@Component({
  selector: 'app-resume-screening',
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
    BreadcrumbModule
  ],
  providers: [
    ConfirmationService,
    MessageService
  ],
  templateUrl: './resume-screening.html',
  styleUrl: './resume-screening.scss'
})
export class ResumeScreening {
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
  groupListArray = []
  totalCount = 0;
  itemDailog: boolean = false;
  selectedRowDetails: any[] = [];
  searchValue: string = '';

  activeTabValue: number = 0;
  tabs: Tab[] = [
    { label: 'Pending Request', count: 0, value: 0 },
    { label: 'Processed Request', count: 0, value: 1 }
  ];

  columns: TableColumn[] = [
    { key: 'jsonDetails', header: 'Action', isVisible: true, isSortable: false, isCustom: true }, 
    { key: 'indentNo', header: 'Indent No', isVisible: true, isSortable: false },
    { key: 'division', header: 'Division', isVisible: true, isSortable: false },
    { key: 'department', header: 'Department', isVisible: true, isSortable: false },
    { key: 'jobProfile', header: 'Job Profile', isVisible: true, isSortable: false },
    { key: 'location', header: 'Location', isVisible: true, isSortable: false },
    { key: 'reporting', header: 'Reporting', isVisible: true, isSortable: false },
    { key: 'totalScreened', header: 'Total Screened', isVisible: true, isSortable: false },
    { key: 'totalRejeced', header: 'Total Rejected', isVisible: true, isSortable: false },
    { key: 'totalViewed', header: 'Total Viewed', isVisible: true, isSortable: false },
  ];


  constructor(private fb: FormBuilder,
      private userService: UserService,
      private confirmationService: ConfirmationService,
      private message: MessageService,
      public Customvalidation: Customvalidation,
      private cdr: ChangeDetectorRef)  {

  }


  ngOnInit(): void {
    this.param = sessionStorage.getItem('menuItem') ?? '';
    let paramjs = JSON.parse(this.param);
    this.menulabel = paramjs.menu;
    this.FormName = paramjs.formName;
    this.FormValue = paramjs.formValue;
    this.getTableData(true)
    this.breadcrumbItems = [
      { label: this.menulabel },
      { label: this.FormName, disabled: true }
    ];
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  getTableData(isTrue: boolean) {
    try {
      if (isTrue) this.isLoading = true;
      else this.pageNo = 1;
      const userId = sessionStorage.getItem('userId') || '';
      const roleId = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
      const query = `searchText=${this.searchText}|pageIndex=${this.pageNo}|size=${this.pageSize}|districtId=${sessionStorage.getItem('District')}|appUserId=${userId}|appUserRole=${roleId}`;

      const spName = this.activeTabValue === 0
        ? 'uspGetResumeForScreening'
        : 'uspGetResumeForScreeningProcessed';

      this.userService.getQuestionPaper(`${spName}|${query}`).subscribe({
        next: (res: any) => {
          try {
            this.data = res?.table1 || [];
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
        error: (err) => {
          console.error('API call failed:', err);
          this.isLoading = false;
          if (err.status === 403) this.Customvalidation.loginroute(err.status);
          else { this.data = []; this.totalCount = 0; }
        }
      });
    } catch (error) {
      console.error('Unexpected error in getTableData():', error);
      this.isLoading = false;
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

  onSortChange(event: { column: string, direction: 'asc' | 'desc' }) {
    this.sortColumn = event.column;
    this.sortDirection = event.direction;
    this.getTableData(true);
  }

  openDetailModal(rowData: any) {
    this.itemDailog = true;
    if (typeof rowData.details === 'string') {
      try {
        rowData.details = JSON.parse(rowData.details);
      } catch {
        rowData.details = [];
      }
    } else if (!Array.isArray(rowData.details)) {
      rowData.details = [];
    }

    this.selectedRowDetails = rowData.details;
  }

  getCandidates(row: any): any[] {
    if (!row || !row.details) return [];
    try {
      const detailsArray = JSON.parse(row.details);
      return detailsArray.map((c:any) => ({
        ...c,
        DownloadStatus: c.DownloadStatus || false 
      }));
    } catch (err) {
      console.error('Failed to parse details:', err);
      return [];
    }
  }

  onScreen(id: any) {
    try {
      this.isFormLoading = true;
      const roleId = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
      const query = `action=SCREEN|resumeId=${id}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${roleId}`;
      const SP = `uspPostResumeStatus`;

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
              this.itemDailog = false;
            } else {
              this.message.add({
                severity: 'warn',
                summary: 'Warning',
                detail: resultarray[1] || datacom,
                life: 3000
              });
            }
          } catch (innerErr) {
            console.error('Error processing response in onScreen:', innerErr);
            this.message.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Something went wrong while processing response.',
              life: 3000
            });
          }
        },
        error: (err:HttpErrorResponse) => {
          this.isFormLoading = false;
          console.error('API call failed in onScreen:', err);

          if (err.status === 401 || err.status === 403) {
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
      console.error('Unexpected error in onScreen:', error);
      this.isFormLoading = false;
      this.message.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Something went wrong',
        life: 3000
      });
    }
  }

  onReject(id: any) {
    try {
      this.isFormLoading = true;
      const roleId = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
      const query = `action=REJECT|resumeId=${id}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${roleId}`;
      const SP = `uspPostResumeStatus`;

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
              this.itemDailog = false;
            } else {
              this.message.add({
                severity: 'warn',
                summary: 'Warning',
                detail: resultarray[1] || datacom,
                life: 3000
              });
            }
          } catch (innerErr) {
            console.error('Error processing response in onReject:', innerErr);
            this.message.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Something went wrong while processing response.',
              life: 3000
            });
          }
        },
        error: (err:HttpErrorResponse) => {
          this.isFormLoading = false;
          console.error('API call failed in onReject:', err);

          if (err.status === 401 || err.status === 403) {
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
      console.error('Unexpected error in onReject:', error);
      this.isFormLoading = false;
      this.message.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Something went wrong',
        life: 3000
      });
    }
  }

  onView(id: any, data: any) {
    try {
      this.isFormLoading = true;
      const roleId = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
      const query = `action=DOWNLOAD|resumeId=${id}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${roleId}`;
      const SP = `uspPostResumeStatus`;

      this.userService.SubmitPostTypeData(SP, query, this.FormName).subscribe({
        next: (datacom: any) => {
          this.isFormLoading = false;
          try {
            if (!datacom) return;

            const resultarray = datacom.split('-');

            if (resultarray[1] === 'success') {


              if (data) {
                const candidate = data;
                if (candidate && candidate.resumeUpload) {
                  window.open(candidate.resumeUpload, '_blank'); 
                  candidate.DownloadStatus = true; 
                } else {
                  this.message.add({
                    severity: 'warn',
                    summary: 'Warning',
                    detail: 'Resume not found.',
                    life: 3000
                  });
                }
              } else {
                this.message.add({
                  severity: 'warn',
                  summary: 'Warning',
                  detail: 'No details available.',
                  life: 3000
                });
              }

              this.getTableData(false);
              this.itemDailog = false;
            } else {
              this.message.add({
                severity: 'warn',
                summary: 'Warning',
                detail: resultarray[1] || datacom,
                life: 3000
              });
            }
          } catch (innerErr) {
            console.error('Error processing response in onView:', innerErr);
            this.message.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Something went wrong while processing response.',
              life: 3000
            });
          }
        },
        error: (err: HttpErrorResponse) => {
          this.isFormLoading = false;
          console.error('API call failed in onView:', err);

          if (err.status === 401 || err.status === 403) {
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
      console.error('Unexpected error in onView:', error);
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

