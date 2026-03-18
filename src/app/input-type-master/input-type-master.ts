import { Component, ChangeDetectorRef } from '@angular/core';
import { TableTemplate, TableColumn } from '../table-template/table-template';
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
import { UserService } from '../shared/user-service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Toast } from 'primeng/toast';
import { Router } from '@angular/router';
import { Customvalidation } from '../shared/Validation';


@Component({
  selector: 'app-input-type-master',
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
    DatePickerModule,
    ConfirmDialog,
    ProgressSpinner,
    Toast,
    Tooltip
  ],
  providers: [
    ConfirmationService,
    MessageService
  ],
  templateUrl: './input-type-master.html',
  styleUrls: ['./input-type-master.scss']
})
export class InputTypeMaster {
  isLoading = true;
  visible: boolean = false;
  postType: string = '';
  header: any = '';
  inputTypeForm: FormGroup;
  selectedIndex: any = [];
  headerIcon: string = 'pi pi-plus';
  paramvaluedata: string = '';
  isFormLoading: boolean = false;
  data: any[] = [];
  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true },
    { key: 'fieldType', header: 'Field Type', isVisible: true, isSortable: true },
  ];
  pageNo = 1;
  pageSize = 5;
  searchText = '';
  totalCount = 0;
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private message: MessageService,
    private cdr: ChangeDetectorRef,
    public Customvalidation: Customvalidation,
    private router: Router,
  ) {
    this.inputTypeForm = this.fb.group({
      fieldName: ['', Validators.required]
    });
  }

  get f() { return this.inputTypeForm.controls; }

  ngOnInit(): void {
    this.getTableData(true);
  }


  getTableData(isTrue: boolean) {
    try {
      if (isTrue) {
        this.isLoading = true;
      } else {
        this.pageNo = 1;
      }

      const currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
      const roleId = currentRole?.roleId || '';
      const userId = sessionStorage.getItem('userId') || '';
      const districtId = sessionStorage.getItem('District') || '';

      const query = `appUserId=${userId}|appUserRole=${roleId}|districtId=${districtId}|searchText=${this.searchText}|pageIndex=${this.pageNo}|size=${this.pageSize}|activity=header`;
      this.userService.getQuestionPaper(`uspGetFormFieldTypes|${query}`).subscribe({
        next: (res: any) => {
          try {
            this.data = res?.table1 || [];
            this.totalCount = res?.table?.[0]?.totalCnt || this.data.length;
          } catch (innerErr) {
            console.error('Error processing response:', innerErr);
            this.data = [];
            this.totalCount = 0;
          } finally {
            setTimeout(() => {
              this.isLoading = false;
              this.cdr.detectChanges();
            }, 1000);
          }
        },
        error: (err) => {
          console.error('API call failed:', err);
          this.isLoading = false;
          if (err.status === 403) {
            this.Customvalidation.loginroute(err.status);
          } else {
            this.data = [];
            this.totalCount = 0;
          }
        }
      });

    } catch (error) {
      console.error('Unexpected error in getTableData():', error);
      this.isLoading = false;
      // this.data = [];
      // this.totalCount = 0;
      // sessionStorage.clear();
      // localStorage.clear();
      // this.router.navigate(['/login']);
    }
  }


  // getTableData(isTrue: boolean) {
  //   if (isTrue) { this.isLoading = true; } else {
  //     this.pageNo = 1
  //   }

  //   const roleId = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
  //   const query = `appUserId=${sessionStorage.getItem('userId')}|appUserRole=${roleId}|districtId=${sessionStorage.getItem('District')}|searchText=${this.searchText}|pageIndex=${this.pageNo}|size=${this.pageSize}|sortColumn=${this.sortColumn || ''}|sortDirection=${this.sortDirection || ''}|activity=header`;

  //   this.userService.getQuestionPaper(`uspGetFormFieldTypes|${query}`).subscribe((res: any) => {
  //     this.data = res?.table1 || [];
  //     this.totalCount = res?.table?.[0]?.totalCnt || this.data.length;
  //     setTimeout(() => {
  //       this.isLoading = false;
  //       this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
  //     }, 1000);
  //   });
  // }

  generateColumns(data: any[]): TableColumn[] {
    if (!data || data.length === 0) return [];
    return Object.keys(data[0]).map(key => ({
      key,
      header: key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()),
      isSortable: true,
      isVisible: true
    }));
  }

  showDialog(view: string, data: any) {
    this.visible = true;
    this.postType = view;
    this.header = view === 'add' ? 'Add' : (view === 'update' ? 'Update' : 'View');
    this.headerIcon = view === 'add' ? 'pi pi-plus' : (view === 'update' ? 'pi pi-pencil' : 'pi pi-eye');
    this.selectedIndex = data;

    if (view === 'view') this.inputTypeForm.disable();
    else this.inputTypeForm.enable();

    this.inputTypeForm.patchValue({
      fieldName: data.fieldType || ''
    });

    document.body.style.overflow = 'hidden';
  }

  onSubmit(event: any) {
    this.paramvaluedata = `fieldType=${this.inputTypeForm.get('fieldName')?.value}`;
    this.openConfirmation('Confirm?', "Are you sure you want to proceed?", '1', '1', event);
  }

  onDrawerHide() {
    document.body.style.overflow = 'visible';
    this.inputTypeForm.enable();
    this.inputTypeForm.reset();
    this.paramvaluedata = '';
    this.visible = false;
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
        if (option === '1') this.submitcall();
        else if (option === '2') this.deleteData();
      },
      reject: () => { }
    });
  }

  submitcall() {
    try {
      this.isFormLoading = true;
      const currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
      const roleID = currentRole?.roleId || '';
      const userId = sessionStorage.getItem('userId') || '';
      let query = '';
      let SP = '';
      if (this.postType === 'update') {
        query = `action=UPDATE|${this.paramvaluedata}|fieldTypeId=${this.selectedIndex.fieldTypeId}|appUserId=${userId}|appUserRole=${roleID}|activity=header`;
        SP = `uspUpdateFormFieldTypes`;
      } else {
        query = `${this.paramvaluedata}|appUserId=${userId}|appUserRole=${roleID}|activity=header`;
        SP = `uspPostFormFieldType`;
      }
      this.userService.SubmitPostTypeData(SP, query, 'header').subscribe({
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
                detail: this.postType === 'update' ? 'Data Updated Successfully.' : 'Data Saved Successfully.',
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

    } catch (error) {
      console.error('Unexpected error in submitcall():', error);
      this.isFormLoading = false;
      this.message.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Something went wrong',
        life: 3000
      });
      // sessionStorage.clear();
      // localStorage.clear();
      // this.router.navigate(['/login']);
    }
  }


  isInvalid(field: string): boolean {
    const control = this.inputTypeForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onPageChange(newPage: number) {
    this.pageNo = newPage;
    this.getTableData(true);
  }

  onPageSizeChange(newSize: number) {
    this.pageSize = newSize;
    this.pageNo = 1; // reset to first page
    this.getTableData(true); // fetch data from API again
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

  deleteItem(item: any) {
    this.selectedIndex = item;
    this.openConfirmation("Confirm", "Are you sure want to delete?", '1', '2');
  }


  deleteData() {
    try {
      this.isFormLoading = true;
      const currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
      const roleID = currentRole?.roleId || '';
      const userId = sessionStorage.getItem('userId') || '';
      const query = `action=DELETE|fieldType=|fieldTypeId=${this.selectedIndex.fieldTypeId}|appUserId=${userId}|appUserRole=${roleID}|activity=header`;
      this.userService.SubmitPostTypeData(`uspUpdateFormFieldTypes`, query, 'header').subscribe({
        next: (datacom: any) => {
          this.isFormLoading = false;
          try {
            if (!datacom) return;
            const resultarray = datacom.split('-');
            if (resultarray[1] === 'success') {
              this.getTableData(true);
              this.message.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Data deleted successfully.',
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
              detail: 'Failed to delete data. Please try again later.',
              life: 3000
            });
          }
        }
      });

    } catch (error) {
      console.error('Unexpected error in deleteData():', error);
      this.isFormLoading = false;
      // this.message.add({
      //   severity: 'error',
      //   summary: 'Error',
      //   detail: 'Unexpected error occurred. Please log in again.',
      //   life: 3000
      // });
      // sessionStorage.clear();
      // localStorage.clear();
      // this.router.navigate(['/login']);
    }
  }

}
