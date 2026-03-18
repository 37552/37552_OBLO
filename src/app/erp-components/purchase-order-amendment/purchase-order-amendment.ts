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
  selector: 'app-purchase-order-amendment',
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
  templateUrl: './purchase-order-amendment.html',
  styleUrl: './purchase-order-amendment.scss'
})
export class PurchaseOrderAmendment {
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
  documentDrp: any[] = [];
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
  selectedPOId: any;
  selectedPOTypeId: any = '';
  isShowTax = false;
  NatureData:any[] = [];
  selectedItems: any[] = [];
  QuotationArrS:any[] = [];
  quotationData: any[] = [];
  poHeaderData: any[] = [];

  showQuotationUploadDialog = false;
  selectedQuotationFile: File | null = null;
  uploadedQuotationUrl: string | null = null;
  isUploadingQuotation = false;
  existingQuotationPath: string | null = null;

  selectedItemEdit: any = null;
  selectedItemEditIndex: number | null = null;
  activeEditType: string | null = null;
  natureDataDrpFiltered: any[] = []; 
  amendmentDetailModel: boolean = false;
  amendmentViewData: any[] = [];
  poDialogHeader: string = '';
  postedPODialog: boolean = false;


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
      purchaseOrderId: ['', Validators.required],
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
      basic: [''],
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
    this.getDocumentNumberdrp();
    this.pagedivisionNameIdloaddrp();
    this.pagepurchaseTypeIdloaddrp();
    this.pagepurchaseCatIdloaddrp();
    this.pageCustomerIdloaddrp();
    this.pageTermConditionloaddrp();
    this.pageChargesTypeloaddrp();
    this.pageChargesNatureloaddrp();
    this.pageTaxMasterloaddrp();
    this.pagePaytypeloaddrp();
    this.OrganizationIdloaddrp();
    this.getIssueTypeData();
    this.dispatchloaddrp();
    this.getPurchaseOrderBudget();
    this.getWarehousedrp();
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
      this.disableAllFields();
      return;
    }

    this.cdr.detectChanges();
    document.body.style.overflow = 'hidden';
  }

  disableAllFields() {
    const controlsToDisable = [
      'divisionNameId',
      'orgId',
      'orgAddressId',
      'dispatchId',
      'purchaseTypeId',
      'purchaseCatId',
      'currencyId',
      'customerId',
      'customerAddressId',
      'contactPerson'
    ];

    controlsToDisable.forEach(ctrl => {
      this.POForm.get(ctrl)?.disable({ emitEvent: false });
    });
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


  onPOchange(poId: number) {
    try {
      this.onClearControl();
      this.postedPOItems = [];
      this.selectedPOId = poId;

      if (!poId) {
        return;
      }

      this.taxForDrp = [
        { drpVal: 'Item Wise', drpText: 'Item Wise' },
        { drpVal: 'Order Wise', drpText: 'Order Wise' }
      ];

      this.taxOptionDrp = [
        { drpVal: 'Inclusive', drpText: 'Inclusive' },
        { drpVal: 'Exclusive', drpText: 'Exclusive' }
      ];

      this.userService.getQuestionPaper(`uspGetSelectedPurchaseOrderDetails|poId=${poId}`).subscribe({
          next: (res: any) => {
            try {
              const data = res?.table?.[0];
              if (!data) {
                this.resetForm();
                return;
              }

              this.isDirect = data.sourceDocumentId === '10000';
              this.uploadedResumeUrl = data.attachDocument || '';

              this.enableEditableFields();

              this.POForm.patchValue({
                sourceDocumentId: data.sourceDocumentId?.toString() || null,
                divisionNameId: data.divisionId?.toString() || null,
                warehouseId: data.wareHouseId?.toString() || null,
                orgId: data.orgId?.toString() || null,
                dispatchId: data.dispatchId?.toString() || null,
                purchaseTypeId: data.poTypeId?.toString() || null,
                purchaseCatId: data.poCategoryId?.toString() || null,
                currencyId: data.currencyId?.toString() || null,
                customerId: data.vendorId?.toString() || null,
                materialIndentTypeId: data.materialIndentTypeId?.toString() || null,
                contactPerson: data.contactPerson || '',
                remarks: data.remarks || '',
                exclusiveAmount: data.exclusiveAmount || 0,
                validityDate: data.validityDate ? new Date(data.validityDate) : null
              });

              if (data.attachDocument && data.attachDocument !== 'null' && data.attachDocument.trim() !== '') {
                this.uploadedResumeUrl = this.getFullFileUrl(data.attachDocument);
                if (this.resumeFileUpload) {
                  this.resumeFileUpload = this.uploadedResumeUrl;
                }
              } else {
                this.uploadedResumeUrl = null;
                this.resumeFileUpload = null;
              }

              if (data.orgAddressId) {
                this.getOrganizationAddress(data.orgAddressId);
              }

              if (data.vendorId) {
                this.getCustomerAddress(data.customerAddressId || 0);
              }

              if (data.currencyId) {
                this.pageCurrencyloaddrp(data.currencyId.toString());
              }

              if (data.materialIndentTypeId) {
                this.selectedPOTypeId = data.materialIndentTypeId;
                this.getPurchaseRequestData(
                  data.sourceDocumentId,
                  data.wareHouseId || 0
                );
              }

              this.paymentTermDetailsData = res?.table2 || [];
              this.taxDetailData = res?.table3 || [];

              if (this.taxDetailData.length > 0) {

                if (this.taxDetailData.some(e => e.taxFor == "Item Wise")) {
                  this.otherChargesForm.get('basic')?.disable();
                  this.taxForDrp = [{ "drpVal": "Item Wise", "drpText": "Item Wise" }]
                  this.isTaxItemWise = true
                }
                else {
                  this.otherChargesForm.get('basic')?.enable();
                  this.taxForDrp = [{ "drpVal": "Order Wise", "drpText": "Order Wise" }]
                  this.isTaxItemWise = false
                }

                const nature = this.taxDetailData.find(e => e.natureId);
                if (nature) {
                  this.NatureData = this.NatureData.filter((x: any) => x.drpValue === nature.natureId);
                }

                if (this.taxDetailData.some(e => e.natureId == '10000')) {
                  this.textDetailsForm.get('amount')?.enable();
                }
                else {
                  this.textDetailsForm.get('amount')?.disable();
                  this.textDetailsForm.patchValue({
                    amount: 0
                  })

                }

                this.taxOptionDrp = this.taxDetailData.some(e => e.optionId_Text === 'Exclusive')
                  ? [{ drpVal: 'Exclusive', drpText: 'Exclusive' }]
                  : [{ drpVal: 'Inclusive', drpText: 'Inclusive' }];
              }

              this.termsConditionData = res?.table4 || [];
              this.otherChargesData = res?.table5 || [];
              this.poFromPrArr = res?.table1 || [];

              if (this.taxDetailData.length === 1) {
                const taxId = this.taxDetailData[0].taxId;

                this.poFromPrArr.forEach(item => {
                  item.selectedTaxIds = [taxId];
                });
              }

              this.poFromPrArr.forEach(item => {
                item.requestedQty = item.quantity;
                item.taxPercentage = JSON.parse(item.taxPercentage || '[]');
              });

              this.isShowTax = this.poFromPrArr.length > 0;
              this.quotationData = res?.table6 || [];
              this.QuotationArr = [];
              this.QuotationArrS = [];

              this.quotationData.forEach(q => {
                this.QuotationArr.push({
                  id: q.id,
                  company: q.company,
                  quotation: q.quotation
                });

                this.QuotationArrS.push({
                  id: q.id,
                  company: q.company,
                  quotation: this.configService.baseUrl + q.quotation
                });
              });

            } catch (innerErr) {
              console.error('Error processing PO details:', innerErr);
            } finally {
            }
          },
          error: (err: HttpErrorResponse) => {
            console.error('Error fetching PO details:', err);

            if (err.status === 403) {
              sessionStorage.setItem('userToken', '');
              this.router.navigate(['/login']);
            }
          }
        });
    } catch (err) {
      console.error('Unexpected error in onPOchange:', err);
    }
  }

  enableEditableFields() {
    const controlsToEnable = [
      'divisionNameId',
      'orgId',
      'orgAddressId',
      'dispatchId',
      'purchaseTypeId',
      'purchaseCatId',
      'currencyId',
      'customerId',
      'customerAddressId',
      'contactPerson'
    ];

    controlsToEnable.forEach(ctrl => {
      this.POForm.get(ctrl)?.enable({ emitEvent: false });
    });
  }

  resetForm() {
    try {
      this.POForm?.reset({
        divisionNameId: null,
        warehouseId: null,
        organizationId: null,
        orgAddressId: null,
        dispatchId: null,
        purchaseTypeId: null,
        purchaseCatId: null,
        currencyId: null,
        customerId: null,
        customerAddressId: null,
        contactPerson: '',
        materialIndentTypeId: null,
        remarks: '',
        exclusiveAmount: null,
        validityDate: null
      });
      const disableControls = [
        'divisionNameId',
        'warehouseId',
        'organizationId',
        'orgAddressId',
        'dispatchId',
        'purchaseTypeId',
        'purchaseCatId',
        'currencyId',
        'customerId',
        'customerAddressId',
        'contactPerson',
        'remarks',
        'exclusiveAmount'
      ];

      disableControls.forEach(ctrl =>
        this.POForm?.get(ctrl)?.disable()
      );
      this.POForm?.get('materialIndentTypeId')?.enable();
    } catch (err) {
      console.error('Error while resetting PO form:', err);
    }
  }

  onClearControl() {
    try {
      this.poFromPrArr = [];
      this.paymentTermDetailsData = []
      this.taxDetailData = []
      this.termsConditionData = []
      this.otherChargesData = []
      this.purchaseRequestDrp = []
      this.selectedItems = [];
      this.poHeaderData = []
      this.poFromPrArrFinal = []
      this.itemtaxwiseData = []
      this.isShowTax = false
      this.poEditmode = true;
      this.selectedItemEdit = null
      this.taxForDrp = [{ "drpVal": "Item Wise", "drpText": "Item Wise" }, { "drpVal": "Order Wise", "drpText": "Order Wise" }]
      this.taxOptionDrp = [{ "drpVal": "Inclusive", "drpText": "Inclusive" }, { "drpVal": "Exclusive", "drpText": "Exclusive" }]
      this.otherChargesForm?.get('basic')?.disable();
      this.pageChargesNatureloaddrp();
    } catch (err) {
      console.error('Error while clearing PO controls:', err);
    }
  }


  getDocumentNumberdrp() {
    try {
      this.userService.getQuestionPaper(`uspGetPurchaseOrderDrp|districtId=${sessionStorage.getItem('District')}`)
        .subscribe({
          next: (res: any) => {
            try {
              this.documentDrp = res?.table || [];
            } catch (innerErr) {
              console.error(
                'Error processing Document Number dropdown response:',
                innerErr
              );
              this.documentDrp = [];
            }
          },
          error: (err: HttpErrorResponse) => {
            console.error('Error fetching Document Number dropdown:', err);
            if (err.status === 403) {
              sessionStorage.setItem('userToken', '');
              this.router.navigate(['/login']);
            }
          },
          complete: () => {
          }
        });
    } catch (err) {
      console.error('Unexpected error in getDocumentNumberDrp:', err);
      this.documentDrp = [];
    }
  }


  pagedivisionNameIdloaddrp() {
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

  pagepurchaseTypeIdloaddrp() {
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

  pagepurchaseCatIdloaddrp() {
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

  pageCustomerIdloaddrp() {
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

  OrganizationIdloaddrp() {
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

  getOrganizationAddress(selectedAddressId?: any) {
    const orgId = this.POForm.get('orgId')?.value ?? 0;
    if (!orgId) return;

    this.userService.getQuestionPaper(`uspGetOrgAddress|orgId=${orgId}`)
      .subscribe({
        next: (res: any) => {
          this.organizationAddressDrp = (res?.table || []).map((x:any) => ({
            drpValue: x.drpValue.toString(),
            drpOption: x.drpOption
          }));

          if (selectedAddressId) {
            this.POForm.patchValue({
              orgAddressId: selectedAddressId.toString()
            });
          }
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



  getWarehousedrp() {
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

  getIssueTypeData() {
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

  dispatchloaddrp() {
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

  pageCurrencyloaddrp(val?: any) {
    try {
      let id = this.POForm.get(`purchaseCatId`)?.value
      this.userService.getPurchasePageLoadDrp(this.FormName, `uspGetFillDrpDown|table=tblCurrencyMaster|filterColumn=categoryId|filterValue=${id ? id : 0}`)
        .subscribe({
          next: (res: any) => {
            try {
              this.currencyDrp = res || [];
              if (val) {
                this.POForm.get('currencyId')?.setValue(val);
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


  getCustomerAddress(addressId?: number) {
    try {
      const customerId = this.POForm.get('customerId')?.value;
      if (!customerId) {
        this.customerAddressDrp = [];
        this.POForm.get('customerAddressId')?.reset();
        return;
      }

      this.userService.getPurchasePageLoadDrp(this.FormName,`uspGetCustomerAddress|customerId=${customerId}`)
        .subscribe({
          next: (res: any) => {
            try {
              this.customerAddressDrp = res || [];
              if (addressId) {
                this.POForm.patchValue({
                  customerAddressId: addressId.toString()
                });
              }

            } catch (innerErr) {
              console.error('Error processing customer address dropdown:', innerErr);
            }
          },
          error: (err: HttpErrorResponse) => {
            console.error('Error fetching customer address:', err);

            if (err.status === 403) {
              sessionStorage.setItem('userToken', '');
              this.router.navigate(['/login']);
            }
          }
        });
    } catch (err) {
      console.error('Unexpected error in getCustomerAddress:', err);
    }
  }


  getPurchaseRequestData(id:any, warehouseId:any) {
    try {
      const query = `uspGetPRPOByRequestType|action=PURCHASEREQUEST|warehouseId=${warehouseId}|RequestTypeId=${this.selectedPOTypeId}|sourceId=${id}|districtId=${sessionStorage.getItem('District')}`;
      this.userService.getPurchasePageLoadDrp(this.FormName, query).subscribe({
        next: (res: any) => {
          try {
            this.purchaseRequestDrp = res;
            setTimeout(() => {
              this.cdr.detectChanges();
            }, 0);
            } catch (innerErr) {
              console.error('Error processing dropdown response:', innerErr);
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


  onChangeItemCode(event?: any) {
    try {
      const itemCodeId = event?.value ?? this.itemDetailForm.get('itemCodeId')?.value ?? 0;
      const warehouseId = this.POForm.get('warehouseId')?.value ??  0;

      this.userService.getQuestionPaper(`uspBindItemQty|warehouseId=${warehouseId}|itemId=${itemCodeId}`)
        .subscribe({
          next: (res: any) => {
            if (res?.table?.length > 0) {
              this.itemDetailForm.patchValue({
                availableQty: res.table[0]?.qty || 0,
                rate: res.table[0]?.rate || 0,
                quantity: 0,
              });
            } else {
              this.itemDetailForm.patchValue({
                availableQty: 0,
                rate: 0,
                quantity: 0,
              });
            }

            this.cdr.detectChanges();
          },

          error: (err: HttpErrorResponse) => {
            console.error(err);
            if (err.status === 403) {
              sessionStorage.setItem('userToken', '');
              this.router.navigate(['/login']);
            }
          },

          complete: () => {
            setTimeout(() => {
              this.cdr.detectChanges();
            }, 1000);
          }
        });
    } catch (err) {
      console.error(err);
    }
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

    const removeKeys = (obj: any[]) => {
      return obj.map(item => {
        let filteredItem = Object.fromEntries(
          Object.entries(item).filter(([key, value]) => !key.includes('_Text'))
        );
        return filteredItem;
      });
    };
    let table1 = removeKeys(this.taxDetailData)
    let table2 = removeKeys(this.otherChargesData)

    const query = `tblPurchaseOrderFromPrDetails=${JSON.stringify(this.poFromPrArrFinal)}|tblPurchOrdTaxDetails=${JSON.stringify(table1)}|tblPurchOrdOtherCharges=${JSON.stringify(table2)}|tblItems=${JSON.stringify(this.itemtaxwiseData)}`
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
              this.poFromPrArrFinal = []
              this.itemtaxwiseData = []
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
            id: item.id ? item.id : 0,
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
    let filterData = this.poFromPrArrFinal.filter(e => e.id)
    let data = filterData.map((item:any) => ({ itemCodeId: item.itemCodeId ? item.itemCodeId : 0, itemId: item.itemId ? item.itemId : 0 }));
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

  onClosePostedPODialog() {
    this.postedPODialog = false;
  }

  getSelectedTaxes() {
    this.modifyPo();

    if (!this.isTaxItemWise) {
      let totalDiscountPercentage = 0;
      let taxIds: string[] = [];

      for (let i = 0; i < this.taxDetailData.length; i++) {
        totalDiscountPercentage += parseFloat(
          this.taxDetailData[i].discount?.toString() || '0'
        );
        taxIds.push(this.taxDetailData[i].taxId.toString());
      }

      this.poFromPrArr.forEach((item) => {
        item['discount'] =
          totalDiscountPercentage +
          '% (' +
          (this.taxDetailData[0].optionId_Text || this.taxDetailData[0].optionId) +
          ')';

        item['disc'] = totalDiscountPercentage + '%';
        item['taxPercentage'] = taxIds;
      });
    }

    else {
      if (this.selectedItemEdit) {
        this.poFromPrArr.forEach((e) => {
          if (e['taxPercentage']?.includes(this.selectedItemEdit.taxId)) {

            let filteredIds: any[];
            let taxid = this.textDetailsForm.get('taxId')?.value || 0;

            if (this.selectedItemEdit.taxId != taxid) {
              let index = e['taxPercentage'].indexOf(this.selectedItemEdit.taxId);
              if (index > -1) {
                e['taxPercentage'][index] = taxid;
              }
              filteredIds = e['taxPercentage'];
            } else {
              filteredIds = e['taxPercentage'];
            }

            this.onTaxDrpChange(filteredIds, e, 'delete');
          }
        });
      }
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

  upsertRow(arr: any[], obj: any) {
    if (this.activeEditType && this.selectedItemEditIndex !== null) {
      arr[this.selectedItemEditIndex] = obj;
    } else {
      arr.push(obj);
    }
  }

  AddRow(formName: FormName) {
    const form = (this as any)[formName];
    if (form.invalid) {
        form.markAllAsTouched();
        return;
    }
    if (formName === 'itemDetailForm') {
      let quantity = this.itemDetailForm.get('quantity')?.value;
      let rate = this.itemDetailForm.get('rate')?.value;

      let obj = {
        id: this.selectedItemEdit?.id ?? 0,
        itemId: this.itemDetailForm.get('itemId')?.value,
        item: this.itemsDrp.find(x => x.drpValue === this.itemDetailForm.get('itemId')?.value)?.drpOption ?? '',
        itemCodeId: this.itemDetailForm.get('itemCodeId')?.value,
        itemCode: this.itemCodeDrp.find(x => x.drpValue === this.itemDetailForm.get('itemCodeId')?.value)?.drpOption ?? '',
        rate: this.itemDetailForm.get(`rate`)?.value,
        quantity: this.itemDetailForm.get(`quantity`)?.value,
        techSpec: this.itemDetailForm.get('techSpec')?.value,
        tolerance: this.itemDetailForm.get('tolerance')?.value,
        unitId: this.itemDetailForm.get('unitId')?.value,
        unit: this.uomDrp.find((x:any) => x.drpValue === this.itemDetailForm.get('unitId')?.value)?.drpOption ?? '',
        availableQty: this.itemDetailForm.get('availableQty')?.value,
        prNumber: '',
        prMainid: 0,
        prchildId: 0,
        total: quantity * rate
      };

      if (this.activeEditType !== 'poFromPrArr' &&
        this.poFromPrArr.some(e => e.itemCodeId === obj.itemCodeId)) {
        this.message.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'Item already exist.',
          life: 3000
        });
        return;
      }

      this.upsertRow(this.poFromPrArr, obj);
      this.taxDetailData.length > 0 ? this.getSelectedTaxes() : this.modifyPo();
    }

    if (formName === 'paymentTermsForm') {
      const payTypeId = this.paymentTermsForm.get('payTypeId')?.value?.toString();
      const selectedPayType = this.paymentTypeDrp.find( x => x.drpValue === payTypeId);

      let obj = {
        id: this.selectedItemEdit?.id ?? 0,
        payTypeId: payTypeId,
        payTypeId_Text: selectedPayType?.drpOption ?? '',
        date: this.datePipe.transform(this.paymentTermsForm.get('date')?.value,'yyyy-MM-dd'),
        payValue: this.paymentTermsForm.get('payValue')?.value,
        noOfDays: this.paymentTermsForm.get('noOfDays')?.value,
        tolerance: this.paymentTermsForm.get('tolerance')?.value,
        remarks: this.paymentTermsForm.get('remarks')?.value
      };

      this.upsertRow(this.paymentTermDetailsData, obj);
    }
 
    if (formName === 'textDetailsForm') {

      const isEdit = this.activeEditType === 'taxDetailData' && this.selectedItemEditIndex !== null;

      const taxFor = this.textDetailsForm.get('taxFor')?.value;
      const natureId = this.textDetailsForm.get('natureId')?.value;
      const taxId = this.textDetailsForm.get('taxId')?.value;
      const optionId = this.textDetailsForm.get('optionId')?.value;

      const natureObj = this.natureDataDrp.find((x: any) => x.drpValue?.toString() === natureId?.toString());
      const taxObj = this.taxMasterDrp.find((x: any) => x.drpValue?.toString() === taxId?.toString());

      let obj = {
        id: this.selectedItemEdit?.id ?? 0,
        taxFor: taxFor,
        natureId: natureId,
        natureId_Text: natureObj?.drpOption ?? '',
        taxId: taxId,
        taxId_Text: taxObj?.drpOption ?? '',
        amount: this.textDetailsForm.get('amount')?.value,
        optionId: optionId,
        discount: this.textDetailsForm.get('discount')?.value,
        remarks: this.textDetailsForm.get('remarks')?.value
      };

      if (natureId === '10000' && (!obj.amount || obj.amount <= 0)) {
        this.message.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'Please enter value for column *Amount',
          life: 3000
        });
        return;
      }

      if (!isEdit) {
        if (this.taxDetailData.some(e => e.taxFor !== taxFor)) {
          this.message.add({
            severity: 'warn',
            summary: 'Warning',
            detail: 'Please select same Tax For.',
            life: 3000
          });
          return;
        }

        if (this.taxDetailData.some(e => e.natureId !== natureId)) {
          this.message.add({
            severity: 'warn',
            summary: 'Warning',
            detail: 'Please select same Nature type.',
            life: 3000
          });
          return;
        }

        if (this.taxDetailData.some(e => e.optionId !== optionId)) {
          this.message.add({
            severity: 'warn',
            summary: 'Warning',
            detail: 'Please select same Tax option.',
            life: 3000
          });
          return;
        }
      }

      if (isEdit) {
        this.taxDetailData[this.selectedItemEditIndex!] = obj;
      } else {
        this.taxDetailData.push(obj);
      }

      this.selectedItemEdit = null;
      this.selectedItemEditIndex = null;
      this.activeEditType = null;

      this.textDetailsForm.reset();
      this.getSelectedTaxes();
    }

    if (formName === 'termsConditionForm') {

      const isEdit = this.activeEditType === 'termsConditionData' && this.selectedItemEditIndex !== null;
      const trmsAndCndId = this.termsConditionForm.get('trmsAndCndId')?.value;

      const termObj = this.termConditionDrp.find(x => x.drpValue?.toString() === trmsAndCndId?.toString());

      let obj = {
        id: this.selectedItemEdit?.id ?? 0,
        trmsAndCndId: trmsAndCndId,
        trmsAndCndId_Text: termObj?.drpOption ?? '',
        remarks: this.termsConditionForm.get('remarks')?.value
      };

      if (isEdit) {
        this.termsConditionData[this.selectedItemEditIndex!] = obj;
      } else {
        this.termsConditionData.push(obj);
      }

      this.selectedItemEdit = null;
      this.selectedItemEditIndex = null;
      this.activeEditType = null;

      this.termsConditionForm.reset();
    }

    if (formName === 'otherChargesForm') {

      const isEdit =
        this.activeEditType === 'otherChargesData' &&
        this.selectedItemEditIndex !== null;

      const chargesId = this.otherChargesForm.get('chargesId')?.value;
      const natureId = this.otherChargesForm.get('natureId')?.value;

      const chargesObj = this.chargesTypeDrp.find(x => x.drpValue?.toString() === chargesId?.toString());
      const natureObj = this.natureDataDrpAll.find(x => x.drpValue?.toString() === natureId?.toString());

      let obj = {
        id: this.selectedItemEdit?.id ?? 0,
        chargesId: chargesId,
        chargesId_Text: chargesObj?.drpOption ?? '',
        natureId: natureId,
        natureId_Text: natureObj?.drpOption ?? '',
        value: this.otherChargesForm.get('value')?.value,
        remarks: this.otherChargesForm.get('remarks')?.value,
        basic: this.otherChargesForm.get('basic')?.value === true
      };

      if (!obj.value || Number(obj.value) <= 0) {
        this.message.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'Please enter value for column *Value',
          life: 3000
        });
        return;
      }

      if (isEdit) {
        this.otherChargesData[this.selectedItemEditIndex!] = obj;
      } else {
        this.otherChargesData.push(obj);
      }

      this.selectedItemEdit = null;
      this.selectedItemEditIndex = null;
      this.activeEditType = null;

      this.otherChargesForm.reset({ basic: false });
      this.modifyPo();
    }

    if (formName === 'poQuotationForm') {
      const isEdit = this.activeEditType === 'QuotationArr' && this.selectedItemEditIndex !== null;
      const company = this.poQuotationForm.get('company')?.value;
      const quotation = this.poQuotationForm.get('quotationUploadControl')?.value;

      if (!company) {
        this.poQuotationForm.markAllAsTouched();
        return;
      }

      if (!quotation && !isEdit) {
        this.message.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'Quotation attachment is required',
          life: 3000
        });
        return;
      }

      const obj = {
        id: this.selectedItemEdit?.id ?? 0,
        company: company,
        quotation: quotation ?? this.selectedItemEdit?.quotation
      };

      if (isEdit) {
        this.QuotationArr[this.selectedItemEditIndex!] = obj;
      } else {
        this.QuotationArr.push(obj);
      }

    }

    this.selectedItemEdit = null;
    this.selectedItemEditIndex = null;
    this.activeEditType = null;

    setTimeout(() => {
      this.resetEditForm();
      this.uploadedQuotationUrl = '';
    }, 100);

  }

  resetEditForm() {
    this.selectedItemEdit = null;
    this.selectedItemEditIndex = null;
    this.activeEditType = null;
    this.paymentTermsForm.reset();
    this.textDetailsForm.reset();
    this.termsConditionForm.reset();
    this.otherChargesForm.reset();
    this.poQuotationForm.reset();
  }

  editRecord(type: string, item: any, index: number) {
    this.selectedItemEdit = item;
    this.selectedItemEditIndex = index;
    this.activeEditType = type;

    if (type == 'poFromPrArr') {
      this.itemDetailForm.patchValue({
        itemId: item.itemId,
        itemCodeId: item.itemCodeId,
        unitId: item.unitId,
        availableQty: item.availableQty,
        quantity: item.quantity,
        rate: item.rate,
        techSpec: item.techSpec,
        tolerance: item.tolerance
      });
    }

   
    if (type == 'paymentTermDetails') {
      this.paymentTermsForm.patchValue({
        payTypeId: item.payTypeId.toString(),
        date: item.date ? new Date(item.date) : null,
        payValue: item.payValue,
        noOfDays: item.noOfDays,
        tolerance: item.tolerance,
        remarks: item.remarks
      });
    }

    if (type == 'taxDetailData') {
      this.textDetailsForm.patchValue({
        taxFor: item.taxFor,
        natureId: item.natureId.toString(),
        taxId: item.taxId,
        amount: item.amount,
        optionId: item.optionId,
        discount: item.discount,
        remarks: item.remarks
      });
    }

    if (type == 'termsConditionData') {
      this.termsConditionForm.patchValue({
        trmsAndCndId: item.trmsAndCndId.toString(),
        remarks: item.remarks
      });
    }

    if (type == 'otherChargesData') {
      this.otherChargesForm.patchValue({
        chargesId: item.chargesId.toString(),
        natureId: item.natureId.toString(),
        value: item.value,
        basic: item.basic ? 'Yes' : 'No',
        remarks: item.remarks
      });
    }

    if (type == 'QuotationArr') {
      this.poQuotationForm.patchValue({
        company: item.company,
        quotationUploadControl: ''
      });

      this.existingQuotationPath = item.quotation;
      this.uploadedQuotationUrl = this.buildQuotationUrl(item.quotation);

    }

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 200);

  }

  buildQuotationUrl(path: string): string {
    return this.configService.baseUrl + path.replace(/\\/g, '/');
  }

  onClean() {
    this.selectedItemEdit = null;
    this.selectedItemEditIndex = null;
    this.activeEditType = null;
    this.paymentTermsForm.reset();
    this.textDetailsForm.reset();
    this.termsConditionForm.reset();
    this.otherChargesForm.reset();
    this.poQuotationForm.reset();
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
      item['disc'] = totalDiscountPercentage + '%'
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
      data['disc'] = ''
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
    this.existingQuotationPath = '';
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

    this.paramvaluedata = ''
    this.poFromPrArrFinal = []
    this.itemtaxwiseData = []
    let poId = this.POForm.get('purchaseOrderId')?.value; 
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

    const removeKeys = (obj: any[]) => {
      return obj.map(item => {
        let filteredItem = Object.fromEntries(
          Object.entries(item).filter(([key, value]) => !key.includes('_Text'))
        );
        return filteredItem;
      });
    };

    let data1 = removeKeys(this.paymentTermDetailsData)
    let data2 = removeKeys(this.taxDetailData)
    let data3 = removeKeys(this.termsConditionData)
    let data4 = removeKeys(this.otherChargesData)

    this.paramvaluedata = `tblPurchaseOrderHeader=${JSON.stringify([obj])}|tblPurchaseOrderFromPrDetails=${JSON.stringify(this.poFromPrArrFinal)}|tblPurchOrdPayTermDtls=${JSON.stringify(data1)}|tblPurchOrdTaxDetails=${JSON.stringify(data2)}|tblPurchOrdTermAndCondDtls=${JSON.stringify(data3)}|tblPurchOrdOtherCharges=${JSON.stringify(data4)}|tblItems=${JSON.stringify(this.itemtaxwiseData)}|attachDocument=${obj.attachFile}|poQuotation=${JSON.stringify(this.QuotationArr)}|poHeaderId=${poId}|appUserId=${sessionStorage.getItem('userId')}|districtId=${sessionStorage.getItem('District')}`
    if (this.postedPOItems.length) {
        this.postedPODialog = true;
    }
    else {
      this.openConfirmation('Confirm?', 'Are you sure you want to proceed?', '1', '1');
    }
  }

  submitcall() {
    try {
      this.userService.SubmitPostTypeData('uspPostPurchaseOrderAmmendment', this.paramvaluedata, this.FormName).subscribe({
        next: (datacom: any) => {
          this.onClosePostedPODialog();
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
              this.QuotationArr = []
              this.QuotationArrS = []
              this.isDirect = false
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

  switchTab(index: number) {
    if (
      (index > 0 && this.poFromPrArr.length === 0 && this.postType !== 'view')
    ) {
      return;
    }
    this.activeTabIndex = index;
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

  openAmendmentView(id: any) {
    this.userService.getQuestionPaper(`uspGetPOAmmendmentPrint|action=AMMENDNO|ammendmentNo=0|poId=${id}`)
      .subscribe(
        (data: any) => {
          if (Object.keys(data).length > 0 && data.table.length > 0) {
            this.poDialogHeader = `PO-${data.table1[0].poNumber}`;
            this.amendmentViewData = data.table

            setTimeout(() => {
              this.amendmentDetailModel = true;
            }, 0);
          }
          else {
            this.amendmentViewData = []
            setTimeout(() => {
              this.amendmentDetailModel = true;
            });
            
          }
        },
        (err: HttpErrorResponse) => {
          if (err.status == 403) {
            this.Customvalidation.loginroute(err.status);
          }
        }
      );
  }

  closeAmendmentDetailDialog() {
    this.amendmentDetailModel = false;
  }

  openprintModalAmendmentData(id: any, number:any) {
    this.userService.getQuestionPaper(`uspGetPOAmmendmentPrint|action=PRINT|ammendmentNo=${number}|poId=${id}`).subscribe(
      (data: any) => {
        if (Object.keys(data).length > 0 && data.table.length > 0) {
          if (data['table1'].length > 0 || data['table2'].length > 0 || data['table3'].length > 0 || data['table4'].length > 0 || data['table5'].length > 0 || data['table6'].length > 0) {
            const html = `
              <table cellspacing="0" cellpadding="0"
              style="font-family: helvetica;width: 100%; border: 1px solid;">
              <tr>
                <td>
                  <table
                    style="text-align: center;width: 100%;border-bottom: 1px solid #000000; margin-bottom:0px"
                    cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="width: 100%;">
                        <p style="text-align: right;">Vendor/Accounts/Store Copy</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="width: 100%;">
                        <h2 style="font-size: 24px;  font-weight: 700;margin-bottom: 0px;"> ${data.table[0].org}</h2>
                      </td>
                    </tr>
                    <tr>
                      <td style="width: 100%;">
                        <p style=" margin: 0;">${data.table[0].orgAddr}</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="width: 100%;">
                        <p style=" margin: 0;"><strong>Phone : ${data.table[0].orgPhone} 
                        Email :${data.table[0].orgEmail}</strong></p>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <h2
                          style="font-size: 24px; font-weight: 600;max-width: 500px; margin: auto; margin-top: 10px; margin-bottom: 10px; padding:10px; border: 1px solid #000000; box-shadow: 5px 5px 5px #000000; text-align: center;">
                          ${data.table[0].header}<br>
                          <span style="font-size: 14px;">${data.table[0]['formNo']}</span>
                        </h2>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td>
                  <table class="table border-0 table-borderless"
                    style="width: 100%; border-bottom: 1px solid;border-top: none;margin-bottom: 0;">
                    <tbody>
                      <tr>
                        <td style="padding: 2px 10px 2px 10px; border: none;">
                          <table style="width: 100%;">
                            <tr>
                              <td style="width: 25%;">PO No.</td>
                              <td>: <strong
                                  class="ml-3">${data.table[0]['po NO.']}</strong></td>
                            </tr>
                          </table>
        
                        </td>
                        <td
                          style="padding: 2px 10px 2px 10px; border: none;text-align: center;">
                          <table style="float: right;">
                            <tr>
                              <td style="width: 50%;">PO Date</td>
                              <td style="width: 50%;">: <strong
                                  class="ml-3">${data.table[0].poDate} </strong></td>
                            </tr>
                          </table>
        
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 2px 10px 2px 10px; border: none;">
                          <table style="width: 100%;">
                            <tr>
                              <td style="width: 25%;">Amendment No.</td>
                              <td>: <strong class="ml-3">${data.table[0]['ammendmentNo']}</strong></td>
                            </tr>
                          </table>
                        </td>
                        <td style="padding: 2px 10px 2px 10px; border: none;"></td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr>
                <td>
                  <table cellspacing="0" cellpadding="0" class="table"
                    style="width: 100%; border-bottom: 1px solid;font-size:13px;border-top: none;margin-bottom: 0;">
                    <tbody>
                      <tr>
                        <td width="60%" style="padding: 2px 10px 2px 10px; border: none;">
                          <div>
                            <p class="m-0" style="margin-bottom: 0;">To,<br>M/s, ${data.table[0].vendor}<br />${data.table[0].vendorAddress}</p>
                          </div>
                          <table class="m-0" style="width: 100%; border: 0;">
                            <tbody>
                              <tr>
                                <td style="width: 15%;">Phone</td>
                                <td style="width: 85%;">: <strong
                                    class="ml-3">${data.table[0].vendorPhone}</strong></td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                        <td width="40%" style="border-left: 1px solid #333333;padding: 2px 10px 2px 10px;border: none;">
                          <table class="m-0" style="width: 100%; border: 0;">
                            <tbody>
                              <tr>
                                <td style="width: 40%;">Service Tax No.</td>
                                <td style="width: 60%;">: <strong
                                    class="ml-3">${data.table[0].orgGST}</strong></td>
                              </tr>
                              <tr>
                                <td style="width: 40%;">PAN. No.</td>
                                <td style="width: 60%;">: <strong
                                    class="ml-3">${data.table[0].orgPAN}</strong></td>
                              </tr>
                            </tbody>
                          </table>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr>
                <td>
                  <table cellspacing="0" cellpadding="0"
                    class="table border-0 table-borderless"
                    style="width: 100%; border-bottom: 1px solid;margin-bottom: 0;">
                    <tbody>
                      <tr>
                        <td style="padding: 4px 10px 4px 10px;">Subject : Amendment to
                          Purchase Order</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr>
                <td>
                  <table cellspacing="0" cellpadding="0"
                    class="table border-0 table-borderless"
                    style="width: 100%; border-bottom: 1px solid;border-top: none;margin-bottom: 0;">
                    <tbody>
                      <tr>
                        <td style="padding: 4px 10px 4px 10px; border: none;">Dear Sir,<br> Please supply
                          the following materials confirming to the technical specification
                          and with the following Terms & Condition.</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr>
                <td>
                  <table cellspacing="0" cellpadding="0" class="table table-bordered"
                    style="width: 100%; border-bottom: 1px solid;border-top: none;margin-bottom: 0;min-height: 55vh;">
                    <thead>
                      <tr style="background: transparent;">
                        <th style="border-bottom: 1px solid;border-right: 1px solid #000;padding: 5px 8px;widdth:33%">
                          Item Description</th>
                        <th style="border-bottom: 1px solid;border-right: 1px solid #000;padding: 5px 8px;width: 33%;">To
                          be Read As</th>
                        <th style="border-bottom: 1px solid;border-right: none;padding: 5px 8px;width: 33%;">In
                          place of</th>
                      </tr>
                    </thead>
        
                    <tbody>
                    ${data.table1.length > 0 ?
                `<tr>
                      <td style="font-weight: bold;  font-size: 16px;padding-left: 5px;border-right: 1px solid !important;border: none;text-align:left">${data.table1[0].tableName}</td>
                      <td style="border-right: 1px solid !important;border: none;text-align:left"></td>
                      <td style="border: none;text-align:left"></td>
                      </tr>`: ''}
                      ${data.table1.map((eldata:any, index:any) => `           
                      <tr>
                        <td style="border-right: 1px solid !important;border: none;text-align:left;padding-left: 5px;word-break: break-all;">${eldata.key}</td>
                        <td style="border-right: 1px solid !important;border: none;text-align:left;padding-left: 5px;word-break: break-all;">${eldata.new}</td>
                        <td style="border: none;text-align:left;padding-left: 5px;word-break: break-all;">${eldata.old}</td>
                      </tr>
                      `).join('')}
        
                      ${data.table2.length > 0 ?
                `<tr>
                        <td style="font-weight: bold;  font-size: 16px;padding-top: 10px;padding-left: 5px;border-right: 1px solid !important;border: none;text-align:left">${data.table2[0].tableName}</td>
                        <td style="border-right: 1px solid !important;border: none;text-align:left"></td>
                        <td style="border: none;text-align:left"></td>
                        </tr>`: ''}
                        ${data.table2.map((eldata:any, index:any) => `           
                        <tr>
                          <td style="border-right: 1px solid !important;border: none;text-align:left;padding-left: 5px;word-break: break-all;">${eldata.key}</td>
                          <td style="border-right: 1px solid !important;border: none;text-align:left;padding-left: 5px;word-break: break-all;">${eldata.new}</td>
                          <td style="border: none;text-align:left;padding-left: 5px;word-break: break-all;">${eldata.old}</td>
                        </tr>
                        `).join('')}
        
                    ${data.table3.length > 0 ?
                `<tr>
                      <td style="font-weight: bold;  font-size: 16px;padding-top: 10px;padding-left: 5px;border-right: 1px solid !important;border: none;text-align:left">${data.table3[0].tableName}</td>
                      <td style="border-right: 1px solid !important;border: none;text-align:left"></td>
                      <td style="border: none;text-align:left"></td>
                      </tr>`: ''}
                      ${data.table3.map((eldata:any, index:any) => `           
                      <tr>
                        <td style="border-right: 1px solid !important;border: none;text-align:left;padding-left: 5px;word-break: break-all;">${eldata.key}</td>
                        <td style="border-right: 1px solid !important;border: none;text-align:left;padding-left: 5px;word-break: break-all;">${eldata.new}</td>
                        <td style="border: none;text-align:left;padding-left: 5px;word-break: break-all;">${eldata.old}</td>
                      </tr>
                      `).join('')}
        
                    ${data.table4.length > 0 ?
                `<tr>
                      <td style="font-weight: bold;  font-size: 16px;padding-top: 10px;padding-left: 5px;border-right: 1px solid !important;border: none;text-align:left">${data.table4[0].tableName}</td>
                      <td style="border-right: 1px solid !important;border: none;text-align:left"></td>
                      <td style="border: none;text-align:left"></td>
                      </tr>`: ''}
                      ${data.table4.map((eldata:any, index:any) => `           
                      <tr>
                        <td style="border-right: 1px solid !important;border: none;text-align:left;padding-left: 5px;word-break: break-all;">${eldata.key}</td>
                        <td style="border-right: 1px solid !important;border: none;text-align:left;padding-left: 5px;word-break: break-all;">${eldata.new}</td>
                        <td style="border: none;text-align:left;padding-left: 5px;word-break: break-all;">${eldata.old}</td>
                      </tr>
                      `).join('')}
                    
                    ${data.table5.length > 0 ?
                `<tr>
                    <td style="font-weight: bold;  font-size: 16px;padding-top: 10px;padding-left: 5px;border-right: 1px solid !important;border: none;text-align:left">${data.table5[0].tableName}</td>
                    <td style="border-right: 1px solid !important;border: none;text-align:left"></td>
                    <td style="border: none;text-align:left"></td>
                    </tr>`: ''}
                    ${data.table5.map((eldata:any, index:any) => `           
                    <tr>
                      <td style="border-right: 1px solid !important;border: none;text-align:left;padding-left: 5px;word-break: break-all;">${eldata.key}</td>
                      <td style="border-right: 1px solid !important;border: none;text-align:left;padding-left: 5px;word-break: break-all;">${eldata.new}</td>
                      <td style="border: none;text-align:left;padding-left: 5px;word-break: break-all;">${eldata.old}</td>
                    </tr>
                    `).join('')}   
                    ${data.table6.length > 0 ?
                `<tr>
                      <td style="font-weight: bold;  font-size: 16px;padding-top: 10px;padding-left: 5px;border-right: 1px solid !important;border: none;text-align:left">${data.table6[0].tableName}</td>
                      <td style="border-right: 1px solid !important;border: none;text-align:left"></td>
                      <td style="border: none;text-align:left"></td>
                      </tr>`: ''}
                      ${data.table6.map((eldata:any, index:any) => `           
                      <tr>
                        <td style="border-right: 1px solid !important;border: none;text-align:left;padding-left: 5px;word-break: break-all;">${eldata.key}</td>
                        <td style="border-right: 1px solid !important;border: none;text-align:left;padding-left: 5px;word-break: break-all;">${eldata.new}</td>
                        <td style="border: none;text-align:left;padding-left: 5px;word-break: break-all;">${eldata.old}</td>
                      </tr>
                      `).join('')}           
                    <tr>
                      <td style="border-right: 1px solid #000!important;border: none;color: #fff;">-</td>
                      <td style="border-right: 1px solid !important;border: none;"></td>
                      <td style="border: none;"></td>
                    </tr>
                    <tr>
                      <td style="border-right: 1px solid #000!important;border: none;color: #fff;">-</td>
                      <td style="border-right: 1px solid !important;border: none;"></td>
                      <td style="border: none;"></td>
                    </tr>
                    <tr>
                      <td style="border-right: 1px solid #000!important;border: none;color: #fff;">-</td>
                      <td style="border-right: 1px solid !important;border: none;"></td>
                      <td style="border: none;"></td>
                    </tr>
                   </tbody>
                  </table>
                </td>
              </tr>
              <tr>
                <td>
                  <table cellspacing="0" cellpadding="0"
                    class="table border-0 table-borderless"
                    style="width: 100%; border-bottom: 1px solid;border-top: none;margin-bottom: 0;">
                    <tbody>
                      <tr>
                        <td style="padding: 4px 10px 4px 10px; border: none;">
                        Remark : ${data.table[0].remarks}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              <tr>
                <td>
                  <table class="table border-0 table-borderless margin: 0;" style="width: 100%;padding-bottom: 5px;">
                    <tbody>
                      <tr>
                        <td style="text-align: left; border: none;" width="100%">
                          <strong style="margin-left: 15px;">
                          For, ${data.table[0].org}</strong><br><br>
                        </td>
                      </tr>
                      <tr>
                        <td style=" border-top: none;">
                          <table style="width: 100%;">
                            <tbody>
                              <tr>
                                <td style="text-align: center;" width="25%">
                                  <span>${data.table[0].createdby}<br>
                                    Prepared By</span>
                                </td>
                                <td style="text-align: center;" width="25%"><span><br>
                                    Checked By</span></td>
                                <td style="text-align: center;" width="25%"><span><br>
                                    Authorised By</span></td>
                                <td style="text-align: center;" width="25%"><span><br>
                                    Approved By</span></td>
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
