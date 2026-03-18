import { Component, ChangeDetectorRef, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { TableTemplate, TableColumn } from '../../table-template/table-template';
import { ButtonModule } from 'primeng/button';
import { Popover } from 'primeng/popover';
import { Tooltip } from "primeng/tooltip";
import { Dialog } from 'primeng/dialog';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CardModule } from 'primeng/card';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Toast } from 'primeng/toast';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { SkeletonModule } from 'primeng/skeleton';
import { MultiSelectModule } from 'primeng/multiselect';
import { DatePickerModule } from 'primeng/datepicker';
import { CheckboxModule } from 'primeng/checkbox';
import { UserService } from '../../shared/user-service';
import { ConfirmationService, MessageService } from 'primeng/api';

import { HttpErrorResponse } from '@angular/common/http';
import { ConfigService } from '../../shared/config.service';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DrawerModule } from 'primeng/drawer'; // Added DrawerModule



interface TabConfig {
  label: string;
  icon: string;
}

interface OrderItem {
  itemCodeId: number | null;
  unitId: number | null;
  quantity: number;
  rate: number;
  taxPercentage: number | null | any[];
  discountPercentage: number;
  tolrence: string;
  techSpecification: string;
  itemTotal?: number;
  taxAmount?: number;
  discountAmount?: number;
  itemId?: number;
  unitPrice?: number;
  taxTxt?: number;
  tolerance?: string;
  techSpec?: string;
  isFromQuote?: boolean;
}

interface TaxDetail {
  taxFor: string;
  natureId: number | null;
  taxId: number | null;
  amount: number;
  taxOptionId: string | null;
  discountPercentage: number;
  remarks: string;
  taxForTxt?: string;
  nature?: string;
  tax?: string;
  taxOption?: string;
}

interface OtherCharge {
  chargesTypeId: number | null;
  natureId: number | null;
  chargeValue: number;
  isBasic: boolean;
  remarks: string;
  chargeType?: string;
  nature?: string;
}

interface DiscountDetail {
  discountFor: string;
  natureId: number | null;
  value: number;
  remarks: string;
  discountForTxt?: string;
  nature?: string;
}

interface DropdownOption {
  drpValue: any;
  drpOption: string;
  taxRate?: number;
}

interface QuoteItem {
  id: number;
  priceList: string;
  priceListId: number;
  itemId: number;
  material: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  itemDetail: string;
  totalPrice: number;
  netPrice: number;
  unitId: number | null;
  unit: string | null;
  itemCodeId: number | null;
  make: string | null;
}

interface BreakdownItem {
  description: string;
  amount: number;
  type: 'item' | 'tax' | 'discount' | 'charge' | 'total';
}

@Component({
  selector: 'app-sales-order',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableTemplate,
    ButtonModule,
    Popover,
    Tooltip,
    Dialog,
    ConfirmDialog,
    SelectModule,
    InputTextModule,
    InputNumberModule,
    CardModule,
    ProgressSpinner,
    Toast,
    BreadcrumbModule,
    SkeletonModule,
    MultiSelectModule,
    DatePickerModule,
    CheckboxModule,

    TableModule,
    TagModule,
    DrawerModule // Added DrawerModule
  ],
  providers: [ConfirmationService, MessageService, DatePipe],
  templateUrl: './sales-order.html',
  styleUrls: ['./sales-order.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SalesOrder implements OnInit {



  basicInfoTabs: TabConfig[] = [
    { label: 'Order Items', icon: 'pi pi-shopping-bag' },
    { label: 'Additional Tax Details', icon: 'pi pi-percentage' },
    { label: 'Discount', icon: 'pi pi-tag' },
    { label: 'Other Charges', icon: 'pi pi-credit-card' }
  ];
  activeTab = 0;
  reviewTabs: TabConfig[] = [
    { label: 'Order Summary', icon: 'pi pi-list' }
  ];
  activeReviewTab = 0;
  salesOrderForm: FormGroup;


  visible = false;
  postType = '';
  header = '';
  headerIcon = 'pi pi-plus';
  isFormLoading = false;



  jsonDetailsVisible: boolean = false;
  selectedItemDetails: any = null;
  jsonSectionType: 'Order Item' | 'Tax Details' | 'Other Charges' | null = null;
  selectedQuotationText: string = '';
  selectedContractText: string = '';
  isFullScreen: boolean = false;




  isLoading = true;
  data: any[] = [];
  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true },
    { key: 'soNumber', header: 'SO Number', isVisible: true },
    { key: 'customerName', header: 'Customer', isVisible: true },
    { key: 'contactPerson', header: 'Contact Person', isVisible: true },
    { key: 'deliveryDate', header: 'Delivery Date', isVisible: true },
    { key: 'Customeraddress', header: 'Customer Address', isVisible: true },
    { key: 'customerName', header: 'customer Name', isVisible: true },
    { key: 'contract', header: 'Contract', isVisible: true },
    { key: 'quotation', header: 'Quotation', isVisible: true },
    { key: 'jsonDetails1', header: 'Order Details', isVisible: true, isSortable: false, isCustom: true },
    { key: 'jsonDetails2', header: 'Tax Details', isVisible: true, isSortable: false, isCustom: true },
    { key: 'jsonDetails3', header: 'Other Charges Details', isVisible: true, isSortable: false, isCustom: true },

  ];

  pageNo = 1;
  pageSize = 10;
  searchText = '';
  totalCount = 0;
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  searchTimeout: any;
  debounceTime = 500;

  customers: DropdownOption[] = [];
  customerAddresses: DropdownOption[] = [];
  warehouses: DropdownOption[] = [];
  quotations: DropdownOption[] = [];
  contracts: DropdownOption[] = [];
  Itemdetails: QuoteItem[] = [];
  salesCategories: DropdownOption[] = [];
  currencies: DropdownOption[] = [];
  orgAddresses: DropdownOption[] = [];
  items: DropdownOption[] = [];
  units: DropdownOption[] = [];
  taxOptions: DropdownOption[] = [];
  natureOptions: DropdownOption[] = [];
  taxes: DropdownOption[] = [];
  chargeTypes: DropdownOption[] = [];
  filteredCurrencies: DropdownOption[] = [];
  purchaseTaxDetails: DropdownOption[] = [];

  taxForOptions = [
    { drpValue: 'Item Wise', drpOption: 'Item Wise' },
    { drpValue: 'Order Wise', drpOption: 'Order Wise' }
  ];
  taxOptionDrp = [
    { drpValue: 'Inclusive', drpOption: 'Inclusive' },
    { drpValue: 'Exclusive', drpOption: 'Exclusive' }
  ];
  // Dynamic Arrays
  orderItems: OrderItem[] = [];
  additionalTaxArray: TaxDetail[] = [];
  discountArray: DiscountDetail[] = [];
  otherChargesArray: OtherCharge[] = [];
  // Breakdown Data
  breakdownItems: BreakdownItem[] = [];
  financialSummary: any = {
    subtotal: 0,
    totalDiscount: 0,
    totalTax: 0,
    totalCharges: 0,
    grandTotal: 0
  };

  salesOrderNumber: string = '';
  minDate: Date = new Date();
  selectedIndex: any;

  breadcrumbItems: any[] = [];
  home: any = { icon: 'pi pi-home', routerLink: '/' };

  param: string | null = null;
  FormName: any;
  FormValue: any;
  menulabel: any;

  isTaxItemWise: boolean = true;
  grTotal: number = 0;
  orderFinalArr: any[] = [];
  itemtaxwiseData: any[] = [];
  poEditmode: boolean = true;
  showTooltip: boolean = false;

  hasQuoteItems: boolean = false;
  isItemsFromQuote: boolean = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private message: MessageService,
    private cdr: ChangeDetectorRef,
    private configService: ConfigService,
    private datePipe: DatePipe,

  ) {
    this.salesOrderForm = this.createSalesOrderForm();
  }

  ngOnInit(): void {
    this.initializeComponent();
    this.loadDropdowns();
    this.getTableData(true);
  }

  getDrawerStyle(): any {
    if (this.isFullScreen) {
      return { width: '100vw' };
    }

    if (typeof window !== 'undefined') {
      if (window.innerWidth < 768) {
        return { width: '100vw' };
      } else if (window.innerWidth < 1024) {
        return { width: '80vw' };
      } else {
        return { width: '1300px', 'max-width': '90vw' };
      }
    }
    return { width: '1300px', 'max-width': '90vw' };
  }

  toggleFullScreen(): void {
    this.isFullScreen = !this.isFullScreen;
  }

  loadDropdowns(): void {
    const dropdownConfigs = [
      { key: 'customers', table: 'tblCustomerMasterHeader' },
      { key: 'warehouses', table: 'tblWarehouseMaster' },
      { key: 'salesCategories', table: 'tblpurchasecategory' },
      { key: 'items', table: 'tblmaterialmaster' },
      { key: 'units', table: 'tblUnitMaster' },
      { key: 'taxes', table: 'tblTaxSlabMaster' },
      { key: 'chargeTypes', table: 'tblChargesTypeMaster' },
      { key: 'orgAddresses', table: 'tblOrgMaster' },
      { key: 'natureOptions', table: 'tblNatureOfChargesMaster' },
      { key: 'purchaseTaxDetails', table: 'tblPurchaseTaxDetailsMaster' },
    ];
    dropdownConfigs.forEach(config => {
      this.userService.getQuestionPaper(`uspGetFillDrpDown|table=${config.table}`).subscribe({
        next: (res: any) => {
          (this as any)[config.key] = res?.table || [];
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          (this as any)[config.key] = [];
        }
      });
    });
    this.loadCustomerData();

    this.salesOrderForm.get('customerId')?.valueChanges.subscribe(customerId => {
      this.onCustomerChange(customerId);
      this.Quotationdata(customerId);
    });
    this.salesOrderForm.get('quotationId')?.valueChanges.subscribe(quotationId => {
      if (this.postType === 'add') {
        this.contractdata(quotationId);
        this.getitemdata(quotationId);
      }
    });

    this.salesOrderForm.get('salesCategoryId')?.valueChanges.subscribe(salesCategoryId => {
      this.onPurchaseCategoryChange(salesCategoryId);
    });
  }

  loadCustomerData(): void {
    try {
      const roleId = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
      const userId = sessionStorage.getItem('userId') || '';
      const districtId = sessionStorage.getItem('District') || '';

      this.userService.getQuestionPaper(
        `uspGetMasters|action=CUSTOMER|id=0|appUserId=${userId}|appUserRole=${roleId}|districtId=${districtId}`
      ).subscribe({
        next: (res: any) => {
          this.customers = res?.table || [];
          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => {
          this.customers = [];
        }
      });
    } catch (error) {
    }
  }

  loadNatureOptions(): void {
    this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblNatureOfChargesMaster`).subscribe({
      next: (res: any) => {
        this.natureOptions = res?.table || [];
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.natureOptions = [];
      }
    });
  }

  onCustomerChange(customerId: number): void {
    if (customerId) {
      this.userService.getQuestionPaper(`uspGetOpportunityDetails|action=CUSTOMERDETAILS|customerId=${customerId}`).subscribe({
        next: (res: any) => {
          this.customerAddresses = res?.table || [];
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          this.customerAddresses = [];
          this.cdr.detectChanges();
        }
      });
    } else {
      this.customerAddresses = [];
      this.quotations = [];
      this.contracts = [];
      this.Itemdetails = [];
      this.hasQuoteItems = false;
      this.salesOrderForm.patchValue({
        customerAddressId: null,
        quotationId: null,
        contractId: null
      });
      this.cdr.detectChanges();
    }

    this.orderItems = [];
    this.isItemsFromQuote = false;
    this.cdr.detectChanges();
  }

  Quotationdata(customerId: number): void {
    if (customerId) {
      const currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
      const roleId = currentRole?.roleId || '';
      const userId = sessionStorage.getItem('userId') || '';

      this.userService.getQuestionPaper(
        `uspGetQuotationData|action=ORDERQUOTATIONDRP|customerId=${customerId}|appUserId=${userId}|appUserRole=${roleId}`
      ).subscribe({
        next: (res: any) => {
          this.quotations = res?.table || [];
          if (!this.quotations.length) {
            this.contracts = [];
            this.Itemdetails = [];
            this.hasQuoteItems = false;
            this.salesOrderForm.patchValue({
              quotationId: null,
              contractId: null
            });
          }
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          this.quotations = [];
          this.contracts = [];
          this.Itemdetails = [];
          this.hasQuoteItems = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.customerAddresses = [];
      this.quotations = [];
      this.contracts = [];
      this.Itemdetails = [];
      this.hasQuoteItems = false;
      this.cdr.detectChanges();
    }
  }

  contractdata(quotationId: number): void {
    if (quotationId) {
      const currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
      const roleId = currentRole?.roleId || '';
      const userId = sessionStorage.getItem('userId') || '';

      this.userService.getQuestionPaper(
        `uspGetQuotationData|action=ORDERCONTRACTDRP|opportunityId=0|quotationId=${quotationId}|customerId=0|appUserId=${userId}|appUserRole=${roleId}`
      ).subscribe({
        next: (res: any) => {
          this.contracts = res?.table || [];
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          this.contracts = [];
          this.cdr.detectChanges();
        }
      });
    } else {
      this.contracts = [];
      this.salesOrderForm.patchValue({
        contractId: null
      });
      this.cdr.detectChanges();
    }
  }

  onPurchaseCategoryChange(salesCategoryId: number): void {
    if (salesCategoryId) {
      this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblCurrencyMaster|filterColumn=categoryId|filterValue=${salesCategoryId}`).subscribe({
        next: (res: any) => {
          this.filteredCurrencies = res?.table || [];
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          this.filteredCurrencies = [];
          this.cdr.detectChanges();
        }
      });
    } else {
      this.filteredCurrencies = [];
      this.salesOrderForm.patchValue({
        currencyId: null
      });
      this.cdr.detectChanges();
    }
  }

  setActiveReviewTab(index: number): void {
    this.activeReviewTab = index;
    if (index === 1) {

    }
    this.cdr.detectChanges();
  }

  getReviewTabClass(index: number): string {
    const baseClasses = 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center';
    if (index === this.activeReviewTab) {
      return `${baseClasses} border-blue-500 text-blue-600`;
    } else {
      return `${baseClasses} border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300`;
    }
  }

  getDropdownLabel(controlName: string, list: any[]): string {
    const selectedValue = this.salesOrderForm.get(controlName)?.value;
    const found = list?.find(item => item.drpValue === selectedValue);
    return found ? found.drpOption : '';
  }

  isTaxArray(item: OrderItem): boolean {
    return Array.isArray(item.taxPercentage);
  }

  getTaxArrayLength(item: OrderItem): number {
    return Array.isArray(item.taxPercentage) ? item.taxPercentage.length : 0;
  }

  formatTaxPercentage(item: OrderItem): string {
    if (!this.isTaxItemWise) {
      return this.getOrderWiseTaxDisplay();
    }
    if (Array.isArray(item.taxPercentage) && item.taxPercentage.length > 0) {
      const taxNames = item.taxPercentage.map((taxId: any) => {
        const tax = this.additionalTaxArray.find(t => t.taxId === taxId);
        return tax ? tax.tax : `Tax ${taxId}`;
      });
      return taxNames.join(', ');
    }
    if (item.taxPercentage && typeof item.taxPercentage === 'number') {
      const tax = this.taxOptions.find(t => t.drpValue === item.taxPercentage);
      return tax ? tax.drpOption : item.taxPercentage.toString();
    }
    return '0';
  }

  hasTaxItems(item: OrderItem): boolean {
    return Array.isArray(item.taxPercentage) && item.taxPercentage.length > 0;
  }

  getOrderWiseTaxDisplay(): string {
    if (this.additionalTaxArray.length === 0) {
      return 'No Tax Applied';
    }
    return this.additionalTaxArray.map(tax => tax.tax).join(', ');
  }

  private initializeComponent(): void {
    this.param = sessionStorage.getItem("menuItem");
    if (this.param) {
      let paramjs = JSON.parse(this.param);
      this.FormName = paramjs.formName;
      this.FormValue = paramjs.formValue;
      this.menulabel = paramjs.menu;
    }

    this.breadcrumbItems = [
      { label: this.menulabel },
      { label: this.FormName, routerLink: this.FormValue }
    ];

    this.cdr.detectChanges();
  }

  private createSalesOrderForm(): FormGroup {
    return this.fb.group({
      id: [0],
      customerId: [null, [Validators.required]],
      customerAddressId: [null, [Validators.required]],
      contactPerson: ['', [Validators.required, Validators.minLength(2)]],
      contactMobile: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      warehouseId: [null, [Validators.required]],
      deliveryDate: [null, [Validators.required]],
      quotationId: [null, [Validators.required]],
      contractId: [null, [Validators.required]],
      salesCategoryId: [null, [Validators.required]],
      currencyId: [null, [Validators.required]],
      orgAddress: [null, [Validators.required]],
      attachFile: [''],

    });
  }



  // Tab Methods
  setActiveTab(index: number): void {
    this.activeTab = index;
    this.cdr.detectChanges();
  }

  getTabClass(index: number): string {
    const baseClasses = 'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center';
    if (index === this.activeTab) {
      return `${baseClasses} border-blue-500 text-blue-600`;
    } else {
      return `${baseClasses} border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300`;
    }
  }

  // nextStep(): void {
  //   if (this.validateCurrentStep()) {
  //     if (this.currentStep < this.wizardSteps.length - 1) {
  //       this.wizardSteps[this.currentStep].completed = true;
  //       this.currentStep++;
  //       this.cdr.detectChanges();
  //     }
  //   }
  // }



  // Tax Integration Methods
  getAvailableTaxes(): DropdownOption[] {
    if (this.isTaxItemWise && this.additionalTaxArray.length > 0) {
      return this.additionalTaxArray.map(tax => ({
        drpValue: tax.taxId,
        drpOption: `${tax.tax || 'Tax'} (${tax.taxOption || 'N/A'}) - ${tax.amount}(Amount)`,
        taxRate: this.getTaxRateFromOption(tax.taxOption)
      }));
    }
    return this.taxOptions;
  }

  private getTaxRateFromOption(taxOption: string | undefined): number {
    if (!taxOption) return 0;

    const match = taxOption.match(/(\d+(\.\d+)?)%/);
    return match ? parseFloat(match[1]) : 0;
  }

  getSelectedTaxesText(item: OrderItem): string {
    if (!item.taxPercentage || !Array.isArray(item.taxPercentage)) return '';

    return item.taxPercentage.map(taxId => {
      const tax = this.additionalTaxArray.find(t => t.taxId === taxId);
      return tax ? (tax.tax || 'Unknown Tax') : 'Unknown Tax';
    }).join(', ');

  }

  onTaxDrpChange(selectedTaxIds: any[], item: OrderItem, isDelete?: string): void {
    if (selectedTaxIds && selectedTaxIds.length > 0) {
      const selectedTaxData = this.additionalTaxArray.filter(e => selectedTaxIds.includes(e.taxId));
      let totalDiscountPercentage = 0;
      selectedTaxData.forEach(tax => {
        totalDiscountPercentage += parseFloat(tax.discountPercentage?.toString() || '0');
      });

      item.discountPercentage = totalDiscountPercentage;
      item.taxPercentage = selectedTaxIds;
    } else {
      item.discountPercentage = 0;
      item.taxPercentage = null;
    }
  }

  getitemdata(quotationId: number): void {
    if (quotationId) {
      const currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
      const roleId = currentRole?.roleId || '';

      this.userService.getQuestionPaper(
        `uspGetMasters|action=QUOTEITEM|id=${quotationId}|districtId=${sessionStorage.getItem('District')}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${roleId}`
      ).subscribe({
        next: (res: any) => {
          this.Itemdetails = res?.table || [];

          if (res?.table1) {
            this.additionalTaxArray = res.table1.map((t: any) => ({
              taxFor: t.taxFor,
              natureId: t.natureId,
              taxId: t.taxId,
              amount: t.amount || 0,
              taxOptionId: t.taxOptionId,
              discountPercentage: 0, // taxvalue (18.0) is likely rate, not discount. No discount field in JSON.
              remarks: t.remarks || '',
              taxForTxt: t.taxFor,
              nature: t.nature,
              tax: t.tax,
              taxOption: t.taxOptionId
            }));
          } else {
            this.additionalTaxArray = [];
          }

          if (res?.table2) {
            this.discountArray = res.table2.map((d: any) => ({
              discountFor: d.discountFor,
              natureId: d.natureId,
              value: d.value || d.discount || 0,
              remarks: d.remarks || '',
              discountForTxt: d.discountFor,
              nature: d.nature,
              optionId: d.optionId,
              discount: d.discount
            }));
          } else {
            this.discountArray = [];
          }

          if (res?.table3) {
            this.otherChargesArray = res.table3.map((c: any) => ({
              chargesTypeId: c.chargesTypeId,
              natureId: c.natureId,
              chargeValue: c.chargeValue,
              isBasic: c.isBasic,
              remarks: c.remarks || '',
              chargeType: c.chargesType,
              nature: c.nature
            }));
          } else {
            this.otherChargesArray = [];
          }

          this.hasQuoteItems = this.Itemdetails.length > 0;
          this.populateOrderItemsFromQuote();

          if (this.additionalTaxArray.length > 0) {
            const first = this.additionalTaxArray[0];
            const taxIds = this.additionalTaxArray.map(t => t.taxId);

            // Apply taxes to items regardless of whether it is Order Wise or Item Wise
            // When coming from a Quote, if taxes are present, we apply them to the items.
            if (first.taxFor === 'Order Wise') {
              this.isTaxItemWise = false;
              const totalDiscount = this.additionalTaxArray.reduce((sum, t) => sum + (t.discountPercentage || 0), 0);

              this.orderItems.forEach(item => {
                item.taxPercentage = taxIds;
                item.discountPercentage = totalDiscount;
              });
            } else {
              this.isTaxItemWise = true;
              // For Item Wise, we also apply the taxes found in the quote to the items
              this.orderItems.forEach(item => {
                item.taxPercentage = taxIds;
              });
            }
          }

          this.cdr.detectChanges();
        },
        error: (err: any) => {
          this.Itemdetails = [];
          this.hasQuoteItems = false;
          this.message.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load quote items'
          });
          this.cdr.detectChanges();
        }
      });
    } else {
      this.Itemdetails = [];
      this.additionalTaxArray = [];
      this.otherChargesArray = [];
      this.hasQuoteItems = false;
    }
  }

  private populateOrderItemsFromQuote(): void {
    this.orderItems = [];
    this.Itemdetails.forEach((quoteItem: QuoteItem) => {
      const orderItem: OrderItem = {
        itemCodeId: quoteItem.itemId || null,
        unitId: quoteItem.unitId || null,
        quantity: quoteItem.quantity || 1,
        rate: quoteItem.unitPrice || 0,
        taxPercentage: null,
        discountPercentage: 0,
        tolrence: '0',
        techSpecification: quoteItem.itemDetail || '',
        itemTotal: 0,
        taxAmount: 0,
        discountAmount: 0,
        isFromQuote: true
      };
      this.orderItems.push(orderItem);
    });

    this.isItemsFromQuote = true;
    this.setActiveTab(0);
    this.cdr.detectChanges();
  }



  getItemOptions(): DropdownOption[] {
    if (this.Itemdetails.length > 0) {
      return this.Itemdetails.map(quoteItem => ({
        drpValue: quoteItem.itemId,
        drpOption: quoteItem.material || `Item ${quoteItem.itemId}`,
        taxRate: 0
      }));
    }
    return this.items;
  }

  getUnitOptions(): DropdownOption[] {
    return this.units;
  }

  isItemDisabled(item: OrderItem): boolean {
    return item.isFromQuote || this.postType === 'view';
  }

  isUnitDisabled(item: OrderItem): boolean {
    return item.isFromQuote || this.postType === 'view';
  }

  isQuantityDisabled(item: OrderItem): boolean {
    return item.isFromQuote || this.postType === 'view';
  }

  isRateDisabled(item: OrderItem): boolean {
    return item.isFromQuote || this.postType === 'view';
  }

  getTotalAmount(): number {
    if (!this.orderItems || this.orderItems.length === 0) {
      return 0;
    }

    return this.orderItems.reduce((total, item) => {
      const rate = item.rate || 0;
      const quantity = item.quantity || 0;
      return total + (rate * quantity);
    }, 0);
  }

  getTotalQuantity(): number {
    return this.orderItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  }

  getItemsAmount(): number {
    return this.orderItems.reduce((sum, item) => sum + (item.quantity || 0) * (item.rate || 0), 0);
  }

  getTotalCharges(): number {
    return this.otherChargesArray.reduce((sum, charge) => sum + (charge.chargeValue || 0), 0);
  }

  getSelectedCustomerName(): string {
    const customerId = this.salesOrderForm.get('customerId')?.value;
    const customer = this.customers.find(c => c.drpValue === customerId);
    return customer ? customer.drpOption : 'Not selected';
  }

  getItemName(itemCodeId: number | null): string {
    if (!itemCodeId) return 'Not selected';

    const quoteItem = this.Itemdetails.find(item => item.itemId === itemCodeId);
    if (quoteItem) {
      return quoteItem.material || `Item ${itemCodeId}`;
    }

    const item = this.items.find(i => i.drpValue === itemCodeId);
    return item ? item.drpOption : 'Unknown Item';
  }

  getUnitName(unitId: number | null): string {
    if (!unitId) return '';
    const unit = this.units.find(u => u.drpValue === unitId);
    return unit ? unit.drpOption : '';
  }



  updateTrColumnValue(): void {
    if (this.orderItems.some(e => !e.quantity || e.quantity === 0)) {
      return;
    }
    if (this.orderItems.some(e => !e.rate || e.rate < 0)) {
      return;
    }
    this.poEditmode = false;
    this.getGrandTotalForItem();
  }

  getGrandTotalForItem(): void {
    this.grTotal = 0;
    this.orderFinalArr = [];
    this.itemtaxwiseData = [];
    this.generateDataFromDetails();

    const query = `tblSoDetails=${JSON.stringify(this.orderFinalArr)}|tblSoTaxDetails=${JSON.stringify(this.additionalTaxArray)}|tblSoOtherCharges=${JSON.stringify(this.otherChargesArray)}|tblItems=${JSON.stringify(this.itemtaxwiseData)}`;

    this.userService.SubmitPostTypeData('uspGetSOItemsGrandTotal', query, this.FormName).subscribe({
      next: (response: any) => {
        if (response) {
          const resultArray = response.split("-");
          if (resultArray[0] == "2") {
            if (resultArray[1] == 'GST not matched. Please check and try again!') {
              this.message.add({
                severity: 'error',
                summary: 'Validation Error',
                detail: resultArray[1]
              });
              this.orderFinalArr = [];
              this.itemtaxwiseData = [];
              this.poEditmode = true;
              return;
            }
            this.grTotal = Number(resultArray[1]);
            this.poEditmode = false;
          }
        }
      },
      error: (err: HttpErrorResponse) => {
        this.poEditmode = false;
        this.message.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to calculate grand total'
        });
      }
    });
  }

  generateDataFromDetails(): void {
    try {
      if (this.orderItems.length > 0) {
        this.orderItems.forEach((item, i) => {
          const Probj = {
            id: 0,
            itemId: item.itemId || 0,
            itemCodeId: item.itemCodeId || 0,
            quantity: item.quantity,
            unitPrice: item.rate,
            techSpec: item.techSpecification || '',
            tolerance: item.tolrence || '',
            taxPercentage: item.taxPercentage ? (Array.isArray(item.taxPercentage) ? item.taxPercentage.join(',') : item.taxPercentage.toString()) : '',
            taxIncluded: 0,
          };
          this.orderFinalArr.push(Probj);

          if (this.additionalTaxArray.length > 0 && item.taxPercentage) {
            const taxIds = Array.isArray(item.taxPercentage) ? item.taxPercentage : [item.taxPercentage];
            taxIds.forEach(taxId => {
              const record = this.additionalTaxArray.find(e => e.taxId == taxId);
              if (record) {
                const obj = {
                  itemId: item.itemId || 0,
                  taxId: taxId.toString(),
                  amount: record.amount || '0',
                  natureId: this.additionalTaxArray[0].natureId || '',
                  itemCodeId: item.itemCodeId || 0
                };
                this.itemtaxwiseData.push(obj);
              }
            });
          }
        });
      }
    } catch (error) {
    }
  }

  // Form Validation
  isInvalid(field: string): boolean {
    const control = this.salesOrderForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  // File Upload Methods
  onFileSelected(event: Event, controlName: string, folderName: string): void {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    input.value = '';
    if (!files.length) {
      return;
    }
    this.userService.MastrtfileuploadNew(files, folderName).subscribe({
      next: (response: any) => {
        const result = String(response || '').split('-');
        if (result[0] === '1') {
          this.salesOrderForm.patchValue({ [controlName]: result[1].toString() });
          this.message.add({
            severity: 'success',
            summary: 'Success',
            detail: 'File uploaded successfully!'
          });
        } else {
          this.message.add({
            severity: 'error',
            summary: 'Error',
            detail: result[1] || 'Upload failed'
          });
        }
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.message.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to upload file. Please try again.'
        });
        this.cdr.detectChanges();
      }
    });
  }

  removeUploadedFile(controlName: string): void {
    this.salesOrderForm.patchValue({ [controlName]: '' });
  }

  viewAttachment(url: string): void {
    if (url) {
      window.open(`https://elocker.nobilitasinfotech.com/${url}`, '_blank');
    } else {
      this.message.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'File not Exist!'
      });
    }
  }

  showDrawer(view: string, data: any = null): void {
    this.isFormLoading = true;
    this.activeTab = 0;
    this.activeReviewTab = 0;
    if (view === 'add') {
      this.initializeAddMode();
    } else {
      this.initializeEditViewMode(view, data);
    }
  }

  private initializeAddMode(): void {
    this.visible = true;
    this.postType = 'add';
    this.header = 'Add ' + this.FormName;
    this.headerIcon = 'pi pi-plus';
    this.salesOrderForm.reset({ id: 0 });
    this.salesOrderForm.enable();

    this.orderItems = [];
    this.additionalTaxArray = [];
    this.otherChargesArray = [];
    this.breakdownItems = [];
    this.Itemdetails = [];
    this.hasQuoteItems = false;
    this.isItemsFromQuote = false;
    this.isFormLoading = false;
    this.cdr.detectChanges();
  }



  private initializeEditViewMode(view: string, data: any): void {
    this.visible = true;
    this.postType = view;
    this.header = view === 'update' ? 'Update ' + this.FormName : 'View ' + this.FormName;
    this.headerIcon = view === 'update' ? 'pi pi-pencil' : 'pi pi-eye';
    this.selectedIndex = data;
    if (view === 'view') {
      this.salesOrderForm.disable();
    }
    this.loadSalesOrderData(data);
  }


  private parseDateString(dateString: string): Date {
    if (!dateString) return new Date();

    try {
      if (dateString.includes('T')) {
        const [year, month, day] = dateString.split('T')[0].split('-').map(Number);
        return new Date(year, month - 1, day);
      }
      return new Date(dateString);
    } catch (error) {
      console.error('Error parsing date:', error);
      return new Date();
    }
  }

  private loadSalesOrderData(data: any): void {
    const deliveryDate = data.deliveryDate ? new Date(data.deliveryDate) : null;

    this.selectedQuotationText = data.quotation || '';
    this.selectedContractText = data.contract || '';
    this.salesOrderForm.patchValue({
      id: data.id || 0,
      customerId: data.customerId || null,
      customerAddressId: data.customerAddressId || null,
      contactPerson: data.contactPerson || '',
      contactMobile: data.contactMobile || '',
      warehouseId: data.warehouseId || null,
      quotationId: data.quotationId || null,
      contractId: data.contractId || null,
      salesCategoryId: data.salesCategoryId || null,
      currencyId: data.currencyId || null,
      orgAddress: data.orgAddressId || null,
      attachFile: data.attachFile || null,
      deliveryDate: deliveryDate


    });
    setTimeout(() => {
      this.salesOrderForm.get('deliveryDate')?.setValue(deliveryDate);
      this.cdr.detectChanges();
    }, 0);



    this.loadOrderItems(data);
    this.loadTaxDetails(data);
    this.loadDiscountDetails(data);
    this.loadOtherCharges(data);

    this.isFormLoading = false;
  }


  private loadOrderItems(data: any): void {
    this.orderItems = [];

    if (data.soDetails) {
      try {
        let soDetailsArray: any[] = [];
        if (typeof data.soDetails === 'string') {
          soDetailsArray = JSON.parse(data.soDetails);
        } else if (Array.isArray(data.soDetails)) {
          soDetailsArray = data.soDetails;
        }

        this.orderItems = soDetailsArray.map((item: any, index: number) => {

          let taxPercentage: any = null;
          if (item.taxPercentage) {
            if (typeof item.taxPercentage === 'string') {
              if (item.taxPercentage.includes(',')) {
                taxPercentage = item.taxPercentage.split(',').map((t: string) => Number(t.trim())).filter(Boolean);
              } else {
                taxPercentage = Number(item.taxPercentage);
              }
            } else if (Array.isArray(item.taxPercentage)) {
              taxPercentage = item.taxPercentage;
            } else {
              taxPercentage = Number(item.taxPercentage);
            }
          }

          return {
            itemCodeId: item.itemCode || item.id || null,
            unitId: item.unitId || null,
            quantity: Number(item.quantity) || 0,
            rate: Number(item.unitPrice) || 0,
            taxPercentage: taxPercentage,
            discountPercentage: item.discountPercentage || 0,
            tolrence: item.tolerance || item.tolrence || '',
            techSpecification: item.techSpec || item.techSpecification || '',
            itemTotal: 0,
            taxAmount: 0,
            discountAmount: 0,
            isFromQuote: !!data.quotationId,
            itemId: item.itemCodeId || item.id || index
          };
        });

      } catch (e) {
        this.orderItems = [];
      }
    }
  }

  private loadTaxDetails(data: any): void {
    this.additionalTaxArray = [];

    if (data.taxDetails) {
      try {
        let taxDetailsArray: any[] = [];
        if (typeof data.taxDetails === 'string') {
          taxDetailsArray = JSON.parse(data.taxDetails);
        } else if (Array.isArray(data.taxDetails)) {
          taxDetailsArray = data.taxDetails;
        }

        this.additionalTaxArray = taxDetailsArray.map((tax: any) => ({
          taxFor: tax.taxFor || 'Order Wise',
          taxForTxt: tax.taxFor || 'Order Wise',
          natureId: tax.natureId || null,
          nature: tax.nature || '',
          taxId: tax.taxId || null,
          tax: tax.tax || '',
          amount: Number(tax.amount || tax.Taxvalue || 0),
          taxOptionId: tax.taxOptionId || 'Inclusive',
          taxOption: tax.taxOptionId === 'Inclusive' ? 'Inclusive' : 'Exclusive',
          discountPercentage: Number(tax.discountPercentage || 0),
          remarks: tax.remarks || ''
        }));

        if (this.additionalTaxArray.length > 0) {
          this.isTaxItemWise = this.additionalTaxArray[0].taxFor !== 'Order Wise';
        }

      } catch (e) {
        this.additionalTaxArray = [];
      }
    }
  }

  private loadDiscountDetails(data: any): void {
    this.discountArray = [];

    if (data.discountDetails) {
      try {
        let discountArray: any[] = [];
        if (typeof data.discountDetails === 'string') {
          discountArray = JSON.parse(data.discountDetails);
        } else if (Array.isArray(data.discountDetails)) {
          discountArray = data.discountDetails;
        }

        this.discountArray = discountArray.map((d: any) => ({
          discountFor: d.discountFor,
          natureId: d.natureId,
          value: d.value || 0,
          remarks: d.remarks || '',
          discountForTxt: d.discountFor, // Assuming text is same or included
          nature: d.nature
        }));

      } catch (e) {
        this.discountArray = [];
      }
    }
  }

  private loadOtherCharges(data: any): void {
    this.otherChargesArray = [];

    if (data.otherChargeDetails) {
      try {
        let chargeArray: any[] = [];
        if (typeof data.otherChargeDetails === 'string') {
          chargeArray = JSON.parse(data.otherChargeDetails);
        } else if (Array.isArray(data.otherChargeDetails)) {
          chargeArray = data.otherChargeDetails;
        }

        this.otherChargesArray = chargeArray.map((charge: any) => ({
          chargesTypeId: charge.chargesTypeId || null,
          chargeType: charge.chargesType || '',
          natureId: charge.natureId || null,
          nature: charge.nature || '',
          chargeValue: Number(charge.chargeValue || 0),
          isBasic: charge.isBasic === true || charge.isBasic === 'true',
          remarks: charge.remarks || ''
        }));

      } catch (e) {
        this.otherChargesArray = [];
      }
    }
  }

  onSubmit(event: Event): void {
    if (this.salesOrderForm.invalid) {
      this.salesOrderForm.markAllAsTouched();
      this.message.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields.'
      });
      return;
    }

    this.confirmationService.confirm({
      key: 'salesOrderConfirm',
      message: 'Are you sure you want to submit this order?',
      header: 'Confirm Submission',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        this.submitSalesOrder();
      },
      reject: () => {
        // User rejected
        this.message.add({
          severity: 'error',
          summary: 'Submission Cancelled',
          detail: 'Order submission cancelled.'
        });
      }
    });
  }

  private submitSalesOrder(): void {
    this.isFormLoading = true;
    const formData = this.salesOrderForm.getRawValue();
    const orderItemsForSubmission = this.orderItems.map(item => ({
      itemCodeId: item.itemCodeId ? this.Itemdetails.find(q => q.itemId === item.itemCodeId || q.itemCodeId === item.itemCodeId)?.itemCodeId || item.itemCodeId : item.itemCodeId,
      unitId: item.unitId,
      taxPercentage: item.taxPercentage ? (Array.isArray(item.taxPercentage) ? item.taxPercentage.join(',') : item.taxPercentage.toString()) : '',
      unitPrice: item.rate,
      quantity: item.quantity,
      discountPercentage: item.discountPercentage,
      tolrence: item.tolrence,
      techSpecification: item.techSpecification,
    }));
    const soDetailJson = JSON.stringify(orderItemsForSubmission);
    const soOtherChargeJson = JSON.stringify(this.otherChargesArray);
    const soTaxDetailJson = JSON.stringify(this.additionalTaxArray);
    const discountJson = JSON.stringify(this.discountArray);
    const currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
    const roleId = currentRole?.roleId || '';
    const userId = sessionStorage.getItem('userId') || '';
    const districtId = sessionStorage.getItem('District') || '';
    let query = `customerId=${formData.customerId}`;
    query += `|customerAddressId=${formData.customerAddressId}`;
    query += `|contactPerson=${encodeURIComponent(formData.contactPerson)}`;
    query += `|ContactMobile=${formData.contactMobile}`;
    query += `|warehouseId=${formData.warehouseId}`;
    query += `|deliveryDate=${this.formatDate(formData.deliveryDate)}`;
    query += `|quotationId=${formData.quotationId || 0}`;
    query += `|contractId=${formData.contractId || 0}`;
    query += `|attachFile=${formData.attachFile || ''}`;
    query += `|salesCategoryId=${formData.salesCategoryId || 0}`;
    query += `|currencyId=${formData.currencyId || 0}`;
    query += `|orgAddress=${formData.orgAddress || 0}`;
    query += `|soDetailJson=${(soDetailJson)}`;
    query += `|soOtherChargeJson=${(soOtherChargeJson)}`;
    query += `|soTaxDetailJson=${(soTaxDetailJson)}`;
    query += `|discountJson=${(discountJson)}`;
    query += `|districtId=${districtId}`;
    query += `|appUserId=${userId}`;
    query += `|appUserRole=${roleId}`;
    const storedProcedure = this.postType === 'update' ? 'uspUpdateSalesOrder' : 'uspPostSalesOrder';
    this.userService.SubmitPostTypeData(storedProcedure, query, 'header').subscribe({
      next: (response: any) => {
        this.isFormLoading = false;
        this.handleSubmitResponse(response);
      },
      error: (error: any) => {
        this.isFormLoading = false;
        this.message.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to submit sales order. Please try again.'
        });
        this.cdr.detectChanges();
      }
    });
  }

  private formatDate(date: Date): string {
    if (!date) return '';
    return this.datePipe.transform(date, 'yyyy-MM-dd') || '';
  }

  private handleSubmitResponse(response: any): void {
    if (response && typeof response === 'string') {
      const resultArray = response.split('-');
      if (resultArray[1] === 'success') {
        this.message.add({
          severity: 'success',
          summary: 'Success',
          detail: this.postType === 'update'
            ? 'Sales Order updated successfully!'
            : 'Sales Order created successfully!'
        });
        this.onDrawerHide();
        this.getTableData(false);
      } else {
        this.message.add({
          severity: 'warn',
          summary: 'Warning',
          detail: resultArray[1] || response
        });
      }
    } else {
      this.message.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Sales Order processed successfully!'
      });
      this.onDrawerHide();
      this.getTableData(false);
    }
  }

  getTableData(isTrue: boolean): void {
    if (isTrue) {
      this.isLoading = true;
      this.cdr.detectChanges();
    } else {
      this.pageNo = 1;
    }
    const currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
    const roleId = currentRole?.roleId || '';
    const userId = sessionStorage.getItem('userId') || '';
    const districtId = sessionStorage.getItem('District') || '';

    let query = `appUserId=${userId}|appUserRole=${roleId}|districtId=${districtId}|pageIndex=${this.pageNo}|size=${this.pageSize}|searchText=${this.searchText}`;

    this.userService.getQuestionPaper(`uspGetSalesOrder|${query}`).subscribe({
      next: (res: any) => {
        try {
          this.data = res?.table1 || [];
          this.data = this.data.map(item => ({
            ...item,
            id: item.id || item.soHeaderId,
            soNumber: item.soNumber || item.text || '',
            customerName: item.customerName || item.customer || '',
            contactPerson: item.contactPerson || '',
            deliveryDate: item.deliveryDate || '',
            Customeraddress: item.customerAddress || '',
            customerId: item.customerId,
            customerAddressId: item.customerAddressId,
            contactMobile: item.contactMobile || '',
            warehouseId: item.warehouseId,
            warehouse: item.warehouse || '',
            quoteId: item.quoteId || '',
            salesCategoryId: item.salesCategoryId,
            salesCategory: item.salesCategory || '',
            currencyId: item.currencyId,
            currency: item.currency || '',
            orgAddressId: item.orgAddressId,
            orgAddress: item.orgAddress || '',
            officeAddress: item.officeAddress || '',
            attachFile: item.attachFile || '',
            soDetails: item.soDetails ? (typeof item.soDetails === 'string' ? JSON.parse(item.soDetails) : item.soDetails) : [],
            taxDetails: item.taxDetails ? (typeof item.taxDetails === 'string' ? JSON.parse(item.taxDetails) : item.taxDetails) : [],
            discountDetails: item.discountDetails ? (typeof item.discountDetails === 'string' ? JSON.parse(item.discountDetails) : item.discountDetails) : [],
            otherChargeDetails: item.otherChargeDetails ? (typeof item.otherChargeDetails === 'string' ? JSON.parse(item.otherChargeDetails) : item.otherChargeDetails) : []
          }));

          this.totalCount = res?.table?.[0]?.totalCnt ||
            res?.table1?.[0]?.totalCount ||
            this.data.length;

        } catch (innerErr) {
          this.data = [];
          this.totalCount = 0;
          this.message.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to process sales order data.'
          });
        } finally {
          setTimeout(() => {
            this.isLoading = false;
            this.cdr.detectChanges();
          }, 1000);
        }
      },
      error: (err: any) => {
        this.message.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load sales orders.'
        });
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSearchChange(search: string): void {
    this.searchText = search;
    this.pageNo = 1;

    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      this.getTableData(false);
    }, this.debounceTime);

    this.cdr.markForCheck();
  }

  onPageChange(newPage: number): void {
    this.pageNo = newPage;
    this.getTableData(true);
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize = newSize;
    this.pageNo = 1;
    this.getTableData(true);
  }

  orderDetails(item: any) {
    try {
      this.selectedItemDetails = {
        makeDetails: Array.isArray(item.soDetails) ? item.soDetails : []
      };
      this.jsonSectionType = 'Order Item';
      this.jsonDetailsVisible = true;
      this.cdr.detectChanges();
    } catch (error) {
      this.message.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load order details'
      });
    }
  }

  taxDetailsdata(item: any) {
    try {
      this.selectedItemDetails = {
        companyDetails: Array.isArray(item.taxDetails) ? item.taxDetails : []
      };
      this.jsonSectionType = 'Tax Details';
      this.jsonDetailsVisible = true;
      this.cdr.detectChanges();
    } catch (error) {
      this.message.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load tax details'
      });
    }
  }
  resetForm() {
    this.salesOrderForm.reset();
    this.cdr.detectChanges();
  }

  otherchargeDetails(item: any) {
    try {
      this.selectedItemDetails = {
        taxDetails: Array.isArray(item.otherChargeDetails) ? item.otherChargeDetails : []
      };
      this.jsonSectionType = 'Other Charges';
      this.jsonDetailsVisible = true;
      this.cdr.detectChanges();
    } catch (error) {
      this.message.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to load other charge details'
      });
    }
  }

  closeJsonDetails() {
    this.jsonDetailsVisible = false;
    this.selectedItemDetails = null;
    this.jsonSectionType = null;
    this.cdr.detectChanges();
  }

  onSortChange(event: { column: string, direction: 'asc' | 'desc' }): void {
    this.sortColumn = event.column;
    this.sortDirection = event.direction;
    this.getTableData(true);
  }



  onDrawerHide(): void {
    this.visible = false;
    this.activeTab = 0;
    this.activeReviewTab = 0;
    this.breakdownItems = [];
    this.salesOrderForm.reset({ id: 0 });
    this.salesOrderForm.enable();
    this.orderItems = [];
    this.additionalTaxArray = [];
    this.discountArray = [];
    this.otherChargesArray = [];
    this.Itemdetails = [];
    this.hasQuoteItems = false;
    this.isItemsFromQuote = false;
    this.cdr.detectChanges();
  }

  clearForm(): void {
    this.salesOrderForm.reset({ id: 0 });
    this.orderItems = [];
    this.additionalTaxArray = [];
    this.discountArray = [];
    this.otherChargesArray = [];
    this.breakdownItems = [];
    this.Itemdetails = [];
    this.hasQuoteItems = false;
    this.isItemsFromQuote = false;
    this.activeTab = 0;
    this.activeReviewTab = 0;
  }

  trackByIndex(index: number): number {
    return index;
  }

  get f() {
    return this.salesOrderForm.controls;
  }


  isPrintLoading = false;



  openAlertDialog(summary: string, detail: string) {
    const sev = /error|alert/i.test(summary) ? 'error' : 'success';
    this.message.add({ severity: sev, summary, detail });
  }



  async printOpportunity(data: any) {
    if (this.isPrintLoading) return;

    this.isPrintLoading = true;
    this.cdr.detectChanges();

    try {
      let itemDetails: any[] = [];
      let taxDetails: any[] = [];
      let discountDetails: any[] = [];
      let otherChargesDetails: any[] = [];

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

      // Parse the JSON strings from the API response
      itemDetails = safeParse(data.soDetails);
      taxDetails = safeParse(data.taxDetails);
      discountDetails = safeParse(data.discountDetails);
      otherChargesDetails = safeParse(data.otherChargeDetails);

      if (!itemDetails.length) {
        this.openAlertDialog('Alert!', 'No item details available to print.');
        return;
      }

      // Calculate subtotal from item details
      const subtotal = itemDetails.reduce((sum, item) => {
        const quantity = Number(item.quantity) || 0;
        const unitPrice = Number(item.unitPrice) || 0;
        return sum + (quantity * unitPrice);
      }, 0);


      const calculations = {
        subtotal: subtotal.toFixed(2),
        grandTotal: Number(data.grandTotal || 0).toFixed(2),
        basicamount: Number(data.basicAmt || subtotal).toFixed(2),
        taxamount: Number(data.taxAmt).toFixed(2),
        discountamount: Number(data.disAmt).toFixed(2),
        othercharges: Number(data.otherAmt).toFixed(2)
      };

      const headerDetails = {
        CompanyLogo: '../../..' + (data.orgImage || ''),
        companyName: data.orgName || '',
        companyAddress: data.orgAddress || '',
        companyPhone: data.orgPhone || '',
        companyEmail: data.orgEmail || '',
        quotationNo: data.soNumber || '',
        createdDate: this.datePipe.transform(data.deliveryDate, 'dd.MM.yyyy') || '',
        nameDepartment: data.contactPerson || '',
        billtocompanyName: data.customerName || '',
        address: data.customerAddress || '',
        customerEmail: data.customerEmail || '',
        clientId: data.clientId || ''
      };

      const printContents = this.generateProfessionalPrintHTML(
        headerDetails,
        itemDetails,
        calculations,
        taxDetails,
        discountDetails,
        otherChargesDetails
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
    discountDetails: any[],
    otherchargeDetails: any[]
  ): string {
    let itemRows = '';
    itemDetails.forEach((item, index) => {
      const quantity = item.quantity || 0;
      const unitPrice = item.unitPrice || 0;
      const total = quantity * unitPrice;
      const description = item.itemDetail || item.text || item.Item || item.description || 'N/A';
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
  <td colspan="2" style="text-align: center; font-size: 26px; font-weight: 300;">Sales Order</td>
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
}