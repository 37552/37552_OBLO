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
import { HttpErrorResponse } from '@angular/common/http';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { FileUploadModule } from 'primeng/fileupload';
import { ConfigService } from '../../shared/config.service';
import { OnlyNumberDirective } from '../../shared/directive/only-number.directive';
import { OnlyStringDirective } from '../../shared/directive/only-string.directive';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { TabsModule } from 'primeng/tabs';
import { ExcelService } from '../../shared/excel.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
declare var $: any;

@Component({
  selector: 'app-purchase-order-approval',
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
    TabsModule,
    CheckboxModule
  ],
  providers: [
    ConfirmationService,
    MessageService,
    DatePipe,
    ExcelService
  ],
  templateUrl: './purchase-order-approval.html',
  styleUrl: './purchase-order-approval.scss'
})
export class PurchaseOrderApproval {
  @ViewChild('documentFileUpload') documentFileUpload: any;
  @ViewChild('poPrintWrapper', { static: false }) poPrintWrapper!: ElementRef<HTMLDivElement>;
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
  isProccess: any = false;
  modelHeading: string = '';
  recordViewData: any[] = [];
  recordHeaderViewData: any[] = [];
  data: any[] = [];
  totalCount = 0;
  data1: any[] = [];
  totalCount1 = 0;
  printDialog: boolean = false;
  printContent: SafeHtml | string = '';
  itemDailog: boolean = false;
  statusDailog: boolean = false;
  statusData: any[] = [];
  POApprovalForm: FormGroup;
  isDirect: boolean = false;
  fileData: any = [];
  showUploadFile: boolean = false;
  showFileUploadDialog = false;
  selectedUploadFile: File | null = null;
  uploadedFileUrl: string | null = null;
  isUploadingFile = false;
  selectedItem: any = [];
  priceListDialog: boolean = false;
  priceListData: any[] = [];

  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true, },
    { key: 'status', header: 'Status', isVisible: true, isSortable: false },
    { key: 'refNo', header: 'RefNo', isVisible: true, isSortable: false },
    { key: 'division', header: 'Division', isVisible: true, isSortable: false },
    { key: 'purchaseType', header: 'Purchase Type', isVisible: true, isSortable: false },
    { key: 'purchaseCategory', header: 'Purchase Category', isVisible: true, isSortable: false },
    { key: 'indent Type', header: 'Indent Type', isVisible: true, isSortable: false },
    { key: 'created By', header: 'Created By', isVisible: true, isSortable: false },
    { key: 'created Date', header: 'Created Date', isVisible: true, isSortable: false },
    { key: 'vendor Name', header: 'Vendor Name', isVisible: true, isSortable: false },
    { key: 'totalAmt', header: 'Total Amount', isVisible: true, isSortable: false },
    { key: 'jsonDetails', header: 'Item Details', isVisible: true, isSortable: false, isCustom: true },
  ]

  columns1: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true, },
    { key: 'status', header: 'Status', isVisible: true, isSortable: false },
    { key: 'refNo', header: 'RefNo', isVisible: true, isSortable: false },
    { key: 'division', header: 'Division', isVisible: true, isSortable: false },
    { key: 'purchaseType', header: 'Purchase Type', isVisible: true, isSortable: false },
    { key: 'purchaseCategory', header: 'Purchase Category', isVisible: true, isSortable: false },
    { key: 'indent Type', header: 'Indent Type', isVisible: true, isSortable: false },
    { key: 'created By', header: 'Created By', isVisible: true, isSortable: false },
    { key: 'created Date', header: 'Created Date', isVisible: true, isSortable: false },
    { key: 'vendor Name', header: 'Vendor Name', isVisible: true, isSortable: false },
    { key: 'totalAmt', header: 'Total Amount', isVisible: true, isSortable: false },
  ]

  constructor(private fb: FormBuilder,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private message: MessageService,
    public Customvalidation: Customvalidation,
    private configService: ConfigService,
    private cdr: ChangeDetectorRef,
    private datePipe: DatePipe,
    private excelService: ExcelService,
    private sanitizer: DomSanitizer,
    private router: Router) {
    
    this.POApprovalForm = fb.group({
      statusId: ['', [Validators.required]],
      documentId: ['', [Validators.required]],
      fileUploadControl: ['', [Validators.required]],
      remark: ['', [Validators.required]],
    }) 
  }

  get f() {
    return this.POApprovalForm.controls;
  }


  ngOnInit(): void {
    this.param = sessionStorage.getItem('menuItem') ?? '';
    let paramjs = JSON.parse(this.param);
    this.menulabel = paramjs.menu;
    this.FormName = paramjs.formName;
    this.FormValue = paramjs.formValue;
    this.getPendingData(true)
    this.getApprovedData(false)
    this.breadcrumbItems = [
      { label: this.menulabel },
      { label: this.FormName, disabled: true }
    ];
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  allowOnlyNumbers(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }


  isInvalid(controlName: string): boolean {
    const forms: FormGroup[] = [
      this.POApprovalForm
    ];

    for (let form of forms) {
      const control = form.get(controlName);
      if (control) {
        return !!(control.invalid && (control.dirty || control.touched));
      }
    }
    return false;
  }

  getPendingData(isTrue:any) {
    try {
      if (isTrue) this.isLoading = true;
      else this.pageNo = 1;

      const userId = sessionStorage.getItem('userId') || '';
      const roleId = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
      const query = `searchText=${this.searchText}|pageIndex=${this.pageNo}|size=${this.pageSize}|appUserId=${userId}|appUserRole=${roleId}|districtId=${sessionStorage.getItem('District')}`;
      this.userService.getQuestionPaper(`uspGetPurchaseOrderApproval|action=PENDING|${query}`).subscribe({
        next: (res: any) => {
          try {
            this.data = res?.table1 || [];
            this.totalCount = res?.table?.[0]?.totalCnt || this.data.length;
            this.statusData = res['table3'];
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

  getApprovedData(isTrue:any) {
    try {
      if (isTrue) this.isLoading = true;
      else this.pageNo = 1;

      const userId = sessionStorage.getItem('userId') || '';
      const roleId = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
      const query = `searchText=${this.searchText}|pageIndex=${this.pageNo}|size=${this.pageSize}|appUserId=${userId}|appUserRole=${roleId}|districtId=${sessionStorage.getItem('District')}`;

      this.userService.getQuestionPaper(`uspGetPurchaseOrderApproval|action=APPROVED|${query}`).subscribe({
        next: (res: any) => {
          try {
            this.data1 = res?.table1 || [];
            this.totalCount1 = res?.table?.[0]?.totalCnt || this.data.length;
          } catch (innerErr) {
            console.error('Error processing response:', innerErr);
            this.data1 = [];
            this.totalCount1 = 0;
          } finally {
            this.isLoading = false;
            this.cdr.detectChanges();
          }
        },
        error: (err) => {
          console.error('API call failed:', err);
          this.isLoading = false;
          if (err.status === 403) this.Customvalidation.loginroute(err.status);
          else { this.data1 = []; this.totalCount1 = 0; }
        }
      });
    } catch (error) {
      console.error('Unexpected error in getTableData():', error);
      this.isLoading = false;
    }
  }

  onPageChange(newPage: number) {
    this.pageNo = newPage;
    this.getPendingData(true);
  }

  onPageSizeChange(newSize: number) {
    this.pageSize = newSize;
    this.pageNo = 1;
    this.getPendingData(true);
  }

  onSearchChange(search: string) {
    this.searchText = search;
    this.pageNo = 1;
    this.getPendingData(false);
  }

  onSortChange(event: { column: string, direction: 'asc' | 'desc' }) {
    this.sortColumn = event.column;
    this.sortDirection = event.direction;
    this.getPendingData(true);
  }

  onPageChange1(newPage: number) {
    this.pageNo = newPage;
    this.getApprovedData(true);
  }

  onPageSizeChange1(newSize: number) {
    this.pageSize = newSize;
    this.pageNo = 1;
    this.getApprovedData(true);
  }

  onSearchChange1(search: string) {
    this.searchText = search;
    this.pageNo = 1;
    this.getApprovedData(false);
  }

  onSortChange1(event: { column: string, direction: 'asc' | 'desc' }) {
    this.sortColumn = event.column;
    this.sortDirection = event.direction;
    this.getApprovedData(true);
  }

  openDetailModal(data: any, title: string) {
    this.itemDailog = true;
    this.modelHeading = title;
    this.recordViewData = [];
    this.recordHeaderViewData = [];
    if (data && data !== '') {
      this.recordViewData = JSON.parse(data);
      if (this.recordViewData.length) {
        this.recordHeaderViewData = Object.keys(this.recordViewData[0]);
      }
    } else {
      this.recordViewData = [];
      this.recordHeaderViewData = [];
    }

  }

  closeDataDialog() {
    this.itemDailog = false;
    this.recordViewData = [];
    this.recordHeaderViewData = [];
    this.modelHeading = '';
  }

  showDialog(view: string, data: any) {
    this.visible = true;
    this.postType = view;
    this.selectedIndex = data;
    this.header = view === 'add' ? 'Add' : view === 'update' ? 'Update' : 'View';
    this.headerIcon = view === 'add' ? 'pi pi-plus' : view === 'update' ? 'pi pi-pencil' : 'pi pi-eye';

    if (data.status.toLowerCase() == 'approved') {
      this.showUploadFile = true
    }
    else {
      this.showUploadFile = false
    }

    this.selectedItem = data;
    this.fileData = []

    this.cdr.detectChanges();
    document.body.style.overflow = 'hidden';
  }

  onDrawerHide() {
    document.body.style.overflow = 'visible';
    this.visible = false;
    this.isDirect = false;
    this.POApprovalForm.enable();
    this.POApprovalForm.reset();
    this.showUploadFile = false
    this.selectedItem = null
    this.fileData = [];
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
      }
    });
  }

  onChangeStatus() {
    if (this.POApprovalForm.get(`statusId`)?.value == 10000) {
      this.showUploadFile = true;
    }
    else {
      this.showUploadFile = false;
    }
  }

  // --- File Upload ---
  openFileUploadDialog() {
    this.showFileUploadDialog = true;
    this.selectedUploadFile = null;
    this.cdr.detectChanges();
  }

  closeFileUploadDialog() {
    this.showFileUploadDialog = false;
    this.selectedUploadFile = null;
    this.cdr.detectChanges();
  }

  // --- File Selection ---
  onUploadFileSelect(event: any) {
    if (event.files && event.files.length > 0) {
      this.selectedUploadFile = event.files[0];
      this.cdr.detectChanges();
    }
  }

  // --- Clear Selection ---
  clearFileSelection() {
    this.selectedUploadFile = null;
    if (this.documentFileUpload) {
      this.documentFileUpload.clear();
    }
    this.cdr.detectChanges();
  }

  // --- Upload File ---

  uploadFileDoc() {
    try {
      if (!this.selectedUploadFile) {
        this.message.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'Please select a file.',
          life: 3000
        });
        return;
      }

      this.cdr.detectChanges();

      const filesArray: File[] = [this.selectedUploadFile];
      const folderName = 'MRN Approval';

      this.userService.MastrtfileuploadNew(filesArray, folderName).subscribe({
        next: (datacom: any) => {
          try {
            if (!datacom) {
              this.message.add({
                severity: 'warn',
                summary: 'Warning',
                detail: 'No response received from server.',
                life: 3000
              });
              return;
            }

            const filename = datacom.split('-');

            if (filename[0] === '1') {
              const documentName = this.POApprovalForm.get('documentId')?.value || '';
              const file = this.selectedUploadFile;

              if (!file) {
                return;
              }

              const obj = {
                attachFile: filename[1].toString(),
                documentName: documentName,
                name: file.name
              };

              this.fileData.push(obj);

              // Remove required validations
              this.POApprovalForm.get('documentId')?.clearValidators();
              this.POApprovalForm.get('documentId')?.updateValueAndValidity();

              this.POApprovalForm.get('fileUploadControl')?.clearValidators();
              this.POApprovalForm.get('fileUploadControl')?.updateValueAndValidity();

              // Clear UI fields only
              this.POApprovalForm.patchValue({
                documentId: '',
                fileUploadControl: ''
              });

              this.uploadedFileUrl = '';
              this.selectedUploadFile = null;

              this.message.add({
                severity: 'success',
                summary: 'Success',
                detail: 'File uploaded successfully!',
                life: 3000
              });

              this.closeFileUploadDialog();
            } else {
              this.message.add({
                severity: 'warn',
                summary: 'Warning',
                detail: filename[1] || datacom,
                life: 3000
              });
            }
          } catch (innerErr) {
            console.error('Error processing upload response:', innerErr);
            this.message.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Error while processing upload response.',
              life: 3000
            });
          }
        },
        error: (err) => {
          if (err.status === 401) {
            this.message.add({
              severity: 'error',
              summary: 'Error',
              detail: 'You are not authorized.',
              life: 3000
            });
          } else if (err.status === 403) {
            this.Customvalidation.loginroute(err.status);
          } else {
            this.message.add({
              severity: 'error',
              summary: 'Error',
              detail: err.message.toString(),
              life: 3000
            });
          }
        },
        complete: () => {
          this.isUploadingFile = false;
          setTimeout(() => this.isFormLoading = false, 1000);
          this.cdr.detectChanges();
        }
      });

    } catch (error) {
      console.error('Unexpected error:', error);
      this.isFormLoading = false;
      this.isUploadingFile = false;
    }
  }


  removeFile(index: any) {
    this.selectedIndex = index
    this.fileData.splice(this.selectedIndex, 1);

    if (this.fileData.length === 0) {
      this.POApprovalForm.get('documentId')?.setValidators([Validators.required]);
      this.POApprovalForm.get('fileUploadControl')?.setValidators([Validators.required]);

      this.POApprovalForm.get('documentId')?.updateValueAndValidity();
      this.POApprovalForm.get('fileUploadControl')?.updateValueAndValidity();
    }
  }


  removeFileUpload() {
    this.uploadedFileUrl = '';
    this.POApprovalForm.patchValue({
      fileUploadControl: ''
    });
    this.message.add({
      severity: 'info',
      summary: 'Removed',
      detail: 'File removed successfully.',
      life: 2000
    });
  }

  normalizeImagePath(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) {
      return path;
    }
    let normalizedPath = path.replace(/\\/g, '/');
    normalizedPath = normalizedPath.replace(/([^:]\/)\/+/g, '$1');
    return this.configService.baseUrl + normalizedPath;
  }


  getFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getRateList(item: any) {
    this.isFormLoading = true;
    this.userService.getQuestionPaper(`uspGetItemRateList|itemId=${item.itemId}|itemCodeId=${item.itemCodeId}|districtId=${sessionStorage.getItem("District")}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId}`)
      .subscribe({
        next: (data: any) => {
          if (data?.table?.length > 0) {
            this.priceListData = data.table.map((row: any) => {
              try {
                return {
                  ...row,
                  taxList: row.tax ? JSON.parse(row.tax) : []
                };
              } catch {
                return { ...row, taxList: [] };
              }
            });
          } else {
            this.priceListData = [];
          }

          this.isFormLoading = false;
          this.cdr.detectChanges(); 
          this.priceListDialog = true;
        },
        error: (err: HttpErrorResponse) => {
          this.isFormLoading = false;
          this.priceListData = [];

          if (err.status === 403) {
            sessionStorage.setItem('userToken', '');
            this.Customvalidation.loginroute(err.status);
          }
        }
      });
  }


  openPriceListModal() {
    this.priceListDialog = true;
  }

  closePriceListDialog() {
    this.priceListData = [];
    this.priceListDialog = false;
  }


  onSubmit() {
    if (this.POApprovalForm.invalid) {
      this.POApprovalForm.markAllAsTouched();
      return
    }
    this.openConfirmation('Confirm?', "Are you sure you want to proceed?", '1', '1')
  }


  submitcall() {
    try {
      this.isFormLoading = true;
      let poId = this.selectedItem.poid;
      let statusId = this.POApprovalForm.get(`statusId`)?.value;
      let remarks = this.POApprovalForm.get(`remark`)?.value;
      let data = []
      if (this.fileData.length) {
        data = this.fileData.map((obj: any) => {
          const { ['name']: removedKey, ...rest } = obj;
          return rest;
        })
      }
      let query = `files=${JSON.stringify(statusId == 10000 ? data : [])}|poId=${poId}|statusId=${statusId}|remark=${remarks}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId}`;
      this.userService.SubmitPostChangeStatusData(`uspPostPurchaseOrderApproval`, query).subscribe({
        next: (datacom: any) => {
          this.isFormLoading = false;
          try {
            if (!datacom) return;
            const resultarray = datacom.split('-');
            if (resultarray[1] === 'success') {
              this.getPendingData(false);
              this.selectedItem = null;
              this.message.add({
                severity: 'success',
                summary: 'Success',
                detail: this.postType === 'update' ? 'Data Updated Successfully.' : 'Data Saved Successfully.',
                life: 3000
              });
              this.fileData = []
              this.selectedItem = null
              this.isProccess = false
              this.getPendingData(true)
              this.getApprovedData(false)
              this.onDrawerHide();
              this.clearData();
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

  clearData() {
    this.POApprovalForm.reset();
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 100);
  }


  digitToWords(amount:any) {
    var words = new Array();
    words[0] = '';
    words[1] = 'One';
    words[2] = 'Two';
    words[3] = 'Three';
    words[4] = 'Four';
    words[5] = 'Five';
    words[6] = 'Six';
    words[7] = 'Seven';
    words[8] = 'Eight';
    words[9] = 'Nine';
    words[10] = 'Ten';
    words[11] = 'Eleven';
    words[12] = 'Twelve';
    words[13] = 'Thirteen';
    words[14] = 'Fourteen';
    words[15] = 'Fifteen';
    words[16] = 'Sixteen';
    words[17] = 'Seventeen';
    words[18] = 'Eighteen';
    words[19] = 'Nineteen';
    words[20] = 'Twenty';
    words[30] = 'Thirty';
    words[40] = 'Forty';
    words[50] = 'Fifty';
    words[60] = 'Sixty';
    words[70] = 'Seventy';
    words[80] = 'Eighty';
    words[90] = 'Ninety';
    amount = amount.toString();
    var atemp = amount.split(".");
    var number = atemp[0].split(",").join("");
    var n_length = number.length;
    var words_string = "";
    if (n_length <= 9) {
      var n_array: any = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0);
      var received_n_array = new Array();
      for (var i = 0; i < n_length; i++) {
        received_n_array[i] = number.substr(i, 1);
      }
      for (var i = 9 - n_length, j = 0; i < 9; i++, j++) {
        n_array[i] = received_n_array[j];
      }
      for (var i = 0, j = 1; i < 9; i++, j++) {
        if (i == 0 || i == 2 || i == 4 || i == 7) {
          if (n_array[i] == 1) {
            n_array[j] = 10 + parseInt(n_array[j]);
            n_array[i] = 0;
          }
        }
      }
      let value: any = "";
      for (var i = 0; i < 9; i++) {
        if (i == 0 || i == 2 || i == 4 || i == 7) {
          value = n_array[i] * 10;
        } else {
          value = n_array[i];
        }
        if (value != 0) {
          words_string += words[value] + " ";
        }
        if ((i == 1 && value != 0) || (i == 0 && value != 0 && n_array[i + 1] == 0)) {
          words_string += "Crores ";
        }
        if ((i == 3 && value != 0) || (i == 2 && value != 0 && n_array[i + 1] == 0)) {
          words_string += "Lakhs ";
        }
        if ((i == 5 && value != 0) || (i == 4 && value != 0 && n_array[i + 1] == 0)) {
          words_string += "Thousand ";
        }
        if (i == 6 && value != 0 && (n_array[i + 1] != 0 && n_array[i + 2] != 0)) {
          // words_string += "Hundred and ";
          words_string += "Hundred ";
        } else if (i == 6 && value != 0) {
          words_string += "Hundred ";
        }
      }
      words_string = words_string.split("  ").join(" ");
    }
    return words_string;
  }

  openprintModalData(id: any) {
    this.userService.getQuestionPaper(`uspGetPOPrintNew|poId=${id}`).subscribe(
      (data: any) => {
        if (Object.keys(data).length > 0 && data.table.length > 0) {
          var grandTotal = 0
          let decimalPart = 0;
          if (data.table4.length > 0) {
            grandTotal = data.table4[0]['grandTotal'] ? data.table4[0]['grandTotal'] : 0
            const decimalString = grandTotal.toString().split('.')[1];
            decimalPart = decimalString ? parseFloat(decimalString) : 0;
            data.table4.forEach((e:any) => {
              if (e['taxDetails'] && e['taxDetails'] != '') {
                e['taxDetails'] = JSON.parse(e['taxDetails'])
              }
            })
          }
          const html = `
            <table style="font-family: helvetica; max-width: 100%;" >
            <head><title>${data.table[0].header}</title></head>
        <tr>
          <td>
            <table style="width: 100%;">
              <tr>
                <td>
                  <table style="text-align: center;width: 100%;border: 2px solid #000000;" cellpadding="0" cellspacing="0">
                    <tr>
                    <td>
                    <table style="width: 100%;">
                    <tr>
                    ${data.table[0].poStatus.toLowerCase() == 'authorized' || data.table[0].poStatus.toLowerCase() == 'authorised' ?
              ` <td style="width: 50%;">
                      <p style="text-align: left;font-weight:600; font-size: 15px;  margin-bottom: 0px;">${data.table[0].poStatus}</p>
                    </td>`

              : `<td style="width: 50%;">
                      <p style="text-align:left;color:#ff3939;font-weight:600;font-size:15px;margin-bottom:0px;">${data.table[0].poStatus}</p>
                    </td>`
                     } 
                      <td style="width: 50%;">
                      <p style="text-align: right;margin-bottom:0px;font-size:14px;">${data.table[0].poStatus.toLowerCase() == 'pending' ? 'Draft' : ''}</p>
                       
                      </td>
                      </tr>
                      </table>
                      </tr>
                      <td>
                    </tr>
                    <tr>
                      <td style="width: 100%;">
                        <h2 style="font-size:22px;font-weight: bold;">${data.table[0].org}</h2>
                      </td>
                    </tr>
                    <tr>
                      <td style="width: 100%;">
                        <p style=" margin: 0; font-size: 14px;">${data.table[0].orgAddr}</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="width: 100%;">
                        <p style=" margin: 0; font-size: 15px;"><strong>Phone :${data.table[0].orgPhone}, Email :${data.table[0].orgEmail}</strong></p>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <h2 style="font-size: 21px; max-width: 500px; margin: auto; margin-top: 5px; margin-bottom: 5px; padding: 10px; border: 1px solid #000000; box-shadow: 5px 5px 5px #000000; text-align: center;">${data.table[0].header}<br>
                        <span style="font-size: 14px;">${data.table[0].formNo}</span></h2>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td>
            <table style="width: 100%;">
              <tr>
                <td>
                  <table class="table" style="width: 100%; border: 2px solid;font-size:13px;  margin-bottom: 0;">
                    <tbody>
                      <tr>
                        <td width="60%">
                          <div>
                            <p class="m-0">To,</p>
                            <p class="pl-4 m-0"><strong>${data.table[0].vendor}</strong> <br/> <br/>${data.table[0].address}</p>
                          </div>
                          <table class="m-0" style="width: 100%; border: 0;">
                            <tbody>
                              <tr>
                                <td style="width: 35%;padding-left:0">Contact Person</td>
                                <td style="width: 65%;">: <strong class="ml-3">${data.table[0].contactPerson}</strong></td>
                              </tr>
                              <tr>
                                <td style="width: 35%;padding-left:0">Email</td>
                                <td style="width: 65%;">: <strong class="ml-3">${data.table[0].email}</strong></td>
                              </tr>
                              <tr>
                                <td style="width: 35%;padding-left:0">Phone</td>
                                <td style="width: 65%;">: <strong class="ml-3">${data.table[0].phone}</strong></td>
                              </tr>
                              <!--<tr>
                                <td style="width: 35%;padding-left:0">Fax</td>
                                <td style="width: 65%;">: <strong class="ml-3">${data.table[0].fax}</strong></td>
                              </tr>-->
                              <tr>
                                <td style="width: 35%;padding-left:0">Website</td>
                                <td style="width: 65%;">: <strong class="ml-3">${data.table[0].website}</strong></td>
                              </tr>
                              <tr>
                                <td style="width: 35%;padding-left:0">GST No.</td>
                                <td style="width: 65%;">: <strong class="ml-3">${data.table[0].gst}</strong></td>
                              </tr>
                              
                            </tbody>
                          </table>
                        </td>
                        <td width="40%" style="border-left: 2px solid #333333; padding:0px;vertical-align: top;">
                          <table class="m-0" style="width: 100%; border: 0;margin:5px">
                            <tbody>
                              <tr>
                                <td style="width: 40%;">Location</td>
                                <td style="width: 60%;">: <strong class="ml-3">${data.table[0].district}</strong></td>
                              </tr>
                              <tr>
                                <td style="width: 40%;">PO. No.</td>
                                <td style="width: 60%;">: <strong class="ml-3">${data.table[0].poNumber}</strong></td>
                              </tr>
                              <tr>
                                <td style="width: 40%;">PO. Date</td>
                                <td style="width: 60%;">: <strong class="ml-3">${data.table[0].poDate}</strong></td>
                              </tr>
                              <tr>
                                <td style="width: 35%;">Quote No.</td>
                                <td style="width: 65%;">: <strong class="ml-3">${data.table[0].offerNo}</strong></td>
                              </tr>
                              <tr>
                                <td style="width: 35%;">Quote Date</td>
                                <td style="width: 65%;">: <strong class="ml-3">${data.table[0].offerDate}</strong></td>
                              </tr>
                              <tr>
                                <td style="width: 35%;">Source Document</td>
                                <td style="width: 65%;">: <strong class="ml-3">${data.table[0].sourceDocument}</strong></td>
                              </tr>
                            </tbody>
                          </table>
                          <table class="m-0" style="width: 100%;border-top: 2px solid;">
                            <tbody>
                              <tr>
                                <td style="padding: 0;">
                                <table class="m-0" style="width: 100%;margin:5px">
                                <tbody>
                                  <tr>
                                    <td style="width: 40%;">Dept.</td>
                                    <td style="width: 60%;">: <strong class="ml-3">${data.table[0].department}</strong></td>
                                  </tr>
                                  <!--<tr>
                                    <td style="width: 40%;">Category</td>
                                    <td style="width: 60%;">: <strong class="ml-3">${data.table[0].department}</strong></td>
                                  </tr>
                                  <tr>
                                    <td style="width: 40%;">Sub-category</td>
                                    <td style="width: 60%;">: <strong class="ml-3">${data.table[0].department}</strong></td>
                                  </tr>-->
                                </tbody>
                              </table>
                                
                                </td>
                              </tr>
                            
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!--<tr>
          <td>
            <table style="width: 100%;">
              <tr>
                <td>
                  <table class="table border-0 table-borderless" style="width: 100%; border: 2px solid;">
                    <tbody>
                      <tr>
                        <td style="padding: 10px;">Please supply the materials conforming to the technical specifications and terms and conditions, as listed below :</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>-->
        <tr>
          <td>
            <table style="width: 100%;">
              <tr>
                <td>
                  <table class="table table-bordered" style="margin: 0; width: 100%;" cellpadding="3" cellspacing="0" border="1" bordercolor="#000000">
                    <thead>
                      <tr>
                        <th rowspan="2" style="font-size:14px;">SI<br/>NO.</th>
                        <th rowspan="2" style="font-size:14px;">Item Description</th>
                        <th rowspan="2" style="font-size:14px; text-align:center">UOM</th>
                        <th colspan="2" style="font-size:14px; text-align:center">Delivery</th>
                        <th rowspan="2" style="font-size:14px; text-align:center">Unit Price(${data.table[0].currencyIcon})</th>
                        <th rowspan="2" style="font-size:14px; text-align:center">Tax %</th>
                        <th rowspan="2" style="font-size:14px;">Amount in  ${data.table[0].currency}(${data.table[0].currencyIcon})  </th>
                      </tr>
                      <tr>
                        <th style="text-align:center;font-size:14px;">Qty</th>
                        <th style="text-align:center;font-size:14px;">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                    ${data.table4.map((eldata:any, index:any) => `
                    <tr style="border: 1px solid">
                      <td style="border: 1px solid !important; text-align:center;font-size:14px;">${index + 1}</td>
                      <td style="border: 1px solid !important;text-align:left;max-width: 300px;font-size:14px;">
                      ${eldata.itemDesc}
                      ${eldata.techSpec ?
                ` <br>Tech Spec.  ${eldata.techSpec}`

                : ''}
                      </td>
                      <td style="border: 1px solid !important;text-align:center;font-size:14px;">${eldata.uom}</td>
                      <td style="border: 1px solid !important;text-align:center;font-size:14px;">${eldata.quantityPurchased}</td>
                      <td style="border: 1px solid !important;text-align:center;font-size:14px;">${eldata.podate}</td>
                      <td style="border: 1px solid !important;text-align:center;font-size:14px;">${eldata.rate}</td>
                      <td style="border: 1px solid !important;text-align:center;font-size:14px;">
                      ${eldata.taxDetails != '' ?
                `<table style="width: 100%; margin: 0;">
                      <tbody>
                        ${eldata.taxDetails.map((eldata:any, index:any) => `
                          <tr>
                            <td style="padding: 0;font-size:14px;">${eldata['GST']}</td>
                            <td style="font-size:14px;">${eldata.optionId == 'Exclusive' ? `(${eldata.disPer > 0 ? `Dis.${eldata.disPer}%,` : ''}Exc.)` : `(${eldata.disPer > 0 ? `Dis.${eldata.disPer}%,` : ''}Inc.)`}</td>
                            <td style="padding: 0;text-align: right;font-size:14px;">${eldata.taxamt > 0 ? eldata.taxamt : ''}</td>
                        </tr>
                      `).join('')}
    
                  
                      </tbody>
                    </table>`

                : ''}
                      </td>
                      <td style="border: 1px solid !important;text-align:right;font-size:14px;">${eldata.totalAmount}</td>
                  </tr>
                            `).join('')}
                            
                            
                    </tbody>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td>
            <table style="width: 100%;">
              <tr>
                <td>
                  <table style="width: 100%;border: 2px solid;">
                    <tr>
                      <td style="text-align: right; padding-top: 5px; padding-bottom: 5px; font-size:14px;"><strong class="mr-3"><span>Basic Amount:</span> ${data.table4[0].basicSum.toFixed(2)}</strong></td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td>
            <table style="width: 100%;">
              <tr>
                <td>
                  <table style="margin: 0; width: 100%; border: 2px solid;">
                    <tbody>
                      <tr>
                        <td style="padding: 10px;vertical-align: top; font-size: 14px;" width="50%;">
                          <strong>Terms & Condition :</strong>
                          ${data.table3.length > 0 ?
                          `<table style="width: 100%;">
                            <tbody>
                            ${data.table3.map((eldata:any, index:any) => `
                                <tr>
                                  <td style="width: 50%;vertical-align: top;padding-left:0">${eldata.termsandcond} :</td>
                                  <td style="width: 50%;">${eldata.remarks}</td>
                                </tr>
                                `).join('')
                              }
                                              
                            </tbody>
                          </table>`
                         : ''}  
                        </td>
                        <td style="border-left: 2px solid #000000;vertical-align: top; font-size: 14px;" width="50%">
                      
                          <table style="width: 100%; margin: 0;">
                            <tbody>
                            ${data.table[0]['poType'] == "Order Wise" ?
                             ` ${data.table5.map((eldata:any, index:any) => `
                                <tr>
                                  <td style="padding: 0;">${eldata.gst}</td>
                                  <td>${eldata.optionId == 'Exclusive' ? `(${eldata.discount > 0 ? `Dis.${eldata.discount}%,` : ''}Exc.)` : `(${eldata.discount > 0 ? `Dis.${eldata.discount}%,` : ''}Inc.)`}</td>
                                  <td style=""></td>
                                  <td style="padding: 0;text-align: right;">${eldata.taxAmt.toFixed(2)}</td>
                              </tr>
                            <!-- <tr>
                              <td style="padding: 0;">Discount(%):</td>
                              <td style="">${eldata.exc}</td>
                              <td style="">${eldata.discount}%</td>
                              <td style="padding: 0;text-align: right;"></td>
                              </tr>-->
                            `).join('')}`
                          : ''}  
                        ${data.table1.map((eldata:any, index:any) => `
                            <tr>
                            <td colspan='3' style="padding: 5px 0px;">${eldata.chargesType} (In ${eldata.nature})
                            ${eldata.remarks != '' ? `<br>(${eldata.remarks})
                          ` : ''}
                            </td>
                      
                            <td style="text-align: right;padding: 5px 0px;  display: block;">${eldata['nature'] == 'Percentage' ? eldata.value + '%' : eldata.value.toFixed(2)}</td>
                          </tr>
                          
                        `).join('')}
                         ${data.table[0]?.exclusiveAmount ?
                          `<tr>
                             <td colspan='3' style="padding: 5px 0px;">Exclusive Amount</td>
                      
                             <td style="text-align: right;padding: 5px 0px;  display: block;">${data.table[0].exclusiveAmount}</td>
                          </tr>`
                          :
                           ''}
                            </tbody>
                          </table>
                        
                        </td>
                      </tr>
                      <tr>
                      <td colspan="2" style="padding:0px">
                      <table class="table border-0 table-borderless" style="width: 100%;border-top: 2px solid;margin-bottom: 0;">
                        <tbody>
                          <tr>
                            <td width="70%" style="font-size:14px;">
                            <span>Amount (In Words) :</span>
                            <strong>${this.digitToWords(grandTotal)}${decimalPart > 0 ? ' and ' + this.digitToWords(decimalPart) : ''}${grandTotal != 0 ? 'Only' : ''}</strong>
                            
                            </td>
                            <td style="text-align: right;font-size:14px;" width="30%">
                            <span>Total Amount :</span>
                            <strong>${data.table[0].currencyIcon}${grandTotal.toFixed(2)}</strong>
                        
                            </td>
                          </tr>
                          <tr style="border-top: 2px solid;">
                          <td style="width="100%;" colspan="2" style="font-size:14px;">
                                <p style="margin:0; font-size:14px;"><strong>Remark :</strong> ${data.table[0].remarks}</p>
                                </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td>
            <table style="width: 100%;">
              <tr>
                <td>
                  <table class="table border-0 table-borderless" style="margin: 0; width: 100%;border: 2px solid;font-size:13px;">
                    <tbody>
                      <tr>
                        <td style="vertical-align: top;" width="40%">
                        <div style="padding: 5px;">
                          <div style="margin-bottom:10px">
                            <strong>Dispatch Instruction</strong>
                          </div>
                          <div class="dispatchIstruction">
                          <div>
                            <strong> Bill to be address :</strong>
                          </div>
                          <div style="margin-bottom:5px">
                            <strong>${data.table[0].org}</strong>
                          </div>
                          <div style="margin-bottom:5px">
                          <span>${data.table[0].orgAddr}</span>
                          </div>
                        </div>
                          <div class="dispatchIstruction" style="margin-bottom:10px">
                            <div >
                              <strong>Ship to address :</strong>
                            </div>
                            <div style="margin-bottom:5px">
                              <strong>${data.table[0].dispatch}</strong>
                            </div>
                            <div>
                            <span>${data.table[0].dispatchAddr}</span>
                            </div>
                          </div>
                        
                          </div>
                        </td>
                        <td style="border-left: 2px solid #000000; vertical-align: top;" width="30%">
                          <table style="width: 100%;margin: 0;font-size:13px; padding:5px">
                            <tbody>
                              <tr>
                                <td style="">CIN No.</td>
                                <td>:<td>
                                <td style=""><strong>${data.table[0].orgCIN}</strong></td>
                              </tr>
                              <tr>
                                <td style="">GST No.</td>
                                <td>:<td>
                                <td style=""><strong>${data.table[0].orgGST}</strong></td>
                              </tr>
                              <tr>
                                <td style="">PAN No. </td>
                                <td>:<td>
                                <td style=""><strong>${data.table[0].orgPAN}</strong></td>
                              </tr>
                              <tr>
                                <td style="">Bank (Supplier)</td>
                                <td>:<td>
                                <td style=""><strong>${data.table[0].supplierAccName}</strong></td>
                              </tr>
                              <tr>
                                <td style="">Acc No.</td>
                                <td>:<td>
                                <td style=""><strong>${data.table[0].acc}</strong></td>
                              </tr>
                              <tr>
                                <td style="">IFSC</td>
                                <td>:<td>
                                <td style=""><strong>${data.table[0].ifsc}</strong></td>
                              </tr>
                              <tr>
                                <td style="">Bank</td>
                                <td>:<td>
                                <td style=""><strong>${data.table[0].bankName}</strong></td>
                              </tr>
                              <tr>
                                <td style="">Branch</td>
                                <td>:<td>
                                <td style=""><strong>${data.table[0].branchName}</strong></td>
                              </tr>
                              <tr>
                                <td style="">Address</td>
                                <td>:<td>
                                <td style=""><strong>${data.table[0].address}</strong></td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                        <td style="border-left: 2px solid #000000; vertical-align: top;" width="30%">
                          <table style="width: 100%;margin: 0; padding:5px">
                            <tbody>
                              <tr>
                                <td style="">
                                  <div class="termsList">
                                  <strong>Terms of conditions:</strong>
                                    <ul style="padding-left: 10px;">
                                      <li>All Disputes are subject to DELHI Jurisdiction only.</li>
                                      <li>Kindly revert within 24 hours for any observations on P.O. otherwise it will be deemed acceptable inToto.</li>
                                      <li>Goods rejected during inspection will not be paid for & all the same will be returned at your cost and risk.</li>
                                      <li>A Penality of 20% on Total Amount of P.O. will be levied for late or partial Delivery of Goods. * Payment with in 90 days from the date of delivery.</li>
                                      <li>All correspondence through email only.</li>
                                    </ul>
                                  </div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td>
            <table style="width: 100%;">
              <tr>
                <td>
                  <table class="table border-0 table-borderless margin: 0;" style="width: 100%;border: 2px solid;padding-bottom: 5px;">
                    <tbody>
                    <tr>
                      <td style="text-align: left;" width="100%"><br>
                      <strong style="margin-left:15px; font-size:15px;">${data.table[0].org}</strong><br>
                      <br></td>
                    </tr>
                      <tr>
                        <td>
                          <table style="width: 100%;">
                            <tbody>
                              <tr>
                                <td style="text-align: center;vertical-align: top;" width="25%"><span style="font-size:14px;">Prepared By<br>${data.table[0].createdby ? data.table[0].createdby : ''}</span></td>
                                <td style="text-align: center;vertical-align: top;" width="25%"><span style="font-size:14px;">Checked By<br></span></td>
                                <td style="text-align: center;vertical-align: top;" width="25%"><span style="font-size:14px;">Authorised By<br>${data.table[0].approvedBy ? data.table[0].approvedBy : ''}</span></td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
          `;
          this.printContent = this.sanitizer.bypassSecurityTrustHtml(html);
          setTimeout(() => {
            this.printDialog = true;
          }, 0);

        } else {
          this.printContent = this.sanitizer.bypassSecurityTrustHtml(
            `<h2 class="text-center">Data Not Found.</h2>`
          );
          setTimeout(() => {
            this.printDialog = true;
          }, 0);

        }

      }
    );

  }

  print(): void {
    if (!this.poPrintWrapper) {
      console.error('Printable element not found');
      return;
    }
    const printContents = this.poPrintWrapper.nativeElement.innerHTML;
    const popupWin = window.open('', '_blank', 'top=0,left=0,height=800,width=900');
    popupWin!.document.open();
    popupWin!.document.write(`
    <html>
      <head>
        <title>Print</title>
      </head>
      <body onload="window.print();" style="font-family: Arial, sans-serif !important;">
        ${printContents}
      </body>
    </html>
  `);
    popupWin!.document.close();
  }  

}
