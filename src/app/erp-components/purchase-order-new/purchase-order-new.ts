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
import { CheckboxModule } from 'primeng/checkbox';
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

type FormName =
  | 'itemDetailForm'
  | 'paymentTermsForm'
  | 'textDetailsForm'
  | 'termsConditionForm'
  | 'otherChargesForm'
  | 'poQuotationForm';
 
type TableAlias =
  | 'taxDetailData'
  | 'poFromPrArr'
  | 'paymentTermDetailsData'
  | 'termsConditionData'
  | 'otherChargesData'
  | 'QuotationArr';  

@Component({
  selector: 'app-purchase-order-new',
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
    TabsModule,
    CheckboxModule
  ],
  providers: [
    ConfirmationService,
    MessageService,
    DatePipe,
    ExcelService
  ],
  templateUrl: './purchase-order-new.html',
  styleUrl: './purchase-order-new.scss'
})
    
export class PurchaseOrderNew {
  @ViewChild('resumeFileUpload') resumeFileUpload: any;
  @ViewChild('quotationFileUpload') quotationFileUpload: any;
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
  POForm: FormGroup;
  itemDetailForm: FormGroup;
  paymentTermsForm: FormGroup;
  termsConditionForm: FormGroup;
  otherChargesForm: FormGroup;
  poQuotationForm: FormGroup;
  textDetailsForm: FormGroup;
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
  priceListDialog: boolean = false;
  prDetailModel: boolean = false;
  imgUrl: string = '';

  currency: { currencyName: any; currencyIcon: any; currencyAmount: any; } | null = null;
  divisionDrp: any = [];
  uomDrp: any = [];
  dropdownSettings = {};
  dropdownEmployeeList = [];
  ValidationdropdownSettings = {};
  isPurchaseDrp = true;
  poFromPrArr: any[] = [];
  poFromPrModalArr: any[] = [];
  columvalue = '';
  poEditmode = true;
  showTaxtypeTabData = false;
  grTotal: any = 0;
  taxForDrp = [{ "drpVal": "Item Wise", "drpText": "Item Wise" }, { "drpVal": "Order Wise", "drpText": "Order Wise" }]
  taxOptionDrp = [{ "drpVal": "Inclusive", "drpText": "Inclusive" }, { "drpVal": "Exclusive", "drpText": "Exclusive" }]
  showTaxInfo = false;
  isTaxItemWise: Boolean = true;
  orderWiseTotal = 0;
  selectedTax = '';
  budget: any = 0;
  taxDetailData: any[] =[];
  termsConditionData: any[] = [];
  otherChargesData: any[] = [];
  paymentTermDetailsData: any[] = [];
  natureDataDrp: any[] =[];
  natureDataDrpAll: any[] = [];
  itemtaxwiseData: any[] = [];
  poFromPrArrFinal: any[] = [];

  QuotationArr: any[] = [];
  itemCodeDrp: any[] = [];
  itemViewTableData: any[] = [];
  organizationDrp: any[] = [];
  postedPOItems: any[] = [];
  uploadFileType: any;
  deleteType: any;
  isDirect: boolean = false;
  organizationAddressDrp: any[] = [];
  dispatchForDrp: any[] = [];
  purchaseTypeDrp: any[] = [];
  purchaseCategoryDrp: any[] = [];
  currencyDrp: any[] = [];
  customerDrp: any[] = [];
  customerAddressDrp: any[] = [];
  purchaseOrderTypeDrp: any[] = [];
  purchaseRequestDrp: any;
  displayedColumnsPR: string[] = ['sno', 'action', 'prNo', 'prDate', 'item', 'qty', 'rate'];
  selectedItemEdit: any = null;
  priceListData: any[] = [];
  paymentTypeDrp: any[] = [];
  termConditionDrp: any[] = [];
  chargesTypeDrp: any[] = [];
  taxMasterDrp: any[] = [];
  warehouseDrp: any[] = [];
  showResumeUploadDialog = false;
  selectedResumeFile: File | null = null;
  uploadedResumeUrl: string | null = null;
  isUploadingResume = false;
  showTooltip: boolean = false;
  itemsDrp: any[] = [];
  dataSourcePR: any[] = [];
  sourceDrp = [
    { label: 'Direct', value: '10000' },
    { label: 'Purchase Request', value: '10003' }
  ];
  activeTabIndex: number = 0;

  showQuotationUploadDialog = false;
  selectedQuotationFile: File | null = null;
  uploadedQuotationUrl: string | null = null;
  isUploadingQuotation = false;


  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true, },
    { key: 'poNo', header: 'Purchase Order', isVisible: true, isSortable: false },
    { key: 'validityDate', header: 'Validity Date', isVisible: true, isSortable: false },
    { key: 'approveStatus', header: 'Status', isVisible: true, isSortable: false },
    { key: 'divisionName', header: 'Division', isVisible: true, isSortable: false },
    { key: 'sourceDocument', header: 'Source Document', isVisible: true, isSortable: false },
    { key: 'purchaseType', header: 'Purchase Type', isVisible: true, isSortable: false },
    { key: 'purchaseCat', header: 'Purchase Category', isVisible: true, isSortable: false },
    { key: 'customer', header: 'Vendor', isVisible: true, isSortable: false },
    { key: 'totalAmt', header: 'Total Amount', isVisible: true, isSortable: false },
    { key: 'jsonDetails', header: 'Approval', isVisible: true, isSortable: false, isCustom: true },
    { key: 'jsonDetails1', header: 'Image', isVisible: true, isSortable: false, isCustom: true },
    { key: 'jsonDetails2', header: 'Detail', isVisible: true, isSortable: false, isCustom: true }
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
    private router: Router) {

    this.POForm = fb.group({
      divisionNameId: ['', [Validators.required]],
      warehouseId: ['', [Validators.required]],
      sourceDocumentId: ['', [Validators.required]],
      PRId: [''],
      purchaseTypeId: ['', [Validators.required]],
      customerId: ['', [Validators.required]],
      dispatchId: ['', [Validators.required]],
      materialIndentTypeId: ['', [Validators.required]],
      orgId: ['', [Validators.required]], 
      orgAddressId: ['', [Validators.required]],
      contactPerson: [''],
      validityDate: ['', [Validators.required]],
      purchaseCatId: ['', [Validators.required]],
      currencyId: ['', [Validators.required]],
      customerAddressId: ['', [Validators.required]],
      remarks: [''],
      resumeUploadControl: [''],
      exclusiveAmount: ['']
    })

    this.itemDetailForm = fb.group({
      itemId: ['', [Validators.required]],
      itemCodeId: ['', [Validators.required]],
      unitId: ['', [Validators.required]],
      availableQty: [''],
      quantity: ['', [Validators.required]],
      rate: ['', [Validators.required]],
      tolerance: [''],
      techSpec: [''],
    })

    this.paymentTermsForm = fb.group({
      payTypeId: ['', [Validators.required]],
      date: ['', [Validators.required]],
      payValue: [''],
      noOfDays: [''],
      tolerance: [''],
      remarks: [''],
    })

    this.termsConditionForm = fb.group({
      trmsAndCndId: ['', [Validators.required]],
      remarks: ['', [Validators.required]],
    })

    this.otherChargesForm = fb.group({
      chargesId: ['', [Validators.required]],
      natureId: ['', [Validators.required]],
      value: ['', [Validators.required]],
      basic: [false],
      remarks: [''],
    })

    this.poQuotationForm = fb.group({
      company: ['', [Validators.required]],
      quotationUploadControl: ['', [Validators.required]],
    })

    this.textDetailsForm = fb.group({
      taxFor: ['', [Validators.required]],
      natureId: ['', [Validators.required]],
      taxId: ['', [Validators.required]],
      amount: ['0'],
      optionId: ['', [Validators.required]],
      discount: [''],
      remarks: [''],
    })

    this.itemDetailForm.get('availableQty')?.disable();
    this.otherChargesForm.get('basic')?.disable();
    this.textDetailsForm.get('amount')?.disable();

  }

  get f() {return this.POForm.controls;}
  
  get f1() {return this.itemDetailForm.controls;}
  
  get f2() {return this.paymentTermsForm.controls;}
  
  get f3() {return this.termsConditionForm.controls;}
  
  get f4() {return this.otherChargesForm.controls;}
  
  get f5() {return this.poQuotationForm.controls;}
  
  get f6() {return this.textDetailsForm.controls;}


  ngOnInit(): void {
    this.param = sessionStorage.getItem('menuItem') ?? '';
    let paramjs = JSON.parse(this.param);
    this.menulabel = paramjs.menu;
    this.FormName = paramjs.formName;
    this.FormValue = paramjs.formValue;
    this.getTableData(true)
    this.getDivisionDrp();
    this.getPurchaseTypeDrp();
    this.getPurchaseCategoryDrp();
    this.getCustomerDrp();
    this.pageTermConditionloaddrp();
    this.pageChargesTypeloaddrp();
    this.pageChargesNatureloaddrp();
    this.pageTaxMasterloaddrp();
    this.pagePaytypeloaddrp();
    this.getOrganizationDrp();
    this.getWarehouseDrp()
    this.getPurchaseOrderTypeDrp();
    this.getDispatchForDrp();
    this.getPurchaseOrderBudget();
    this.getUomData();
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

  isInvalid(controlName: string): boolean {
    const forms: FormGroup[] = [
      this.POForm,
      this.itemDetailForm,
      this.paymentTermsForm,
      this.textDetailsForm,
      this.termsConditionForm,
      this.otherChargesForm,
      this.poQuotationForm
    ];

    let isInvalid = false;

    for (let form of forms) {
      const control = form.get(controlName);
      if (control && control.invalid && (control.dirty || control.touched)) {
        isInvalid = true;
        break;
      }
    }

    return isInvalid;
  }


  getTableData(isTrue: boolean) {
    try {
      if (isTrue) this.isLoading = true;
      else this.pageNo = 1;

      const userId = sessionStorage.getItem('userId') || '';
      const roleId = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
      const query = `searchText=${this.searchText}|pageIndex=${this.pageNo}|size=${this.pageSize}|appUserId=${userId}|appUserRole=${roleId}|districtId=${sessionStorage.getItem('District')}`;

      this.userService.getQuestionPaper(`uspPurchaseOrderViewDetail|${query}`).subscribe({
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
      this.POForm.reset();
      this.POForm.enable();
      return;
    }

    if (view === 'view') {
      this.POForm.disable();
    } else {
      this.POForm.enable();
    }

    if (data.sourceDocumentId) {
      this.sourceDrp = [{ 'label': data.sourceDocument, 'value': data.sourceDocumentId }]
    }
    if (data.divisionNameId) {
      this.divisionDrp = [{ 'drpOption': data.divisionName, 'drpValue': data.divisionNameId }]
    }
    if (data.orgId) {
      this.organizationDrp = [{ 'drpOption': data.org, 'drpValue': data.orgId }]
    }
    if (data.orgAddressId) {
      this.organizationAddressDrp = [{ 'drpOption': data.orgAddress, 'drpValue': data.orgAddressId }]
    }
    if (data.dispatchId) {
      this.dispatchForDrp = [{ 'drpOption': data.dispatch, 'drpValue': data.dispatchId }]
    }
    if (data.purchaseTypeId) {
      this.purchaseTypeDrp = [{ 'drpOption': data.purchaseType, 'drpValue': data.purchaseTypeId }]
    }
    if (data.purchaseCatId) {
      this.purchaseCategoryDrp = [{ 'drpOption': data.purchaseCat, 'drpValue': data.purchaseCatId }]
    }
    if (data.customerId) {
      this.customerDrp = [{ 'drpOption': data.customer, 'drpValue': data.customerId }]
    }
    if (data.currencyId) {
      this.currencyDrp = [{ 'drpOption': data.currency, 'drpValue': data.currencyId }]
    }
    if (data.customerAddressId) {
      this.customerAddressDrp = [{ 'drpOption': data.customerAddress, 'drpValue': data.customerAddressId }]
    }
    if (data.materialIndentTypeId) {
      this.purchaseOrderTypeDrp = [{ 'drpOption': data.materialIndentType, 'drpValue': data.materialIndentTypeId }]
    }
    if (data.PRId) {
      this.purchaseRequestDrp = [{ 'drpOption': data.customer, 'drpValue': data.PRId }]
    }

    this.POForm.patchValue({
      sourceDocumentId: data.sourceDocumentId ? data.sourceDocumentId : '',
      divisionNameId: data.divisionNameId ? data.divisionNameId : '',
      materialIndentTypeId: data.materialIndentTypeId ? data.materialIndentTypeId : '',
      warehouseId: data.warehouseId ? data.warehouseId : '',
      PRId: data.PRId ? data.PRId : '',
      purchaseTypeId: data.purchaseTypeId ? data.purchaseTypeId : '',
      customerId: data.customerId ? data.customerId : '',
      dispatchId: data.dispatchId ? data.dispatchId : '',
      orgId: data.orgId ? data.orgId : '',
      orgAddressId: data.orgAddressId ? data.orgAddressId : '',
      contactPerson: data.contactPerson ? data.contactPerson : '',
      validityDate: data.validityDate ? new Date(data.validityDate) : null,
      purchaseCatId: data.purchaseCatId ? data.purchaseCatId : '',
      currencyId: data.currencyId ? data.currencyId : '',
      customerAddressId: data.customerAddressId ? data.customerAddressId : '',
      remarks: data.remarks ? data.remarks : '',
      resumeUploadControl: data.attachFile ? data.attachFile : '',
      exclusiveAmount: data.exclusiveAmount ? data.exclusiveAmount : ''
    })

    if (data.attachFile && data.attachFile !== 'null' && data.attachFile.trim() !== '')
    {
      this.uploadedResumeUrl = this.getFullFileUrl(data.attachFile);
      if (this.resumeFileUpload) {
        this.resumeFileUpload = this.uploadedResumeUrl;
      }
    } else {
      this.uploadedResumeUrl = null; 
      this.resumeFileUpload = null;
    }

    this.itemViewTableData = JSON.parse(data.prDetails)
    this.paymentTermDetailsData = JSON.parse(data.paymentDetails)
    this.taxDetailData = JSON.parse(data.taxDetails)
    this.termsConditionData = JSON.parse(data.termsAndCondDetails)
    this.otherChargesData = JSON.parse(data.otherCharges)
    this.QuotationArr = JSON.parse(data.poQuotations)
    if (this.termsConditionData.length > 0) {
      this.termsConditionData.map((e:any) => {
        e.trmsAndCnd = e.termsCond
        e.trmsAndCndId = e.termsCondId
      })
    }
    if (this.QuotationArr.length > 0) {
      this.QuotationArr.map((e:any) => {
        e.company = e.text
      })
    }

    this.cdr.detectChanges();
    document.body.style.overflow = 'hidden';
  }

  getFullFileUrl(relativePath: string): string {
    const baseUrl = this.configService.baseUrl;
    return relativePath ? baseUrl + relativePath.replace(/\\/g, '/') : '';
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
    this.clearData();
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
        }
        else if (option === '5') {
          this.POForm.reset();
        }
      }
    });
  }

  onClear() {
    this.POForm.reset();
    this.itemDetailForm.reset();
    this.paymentTermsForm.reset();
    this.termsConditionForm.reset();
    this.otherChargesForm.reset();
    this.poQuotationForm.reset();
    this.textDetailsForm.reset();
    this.showTaxtypeTabData = false;
    this.itemViewTableData = [];
    this.paymentTermDetailsData = [];
    this.taxDetailData = [];
    this.termsConditionData = [];
    this.otherChargesData = [];
    this.QuotationArr = [];
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

  getDivisionDrp() {
    try {
      this.userService.getPurchasePageLoadDrp(this.FormName, `uspGetFillDrpDown|table=tblDivisonNameMaster|filterColumn=CityId|filterValue=${sessionStorage.getItem('District')}`)
        .subscribe({
          next: (res: any) => {
            try {
              this.divisionDrp = res;

              setTimeout(() => {
                this.cdr.detectChanges();
              }, 200);
            } catch (innerErr) {
              console.error('Error processing division dropdown response:', innerErr);
            }
          },
          error: (err: HttpErrorResponse) => {
            console.error('Error fetching division dropdown:', err);

            if (err.status === 403) {
              sessionStorage.setItem('userToken', '');
              this.router.navigate(['/login']);
            }

            this.cdr.detectChanges();
          },
          complete: () => {
            this.cdr.detectChanges();
          }
        });
    } catch (err) {
      console.error('Unexpected error in getDivisionDrp:', err);
      this.cdr.detectChanges();
    }

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 1000);
  }

  getPurchaseOrderBudget() {
    try {
      this.userService.getDetailsViewForm(this.FormName, 'uspGetPurchaseOrderBudget|action=GETBUDGET').subscribe({
          next: (res: any) => {
            try {
              if (res?.table?.length > 0) {
                this.budget = res.table[0]?.budget;
              }
            } catch (innerErr) {
              console.error('Error processing budget response:', innerErr);
            }
          },
          error: (err: HttpErrorResponse) => {
            console.error('Error fetching budget:', err);

            if (err.status === 403) {
              sessionStorage.setItem('userToken', '');
              this.router.navigate(['/login']);
            }

            this.cdr.detectChanges();
          },
          complete: () => {
            this.cdr.detectChanges();
          }
        });
    } catch (err) {
      console.error('Unexpected error in getPurchaseOrderBudget:', err);
      this.cdr.detectChanges();
    }

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 1000);
  }

  getPurchaseTypeDrp() {
    try {
      this.userService.getPurchasePageLoadDrp(this.FormName,'uspGetFillDrpDown|table=tblPurchaseType|filterColumn=|filterValue=')
        .subscribe({
          next: (res: any) => {
            try {
              this.purchaseTypeDrp = res;

              setTimeout(() => {
                this.cdr.detectChanges();
              }, 200);
            } catch (innerErr) {
              console.error('Error processing purchase type dropdown response:', innerErr);
            }
          },
          error: (err: HttpErrorResponse) => {
            console.error('Error fetching purchase type dropdown:', err);

            if (err.status === 403) {
              sessionStorage.setItem('userToken', '');
              this.router.navigate(['/login']);
            }

            this.cdr.detectChanges();
          },
          complete: () => {
            this.cdr.detectChanges();
          }
        });
    } catch (err) {
      console.error('Unexpected error in getPurchaseTypeDrp:', err);
      this.cdr.detectChanges();
    }

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 1000);
  }

  getPurchaseCategoryDrp() {
    try {
      this.userService
        .getPurchasePageLoadDrp(this.FormName,'uspGetFillDrpDown|table=tblPurchaseCategory|filterColumn=|filterValue=')
        .subscribe({
          next: (res:any) => {
            try {
              this.purchaseCategoryDrp = res;

              setTimeout(() => {
                this.cdr.detectChanges();
              }, 200);
            } catch (innerErr) {
              console.error('Error processing purchase category dropdown response:', innerErr);
            }
          },
          error: (err: HttpErrorResponse) => {
            console.error('Error fetching purchase category dropdown:', err);

            if (err.status === 403) {
              sessionStorage.setItem('userToken', '');
              this.router.navigate(['/login']);
            }

            this.cdr.detectChanges();
          },
          complete: () => {
            this.cdr.detectChanges();
          }
        });
    } catch (err) {
      console.error('Unexpected error in getPurchaseCategoryDrp:', err);
      this.cdr.detectChanges();
    }

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 1000);
  }

  getCustomerDrp() {
    try {
      this.userService.getPurchasePageLoadDrp(this.FormName,'uspGetFillDrpDown|table=tblCustomerMasterHeader|filterColumn=|filterValue=')
        .subscribe({
          next: (res: any) => {
            try {
              this.customerDrp = res;

              setTimeout(() => {
                this.cdr.detectChanges();
              }, 500);
            } catch (innerErr) {
              console.error('Error processing customer dropdown response:', innerErr);
            }
          },
          error: (err: HttpErrorResponse) => {
            console.error('Error fetching customer dropdown:', err);

            if (err.status === 403) {
              sessionStorage.setItem('userToken', '');
              this.router.navigate(['/login']);
            }

            this.cdr.detectChanges();
          },
          complete: () => {
            this.cdr.detectChanges();
          }
        });
    } catch (err) {
      console.error('Unexpected error in getCustomerDrp:', err);
      this.cdr.detectChanges();
    }

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 1000);
  }

  pageTermConditionloaddrp() {
    try {
      this.userService.getPurchasePageLoadDrp(this.FormName,'uspGetFillDrpDown|table=tblPurchaseTermsAndCondMstr|filterColumn=|filterValue=')
        .subscribe({
          next: (res: any) => {
            try {
              this.termConditionDrp = res;

              setTimeout(() => {
                this.cdr.detectChanges();
              }, 500);
            } catch (innerErr) {
              console.error('Error processing terms & conditions dropdown response:', innerErr);
            }
          },
          error: (err: HttpErrorResponse) => {
            console.error('Error fetching terms & conditions dropdown:', err);

            if (err.status === 403) {
              sessionStorage.setItem('userToken', '');
              this.router.navigate(['/login']);
            }

            this.cdr.detectChanges();
          },
          complete: () => {
            this.cdr.detectChanges();
          }
        });
    } catch (err) {
      console.error('Unexpected error in pageTermConditionloaddrp:', err);
      this.cdr.detectChanges();
    }

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 1000);
  }

  pageChargesTypeloaddrp() {
    try {
      this.userService.getPurchasePageLoadDrp(this.FormName,'uspGetFillDrpDown|table=tblChargesTypeMaster|filterColumn=|filterValue=')
        .subscribe({
          next: (res: any) => {
            try {
              this.chargesTypeDrp = res;

              setTimeout(() => {
                this.cdr.detectChanges();
              }, 500);
            } catch (innerErr) {
              console.error('Error processing charges type dropdown response:', innerErr);
            }
          },
          error: (err: HttpErrorResponse) => {
            console.error('Error fetching charges type dropdown:', err);

            if (err.status === 403) {
              sessionStorage.setItem('userToken', '');
              this.router.navigate(['/login']);
            }

            this.cdr.detectChanges();
          },
          complete: () => {
            this.cdr.detectChanges();
          }
        });
    } catch (err) {
      console.error('Unexpected error in pageChargesTypeloaddrp:', err);
      this.cdr.detectChanges();
    }

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 1000);
  }

  pageChargesNatureloaddrp() {
    try {
      this.userService.getPurchasePageLoadDrp(this.FormName,'uspGetFillDrpDown|table=tblNatureOfChargesMaster|filterColumn=|filterValue=')
        .subscribe({
          next: (res: any) => {
            try {
              this.natureDataDrp = res;
              this.natureDataDrpAll = res;

              setTimeout(() => {
                this.cdr.detectChanges();
              }, 500);
            } catch (innerErr) {
              console.error('Error processing nature of charges dropdown response:', innerErr);
            }
          },
          error: (err: HttpErrorResponse) => {
            console.error('Error fetching nature of charges dropdown:', err);

            if (err.status === 403) {
              sessionStorage.setItem('userToken', '');
              this.router.navigate(['/login']);
            }

            this.cdr.detectChanges();
          },
          complete: () => {
            this.cdr.detectChanges();
          }
        });
    } catch (err) {
      console.error('Unexpected error in pageChargesNatureloaddrp:', err);
      this.cdr.detectChanges();
    }

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 1000);
  }

  pageTaxMasterloaddrp() {
    try {
      this.userService.getPurchasePageLoadDrp(this.FormName,'uspGetFillDrpDown|table=tblPurchaseTaxDetailsMaster|filterColumn=|filterValue=')
        .subscribe({
          next: (res: any) => {
            try {
              this.taxMasterDrp = res;

              setTimeout(() => {
                this.cdr.detectChanges();
              }, 500);
            } catch (innerErr) {
              console.error('Error processing tax master dropdown response:', innerErr);
            }
          },
          error: (err: HttpErrorResponse) => {
            console.error('Error fetching tax master dropdown:', err);

            if (err.status === 403) {
              sessionStorage.setItem('userToken', '');
              this.router.navigate(['/login']);
            }

            this.cdr.detectChanges();
          },
          complete: () => {
            this.cdr.detectChanges();
          }
        });
    } catch (err) {
      console.error('Unexpected error in pageTaxMasterloaddrp:', err);
      this.cdr.detectChanges();
    }

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 1000);
  }

  pagePaytypeloaddrp() {
    try {
      this.userService.getPurchasePageLoadDrp(this.FormName,'uspGetFillDrpDown|table=tblPaymentTypeMaster|filterColumn=|filterValue=')
        .subscribe({
          next: (res: any) => {
            try {
              this.paymentTypeDrp = res;

              setTimeout(() => {
                this.cdr.detectChanges();
              }, 500);
            } catch (innerErr) {
              console.error('Error processing payment type dropdown response:', innerErr);
            }
          },
          error: (err: HttpErrorResponse) => {
            console.error('Error fetching payment type dropdown:', err);

            if (err.status === 403) {
              sessionStorage.setItem('userToken', '');
              this.router.navigate(['/login']);
            }

            this.cdr.detectChanges();
          },
          complete: () => {
            this.cdr.detectChanges();
          }
        });
    } catch (err) {
      console.error('Unexpected error in pagePaytypeloaddrp:', err);
      this.cdr.detectChanges();
    }

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 1000);
  }

  getOrganizationDrp() {
    try {
      this.userService.getPurchasePageLoadDrp(this.FormName,'uspGetFillDrpDown|table=tblOrgMaster|filterColumn=|filterValue=')
        .subscribe({
          next: (res: any) => {
            try {
              this.organizationDrp = res;

              setTimeout(() => {
                this.cdr.detectChanges();
              }, 200);
            } catch (innerErr) {
              console.error('Error processing organization dropdown response:', innerErr);
            }
          },
          error: (err: HttpErrorResponse) => {
            console.error('Error fetching organization dropdown:', err);

            if (err.status === 403) {
              sessionStorage.setItem('userToken', '');
              this.router.navigate(['/login']);
            }

            this.cdr.detectChanges();
          },
          complete: () => {
            this.cdr.detectChanges();
          }
        });
    } catch (err) {
      console.error('Unexpected error in getOrganizationDrp:', err);
      this.cdr.detectChanges();
    }

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 1000);
  }

  getOrganizationAddress() {
    const id = this.POForm.get('orgId')?.value ?? 0;
    this.userService.getQuestionPaper(`uspGetOrgAddress|orgId=${id}`).subscribe({
        next: (res: any) => {
          this.organizationAddressDrp = Array.isArray(res?.table)? res.table: [];
        },
        error: (err: HttpErrorResponse) => {
          console.error('Organization address error', err);

          if (err.status === 403) {
            sessionStorage.setItem('userToken', '');
            this.router.navigate(['/login']);
          }

          this.organizationAddressDrp = [];
        }
      });
  }


  getWarehouseDrp() {
    try {
      this.userService.BindWarehouse(this.FormName)
         .subscribe({
          next: (res: any) => {
            try {
              this.warehouseDrp = res;

              setTimeout(() => {
                this.cdr.detectChanges();
              }, 200);
            } catch (innerErr) {
              console.error('Error processing warehouse dropdown response:', innerErr);
            }
          },
          error: (err: HttpErrorResponse) => {
            console.error('Error fetching warehouse dropdown:', err);

            if (err.status === 403) {
              sessionStorage.setItem('userToken', '');
              this.router.navigate(['/login']);
            }

            this.cdr.detectChanges();
          },
          complete: () => {
            this.cdr.detectChanges();
          }
        });
    } catch (err) {
      console.error('Unexpected error in getWarehouseDrp:', err);
      this.cdr.detectChanges();
    }

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 1000);
  }

  getPurchaseOrderTypeDrp() {
    try {
      this.userService.BindIssueType(this.FormName)
        .subscribe({
          next: (res: any) => {
            try {
              this.purchaseOrderTypeDrp = res;

              setTimeout(() => {
                this.cdr.detectChanges();
              }, 500);
            } catch (innerErr) {
              console.error('Error processing purchase order type dropdown response:', innerErr);
            }
          },
          error: (err: HttpErrorResponse) => {
            console.error('Error fetching purchase order type dropdown:', err);

            if (err.status === 403) {
              sessionStorage.setItem('userToken', '');
              this.router.navigate(['/login']);
            }

            this.cdr.detectChanges();
          },
          complete: () => {
            this.cdr.detectChanges();
          }
        });
    } catch (err) {
      console.error('Unexpected error in getPurchaseOrderTypeDrp:', err);
      this.cdr.detectChanges();
    }

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 1000);
  }

  getDispatchForDrp() {
    try {
      this.userService.getPurchasePageLoadDrp(this.FormName,'uspGetFillDrpDown|table=tblOfficeLocationMaster|filterColumn=|filterValue=')
        .subscribe({
          next: (res: any) => {
            try {
              this.dispatchForDrp = res;

              setTimeout(() => {
                this.cdr.detectChanges();
              }, 200);
            } catch (innerErr) {
              console.error('Error processing dispatch dropdown response:', innerErr);
            }
          },
          error: (err: HttpErrorResponse) => {
            console.error('Error fetching dispatch dropdown:', err);

            if (err.status === 403) {
              sessionStorage.setItem('userToken', '');
              this.router.navigate(['/login']);
            }

            this.cdr.detectChanges();
          },
          complete: () => {
            this.cdr.detectChanges();
          }
        });
    } catch (err) {
      console.error('Unexpected error in getDispatchForDrp:', err);
      this.cdr.detectChanges();
    }

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 1000);
  }
   
  getUomData() {
    try {
      const currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}')?.roleId;
      this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblUnitMaster|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${currentRole}`)
        .subscribe({
          next: (res: any) => {
            try {
              this.uomDrp = res?.table || [];

              setTimeout(() => {
                this.cdr.detectChanges();
              }, 0);
            } catch (innerErr) {
              console.error('Error processing UOM dropdown response:', innerErr);
            }
          },
          error: (err: HttpErrorResponse) => {
            console.error('Error fetching UOM data:', err);

            if (err.status === 403) {
              sessionStorage.setItem('userToken', '');
              this.router.navigate(['/login']);
            }

            this.cdr.detectChanges();
          },
          complete: () => {
            this.cdr.detectChanges();
          }
        });
    } catch (err) {
      console.error('Unexpected error in getUomData:', err);
      this.cdr.detectChanges();
    }

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 1000);
  }

  getCurrencyDrp() {
    try {
      let id = this.POForm.get(`purchaseCatId`)?.value
      this.userService.getPurchasePageLoadDrp(this.FormName, `uspGetFillDrpDown|table=tblCurrencyMaster|filterColumn=categoryId|filterValue=${id ? id : 0}`)
        .subscribe({
          next: (res: any) => {
            try {
              this.currencyDrp = res;

              setTimeout(() => {
                this.cdr.detectChanges();
              }, 0);
            } catch (innerErr) {
              console.error('Error processing dropdown response:', innerErr);
            }
          },
          error: (err: HttpErrorResponse) => {
            console.error('Error fetching data:', err);

            if (err.status === 403) {
              sessionStorage.setItem('userToken', '');
              this.router.navigate(['/login']);
            }

            this.cdr.detectChanges();
          },
          complete: () => {
            this.cdr.detectChanges();
          }
        });
    } catch (err) {
      console.error('Unexpected error:', err);
      this.cdr.detectChanges();
    }

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 1000);
  }

  onChangeCustomer() {
    try {
      let id = this.POForm.get(`customerId`)?.value
      this.modifyPo()
      this.userService.getPurchasePageLoadDrp(this.FormName, `uspGetCustomerAddress|customerId=${id ? id : 0}`)
        .subscribe({
          next: (res: any) => {
            try {
              this.customerAddressDrp = res;

              setTimeout(() => {
                this.cdr.detectChanges();
              }, 0);
            } catch (innerErr) {
              console.error('Error processing dropdown response:', innerErr);
            }
          },
          error: (err: HttpErrorResponse) => {
            console.error('Error fetching data:', err);

            if (err.status === 403) {
              sessionStorage.setItem('userToken', '');
              this.router.navigate(['/login']);
            }

            this.cdr.detectChanges();
          },
          complete: () => {
            this.cdr.detectChanges();
          }
        });
    } catch (err) {
      console.error('Unexpected error:', err);
      this.cdr.detectChanges();
    }

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 1000);
  }

  onChangePurchaseOrderType() {
    try {
      const materialIndentTypeId = this.POForm.get('materialIndentTypeId')?.value;
      const sourceDocumentId = this.POForm.get('sourceDocumentId')?.value;
      const warehouseId = this.POForm.get('warehouseId')?.value;

      if (!warehouseId) {
        this.message.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'Please select Warehouse.',
          life: 3000
        });
        this.POForm.patchValue({ materialIndentTypeId: '' });

        setTimeout(() => {
          this.cdr.detectChanges();
        }, 100);

        return;
      }

      if (sourceDocumentId !== '10000') {
        this.POForm.get('PRId')?.enable();
      }

      this.poFromPrArr = [];
      this.grTotal = 0;

      const query = `uspGetPRPOByRequestType
      |action=PURCHASEREQUEST
      |warehouseId=${warehouseId || 0}
      |RequestTypeId=${materialIndentTypeId || 0}
      |sourceId=${sourceDocumentId || 0}
      |districtId=${sessionStorage.getItem('District')}`;

      this.userService.getPurchasePageLoadDrp(this.FormName, query).subscribe({
          next: (res: any) => {
            try {
              if (this.isDirect) {
                this.itemsDrp = res;

                setTimeout(() => {
                  this.cdr.detectChanges();
                }, 300);
              } else {
                this.purchaseRequestDrp = res;
                this.poFromPrModalArr = [...res];
                this.poEditmode = true;

                setTimeout(() => {
                  this.cdr.detectChanges();
                }, 300);
              }
            } catch (innerErr) {
              console.error('Error processing response:', innerErr);
            }
          },

          error: (err: HttpErrorResponse) => {
            console.error('API Error:', err);
          },

          complete: () => {
            this.cdr.detectChanges();
          }
        });

    } catch (err) {
      console.error('Unexpected error:', err);
      this.cdr.detectChanges();
    }
  }

  onSourceItemChange(event: any) {
    try {
      const sourceId = event.value;

      if (sourceId === '10000') {
        this.isDirect = true;
        this.POForm.get('PRId')?.disable();

        this.activeTabIndex = 0;

      } else {
        this.isDirect = false;
        this.POForm.get('PRId')?.enable();
      }

      this.poFromPrArr = [];
      this.poEditmode = true;

      this.POForm.patchValue({
        materialIndentTypeId: '',
        PRId: ''
      });

      this.cdr.detectChanges();

    } catch (err) {
      console.error('Error in onSourceItemChange:', err);
    }
  }


  getItemCode() {
    const id = this.itemDetailForm.get('itemId')?.value || 0;
    this.userService.getQuestionPaper(`uspGetMatReqMasters|action=MAKERCODE|itemId=${id}`)
      .subscribe({
        next: (res: any) => {
          this.itemCodeDrp = res?.table || [];

          this.itemDetailForm.patchValue({
            itemCodeid: '',
            unitId: res?.table1?.[0]?.unitId || ''
          });

          this.cdr.detectChanges();
        },

        error: (err: HttpErrorResponse) => {
          console.error('Error fetching data:', err);

          if (err.status === 403) {
            sessionStorage.setItem('userToken', '');
            this.router.navigate(['/login']);
          }
        }
      });
  }


  onChangeItemCode() {
    try {
      let itemCodeId = this.itemDetailForm.get(`itemCodeId`)?.value
      let warehouseId = this.POForm.get(`warehouseId`)?.value
      this.userService.getQuestionPaper(`uspBindItemQty|warehouseId=${warehouseId ? warehouseId : 0}|itemId=${itemCodeId ? itemCodeId : 0}`)
        .subscribe({
          next: (res: any) => {
            try {
              if (res['table'].length > 0) {
                this.itemDetailForm.patchValue({
                  availableQty: res['table'][0]['qty'] ? res['table'][0]['qty'] : 0,
                  rate: res['table'][0]['rate'] ? res['table'][0]['rate'] : 0,
                  quantity: 0,
                })
              }
              else {
                this.itemDetailForm.patchValue({
                  availableQty: 0,
                  rate: 0,
                  quantity: 0,
                })
              }
              setTimeout(() => {
                this.cdr.detectChanges();
              }, 0);
            } catch (innerErr) {
              console.error('Error processing dropdown response:', innerErr);
            }
          },
          error: (err: HttpErrorResponse) => {
            console.error('Error fetching data:', err);

            if (err.status === 403) {
              sessionStorage.setItem('userToken', '');
              this.router.navigate(['/login']);
            }

            this.cdr.detectChanges();
          },
          complete: () => {
            this.cdr.detectChanges();
          }
        });
    } catch (err) {
      console.error('Unexpected error:', err);
      this.cdr.detectChanges();
    }

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 1000);
  }

  handleChangePR(type:any) {
    this.columvalue = '';
    this.showTaxInfo = false;
    this.grTotal = 0;
    this.poEditmode = true;

    const PRId = this.POForm.get('PRId')?.value;
    const warehouseId = this.POForm.get('warehouseId')?.value;
    const materialIndentTypeId = this.POForm.get('materialIndentTypeId')?.value;
    const prMainId = type === 'ALL' ? 0 : PRId ?? 0;
    const action = type === 'ALL' ? 'PRALLCHILD' : 'PRCHILD';

    this.userService.getQuestionPaper(
        `uspGetPrDetail|action=${action}|warehouseId=${warehouseId ?? 0}|requestTypeId=${materialIndentTypeId ?? 0}|prMainId=${prMainId}|districtId=${sessionStorage.getItem(
          'District'
        )}|appUserId=${sessionStorage.getItem(
          'userId'
        )}|appUserRole=${JSON.parse(
          sessionStorage.getItem('currentRole') || '{}'
        ).roleId}`
      )
      .subscribe(
        (res: any) => {
          this.poFromPrArr = [];
          this.poFromPrModalArr = [];

          if (type === 'ALL') {
            this.dataSourcePR = res['table'];
            this.poFromPrModalArr = res['table'];
            this.poFromPrModalArr = res.table.map((e:any) => ({
              ...e,
              requestedQty: e.quantity
            }));
          } else {
            this.dataSourcePR = [];
            this.poFromPrArr = res['table'];
            this.poFromPrArr = res.table.map((e:any) => ({
              ...e,
              requestedQty: e.quantity
            }));

            setTimeout(() => {
              if (this.taxDetailData.length > 0) {
                this.getSelectedTaxes();
              }
            }, 500);
          }

        },
        (err: HttpErrorResponse) => {
          this.poFromPrArr = [];

          if (err.status === 403) {
            this.Customvalidation.loginroute(err.status);
          }
        }
      );
  }
  
  isPurchaseDrpHide() {
    this.poFromPrArr = [];
    this.poFromPrModalArr = [];
    this.isPurchaseDrp = !this.isPurchaseDrp;
    this.POForm.patchValue({
      PRId: ''
    })
    if (!this.isPurchaseDrp) {
      this.POForm.get('PRId')?.disable();
      this.openPRDetailModal()
      this.handleChangePR('ALL');
    } else {
      this.poFromPrModalArr = [];
      this.POForm.get('PRId')?.enable();
    }
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 200);
  }


  openPRDetailModal() {
    this.prDetailModel = true;
  }

  closePrDetailDialog() {
    this.prDetailModel = false;
    if (this.poFromPrArr.length == 0) {
      this.isPurchaseDrp = true;
      this.poFromPrModalArr = [];
    }
    if (this.isPurchaseDrp) {
      this.POForm.get('PRId')?.enable();
    }
    else {
      this.POForm.get('PRId')?.disable();
    }
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 200);
  }


  getFilteredModalData(evt:any, obj:any) {
    this.grTotal = 0;
    this.poEditmode = true
    if (evt.checked) {
      let isExist = this.poFromPrArr.some(pr => pr.prMainid == obj.prMainid && pr.itemCodeId == obj.itemCodeId)
      if (!isExist) {
        this.poFromPrArr.push(obj)
      }
    } else {
      this.poFromPrArr.splice(this.poFromPrArr.indexOf(obj), 1);
    }
    if (this.poFromPrArr.length > 0 && this.taxDetailData.length > 0) {
      this.getSelectedTaxes()
    }
  }

  updateTrColumValue() {
    if (this.poFromPrArr.some((e:any) => e.quantity == '0')) {
      this.message.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please enter quantity.',
        life: 3000
      });
      return
    }
    if (this.poFromPrArr.some((e: any) => e.rate == '0')) {
      this.message.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please enter rate.',
        life: 3000
      });
      return
    }
    this.poEditmode = false;
    this.getGrandTotal()
  }
  modifyPo() {
    this.showTooltip = false
    this.poEditmode = true;
    this.grTotal = 0
    this.postedPOItems = []
  }

  getGrandTotal() {
    this.grTotal = 0;
    this.poEditmode = true;
    this.poFromPrArrFinal = [];
    this.itemtaxwiseData = [];
    this.generatePrFormDetailData();

    const query =
      `tblPurchaseOrderFromPrDetails=${JSON.stringify(this.poFromPrArrFinal)}` +
      `|tblPurchOrdTaxDetails=${JSON.stringify(this.taxDetailData)}` +
      `|tblPurchOrdOtherCharges=${JSON.stringify(this.otherChargesData)}` +
      `|tblItems=${JSON.stringify(this.itemtaxwiseData)}`;

    this.userService.SubmitPostTypeData('uspGetPOItemsGrandTotal', query, this.FormName)
      .subscribe({
        next: (datacom: any) => {
          if (!datacom) return;

          const resultarray = datacom.split('-');

          if (resultarray[0] === '2') {

            if (resultarray[1] === 'GST not matched. Please check and try again!') {
              this.message.add({
                severity: 'warn',
                summary: 'Warning',
                detail: resultarray[1],
                life: 3000
              });
              this.poEditmode = true;
              this.cdr.markForCheck();
              return;
            }

            this.getPostedPOItems();
            this.grTotal = Number(resultarray[1]);
            this.poEditmode = false;

            this.cdr.markForCheck();
          }
        },
        error: () => {
          this.poEditmode = false;
          this.cdr.markForCheck();
        }
      });
  }


  generatePrFormDetailData() {
    try {
      if (this.poFromPrArr.length > 0) {
        this.poFromPrArr.forEach((item, i) => {
          let Probj = {
            prMainId: item.prMainid ?? 0,
            prChildId: item.prchildId ?? 0,
            itemId: item.itemId,
            quantityPurchased: item.quantity,
            rate: item.rate,
            techSpec: !this.isDirect ? this.itemDetailForm.get('techSpec')?.value || '' : item.techSpec,
            tolerance: !this.isDirect ? this.itemDetailForm.get('tolerance')?.value || '0' : (item.tolerance || '0'),
            taxPercentage: item.taxPercentage?.length? item.taxPercentage.map(String).join(',') : '',
            itemCodeId: item.itemCodeId ?? 0,
            unitId: item.unitId
          };
          this.poFromPrArrFinal.push(Probj)
          if (this.taxDetailData.length > 0) {
            if (item.taxPercentage && item.taxPercentage.length > 0) {
              item.taxPercentage.forEach((x:any) => {
                if (x != '' && x != '0') {
                  let record = this.taxDetailData.find(e => e.taxId == x)
                  let obj = {
                    prMainId: item.prMainid ? item.prMainid : 0,
                    prChildId: item.prchildId ? item.prchildId : 0,
                    itemId: item.itemId,
                    taxId: x ? x.toString() : '',
                    amount: record ? record['amount'] : '0',
                    natureId: this.taxDetailData[0]['natureId'] ? this.taxDetailData[0]['natureId'] : '',
                    itemCodeId: item.itemCodeId ? item.itemCodeId : 0
                  }
                  this.itemtaxwiseData.push(obj)
                }
              });
            }
          }
        })
      }
    }
    catch (error) {
      console.log(error);
    }

  }

  getPostedPOItems() {
    let data = this.poFromPrArrFinal.map((item:any) => ({ itemCodeId: item.itemCodeId ? item.itemCodeId : 0, itemId: item.itemId ? item.itemId : 0 }));
    let customerId = this.POForm.get('customerId')?.value || 0;
    this.userService.getQuestionPaper(`uspCheckItemPoInLastMonth|tblPurchaseOrderFromPrDetails=${JSON.stringify(data)}|customerId=${customerId != '' ? customerId : 0}`)
      .subscribe(
        (res: any) => {
          if (Object.keys(res).length > 0 && res.table.length > 0) {
            this.postedPOItems = res.table
          }
          else {
            this.postedPOItems = []
          }
        },
        (err: HttpErrorResponse) => {
          this.postedPOItems = []
          if (err.status == 403) {
            this.Customvalidation.loginroute(err.status);
          }
        }
      );
  }

  getSelectedTaxes() {
    this.modifyPo()
    if (!this.isTaxItemWise) {
      let totalDiscountPercentage = 0;
      let taxIds: string[] = [];

      for (let i = 0; i < this.taxDetailData.length; i++) {
        totalDiscountPercentage += parseFloat(this.taxDetailData[i].discount?.toString() || '0');
        taxIds.push(this.taxDetailData[i].taxId.toString());
      }

      this.poFromPrArr.forEach((item) => {
        item['discount'] = totalDiscountPercentage + '% (' + this.taxDetailData[0].optionId + ')';
        item['taxPercentage'] = taxIds;
      });
    }
  }

  showtaxField(event: any) {
    this.showTaxtypeTabData = false;
    let selectVal = event.value;
    if (selectVal === '') {
      this.showTaxtypeTabData = false;
    } else {
      this.showTaxtypeTabData = true;
    }
  }

  onSelectNature(event: any) {
    if (event.value == '10000') {
      this.textDetailsForm.get('amount')?.enable();
    }
    else {
      this.textDetailsForm.get('amount')?.disable();
      this.textDetailsForm.patchValue({
        amount: 0
      })
    }
  }

  removeAttachment(selectedFormControl: string, selectedForm: FormName) {
    const form = this[selectedForm] as FormGroup;
    form.patchValue({
      [selectedFormControl]: ''
    });
  }

  deleteRecord(tablealias: TableAlias, index: number, item: any) {
    this.modifyPo()
    if (tablealias == 'taxDetailData') {
      if (item.taxFor == "Order Wise") {
        this.taxDetailData.splice(index, 1);
        if (this.taxDetailData.length > 0) {
          this.getSelectedTaxes()
        }
        else {
          this.allTaxRemove()
        }
      }
      else {
        this.taxDetailData.splice(index, 1);
        this.poFromPrArr.forEach((e, i) => {
          if (e['taxPercentage']) {
            let taxIds = e['taxPercentage']
            if (taxIds.includes(item.taxId)) {
              let filteredIds = taxIds.filter((value:any) => value !== item.taxId);
              this.onTaxDrpChange(filteredIds, e, 'delete')
            }
          }

        })
        if (this.taxDetailData.length <= 0) {
          this.pageChargesNatureloaddrp()
          this.otherChargesForm.get('basic')?.disable();
          this.taxForDrp = [{ "drpVal": "Item Wise", "drpText": "Item Wise" }, { "drpVal": "Order Wise", "drpText": "Order Wise" }]
          this.taxOptionDrp = [{ "drpVal": "Inclusive", "drpText": "Inclusive" }, { "drpVal": "Exclusive", "drpText": "Exclusive" }]
          setTimeout(() => {
            $('#Drp_taxFor').selectpicker('refresh');
            $('#Drp_optionId').selectpicker('refresh');
            $(`#txt_amount`).val('0')
            $(`#txt_amount`).prop('disabled', true);
          }, 500);
        }
      }
    }
    else {
      (this[tablealias] as any[]).splice(index, 1);
    }
  }

  resetForm(formName: FormName) {
    this.selectedItemEdit = null
    this[formName].reset()
    if (formName == 'itemDetailForm') {
      this.itemDetailForm.patchValue({
        itemId: '',
        itemCodeId: '',
        rate: '',
        quantity: '',
        techSpec: '',
        tolerance: '',
        unitId: '',
        availableQty: '',
      });
    }

    if (formName == 'paymentTermsForm') {
      this.paymentTermsForm.patchValue({
        payTypeId: '',
        date: '',
        payValue: '',
        noOfDays: '',
        tolerance: '',
        remarks: '',

      });
    }
    if (formName == 'termsConditionForm') {
      this.termsConditionForm.patchValue({
        trmsAndCndId: '',
        remarks: '',
      });
    }

    if (formName == 'otherChargesForm') {
      this.otherChargesForm.patchValue({
        chargesId: '',
        natureId: '',
        value: '',
        remarks: '',
        basic: false,
      });

    }
    if (formName == 'poQuotationForm') {
      this.poQuotationForm.patchValue({
        company: '',
        quotation: '',
      });

    }
    if (formName == 'textDetailsForm') {
      this.textDetailsForm.patchValue({
        taxFor: '',
        natureId: '',
        taxId: '',
        amount: '0',
        optionId: '',
        discount: '',
        remarks: '',

      });
    }
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 100)
  }

  AddRow(formName: FormName) {
    const form = (this as any)[formName];
    if (form.invalid) {
        form.markAllAsTouched();
        return;
    }
    if (formName == 'itemDetailForm') {
      let quantity = this.itemDetailForm.get(`quantity`)?.value
      let rate = this.itemDetailForm.get(`rate`)?.value
      let obj = {
        itemId: this.itemDetailForm.get(`itemId`)?.value,
        item: this.itemsDrp.find((x: any) => x.drpValue === this.itemDetailForm.get('itemId')?.value)?.drpOption ?? '',
        itemCodeId: this.itemDetailForm.get(`itemCodeId`)?.value,
        itemCode: this.itemCodeDrp.find((x: any) => x.drpValue === this.itemDetailForm.get('itemCodeId')?.value)?.drpOption ?? '',
        rate: this.itemDetailForm.get(`rate`)?.value,
        quantity: this.itemDetailForm.get(`quantity`)?.value,
        techSpec: this.itemDetailForm.get(`techSpec`)?.value,
        tolerance: this.itemDetailForm.get(`tolerance`)?.value,
        unitId: this.itemDetailForm.get(`unitId`)?.value,
        unit: this.uomDrp.find((x: any) => x.drpValue === this.itemDetailForm.get('unitId')?.value)?.drpOption ?? '',
        availableQty: this.itemDetailForm.get(`availableQty`)?.value,
        prNumber: '',
        prMainid: 0,
        prchildId: 0,
        total: quantity * rate
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
      this.poFromPrArr.push(obj);
      if (this.taxDetailData.length > 0) {
        this.getSelectedTaxes()
      }
      else {
        this.modifyPo()
      }
    }
    if (formName == 'paymentTermsForm') {
      let obj = {
        payTypeId: this.paymentTermsForm.get(`payTypeId`)?.value,
        payType: this.paymentTypeDrp.find((x: any) => x.drpValue === this.paymentTermsForm.get('payTypeId')?.value)?.drpOption ?? '',
        date: this.datePipe.transform(this.paymentTermsForm.get('date')?.value, 'yyyy-MM-dd'),
        payValue: this.paymentTermsForm.get(`payValue`)?.value,
        noOfDays: this.paymentTermsForm.get(`noOfDays`)?.value,
        tolerance: this.paymentTermsForm.get(`tolerance`)?.value,
        remarks: this.paymentTermsForm.get(`remarks`)?.value
      }
      this.paymentTermDetailsData.push(obj);
    }
    if (formName == 'textDetailsForm') {
      let obj = {
        taxFor: this.textDetailsForm.get(`taxFor`)?.value,
        natureId: this.textDetailsForm.get(`natureId`)?.value,
        nature: this.natureDataDrp.find((x: any) => x.drpValue === this.textDetailsForm.get('natureId')?.value)?.drpOption ?? '',
        taxId: this.textDetailsForm.get(`taxId`)?.value,
        tax: this.taxMasterDrp.find((x: any) => x.drpValue === this.textDetailsForm.get('taxId')?.value)?.drpOption ?? '',
        amount: this.textDetailsForm.get(`amount`)?.value,
        optionId: this.textDetailsForm.get(`optionId`)?.value,
        discount: this.textDetailsForm.get(`discount`)?.value,
        remarks: this.textDetailsForm.get(`remarks`)?.value
      }
      if (obj.natureId == '10000' && obj.amount <= 0) {
        this.message.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'Please enter value for column *Amount',
          life: 3000
        });
        return
      }
      if (this.taxDetailData.length <= 0) {
        this.natureDataDrp = this.natureDataDrp.filter((x:any) => x.drpValue == obj.natureId)
        if (obj.taxFor == "Order Wise") {
          this.isTaxItemWise = false
          this.otherChargesForm.get('basic')?.enable();
          this.taxForDrp = [{ "drpVal": "Order Wise", "drpText": "Order Wise" }]
        }
        else {
          this.isTaxItemWise = true
          this.otherChargesForm.get('basic')?.disable();
          this.taxForDrp = [{ "drpVal": "Item Wise", "drpText": "Item Wise" }]
        }
        if (obj.optionId == "Exclusive") {
          this.taxOptionDrp = [{ "drpVal": "Exclusive", "drpText": "Exclusive" }]
        }
        else {
          this.taxOptionDrp = [{ "drpVal": "Inclusive", "drpText": "Inclusive" }]
        }
      }
      else {
        if (this.taxDetailData.some(e => e.taxId == obj.taxId)) {
          this.message.add({
            severity: 'warn',
            summary: 'Warning',
            detail: 'Tax type already exist.',
            life: 3000
          });
          return
        }
        if (this.taxDetailData.some(e => e.taxFor != obj.taxFor)) {
          this.message.add({
            severity: 'warn',
            summary: 'Warning',
            detail: 'Please select same Taxfor.',
            life: 3000
          });
          return
        }
        if (this.taxDetailData.some(e => e.natureId != obj.natureId)) {
          this.message.add({
            severity: 'warn',
            summary: 'Warning',
            detail: 'Please select same Nature type.',
            life: 3000
          });
          return
        }
        if (this.taxDetailData.some(e => e.optionId != obj.optionId)) {
          this.message.add({
            severity: 'warn',
            summary: 'Warning',
            detail: 'Please select same Tax option.',
            life: 3000
          });
          return
        }
      }
      this.taxDetailData.push(obj);
      this.getSelectedTaxes()
    }
    if (formName == 'termsConditionForm') {
      let obj = {
        trmsAndCndId: this.termsConditionForm.get(`trmsAndCndId`)?.value,
        trmsAndCnd: this.termConditionDrp.find((x: any) => x.drpValue === this.termsConditionForm.get('trmsAndCndId')?.value)?.drpOption ?? '',
        remarks: this.termsConditionForm.get(`remarks`)?.value
      }
      this.termsConditionData.push(obj);
    }
    if (formName == 'otherChargesForm') {
      let obj = {
        chargesId: this.otherChargesForm.get(`chargesId`)?.value,
        charges: this.chargesTypeDrp.find((x: any) => x.drpValue === this.otherChargesForm.get('chargesId')?.value)?.drpOption ?? '',
        natureId: this.otherChargesForm.get(`natureId`)?.value,
        nature: this.natureDataDrpAll.find((x: any) => x.drpValue === this.otherChargesForm.get('natureId')?.value)?.drpOption ?? '',
        value: this.otherChargesForm.get(`value`)?.value,
        remarks: this.otherChargesForm.get(`remarks`)?.value,
        basic: this.otherChargesForm.get(`basic`)?.value,
      }
      if (!obj.value || obj.value == 0) {
        this.message.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'Please enter value for column *Value',
          life: 3000
        });
        return;
      }
      this.otherChargesData.push(obj);
      this.modifyPo()
      this.otherChargesForm.get('basic')?.setValue(false);
    }
    if (formName == 'poQuotationForm') {
      let obj = {
        company: this.poQuotationForm.get(`company`)?.value,
        quotation: this.poQuotationForm.get(`quotationUploadControl`)?.value
      }
      this.QuotationArr.push(obj);
    }

    setTimeout(() => {
      this.resetForm(formName)
      this.uploadedQuotationUrl = '';
    }, 100);

  }

  getRateList(item: any) {
    this.isFormLoading = true;
    this.userService.getQuestionPaper(`uspGetItemRateList|itemId=${item.itemId}|itemCodeId=${item.itemCodeId}|districtId=${sessionStorage.getItem('District')}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId}`)
      .subscribe(
        (data: any) => {
          try {
            if (Object.keys(data).length > 0 && data.table?.length > 0) {
              setTimeout(() => {
                this.priceListData = data.table.map((row: any) => {
                  try {
                    return {
                      ...row,
                      taxList: row.tax ? JSON.parse(row.tax) : []
                    };
                  } catch (parseErr) {
                    console.error('Tax JSON parse error:', parseErr, row.tax);
                    return {
                      ...row,
                      taxList: []
                    };
                  }
                });

                this.isFormLoading = false;
                this.openPriceListModal();
              }, 1000);
            } else {
              setTimeout(() => {
                this.priceListData = [];
                this.isFormLoading = false;
                this.openPriceListModal();
              }, 1000);
            }
          } catch (err) {
            console.error('getRateList processing error:', err);
            this.isFormLoading = false;
            this.priceListData = [];
          }
        },
        (err: HttpErrorResponse) => {
          this.isFormLoading = false;

          if (err.status === 403) {
            sessionStorage.setItem('userToken', '');
            this.Customvalidation.loginroute(err.status);
          }
        }
      );
  }

  openPriceListModal() {
    this.priceListDialog = true;
  }

  closePriceListDialog() {
    this.priceListData = [];
    this.priceListDialog = false;
  }

  onChangeQuantityPrice(evt: any, index: number, item: any) {
    const reqQty = Number(item.requestedQty || 0);
    const qty = Number(item.quantity || 0);
    const rate = Number(item.rate || 0);
    if (qty > reqQty) {
      item.quantity = 0;
    }
    item.rate = rate;
    item.quantity = qty;
    item.total = qty * rate;
  }

  onTaxDrpChange(event:any, item:any, isDelete?:any) {
    let data = isDelete ? event : event.value
    if (data.length > 0) {
      let selectedTaxData = this.taxDetailData.filter(e => data.includes(e.taxId))
      let totalDiscountPercentage = 0;
      for (let i = 0; i < selectedTaxData.length; i++) {
        totalDiscountPercentage += parseFloat(selectedTaxData[i].discount == '' ? 0 : selectedTaxData[i].discount);
      }
      item['discount'] = totalDiscountPercentage + '% (' + selectedTaxData[0].optionId + ')'
      item['taxPercentage'] = data
    }
    else {
      item['discount'] = ''
      item['taxPercentage'] = []
    }

  }


  allTaxRemove() {
    this.poFromPrArr.forEach((data, index) => {
      data['discount'] = ''
      data['taxPercentage'] = []
    });
    this.pageChargesNatureloaddrp()
    this.otherChargesForm.get('basic')?.disable();
    this.taxForDrp = [{ "drpVal": "Item Wise", "drpText": "Item Wise" }, { "drpVal": "Order Wise", "drpText": "Order Wise" }]
    this.taxOptionDrp = [{ "drpVal": "Inclusive", "drpText": "Inclusive" }, { "drpVal": "Exclusive", "drpText": "Exclusive" }]
    this.textDetailsForm.reset({
      taxFor: '',
      optionId: '',
      amount: 0
    });
    this.textDetailsForm.get('amount')?.disable();
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
      const folderName = 'PurchaseOrder';

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

              this.POForm.patchValue({
                resumeUploadControl: relativePath
              });

              this.uploadedResumeUrl = fullUrl;

              this.message.add({
                severity: 'success',
                summary: 'Success',
                detail: 'File uploaded successfully!',
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
            console.error('Error processing file upload response:', innerErr);
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
      console.error('Unexpected error:', error);
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
    this.POForm.patchValue({
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
  openQuotationUploadDialog() {
    this.showQuotationUploadDialog = true;
    this.selectedQuotationFile = null;
    this.cdr.detectChanges();
  }

  closeQuotationUploadDialog() {
    this.showQuotationUploadDialog = false;
    this.selectedQuotationFile = null;
    this.cdr.detectChanges();
  }

  // --- File Selection ---
  onQuotationFileSelect(event: any) {
    if (event.files && event.files.length > 0) {
      this.selectedQuotationFile = event.files[0];
      this.cdr.detectChanges();
    }
  }

  // --- Clear Selection ---
  clearQuotationSelection() {
    this.selectedQuotationFile = null;
    if (this.quotationFileUpload) {
      this.quotationFileUpload.clear();
    }
    this.cdr.detectChanges();
  }

  // --- Upload Quotation ---
  uploadQuotation() {
    try {
      if (!this.selectedQuotationFile) {
        this.message.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'Please select file.',
          life: 3000
        });
        return;
      }

      this.isUploadingQuotation = true;
      this.cdr.detectChanges();

      const filesArray: File[] = [this.selectedQuotationFile];
      const folderName = 'PurchaseOrder';

      this.userService.MastrtfileuploadNew(filesArray, folderName).subscribe({
        next: (datacom: any) => {
          this.isUploadingQuotation = false;

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
              const fullUrl = this.normalizeImagePathQuotation(relativePath);

              this.poQuotationForm.patchValue({
                quotationUploadControl: relativePath
              });

              this.uploadedQuotationUrl = fullUrl;

              this.message.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Quotation uploaded successfully!',
                life: 3000
              });

              this.closeQuotationUploadDialog();
            } else {
              this.message.add({
                severity: 'warn',
                summary: 'Warning',
                detail: resultarray[1] || datacom,
                life: 3000
              });
            }
          } catch (innerErr) {
            console.error('Error processing quotation upload response:', innerErr);
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
          this.isUploadingQuotation = false;
          console.error('Quotation upload error:', err);

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
      console.error('Unexpected error:', error);
      this.isUploadingQuotation = false;

      this.message.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Something went wrong while uploading',
        life: 3000
      });

      this.cdr.detectChanges();
    }
  }

  removeQuotation() {
    this.uploadedQuotationUrl = '';
    this.poQuotationForm.patchValue({
      quotationUploadControl: ''
    });
    this.message.add({
      severity: 'info',
      summary: 'Removed',
      detail: 'Quotation removed successfully.',
      life: 2000
    });
  }

  normalizeImagePathQuotation(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) {
      return path;
    }
    let normalizedPath = path.replace(/\\/g, '/');
    normalizedPath = normalizedPath.replace(/([^:]\/)\/+/g, '$1');
    return this.configService.baseUrl + normalizedPath;
  }


  getFileSizeQuotation(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  quotationView(url: string) {
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

  clearData() {
    this.POForm.reset()
    this.postType = 'add'
    this.itemDetailData = []
    this.poFromPrModalArr = [];
    this.poFromPrArr = [];
    this.paymentTermDetailsData = []
    this.taxDetailData = []
    this.termsConditionData = []
    this.otherChargesData = []
    this.poFromPrArrFinal = []
    this.itemtaxwiseData = []
    this.taxForDrp = [{ "drpVal": "Item Wise", "drpText": "Item Wise" }, { "drpVal": "Order Wise", "drpText": "Order Wise" }]
    this.taxOptionDrp = [{ "drpVal": "Inclusive", "drpText": "Inclusive" }, { "drpVal": "Exclusive", "drpText": "Exclusive" }]
    this.pageChargesNatureloaddrp()
    this.isPurchaseDrp = true;
    this.poEditmode = true;
    this.QuotationArr = []
    this.isDirect = false
    this.grTotal = 0
    this.postedPOItems = []
    this.uploadedResumeUrl = ''
    this.uploadedQuotationUrl = ''
    setTimeout(() => {
      this.POForm.patchValue({
        sourceDocumentId: '',
        PRId: '',
        warehouseId: '',
        materialIndentTypeId: '',
        customerId: '',
        divisionNameId: '',
        validityDate: '',
        purchaseTypeId: '',
        dispatchId: '',
        orgId: '',
        text: '',
        attachFile: '',
        exclusiveAmount: '',
        contactPerson: '',
        purchaseCatId: '',
        currencyId: '',
        customerAddressId: '',
        orgAddressId: '',
      })
    }, 100);
  }

  postPostedItems() {
    this.userService.SubmitPostTypeData('uspSendMailforRepeatedItemsForPO', `itemDetails=${JSON.stringify(this.postedPOItems)}|appUserId=${sessionStorage.getItem('userId')}`, this.FormName)
      .subscribe((datacom: any) => {
        this.postedPOItems = []
      });
  }

  OnSubmitModal() {
    if (this.POForm.invalid) {
      this.POForm.markAllAsTouched();
      return
    }
    if (this.poFromPrArr.length == 0) {
      this.message.add({
        severity: 'warn',
        summary: 'Warning',
        detail: `${this.isDirect} ? "Please add item details." : "Please add purchase order from pr details.`,
        life: 3000
      });
      return
    }
    if (this.poEditmode) {
      this.showTooltip = true
      setTimeout(() => {
        this.showTooltip = false
      }, 3000);
      return
    }

    this.paramvaluedata = ''
    this.poFromPrArrFinal = []
    this.itemtaxwiseData = []
    let obj = {
      SourceDocumentId: this.POForm.get(`sourceDocumentId`)?.value,
      validityDate: this.datePipe.transform(this.POForm.get('validityDate')?.value, 'yyyy-MM-dd'),
      PRId: this.POForm.get(`PRId`)?.value ? this.POForm.get(`PRId`)?.value : 0,
      warehouseId: this.POForm.get(`warehouseId`)?.value,
      materialIndentTypeId: this.POForm.get(`materialIndentTypeId`)?.value,
      customerId: this.POForm.get(`customerId`)?.value,
      divisionNameId: this.POForm.get(`divisionNameId`)?.value,
      Organization: this.POForm.get(`orgId`)?.value,
      Dispatch: this.POForm.get(`dispatchId`)?.value,
      purchaseTypeId: this.POForm.get(`purchaseTypeId`)?.value,
      contactPerson: this.POForm.get(`contactPerson`)?.value,
      purchaseCatId: this.POForm.get(`purchaseCatId`)?.value,
      currencyId: this.POForm.get(`currencyId`)?.value,
      customerAddressId: this.POForm.get(`customerAddressId`)?.value,
      orgAddressId: this.POForm.get(`orgAddressId`)?.value,
      attachFile: this.POForm.get(`resumeUploadControl`)?.value,
      remarks: this.POForm.get(`remarks`)?.value,
      exclusiveAmount: this.POForm.get(`exclusiveAmount`)?.value ? this.POForm.get(`exclusiveAmount`)?.value : 0,
      approveStatus: '10001',
      poType: this.taxDetailData.length <= 0 ? '' : this.isTaxItemWise ? 'Item Wise' : 'Order Wise',
      text: ''
    };
    this.generatePrFormDetailData()
    this.paramvaluedata = `tblPurchaseOrderHeader=${JSON.stringify([obj])}|tblPurchaseOrderFromPrDetails=${JSON.stringify(this.poFromPrArrFinal)}|tblPurchOrdPayTermDtls=${JSON.stringify(this.paymentTermDetailsData)}|tblPurchOrdTaxDetails=${JSON.stringify(this.taxDetailData)}|tblPurchOrdTermAndCondDtls=${JSON.stringify(this.termsConditionData)}|tblPurchOrdOtherCharges=${JSON.stringify(this.otherChargesData)}|tblItems=${JSON.stringify(this.itemtaxwiseData)}|attachDocument=${obj.attachFile}|poQuotation=${JSON.stringify(this.QuotationArr)}|appUserId=${sessionStorage.getItem('userId')}|districtId=${sessionStorage.getItem('District')}`
    this.openConfirmation('Confirm?', 'Are you sure you want to proceed?', '1', '1');
  }

  submitcall() {
    try {
      this.isFormLoading = true;

      this.userService.SubmitPostTypeData('uspPostPODetails', this.paramvaluedata, this.FormName).subscribe({
        next: (datacom: any) => {
          this.isFormLoading = false;
          try {
            if (!datacom) return;
            const resultarray = datacom.split('-');
            if (resultarray[1] === 'success') {
              this.getTableData(false);
              if (this.postedPOItems.length) {
                this.postPostedItems()
              }
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

  onItemAction(item: any, type: any) {
    let action = type == 'Delete' ? 'Delete' : type;
    this.selectedAction = type
    this.openConfirmation('Confirm?', "Are you sure you want to " + action + "?", item.id, '2')
  }

  actionSubmit(id: any) {
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
    let query = `uspReportPurchaseOrder|fromdate=${startDate}|todate=${currentDate}|districtId=${sessionStorage.getItem("District")}`
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

  switchTab(index: number) {
    if (
      (index > 0 && this.poFromPrArr.length === 0 && this.postType !== 'view')
    ) {
      return;
    }
    this.activeTabIndex = index;
  }

  digitToWords(amount:any) {
    var words = new Array();
    words[0] = '';
    words[1] = 'One';
    words[2] = 'Two';
    words[3] = 'Three';
    words[4] = 'Four';
    words[5] = 'Five';
    words[6] = 'Six';
    words[7] = 'Seven';
    words[8] = 'Eight';
    words[9] = 'Nine';
    words[10] = 'Ten';
    words[11] = 'Eleven';
    words[12] = 'Twelve';
    words[13] = 'Thirteen';
    words[14] = 'Fourteen';
    words[15] = 'Fifteen';
    words[16] = 'Sixteen';
    words[17] = 'Seventeen';
    words[18] = 'Eighteen';
    words[19] = 'Nineteen';
    words[20] = 'Twenty';
    words[30] = 'Thirty';
    words[40] = 'Forty';
    words[50] = 'Fifty';
    words[60] = 'Sixty';
    words[70] = 'Seventy';
    words[80] = 'Eighty';
    words[90] = 'Ninety';
    amount = amount.toString();
    var atemp = amount.split(".");
    var number = atemp[0].split(",").join("");
    var n_length = number.length;
    var words_string = "";
    if (n_length <= 9) {
      var n_array: any = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0);
      var received_n_array = new Array();
      for (var i = 0; i < n_length; i++) {
        received_n_array[i] = number.substr(i, 1);
      }
      for (var i = 9 - n_length, j = 0; i < 9; i++, j++) {
        n_array[i] = received_n_array[j];
      }
      for (var i = 0, j = 1; i < 9; i++, j++) {
        if (i == 0 || i == 2 || i == 4 || i == 7) {
          if (n_array[i] == 1) {
            n_array[j] = 10 + parseInt(n_array[j]);
            n_array[i] = 0;
          }
        }
      }
      let value: any = "";
      for (var i = 0; i < 9; i++) {
        if (i == 0 || i == 2 || i == 4 || i == 7) {
          value = n_array[i] * 10;
        } else {
          value = n_array[i];
        }
        if (value != 0) {
          words_string += words[value] + " ";
        }
        if ((i == 1 && value != 0) || (i == 0 && value != 0 && n_array[i + 1] == 0)) {
          words_string += "Crores ";
        }
        if ((i == 3 && value != 0) || (i == 2 && value != 0 && n_array[i + 1] == 0)) {
          words_string += "Lakhs ";
        }
        if ((i == 5 && value != 0) || (i == 4 && value != 0 && n_array[i + 1] == 0)) {
          words_string += "Thousand ";
        }
        if (i == 6 && value != 0 && (n_array[i + 1] != 0 && n_array[i + 2] != 0)) {
          // words_string += "Hundred and ";
          words_string += "Hundred ";
        } else if (i == 6 && value != 0) {
          words_string += "Hundred ";
        }
      }
      words_string = words_string.split("  ").join(" ");
    }
    return words_string;
  }

  openprintModalData(id: any) {
    this.userService.getQuestionPaper(`uspGetPOPrintNew|poId=${id}`).subscribe(
      (data: any) => {
        if (Object.keys(data).length > 0 && data.table.length > 0) {
          var grandTotal = 0;
          let decimalPart = 0;
          if (data.table4.length > 0) {
            grandTotal = data.table4[0]['grandTotal'] ? data.table4[0]['grandTotal'] : 0
            const decimalString = grandTotal.toString().split('.')[1];
            decimalPart = decimalString ? parseFloat(decimalString) : 0;
            data.table4.forEach((e: any) => {
              if (e['taxDetails'] && e['taxDetails'] != '') {
                e['taxDetails'] = JSON.parse(e['taxDetails'])
              }
            })
          }
          if (data.table.length > 0) {
            const html = `
           <table style="font-family: helvetica; max-width: 100%;" >
            <head><title>${data.table[0].header}</title></head>
        <tr>
          <td>
            <table style="width: 100%;">
              <tr>
                <td>
                  <table style="text-align: center;width: 100%;border: 2px solid #000000;" cellpadding="0" cellspacing="0">
                    <tr>
                    <td>
                    <table style="width: 100%;">
                    <tr>
                    ${data.table[0].poStatus.toLowerCase() == 'authorized' || data.table[0].poStatus.toLowerCase() == 'authorised' ?
                ` <td style="width: 50%;">
                      <p style="text-align: left;font-weight: 600; font-size: 16px;  margin-bottom: 0px;">${data.table[0].poStatus}</p>
                    </td>`
                : ` <td style="width: 50%;">
                      <p style="text-align: left;color:#ff3939;font-weight: 600; font-size: 16px;margin-bottom: 0px;">${data.table[0].poStatus}</p>
                    </td>`
              }                      
                      <td style="width: 50%;">
                      <p style="text-align: right;margin-bottom: 0px;">${data.table[0].poStatus.toLowerCase() == 'pending' ? 'Draft' : ''}</p>
                       
                      </td>
                      </tr>
                      </table>
                      </tr>
                      <td>
                    </tr>
                    <tr>
                      <td style="width: 100%;">
                        <h2 style="font-size: 24px;font-weight: bold;">${data.table[0].org}</h2>
                      </td>
                    </tr>
                    <tr>
                      <td style="width: 100%;">
                        <p style=" margin: 0;">${data.table[0].orgAddr}</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="width: 100%;">
                        <p style=" margin: 0;"><strong>Phone :${data.table[0].orgPhone}, Email :${data.table[0].orgEmail}</strong></p>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <h2 style="font-size: 22px; max-width: 500px; margin: auto; margin-top: 5px; margin-bottom: 5px; padding: 10px; border: 1px solid #000000; box-shadow: 5px 5px 5px #000000; text-align: center;">${data.table[0].header}<br>
                        <span style="font-size: 14px;">${data.table[0].formNo}</span></h2>
    
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td>
            <table style="width: 100%;">
              <tr>
                <td>
                  <table class="table" style="width: 100%; border: 2px solid;font-size:13px;  margin-bottom: 0;">
                    <tbody>
                      <tr>
                        <td width="60%">
                          <div>
                            <p class="m-0">To,</p>
                            <p class="pl-4 m-0"><strong>${data.table[0].vendor}</strong> <br/> <br/>${data.table[0].address}</p>
                          </div>
                          <table class="m-0" style="width: 100%; border: 0;">
                            <tbody>
                              <tr>
                                <td style="width: 35%;padding-left:0">Contact Person</td>
                                <td style="width: 65%;">: <strong class="ml-3">${data.table[0].contactPerson}</strong></td>
                              </tr>
                              <tr>
                                <td style="width: 35%;padding-left:0">Email</td>
                                <td style="width: 65%;">: <strong class="ml-3">${data.table[0].email}</strong></td>
                              </tr>
                              <tr>
                                <td style="width: 35%;padding-left:0">Phone</td>
                                <td style="width: 65%;">: <strong class="ml-3">${data.table[0].phone}</strong></td>
                              </tr>
                              <!--<tr>
                                <td style="width: 35%;padding-left:0">Fax</td>
                                <td style="width: 65%;">: <strong class="ml-3">${data.table[0].fax}</strong></td>
                              </tr>-->
                              <tr>
                                <td style="width: 35%;padding-left:0">Website</td>
                                <td style="width: 65%;">: <strong class="ml-3">${data.table[0].website}</strong></td>
                              </tr>
                              <tr>
                                <td style="width: 35%;padding-left:0">GST No.</td>
                                <td style="width: 65%;">: <strong class="ml-3">${data.table[0].gst ? data.table[0].gst : ''}</strong></td>
                              </tr>
                              
                            </tbody>
                          </table>
                        </td>
                        <td width="40%" style="border-left: 2px solid #333333; padding:0px;vertical-align: top;">
                          <table class="m-0" style="width: 100%; border: 0;margin:5px">
                            <tbody>
                              <tr>
                                <td style="width: 40%;">Location</td>
                                <td style="width: 60%;">: <strong class="ml-3">${data.table[0].district}</strong></td>
                              </tr>
                              <tr>
                                <td style="width: 40%;">PO. No.</td>
                                <td style="width: 60%;">: <strong class="ml-3">${data.table[0].poNumber}</strong></td>
                              </tr>
                              <tr>
                                <td style="width: 40%;">PO. Date</td>
                                <td style="width: 60%;">: <strong class="ml-3">${data.table[0].poDate}</strong></td>
                              </tr>
                              <tr>
                                <td style="width: 35%;">Quote No.</td>
                                <td style="width: 65%;">: <strong class="ml-3">${data.table[0].offerNo}</strong></td>
                              </tr>
                              <tr>
                                <td style="width: 35%;">Quote Date</td>
                                <td style="width: 65%;">: <strong class="ml-3">${data.table[0].offerDate}</strong></td>
                              </tr>
                              <tr>
                                <td style="width: 35%;">Source Document</td>
                                <td style="width: 65%;">: <strong class="ml-3">${data.table[0].sourceDocument}</strong></td>
                              </tr>
                            </tbody>
                          </table>
                          <table class="m-0" style="width: 100%;border-top: 2px solid;">
                            <tbody>
                              <tr>
                                <td style="padding: 0;">
                                <table class="m-0" style="width: 100%;margin:5px">
                                <tbody>
                                  <tr>
                                    <td style="width: 40%;">Dept.</td>
                                    <td style="width: 60%;">: <strong class="ml-3">${data.table[0].department}</strong></td>
                                  </tr>
                                  <!--<tr>
                                    <td style="width: 40%;">Category</td>
                                    <td style="width: 60%;">: <strong class="ml-3">${data.table[0].department}</strong></td>
                                  </tr>
                                  <tr>
                                    <td style="width: 40%;">Sub-category</td>
                                    <td style="width: 60%;">: <strong class="ml-3">${data.table[0].department}</strong></td>
                                  </tr>-->
                                </tbody>
                              </table>
                                
                                </td>
                              </tr>
                            
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!--<tr>
          <td>
            <table style="width: 100%;">
              <tr>
                <td>
                  <table class="table border-0 table-borderless" style="width: 100%; border: 2px solid;">
                    <tbody>
                      <tr>
                        <td style="padding: 10px;">Please supply the materials conforming to the technical specifications and terms and conditions, as listed below :</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>-->
        <tr>
          <td>
            <table style="width: 100%;">
              <tr>
                <td>
                  <table class="table table-bordered" style="margin: 0; width: 100%;" cellpadding="3" cellspacing="0" border="1" bordercolor="#000000">
                    <thead>
                      <tr>
                        <th rowspan="2" style="">SI<br/>NO.</th>
                        <th rowspan="2" style="">Item Description</th>
                        <th rowspan="2" style="text-align:center">UOM</th>
                        <th colspan="2" style="text-align:center">Delivery</th>
                        <th rowspan="2" style="text-align:center">Unit Price(${data.table[0].currencyIcon})</th>
                        <th rowspan="2" style="text-align:center">Tax %</th>
                        
                        <th rowspan="2" style="">Amount in  ${data.table[0].currency}(${data.table[0].currencyIcon})  </th>
                      </tr>
                      <tr>
                        <th style="text-align:center">Qty</th>
                        <th style="text-align:center">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                    ${data.table4.map((eldata:any, index:any) => `
                    <tr style="border: 1px solid">
                      <td style="border: 1px solid !important; text-align:center">${index + 1}</td>
                      <td style="border: 1px solid !important;text-align:left;max-width: 300px;word-break: break-all;">
                      ${eldata.itemDesc}
                      ${eldata.techSpec ?
                  ` <br>Tech Spec.  ${eldata.techSpec}`

                  : ''}
                      </td>
                      <td style="border: 1px solid !important;text-align:center">${eldata.uom ? eldata.uom : ''}</td>
                      <td style="border: 1px solid !important;text-align:center">${eldata.quantityPurchased}</td>
                      <td style="border: 1px solid !important;text-align:center">${eldata.podate}</td>
                      <td style="border: 1px solid !important;text-align:center">${eldata.rate}</td>
                      <td style="border: 1px solid !important;text-align:center">
                      ${eldata.taxDetails != '' ?
                  `<table style="width: 100%; margin: 0;">
                      <tbody>
                        ${eldata.taxDetails.map((eldata:any, index:any) => `
                          <tr>
                            <td style="padding: 0;">${eldata['GST']}</td>
                            <td style="">${eldata.optionId == 'Exclusive' ? `(${eldata.disPer > 0 ? `Dis.${eldata.disPer}%,` : ''}Exc.)` : `(${eldata.disPer > 0 ? `Dis.${eldata.disPer}%,` : ''}Inc.)`}</td>
                            <td style="padding: 0;text-align: right;">${eldata.taxamt > 0 ? eldata.taxamt : ''}</td>
                        </tr>
                      `).join('')}
    
                   
                      </tbody>
                    </table>`

                  : ''}
                      </td>
                      <td style="border: 1px solid !important;text-align:right">${eldata.totalAmount}</td>
                  </tr>
                            `).join('')}
                            
                            
                    </tbody>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td>
            <table style="width: 100%;">
              <tr>
                <td>
                  <table style="width: 100%;border: 2px solid;">
                    <tr>
                      <td style="text-align: right; padding-top: 5px; padding-bottom: 5px;"><strong class="mr-3"><span>Basic Amount:</span> ${data.table4[0].basicSum.toFixed(2)}</strong></td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td>
            <table style="width: 100%;">
              <tr>
                <td>
                  <table style="margin: 0; width: 100%; border: 2px solid;">
                    <tbody>
                      <tr>
                        <td style="padding: 10px;vertical-align: top;" width="50%">
                          <strong>Terms & Condition :</strong>
                          ${data.table3.length > 0 ?
                `<table style="width: 100%;">
                            <tbody>
                            ${data.table3.map((eldata:any, index:any) => `
                                <tr>
                                  <td style="width: 50%;vertical-align: top;padding-left:0">${eldata.termsandcond} :</td>
                                  <td style="width: 50%;">${eldata.remarks}</td>
                                </tr>
                                `).join('')
                }
                                               
                            </tbody>
                          </table>`
                : ''}  
                        </td>
                        <td style="border-left: 2px solid #000000;vertical-align: top;" width="50%">
                       
                          <table style="width: 100%; margin: 0;">
                            <tbody>
                             ${data.table[0]['poType'] == "Order Wise" ?
                ` ${data.table5.map((eldata:any, index:any) => `
                                <tr>
                                  <td style="padding: 0;">${eldata.gst}</td>
                                  <td>${eldata.optionId == 'Exclusive' ? `(${eldata.discount > 0 ? `Dis.${eldata.discount}%,` : ''}Exc.)` : `(${eldata.discount > 0 ? `Dis.${eldata.discount}%,` : ''}Inc.)`}</td>
                                  <td style=""></td>
                                  <td style="padding: 0;text-align: right;">${eldata.taxAmt.toFixed(2)}</td>
                              </tr>
                             <!-- <tr>
                              <td style="padding: 0;">Discount(%):</td>
                              <td style="">${eldata.exc}</td>
                              <td style="">${eldata.discount}%</td>
                              <td style="padding: 0;text-align: right;"></td>
                              </tr>-->
                            `).join('')}`
                : ''}  
    
                        ${data.table1.map((eldata:any, index:any) => `
                            <tr>
                             <td colspan='3' style="padding: 5px 0px;">${eldata.chargesType} (In ${eldata.nature})
                             ${eldata.remarks != '' ? `<br>(${eldata.remarks})
                           ` : ''}
                             </td>
                      
                             <td style="text-align: right;padding: 5px 0px;  display: block;">${eldata['nature'] == 'Percentage' ? eldata.value + '%' : eldata.value.toFixed(2)}</td>
                          </tr>                         
                          
                        `).join('')}

                          ${data.table[0]?.exclusiveAmount && data.table[0]?.exclusiveAmount > 0 ?
                `<tr>
                             <td colspan='3' style="padding: 5px 0px;">Exclusive Amount</td>
                      
                             <td style="text-align: right;padding: 5px 0px;  display: block;">${data.table[0].exclusiveAmount}</td>
                          </tr>`
                :
                ''}
                         
                            </tbody>
                          </table>
                         
                        </td>
                      </tr>
                      <tr>
                      <td colspan="2" style="padding:0px">
                      <table class="table border-0 table-borderless" style="width: 100%;border-top: 2px solid;margin-bottom: 0;">
                        <tbody>
                          <tr>
                            <td width="70%">
                            <span>Amount (In Words) :</span>
                            <strong>${this.digitToWords(grandTotal)}${decimalPart > 0 ? ' and ' + this.digitToWords(decimalPart) : ''}${grandTotal != 0 ? 'Only' : ''}</strong>
                            
                            </td>
                            <td style="text-align: right;" width="30%">
                            <span>Total Amount :</span>
                            <strong>${data.table[0].currencyIcon}${grandTotal.toFixed(2)}</strong>
                        
                            </td>
                          </tr>
                          <tr style="border-top: 2px solid;">
                          <td style="width="100%" colspan="2">
                                <p style="  margin: 0;"><strong>Remark :</strong> ${data.table[0].remarks}</p>
                                </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td>
            <table style="width: 100%;">
              <tr>
                <td>
                  <table class="table border-0 table-borderless" style="margin: 0; width: 100%;border: 2px solid;font-size:13px;">
                    <tbody>
                      <tr>
                        <td style="vertical-align: top;" width="40%">
                        <div style="padding: 5px;">
                          <div style="margin-bottom:10px">
                            <strong>Dispatch Instruction</strong>
                          </div>
                          <div class="dispatchIstruction">
                          <div>
                            <strong> Bill to be address :</strong>
                          </div>
                          <div style="margin-bottom:5px">
                            <strong>${data.table[0].org}</strong>
                          </div>
                          <div style="margin-bottom:5px">
                          <span>${data.table[0].orgAddr}</span>
                          </div>
                        </div>
                          <div class="dispatchIstruction" style="margin-bottom:10px">
                            <div >
                              <strong>Ship to address :</strong>
                            </div>
                            <div style="margin-bottom:5px">
                              <strong>${data.table[0].dispatch}</strong>
                            </div>
                            <div>
                            <span>${data.table[0].dispatchAddr}</span>
                            </div>
                          </div>
                        
                          </div>
                        </td>
                        <td style="border-left: 2px solid #000000; vertical-align: top;" width="30%">
                          <table style="width: 100%;margin: 0;font-size:13px; padding:5px">
                            <tbody>
                              <tr>
                                <td style="">CIN No.</td>
                                <td>:<td>
                                <td style=""><strong>${data.table[0].orgCIN}</strong></td>
                              </tr>
                              <tr>
                                <td style="">GST No.</td>
                                <td>:<td>
                                <td style=""><strong>${data.table[0].orgGST}</strong></td>
                              </tr>
                              <tr>
                                <td style="">PAN No. </td>
                                <td>:<td>
                                <td style=""><strong>${data.table[0].orgPAN}</strong></td>
                              </tr>
                              <tr>
                                <td style="">Bank (Supplier)</td>
                                <td>:<td>
                                <td style=""><strong>${data.table[0].supplierAccName}</strong></td>
                              </tr>
                              <tr>
                                <td style="">Acc No.</td>
                                <td>:<td>
                                <td style=""><strong>${data.table[0].acc}</strong></td>
                              </tr>
                              <tr>
                                <td style="">IFSC</td>
                                <td>:<td>
                                <td style=""><strong>${data.table[0].ifsc}</strong></td>
                              </tr>
                              <tr>
                                <td style="">Bank</td>
                                <td>:<td>
                                <td style=""><strong>${data.table[0].bankName}</strong></td>
                              </tr>
                              <tr>
                                <td style="">Branch</td>
                                <td>:<td>
                                <td style=""><strong>${data.table[0].branchName}</strong></td>
                              </tr>
                              <tr>
                                <td style="">Address</td>
                                <td>:<td>
                                <td style=""><strong>${data.table[0].address}</strong></td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                        <td style="border-left: 2px solid #000000; vertical-align: top;" width="30%">
                          <table style="width: 100%;margin: 0; padding:5px">
                            <tbody>
                              <tr>
                                <td style="">
                                  <div class="termsList">
                                  <strong>Terms of conditions:</strong>
                                    <ul style="padding-left: 10px;">
                                      <li>All Disputes are subject to DELHI Jurisdiction only.</li>
                                      <li>Kindly revert within 24 hours for any observations on P.O. otherwise it will be deemed acceptable inToto.</li>
                                      <li>Goods rejected during inspection will not be paid for & all the same will be returned at your cost and risk.</li>
                                      <li>A Penality of 20% on Total Amount of P.O. will be levied for late or partial Delivery of Goods. * Payment with in 90 days from the date of delivery.</li>
                                      <li>All correspondence through email only.</li>
                                    </ul>
                                  </div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
         <tr>
          <td>
            <table style="width: 100%;">
              <tr>
                <td>
                  <table class="table border-0 table-borderless margin: 0;" style="width: 100%;border: 2px solid;padding-bottom: 5px;">
                    <tbody>
                    <tr>
                      <td style="text-align: left;" width="100%"><br>
                      <strong style="margin-left: 15px;">${data.table[0].org}</strong><br>
                      <br></td>
                    </tr>
                      <tr>
                        <td>
                          <table style="width: 100%;">
                            <tbody>
                              <tr>
                                <td style="text-align: center;vertical-align: top;" width="25%"><span>Prepared By<br>${data.table[0].createdby ? data.table[0].createdby : ''}</span></td>
                                <td style="text-align: center;vertical-align: top;" width="25%"><span>Checked By<br></span></td>
                                <td style="text-align: center;vertical-align: top;" width="25%"><span>Authorised By<br>${data.table[0].approvedBy ? data.table[0].approvedBy : ''}</span></td>
                                
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
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


