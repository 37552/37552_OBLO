import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { forkJoin, of } from 'rxjs';
import { tap, map, finalize, catchError } from 'rxjs/operators';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { DrawerModule } from 'primeng/drawer';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TextareaModule } from 'primeng/textarea';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MessageModule } from 'primeng/message';
import { PopoverModule } from 'primeng/popover';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { TabsModule } from 'primeng/tabs';
import { MultiSelectModule } from 'primeng/multiselect';
import { CheckboxModule } from 'primeng/checkbox';
import { ProgressSpinner } from 'primeng/progressspinner';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { UserService } from '../../shared/user-service';
import { TableColumn, TableTemplate } from '../../table-template/table-template';
import { Customvalidation } from "../../shared/Validation";
import { TooltipModule } from 'primeng/tooltip';
import { NgZone } from '@angular/core';


@Component({
  selector: 'app-crm-quotation',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    DatePickerModule,
    DrawerModule,
    TableModule,
    ToastModule,
    TextareaModule,
    BreadcrumbModule,
    MessageModule,
    TableTemplate,
    PopoverModule,
    ConfirmDialogModule,
    DialogModule,
    TabsModule,
    MultiSelectModule,
    CheckboxModule,
    ProgressSpinner,
    ProgressSpinnerModule,
    ConfirmPopupModule,
    TooltipModule
  ],
  templateUrl: './crm-quotation.html',
  providers: [MessageService, ConfirmationService, DatePipe, CurrencyPipe],
})
export class CrmQuotation implements OnInit, AfterViewInit {
  @ViewChild('dataDialogTemplate') dataDialogTemplate!: TemplateRef<any>;

  visible = false;
  postType: 'add' | 'update' | 'view' = 'add';
  activeTabIndex: number = 0;
  header = 'Add Quotation';
  headerIcon = '';
  menulabel = '';
  FormName = '';
  isLoading = false;
  isPrintLoading = false;
  isGrandTotalLoading = false;
  showOpportunity = true;
  showAddress = true;
  showItems = true;
  showStage = true;
  showTerms = true;
  showNotes = true;
  showChargesSection = false;
  itemDetailsVisible = false;
  dataDialogVisible = false;
  ShowAddressDtl = false;
  isDropdownDataLoaded = false;
  loadingOpportunity = false;
  loadingContact = false;
  crmQuotationForm!: FormGroup;
  addtionalTaxForm!: FormGroup;
  discountForm!: FormGroup;
  otherChargesForm!: FormGroup;
  itemsDetails!: FormGroup;
  totalCount = 0;
  pageNo = 1;
  pageSize = 10;
  searchText = '';
  currentDate = new Date();
  opportunityTypeDrop: any[] = [];
  customerTypeDrop: any[] = [];
  customerTableData: any[] = [];
  customerAddressDrp: any[] = [];
  leadDrp: any[] = [];
  customerDrp: any[] = [];
  opportunityDrp: any[] = [];
  contactDrp: any[] = [];
  stageDrp: any[] = [];
  natureDrp: any[] = [];
  purchaceTaxDrp: any[] = [];
  chargeTypeDrp: any[] = [];
  sourceTableData: any[] = [];
  AssignedTo: any[] = [];
  itemTaxDrp: any[] = [];
  itemDiscountDrp: any[] = [];
  itemListTableDataArray: any[] = [];
  showItemDetailsForm = false; 
  pricelistdetailsform=false;
  itemsDetailsChildData: any[] = []; 

  taxForOptions = [
    { drpVal: 'Item Wise', drpText: 'Item Wise' },
    { drpVal: 'Order Wise', drpText: 'Order Wise' }
  ];
  
  taxOptionDrp = [
    { drpVal: 'Inclusive', drpText: 'Inclusive' },
    { drpVal: 'Exclusive', drpText: 'Exclusive' }
  ];

  billingAddressTableData: any[] = [];
  priceListTableData: any[] = [];
  allViewTableData: any[] = [];
  additionalTaxArray: any[] = [];
  discountArray: any[] = [];
  otherChargesArray: any[] = [];
  quotationStageArray: any[] = [];
  selectedItem: any = null;
  paramvaluedata = '';

  modelHeading = '';
  recordViewData: any[] = [];
  recordHeaderViewData: any[] = [];
  hiddenViewKeys: string[] = [
    'id', 'ItemId', 'itemId', 'discount', 'tax', 'totalValue', 'netPrice',
    'priceListId', 'isExpanded', 'natureId', 'taxId', 'chargesTypeId',
    'chargesId', 'itemCodeId', 'opportunityId', 'customerId', 'contactId',
    'custAddId', 'leadId', 'opportunityTypeId', 'orgTypeId'
  ];

  backendGrandTotal: number | null = null;
  basicAmount: number | null = null;
  DiscountAmount: number | null = null;
  TaxAmount: number | null = null;
  otherChargesTotal: number | null = null;
  isTaxItemWise = true;
  isDiscountItemWise = true;
  printingId: number | null = null;
  additionalTaxIdCounter = 1;
  discountIdCounter = 1;
  otherChargesIdCounter = 1;
  isInitialDataLoaded = false;

  breadcrumbItems: any[] = [];

  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true },
    { key: 'quotation Code', header: 'Quotation Code', isVisible: true, isSortable: false },
    { key: 'subject', header: 'Subject', isVisible: true, isSortable: false },
    { key: 'customer', header: 'Customer', isVisible: true, isSortable: false },
    { key: 'quoteType', header: 'Opportunity type', isVisible: true, isSortable: false },
    { key: 'contact', header: 'Contact', isVisible: true, isSortable: false },
    { key: 'stage', header: 'stage', isVisible: true, isSortable: false },
    { key: 'opportunityStatus', header: 'Status', isVisible: true, isSortable: false },
    { key: 'validTill', header: 'Valid Till', isVisible: true, isSortable: false },
    { key: 'address', header: 'Address', isVisible: true, isSortable: false },
    { key: 'details', header: 'Details', isVisible: true, isSortable: false },
    { key: 'notes', header: 'Notes', isVisible: true, isSortable: false },
    { key: 'jsonDetails',  header: ' Item Details', isVisible: true, isSortable: false, isCustom: true },
    { key: 'jsonDetails1',  header: ' Discount Details', isVisible: true, isSortable: false, isCustom: true },
    { key: 'jsonDetails2',  header: ' Tax Details', isVisible: true, isSortable: false, isCustom: true },
    { key: 'jsonDetails3',  header: ' Other Charges Details', isVisible: true, isSortable: false, isCustom: true },
    { key: 'jsonDetails4',  header: ' Print', isVisible: true, isSortable: false, isCustom: true },
  ];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
    private confirmationService: ConfirmationService,
    private datePipe: DatePipe,
    private currencyPipe: CurrencyPipe,
    public Customvalidation: Customvalidation,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    const paramStr = sessionStorage.getItem('menuItem');
    if (paramStr) {
      try {
        const p = JSON.parse(paramStr);
        this.menulabel = p.menu ;
        this.FormName = p.formName ;
        this.breadcrumbItems = [
          { label: 'CRM' },
          { label: this.menulabel },
          { label: this.FormName }
        ];
      } catch {}
    }
    this.initForms();
    this.showItemDetailsForm = false;
    this.loadMasterDropdowns();
    this.getViewData(true);
    setTimeout(() => {
      this.cdr.detectChanges();
    });
  }

  ngAfterViewInit(): void {
    if (this.discountForm && this.discountForm.get('discountFor')) {
      this.discountForm.get('discountFor')?.enable();
    }
  }

  initForms() {
    this.crmQuotationForm = this.fb.group({
      subject: ['', [Validators.required]],
      opportunityType: ['', [Validators.required]],
      customerType: ['', [Validators.required]],
      customer: ['', [Validators.required]],
      customerAddress: ['', [Validators.required]],
      source: ['', [Validators.required]],
      assignedTo: ['', [Validators.required]],
      contact: ['', [Validators.required]],
      opportunityId: [''],
      stageId: ['', [Validators.required]],
      date: ['', [Validators.required]],
      billingAddress: [''],
      shippingAdd: [''],
      priceList: [''],
      details: ['', [Validators.required]],
      notes: [''],
    });

    this.addtionalTaxForm = this.fb.group({
      taxFor: ['', [Validators.required]],
      natureId: ['', [Validators.required]],
      taxId: ['', [Validators.required]],
      amount: [''],
      taxOptionId: ['', [Validators.required]],
      discountPercentage: [''],
      remarks: ['']
    });

    this.discountForm = this.fb.group({
      discountFor: [{value: '', disabled: false}, [Validators.required]],
      DiscountOptionId: ['', [Validators.required]],
      natureId: ['', [Validators.required]],
      discount: ['', [Validators.required]],
      remarks: ['']
    });

    this.otherChargesForm = this.fb.group({
      chargesTypeId: ['', [Validators.required]],
      natureId: ['', [Validators.required]],
      chargeValue: ['', [Validators.required]],
      isBasic: [false],
      remarks: [''],
    });

    this.itemsDetails = this.fb.group({
      priceList: [''],
      totalAmount: [{ value: 0, disabled: true }],
      item: ['', ],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [{ value: 0, disabled: true }],
      totalPrice: [{ value: 0, disabled: true }],
      details: [''],
      tax: [[]], 
      discount: [''] 
    });
  }

  get f() { return this.crmQuotationForm.controls; }
  get f1() { return this.addtionalTaxForm.controls; }
  get f2() { return this.discountForm.controls; }
  get f3() { return this.otherChargesForm.controls; }




loadMasterDropdowns() {
  const empId = sessionStorage.getItem('empId') || '0';
  forkJoin({
    customerData: this.userService.getQuestionPaper(`uspGetOpportunityDetails|action=CUSTOMER|customerId=0`),
    oppType: this.userService.getQuestionPaper('uspGetOpportunityDetails|action=OPPORTUNITYTYPE'),
    customerTypes: this.userService.getQuestionPaper(`uspGetOpportunityDetails|action=CUSTOMERTYPE`),
    assigned: this.userService.getQuestionPaper(`uspGetFillDrpDown|table=CrmEmployeeDrp|filterValue=${empId}|filterColumn=`),
    nature: this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblNatureOfChargesMaster`),
    purchaseTax: this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblPurchaseTaxDetailsMaster`),
    chargeType: this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblChargesTypeMaster`)
  }).subscribe({
    next: (res: any) => {
      this.customerDrp = res.customerData?.table || [];
      this.stageDrp = res.customerData?.table7 || [];
      this.natureDrp = res.nature?.table || [];
      this.purchaceTaxDrp = res.purchaseTax?.table || [];
      this.chargeTypeDrp = res.chargeType?.table || [];
      this.AssignedTo = res.assigned?.table || [];
      this.sourceTableData = res.customerData?.table2 || [];
      this.opportunityTypeDrop = res.oppType?.table1 || [];
      this.customerTypeDrop = res.customerData?.table4 || [];
      this.leadDrp = res.lead?.table || [];
      this.isDropdownDataLoaded = true;
      this.isInitialDataLoaded = true;
      setTimeout(() => {
        this.cdr.detectChanges();
      });
    },
    error: (err: HttpErrorResponse) => {
      console.error('Error loading master dropdowns:', err);
      if (err.status == 403) {
        this.Customvalidation.loginroute(err.status);
      }
      this.isInitialDataLoaded = true;
      setTimeout(() => {
        this.cdr.detectChanges();
      });
    }
  });
}

  onCustomerTypeChange() {
    const customerTypeId = this.crmQuotationForm.get('customerType')?.value;
    if (!customerTypeId) {
      this.customerTableData = [];
      return;
    }
    
    this.userService
      .getQuestionPaper(`uspGetOpportunityDetails|action=CUSTOMER|customerId=0|ownershipTypeId=${customerTypeId}`)
      .subscribe({
        next: (res: any) => {
          this.customerTableData = res['table'] || [];
          this.crmQuotationForm.patchValue({
            customer: null,
            customerAddress: null,
            contact: null,
            opportunityId: null,
            billingAddress: '',
            shippingAdd: ''
          });
          
          this.customerAddressDrp = [];
          this.contactDrp = [];
          this.opportunityDrp = [];
          this.priceListTableData = [];
          this.itemsDetailsChildData = [];
          
          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => {
          if (err.status == 403) {
            this.Customvalidation.loginroute(err.status);
          }
        }
      });
  }

onOpportunityTypeChange(event: any) {
  const opportunityType = Number(event.value);
  const opportunityIdControl = this.crmQuotationForm.get('opportunityId');

  if (opportunityType === 10000) { 
    opportunityIdControl?.clearValidators();
    opportunityIdControl?.setValue(null);
    opportunityIdControl?.updateValueAndValidity();
    this.showItemDetailsForm = true;
    this.pricelistdetailsform = false;
    this.showItems = true; 
    this.priceListTableData = [];
    this.opportunityDrp = [];
    this.itemsDetailsChildData = [];
    this.itemListTableDataArray = [];
    this.itemsDetails.reset({
      priceList: '',
      totalAmount: 0,
      item: null,
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      details: '',
      tax: [],
      discount: ''
    });

    const customerId = this.crmQuotationForm.get('customer')?.value;
    if (customerId) {
      this.loadPriceListsForDirectOpportunity(customerId);
    }

  } else if (opportunityType === 10001) {
    opportunityIdControl?.setValidators([Validators.required]);
    opportunityIdControl?.enable();
    opportunityIdControl?.updateValueAndValidity();
    this.showItemDetailsForm = false;
    this.pricelistdetailsform = true;
    this.showItems = true; 
    this.itemsDetailsChildData = [];
    this.priceListTableData = [];
    this.itemListTableDataArray = [];
    this.itemsDetails.reset();
    const customerId = this.crmQuotationForm.get('customer')?.value;
    if (customerId) {
      this.getOpportunityDataForCustomer(customerId);
    }
  }

  this.cdr.detectChanges();
}



loadPriceListsForDirectOpportunity(customerId: number) {
  const districtId = sessionStorage.getItem('District');
  
  this.userService.getQuestionPaper(
    `uspGetOpportunityDetails|action=PRICELIST|customerId=${customerId}|districtId=${districtId}`
  ).subscribe({
    next: (res: any) => {
      const priceLists = res['table'] || [];
      this.priceListTableData = priceLists;
      this.itemsDetails.patchValue({
        priceList: null,
        totalAmount: 0,
        item: null,
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0,
        details: '',
        tax: [],
        discount: ''
      });
      
      this.cdr.detectChanges();
    },
    error: (err: HttpErrorResponse) => {
      if (err.status == 403) {
        this.Customvalidation.loginroute(err.status);
      }
    }
  });
}

onCustomerChange(event: any) {
  const customerId = event?.value;
  
  if (!customerId) {
    this.customerAddressDrp = [];
    this.contactDrp = [];
    this.opportunityDrp = [];
    this.priceListTableData = [];
    this.itemsDetailsChildData = [];
    this.itemListTableDataArray = [];
    return;
  }

  this.userService
    .getQuestionPaper(`uspGetOpportunityDetails|action=CUSTOMERDETAILS|customerId=${customerId}`)
    .subscribe({
      next: (res: any) => {
        this.customerAddressDrp = res['table'] || [];
        this.contactDrp = res['table1'] || [];
        
        this.crmQuotationForm.patchValue({
          customerAddress: null,
          contact: null,
          opportunityId: null,
          billingAddress: '',
          shippingAdd: ''
        });
        const opportunityType = this.crmQuotationForm.get('opportunityType')?.value;
        if (opportunityType === '10000') {
          this.loadPriceListsForDirectOpportunity(customerId);
        } else {
          this.getOpportunityDataForCustomer(customerId);
        }
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        if (err.status == 403) {
          this.Customvalidation.loginroute(err.status);
        }
      }
    });
}

  onCustomerAddressChange() {
    const customerId = this.crmQuotationForm.get('customer')?.value;
    const addressId = this.crmQuotationForm.get('customerAddress')?.value;
    if (!customerId || !addressId) return;
    
    this.userService
      .getQuestionPaper(`uspGetOpportunityDetails|action=CUSTOMERDETAILS|customerId=${customerId}|customerAddId=${addressId}`)
      .subscribe({
        next: (res: any) => {
          this.contactDrp = res['table1'] || [];
          this.crmQuotationForm.patchValue({
            contact: null
          });
          const selectedAddress = this.customerAddressDrp.find(addr => addr.drpValue == addressId);
          if (selectedAddress) {
            this.crmQuotationForm.patchValue({
              billingAddress: selectedAddress.drpOption || '',
              shippingAdd: selectedAddress.drpOption || ''
            });
          }
          
          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => {
          if (err.status == 403) {
            this.Customvalidation.loginroute(err.status);
          }
        }
      });
  }

  getOpportunityDataForCustomer(customerId: number) {
    if (!customerId) return;
    this.loadingOpportunity = true;
    const userId = sessionStorage.getItem('userId');
    const roleId = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;

    this.userService.getQuestionPaper(
      `uspGetQuotationData|action=OPPRTUNITYDATA|customerId=${customerId}|appUserId=${userId}|appUserRole=${roleId}`
    ).subscribe({
      next: (res: any) => {
        this.opportunityDrp = res['table'] || [];
        this.loadingOpportunity = false;
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.loadingOpportunity = false;
        if (err.status == 403) {
          this.Customvalidation.loginroute(err.status);
        }
        this.cdr.detectChanges();
      }
    });
  }


  getPriceListData(customerId: number) {
    if (!customerId) return;
    const districtId = sessionStorage.getItem('District');
    this.userService.getQuestionPaper(
      `uspGetOpportunityDetails|action=PRICELIST|customerId=${customerId}|districtId=${districtId}`
    ).subscribe({
      next: (res: any) => {
        const priceLists = res['table'] || [];
        if (priceLists.length > 0) {
          const defaultPriceList = priceLists[0];
          this.crmQuotationForm.patchValue({
            priceList: defaultPriceList.drpValue
          });
          this.getItemDetailsForDirectOpportunity(customerId, defaultPriceList.drpValue);
        }
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        if (err.status == 403) {
          this.Customvalidation.loginroute(err.status);
        }
      }
    });
  }


  
  getItemDetailsForDirectOpportunity(customerId: number, priceListId: number) {
    this.userService.getQuestionPaper(
      `uspGetOpportunityDetails|action=ITEM|customerId=${customerId}|priceListId=${priceListId}`
    ).subscribe({
      next: (res: any) => {
        const itemsData = res['table'] || [];
        if (itemsData.length > 0) {
          this.priceListTableData = itemsData.map((item: any, index: number) => ({
            id: 0,
            ItemId: item.drpValue || 0,
            itemCodeId: item.itemCodeId || 0,
            item: item.drpOption || '',
            quantity: 1,
            unitPrice: 0, 
            totalPrice: 0,
            discount: '',
            itemTax: [],
            isExpanded: false,
            priceList: priceListId,
            priceListId: priceListId
          }));
          this.getItemPrices(customerId, priceListId);
        }
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        if (err.status == 403) {
          this.Customvalidation.loginroute(err.status);
        }
      }
    });
  }


  
  getItemPrices(customerId: number, priceListId: number) {
    this.priceListTableData.forEach((item, index) => {
      if (item.ItemId) {
        this.userService.getQuestionPaper(
          `uspGetOpportunityDetails|action=ITEMPRICE|itemId=${item.ItemId}|priceListId=${priceListId}`
        ).subscribe({
          next: (res: any) => {
            const row = res?.table?.[0];
            if (row) {
              item.unitPrice = row.unitPrice || 0;
              item.totalPrice = item.quantity * item.unitPrice;
            }
            this.cdr.detectChanges();
          },
          error: (err: HttpErrorResponse) => {
            if (err.status == 403) {
              this.Customvalidation.loginroute(err.status);
            }
          }
        });
      }
    });
  }

  
  getOpportunityData() {
    const opportunityType = this.crmQuotationForm.get('opportunityType')?.value;
    if (opportunityType !== '10000') {
      const customerId = this.crmQuotationForm.get('customer')?.value;
      if (!customerId) {
        this.opportunityDrp = [];
        return;
      }
      this.loadingOpportunity = true;
      const userId = sessionStorage.getItem('userId');
      const roleId = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
      this.userService.getQuestionPaper(
        `uspGetQuotationData|action=OPPRTUNITYDATA|customerId=${customerId}|appUserId=${userId}|appUserRole=${roleId}`
      ).subscribe({
        next: (res: any) => {
          this.opportunityDrp = res['table'] || [];
          this.loadingOpportunity = false;
          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => {
          this.loadingOpportunity = false;
          if (err.status == 403) {
            this.Customvalidation.loginroute(err.status);
          }
          this.cdr.detectChanges();
        }
      });
    }
  }


  
getContactAddData() {
  const opportunityType = this.crmQuotationForm.get('opportunityType')?.value;
  const customerId = this.crmQuotationForm.get('customer')?.value;
  const opportunityId = this.crmQuotationForm.get('opportunityId')?.value;
  if (opportunityType === '10000') {
    if (customerId && !this.priceListTableData.length) {
      this.loadPriceListsForDirectOpportunity(customerId);
    }
    return;
  }

  if (!customerId || !opportunityId) {
    this.contactDrp = [];
    this.billingAddressTableData = [];
    this.ShowAddressDtl = false;
    return;
  }

  this.loadingContact = true;
  this.userService.getQuestionPaper(
    `uspGetQuotationData|action=CONTACT|customerId=${customerId}|opportunityId=${opportunityId}`
  ).subscribe({
    next: (res: any) => {
      this.contactDrp = res['table'] || [];
      this.billingAddressTableData = res['table1'] || [];
      this.ShowAddressDtl = this.billingAddressTableData.length > 0;

      const itemsData = res['table2'] || [];
      if (itemsData.length > 0) {
        this.priceListTableData = itemsData.map((item: any) => ({
          ...item,
          ItemId: item.itemId || 0,
          itemCodeId: item.itemCodeId || 0,
          discount: '',
          itemTax: [],
          totalPrice: item.quantity * item.unitPrice,
          isExpanded: false
        }));

        if (this.billingAddressTableData.length > 0) {
          this.crmQuotationForm.patchValue({
            billingAddress: this.billingAddressTableData[0]['address'],
            shippingAdd: this.billingAddressTableData[0]['address']
          });
        }
      }

      this.loadingContact = false;
      this.cdr.detectChanges();
    },
    error: (err: HttpErrorResponse) => {
      this.loadingContact = false;
      if (err.status == 403) {
        this.Customvalidation.loginroute(err.status);
      }
      this.cdr.detectChanges();
    }
  });
}

 
  
  getViewData(isTrue: boolean) {
    if (isTrue) {
      this.isLoading = true;
    } else {
      this.pageNo = 1;
    }
    const userId = sessionStorage.getItem('userId');
    const districtId = sessionStorage.getItem('District');
    const roleId = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;

    this.userService.getQuestionPaper(
      `uspGetQuotationsViewData|searchText=${this.searchText}|pageIndex=${this.pageNo}|size=${this.pageSize}|appUserId=${userId}|districtId=${districtId}|appUserRole=${roleId}`
    ).subscribe({
      next: (res: any) => {
        this.allViewTableData = res['table1'] || [];
        this.totalCount = res['table']?.[0]?.totalCnt || this.allViewTableData.length;
        this.allViewTableData.forEach((element: any) => {
          element.rowNo = (this.pageNo - 1) * this.pageSize + this.allViewTableData.indexOf(element) + 1;
          ['itemDetails', 'discountDetails', 'taxDetails', 'otherChargeDetails'].forEach(key => {
            if (element[key] && element[key] !== '[]') {
              try {
                element[key] = JSON.parse(element[key]);
              } catch {
                element[key] = [];
              }
            } else {
              element[key] = [];
            }
          });
        });

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        if (err.status == 403) {
          this.Customvalidation.loginroute(err.status);
        }
        this.cdr.detectChanges();
      }
    });
  }


  
showDialog(type: 'add' | 'update' | 'view', data?: any) {
  this.postType = type; 
  this.visible = true;
  
  if (type === 'add') {
    this.header = 'Add Quotation';
    this.headerIcon = 'pi pi-plus';
    this.clearData();
  } else if (type === 'update') {
    this.header = 'Update Quotation';
    this.headerIcon = 'pi pi-pencil';
    this.getViewDetails(data, 'update');
  } else {
    this.header = 'View Quotation';
    this.headerIcon = 'pi pi-eye';
    this.getViewDetails(data, 'view');
  }
  
  setTimeout(() => {
    this.cdr.detectChanges();
  });
}

 
  
getViewDetails(data: any, type: 'update' | 'view') {
  this.selectedItem = data;
  this.priceListTableData = [];
  this.billingAddressTableData = [];
  this.additionalTaxArray = [];
  this.discountArray = [];
  this.otherChargesArray = [];
  this.itemTaxDrp = [];
  this.itemDiscountDrp = [];
  this.itemsDetailsChildData = [];
  this.additionalTaxIdCounter = 1;
  this.discountIdCounter = 1;
  this.otherChargesIdCounter = 1;

  if (type === 'view') {
    this.crmQuotationForm.disable();
    this.addtionalTaxForm.disable();
    this.discountForm.disable();
    this.otherChargesForm.disable();
  } else {
    this.crmQuotationForm.enable();
    this.crmQuotationForm.get('customer')?.disable();
    this.crmQuotationForm.get('opportunityId')?.disable();
    this.crmQuotationForm.get('opportunityType')?.disable();
    this.crmQuotationForm.get('customerType')?.disable();
     this.crmQuotationForm.get('assignedTo')?.disable();
    this.addtionalTaxForm.enable();
    this.discountForm.enable();
    this.otherChargesForm.enable();
  }

  const opportunityTypeId = data.quoteTypeId || '10001';
  const isDirectOpportunity = opportunityTypeId === 10000 || opportunityTypeId === '10000';

  if (isDirectOpportunity) {
    this.showItemDetailsForm = true;
    this.pricelistdetailsform = false;
    this.crmQuotationForm.get('opportunityId')?.clearValidators();
    this.crmQuotationForm.get('opportunityId')?.updateValueAndValidity();
    this.itemsDetails.patchValue({
      priceList: data.priceListId || null
    });

    if (data.customerId && data.priceListId) {
      this.loadItemsForPriceList(data.customerId, data.priceListId);
    }

  } else {
    this.showItemDetailsForm = false;
    this.pricelistdetailsform = true;
    this.crmQuotationForm.get('opportunityId')?.setValidators([Validators.required]);
    this.crmQuotationForm.get('opportunityId')?.updateValueAndValidity();
  }

  this.crmQuotationForm.patchValue({
    subject:         data.subject           || '',
    opportunityType: String(opportunityTypeId),
    customerType:    data.orgTypeId         || '',
    customer:        data.customerId        || '',
    customerAddress: data.customerAddressId || '',
    contact:         data.contactId         || '',
    opportunityId:   data.opportunityId     || '',
    stageId:         data.stageId           || '',
    date:            data.validTillDate ? new Date(data.validTillDate) : '',
    details:         data.details           || '',
    notes:           data.notes             || '',
    billingAddress:  data.address           || '',
    shippingAdd:     data.address           || '',
    source:          data.sourceId          || '',
    assignedTo:      data.assignedToId      || '',
  });

  forkJoin({
    opportunityTypes: this.userService.getQuestionPaper(
      `uspGetOpportunityDetails|action=OPPORTUNITYTYPE`
    ),
    customerList: this.userService.getQuestionPaper(
      `uspGetOpportunityDetails|action=CUSTOMER|customerId=0|ownershipTypeId=${data.orgTypeId}`
    ),
    customerDetails: this.userService.getQuestionPaper(
      `uspGetOpportunityDetails|action=CUSTOMERDETAILS|customerId=${data.customerId}`
    ),
    customerAddressDetails: this.userService.getQuestionPaper(
      `uspGetOpportunityDetails|action=CUSTOMERDETAILS|customerId=${data.customerId}|customerAddId=${data.customerAddressId}`
    )
  }).subscribe({
    next: (res: any) => {
      this.customerTableData = res.customerList?.table || [];
      this.customerAddressDrp = res.customerDetails?.table  || [];
      this.contactDrp = res.customerAddressDetails?.table1 || [];
      this.opportunityTypeDrop = res.opportunityTypes?.table1 || [];
      this.crmQuotationForm.patchValue({
        opportunityType: Number(data.quoteTypeId || 0),
        customer:        data.customerId        || '',
        customerAddress: data.customerAddressId || '',
        contact:         data.contactId         || '',
        opportunityId:   data.opportunityId     || '',
        billingAddress:  data.address           || '',
        shippingAdd:     data.address           || '',
      });

      this.cdr.detectChanges();
    },
    error: (err: HttpErrorResponse) => {
      if (err.status === 403) this.Customvalidation.loginroute(err.status);
      this.cdr.detectChanges();
    }
  });

  if (!isDirectOpportunity && data.opportunityId) {
    this.opportunityDrp = [{
      drpValue: data.opportunityId,
      drpOption: data.opportunityDetails || ''
    }];
  }

  if (data.taxDetails && data.taxDetails !== '[]') {
    try {
      const taxDetails = typeof data.taxDetails === 'string'
        ? JSON.parse(data.taxDetails)
        : data.taxDetails;

      this.additionalTaxArray = taxDetails.map((tax: any, index: number) => ({
        id:                 tax.id                || 0,
        srNo:               index + 1,
        taxFor:             tax.taxFor            || 'Item Wise',
        taxForTxt:          tax.taxFor            || 'Item Wise',
        natureId:           tax.natureId          || 0,
        nature:             tax.nature            || '',
        taxId:              tax.taxId             || 0,
        tax:                tax.tax               || '',
        amount:             tax.amount            || 0,
        taxOptionId:        tax.taxOptionId       || 'Exclusive',
        taxOption:          tax.taxOptionId       || 'Exclusive',
        discountPercentage: tax.discountPercentage || 0,
        remarks:            tax.remarks           || ''
      }));

      if (this.additionalTaxArray.length > 0) {
        const firstTax = this.additionalTaxArray[0];
        this.isTaxItemWise = firstTax.taxFor !== 'Order Wise';
        this.taxForOptions = [{ drpVal: firstTax.taxFor,      drpText: firstTax.taxFor }];
        this.taxOptionDrp  = [{ drpVal: firstTax.taxOptionId, drpText: firstTax.taxOptionId }];
        if (this.discountForm) {
          this.discountForm.patchValue({
            discountFor: firstTax.taxFor === 'Item Wise' ? 'Item Wise' : 'Order Wise'
          });
          this.discountForm.get('discountFor')?.disable();
        }
      }
      this.updateItemTaxDropdown();

    } catch (e) {
      console.error('Error parsing taxDetails:', e);
    }
  }

  if (data.discountDetails && data.discountDetails !== '[]') {
    try {
      const discountDetails = typeof data.discountDetails === 'string'
        ? JSON.parse(data.discountDetails)
        : data.discountDetails;

      this.discountArray = discountDetails.map((disc: any, index: number) => ({
        id:           disc.id          || 0,
        srNo:         index + 1,
        discountFor:  disc.discountFor || 'Item Wise',
        natureId:     disc.natureId    || 0,
        OptionId:     disc.OptionId    || 'Exclusive',
        OptionIdtext: disc.OptionId    || 'Exclusive',
        nature:       disc.nature      || '',
        discount:     disc.discount    || 0,
        remarks:      disc.remarks     || ''
      }));

      if (this.discountArray.length > 0) {
        this.isDiscountItemWise = this.discountArray[0].discountFor !== 'Order Wise';
      }
      this.updateItemDiscountDropdown();

    } catch (e) {
      console.error('Error parsing discountDetails:', e);
    }
  }

  if (data.itemDetails && data.itemDetails !== '[]') {
    try {
      const itemsData = typeof data.itemDetails === 'string'
        ? JSON.parse(data.itemDetails)
        : data.itemDetails;
      const processedItems = itemsData.map((item: any) => {
        const itemTaxArray = this.convertTaxToArray(item.tax);
        const discountVal  = this.convertSingleDiscount(item.discount);

        return {
          id:             item.id          || 0,
          ItemId:         item.ItemId      || item.itemId   || 0,
          itemCodeId:     item.itemCodeId  || 0,
          item:           item.text        || item.itemDetail || '',
          material:       item.text        || item.itemDetail || '',
          itemVal:        item.text        || item.itemDetail || '',
          itemDetail:     item.itemDetail  || '',
          quantity:       item.quantity    || 1,
          itemQty:        item.quantity    || 1,
          unitPrice:      item.unitPrice   || 0,
          itemUnitPrice:  item.unitPrice   || 0,
          totalPrice:     item.totalPrice  || (item.quantity * item.unitPrice) || 0,
          itemTotalPrice: item.totalPrice  || (item.quantity * item.unitPrice) || 0,
          netPrice:       item.netPrice    || item.totalPrice || 0,
          priceList:      data.priceListId || '',
          priceListId:    data.priceListId || 0,
          discount:       discountVal,
          itemTax:        itemTaxArray,
          isExpanded:     false,
          techSpec:       item.techSpec    || '',
          tolerance:      item.tolerance   || ''
        };
      });

      if (isDirectOpportunity) {
        this.itemsDetailsChildData = processedItems;
        if (data.customerId) {
          this.loadPriceListsForDirectOpportunity(data.customerId);
        }
      } else {
        this.priceListTableData = processedItems;
      }

    } catch (e) {
      console.error('Error parsing itemDetails:', e);
    }
  }

  if (data.otherChargeDetails && data.otherChargeDetails !== '[]') {
    try {
      const otherChargeDetails = typeof data.otherChargeDetails === 'string'
        ? JSON.parse(data.otherChargeDetails)
        : data.otherChargeDetails;

      this.otherChargesArray = otherChargeDetails.map((charge: any, index: number) => ({
        id:            charge.id            || 0,
        srNo:          index + 1,
        chargesTypeId: charge.chargesTypeId || charge.chargesId  || 0,
        chargeType:    charge.chargesType   || charge.chargeType  || '',
        natureId:      charge.natureId      || 0,
        nature:        charge.nature        || '',
        chargeValue:   charge.chargeValue   || charge.value       || 0,
        isBasic:       (charge.isBasic === 1 || charge.isBasic === true) ? 1 : 0,
        remarks:       charge.remarks       || ''
      }));

    } catch (e) {
      console.error('Error parsing otherChargeDetails:', e);
    }
  }

  this.quotationStageArray = (data.quotationStageHistory && data.quotationStageHistory !== '[]')
    ? JSON.parse(data.quotationStageHistory)
    : [];

  this.cdr.detectChanges();
}

  


  getItem(event: any) {
    const priceListId = event?.value || 0;
    const customerId = this.crmQuotationForm.get('customer')?.value || 0;

    if (!priceListId) {
      return of(void 0);
    }

    if (!customerId) {
      this.openAlertDialog('Alert!', 'Please select a customer first!');
      return of(void 0);
    }

    return this.userService
      .getQuestionPaper(
        `uspGetOpportunityDetails|action=ITEM|customerId=${customerId}|priceListId=${priceListId}`
      )
      .pipe(
        tap((res: any) => {
          const newItems = (res?.table || []).map((item: any) => ({
            drpValue: item.drpValue,
            drpOption: item.drpOption,
            itemCodeId: item.itemCodeId
          }));

          if (this.itemsDetailsChildData.length > 0) {
            const existingItemIds = new Set(
              this.itemsDetailsChildData.map(item => item.itemId)
            );

            this.itemListTableDataArray = newItems.filter(
              (item: any) => !existingItemIds.has(item.drpValue)
            );
          } else {
            this.itemListTableDataArray = newItems;
          }
          
          this.itemsDetails.patchValue({
            item: null,
            quantity: 1,
            unitPrice: 0,
            totalPrice: 0
          });

          this.cdr.detectChanges();
        }),
        catchError((err: HttpErrorResponse) => {
          if (err.status == 403) {
            this.Customvalidation.loginroute(err.status);
          } else {
            this.openAlertDialog('Error!', 'Failed to load items. Please try again.');
          }
          return of(void 0);
        })
      );
  }

onPriceListChange(event: any) {
  if (!event || !event.value) {
    this.itemListTableDataArray = [];
    this.itemsDetails.patchValue({
      item: null,
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0
    });
    return;
  }
  
  const customerId = this.crmQuotationForm.get('customer')?.value;
  if (!customerId) {
    this.openAlertDialog('Alert!', 'Please select a customer first!');
    this.itemsDetails.patchValue({ priceList: null });
    return;
  }
  
  this.itemsDetails.patchValue({
    item: null,
    quantity: 1,
    unitPrice: 0,
    totalPrice: 0,
    tax: [],
    discount: ''
  });
  
  this.itemListTableDataArray = [];
  this.loadItemsForPriceList(customerId, event.value);
}

loadItemsForPriceList(customerId: number, priceListId: number) {
  this.userService.getQuestionPaper(
    `uspGetOpportunityDetails|action=ITEM|customerId=${customerId}|priceListId=${priceListId}`
  ).subscribe({
    next: (res: any) => {
      const itemsData = res?.table || [];
     this.itemListTableDataArray = itemsData
        .map((item: any) => ({
          drpValue: item.drpValue,
          drpOption: item.drpOption,
          itemCodeId: item.itemCodeId
        }));
      this.cdr.detectChanges();
    },
    error: (err: HttpErrorResponse) => {
      console.error('Error loading items:', err);
      if (err.status == 403) {
        this.Customvalidation.loginroute(err.status);
      }
    }
  });
}

getUnitPrice(event: any) {
  const itemId = event?.value || 0;
  const priceListId = this.itemsDetails.get('priceList')?.value || 0;
  
  if (!itemId || !priceListId) return;
  
  this.userService.getQuestionPaper(
    `uspGetOpportunityDetails|action=ITEMPRICE|itemId=${itemId}|priceListId=${priceListId}`
  ).subscribe({
    next: (res: any) => {
      const row = res?.table?.[0];
      if (row) {
        this.itemsDetails.patchValue({
          unitPrice: row.unitPrice || 0,
          quantity: 1,
          totalPrice: row.unitPrice || 0,
        });
        
        // If the item has default tax/discount from the price list, you can set them here
        // For example:
        // if (row.defaultTax) {
        //   this.itemsDetails.patchValue({ tax: [row.defaultTax] });
        // }
        // if (row.defaultDiscount) {
        //   this.itemsDetails.patchValue({ discount: row.defaultDiscount });
        // }
      }
      this.calculateTotal();
      this.cdr.detectChanges();
    },
    error: (err: HttpErrorResponse) => {
      if (err.status == 403) {
        this.Customvalidation.loginroute(err.status);
      }
    }
  });
}

  calculateTotal() {
    const qty = Number(this.itemsDetails.get('quantity')?.value) || 0;
    const price = Number(this.itemsDetails.get('unitPrice')?.value) || 0;
    const total = qty * price;
    this.itemsDetails.get('totalPrice')?.setValue(total);
    this.calculateOpportunityTotal();
  }

  calculateOpportunityTotal() {
    const childTotal = this.itemsDetailsChildData.reduce(
      (sum, item) => sum + (Number(item.itemTotalPrice) || Number(item.totalPrice) || 0),
      0
    );
    const currentRowTotal = Number(this.itemsDetails.get('totalPrice')?.value) || 0;
    const grandTotal = childTotal + currentRowTotal;
    this.itemsDetails.get('totalAmount')?.setValue(grandTotal);
  }

  AddRow(formName: string) {
    if (formName === 'itemsDetails') {
      this.addItemRow();
      return;
    }

    let form: FormGroup;
    let formInvalid = false;
    
    switch (formName) {
      case 'addtionalTaxForm':
        form = this.addtionalTaxForm;
        formInvalid = this.addtionalTaxForm.invalid;
        break;
      case 'discountForm':
        form = this.discountForm;
        formInvalid = this.discountForm.invalid;
        break;
      case 'otherChargesForm':
        form = this.otherChargesForm;
        formInvalid = this.otherChargesForm.invalid;
        break;
      default:
        return;
    }

    if (formInvalid) {
      form.markAllAsTouched();
      return;
    }

    if (formName === 'addtionalTaxForm') {
      this.addAdditionalTaxRow();
    } else if (formName === 'discountForm') {
      this.addDiscountRow();
    } else if (formName === 'otherChargesForm') {
      this.addOtherChargesRow();
    }
  }

private addItemRow() {
  if (this.itemsDetails.invalid) {
    this.itemsDetails.markAllAsTouched();
    return;
  }

  const itemId = this.itemsDetails.get('item')?.value;
  const quantity = this.itemsDetails.get('quantity')?.value || 0;
  const unitPrice = this.itemsDetails.get('unitPrice')?.value || 0;
  const totalPrice = this.itemsDetails.get('totalPrice')?.value || 0;
  const details = this.itemsDetails.get('details')?.value || '';
  const priceListId = this.itemsDetails.get('priceList')?.value;
  const selectedItem = this.itemListTableDataArray.find(x => x.drpValue === itemId);
  const itemName = selectedItem?.drpOption || '';
  let selectedTax: number[] = [];
  if (this.isTaxItemWise) {
    selectedTax = this.itemsDetails.get('tax')?.value || [];
    if (this.itemTaxDrp.length > 0 && selectedTax.length === 0) {
      this.openAlertDialog('Alert!', 'Please select at least one tax for this item.');
      return;
    }
  } else {

    selectedTax = this.additionalTaxArray.map(t => Number(t.taxId));
  }


  let selectedDiscount: any = '';
  if (this.isDiscountItemWise) {
    selectedDiscount = this.itemsDetails.get('discount')?.value || '';
  } else {
    selectedDiscount = this.discountArray.length > 0 ? this.discountArray[0].srNo : '';
  }

  const newItem = {
    id: 0,
    itemId: itemId,
    itemCodeId: selectedItem?.itemCodeId || 0,
    material: itemName,
    itemVal: itemName,
    itemDetail: details,
    quantity: quantity,
    itemQty: quantity,
    unitPrice: unitPrice,
    itemUnitPrice: unitPrice,
    totalPrice: totalPrice,
    itemTotalPrice: totalPrice,
    priceListId: priceListId,
    itemTax: selectedTax,      
    discount: selectedDiscount 
  };

  this.itemsDetailsChildData.push(newItem);
  this.itemListTableDataArray = this.itemListTableDataArray.filter(
    item => item.drpValue !== itemId
  );
  this.itemsDetails.patchValue({
    item: null,
    quantity: 1,
    unitPrice: 0,
    totalPrice: 0,
    details: '',
    tax: [],
    discount: ''
  });

  this.calculateOpportunityTotal();
  this.cdr.detectChanges();
}

deleteChildTableRow(index: number) {
  const deletedItem = this.itemsDetailsChildData[index];
  if (deletedItem?.itemId) {
    const exists = this.itemListTableDataArray.find(item => item.drpValue === deletedItem.itemId);
    if (!exists && deletedItem.material) {
      this.itemListTableDataArray.push({
        drpValue: deletedItem.itemId,
        drpOption: deletedItem.material || deletedItem.itemVal,
        itemCodeId: deletedItem.itemCodeId
      });
      this.itemListTableDataArray.sort((a, b) => 
        a.drpOption.localeCompare(b.drpOption)
      );
    }
  }
  
  this.itemsDetailsChildData.splice(index, 1);
  this.calculateOpportunityTotal();

  if (this.itemsDetailsChildData.length === 0) {
    this.itemsDetails.patchValue({
      priceList: '',
      totalAmount: 0
    });
  }
  
  this.cdr.detectChanges();
}
  getItemName(itemId: any): string {
    if (!itemId || !this.itemListTableDataArray.length) return '';
    const item = this.itemListTableDataArray.find(x => x.drpValue === itemId);
    return item ? item.drpOption : '';
  }


getItemTableColspan(): number {
  let colspan = 5;
  if (this.itemTaxDrp.length > 0) colspan++;      
  if (this.itemDiscountDrp.length > 0) colspan++; 
  if (!this.isViewMode()) colspan++;
  return colspan;
}


getItemTableFooterColspan(): number {
  let colspan = 6;
  if (this.itemTaxDrp.length > 0) colspan++;
  if (this.itemDiscountDrp.length > 0) colspan++;
  return colspan;
}

  totalPriceVal(event: any) {
    const quantity = Number(event?.target?.value || event?.value) || 0;
    const unitPrice = this.itemsDetails.get('unitPrice')?.value || 0;
    const total = quantity * unitPrice;
    this.itemsDetails.patchValue({ totalPrice: total });
    this.calculateOpportunityTotal();
  }

  
  getContactAddDataForUpdate(contactId?: number) {
    const customerId = this.crmQuotationForm.get('customer')?.value || 0;
    const opportunityId = this.crmQuotationForm.get('opportunityId')?.value || 0;
    
    this.userService.getQuestionPaper(
      `uspGetQuotationData|action=CONTACT|customerId=${customerId}|opportunityId=${opportunityId}`
    ).subscribe({
      next: (res: any) => {
        this.contactDrp = res['table'] || [];
        this.billingAddressTableData = res['table1'] || [];
        if (contactId) {
          this.crmQuotationForm.patchValue({ contact: contactId });
        }
        if (this.billingAddressTableData.length > 0) {
          this.crmQuotationForm.patchValue({
            billingAddress: this.billingAddressTableData[0]['address'],
            shippingAdd: this.billingAddressTableData[0]['address']
          });
        }
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        if (err.status == 403) {
          this.Customvalidation.loginroute(err.status);
        }
        this.cdr.detectChanges();
      }
    });
  }

  private addAdditionalTaxRow() {
    const taxForValue = this.addtionalTaxForm.get('taxFor')?.value;
    const natureId = this.addtionalTaxForm.get('natureId')?.value;
    const taxId = this.addtionalTaxForm.get('taxId')?.value;
    const taxOptionId = this.addtionalTaxForm.get('taxOptionId')?.value;

    if (natureId === '10000' && !this.addtionalTaxForm.get('amount')?.value) {
      this.openAlertDialog('Alert!', 'Please enter value for column *Amount');
      return;
    }

    const obj = {
      id: 0,
      srNo: this.additionalTaxArray.length + 1,
      taxFor: taxForValue,
      taxForTxt: taxForValue,
      natureId: natureId,
      nature: this.natureDrp.find(n => n.drpValue == natureId)?.drpOption || '',
      taxId: taxId,
      tax: this.purchaceTaxDrp.find(t => t.drpValue == taxId)?.drpOption || '',
      amount: this.addtionalTaxForm.get('amount')?.value || 0,
      taxOptionId: taxOptionId,
      taxOption: taxOptionId,
      discountPercentage: this.addtionalTaxForm.get('discountPercentage')?.value || 0,
      remarks: this.addtionalTaxForm.get('remarks')?.value || ''
    };

    if (this.additionalTaxArray.length <= 0) {
      this.isTaxItemWise = obj.taxFor === "Item Wise";
      if (obj.taxFor === "Order Wise") {
        this.taxForOptions = [{ drpVal: "Order Wise", drpText: "Order Wise" }];
      } else {
        this.taxForOptions = [{ drpVal: "Item Wise", drpText: "Item Wise" }];
      }

      if (obj.taxOptionId === "Exclusive") {
        this.taxOptionDrp = [{ drpVal: "Exclusive", drpText: "Exclusive" }];
      } else {
        this.taxOptionDrp = [{ drpVal: "Inclusive", drpText: "Inclusive" }];
      }
    } else {
      if (this.additionalTaxArray.some(e => e.taxId == obj.taxId)) {
        this.openAlertDialog('Alert!', 'Tax type already exists.');
        return;
      }
      if (this.additionalTaxArray.some(e => e.taxFor != obj.taxFor)) {
        this.openAlertDialog('Alert!', 'Please select same Tax for.');
        return;
      }
      if (this.additionalTaxArray.some(e => e.natureId != obj.natureId)) {
        this.openAlertDialog('Alert!', 'Please select same Nature type.');
        return;
      }
      if (this.additionalTaxArray.some(e => e.taxOptionId != obj.taxOptionId)) {
        this.openAlertDialog('Alert!', 'Please select same Tax option.');
        return;
      }
    }

    this.additionalTaxArray.push(obj);
    this.updateItemTaxDropdown();
    this.addtionalTaxForm.reset();
    if (this.discountForm) {
      this.discountForm.patchValue({
        discountFor: taxForValue === 'Item Wise' ? 'Item Wise' : 'Order Wise'
      });

      if (taxForValue === 'Order Wise') {
        this.discountForm.get('discountFor')?.disable();
      } else {
        this.discountForm.get('discountFor')?.enable();
      }
    }
    this.cdr.detectChanges();
  }

  private addDiscountRow() {
    const taxForValue = this.additionalTaxArray.length > 0 ? this.additionalTaxArray[0].taxFor : null;
    if (taxForValue === 'Order Wise' && this.discountArray.length > 0) {
      this.openAlertDialog('Alert!', 'Only one discount is allowed for Order Wise tax.');
      return;
    }

    const discountFor = this.discountForm.get('discountFor')?.value;
    const natureId = this.discountForm.get('natureId')?.value;
    const OptionId = this.discountForm.get('DiscountOptionId')?.value;
    const discount = this.discountForm.get('discount')?.value;

    const obj = {
      id: 0,
      srNo: this.discountArray.length + 1,
      discountFor: discountFor,
      natureId: natureId,
      OptionId: OptionId,
      OptionIdtext: OptionId,
      nature: this.natureDrp.find(n => n.drpValue == natureId)?.drpOption || '',
      discount: discount,
      remarks: this.discountForm.get('remarks')?.value || ''
    };

    if (this.discountArray.length <= 0) {
      this.isDiscountItemWise = obj.discountFor === "Item Wise";
    } else {
      if (this.discountArray.some(e => e.discountFor != obj.discountFor)) {
        this.openAlertDialog('Alert!', 'Please select same Discount for.');
        return;
      }
      if (this.discountArray.some(e => e.natureId != obj.natureId)) {
        this.openAlertDialog('Alert!', 'Please select same Nature type.');
        return;
      }
    }

    this.discountArray.push(obj);
    this.updateItemDiscountDropdown();
    this.discountForm.reset();
    
    if (this.additionalTaxArray.length > 0) {
      const currentTaxFor = this.additionalTaxArray[0].taxFor;
      if (this.discountForm) {
        this.discountForm.patchValue({
          discountFor: currentTaxFor === 'Item Wise' ? 'Item Wise' : 'Order Wise'
        });

        if (currentTaxFor === 'Order Wise') {
          this.discountForm.get('discountFor')?.disable();
        }
      }
    }

    this.cdr.detectChanges();
  }

  private addOtherChargesRow() {
    const chargesTypeId = this.otherChargesForm.get('chargesTypeId')?.value;
    const natureId = this.otherChargesForm.get('natureId')?.value;
    const chargeValue = this.otherChargesForm.get('chargeValue')?.value;
    const isBasic = this.otherChargesForm.get('isBasic')?.value;

    const obj = {
      id: 0,
      srNo: this.otherChargesArray.length + 1,
      chargesTypeId: chargesTypeId,
      chargeType: this.chargeTypeDrp.find(c => c.drpValue == chargesTypeId)?.drpOption || '',
      natureId: natureId,
      nature: this.natureDrp.find(n => n.drpValue == natureId)?.drpOption || '',
      chargeValue: chargeValue,
      isBasic: isBasic ? 1 : 0,
      remarks: this.otherChargesForm.get('remarks')?.value || ''
    };

    this.otherChargesArray.push(obj);
    this.otherChargesForm.reset();
    this.cdr.detectChanges();
  }


  
  onDeleteRow(index: number, arrayName: 'additionalTaxArray' | 'discountArray' | 'otherChargesArray', formName: string, item: any) {
    if (index !== -1) {
      const array = this[arrayName];
      array.splice(index, 1);
      array.forEach((item: any, idx: number) => {
        item.srNo = idx + 1;
      });

      if (arrayName === 'additionalTaxArray') {
        if (this.additionalTaxArray.length === 0) {
          this.isTaxItemWise = true;
          this.taxForOptions = [
            { drpVal: 'Item Wise', drpText: 'Item Wise' },
            { drpVal: 'Order Wise', drpText: 'Order Wise' }
          ];
          if (this.discountForm) {
            this.discountForm.get('discountFor')?.enable();
            this.discountForm.patchValue({ discountFor: '' });
          }
          this.taxOptionDrp = [
            { drpVal: 'Inclusive', drpText: 'Inclusive' },
            { drpVal: 'Exclusive', drpText: 'Exclusive' }
          ];
        }
        this.updateItemTaxDropdown();
      } else if (arrayName === 'discountArray') {
        if (this.discountArray.length === 0) {
          this.isDiscountItemWise = true;
          const taxForValue = this.additionalTaxArray.length > 0 ? this.additionalTaxArray[0].taxFor : null;
          if (taxForValue !== 'Order Wise' && this.discountForm) {
            this.discountForm.get('discountFor')?.enable();
          }
        }
        this.updateItemDiscountDropdown();
      }
    }
    this.cdr.detectChanges();
  }

  
  updateRowData(event: any, item: any, field: string, index: number): void {
    if (field === 'quantity') {
      const value = Number(event?.target?.value);
      item.quantity = value < 1 ? 1 : value;
    } else if (field === 'unitPrice') {
      const value = Number(event?.target?.value);
      item.unitPrice = value < 0.01 ? 0.01 : value;
    } else if (field === 'discount') {
      item.discount = event?.value || '';
    }
    item.totalPrice = item.quantity * item.unitPrice;
    this.cdr.detectChanges();
  }


  
  onItemTaxChange(item: any, index: number): void {
    if (!Array.isArray(item.itemTax)) {
      if (typeof item.itemTax === 'string' && item.itemTax.length) {
        item.itemTax = item.itemTax.split(',')
          .map((x: string) => Number(x.trim()))
          .filter((x: number) => !isNaN(x));
      } else {
        item.itemTax = [];
      }
    } else {
      item.itemTax = item.itemTax
        .map((x: any) => Number(x))
        .filter((x: number) => !isNaN(x));
    }
    this.cdr.detectChanges();
  }


  
  private convertTaxToArray(taxValue: any): number[] {
    if (!taxValue) return [];
    if (Array.isArray(taxValue)) {
      return taxValue.map((t: any) => {
        const num = Number(t);
        return isNaN(num) ? null : num;
      }).filter((t: number | null): t is number => t !== null);
    } else if (typeof taxValue === 'string') {
      const trimmed = taxValue.trim();
      if (trimmed.length > 0) {
        return trimmed.split(',')
          .map(t => {
            const num = Number(t.trim());
            return isNaN(num) ? null : num;
          })
          .filter((t: number | null): t is number => t !== null);
      }
    } else if (typeof taxValue === 'number') {
      return [taxValue];
    }
    return [];
  }

  private convertSingleDiscount(discountValue: any): number | null {
    if (!discountValue) return null;
    if (typeof discountValue === 'number') {
      return discountValue;
    }
    if (typeof discountValue === 'string') {
      const num = Number(discountValue.split(',')[0]);
      return isNaN(num) ? null : num;
    }
    return null;
  }

  private updateItemTaxDropdown(): void {
    if (this.additionalTaxArray && this.additionalTaxArray.length > 0) {
      this.itemTaxDrp = this.additionalTaxArray.map(tax => ({
        drpValue: Number(tax.taxId),
        drpOption: `${tax.tax} (${tax.taxOptionId})`
      }));
    } else {
      this.itemTaxDrp = [];
    }
    this.cdr.detectChanges();
  }

  private updateItemDiscountDropdown(): void {
    if (this.discountArray && this.discountArray.length > 0) {
      this.itemDiscountDrp = this.discountArray.map((discount, index) => ({
        drpValue: index + 1, 
        drpOption: `${discount.discount}% (${discount.OptionId || 'Exclusive'})`
      }));
    } else {
      this.itemDiscountDrp = [];
    }
    this.cdr.detectChanges();
  }

  getConcatenatedTaxes(): string {
    if (!this.additionalTaxArray || this.additionalTaxArray.length === 0) {
      return '';
    }
    return this.additionalTaxArray.map(tax => `${tax.tax} (${tax.taxOptionId})`).join(', ');
  }




getConcatenatedTaxesForItem(taxIds: number[]): string {
    if (!taxIds || taxIds.length === 0) return '-';
    return taxIds.map(id => {
        const tax = this.additionalTaxArray.find(t => t.taxId === id);
        return tax ? `${tax.tax} (${tax.taxOptionId})` : '';
    }).filter(t => t).join(', ');
}

getItemDiscountTextFromArray(item: any): string {
    if (!item.discount) return '-';
    const discountIndex = Number(item.discount) - 1;
    const discountObj = this.discountArray[discountIndex];
    if (!discountObj) return '-';
    return `${discountObj.discount}% (${discountObj.OptionId})`;
}

  

getConcatenatedDiscounts(): string {
  if (!this.discountArray || this.discountArray.length === 0) {
    return '';
  }
  return this.discountArray.map(disc => `${disc.discount}% (${disc.OptionId})`).join(', ');
}


  
calculateGrandTotal() {
  const opportunityType = this.crmQuotationForm.get('opportunityType')?.value;
const itemsToCalculate = Number(opportunityType) === 10000 
    ? this.itemsDetailsChildData 
    : this.priceListTableData;
  
  if (itemsToCalculate.length === 0) {
    this.openAlertDialog('Alert!', 'Please add at least one item.');
    return;
  }

  this.isGrandTotalLoading = true;
  this.backendGrandTotal = null;
  const tblItemDetails = this.buildTblItemDetailsForSP(itemsToCalculate);
  const tblTaxDetails = this.buildTblTaxDetailsForSP();
  const tblOtherCharges = this.buildOtherChargesForSP();
  const tblItemsTax = this.buildItemsTaxJson(itemsToCalculate);
  const discountJson = this.buildDiscountForSP();
  const SP = 'uspGetSOQuotationGrandTotal';
  const query =
    'tblItemDetails=' + JSON.stringify(tblItemDetails) +
    '|tblTaxDetails=' + JSON.stringify(tblTaxDetails) +
    '|tblOtherCharges=' + JSON.stringify(tblOtherCharges) +
    '|tblItemsTax=' + JSON.stringify(tblItemsTax) +
    '|discountJson=' + JSON.stringify(discountJson);

  this.userService.SubmitPostTypeData(SP, query, this.FormName).subscribe({
    next: (res: any) => {
      this.isGrandTotalLoading = false; 
      const rawTotal = res;
      if (rawTotal) {
        const value = rawTotal.toString();
        let parts = value.split('-');
        if (parts.length && /^\d+$/.test(parts[0])) {
          parts = parts.slice(1);
        }
        const resultMap: any = {};
        for (let i = 0; i < parts.length - 1; i += 2) {
          const key = parts[i];
          const val = Number(parts[i + 1]);
          resultMap[key] = isNaN(val) ? null : val;
        }
        setTimeout(() => {
          this.backendGrandTotal = resultMap['grandTotal'] || resultMap['GrandTotal'] || null;
          this.basicAmount = resultMap['basicamt'] || resultMap['basicAmt'] || null;
          this.DiscountAmount = resultMap['dis'] || resultMap['disAmt'] || resultMap['discount'] || null;
          this.TaxAmount = resultMap['tax'] || resultMap['taxAmt'] || null;
          this.otherChargesTotal = resultMap['other'] || resultMap['otherAmt'] || null;
          this.isGrandTotalLoading = false;
          this.cdr.detectChanges();
        });
      }
      this.cdr.detectChanges();
    },
    error: (err: HttpErrorResponse) => {
      this.isGrandTotalLoading = false;
      console.error('API Error:', err);
      if (err.status === 403) {
        this.Customvalidation.loginroute(err.status);
      } else {
        this.openAlertDialog('Error!', 'Failed to calculate grand total.');
      }
      this.cdr.detectChanges();
    }
  });
}


  
private buildTblItemDetailsForSP(items: any[]): any[] {
  return items.map(item => {
    let discountSrNoCsv = '';

    if (this.isDiscountItemWise) {
      if (item.discount !== null && item.discount !== undefined && item.discount !== '') {
        const discountValue = Number(item.discount);
        if (!isNaN(discountValue) && discountValue > 0) {
          discountSrNoCsv = String(discountValue);
        }
      }
    } else if (!this.isDiscountItemWise && this.discountArray.length) {
      discountSrNoCsv = this.discountArray.map(d => d.srNo).join(',');
    }


    let taxPercentageCsv = '';
    if (this.isTaxItemWise) {
      if (Array.isArray(item.itemTax) && item.itemTax.length > 0) {
        taxPercentageCsv = item.itemTax.join(',');
      } else if (item.itemTax && typeof item.itemTax === 'string') {
        taxPercentageCsv = item.itemTax;
      }
    } else if (!this.isTaxItemWise && this.additionalTaxArray.length) {
      taxPercentageCsv = this.additionalTaxArray.map(t => t.taxId).join(',');
    }

    const itemId = item.ItemId || item.itemId || 0;
    const itemCodeId = item.itemCodeId || 0;
    const quantity = item.quantity || item.itemQty || 0;
    const unitPrice = item.unitPrice || item.itemUnitPrice || 0;

    return {
      id: item.id || 0,
      itemId: itemId,
      itemCodeId: itemCodeId,
      quantity: quantity,
      unitPrice: unitPrice,
      techSpec: item.techSpec || '',
      tolerance: item.tolerance || '',
      taxPercentage: taxPercentageCsv,
      discount: discountSrNoCsv,
      taxIncluded: item.taxIncluded ? 1 : 0
    };
  });
}

private buildItemsTaxJson(items: any[]): any[] {
  const arr: any[] = [];
  if (this.isTaxItemWise) {
    items.forEach((item: any) => {
      const itemId = item.id || item.ItemId || item.itemId || 0;
      const itemCodeId = item.itemCodeId || 0;
      let taxIds: number[] = [];
      if (Array.isArray(item.itemTax)) {
        taxIds = item.itemTax.map((id: any) => Number(id)).filter((id: number) => !isNaN(id));
      } else if (typeof item.itemTax === 'string' && item.itemTax) {
        taxIds = item.itemTax.split(',').map((id: string) => Number(id.trim())).filter((id: number) => !isNaN(id));
      }

      taxIds.forEach((taxId: number) => {
        const selectedTax = this.additionalTaxArray.find((t: any) => Number(t.taxId) === taxId);
        if (selectedTax) {
          arr.push({
            itemId: itemId,
            taxId: selectedTax.taxId,
            amount: selectedTax.amount || 0,
            natureId: selectedTax.natureId,
            itemCodeId: itemCodeId
          });
        }
      });
    });
  } else {
    if (this.additionalTaxArray.length > 0) {
      items.forEach((item: any) => {
        const itemId = item.id || item.ItemId || item.itemId || 0;
        const itemCodeId = item.itemCodeId || 0;
        
        this.additionalTaxArray.forEach((orderTax: any) => {
          arr.push({
            itemId: itemId,
            taxId: orderTax.taxId,
            amount: orderTax.amount || 0,
            natureId: orderTax.natureId,
            itemCodeId: itemCodeId
          });
        });
      });
    }
  }
  
  return arr;
}

private buildTblTaxDetailsForSP(): any[] {
  return this.additionalTaxArray.map(t => ({
    id: t.id || 0,
    taxFor: t.taxFor || 'Item Wise',
    taxId: t.taxId || 0,
    taxOptionId: t.taxOptionId || 'Exclusive',
    remarks: t.remarks || '',
    natureId: t.natureId || 0,
    amount: t.amount || 0
  }));
}

private buildDiscountForSP(): any[] {
  return this.discountArray.map((d, index) => ({
    srNo: index + 1, 
    discountFor: d.discountFor || 'Item Wise',
    natureId: d.natureId || 0,
    OptionId: d.OptionId || 'Exclusive',
    discount: d.discount || 0,
    remarks: d.remarks || ''
  }));
}

private buildOtherChargesForSP(): any[] {
  return this.otherChargesArray.map(c => ({
    id: c.id || 0,
    chargesId: c.chargesTypeId || c.chargesId || 0,
    natureId: c.natureId || 0,
    value: c.chargeValue || c.value || 0,
    remarks: c.remarks || '',
    basic: c.isBasic ? 1 : 0
  }));
}

  
OnSubmitModal() {
  if (this.crmQuotationForm.invalid) {
    this.crmQuotationForm.markAllAsTouched();
    this.scrollToFirstInvalidControl();
    return;
  }
  
  const opportunityType = this.crmQuotationForm.get('opportunityType')?.value;
  if (opportunityType === 10000) {
    if (this.itemsDetailsChildData.length === 0) {
      this.openAlertDialog('Alert!', "Please add at least one item.");
      return;
    }

    if (this.itemsDetailsChildData.some(item => (item.quantity || item.itemQty) <= 0)) {
      this.openAlertDialog('Alert!', "Please enter valid quantity for all items.");
      return;
    }
  } else {

    if (this.priceListTableData.length === 0) {
      this.openAlertDialog('Alert!', "Please add at least one item.");
      return;
    }

    if (this.priceListTableData.some(item => item.totalPrice <= 0)) {
      this.openAlertDialog('Alert!', "Please enter quantity.");
      return;
    }

  }

  this.paramvaluedata = '';
  
  const subject = this.crmQuotationForm.get('subject')?.value || '';
  const quotationTypeId = this.crmQuotationForm.get('opportunityType')?.value || '';
  const customerType = this.crmQuotationForm.get('customerType')?.value || 0;
  const customer = this.crmQuotationForm.get('customer')?.value || 0;
  const customerAddress = this.crmQuotationForm.get('customerAddress')?.value || 0;
  const contact = this.crmQuotationForm.get('contact')?.value || 0;
  const source = this.crmQuotationForm.get('source')?.value || 0;
  const assignedTo = this.crmQuotationForm.get('assignedTo')?.value || 0;
  const opportunityId = this.crmQuotationForm.get('opportunityId')?.value || 0;
  const stageId = this.crmQuotationForm.get('stageId')?.value || 0;
  const date = this.crmQuotationForm.get('date')?.value;
  const details = this.crmQuotationForm.get('details')?.value || '';
  const notes = this.crmQuotationForm.get('notes')?.value || '';
  const billingAddress = this.crmQuotationForm.get('billingAddress')?.value || '';
  const shippingAdd = this.crmQuotationForm.get('shippingAdd')?.value || '';

  const fmtDate = (d: any) => (d ? this.datePipe.transform(d, 'yyyy-MM-dd') : '');

  const itemsToSubmit = opportunityType === 10000 
    ? this.itemsDetailsChildData 
    : this.priceListTableData;


  const validItems = itemsToSubmit.filter(item => 
    (item.itemId || item.ItemId) && 
    (item.quantity || item.itemQty) > 0
  );

  if (validItems.length === 0) {
    this.openAlertDialog('Alert!', "No valid items to submit.");
    return;
  }

  const itemJson = JSON.stringify(this.transformItemDataForAPI(validItems));
  const taxJson = JSON.stringify(this.additionalTaxArray);
  const discountJson = JSON.stringify(this.discountArray);
  const otherChargeJson = JSON.stringify(this.otherChargesArray);
  
  const districtId = sessionStorage.getItem('District') || 0;
  const userId = sessionStorage.getItem('userId') || '';
  const roleId = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId || 0;

  const priceListId = opportunityType === 10000
    ? (this.itemsDetails.get('priceList')?.value || 0)
    : (this.priceListTableData[0]?.priceListId || 0);

  this.paramvaluedata = `subject=${subject}|quotationTypeId=${quotationTypeId}|orgType=${customerType}|customer=${customer}|custAdd=${customerAddress}|contact=${contact}|source=${source}|employeeId=${assignedTo}|opportunityId=${opportunityId}|stageId=${stageId}|date=${fmtDate(date)}|billingAddress=${billingAddress}|shippingAdd=${shippingAdd}|priceList=${priceListId}|details=${details}|itemJson=${itemJson}|taxJson=${taxJson}|discountJson=${discountJson}|otherChargeJson=${otherChargeJson}|grandTotal=${this.backendGrandTotal || 0}|basicAmt=${this.basicAmount || 0}|disAmt=${this.DiscountAmount || 0}|taxAmt=${this.TaxAmount || 0}|otherAmt=${this.otherChargesTotal || 0}|notes=${notes}|districtId=${districtId}|appUserId=${userId}|appUserRole=${roleId}`;
  this.confirmationService.confirm({
    message: 'Are you sure you want to proceed?',
    header: 'Confirm?',
    icon: 'pi pi-exclamation-triangle',
    accept: () => this.submitcall(),
  });
}

  
  submitcall() {
    this.isLoading = true;
    const spName = this.postType == 'update' 
      ? 'uspPostUpdateQuotationsDetails' 
      : 'uspPostQuotationsDetails';
    const quotationId = this.selectedItem?.id || 0;

    let query = '';
    if (this.postType == 'update') {
      query = `quotationId=${quotationId}|${this.paramvaluedata}`;
    } else {
      query = this.paramvaluedata;
    }

    this.userService.SubmitPostTypeData(spName, query, this.FormName).subscribe({
      next: (datacom: any) => {
        this.isLoading = false;
        if (datacom && datacom.includes && datacom.includes('success')) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: this.postType == 'update' ? 'Data Updated Successfully.' : 'Data Saved Successfully.'
          });
          this.getViewData(false);
          this.closeDrawer();
        } else if (datacom && datacom.startsWith('2-')) {
          this.messageService.add({
            severity: 'error',
            summary: 'Alert',
            detail: datacom.split('-')[1]
          });
        } else if (datacom == 'Error occured while processing data!--error') {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Something went wrong!'
          });
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Alert',
            detail: datacom || 'Unknown error occurred'
          });
        }
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        if (err.status == 401) {
          this.openAlertDialog('Error!', 'You are not authorized!');
        } else if (err.status == 403) {
          this.Customvalidation.loginroute(err.status);
        } else {
          this.openAlertDialog('Error!', err.error?.message || err.message || 'Server Error');
        }
        this.cdr.detectChanges();
      }
    });
  }


  
  private transformItemDataForAPI(items: any[]): any[] {
    const opportunityType = this.crmQuotationForm.get('opportunityType')?.value;
    return items.map(item => {
      let discountCsv = '';

      if (this.isDiscountItemWise) {
        discountCsv = item.discount ? String(item.discount) : '';
      } else if (!this.isDiscountItemWise && this.discountArray.length) {
        discountCsv = this.discountArray.map(d => d.srNo).join(',');
      }
      
      let taxCsv = '';
      if (this.isTaxItemWise && Array.isArray(item.itemTax)) {
        taxCsv = item.itemTax.join(',');
      } else if (!this.isTaxItemWise && this.additionalTaxArray.length) {
        taxCsv = this.additionalTaxArray.map(t => t.taxId).join(',');
      }
      
      return {
        id: item.id || 0,
        itemId: item.ItemId || item.itemId || 0,
        itemCodeId: item.itemCodeId || 0,
        itemDetail: item.item || item.itemDetail || item.material || item.itemVal || '',
        quantity: item.quantity || item.itemQty || 0,
        unitPrice: item.unitPrice || item.itemUnitPrice || 0,
        discount: discountCsv,
        itemTax: taxCsv,
        netPrice: (item.quantity || item.itemQty || 0) * (item.unitPrice || item.itemUnitPrice || 0) || 0
      };
    });
  }


  
toggle(section: 'showOpportunity' | 'showAddress' | 'showItems' | 'showStage' | 'showTerms' | 'showNotes') {
  (this as any)[section] = !(this as any)[section];
  this.cdr.detectChanges();
}

  toggleChargesSection() {
    this.showChargesSection = !this.showChargesSection;
    this.cdr.detectChanges();
  }


  
  closeDrawer() {
    this.visible = false;
    this.clearData();
    this.cdr.detectChanges();
  }

  onDrawerHide() {
    this.clearData();
  }

clearData() {
  this.crmQuotationForm.reset();
  this.addtionalTaxForm.reset();
  this.discountForm.reset();
  this.otherChargesForm.reset();
  this.itemsDetails.reset({
    priceList: '',
    totalAmount: 0,
    item: null,
    quantity: 1,
    unitPrice: 0,
    totalPrice: 0,
    details: '',
    tax: [],
    discount: ''
  });
  
  this.billingAddressTableData = [];
  this.priceListTableData = [];
  this.opportunityDrp = [];
  this.contactDrp = [];
  this.customerAddressDrp = [];
  this.customerTableData = [];
  this.leadDrp = [];
  this.quotationStageArray = [];
  this.additionalTaxArray = [];
  this.discountArray = [];
  this.otherChargesArray = [];
  this.itemTaxDrp = [];
  this.itemDiscountDrp = [];
  this.itemsDetailsChildData = [];
  this.itemListTableDataArray = [];
  this.selectedItem = null;
  this.postType = 'add';
  this.showChargesSection = false;
  this.showItemDetailsForm = false;
  this.showItems = true; 
  this.additionalTaxIdCounter = 1;
  this.discountIdCounter = 1;
  this.otherChargesIdCounter = 1;
  this.isTaxItemWise = true;
  this.isDiscountItemWise = true;
  this.backendGrandTotal = null;
  this.basicAmount = null;
  this.DiscountAmount = null;
  this.TaxAmount = null;
  this.otherChargesTotal = null;
  
  this.taxForOptions = [
    { drpVal: 'Item Wise', drpText: 'Item Wise' },
    { drpVal: 'Order Wise', drpText: 'Order Wise' }
  ];
  this.taxOptionDrp = [
    { drpVal: 'Inclusive', drpText: 'Inclusive' },
    { drpVal: 'Exclusive', drpText: 'Exclusive' }
  ];
  
  this.crmQuotationForm.enable();
  this.addtionalTaxForm.enable();
  this.discountForm.enable();
  this.otherChargesForm.enable();
  
  if (this.discountForm && this.discountForm.get('discountFor')) {
    this.discountForm.get('discountFor')?.enable();
    this.discountForm.patchValue({ discountFor: '' });
  }
  
  this.cdr.detectChanges();
}


  
  onTaxForChange(event: any): void {
    const taxForValue = event.value;
    
    if (this.discountForm) {
      this.discountForm.patchValue({
        discountFor: taxForValue === 'Item Wise' ? 'Item Wise' : 'Order Wise'
      });
      
      if (taxForValue === 'Order Wise') {
        this.discountForm.get('discountFor')?.disable();
      } else {
        this.discountForm.get('discountFor')?.enable();
      }
    }
  }


  getItemDiscountText(item: any): string {
    if (this.isDiscountItemWise) {
      if (!item.discount) return '-';

      const discountIndex = Number(item.discount) - 1;
      const discountObj = this.discountArray[discountIndex];

      if (!discountObj) return '-';

      return `${discountObj.discount}% (${discountObj.OptionId})`;
    }

    if (this.discountArray.length) {
      return this.discountArray
        .map(d => `${d.discount}% (${d.OptionId})`)
        .join(', ');
    }

    return '-';
  }


  
  onSelectNature(event: any): void {
    const natureId = event.value;
    if (natureId == '10000') {
      this.addtionalTaxForm.get('amount')?.enable();
    } else {
      this.addtionalTaxForm.get('amount')?.disable();
      this.addtionalTaxForm.patchValue({ amount: 0 });
    }
    this.cdr.detectChanges();
  }

 
  
  isInvalid(controlName: string, form: FormGroup): boolean {
    const ctrl = form?.get(controlName);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  scrollToFirstInvalidControl() {
    setTimeout(() => {
      const firstInvalid = document.querySelector('.ng-invalid');
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        (firstInvalid as HTMLElement).focus();
      }
    }, 200);
  }


  
  openDetail(data: any, title: string) {
    this.modelHeading = title;
    this.recordViewData = [];
    this.recordHeaderViewData = [];

    if (data && data.length) {
      this.recordViewData = data;
      this.recordHeaderViewData = Object.keys(this.recordViewData[0])
        .filter(key => !this.hiddenViewKeys.includes(key));
    }

    this.dataDialogVisible = true;
    this.cdr.detectChanges();
  }

  closeDataDialog() {
    this.dataDialogVisible = false;
    this.recordViewData = [];
    this.recordHeaderViewData = [];
    this.modelHeading = '';
    this.cdr.detectChanges();
  }


  
  openAlertDialog(summary: string, detail: string) {
    const sev = /error|alert/i.test(summary) ? 'error' : 'success';
    this.messageService.add({ severity: sev, summary, detail });
  }


  
  async printOpportunity(data: any) {
    if (this.isPrintLoading) return;

    this.isPrintLoading = true;
    this.cdr.detectChanges();

    try {
      let itemDetails: any[] = [];
      let taxDetails: any[] = [];
      let discountDetails: any[] = [];

      const safeParse = (value: any) => {
        try {
          if (!value) return [];
          if (Array.isArray(value)) return value;
          if (typeof value === 'string' && value !== '[]') {
            return JSON.parse(value);
          }
          return [];
        } catch (e) {
          console.error('JSON Parse Error:', e);
          return [];
        }
      };

      itemDetails = safeParse(data.itemDetails);
      taxDetails = safeParse(data.taxDetails);
      discountDetails = safeParse(data.discountDetails);

      if (!itemDetails.length) {
        this.openAlertDialog('Alert!', 'No item details available to print.');
        return;
      }

      const subtotal = itemDetails.reduce((sum, item) => {
        const quantity = Number(item.quantity) || 0;
        const unitPrice = Number(item.unitPrice) || 0;
        return sum + (quantity * unitPrice);
      }, 0);

      const calculations = {
        subtotal: subtotal.toFixed(2),
        grandTotal: Number(data.grandTotal || 0).toFixed(2),
        basicamount: Number(data.basicAmt || 0).toFixed(2),
        taxamount: Number(data.taxAmt || 0).toFixed(2),
        discountamount: Number(data.disAmt || 0).toFixed(2),
        othercharges: Number(data.otherAmt || 0).toFixed(2)
      };

      const headerDetails = {
        CompanyLogo: '../../..' + (data.orgImage || ''),
        companyName: data.orgName || '',
        companyAddress: data.orgAddress || '',
        companyPhone: data.orgPhone || '',
        companyEmail: data.orgEmail || '',
        quotationNo: data.quotationNo || '',
        createdDate: this.datePipe.transform(data.createdDate, 'dd.MM.yyyy') || '',
        nameDepartment: data.contact || '',
        billtocompanyName: data.contact || '',
        address: data.customerAddress || '',
        customerEmail: data.customerEmail || '',
        clientId: data.clientId || ''
      };

      const printContents = this.generateProfessionalPrintHTML(
        headerDetails,
        itemDetails,
        calculations,
        taxDetails,
        discountDetails
      );

      this.openPrintPreviewDialog(printContents);

    } catch (error) {
      console.error('Print Error:', error);
      this.openAlertDialog('Error!', 'Something went wrong while printing.');
    } finally {
      this.isPrintLoading = false;
      this.cdr.detectChanges();
    }
  }


  
  private generateProfessionalPrintHTML(
    headerDetails: any,
    itemDetails: any[],
    calculations: any,
    taxDetails: any[],
    discountDetails: any[]
  ): string {
    let itemRows = '';
    itemDetails.forEach((item, index) => {
      const quantity = item.quantity || 0;
      const unitPrice = item.unitPrice || 0;
      const total = quantity * unitPrice;
      const description = item.itemDetail || item.text || item.item || item.description || 'N/A';
      itemRows += `
      <tr>
        <td>${description}</td>
        <td class="center">${quantity}</td>
        <td class="right">₹${unitPrice.toFixed(2)}</td>
        <td class="right">₹${total.toFixed(2)}</td>
      </tr>
    `;
    });
    
    let taxTermsInfo = '';
    if (taxDetails && taxDetails.length > 0) {
      taxTermsInfo = taxDetails.map(tax => {
        const percent = Number(tax.Taxvalue) || 0;
        return `${tax.tax} @ ${percent}%`;
      }).join(', ') + ' extra';
    }
    
    let taxRowsHtml = '';
    if (taxDetails && taxDetails.length > 0) {
      taxRowsHtml = taxDetails.map(tax => {
        const percent = Number(tax.Taxvalue) || 0;
        const taxName = tax.tax || 'GST';
        const taxOption = tax.taxOptionId || 'Exclusive';
        return ` (${percent}% - ${taxOption})`;
      }).join();
    }
    
    let discountRowsHtml = '';
    if (discountDetails && discountDetails.length > 0) {
      discountRowsHtml = discountDetails
        .map(disc => {
          const value = Number(disc.discount) || 0;
          const nature = (disc.nature || '').toLowerCase();
          const optionId = disc.OptionId || 'Exclusive';
          const formattedValue =
            nature === 'percentage' ? `${value}%` : `₹${value.toFixed(2)}`;
          return `${formattedValue} (${optionId})`;
        })
        .join(', ');
    }
    
    itemRows += `
      <tr>
        <td>
          1. All Above Prices are Exclusive of Taxes.<br>
          ${taxTermsInfo}<br><br>
        </td>
        <td></td>
        <td></td>
        <td></td>
      </tr>
    `;
    
    const rowspanValue = 5;
    itemRows += `
      <tr>
        <td rowspan="${rowspanValue}">Thank You</td>
        <td colspan="2">SUBTOTAL</td>
        <td class="right">₹${calculations.basicamount}</td>
      </tr>
      <tr>
        <td colspan="2">GST<br>(${taxRowsHtml})</td>
        <td class="right">₹${calculations.taxamount}</td>
      </tr>
      <tr>
        <td colspan="2">Discount Amount<br>(${discountRowsHtml})</td>
        <td class="right">₹${calculations.discountamount}</td>
      </tr>
      <tr>
        <td colspan="2">Other Charges</td>
        <td class="right">₹${calculations.othercharges}</td>
      </tr>
      <tr>
        <td colspan="2"><strong>GRAND TOTAL</strong></td>
        <td class="right"><strong>₹${calculations.grandTotal}</strong></td>
      </tr>
    `;
    
    return `
  <!DOCTYPE html>
  <html>
  <head>
  <meta charset="UTF-8">
  <style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  body {
    font-family: Arial, sans-serif;
    font-size: 12px;
    padding: 20px;
    background: white;
  }
  .container {
    width: 800px;
    margin: 0 auto;
    background: white;
  }
  table {
    width: 100%;
    border-collapse: collapse;
  }
  td, th {
    border: 1px solid #000;
    padding: 8px;
    vertical-align: top;
  }
  th, td {
     -webkit-print-color-adjust: exact !important;
     print-color-adjust: exact !important;
   }
  .no-border {
    border: none;
  }
  .no-border td {
    border: 1px solid #000;
  }
  .bold {
    font-weight: bold;
  }
  .center {
    text-align: center;
  }
  .right {
    text-align: right;
  }
  .bg-blue {
    background-color: #0070c0;
    color: #fff;
    font-weight: bold;
  }
  .text-blue {
    color: #0b5ed7;
  }
  .title {
    font-size: 18px;
    text-align: center;
  }
  .mt-10 {
    margin-top: 10px;
  }
  .mt-20 {
    margin-top: 20px;
  }
  @media print {
    body {
      padding: 0;
      margin: 0;
    }
    .container {
      width: 100%;
      margin: 0;
    }
    .no-print {
      display: none !important;
    }
    table {
      page-break-inside: auto;
    }
    tr {
      page-break-inside: avoid;
      page-break-after: auto;
    }
  }
  @media screen {
    .print-preview-actions {
      position: fixed;
      top: 10px;
      right: 10px;
      z-index: 1000;
      background: white;
      padding: 10px;
      border-radius: 5px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    }
    .btn {
      padding: 10px 20px;
      margin: 0 5px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: bold;
    }
    .btn-print {
      background-color: #0b5ed7;
      color: white;
    }
    .btn-print:hover {
      background-color: #0a4fb8;
    }
    .btn-close {
      background-color: #6c757d;
      color: white;
    }
    .btn-close:hover {
      background-color: #5a6268;
    }
  }
  </style>
  </head>
  <body>
  <div class="print-preview-actions no-print">
    <button class="btn btn-print" onclick="window.print()">🖨️ Print</button>
    <button class="btn btn-close" onclick="window.close()">✖ Close</button>
  </div>
  <div class="container">
  <table>
  <tr>
  <td colspan="2" style="text-align: center; font-size: 26px; font-weight: 300;">Proforma Invoice</td>
  </tr>
  <tr>
  <td style="width:50%;padding: 0px;" class="text-blue">
    <table style="width:100%; border-collapse:collapse;">
      <tr>
        <td class="center no-border">
          <img src="${headerDetails.CompanyLogo}" style="height:60px" alt="Company Logo">
        </td>
      </tr>
      <tr>
        <td class="bold no-border">${headerDetails.companyName}</td>
      </tr>
      <tr>
        <td class="no-border">${headerDetails.companyAddress}</td>
      </tr>
      <tr>
        <td class="no-border">${headerDetails.companyPhone}</td>
      </tr>
      <tr>
        <td class="no-border">${headerDetails.companyEmail}</td>
      </tr>
    </table>
  </td>
  <td style="width:50%;">
    <table style="width:100%; border-collapse:collapse;">
      <tr>
        <td colspan="2" class="bg-blue title">Proforma Invoice</td>
      </tr>
      <tr>
        <td class="bg-blue">Quotation No.</td>
        <td class="bg-blue">DATE</td>
      </tr>
      <tr>
        <td>${headerDetails.quotationNo}</td>
        <td>${headerDetails.createdDate}</td>
      </tr>
      <tr>
        <td class="bg-blue">CLIENT ID</td>
        <td class="bg-blue">TERMS</td>
      </tr>
      <tr>
        <td>${headerDetails.clientId}</td>
        <td>As per Agreement</td>
      </tr>
    </table>
  </td>
  </tr>
  </table>
  <table class="mt-10">
    <tr>
      <td colspan="2" class="bg-blue">BILL TO</td>
    </tr>
    <tr>
      <td class="bold" style="width:50%;">Name / Department</td>
      <td>${headerDetails.nameDepartment}</td>
    </tr>
    <tr>
      <td class="bold" style="width:50%;">Company Name</td>
      <td>${headerDetails.billtocompanyName}</td>
    </tr>
    <tr>
      <td class="bold" style="width:50%;">Address</td>
      <td>${headerDetails.address}</td>
    </tr>
    <tr>
      <td class="bold" style="width:50%;">Email Address</td>
      <td>${headerDetails.customerEmail}</td>
    </tr>
  </table>
  <table class="mt-10">
    <thead>
      <tr class="bg-blue center">
        <td style="width:50%;">DESCRIPTION</td>
        <td>Quantity</td>
        <td>Unit Amount</td>
        <td>Total</td>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
    </tbody>
  </table>
  </div>
  </body>
  </html>
  `;
  }

  private openPrintPreviewDialog(content: string): void {
    const printWindow = window.open('', '_blank', 'width=900,height=700,scrollbars=yes,resizable=yes');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(content);
      printWindow.document.close();
      printWindow.focus();
    } 
  }


  
  onPageChange(newPage: number) {
    this.pageNo = newPage;
    this.getViewData(true);
  }

  onPageSizeChange(newSize: number) {
    this.pageSize = newSize;
    this.pageNo = 1;
    this.getViewData(true);
  }

  onSearchChange(search: string) {
    this.searchText = search;
    this.pageNo = 1;
    this.getViewData(false);
  }

  isEditMode(): boolean {
    return this.postType === 'add' || this.postType === 'update';
  }

  isViewMode(): boolean {
    return this.postType === 'view';
  }

  getRecordHeaderColspan(): number {
    return (this.recordHeaderViewData?.length || 0) + 1;
  }
}
