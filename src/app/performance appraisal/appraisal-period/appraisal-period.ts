import { Component, ChangeDetectorRef, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { TableTemplate, TableColumn } from '../../table-template/table-template';
import { ButtonModule } from 'primeng/button';
import { Popover } from 'primeng/popover';
import { Tooltip } from "primeng/tooltip";
import { Dialog } from 'primeng/dialog';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CardModule } from 'primeng/card';
import { DrawerModule } from 'primeng/drawer';
import { UserService } from '../../shared/user-service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Toast } from 'primeng/toast';
import { FileUploadModule } from 'primeng/fileupload';
import { HttpErrorResponse } from '@angular/common/http';
import { ConfigService } from '../../shared/config.service';
import { OnlyNumberDirective } from '../../shared/directive/only-number.directive';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { SkeletonModule } from 'primeng/skeleton';
import { MultiSelectModule } from 'primeng/multiselect';
import { DatePickerModule } from 'primeng/datepicker';
import { Drawer } from 'primeng/drawer';
import { DatePipe } from '@angular/common';
import { Customvalidation } from '../../shared/Validation';

@Component({
  selector: 'app-appraisal-period',
  imports: [
    TableTemplate,
    CardModule,
    ButtonModule,
    DrawerModule,
    Popover,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    SelectModule,
    InputTextModule,
    InputNumberModule,
    ConfirmDialog,
    ProgressSpinner,
    Toast,
    Tooltip,
    FileUploadModule,
    Dialog,
    OnlyNumberDirective,
    BreadcrumbModule,
    SkeletonModule,
    MultiSelectModule,
    DatePickerModule,
    Drawer
  ],
  providers: [
    ConfirmationService,
    MessageService,
    DatePipe
  ],
  templateUrl: './appraisal-period.html',
  styleUrl: './appraisal-period.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppraisalPeriod {
  isLoading = true;
  visible: boolean = false;
  postType: string = '';
  header: any = '';
  selectedIndex: any = [];
  headerIcon: string = 'pi pi-plus';
  paramvaluedata: string = '';
  isFormLoading: boolean = false;
  data: any[] = [];
  appraisalPeriodForm: FormGroup;
  currentItemId: number = 0;
  
  // Dropdown arrays
  organisations: any[] = [];
  years: any[] = [];
  quarters:any[] = [];
  
  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true },
    { key: 'Organisation', header: 'Organisation', isVisible: true },
    { key: 'FinancialYear', header: 'Financial Year', isVisible: true },
    { key: 'Quarter', header: 'Quarter', isVisible: true },
    { key: 'LastAppraisaldate', header: 'Last Appraisal Date', isVisible: true },
  ];
  
  pageNo = 1;
  pageSize = 5;
  searchText = '';
  totalCount = 0;
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  searchTimeout: any;
  debounceTime = 500;
  
  param: string | null = null;
  FormName: any;
  FormValue: any;
  menulabel: any;
  breadcrumbItems!: ({ label: any; disabled?: undefined; } | { label: any; disabled: boolean; })[];
  home: { icon: string; routerLink: string; } | undefined;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private configService: ConfigService,
    private message: MessageService,
    private cdr: ChangeDetectorRef,
    private datePipe: DatePipe ,
    private Customvalidation: Customvalidation,
  ) {
    this.appraisalPeriodForm = this.fb.group({
      id: [0],
      Organisation: [null, Validators.required],
      FinancialYear: [null, Validators.required],
      Quarter: ['', Validators.required],
      LastAppraisaldate: ['', Validators.required],
    });
  }

  get f() { return this.appraisalPeriodForm.controls }

  ngOnInit(): void {
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
    this.getOrgDrp();
    this.getQuarterDrp();
    this.getfinancialyear();
    this.getTableData(true);
    this.cdr.detectChanges();
    setTimeout(() => {
      if (this.isLoading) {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    }, 1000);
  }

  getOrgDrp() {
    this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblOrgMaster`)
      .subscribe((res: any) => {
        this.organisations = res['table'] || [];
      },
      (err: HttpErrorResponse) => {
        if (err.status == 403) {
          this.Customvalidation.loginroute(err.status);
        }
      });
  }
  getfinancialyear() {
    this.userService.getQuestionPaper(`uspGetFinancialYearDrp`)
      .subscribe((res: any) => {
        this.years = res['table'] || [];
      },
      (err: HttpErrorResponse) => {
        if (err.status == 403) {
          this.Customvalidation.loginroute(err.status);
        }
      });
  }
  getQuarterDrp() {
    this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblYearQuarterMaster`)
      .subscribe((res: any) => {
        this.quarters = res['table'] || [];
      },
      (err: HttpErrorResponse) => {
        if (err.status == 403) {
          this.Customvalidation.loginroute(err.status);
        }
      });
  }
 
  getTableData(isTrue: boolean) {
    if (isTrue) {
      this.isLoading = true;
      this.cdr.detectChanges();
    } else {
      this.pageNo = 1;
    }

    const userId = sessionStorage.getItem('userId') || '';
    const userRoleId = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
    const districtId = sessionStorage.getItem('District');

    let query = `appUserId=${userId}|appUserRole=${userRoleId}|districtId=${districtId}|pageIndex=${this.pageNo}|size=${this.pageSize}|searchText=${this.searchText}`;
    
    this.userService.getQuestionPaper(`uspGetApraisalPeriod|${query}`).subscribe({
      next: (res: any) => {
        try {
          this.data = res?.table1 || [];
          
          this.data = this.data.map(item => ({
            ...item,
            id: item.id || item.appraisalPeriodId,
            Organisation: item.organisation || '',
            FinancialYear: item.financialYear || '',
            Quarter: item.quarter || '',
            LastAppraisaldate: item.lastDate ? this.datePipe.transform(new Date(item.lastDate), 'dd-MM-yyyy') : '',
            // isActive: item.isActive,
            orgMasterId: item.orgMasterId,
            quarterId: item.quarterId,
            lastDate: item.lastDate ? new Date(item.lastDate) : null
          }));
          
          this.totalCount = res?.table?.[0]?.totalCnt || 
                           res?.table1?.[0]?.totalCount || 
                           this.data.length;

        } catch (innerErr) {
          console.error('Error processing response:', innerErr);
          this.data = [];
          this.totalCount = 0;
          this.message.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: 'Failed to process appraisal period data.' 
          });
        } finally {
          setTimeout(() => {
            this.isLoading = false;
            this.cdr.detectChanges();
          }, 1000);
        }
      },
      error: (err) => {
        console.error('Error loading table data:', err);
        this.message.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'Failed to load appraisal periods.' 
        });
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSearchChange(search: string) {
    this.searchText = search;
    this.pageNo = 1;
    
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    this.searchTimeout = setTimeout(() => {
      this.getTableData(false);
    }, this.debounceTime);
    
    this.cdr.markForCheck();
  }

  clearSearch() {
    this.searchText = '';
    this.pageNo = 1;
    this.getTableData(false);
    this.cdr.markForCheck();
  }

  showDialog(view: string, data: any) {
    this.isFormLoading = true;
    this.cdr.detectChanges();

    if (view == 'add') {
      this.visible = true;
      this.postType = view;
      this.header = 'Add Appraisal Period';
      this.headerIcon = 'pi pi-plus';
      this.appraisalPeriodForm.reset({ id: 0 });
      this.isFormLoading = false;
      this.cdr.detectChanges();
    } else {
      this.visible = true;
      this.postType = view;
      this.header = view === 'update' ? 'Update Appraisal Period' : 'View Appraisal Period';
      this.headerIcon = view === 'update' ? 'pi pi-pencil' : 'pi pi-eye';
      this.selectedIndex = data;
      this.currentItemId = data.id || data.appraisalPeriodId || 0;

      if (view === 'view') {
        this.appraisalPeriodForm.disable();
      } else {
        this.appraisalPeriodForm.enable();
      }

      const patchData = {
        id: data.id || data.appraisalPeriodId || 0,
        Organisation: data.orgMasterId || null,
        FinancialYear: data.financialYear || null,
        Quarter: data.quarterId || null,
        AppraisalTo: data.appraisalToDate || '',
        LastAppraisaldate: data.lastDate || ''
      };

      this.appraisalPeriodForm.patchValue(patchData);
      this.isFormLoading = false;
      this.cdr.detectChanges();
    }
    document.body.style.overflow = 'hidden';
  }

  onSubmit(event: any) {
    if (!this.appraisalPeriodForm.valid) {
      this.appraisalPeriodForm.markAllAsTouched();
      this.scrollToFirstInvalidControl(this.appraisalPeriodForm);
      this.cdr.detectChanges();
      return;
    }
    
    const formData = this.appraisalPeriodForm.getRawValue();
    const Organisation = formData.Organisation;
    const FinancialYear = formData.FinancialYear;
    const Quarter = formData.Quarter;
    const LastAppraisaldate = this.datePipe.transform(formData.LastAppraisaldate, 'yyyy-MM-dd');
    const userId = sessionStorage.getItem('userId');
    const userRoleId = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;


    if (this.postType === 'add') {
      this.paramvaluedata = `orgMasterId=${Organisation}|financialYear=${FinancialYear}|quarterId=${Quarter}|lastDate=${LastAppraisaldate}|appUserId=${userId}|appUserRole=${userRoleId}`;
      this.openConfirmation('Confirm?', "Are you sure you want to proceed?", '1', '1', event);
    } else {
      this.paramvaluedata = `id=${this.currentItemId}|orgMasterId=${Organisation}|financialYear=${FinancialYear}|quarterId=${Quarter}|lastDate=${LastAppraisaldate}|appUserId=${userId}|appUserRole=${userRoleId}`;
      this.openConfirmation('Confirm?', "Are you sure you want to update?", '1', '1', event);
    }
  }

  scrollToFirstInvalidControl(form: FormGroup) {
    if (form.invalid) {
      const firstInvalid = document.querySelector('.ng-invalid');

      if (firstInvalid) {
        (firstInvalid as HTMLElement).scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
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
        } else if (option === '2') {
          // this.deleteData();
        }
      },
      reject: () => {
      }
    });
  }

  submitcall() {
    this.isFormLoading = true;
    this.cdr.detectChanges();

    const SP = this.postType === 'add' ? 'uspPostApraisalPeriod' : 'uspPostUpdateApraisalPeriod';

    this.userService.SubmitPostTypeData(SP, this.paramvaluedata, 'header').subscribe({
      next: (datacom: any) => {
        this.isFormLoading = false;
        if (!datacom) return;
        const resultarray = datacom.split('-');
        if (resultarray[1] === 'success') {
          this.getTableData(false);
          this.message.add({
            severity: 'success',
            summary: 'Success',
            detail: this.postType === 'update'
              ? 'Appraisal Period Updated Successfully.'
              : 'Appraisal Period Saved Successfully.',
          });
          this.onDrawerHide();
        } else if (resultarray[0] === '2') {
          this.message.add({
            severity: 'warn',
            summary: 'Warn',
            detail: resultarray[1] || datacom,
          });
        } else {
          this.message.add({
            severity: 'warn',
            summary: 'Warn',
            detail: datacom,
          });
        }

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Submit error:', err);
        this.message.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to save appraisal period data.',
        });
        this.isFormLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  // deleteData() {
  //   const userId = sessionStorage.getItem('userId') || '';
  //   let query = `action=DELETE|id=${this.selectedIndex.id || 0}|appUserId=${userId}`;
  //   this.userService.SubmitPostTypeData(`uspDeleteAppraisalPeriod`, query, 'header').subscribe({
  //     next: (datacom: any) => {
  //       this.isFormLoading = false;
  //       if (!datacom) return;
  //       const resultarray = datacom.split("-");
  //       if (resultarray[1] === "success") {
  //         this.getTableData(true);
  //         this.message.add({ severity: 'success', summary: 'Success', detail: 'Appraisal Period deleted successfully' });
  //         this.onDrawerHide();
  //       } else {
  //         this.message.add({ severity: 'warn', summary: 'Warn', detail: datacom, });
  //       }
  //       this.cdr.detectChanges();
  //     },
  //     error: (err) => {
  //       console.error('Delete error:', err);
  //       this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete appraisal period.' });
  //       this.isFormLoading = false;
  //       this.cdr.detectChanges();
  //     }
  //   });
  // }

  onDrawerHide() {
    document.body.style.overflow = 'visible';
    this.appraisalPeriodForm.enable();
    this.visible = false;
    this.onClear();
    this.cdr.detectChanges();
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

  onSortChange(event: { column: string, direction: 'asc' | 'desc' }) {
    this.sortColumn = event.column;
    this.sortDirection = event.direction;
    this.getTableData(true);
  }

  isInvalid(field: string): boolean {
    const control = this.appraisalPeriodForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onClear() {
    this.appraisalPeriodForm.reset({
      id: 0
    });
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }
}