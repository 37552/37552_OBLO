import { Component, ChangeDetectorRef, AfterViewInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
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
import { DatePickerModule } from 'primeng/datepicker';

@Component({
  selector: 'app-holiday-calender-master',
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
    DatePickerModule
  ],
  providers: [
    ConfirmationService,
    MessageService
  ],
  templateUrl: './holiday-calender-master.html',
  styleUrl: './holiday-calender-master.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HolidayCalenderMaster {
  visible = false;
  postType = '';
  header = '';
  headerIcon = 'pi pi-plus';
  isFormLoading = false;
  isLoading = true;
  pageNo = 1;
  pageSize = 5;
  searchText = '';
  totalCount = 0;
  data: any[] = [];
  selectedItem: any;

  holidayForm: FormGroup;

  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isCustom: true },
    { key: 'holidayName', header: 'Holiday Name', isVisible: true }
  ];

  param: string | null = null;
  FormName: any;
  FormValue: any;
  menulabel: any;
  breadcrumbItems!: ({ label: any; disabled?: undefined; } | { label: any; disabled: boolean; })[];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private cdr: ChangeDetectorRef,
    private confirm: ConfirmationService,
    private message: MessageService
  ) {
    this.holidayForm = this.fb.group({
      id: [0],
      holidayName: ['', Validators.required]
    });
  }

  ngOnInit() {
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
    this.loadTableData();
  }

  loadTableData() {
    this.isLoading = true;
    const currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
    const roleId = currentRole?.roleId || '';
    const userId = sessionStorage.getItem('userId') || '';
    const districtId = sessionStorage.getItem('District') || '';
    
    let query = `appUserId=${userId}|appUserRole=${roleId}|districtId=${districtId}|pageIndex=${this.pageNo}|size=${this.pageSize}|searchText=${this.searchText}`;
    
    this.userService.getQuestionPaper(`uspGetHolidayMasterView|${query}`).subscribe({
      next: (res: any) => {
        this.data = res?.table1 || [];
        this.totalCount = res?.table?.[0]?.totalCnt || this.data.length;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to load data.' });
        this.cdr.detectChanges();
      }
    });
  }

  showDialog(type: 'add' | 'update' | 'view', data: any) {
    this.postType = type;
    this.visible = true;

    // Reset form first
    this.holidayForm.reset({ id: 0, holidayName: '' });
    
    if (type === 'add') {
      this.header = 'Add Holiday';
      this.headerIcon = 'pi pi-plus';
      this.holidayForm.enable(); // Enable form for adding
    } 
    else if (type === 'update') {
      this.header = 'Update Holiday';
      this.headerIcon = 'pi pi-pencil';
      this.holidayForm.enable(); // Enable form for updating
      this.holidayForm.patchValue({
        id: data.id,
        holidayName: data.holidayName
      });
    } 
    else if (type === 'view') {
      this.header = 'View Holiday';
      this.headerIcon = 'pi pi-eye';
      this.holidayForm.patchValue({
        id: data.id,
        holidayName: data.holidayName
      });
      this.holidayForm.disable(); // Disable form for viewing only
    }

    this.selectedItem = data;
    this.cdr.detectChanges();
  }

  onSubmit(event: any) {
    if (this.holidayForm.invalid) {
      this.holidayForm.markAllAsTouched();
      this.cdr.detectChanges();
      return;
    }

    const raw = this.holidayForm.getRawValue();
    const userId = sessionStorage.getItem('userId') || '';
    const role = JSON.parse(sessionStorage.getItem('currentRole') || '{}')?.roleId || 0;

    const param = `id=${raw.id}|holidayName=${raw.holidayName}|appUserId=${userId}|appUserRole=${role}`;

    this.confirm.confirm({
      target: event?.target,
      header: 'Confirm',
      message: 'Do you want to save this holiday?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.submitCall(param)
    });
  }

  submitCall(param: string) {
    this.isFormLoading = true;
    this.userService.SubmitPostTypeData('uspPostHolidayMaster', param, 'header').subscribe({
      next: (res: any) => {
        this.isFormLoading = false;
        const result = res.split('-');
        if (result[1] === 'success') {
          const messageDetail =
            this.postType === 'update'
              ? 'Holiday updated successfully!'
              : 'Holiday saved successfully!';

          this.message.add({
            severity: 'success',
            summary: 'Success',
            detail: messageDetail,
          });

          this.visible = false;
          this.loadTableData();
        } else {
          this.message.add({ severity: 'warn', summary: 'Warning', detail: res });
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isFormLoading = false;
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to save holiday.' });
        console.error(err);
        this.cdr.detectChanges();
      },
    });
  }

  confirmDelete(item: any) {
    this.confirm.confirm({
      header: 'Confirm Delete',
      message: `Delete ${item.holidayName}?`,
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deleteHoliday(item)
    });
  }

  deleteHoliday(item: any) {
    const userId = sessionStorage.getItem('userId') || '';
    const role = JSON.parse(sessionStorage.getItem('currentRole') || '{}')?.roleId || 0;
    const query = `action=DELETE|id=${item.id}|appUserId=${userId}|appUserRole=${role}`;
    this.userService.SubmitPostTypeData('uspDeleteHolidayMaster', query, 'header').subscribe({
      next: (res: any) => {
        const result = res.split('-');
        if (result[1] === 'success') {
          this.message.add({ severity: 'success', summary: 'Deleted', detail: 'Holiday deleted successfully.' });
          this.loadTableData();
        } else {
          this.message.add({ severity: 'warn', summary: 'Warning', detail: res });
        }
        this.cdr.detectChanges();
      },
      error: () => {
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete holiday.' });
        this.cdr.detectChanges();
      }
    });
  }

  onDrawerHide() {
    this.visible = false;
    this.holidayForm.enable(); // Re-enable form when drawer closes
    this.holidayForm.reset({ id: 0, holidayName: '' });
    this.postType = '';
    this.cdr.detectChanges();
  }

  onClear() {
    this.holidayForm.reset({ id: 0, holidayName: '' });
    this.cdr.detectChanges();
  }

  isInvalid(field: string) {
    const control = this.holidayForm.get(field);
    return control && control.invalid && (control.dirty || control.touched);
  }

  onPageChange(page: number) {
    this.pageNo = page;
    this.loadTableData();
  }

  onSearchChange(text: string) {
    this.searchText = text;
    this.pageNo = 1;
    this.loadTableData();
  }

  onPageSizeChange(newSize: number) {
    this.pageSize = newSize;
    this.pageNo = 1;
    this.loadTableData();
  }
}