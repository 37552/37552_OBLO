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
  selector: 'app-material-request',
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
  templateUrl: './material-request.html',
  styleUrl: './material-request.scss'
})
  
export class MaterialRequest {
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
  materialRequestForm: FormGroup;
  itemDetailForm: FormGroup;
  totalCount = 0;
  initalStateDrp: any = [];
  divisionDrp: any = [];
  warehouseDrp: any = [];
  costCenterDrp: any = [];
  requestTypeDrp: any = [];
  departmentDrp: any = [];
  itemsDataDrp: any = [];
  makerCodeDrp: any = [];
  makeDrp: any = [];
  uomDrp: any = [];
  requestedByDrp: any = [];
  itemDailog: boolean = false;
  selectedTable = ''
  selectedItem: any = []
  selectedRowDetails: any[] = [];
  searchValue: string = '';
  itemDetailsArray: any[] = [];
  formlable: string = '';
  modelHeading: string = ''
  recordViewData: any[] = [];
  recordHeaderViewData: any = [];
  printDialog: boolean = false;
  printContent: SafeHtml | string = '';
  selectedAction: any = null;
  showDeleteBtn: boolean = false;
  selectedItemEdit: any = null;

  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true, },
    { key: 'serialNo', header: 'Material Request No', isVisible: true, isSortable: false },
    { key: 'mrStatus', header: 'MR Status', isVisible: true, isSortable: false },
    { key: 'requireDate', header: 'Required Date', isVisible: true, isSortable: false },
    { key: 'divisionName', header: 'Division', isVisible: true, isSortable: false },
    { key: 'wareHouse', header: 'Warehouse', isVisible: true, isSortable: false },
    { key: 'costCenter', header: 'Cost Center', isVisible: true, isSortable: false },
    { key: 'materialIndentType', header: 'Request Type', isVisible: true, isSortable: false },
    { key: 'departmentName', header: 'Department', isVisible: true, isSortable: false },
    { key: 'requestedByName', header: 'Requested Name', isVisible: true, isSortable: false },
    { key: 'sourceDocNo', header: 'Source No', isVisible: true, isSortable: false },
    { key: 'requisitionPrupose', header: 'Remarks', isVisible: true, isSortable: false },
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

    this.materialRequestForm = this.fb.group({
      documentStatusId: ['', [Validators.required]],
      divisionId: ['', [Validators.required]],
      warehouseId: ['', [Validators.required]],
      costCenterId: ['', [Validators.required]],
      materialIndentTypeId: ['', [Validators.required]],
      departmentId: ['', [Validators.required]],
      requestedByName: ['', [Validators.required]],
      requiredDate: [''],
      remarks: [''],
    });

    this.itemDetailForm = fb.group({
      itemId: ['', [Validators.required]],
      itemCodeid: ['', [Validators.required]],
      makeId: [''],
      size: [''],
      quantity: ['', [Validators.required]],
      itemPrice: ['0', [Validators.required]],
      uom: ['', [Validators.required]],
      remarks: [''],
      availableQuantity: ['0'],
    })

  }

  get f() { return this.materialRequestForm.controls }

  get f1() { return this.itemDetailForm.controls; }
  

  ngOnInit(): void {
    this.param = sessionStorage.getItem('menuItem') ?? '';
    let paramjs = JSON.parse(this.param);
    this.menulabel = paramjs.menu;
    this.FormName = paramjs.formName;
    this.FormValue = paramjs.formValue;
    this.getTableData(true)
    this.getDivisionData();
    this.getWarehouseData();
    this.getRequestTypeData();
    this.getRequestByData();
    this.getmakeData();
    this.getMrStatusDrp();
    this.getUomData();
    this.departmentloaddrp();
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

  getDivisionData() {
    try {
      this.userService.getPurchasePageLoadDrp(this.FormName, `uspGetFillDrpDown|table=tblDivisonNameMaster|filterColumn=districtId|filterValue=${sessionStorage.getItem('District')}`)
        .subscribe({
          next: (res: any) => {
            try {
              this.divisionDrp = res;
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

  getWarehouseData() {
    try {
      this.userService.BindWarehouse(this.FormName).subscribe({
          next: (res: any) => {
            try {
              this.warehouseDrp = res
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

  getRequestTypeData() {
    try {
      this.userService.getPurchasePageLoadDrp(this.FormName, 'uspGetFillDrpDown|table=tblMaterialIndentTypeMaster|filterColumn=|filterValue=')
        .subscribe({
          next: (res: any) => {
            try {
              this.requestTypeDrp = res;
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

  getRequestByData() {
    try {
      this.userService.getPurchasePageLoadDrp(this.FormName, 'uspGetFillDrpDown|table=tblEmployeeMaster|filterColumn=|filterValue=')
        .subscribe({
          next: (res: any) => {
            try {
              this.requestedByDrp = res;
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

  getUomData() {
    try {
      this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblUnitMaster|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId}`)
        .subscribe({
          next: (res: any) => {
            try {
              this.uomDrp = res['table']
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

  getMrStatusDrp() {
    try {
      this.userService.getQuestionPaper(`UspGetStatusMaster|appUserId=${sessionStorage.getItem('userId')}|page=${this.formlable}`)
        .subscribe({
          next: (res: any) => {
            try {
              this.initalStateDrp = res['table']
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

  requestTypeChange(action?: any) {
    try {
      if (this.itemDetailsArray.length === 0 || action) {
        const id = this.materialRequestForm.get('materialIndentTypeId')?.value;
        this.resetItemform();
        this.userService.getQuestionPaper(`uspGetItemsByRequestType|IssueTypeID=${id}`)
          .subscribe({
            next: (res: any) => {
              try {
                this.itemsDataDrp = res['table'];
              } catch (innerErr) {
                console.error('Error processing items response:', innerErr);
              }
            },
            error: (err: any) => {
              console.error('Error fetching items data:', err);
              this.cdr.detectChanges();
            },
            complete: () => {
              this.cdr.detectChanges();
            }
          });

      } else {
        this.openConfirmation( 'Alert?', "Material request can be done for one request type at a time. \n Do you really want to proceed?", 1, '4');
      }

    } catch (err) {
      console.error('Unexpected error in requestTypeChange:', err);
      this.cdr.detectChanges();
    }

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 1000);
  }

  getmakeData() {
    this.isLoading = true;
    try {
      this.userService.getPurchasePageLoadDrp(this.FormName, 'uspGetFillDrpDown|table=tblMakeMaster|filterColumn=|filterValue=')
        .subscribe({
          next: (res: any) => {
            try {
              this.makeDrp = res;
            } catch (innerErr) {
              console.error('Error processing dropdown response:', innerErr);
            }
          },
          error: (err: any) => {
            console.error('Error fetching dropdown data:', err);
            this.isLoading = false;
            this.cdr.detectChanges();
          },
          complete: () => {
            this.isLoading = false;
            this.cdr.detectChanges();
          },
        });
    } catch (err) {
      console.error('Unexpected error in getDropDownData:', err);
      this.isLoading = false;
      this.cdr.detectChanges();
    }

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  departmentloaddrp() {
    try {
      this.userService.getPurchasePageLoadDrp(this.FormName, 'uspGetFillDrpDown|table=tblDepartmentMaster|filterColumn=|filterValue=')
        .subscribe({
          next: (res: any) => {
            try {
              this.departmentDrp = res
            } catch (innerErr) {
              console.error('Error processing dropdown response:', innerErr);
            }
          },
          error: (err:any) => {
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

  getCostCenterData(costCenterId?: any) {
    try {
      let divisionId = this.materialRequestForm.get(`divisionId`)?.value
      this.userService.getPurchasePageLoadDrp(this.FormName, `uspGetFillDrpDown|table=tblCostCenter|filterColumn=divisionNameId|filterValue=${divisionId}`)
        .subscribe({
          next: (res: any) => {
            try {
              this.costCenterDrp = res;
              if (costCenterId) {
                this.materialRequestForm.patchValue({
                  costCenterId: costCenterId.toString()
                })
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
      console.error('Unexpected error in getDropDownData:', err);
      this.cdr.detectChanges();
    }

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 1000);
  }

  isInvalid(controlName: string): boolean {
    const forms: FormGroup[] = [
      this.materialRequestForm,
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

      this.userService.getQuestionPaper(`uspGetMaterialRequestNew|${query}`).subscribe({
        next: (res: any) => {
          try {
            this.data = res?.table1 || [];
            this.totalCount = res?.table?.[0]?.totalCnt || this.data.length;
            if (res['table3'] && res['table3'].length) {
              this.showDeleteBtn = res['table3'][0]['deleteBtn']
            }

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

    this.selectedItem = data.id;

    if (view === 'add') {
      this.materialRequestForm.reset();
      this.materialRequestForm.enable();
      return;
    }

    if (view === 'view') {
      this.materialRequestForm.disable();
    } else {
      this.materialRequestForm.enable();
      this.itemDetailForm.get('availableQuantity')?.disable();
      this.materialRequestForm.get('documentStatusId')?.disable();
      this.materialRequestForm.get('materialIndentTypeId')?.disable();
    }

    let formattedRequiredDate: Date | null = null;
    if (data.requireDate1) {
      const parts = data.requireDate1.split('-');
      formattedRequiredDate = new Date(+parts[0], +parts[1] - 1, +parts[2]);
    }

      this.materialRequestForm.patchValue({
        documentStatusId: data.documentStatusId,
        requiredDate: formattedRequiredDate,
        divisionId: data.divisionId?.toString() ?? '',
        warehouseId: data.warehouseId?.toString() ?? '',
        materialIndentTypeId: data.materialIndentTypeId?.toString() ?? '',
        departmentId: data.departmentId?.toString() ?? '',
        requestedByName: data.requestedByName ?? '',
        remarks: data.requisitionPrupose ?? '',
        costCenter: data.costCenterId?.toString() ?? '',
      });

      this.itemDetailsArray = JSON.parse(data.itemDetails ?? '[]');

      this.getCostCenterData(data.costCenterId ?? 0);
      this.requestTypeChange(true)
      this.cdr.detectChanges();
  
    document.body.style.overflow = 'hidden';
  }

  clearChildForm() {
    this.selectedItemEdit = null
    this.itemDetailForm.reset()
    this.itemDetailForm.patchValue({
      itemId: '',
      itemCodeid: '',
      makeId: '',
      size: '',
      quantity: '',
      itemPrice: '0',
      uom: '',
      remarks: '',
      availableQuantity: '0'
    });
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
    this.materialRequestForm.enable();
    this.materialRequestForm.reset();
    this.itemDetailsArray = [];
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
          this.itemDetailsArray.splice(id, 1);
        }
        else if (option === '1') {
          this.submitcall();
        }
        else if (option === '2') {
          this.actionSubmit(id)
        }
        else if (option == '4') {
          this.itemDetailsArray = []
          this.requestTypeChange();
        }  
        else if (option === '5') {
          this.materialRequestForm.reset();
        }
      }
    });
  }

  onClear() {
    this.materialRequestForm.reset();
    this.itemDetailsArray = [];
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

  getMakerCode(itemCodeid?: any) {
    const itemId = this.itemDetailForm.get('itemId')?.value ?? 0;
    this.userService.getQuestionPaper(`uspGetMatReqMasters|action=MAKERCODE|itemId=${itemId}`)
      .subscribe(
        (res: any) => {
          try {
            this.makerCodeDrp = res['table'];
             if (itemCodeid) {
              this.itemDetailForm.patchValue({
                itemCodeid: itemCodeid,
              })  
             } else {
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
            }
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


  getItemPrice() {
    try {
      const warehouseId = this.materialRequestForm.get('warehouseId')?.value;
      if (!warehouseId) {
        this.message.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'Please select warehouse.',
          life: 3000
        });

        this.itemDetailForm.patchValue({
          itemCodeid: ''
        });

        setTimeout(() => {
          this.cdr.detectChanges();
        }, 100);

        return;
      }

      const makeCodeId = this.itemDetailForm.get('itemCodeid')?.value;
      this.userService.getQuestionPaper(`uspBindItemQty|warehouseId=${warehouseId}|itemId=${makeCodeId}`)
        .subscribe(
          (res: any) => {
            try {
              setTimeout(() => {
              }, 500);

              const selectedmakeId = this.makerCodeDrp?.find((e:any) => e.drpvalue == makeCodeId);

              const table = res?.table ?? [];
              if (table.length > 0) {
                const quantity = table[0]?.qty ?? 0;
                const rate = table[0]?.rate ?? 0;
                this.itemDetailForm.patchValue({
                  itemPrice: rate,
                  availableQuantity: quantity,
                  makeId: selectedmakeId?.makeId?.toString() ?? ''
                });

                if (rate > 0) {
                  this.itemDetailForm.get('itemPrice')?.disable();
                } else {
                  this.itemDetailForm.get('itemPrice')?.enable();
                }
              } else {
                this.itemDetailForm.patchValue({
                  itemPrice: 0,
                  availableQuantity: 0,
                  makeId: selectedmakeId?.makeId?.toString() ?? ''
                });

                this.itemDetailForm.get('itemPrice')?.enable();
              }

              setTimeout(() => {
                this.cdr.detectChanges();
              }, 500);
            } catch (innerError) {
              console.error('Error inside success block (getItemPrice):', innerError);
            }
          },
          (err: HttpErrorResponse) => {

            if (err.status === 403) {
              console.warn('You are not authorized.');
            }

            console.error('API error in getItemPrice():', err);
          }
        );
    } catch (err) {
      console.error('Unexpected error in getItemPrice():', err);
    }
  }

  AddRow() {
    if (this.itemDetailForm.invalid) {
      this.itemDetailForm.markAllAsTouched();
      return;
    }

    const obj: any = {
      itemId: this.itemDetailForm.get('itemId')?.value,
      itemDesc: this.itemsDataDrp.find((x: any) => x.drpValue === this.itemDetailForm.get('itemId')?.value)?.drpOption ?? '',
      itemCodeid: this.itemDetailForm.get('itemCodeid')?.value,
      MakerCode: this.makerCodeDrp.find((x: any) => x.drpvalue === this.itemDetailForm.get('itemCodeid')?.value)?.drpoption ?? '',
      makeId: this.itemDetailForm.get('makeId')?.value,
      Make: this.makeDrp.find((x: any) => x.drpValue === this.itemDetailForm.get('makeId')?.value)?.drpOption ?? '',
      uom: this.itemDetailForm.get('uom')?.value,
      uomText: this.uomDrp.find((x: any) => x.drpValue === this.itemDetailForm.get('uom')?.value)?.drpOption ?? '',
      itemPrice: this.itemDetailForm.get('itemPrice')?.value,
      quantity: this.itemDetailForm.get('quantity')?.value,
      size: this.itemDetailForm.get('size')?.value,
      remarks: this.itemDetailForm.get('remarks')?.value
    };

    if (!obj.itemPrice || obj.itemPrice <= 0) {
      this.message.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Price must be greater than 0.',
        life: 3000
      });
      return;
    }

    if (!obj.quantity || obj.quantity <= 0) {
      this.message.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Quantity must be greater than 0.',
        life: 3000
      });
      return;
    }

    if (this.selectedItemEdit) {
      const duplicate = this.itemDetailsArray.some( e => e.itemCodeid === obj.itemCodeid && e.id !== this.selectedItemEdit.id);

      if (duplicate) {
        this.message.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'Item with maker code already exist.',
          life: 3000
        });
        return;
      }

      obj.id = this.selectedItemEdit.id;
      this.itemDetailsArray = this.itemDetailsArray.map(row => row.id === this.selectedItemEdit.id ? obj : row);
    }

    else {
      if (this.itemDetailsArray.some(e => e.itemCodeid === obj.itemCodeid)) {
        this.message.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'Item with maker code already exist.',
          life: 3000
        });
        return;
      }

      obj.id = 0; 
      this.itemDetailsArray.push(obj);
    }
    this.selectedItemEdit = null
    this.resetItemform();
  }


  resetItemform() {
    this.makerCodeDrp = []
    this.itemDetailForm.reset()
    this.itemDetailForm.patchValue({
      itemId: '',
      itemCodeid: '',
      makeId: '',
      size: '',
      quantity: '',
      itemPrice: '0',
      uom: '',
      remarks: '',
      availableQuantity: '0'

    });

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 100)
  }

  clearData() {
    this.materialRequestForm.reset()
    this.itemDetailsArray = []
    this.selectedItem = null
    this.postType = 'add'
    setTimeout(() => {
      this.materialRequestForm.patchValue({
        documentStatusId: '',
        divisionId: '',
        warehouseId: '',
        costCenterId: '',
        materialIndentTypeId: '',
        departmentId: '',
        requiredDate: '',
        remarks: '',
        requestedByName: '',
      })
      this.cdr.detectChanges();
    }, 100);
  }

  editRow(item: any) {
    this.selectedItemEdit = item
    this.itemDetailForm.patchValue({
      itemId: item.itemId ? item.itemId : '',
      makeId: item.makeId.toString() ? item.makeId.toString() : '',
      size: item.size ? item.size : '',
      quantity: item.quantity ? item.quantity : '',
      itemPrice: item.itemPrice ? item.itemPrice : '',
      uom: item.uom ? item.uom : '',
      remarks: item.remarks ? item.remarks : '',
      availableQuantity: item.availableQty

    });
    this.getMakerCode(item.itemCodeid ? item.itemCodeid : 0)

  }

  deleteChildTableRow(index: number, event?: any) {
    this.openConfirmation('Confirm', 'Are you sure you want to remove?', index, 'delete', event);
  }

  OnSubmitModal(event: any) {
    if (this.materialRequestForm.invalid) {
      this.materialRequestForm.markAllAsTouched();
      return;
    }

    if (this.itemDetailsArray.length === 0) {
      this.message.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please add item details!',
        life: 3000
      });
      this.paramvaluedata = '';
      return;
    }

    this.paramvaluedata = '';
    const requiredDate = this.materialRequestForm.value.requiredDate ? this.datePipe.transform(this.materialRequestForm.value.requiredDate, 'yyyy-MM-dd') : '';
    const obj: any = {
      documentStatusId: this.materialRequestForm.get('documentStatusId')?.value,
      text: '',
      requiredDate,
      districtID: sessionStorage.getItem('District'),
      divisionId: this.materialRequestForm.get('divisionId')?.value,
      warehouseId: this.materialRequestForm.get('warehouseId')?.value,
      costCenter: this.materialRequestForm.get('costCenterId')?.value,
      materialIndentTypeId: this.materialRequestForm.get('materialIndentTypeId')?.value,
      departmentId: this.materialRequestForm.get('departmentId')?.value,
      requestedByName: this.materialRequestForm.get('requestedByName')?.value,
      remarks: this.materialRequestForm.get('remarks')?.value || '',
      requestedBy: 0
    };

    if (this.postType === 'update') {
      obj.id = this.selectedItem;
      this.paramvaluedata = `MatReqMainId=${this.selectedItem}` + `|MRJson=${JSON.stringify([obj])}` + `|MRJsonChild=${JSON.stringify(this.itemDetailsArray)}` + `|appUserId=${sessionStorage.getItem('userId')}`;}

    else {
    this.paramvaluedata = `MRJson=${JSON.stringify([obj])}` + `|MRJsonChild=${JSON.stringify(this.itemDetailsArray)}` + `|appUserId=${sessionStorage.getItem('userId')}`;}
    this.openConfirmation('Confirm?','Are you sure you want to proceed?', '1', '1', event);
  }

  submitcall() {
    if (this.isFormLoading) return;
    this.isFormLoading = true;
    const apiName = this.postType === 'update' ? 'uspPostMaterialRequestAmmendment' : 'uspPostMaterialRequest';
    this.userService.SubmitPostTypeData(apiName, this.paramvaluedata, this.FormName)
      .subscribe({
        next: (datacom: any) => {
          this.isFormLoading = false;

          if (!datacom) return;

          const resultarray = datacom.split('-');

          if (resultarray[1] === 'success') {
            this.getTableData(false);

            this.message.add({
              severity: 'success',
              summary: 'Success',
              detail:
                this.postType === 'update'
                  ? 'Data Updated Successfully.'
                  : 'Data Saved Successfully.',
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
        },
        error: (err) => {
          this.isFormLoading = false;

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
              detail: 'Something went wrong.',
              life: 3000
            });
          }
        }
      });
  }


  onItemAction(item: any, type: any) {
    let action = type == 'Delete' ? 'Delete' : type;
    this.selectedAction = type
    this.openConfirmation('Confirm?', "Are you sure you want to " + action + "?", item.id, '2')
  }

  actionSubmit(id:any): void {
    try {
      this.isFormLoading = true;
      this.userService.CustomFormActionActivesubmit(id, this.selectedAction, 'tblPurchaseOrderHeader', this.FormName).subscribe({
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
        error: (err: any) => {
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


  exportAsXLSXCustom(): void {
    const date = new Date();
    const financialYearStart = this.getFinancialYearStartDate(date); 
    let startDate = financialYearStart.toISOString().split('T')[0];
    let currentDate = new Date().toISOString().slice(0, 10)
    let query = `uspMRexcelDownload|fromdate=${startDate}|todate=${currentDate}|districtId=${sessionStorage.getItem("District")}`
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
  getFinancialYearStartDate(currentDate:any) {
    const year = currentDate.getFullYear();
    const startMonth = 3; 
    let startDate = new Date(Date.UTC(year, startMonth, 1));
    if (currentDate < startDate) {
      startDate = new Date(Date.UTC(year - 1, startMonth, 1));
    }

    return startDate;
  } 

  printFormMaterialRequest(id:any) {

    this.userService.getQuestionPaper(`uspGetMaterialRequestPrintData|MRId=${id}`).subscribe(
      (data: any) => {
        if (data.table.length > 0) {
          const html = `
           <div style="border:1px solid black;margin:12px; padding:12px">
           <table style="width:100%;margin-top:0; border:1px solid black;border-collapse:collapse;">
   
   
           ${data.table.map((itmdata:any, item:any) => `
           
             <tr style="border:1px solid black ;border-collapse: collapse; width: 500px;align-items: center;justify-content: center;">
               <h5 style="text-align:center ;margin:0;font-size:20px; text-transform:uppercase;">${itmdata['orgName']}</h5>
               <h5  style="text-align:center ;font-size: 15px;text-transform:uppercase; margin: 0;">${itmdata['address']}</h5>
               <h5  style="text-align:center ;font-size: 13px; margin: 0;">${itmdata['email']}</h5>
               <h5  style="text-align:center ;font-size: 13px; margin: 0;">${itmdata['phone']}</h5>
             </tr>
   
   
              <tr style="border:1px solid black ;border-collapse: collapse;">
   
               <div style="font-size:18px; margin-top: 1rem;border:1px solid;height: 60px;width:100%;align-items: center;display:flex;justify-content: center;border-bottom:0;">
                 <div style="width:300px;height: 35px;border: 1px solid; display:flex;justify-content: center;align-items: center; box-shadow: 5px 5px 8px black"><b>Material Request</b></div>
               </div>
               
              </tr> 
          
             <tr style="border:1px solid black ;border-collapse: collapse;" >
               <td style="border:1px solid black ;border-collapse: collapse;border: none; padding: 5px 10px;">Requisition No.</td>
               <td style="border:1px solid black ;border-collapse: collapse;border: none; padding: 5px 10px;">${itmdata['requisitionNo']}</td>
               <td style="border:1px solid black ;border-collapse: collapse;border: none; padding: 5px 10px;">Requisition Date</td>
               <td style="border:1px solid black ;border-collapse: collapse;border: none; padding: 5px 10px;">${itmdata['requisitionDate']}</td>
   
             </tr>
   
             <tr style="border:1px solid black ;">
               <td style="border:1px solid black ;border-collapse: collapse;border: none; padding: 5px 10px;">Department Name</td>
               <td style="border:1px solid black ;border-collapse: collapse;border: none; padding: 5px 10px;">${itmdata['department']}</td>
               <td style="border:1px solid black ;border-collapse: collapse;border: none; padding: 5px 10px;">MR Status </td>
               <td style="border:1px solid black ;border-collapse: collapse;border: none; padding: 5px 10px;">${itmdata['mrStatus']}</td>
   
           </tr> 
   
           <tr style="border:1px solid black ;border-collapse: collapse;">
             <td style="border:1px solid black ;border-collapse: collapse;border: none; padding: 5px 10px;">Requested By</td>
             <td style="border:1px solid black ;border-collapse: collapse;border: none; padding: 5px 10px;">${itmdata['requestedBy']}</td>
   
           </tr> 
           
           `).join('')}
           </table>
   
           <div class="table-responsive">
   
           <table  style="border:1px solid black;width:100%;margin-top: 2rem;border-collapse: collapse;">
           
   
   
           <tr>
             <td style="border:1px solid;text-align: center; padding: 5px 10px;"  rowspan="2">S.No</td>
             <td style="border:1px solid;text-align: center; padding: 5px 10px;" rowspan="2">Item Code</td>
             <td style="border:1px solid;text-align: center; padding: 5px 10px;" rowspan="2">Item Description</td>
             <td style="border:1px solid;text-align: center; padding: 5px 10px;" rowspan="2">UOM</td>
             <td style="border:1px solid;text-align: center; padding: 5px 10px;" rowspan="2">Qty. Required</td>
             <td style="border:1px solid;text-align: center; padding: 5px 10px;" colspan="2">Scheduler</td>
         
             <td style="border:1px solid;text-align: center; padding: 5px 10px;" rowspan="2" >Cost Center</td>
   
           </tr>
           <tr>
           <td style="border:1px solid;text-align: center; padding: 5px 10px;"> Date</td>
           <td style="border:1px solid;text-align: center; padding: 5px 10px;">Qty</td>
           </tr>
   
   
           ${data.table1.map((itmdata:any, item:any) => `
           <tr >
           <td style="border:1px solid;text-align: center; padding: 5px 10px;">${item + 1}</td>
           <td style="border:1px solid;text-align: center; padding: 5px 10px;">${itmdata['itemCode']}</td>
           <td style="border:1px solid; padding: 5px 10px;">${itmdata['itemDescription']}</td>
           <td style="border:1px solid;text-align: center; padding: 5px 10px;">${itmdata['uom']}</td>
           <td style="border:1px solid;text-align: center; padding: 5px 10px;">${itmdata['quantity']}</td>
           <td style="border:1px solid;text-align: center; padding: 5px 10px;">${itmdata['date']}</td>
           <td style="border:1px solid;text-align: center; padding: 5px 10px;">${itmdata['quantity']}</td>
           <td style="border:1px solid;text-align: center; padding: 5px 10px;">${itmdata['costCenter']}</td>
           </tr>      
           `).join('')}
           </table>
           <br>
          
           <table style="width:100%; border-collapse: collapse;">
           
           ${data.table.map((itmdata:any, item:any) => `
           <tr>
               <th colspan="2" style="border: 1px solid; text-align: left; padding: 5px 10px;">Remarks:${itmdata['remarks']}</th>
           </tr>
           `).join('')}
           </table>
           
           ${data.table.map((itmdata:any, item:any) => `
           <table style="width:100%; border:1px solid black;margin-top:5rem">
           
             <tr>
             <th>
             <table style="width:100%">
             <tr>
             <th colspan="2" style="text-align:right; padding: 5px 10px;">${itmdata['approvedBy']}</th>
             </tr>
             <tr>
             <th colspan="2" style="text-align:right; padding: 5px 10px;">${itmdata['orgName']}</th>
             </tr>
             <tr>
             <td width="50%;" style="text-align:left; padding: 5px 10px;">Prepared By:${itmdata['preparedBy']}</td>
             <td width="50%;" style="text-align:right; padding: 5px 10px;">Authorised Signatory:</td>
             </tr>
             </table>
             </th> 
             </tr>
   
           
           </table>
   
           `).join('')}
           
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
