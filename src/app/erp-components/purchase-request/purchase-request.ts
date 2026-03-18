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

@Component({
  selector: 'app-purchase-request',
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
  templateUrl: './purchase-request.html',
  styleUrl: './purchase-request.scss'
})
export class PurchaseRequest {

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
  sourceDrp: any[] = [];
  PRTypeDrp: any[] = [];
  employeeDrp: any[] = [];
  purchaseRequestForm: FormGroup;
  itemDetailForm: FormGroup;
  showDeleteBtn: boolean = false;
  showActiveBtn: boolean = false;
  selectedAction: any = null;
  warehouseDrp: any[] = [];
  costCenterDrp: any[] = [];
  makerCodeDrp: any[] = [];
  isProccess: boolean = false;
  issueTypeDrp: any[] = [];
  issueTypeDrpAll: any[] = [];
  issueToDrp: any[] = [];
  isDirect: boolean = false;
  mrDate: Date | null = null;
  itemDetailDataMR: any[] = [];
  selectedRow: any;
  totalTransferStock: number = 0;
  warehouseAction: string = '';
  availableWarehouseData: any[] = [];
  selectedItemIndex: any = null;
  transferWarehoseData: any[] = [];
  itemsCodeDrp: any[] = [];
  itemsDrp: any[] = [];
  uoM: any;
  unitId: any;
  selectedForm: any = '';
  selectedFormControl: any = '';
  selectedFolderName: any = ''
  isFilterDistrict: boolean = false;
  divisionDrp: any[] = [];
  departmentDrp: any[] = [];
  uomDrp: any[] = [];
  prStellmentDrp: any[] = [];

  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true, },
    { key: 'text', header: 'Purchase Request', isVisible: true, isSortable: false },
    { key: 'dateOfRequest', header: 'Date Of Request', isVisible: true, isSortable: false },
    { key: 'sourceDocument', header: 'Source Document', isVisible: true, isSortable: false },
    { key: 'reference', header: 'Reference', isVisible: true, isSortable: false },
    { key: 'department', header: 'Department', isVisible: true, isSortable: false },
    { key: 'requestedBy', header: 'Requested By', isVisible: true, isSortable: false },
    { key: 'requiredDate', header: 'Required Date', isVisible: true, isSortable: false },
    { key: 'jsonDetails', header: 'Item Details', isVisible: true, isSortable: false, isCustom: true }
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

    this.purchaseRequestForm = fb.group({
      divisionId: ['', [Validators.required]],
      warehouseId: ['', [Validators.required]],
      sourceDocumentId: ['', [Validators.required]],
      referenceId: ['', [Validators.required]],
      requestTypeId: ['', [Validators.required]],
      RequestedByName: ['', [Validators.required]],
      departmentId: ['', [Validators.required]],
      costCenterId: ['', [Validators.required]],
      requestedById: [''],
      dateOfRequest: ['', [Validators.required]],
      requiredDate: ['', [Validators.required]],
      remarks: [''],
    })

    this.itemDetailForm = fb.group({
      itemId: ['', [Validators.required]],
      itemCodeId: ['', [Validators.required]],
      unitId: ['', [Validators.required]],
      rate: ['', [Validators.required]],
      quantity: ['', [Validators.required]],
      prStellmentId: ['', [Validators.required]],
      techSpec: [''],
    })

  }

  get f() {
    return this.purchaseRequestForm.controls;
  }
  get f1() {
    return this.itemDetailForm.controls;
  }

  ngOnInit(): void {
    this.param = sessionStorage.getItem('menuItem') ?? '';
    let paramjs = JSON.parse(this.param);
    this.menulabel = paramjs.menu;
    this.FormName = paramjs.formName;
    this.FormValue = paramjs.formValue;
    this.getTableData(true)
    this.pageDivisionloaddrp();
    this.getWarehouseData()
    this.getSourceData()
    this.getPRTypeData();
    this.getCostCenterData()
    this.pageDepartmentloaddrp();
    this.getUomData();
    this.buildPrSettlementDropdown();
    this.breadcrumbItems = [
      { label: this.menulabel },
      { label: this.FormName, disabled: true }
    ];
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  buildPrSettlementDropdown() {
    const reqType = this.purchaseRequestForm.get('requestTypeId')?.value;
    this.prStellmentDrp = [
      { label: reqType == '10003' ? 'Service Order' : 'Purchase Order', value: 10001},
      { label: 'Stock Transfer', value: 10002 },
      { label: 'Delivery Challan', value: 10003 }
    ];
  }

  allowOnlyNumbers(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  pageDivisionloaddrp() {
    try {
      let districtSession = sessionStorage.getItem('District');

      this.userService
        .getPurchasePageLoadDrp(
          this.FormName,
          'uspGetFillDrpDown|table=tblDivisonNameMaster|filterColumn=CityId|filterValue=' + districtSession
        )
        .subscribe(
          (res: any) => {
            try {
              this.divisionDrp = res;

              this.purchaseRequestForm.patchValue({
                divisionId: this.divisionDrp.length ? this.divisionDrp[0]['drpValue'] : ''
              });

              setTimeout(() => {
                this.cdr.detectChanges();
              }, 200);
            } catch (innerErr) {
              console.error('Error in success block:', innerErr);
            }
          },
          (err: HttpErrorResponse) => {
            try {
              if (err.status === 403) {
                sessionStorage.setItem('userToken', '');
                this.Customvalidation.loginroute(err.status);
              }
            } catch (innerErr) {
              console.error('Error in error block:', innerErr);
            }
          }
        );
    } catch (ex) {
      console.error('Outer try–catch error:', ex);
    }
  }


  getWarehouseData() {
    try {
      this.userService.BindWarehouse(this.FormName).subscribe(
        (res: any) => {
          try {
            this.warehouseDrp = res;

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


  onWarehosechange() {
    this.purchaseRequestForm.patchValue({
      sourceDocumentId: '',
      referenceId: '',
      requestTypeId: '',
      costCenterId: '',
      departmentId: '',
      requestedById: '',
    })
    this.sourceDocumentNumberDrp = []
    this.employeeDrp = []
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 200);
  }


  getSourceData() {
    try {
      this.userService.getQuestionPaper(`uspGetPRMasters|action=SOURCE|id=0|appUserId=${sessionStorage.getItem('userId')}`)
        .subscribe(
          (res: any) => {
            try {
              this.sourceDrp = res['table'];
              setTimeout(() => {
                this.cdr.detectChanges();
              }, 200);
            } catch (innerErr) {
              console.error('Error inside subscribe success:', innerErr);
            }
          },
          (err: HttpErrorResponse) => {
            try {
              if (err.status === 403) {
                sessionStorage.setItem('userToken', '');
                this.Customvalidation.loginroute(err.status);
              }
            } catch (innerErr) {
              console.error('Error inside subscribe error:', innerErr);
            }
          }
        );
    } catch (outerErr) {
      console.error('Error in getSourceData():', outerErr);
    }
  }

  getPRTypeData() {
    try {
      this.userService.BindIssueType(this.FormName).subscribe(
        (res: any) => {
          try {
            this.PRTypeDrp = res;

            setTimeout(() => {
              this.cdr.detectChanges();
            }, 200);
          } catch (innerErr) {
            console.error("Error in subscribe success block:", innerErr);
          }
        },

        (err: HttpErrorResponse) => {
          try {
            if (err.status === 403) {
              sessionStorage.setItem('userToken', '');
              this.router.navigate(['/login']);
            }
          } catch (innerErr) {
            console.error("Error in subscribe error block:", innerErr);
          }
        }
      );
    } catch (outerErr) {
      console.error("Outer try–catch error:", outerErr);
    }
  }


  getCostCenterData() {
    try {
      this.userService
        .getQuestionPaper(
          `uspBindCostcenterdrp|districtId=${sessionStorage.getItem('District')}`
        )
        .subscribe(
          (res: any) => {
            try {
              this.costCenterDrp = res['table'];
              setTimeout(() => {
                this.cdr.detectChanges();
              }, 200);
            } catch (innerErr) {
              console.error("Error inside success block:", innerErr);
            }
          },
          (err: HttpErrorResponse) => {
            try {
              if (err.status === 403) {
                sessionStorage.setItem("userToken", "");
                this.Customvalidation.loginroute(err.status);
              }
            } catch (innerErr) {
              console.error("Error inside error block:", innerErr);
            }
          }
        );
    } catch (outerErr) {
      console.error("Error executing getCostCenterData:", outerErr);
    }
  }


  pageDepartmentloaddrp() {
    try {
      this.userService
        .getPurchasePageLoadDrp(
          this.FormName,
          'uspGetFillDrpDown|table=tblDepartmentMaster|filterColumn=|filterValue='
        )
        .subscribe(
          (res: any) => {
            try {
              this.departmentDrp = res;

              setTimeout(() => {
                this.cdr.detectChanges();
              }, 200);
            } catch (innerErr) {
              console.error("Error in success block:", innerErr);
            }
          },
          (err: HttpErrorResponse) => {
            try {
              if (err.status === 403) {
                sessionStorage.setItem('userToken', '');
                this.Customvalidation.loginroute(err.status);
              }
            } catch (innerErr) {
              console.error("Error in error block:", innerErr);
            }
          }
        );
    } catch (outerErr) {
      console.error("Outer try-catch error:", outerErr);
    }
  }


  getEmployees() {
    try {
      let id = this.purchaseRequestForm.get(`departmentId`)?.value;

      this.userService.getPurchasePageLoadDrp(this.FormName, `uspGetFillDrpDown|table=tblEmployeeMaster|filterColumn=department|filterValue=${id ? id : 0}`)
        .subscribe(
          (res: any) => {
            try {
              this.employeeDrp = res;
              this.purchaseRequestForm.patchValue({
                requestedById: ''
              });

              setTimeout(() => {
                this.cdr.detectChanges();
              }, 500);
            } catch (innerErr) {
              console.error('Error in subscribe success block:', innerErr);
            }
          },
          (err: HttpErrorResponse) => {
            try {
              if (err.status === 403) {
                sessionStorage.setItem('userToken', '');
                this.Customvalidation.loginroute(err.status);
              }
            } catch (innerErr) {
              console.error('Error in subscribe error block:', innerErr);
            }
          }
        );

    } catch (ex) {
      console.error('Outer try-catch error in getEmployees():', ex);
    }
  }

  getUomData() {
    try {
      let currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;

      this.userService
        .getQuestionPaper(`uspGetFillDrpDown|table=tblUnitMaster|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${currentRole}`)
        .subscribe(
          (res: any) => {
            try {
              this.uomDrp = res['table'];
              setTimeout(() => {
                this.cdr.detectChanges();
              }, 0);
            } catch (innerErr) {
              console.error('Error in getUomData subscribe success block:', innerErr);
            }
          },
          (err: HttpErrorResponse) => {
            try {
              if (err.status === 403) {
                sessionStorage.setItem('userToken', '');
                this.Customvalidation.loginroute(err.status);
              }
            } catch (innerErr) {
              console.error('Error in getUomData subscribe error block:', innerErr);
            }
          }
        );
    } catch (ex) {
      console.error('Outer try-catch error in getUomData():', ex);
    }
  }

  getIssueTypeData() {
    try {
      this.userService
        .BindIssueType(this.FormName)
        .subscribe(
          (res: any) => {
            try {
              this.issueTypeDrp = res;
              this.issueTypeDrpAll = res;
              setTimeout(() => {
                this.cdr.detectChanges();
              }, 200);
            } catch (innerErr) {
              console.error('Error in getIssueTypeData subscribe success block:', innerErr);
            }
          },
          (err: HttpErrorResponse) => {
            try {
              if (err.status === 403) {
                sessionStorage.setItem('userToken', '');
                this.router.navigate(['/login']);
              }
            } catch (innerErr) {
              console.error('Error in getIssueTypeData subscribe error block:', innerErr);
            }
          }
        );
    } catch (ex) {
      console.error('Outer try-catch error in getIssueTypeData():', ex);
    }
  }


  getMaterialIssueTo() {
    try {
      let divisionId = this.purchaseRequestForm.get(`divisionId`)?.value;
      let warehouseId = this.purchaseRequestForm.get(`warehouseId`)?.value;
      let currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;

      this.userService.getQuestionPaper(`uspMaterialBindIssueFor|id=${divisionId ? divisionId : 0}|warehouseId=${warehouseId ? warehouseId : 0}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${currentRole}`)
        .subscribe(
          (res: any) => {
            try {
              this.issueToDrp = res['table'];
              this.purchaseRequestForm.patchValue({
                requestedById: ''
              });

              setTimeout(() => {
                this.cdr.detectChanges();
              }, 500);
            } catch (innerErr) {
              console.error('Error in getMaterialIssueTo subscribe success block:', innerErr);
            }
          },
          (err: HttpErrorResponse) => {
            try {
              if (err.status === 403) {
                sessionStorage.setItem('userToken', '');
                this.Customvalidation.loginroute(err.status);
              }
            } catch (innerErr) {
              console.error('Error in getMaterialIssueTo subscribe error block:', innerErr);
            }
          }
        );

    } catch (ex) {
      console.error('Outer try-catch error in getMaterialIssueTo():', ex);
    }
  }


  onSourceItemChange(event: any) {
    debugger
    let sourceDocumentId = this.purchaseRequestForm.get(`sourceDocumentId`)?.value
    this.itemDetailData = []
    this.itemsDrp = []
    if (sourceDocumentId == "10000") {
      this.isDirect = true;
      this.sourceDocumentNumberDrp = []
      this.purchaseRequestForm.patchValue({
        referenceId: '',
      })
      setTimeout(() => {
        this.purchaseRequestForm.get('referenceId')?.disable();
        this.cdr.detectChanges();
      }, 500);
    }
    else if (sourceDocumentId == "") {
      this.isDirect = false;
      this.sourceDocumentNumberDrp = []
      this.purchaseRequestForm.patchValue({
        referenceId: '',
      })
      setTimeout(() => {
        this.purchaseRequestForm.get('referenceId')?.enable();
        this.cdr.detectChanges();
      }, 1000);
    }
    else {
      this.isDirect = false;
      this.pageMaterialIssueloaddrp();
    }
    this.purchaseRequestForm.patchValue({
      requestTypeId: '',
      costCenterId: '',
      departmentId: '',
      requestedById: '',
    })
    this.employeeDrp = []
    this.purchaseRequestForm.get('requestTypeId')?.enable();
    this.purchaseRequestForm.get('costCenterId')?.enable();
    this.purchaseRequestForm.get('departmentId')?.enable();
    this.purchaseRequestForm.get('RequestedByName')?.enable();
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 500);
  }

  pageMaterialIssueloaddrp() {
    try {
      let warehouseId = this.purchaseRequestForm.get(`warehouseId`)?.value;

      if (warehouseId == '') {
        this.message.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'Please select warehouse.',
          life: 3000
        });
        return;
      }

      this.userService
        .getPurchasePageLoadDrp(
          this.FormName,
          `uspGetFillDrpDownMaterialIssued|table=tblMaterialIssue|filterColumn=|filterValue=${warehouseId}|districtId=${sessionStorage.getItem('District')}`
        )
        .subscribe(
          (res: any) => {
            try {
              this.sourceDocumentNumberDrp = [...res];

              setTimeout(() => {
                this.purchaseRequestForm.get('referenceId')?.enable();
              }, 0);

            } catch (innerErr) {
              console.error('Error in pageMaterialIssueloaddrp subscribe success block:', innerErr);
            }
          },
          (err: HttpErrorResponse) => {
            try {
              if (err.status === 403) {
                sessionStorage.setItem('userToken', '');
                this.Customvalidation.loginroute(err.status);
              }
            } catch (innerErr) {
              console.error('Error in pageMaterialIssueloaddrp subscribe error block:', innerErr);
            }
          }
        );

    } catch (ex) {
      console.error('Outer try-catch error in pageMaterialIssueloaddrp():', ex);
    }
  }


  // getMaintenanceDetail(event: any) {
  //   try {
  //     let id = event.target.value ? event.target.value : 0;

  //     this.getRequestType(id);
  //     this.itemDetailData = [];
  //     this.availableWarehouseData = [];
  //     this.transferWarehoseData = [];

  //     let currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;

  //     this.userService.getQuestionPaper(`uspGetDetailsIssuedDetail|filterValue=${id}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${currentRole}`)
  //       .subscribe(
  //         (res: any) => {
  //           try {
  //             if (Object.keys(res).length === 0 || Object.keys(res).length === undefined || res['table'].length === 0) {
  //               this.itemDetailData = [];
  //             } else {
  //               this.itemDetailData = res['table'];
  //               this.itemDetailData.map(e => {
  //                 e['techSpec'] = '';
  //                 e['prStellment'] = '';
  //                 e['prStellmentId'] = 0;
  //                 e['fromwarehouseId'] = 0;
  //                 e['availableQty'] = 0;
  //                 e['indentQuantity'] = e.quantity;
  //               });
  //             }
  //           } catch (innerErr) {
  //             console.error('Error in getMaintenanceDetail subscribe success block:', innerErr);
  //           }
  //         },
  //         (err: HttpErrorResponse) => {
  //           try {
  //             if (err.status === 403) {
  //               sessionStorage.setItem('userToken', '');
  //               this.Customvalidation.loginroute(err.status);
  //             }
  //           } catch (innerErr) {
  //             console.error('Error in getMaintenanceDetail subscribe error block:', innerErr);
  //           }
  //         }
  //       );

  //   } catch (ex) {
  //     console.error('Outer try-catch error in getMaintenanceDetail():', ex);
  //   }
  // }

  getMaintenanceDetail(event: any) {
    try {

      const id = event?.value ?? 0;

      this.getRequestType(id);
      this.itemDetailData = [];
      this.availableWarehouseData = [];
      this.transferWarehoseData = [];

      let currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;

      this.userService.getQuestionPaper(`uspGetDetailsIssuedDetail|filterValue=${id}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${currentRole}`)
        .subscribe(
          (res: any) => {
            if (!res || !res.table || res.table.length === 0) {
              this.itemDetailData = [];
              return;
            }

            this.itemDetailData = res.table.map((e:any) => ({
              ...e,
              techSpec: '',
              prStellment: '',
              prStellmentId: 0,
              fromwarehouseId: 0,
              availableQty: 0,
              indentQuantity: e.quantity
            }));

            this.cdr.detectChanges();

          },
          (err: HttpErrorResponse) => {
            if (err.status === 403) {
              sessionStorage.setItem('userToken', '');
              this.Customvalidation.loginroute(err.status);
            }
          }
        );
    } catch (ex) {
      console.error('Outer try-catch error in getMaintenanceDetail():', ex);
    }
  }


  getRequestType(id: any) {
    debugger
    try {
      let sourceDocumentId = this.purchaseRequestForm.get(`sourceDocumentId`)?.value;
      this.userService.getQuestionPaper(`uspGetMaterialRequestRecord|id=${id}|action=GETPRREQUESTTYPE|option=${sourceDocumentId ? sourceDocumentId : 0}`)
        .subscribe(
          (res: any) => {
            try {
              if (Object.keys(res).length > 0 && res['table'].length > 0) {
                let requestType = res['table'][0]['requestTypeId'] != null ? String(res['table'][0]['requestTypeId']) : '';
                let costCenter = res['table'][0]['costCenter'];

                this.purchaseRequestForm.patchValue({
                  departmentId: res['table'][0]?.departmentId != null ? res['table'][0]?.departmentId : null,
                  RequestedByName: res['table'][0]?.issueToName != null ? res['table'][0]?.issueToName : null,
                });

                if (res['table'][0]?.departmentId != null) {
                  this.purchaseRequestForm.get('departmentId')?.disable();
                } else {
                  this.purchaseRequestForm.get('departmentId')?.enable();
                }

                if (res['table'][0]?.issueToName != null) {
                  this.purchaseRequestForm.get('RequestedByName')?.disable();
                } else {
                  this.purchaseRequestForm.get('RequestedByName')?.enable();
                }

                this.purchaseRequestForm.patchValue({
                  requestTypeId: requestType,
                  costCenterId: costCenter,
                });

                setTimeout(() => {
                  this.purchaseRequestForm.get('requestTypeId')?.disable();
                  this.purchaseRequestForm.get('costCenterId')?.disable();
                  this.cdr.detectChanges();
                  this.getEmployees();
                }, 200);

              } else {
                this.purchaseRequestForm.patchValue({
                  requestTypeId: '',
                  costCenterId: '',
                  departmentId: '',
                });

                setTimeout(() => {
                  this.cdr.detectChanges();
                  this.getEmployees();
                }, 200);
              }
            } catch (innerErr) {
              console.error('Error in getRequestType subscribe success block:', innerErr);
            }
          },
          (err: HttpErrorResponse) => {
            try {
              if (err.status === 403) {
                sessionStorage.setItem('userToken', '');
                this.Customvalidation.loginroute(err.status);
              }
            } catch (innerErr) {
              console.error('Error in getRequestType subscribe error block:', innerErr);
            }
          }
        );

    } catch (ex) {
      console.error('Outer try-catch error in getRequestType():', ex);
    }
  }


  getItems(event?: any) {
    debugger
    try {
      let warehouseId = this.purchaseRequestForm.get(`warehouseId`)?.value;
      let sourceDocumentId = this.purchaseRequestForm.get(`sourceDocumentId`)?.value;

      if (warehouseId == '') {
        this.message.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'Please select warehouse.',
          life: 3000
        });

        this.purchaseRequestForm.patchValue({
          requestTypeId: '',
        });

        setTimeout(() => {
          this.cdr.detectChanges();
        }, 100);

        return;
      }

      if (sourceDocumentId == '') {
        this.message.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'Please select source.',
          life: 3000
        });

        this.purchaseRequestForm.patchValue({
          requestTypeId: '',
        });

        setTimeout(() => {
          this.cdr.detectChanges();
        }, 100);

        return;
      }

      let materialIndentTypeId = event?.value ?? 0;
      this.itemDetailData = [];

      this.userService.getPurchasePageLoadDrp(this.FormName, `uspGetItemsByMaterialIndent|materialIndentTypeId=${materialIndentTypeId}`)
        .subscribe(
          (res: any) => {
            try {
              this.itemsDrp = res;
              this.availableWarehouseData = [];
              this.transferWarehoseData = [];

              setTimeout(() => {
                this.cdr.detectChanges();
              }, 1000);
            } catch (innerErr) {
              console.error('Error in getItems subscribe success block:', innerErr);
            }
          },
          (err: HttpErrorResponse) => {
            try {
              if (err.status === 403) {
                sessionStorage.setItem('userToken', '');
                this.Customvalidation.loginroute(err.status);
              }
            } catch (innerErr) {
              console.error('Error in getItems subscribe error block:', innerErr);
            }
          }
        );

    } catch (ex) {
      console.error('Outer try-catch error in getItems():', ex);
    }
  }

  getMakerCode(event: any) {
    debugger
    try {
      let id = event.value;
      const userId = sessionStorage.getItem('userId') || '';
      const roleId = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
      this.userService.getQuestionPaper(`uspGetMatReqMasters|action=MAKERCODE|itemId=${id ? id : 0}|appUserId=${userId}|appUserRole=${roleId}`).subscribe(
          (res: any) => {
            try {
              this.itemDetailForm.patchValue({
                itemCodeId: '',
                prStellmentId: '',
              });

              this.itemsCodeDrp = res['table'];

              setTimeout(() => {
                this.cdr.detectChanges();
              }, 1000);
            } catch (innerErr) {
              console.error('Error in getMakerCode subscribe success block:', innerErr);
            }
          },
          (err: HttpErrorResponse) => {
            try {
              if (err.status === 403) {
                sessionStorage.setItem('userToken', '');
                this.Customvalidation.loginroute(err.status);
              }
            } catch (innerErr) {
              console.error('Error in getMakerCode subscribe error block:', innerErr);
            }
          }
        );

    } catch (ex) {
      console.error('Outer try-catch error in getMakerCode():', ex);
    }
  }

  reloadPrStellment() {
    this.itemDetailForm.patchValue({
      prStellmentId: '',
    })
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 500);
  }

  changeQuantity(event:any, index:any) {
    this.itemDetailData[index]['indentQuantity'] = event.target.value
  }

  changeTechSpec(event: any, index: any) {
    debugger
    this.itemDetailData[index]['techSpec'] = event.target.value
  }

  onChangePrStellment(event: any, data: any, index?: any) {
    debugger
    this.selectedItemIndex = null;
    const selectedValue = event.value;  
    if (!this.isDirect) {
      if (selectedValue === '10002') {
        this.selectedItemIndex = index;
        this.getAvailabletWarehouse(data, 'add');
      } else {
        this.itemDetailData[index]['prStellmentId'] = selectedValue;
        this.transferWarehoseData = this.transferWarehoseData.filter(
          (e: any) => e.itemCodeId !== data.itemCodeId
        );
      }
    }
  }

  onReplaceCheck(event:any, item:any) {
    item['isScrap'] = event.target.checked ? 1 : 0
  }

  onIssuePriceChange(event:any, item:any) {
    item['rate'] = event.target.value
  }

  onIssueItemChange(event:any, item:any) {
    item['issuedQuantity'] = event.target.value
    item['isIssued'] = 0
    item['isScrap'] = 0
    this.transferWarehoseData = this.transferWarehoseData.filter((e:any) => e.itemCodeId != item.itemCodeId)
  }

  isInvalid(controlName: string): boolean {
    const forms: FormGroup[] = [
      this.purchaseRequestForm,
      this.itemDetailForm
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

      this.userService.getQuestionPaper(`uspGetPurchaseRequestViewDetails|${query}`).subscribe({
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
    this.selectedItem = data
    this.header = view === 'add' ? 'Add' : view === 'update' ? 'Update' : 'View';
    this.headerIcon = view === 'add' ? 'pi pi-plus' : view === 'update' ? 'pi pi-pencil' : 'pi pi-eye';

    if (view === 'add') {
      this.purchaseRequestForm.reset();
      this.purchaseRequestForm.enable();
      return;
    }

    if (view === 'view') {
      this.purchaseRequestForm.disable();
    } else {
      this.purchaseRequestForm.enable();
    }

    if (data.referenceId) {
      this.sourceDocumentNumberDrp = [{ 'drpOption': data.reference, 'drpValue': data.referenceId }]
    }
    if (data.requestedById) {
      this.employeeDrp = [{ 'drpOption': data.requestedBy, 'drpValue': data.requestedById }]
    }

    setTimeout(() => {
      this.purchaseRequestForm.patchValue({
        sourceDocumentId: data.sourceDocumentId ? data.sourceDocumentId : '',
        referenceId: data.referenceId ? data.referenceId : '',
        divisionId: data.divisionId ? data.divisionId : '',
        warehouseId: data.warehouseId ? data.warehouseId : '',
        RequestedByName: data.RequestedByName ? data.RequestedByName : '',
        requestTypeId: data.requestTypeId ? data.requestTypeId : '',
        departmentId: data.departmentId ? data.departmentId : '',
        costCenterId: data.costCenterId ? data.costCenterId : '',
        requestedById: 0,
        dateOfRequest: data.dateOfRequest ? data.dateOfRequest : '',
        requiredDate: data.requiredDate ? data.requiredDate : '',
        remarks: data.remarks ? data.remarks : ''
      })
      this.itemDetailData = JSON.parse(data.details)
      setTimeout(() => {
        this.cdr.detectChanges();
      }, 500);
    }, 500);

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
    this.purchaseRequestForm.enable();
    this.purchaseRequestForm.reset();
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
          this.purchaseRequestForm.reset();
        }
      }
    });
  }

  onClear() {
    this.purchaseRequestForm.reset();
    this.itemDetailData = [];
  }

  AddRow() {
    try {
      if (this.itemDetailForm.invalid) {
        this.itemDetailForm.markAllAsTouched();
        return
      }
      let obj = {
        itemId: this.itemDetailForm.get(`itemId`)?.value,
        itemName: this.itemsDrp.find((x: any) => x.drpValue === this.itemDetailForm.get('itemId')?.value)?.drpOption ?? '',
        itemCodeId: this.itemDetailForm.get(`itemCodeId`)?.value,
        itemCode: this.itemsCodeDrp.find((x: any) => x.drpvalue === this.itemDetailForm.get('itemCodeId')?.value)?.drpoption ?? '',
        rate: this.itemDetailForm.get(`rate`)?.value,
        quantity: this.itemDetailForm.get(`quantity`)?.value,
        indentQuantity: this.itemDetailForm.get(`quantity`)?.value,
        prStellmentId: this.itemDetailForm.get(`prStellmentId`)?.value,
        prStellment: this.prStellmentDrp.find((x: any) => x.value === this.itemDetailForm.get('prStellmentId')?.value)?.label ?? '',
        techSpec: this.itemDetailForm.get(`techSpec`)?.value,
        unitId: this.itemDetailForm.get(`unitId`)?.value,
        uom: this.uomDrp.find((x: any) => x.drpValue === this.itemDetailForm.get('unitId')?.value)?.drpOption ?? '',
        fromwarehouseId: 0,
        availableQty: 0
      }

      if (this.itemDetailData.some(e => e.itemCodeId == obj.itemCodeId)) {
        this.message.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'Item already exist.',
          life: 3000
        });
        return
      }
      if (!obj.rate || obj.rate <= 0) {
        this.message.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'Rate should be greater than 0.',
          life: 3000
        });
        return;
      }
      if (!obj.quantity || obj.quantity <= 0) {
        this.message.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'Quantity should be greater than 0.',
          life: 3000
        });
        return;
      }

      if (obj.prStellmentId == '10002') {
        this.getAvailabletWarehouse(obj, 'add')
      }
      else {
        this.itemDetailData.push(obj)
        this.resetItemform()
      }

    }
    catch (error) {
      console.error('Unexpected error:', error);
    }

  }

  resetItemform() {
    this.makerCodeDrp = []
    this.itemDetailForm.reset()
    this.itemDetailForm.patchValue({
      itemId: '',
      itemCodeId: '',
      unitId: '',
      rate: '',
      prStellmentId: '',
      quantity: '',
      techSpec: '',
    });
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 200)
  }

  deleteChildTableRow(index: number, event?: any) {
    this.openConfirmation('Confirm', 'Are you sure you want to remove?', index, 'delete', event);
  }

  clearData() {
    this.purchaseRequestForm.reset()
    this.postType = 'add'
    this.sourceDocumentNumberDrp = []
    this.issueToDrp = []
    this.itemDetailData = []
    this.itemDetailDataMR = []
    this.isDirect = false
    this.selectedRow = null
    this.totalTransferStock = 0
    this.warehouseAction = 'add'
    this.availableWarehouseData = []
    this.selectedItemIndex = null
    this.transferWarehoseData = []

    setTimeout(() => {
      this.purchaseRequestForm.patchValue({
        sourceDocumentId: '',
        referenceId: '',
        warehouseId: '',
        RequestedByName: '',
        costCenterId: '',
        requestTypeId: '',
        divisionId: '',
        dateOfRequest: '',
        departmentId: '',
        requestedById: '',
        requiredDate: '',
        remarks: '',
      })
      this.cdr.detectChanges();
    }, 100);
  }

  onSubmit(event: any) {
    if (this.purchaseRequestForm.invalid) {
      this.purchaseRequestForm.markAllAsTouched();
      return
    }
    if (this.itemDetailData.length == 0) {
      this.message.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please fill Details for Item Details.',
        life: 3000
      });
      this.paramvaluedata = '';
      return;
    }
    if (this.itemDetailData.some(e => e.prStellmentId == '')) {
      this.message.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select PR Settlement in all items.',
        life: 3000
      });
      this.paramvaluedata = '';
      return;
    }
    this.paramvaluedata = ''
    let sourceDocumentId = this.purchaseRequestForm.get(`sourceDocumentId`)?.value;
    let referenceId = this.purchaseRequestForm.get(`referenceId`)?.value ? this.purchaseRequestForm.get(`referenceId`)?.value : 0;
    let warehouseId = this.purchaseRequestForm.get(`warehouseId`)?.value;
    let requestTypeId = this.purchaseRequestForm.get(`requestTypeId`)?.value;
    let RequestedByName = this.purchaseRequestForm.get(`RequestedByName`)?.value;
    let divisionId = this.purchaseRequestForm.get(`divisionId`)?.value;
    let dateOfRequest = this.datePipe.transform(this.purchaseRequestForm.get('dateOfRequest')?.value, 'yyyy-MM-dd');
    let requiredDate = this.datePipe.transform(this.purchaseRequestForm.get('requiredDate')?.value, 'yyyy-MM-dd');
    let departmentId = this.purchaseRequestForm.get(`departmentId`)?.value;
    let costCenterId = this.purchaseRequestForm.get(`costCenterId`)?.value;
    let remarks = this.purchaseRequestForm.get(`remarks`)?.value;
    let obj = {
      sourceDocumentId: sourceDocumentId,
      dateOfRequest: dateOfRequest,
      referenceId: referenceId,
      warehouseId: warehouseId,
      RequestedByName: RequestedByName,
      costCenterId: costCenterId,
      requestTypeId: requestTypeId,
      divisionId: divisionId,
      requestedById: 0,
      requiredDate: requiredDate,
      departmentId: departmentId,
      remarks: remarks,
    };
    let finalchildTableData: any[] = [];
    this.itemDetailData.map(item => {
      let child = {
        itemId: item.itemId,
        itemCodeId: item.itemCodeId,
        quantity: item.indentQuantity,
        rate: item.rate,
        prStellmentId: item.prStellmentId,
        techSpec: item.techSpec,
        fromwarehouseId: 0,
        availableQty: 0,
        unitId: item.unitId
      }
      finalchildTableData.push(child)
    })
    this.paramvaluedata = `tblPurchaseRequestMain=${JSON.stringify([obj])}|tblPurchaseRequestChild=${JSON.stringify(finalchildTableData)}|warehouse=${JSON.stringify(this.transferWarehoseData)}|appUserId=${sessionStorage.getItem('userId')}|districtId=${sessionStorage.getItem('District')}`
    console.log("paramvaluedata========", this.paramvaluedata);
    this.openConfirmation('Confirm?', 'Are you sure you want to proceed?', '1', '1', event);
  }


  submitcall() {
    try {
      this.isFormLoading = true;

      this.userService.SubmitPostTypeData('uspPostPurchaseRequestNew', this.paramvaluedata, this.FormName).subscribe({
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

  deleteRecord(item:any, index:any) {
    this.itemDetailData.splice(index, 1);
    this.transferWarehoseData = this.transferWarehoseData.filter((e:any) => e.itemCodeId != item.itemCodeId)

  }

  openDetail(data: any, title: string, noJson?: any) {
    debugger
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

  openWerehoseSlotModal() {

  }

  onCloseWarehoseModal() {

    this.selectedRow = null
    this.totalTransferStock = 0
    this.warehouseAction = 'add'
    this.availableWarehouseData = []
    this.itemDetailForm.patchValue({
      prStellmentId: ''
    })
  }

  getAvailabletWarehouse(data: any, type: any) {
    try {
      this.isFormLoading = true;
      this.warehouseAction = type;
      this.selectedRow = data;

      this.userService
        .getQuestionPaper(
          `uspGetAvailableWarehouse|itemId=${data.itemId}|itemCodeId=${data.itemCodeId}|quantity=${data.quantity}|appUserId=${sessionStorage.getItem(
            'userId'
          )}`
        )
        .subscribe(
          (res: any) => {
            try {
              if (!res || Object.keys(res).length === 0 || res['table'].length === 0) {
                this.availableWarehouseData = [];
                this.itemDetailForm.patchValue({ prStellmentId: '' });
                this.message.add({
                  severity: 'warn',
                  summary: 'Warning',
                  detail: 'Stock not available in any warehouse.',
                  life: 3000
                });

                setTimeout(() => {
                  this.isFormLoading = false;
                  this.cdr.detectChanges();

                  // Reset the dropdown using plain TypeScript
                  const selectElem = document.getElementById(`Drp_prStellmentId_item_${this.selectedItemIndex}`) as HTMLSelectElement;
                  if (selectElem) {
                    selectElem.selectedIndex = 0;
                  }
                  this.selectedItemIndex = null;
                }, 500);
              } else {
                setTimeout(() => {
                  const warehouseId = this.purchaseRequestForm.get(`warehouseId`)?.value;
                  this.availableWarehouseData = res['table'].filter((e: any) => e.wareHouseId != warehouseId);

                  if (this.availableWarehouseData.length) {
                    this.openWerehoseSlotModal();

                    if (this.warehouseAction === 'edit') {
                      this.totalTransferStock = Number(data.quantity);
                    }

                    for (let item of this.availableWarehouseData) {
                      const warehouseItem = this.transferWarehoseData.find(
                        (e: any) => e.itemCodeId == item.itemCodeId && e.wareHouseId == item.wareHouseId
                      );
                      item.transferStock = warehouseItem ? warehouseItem.Quantity : '';
                    }
                  } else {
                    this.message.add({
                      severity: 'warn',
                      summary: 'Warning',
                      detail: 'Stock not available in any warehouse.',
                      life: 3000
                    });
                    this.itemDetailForm.patchValue({ prStellmentId: '' });

                    setTimeout(() => {
                      const selectElem1 = document.getElementById('Drp_prStellmentId') as HTMLSelectElement;
                      if (selectElem1) selectElem1.selectedIndex = 0;

                      const selectElem2 = document.getElementById(`Drp_prStellmentId_item_${this.selectedItemIndex}`) as HTMLSelectElement;
                      if (selectElem2) selectElem2.selectedIndex = 0;

                      this.selectedItemIndex = null;
                    }, 500);
                  }

                  this.isFormLoading = false;
                }, 500);
              }
            } catch (innerErr) {
              this.isFormLoading = false;
              console.error('Error in getAvailabletWarehouse subscribe success block:', innerErr);
            }
          },
          (err: HttpErrorResponse) => {
            try {
              this.selectedItemIndex = null;
              this.isFormLoading = false;
              if (err.status === 403) {
                sessionStorage.setItem('userToken', '');
                this.Customvalidation.loginroute(err.status);
              }
            } catch (innerErr) {
              console.error('Error in getAvailabletWarehouse subscribe error block:', innerErr);
            }
          }
        );
    } catch (ex) {
      this.isFormLoading = false;
      console.error('Outer try-catch error in getAvailabletWarehouse():', ex);
    }
  }


  onChangeStock(event: any, item: any, index: any) {
    try {
      const inputElem = document.getElementById(`txt_stockTransfer_${index}`) as HTMLInputElement;
      let stock = inputElem ? Number(inputElem.value) : 0;

      if (stock > item.availableStock) {
        setTimeout(() => {
          const remain = '';
          this.totalTransferStock = this.totalTransferStock - (item.transferStock ? Number(item.transferStock) : 0);
          item.transferStock = remain;
          if (inputElem) inputElem.value = remain;

          this.message.add({
            severity: 'warn',
            summary: 'Warning',
            detail: 'Transfer Stock should be less than available stock.',
            life: 3000
          });
        }, 500);
        return;
      }

      item.transferStock = stock;

      const totalTransferStockCount = this.availableWarehouseData.reduce((total: number, i: any) => {
        return total + (i.transferStock ? Number(i.transferStock) : 0);
      }, 0);

      if (totalTransferStockCount <= this.selectedRow?.quantity) {
        this.totalTransferStock = totalTransferStockCount;
      } else {
        this.message.add({
          severity: 'warn',
          summary: 'Warning',
          detail: `Total issued stock should be equal to (${this.selectedRow.quantity})`,
          life: 3000
        });

        setTimeout(() => {
          item.transferStock = '';
          this.totalTransferStock = totalTransferStockCount - stock;

          const issuedInputElem = document.getElementById(`txt_stockIssued_${index}`) as HTMLInputElement;
          if (issuedInputElem) issuedInputElem.value = '';
        }, 500);
      }

    } catch (ex) {
      console.error('Error in onChangeStock:', ex);
    }
  }


  onAddWarehose() {
    if (this.warehouseAction == 'edit') {
      this.transferWarehoseData = this.transferWarehoseData.filter((warehouse:any) => warehouse.itemCodeId != this.selectedRow.itemCodeId);
    }
    this.availableWarehouseData.map((item:any) => {
      if (item.transferStock != '') {
        let obj = { "wareHouseId": item.wareHouseId, "Quantity": item.transferStock, "itemCodeId": item.itemCodeId }
        this.transferWarehoseData.push(obj)
      }
    })
    if (!this.isDirect) {
      this.itemDetailData[this.selectedItemIndex]['prStellmentId'] = '10002'
    }
    else {
      if (this.warehouseAction == 'add') {
        let obj = {
          itemId: this.itemDetailForm.get(`itemId`)?.value,
          itemName: this.itemsDrp.find((x: any) => x.drpValue === this.itemDetailForm.get('itemId')?.value)?.drpOption ?? '',
          itemCodeId: this.itemDetailForm.get(`itemCodeId`)?.value,
          itemCode: this.itemsCodeDrp.find((x: any) => x.drpvalue === this.itemDetailForm.get('itemCodeId')?.value)?.drpoption ?? '',
          rate: this.itemDetailForm.get(`rate`)?.value,
          quantity: this.itemDetailForm.get(`quantity`)?.value,
          indentQuantity: this.itemDetailForm.get(`quantity`)?.value,
          prStellmentId: this.itemDetailForm.get(`prStellmentId`)?.value,
          prStellment: this.prStellmentDrp.find((x: any) => x.value === this.itemDetailForm.get('prStellmentId')?.value)?.label ?? '',
          techSpec: this.itemDetailForm.get(`techSpec`)?.value,
          unitId: this.itemDetailForm.get(`unitId`)?.value,
          uom: this.uomDrp.find((x: any) => x.drpValue === this.itemDetailForm.get('unitId')?.value)?.drpOption ?? '',
          fromwarehouseId: 0,
          availableQty: 0
        }
        this.itemDetailData.push(obj)
        this.resetItemform()
      }

    }
    this.selectedRow = null
    this.totalTransferStock = 0
    this.warehouseAction = 'add'
    this.selectedItemIndex = null
    this.onCloseWarehoseModal()
  }

  getRateList(item: any) {
    try {
      this.isFormLoading = true;
      let currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;

      this.userService.getQuestionPaper(`uspGetItemRateList|itemId=${item.itemId}|itemCodeId=${item.itemCodeId}|districtId=${sessionStorage.getItem("District")}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${currentRole}`)
        .subscribe(
          (data: any) => {
            try {
              if (Object.keys(data).length > 0 && data.table.length > 0) {
                setTimeout(() => {
                  this.isFormLoading = false;
                  this.openDetail(
                    data.table,
                    'Previous Purchase Rate of  ' + data.table[0]["itemName"],
                    true
                  );
                }, 1000);
              } else {
                setTimeout(() => {
                  this.isFormLoading = false;
                  this.openDetail([], 'No Record', true);
                }, 1000);
              }
            } catch (innerErr) {
              this.isFormLoading = false;
              console.error('Error in getRateList subscribe success block:', innerErr);
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
              console.error('Error in getRateList subscribe error block:', innerErr);
            }
          }
        );

    } catch (ex) {
      this.isFormLoading = false;
      console.error('Outer try-catch error in getRateList():', ex);
    }
  }

  getPrSettlementOptions() {
    const reqType = this.purchaseRequestForm?.get('requestTypeId')?.value;

    return [
      {
        label: reqType == '10003' ? 'Service Order' : 'Purchase Order',
        value: '10001'
      },
      { label: 'Stock Transfer', value: '10002' },
      { label: 'Delivery Challan', value: '10003' }
    ];
  }

  get showItemTable() {
    return this.itemDetailData.length > 0 && !this.isDirect && this.postType !== 'view';
  }


  exportAsXLSXCustom(): void {
    let query = `uspGetPurchaseRequestExcelData|appUserId=${sessionStorage.getItem('userId')}|districtId=${sessionStorage.getItem("District")}`
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
    this.userService.getQuestionPaper(`uspGetPurchaseRequestPrintData|prId=${id}`).subscribe(
      (data: any) => {

        if (data.table.length > 0) {

          if (Object.keys(data).length > 0 && data.table.length > 0) {
            let totalValue = 0;
            if (data.table1.length > 0) {
              data.table1.filter((e:any) => {
                totalValue = totalValue + Number(e['estimatedValue']);
              });
            }

            const html = `
           <div style="border:1px solid black;margin:12px;padding: 10px;">
             <table style="width:100%;margin-top: 2rem; border:1px solid black;border-collapse:collapse">

               ${data.table.map((itmdata: any, item: any) => `
               
               <tr style="border:1px solid black ;border-collapse: collapse; width: 500px;align-items: center;justify-content: center;">
                 <h5 style="text-align:center ;margin-top: 2rem;font-size: 22px; text-transform:uppercase;">${itmdata['orgName']}</h5>
                 <h5 style="text-align:center ;font-size: 15px;text-transform:uppercase;">${itmdata['address']}</h5>
                 <h5 style="text-align:center ;font-size: 13px;">${itmdata['email']}</h5>
                 <h5 style="text-align:center ;font-size: 13px;">${itmdata['phone']}</h5>
               </tr>

               <tr style="border:1px solid black ;border-collapse: collapse;">
                 <div style="font-size: 20px; margin-top: 1rem;border:1px solid;height: 60px;width:100%;align-items: center;display:flex;justify-content: center;">
                   <div style="width:300px;height: 35px;border: 1px solid;display:flex;justify-content: center;align-items: center; box-shadow: 5px 5px 8px black">
                     <b>${itmdata['header']}</b>
                   </div>
                 </div>
               </tr>

               <tr style="border:1px solid black ;border-collapse: collapse;">
                 <td style="border: none;">DIVISION</td>
                 <td style="border: none;">${itmdata['district']}</td>
                 <td style="border: none;">INDENT TYPE</td>
                 <td style="border: none;">${itmdata['indentType']}</td>
               </tr>

               <tr style="border:1px solid black ;">
                 <td style="border: none;">DEPT. NAME</td>
                 <td style="border: none;">${itmdata['department']}</td>
                 <td style="border: none;">AUTHORIZATION DATE</td>
                 <td style="border: none;">${itmdata['dateOfRequest']}</td>
               </tr>

               <tr style="border:1px solid black ;border-collapse: collapse;">
                 <td style="border: none;">INDENT NO</td>
                 <td style="border: none;">${itmdata['indentNo']}</td>
                 <td style="border: none;">REQUESTED BY</td>
                 <td style="border: none;">${itmdata['requestedBy']}</td>
               </tr>

               <tr style="border:1px solid black ;border-collapse: collapse;">
                 <td style="border: none;">INDENT DATE</td>
                 <td style="border: none;">${itmdata['dateOfRequest']}</td>
                 <td style="border: none;">SOURCE DOCUMENT</td>
                 <td style="border: none;">${itmdata['sourceDocument']}</td>
               </tr>

               <tr style="border:1px solid black ;border-collapse: collapse;">
                 <td style="border: none;">REFRENCE NO</td>
                 <td style="border: none;">${itmdata['refrenceNo']}</td>
                 <td style="border: none;"></td>
                 <td style="border: none;"></td>
               </tr>

               `).join('')}
             </table>

             <table cellpadding="5px" style="width:100%;margin-top:2rem; display:block;overflow-x:auto;border-collapse:collapse">
               <tr style="border:1px solid black ;border-collapse: collapse;">
                 <td rowspan="2" style="border:1px solid black ;border-collapse: collapse;width:8.33%">S.No</td>
                 <td rowspan="2" style="border:1px solid black ;border-collapse: collapse;width:8.33%">Item Description</td>
                 <td rowspan="2" style="border:1px solid black ;border-collapse: collapse;width:8.33%">UOM</td>
                 <td rowspan="2" style="border:1px solid black ;border-collapse: collapse;width:8.33%">Qty. Required</td>
                 <td rowspan="2" style="border:1px solid black ;border-collapse: collapse;width:8.33%">Qty. In Stock</td>
                 <td rowspan="2" style="border:1px solid black ;border-collapse: collapse;width:8.33%">Indent Qty.</td>
                 <td colspan="2" style="border:1px solid black ;border-collapse: collapse;width:8.33%">Scheduler</td>
                 <td rowspan="2" style="border:1px solid black ;border-collapse: collapse;width:8.33%">Prev. Purchase Rate</td>
                 <td rowspan="2" style="border:1px solid black ;border-collapse: collapse;width:8.33%">Estimated Rate</td>
                 <td rowspan="2" style="border:1px solid black ;border-collapse: collapse;width:8.33%">Estimated Value</td>
                 <td rowspan="2" style="border:1px solid black ;border-collapse: collapse;width:8.33%">Cost Center</td>
                 <td rowspan="2" style="border:1px solid black ;border-collapse: collapse;width:8.33%">PR Settlement</td>
               </tr>

                <tr style="border:1px solid black ;border-collapse: collapse;">
                  <td style="border:1px solid black ;border-collapse: collapse;">Date</td>
                  <td style="border:1px solid black ;border-collapse: collapse;">Qty</td>
                </tr>

                  ${data.table1.map((itmdata:any, item:any) => `
                  <tr style="border:1px solid black ;border-collapse: collapse;">
                    <td style="border:1px solid black ;border-collapse: collapse;width:8.33%"">${item + 1}</td>
                    <td style="border:1px solid black ;border-collapse: collapse;width:8.33%"">${itmdata['itemDescription']}</td>
                    <td style="border:1px solid black ;border-collapse: collapse;width:8.33%"">${itmdata['uom']}</td>
                    <td style="border:1px solid black ;border-collapse: collapse;width:8.33%"">${itmdata['quantityRequired']}</td>
                    <td style="border:1px solid black ;border-collapse: collapse;width:8.33%"">${itmdata['stockQty']}</td>
                    <td style="border:1px solid black ;border-collapse: collapse;width:8.33%"">${itmdata['indentQty']}</td>
                    <td style="border:1px solid black ;border-collapse: collapse;width:8.33%"">${itmdata['requiredDate']}</td>
                    <td style="border:1px solid black ;border-collapse: collapse;width:8.33%"">${itmdata['indentQty']}</td>
                    <td style="border:1px solid black ;border-collapse: collapse;width:8.33%"">${itmdata['prevRate']}</td>
                    <td style="border:1px solid black ;border-collapse: collapse;width:8.33%"">${itmdata['rate']}</td>
                    <td style="border:1px solid black ;border-collapse: collapse;width:8.33%"">${itmdata['estimatedValue']}</td>
                    <td style="border:1px solid black ;border-collapse: collapse;width:8.33%"">${itmdata['warehouse']}</td>
                    <td style="border:1px solid black ;border-collapse: collapse;width:8.33%"">${itmdata['prSettlement']}</td>
                    </tr>
                  `).join('')}
                  </table>

                  <table style="width:100%; border-collapse: collapse; margin-bottom: 2rem;">
                     <tr colspan="2">
                         <th style="border: 1px solid; text-align:right; border-top: 0;">Total Value:${totalValue.toFixed(2)}</th>
                     </tr>
                     <tr colspan="2">
                       <th style="border: 1px solid; text-align:left;">Remark: <span style="font-weight:400">${data.table[0]['remarks'] ? data.table[0]['remarks'] : ''}</span></th>
                     </tr>
                  </table>

             ${data.table.map((itmdata: any, item: any) => `
               <table style="width:100%; border:1px solid black;margin-top:5rem">
                 <tr>
                   <th>
                     <table style="width:100%">
                       <tr>
                         <th colspan="2" style="text-align:right;">${itmdata['orgName']}</th>
                       </tr>
                       <tr>
                         <td width="50%">Prepared By: ${itmdata['prepared By']}</td>
                         <td width="50%" style="text-align:right;">Authorised Signatory:</td>
                       </tr>
                     </table>
                   </th>
                 </tr>
               </table>
             `).join('')}

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