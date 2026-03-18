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
declare var $: any;

@Component({
  selector: 'app-gate-pass-new',
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
  templateUrl: './gate-pass-new.html',
  styleUrl: './gate-pass-new.scss'
})
  

export class GatePassNew {
  @ViewChild('resumeFileUpload') resumeFileUpload: any;
  @ViewChild('ebayFileUpload') ebayFileUpload: any;
  @ViewChild('freightFileUpload') freightFileUpload: any;
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
  gatePassForm: FormGroup;
  itemForm: FormGroup;
  assetForm: FormGroup;
  scrapForm: FormGroup;
  totalCount = 0;
  gatePassNumber: any;
  gatePassDrpData: any[] = [];
  gatePassTypeDrpData: any[] = [];
  gatePassSourceDrpData: any[] = [];
  partyNameDrpData:any[] = [];
  empNameTableData: any[] = [];
  deptNameDrpData: any[] = [];
  warehouseDrpData: any[] = [];
  mainAssetDrpData: any[] = [];
  selectedColumn: any = '';
  selectedFileNames: any[] = [];
  filesToUpload: any[] = [];
  gatePassPrevNoTableData: any = [];
  addressIdTableData: any = [];
  isDisable: boolean = false;
  itemsDrpData: any[] = [];
  itemCodeDrpData: any[] = [];
  itemDetailData: any[] = [];
  assetDetailData: any[] = [];
  scrapDetailData: any[] = [];
  gatePassPrevData: any[] = [];
  statusDrpData: any[] = [];
  statusDrpDataAll: any[] = [];
  scrapDrpData: any[] = [];
  assetDrpData: any[] = [];
  assetStatusDrpData: any[] = [];
  assetWarehouseDrpData: any[] = [];
  showDeleteBtn: boolean = false;
  showActiveBtn: boolean = false;
  selectedAction: any = null;
  selectedTable = '';
  selectedItem: any[] = [];
  selectedRowDetails: any[] = [];
  searchValue: string = '';
  itemDetailsArray: any[] = [];
  formlable: string = '';
  modelHeading: string = '';
  recordViewData: any[] = [];
  recordHeaderViewData: any = [];
  printDialog: boolean = false;
  printContent: SafeHtml | string = '';
  itemDailog: boolean = false;
  imageDailog: boolean = false;
  imgUrl: string = '';

  showResumeUploadDialog = false;
  selectedResumeFile: File | null = null;
  uploadedResumeUrl: string | null = null;
  isUploadingResume = false;

  showEbayUploadDialog = false;
  selectedEbayFile: File | null = null;
  uploadedEbayUrl: string | null = null;
  isUploadingEbay = false;

  showFreightUploadDialog = false;
  selectedFreightFile: File | null = null;
  uploadedFreightUrl: string | null = null;
  isUploadingFreight = false;

  scrapDrp = [
    { label: 'Item', value: 'DAMAGEITEMS' },
    { label: 'Asset', value: 'ASSETFORSCRAP' }
  ];

  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true, },
    { key: 'passNo', header: 'Gate Pass No', isVisible: true, isSortable: false },
    { key: 'gatePass', header: 'Gate Pass', isVisible: true, isSortable: false },
    { key: 'passType', header: 'Gate Pass Type', isVisible: true, isSortable: false },
    { key: 'source', header: 'Gate Pass Source', isVisible: true, isSortable: false },
    { key: 'expectedDate', header: 'Expected Date', isVisible: true, isSortable: false },
    { key: 'actualDate', header: 'Actual Date', isVisible: true, isSortable: false },
    { key: 'partyFrom', header: 'Party Name', isVisible: true, isSortable: false },
    { key: 'vehicle', header: 'Vehicle Details', isVisible: true, isSortable: false },
    { key: 'employee', header: 'Employee Name', isVisible: true, isSortable: false },
    { key: 'department', header: 'Department', isVisible: true, isSortable: false },
    { key: 'challanNo', header: 'Challan No', isVisible: true, isSortable: false },
    { key: 'transporter', header: 'Transporter Name', isVisible: true, isSortable: false },
    { key: 'driver', header: 'Driver Name', isVisible: true, isSortable: false },
    { key: 'warehouse', header: 'Warehouse', isVisible: true, isSortable: false },
    { key: 'jsonDetails', header: 'Invoice', isVisible: true, isSortable: false },
    { key: 'jsonDetails1', header: 'EbayBill', isVisible: true, isSortable: false },
    { key: 'jsonDetails2', header: 'FreightBilty', isVisible: true, isSortable: false },
    { key: 'remarks', header: 'Remarks', isVisible: true, isSortable: false },
    { key: 'jsonDetails3', header: 'Item Details', isVisible: true, isSortable: false, isCustom: true },
    { key: 'jsonDetails4', header: 'Asset Details', isVisible: true, isSortable: false, isCustom: true },
    { key: 'jsonDetails5', header: 'Scrap Details', isVisible: true, isSortable: false, isCustom: true }
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

    this.gatePassForm = this.fb.group({
      passTypeId: [null, Validators.required],
      gatePassId: [null, Validators.required],
      prevGatePassNo: [null],
      expectedDate: [null],
      actualDate: [null],
      partyName: [null, Validators.required],
      addressId: [null, Validators.required],
      vehicle: [''],
      department: [null, Validators.required],
      employee: [null, Validators.required],
      challanNo: [''],
      transporter: [''],
      driver: [''],
      warehouse: [null, Validators.required],
      remark: [''],
      invoice: [''],
      ebay: [''],
      freight: ['']
    });

    this.itemForm = this.fb.group({
      categoryId: ['', Validators.required],
      itemId: ['', Validators.required],
      itemCodeId: ['', Validators.required],
      qty: [{ value: '', disabled: true }, [Validators.required, Validators.min(1)]],
      price: [{ value: '', disabled: true }, [Validators.required, Validators.min(0.01)]],
      amount: [{ value: 0, disabled: true }]
    });

    this.assetForm = this.fb.group({
      assetMainId: ['', Validators.required],
      assetId: ['', Validators.required],
      categoryId: ['', Validators.required],
      transferId: [{ value: '', disabled: true }]
    });

    this.scrapForm = this.fb.group({
      scrapType: ['', Validators.required],
      itemId: ['', Validators.required],
      qty: ['', [Validators.required, Validators.min(1)]]
    });


  }

  get f() { return this.gatePassForm.controls }

  get f1() { return this.itemForm.controls; }

  get f2() { return this.assetForm.controls; }

  get f3() { return this.scrapForm.controls; }


  ngOnInit(): void {
    this.param = sessionStorage.getItem('menuItem') ?? '';
    let paramjs = JSON.parse(this.param);
    this.menulabel = paramjs.menu;
    this.FormName = paramjs.formName;
    this.FormValue = paramjs.formValue;
    this.getTableData(true)
    this.getGatePassDropdownDrp();
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

  getGatePassDropdownDrp() {
    try {
      this.userService.getQuestionPaper(`uspGetGatePassDrpData|action=DROPDOWN|districtId=${sessionStorage.getItem("District")}`)
        .subscribe({
          next: (res: any) => {
            try {
              this.gatePassDrpData = res['table1'];
              this.gatePassTypeDrpData = res['table2'];
              this.gatePassSourceDrpData = res['table3'];
              this.deptNameDrpData = res['table5'];
              this.warehouseDrpData = res['table6'];
              this.mainAssetDrpData = res['table7'];
              this.partyNameDrpData = res['table8'];
              this.statusDrpData = res['table9'];
              this.statusDrpDataAll = res['table9'];
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
      this.gatePassForm
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

      this.userService.getQuestionPaper(`uspGetGatePassDetails|${query}`).subscribe({
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
      this.gatePassForm.reset();
      this.gatePassForm.enable();
      return;
    }

    if (view === 'view') {
      this.gatePassForm.disable();
    } else {
      this.gatePassForm.enable();
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
    this.gatePassForm.enable();
    this.gatePassForm.reset();
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
        else if (option == '4') {
          this.itemDetailsArray = []
        }
        else if (option === '5') {
          this.gatePassForm.reset();
        }
      }
    });
  }

  onClear() {
    this.gatePassForm.reset();
    this.itemDetailsArray = [];
  }

  showImage(image: any) {
    this.imgUrl = this.configService.baseUrl + image;
    this.imageDailog = true;
  }

  closeImageDialog() {
    this.imageDailog = false;
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


  setValue(control: string, value: any) {
    this.gatePassForm.get(control)?.setValue(value);
  }

  resetValue(control: string) {
    this.gatePassForm.get(control)?.reset();
  }

  onChangeGatePassType() {
    const passTypeId = this.f['passTypeId'].value;
    if (passTypeId === '10000') {
      this.setValue('gatePassId', '10001');

      this.statusDrpData = this.statusDrpDataAll.filter(
        e => e.drpValue !== '10003'
      );

      this.f['expectedDate'].clearValidators();
      this.f['actualDate'].setValidators([Validators.required]);
      this.f['prevGatePassNo'].setValidators([Validators.required]);

    } else {
      this.resetValue('gatePassId');

      this.statusDrpData = this.statusDrpDataAll.filter(
        e => e.drpValue !== '10005'
      );

      this.scrapDetailData = [];

      this.f['actualDate'].clearValidators();
      this.f['prevGatePassNo'].clearValidators();
      this.f['expectedDate'].setValidators([Validators.required]);
    }

    this.updateValidators();
    this.reloadFields();
  }

  onChangeGatePass() {
    const gatePassId = this.f['gatePassId'].value;

    if (gatePassId === '10000') {
      this.userService
        .getQuestionPaper(
          `uspGetGatePassDrpData|action=ITEMRETURN|districtId=${sessionStorage.getItem("District")}`
        )
        .subscribe((res: any) => {
          this.gatePassPrevNoTableData = res.table;
        });

      this.f['prevGatePassNo'].setValidators([Validators.required]);
      this.f['actualDate'].setValidators([Validators.required]);

    } else {
      this.gatePassPrevNoTableData = [];
      this.resetValue('prevGatePassNo');

      this.f['prevGatePassNo'].clearValidators();
      this.f['actualDate'].clearValidators();
    }

    this.updateValidators();
  }

  prevDetailDrpData(event: any) {
    const gatePassId = event.value;

    if (!gatePassId) {
      this.reloadFields();
      return;
    }

    this.isDisable = true;

    this.userService
      .getQuestionPaper(
        `uspGetGatePassDrpData|action=ITEMRETURNDETAILS|gatePassId=${gatePassId}|districtId=${sessionStorage.getItem("District")}`
      )
      .subscribe((res: any) => {
        const data = res.table[0];

        this.gatePassPrevData = res.table;
        this.itemDetailData = res.table1;
        this.assetDetailData = res.table2;
        this.scrapDetailData = [];

        this.gatePassForm.patchValue({
          expectedDate: data.expectedDate,
          partyName: data.partyFromId,
          vehicle: data.vehicleDetails,
          department: data.departmentId,
          warehouse: data.wareHouseId
        });

        this.getPartyAdd(data.addressId);
        this.getEmpData(data.employeeId);
      });
  }

  reloadFields() {
    this.isDisable = false;

    this.gatePassForm.patchValue({
      expectedDate: null,
      partyName: null,
      addressId: null,
      vehicle: '',
      department: null,
      employee: null,
      warehouse: null,
      remark: ''
    });

    this.gatePassPrevData = [];
    this.itemsDrpData = [];
    this.itemCodeDrpData = [];
    this.scrapDrpData = [];
    this.itemDetailData = [];
    this.assetDetailData = [];
    this.scrapDetailData = [];
  }

  getPartyAdd(addressId?: string) {
    const partyId = this.f['partyName'].value;
    if (!partyId) return;

    this.userService.getQuestionPaper(`uspGetGatePassDrpData|action=ADDRESS|customerId=${partyId}|districtId=${sessionStorage.getItem("District")}`)
      .subscribe((res: any) => {
        this.addressIdTableData = res.table;
        if (addressId) {
          this.setValue('addressId', addressId);
        }
      });
  }

  getEmpData(empId?: string) {
    const deptId = this.f['department'].value;
    if (!deptId) return;

    this.userService.getQuestionPaper(`uspGetGatePassDrpData|action=EMPLOYEE|departmentId=${deptId}|districtId=${sessionStorage.getItem("District")}`)
      .subscribe((res: any) => {
        this.empNameTableData = res.table;
        if (empId) {
          this.setValue('employee', empId);
        }
      });
  }

  updateValidators() {
    Object.keys(this.f).forEach(key => {
      this.f[key].updateValueAndValidity();
    });
  }

  onWarehouseChange() {
    const passTypeId = this.f['passTypeId'].value;
    const warehouseId = this.f['warehouse'].value;

    if (!passTypeId || passTypeId === '0') {
      this.message.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select gate pass type.',
        life: 3000
      });
      this.f['warehouse'].setValue('0');
      return;
    }

    if (passTypeId === '10001') {
      this.getItemsByWarehouse();
    } else {
      this.resetChildTableFields();
    }
  }


  resetChildTableFields() {
    this.itemDetailData = [];
    this.scrapDetailData = [];

    this.itemForm.reset({
      categoryId: '',
      itemId: '',
      itemCodeId: '',
      qty: '',
      price: '',
      amount: ''
    });

    this.scrapForm.reset({
      scrapType: '',
      itemId: '',
      qty: ''
    });
  }


  getItemsByWarehouse() {
    const warehouseId = this.f['warehouse'].value;

    if (!warehouseId || warehouseId === '0') return;

    this.userService
      .getQuestionPaper(
        `uspGetGatePassDrpData|action=ITEMS|warehouseId=${warehouseId}|districtId=${sessionStorage.getItem('District')}`
      )
      .subscribe((res: any) => {
        this.itemsDrpData = res.table;
        this.scrapDrpData = res.table1;
        this.resetChildTableFields();
      });
  }

  onStatusChange(event: any, action: string) {
    const passTypeId = this.f['passTypeId'].value;
    const warehouseId = this.f['warehouse'].value;
    const categoryId = event.value;

    if (passTypeId !== '10000') return;

    if (!warehouseId || warehouseId === '0') {
      this.message.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select warehouse.',
        life: 3000
      });
      this.itemForm.patchValue({ categoryId: '0' });
      return;
    }

    this.userService
      .getQuestionPaper(
        `uspGetGatePassDrpData|action=${action}|warehouseId=${warehouseId}|categoryId=${categoryId}|districtId=${sessionStorage.getItem('District')}`
      )
      .subscribe((res: any) => {
        this.itemsDrpData = res.table;

        this.itemForm.patchValue({
          itemId: null,
          itemCodeId: null,
          qty: null,
          price: null,
          amount: null
        });
      });
  }

  onScrapTypeChange(event: any) {
    const warehouseId = this.f['warehouse'].value;
    const action = event.value;

    if (!warehouseId || warehouseId === '0') {
      this.scrapForm.patchValue({ scrapType: '0' });
      this.message.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select warehouse.',
        life: 3000
      });
      return;
    }

    this.userService
      .getQuestionPaper(
        `uspGetGatePassDrpData|action=${action}|warehouseId=${warehouseId}|categoryId=0|districtId=${sessionStorage.getItem('District')}`
      )
      .subscribe((res: any) => {
        this.scrapDrpData = res.table1;
      });
  }

  onItemChange() {
    this.getItemCode();
  }

  getItemCode() {

    const itemId = this.itemForm.get('itemId')?.value;

    this.userService.getQuestionPaper(
      `uspGetGatePassDrpData|action=ITEMCODE|itemId=${itemId}|districtId=${sessionStorage.getItem("District")}`
    ).subscribe(
      (res: any) => {

        this.itemForm.patchValue({
          itemCodeId: '0'
        });

        this.itemCodeDrpData = res['table'];

        if (res['table1'].length) {
          const price = res['table1'][0].rate;
          this.getAmount();
        } else {
          this.itemForm.patchValue({
            qty: null,
            price: null,
            amount: null
          });
        }

        setTimeout(() => {
          this.cdr.detectChanges();
        }, 200);

      },
      (err: HttpErrorResponse) => {
        if (err.status == 403) {
        }
      }
    );
  }

  getAmount() {
    const price = this.itemForm.get('price')?.value || 0;
    const qty = this.itemForm.get('qty')?.value || 0;

    this.itemForm.patchValue({
      amount: Number(price) * Number(qty)
    });
  }

  onMainAssetChange() {
    const warehouseId = this.f['warehouse'].value;
    if (!warehouseId || warehouseId === '0') return;

    const assetMainId = this.assetForm.get('assetMainId')?.value;

    this.userService
      .getQuestionPaper(
        `uspGetGatePassDrpData|action=ASSET|assetMainId=${assetMainId}|warehouseId=${warehouseId}|districtId=${sessionStorage.getItem('District')}`
      )
      .subscribe((res: any) => {
        this.assetDrpData = res.table;
        this.assetStatusDrpData = res.table1;
        this.assetWarehouseDrpData = res.table2;

        this.assetForm.patchValue({
          assetId: '0',
          categoryId: '0',
          transferId: '0'
        });
      });
  }


  deleteRecord(
    index: number,
    table: 'itemDetailData' | 'assetDetailData' | 'scrapDetailData'
  ) {
    this[table].splice(index, 1);
  }


  AddItemRow() {
    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      this.message.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please fill all required fields.',
        life: 3000
      });
      return;
    }

    const formValue = this.itemForm.getRawValue();
    const selectedItem = this.itemsDrpData.find(
      e => e.drpValue === formValue.itemId
    );

    if (selectedItem && Number(formValue.qty) > Number(selectedItem.stock)) {
      this.message.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Quantity should not be greater than item stock.',
        life: 3000
      });
      return;
    }

    if (this.itemDetailData.some(e => e.itemCodeId === formValue.itemCodeId)) {
      this.message.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Item already exists.',
        life: 3000
      });
      return;
    }

    const obj = {
      categoryId: formValue.categoryId,
      category: this.statusDrpData.find(x => x.drpValue === formValue.categoryId)?.drpOption || '',
      itemId: formValue.itemId,
      item: this.itemsDrpData.find(x => x.drpValue === formValue.itemId)?.drpOption || '',
      itemCodeId: formValue.itemCodeId,
      itemCode: this.itemCodeDrpData.find(x => x.drpValue === formValue.itemCodeId)?.drpOption || '',
      qty: formValue.qty,
      price: formValue.price,
      amount: formValue.amount
    };

    this.itemDetailData.push(obj);

    this.itemForm.reset();
    this.itemForm.get('qty')?.disable();
    this.itemForm.get('price')?.disable();
    this.itemCodeDrpData = [];
  }

  AddAssetRow() {
    if (this.assetForm.invalid) {
      this.assetForm.markAllAsTouched();
      this.message.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please fill all required fields.',
        life: 3000
      });
      return;
    }

    const formValue = this.assetForm.getRawValue();

    if (
      this.assetDetailData.some(
        e => e.assetId === formValue.assetId && e.assetMainId === formValue.assetMainId
      )
    ) {
      this.message.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Asset already exists.',
        life: 3000
      });
      return;
    }

    const obj = {
      assetMainId: formValue.assetMainId,
      assetMain: this.mainAssetDrpData.find(x => x.drpValue === formValue.assetMainId)?.drpOption || '',
      assetId: formValue.assetId,
      asset: this.assetDrpData.find(x => x.drpValue === formValue.assetId)?.drpOption || '',
      categoryId: formValue.categoryId,
      category: this.assetStatusDrpData.find(x => x.drpValue === formValue.categoryId)?.drpOption || '',
      transferId: formValue.transferId,
      transfer: this.assetWarehouseDrpData.find(x => x.drpValue === formValue.transferId)?.drpOption || ''
    };

    this.assetDetailData.push(obj);

    this.assetForm.reset();
    this.assetForm.get('transferId')?.disable();
  }

  AddScrapRow() {
    if (this.scrapForm.invalid) {
      this.scrapForm.markAllAsTouched();
      this.message.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please fill all required fields.',
        life: 3000
      });
      return;
    }

    const formValue = this.scrapForm.getRawValue();

    if (this.scrapDetailData.some(e => e.itemId === formValue.itemId)) {
      this.message.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Scrap item already exists.',
        life: 3000
      });
      return;
    }

    const obj = {
      scrapType: formValue.scrapType,
      scrapTypeName: formValue.scrapType === 'DAMAGEITEMS' ? 'Item' : 'Asset',
      itemId: formValue.itemId,
      item: this.scrapDrpData.find(x => x.drpValue === formValue.itemId)?.drpOption || '',
      qty: formValue.qty,
      itemType: this.scrapDrpData[0]?.itemType || ''
    };

    this.scrapDetailData.push(obj);
    this.scrapForm.reset();
  }


  onChangeAssetStatus() {
    this.assetForm.get('transferId')?.setValue('0');
    if (this.assetForm.get('categoryId')?.value === '10004') {
      this.assetForm.get('transferId')?.enable();
    } else {
      this.assetForm.get('transferId')?.disable();
    }
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 100);
  }



  onSubmit() {
    if (this.gatePassForm.invalid) {
      this.gatePassForm.markAllAsTouched();
      return;
    }

    this.paramvaluedata = '';
    const formVal = this.gatePassForm.value;
    if (formVal.gatePassId === '10000' && formVal.prevGatePassNo && formVal.prevGatePassNo !== '0')
    {
      if (!formVal.actualDate) {
        this.message.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'Please select actual date.',
          life: 3000
        });
        return;
      }

      const actualDate = this.datePipe.transform( formVal.actualDate,'yyyy-MM-dd');

      this.paramvaluedata =
        `prvGatePassId=${formVal.prevGatePassNo}` +
        `|gatePassTypeId=${formVal.passTypeId}` +
        `|actualDate=${actualDate}` +
        `|remarks=${formVal.remark || ''}`;

    }

    else {

      if ( formVal.passTypeId === '0' || formVal.gatePassId === '0' || formVal.partyName === '0' || formVal.addressId === '0' ||
        formVal.department === '0' || !formVal.employee || formVal.warehouse === '0' ||
        (
          formVal.passTypeId === '10001' &&
          formVal.gatePassId === '10001' &&
          !formVal.expectedDate
        )
      ) {
        this.message.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'Please fill all required info(*).',
          life: 3000
        });
        return;
      }

      if (
        this.itemDetailData.length === 0 &&
        this.assetDetailData.length === 0 &&
        this.scrapDetailData.length === 0
      ) {
        this.message.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'Please fill Details for Item or Asset or Scrap.',
          life: 3000
        });
        return;
      }

      const gatePassPayload = {
        ...formVal,
        expectedDate: formVal.expectedDate
          ? this.datePipe.transform(formVal.expectedDate, 'yyyy-MM-dd')
          : '',
        actualDate: formVal.actualDate
          ? this.datePipe.transform(formVal.actualDate, 'yyyy-MM-dd')
          : ''
      };

      this.paramvaluedata =
        `gatePassJSON=${JSON.stringify([gatePassPayload])}` +
        `|detailsJSON=${JSON.stringify(this.itemDetailData)}` +
        `|assetJSON=${JSON.stringify(this.assetDetailData)}` +
        `|othersJSON=${JSON.stringify(this.scrapDetailData)}`;
    }

    this.openConfirmation( 'Confirm?','Are you sure you want to proceed?','1','1');
  }

  submitcall() {
    try {
      this.isFormLoading = true;

      const formVal = this.gatePassForm.value;
      let spName = '';

      if (formVal.gatePassId === '10000' && formVal.prevGatePassNo && formVal.prevGatePassNo !== '0')
      {
        spName = 'uspPostGatePassReturnNew';
      } else {
        spName = 'uspPostGatePassNew';
      }

      const finalParams = `${this.paramvaluedata}` + `|appUserId=${sessionStorage.getItem('userId')}` + `|districtId=${sessionStorage.getItem('District')}`;
      this.userService.SubmitPostTypeData(spName, finalParams, this.FormName).subscribe({
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
    this.gatePassForm.reset();
    this.itemDetailData = []
    this.assetDetailData = []
    this.scrapDetailData = []
    this.isDisable = false
    $('input:text').val('');
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 500); 
  }


  // --- Open/Close Dialog ---
  openResumeUploadDialog() {
    this.showResumeUploadDialog = true;
    this.selectedResumeFile = null;
    this.cdr.detectChanges();
  }

  closeResumeUploadDialog() {
    this.showResumeUploadDialog = false;
    this.selectedResumeFile = null;
    this.cdr.detectChanges();
  }

  // --- File Selection ---
  onResumeFileSelect(event: any) {
    if (event.files && event.files.length > 0) {
      this.selectedResumeFile = event.files[0];
      this.cdr.detectChanges();
    }
  }

  // --- Clear Selection ---
  clearResumeSelection() {
    this.selectedResumeFile = null;
    if (this.resumeFileUpload) {
      this.resumeFileUpload.clear();
    }
    this.cdr.detectChanges();
  }

  // --- Upload Resume ---
  uploadResume() {
    try {
      if (!this.selectedResumeFile) {
        this.message.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'Please select file.',
          life: 3000
        });
        return;
      }

      this.isUploadingResume = true;
      this.cdr.detectChanges();

      const filesArray: File[] = [this.selectedResumeFile];
      const folderName = 'GatePass';

      this.userService.MastrtfileuploadNew(filesArray, folderName).subscribe({
        next: (datacom: any) => {
          this.isUploadingResume = false;

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

            const resultarray = datacom.split('-');

            if (resultarray[0] === '1') {
              const relativePath = resultarray[1].toString();
              const fullUrl = this.normalizeImagePath(relativePath);

              this.gatePassForm.patchValue({
                resumeUploadControl: relativePath
              });

              this.uploadedResumeUrl = fullUrl;

              this.message.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Resume uploaded successfully!',
                life: 3000
              });

              this.closeResumeUploadDialog();
            } else {
              this.message.add({
                severity: 'warn',
                summary: 'Warning',
                detail: resultarray[1] || datacom,
                life: 3000
              });
            }
          } catch (innerErr) {
            console.error('Error processing resume upload response:', innerErr);
            this.message.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Something went wrong while processing the upload response.',
              life: 3000
            });
          }

          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => {
          this.isUploadingResume = false;
          console.error('Resume upload error:', err);

          try {
            if (err.status === 401 || err.status === 403) {
              const msg = err.status === 401 ? 'You are not authorized!' : 'Access forbidden!';
              this.message.add({
                severity: 'error',
                summary: 'Error',
                detail: msg,
                life: 3000
              });
            } else {
              this.message.add({
                severity: 'error',
                summary: 'Error',
                detail: err.message.toString(),
                life: 3000
              });
            }
          } catch (innerErr) {
            console.error('Error handling upload error response:', innerErr);
            this.message.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Unexpected error while handling upload failure.',
              life: 3000
            });
          }

          this.cdr.detectChanges();
        }
      });

    } catch (error: any) {
      console.error('Unexpected error in uploadResume():', error);
      this.isUploadingResume = false;

      this.message.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Something went wrong while uploading',
        life: 3000
      });

      this.cdr.detectChanges();
    }
  }

  removeResume() {
    this.uploadedResumeUrl = '';
    this.gatePassForm.patchValue({
      resumeUploadControl: ''
    });
    this.message.add({
      severity: 'info',
      summary: 'Removed',
      detail: 'Resume removed successfully.',
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


  // --- Open/Close Dialog ---
  openEbayUploadDialog() {
    this.showEbayUploadDialog = true;
    this.selectedEbayFile = null;
    this.cdr.detectChanges();
  }

  closeEbayUploadDialog() {
    this.showEbayUploadDialog = false;
    this.selectedEbayFile = null;
    this.cdr.detectChanges();
  }

  // --- File Selection ---
  onEbayFileSelect(event: any) {
    if (event.files && event.files.length > 0) {
      this.selectedEbayFile = event.files[0];
      this.cdr.detectChanges();
    }
  }

  // --- Clear Selection ---
  clearEbaySelection() {
    this.selectedEbayFile = null;
    if (this.resumeFileUpload) {
      this.resumeFileUpload.clear();
    }
    this.cdr.detectChanges();
  }

  // --- Upload Ebay ---
  uploadEbay() {
    try {
      if (!this.selectedEbayFile) {
        this.message.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'Please select file.',
          life: 3000
        });
        return;
      }

      this.isUploadingEbay = true;
      this.cdr.detectChanges();

      const filesArray: File[] = [this.selectedEbayFile];
      const folderName = 'GatePass';

      this.userService.MastrtfileuploadNew(filesArray, folderName).subscribe({
        next: (datacom: any) => {
          this.isUploadingEbay = false;

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

            const resultarray = datacom.split('-');

            if (resultarray[0] === '1') {
              const relativePath = resultarray[1].toString();
              const fullUrl = this.normalizeImagePathEbay(relativePath);

              this.gatePassForm.patchValue({
                resumeUploadControl: relativePath
              });

              this.uploadedEbayUrl = fullUrl;

              this.message.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Ebay uploaded successfully!',
                life: 3000
              });

              this.closeEbayUploadDialog();
            } else {
              this.message.add({
                severity: 'warn',
                summary: 'Warning',
                detail: resultarray[1] || datacom,
                life: 3000
              });
            }
          } catch (innerErr) {
            console.error('Error processing resume upload response:', innerErr);
            this.message.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Something went wrong while processing the upload response.',
              life: 3000
            });
          }

          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => {
          this.isUploadingEbay = false;
          console.error('Ebay upload error:', err);

          try {
            if (err.status === 401 || err.status === 403) {
              const msg = err.status === 401 ? 'You are not authorized!' : 'Access forbidden!';
              this.message.add({
                severity: 'error',
                summary: 'Error',
                detail: msg,
                life: 3000
              });
            } else {
              this.message.add({
                severity: 'error',
                summary: 'Error',
                detail: err.message.toString(),
                life: 3000
              });
            }
          } catch (innerErr) {
            console.error('Error handling upload error response:', innerErr);
            this.message.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Unexpected error while handling upload failure.',
              life: 3000
            });
          }

          this.cdr.detectChanges();
        }
      });

    } catch (error: any) {
      console.error('Unexpected error in uploadEbay():', error);
      this.isUploadingEbay = false;

      this.message.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Something went wrong while uploading',
        life: 3000
      });

      this.cdr.detectChanges();
    }
  }

  removeEbay() {
    this.uploadedEbayUrl = '';
    this.gatePassForm.patchValue({
      resumeUploadControl: ''
    });
    this.message.add({
      severity: 'info',
      summary: 'Removed',
      detail: 'Ebay removed successfully.',
      life: 2000
    });
  }

  normalizeImagePathEbay(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) {
      return path;
    }
    let normalizedPath = path.replace(/\\/g, '/');
    normalizedPath = normalizedPath.replace(/([^:]\/)\/+/g, '$1');
    return this.configService.baseUrl + normalizedPath;
  }


  getFileSizeEbay(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }


  // --- Open/Close Dialog ---
  openFreightUploadDialog() {
    this.showFreightUploadDialog = true;
    this.selectedFreightFile = null;
    this.cdr.detectChanges();
  }

  closeFreightUploadDialog() {
    this.showFreightUploadDialog = false;
    this.selectedFreightFile = null;
    this.cdr.detectChanges();
  }

  // --- File Selection ---
  onFreightFileSelect(event: any) {
    if (event.files && event.files.length > 0) {
      this.selectedFreightFile = event.files[0];
      this.cdr.detectChanges();
    }
  }

  // --- Clear Selection ---
  clearFreightSelection() {
    this.selectedFreightFile = null;
    if (this.resumeFileUpload) {
      this.resumeFileUpload.clear();
    }
    this.cdr.detectChanges();
  }

  // --- Upload Freight ---
  uploadFreight() {
    try {
      if (!this.selectedFreightFile) {
        this.message.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'Please select file.',
          life: 3000
        });
        return;
      }

      this.isUploadingFreight = true;
      this.cdr.detectChanges();

      const filesArray: File[] = [this.selectedFreightFile];
      const folderName = 'GatePass';

      this.userService.MastrtfileuploadNew(filesArray, folderName).subscribe({
        next: (datacom: any) => {
          this.isUploadingFreight = false;

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

            const resultarray = datacom.split('-');

            if (resultarray[0] === '1') {
              const relativePath = resultarray[1].toString();
              const fullUrl = this.normalizeImagePathFreight(relativePath);

              this.gatePassForm.patchValue({
                resumeUploadControl: relativePath
              });

              this.uploadedFreightUrl = fullUrl;

              this.message.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Freight uploaded successfully!',
                life: 3000
              });

              this.closeFreightUploadDialog();
            } else {
              this.message.add({
                severity: 'warn',
                summary: 'Warning',
                detail: resultarray[1] || datacom,
                life: 3000
              });
            }
          } catch (innerErr) {
            console.error('Error processing resume upload response:', innerErr);
            this.message.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Something went wrong while processing the upload response.',
              life: 3000
            });
          }

          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => {
          this.isUploadingFreight = false;
          console.error('Freight upload error:', err);

          try {
            if (err.status === 401 || err.status === 403) {
              const msg = err.status === 401 ? 'You are not authorized!' : 'Access forbidden!';
              this.message.add({
                severity: 'error',
                summary: 'Error',
                detail: msg,
                life: 3000
              });
            } else {
              this.message.add({
                severity: 'error',
                summary: 'Error',
                detail: err.message.toString(),
                life: 3000
              });
            }
          } catch (innerErr) {
            console.error('Error handling upload error response:', innerErr);
            this.message.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Unexpected error while handling upload failure.',
              life: 3000
            });
          }

          this.cdr.detectChanges();
        }
      });

    } catch (error: any) {
      console.error('Unexpected error in uploadFreight():', error);
      this.isUploadingFreight = false;

      this.message.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Something went wrong while uploading',
        life: 3000
      });

      this.cdr.detectChanges();
    }
  }

  removeFreight() {
    this.uploadedFreightUrl = '';
    this.gatePassForm.patchValue({
      resumeUploadControl: ''
    });
    this.message.add({
      severity: 'info',
      summary: 'Removed',
      detail: 'Freight removed successfully.',
      life: 2000
    });
  }

  normalizeImagePathFreight(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) {
      return path;
    }
    let normalizedPath = path.replace(/\\/g, '/');
    normalizedPath = normalizedPath.replace(/([^:]\/)\/+/g, '$1');
    return this.configService.baseUrl + normalizedPath;
  }


  getFileSizeFreight(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  exportAsXLSXCustom(): void {
    let query = `uspGetGatePassExcelData|appUserId=${sessionStorage.getItem('userId')}|districtId=${sessionStorage.getItem("District")}`
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

  printFormGatePass(id:any) {
    this.userService.getQuestionPaper(`uspGetGatePassPrintData|gatePassId=${id}`).subscribe(
      (data: any) => {
        let gatePassType = data['table'][0].gatePassType;
        let expectActualDate = (gatePassType == 'Returnable');
        let itemLength = (data.table1.length > 0);
        let assetLength = (data.table2.length > 0);
        let scrapLength = (data.table3.length > 0);
        if (data.table.length > 0) {
          const html = `
           <div style="border:1px solid black; max-width:100vw;padding:12px">

                    <table style="width:100%;margin-top: 1rem;align-items:center">

                    ${data.table.map((itmdata:any, item:any) => `
  
                    <tr style="align-items:center;">
                    <td style="width: 100%;text-align:center">
                      <h2 style="font-size: 22px;text-transform:uppercase;">${itmdata['orgName']}</h2>
                    </td>
                  </tr>
  
                  <tr>
                    <td style="width: 100%;text-align:center;padding:0;">
                      <h2 style="font-size: 18px;text-transform:uppercase;">${itmdata['orgAddress']}</h2>
                      <h2 style="font-size: 18px;"> Phone:${itmdata['orgPhone']}, Email:${itmdata['orgEmail']}</h2>
                    </td>
                  </tr>
  
                    <tr style="border:1px solid black;width:100%">
                      <td>
                        <h1 style="font-size: 22px; max-width: 200px; margin: auto; margin-top: 5px; margin-bottom: 5px; padding: 10px; border: 1px solid #000000; box-shadow: 5px 5px 5px #000000; text-align: center;">
                        ${itmdata['gatePassInOut']}</h1>
                        <h5 style="font-size: 20px;  margin: auto; margin-top: 5px; margin-bottom: 5px; padding: 10px; text-align: center;">${itmdata['gatePassType']}</h5>
                      </td>
                    </tr>
                   
                </table>
                  <table style="width:100%;margin-top:2rem;border:1px solid; border-collapse:collapse;display:block;">
  
                  <tbody style="width:100%;display:table;">
                  
                  <tr style="border-bottom:1px solid;border-collapse:collapse;width:100%;">
                    <th style="text-align:left;
                    border-collapse: collapse; border-right:none;">Gate Pass No. :</th>
                    <th style="text-align:left; 
                    border-collapse: collapse; border-right:none;width:5%">${itmdata['gatePassNo']}</th>
                    <th style="text-align:center; border-bottom:1px solid black;
                    border-collapse: collapse; border-right:none;width:5%">Gate Pass Date:</th>
                    <th style="text-align:left; border-bottom:1px solid black;
                    border-collapse: collapse;border-left:none;width:45%">${itmdata['gatePassDate']}</th>
                 </tr>
                <tr style="border-collapse: collapse;width:100%">
                  <td style="border: none;width:25%">To,</td>
                  <td style="border: none;width:25%"></td>
                  <td style="border-bottom:none;border-left:1px solid;width:25%;
                  border-collapse: collapse;" >Challan No.</td>
                  <td style="border-bottom:none;border-left:none;
                  border-collapse: collapse;width:25%">${itmdata['challanNo']}</td>
              </tr>
  
              <tr style="border-collapse: collapse;width:100%">
                  <td colspan="2" style="border: none;width:50%">${itmdata['vendorName']}</td>
                  <td style="border-bottom:none;border-left:1px solid;width:25%;
                  border-collapse: collapse;">Transporter:</td>
                  <td style="border-bottom:none;border-left:none;
                  border-collapse: collapse;width:25%">${itmdata['transporterName']}</td>
              </tr>
  
              <tr style="border-collapse: collapse;width:100%">
                  <td colspan="2" style="border: none;width:25%">${itmdata['address']}</td>
                  <td style="border-bottom:none;border-left:1px solid;width:25%;
                  border-collapse: collapse;">Driver Name:</td>
                  <td style="border-bottom:none;border-left:none;
                  border-collapse: collapse;width:25%">${itmdata['driverName']}</td>
              </tr>
  
              <tr style="  
              border-collapse: collapse;width:100%">
                <td style="border: none;width:15%"></td>
              <!--<td style="border: none;width:15%">Phone:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${itmdata['vendorPhone']}</td>-->
                <td style="border: none;width:35%"></td>
                <td style="border-bottom:none;border-left:1px solid;width:25%;
                border-collapse: collapse;">Vehicle No:</td>
                <td style="border-bottom:none;border-left:none;
                border-collapse: collapse;width:25%">${itmdata['vehicleNo']}</td>
            </tr>
  
            <tr style="  border-collapse: collapse;width:100%">
              <td style="border: none;width:15%"></td>
              <!--<td style="border: none;width:15%">Email:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${itmdata['vendorEmail']}</td>-->
              <td style="border: none;width:35%"></td>
              <td style="border-bottom:none;border-left:1px solid;width:25%;
              border-collapse: collapse;"></td>
              <!--<td style="border-bottom:none;border-left:1px solid;width:25%;
              border-collapse: collapse;">LR/MR No. :</td>
              <td style="border-bottom:none;border-left:none;
              border-collapse: collapse;width:25%">${itmdata['lrmrNo']}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Date:${itmdata['lrmrDate']}</td>-->
            </tr>
  
            <tr style="width:100%">
              <td style=" solid black;width:25%"></td>
              <td style="  solid black;width:25%"></td>
              <td  style="border-bottom:none;border-left:1px solid;width:25%;
              border-collapse: collapse;">Division Name:</td>
              <td  style="border-bottom:none;border-left:none;
              border-collapse: collapse;width:25%">${itmdata['district']}</td>
          </tr>
  
          <tr style="width:100%">
           <td style=" solid black;width:25%"></td>
           <td style="  solid black;width:25%"></td>
           <td  style="border-bottom:none;border-left:1px solid;width:25%;
           border-collapse: collapse;">Dept. Name:</td>
           <td  style="border-bottom:none;border-left:none;
           border-collapse: collapse;width:25%">${itmdata['deptName']}</td>
         </tr>
  
  
         ${expectActualDate === true ?

                        `<tr style="width:100%">
          <td style=" solid black;width:25%"></td>
          <td style="  solid black;width:25%"></td>
          <td  style="border-bottom:none;border-left:1px solid;width:25%;
          border-collapse: collapse;">Expected Date:</td>
          <td  style="border-bottom:none;border-left:none;
          border-collapse: collapse;width:25%">${itmdata['expectedDate']}</td>
        </tr>
  
        <tr style="width:100%">
          <td style=" solid black;width:25%"></td>
          <td style="  solid black;width:25%"></td>
          <td  style="border-bottom:none;border-left:1px solid;width:25%;
          border-collapse: collapse;">Actual Date:</td>
          <td  style="border-bottom:none;border-left:none;
          border-collapse: collapse;width:25%">${itmdata['actualDate']}</td>
        </tr>`

                        : ''}
     
        <tr style="border:1px solid;border-collapse:collapse;width:100%;">
          <td style="border-left: 1px solid transparent;width:25%"></td>
          <td style="width:25%"></td>
          <td style="border-bottom:none;border-left:1px solid;width:25%; border-collapse: collapse;">Person Name:</td>
          <td style="border-bottom:none;border-right: 1px solid transparent;border-left:none; border-collapse: collapse;width:25%">${itmdata['personName']}</td>
        </tr>
  
        <tr style="border-collapse:collapse;width:100%;">
          <td style="border:0px solid transparent;width:25%"></td>
          <td style="border:0px solid transparent;width:25%"></td>
          <td style="border-bottom:none;border-left:1px solid;width:25%; border-collapse: collapse;">Contact No. :</td>
          <td style="border-bottom:none;border-left:none; border-collapse: collapse;width:25%">${itmdata['contactNo']}</td>
        </tr>
  
          `).join('')}
  
          </tbody>
  
          </table>
  
          <table style="width:100%;margin-top:2rem;overflow-x:auto;border-collapse:collapse">  
  
          ${itemLength == true ? `  
            <tr style=" border:1px solid black;border-collapse: collapse;width:100%">
                <th style="text-align:center; border:1px solid black;border-collapse: collapse;width:80px;">S.No</th>
                <th style="text-align:center; border:1px solid black;border-collapse: collapse;">Item Description</th>
                <th style="text-align:center; border:1px solid black;border-collapse: collapse;">Item Code</th>
                <th style="text-align:center; border:1px solid black;border-collapse: collapse;">Status</th>
                <th style="text-align:center; border:1px solid black;border-collapse: collapse;">UOM</th>
                <th style="text-align:center; border:1px solid black;border-collapse: collapse;">Quantity</th>
                <!--<th style="text-align:center; border:1px solid black;border-collapse: collapse;">Rate</th>
                <th style="text-align:center; border:1px solid black;border-collapse: collapse;">Amount</th>-->               
  
            </tr>
            ${data.table1.map((itmdata:any, item:any) => `
            <tr style=" border:1px solid black;border-collapse: collapse;width:100%">
                <td style="text-align:center; border:1px solid black;border-collapse: collapse;">${item + 1}</td>                
                <td style="text-align:center; border:1px solid black;border-collapse: collapse;">${itmdata['itemName']}</td>
                <td style="text-align:center; border:1px solid black;border-collapse: collapse;">${itmdata['itemCode'] ? itmdata['itemCode'] : ''}</td>
                <td style="text-align:center; border:1px solid black;border-collapse: collapse;">${itmdata['category']}</td>
                <td style="text-align:center; border:1px solid black;border-collapse: collapse;">${itmdata['uom']}</td>
                <td style="text-align:center; border:1px solid black;border-collapse: collapse;">${itmdata['qty']}</td>
                <!--<td style="text-align:center; border:1px solid black;border-collapse: collapse;">${itmdata['price']}</td>
                <td style="text-align:center; border:1px solid black;border-collapse: collapse;">${itmdata['amount']}</td>-->
               
               
            </tr>
            `).join('')}
           
            `: ''}    
  
          </table>
  
        ${assetLength == true ? `
        <table style="width:100%;margin-top:2rem;overflow-x:auto;border-collapse:collapse">  
          <tr style=" border:1px solid black;border-collapse: collapse;width:100%">
              <th style="text-align:center; border:1px solid black;border-collapse: collapse;width:80px">S.No</th>
              <th style="text-align:center; border:1px solid black;border-collapse: collapse;">Asset Description</th>
              <th style="text-align:center; border:1px solid black;border-collapse: collapse;">Status</th>
              <th style="text-align:center; border:1px solid black;border-collapse: collapse;">Transfer To</th>
  
          </tr>        
        ${data.table2.map((itmdata:any, item:any) => `  
          <tr style=" border:1px solid black;border-collapse: collapse;width:100%">
              <td style="text-align:center; border:1px solid black;border-collapse: collapse;">${item + 1}</td>
              <td style="text-align:center; border:1px solid black;border-collapse: collapse;">${itmdata['assetName']}</td>
              <td style="text-align:center; border:1px solid black;border-collapse: collapse;">${itmdata['status']}</td>
              <td style="text-align:center; border:1px solid black;border-collapse: collapse;">${itmdata['transfer'] ? itmdata['transfer'] : ''}</td>
          </tr>          
  
            `).join('')}  

            </table>
  
          `: ''} 
  
          ${scrapLength == true ? `
          <table style="width:100%;margin-top:2rem;overflow-x:auto;border-collapse:collapse">  
            <tr style=" border:1px solid black;border-collapse: collapse;width:100%">
                <th style="text-align:center; border:1px solid black;border-collapse: collapse;width:80px">S.No</th>
                <th style="text-align:center; border:1px solid black;border-collapse: collapse;">Scrap</th>
                <th style="text-align:center; border:1px solid black;border-collapse: collapse;">Quantity</th>
    
            </tr>
          
          ${data.table3.map((itmdata:any, item:any) => `
    
            <tr style=" border:1px solid black;border-collapse: collapse;width:100%">
                <td style="text-align:center; border:1px solid black;border-collapse: collapse;">${item + 1}</td>
                <td style="text-align:center; border:1px solid black;border-collapse: collapse;">${itmdata['item']}</td>
                <td style="text-align:center; border:1px solid black;border-collapse: collapse;">${itmdata['qty']}</td>
            </tr>
             
    
              `).join('')}  
              </table>
    
            `: ''} 
  
            <table style="width:100%; border:1px solid black; margin-top:20px;">
  
            ${data.table.map((itmdata:any, item:any) => `
    
            <tr style=" border:1px solid black;border-collapse: collapse;">
            <td style="border: none;">Remarks:${itmdata['remarks']}</td>
            </tr>
    
            `).join('')}
    
            </table>
  
  
          <table style="width:100%; border:1px solid black">
         
            <tr style=" border:1px solid black;border-collapse: collapse;">
                <h4 style="text-align:right;">E.& O.E</h4>
            </tr>
           
            <tr>
                <th style="border: none">RECEIVED BY</th>
                <th style="border: none;">AUTHORISED BY</th>
                <th style="border: none;">PURCHASE DEPT.</th>
                <th style="border: none;">MANAGER STORE</th>
            </tr>
           
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


