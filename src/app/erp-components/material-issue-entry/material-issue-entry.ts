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
  selector: 'app-material-issue-entry',
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
  templateUrl: './material-issue-entry.html',
  styleUrl: './material-issue-entry.scss'
})
export class MaterialIssueEntry {
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
  materialIssuetForm: FormGroup;
  itemDetailForm: FormGroup;
  totalCount = 0;
  sourceDocumentNumberDrp: any[] = [];
  warehouseDrp: any[] = [];
  costCenterDrp: any[] = [];
  departmentDrp: any[] = [];
  itemsDataDrp: any[] = [];
  makerCodeDrp: any[] = [];
  makeDrp: any[] = [];
  uomDrp: any[] = [];
  isDirect: boolean = false;
  issueTypeDrp: any[] = [];
  issueTypeDrpAll: any[] = [];
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

  itemDetailDataDirect: any[] = [];
  issueToDrp: any[] = [];
  mrDate: Date | null = null;
  itemDetailDataMR: any[] = [];
  selectedRow: any;
  totalIssuedStock: number = 0;
  warehouseAction: string = '';
  miInventoryData: any[] = [];
  selectedItemIndex: any = null;
  transferWarehoseData: any[] = [];
  itemsCodeDrp: any[] = [];
  itemsDrp: any[] = [];
  uoM: any;
  unitId: any;
  issuetypeDataget: any = '';
  selectedAction: any = null;

  sourceDrp = [
    { label: 'Direct', value: 10000 },
    { label: 'Material Request', value: 10006 }
  ];

  materialIssueForDrp = [
    { label: 'Asset', value: 1 },
    { label: 'Employee', value: 2 }
  ]

  returnTypeDrp = [
    { label: 'Returnable', value: 'Returnable' },
    { label: 'Non Returnable', value: 'Non Returnable' }
  ]

  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true, },
    { key: 'material Issue No', header: 'Material Issue No', isVisible: true, isSortable: false },
    { key: 'issue Date', header: 'Issue Date', isVisible: true, isSortable: false },
    { key: 'source Document', header: 'Source Document', isVisible: true, isSortable: false },
    { key: 'source Document No', header: 'Source Document No', isVisible: true, isSortable: false },
    { key: 'warehouse', header: 'Warehouse', isVisible: true, isSortable: false },
    { key: 'costCenter', header: 'Cost Center', isVisible: true, isSortable: false },
    { key: 'issue Type', header: 'Issue Type', isVisible: true, isSortable: false },
    { key: 'material Issue For', header: 'Material Issue For', isVisible: true, isSortable: false },
    { key: 'material Issue To', header: 'Material Issue To', isVisible: true, isSortable: false },
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
    private sanitizer: DomSanitizer) {

    this.materialIssuetForm = fb.group({
      SourceDocumentId: ['', [Validators.required]],
      SourceDocumentNoId: ['', [Validators.required]],
      WarehouseId: ['', [Validators.required]],
      materialIndentTypeId: ['', [Validators.required]],
      IssueForId: ['', [Validators.required]],
      IssueToId: [''],
      IssueDate: ['', [Validators.required]],
      IssueToName: ['', [Validators.required]],
      ReturnType: ['', [Validators.required]],
      departmentId: ['', [Validators.required]],
      ReturnDate: [''],
      costCenterId: ['', [Validators.required]],
      Remarks: [''],
    })


    this.itemDetailForm = fb.group({
      MaterialMasterId: ['', [Validators.required]],
      itemCodeid: ['', [Validators.required]],
      Rate: ['0', [Validators.required]],
      issuedQuantity: ['', [Validators.required]],
      quantity: ['', [Validators.required]],
      isScrap: [false],
    })  

  }

  get f() { return this.materialIssuetForm.controls }

  get f1() { return this.itemDetailForm.controls; }


  ngOnInit(): void {
    this.param = sessionStorage.getItem('menuItem') ?? '';
    let paramjs = JSON.parse(this.param);
    this.menulabel = paramjs.menu;
    this.FormName = paramjs.formName;
    this.FormValue = paramjs.formValue;
    this.getTableData(true)
    this.getWarehouseData();
    this.getCostCenterData();
    this.getIssueTypeData();
    this.departmentloaddrp();
    this.breadcrumbItems = [
      { label: this.menulabel },
      { label: this.FormName, disabled: true }
    ];

    this.materialIssuetForm.get('IssueForId')?.valueChanges.subscribe(value => {
      const deptCtrl = this.materialIssuetForm.get('departmentId');

      if (value == 2) {
        deptCtrl?.setValidators([Validators.required]);
      } else {
        deptCtrl?.clearValidators();
        deptCtrl?.setValue(null); 
      }

      deptCtrl?.updateValueAndValidity();
    });

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

  getWarehouseData() {
    try {
      this.userService.BindWarehouse(this.FormName).subscribe({
        next: (res: any) => {
          try {
            this.warehouseDrp = res;
          } catch (innerErr) {
            console.error('Error processing dropdown response:', innerErr);
          }
        },
        error: (err: any) => {
          console.error('Error fetching dropdown data:', err);
          this.cdr.detectChanges();
        },
        complete: () => {
          this.cdr.detectChanges();
        },
      });
    } catch (err) {
      console.error('Unexpected error in getDropDownData:', err);
      this.cdr.detectChanges();
    }

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 1000);

  }

  onWarehouseChange() {
    if (!this.isDirect) {
      this.getSourceDocumentNumber()
    }
  }  

  getSourceDocumentNumber() {
    try {
      let SourceDocumentId = this.materialIssuetForm.get(`SourceDocumentId`)?.value
      let WarehouseId = this.materialIssuetForm.get(`WarehouseId`)?.value
      this.userService.getQuestionPaper(`uspBindSourceDocumentMasterNo|itemId=${SourceDocumentId}|divisionid=${WarehouseId}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId}|districtId=${sessionStorage.getItem('District')}`)
        .subscribe({
          next: (res: any) => {
            try {
              this.sourceDocumentNumberDrp = res['table']
              this.materialIssuetForm.patchValue({
                SourceDocumentNoId: ''
              })
            } catch (innerErr) {
              console.error('Error processing dropdown response:', innerErr);
            }
          },
          error: (err: any) => {
            console.error('Error fetching dropdown data:', err);
            this.cdr.detectChanges();
          },
          complete: () => {
            this.cdr.detectChanges();
          },
        });
    } catch (err) {
      console.error('Unexpected error in getDropDownData:', err);
      this.cdr.detectChanges();
    }

    setTimeout(() => {
      this.materialIssuetForm.get('SourceDocumentNoId')?.enable();
      this.cdr.detectChanges();
    }, 1000);

  }

  getIssueTypeData(){
    try {
      this.userService.BindIssueType(this.FormName)
        .subscribe({
          next: (res: any) => {
            try {
              this.issueTypeDrp = res;
              this.issueTypeDrpAll = res;
            } catch (innerErr) {
              console.error('Error processing dropdown response:', innerErr);
            }
          },
          error: (err: any) => {
            console.error('Error fetching dropdown data:', err);
            this.cdr.detectChanges();
          },
          complete: () => {
            this.cdr.detectChanges();
          },
        });
    } catch (err) {
      console.error('Unexpected error in getDropDownData:', err);
      this.cdr.detectChanges();
    }

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 1000);

  }

  getCostCenterData() {
    try {
      this.userService.getQuestionPaper(`uspBindCostcenterdrp|districtId=${sessionStorage.getItem('District')}`)
        .subscribe({
          next: (res: any) => {
            try {
              this.costCenterDrp = res.table || [];
            } catch (innerErr) {
              console.error('Error processing dropdown response:', innerErr);
            }
          },
          error: (err: any) => {
            console.error('Error fetching dropdown data:', err);
            this.cdr.detectChanges();
          },
          complete: () => {
            this.cdr.detectChanges();
          },
        });
    } catch (err) {
      console.error('Unexpected error in getDropDownData:', err);
      this.cdr.detectChanges();
    }

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 1000);
  }

  departmentloaddrp() {
    try {
      this.userService.getQuestionPaper(`uspGetOrgSettingMasters|id=0|action=OTHER|appUserId=${sessionStorage.getItem('userId')}`)
        .subscribe({
          next: (res: any) => {
            try {
              this.departmentDrp = res['table4'];
            } catch (innerErr) {
              console.error('Error processing dropdown response:', innerErr);
            }
          },
          error: (err: any) => {
            console.error('Error fetching dropdown data:', err);
            this.cdr.detectChanges();
          },
          complete: () => {
            this.cdr.detectChanges();
          },
        });
    } catch (err) {
      console.error('Unexpected error in getDropDownData:', err);
      this.cdr.detectChanges();
    }

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 1000);
  }

  getMaterialIssueTo() {
    try {
      const IssueForId = this.materialIssuetForm.get('IssueForId')?.value;
      const WarehouseId = this.materialIssuetForm.get('WarehouseId')?.value;

      const departmentControl = this.materialIssuetForm.get('departmentId');
      const issueToControl = this.materialIssuetForm.get('IssueToId');

      if (departmentControl) {
        if (IssueForId === 2) {
          departmentControl.enable();
        } else {
          departmentControl.disable();
        }
      }

      this.userService
        .getQuestionPaper(
          `uspMaterialBindIssueFor|id=${IssueForId}|warehouseId=${WarehouseId}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId}`
        )
        .subscribe({
          next: (res: any) => {
            try {
              this.issueToDrp = res?.table ?? [];
              if (issueToControl) {
                issueToControl.patchValue('');
              }
            } catch (innerErr) {
              console.error('Error processing dropdown response:', innerErr);
            }
          },
          error: (err: any) => {
            console.error('Error fetching dropdown data:', err);
            this.cdr.detectChanges();
          },
          complete: () => {
            this.cdr.detectChanges();
          },
        });
    } catch (err) {
      console.error('Unexpected error in getMaterialIssueTo:', err);
      this.cdr.detectChanges();
    }

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 1000);
  }

  onSourceItemChange(event: any) {
    try {
      this.itemDetailDataDirect = []
      this.issueToDrp = []
      this.sourceDocumentNumberDrp = []
      this.materialIssuetForm.patchValue({
        IssueToId: '',
        SourceDocumentNoId: '',
        IssueDate: ''
      })
      this.mrDate = null;

      if (event.value == 10000) {
        this.isDirect = true;
        this.materialIssuetForm.patchValue({ IssueForId: '' });
        this.issueTypeDrp = this.issueTypeDrpAll.filter((e: any) => e.drpValue != '10003');

        setTimeout(() => {
          this.materialIssuetForm.get('IssueForId')?.enable();
          this.materialIssuetForm.get('SourceDocumentNoId')?.disable();
          this.cdr.detectChanges();
        }, 500);
      }

      if (event.value == 10006) {
        this.isDirect = false;
        this.materialIssuetForm.patchValue({ IssueForId: 2 });
        this.issueTypeDrp = this.issueTypeDrpAll;

        setTimeout(() => {
          this.getMaterialIssueTo();
          this.materialIssuetForm.get('IssueForId')?.disable();
          this.materialIssuetForm.get('SourceDocumentNoId')?.enable();
          this.cdr.detectChanges();
        }, 500);
      }

      if (event.value == "") {
        this.isDirect = false;
        this.materialIssuetForm.patchValue({ IssueForId: '' });
        this.issueTypeDrp = this.issueTypeDrpAll;

        setTimeout(() => {
          this.materialIssuetForm.get('IssueForId')?.enable();
          this.materialIssuetForm.get('SourceDocumentNoId')?.enable();
          this.cdr.detectChanges();
        }, 500);
      }

      this.materialIssuetForm.patchValue({
        materialIndentTypeId: '',
        costCenterId: '',
        WarehouseId: ''
      });

      this.itemDetailForm.patchValue({ MaterialMasterId: '' });

      setTimeout(() => {
        this.materialIssuetForm.get('materialIndentTypeId')?.enable();
        this.materialIssuetForm.get('costCenterId')?.enable();
        this.cdr.detectChanges();
      }, 200);
    }
    catch (error) {
      console.error('Unexpected error:', error);
    }
  }


  getMaterialDetail() {
    try {
      this.itemDetailDataDirect = [];
      this.itemDetailDataMR = [];
      this.selectedRow = null;
      this.totalIssuedStock = 0;
      this.warehouseAction = 'add';
      this.miInventoryData = [];
      this.selectedItemIndex = null;
      this.transferWarehoseData = [];

      let SourceDocumentNoId = this.materialIssuetForm.get('SourceDocumentNoId')?.value;
      let WarehouseId = this.materialIssuetForm.get('WarehouseId')?.value;
      let SourceDocumentId = this.materialIssuetForm.get('SourceDocumentId')?.value;

      this.userService.getQuestionPaper(`uspBindSourceDocumentMasterNoDetail|Id=${SourceDocumentNoId}|SourceDocumentId=${WarehouseId}|WarehouseId=${WarehouseId}|option=${SourceDocumentId}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId}`
        )
        .subscribe({
          next: (res: any) => {
            try {
              if (Object.keys(res).length > 0 && res['table']?.length > 0) {
                this.itemDetailDataMR = res['table'];

                this.itemDetailDataMR = this.itemDetailDataMR.map((e:any, index:any) => {
                  return {
                    ...e,
                    availableStock: Number(e.availableStock),
                    quantity: Number(e.quantity),
                    rate: Number(e.rate),
                    isIssued: 0,
                    isScrap: 0,
                    disablePrice: e.rate > 0
                  };
                });
              } else {
                this.itemDetailDataMR = [];
              }

              this.getRequestRecord();
            } catch (innerErr) {
              console.error('Error processing API data:', innerErr);
            }
          },

          error: (err: HttpErrorResponse) => {
            try {
              if (err.status === 403) {
                sessionStorage.setItem('userToken', '');
                this.Customvalidation.loginroute(err.status);
                return;
              }
              console.error('API error:', err);
            } catch (innerErr) {
              console.error('Error handling API error:', innerErr);
            }
          }
        });
    } catch (outerErr) {
      console.error('Unexpected error in getMaterialDetail():', outerErr);
    }
  }

  getRequestRecord() {
    try {
      let SourceDocumentNoId = this.materialIssuetForm.get('SourceDocumentNoId')?.value;
      let SourceDocumentId = this.materialIssuetForm.get('SourceDocumentId')?.value;

      this.userService
        .getQuestionPaper(
          `uspGetMaterialRequestRecord|id=${SourceDocumentNoId}|action=GETISSUETYPE|option=${SourceDocumentId}`
        )
        .subscribe({
          next: (res: any) => {
            try {
              if (Object.keys(res).length > 0 && res['table']?.length > 0) {

                this.issuetypeDataget = res['table'][0];
                let issueTypeId = res['table'][0]['issueType'];
                let costCenterId = res['table'][0]['costCenter'];

                this.materialIssuetForm.patchValue({
                  materialIndentTypeId: String(issueTypeId),
                  costCenterId: costCenterId,
                  IssueDate: ''
                });

                this.mrDate = res['table'][0]['mrDate'];

                if (issueTypeId == '10003') {
                  this.itemDetailDataMR.forEach((e: any) => (e.isIssued = 0));
                }

                this.materialIssuetForm.patchValue({
                  departmentId:
                    res['table'][0]?.departmentId ?? null,
                  IssueToName:
                    res['table'][0]?.requestedByName ?? null
                });

                if (res['table'][0]?.departmentId != null) {
                  this.materialIssuetForm.get('departmentId')?.disable();
                } else {
                  this.materialIssuetForm.get('departmentId')?.enable();
                }

                if (res['table'][0]?.requestedByName != null) {
                  this.materialIssuetForm.get('IssueToName')?.disable();
                } else {
                  this.materialIssuetForm.get('IssueToName')?.enable();
                }

                setTimeout(() => {
                  this.materialIssuetForm.get('materialIndentTypeId')?.disable();
                  this.materialIssuetForm.get('costCenterId')?.disable();
                  this.cdr.detectChanges();
                }, 200);
              }
              else {
                this.materialIssuetForm.patchValue({
                  materialIndentTypeId: '',
                  costCenterId: ''
                });

                setTimeout(() => {
                  this.materialIssuetForm.get('materialIndentTypeId')?.enable();
                  this.materialIssuetForm.get('costCenterId')?.enable();
                  this.cdr.detectChanges();
                }, 200);
              }
            } catch (innerErr) {
              console.error('Error while processing response:', innerErr);
            }
          },

          error: (err: HttpErrorResponse) => {
            try {
              if (err.status === 403) {
                sessionStorage.setItem('userToken', '');
                this.Customvalidation.loginroute(err.status);
                return;
              }
              console.error('API Error:', err);
            } catch (innerErr) {
              console.error('Error inside error handler:', innerErr);
            }
          }
        });
    } catch (outerErr) {
      console.error('Unexpected error in getRequestRecord():', outerErr);
    }
  }

  onchangeReturnType() {
    let ReturnType = this.materialIssuetForm.get(`ReturnType`)?.value
    this.materialIssuetForm.patchValue({
      ReturnDate: ''
    })
    if (ReturnType == 'Non Returnable') {
      this.materialIssuetForm.get('ReturnDate')?.disable();
    }
    else {
      this.materialIssuetForm.get('ReturnDate')?.enable();
    }

  }

  getItems() {
    try {
      this.itemDetailDataDirect = [];

      let materialIndentTypeId = this.materialIssuetForm.get('materialIndentTypeId')?.value;

      this.userService.getQuestionPaper(`uspGetItemsByRequestType|IssueTypeID=${materialIndentTypeId}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId}`).subscribe({
        next: (res: any) => {
          try {
            this.itemDetailForm.patchValue({
              MaterialMasterId: '',
              itemCodeid: '',
              quantity: '',
              Rate: ''
            });

            this.itemsCodeDrp = [];
            this.itemsDrp = res.table;

            setTimeout(() => {
              this.cdr.detectChanges();
            }, 200);
          } catch (innerErr) {
            console.error('Error processing response:', innerErr);
          }
        },

        error: (err: HttpErrorResponse) => {
          try {
            if (err.status === 403) {
              sessionStorage.setItem('userToken', '');
              this.Customvalidation.loginroute(err.status);
              return;
            }
            console.error('API Error:', err);
          } catch (innerErr) {
            console.error('Error handling API error:', innerErr);
          } finally {
          }
        }
      });
    } catch (outerErr) {
      console.error('Unexpected error:', outerErr);
    }
  }

  onChangeItem() {
    try {
      let MaterialMasterId = this.itemDetailForm.get('MaterialMasterId')?.value;
      this.userService.getQuestionPaper(`uspGetMatReqMasters|action=MAKERCODE|itemId=${MaterialMasterId}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId}`)
        .subscribe(
          (res: any) => {
            try {
              this.itemDetailForm.patchValue({
                itemCodeid: '',
                quantity: '',
                Rate: ''
              });

              this.itemsCodeDrp = res['table'];

              setTimeout(() => {
                this.cdr.detectChanges();
              }, 1000);

            } catch (innerError) {
              console.error("Error inside subscribe success block:", innerError);
            }
          },
          (err: HttpErrorResponse) => {
            try {
              console.error("HTTP Error:", err);
            } catch (innerCatchErr) {
              console.error("Error inside subscribe error block:", innerCatchErr);
            }
          }
        );

    } catch (error) {
      console.error("Unexpected error:", error);
    }
  }


  onChangeItemCode() {
    try {
      let WarehouseId = this.materialIssuetForm.get('WarehouseId')?.value;
      let itemCodeid = this.itemDetailForm.get('itemCodeid')?.value;

      this.userService.getQuestionPaper(`uspBindItemQty|warehouseId=${WarehouseId}|itemId=${itemCodeid}`).subscribe({
        next: (res: any) => {
          try {
            if (res.table?.length > 0) {
              const data = res.table[0];

              this.itemDetailForm.patchValue({
                quantity: data.qty ? data.qty : 0,
                Rate: data.rate ? data.rate : 0
              });

              if (data.rate > 0) {
                this.itemDetailForm.get('Rate')?.disable();
              } else {
                this.itemDetailForm.get('Rate')?.enable();
              }

            } else {
              this.itemDetailForm.get('Rate')?.enable();
              this.itemDetailForm.patchValue({
                quantity: 0,
                Rate: 0
              });
            }
          } catch (innerErr) {
            console.error('Error processing item code response:', innerErr);
          } finally {
          }
        },

        error: (err: HttpErrorResponse) => {
          try {
            console.error('API Error:', err);
          } catch (innerErr) {
            console.error('Error handling API error:', innerErr);
          } finally {
          }
        }
      });
    } catch (outerErr) {
      console.error('Unexpected error:', outerErr);
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
    this.transferWarehoseData = this.transferWarehoseData.filter((e:any) => e.itemCodeid != item.itemCodeid)
  }
  checkboxCheck(event:any, item:any, index:any) {
    if (event.target.checked) {
      let materialIndentTypeId = this.materialIssuetForm.get(`materialIndentTypeId`)?.value
      if (materialIndentTypeId == '10003' ||
        !item['issuedQuantity'] ||
        item['issuedQuantity'] == 0 ||
        item['issuedQuantity'] > item['availableStock'] ||
        item['issuedQuantity'] > item['quantity']) {
        setTimeout(() => {
          item['isIssued'] = 0
        }, 1000);
      }
      else {
        item['isIssued'] = 1
        this.getWarehouseStockLot(item, 'add', index)
      }
    }
    else {
      item['isIssued'] = 0
      item['isScrap'] = 0
      this.transferWarehoseData = this.transferWarehoseData.filter((e:any) => e.itemCodeid != item.itemCodeid)
    }
  } 

  isInvalid(controlName: string): boolean {
    const forms: FormGroup[] = [
      this.materialIssuetForm,
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

      this.userService.getQuestionPaper(`uspMaterialIssueDetail|${query}`).subscribe({
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
    this.selectedIndex = data;
    this.header = view === 'add' ? 'Add' : view === 'update' ? 'Update' : 'View';
    this.headerIcon = view === 'add' ? 'pi pi-plus' : view === 'update' ? 'pi pi-pencil' : 'pi pi-eye';

    if (view === 'add') {
      this.materialIssuetForm.reset();
      this.materialIssuetForm.enable();
      return;
    }

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
    this.materialIssuetForm.enable();
    this.materialIssuetForm.reset();
    this.itemDetailDataDirect = [];
    this.itemDetailDataMR = [];
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
        else if (option === '2') {
          this.actionSubmit(id)
        }
        else if (option == '4') {
          this.itemDetailsArray = []
        }
        else if (option === '5') {
          this.materialIssuetForm.reset();
        }
      }
    });
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

  getMakerCode() {
    const itemId = this.itemDetailForm.get('itemId')?.value ?? 0;
    this.userService.getQuestionPaper(`uspGetMatReqMasters|action=MAKERCODE|itemId=${itemId}`)
      .subscribe(
        (res: any) => {
          try {
            this.makerCodeDrp = res['table'];

            this.itemDetailForm.patchValue({
              itemCodeid: '',
              makeId: '',
              size: '',
              quantity: '',
              itemPrice: '0',
              uom: res['table1'][0]?.unitId ?? '',
              remarks: '',
              availableQuantity: '0'
            });

            this.itemDetailForm.get('itemPrice')?.enable();
            setTimeout(() => {
              this.cdr.detectChanges();
            }, 500);
          } catch (error) {
            console.error('Error in getMakerCode():', error);
          }
        },
        (err: HttpErrorResponse) => {
          if (err.status === 403) {
            console.warn('Permission denied');
          }

          console.error('API Error:', err);
        }
      );
  }


  AddRow() {
    if (this.itemDetailForm.invalid) {
      this.itemDetailForm.markAllAsTouched();
      return;
    }

    let obj = {
      itemCodeid: this.itemDetailForm.get('itemCodeid')?.value,
      Rate: this.itemDetailForm.get('Rate')?.value,
      quantity: this.itemDetailForm.get('quantity')?.value,
      issuedQuantity: this.itemDetailForm.get('issuedQuantity')?.value
    };

    if (this.itemDetailDataDirect.some(e => e.itemCodeid == obj.itemCodeid)) {
      this.message.add({ severity: 'warn', summary: 'Warning', detail: 'Item already exist.', life: 3000 });
      return;
    }

    if (!obj.Rate || obj.Rate <= 0) {
      this.message.add({ severity: 'warn', summary: 'Warning', detail: 'Price should be greater than 0.', life: 3000 });
      return;
    }

    if (!obj.issuedQuantity || obj.issuedQuantity <= 0) {
      this.message.add({ severity: 'warn', summary: 'Warning', detail: 'Issue quantity should be greater than 0.', life: 3000 });
      return;
    }

    if (obj.issuedQuantity > obj.quantity) {
      this.message.add({ severity: 'warn', summary: 'Warning', detail: 'Issue quantity should be less than or equal to available quantity.', life: 3000 });
      return;
    }

    this.getWarehouseStockLot(obj, 'add', null);
  }


  getWarehouseStockLot(item: any, type: any, index: any) {
    this.isFormLoading = true;
    this.warehouseAction = type;
    this.selectedRow = item;
    this.selectedItemIndex = index;

    let warehouseId = this.materialIssuetForm.get('WarehouseId')?.value;

    this.userService.getQuestionPaper(
      `uspGetItemLotFromWarehouse|warehouseId=${warehouseId}|itemCodeid=${item.itemCodeid}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId}`
    )
      .subscribe(
        (res: any) => {

          this.isFormLoading = false;

          if (!res?.table?.length) {

            this.miInventoryData = [];
            this.totalIssuedStock = 0;

            this.cdr.detectChanges();
            this.warehouseStockDialog = true;

            this.message.add({
              severity: 'warn',
              summary: 'Warning',
              detail: 'Stock not available in warehouse.',
              life: 3000
            });

            return;
          }

          this.miInventoryData = res.table;

          for (let data of this.miInventoryData) {
            this.uoM = data.uoM;
            this.unitId = data.unitId;

            const warehouseItem = this.transferWarehoseData
              .find((e: any) => e.inventoryId == data.id);

            data.issueStock = warehouseItem ? warehouseItem.qty : '';
          }

          if (this.warehouseAction === 'edit') {
            this.totalIssuedStock = Number(item.issuedQuantity);
          }

          this.cdr.detectChanges();
          this.warehouseStockDialog = true;

        },
        (err: any) => {
          this.isFormLoading = false;

          if (err.status === 403) {
            sessionStorage.setItem('userToken', '');
            this.Customvalidation.loginroute(err.status);
          }
        }
      );
  }


  onChangeStock(event: any, item: any, index: any) {
    try {
      const el = document.getElementById('txt_stockIssued_' + index) as HTMLInputElement;
      let stock = el?.value ? Number(el.value) : 0;

      if (stock > item.quantity) {
        setTimeout(() => {
          let remain = '';
          this.totalIssuedStock = this.totalIssuedStock - item.issueStock;
          item.issueStock = remain;

          const el2 = document.getElementById('txt_stockIssued_' + index) as HTMLInputElement;
          if (el2) el2.value = remain;

          this.message.add({
            severity: 'warn',
            summary: 'Warning',
            detail: 'Issued quantity should be less than quantity.',
            life: 3000
          });
        }, 500);
        return;
      }

      item.issueStock = stock;

      const totalIssueStockCount = this.miInventoryData.reduce((total: any, it: any) => {
        return total + (it.issueStock ? Number(it.issueStock) : 0);
      }, 0);

      if (totalIssueStockCount <= this.selectedRow?.issuedQuantity) {
        this.totalIssuedStock = Number(totalIssueStockCount);
      } else {
        this.message.add({
          severity: 'warn',
          summary: 'Warning',
          detail: `Total issued stock should be equal to (${this.selectedRow.issuedQuantity})`,
          life: 3000
        });

        setTimeout(() => {
          item.issueStock = '';
          this.totalIssuedStock = Number(totalIssueStockCount - stock);

          const el3 = document.getElementById('txt_stockIssued_' + index) as HTMLInputElement;
          if (el3) el3.value = '';
        }, 500);
      }

    } catch (error) {
      console.error('Error in onChangeStock:', error);
    }
  }



  onAddWarehose() {
    let warehouseId = this.materialIssuetForm.get(`WarehouseId`)?.value
    let filteredDate = this.miInventoryData.filter((item:any) => item.issueStock != '' && item.issueStock > 0)
    let totalLot = 0
    if (filteredDate.length) {
      totalLot = filteredDate.reduce((sum:any, item:any) => {
        return sum + parseFloat(item.issueStock);  
      }, 0);
    }
    if (totalLot != Number(this.selectedRow?.issuedQuantity)) {
      this.message.add({
        severity: 'warn',
        summary: 'Warning',
        detail: `Total issued stock should be equal to (${this.selectedRow.issuedQuantity})`,
        life: 3000
      });
      return
    }
    if (this.warehouseAction == 'edit') {
      this.transferWarehoseData = this.transferWarehoseData.filter((e:any) => e.itemCodeid != this.selectedRow.itemCodeid);
    }
    filteredDate.map((item:any) => {
      let obj = { "itemCodeid": this.selectedRow.itemCodeid, "warehouseId": warehouseId, "inventoryId": item.id, "qty": item.issueStock, "rate": item.rate ? item.rate : 0 }
      this.transferWarehoseData.push(obj)
    })


    if (this.isDirect) {
      if (this.warehouseAction == 'add') {
        let obj = {
          MaterialMasterId: this.itemDetailForm.get(`MaterialMasterId`)?.value,
          MaterialMaster: this.itemsDrp.find((x: any) => x.drpValue === this.itemDetailForm.get('MaterialMasterId')?.value)?.drpOption ?? '',
          itemCodeid: this.itemDetailForm.get(`itemCodeid`)?.value,
          ItemCode: this.itemsCodeDrp.find((x: any) => x.drpvalue === this.itemDetailForm.get('itemCodeid')?.value)?.drpoption ?? '',
          Rate: this.itemDetailForm.get(`Rate`)?.value,
          quantity: this.itemDetailForm.get(`quantity`)?.value,
          issuedQuantity: this.itemDetailForm.get(`issuedQuantity`)?.value,
          isScrap: this.itemDetailForm.get(`isScrap`)?.value,
          isIssued: 1,
          uoM: this.uoM,
          unitId: this.unitId
        }
        this.itemsCodeDrp = []
        this.itemDetailDataDirect.push(obj)
        this.resetItemform()
      }
    }
    this.closeStockDialog()
  }

  closeStockDialog() {
        this.warehouseStockDialog = false;
        this.selectedRow = null
        this.totalIssuedStock = 0
        this.warehouseAction = 'add'
        this.miInventoryData = []
        this.selectedItemIndex = null
      if (!this.isDirect) {
        if (!this.transferWarehoseData.some((e:any) => e.itemCodeid == this.selectedRow.itemCodeid)) {
          this.itemDetailDataMR[this.selectedItemIndex]['isIssued'] = 0
        }
      }
  }

  resetItemform() {
    this.makerCodeDrp = []
    this.itemDetailForm.reset()
    this.itemDetailForm.patchValue({
      MaterialMasterId: '',
      itemCodeid: '',
      Rate: '0',
      issuedQuantity: '',
      quantity: '0',
      isScrap: [false],
    });
    this.itemDetailForm.get('quantity')?.disable();
    this.materialIssuetForm.get('Rate')?.enable();
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 200)
  }

  clearData() {
    this.materialIssuetForm.reset()
    this.postType = 'add'
    this.sourceDocumentNumberDrp = []
    this.issueToDrp = []
    this.itemDetailDataDirect = []
    this.itemDetailDataMR = []
    this.isDirect = false
    this.selectedRow = null
    this.totalIssuedStock = 0
    this.warehouseAction = 'add'
    this.miInventoryData = []
    this.selectedItemIndex = null
    this.transferWarehoseData = []
    this.materialIssuetForm.get('departmentId')?.enable();
    setTimeout(() => {
      this.materialIssuetForm.patchValue({
        SourceDocumentId: '',
        SourceDocumentNoId: '',
        WarehouseId: '',
        costCenterId: '',
        materialIndentTypeId: '',
        IssueForId: '',
        IssueDate: '',
        IssueToName: '',
        remarks: '',
        departmentId: ''
      })
      this.cdr.detectChanges();
    }, 100);
  }


  onSubmit() {
    if (this.materialIssuetForm.invalid) {
      this.materialIssuetForm.markAllAsTouched();
      return;
    }
    if ((this.itemDetailDataDirect.length == 0 && this.isDirect) || (this.itemDetailDataMR.length == 0 && !this.isDirect)) {
      this.message.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please fill Details for Item Details.',
        life: 3000
      });
      this.paramvaluedata = '';
      return;
    }
    this.paramvaluedata = ''
    let SourceDocumentId = this.materialIssuetForm.get(`SourceDocumentId`)?.value;
    let SourceDocumentNoId = this.materialIssuetForm.get(`SourceDocumentNoId`)?.value;
    let WarehouseId = this.materialIssuetForm.get(`WarehouseId`)?.value;
    let materialIndentTypeId = this.materialIssuetForm.get(`materialIndentTypeId`)?.value;
    let IssueForId = this.materialIssuetForm.get(`IssueForId`)?.value;
    let IssueToName = this.materialIssuetForm.get(`IssueToName`)?.value;
    let IssueDate = this.datePipe.transform(this.materialIssuetForm.get('IssueDate')?.value, 'yyyy-MM-dd');
    let ReturnDate = this.datePipe.transform(this.materialIssuetForm.get('ReturnDate')?.value, 'yyyy-MM-dd');
    let ReturnType = this.materialIssuetForm.get(`ReturnType`)?.value;
    let costCenterId = this.materialIssuetForm.get(`costCenterId`)?.value;
    let Remarks = this.materialIssuetForm.get(`Remarks`)?.value;
    let departmentId = this.materialIssuetForm.get(`departmentId`)?.value;

    let obj = {
      SourceDocumentId: SourceDocumentId,
      IssueDate: IssueDate,
      SourceDocumentNoId: SourceDocumentNoId,
      WarehouseId: WarehouseId,
      CostCenter: costCenterId,
      materialIndentTypeId: materialIndentTypeId,
      IssueForId: IssueForId,
      IssueToId: 0,
      IssueToName: IssueToName ? IssueToName : '',
      ReturnDate: ReturnDate,
      ReturnType: ReturnType,
      Remarks: Remarks,
      departmentId: departmentId ? departmentId : '',
      districtId: sessionStorage.getItem('District')

    };
    let finalchildTableData: any[] = [];
    if (!this.isDirect) {
      for (let i = 0; i < this.itemDetailDataMR.length; i++) {
        if (this.itemDetailDataMR[i].isIssued == 1) {
          if (!this.itemDetailDataMR[i].rate || this.itemDetailDataMR[i].rate <= 0) {
            this.message.add({
              severity: 'warn',
              summary: 'Warning',
              detail: 'Price should be numeric and greater than 0',
              life: 3000
            });
            return;
          }
          if (this.itemDetailDataMR[i].issuedQuantity > this.itemDetailDataMR[i].quantity) {
            this.message.add({
              severity: 'warn',
              summary: 'Warning',
              detail: 'Issue item cannot be greater than Requested Item',
              life: 3000
            });
            return;
          }
          if (this.itemDetailDataMR[i].issuedQuantity > this.itemDetailDataMR[i].availableStock) {
            this.message.add({
              severity: 'warn',
              summary: 'Warning',
              detail: 'Issue item cannot be greater than Available stock',
              life: 3000
            });
            return;
          }
          if (!this.itemDetailDataMR[i].issuedQuantity || this.itemDetailDataMR[i].issuedQuantity <= 0) {
            this.message.add({
              severity: 'warn',
              summary: 'Warning',
              detail: 'Issue item should be numeric and greater than 0',
              life: 3000
            });
            return;
          }
        }
      }
      this.itemDetailDataMR.map(item => {
        let child = {
          MaterialMasterId: item.itemCodeid,
          quantity: item.quantity,
          Rate: item.rate ? item.rate : 0,
          isIssued: item.isIssued,
          issuedQuantity: item.issuedQuantity,
          isScrap: item.isScrap ? 1 : 0,
          unitId: item.unitId
        }
        finalchildTableData.push(child)
      })

    }
    else {
      this.itemDetailDataDirect.map(item => {
        let child = {
          MaterialMasterId: Number(item.itemCodeid),
          quantity: item.issuedQuantity,
          Rate: item.Rate ? item.Rate : 0,
          isIssued: item.isIssued,
          issuedQuantity: item.issuedQuantity,
          isScrap: item.isScrap ? 1 : 0,
          unitId: item.unitId
        }
        finalchildTableData.push(child)
      })
    }
    this.paramvaluedata = `mijson=${JSON.stringify([obj])}|miDjson =${JSON.stringify(finalchildTableData)}|miInventory=${JSON.stringify(this.transferWarehoseData)}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId}|districtId=${sessionStorage.getItem('District')}`
    console.log("this.paramvaluedata==========", this.paramvaluedata);
    this.openConfirmation('Confirm?', "Are you sure you want to proceed?", '1', '1') 
  }


  submitcall() {
    try {
      this.isFormLoading = true;
      this.userService.SubmitPostTypeData('uspPostMaterialIssue', this.paramvaluedata, this.FormName).subscribe({
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

  exportAsXLSXCustom(): void {
    const date = new Date();
    const financialYearStart = this.getFinancialYearStartDate(date);
    let startDate = financialYearStart.toISOString().split('T')[0];
    let currentDate = new Date().toISOString().slice(0, 10)
    let query = `uspReportMaterialIssueData|fromdate=${startDate}|todate=${currentDate}|districtId=${sessionStorage.getItem("District")}`
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

  getFinancialYearStartDate(currentDate: any) {
    const year = currentDate.getFullYear();
    const startMonth = 3;
    let startDate = new Date(Date.UTC(year, startMonth, 1));
    if (currentDate < startDate) {
      startDate = new Date(Date.UTC(year - 1, startMonth, 1));
    }

    return startDate;
  }

  deleteRecord(item:any, index:any) {
    this.itemDetailDataDirect.splice(index, 1);
    this.transferWarehoseData = this.transferWarehoseData.filter((e:any) => e.itemCodeid != item.itemCodeid)

  }

  onItemAction(item: any, type: any) {
    let action = type == 'Delete' ? 'Delete' : type;
    this.selectedAction = type
    this.openConfirmation('Confirm?', "Are you sure you want to " + action + "?", item.id, '2')
  }

  actionSubmit(id: any) {
    try {
      this.isFormLoading = true;
      this.userService.CustomFormActionActivesubmit(id, this.selectedAction, 'tblMaterialIssue', this.FormName).subscribe({
        next: (datacom: any) => {
          this.isFormLoading = false;
          try {
            if (!datacom) return;
            const resultarray = datacom.split('-');
            if (resultarray[1] === 'success') {
              this.pageNo = 1;
              this.getTableData(true);
              this.message.add({
                severity: 'success',
                summary: 'Success',
                detail: `Data ${this.selectedAction} successfully.`,
                life: 3000
              });
              this.onDrawerHide();
              this.selectedAction = null
            } else {
              this.message.add({
                severity: 'warn',
                summary: 'Warning',
                detail: resultarray[1] || datacom,
                life: 3000
              });
              this.selectedAction = null
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
        error: (err:any) => {
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
              detail: `Failed to ${this.selectedAction} data. Please try again later.`,
              life: 3000
            });
          }
        }
      });
    } catch (error) {
      console.error('Unexpected error in deleteData():', error);
      this.isFormLoading = false;
    }
  }

  printFormMaterialIssue(id: any) {
    this.userService.getQuestionPaper(`uspGetMaterialIssuePrintData|materialIssueId=${id}`).subscribe(
      (data: any) => {
        if (data.table.length > 0) {
          const html = `
           <div style="border:1px solid black;margin:12px;padding: 12px;">
             <table style="width:100%;margin-top: 2rem;margin-bottom:-15;align-items:center">
                     <tr style="align-items:center;">
                     <td style="width: 100%;text-align:center">
                       <h1 style="font-size: 22px; margin-bottom:0;">${data.table[0].orgName}</h1>
                     </td>
                   </tr>
     
                   <tr>
                     <td style="width: 100%;text-align:center">
                       <h2 style="font-size: 18px;">${data.table[0].address},Email:-${data.table[0].email}</h2>
                     </td>
                   </tr>
     
                     <tr style="border:1px solid black;width:100%">
                       <td>
                         <h1 style="font-size: 22px; max-width: 400px; margin: auto; margin-top: 5px; margin-bottom: 5px; padding: 10px; border: 1px solid #000000; box-shadow: 5px 5px 5px #000000; text-align: center;">Material Issue Slip
                         </h1>
                       </td>
                     </tr>
           </table>
     
     
     
             <table style="width:100%;margin-top: 2rem; border:1px solid black;border-collapse:collapse">
               
            
               ${data.table.map((itmdata:any, item:any) => `
               <tr style="border:1px solid black ;border-collapse: collapse;">
                 <th style="border:1px solid black ;border-collapse: collapse; padding: 5px 10px;">Issue No</th>
                 <th style="border:1px solid black ;border-collapse: collapse;text-align: left; padding: 5px 10px;">${itmdata['issue NO.']}</th>
                 <th style="border:1px solid black ;border-collapse: collapse; padding: 5px 10px;">DATE</th>
                 <th style="border:1px solid black ;border-collapse: collapse;text-align: left; padding: 5px 10px;">${itmdata.date}</th>
               </tr>
             
            
               <tr style="border:1px solid black ;border-collapse: collapse;" >
                 <td style="border:1px solid black ;border-collapse: collapse; padding: 5px 10px;">DIVISION NAME</td>
                 <td style="border:1px solid black ;border-collapse: collapse; padding: 5px 10px;">${itmdata['division NAME']}</td>
                 <td style="border:1px solid black ;border-collapse: collapse; padding: 5px 10px;">PERSON NAME</td>
                 <td style="border:1px solid black ;border-collapse: collapse; padding: 5px 10px;">${itmdata['person NAME']}</td>
     
               </tr>
     
               <tr style="border:1px solid black ;">
                 <td style="border:1px solid black ;border-collapse: collapse; padding: 5px 10px;">DEPT. NAME</td>
                 <td style="border:1px solid black ;border-collapse: collapse; padding: 5px 10px;">${itmdata['department']}</td>
                 <td style="border:1px solid black ;border-collapse: collapse; padding: 5px 10px;">RETURN TYPE</td>
                 <td style="border:1px solid black ;border-collapse: collapse; padding: 5px 10px;">${itmdata['returnType']}</td>
     
             </tr> 
     
             <tr style="border:1px solid black ;border-collapse: collapse;">
               <td style="border:1px solid black ;border-collapse: collapse; padding: 5px 10px;">ISSUE TO</td>
               <td style="border:1px solid black ;border-collapse: collapse; padding: 5px 10px;">${itmdata['issue TO']}</td>
               <td style="border:1px solid black ;border-collapse: collapse; padding: 5px 10px;">RETURN DATE</td>
               <td style="border:1px solid black ;border-collapse: collapse; padding: 5px 10px;">${itmdata['returnDate']}</td>
     
     
             </tr> 
             
             <tr style="border:1px solid black ;border-collapse: collapse;">
                     <td style="border:1px solid black ;border-collapse: collapse; padding: 5px 10px;">WAREHOUSE</td>
                     <td style="border:1px solid black ;border-collapse: collapse; padding: 5px 10px;">${itmdata['warehouse']}</td>
                     <td style="border:1px solid black ;border-collapse: collapse; padding: 5px 10px;">ISSUE TYPE</td>
                     <td style="border:1px solid black ;border-collapse: collapse; padding: 5px 10px;"> ${itmdata['issueType']}</td>
             </tr>
             <tr style="border:1px solid black ;border-collapse: collapse;">
               <td style="border:1px solid black ;border-collapse: collapse; padding: 5px 10px;">REFERENCE NO</td>
               <td style="border:1px solid black ;border-collapse: collapse; padding: 5px 10px;">${itmdata['refNo'] ? itmdata['refNo'] : ''}</td>
               <td style="border:1px solid black ;border-collapse: collapse; padding: 5px 10px;">SOURCE DOCUMENT</td>
               <td style="border:1px solid black ;border-collapse: collapse; padding: 5px 10px;"> ${itmdata['sourceDoc'] ? itmdata['sourceDoc'] : ''}</td>
             </tr>
             `).join('')}
             </table>
     
             <table  style="width:100%;margin-top: 2rem;border-collapse: collapse;">
             <tr style="border:1px solid black ;border-collapse: collapse;">
             <th style="border:1px solid black ;border-collapse: collapse;text-align: center; padding: 5px 10px;">S.No</th>
             <th style="border:1px solid black ;border-collapse: collapse;text-align: center; padding: 5px 10px;"> Item Description</th>
             <th style="border:1px solid black ;border-collapse: collapse;text-align: center; padding: 5px 10px;">Uom</th>
             <th style="border:1px solid black ;border-collapse: collapse;text-align: center; padding: 5px 10px;">Required Qty</th>
             <th style="border:1px solid black ;border-collapse: collapse;text-align: center; padding: 5px 10px;">Issued Qty</th>      
             <th style="border:1px solid black ;border-collapse: collapse;text-align: center; padding: 5px 10px;">Cost Center</th>
             <th style="border:1px solid black ;border-collapse: collapse;text-align: center; padding: 5px 10px;">Action</th>
             </tr>
             ${data.table1.map((itmdata:any, item:any) => `
     
             <tr style="border:1px solid black ;border-collapse: collapse;">
                 <td style="border:1px solid black ;border-collapse: collapse;text-align: center; padding: 5px 10px;">${item + 1}</td>
                 <td style="border:1px solid black ;border-collapse: collapse;text-align: center; padding: 5px 10px;"> ${itmdata['item Description']}
                 </td>
                 <td style="border:1px solid black ;border-collapse: collapse;text-align: center; padding: 5px 10px;">${itmdata['uom']}</td>
                 <td style="border:1px solid black ;border-collapse: collapse;text-align: center; padding: 5px 10px;">${itmdata['qty']}</td>
                 <td style="border:1px solid black ;border-collapse: collapse;text-align: center; padding: 5px 10px;">${itmdata['issuedQty']}</td>            
                 <td style="border:1px solid black ;border-collapse: collapse;text-align: center; padding: 5px 10px;">${itmdata['cost Center']}</td>
                 <td style="border:1px solid black ;border-collapse: collapse;text-align: center; padding: 5px 10px;">${itmdata['status']}</td>
             </tr>
             
             `).join('')}
             <tr style="border:1px solid black ;border-collapse: collapse;">
               <td colspan="6" style="padding: 5px 10px;">
                 <span style="font-weight:600;">Remark:</span> ${data.table[0]['remarks'] ? data.table[0]['remarks'] : ''}
               </td>
             </tr>
             </table>
             ${data.table.map((itmdata:any, item:any) => `
             <table style="width:100%; border-collapse: collapse;">
             </table>
             
             <table style="width:100%; border:1px solid black;margin-top:5rem">
             
               <tr>
                   <th style="border: none; padding: 5px 10px;">Authorised By: <span style="font-weight:400;">${itmdata['authorized By']}</span></th>
                   <th style="border: none; padding: 5px 10px;">Issued By:</th>
                   <th style="border: none; padding: 5px 10px;">Received By:</th>
               </tr>
     
               `).join('')}
             </table>
             
           </div>
           `

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
      });
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
