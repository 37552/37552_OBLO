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
import { Router } from '@angular/router';
declare var $: any;

interface InspectionItem {
  mrnChildId: number;
  itemId: number;
  itemCodeId: number;
  binId: number;
  challanQty: number;
  receivedQty: number;
  acceptedQty: number;
  rejectedQty: number;
  RejectedReason: string;
}

@Component({
  selector: 'app-inspection-entry',
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
    ExcelService,
    Router
  ],
  templateUrl: './inspection-entry.html',
  styleUrl: './inspection-entry.scss'
})
  
export class InspectionEntry {
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
  data: any[] = [];
  currentDate = new Date();
  totalCount = 0;
  requestedByDrp: any = [];
  selectedTable = ''
  selectedItem: any = []
  selectedRowDetails: any[] = [];
  searchValue: string = '';
  formlable: string = '';
  modelHeading: string = ''
  recordViewData: any[] = [];
  recordHeaderViewData: any[] = [];
  printDialog: boolean = false;
  printContent: SafeHtml | string = '';
  sourceDocumentNumberDrp: any[] = [];
  ChallanForm: FormGroup;
  showDeleteBtn: boolean = false;
  showActiveBtn: boolean = false;
  selectedAction: any = null;
  warehouseDrp: any[] = [];
  costCenterDrp: any[] = [];
  isProccess: boolean = false;
  selectedRow: any;
  selectedForm: any = '';
  selectedFormControl: any = '';
  selectedFolderName: any = ''
  isFilterDistrict: boolean = false;
  mrnNumberDrpData: any = [];
  MRNDetails: any;
  itemData: any[] = [];
  finalarray: any[] = [];
  inspectionNo: any = '';
  parsedBinLocation: any[] = [];
  warehouseId: any;


  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true, },
    { key: 'inspectionNo', header: 'Inspection No', isVisible: true, isSortable: false },
    { key: 'inspectionDate', header: 'Inspection Date', isVisible: true, isSortable: false },
    { key: 'mrnNo', header: 'MRN No', isVisible: true, isSortable: false },
    { key: 'mrnDate', header: 'MRN Date', isVisible: true, isSortable: false },
    { key: 'poNumber', header: 'PO No', isVisible: true, isSortable: false },
    { key: 'poDate', header: 'PO Date', isVisible: true, isSortable: false },
    { key: 'prno', header: 'PR No', isVisible: true, isSortable: false },
    { key: 'prDate', header: 'PR Date', isVisible: true, isSortable: false },
    { key: 'challanQty', header: 'Challan Qty', isVisible: true, isSortable: false },
    { key: 'receivedQty', header: 'Received Qty', isVisible: true, isSortable: false },
    { key: 'acceptedQty', header: 'Accepted Qty', isVisible: true, isSortable: false },
    { key: 'rejectedQty', header: 'Rejected Qty', isVisible: true, isSortable: false }
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
    private router: Router,) {

    this.ChallanForm = fb.group({
      MRNId: ['', [Validators.required]],
      PONumber: [''],
      PODate: [''],
      PRNumber: [''],
      PRDate: [''],
      MRNDate: [''],
      Warehouse: ['']
    })
    this.ChallanForm.disable();
    this.ChallanForm.get('MRNId')?.enable();

  }

  get f() {
    return this.ChallanForm.controls;
  }


  ngOnInit(): void {
    this.param = sessionStorage.getItem('menuItem') ?? '';
    let paramjs = JSON.parse(this.param);
    this.menulabel = paramjs.menu;
    this.FormName = paramjs.formName;
    this.FormValue = paramjs.formValue;
    this.getTableData(true)
    this.getMaterialReceiptNote()
    this.pageUniqueIdloaddrp()
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

  getMaterialReceiptNote() {
    try {
      this.userService.getPurchasePageLoadDrp(this.FormName,`uspGetMaterialReceiptNote|districtId=${sessionStorage.getItem('District')}`)
        .subscribe(
          (res: any) => {
            try {
              this.mrnNumberDrpData = res;
              setTimeout(() => {
                this.cdr.detectChanges();
              }, 500);
            } catch (err) {
              console.error('UI processing error:', err);
            }
          },
          (err: HttpErrorResponse) => {
            if (err.status === 403) {
              sessionStorage.setItem('userToken', '');
              this.router.navigate(['/login']);
            } else {
              console.error('API error:', err);
            }
          }
        );
    } catch (error) {
      console.error('Unexpected error in getMaterialReceiptNote:', error);
    }
  }

  pageUniqueIdloaddrp() {
    try {
      this.userService.getUniqueId(this.FormName).subscribe(
        (res: any) => {
          try {
            this.inspectionNo = res;
          } catch (err) {
            console.error('UI processing error:', err);
          }
        },
        (err: HttpErrorResponse) => {
          if (err.status === 403) {
            sessionStorage.setItem('userToken', '');
            this.router.navigate(['/login']);
          } else {
            console.error('API error:', err);
          }
        }
      );
    } catch (error) {
      console.error('Unexpected error in pageUniqueIdloaddrp:', error);
    }
  }

  getDetails() {
    try {
      const id = this.ChallanForm.get('MRNId')?.value || 0;
      this.userService.LoadReport(`uspGetMRNDetails|mrnID=${id}`, this.FormName).subscribe({
          next: (res: any) => {
            try {
              if (res?.table?.length > 0) {
                const data = res.table[0];
                this.MRNDetails = data;
                this.warehouseId = data.warehouseId

                this.ChallanForm.patchValue({
                  PONumber: data.poNumber,
                  PODate: data.poDate,
                  PRNumber: data.prNumber,
                  PRDate: data.prDate,
                  MRNDate: data.grnDate,
                  Warehouse: data.warehouse
                });

                if (data?.binlocation) {
                  try {
                    this.parsedBinLocation = JSON.parse(data.binlocation);
                  } catch {
                    this.parsedBinLocation = [];
                  }
                } else {
                  this.parsedBinLocation = [];
                }
              } else {
                this.ChallanForm.reset();
                this.parsedBinLocation = [];
              }

              if (res?.table1?.length > 0) {
                this.itemData = res.table1.map((e:any) => ({
                  ...e,
                  acceptedQty: 0,
                  rejectedQty: e.receivedQuantity,
                  reason: ''
                }));
              } else {
                this.itemData = [];
              }
            } catch (innerErr) {
              console.error('Error processing MRN data:', innerErr);
              this.itemData = [];
              this.parsedBinLocation = [];
            } finally {
              setTimeout(() => (this.isFormLoading = false), 300);
            }
          },

          error: (err: HttpErrorResponse) => {
            this.isFormLoading = false;
            if (err.status === 403) {
              sessionStorage.setItem('userToken', '');
              this.router.navigate(['/login']);
            } else {
              console.error('API error:', err);
            }
          }
        });
    } catch (error) {
      this.isFormLoading = false;
      console.error('Unexpected error in getDetails():', error);
    }
  }


  setAcceptedQty(event: any, item: any) {
    let acceptQty = event.target.value
    if (acceptQty > item['receivedQuantity'] || acceptQty < 0) {
      acceptQty = acceptQty.slice(acceptQty, -1);
      item['acceptedQty'] = acceptQty
      item['rejectedQty'] = item['receivedQuantity']
      this.message.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Accepted Qty should be equal or less than Received Qty',
        life: 3000
      });
    }
    else {
      item['acceptedQty'] = acceptQty
      item['rejectedQty'] = item['receivedQuantity'] - acceptQty
    }
  }

  setReason(event: any, item: any) {
    item['RejectedReason'] = event.target.value
  }

  isInvalid(controlName: string): boolean {
    const forms: FormGroup[] = [
      this.ChallanForm
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

      this.userService.getQuestionPaper(`UspGetMRNInspectionViewNew|${query}`).subscribe({
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

  showDialog(view: string, data: any) {
    this.visible = true;
    this.postType = view;
    this.selectedItem = data;

    this.header =
      view === 'add' ? 'Add' :
        view === 'update' ? 'Update' : 'View';

    this.headerIcon =
      view === 'add' ? 'pi pi-plus' :
        view === 'update' ? 'pi pi-pencil' : 'pi pi-eye';

    if (view === 'add') {
      this.ChallanForm.reset();
      this.itemData = [];
      return;
    }

    if (view === 'view') {
      this.ChallanForm.disable();
    } else {
      this.ChallanForm.enable();
    }

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
    this.ChallanForm.reset();
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
        if (option === 'delete') {
          this.itemData.splice(id, 1);
        }
        else if (option === '1') {
          this.submitcall();
        }
        else if (option == '4') {
          this.itemData = []
        }
        else if (option === '5') {
          this.ChallanForm.reset();
        }
      }
    });
  }

  onClear() {
    this.ChallanForm.reset();
    this.itemData = [];
  }

  clearData() {
    this.ChallanForm.reset()
    this.postType = 'add'
    this.itemData = []
    this.finalarray = []
    setTimeout(() => {
      this.ChallanForm.patchValue({
        MRNId: '',
      })
      $('#Drp_MRNId').selectpicker('refresh');
    }, 100);
  }

  onBinLocationChange(event: any, item: any) {
    item['binId'] = event.value;
  }

  onSubmit(event: any) {
    if (this.ChallanForm.invalid) {
      this.ChallanForm.markAllAsTouched();
      return
    }
    if (this.itemData.length == 0) {
      this.message.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please fill Details for Item Details.',
        life: 3000
      });
      return;
    }

    if (this.itemData.some(e => !e.binId)) {
      this.message.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select Bin Location.',
        life: 3000
      });
      return;
    }

    if (this.itemData.some(e => e['rejectedQty'] > 0 && e['RejectedReason'] == '')) {
      this.message.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please enter the reason of rejection',
        life: 3000
      });
      return
    }
    this.finalarray = []
    this.itemData.map((e, i) => {
      const obj: InspectionItem = {
        mrnChildId: e.id,
        itemId: e.itemId,
        itemCodeId: e.itemCodeId,
        binId: e.binId,
        challanQty: e.challanQuantity,
        receivedQty: e.receivedQuantity,
        acceptedQty: e.acceptedQty,
        rejectedQty: e.rejectedQty,
        RejectedReason: e.RejectedReason
      };
      this.finalarray.push(obj);
    })
    this.openConfirmation('Confirm?', 'Are you sure you want to proceed?', '1', '1', event);
  }


  submitcall() {
    try {
      if (this.isProccess) {
        return;
      }
      this.isFormLoading = true;
      let MRNId = this.ChallanForm.get(`MRNId`)?.value ? this.ChallanForm.get(`MRNId`)?.value : 0
      this.userService.SubmitPostTypeData('uspPostMRNInspectionNew', `detailsJSON=${JSON.stringify(this.finalarray)}|inspectionNo=${this.inspectionNo}|MRNId=${MRNId}|warehouseId=${this.warehouseId}|PONumber=${this.MRNDetails.poNumber ? this.MRNDetails.poNumber : 0}|PRNO=${this.MRNDetails.prNumber ? this.MRNDetails.prNumber : 0}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId}`, this.FormName)
      .subscribe({
        next: (datacom: any) => {
          this.isFormLoading = false;
          try {
            if (!datacom) return;
            const resultarray = datacom.split('-');
            if (resultarray[1] === 'success') {
              this.pageUniqueIdloaddrp();
              this.getTableData(false);
              this.getMaterialReceiptNote();  
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

  exportAsXLSXCustom(): void {
    let query = `uspGetInspectionEntryExceldata|appUserId=${sessionStorage.getItem('userId')}|districtId=${sessionStorage.getItem("District")}`
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

  openprintModalData(id: any) {
    this.userService.getQuestionPaper(`UspGetMRNInspectionPrint|id=${id}`).subscribe(
      (data: any) => {
        if (data.table.length > 0) {
          let itmdata = data.table[0]
          if (Object.keys(data).length > 0 && data.table.length > 0) {
            const html = `
           <div style="border:1px solid black;margin:12px">
                 <table style="width:100%;margin-top: 2rem; border-top:1px solid black;border-bottom:1px solid black;border-collapse:collapse">

                   <tr style="border:1px solid black ;border-collapse: collapse; width: 500px;align-items: center;justify-content: center;">

                   <h5 style="text-align:center ;margin-top: 2rem;font-size: 22px; text-transform:uppercase;">${itmdata['organization']}</h5>
                   <h5  style="text-align:center ;font-size: 15px;text-transform:uppercase;">${itmdata['orgAddress']}</h5>
                   <h5  style="text-align:center ;font-size: 13px;">${itmdata['email']}</h5>
                   <h5  style="text-align:center ;font-size: 13px;">${itmdata['phone']}</h5>
         
                   </tr>
         
                    <tr style="border-top:1px solid black ;border-bottom:1px solid black ;border-collapse: collapse;">
         
                     <div style="font-size: 20px; margin-top: 1rem;border-top:1px solid;border-bottom:1px solid;height: 60px;width:100%;align-items: center;display:flex;justify-content: center;">
                       <div style="width:300px;height: 35px;border: 1px solid;display:flex;justify-content: center;align-items: center; box-shadow: 5px 5px 8px black"><b>${itmdata['header']}</b></div>
                     </div>
                     
                    </tr> 
             
                
                   <tr style="border-collapse: collapse;" >
                     <td style="border:1px solid black ;border-collapse: collapse;border: none;">INSPECTION NO.</td>
                     <td style="border:1px solid black ;border-collapse: collapse;border: none;">: ${itmdata['inspectionNo']}</td>
                     <td style="border:1px solid black ;border-collapse: collapse;border: none;">DEPT. NAME</td>
                     <td style="border:1px solid black ;border-collapse: collapse;border: none;">: ${itmdata['department']}</td>
         
                   </tr>
         
                   <tr style="">
                     <td style="border:1px solid black ;border-collapse: collapse;border: none;">INSPECTION DATE</td>
                     <td style="border:1px solid black ;border-collapse: collapse;border: none;">: ${itmdata['inspectionDate']}</td>
                     <td style="border:1px solid black ;border-collapse: collapse;border: none;">DIVISION NAME</td>
                     <td style="border:1px solid black ;border-collapse: collapse;border: none;">: ${itmdata['division']}</td>
         
                 </tr> 
                 </table>
         
                
         
                 <table cellpadding="5px" style="width:100%;margin-top:2rem; display:block;overflow-x:auto;border-collapse:collapse">
         
                 <tr style="border:1px solid black ;border-collapse: collapse;width:100%">
                   <td style="border:1px solid black ;border-collapse: collapse;width:8.33%">S.No</td>
                   <td style="border:1px solid black ;border-collapse: collapse;width:8.33%"">GRN No. Date</td>
                   <td style="border:1px solid black ;border-collapse: collapse;width:8.33%"">PO No. Date</td>
                   <td style="border:1px solid black ;border-collapse: collapse;width:8.33%"">Indent No. Date</td>
                   <td style="border:1px solid black ;border-collapse: collapse;width:8.33%"">Item Description</td>
                   <td style="border:1px solid black ;border-collapse: collapse;width:8.33%"">UOM</td>
                   <td style="border:1px solid black ;border-collapse: collapse;width:8.33%"">Challaln Qty.</td>
                   <td style="border:1px solid black ;border-collapse: collapse;width:8.33%"">Received Qty.</td>
                   <td style="border:1px solid black ;border-collapse: collapse;width:8.33%"" >Accepted Qty.</td>
                   <td style="border:1px solid black ;border-collapse: collapse;width:8.33%"">Rejected Qty.</td>
                   <td style="border:1px solid black ;border-collapse: collapse;width:8.33%"">Rejected Reason</td>
                 </tr>
         
                 ${data.table1.map((item:any, i:any) => `
                 <tr style="border:1px solid black ;border-collapse: collapse;">
                     <td style="border:1px solid black ;border-collapse: collapse;width:8.33%"">${i + 1}</td>
                     <td style="border:1px solid black ;border-collapse: collapse;width:8.33%"">${item['mrnNo']}<br>${item['mrnDate']}</td>
                     <td style="border:1px solid black ;border-collapse: collapse;width:8.33%"">${item['poNumber']}<br>${item['poDate']}</td>
                     <td style="border:1px solid black ;border-collapse: collapse;width:8.33%"">${item['prno'] ? item['prno'] : ''}<br>${item['prDate'] ? item['prDate'] : ''}</td>
                     <td style="border:1px solid black ;border-collapse: collapse;width:8.33%"">${item['itemDesc']}</td>
                     <td style="border:1px solid black ;border-collapse: collapse;width:8.33%"">${item['uom']}</td>
                     <td style="border:1px solid black ;border-collapse: collapse;width:8.33%"">${item['challanQty']}</td>
                     <td style="border:1px solid black ;border-collapse: collapse;width:8.33%"">${item['receivedQty']}</td>
                     <td style="border:1px solid black ;border-collapse: collapse;width:8.33%"">${item['acceptedQty']}</td>
                     <td style="border:1px solid black ;border-collapse: collapse;width:8.33%"">${item['rejectedQty']}</td>
                     <td style="border:1px solid black ;border-collapse: collapse;width:8.33%"">${item['reason'] ? item['reason'] : ''}</td>
                   </tr>
                   `).join('')}
             
                   </table>
         
         
                   <table style="width:100%; border-collapse: collapse;">
                 
                   <tr colspan="2">
                       <th style="border-bottom: 1px solid; text-align:left;">Remark: </th>
                   </tr>
                   
                   </table>
                 
                 
                 <table style="width:100%;">
                 
                   <tr>
                   <th>
                   <table style="width:100%">
                   <tr>
                   <th colspan="2" style="text-align:right;"></th>
                   </tr>
                   <tr>
                   <td width="50%;"></td>
                   <td width="50%;" style="text-align:right;">INSPECTION INCHARGE</td>
                   </tr>
                   </table>
                   </th> 
                   </tr>
         
                 
                 </table>
                 
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
