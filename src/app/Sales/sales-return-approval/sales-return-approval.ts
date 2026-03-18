import { Component, ChangeDetectorRef, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { TableTemplate, TableColumn } from '../../table-template/table-template';
import { ButtonModule } from 'primeng/button';
import { Popover } from 'primeng/popover';
import { Tooltip } from "primeng/tooltip";
import { Dialog } from 'primeng/dialog';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { SelectButtonModule } from 'primeng/selectbutton';
import { CardModule } from 'primeng/card';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Toast } from 'primeng/toast';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { TabsModule } from 'primeng/tabs';
import { FileUploadModule } from 'primeng/fileupload';
import { UserService } from '../../shared/user-service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { ConfigService } from '../../shared/config.service';

interface ApprovalFile {
  attachFile: string;
  documentName: string;
  name: string;
}

interface StatusOption {
  drpValue: any;
  drpOption: string;
}

@Component({
  selector: 'app-sales-return-approval',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableTemplate,
    ButtonModule,
    Popover,
    Tooltip,
    Dialog,
    ConfirmDialog,
    SelectModule,
    InputTextModule,
    SelectButtonModule,
    CardModule,
    ProgressSpinner,
    Toast,
    BreadcrumbModule,
    TabsModule,
    FileUploadModule
  ],
  providers: [ConfirmationService, MessageService, DatePipe],
  templateUrl: './sales-return-approval.html',
  styleUrl: './sales-return-approval.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SalesReturnApproval implements OnInit, OnDestroy {
  isLoading = true;
  data: any[] = [];
  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true },
    { key: 'returnNo', header: 'Return No', isVisible: true },
    { key: 'soNo', header: 'SO Number', isVisible: true },
    { key: 'customer', header: 'Customer', isVisible: true },
    { key: 'totalAmount', header: 'Total Amount', isVisible: true },
    { key: 'status', header: 'Status', isVisible: true }
  ];

  // Pagination
  pageNo = 1;
  pageSize = 10;
  searchText = '';
  totalCount = 0;
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  searchTimeout: any;
  debounceTime = 500;

  selectedAction: string = 'PENDING';
  statusTabs = [
    { label: 'Sales order Return', value: 'PENDING', icon: 'pi pi-clock', color: 'green' },
  
  ];

  // Dialog Configuration
  visible = false;
  approvalForm: FormGroup;
  selectedItem: any = null;
  statusData: StatusOption[] = [];
  
  // File Upload
  uploadedFiles: ApprovalFile[] = [];
  selectedFile: File | null = null;
  filePreviewUrl: string | null = null;
  isUploadingFile = false;
  showUploadSection = false;

  // Breadcrumb
  breadcrumbItems: any[] = [];
  home: any = { icon: 'pi pi-home', routerLink: '/' };

  // Menu items
  param: string | null = null;
  FormName: any;
  FormValue: any;
  menulabel: any;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private message: MessageService,
    private cdr: ChangeDetectorRef,
    private configService: ConfigService,
    private datePipe: DatePipe
  ) {
    this.approvalForm = this.createApprovalForm();
  }

  ngOnInit(): void {
    this.initializeComponent();
    this.getTableData(true);
  }

  ngOnDestroy(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }

  private initializeComponent(): void {
    this.param = sessionStorage.getItem("menuItem");
    if (this.param) {
      let paramjs = JSON.parse(this.param);
      this.FormName = paramjs.formName;
      this.FormValue = paramjs.formValue;
      this.menulabel = paramjs.menu;
    }

    this.breadcrumbItems = [
      { label: this.menulabel },
      { label: 'Sales Return Approval', disabled: true }
    ];

    this.cdr.detectChanges();
  }

  private createApprovalForm(): FormGroup {
    return this.fb.group({
      statusId: [null, [Validators.required]],
      remarks: ['', [Validators.required, Validators.minLength(5)]],
      documentName: ['']
    });
  }

  getTableData(isTrue: boolean): void {
    if (isTrue) {
      this.isLoading = true;
      this.cdr.detectChanges();
    } else {
      this.pageNo = 1;
    }

    const currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
    const roleId = currentRole?.roleId || '';
    const userId = sessionStorage.getItem('userId') || '';
    const districtId = sessionStorage.getItem('District') || '';

    const query = `searchText=${this.searchText}|pageIndex=${this.pageNo}|size=${this.pageSize}|districtId=${districtId}|appUserId=${userId}|appUserRole=${roleId}`;

    this.userService.getQuestionPaper(`uspGetSalesOrdeReurnApproved|${query}`).subscribe({
      next: (res: any) => {
        try {
          const table1 = res?.table1 || [];

          this.data = table1.map((item: any) => {
            return {
              returnId: item.id,
              returnNo: item.returnNo || '',
              soNo: item.soNo || '',
              customer: item.customer || '',
              totalAmount: Number(item.totalAmount || 0),
              status: item.status || '',
              originalData: item
            };
          });

          this.totalCount = Number(res?.table2?.[0]?.totalCnt || this.data.length);
            {
            this.statusData = [
              { drpOption: 'Approved', drpValue: 10001 },
              { drpOption: 'Cancelled', drpValue: 10007 }
            ];
          }

          setTimeout(() => {
            this.isLoading = false;
            this.cdr.detectChanges();
          }, 1000);
        } catch (error) {
          console.error('Error processing data:', error);
          this.data = [];
          this.totalCount = 0;
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      },
      error: (err: any) => {
        console.error('Error loading data:', err);
        this.message.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load sales returns.'
        });
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }



  onSearchChange(search: string): void {
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

  onPageChange(newPage: number): void {
    this.pageNo = newPage;
    this.getTableData(true);
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize = newSize;
    this.pageNo = 1;
    this.getTableData(true);
  }

  onSortChange(event: { column: string, direction: 'asc' | 'desc' }): void {
    this.sortColumn = event.column;
    this.sortDirection = event.direction;
    // Note: Sorting should be handled in the backend API
    this.getTableData(true);
  }

  openApprovalDialog(item: any): void {
    this.selectedItem = item;
    this.visible = true;
    this.uploadedFiles = [];
    this.selectedFile = null;

    if (item.status?.toLowerCase() === 'approved') {
      this.showUploadSection = true;
      const approvedStatus = this.statusData.find(s => s.drpOption === 'Approved');
      if (approvedStatus) {
        this.approvalForm.patchValue({ statusId: approvedStatus.drpValue });
      }
    } else {
      this.showUploadSection = false;
    }

    this.cdr.detectChanges();
  }

  onStatusChange(event: any): void {
    const selectedStatus = this.statusData.find(s => s.drpValue === event.value);
    this.showUploadSection = selectedStatus?.drpOption === 'Approved';
    this.cdr.detectChanges();
  }

  onFileSelect(event: any): void {
    if (event.files && event.files.length > 0) {
      const file: File = event.files[0];
      this.selectedFile = file;
      
      if (this.isImageFile(file.name)) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.filePreviewUrl = e.target.result;
          this.cdr.detectChanges();
        };
        reader.readAsDataURL(file);
      }
      
      this.cdr.detectChanges();
    }
  }

  uploadFile(): void {
    const documentName = this.approvalForm.get('documentName')?.value;
    
    if (!documentName) {
      this.message.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please enter document name.'
      });
      return;
    }

    if (!this.selectedFile) {
      this.message.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select a file.'
      });
      return;
    }

    if (this.uploadedFiles.length >= 3) {
      this.message.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Maximum of 3 files can be uploaded.'
      });
      return;
    }

    this.isUploadingFile = true;
    const filesArray: File[] = [this.selectedFile];
    const folderName = 'SOReturnApproval';

    this.userService.MastrtfileuploadNew(filesArray, folderName).subscribe({
      next: (response: any) => {
        this.isUploadingFile = false;
        const resultArray = response.split("-");

        if (resultArray[0] == "1") {
          const uploadedFile: ApprovalFile = {
            attachFile: resultArray[1],
            documentName: documentName,
            name: this.selectedFile!.name
          };

          this.uploadedFiles.push(uploadedFile);
          this.selectedFile = null;
          this.filePreviewUrl = null;
          this.approvalForm.patchValue({ documentName: '' });

          this.message.add({
            severity: 'success',
            summary: 'Success',
            detail: 'File uploaded successfully!'
          });
        } else {
          this.message.add({
            severity: 'error',
            summary: 'Error',
            detail: resultArray[1] || 'File upload failed'
          });
        }
        
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.isUploadingFile = false;
        console.error('File upload error:', err);
        
        this.message.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to upload file.'
        });
        
        this.cdr.detectChanges();
      }
    });
  }

  removeFile(index: number): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to remove this file?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.uploadedFiles.splice(index, 1);
        this.cdr.detectChanges();
      }
    });
  }

  onSubmitApproval(): void {
    if (this.approvalForm.invalid) {
      this.approvalForm.markAllAsTouched();
      this.message.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill all required fields.'
      });
      return;
    }

    const statusId = this.approvalForm.get('statusId')?.value;
    const selectedStatus = this.statusData.find(s => s.drpValue === statusId);

    // if (selectedStatus?.drpOption === 'Approved' && this.uploadedFiles.length === 0) {
    //   this.message.add({
    //     severity: 'error',
    //     summary: 'Validation Error',
    //     detail: 'Please upload at least 1 file for approval.'
    //   });
    //   return;
    // }

    this.confirmationService.confirm({
      message: 'Are you sure you want to proceed?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.submitApproval();
      }
    });
  }

private submitApproval(): void {
  this.isLoading = true;

  const formData = this.approvalForm.getRawValue();
  const currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
  const roleId = currentRole?.roleId || '';
  const userId = sessionStorage.getItem('userId') || '';

  let query = `returnId=${this.selectedItem.returnId}|statusId=${formData.statusId}|appUserId=${userId}|appUserRole=${roleId}|remark=${formData.remarks}`;

  this.userService.SubmitPostChangeStatusData('uspPostSoReturnApprove', query)
    .subscribe({
      next: (response: any) => {
        this.isLoading = false;

        if (!response) return;
        if (typeof response === 'string') {
          if (response.includes('-')) {
            const arr = response.split('-');
            if (arr[1] === 'success') {
              this.message.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Return approval submitted successfully!'
              });
              this.closeDialog();
              this.getTableData(true);
            }

            else if (arr[0] === '2') {
              this.message.add({
                severity: 'warn',
                summary: 'Warning',
                detail: arr[1] || response
              });
            }
            else {
              this.message.add({
                severity: 'warn',
                summary: 'Warning',
                detail: response
              });
            }

            this.cdr.detectChanges();
            return;
          }
        }

        if (typeof response === 'object') {

          if (response.RESULT === 1) {
            this.message.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Return approval submitted successfully!'
            });
            this.closeDialog();
            this.getTableData(true);
          }
          else if (response.RESULT === 2) {
            this.message.add({
              severity: 'warn',
              summary: 'Warning',
              detail: response.MSG || 'Operation failed.'
            });
          }
          else {
            this.message.add({
              severity: 'warn',
              summary: 'Warning',
              detail: response.ERRORMESSAGE || 'Unknown error occurred.'
            });
          }
        }

        this.cdr.detectChanges();
      },

      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        console.error('Submit error:', err);

        this.message.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to submit approval.'
        });

        this.cdr.detectChanges();
      }
    });
}


  closeDialog(): void {
    this.visible = false;
    this.selectedItem = null;
    this.uploadedFiles = [];
    this.selectedFile = null;
    this.filePreviewUrl = null;
    this.showUploadSection = false;
    this.approvalForm.reset();
    this.cdr.detectChanges();
  }

  getStatusSeverity(status: string): string {
    const statusLower = status?.toLowerCase();
    if (statusLower === 'approved') return 'success';
    if (statusLower === 'rejected') return 'danger';
    if (statusLower === 'pending') return 'warning';
    return 'info';
  }

  isImageFile(filename: string): boolean {
    if (!filename) return false;
    return /\.(jpeg|jpg|png|gif|bmp|svg|webp)$/i.test(filename);
  }

  getFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  normalizeImagePath(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    
    let normalizedPath = path.replace(/\\/g, '/');
    normalizedPath = normalizedPath.replace(/([^:]\/)\/+/g, '$1');
    return this.configService.baseUrl + normalizedPath;
  }

  isInvalid(field: string): boolean {
    const control = this.approvalForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}