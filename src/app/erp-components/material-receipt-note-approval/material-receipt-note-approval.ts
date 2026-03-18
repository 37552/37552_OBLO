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

@Component({
  selector: 'app-material-receipt-note-approval',
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
    ExcelService
  ],
  templateUrl: './material-receipt-note-approval.html',
  styleUrl: './material-receipt-note-approval.scss'
})
export class MaterialReceiptNoteApproval {
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
  selectedIndex: any[] = [];
  headerIcon: string = 'pi pi-plus';
  paramvaluedata: string = '';
  isFormLoading: boolean = false;
  data: any[] = [];
  currentDate = new Date();
  totalCount = 0;
  isDirect: boolean = false;
  statusData: any[] = [];
  itemDailog: boolean = false;
  warehouseStockDialog: boolean = false;
  selectedTable = ''
  selectedItem: any = []
  selectedRowDetails: any[] = [];
  searchValue: string = '';
  itemDetailsArray: any[] = [];
  formlable: string = '';
  modelHeading: string = ''
  recordViewData: any[] = [];
  recordHeaderViewData: any[] = [];
  printDialog: boolean = false;
  printContent: SafeHtml | string = '';
  MRNForm: FormGroup;
  fileData: any = [];
  showUploadFile: boolean = false;
  showFileUploadDialog = false;
  selectedUploadFile: File | null = null;
  uploadedFileUrl: string | null = null;
  isUploadingFile = false;

  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true, },
    { key: 'status', header: 'Status', isVisible: true, isSortable: false },
    { key: 'documentNo', header: 'Document No', isVisible: true, isSortable: false },
    { key: 'date', header: 'Date', isVisible: true, isSortable: false },
    { key: 'refNo', header: 'Request No', isVisible: true, isSortable: false },
    { key: 'division', header: 'Divison Name', isVisible: true, isSortable: false },
    { key: 'purchaseType', header: 'Item Type', isVisible: true, isSortable: false },
    { key: 'indent Type', header: 'Indent Type', isVisible: true, isSortable: false },
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
    private sanitizer: DomSanitizer) {

    this.MRNForm = fb.group({
      statusId: ['', [Validators.required]],
      documentId: ['', [Validators.required]],
      fileUploadControl: ['', [Validators.required]],
      remark: ['', [Validators.required]],
    })  

  }

  get f() {
    return this.MRNForm.controls;
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
    }, 0);
  }

  allowOnlyNumbers(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }


  isInvalid(controlName: string): boolean {
    const forms: FormGroup[] = [
      this.MRNForm
    ];

    for (let form of forms) {
      const control = form.get(controlName);
      if (control) {
        return !!(control.invalid && (control.dirty || control.touched));
      }
    }
    return false;
  }

  getTableData(isTrue: boolean) {
    try {
      if (isTrue) this.isLoading = true;
      else this.pageNo = 1;

      const userId = sessionStorage.getItem('userId') || '';
      const roleId = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
      const query = `searchText=${this.searchText}|pageIndex=${this.pageNo}|size=${this.pageSize}|appUserId=${userId}|appUserRole=${roleId}|districtId=${sessionStorage.getItem('District')}`;

      this.userService.getQuestionPaper(`uspGetMRNApproval|${query}`).subscribe({
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

  onChangeStatus() {
    if (this.MRNForm.get(`statusId`)?.value == 10000) {
      this.showUploadFile = true;
    }
    else {
      this.showUploadFile = false;
    }
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

  onDrawerHide() {
    document.body.style.overflow = 'visible';
    this.visible = false;
    this.isDirect = false;
    this.MRNForm.enable();
    this.MRNForm.reset();
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

  onSubmit() {
    if (this.MRNForm.invalid) {
      this.MRNForm.markAllAsTouched();
      return
    }
    this.openConfirmation('Confirm?', "Are you sure you want to proceed?", '1', '1')
  }


  submitcall() {
    try {
      this.isFormLoading = true;
      let statusId = this.MRNForm.get(`statusId`)?.value;
      let remarks = this.MRNForm.get(`remark`)?.value;
      let data = []
      if (this.fileData.length) {
        data = this.fileData.map((obj:any) => {
          const { ['name']: removedKey, ...rest } = obj;
          return rest;
        })
      }
      let query = `files=${JSON.stringify(statusId == 10000 ? data : [])}|mrnId=${this.selectedItem.mrnId}|statusId=${statusId}|remark=${remarks}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId}`;
      this.userService.SubmitPostChangeStatusData(`uspPostMRNApproval`, query).subscribe({
        next: (datacom: any) => {
          this.isFormLoading = false;
          try {
            if (!datacom) return;
            const resultarray = datacom.split('-');
            if (resultarray[1] === 'success') {
              this.getTableData(false);
              this.selectedItem = null;
              this.message.add({
                severity: 'success',
                summary: 'Success',
                detail: this.postType === 'update' ? 'Data Updated Successfully.' : 'Data Saved Successfully.',
                life: 3000
              });
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
    this.MRNForm.reset();
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 100);
  }

  exportAsXLSXCustom(): void {
    let query = `uspMRNExcelData|appUserId=${sessionStorage.getItem('userId')}|districtId=${sessionStorage.getItem("District")}`
    this.userService.LoadReport(query, this.FormName)
      .subscribe((data: any) => {
        if (data['table'] && data['table'].length > 0)
          this.excelService.exportAsExcelFile(data['table'], this.FormName.toString());
      },
        (err: HttpErrorResponse) => {
          if (err.status == 403) {
            this.Customvalidation.loginroute(err.status);
          }
        }
      );
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
              const documentName = this.MRNForm.get('documentId')?.value || '';
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
              this.MRNForm.get('documentId')?.clearValidators();
              this.MRNForm.get('documentId')?.updateValueAndValidity();

              this.MRNForm.get('fileUploadControl')?.clearValidators();
              this.MRNForm.get('fileUploadControl')?.updateValueAndValidity();

              // Clear UI fields only
              this.MRNForm.patchValue({
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
      this.MRNForm.get('documentId')?.setValidators([Validators.required]);
      this.MRNForm.get('fileUploadControl')?.setValidators([Validators.required]);

      this.MRNForm.get('documentId')?.updateValueAndValidity();
      this.MRNForm.get('fileUploadControl')?.updateValueAndValidity();
    }
  }


  removeFileUpload() {
    this.uploadedFileUrl = '';
    this.MRNForm.patchValue({
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


  openprintModalData(id: any) {
    this.userService.getQuestionPaper(`uspGetMaterialReceiptNotePrint|materialReceiptNoteId=${id}`).subscribe(
      (data: any) => {

        var grandTotal = 0
        if (data.table1.length > 0) {
          data.table1.filter((e:any) => {
            grandTotal = grandTotal + Number(e['total Value'])
          })
        }

          if (Object.keys(data).length > 0 && data.table.length > 0) {
            const html = `
           <div style="border:1px solid black; max-width:100vw;padding:12px">

            <p style="text-align: left;font-weight: 600; font-size: 16px; margin-bottom: 0px;">${data.table[0].approvedStatus}</p>

            <table style="width:100%;margin-top: 1rem;align-items:center">
            <tr style="align-items:center;">
            <td style="width: 100%;text-align:center">
              <h2 style="font-size: 22px;">${data.table[0].orgName}</h2>
            </td>
          </tr>

          <tr>
            <td style="width: 100%;text-align:center">
              <h2 style="font-size: 18px;">${data.table[0].orgAddress}, <br/>Email: ${data.table[0].orgEmail}</h2>
            </td>
          </tr>

            <tr style="border:1px solid black;width:100%">
              <td>
                <h1 style="font-size: 22px; max-width: 400px; margin: auto; margin-top: 5px; margin-bottom: 5px; 
                padding: 10px; border: 1px solid #000000; box-shadow: 5px 5px 5px #000000; text-align: center;">${data.table[0].header}
                </h1>
              </td>
            </tr>
        </table>

        <table class="table" style="width: 100%; border: 1px solid black;margin-top:1rem;border-collapse:collapse;">
        <tbody>
       <tr>
        <td style="border-bottom: 1px solid black;">
        <div style="margin:5px">
          GRN NO: &nbsp;&nbsp;&nbsp;${data.table[0]['grn No.']}
        </div>
        </td>
        <td style="border-bottom: 1px solid black;">
        <div style="margin:5px">
          GRN DATE: &nbsp;&nbsp;&nbsp;${data.table[0]['grn Date']}
        </div>
        </td>
        </tr>
          <tr>
            <td width="50%" style="vertical-align: top;">
              <div style="margin:5px">
                <p class="m-0">From,</p>
                <p class="pl-4 m-0"><strong>${data.table[0].customerName}</strong> <br/>${data.table[0].custAddress}</p>
              
              <table class="m-0" style="width: 100%; border: 0;">
                <tbody>
                  <tr>
                    <td style="width: 35%;padding-left:0">Email</td>
                    <td style="width: 65%;">: <strong class="ml-3">${data.table[0].custEmail}</strong></td>
                  </tr>
                  <tr>
                    <td style="width: 35%;padding-left:0">Phone</td>
                    <td style="width: 65%;">: <strong class="ml-3">${data.table[0].custPhone}</strong></td>
                  </tr>                        
                </tbody>
              </table>
              </div>
            </td>
            <td width="50%" style="border-left: 1px solid #333333; padding:0px;vertical-align: top;">
              <table class="m-0" style="width: 100%; border: 0;margin:5px">
                <tbody>
                  <tr>
                    <td style="width: 40%;">GATE ENTRY NO.</td>
                    <td style="width: 60%;">: <strong class="ml-3">${data.table[0]['gate ENTRY NO.']}</strong></td>
                  </tr>
                  <tr>
                    <td style="width: 40%;">BILL NO.</td>
                    <td style="width: 60%;">: <strong class="ml-3">${data.table[0]['bill NO.']} (${data.table[0]['bill DATE']})</strong></td>
                  </tr>
                  <tr>
                    <td style="width: 40%;">CHALLAN NO.</td>
                    <td style="width: 60%;">: <strong class="ml-3">${data.table[0]['challan NO.']}  (${data.table[0]['challan DATE']})</strong></td>
                  </tr>
                  <tr>
                    <td style="width: 35%;">LR NO.</td>
                    <td style="width: 65%;">: <strong class="ml-3">${data.table[0]['vehicle NO.']}</strong></td>
                  </tr>
                  <tr>
                    <td style="width: 35%;">TRANSPORTER</td>
                    <td style="width: 65%;">: <strong class="ml-3">${data.table[0]['transporter']}</strong></td>
                  </tr>
                  <tr>
                    <td style="width: 35%;">VEHICLE NO.</td>
                    <td style="width: 65%;">: <strong class="ml-3">${data.table[0]['vehicle NO.']}</strong></td>
                  </tr>
                  <tr>
                    <td style="width: 35%;">LOCATION</td>
                    <td style="width: 65%;">: <strong class="ml-3">${data.table[0]['location']}</strong></td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>


  <table style="max-width:100%;margin-top:1rem; display:block;overflow-x:auto;border-collapse:collapse">
    <tr style=" border:1px solid black;border-collapse: collapse;width:100%">
        <th style=" border:1px solid black;border-collapse: collapse;width:2.66%">S.No</th>
        <th style=" border:1px solid black;border-collapse: collapse;width:6.66%">PO No. / Date <br>
            Indent No/Date</th>
        <th style=" border:1px solid black;border-collapse: collapse;width:6.66%">Item Code</th>
        <th style=" border:1px solid black;border-collapse: collapse;width:10.66%">Item Description</th>
        <th style=" border:1px solid black;border-collapse: collapse;width:6.66%">Dept.</th>
        <th style=" border:1px solid black;border-collapse: collapse;width:6.66%">UOM</th>
        <th style=" border:1px solid black;border-collapse: collapse;width:6.66%">Challan
            Qty</th>
        <th style=" border:1px solid black;border-collapse: collapse;width:6.66%">Received
            Qty.</th>
        <th style=" border:1px solid black;border-collapse: collapse;width:6.66%">Short
            Qty.</th>
        <th style=" border:1px solid black;border-collapse: collapse;width:6.66%">Excess
            Qty.</th>
        <!--<th style=" border:1px solid black;border-collapse: collapse;width:6.66%">Rejected
            Qty.</th>-->
        <th style=" border:1px solid black;border-collapse: collapse;width:6.66%">Accepted
            Qty.</th>
        <th style=" border:1px solid black;border-collapse: collapse;width:6.66%">Rate</th>
        <th style=" border:1px solid black;border-collapse: collapse;width:6.66%">Discount</th>
        <th style=" border:1px solid black;border-collapse: collapse;width:6.66%">Total Value</th>
    </tr>
    ${data.table1.map((itmdata:any, item:any) => `
    <tr style=" border:1px solid black;border-collapse: collapse;width:100%">
        <td style="text-align:center; border:1px solid black;border-collapse: collapse;width:2.66%">${item + 1}</td>
        <td style="text-align:center; border:1px solid black;border-collapse: collapse;width:6.66%">${itmdata['po No']}</td>
        <td style="text-align:center; border:1px solid black;border-collapse: collapse;width:6.66%">${itmdata['item Code']}</td>
        <td style="text-align:center; border:1px solid black;border-collapse: collapse;width:10.66%">${itmdata['item Description']}</td>
        <td style="text-align:center; border:1px solid black;border-collapse: collapse;width:6.66%">${itmdata['department']}</td>
        <td style="text-align:center; border:1px solid black;border-collapse: collapse;width:6.66%">${itmdata['uom']}</td>
        <td style="text-align:center; border:1px solid black;border-collapse: collapse;width:6.66%">${itmdata['challanQuantity']}</td>
        <td style="text-align:center; border:1px solid black;border-collapse: collapse;width:6.66%">${itmdata['receivedQuantity']}</td>
        <td style="text-align:center; border:1px solid black;border-collapse: collapse;width:6.66%">${itmdata['shortQty']}</td>
        <td style="text-align:center; border:1px solid black;border-collapse: collapse;width:6.66%">${itmdata['excessQty']}</td>
        <!--<td style="text-align:center; border:1px solid black;border-collapse: collapse;width:6.66%"></td>-->
        <td style="text-align:center; border:1px solid black;border-collapse: collapse;width:6.66%">${itmdata['acceptedQuantity']}</td>
        <td style="text-align:center; border:1px solid black;border-collapse: collapse;width:6.66%">${Number(itmdata['rate']).toFixed(2)}</td>
        <td style="text-align:center; border:1px solid black;border-collapse: collapse;width:6.66%">${itmdata['discount']}</td>
        <td style="text-align:center; border:1px solid black;border-collapse: collapse;width:6.66%">${Number(itmdata['total Value']).toFixed(2)}</td>
    </tr>
    `).join('')}
    <tr style=" border:1px solid black;border-collapse: collapse;width:auto">
        <td colspan="14" style="text-align: right;border:1px solid">
          <div style="margin:2px">Grand Total: ${grandTotal.toFixed(2)} </div>
        </td>
    </tr>
    <tr style=" border:1px solid black;border-collapse: collapse;width:auto">      
      <td colspan="14" style="text-align: left;border:1px solid">
        <div style="margin:2px">Remark &nbsp;:&nbsp;${data.table[0]?.otherRemarks}</div>
       </td>
    </tr>
    <tr style=" border:1px solid black;border-collapse: collapse;width:auto">      
    <td colspan="4" style="text-align: left;border:1px solid">
    <div style="margin:2px">Authorised &nbsp;:&nbsp;Yes</div>
   </td>
   <td colspan="5" style="text-align: left;border:1px solid">
   <div style="margin:2px">Inspection Required &nbsp;:&nbsp;${data.table[0].isInspection}</div>
  </td>
  <td colspan="5" style="text-align: left;border:1px solid">
  <div style="margin:2px">Short Close &nbsp;:&nbsp;</div>
 </td>
</tr>

  </table>
 
<!--<table  style="width:100%; border:1px solid black;margin-top:1rem">
  <tr style=" border:1px solid black;border-collapse: collapse;">
  <td   style="border: none;">Authorised &nbsp;:&nbsp;Yes</td>
  
  <td  style="border: none;" >Inspection Required &nbsp;:&nbsp;${data.table[0].isInspection}</td>

  </tr>
  </table>-->


  <table  style="width: 100%;border: 1px solid black;padding-bottom: 5px;margin-top:1rem">
          <tbody>
          <tr>
            <td style="text-align: left;" width="100%"><br>
            <strong style="margin-left: 15px;">For, ${data.table[0].orgName}</strong><br>
            <br></td>
          </tr>
            <tr>
              <td>
                <table style="width: 100%;">
                  <tbody>
                    <tr>
                      <td style="text-align: center;vertical-align: top;" width="25%"><span>Prepared By<br>${data.table[0].preparedBy}</span></td>
                      <td style="text-align: center;vertical-align: top;" width="25%"><span>Checked By<br></span></td>
                      <td style="text-align: center;vertical-align: top;" width="25%"><span>Issued By<br></span></td>
                      <td style="text-align: center;vertical-align: top;" width="25%"><span>Authorised By<br></span></td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
  

  <!--<table style="width:100%; border:1px solid black">
 
    <tr style=" border:1px solid black;border-collapse: collapse;">
        <h4>For,LION SERVICES LIMITED (DIVISION-MS)</h4>
    </tr>
    ${data.table.map((itmdata:any, item:any) => `
    <tr>
        <th style="border:none">Prepared By:${itmdata['preparedBy']} </th>
        <th style="border: none;">Checked By</th>
        <th style="border: none;">Issued By</th>
        <th style="border: none;">Authorised By</th>
    </tr>
    `).join('')}
  </table>-->

</div>
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
