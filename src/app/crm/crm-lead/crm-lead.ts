import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, NgClass, NgIf, NgFor, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import moment from 'moment';

import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { DrawerModule } from 'primeng/drawer';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TableColumn, TableTemplate } from '../../table-template/table-template';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { PopoverModule } from 'primeng/popover';

import { UserService } from '../../shared/user-service';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-crm-lead',
  standalone: true,
  imports: [
    CommonModule,
    BreadcrumbModule,
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    DrawerModule,
    ProgressSpinnerModule,
    SelectModule,
    NgIf,
    NgFor,
    NgClass,
    TableModule,
    TableTemplate,
    ToastModule,
    ConfirmDialogModule,
    PopoverModule,
    DatePipe,
  ],
  providers: [MessageService, ConfirmationService, DatePipe],
  templateUrl: './crm-lead.html',
  styleUrls: ['./crm-lead.scss'],
})
export class CrmLead implements OnInit {
  visible = false;
  header: string = 'Add Lead';
  headerIcon: string = 'pi pi-plus';
  isFormLoading = false;
  postType: string = 'add';
  isLoading = false;

  crmLeadForm!: FormGroup;
  selectedItem: any = null;

  viewData: any[] = [];
  totalCount: number = 0;

  pageNo: number = 1;
  pageSize: number = 10;
  searchText: string = '';

  leadOwnerDrp: any[] = [];
  leadSourceDrp: any[] = [];
  leadStatusDrp: any[] = [];
  industryDrp: any[] = [];

  leadStatusArray: any[] = [];
  followUpArray: any[] = [];
  breadcrumbItems = [
    { label: 'Home', routerLink: '/home' },
    { label: 'CRM Lead', routerLink: '/crm-lead' },
  ];
  tomorrow = new Date();
  nextFollowUpDateValidate = new Date();

  param: string | null = null;
  FormName: string = 'header';
  FormValue: any;
  menulabel: any;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private datePipe: DatePipe,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    this.tomorrow.setDate(this.tomorrow.getDate());
  }

  ngOnInit() {
    this.loadSessionParams();
    this.createForm();
    this.getLSDrop();
    this.getLOwnerDrp();
    this.uniqueIdloaddrp();
    this.getViewData(true);
  }

  loadSessionParams() {
    this.param = sessionStorage.getItem('menuItem');
    if (this.param) {
      const paramjs = JSON.parse(this.param);
      this.FormName = paramjs.formName || 'header';
      this.FormValue = paramjs.formValue;
      this.menulabel = paramjs.menu;
    }
  }

  createForm() {
    this.crmLeadForm = this.fb.group({
      leadSeries: [''],
      leadSource: ['', Validators.required],
      leadOwner: ['', Validators.required],
      company: [''],
      companySize: [''],
      website: [''],
      annualRevenue: [''],
      industry: [''],
      address: ['', Validators.required],
      contactPerson: ['', Validators.required],
      phone: [''],
      email: ['', Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')],
      notes: [''],
      product: [''],
      leadStatus: ['', Validators.required],
      nextFollowUpDate: [''],
      followUpDescription: [''],
    });
  }

  private getSafeNumericValue(value: any): string {
    if (!value && value !== 0) return '0';
    const num = Number(value);
    return isNaN(num) ? '0' : String(value);
  }

  getLSDrop() {
    this.userService
      .getQuestionPaper(`uspGetOpportunityDetails|action=CUSTOMER|customerId=0`)
      .subscribe(
        (res: any) => {
          this.leadStatusDrp = res['table6'] || [];
          this.leadSourceDrp = res['table2'] || [];
          this.industryDrp = res['table5'] || [];
        },
        (err) => this.handleError(err, 'Dropdowns failed to load')
      );
  }

  getLOwnerDrp() {
    // Get logged-in user's ID from sessionStorage
    const empId = sessionStorage.getItem('empId') || '0';

    this.userService
      .getQuestionPaper(`uspGetFillDrpDown|table=CrmEmployeeDrp|filterValue=${empId}|filterColumn=`)
      .subscribe(
        (res: any) => {
          this.leadOwnerDrp = res['table'] || [];
        },
        (err) => this.handleError(err, 'Lead Owner failed to load')
      );
  }

  uniqueIdloaddrp() {
    this.userService.getUniqueId('header').subscribe(
      (res: any) => {
        this.crmLeadForm.patchValue({ leadSeries: res });
        this.crmLeadForm.get('leadSeries')?.disable();
      },
      (err: HttpErrorResponse) => this.handleError(err, 'Failed to load Unique ID')
    );
  }

  getViewData(showSpinner: boolean) {
    this.isLoading = true;

    const roleId = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId || '0';
    const userId = sessionStorage.getItem('userId') || '0';
    const districtId = sessionStorage.getItem('District') || '0';

    const query = `uspGetAllLeads|appUserId=${userId}|appUserRole=${roleId}|districtId=${districtId}|searchText=${
      this.searchText || ''
    }|pageIndex=${this.pageNo}|size=${this.pageSize}`;

    this.userService
      .getQuestionPaper(query)
      .subscribe(
        (res: any) => {
          this.viewData = res['table1'] || [];
          this.totalCount = res['table']?.[0]?.totalCnt || 0;
        },
        (err: HttpErrorResponse) => {
          this.handleError(err, 'Failed to fetch lead data');
          this.viewData = [];
          this.totalCount = 0;
        }
      )
      .add(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      });
  }

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

  showDialog(view: string, data: any = null) {
    this.visible = true;
    this.crmLeadForm.reset();
    this.crmLeadForm.enable();

    this.leadStatusArray = [];
    this.followUpArray = [];

    this.postType = view;
    this.selectedItem = data;

    if (view === 'add') {
      this.header = 'Add Lead';
      this.headerIcon = 'pi pi-plus';
      this.uniqueIdloaddrp();
    } else {
      this.header = view === 'update' ? 'Update Record' : 'View Detail';
      this.headerIcon = view === 'update' ? 'pi pi-pencil' : 'pi pi-eye';
      this.loadLeadForEdit(data, view);
    }

    this.crmLeadForm.get('leadSeries')?.disable();
  }

  transformDate(event: any, formName: string, controlName: string) {
    const dateValue = event.target.value;
    this.crmLeadForm.get(controlName)?.setValue(dateValue);
  }

  loadLeadForEdit(data: any, type: string) {
    this.crmLeadForm.patchValue({
      leadSeries: data.leadSeries || '',
      leadSource: data.leadSourceId || '',
      leadOwner: data.assignedToId || '',
      leadStatus: data.leadStageId || '',
      company: data.company || '',
      companySize: data.companySize || '',
      annualRevenue: data.companyRevenue || '',
      industry: data.industryTypeId || '',
      address: data.companyAddress || '',
      contactPerson: data.contactPerson || '',
      phone: data.phone || '',
      email: data.email || '',
      notes: data.notes || '',
      website: data.website || '',
      product: data.productOfInterest || '',
      nextFollowUpDate: null,
      followUpDescription: null,
    });

    this.selectedItem = data;

    try {
      if (typeof data.leadStageHistory === 'string') {
        this.leadStatusArray = JSON.parse(data.leadStageHistory);
        this.leadStatusArray.reverse();
      } else if (Array.isArray(data.leadStageHistory)) {
        this.leadStatusArray = data.leadStageHistory;
        this.leadStatusArray.reverse();
      } else {
        this.leadStatusArray = [];
      }

      let followUps = [];

      if (typeof data.leadFollowup === 'string') {
        followUps = JSON.parse(data.leadFollowup || '[]');
      } else if (Array.isArray(data.leadFollowup)) {
        followUps = data.leadFollowup;
      }

      this.followUpArray = followUps;
      this.followUpArray.reverse();

      this.cdr.detectChanges();

      if (this.followUpArray.length > 0) {
        const lastDate = this.followUpArray[0].followupDate;
        this.nextFollowUpDateValidate = moment(lastDate).add(1, 'days').toDate();
      } else {
        this.nextFollowUpDateValidate = this.tomorrow;
      }
    } catch {
      this.leadStatusArray = [];
      this.followUpArray = [];
    }

    if (type === 'view') {
      this.crmLeadForm.disable();
    }
  }

  AddRow(formName: string) {
    const f = this.crmLeadForm.getRawValue();
    const newDate = f.nextFollowUpDate;
    const newDesc = f.followUpDescription;

    if (!newDate || !newDesc) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Missing Details',
        detail: 'Please select a Follow-up Date and Description.',
      });
      return;
    }

    const followUpDateFormatted = this.datePipe.transform(newDate, 'yyyy-MM-dd') || newDate;

    this.followUpArray = [
      {
        followupDate: followUpDateFormatted,
        description: newDesc,
        followupId: 0,
      },
      ...this.followUpArray,
    ];

    this.crmLeadForm.patchValue({
      nextFollowUpDate: null,
      followUpDescription: null,
    });

    this.nextFollowUpDateValidate = moment(newDate).add(1, 'days').toDate();

    this.messageService.add({
      severity: 'info',
      summary: 'Added',
      detail: 'Follow-up added to list.',
    });
  }

  deleteChildTableRow(arrayName: string, index: number) {
    if (arrayName === 'followUpArray') {
      this.followUpArray.splice(index, 1);
      this.messageService.add({
        severity: 'info',
        summary: 'Deleted',
        detail: 'Follow-up removed locally.',
      });
    }
  }

  onDrawerHide() {
    this.visible = false;
    this.crmLeadForm.reset();
    this.getViewData(false);
  }

  isInvalid(controlName: string): boolean {
    const control = this.crmLeadForm.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  private scrollToFirstInvalidControl(): void {
    setTimeout(() => {
      const drawer = document.querySelector('.p-drawer-content') as HTMLElement;
      if (!drawer) return;

      const invalid = drawer.querySelector(
        'input.ng-invalid, textarea.ng-invalid, .p-invalid'
      ) as HTMLElement | null;

      if (!invalid) return;

      const target =
        (invalid.querySelector('input, textarea') as HTMLElement) || (invalid as HTMLElement);

      const drawerRect = drawer.getBoundingClientRect();
      const fieldRect = target.getBoundingClientRect();
      const scrollY = fieldRect.top - drawerRect.top - 140;

      drawer.scrollTo({ top: drawer.scrollTop + scrollY, behavior: 'smooth' });

      target.focus({ preventScroll: true });
      target.classList.add('p-invalid');
      setTimeout(() => target.classList.remove('p-invalid'), 2000);
    }, 100);
  }

  onSubmit(event: any) {
    if (this.crmLeadForm.valid) {
      this.confirmationService.confirm({
        target: event.target,
        message: 'Are you sure you want to proceed?',
        header: 'Confirm Submission',
        icon: 'pi pi-exclamation-triangle',
        accept: () => this.submitcall(),
      });
    } else {
      this.crmLeadForm.markAllAsTouched();
      this.scrollToFirstInvalidControl();
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill all required fields.',
      });
    }
  }

  submitcall() {
    this.isFormLoading = true;

    const f = this.crmLeadForm.getRawValue();
    const userId = sessionStorage.getItem('userId') || '0';
    const roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId || '0';

    const leadSeriesNo = f.leadSeries || this.selectedItem?.leadSeries || '';
    let leadId = this.selectedItem?.leadId || '0';

    let followUpJsonToSubmit: any[] = this.followUpArray;

    if (this.postType === 'add') {
      const addFollowUpDate = f.nextFollowUpDate
        ? this.datePipe.transform(f.nextFollowUpDate, 'yyyy-MM-dd')
        : '';

      if (addFollowUpDate || f.followUpDescription) {
        followUpJsonToSubmit = [
          {
            followupId: 0,
            followupDate: addFollowUpDate,
            description: f.followUpDescription || '',
          },
        ];
      } else {
        followUpJsonToSubmit = [];
      }
    }

    const companySize = this.getSafeNumericValue(f.companySize);
    const annualRevenue = this.getSafeNumericValue(f.annualRevenue);

    const lastFollowUp = followUpJsonToSubmit[0] || {};
    const singleFollowUpDate = lastFollowUp.followupDate || '';
    const singleFollowUpDesc = lastFollowUp.description || '';

    let corePayload =
      `leadSeriesNo=${leadSeriesNo}` +
      `|followUpDescription=${singleFollowUpDesc}` +
      `|followUpJson=${JSON.stringify(followUpJsonToSubmit)}` +
      `|nextFollowUpDate=${singleFollowUpDate}` +
      `|leadSourceId=${f.leadSource || '0'}` +
      `|leadStageId=${f.leadStatus || '0'}` +
      `|assignedToId=${f.leadOwner || '0'}` +
      `|company=${f.company || ''}` +
      `|companySize=${companySize}` +
      `|website=${f.website || ''}` +
      `|companyRevenue=${annualRevenue}` +
      `|industryType=${f.industry || '0'}` +
      `|companyAddress=${f.address || ''}` +
      `|contactPerson=${f.contactPerson || ''}` +
      `|phone=${f.phone || ''}` +
      `|email=${f.email || ''}` +
      `|productOfInterest=${f.product || ''}` +
      `|notes=${f.notes || ''}` +
      `|appUserId=${userId}` +
      `|appUserRole=${roleID}`;

    let finalPayload: string;
    let SP: string;

    if (this.postType === 'update') {
      finalPayload = `action=UPDATE|leadId=${leadId}|${corePayload}`;
      SP = `uspUpdateLeadDetails`;
    } else {
      finalPayload = corePayload;
      SP = `uspPostLeadDetails`;
    }

    this.userService
      .SubmitPostTypeData(SP, finalPayload, 'header')
      .subscribe(
        (datacom: any) => {
          this.isFormLoading = false;
          if (datacom?.includes('-success')) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail:
                this.postType === 'update'
                  ? 'Data Updated Successfully.'
                  : 'Data Saved Successfully.',
            });
            this.onDrawerHide();
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: datacom || 'Something went wrong.',
            });
          }
        },
        (err: HttpErrorResponse) => {
          this.isFormLoading = false;
          this.handleError(err, 'API submission failed');
        }
      )
      .add(() => (this.isFormLoading = false));
  }

  deleteItem(data: any, event: any) {
    this.selectedItem = data;

    this.confirmationService.confirm({
      target: event.target,
      message: 'Are you sure you want to delete this lead?',
      header: 'Confirm Deletion',
      icon: 'pi pi-trash',
      accept: () => this.deleteData(),
    });
  }

  deleteData() {
    let roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
    let query = `action=DELETE|leadId=${
      this.selectedItem.leadId
    }|leadSeriesNo=|leadSourceId=0|leadStageId=0|assignedToId=0|company=|companySize=0|companyRevenue=0|industryType=0|companyAddress=|contactPerson=|phone=|email=|productOfInterest=|notes=|appUserId=${sessionStorage.getItem(
      'userId'
    )}|website=|appUserRole=${roleID}|followUpJson=[]|followUpDescription=|nextFollowUpDate=`;
    this.userService
      .SubmitPostTypeData(`uspUpdateLeadDetails`, query, this.FormName)
      .subscribe(
        (datacom: any) => {
          if (datacom?.includes('-success')) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Lead deleted successfully!',
            });
            this.getViewData(false);
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: datacom || 'Something went wrong.',
            });
          }
        },
        (err: HttpErrorResponse) => this.handleError(err, 'Deletion failed.')
      )
      .add(() => (this.isLoading = false));
  }

  private handleError(err: HttpErrorResponse, summary: string) {
    console.error(err);

    if (err.status === 403) {
      sessionStorage.setItem('userToken', 'null');
      this.router.navigate(['/login']);
      this.messageService.add({
        severity: 'error',
        summary: 'Session Expired',
        detail: 'Please log in again.',
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: summary,
        detail: err.message || 'Server error.',
      });
    }
  }

  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true },
    { key: 'leadSeries', header: 'Lead Series', isVisible: true, isSortable: false },
    { key: 'leadSource', header: 'Lead Source', isVisible: true, isSortable: false },
    { key: 'assignedTo', header: 'assigned To', isVisible: true, isSortable: false },
    { key: 'leadStage', header: 'Lead Stage', isVisible: true, isSortable: false },
    { key: 'company', header: 'Company', isVisible: true, isSortable: false },
    { key: 'companySize', header: 'Company Size', isVisible: true, isSortable: false },
    { key: 'companyRevenue', header: 'Annual Revenue', isVisible: true, isSortable: false },
    { key: 'industryType', header: 'Industry', isVisible: true, isSortable: false },
    { key: 'contactPerson', header: 'Contact Person', isVisible: true, isSortable: false },
    { key: 'leadStageTxt', header: 'Lead Status', isVisible: true, isSortable: false },
    { key: 'website', header: 'Website', isVisible: true, isSortable: false },
    { key: 'phone', header: 'Phone', isVisible: true, isSortable: false },
    { key: 'email', header: 'Email', isVisible: true, isSortable: false },
    { key: 'createdBy', header: 'Created By', isVisible: true, isSortable: false },
    { key: 'createdDate', header: 'Created Date', isVisible: true, isSortable: false },
    { key: 'modifiedBy', header: 'Modified By', isVisible: true, isSortable: false },
    { key: 'modifiedDate', header: 'Modified Date', isVisible: true, isSortable: false },
  ];
}
