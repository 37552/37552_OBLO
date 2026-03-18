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

@Component({
  selector: 'app-material-receipt-note',
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
  templateUrl: './material-receipt-note.html',
  styleUrl: './material-receipt-note.scss'
})
export class MaterialReceiptNote {
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
  itemDailog: boolean = false;
  selectedTable = ''
  selectedItem: any = []
  selectedRowDetails: any[] = [];
  searchValue: string = '';
  itemDetailData: any[] = [];
  formlable: string = '';
  modelHeading: string = ''
  recordViewData: any[] = [];
  recordHeaderViewData: any[] = [];
  printDialog: boolean = false;
  printContent: SafeHtml | string = '';
  sourceDocumentNumberDrp: any[] = [];
  mrnForm: FormGroup;
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
  currency: { currencyName: any; currencyIcon: any; currencyAmount: any;} | null = null;
  divisionDrp: any = [];
  sourceDrp: any[] = [];
  PRTypeDrp: any[] = [];
  departmentDrp: any[] = [];
  employeeDrp: any[] = [];
  uomDrp: any = [];
  maetrialReceiptTypeDrp: any;
  referenceNumberDrp: any[] = [];
  vendorDrp: any[] = [];
  itemTypeDrp: any[] = [];
  documentTypeDrp: any[] = [];
  freightTypeIdDrp: any[] = [];

  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true, },
    { key: 'documentNo', header: 'Document No', isVisible: true, isSortable: false },
    { key: 'sourceDocument', header: 'Source Document', isVisible: true, isSortable: false },
    { key: 'requestNo', header: 'Request No', isVisible: true, isSortable: false },
    { key: 'divisionName', header: 'Divison Name', isVisible: true, isSortable: false },
    { key: 'purchaseType', header: 'Item Type', isVisible: true, isSortable: false },
    { key: 'warehouse', header: 'Warehouse', isVisible: true, isSortable: false },
    { key: 'date', header: 'Date', isVisible: true, isSortable: false },
    { key: 'documentType', header: 'Document Type', isVisible: true, isSortable: false },
    { key: 'vendor', header: 'Vendor Name', isVisible: true, isSortable: false },
    { key: 'dispatchChallanNo', header: 'Dispatch Challan No', isVisible: true, isSortable: false },
    { key: 'vendorBillNo', header: 'Vendor Bill No', isVisible: true, isSortable: false },
    { key: 'transporter', header: 'Transporter', isVisible: true, isSortable: false },
    { key: 'driverName', header: 'Driver Name', isVisible: true, isSortable: false },
    { key: 'vehicleNo', header: 'Vehicle No', isVisible: true, isSortable: false },
    { key: 'freight', header: 'Freight Type', isVisible: true, isSortable: false },
    { key: 'approvedStatus', header: 'Status', isVisible: true, isSortable: false },
    { key: 'remarks', header: 'Remarks', isVisible: true, isSortable: false },
    { key: 'jsonDetails', header: 'Item Details', isVisible: true, isSortable: false, isCustom: true },
    { key: 'jsonDetails1', header: 'Approved Details', isVisible: true, isSortable: false, isCustom: true },
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

    this.mrnForm = fb.group({
      DivisonNameId: ['', [Validators.required]],
      WarehouseId: ['', [Validators.required]],
      SourceDocumentId: ['', [Validators.required]],
      sourceDocReqNoId: ['', [Validators.required]],
      purchaseTypeId: ['', [Validators.required]],
      VendorNameId: ['', [Validators.required]],
      department: ['', [Validators.required]],
      materialIndentTypeId: ['', [Validators.required]],
      DocumentTypeId: ['', [Validators.required]],
      DocumentDate: ['', [Validators.required]],
      ChalllanDate: ['', [Validators.required]],
      DispatchChallanNo: ['', [Validators.required]],
      VendorBillNo: ['', [Validators.required]],
      VendorBillDate: ['', [Validators.required]],
      Transporter: ['', [Validators.required]],
      DriverName: ['', [Validators.required]],
      VehicleNo: ['', [Validators.required]],
      FreightTypeId: ['', [Validators.required]],
      currencyConversion: [''],
      text: ['', [Validators.required]],
      shortClose: [false],
      isInspection: [false]
    })

  }

  get f() {
    return this.mrnForm.controls;
  }


  ngOnInit(): void {
    this.param = sessionStorage.getItem('menuItem') ?? '';
    let paramjs = JSON.parse(this.param);
    this.menulabel = paramjs.menu;
    this.FormName = paramjs.formName;
    this.FormValue = paramjs.formValue;
    this.getTableData(true)
    this.getSource()
    this.getMaterialReceiptTypeData()
    this.getItemType()
    this.getDivision()
    this.getDepartment()
    this.getWarehouse()
    this.getDocumentType()
    this.getFreigthType()
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

  getMaterialReceiptTypeData() {
    try {
      this.userService.BindIssueType(this.FormName).subscribe(
        (res: any) => {
          try {
            this.maetrialReceiptTypeDrp = res;
            setTimeout(() => {
              this.cdr.detectChanges();
            }, 200);
          } catch (innerErr) {
            console.error('Error inside success block:', innerErr);
          }
        },
        (err: HttpErrorResponse) => {
          try {
            if (err.status === 403) {
              sessionStorage.setItem('userToken', '');
              this.Customvalidation.loginroute(err.status);
            }
          } catch (innerErr) {
            console.error('Error inside error block:', innerErr);
          }
        }
      );
    } catch (ex) {
      console.error('Outer try–catch error:', ex);
    }
  }

  onMaterialReceiptChange() {
    try {
      const id = this.mrnForm.get('materialIndentTypeId')?.value;
      this.userService.getQuestionPaper(`uspGeneralReceiptNote|Action=VENDOR|mappingId=${id ? id : 0}|issueTypeId=${id ? id : 0}|customerId=0|districtId=${sessionStorage.getItem('District')}`)
        .subscribe(
          (res: any) => {
            try {
              this.itemDetailData = [];
              this.referenceNumberDrp = [];
              this.vendorDrp = res['table'];

              this.mrnForm.patchValue({
                VendorNameId: '',
                SourceDocumentId: '',
                sourceDocReqNoId: '',
                purchaseTypeId: ''
              });

              setTimeout(() => {
                this.mrnForm.get('purchaseTypeId')?.enable();
                this.cdr.detectChanges();
              }, 200);
            } catch (innerErr) {
              console.error('Error inside success block:', innerErr);
            }
          },
          (err: HttpErrorResponse) => {
            try {
              if (err.status === 403) {
                sessionStorage.setItem('userToken', '');
                this.Customvalidation.loginroute(err.status);
              }
            } catch (innerErr) {
              console.error('Error inside error block:', innerErr);
            }
          }
        );
    } catch (ex) {
      console.error('Outer try–catch error:', ex);
    }
  }


  onVendorChange() {
    this.itemDetailData = []
    this.referenceNumberDrp = []
    this.mrnForm.patchValue({
      SourceDocumentId: '',
      sourceDocReqNoId: '',
      purchaseTypeId: ''
    })
    setTimeout(() => {
      this.mrnForm.get('purchaseTypeId')?.enable();
      this.cdr.detectChanges();
    }, 200);
  }

  getMaterialDetail() {
    try {
      this.itemDetailData = [];
      this.currency = null;

      const SourceDocumentId = this.mrnForm.get('SourceDocumentId')?.value;
      const sourceDocReqNoId = this.mrnForm.get('sourceDocReqNoId')?.value;

      this.userService
        .getQuestionPaper(
          `uspGetPurchaseOrderDetail|poId=${sourceDocReqNoId ? sourceDocReqNoId : 0}|sourceDocumentID=${SourceDocumentId ? SourceDocumentId : 0}`
        )
        .subscribe(
          async (res: any) => {
            try {
              if (res['table']?.length > 0) {
                this.itemDetailData = res['table'];

                this.itemDetailData.map(item => {
                  item['ChallanQuantity'] = '';
                  item['ChallanPrice'] = '';
                  item['ReceivedQuantity'] = '';
                  item['validity'] = '';
                  item['active'] = true;
                });

                this.mrnForm.patchValue({
                  department: res['table'][0]['departmentId'].toString() || '',
                  purchaseTypeId: res['table'][0]['itemType'].toString() || '',
                  WarehouseId: res['table'][0]['wareHouseId'].toString() || ''
                });

                const baseCurrency = res['table'][0]['currencyName'] || 'INR';
                const exchangeAmout = await this.getExchangeRate(baseCurrency, 'INR');

                this.currency = {
                  currencyName: res['table'][0]['currencyName'],
                  currencyIcon: res['table'][0]['icon'],
                  currencyAmount: !exchangeAmout ? 0 : exchangeAmout
                };

                this.mrnForm.patchValue({
                  currencyConversion: this.currency.currencyAmount.toFixed(2)
                });

                setTimeout(() => {
                  res['table'][0]['departmentId']
                    ? this.mrnForm.get('department')?.disable()
                    : this.mrnForm.get('department')?.enable();

                  res['table'][0]['itemType']
                    ? this.mrnForm.get('purchaseTypeId')?.disable()
                    : this.mrnForm.get('purchaseTypeId')?.enable();

                  this.currency?.currencyName === 'INR'
                    ? this.mrnForm.get('currencyConversion')?.disable()
                    : this.mrnForm.get('currencyConversion')?.enable();

                  res['table'][0]['wareHouseId']
                    ? this.mrnForm.get('WarehouseId')?.disable()
                    : this.mrnForm.get('WarehouseId')?.enable();

                  //  this.cdr.detectChanges();
                }, 200);
              } else {
                this.mrnForm.patchValue({
                  department: '',
                  purchaseTypeId: '',
                  currencyConversion: '',
                  WarehouseId: ''
                });

                this.itemDetailData = [];
                this.currency = null;

                setTimeout(() => {
                  this.mrnForm.get('department')?.enable();
                  this.mrnForm.get('purchaseTypeId')?.enable();
                  this.mrnForm.get('currencyConversion')?.enable();
                  // this.cdr.detectChanges();
                }, 200);
              }

              setTimeout(() => {
                this.isFormLoading = false;
              }, 1000);

            } catch (innerErr) {
              console.error('Error inside success block:', innerErr);
              this.isFormLoading = false;
            }
          },
          (err: HttpErrorResponse) => {
            try {
              this.isFormLoading = false;

              if (err.status === 403) {
                sessionStorage.setItem('userToken', '');
                this.Customvalidation.loginroute(err.status);
              }
            } catch (innerErr) {
              console.error('Error inside error block:', innerErr);
              this.isFormLoading = false;
            }
          }
        );
    } catch (ex) {
      console.error('Outer try–catch error:', ex);
      this.isFormLoading = false;
    }
  }


  getSource() {
    try {
      this.userService.getQuestionPaper(`uspGeneralReceiptNote|Action=SOURCEDOCUMENTTYPE|mappingId=0`).subscribe(
        (res: any) => {
          try {
            this.sourceDrp = res['table']
            setTimeout(() => {
              this.cdr.detectChanges();
            }, 200);
          } catch (innerErr) {
            console.error('Error inside success block:', innerErr);
          }
        },
        (err: HttpErrorResponse) => {
          try {
            if (err.status === 403) {
              sessionStorage.setItem('userToken', '');
              this.Customvalidation.loginroute(err.status);
            }
          } catch (innerErr) {
            console.error('Error inside error block:', innerErr);
          }
        }
      );
    } catch (ex) {
      console.error('Outer try–catch error:', ex);
    }
  }

  getSourceDocumentNumber() {
    try {
      let materialIndentTypeId = this.mrnForm.get(`materialIndentTypeId`)?.value
      let VendorNameId = this.mrnForm.get(`VendorNameId`)?.value
      this.userService.getQuestionPaper(`uspGeneralReceiptNote|Action=SOURCEDOCUMENTNO|mappingId=${materialIndentTypeId ? materialIndentTypeId : 0}|issueTypeId=${materialIndentTypeId ? materialIndentTypeId : 0}|customerId=${VendorNameId ? VendorNameId : 0}|districtId=${sessionStorage.getItem('District')}`).subscribe(
        (res: any) => {
          try {
            this.itemDetailData = []
            this.referenceNumberDrp = []
            this.mrnForm.patchValue({
              sourceDocReqNoId: '',
              purchaseTypeId: ''
            })
            this.referenceNumberDrp = res['table']
            setTimeout(() => {
              this.mrnForm.get('purchaseTypeId')?.enable();
              this.cdr.detectChanges();
            }, 200);
          } catch (innerErr) {
            console.error('Error inside success block:', innerErr);
          }
        },
        (err: HttpErrorResponse) => {
          try {
            if (err.status === 403) {
              sessionStorage.setItem('userToken', '');
              this.Customvalidation.loginroute(err.status);
            }
          } catch (innerErr) {
            console.error('Error inside error block:', innerErr);
          }
        }
      );
    } catch (ex) {
      console.error('Outer try–catch error:', ex);
    }
  }

  getItemType() {
    try {
      this.userService.getReceiptNotePageLoadDrp(this.FormName,'uspGeneralReceiptNote|Action=ITEMTYPE|mappingId=0')
        .subscribe(
          (res: any) => {
            try {
              this.itemTypeDrp = res;

              this.mrnForm.patchValue({
                purchaseTypeId: ''
              });

              setTimeout(() => {
                this.cdr.detectChanges();
              }, 200);
            } catch (innerErr) {
              console.error('Error inside success block:', innerErr);
            }
          },
          (err: HttpErrorResponse) => {
            try {
              if (err.status === 403) {
                sessionStorage.setItem('userToken', '');
                this.Customvalidation.loginroute(err.status);
              }
            } catch (innerErr) {
              console.error('Error inside error block:', innerErr);
            }
          }
        );
    } catch (ex) {
      console.error('Outer try–catch error:', ex);
    }
  }

  getDivision() {
    try {
      this.userService.getPurchasePageLoadDrp(this.FormName,'uspGetFillDrpDown|table=tblDivisonNameMaster|filterColumn=CityId|filterValue=' +sessionStorage.getItem('District'))
        .subscribe(
          (res: any) => {
            try {
              this.divisionDrp = res;

              this.mrnForm.patchValue({
                DivisonNameId: ''
              });

              setTimeout(() => {
                this.cdr.detectChanges();
              }, 200);
            } catch (innerErr) {
              console.error('Error inside success block:', innerErr);
            }
          },
          (err: HttpErrorResponse) => {
            try {
              if (err.status === 403) {
                sessionStorage.setItem('userToken', '');
                this.Customvalidation.loginroute(err.status);
              }
            } catch (innerErr) {
              console.error('Error inside error block:', innerErr);
            }
          }
        );
    } catch (ex) {
      console.error('Outer try–catch error:', ex);
    }
  }

  getDepartment() {
    try {
      this.userService.getPurchasePageLoadDrp(this.FormName,'uspGetFillDrpDown|table=tblDepartmentMaster|filterColumn=|filterValue=')
        .subscribe(
          (res: any) => {
            try {
              this.departmentDrp = res;

              this.mrnForm.patchValue({
                department: ''
              });

              setTimeout(() => {
                this.cdr.detectChanges();
              }, 200);
            } catch (innerErr) {
              console.error('Error inside success block:', innerErr);
            }
          },
          (err: HttpErrorResponse) => {
            try {
              if (err.status === 403) {
                sessionStorage.setItem('userToken', '');
                this.Customvalidation.loginroute(err.status);
              }
            } catch (innerErr) {
              console.error('Error inside error block:', innerErr);
            }
          }
        );
    } catch (ex) {
      console.error('Outer try–catch error:', ex);
    }
  }

  getWarehouse() {
    try {
      this.userService.BindWarehouse(this.FormName).subscribe(
          (res: any) => {
            try {
              this.warehouseDrp = res;

              this.mrnForm.patchValue({
                WarehouseId: ''
              });

              setTimeout(() => {
                this.cdr.detectChanges();
              }, 200);
            } catch (innerErr) {
              console.error('Error inside success block:', innerErr);
            }
          },
          (err: HttpErrorResponse) => {
            try {
              if (err.status === 403) {
                sessionStorage.setItem('userToken', '');
                this.Customvalidation.loginroute(err.status);
              }
            } catch (innerErr) {
              console.error('Error inside error block:', innerErr);
            }
          }
        );
    } catch (ex) {
      console.error('Outer try–catch error:', ex);
    }
  }

  getDocumentType() {
    try {
      this.userService.getReceiptNotePageLoadDrp(this.FormName,'uspGeneralReceiptNote|Action=DOCUMENTTYPE|mappingId=0')
        .subscribe(
          (res: any) => {
            try {
              this.documentTypeDrp = res;
              setTimeout(() => {
                this.cdr.detectChanges();
              }, 200);
            } catch (innerErr) {
              console.error('Error inside success block:', innerErr);
            }
          },
          (err: HttpErrorResponse) => {
            try {
              if (err.status === 403) {
                sessionStorage.setItem('userToken', '');
                this.Customvalidation.loginroute(err.status);
              }
            } catch (innerErr) {
              console.error('Error inside error block:', innerErr);
            }
          }
        );
    } catch (ex) {
      console.error('Outer try–catch error:', ex);
    }
  }

  getFreigthType() {
    try {
      this.userService.getReceiptNotePageLoadDrp(this.FormName,'uspGeneralReceiptNote|Action=FREIGHT|mappingId=0')
        .subscribe(
          (res: any) => {
            try {
              this.freightTypeIdDrp = res;

              if (this.freightTypeIdDrp?.length) {
                this.freightTypeIdDrp = this.freightTypeIdDrp.filter(
                  e => e.drpValue !== '10002'
                );
              }

              this.mrnForm.patchValue({
                FreightTypeId: ''
              });

              setTimeout(() => {
                this.cdr.detectChanges();
              }, 200);
            } catch (innerErr) {
              console.error('Error inside success block:', innerErr);
            }
          },
          (err: HttpErrorResponse) => {
            try {
              if (err.status === 403) {
                sessionStorage.setItem('userToken', '');
                this.Customvalidation.loginroute(err.status);
              }
            } catch (innerErr) {
              console.error('Error inside error block:', innerErr);
            }
          }
        );
    } catch (ex) {
      console.error('Outer try–catch error:', ex);
    }
  }

  async getExchangeRate(baseCurrency:any, targetCurrency:any) {
    const apiUrl = `https://open.er-api.com/v6/latest/${baseCurrency}`;
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      if (data.result === 'success') {
        const rate = data.rates[targetCurrency];
        return rate;
      } else {
        console.error('Error fetching exchange rate:', data.error);
        return null;
      }
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      return null;
    }
  }

  isInvalid(controlName: string): boolean {
    const forms: FormGroup[] = [
      this.mrnForm
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

      this.userService.getQuestionPaper(`uspMaterialReceiptNoteViewDetail|${query}`).subscribe({
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
      this.mrnForm.reset();
      this.mrnForm.enable();

      Promise.resolve().then(() => {
        const ctrl = this.mrnForm.get('DocumentTypeId');

        ctrl?.setValue('10000');
        ctrl?.disable({ emitEvent: false });

        this.cdr.detectChanges();
      });

      return;
    }

    if (view === 'view') {
      this.mrnForm.disable();
    } else {
      this.mrnForm.enable();
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

  onChangeAction(event:any, item:any) {
    item['active'] = event.target.checked
  }

  onChangeValue(value: any, item: any, key: string) {
    const numericValue = key === 'validity' ? value : Number(value);

    if (key === 'ChallanQuantity') {
      if (numericValue > item.quantity) {
        this.message.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'Challan quantity cannot be greater than quantity purchased.',
          life: 3000
        });
        item.ChallanQuantity = null;
        return;
      }
    }

    if (key === 'ChallanPrice') {
      if (numericValue !== item.rate) {
        this.message.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'Challan price must be equal to PO price.',
          life: 3000
        });
        item.ChallanPrice = null;
        return;
      }
    }

    if (key === 'ReceivedQuantity') {
      if (numericValue > item.quantity) {
        this.message.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'Received quantity cannot be greater than quantity purchased.',
          life: 3000
        });
        item.ReceivedQuantity = null;
        return;
      }
    }

    item[key] = numericValue;
  }


  onDrawerHide() {
    document.body.style.overflow = 'visible';
    this.visible = false;
    this.mrnForm.enable();
    this.mrnForm.reset();
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
          this.itemDetailData.splice(id, 1);
        }
        else if (option === '1') {
          this.submitcall();
        }
        else if (option == '4') {
          this.itemDetailData = []
        }
        else if (option === '5') {
          this.mrnForm.reset();
        }
      }
    });
  }

  onClear() {
    this.mrnForm.reset();
    this.itemDetailData = [];
  }

  clearData() {
    this.mrnForm.reset()
    this.postType = 'add'
    this.itemDetailData = []
    setTimeout(() => {
      this.mrnForm.patchValue({
        SourceDocumentId: '',
        sourceDocReqNoId: '',
        WarehouseId: '',
        materialIndentTypeId: '',
        VendorNameId: '',
        DivisonNameId: '',
        DocumentDate: '',
        purchaseTypeId: '',
        ChalllanDate: '',
        department: '',
        DocumentTypeId: '10000',
        text: '',
        currencyConversion: '',
        DispatchChallanNo: '',
        VendorBillNo: '',
        VendorBillDate: '',
        Transporter: '',
        DriverName: '',
        VehicleNo: '',
        FreightTypeId: '',
        shortClose: false,
        isInspection: false,
      })
      $('.searchdrop').selectpicker('refresh');
    }, 100);
  }

  onSubmit(event: any) {
    if (this.mrnForm.invalid) {
      this.mrnForm.markAllAsTouched();
      return
    }
    let filteredData = this.itemDetailData.filter(e => e.active)
    if (filteredData.length) {
      for (let i = 0; i < filteredData.length; i++) {
        if (filteredData[i].ChallanQuantity == '' || filteredData[i].ChallanQuantity == '0') {
          this.message.add({
            severity: 'warn',
            summary: 'Warning',
            detail: 'Please fill challan quantity of selected items.',
            life: 3000
          });
          return;
        }
        if (filteredData[i].ChallanPrice == '' || filteredData[i].ChallanPrice == '0') {
          this.message.add({
            severity: 'warn',
            summary: 'Warning',
            detail: 'Please fill challan price of selected items.',
            life: 3000
          });
          return;
        }
        if (filteredData[i].ReceivedQuantity == '' || filteredData[i].ReceivedQuantity == '0') {
          this.message.add({
            severity: 'warn',
            summary: 'Warning',
            detail: 'Please fill received quantity of selected items.',
            life: 3000
          });
          return;
        }
        if (filteredData[i].validity == '') {
          this.message.add({
            severity: 'warn',
            summary: 'Warning',
            detail: 'Please select date of selected items.',
            life: 3000
          });
          return;
        }
      }
    }
    else {
      this.message.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please check any item.',
        life: 3000
      });
      return;
    }
    this.paramvaluedata = ''
    let finalchildTableData: any[] = [];
    let obj = {
      SourceDocumentId: this.mrnForm.get(`SourceDocumentId`)?.value,
      DocumentDate: this.datePipe.transform(this.mrnForm.get('DocumentDate')?.value, 'yyyy-MM-dd'),
      sourceDocReqNoId: this.mrnForm.get(`sourceDocReqNoId`)?.value ? this.mrnForm.get(`sourceDocReqNoId`)?.value : 0,
      WarehouseId: this.mrnForm.get(`WarehouseId`)?.value,
      materialIndentTypeId: this.mrnForm.get(`materialIndentTypeId`)?.value,
      VendorNameId: this.mrnForm.get(`VendorNameId`)?.value,
      DivisonNameId: this.mrnForm.get(`DivisonNameId`)?.value,
      DocumentTypeId: this.mrnForm.get(`DocumentTypeId`)?.value ? this.mrnForm.get(`DocumentTypeId`)?.value : 0,
      ChalllanDate: this.datePipe.transform(this.mrnForm.get('ChalllanDate')?.value, 'yyyy-MM-dd'),
      department: this.mrnForm.get(`department`)?.value ? this.mrnForm.get(`department`)?.value : 0,
      purchaseTypeId: this.mrnForm.get(`purchaseTypeId`)?.value ? this.mrnForm.get(`purchaseTypeId`)?.value : 0,
      DispatchChallanNo: this.mrnForm.get(`DispatchChallanNo`)?.value,
      VendorBillNo: this.mrnForm.get(`VendorBillNo`)?.value,
      VendorBillDate: this.datePipe.transform(this.mrnForm.get('VendorBillDate')?.value, 'yyyy-MM-dd'),
      Transporter: this.mrnForm.get(`Transporter`)?.value,
      DriverName: this.mrnForm.get(`DriverName`)?.value,
      VehicleNo: this.mrnForm.get(`VehicleNo`)?.value,
      FreightTypeId: this.mrnForm.get(`FreightTypeId`)?.value,
      currencyConversion: this.mrnForm.get(`currencyConversion`)?.value,
      text: this.mrnForm.get(`text`)?.value,
      shortClose: this.mrnForm.get(`shortClose`)?.value,
    };

    filteredData.map(item => {
      let child = {
        materialMasterId: item.itemId ? item.itemId : 0,
        itemCodeId: item.itemCodeId ? item.itemCodeId : 0,
        challanQuantity: Number(item.ChallanQuantity),
        challanPrice: Number(item.ChallanPrice),
        receivedQuantity: Number(item.ReceivedQuantity),
        quantity: item.quantity ? item.quantity : 0,
        price: item.rate ? item.rate : 0,
        validity: item.validity,
        poChildId: item.poChildId,
        unitId: item.unitId
      }
      finalchildTableData.push(child)
    })


    this.paramvaluedata = `mrnHead=${JSON.stringify([obj])}|mrnChild=${JSON.stringify(finalchildTableData)}`
    this.openConfirmation('Confirm?', 'Are you sure you want to proceed?', '1', '1', event);
  }


  submitcall() {
    try {
      this.isFormLoading = true;

      let isInspection = this.mrnForm.get(`isInspection`)?.value
      this.userService.SubmitPostTypeData('uspPostMaterialReceiptNote', `${this.paramvaluedata}|isInspection=${isInspection}|appUserId=${sessionStorage.getItem('userId')}|districtId=${sessionStorage.getItem('District')}|appUserRole=${JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId}`, this.FormName)
      .subscribe({
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


  openDetail(data: any, title: string, noJson?: any) {
    this.itemDailog = true;
    this.modelHeading = title
    this.recordViewData = []
    this.recordHeaderViewData = []
    if (data && data != '') {
      this.recordViewData = noJson ? data : JSON.parse(data)
      if (this.recordViewData.length)
        this.recordHeaderViewData = Object.keys(this.recordViewData[0]);
    }
  }

  closeDataDialog() {
    this.itemDailog = false;
    this.recordViewData = []
    this.recordHeaderViewData = []
    this.modelHeading = ''
  }


  filedownloadview(url: string) {
    if (url) {
      window.open('https://elocker.nobilitasinfotech.com/' + url, '_blank');
    }
    else {
      this.message.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'File not Exist',
        life: 3000
      });
    }
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

  openprintModalData(id: any) {
    this.userService.getQuestionPaper(`uspGetMaterialReceiptNotePrint|materialReceiptNoteId=${id}`).subscribe(
      (data: any) => {
        var grandTotal = 0
        if (data.table1.length > 0) {
          data.table1.filter((e:any) => {
            grandTotal = grandTotal + Number(e['total Value'])
          })
        }

        if (data.table.length > 0) {
          if (Object.keys(data).length > 0 && data.table.length > 0) {
            const html = `
           <div style="border:1px solid black; max-width:100vw;padding:12px">
              <table style="width:100%;align-items:center">
                ${data.table[0].approvedStatus ?
                `<tr>
                <td>${data.table[0].approvedStatus}</td>
                </tr>`
                :
                ``
              }
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
        <div style="margin:2px">Short Close &nbsp;:&nbsp;${data.table[0].shortClose ? data.table[0].shortClose : ''}</div>
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
