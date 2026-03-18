import { Component, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Popover } from 'primeng/popover';
import { Tooltip } from 'primeng/tooltip';
import { DrawerModule } from 'primeng/drawer';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Toast } from 'primeng/toast';
import { ProgressSpinner } from 'primeng/progressspinner';
import { CardModule } from 'primeng/card';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableTemplate, TableColumn } from '../table-template/table-template';
import { UserService } from '../shared/user-service';
import { Customvalidation } from '../shared/Validation';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { MultiSelectModule } from 'primeng/multiselect';


@Component({
  selector: 'app-system-settings',
  standalone: true,
  imports: [
    TableTemplate, ButtonModule, DrawerModule, Popover, Tooltip, ConfirmDialog, Toast, ProgressSpinner,
    CardModule, FormsModule, ReactiveFormsModule, CommonModule, SelectModule, CheckboxModule, MultiSelectModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './system-settings.html',
  styleUrls: ['./system-settings.scss']
})

export class SystemSettings {
  isLoading = true;
  visible = false;
  postType = '';
  header = '';
  headerIcon = 'pi pi-plus';
  isFormLoading = false;
  data: any[] = [];
  expandedCard: string | null = null;
  systemSettingsForm: FormGroup;


  orgMasterId = '';
  countries = [];
  timeZones = [];
  languages = [];
  currencies = [];
  dateFormats = [];
  timeFormats = [];
  firstDaysOfWeek = [];
  roundingMethods = [];
  branches = [];

  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true },
    { key: 'branch', header: 'Branch', isVisible: true, isSortable: false },
    { key: 'country', header: 'Country', isVisible: true, isSortable: false },
    { key: 'currency', header: 'Currency', isVisible: true, isSortable: false },
    { key: 'dateFormatTxt', header: 'Date Format', isVisible: true, isSortable: false },
    { key: 'consecutiveLoginAttempts', header: 'Consecutive Login Attempts', isVisible: true, isSortable: false },
    { key: 'enablePasswordPolicy', header: 'Enable Password Policy', isVisible: true, isSortable: false },
    { key: 'floatPrecision', header: 'Float Precision', isVisible: true, isSortable: false },
    { key: 'language', header: 'Language', isVisible: true, isSortable: false },
    { key: 'loginAfterFail', header: 'Login After Fail', isVisible: true, isSortable: false },
    { key: 'logoutSessions', header: 'logout Sessions', isVisible: true, isSortable: false },
    { key: 'maxAutoEmailReport', header: 'Max Auto Email Report', isVisible: true, isSortable: false },
    { key: 'maxFileSize', header: 'Max File Size', isVisible: true, isSortable: false },
    { key: 'maxReportRows', header: 'Max Report Rows', isVisible: true, isSortable: false },
    { key: 'mobileNumberLogin', header: 'Mobile Number Login', isVisible: true, isSortable: false },
    { key: 'resetLinkGenerationLimit', header: 'Reset Link Generation Limit', isVisible: true, isSortable: false },
    { key: 'resetPassword', header: 'Reset Password', isVisible: true, isSortable: false },
    { key: 'resetPasswordLinkExpiry', header: 'Reset Password LinkExpiry', isVisible: true, isSortable: false },
    { key: 'roundingMethodTxt', header: 'Rounding Method', isVisible: true, isSortable: false },
    { key: 'sessionExpiry', header: 'Session Expiry', isVisible: true, isSortable: false },
    { key: 'timeFormatTxt', header: 'Time Format', isVisible: true, isSortable: false },
    { key: 'timeZoneTxt', header: 'Time Zone ', isVisible: true, isSortable: false },
    { key: 'twoFactorAuth', header: 'Two Factor Auth', isVisible: true, isSortable: false },
    { key: 'usernameLogin', header: 'User Name Login', isVisible: true, isSortable: false },
    { key: 'weekFirstDayTxt', header: 'Week First Day ', isVisible: true, isSortable: false },

  ];

  pageNo = 1;
  pageSize = 5;
  totalCount = 0;
  searchText = '';
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  selectedIndex: any = [];
  paramvaluedata = '';
  passwordSettingsForm: any;
  advanceForm: any;
  loginSettingsForm: any;
  fileSettingsForm: any;
  extensionsOptions: { drpOption: string; drpValue: string }[] = [];



  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private message: MessageService,
    private cdr: ChangeDetectorRef,
    private Customvalidation: Customvalidation
  ) {
    this.systemSettingsForm = this.fb.group({
      country: ['', Validators.required],
      branch: ['', Validators.required],
      timeZone: ['', Validators.required],
      language: ['', Validators.required],
      currency: ['', Validators.required],
      dateFormat: ['', Validators.required],
      timeFormat: ['', Validators.required],
      floatPrecision: ['', Validators.required],
      firstDayOfWeek: ['', Validators.required],
      roundingMethod: ['', Validators.required]
    });


    this.loginSettingsForm = this.fb.group({
      idleTimeout: [null, Validators.required],
      allowLoginMobile: [false],
      allowLoginUsername: [false],
      consecutiveLoginAttempts: [null, Validators.required],
      loginAfterFailSeconds: [null, Validators.required],
      twoFactorAuth: [false]
    });

    this.passwordSettingsForm = this.fb.group({
      logoutAllSessions: [false],
      enablePasswordPolicy: [false],
      forceResetDays: [null, Validators.required],
      resetLinkExpiry: [null, Validators.required],
      resetLinkLimit: [null, Validators.required]
    });
    this.advanceForm = this.fb.group({

      maxReportRows: [null, Validators.required],
      maxAutoEmailReport: [null, Validators.required],

    });

    this.fileSettingsForm = this.fb.group({
      maxFileSize: [null, [Validators.required, Validators.min(1)]],  // Add your validations
      allowableExtensions: [[], Validators.required]  // Multi-select requires an array
    });


  }



  toggleCard(card: string) {
    this.expandedCard = this.expandedCard === card ? null : card;
  }

  ngOnInit() {
    this.getTableData(true);
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);


    this.getDropdown()
  }


  getDropdown() {
    this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblCountryMaster`).subscribe({
      next: (res: any) => {
        this.countries = res['table'] || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading states:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to load states.' });
      }
    });
    this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblLanguageMaster`).subscribe({
      next: (res: any) => {
        this.languages = res['table'] || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading states:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to load states.' });
      }
    });

    this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblCurrencyMaster`).subscribe({
      next: (res: any) => {
        this.currencies = res['table'] || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading states:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to load states.' });
      }
    });
    this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblTimeZoneMaster`).subscribe({
      next: (res: any) => {
        this.timeZones = res['table'] || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading states:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to load states.' });
      }
    });
    this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblDateFormat`).subscribe({
      next: (res: any) => {
        this.dateFormats = res['table'] || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading states:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to load states.' });
      }
    });


    this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblTimeFormat`).subscribe({
      next: (res: any) => {
        this.timeFormats = res['table'] || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading states:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to load states.' });
      }
    });

    this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblRoundingMethodMaster`).subscribe({
      next: (res: any) => {
        this.roundingMethods = res['table'] || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading states:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to load states.' });
      }
    });

    this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblWorkingDaysMaster`).subscribe({
      next: (res: any) => {
        this.firstDaysOfWeek = res['table'] || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading states:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to load states.' });
      }
    });
    this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblAllowableExtensions`).subscribe({
      next: (res: any) => {
        this.extensionsOptions = res['table'] || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading states:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to load states.' });
      }
    });

    const userData = JSON.parse(sessionStorage.getItem('UserInfo') || '{}');
    this.orgMasterId = userData[0].orgMasterId

    this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblGSTDetail|filterColumn=orgId|filterValue=${this.orgMasterId}`).subscribe({
      next: (res: any) => {
        this.branches = res['table'] || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading states:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to load states.' });
      }
    });
    
  }

  getTableData(isTrue: boolean) {
    try {
      if (isTrue) this.isLoading = true;
      else this.pageNo = 1;
      const roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
      const districtId = sessionStorage.getItem('District') || '';
      const userId = sessionStorage.getItem('userId') || '';
      const query = `appUserRole=${roleID}|districtId=${districtId}|appUserId=${userId}|searchText=${this.searchText}|pageIndex=${this.pageNo}|size=${this.pageSize}`;

      this.userService.getQuestionPaper(`uspGetSystemSettings|${query}`).subscribe({
        next: (res: any) => {
          this.data = res?.table1 || [];
          this.totalCount = res?.table?.[0]?.totalCnt || this.data.length;
          setTimeout(() => {
            this.isLoading = false;
            this.cdr.detectChanges();
          }, 1000);
        },
        error: (err) => {
          this.isLoading = false;
          if (err.status === 403) this.Customvalidation.loginroute(err.status);
        }
      });
    } catch {
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

  onSortChange(event: { column: string; direction: 'asc' | 'desc' }) {
    this.sortColumn = event.column;
    this.sortDirection = event.direction;
    this.getTableData(true);
  }


  showDialog(mode: 'add' | 'view' | 'update', data?: any) {
    
    this.isFormLoading = true;
    this.visible = true;
    this.postType = mode;
    this.header = mode === 'add' ? 'Add System Setting' : mode === 'update' ? 'Update System Setting' : 'View System Setting';
    this.headerIcon = mode === 'add' ? 'pi pi-plus' : mode === 'update' ? 'pi pi-pencil' : 'pi pi-eye';

    if (mode !== 'add' && data) {

      // patch values properly, converting 0/1 from backend to boolean

      this.systemSettingsForm.patchValue({
        country: data.countryId || '',
        branch: data.branchId || '',
        timeZone: data.timeZone || '',
        language: data.languageId || '',
        currency: data.currencyId || '',
        dateFormat: data.dateFormat || '',
        timeFormat: data.timeFormat || '',
        floatPrecision: data.floatPrecision != null ? data.floatPrecision : 0,
        firstDayOfWeek: data.weekFirstDay || '',
        roundingMethod: data.roundingMethod || ''
      });
      this.loginSettingsForm.patchValue({
        idleTimeout: data.sessionExpiry != null ? data.sessionExpiry : 0, 
        allowLoginMobile: !!data.mobileNumberLogin,
        allowLoginUsername: !!data.usernameLogin,
        consecutiveLoginAttempts: data.consecutiveLoginAttempts != null ? data.consecutiveLoginAttempts : 0,
        loginAfterFailSeconds: data.loginAfterFail != null ? data.loginAfterFail : 0,
        twoFactorAuth: !!data.twoFactorAuth
      });
      this.passwordSettingsForm.patchValue({
        logoutAllSessions: !!data.logoutSessions,
        enablePasswordPolicy: !!data.enablePasswordPolicy,
        forceResetDays: data.resetPassword != null ? data.resetPassword : 0,
        resetLinkExpiry: data.resetPasswordLinkExpiry != null ? data.resetPasswordLinkExpiry : 0,
        resetLinkLimit: data.resetLinkGenerationLimit != null ? data.resetLinkGenerationLimit : 0
      });
      this.advanceForm.patchValue({
        maxReportRows: data.maxReportRows != null ? data.maxReportRows : 0,
        maxAutoEmailReport: data.maxAutoEmailReport != null ? data.maxAutoEmailReport : 0
      });

      const mappedExtensions = JSON.parse(data?.fileJson)
        .map((item: { fileExtensionId: string }) => {
          return this.extensionsOptions.find(opt => opt.drpValue == item.fileExtensionId);
        })
        .filter((opt: any): opt is { drpValue: number; drpOption: string } => !!opt);


      this.fileSettingsForm.patchValue({
        maxFileSize: data.maxFileSize != null ? data.maxFileSize : 0,
        allowableExtensions: mappedExtensions || []
      });

      this.selectedIndex = data

      if (mode === 'view') {
        this.systemSettingsForm.disable();
        this.loginSettingsForm.disable();
        this.passwordSettingsForm.disable();
        this.advanceForm.disable();
        this.fileSettingsForm.disable();
      }
      else {
        this.systemSettingsForm.enable();
        this.loginSettingsForm.enable();
        this.passwordSettingsForm.enable();
        this.advanceForm.enable();
        this.fileSettingsForm.enable();

      }
    } else {
      this.systemSettingsForm.enable();
      this.systemSettingsForm.reset();

      this.loginSettingsForm.enable();
      this.loginSettingsForm.reset();

      this.passwordSettingsForm.enable();
      this.passwordSettingsForm.reset();

      this.advanceForm.enable();
      this.advanceForm.reset();

      this.fileSettingsForm.enable();
      this.fileSettingsForm.reset();
    }

    setTimeout(() => {
      this.isFormLoading = false;
      this.cdr.detectChanges();
    }, 200);
  }


  onDrawerHide() {
    this.visible = false;
    this.systemSettingsForm.enable();
    this.onClear();
  }

  onClear() {
    this.systemSettingsForm.reset();
    this.loginSettingsForm.reset();
    this.passwordSettingsForm.reset();
    this.fileSettingsForm.reset();
    this.advanceForm.reset();
  }



  onSubmit(event: any) {
    
    if (!this.systemSettingsForm.valid) {
      this.systemSettingsForm.markAllAsTouched();
      return;
    }
    if (!this.loginSettingsForm.valid) {
      this.loginSettingsForm.markAllAsTouched();
      return;
    }
    if (!this.passwordSettingsForm.valid) {
      this.passwordSettingsForm.markAllAsTouched();
      return;
    }
    if (!this.fileSettingsForm.valid) {
      this.fileSettingsForm.markAllAsTouched();
      return;
    }
    if (!this.advanceForm.valid) {
      this.advanceForm.markAllAsTouched();
      return;
    }

    const country = this.systemSettingsForm.get('country')?.value || 0;
    const branch = this.systemSettingsForm.get('branch')?.value || 0;
    const timeZone = this.systemSettingsForm.get('timeZone')?.value || 0;
    const language = this.systemSettingsForm.get('language')?.value || 0;
    const currency = this.systemSettingsForm.get('currency')?.value || 0;
    const dateFormat = this.systemSettingsForm.get('dateFormat')?.value || 0;
    const timeFormat = this.systemSettingsForm.get('timeFormat')?.value || 0;
    const floatPrecision = this.systemSettingsForm.get('floatPrecision')?.value || 0;
    const firstDayOfWeek = this.systemSettingsForm.get('firstDayOfWeek')?.value || 0;
    const roundingMethod = this.systemSettingsForm.get('roundingMethod')?.value || 0;

    const idleTimeout = this.loginSettingsForm.get('idleTimeout')?.value || 0;
    const allowLoginMobile = this.loginSettingsForm.get('allowLoginMobile')?.value ? 1 : 0;
    const allowLoginUsername = this.loginSettingsForm.get('allowLoginUsername')?.value ? 1 : 0;
    const consecutiveLoginAttempts = this.loginSettingsForm.get('consecutiveLoginAttempts')?.value || 0;
    const loginAfterFailSeconds = this.loginSettingsForm.get('loginAfterFailSeconds')?.value || 0;
    const twoFactorAuth = this.loginSettingsForm.get('twoFactorAuth')?.value || 0;


    const logoutAllSessions = this.passwordSettingsForm.get('logoutAllSessions')?.value ? 1 : 0;
    const enablePasswordPolicy = this.passwordSettingsForm.get('enablePasswordPolicy')?.value || 0;
    const forceResetDays = this.passwordSettingsForm.get('forceResetDays')?.value || 0;
    const resetLinkExpiry = this.passwordSettingsForm.get('resetLinkExpiry')?.value || 0;
    const resetLinkLimit = this.passwordSettingsForm.get('resetLinkLimit')?.value || 0;

    const maxFileSize = this.fileSettingsForm.get('maxFileSize')?.value || 0;
    const allowableExtensions = this.fileSettingsForm.get('allowableExtensions')?.value || 0;

    let extensions = allowableExtensions.map((x: { drpOption: string; drpValue: string }) => x.drpValue).join(',')

    const maxReportRows = this.advanceForm.get('maxReportRows')?.value || 0;
    const maxAutoEmailReport = this.advanceForm.get('maxAutoEmailReport')?.value || 0;




    this.paramvaluedata = `countryId=${country}|branchId=${branch}|timeZone=${timeZone}|languageId=${language}|currencyId=${currency}` +
      `|dateFormat=${dateFormat}|timeFormat=${timeFormat}|floatPrecision=${floatPrecision}|weekFirstDay=${firstDayOfWeek}` +
      `|roundingMethod=${roundingMethod}|sessionExpiry=${idleTimeout}|mobileNumberLogin=${allowLoginMobile}|usernameLogin=${allowLoginUsername}|consecutiveLoginAttempts=${consecutiveLoginAttempts}` +
      `|loginAfterFail=${loginAfterFailSeconds}|twoFactorAuth=${twoFactorAuth}|logoutSessions=${logoutAllSessions}|enablePasswordPolicy=${enablePasswordPolicy}` +
      `|resetPassword=${forceResetDays}|resetPasswordLinkExpiry=${resetLinkExpiry}|resetLinkGenerationLimit=${resetLinkLimit}|maxFileSize=${maxFileSize}` +
      `|maxReportRows=${maxReportRows}|maxAutoEmailReport=${maxAutoEmailReport}|fileJson=${extensions}`;

    this.openConfirmation('Confirm?', 'Are you sure you want to proceed?', 'add',);



  }

  openConfirmation(title: string, msg: string, type: string) {
    this.confirmationService.confirm({
      message: msg,
      header: title,
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: { label: 'No', severity: 'secondary', outlined: true },
      acceptButtonProps: { label: 'Yes' },
      accept: () => {
        if (type === 'add' || type === 'update') this.submitCall();
        else if (type === 'delete') this.deleteData();
      }
    });
  }

  submitCall() {
    this.isFormLoading = true;
    const userId = sessionStorage.getItem('userId') || '';
    let query = '';
    let SP = '';
    const userData = JSON.parse(sessionStorage.getItem('UserInfo') || '{}');
    this.orgMasterId = userData[0].orgMasterId
    if (this.postType === 'update') {
      SP = `uspUpdateSystemSettings`
      query = `${this.paramvaluedata}|appUserId=${userId}|orgId=${this.orgMasterId}|orgSettingId=${this.selectedIndex.orgSettingId}`
    } else {
      SP = `uspPostSystemSettings`
      query = `${this.paramvaluedata}|appUserId=${userId}`
    }

    this.userService.SubmitPostTypeData(SP, query, 'header').subscribe({
      next: (res: any) => {
        this.isFormLoading = false;
        const result = res.split('-');
        if (result[1] === 'success') {
          this.message.add({
            severity: 'success',
            summary: 'Success',
            detail: this.postType === 'update' ? 'Data Updated Successfully.' : 'Data Saved Successfully.',
            life: 3000
          });
          this.getTableData(false);
          this.onDrawerHide();
        } else {
          this.message.add({ severity: 'warn', summary: 'Warning', detail: result[1], life: 3000 });
        }
      },
      error: () => {
        this.isFormLoading = false;
        this.message.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Something went wrong. Please try again later.',
          life: 3000
        });
      }
    });
  }

  deleteItem(item: any) {
    this.selectedIndex = item;
    this.openConfirmation('Confirm', 'Are you sure want to delete?', 'delete');
  }

  deleteData() {
    this.isFormLoading = true;
    const userId = sessionStorage.getItem('userId') || '';
    const query = `orgSettingId=${this.selectedIndex.orgSettingId}|appUserId=${userId}`;
    this.userService.SubmitPostTypeData('uspDeleteSystemSettings', query, 'header').subscribe({
      next: (res: any) => {
        this.isFormLoading = false;
        const result = res.split('-');
        if (result[1] === 'success') {
          this.message.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Setting deleted successfully.',
            life: 3000
          });
          this.getTableData(true);
          this.onDrawerHide();
        } else {
          this.message.add({ severity: 'warn', summary: 'Warning', detail: result[1], life: 3000 });
        }
      },
      error: () => {
        this.isFormLoading = false;
        this.message.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete data.',
          life: 3000
        });
      }
    });
  }


  isInvalid(field: string, form: FormGroup | null | undefined): boolean {


    if (!form || typeof form.get !== 'function') return false;

    const control = form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

}
