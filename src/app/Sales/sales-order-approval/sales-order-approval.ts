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
  selector: 'app-sales-order-approval',
  standalone: true,
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
  templateUrl: './sales-order-approval.html',
  styleUrl: './sales-order-approval.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SalesOrderApproval implements OnInit, OnDestroy {

  isLoading = true;
  data: any[] = [];
  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true },
    { key: 'soNumber', header: 'SO Number', isVisible: true },
    { key: 'customerName', header: 'Customer', isVisible: true },
    { key: 'contactPerson', header: 'Contact Person', isVisible: true },
    { key: 'deliveryDate', header: 'Delivery Date', isVisible: true },
    { key: 'status', header: 'Status', isVisible: true },
    { key: 'warehouse', header: 'Warehouse', isVisible: true },
    { key: 'grandTotal', header: 'Grand Total', isVisible: true }
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
    { label: 'Pending', value: 'PENDING', icon: 'pi pi-clock', color: 'orange' },
    { label: 'Approved', value: 'APPROVED', icon: 'pi pi-check-circle', color: 'green' }
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
      { label: 'Sales Order Approval', disabled: true }
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

  const query = `action=${this.selectedAction}|searchText=${this.searchText}|pageIndex=${this.pageNo}|size=${this.pageSize}|districtId=${districtId}|appUserId=${userId}|appUserRole=${roleId}`;

  this.userService.getQuestionPaper(`uspGetSalesOrderApproval|${query}`).subscribe({
    next: (res: any) => {
      try {
        const table1 = res?.table1 || [];

        this.data = table1.map((item: any) => {
          const customerName =item['vendor Name'] ??item['vendorName'] ??  item.vendor?.name ??  item.vendor ??  '';
          const createdBy = item['created By'] ?? item.createdBy ?? '';
          const createdDate = item['created Date'] ?? item.createdDate ?? '';

          return {
            soNumber: item.refNo ?? '',
            soId: item.soId ?? null,
            customerName,
            contactPerson: createdBy,
            deliveryDate: createdDate,
            status: item.status ?? '',
            grandTotal: Number(item.totalAmt ?? 0) || 0,
            originalData: item
          };
        });

        this.totalCount = Number(res?.table?.[0]?.totalCnt ?? this.data.length);

        if (Array.isArray(res?.table3)) {
          this.statusData = res.table3.map((status: any) => ({
            drpValue: status.drpValue,
            drpOption: status.drpOption
          }));
        } else {
          this.statusData = [];
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
        detail: 'Failed to load sales orders.'
      });
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  });
}



// Helper method to extract warehouse from itemDetail JSON string
private getWarehouseFromItemDetail(itemDetail: string): string {
  try {
    if (!itemDetail) return 'N/A';
    
    const items = JSON.parse(itemDetail);
    if (items && items.length > 0) {
      return items[0].warehouse || 'N/A';
    }
    return 'N/A';
  } catch (error) {
    console.error('Error parsing itemDetail:', error);
    return 'N/A';
  }
}

  onChangeTabs(status: string): void {
    this.selectedAction = status;
    this.pageNo = 1;
    this.getTableData(true);
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
    this.getTableData(true);
  }

  openApprovalDialog(item: any): void {
    this.selectedItem = item;
    this.visible = true;
    this.uploadedFiles = [];
    this.selectedFile = null;
    
    // Pre-select status if already approved
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
        reader.readAsDataURL(file); // use local `file`
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
    const folderName = 'SOApproval';

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

    let query = `soId=${this.selectedItem.soId}|statusId=${formData.statusId}|appUserId=${userId}|appUserRole=${roleId}|remark=${formData.remarks}`;

    this.userService.SubmitPostChangeStatusData('uspPostSalesOrderApproval', query).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        
        if (response) {
          const resultArray = response.split("-");
          
          if (resultArray[1] === "success") {
            this.message.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Approval submitted successfully!'
            });
            
            this.closeDialog();
            this.onChangeTabs('APPROVED');
          } else if (resultArray[0] === "2") {
            this.message.add({
              severity: 'warn',
              summary: 'Warning',
              detail: resultArray[1]
            });
          } else {
            this.message.add({
              severity: 'error',
              summary: 'Error',
              detail: response
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