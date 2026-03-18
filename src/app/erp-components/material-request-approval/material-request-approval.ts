import { Component, ChangeDetectorRef, signal, ViewChild, ElementRef } from '@angular/core';
import { TableTemplate, TableColumn } from '../../table-template/table-template';
import { ButtonModule } from 'primeng/button';
import { Popover } from 'primeng/popover';
import { Tooltip } from "primeng/tooltip";
import { Dialog } from 'primeng/dialog';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
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
import { FileUploadModule } from 'primeng/fileupload';
import { ConfigService } from '../../shared/config.service';
import { OnlyNumberDirective } from '../../shared/directive/only-number.directive';
import { OnlyStringDirective } from '../../shared/directive/only-string.directive';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-material-request-approval',
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
      MultiSelectModule,
      Toast,
      Tooltip,
      Dialog,
      TableModule,
      IconFieldModule,
      InputIconModule,
      InputTextModule,
      FileUploadModule,
      OnlyNumberDirective,
      OnlyStringDirective,
      BreadcrumbModule,
      TabsModule
    ],
    providers: [
      ConfirmationService,
      MessageService,
      DatePipe,
    ],
  templateUrl: './material-request-approval.html',
  styleUrl: './material-request-approval.scss'
})
export class MaterialRequestApproval {
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
  postType: string = 'add';
  header: any = '';
  selectedIndex: any = [];
  headerIcon: string = 'pi pi-plus';
  paramvaluedata: string = '';
  isFormLoading: boolean = false;
  data: any[] = [];
  currentDate = new Date();
  totalCount = 0;
  approveDailog: boolean = false;
  approvalForm: FormGroup;
  itemData: any = [];
  rowId: any;
  MRNO: any;

  statusDrp = [
    { label: 'Approve', value: 1 },
    { label: 'Reject', value: 3 }
  ];


  columns: TableColumn[] = [
    { key: 'mrNo', header: 'Mr. No.', isVisible: true, isSortable: false },
    { key: 'requiredDate', header: 'Required Date', isVisible: true, isSortable: false },
    { key: 'requisitionPrupose', header: 'Requisition Purpose', isVisible: true, isSortable: false },
    { key: 'division', header: 'Division', isVisible: true, isSortable: false },
    { key: 'warehouse', header: 'Warehouse', isVisible: true, isSortable: false },
    { key: 'costCenter', header: 'Cost Center', isVisible: true, isSortable: false },
    { key: 'materialType', header: 'Material Type', isVisible: true, isSortable: false },
    { key: 'requestedBy', header: 'Requested By', isVisible: true, isSortable: false },
    { key: 'status', header: 'Status', isVisible: true, isSortable: false },
    { key: 'raisedBy', header: 'Raised By', isVisible: true, isSortable: false },
    { key: 'jsonDetails', header: 'Item Details', isVisible: true, isSortable: false, isCustom: true }
  ]

  constructor(private fb: FormBuilder,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private message: MessageService,
    public Customvalidation: Customvalidation,
    private configService: ConfigService,
    private cdr: ChangeDetectorRef,
    private datePipe: DatePipe) {
    
    this.approvalForm = this.fb.group({
      statusIdControl: ['', [Validators.required]],
      remarkControl: ['', [Validators.required, noInvalidPipelineName()]],
    });

  }

  get f() { return this.approvalForm.controls }

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
      const query = `searchText=${this.searchText}|pageIndex=${this.pageNo}|size=${this.pageSize}|appUserId=${userId}|appUserRole=${roleId}|districtId=${sessionStorage.getItem('District')}`;

      this.userService.getQuestionPaper(`UspGetMaterialRequestForApproval|${query}`).subscribe({
        next: (res: any) => {
          try {
            this.data = res?.table1 || [];
            this.totalCount = res?.table?.[0]?.totalCnt || this.data.length;

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

  onSortChange(event: { column: string, direction: 'asc' | 'desc' }) {
    this.sortColumn = event.column;
    this.sortDirection = event.direction;
    this.getTableData(true);
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
        else if (option == '4') {
        }
        else if (option === '5') {
        }
      }
    });
  }


  openDetailModal(data: any) {
    this.approveDailog = true;
    this.rowId = data['id']
    this.MRNO = data['mrNo']
    this.itemData = JSON.parse(data['itemDetails'])
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 0)

  }

  closeDataDialog() {
    this.approveDailog = false;
    this.rowId = ""
    this.MRNO = ""
    this.approvalForm.get('remarkControl')?.setValue('');
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 0)

  }

  isInvalid(field: string): boolean {
    const control =
      this.approvalForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onClear() {
    this.approvalForm.reset();
  }

  hasDuplicateIds = (arr:any, key:any) => {
    const idSet = new Set();
    for (const obj of arr) {
      if (!(key in obj)) {
        continue;
      }
      if (idSet.has(obj[key])) {
        return true;
      }
      idSet.add(obj[key]);
    }
    return false;
  }

  async onValidate() {
    let statusId = this.approvalForm.get(`statusIdControl`)?.value ?? [];
    let remarks = this.approvalForm.get(`remarkControl`)?.value ?? [];
    if (statusId == "0" || remarks == ""
    ) {
      this.message.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please fill required fields(*)',
        life: 3000
      });
      return
    }
    let isDuplicate = await this.hasDuplicateIds(this.itemData, 'itemCodeId')
    if (statusId == '1' && isDuplicate) {
      this.message.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Duplicate item exist!',
        life: 3000
      });
      return
    }
  }

  onSubmit(event: any) {
    if (!this.approvalForm.valid) {
      this.approvalForm.markAllAsTouched();
      return;
    }
    this.openConfirmation('Confirm?', 'Are you sure you want to proceed?', '1', '1', event);

  }

  submitcall() {
    try {
      this.isFormLoading = true;
      let status = this.approvalForm.get(`statusIdControl`)?.value ?? [];
      let remarks = this.approvalForm.get(`remarkControl`)?.value ?? [];
      let query = `mrId=${this.rowId}|status=${status}|remark=${remarks}|appUserId=${sessionStorage.getItem("userId")}`

      this.userService.SubmitPostTypeData('uspPostMRAuthorisation', query, this.FormName).subscribe({
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
              this.approveDailog = false;
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


}
