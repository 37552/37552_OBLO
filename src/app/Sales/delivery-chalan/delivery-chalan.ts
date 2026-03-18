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
import { DrawerModule } from 'primeng/drawer';
import { UserService } from '../../shared/user-service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FileUploadModule } from 'primeng/fileupload';
import { HttpErrorResponse } from '@angular/common/http';
import { ConfigService } from '../../shared/config.service';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

interface DropdownOption {
  drpValue: any;
  drpOption: string;
}

interface ItemDetail {
  id:number| null;
  itemId: number | null;
  itemCodeid: number | null;
  quantity: number;
  rate: number;
  discount: number;
  tax: number;
  itemName?: string;
  makerCodeName?: string;
}

interface Step {
  label: string;
  icon: string;
}

interface SelectedItemDetails {
  itemName: any;
  itemCode: any;
  vendorDetails: any[];
  makeDetails: never[];
  companyDetails: never[];
}

@Component({
  selector: 'app-delivery-chalan',
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
    DrawerModule
  ],
  providers: [ConfirmationService, MessageService, DatePipe],
  templateUrl: './delivery-chalan.html',
  styleUrl: './delivery-chalan.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DeliveryChalan implements OnInit, OnDestroy {
  challanForm: FormGroup;
  itemDetailForm: FormGroup;
  visible = false;
  printDialogVisible = false;
  postType = '';
  header = '';
  headerIcon = 'pi pi-plus';
  isFormLoading = false;
  isLoading = true;
  isDirect = false;

  data: any[] = [];
  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true },
    { key: 'challanNo', header: 'Challan No', isVisible: true },
    { key: 'supplyDate', header: 'Supply Date', isVisible: true },
    { key: 'sourceDocument', header: 'Source Document', isVisible: true },
    { key: 'Shipfrom', header: 'Ship From', isVisible: true },
    { key: 'Shipfromaddress', header: 'Ship From Address', isVisible: true },
    { key: 'Shipto', header: 'Ship to', isVisible: true },
    { key: 'Shiptoadress', header: 'Ship to Address', isVisible: true },
    { key: 'Billto', header: 'Bill to', isVisible: true },
    { key: 'Billtoadress', header: 'Bill to Address', isVisible: true },
    { key: 'city', header: 'City', isVisible: true },
    { key: 'transportMode', header: 'Transport Mode', isVisible: true },
    { key: 'vehicleno', header: 'Vehicle No', isVisible: true },
    { key: 'reverseCharge', header: 'Reverse Charge', isVisible: true },
     { key: 'jsonDetails',  header: ' Vendor Details', isVisible: true, isSortable: false, isCustom: true },
  ];

  pageNo = 1;
  pageSize = 10;
  searchText = '';
  totalCount = 0;
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  searchTimeout: any;
  debounceTime = 500;

  sourceDocumentOptions: DropdownOption[] = [
    { drpValue: '10000', drpOption: 'Direct' },
    { drpValue: '10003', drpOption: 'Purchase Request' },
    { drpValue: '10009', drpOption: 'Sales Order' }
  ];
  transportDrpData: DropdownOption[] = [];
  shipFromDrpData: DropdownOption[] = [];
  shipFromAddressDrpData: DropdownOption[] = [];
  shipToDrpData: DropdownOption[] = [];
  billToDrpData: DropdownOption[] = [];
  billToAddressDrpData: DropdownOption[] = [];
  divisionDrpData: DropdownOption[] = [];
  referenceNumberDrpData: DropdownOption[] = [];
  itemsDrp: DropdownOption[] = [];
  makerCodeDrp: DropdownOption[] = [];
  itemDetailData: ItemDetail[] = [];
  printData: any = null;
  breadcrumbItems: any[] = [];
  home: any = { icon: 'pi pi-home', routerLink: '/' };
  currentDate: Date = new Date();
  param: string | null = null;
  FormName: any;
  FormValue: any;
  menulabel: any;
  selectedChallanIdForPrint: number | null = null;
  selectedItemDetails: SelectedItemDetails | null = null; // Fix: Initialize as null
  jsonSectionType: string | null = null; // Fix: Initialize as null
  jsonDetailsVisible: boolean = false; // Fix: Initialize as false
  makerCodeMap: any;
 isPrintLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private message: MessageService,
    private cdr: ChangeDetectorRef,
    private configService: ConfigService,
    private datePipe: DatePipe
  ) {
    this.challanForm = this.createChallanForm();
    this.itemDetailForm = this.createItemDetailForm();
  }

  ngOnInit(): void {
    this.initializeComponent();
    this.loadDropdowns();
    this.getTableData(true);
  }

  ngOnDestroy(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
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

  private createChallanForm(): FormGroup {
    return this.fb.group({
      id: [0],
      sourceDocumentId: ['', [Validators.required]],
      prMainId: [''],
      transportMode: [''],
      shipFrom: ['', [Validators.required]],
      shipFromAddress: ['', [Validators.required]],
      shipTo: ['', [Validators.required]],
      shipToAddress: ['', [Validators.required]],
      billTo: ['', [Validators.required]],
      billToAddress: [''],
      stateid: ['', [Validators.required]],
      vehicleno: [''],
      supplyDate: ['', [Validators.required]],
      reverseCharge: [false],
      remarks: [''],
      transporter: ['']
    });
  }

  private createItemDetailForm(): FormGroup {
    return this.fb.group({
      itemId: ['', [Validators.required]],
      itemCodeid: ['', [Validators.required]],
      quantity: ['', [Validators.required, Validators.min(1)]],
      rate: ['', [Validators.required, Validators.min(0)]],
      discount: [0],
      tax: [0]
    });
  }

  isInvalid(field: string): boolean {
    const control = this.challanForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  get f() {
    return this.challanForm.controls;
  }

  get f1() {
    return this.itemDetailForm.controls;
  }

  viewVendorDetails(item: any): void {
    // Parse the itemDetail JSON string if it exists
    let vendorDetails: any[] = [];
    
    if (item.itemDetail && typeof item.itemDetail === 'string') {
      try {
        const parsedDetails = JSON.parse(item.itemDetail);
        if (Array.isArray(parsedDetails)) {
          vendorDetails = parsedDetails;
        }
      } catch (error) {
        console.error('Error parsing item details:', error);
      }
    }
    
    this.selectedItemDetails = {
      itemName: item.itemName || 'Unknown Item',
      itemCode: item.itemCode ,
      vendorDetails: vendorDetails,
      makeDetails: [],
      companyDetails: []
    };
    this.jsonSectionType = 'vendor';
    this.jsonDetailsVisible = true;
    this.cdr.detectChanges();
  }

  closeJsonDetails(): void {
    this.jsonDetailsVisible = false;
    this.selectedItemDetails = null;
    this.jsonSectionType = null;
    this.cdr.detectChanges();
  }

  validateCurrentStep(): boolean {
      if (this.challanForm.invalid) {
        this.challanForm.markAllAsTouched();
        this.message.add({
          severity: 'error',
          summary: 'Validation Error',
          detail: 'Please fill all required fields in Basic Information'
        });
        this.scrollToFirstInvalidControl();
        return false;
      }
    return true;
  }

  addMoreItems(): void {
    if (this.isDirect) {
      this.itemDetailForm.reset({
        discount: 0,
        tax: 0
      });
      this.cdr.detectChanges();
    }
  }

  private scrollToFirstInvalidControl(): void {
    const firstInvalidControl = Object.keys(this.challanForm.controls).find(key =>
      this.challanForm.get(key)?.invalid
    );
   
    if (firstInvalidControl) {
      const element = document.querySelector(`[formControlName="${firstInvalidControl}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        (element as HTMLElement).focus();
      }
    }
  }

  loadDropdowns(): void {
    this.loadTransportTypes();
    this.loadShipFrom();
    this.loadShipTo();
    this.loadBillTo();
    this.loadDivision();
    this.loadItems();
  }

  loadTransportTypes(): void {
    this.userService.getQuestionPaper('uspGetFillDrpDown|table=tblTransportModeMaster').subscribe({
      next: (res: any) => {
        this.transportDrpData = res?.table || [];
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error loading transport types:', err);
        this.transportDrpData = [];
      }
    });
  }

  loadShipFrom(): void {
    this.userService.getQuestionPaper('uspGetFillDrpDown|table=tblOrgMaster').subscribe({
      next: (res: any) => {
        this.shipFromDrpData = res?.table || [];
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error loading ship from:', err);
        this.shipFromDrpData = [];
      }
    });
  }

  loadShipTo(): void {
    this.userService.getQuestionPaper('uspGetFillDrpDown|table=tblCustomerMasterHeader').subscribe({
      next: (res: any) => {
        this.shipToDrpData = res?.table || [];
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error loading ship to:', err);
        this.shipToDrpData = [];
      }
    });
  }

  loadBillTo(): void {
    this.userService.getQuestionPaper('uspGetFillDrpDown|table=tblCustomerMasterHeader').subscribe({
      next: (res: any) => {
        this.billToDrpData = res?.table || [];
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error loading bill to:', err);
        this.billToDrpData = [];
      }
    });
  }

  loadDivision(): void {
    this.userService.getQuestionPaper('uspGetFillDrpDown|table=tblDistrictMaster').subscribe({
      next: (res: any) => {
        this.divisionDrpData = res?.table || [];
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error loading division:', err);
        this.divisionDrpData = [];
      }
    });
  }

  loadItems(): void {
    this.userService.getQuestionPaper('uspGetFillDrpDown|table=tblMaterialMaster').subscribe({
      next: (res: any) => {
        this.itemsDrp = res?.table || [];
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error loading items:', err);
        this.itemsDrp = [];
      }
    });
  }

  onSourceDocumentChange(): void {
    const sourceDocId = this.challanForm.get('sourceDocumentId')?.value;
    this.isDirect = sourceDocId === '10000';
    
    if (this.isDirect) {
      this.challanForm.get('prMainId')?.setValue(null);
      this.challanForm.get('prMainId')?.disable();
      this.challanForm.get('prMainId')?.clearValidators();
      this.referenceNumberDrpData = [];
      this.itemDetailData = []; 
    } else if (sourceDocId === '10009' || sourceDocId === '10003') {
      this.challanForm.get('prMainId')?.enable();
      this.challanForm.get('prMainId')?.setValidators([Validators.required]);
      if (sourceDocId === '10009') {
        this.loadReferenceNumbers();
      } else if (sourceDocId === '10003') {
        this.loadPurchaseRequestNumbers();
      }
      this.itemDetailData = []; 
    }
    
    this.challanForm.get('prMainId')?.updateValueAndValidity();
    this.cdr.detectChanges();
  }

  loadReferenceNumbers(): void {
    this.userService.getQuestionPaper(`uspGetSalesOrderDrp|districtID=${sessionStorage.getItem('District')}`).subscribe({
      next: (res: any) => {
        this.referenceNumberDrpData = res?.table || [];
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error loading reference numbers:', err);
        this.referenceNumberDrpData = [];
      }
    });
  }

  loadPurchaseRequestNumbers(): void {
    this.userService.getQuestionPaper(`uspGetPurchaseOrderDrp`).subscribe({
      next: (res: any) => {
        this.referenceNumberDrpData = res?.table || [];
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error loading purchase request numbers:', err);
        this.referenceNumberDrpData = [];
      }
    });
  }

  onDocumentNumberChange(): void {
    const docNumber = this.challanForm.get('prMainId')?.value;
    if (docNumber && !this.isDirect) {
      this.loadItemsFromDocument(docNumber);
    }
  }

  loadItemsFromDocument(docNumber: number): void {
    const sourceDocId = this.challanForm.get('sourceDocumentId')?.value;
    
    if (sourceDocId === '10009') {
      // Sales Order
      this.userService.getQuestionPaper(`uspGetSelectedSalesOrderDetails|soId=${docNumber}`).subscribe({
        next: (res: any) => {
          if (res?.table1 && res.table1.length > 0) {
            this.itemDetailData = res.table1.map((item: any) => ({
              itemId: item.itemId || item.item,
              itemCodeid: item.itemCodeId,
              quantity: item.quantity || item.Quantity,
              rate: item.rate || item.Rate,
              discount: item.discount || 0,
              tax: item.tax || 0,
              itemName: this.getItemName(item.itemId || item.item),
              makerCodeName: item.itemCode || this.getMakerCodeName(item.itemCodeId)
            }));
            this.message.add({
              severity: 'success',
              summary: 'Success',
              detail: `${this.itemDetailData.length} items loaded from sales order`
            });
          } else {
            this.itemDetailData = [];
            this.message.add({
              severity: 'warn',
              summary: 'Warning',
              detail: 'No items found in the selected sales order'
            });
          }
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          console.error('Error loading items from sales order:', err);
          this.itemDetailData = [];
          this.message.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load items from sales order'
          });
        }
      });
    } else if (sourceDocId === '10003') {
      // Purchase Request
      this.userService.getQuestionPaper(`uspGetSelectedPurchaseOrderDetails|poid=${docNumber}`).subscribe({
        next: (res: any) => {
          if (res?.table1 && res.table1.length > 0) {
            this.itemDetailData = res.table1.map((item: any) => ({
              itemId: item.itemId,
              itemCodeid: item.itemCodeId,
              quantity: item.quantity,
              rate: item.rate,
              discount: item.discount || 0,
              tax: item.tax || 0,
              itemName: this.getItemName(item.itemId),
              makerCodeName: item.itemCode || this.getMakerCodeName(item.itemCodeId)
            }));
            this.message.add({
              severity: 'success',
              summary: 'Success',
              detail: `${this.itemDetailData.length} items loaded from purchase order`
            });
          } else {
            this.itemDetailData = [];
            this.message.add({
              severity: 'warn',
              summary: 'Warning',
              detail: 'No items found in the selected purchase order'
            });
          }
          this.cdr.detectChanges();
        },
        error: (err: any) => {
          console.error('Error loading items from purchase request:', err);
          this.itemDetailData = [];
          this.message.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load items from purchase order'
          });
        }
      });
    }
  }

  onShipFromChange(): void {
    const shipFromId = this.challanForm.get('shipFrom')?.value;
    if (shipFromId) {
      this.loadShipFromAddress(shipFromId);
    }
  }

  loadShipFromAddress(orgId: number): void {
    this.userService.getQuestionPaper(`uspGetOrgAddress|orgId=${orgId}`).subscribe({
      next: (res: any) => {
        this.shipFromAddressDrpData = res?.table || [];
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error loading ship from address:', err);
        this.shipFromAddressDrpData = [];
      }
    });
  }

  onBillToChange(): void {
    const billToId = this.challanForm.get('billTo')?.value;
    if (billToId) {
      this.loadBillToAddress(billToId);
    }
  }

  loadBillToAddress(customerId: number): void {
    this.userService.getQuestionPaper(`uspGetGatePassDrpData|action=ADDRESS|customerId=${customerId}`).subscribe({
      next: (res: any) => {
        this.billToAddressDrpData = res?.table || [];
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error loading bill to address:', err);
        this.billToAddressDrpData = [];
      }
    });
  }

  onItemChange(): void {
    const itemId = this.itemDetailForm.get('itemId')?.value;
    if (itemId) {
      this.loadMakerCodes(itemId);
    }
  }

loadMakerCodes(itemId: number): void {
  const userId = sessionStorage.getItem('userId') || '';
  const currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
  const roleId = currentRole?.roleId || '';
  this.userService.getQuestionPaper(`uspGetMatReqMasters|action=MAKERCODE|itemId=${itemId}|appUserId=${userId}|appUserRole=${roleId}`)
    .subscribe({
      next: (res: any) => {
        this.makerCodeDrp = (res?.table || []).map((item: any) => ({
          drpValue: Number(item.drpvalue),    // <-- normalize to Number
          drpOption: item.drpoption
        }));
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error loading maker codes:', err);
        this.makerCodeDrp = [];
      }
    });
}


addItemRow(): void {
  if (this.itemDetailForm.invalid) {
    this.itemDetailForm.markAllAsTouched();
    this.message.add({
      severity: 'error',
      summary: 'Validation Error',
      detail: 'Please fill all required item fields'
    });
    return;
  }

  const formValue = this.itemDetailForm.getRawValue();
  
  // Find the maker code option to get the label
  const selectedMakerCode = this.makerCodeDrp.find(
    m => Number(m.drpValue) === Number(formValue.itemCodeid)
  );

  const newItem: ItemDetail = {
     id: formValue.id,
    itemId: formValue.itemId,
    itemCodeid: formValue.itemCodeid,
    quantity: formValue.quantity,
    rate: formValue.rate,
    discount: formValue.discount,
    tax: formValue.tax,
    itemName: this.getItemName(formValue.itemId),
    makerCodeName: selectedMakerCode ? selectedMakerCode.drpOption : 'Unknown Code' // Store the label here
  };

  this.itemDetailData.push(newItem);
  this.message.add({
    severity: 'success',
    summary: 'Added',
    detail: 'Item added successfully'
  });

  // Reset form
  this.itemDetailForm.reset({
    itemId: '',
    itemCodeid: '',
    quantity: '',
    rate: '',
    discount: 0,
    tax: 0
  });
  
  // Don't clear makerCodeDrp immediately if you want to keep adding items with same maker code
  // this.makerCodeDrp = [];
  
  this.cdr.detectChanges();
}

  deleteItemRow(index: number): void {
    this.itemDetailData.splice(index, 1);
    this.message.add({
      severity: 'success',
      summary: 'Removed',
      detail: 'Item removed from list'
    });
    this.cdr.detectChanges();
  }

  getItemName(itemId: number | null): string {
    if (!itemId) return 'Unknown Item';
    const item = this.itemsDrp.find(i => i.drpValue === itemId);
    return item ? item.drpOption : 'Unknown Item';
  }

getMakerCodeName(makerCodeId: number | string | null): string | undefined {
  if (!makerCodeId) return undefined;

  return this.makerCodeDrp.find(m => m.drpValue == makerCodeId)?.drpOption;
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

    const query = `uspGetDeliveryChallanViewNew|searchText=${this.searchText}|pageIndex=${this.pageNo}|size=${this.pageSize}|districtId=${districtId}|appUserId=${userId}|appUserRole=${roleId}`;

    this.userService.getQuestionPaper(query).subscribe({
      next: (res: any) => {
        this.data = res?.table1?.map((item: any) => ({
          ...item,
          id: item.id,
          challanNo: item.challanNO,
          supplyDate: item.supplyDate,
          sourceDocument: item.sourceDocument,
          Shipfrom: item.shipFromText,
          Shipfromaddress: item.shipFromAdressText,
          Shipto: item.shipToText,
          Shiptoadress: item.shipToAddress,
          Billto: item.billToText,
          Billtoadress: item.billToAddressText,
          city: item.city,
          transportMode: item.transportMode,
          vehicleno: item.vehicleno,
          reverseCharge: item.reverseCharge === 'True' ? 'Yes' : 'No',
        })) || [];
        this.totalCount = res?.table?.[0]?.totalCnt || this.data.length;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error loading table data:', err);
        this.message.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load delivery challans'
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

  showDrawer(view: string, data: any = null): void {
    this.isFormLoading = true;
    if (view === 'add') {
      this.initializeAddMode();
    } else {
      this.initializeEditViewMode(view, data);
    }
  }

  private initializeAddMode(): void {
    this.visible = true;
    this.postType = 'add';
    this.header = 'Create Delivery Challan';
    this.headerIcon = 'pi pi-plus';
    
    this.challanForm.reset({ id: 0 });
    this.challanForm.enable();
    this.itemDetailForm.reset({
      discount: 0,
      tax: 0
    });
    this.itemDetailData = [];
    this.isDirect = false;
    this.shipFromAddressDrpData = [];
    this.billToAddressDrpData = [];
    this.referenceNumberDrpData = [];
    this.makerCodeDrp = [];
    
    this.isFormLoading = false;
    this.cdr.detectChanges();
  }

  private initializeEditViewMode(view: string, data: any): void {
    this.visible = true;
    this.postType = view;
    this.header = view === 'update' ? 'Update Delivery Challan' : 'View Delivery Challan';
    this.headerIcon = view === 'update' ? 'pi pi-pencil' : 'pi pi-eye';
    if (view === 'view') {
      this.challanForm.disable();
      this.itemDetailForm.disable();
    } else {
      this.challanForm.enable();
      this.itemDetailForm.enable();
    }
    this.loadChallanData(data);
  }

  private loadChallanData(data: any): void {
    const patchData = {
      id: data.id || 0,
      
      sourceDocumentId: data.sourceDocumentId?.toString() || '',
      prMainId: data.referenceId || '',
      shipFrom: data.shipFrom,
      shipFromAddress: data.shipFromAddress,
      shipTo: data.shipTo,
      shipToAddress: data.shipToAddress || '',
      billTo: data.billTo,
      billToAddress: data.billToAddress,
      transportMode: data.transportModeId,
      transporter: data.transportername,
      stateid: data.cityId,
      vehicleno: data.vehicleno || '',
      supplyDate: data.supplyDate ? new Date(this.parseDateString(data.supplyDate)) : null,
      reverseCharge: data.reverseCharge === 'True' || data.reverseCharge === true,
      remarks: data.remarks || '',
    };

    this.challanForm.patchValue(patchData);
    this.isDirect = data.sourceDocumentId === 10000;
    this.loadDependentDropdownsForEdit(data);
    this.parseAndLoadItemDetails(data.itemDetail);
    this.isFormLoading = false;
    this.cdr.detectChanges();
  }

  private parseDateString(dateStr: string): Date {
    if (dateStr.includes('-')) {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      }
    }
    return new Date(dateStr);
  }

private parseAndLoadItemDetails(itemDetailString: string): void {
  this.itemDetailData = [];
  if (!itemDetailString || itemDetailString === 'null' || itemDetailString === 'undefined') {
    return;
  }

  try {
    let itemDetails: any[] = typeof itemDetailString === 'string'
      ? JSON.parse(itemDetailString)
      : itemDetailString;

    this.itemDetailData = itemDetails.map((item: any) => {
      const detail: ItemDetail = {
        id: item.id,
        itemId: item.itemId || item.item,
        itemCodeid: item.itemCodeId || item.itemCodeid,
        quantity: item.Quantity || item.quantity || 0,
        rate: item.Rate || item.rate || 0,
        discount: item.discount || 0,
        tax: item.tax || 0,
        itemName: this.getItemName(item.itemId || item.item),
        makerCodeName: item.makerCode || item.makerCodeName || 'Unknown Code' // ✅ Use the stored value
      };

      return detail;
    });

    this.cdr.detectChanges();
  } catch (error) {
    console.error('Error parsing item details:', error);
    this.itemDetailData = [];
  }
}


  private loadDependentDropdownsForEdit(data: any): void {
    if (data.shipFrom) {
      this.loadShipFromAddress(data.shipFrom);
    }
    if (data.billTo) {
      this.loadBillToAddress(data.billTo);
    }
    if (data.sourceDocumentId !== 10000) {
      const sourceDocId = data.sourceDocumentId?.toString();
      
      if (sourceDocId === '10009') {
        this.loadReferenceNumbersForEdit(data.referenceId);
      } else if (sourceDocId === '10003') {
        this.loadPurchaseRequestNumbersForEdit(data.referenceId);
      }
    } else {
      this.challanForm.get('prMainId')?.disable();
      this.referenceNumberDrpData = [];
    }
  }

  private loadReferenceNumbersForEdit(selectedId: number): void {
    this.userService.getQuestionPaper(`uspGetSalesOrderDrp|districtID=${sessionStorage.getItem('District')}`).subscribe({
      next: (res: any) => {
        this.referenceNumberDrpData = res?.table || [];
        if (selectedId && !this.referenceNumberDrpData.some(opt => opt.drpValue === selectedId)) {
          this.referenceNumberDrpData.push({
            drpValue: selectedId,
            drpOption: `Sales Order #${selectedId}`
          });
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error loading reference numbers for edit:', err);
        this.referenceNumberDrpData = [];
      }
    });
  }

  private loadPurchaseRequestNumbersForEdit(selectedId: number): void {
    this.userService.getQuestionPaper(`uspGetPurchaseOrderDrp`).subscribe({
      next: (res: any) => {
        this.referenceNumberDrpData = res?.table || [];
        if (selectedId && !this.referenceNumberDrpData.some(opt => opt.drpValue === selectedId)) {
          this.referenceNumberDrpData.push({
            drpValue: selectedId,
            drpOption: `Purchase Order #${selectedId}`
          });
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error loading purchase request numbers for edit:', err);
        this.referenceNumberDrpData = [];
      }
    });
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    
    if (this.validateCurrentStep() && this.challanForm.valid && this.itemDetailData.length > 0) {
      this.confirmationService.confirm({
        message: 'Are you sure you want to submit this delivery challan?',
        header: 'Confirm Submission',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.submitChallan();
        }
      });
    } else {
      if (this.challanForm.invalid) {
        this.challanForm.markAllAsTouched();
        this.message.add({
          severity: 'error',
          summary: 'Validation Error',
          detail: 'Please fill all required fields in Basic Information'
        });
      }
      if (this.itemDetailData.length === 0) {
        this.message.add({
          severity: 'error',
          summary: 'Validation Error',
          detail: 'Please add at least one item'
        });
      }
    }
  }

  private submitChallan(): void {
    this.isFormLoading = true;
    const formData = this.challanForm.getRawValue();
    const itemDetailsForSubmission = this.itemDetailData.map(item => ({
      id: item.id || 0,
      itemCodeId: item.itemCodeid,
      quantity: item.quantity,
      rate: item.rate,
      discount: item.discount,
      tax: item.tax,
      itemId: item.itemId
    }));


    const headerJson = [{
      id: formData.id || 0,
      SourceDocumentId: formData.sourceDocumentId,
      PRMainId: formData.prMainId || 0,
      ShipFrom: formData.shipFrom,
      ShipTo: formData.shipTo,
      BillTo: formData.billTo,
      ShipFromAddress: formData.shipFromAddress,
      ShipToAddress: formData.shipToAddress,
      BillToAddress: formData.billToAddress,
      vehicleno: formData.vehicleno || '',
      SupplyDate: this.formatDate(formData.supplyDate),
      reverseCharge: formData.reverseCharge,
      transportMode: formData.transportModeId,
      stateid: formData.stateid,
      remarks: formData.remarks,
      transporter: formData.transporter,
      districtId: sessionStorage.getItem('District') || ''
    }];

    const currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
    const roleId = currentRole?.roleId || '';
    const userId = sessionStorage.getItem('userId') || '';
    const districtId = sessionStorage.getItem('District') || '';

    let query = `tblPRSettelmentHeader=${JSON.stringify(headerJson)}`;
    query += `|tblPRSettelmentChild=${JSON.stringify(itemDetailsForSubmission)}`;
    query += `|appUserId=${userId}`;
    query += `|districtId=${districtId}`;

    const storedProcedure = this.postType === 'update' ? 'uspUpdateDeliveryChallan' : 'uspPostDeliveryChallan';

    this.userService.SubmitPostTypeData(storedProcedure, query, this.FormName).subscribe({
      next: (response: any) => {
        this.isFormLoading = false;
        
        if (!response) {
          this.message.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No response from server'
          });
          return;
        }

        if (typeof response === 'string') {
          if (response.toLowerCase().includes('success')) {
            this.message.add({
              severity: 'success',
              summary: 'Success',
              detail: this.postType === 'update' 
                ? 'Delivery Challan Updated Successfully.'
                : 'Delivery Challan Created Successfully.',
            });
            this.onDrawerHide();
            this.getTableData(false);
          } else {
            this.message.add({
              severity: 'warn',
              summary: 'Warning',
              detail: response
            });
          }
        }

        else if (response.result === 1) {
          this.message.add({
            severity: 'success',
            summary: 'Success',
            detail: this.postType === 'update' 
              ? 'Delivery Challan Updated Successfully.'
              : 'Delivery Challan Created Successfully.',
          });
          this.onDrawerHide();
          this.getTableData(false);
        }
        else if (response.result === 2) {
          this.message.add({
            severity: 'warn',
            summary: 'Warning',
            detail: response.msg || 'Operation failed.'
          });
        }
        else {
          this.message.add({
            severity: 'warn',
            summary: 'Warning',
            detail: response.errormessage || 'Unknown error occurred.'
          });
        }

        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Submit error:', error);
        this.isFormLoading = false;

        this.message.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to submit delivery challan'
        });

        this.cdr.detectChanges();
      }
    });
  }



  onItemAction(item: any, action: string): void {
    if (action === 'Delete') {
      this.confirmationService.confirm({
        message: 'Are you sure you want to delete this delivery challan?',
        header: 'Confirm Deletion',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.deleteChallan(item.id);
        }
      });
    }
  }

  private deleteChallan(id: number): void {
    const currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
    const roleId = currentRole?.roleId || '';
    const userId = sessionStorage.getItem('userId') || '';
    const districtId = sessionStorage.getItem('District') || '';
    const query = `id=${id}|action=Delete|appUserId=${userId}|appUserRole=${roleId}|districtId=${districtId}`;
    this.userService.SubmitPostTypeData('uspDeleteDeliveryChallan', query, this.FormName).subscribe({
      next: (response: any) => {
        if (response && response.toLowerCase().includes('success')) {
          this.message.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Delivery Challan deleted successfully!'
          });
          this.getTableData(false);
        } else {
          this.message.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete delivery challan'
          });
        }
      },
      error: (error: any) => {
        console.error('Delete error:', error);
        this.message.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete delivery challan'
        });
      }
    });
  }

  closePrintDialog(): void {
    this.printDialogVisible = false;
    this.printData = null;
    this.selectedChallanIdForPrint = null;
  }

printChallan(data: any) {
  this.isPrintLoading = true;

  // Get the item details from your data
  let itemDetails: any[] = [];
  let headerDetails: any = {};
  let itemSummary: any = {};

  try {
    // Parse item details if they exist
    if (data.itemDetail && typeof data.itemDetail === 'string') {
      itemDetails = JSON.parse(data.itemDetail);
    }
    
    // Get header details from your data object
    headerDetails = {
      challanNo: data.challanNO || '-',
      date: new Date().toLocaleDateString('en-IN'), // Current date
      supplyDate: data.supplyDate ? this.formatDate(new Date(data.supplyDate)) : '-',
      transportMode: data.transportMode || '-',
      vehicleno: data.vehicleno || '',
      transportername: data.transportername || '',
      reverseCharge: data.reverseCharge === 'True' || data.reverseCharge === true ? 'Yes' : 'No',
      referenceNo: data.referenceId || '-',
      source: data.sourceDocument || '-',
      shipFromState: data.shipFromState || '-',
      shipFromGstCode: data.shipFromGstCode || '-',
      shipFrom: data.shipFromText || '-',
      shipFromAddress: data.shipFromAdressText || '-',
      shipFromGSTINNO: data.shipFromGSTINNO || '-',
      billTo: data.billToText || '-',
      billToAddress: data.billToAddressText || '-',
      billToGSTINNO: data.billToGSTINNO || '-',
      billToState: data.billToState || '-',
      billToGstCode: data.billToGstCode || '-',
      shipTo: data.shipToText || '-',
      shipToAddress: data.shipToAddress || '-',
      remarks: data.remarks || '',
      headerText: data.shipFromText, // Customize this
      headAddress: data.shipFromAdressText// Customize this
    };

    // Calculate totals
    let totalQtyChallan = 0;
    let totalRateChallan = 0;
    let totalAmountChallan = 0;
    let totalDiscountChallan = 0;
    let totalTaxableValue = 0;
    let GrandTotalChallan = 0;
    let GstChallan = 0;
    let reverseAmt = 0;
    
    itemDetails.forEach((item: any) => {
      const qty = item.Quantity || item.quantity || 0;
      const rate = item.Rate || item.rate || 0;
      const amount = qty * rate;
      const discount = item.discount || 0;
      const tax = item.tax || 0;
      const taxableValue = amount - discount;
      const total = taxableValue + tax;
      
      totalQtyChallan += qty;
      totalRateChallan += rate;
      totalAmountChallan += amount;
      totalDiscountChallan += discount;
      totalTaxableValue += taxableValue;
      GstChallan += tax;
      GrandTotalChallan += total;
      
      if (headerDetails.reverseCharge === 'Yes') {
        reverseAmt = total * 0.18; // Assuming 18% GST for reverse charge
      }
    });

    itemSummary = {
      totalQtyChallan: totalQtyChallan.toFixed(2),
      totalRateChallan: totalRateChallan.toFixed(2),
      totalAmountChallan: totalAmountChallan.toFixed(2),
      totalDiscountChallan: totalDiscountChallan.toFixed(2),
      totalTaxableValue: totalTaxableValue.toFixed(2),
      GrandTotalChallan: GrandTotalChallan.toFixed(2),
      GstChallan: GstChallan.toFixed(2),
      reverseAmt: reverseAmt.toFixed(2),
      payAmt: GrandTotalChallan + reverseAmt
    };

  } catch (e) {
    console.error("Error preparing print data:", e);
    this.isPrintLoading = false;
    this.message.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to prepare print data'
    });
    return;
  }

  setTimeout(() => {
    this.isPrintLoading = false;

    // Convert amounts to words (you'll need to implement this method)
    const amountInWords = this.digitToWords(itemSummary.payAmt) || '';

    // Build the HTML using your template
    const printContents = `
      <html>
      <head>
        <title>Delivery Challan</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            font-size: 13px; 
            background-color: white;
          }

          .delivery-challan-table {
            max-width: 100vw;
            padding: 12px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 1rem;
          }

          th, td {
            border: 1px solid black;
            padding: 8px;
            text-align: left;
          }

          th {
            background-color: #d2d2d2;
            font-weight: bold;
          }

          h1, h2, h3 {
            margin: 0;
            padding: 0;
          }

          .text-center {
            text-align: center;
          }

          .uppercase {
            text-transform: uppercase;
          }

          .print-button-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
          }

          .print-button {
            padding: 10px 20px;
            background: #2196F3;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
          }

          .print-button:hover {
            background: #1976D2;
          }

          @media print {
            .print-button-container {
              display: none;
            }
            body {
              margin: 0;
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-button-container">
          <button class="print-button" onclick="window.print()">Print</button>
        </div>

        <div style="border:1px solid black; max-width:100vw;padding:12px" class="delivery-challan-table">
          <table style="width:100%;margin-top: 1rem;align-items:center; border: none;">
            <tr style="align-items:center;">
              <td style="width: 100%;text-align:center; border: none;">
                <h2 style="font-size: 22px;text-transform:uppercase;">${headerDetails.headerText}</h2>
              </td>
            </tr>

            <tr>
              <td style="width: 100%;text-align:center;padding:0; border: none;">
                <h2 style="font-size: 18px;text-transform:uppercase;">${headerDetails.headAddress}</h2>
                <h2 style="font-size: 18px;">GSTIN: ${headerDetails.shipFromGSTINNO}</h2>
              </td>
            </tr>

            <tr style="border:0px solid black;width:100%">
              <td style="padding: 0px; border: none;">
                <h1 style="font-size: 20px; margin-top: 1rem;border:1px solid;height: 60px;align-items: center;display:flex;justify-content: center;background-color: #d2d2d2;">
                  Delivery Challan
                </h1>
              </td>
            </tr>
          </table>

          <table style="width:100%; border: 1px solid; border-collapse: collapse; margin-top: 1rem;">
            <tr>
              <td style="border: 1px solid; border-right: none;">Challan No:</td>
              <td style="border: 1px solid;">${headerDetails.challanNo}</td>
              <td style="border: 1px solid;">Transport Mode:</td>
              <td style="border: 1px solid;">${headerDetails.transportMode}</td>
            </tr>
            <tr>
              <td style="border: 1px solid; border-right: none;">Date:</td>
              <td style="border: 1px solid;">${headerDetails.date}</td>
              <td style="border: 1px solid;">Vehicle Number:</td>
              <td style="border: 1px solid;">
                ${headerDetails.vehicleno ? headerDetails.vehicleno : ''}
                ${headerDetails.vehicleno && headerDetails.transportername ? ' - ' : ''}
                ${headerDetails.transportername ? headerDetails.transportername : ''}
              </td>
            </tr>
            <tr>
              <td style="border: 1px solid; border-right: none;">Reverse Charge:</td>
              <td style="border: 1px solid;">${headerDetails.reverseCharge}</td>
              <td style="border: 1px solid;">Date of Supply:</td>
              <td style="border: 1px solid;">${headerDetails.supplyDate}</td>
            </tr>
            <tr>
              <td style="border: 1px solid; border-right: none;">Reference No:</td>
              <td style="border: 1px solid;">${headerDetails.referenceNo}</td>
              <td style="border: 1px solid;">Source:</td>
              <td style="border: 1px solid;">${headerDetails.source}</td>
            </tr>
            <tr>
              <td style="border: 1px solid;">State: ${headerDetails.shipFromState}</td>
              <td style="border: 1px solid;">Code: ${headerDetails.shipFromGstCode}</td>
              <td style="border: 1px solid;">Place of Supply:</td>
              <td style="border: 1px solid;">${headerDetails.shipToAddress}</td>
            </tr>
          </table>

          <table style="width:100%;border: 1px solid;border-collapse: collapse;margin-top: 1rem;">
            <tr>
              <th style="border: 1px solid;background-color: #d2d2d2;">Ship From</th>
              <th style="border: 1px solid;background-color: #d2d2d2;" colspan="2">Bill to</th>
              <th style="border: 1px solid;background-color: #d2d2d2;" colspan="2">Ship to</th>
            </tr>
            <tr>
              <td style="border: 1px solid;">Name: ${headerDetails.shipFrom}</td>
              <td style="border: 1px solid;" colspan="2">Name: ${headerDetails.billTo}</td>
              <td style="border: 1px solid;" colspan="2">Name: ${headerDetails.shipTo}</td>
            </tr>
            <tr>
              <td style="border: 1px solid;" rowspan="3">Address: ${headerDetails.shipFromAddress}</td>
              <td style="border: 1px solid;" colspan="2">Address: ${headerDetails.billToAddress}</td>
              <td style="border: 1px solid;" colspan="2" rowspan="3">Address: ${headerDetails.shipToAddress}</td>
            </tr>
            <tr>
              <td style="border: 1px solid;" colspan="2">GSTIN NO: ${headerDetails.billToGSTINNO}</td>
            </tr>
            <tr>
              <td style="border: 1px solid;">State: ${headerDetails.billToState}</td>
              <td style="border: 1px solid;" rowspan="2">Code: ${headerDetails.billToGstCode}</td>
            </tr>
          </table>

          <table style="width:100%;border-collapse: collapse;margin-top: 1rem;display:block;overflow-x:auto;">
            <tr style="width:100%;">
              <td style="border: 1px solid;background-color: #d2d2d2;width: 10%;" rowspan="2">S.No</td>
              <td style="border: 1px solid;background-color: #d2d2d2; width: 10%;" rowspan="2">Product Description</td>
              <td style="border: 1px solid;background-color: #d2d2d2; width: 10%;" rowspan="2">Maker Code</td>
              <td style="border: 1px solid;background-color: #d2d2d2; width: 10%;" rowspan="2">UOM</td>
              <td style="border: 1px solid;background-color: #d2d2d2; width: 10%;" rowspan="2">HSN Code</td>
              <td style="border: 1px solid;background-color: #d2d2d2; width: 10%;" rowspan="2">Qty</td>
              <td style="border: 1px solid;background-color: #d2d2d2;width: 10%;" rowspan="2">Rate</td>
              <td style="border: 1px solid;background-color: #d2d2d2;width: 10%;" rowspan="2">Amount</td>
              <td style="border: 1px solid;background-color: #d2d2d2;width: 10%;" rowspan="2">Discount</td>
              <td style="border: 1px solid;background-color: #d2d2d2;width: 10%;" rowspan="2">Taxable Value</td>
              <td style="border: 1px solid;background-color: #d2d2d2;width: 10%; text-align:center" colspan="2">IGST</td>
              <td style="border: 1px solid;background-color: #d2d2d2;width: 10%;" rowspan="2">Total</td>
            </tr>
            <tr>
              <td style="border: 1px solid;background-color: #d2d2d2;">Rate</td>
              <td style="border: 1px solid;background-color: #d2d2d2;">Amount</td>
            </tr>

            ${itemDetails.map((item: any, index: number) => `
              <tr style="border: 1px solid;width:100%;">
                <td style="border: 1px solid;width: 10%;">${index + 1}</td>
                <td style="border: 1px solid;width: 10%;">${item.itemName || this.getItemName(item.itemId)}</td>
                <td style="border: 1px solid;width: 10%;">${item.makerCode || this.getMakerCodeName(item.itemCodeid)}</td>
                <td style="border: 1px solid;width: 10%;">${item.uom || '-'}</td>
                <td style="border: 1px solid;width: 10%;">${item.hsnCode || '-'}</td>
                <td style="border: 1px solid;width: 10%;">${item.quantity || item.Quantity || 0}</td>
                <td style="border: 1px solid;width: 10%;">${(item.rate || item.Rate || 0).toFixed(2)}</td>
                <td style="border: 1px solid;width: 10%;">${((item.quantity || item.Quantity || 0) * (item.rate || item.Rate || 0)).toFixed(2)}</td>
                <td style="border: 1px solid;width: 10%;">${(item.discount || 0).toFixed(2)}</td>
                <td style="border: 1px solid;width: 10%;">${((item.quantity || item.Quantity || 0) * (item.rate || item.Rate || 0) - (item.discount || 0)).toFixed(2)}</td>
                <td style="border: 1px solid;width: 10%;"></td>
                <td style="border: 1px solid;width: 10%;"></td>
                <td style="border: 1px solid;width: 10%;">${(((item.quantity || item.Quantity || 0) * (item.rate || item.Rate || 0)) - (item.discount || 0) + (item.tax || 0)).toFixed(2)}</td>
              </tr>
            `).join('')}

            <tr style="border: 1px solid">
              <td style="border: 1px solid;background-color: #d2d2d2;text-align: center;" colspan="3">Total</td>
              <td style="border: 1px solid;width: 10%;">${itemSummary.totalQtyChallan}</td>
              <td style="border: 1px solid;width: 10%;">${itemSummary.totalRateChallan}</td>
              <td style="border: 1px solid;width: 10%;">${itemSummary.totalAmountChallan}</td>
              <td style="border: 1px solid;width: 10%;">${itemSummary.totalDiscountChallan}</td>
              <td style="border: 1px solid;width: 10%;">${itemSummary.totalTaxableValue}</td>
              <td style="border: 1px solid;width: 10%;"></td>
              <td style="border: 1px solid;width: 10%;"></td>
              <td style="border: 1px solid;width: 10%;">${itemSummary.GrandTotalChallan}</td>
            </tr>
          </table>

          <table style="width:100%;border: 1px solid;border-collapse: collapse;margin-top: 1rem;">
            <tr style="border: 1px solid;width:100%;">
              <td style="border: 1px solid;" rowspan="2">Total Invoice Amount in Words: ${amountInWords}</td>
              <td style="border: 1px solid;" colspan="1">Total Amount Before Tax</td>
              <td style="border: 1px solid;" colspan="1">${itemSummary.totalAmountChallan}</td>
            </tr>

            <tr>
              <td style="border: 1px solid;">Add: GST</td>
              <td style="border: 1px solid;">${itemSummary.GstChallan}</td>
            </tr>

            <tr>
              <td>Remarks:- ${headerDetails.remarks}</td>
              <td style="border: 1px solid;">Grand Total</td>
              <td style="border: 1px solid;">${itemSummary.GrandTotalChallan}</td>
            </tr>

            <tr>
              <td></td>
              <td style="border: 1px solid;">GST on Reverse Charge</td>
              <td style="border: 1px solid;">${itemSummary.reverseAmt}</td>
            </tr>

            <tr>
              <td></td>
              <td style="border: 1px solid;border-bottom: none;font-size:12px;" colspan="2">
                Certified that the particulars given above are true and correct
              </td>
            </tr>

            <tr style="height:100px">
              <td></td>
              <td style="border: 1px solid; text-align: center;border-bottom: none;border-top: none;" colspan="2">
                <b>Authorized Signatory</b>
              </td>
            </tr>

            <tr>
              <td></td>
              <td colspan="2" style="border: 1px solid; text-align: center;border-top:none;" colspan="2">
                Authorised Signatory
              </td>
            </tr>
          </table>
        </div>
      </body>
      </html>
    `;

    // Center Popup
    const width = window.screen.availWidth * 0.9;
    const height = window.screen.availHeight * 0.9;
    const left = (window.screen.availWidth - width) / 2;
    const top = (window.screen.availHeight - height) / 2;

    const popupWin = window.open(
      "",
      "_blank",
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes,toolbar=no,location=no,menubar=no`
    );

    // Handle case where popup is blocked
    if (!popupWin) {
      this.message.add({
        severity: 'warn',
        summary: 'Popup Blocked',
        detail: 'Please allow popups for this site to print the challan'
      });
      return;
    }

    popupWin.document.open();
    popupWin.document.write(printContents);
    popupWin.document.close();
    
    // Auto print after a short delay
    setTimeout(() => {
      try {
        popupWin.focus();
        popupWin.print();
      } catch (e) {
        console.error('Print error:', e);
      }
    }, 500);

  }, 300);
}



private formatDate(date: Date): string {
  if (!date) return '';
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

private digitToWords(amount: number): string {
  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  // This is a simplified version - you should implement a proper conversion
  return 'Rupees ' + amount.toFixed(2).replace('.', ' and ') + ' Only';
}


  clearForm(): void {
    this.challanForm.reset({ id: 0 });
    this.itemDetailForm.reset({
      discount: 0,
      tax: 0
    });
    this.itemDetailData = [];
    this.isDirect = false;
    this.challanForm.get('prMainId')?.enable();
    this.shipFromAddressDrpData = [];
    this.billToAddressDrpData = [];
    this.referenceNumberDrpData = [];
    this.makerCodeDrp = [];
    
    this.cdr.detectChanges();
  }

  onDrawerHide(): void {
    this.visible = false;
    this.clearForm();
  }

  trackByIndex(index: number): number {
    return index;
  }
}