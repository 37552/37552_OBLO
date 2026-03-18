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
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { ExcelService } from '../../shared/excel.service';

@Component({
  selector: 'app-purchase-request-approval',
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
  templateUrl: './purchase-request-approval.html',
  styleUrl: './purchase-request-approval.scss'
})
export class PurchaseRequestApproval {
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
  itemData: any = [];
  rowId: any;
  MRNO: any;
  availableWarehouseData: any = [];
  warehouseStockDialog: boolean = false;
  selectedMaterialIssueId: any;
  approveDailog: boolean = false;
  isProccess: boolean = false;

  columns: TableColumn[] = [
    { key: 'refNo', header: 'Ref No', isVisible: true, isSortable: false },
    { key: 'miDate', header: 'MI Date', isVisible: true, isSortable: false },
    { key: 'materialRequestNo', header: 'Material Request No.', isVisible: true, isSortable: false },
    { key: 'mrDate', header: 'MR Date', isVisible: true, isSortable: false },
    { key: 'warehouse', header: 'Warehouse', isVisible: true, isSortable: false },
    { key: 'costCenter', header: 'Cost Center', isVisible: true, isSortable: false },
    { key: 'indentType', header: 'Indent Type', isVisible: true, isSortable: false },
    { key: 'issueTo', header: 'Issue To', isVisible: true, isSortable: false },
    { key: 'rquestedBy', header: 'Request By', isVisible: true, isSortable: false },
    { key: 'remarks', header: 'Remarks', isVisible: true, isSortable: false },
    { key: 'jsonDetails', header: 'Action', isVisible: true, isSortable: false, isCustom: true }
  ]

  constructor(private fb: FormBuilder,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private message: MessageService,
    public Customvalidation: Customvalidation,
    private configService: ConfigService,
    private cdr: ChangeDetectorRef,
    private datePipe: DatePipe,
    private router: Router,
   private excelService: ExcelService,) {
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
    }, 1000);
  }

  getTableData(isTrue: boolean) {
    try {
      if (isTrue) this.isLoading = true;
      else this.pageNo = 1;

      const userId = sessionStorage.getItem('userId') || '';
      const roleId = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
      const query = `searchText=${this.searchText}|pageIndex=${this.pageNo}|size=${this.pageSize}|appUserId=${userId}|appUserRole=${roleId}|districtId=${sessionStorage.getItem('District')}`;

      this.userService.getQuestionPaper(`uspGetPRApprovalView|${query}`).subscribe({
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

  getDetails(id: any) {
    this.isFormLoading = true;
    try {

      this.userService.LoadReport('uspGetItemsForApproval|MaterialIssueId=' + id, this.FormName)
        .subscribe(
          (res: any) => {
            try {
              setTimeout(() => {
                this.isFormLoading = false;
                this.openDetail();
              }, 1000);

              if (Object.keys(res).length > 0 && res['table1']?.length > 0) {

                this.itemData = res['table1'];
                this.itemData = this.itemData.map((e: any) => ({
                  ...e,
                  approvedQty: e.reqQty ? e.reqQty.toString() : '',
                  isApproved: '1'
                }));

                if (res['table']?.length > 0) {
                  this.selectedMaterialIssueId = res['table'][0]['materialIssueId'];
                }
              } else {
                this.itemData = [];
              }
            } catch (innerErr) {
              console.error("Processing error:", innerErr);
              this.isFormLoading = false;
            }
          },

          (err: HttpErrorResponse) => {
            try {
              if (err.status == 403) {
                sessionStorage.setItem('userToken', '');
                this.router.navigate(['/login']);
                return;
              }
              console.error("API Error:", err);
            } catch (innerErr) {
              console.error("Error handling failure:", innerErr);
            } finally {
              this.isFormLoading = false;
            }
          }
        );

    } catch (outerErr) {
      console.error("Unexpected error:", outerErr);
      this.isFormLoading = false;
    }
  }


  openDetail() {
    this.approveDailog = true;
  }

  closeDataDialog() {
    this.approveDailog = false;
    this.itemData = []
  }

  openWerehoseSlotModal() {
    this.warehouseStockDialog = true;
  }

  onCloseWarehoseModal() {
    this.warehouseStockDialog = false;
    this.availableWarehouseData = [];
  }

  setApprovedQty(event:any, item:any) {
    item['approvedQty'] = event.target.value
  }

  checkValue(event:any, item:any) {
    item['isApproved'] = event.target.checked ? '1' : '0'
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


  getAvailabletWarehouse(data: any) {
    this.isFormLoading = true;
    try {
       this.userService.getQuestionPaper(`uspGetAvailableWarehouse|itemId=${data.itemId}|itemCodeId=${data.itemCodeId}|quantity=${data.reqQty}|appUserId=${sessionStorage.getItem('userId')}`)
        .subscribe(
          (res: any) => {
            try {
              const noData =
                !res ||
                Object.keys(res).length === 0 ||
                !res['table'] ||
                res['table'].length === 0;

              if (noData) {
                setTimeout(() => {
                  this.isFormLoading = false;
                  this.availableWarehouseData = [];
                  this.message.add({
                    severity: 'warn',
                    summary: 'Warning',
                    detail: 'Stock not available in any warehouse.',
                    life: 3000
                  });
                }, 500);
              } else {
                setTimeout(() => {
                  this.availableWarehouseData = res['table'];
                  this.openWerehoseSlotModal();
                  this.isFormLoading = false;
                }, 500);
              }
            } catch (innerErr) {
              console.error('Processing error:', innerErr);
              this.isFormLoading = false;
            }
          },

          (err: HttpErrorResponse) => {
            try {
              this.isFormLoading = false;

              if (err.status === 403) {
                sessionStorage.setItem('userToken', '');
                this.Customvalidation.loginroute(err.status);
                return;
              }

              console.error('API Error:', err);
            } catch (innerErr) {
              console.error('Error handling failure:', innerErr);
            }
          }
        );
    } catch (outerErr) {
      console.error('Unexpected error:', outerErr);
      this.isFormLoading = false;
    }
  }


  async OnSubmitModal() {
    for (let i = 0; i < this.itemData.length; i++) {
      if (this.itemData[i].isApproved == '1' && (this.itemData[i].approvedQty == '' || this.itemData[i].approvedQty == '0')) {
        this.message.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'Approved Qty should be greater than 0.',
          life: 3000
        });
        return;
      }
      if (this.itemData[i].approvedQty > this.itemData[i].reqQty) {
        this.message.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'Approved Qty should be less than equal to Required Qty.',
          life: 3000
        });
        return;
      }
    }
    let isDuplicate = await this.hasDuplicateIds(this.itemData, 'itemCodeId')
    if (isDuplicate) {
      this.message.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Duplicate item exist.',
        life: 3000
      });
      return
    }
    this.openConfirmation('Confirm?', "Are you sure you want to proceed?", '1', '1')
  }


  submitcall() {
    if (this.isProccess) {
      return;
    }

    this.isProccess = true;
    this.isFormLoading = true;
    let data: any[] = []; 
    let table: any = {}; 

    this.itemData.map((item: any) => {
      let obj: { [key: string]: any } = {}; 

      obj['tbleName'] = item['itemId']?.toString();
      obj['tbleSequence'] = item['approvedQty']?.toString();
      obj['ColumnName'] = item['isApproved'];
      obj['ColumnValue'] = item['itemCodeId']?.toString();

      data.push(obj);
    });

    table['lstColumnListfinal'] = data;

    this.userService.SubmitPostTypeData(
      'uspPostPRApproval',
      `tables=${JSON.stringify(table)}|MaterialIssueId=${this.selectedMaterialIssueId}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId}`,
      this.FormName)
      .subscribe(
        (datacom: any) => {
          if (datacom != "") {
            var resultarray = datacom.split("-");

            if (resultarray[1] == "success") {
              this.message.add({
                severity: 'success',
                summary: 'Success',
                detail: resultarray[0].toString(),
                life: 3000
              });

              this.closeDataDialog();
              this.isProccess = false;

              setTimeout(() => {
                this.isFormLoading = false;
                this.getTableData(false);
              }, 1000);

            } else {
              this.message.add({
                severity: 'warn',
                summary: 'Warning',
                detail: resultarray[0].toString(),
                life: 3000
              });

              this.isProccess = false;

              setTimeout(() => {
                this.isFormLoading = false;
              }, 1000);
            }
          } else {
            this.isFormLoading = false;
          }
        },
        (err: HttpErrorResponse) => {
          this.isProccess = false;
          this.isFormLoading = false;

          if (err.status == 401) {
            this.message.add({
              severity: 'error',
              summary: 'Error',
              detail: '"You are not authorized!'
            });
          } else if (err.status == 403) {
            this.Customvalidation.loginroute(err.status);
          } else {
            this.message.add({
              severity: 'error',
              summary: 'Error',
              detail: err.message.toString()
            });
          }
        }
      );
  }

  exportAsXLSXCustom(): void {
    let query = `uspGetPRApprovalExcelData|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId}|districtId=${sessionStorage.getItem("District")}`
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

}
