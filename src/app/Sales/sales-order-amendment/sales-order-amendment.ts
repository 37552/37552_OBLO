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
import { FileUploadModule } from 'primeng/fileupload';
import { HttpErrorResponse } from '@angular/common/http';
import { ConfigService } from '../../shared/config.service';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DrawerModule } from 'primeng/drawer'; // Added DrawerModule

interface WizardStep {
  label: string;
  description: string;
  icon: string;
  completed: boolean;
}

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
  selector: 'app-sales-order-amendment',
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
    FileUploadModule,
    TableModule,
    TagModule,
    DrawerModule // Added DrawerModule
  ],
   providers: [ConfirmationService, MessageService, DatePipe],
  templateUrl: './sales-order-amendment.html',
  styleUrl: './sales-order-amendment.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SalesOrderAmendment implements OnInit {
    basicInfoTabs: TabConfig[] = [
      { label: 'Order Items', icon: 'pi pi-shopping-bag' },
      { label: 'Additional Tax Details', icon: 'pi pi-percentage' },
      { label: 'Other Charges', icon: 'pi pi-credit-card' }
    ];
    activeTab = 0;
    reviewTabs: TabConfig[] = [
      { label: 'Order Summary', icon: 'pi pi-list' }
    ];
    activeReviewTab = 0;
    salesOrderForm: FormGroup;
    addtionalTaxForm: FormGroup;
    otherChargesForm: FormGroup;
   
    visible = false;
    postType = '';
    header = '';
    headerIcon = 'pi pi-plus';
    isFormLoading = false;
   
  
    uploadedFileUrl: string | null = null;
    selectedFile: File | null = null;
    filePreviewUrl: string | null = null;
    showFileUploadDialog = false;
    isUploadingFile = false;
    
   
  
    isLoading = true;
    data: any[] = [];
    columns: TableColumn[] = [
      { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true },
      { key: 'soNumber', header: 'SO Number', isVisible: true },
      { key: 'customerName', header: 'Customer', isVisible: true },
      { key: 'contactPerson', header: 'Contact Person', isVisible: true },
      { key: 'deliveryDate', header: 'Delivery Date', isVisible: true },
      { key: 'totalAmount', header: 'Total Amount', isVisible: true },
      { key: 'status', header: 'Status', isVisible: true },
      { key: 'createdDate', header: 'Created Date', isVisible: true }
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
    docNoOptions: DropdownOption[] = [];
   
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
    // Other Properties
    salesOrderNumber: string = '';
    minDate: Date = new Date();
    selectedIndex: any;
   
    // Breadcrumb
    breadcrumbItems: any[] = [];
    home: any = { icon: 'pi pi-home', routerLink: '/' };
   
    // Menu items
    param: string | null = null;
    FormName: any;
    FormValue: any;
    menulabel: any;
    // Properties from CRM Orders
    isTaxItemWise: boolean = true;
    grTotal: number = 0;
    orderFinalArr: any[] = [];
    itemtaxwiseData: any[] = [];
    poEditmode: boolean = true;
    showTooltip: boolean = false;
    // New Properties for Quote Items
    hasQuoteItems: boolean = false;
    isItemsFromQuote: boolean = false;
    docNoDrpdata: any;
  
    constructor(
      private fb: FormBuilder,
      private userService: UserService,
      private confirmationService: ConfirmationService,
      private message: MessageService,
      private cdr: ChangeDetectorRef,
      private configService: ConfigService,
      private datePipe: DatePipe
    ) {
      this.salesOrderForm = this.createSalesOrderForm();
      this.addtionalTaxForm = this.createAdditionalTaxForm();
      this.otherChargesForm = this.createOtherChargesForm();
    }
    
    // New method for responsive drawer width
    getDrawerStyle(): any {
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

    ngOnInit(): void {
      this.initializeComponent();
      this.loadDropdowns();
      this.loadDocumentNumbers();
      this.getTableData(true);
      this.getOrders();
    }
    
    ngOnDestroy(): void {
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }
    }

    // Document Number Methods
    private loadDocumentNumbers(): void {
      const currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
      const roleId = currentRole?.roleId || '';
      const userId = sessionStorage.getItem('userId') || '';
      const districtId = sessionStorage.getItem('District') || '';

      this.userService.getQuestionPaper(
        `uspGetMasters|action=SALESORDERDOCS|id=0|appUserId=${userId}|appUserRole=${roleId}|districtId=${districtId}`
      ).subscribe({
        next: (res: any) => {
          this.docNoOptions = res?.table || [];
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          console.error('Error loading document numbers:', err);
          this.docNoOptions = [];
          this.cdr.detectChanges();
        }
      });
    }

    getOrders() {
      this.userService.getQuestionPaper(`uspGetSalesOrderDrp|districtID=${sessionStorage.getItem('District')}`)
        .subscribe({
          next: (res: any) => {
            this.docNoDrpdata = res?.['table'] || [];
            this.cdr.detectChanges();
          },
          error: (err: HttpErrorResponse) => {
            console.error('Error loading sales orders:', err);
            this.docNoDrpdata = [];
            if (err.status == 403) {
              this.message.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Access denied to load sales orders'
              });
            }
            this.cdr.detectChanges();
          }
        });
    }
    
    // Add these helper methods to your component
    getSelectedOrderNumber(): string {
      const docNo = this.salesOrderForm.get('docNo')?.value;
      const selectedDoc = this.docNoDrpdata.find((doc: { drpValue: any; }) => doc.drpValue === docNo);
      return selectedDoc ? selectedDoc.drpOption : 'N/A';
    }

    clearDocumentSelection(): void {
      this.salesOrderForm.patchValue({ docNo: null });
      this.clearData();
    }

    onChangeDoc(event: any): void {
      const docNoId = event.value;
      
      if (!docNoId) {
        this.clearData();
        return;
      }

      this.clearData();
      this.isFormLoading = true;

      // Reset tax options
      this.taxForOptions = [
        { drpValue: "Item Wise", drpOption: "Item Wise" },
        { drpValue: "Order Wise", drpOption: "Order Wise" }
      ];
      this.taxOptionDrp = [
        { drpValue: "Inclusive", drpOption: "Inclusive" },
        { drpValue: "Exclusive", drpOption: "Exclusive" }
      ];

      this.userService.getQuestionPaper(`uspGetSelectedSalesOrderDetails|soId=${docNoId}`)
        .subscribe({
          next: (res: any) => {
            this.processSalesOrderData(res);
            this.isFormLoading = false;
            this.cdr.detectChanges();
          },
          error: (err: HttpErrorResponse) => {
            console.error('Error loading sales order details:', err);
            if (err.status === 403) {
              // Handle login redirect if needed
            }
            this.isFormLoading = false;
            this.cdr.detectChanges();
          }
        });
    }

    private processSalesOrderData(res: any): void {
      if (res.table?.length) {
        const data = res.table[0];
        this.patchFormData(data);
      }

      if (res.table1?.length > 0) {
        this.processOrderItems(res.table1);
      }

      if (res.table2?.length > 0) {
        this.processTaxDetails(res.table2);
      }

      if (res.table3?.length > 0) {
        this.processOtherCharges(res.table3);
      }
    }

    private patchFormData(data: any): void {
      const patchData = {
        id: data.id || 0,
        docNo: data.id || null,
        customerId: data.customerId || null,
        customerAddressId: data.customerAddressId || null,
        contactPerson: data.contactPerson || '',
        contactMobile: data.contactMobile || '',
        warehouseId: data.warehouseId || null,
        deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : null,
        quotationId: data.quotationId || null,
        contractId: data.contractId || null,
        salesCategoryId: data.salesCategoryId || null,
        currencyId: data.currencyId || null,
        orgAddress: data.orgMasterId || null,
        attachFile: data.attachFile || null
      };

      this.salesOrderForm.patchValue(patchData);

      if (data.attachFile) {
        this.uploadedFileUrl = this.normalizeImagePath(data.attachFile);
      }

      if (data.customerId) {
        this.onCustomerChange(data.customerId);
      }
      if (data.quotationId) {
        this.contractdata(data.quotationId);
        this.getitemdata(data.quotationId);
      }
      if (data.salesCategoryId) {
        this.onPurchaseCategoryChange(data.salesCategoryId);
      }
    }

    private processOrderItems(items: any[]): void {
      this.orderItems = items.map((item, index) => ({
        itemCodeId: item.itemCodeId || null,
        unitId: item.unitId || null,
        quantity: item.quantity || 0,
        rate: item.unitPrice || 0,
        taxPercentage: item.taxPercentage ? JSON.parse(item.taxPercentage) : null,
       discountPercentage: Number(item.discountPercentage) || 0,
        tolrence: item.tolerance || '0',
        techSpecification: item.techSpec || '',
        itemTotal: 0,
        taxAmount: 0,
        discountAmount: 0,
        isFromQuote: item.isFromQuote || false
      }));

      this.calculateAllTotals();
    }

    private processTaxDetails(taxDetails: any[]): void {
      this.additionalTaxArray = taxDetails.map(tax => ({
        taxFor: tax.taxFor || '',
        taxForTxt: tax.taxFor || '',
        natureId: tax.natureId || null,
        nature: tax.nature || '',
        taxId: tax.taxId || null,
        tax: tax.taxName || '',
        amount: tax.amount || 0,
        taxOptionId: tax.optionId_Text || null,
        taxOption: tax.optionId_Text || '',
        discountPercentage: tax.discountPercentage || 0,
        remarks: tax.remarks || ''
      }));

      this.updateTaxConfiguration();
    }

    private updateTaxConfiguration(): void {
      if (this.additionalTaxArray.some(e => e.taxFor === "Item Wise")) {
        this.isTaxItemWise = true;
        this.taxForOptions = [{ drpValue: "Item Wise", drpOption: "Item Wise" }];
        this.otherChargesForm.get('isBasic')?.disable();
      } else {
        this.isTaxItemWise = false;
        this.taxForOptions = [{ drpValue: "Order Wise", drpOption: "Order Wise" }];
        this.otherChargesForm.get('isBasic')?.enable();
      }

      const filteredData = this.additionalTaxArray.filter(e => e.natureId);
      if (filteredData.length > 0) {
        this.natureOptions = this.natureOptions.filter(x => 
          x.drpValue == filteredData[0]['natureId']
        );
      }

      if (this.additionalTaxArray.some(e => e.natureId == 10000)) {
        this.addtionalTaxForm.get('amount')?.enable();
      } else {
        this.addtionalTaxForm.get('amount')?.disable();
        this.addtionalTaxForm.patchValue({ amount: 0 });
      }

      if (this.additionalTaxArray.some(e => e.taxOption === "Exclusive")) {
        this.taxOptionDrp = [{ drpValue: "Exclusive", drpOption: "Exclusive" }];
      } else {
        this.taxOptionDrp = [{ drpValue: "Inclusive", drpOption: "Inclusive" }];
      }
    }

    private processOtherCharges(charges: any[]): void {
      this.otherChargesArray = charges.map(charge => ({
        chargesTypeId: charge.chargesTypeId || null,
        chargeType: charge.chargeType || '',
        natureId: charge.natureId || null,
        nature: charge.nature || '',
        chargeValue: charge.chargeValue || 0,
        isBasic: charge.isBasic || false,
        remarks: charge.remarks || ''
      }));

      // Filter nature dropdown for other charges
      const filteredData = this.otherChargesArray.filter(e => e.natureId);
      if (filteredData.length > 0) {
        // You might want to maintain a separate nature dropdown for other charges
        // this.natureDrpOtherCharges = this.natureOptions.filter(x => 
        //   x.drpValue == filteredData[0]['natureId']
        // );
      }
    }

    // Clear data method
    private clearData(): void {
      this.salesOrderForm.patchValue({
        docNo: null,
        customerId: null,
        customerAddressId: null,
        contactPerson: '',
        contactMobile: '',
        warehouseId: null,
        deliveryDate: null,
        quotationId: null,
        contractId: null,
        salesCategoryId: null,
        currencyId: null,
        orgAddress: null,
        attachFile: null
      });
      
      this.orderItems = [];
      this.additionalTaxArray = [];
      this.otherChargesArray = [];
      this.uploadedFileUrl = null;
      
      // Reset dropdowns to full options
      this.loadNatureOptions();
      this.taxForOptions = [
        { drpValue: "Item Wise", drpOption: "Item Wise" },
        { drpValue: "Order Wise", drpOption: "Order Wise" }
      ];
      this.taxOptionDrp = [
        { drpValue: "Inclusive", drpOption: "Inclusive" },
        { drpValue: "Exclusive", drpOption: "Exclusive" }
      ];

      this.otherChargesForm.get('isBasic')?.enable();
      this.addtionalTaxForm.get('amount')?.enable();
    }
  
    // Review Tab Methods
    setActiveReviewTab(index: number): void {
      this.activeReviewTab = index;
      if (index === 1) {
        this.calculateFinancialBreakdown();
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
  
    calculateFinancialBreakdown(): void {
      this.breakdownItems = [];
      this.financialSummary = {
        subtotal: 0,
        totalDiscount: 0,
        totalTax: 0,
        totalCharges: 0,
        grandTotal: 0
      };
      
      // Calculate items total
      const itemsTotal = this.orderItems.reduce((sum, item) => {
        const itemTotal = (item.quantity || 0) * (item.rate || 0);
        return sum + itemTotal;
      }, 0);
      this.financialSummary.subtotal = itemsTotal;
      
      // Add items to breakdown
      this.orderItems.forEach((item, index) => {
        const itemTotal = (item.quantity || 0) * (item.rate || 0);
        this.breakdownItems.push({
          description: `${this.getItemName(item.itemCodeId)} (${item.quantity} x ${item.rate})`,
          amount: itemTotal,
          type: 'item'
        });
      });
      
      // Calculate discounts
      const totalDiscount = this.orderItems.reduce((sum, item) => {
        const itemTotal = (item.quantity || 0) * (item.rate || 0);
        const discountAmount = itemTotal * ((item.discountPercentage || 0) / 100);
        return sum + discountAmount;
      }, 0);
      this.financialSummary.totalDiscount = totalDiscount;
      
      if (totalDiscount > 0) {
        this.breakdownItems.push({
          description: 'Total Discount',
          amount: -totalDiscount,
          type: 'discount'
        });
      }
      
      // Calculate taxable amount
      const taxableAmount = itemsTotal - totalDiscount;
      
      // Calculate taxes
      let totalTax = 0;
      if (this.isTaxItemWise) {
        // Item-wise tax calculation
        this.orderItems.forEach(item => {
          const itemTotal = (item.quantity || 0) * (item.rate || 0);
          const itemDiscount = itemTotal * ((item.discountPercentage || 0) / 100);
          const itemTaxableAmount = itemTotal - itemDiscount;
          
          if (item.taxPercentage && Array.isArray(item.taxPercentage)) {
            item.taxPercentage.forEach(taxId => {
              const taxDetail = this.additionalTaxArray.find(tax => tax.taxId === taxId);
              if (taxDetail) {
                const taxOption = this.taxOptions.find(tax => tax.drpValue === taxDetail.taxId);
                const taxRate = taxOption ? this.extractTaxRate(taxOption.drpOption) : 0;
                const taxAmount = itemTaxableAmount * (taxRate / 100);
                totalTax += taxAmount;
                
                this.breakdownItems.push({
                  description: `${taxDetail.tax || 'Tax'} on ${this.getItemName(item.itemCodeId)}`,
                  amount: taxAmount,
                  type: 'tax'
                });
              }
            });
          }
        });
      } else {
        // Order-wise tax calculation
        this.additionalTaxArray.forEach(taxDetail => {
          const taxOption = this.taxOptions.find(tax => tax.drpValue === taxDetail.taxId);
          const taxRate = taxOption ? this.extractTaxRate(taxOption.drpOption) : 0;
          const taxAmount = taxableAmount * (taxRate / 100);
          totalTax += taxAmount;
          
          this.breakdownItems.push({
            description: taxDetail.tax || 'Tax',
            amount: taxAmount,
            type: 'tax'
          });
        });
      }
      
      this.financialSummary.totalTax = totalTax;
      
      // Calculate other charges
      const totalCharges = this.otherChargesArray.reduce((sum, charge) => sum + (charge.chargeValue || 0), 0);
      this.financialSummary.totalCharges = totalCharges;
      
      this.otherChargesArray.forEach(charge => {
        this.breakdownItems.push({
          description: `${charge.chargeType || 'Charge'}`,
          amount: charge.chargeValue || 0,
          type: 'charge'
        });
      });
      
      // Calculate grand total
      this.financialSummary.grandTotal = taxableAmount + totalTax + totalCharges;
      
      this.breakdownItems.push({
        description: 'Grand Total',
        amount: this.financialSummary.grandTotal,
        type: 'total'
      });
      
      this.cdr.detectChanges();
    }
    
    private extractTaxRate(taxString: string): number {
      const match = taxString.match(/(\d+(\.\d+)?)%/);
      return match ? parseFloat(match[1]) : 0;
    }
    
    // Helper methods for template array operations
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
        { label: this.FormName, disabled: true }
      ];
     
      this.cdr.detectChanges();
    }
    
    private createSalesOrderForm(): FormGroup {
      return this.fb.group({
        id: [0],
        docNo: [null],
        customerId: [null, [Validators.required]],
        customerAddressId: [null, [Validators.required]],
        contactPerson: ['', [Validators.required, Validators.minLength(2)]],
        contactMobile: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
        warehouseId: [null, [Validators.required]],
        deliveryDate: [null, [Validators.required]],
        quotationId: [null, [Validators.required]],
        contractId: [null, [Validators.required]],
        salesCategoryId: [null,[Validators.required]],
        currencyId: [null,[Validators.required]],
        orgAddress: [null,[Validators.required]],
        attachFile: [null]
      });
    }
    
    private createAdditionalTaxForm(): FormGroup {
      return this.fb.group({
        taxFor: ['', [Validators.required]],
        natureId: ['',[Validators.required] ],
        taxId: ['', [Validators.required]],
        amount: ['',[Validators.required]],
        taxOptionId: ['', [Validators.required]],
        discountPercentage: ['',[Validators.required]],
        remarks: ['']
      });
    }
    
    private createOtherChargesForm(): FormGroup {
      return this.fb.group({
        chargesTypeId: ['', [Validators.required]],
        natureId: ['', [Validators.required]],
        chargeValue: ['',[Validators.required]],
        isBasic: [false],
        remarks: [''],
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
  

    
    
    validateCurrentStep(): boolean {
        if (this.salesOrderForm.invalid) {
          this.salesOrderForm.markAllAsTouched();
          this.message.add({
            severity: 'error',
            summary: 'Validation Error',
            detail: 'Please fill all required fields in Customer & Order Details'
          });
          this.scrollToFirstInvalidControl();
          return false;
        }
        if (this.orderItems.length === 0) {
          this.message.add({
            severity: 'error',
            summary: 'Validation Error',
            detail: 'Please add at least one order item'
          });
          this.setActiveTab(0);
          return false;
        }
        for (let i = 0; i < this.orderItems.length; i++) {
          const item = this.orderItems[i];
          if (!item.itemCodeId || !item.unitId || !item.quantity || item.quantity <= 0 || !item.rate || item.rate < 0) {
            this.message.add({
              severity: 'error',
              summary: 'Validation Error',
              detail: `Please fill all required fields for item ${i + 1}`
            });
            this.setActiveTab(0);
            return false;
          }
        }
        return true;
      
      return true;
    }
    
    private scrollToFirstInvalidControl(): void {
      const firstInvalidControl = Object.keys(this.salesOrderForm.controls).find(key =>
        this.salesOrderForm.get(key)?.invalid
      );
     
      if (firstInvalidControl) {
        const element = document.querySelector(`[formControlName="${firstInvalidControl}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          (element as HTMLElement).focus();
        }
      }
    }
    

  
    
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
     
      this.calculateItemTotal(this.orderItems.indexOf(item));
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
            this.hasQuoteItems = this.Itemdetails.length > 0;
              this.populateOrderItemsFromQuote();
            this.cdr.detectChanges();
          },
          error: (err: any) => {
            console.error('Error loading quote items:', err);
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
      this.calculateAllTotals();
      this.setActiveTab(0);
      this.cdr.detectChanges();
    }
  
    removeOrderItem(index: number): void {
      const item = this.orderItems[index];
     
      if (item.isFromQuote) {
        this.confirmationService.confirm({
          message: 'This item is from the quotation. Are you sure you want to remove it?',
          header: 'Remove Quote Item',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
            this.orderItems.splice(index, 1);
            this.calculateAllTotals();
            this.checkIfAllQuoteItemsRemoved();
          }
        });
      } else {
        this.orderItems.splice(index, 1);
        this.calculateAllTotals();
      }
    }
    
    private checkIfAllQuoteItemsRemoved(): void {
      const hasQuoteItems = this.orderItems.some(item => item.isFromQuote);
      if (!hasQuoteItems) {
        this.isItemsFromQuote = false;
      }
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
    
    // Calculation Methods
    calculateItemTotal(index: number): void {
      const item = this.orderItems[index];
      if (item.quantity && item.rate) {
        const itemTotal = item.quantity * item.rate;
        item.discountAmount = itemTotal * ((item.discountPercentage || 0) / 100);
        const taxableAmount = itemTotal - item.discountAmount;
      
        item.taxAmount = 0;
        if (item.taxPercentage && Array.isArray(item.taxPercentage)) {
          item.taxPercentage.forEach(taxId => {
            const taxDetail = this.additionalTaxArray.find(tax => tax.taxId === taxId);
            if (taxDetail) {
              const taxOption = this.taxOptions.find(tax => tax.drpValue === taxDetail.taxId);
              const taxRate = taxOption ? parseFloat(taxOption.drpOption) : 0;
              item.taxAmount! += taxableAmount * (taxRate / 100);
            }
          });
        } else if (item.taxPercentage && !Array.isArray(item.taxPercentage)) {
          const taxOption = this.taxOptions.find(tax => tax.drpValue === item.taxPercentage);
          const taxRate = taxOption ? parseFloat(taxOption.drpOption) : 0;
          item.taxAmount = taxableAmount * (taxRate / 100);
        }
      
        item.itemTotal = taxableAmount + (item.taxAmount || 0);
      } else {
        item.itemTotal = 0;
        item.taxAmount = 0;
        item.discountAmount = 0;
      }
      this.cdr.detectChanges();
    }
    
    calculateAllTotals(): void {
      this.orderItems.forEach((item, index) => {
        this.calculateItemTotal(index);
      });
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
    
    addRow(formName: string): void {
      const form = this.getFormByName(formName);
      if (form.invalid) {
        form.markAllAsTouched();
        return;
      }
      if (formName === 'addtionalTaxForm') {
        this.addTaxRow();
      } else if (formName === 'otherChargesForm') {
        this.addChargeRow();
      }
    }
    
    private addTaxRow(): void {
      const taxFor = this.addtionalTaxForm.get('taxFor')?.value;
      const natureId = this.addtionalTaxForm.get('natureId')?.value;
      const taxId = this.addtionalTaxForm.get('taxId')?.value;
      const taxOptionId = this.addtionalTaxForm.get('taxOptionId')?.value;
     
      if (!taxFor || !natureId || !taxId || !taxOptionId) {
        this.message.add({
          severity: 'error',
          summary: 'Validation Error',
          detail: 'Please fill all required fields'
        });
        return;
      }
      const obj: TaxDetail = {
        taxFor: taxFor,
        taxForTxt: this.taxForOptions.find(t => t.drpValue === taxFor)?.drpOption || '',
        natureId: natureId,
        nature: this.natureOptions.find(n => n.drpValue === natureId)?.drpOption || '',
        taxId: taxId,
        tax: this.purchaseTaxDetails.find(t => t.drpValue === taxId)?.drpOption || '',
        amount: this.addtionalTaxForm.get('amount')?.value || 0,
        taxOptionId: taxOptionId,
        taxOption: this.taxOptionDrp.find(to => to.drpValue === taxOptionId)?.drpOption || '',
        discountPercentage: this.addtionalTaxForm.get('discountPercentage')?.value || 0,
        remarks: this.addtionalTaxForm.get('remarks')?.value || '',
      };
      if (obj.natureId === 10000 && obj.amount <= 0) {
        this.message.add({
          severity: 'error',
          summary: 'Validation Error',
          detail: 'Please enter value for column *Amount'
        });
        return;
      }
      if (this.additionalTaxArray.length <= 0) {
        if (obj.taxFor === "Order Wise") {
          this.isTaxItemWise = false;
          this.otherChargesForm.get('isBasic')?.enable();
          this.taxForOptions = [{ drpValue: "Order Wise", drpOption: "Order Wise" }];
          this.applyOrderWiseTaxToAllItems(obj);
        } else {
          this.isTaxItemWise = true;
          this.otherChargesForm.get('isBasic')?.disable();
          this.taxForOptions = [{ drpValue: "Item Wise", drpOption: "Item Wise" }];
        }
       
        if (obj.taxOptionId === "Exclusive") {
          this.taxOptionDrp = [{ drpValue: "Exclusive", drpOption: "Exclusive" }];
        } else {
          this.taxOptionDrp = [{ drpValue: "Inclusive", drpOption: "Inclusive" }];
        }
      } else {
        if (this.additionalTaxArray.some(e => e.taxId === obj.taxId)) {
          this.message.add({
            severity: 'error',
            summary: 'Validation Error',
            detail: 'Tax type already exists'
          });
          return;
        }
       
        if (this.additionalTaxArray.some(e => e.taxFor !== obj.taxFor)) {
          this.message.add({
            severity: 'error',
            summary: 'Validation Error',
            detail: 'Please select same Tax For'
          });
          return;
        }
       
        if (this.additionalTaxArray.some(e => e.natureId !== obj.natureId)) {
          this.message.add({
            severity: 'error',
            summary: 'Validation Error',
            detail: 'Please select same Nature type'
          });
          return;
        }
       
        if (this.additionalTaxArray.some(e => e.taxOptionId !== obj.taxOptionId)) {
          this.message.add({
            severity: 'error',
            summary: 'Validation Error',
            detail: 'Please select same Tax option'
          });
          return;
        }
      }
      this.additionalTaxArray.push(obj);
      this.getSelectedTaxes();
      this.addtionalTaxForm.reset();
    
      this.message.add({
        severity: 'success',
        summary: 'Tax Added',
        detail: 'Tax has been added and is now available in Order Items'
      });
     
      this.cdr.detectChanges();
    }
    
    // New method to apply Order Wise tax to all items
    private applyOrderWiseTaxToAllItems(taxDetail: TaxDetail): void {
      this.orderItems.forEach(item => {
        item.taxPercentage = [taxDetail.taxId];
        item.discountPercentage = taxDetail.discountPercentage;
        this.calculateItemTotal(this.orderItems.indexOf(item));
      });
    }
    
    private addChargeRow(): void {
      const obj: OtherCharge = {
        chargesTypeId: this.otherChargesForm.get('chargesTypeId')?.value,
        chargeType: this.chargeTypes.find(c => c.drpValue === this.otherChargesForm.get('chargesTypeId')?.value)?.drpOption || '',
        natureId: this.otherChargesForm.get('natureId')?.value,
        nature: this.natureOptions.find(n => n.drpValue === this.otherChargesForm.get('natureId')?.value)?.drpOption || '',
        chargeValue: this.otherChargesForm.get('chargeValue')?.value || 0,
        isBasic: this.otherChargesForm.get('isBasic')?.value || false,
        remarks: this.otherChargesForm.get('remarks')?.value || '',
      };
      if (!obj.chargeValue || obj.chargeValue === 0) {
        this.message.add({
          severity: 'error',
          summary: 'Validation Error',
          detail: 'Please enter value for column *Amount'
        });
        return;
      }
      this.otherChargesArray.push(obj);
      this.otherChargesForm.reset();
      this.modifyItem();
    }
    
    private getFormByName(formName: string): FormGroup {
      switch (formName) {
        case 'addtionalTaxForm': return this.addtionalTaxForm;
        case 'otherChargesForm': return this.otherChargesForm;
        default: return this.salesOrderForm;
      }
    }
    
    deleteRow(table: string, index: number): void {
      this.confirmationService.confirm({
        message: 'Are you sure you want to remove this item?',
        header: 'Confirm',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          if (table === 'additionalTaxArray') {
            this.onDeleteRow(index, table, this.additionalTaxArray[index]);
          } else if (table === 'otherChargesArray') {
            this.otherChargesArray.splice(index, 1);
          }
          this.cdr.detectChanges();
        }
      });
    }
    
    onDeleteRow(index: number, arrayName: string, item: any): void {
      if (index !== -1) {
        if (arrayName === 'additionalTaxArray') {
          if (item.taxFor === "Order Wise") {
            this.additionalTaxArray.splice(index, 1);
            if (this.additionalTaxArray.length > 0) {
              this.getSelectedTaxes();
            } else {
              this.allTaxRemove();
            }
          } else {
            this.additionalTaxArray.splice(index, 1);
           
            // Remove this tax from all order items
            this.orderItems.forEach((orderItem, i) => {
              if (orderItem.taxPercentage && Array.isArray(orderItem.taxPercentage)) {
                const filteredIds = orderItem.taxPercentage.filter((taxId: any) => taxId !== item.taxId);
                orderItem.taxPercentage = filteredIds.length > 0 ? filteredIds : null;
               
                // Recalculate discount percentage based on remaining taxes
                if (filteredIds.length > 0) {
                  const remainingTaxes = this.additionalTaxArray.filter(tax => filteredIds.includes(tax.taxId));
                  let totalDiscountPercentage = 0;
                  remainingTaxes.forEach(tax => {
                    totalDiscountPercentage += parseFloat(tax.discountPercentage?.toString() || '0');
                  });
                  orderItem.discountPercentage = totalDiscountPercentage;
                } else {
                  orderItem.discountPercentage = 0;
                }
               
                this.calculateItemTotal(i);
              }
            });
            if (this.additionalTaxArray.length <= 0) {
              this.loadNatureOptions();
              this.taxForOptions = [
                { drpValue: "Item Wise", drpOption: "Item Wise" },
                { drpValue: "Order Wise", drpOption: "Order Wise" }
              ];
              this.taxOptionDrp = [
                { drpValue: "Inclusive", drpOption: "Inclusive" },
                { drpValue: "Exclusive", drpOption: "Exclusive" }
              ];
            }
          }
        }
      }
    }
    
    allTaxRemove(): void {
      this.orderItems.forEach((data, index) => {
        data.discountPercentage = 0;
        data.taxPercentage = null;
      });
     
      this.taxForOptions = [
        { drpValue: "Item Wise", drpOption: "Item Wise" },
        { drpValue: "Order Wise", drpOption: "Order Wise" }
      ];
      this.taxOptionDrp = [
        { drpValue: "Inclusive", drpOption: "Inclusive" },
        { drpValue: "Exclusive", drpOption: "Exclusive" }
      ];
    }
    
    getSelectedTaxes(): void {
      this.modifyItem();
      if (!this.isTaxItemWise && this.additionalTaxArray.length > 0) {
        let totalDiscountPercentage = 0;
        let taxIds: any[] = [];
       
        for (let i = 0; i < this.additionalTaxArray.length; i++) {
          totalDiscountPercentage += parseFloat(this.additionalTaxArray[i].discountPercentage?.toString() || '0');
          taxIds.push(this.additionalTaxArray[i].taxId);
        }
       
        this.orderItems.forEach((item, index) => {
          item.discountPercentage = totalDiscountPercentage;
          item.taxPercentage = taxIds;
          this.calculateItemTotal(index);
        });
      }
    }
    
    onSelectNature(event: any): void {
      const natureId = event.value;
      if (natureId == 10000) {
        this.addtionalTaxForm.get('amount')?.enable();
      } else {
        this.addtionalTaxForm.get('amount')?.disable();
        this.addtionalTaxForm.patchValue({
          amount: 0
        });
      }
    }
    
    modifyItem(): void {
      this.showTooltip = false;
      this.poEditmode = true;
      this.grTotal = 0;
      this.orderFinalArr = [];
    }
    
    updateTrColumnValue(): void {
      if (this.orderItems.some(e => !e.quantity || e.quantity === 0)) {
        this.message.add({
          severity: 'error',
          summary: 'Validation Error',
          detail: 'Please enter quantity for all items'
        });
        return;
      }
      if (this.orderItems.some(e => !e.rate || e.rate === 0)) {
        this.message.add({
          severity: 'error',
          summary: 'Validation Error',
          detail: 'Please enter rate for all items'
        });
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
          console.error('Error calculating grand total:', err);
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
        console.error('Error generating data from details:', error);
      }
    }
    
    // Form Validation
    isInvalid(field: string): boolean {
      const control = this.salesOrderForm.get(field);
      return !!(control && control.invalid && (control.dirty || control.touched));
    }
    
    // File Upload Methods
    openFileUploadDialog(): void {
      this.showFileUploadDialog = true;
      this.selectedFile = null;
      this.filePreviewUrl = null;
      this.isUploadingFile = false;
      this.cdr.detectChanges();
    }
    
    closeFileUploadDialog(): void {
      this.showFileUploadDialog = false;
      this.selectedFile = null;
      this.filePreviewUrl = null;
      this.isUploadingFile = false;
      this.cdr.detectChanges();
    }
    
    onFileSelect(event: any): void {
      if (event.files && event.files.length > 0) {
        this.selectedFile = event.files[0];
        if (this.selectedFile && this.isImageFile(this.selectedFile.name)) {
          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.filePreviewUrl = e.target.result;
            this.cdr.detectChanges();
          };
          reader.readAsDataURL(this.selectedFile);
        } else {
          this.filePreviewUrl = null;
        }
        this.cdr.detectChanges();
      }
    }
    
    clearFileSelection(): void {
      this.selectedFile = null;
      this.filePreviewUrl = null;
      this.cdr.detectChanges();
    }
    
    uploadFile(): void {
      if (!this.selectedFile) {
        this.message.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'Please select a file first.'
        });
        return;
      }
      this.isUploadingFile = true;
      this.cdr.detectChanges();
      const filesArray: File[] = [this.selectedFile];
      const folderName = 'SalesOrderDocuments';
      this.userService.MastrtfileuploadNew(filesArray, folderName).subscribe({
        next: (response: any) => {
          this.isUploadingFile = false;
          const resultArray = response.split("-");
         
          if (resultArray[0] == "1") {
            let uploadedUrl = resultArray[1].toString();
            uploadedUrl = this.normalizeImagePath(uploadedUrl);
           
            this.salesOrderForm.patchValue({
              attachFile: uploadedUrl
            });
            this.uploadedFileUrl = uploadedUrl;
           
            this.message.add({
              severity: 'success',
              summary: 'Success',
              detail: 'File uploaded successfully!'
            });
           
            this.closeFileUploadDialog();
          } else {
            this.message.add({
              severity: 'error',
              summary: 'Error',
              detail: resultArray[1]?.toString() || 'File upload failed'
            });
          }
          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => {
          this.isUploadingFile = false;
          console.error('File upload error:', err);
         
          this.message.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to upload file. Please try again.'
          });
          this.cdr.detectChanges();
        }
      });
    }
    
    removeFile(): void {
      this.uploadedFileUrl = null;
      this.selectedFile = null;
      this.salesOrderForm.patchValue({
        attachFile: null
      });
     
      this.message.add({
        severity: 'info',
        summary: 'File removed',
        detail: 'Attached file has been removed'
      });
    }
    
    // File Utility Methods
    isImage(filename: string): boolean {
      if (!filename) return false;
      const cleanUrl = filename.split('?')[0];
      return /\.(jpeg|jpg|png|gif|bmp|svg|webp)$/i.test(cleanUrl);
    }
    
    isImageFile(filename: string): boolean {
      if (!filename) return false;
      return /\.(jpeg|jpg|png|gif|bmp|svg|webp)$/i.test(filename);
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
    
    getFileName(url: string): string {
      if (this.selectedFile) {
        return this.selectedFile.name;
      }
     
      if (!url) return 'Unknown File';
     
      const matches = url.match(/\/([^\/?#]+)[^\/]*$/);
      return matches ? matches[1] : 'Attached File';
    }
    
    getFileSize(bytes: number): string {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    openImagePreview(imageUrl: string): void {
      window.open(imageUrl, '_blank');
    }
    
    // Updated method name from showDialog to showDrawer
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
      this.header = 'Create Sales Order';
      this.headerIcon = 'pi pi-plus';
      this.salesOrderForm.reset({ id: 0 });
      this.orderItems = [];
      this.additionalTaxArray = [];
      this.otherChargesArray = [];
      this.breakdownItems = [];
      this.uploadedFileUrl = null;
      this.Itemdetails = [];
      this.hasQuoteItems = false;
      this.isItemsFromQuote = false;
      this.salesOrderNumber = 'Auto-generated';
      this.isFormLoading = false;
      this.cdr.detectChanges();
      
      if (this.docNoDrpdata.length === 0) {
        this.getOrders();
      }
    }
    
    private initializeEditViewMode(view: string, data: any): void {
      this.visible = true;
      this.postType = view;
      this.header = view === 'update' ? 'Update Sales Order' : 'View Sales Order';
      this.headerIcon = view === 'update' ? 'pi pi-pencil' : 'pi pi-eye';
      this.selectedIndex = data;
      
      if (view === 'view') {
        this.salesOrderForm.disable();
        this.addtionalTaxForm.disable();
        this.otherChargesForm.disable();
      } else {
        this.salesOrderForm.enable();
        this.addtionalTaxForm.enable();
        this.otherChargesForm.enable();
      }
      
      this.loadSalesOrderData(data);
    }
    
    private loadSalesOrderData(data: any): void {
      const patchData = {
        id: data.id || 0,
        docNo: data.id || null,
        customerId: data.customerId || null,
        customerAddressId: data.customerAddressId || null,
        contactPerson: data.contactPerson || '',
        contactMobile: data.contactMobile || '',
        warehouseId: data.warehouseId || null,
        deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : null,
        quotationId: data.quotationId || null,
        contractId: data.contractId || null,
        salesCategoryId: data.salesCategoryId || null,
        currencyId: data.currencyId || null,
        orgAddress: data.orgAddress || null,
        attachFile: data.attachFile || null
      };
      
      this.salesOrderForm.patchValue(patchData);
      this.salesOrderNumber = data.soNumber || '';
      
      if (data.attachFile) {
        this.uploadedFileUrl = this.normalizeImagePath(data.attachFile);
      } else {
        this.uploadedFileUrl = null;
      }
      
      if (data.orderItems && Array.isArray(data.orderItems)) {
        this.orderItems = data.orderItems.map((item: any) => ({
          ...item,
          itemTotal: 0,
          taxAmount: 0,
          discountAmount: 0,
          isFromQuote: item.isFromQuote || false
        }));
        this.calculateAllTotals();
      }
      
      if (data.taxDetails && Array.isArray(data.taxDetails)) {
        this.additionalTaxArray = data.taxDetails;
      }
      
      if (data.otherCharges && Array.isArray(data.otherCharges)) {
        this.otherChargesArray = data.otherCharges;
      }
      
      this.isFormLoading = false;
      this.cdr.detectChanges();
    }
    
    onSubmit(event: Event): void {
      if (this.validateCurrentStep() && this.salesOrderForm.valid) {
        this.openConfirmation(
          'Confirm Sales Order',
          'Are you sure you want to submit this sales order?',
          'submit'
        );
      } else {
        this.message.add({
          severity: 'error',
          summary: 'Validation Error',
          detail: 'Please complete all required fields before submitting.'
        });
      }
    }
    
    private submitSalesOrder(): void {
      this.isFormLoading = true;
      const formData = this.salesOrderForm.getRawValue();
      const orderItemsForSubmission = this.orderItems.map(item => ({
        itemCodeId: item.itemCodeId,
        unitId: item.unitId,
        taxPercentage: item.taxPercentage ? (Array.isArray(item.taxPercentage) ? item.taxPercentage.join(',') : item.taxPercentage.toString()) : '',
        unitPrice: item.rate,
        quantity: item.quantity,
        discountPercentage: item.discountPercentage,
        tolrence: item.tolrence,
        techSpecification: item.techSpecification,
        isFromQuote: item.isFromQuote || false
      }));
      
      const soDetailJson = JSON.stringify(orderItemsForSubmission);
      const soOtherChargeJson = JSON.stringify(this.otherChargesArray);
      const soTaxDetailJson = JSON.stringify(this.additionalTaxArray);
      
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
          console.error('Submit error:', error);
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
            console.error(`Error loading ${config.key}:`, err);
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
        this.contractdata(quotationId);
        this.getitemdata(quotationId);
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
            console.error('Error loading customers:', err);
            this.customers = [];
          }
        });
      } catch (error) {
        console.error('Error in loadCustomerData:', error);
      }
    }
    
    loadNatureOptions(): void {
      this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblNatureOfChargesMaster`).subscribe({
        next: (res: any) => {
          this.natureOptions = res?.table || [];
          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error loading nature options:', err);
          this.natureOptions = [];
        }
      });
    }
    
    onCustomerChange(customerId: number): void {
      if (customerId) {
        this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblcustomeraddressmaster|filterValue=${customerId}`).subscribe({
          next: (res: any) => {
            this.customerAddresses = res?.table || [];
            this.cdr.detectChanges();
          },
          error: (err: any) => {
            console.error('Error loading customer addresses:', err);
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
      
      // Clear order items when customer changes
      this.orderItems = [];
      this.isItemsFromQuote = false;
      this.calculateAllTotals();
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
            console.error('Error loading quotations:', err);
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
            console.error('Error loading contracts:', err);
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
            console.error('Error loading filtered currencies:', err);
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
     
      let query = `appUserId=${userId}|appUserRole=${roleId}|districtId=${districtId}|pageIndex=${this.pageNo}|size=${this.pageSize}|searchText=${this.searchText}|`;
     
      this.userService.getQuestionPaper(`uspGetSalesOrders|${query}`).subscribe({
        next: (res: any) => {
          try {
            this.data = res?.table1 || res?.table || [];
            this.data = this.data.map(item => ({
              ...item,
              id: item.id || item.soHeaderId,
              soNumber: item.soNumber || item.text || '',
              customerName: item.customerName || item.customer || '',
              contactPerson: item.contactPerson || '',
              deliveryDate: item.deliveryDate || '',
              totalAmount: item.totalAmount || item.grandTotal || 0,
              status: item.status || 'Active',
              createdDate: item.createdDate || item.createdOn || ''
            }));
           
            this.totalCount = res?.table?.[0]?.totalCnt ||
                             res?.table1?.[0]?.totalCount ||
                             this.data.length;
          } catch (innerErr) {
            console.error('Error processing table data:', innerErr);
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
          console.error('Error loading table data:', err);
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
    
    onSortChange(event: { column: string, direction: 'asc' | 'desc' }): void {
      this.sortColumn = event.column;
      this.sortDirection = event.direction;
      this.getTableData(true);
    }
    
    openConfirmation(title: string, msg: string, action: string): void {
      this.confirmationService.confirm({
        message: msg,
        header: title,
        icon: 'pi pi-exclamation-triangle',
        acceptButtonProps: { label: 'Yes', icon: 'pi pi-check' },
        rejectButtonProps: { label: 'No', icon: 'pi pi-times', severity: 'secondary' },
        accept: () => {
          if (action === 'submit') {
            this.submitSalesOrder();
          } else if (action === 'delete') {
            this.deleteSalesOrder();
          }
        },
        reject: () => {
        }
      });
    }
    
    private deleteSalesOrder(): void {
      // Implement delete functionality if needed
    }
    
    onDrawerHide(): void {
      this.visible = false;
      this.activeTab = 0;
      this.activeReviewTab = 0;
      this.breakdownItems = [];
      this.salesOrderForm.reset({ id: 0 });
      this.salesOrderForm.enable();
      this.addtionalTaxForm.reset();
      this.otherChargesForm.reset();
      this.orderItems = [];
      this.additionalTaxArray = [];
      this.otherChargesArray = [];
      this.uploadedFileUrl = null;
      this.selectedFile = null;
      this.Itemdetails = [];
      this.hasQuoteItems = false;
      this.isItemsFromQuote = false;
      this.cdr.detectChanges();
    }
    
    clearForm(): void {
      this.salesOrderForm.reset({ id: 0 });
      this.addtionalTaxForm.reset();
      this.otherChargesForm.reset();
      this.orderItems = [];
      this.additionalTaxArray = [];
      this.otherChargesArray = [];
      this.breakdownItems = [];
      this.uploadedFileUrl = null;
      this.selectedFile = null;
      this.Itemdetails = [];
      this.hasQuoteItems = false;
      this.isItemsFromQuote = false;

    }
    
    trackByIndex(index: number): number {
      return index;
    }
    
    get f() {
      return this.salesOrderForm.controls;
    }
    
    get f1() {
      return this.addtionalTaxForm.controls;
    }
    
    get f2() {
      return this.otherChargesForm.controls;
    }
}