import { Component, ChangeDetectorRef } from '@angular/core';
import { TableTemplate, TableColumn } from '../../table-template/table-template';
import { ButtonModule } from 'primeng/button';
import { Popover } from 'primeng/popover';
import { Tooltip } from "primeng/tooltip";
import { Dialog } from 'primeng/dialog';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { CardModule } from 'primeng/card';
import { DrawerModule } from 'primeng/drawer';
import { UserService } from '../../shared/user-service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Toast } from 'primeng/toast';
import { MultiSelectModule } from 'primeng/multiselect';
import { Customvalidation, noInvalidPipelineName, requiredCheckboxValue, validTimeFormat } from '../../shared/Validation';
import { TableModule } from 'primeng/table';

interface ScrapMaterial {
  scrapItemName: any;
  scrapItemNameLabel: string;
  scrapQuantity: any;
  scrapUnit: any;
  scrapUnitLabel: string;
  scrapRate: any;
}

export interface ScrapProcessLoss {
  processLossItemName: any;
  processLossItemNameLabel: string;
  processLossQuantity: any;
  processLossUnit: any;
  processLossUnitLabel: string;
  processLossRate: any;
}

@Component({
  selector: 'app-corprate-organization',
  imports: [
    TableTemplate,
    CardModule,
    ButtonModule,
    DrawerModule,
    Popover,
    FormsModule,
    CommonModule,
    TableModule,
    ReactiveFormsModule,
    SelectModule,
    DatePickerModule,
    ConfirmDialog,
    ProgressSpinner,
    MultiSelectModule,
    Toast,
    Tooltip,
    Dialog
  ],
  providers: [
    ConfirmationService,
    MessageService
  ],
  templateUrl: './corprate-organization.html',
  styleUrl: './corprate-organization.scss'
})

export class CorprateOrganization {
  isLoading = true;
  visible: boolean = false;
  postType: string = '';
  header: any = '';
  selectedIndex: any = [];
  headerIcon: string = 'pi pi-plus';
  paramvaluedata: string = '';
  isFormLoading: boolean = false;
  data: any[] = [];
  groupMasterForm1: FormGroup;
  scrapMaterialForm: FormGroup;
  editingProcessLossIndex: number | null = null;

  // Process Loss List
  scrapProcessLossList: {
    processLossItemName: string;
    processLossItemNameLabel?: string;
    processLossQuantity: number;
    processLossUnit: string;
    processLossUnitLabel?: string;
    processLossRate: number;
  }[] = [];


  // Scrap Material List
  scrapMaterialList: {
    scrapItemName: string;
    scrapItemNameLabel?: string;
    scrapQuantity: number;
    scrapUnit: string;
    scrapUnitLabel?: string;
    scrapRate: number;
  }[] = [];


  scrapProcessLossForm: FormGroup;
  editingLossIndex: number | null = null;
  editingIndex: number | null = null;
  groupListArray = []
  groupListArray1 = []
  totalCount = 0;


  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true, },
    { key: 'bomName', header: 'Item Name', isVisible: true, isSortable: false },
    { key: 'unit', header: 'Unit of Measurement', isVisible: true, isSortable: false },
    { key: 'quantity', header: 'Quantity ', isVisible: true, isSortable: false },
    { key: 'basedOn', header: 'Rate of Materials Based on', isVisible: true, isSortable: false },
    { key: 'text', header: 'Currency ', isVisible: true, isSortable: false },
    { key: 'transferAgainst', header: 'Transfer Material Against', isVisible: true, isSortable: false },
    { key: 'routing', header: 'Routing', isVisible: true, isSortable: false },
    { key: 'processLossQuantity', header: 'Process Lost Quantity', isVisible: true, isSortable: false },
    { key: 'scrapPrcntProcesLoss', header: 'Process Loss', isVisible: true, isSortable: false },
    { key: 'operatingCost', header: 'Operating Cost', isVisible: true, isSortable: false },
    { key: 'rawMaterialCost', header: 'Raw Material Cost', isVisible: true, isSortable: false },
    { key: 'scrapMaterialCost', header: 'Scrap Material Cost', isVisible: true, isSortable: false },
    { key: 'totalCost', header: 'Total Cost', isVisible: true, isSortable: false },
    { key: 'qualityInspectReq', header: 'Quality Inspection Required', isVisible: true, isSortable: false },
    { key: 'jsonDetails', header: 'BOM Raw Material', isVisible: true, isSortable: false, isCustom: true },
    { key: 'jsonDetails1', header: 'Scrap and Process Loss', isVisible: true, isSortable: false, isCustom: true },
  ];


  // Add / Update Scrap Item
  addScrapItem(): void {
    if (this.scrapMaterialForm.invalid) {
      this.scrapMaterialForm.markAllAsTouched();
      return;
    }

    const formValue = this.scrapMaterialForm.value;
    const scrapItem = {
      scrapItemName: formValue.scrapItemName,
      scrapItemNameLabel: this.ItemMasterDrp.find((item: { drpOption: string; drpValue: string }) => item.drpValue === formValue.scrapItemName)?.drpOption || '',
      scrapQuantity: parseFloat(formValue.scrapQuantity),
      scrapUnit: formValue.scrapUnit,
      scrapUnitLabel: this.UnitMasterDrp.find((u: { drpOption: string; drpValue: string }) => u.drpValue === formValue.scrapUnit)?.drpOption || '',
      scrapRate: parseFloat(formValue.scrapRate),
    };

    if (this.editingIndex !== null) {
      this.scrapMaterialList[this.editingIndex] = scrapItem;
      this.editingIndex = null;
    } 
    else {
      this.scrapMaterialList.push(scrapItem);
    }

    this.scrapMaterialForm.reset();
  }

  
  // Edit Scrap Item
  editScrapItem(index: number): void {
    const item = this.scrapMaterialList[index];
    const selectedItemValue = this.ItemMasterDrp.find((x: any) => x.drpOption === item.scrapItemNameLabel)?.drpValue || null;
    const selectedUnitValue = this.UnitMasterDrp.find((x: any) => x.drpOption === item.scrapUnitLabel)?.drpValue || null;

    this.scrapMaterialForm.patchValue({
      scrapItemName: selectedItemValue,
      scrapQuantity: item.scrapQuantity,
      scrapUnit: selectedUnitValue,
      scrapRate: item.scrapRate,
    });

    this.editingIndex = index;
  }

  // Delete Scrap Item
  deleteScrapItem(index: number): void {
    this.scrapMaterialList.splice(index, 1);
  }


  // Add / Update Process Loss Item
  addProcessLossItem(): void {
    if (this.scrapProcessLossForm.invalid) {
      this.scrapProcessLossForm.markAllAsTouched();
      return;
    }

    const formValue = this.scrapProcessLossForm.value;

    const processLossItem = {
      processLossItemName: formValue.processLossItemName,
      processLossItemNameLabel: this.ItemMasterDrp.find((item: { drpOption: string; drpValue: string }) => item.drpValue === formValue.processLossItemName)?.drpOption || '',
      processLossQuantity: parseFloat(formValue.processLossQuantity),
      processLossUnit: formValue.processLossUnit,
      processLossUnitLabel: this.UnitMasterDrp.find((u: { drpOption: string; drpValue: string }) => u.drpValue === formValue.processLossUnit)?.drpOption || '',
      processLossRate: parseFloat(formValue.processLossRate),
    };

    if (this.editingProcessLossIndex !== null) {
      this.scrapProcessLossList[this.editingProcessLossIndex] = processLossItem;
      this.editingProcessLossIndex = null;
    }
    else {
      this.scrapProcessLossList.push(processLossItem);
    }
    this.scrapProcessLossForm.reset();
  }


  // Edit Process Loss Item
  editProcessLossItem(index: number): void {
    const item = this.scrapProcessLossList[index];
    const selectedItemValue = this.ItemMasterDrp.find((x: any) => x.drpOption === item.processLossItemNameLabel)?.drpValue || null;
    const selectedUnitValue = this.UnitMasterDrp.find((x: any) => x.drpOption === item.processLossUnitLabel)?.drpValue || null;

    this.scrapProcessLossForm.patchValue({
      processLossItemName: selectedItemValue,
      processLossQuantity: item.processLossQuantity,
      processLossUnit: selectedUnitValue,
      processLossRate: item.processLossRate,
    });

    this.editingProcessLossIndex = index;
  }


  // Delete Process Loss Item (optional)
  deleteProcessLossItem(index: number): void {
    this.scrapProcessLossList.splice(index, 1);
  }

  pageNo = 1;
  pageSize = 5;
  searchText = '';
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  workStationDrp: any = []
  routingDrp: any = []
  transferMaterialDrp: any = [];
  ValuationMDrp: any = [];
  CurrencyMasteDrp: any = [];
  UnitMasterDrp: any = [];
  ItemMasterDrp: any = []
  selectedrowIndex: any
  itemDailog: boolean = false
  itemDailog1: boolean = false
  scrapItemsTable: any[] = [];    // ✅ store added scrap items
  isScrapEditMode: boolean = false;
  editIndex: number | null = null;

  constructor(private fb: FormBuilder,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private message: MessageService,
    public Customvalidation: Customvalidation,
    private cdr: ChangeDetectorRef) {

    this.groupMasterForm1 = this.fb.group({
      industryName: ['', Validators.required],



      itemName: ['', [Validators.required, noInvalidPipelineName()]],
      unitMeasurement: ['', [Validators.required]],
      rateMaterialsBased: ['', Validators.required],
      Currency: ['', Validators.required],
      tansferMaterialAgainst: ['', Validators.required],
      routing: ['', Validators.required],
      Operations: ['', Validators.required],
      processLostQuantity: ['', Validators.required],
      processLoss: ['', Validators.required],
      operatingCost: ['', Validators.required],
      rawMaterialCost: ['', Validators.required],
      scrapMaterialCost: ['', Validators.required],
      totalCost: ['', Validators.required],
      isinspectionReq: [false, [Validators.requiredTrue]]
    });

    this.scrapMaterialForm = this.fb.group({
      scrapItemName: ['', Validators.required],
      scrapQuantity: ['', Validators.required],
      scrapUnit: ['', Validators.required],
      scrapRate: ['', Validators.required]
    });

    this.scrapProcessLossForm = this.fb.group({
      processLossItemName: ['', Validators.required],
      processLossQuantity: ['', Validators.required],
      processLossUnit: ['', Validators.required],
      processLossRate: ['', Validators.required]
    });

  }

  get f() { return this.groupMasterForm1.controls }

  ngOnInit(): void {
    this.getTableData(true);
    this.getWorkStationMaster()
    this.getFormTypeMaster()
    this.geetValuationMaster()
    this.getUnitMaster();
    this.getCurrencyMaster()
    this.getMaterialDrp()
    this.getRoutingDrp()
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }


  onCheckboxChange(fieldName: string, event: any) {
    const isChecked = event.target.checked;
    this.groupMasterForm1.get(fieldName)?.setValue(isChecked);
  }

  allowOnlyNumbers(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  getWorkStationMaster() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
    const currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
    const roleId = currentRole?.roleId || '';
    const userId = sessionStorage.getItem('userId') || '';
    const districtId = sessionStorage.getItem('District') || '';
    this.userService.getQuestionPaper(`uspGetOperationMaster|appUserId=${userId}|appUserRole=${roleId}|districtId=${districtId}`).subscribe((res: any) => {
      this.workStationDrp = res['table']
    })

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }
  

  getFormTypeMaster() {
    const currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
    const roleId = currentRole?.roleId || '';
    const userId = sessionStorage.getItem('userId') || '';
    const districtId = sessionStorage.getItem('District') || '';
    this.userService.getQuestionPaper(`uspGetFormTypeMaster|appUserId=${userId}|appUserRole=${roleId}|districtId=${districtId}`).subscribe((res: any) => {
      this.transferMaterialDrp = res['table']
    })
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }


  geetValuationMaster() {
    const currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
    const roleId = currentRole?.roleId || '';
    const userId = sessionStorage.getItem('userId') || '';
    const districtId = sessionStorage.getItem('District') || '';
    this.userService.getQuestionPaper(`uspGetValuationMaster|appUserId=${userId}|appUserRole=${roleId}|districtId=${districtId}`).subscribe((res: any) => {
      this.ValuationMDrp = res['table']
    })

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  getCurrencyMaster() {
    const currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
    const roleId = currentRole?.roleId || '';
    const userId = sessionStorage.getItem('userId') || '';
    const districtId = sessionStorage.getItem('District') || '';
    this.userService.getQuestionPaper(`uspGetCurrencyMaster|appUserId=${userId}|appUserRole=${roleId}|districtId=${districtId}`).subscribe((res: any) => {
      this.CurrencyMasteDrp = res['table']
    })

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  getUnitMaster() {
    const currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
    const roleId = currentRole?.roleId || '';
    const userId = sessionStorage.getItem('userId') || '';
    const districtId = sessionStorage.getItem('District') || '';
    this.userService.getQuestionPaper(`uspGetUnitMaster|appUserId=${userId}|appUserRole=${roleId}|districtId=${districtId}`).subscribe((res: any) => {
      this.UnitMasterDrp = res['table']
    })

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  getMaterialDrp() {
    const currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
    const roleId = currentRole?.roleId || '';
    const userId = sessionStorage.getItem('userId') || '';
    const districtId = sessionStorage.getItem('District') || '';
    this.userService.getQuestionPaper(`uspGetManufactMaterialMaster|appUserId=${userId}|appUserRole=${roleId}|districtId=${districtId}`).subscribe((res: any) => {
      this.ItemMasterDrp = res['table']
    })

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }


  getRoutingDrp() {
    this.userService.getQuestionPaper(`uspGetRoutingMaster`).subscribe((res: any) => {
      this.routingDrp = res['table']
    })

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }
  
  

  getTableData(isTrue: boolean) {
    try {
      if (isTrue) {
        this.isLoading = true;
      } else {
        this.pageNo = 1;
      }
  
      const userId = sessionStorage.getItem('userId') || '';
      const currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
      const roleId = currentRole?.roleId || '';
      const districtId = sessionStorage.getItem('District') || '';
  
      const query = `appUserId=${userId}|appUserRole=${roleId}|districtId=${districtId}|searchText=${this.searchText}|pageIndex=${this.pageNo}|size=${this.pageSize}`;
  
      this.userService.getQuestionPaper(`uspGetBillOfMaterialDetails|${query}`).subscribe({
        next: (res: any) => {
          try {
            setTimeout(() => {
              // Normalize both rawMaterialDetails and scrapMaterialDetails
              this.data = res?.table1?.map((row: any) => ({
                ...row,
                rawMaterialDetails: this.safeParse(row.rawMaterialDetails),
                scrapMaterialDetails: this.safeParse(row.scrapMaterialDetails)
              })) || [];
  
              this.totalCount = res?.table?.[0]?.totalCnt || this.data.length;
              this.cdr.detectChanges();
            }, 0);
          } catch (innerErr) {
            console.error('Error processing response:', innerErr);
            this.data = [];
            this.totalCount = 0;
          } finally {
            setTimeout(() => {
              this.isLoading = false;
              this.cdr.detectChanges();
            }, 1000);
          }
        },
        error: (err) => {
          console.error('API call failed:', err);
          this.isLoading = false;
          if (err.status === 403) {
            this.Customvalidation.loginroute(err.status);
          } else {
            this.data = [];
            this.totalCount = 0;
          }
        }
      });
    } catch (error) {
      console.error('Unexpected error in getTableData():', error);
      this.isLoading = false;
    }
  }
  
  // Helper function to safely parse fields
  safeParse(value: any) {
    if (!value) return [];
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return [];
      }
    }
    return value;
  }
  

  allowFloat(event: KeyboardEvent) {
    const input = (event.target as HTMLInputElement).value;
    const char = String.fromCharCode(event.which ? event.which : event.keyCode);

    // 1️⃣ Allow only numbers and single dot
    if (!/[0-9.]/.test(char)) {
      event.preventDefault();
      return;
    }

    // 2️⃣ Allow only one dot
    if (char === '.' && input.includes('.')) {
      event.preventDefault();
      return;
    }

    // 3️⃣ Allow only 2 digits after dot
    const parts = input.split('.');
    if (parts.length === 2 && parts[1].length >= 2) {
      event.preventDefault();
    }
  }


  allowTimeInput(event: KeyboardEvent) {
    const char = String.fromCharCode(event.which ? event.which : event.keyCode);

    // Allow only numbers, colon, space, A, M, P
    if (!/[0-9:AMPamp\s]/.test(char)) {
      event.preventDefault();
    }

    // Optional: Prevent multiple spaces
    const input = (event.target as HTMLInputElement).value;
    if (char === ' ' && input.includes(' ')) {
      event.preventDefault();
    }
  }

  showDialog1(view: string, data: any) {
    this.selectedIndex = data;
    this.visible = true;
    this.postType = view;
    this.header = view === 'add' ? 'Add' : view === 'update' ? 'Update' : 'View';
    this.headerIcon = view === 'add' ? 'pi pi-plus' : view === 'update' ? 'pi pi-pencil' : 'pi pi-eye';

    if (view === 'add') {
      this.groupMasterForm1.reset();
      this.groupMasterForm1.enable();
      this.scrapMaterialForm.reset();
      this.scrapMaterialForm.enable();
      this.scrapProcessLossForm.reset();
      this.scrapProcessLossForm.enable();
    } else {
      if (view === 'view') {
        this.groupMasterForm1.disable();
        this.scrapMaterialForm.disable();
        this.scrapProcessLossForm.disable();
      } else {
        this.groupMasterForm1.enable();
        this.scrapMaterialForm.enable();
        this.scrapProcessLossForm.enable();
      }

      // Patch main form
      this.groupMasterForm1.patchValue({
        itemName: data.bomName,
        unitMeasurement: data.unitId,
        Quantity: data.quantity,
        rateMaterialsBased: data.basedOnId,
        Currency: data.currencyId,
        tansferMaterialAgainst: data.transferAgainstId,
        routing: data.routingId,
        Operations: data.operationId,
        processLostQuantity: data.processLossQuantity,
        processLoss: data.scrapPrcntProcesLoss,
        operatingCost: data.operatingCost,
        rawMaterialCost: data.rawMaterialCost,
        scrapMaterialCost: data.scrapMaterialCost,
        totalCost: data.totalCost,
        isinspectionReq: !!data.qualityInspectReq
      });

      // Patch scrap material form (if data available)
      this.scrapMaterialList = data.rawMaterialDetails ? JSON.parse(data.rawMaterialDetails).map((item: any) => ({
        scrapItemName: item.ItemId,
        scrapItemNameLabel: item.Item,
        scrapQuantity: item.quantity,
        scrapUnit: item.CurrencyId,
        scrapUnitLabel: item.Currency,
        scrapRate: item.rate
      }))
        : [];

      // Patch process loss form (if data available)
      this.scrapProcessLossList = data.scrapMaterialDetails ? JSON.parse(data.scrapMaterialDetails).map((item: any) => ({
        processLossItemName: item.ItemId,
        processLossItemNameLabel: item.Item,
        processLossQuantity: item.quantity,
        processLossUnit: item.CurrencyId,
        processLossUnitLabel: item.Currency,
        processLossRate: item.rate
      }))
        : [];

    }

    document.body.style.overflow = 'hidden'; 
  }


  showDialog(view: string, data: any) {
    this.selectedIndex = data;
    this.visible = true;
    this.postType = view;
  
    this.header = view === 'add' ? 'Add' : view === 'update' ? 'Update' : 'View';
    this.headerIcon = view === 'add' ? 'pi pi-plus' : view === 'update' ? 'pi pi-pencil' : 'pi pi-eye';
  
    if (view === 'add') {
      this.groupMasterForm1.reset();
      this.groupMasterForm1.enable();
      this.scrapMaterialForm.reset();
      this.scrapMaterialForm.enable();
      this.scrapProcessLossForm.reset();
      this.scrapProcessLossForm.enable();
    } else {
      if (view === 'view') {
        this.groupMasterForm1.disable();
        this.scrapMaterialForm.disable();
        this.scrapProcessLossForm.disable();
      } else {
        this.groupMasterForm1.enable();
        this.scrapMaterialForm.enable();
        this.scrapProcessLossForm.enable();
      }
  
      // Patch main form
      this.groupMasterForm1.patchValue({
        itemName: data.bomName,
        unitMeasurement: data.unitId,
        Quantity: data.quantity,
        rateMaterialsBased: data.basedOnId,
        Currency: data.currencyId,
        tansferMaterialAgainst: data.transferAgainstId,
        routing: data.routingId,
        Operations: data.operationId,
        processLostQuantity: data.processLossQuantity,
        processLoss: data.scrapPrcntProcesLoss,
        operatingCost: data.operatingCost,
        rawMaterialCost: data.rawMaterialCost,
        scrapMaterialCost: data.scrapMaterialCost,
        totalCost: data.totalCost,
        isinspectionReq: !!data.qualityInspectReq
      });
  
      // IMPORTANT: No JSON.parse, because getTableData already parsed it
      const rawList = Array.isArray(data.rawMaterialDetails)? data.rawMaterialDetails: [];
      const scrapList = Array.isArray(data.scrapMaterialDetails) ? data.scrapMaterialDetails: [];
  
      // Patch scrap material list
      this.scrapMaterialList = rawList.map((item: any) => ({
        scrapItemName: item.ItemId,
        scrapItemNameLabel: item.Item,
        scrapQuantity: item.quantity,
        scrapUnit: item.CurrencyId,
        scrapUnitLabel: item.Currency,
        scrapRate: item.rate
      }));
  
      // Patch process loss list
      this.scrapProcessLossList = scrapList.map((item: any) => ({
        processLossItemName: item.ItemId,
        processLossItemNameLabel: item.Item,
        processLossQuantity: item.quantity,
        processLossUnit: item.CurrencyId,
        processLossUnitLabel: item.Currency,
        processLossRate: item.rate
      }));
    }
  
    document.body.style.overflow = 'hidden';
  }
  


  isInvalid(field: string): boolean {
    const control = this.groupMasterForm1.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onPageChange(newPage: number) {
    this.pageNo = newPage;
    this.getTableData(true);
  }

  onPageSizeChange(newSize: number) {
    this.pageSize = newSize;
    this.pageNo = 1; // reset to first page
    this.getTableData(true); // fetch data from API again
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


  deleteItem(item: any) {
    this.selectedIndex = item;
    this.openConfirmation("Confirm", "Are you sure want to delete?", '1', '2');
  }


  onDrawerHide() {
    document.body.style.overflow = 'visible'; // restore scroll
    this.groupMasterForm1.enable();
    this.groupMasterForm1.reset();

    // Reset scrap material & process loss forms
    this.scrapMaterialForm.reset();
    this.scrapProcessLossForm.reset();
    // Clear lists (table data etc.)
    this.scrapMaterialList = [];
    this.scrapProcessLossList = [];
    this.groupListArray = [];
    this.groupListArray1 = [];
    this.visible = false;
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
          this.deleteData();
        }
        else if (option === '4') {
          // this.childArrData = []
        }
        else if (option === '5') {
          this.groupMasterForm1.reset()
        }
      },
    });
  }


  onClear() {
    this.groupMasterForm1.reset();
  }


  onSubmit(event: any) {
    this.groupMasterForm1.markAllAsTouched();

    if (!this.groupMasterForm1.valid) {
      console.warn('Form is invalid, submission stopped--1.');
      return;
    }

    if (this.scrapMaterialList?.length == 0) {
      this.message.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please Enter BOM Raw Material ',
        life: 3000
      });
      return;
    }

    if (this.scrapProcessLossList?.length == 0) {
      this.message.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please Enter Scrap and Process Loss',
        life: 3000
      });
      return;
    }

    const itemName = (this.groupMasterForm1.get('itemName')?.value || '').trim();
    const unit = this.groupMasterForm1.get('unitMeasurement')?.value || 0;
    const quantity = this.groupMasterForm1.get('Quantity')?.value || 0;
    const rateMaterialsBased = this.groupMasterForm1.get('rateMaterialsBased')?.value || '';
    const Currency = this.groupMasterForm1.get('Currency')?.value || 0;
    const tansferMaterialAgainst = this.groupMasterForm1.get('tansferMaterialAgainst')?.value || 0;
    const routing = this.groupMasterForm1.get('routing')?.value || 0;
    const Operations = this.groupMasterForm1.get('Operations')?.value || 0;
    const processLostQuantity = this.groupMasterForm1.get('processLostQuantity')?.value || 0;
    const processLoss = this.groupMasterForm1.get('processLoss')?.value || 0;
    const operatingCost = this.groupMasterForm1.get('operatingCost')?.value || 0;
    const rawMaterialCost = this.groupMasterForm1.get('rawMaterialCost')?.value || 0
    const scrapMaterialCost = this.groupMasterForm1.get('scrapMaterialCost')?.value || 0;
    const inspectionReq = this.groupMasterForm1.get('isinspectionReq')?.value ? 1 : 0;
    const totalCost = this.groupMasterForm1.get('totalCost')?.value || 0;

    const rawMaterial = this.scrapMaterialList.map(item => ({
      itemId: item.scrapItemName,
      quant: item.scrapQuantity,
      uom: item.scrapUnit,
      rate: item.scrapRate
    }));

    const scrapItems = this.scrapProcessLossList.map(item => ({
      itemId: item.processLossItemName,
      quant: item.processLossQuantity,
      uom: item.processLossUnit,
      rate: item.processLossRate
    }));
    this.paramvaluedata = `bomName=${itemName}|unit=${unit}|quantity=${quantity}|romBasedId=${rateMaterialsBased}|currency=${Currency}|trfMaterialAgstId=${tansferMaterialAgainst}|routingId=${routing}|operationId=${Operations}|percentageLoss=${processLostQuantity}|lossQuant=${processLoss}|operatingCost=${operatingCost}|rawMaterialCost=${rawMaterialCost}|scrapMaterialCost=${scrapMaterialCost}|inspectionReq=${inspectionReq}|totalCost=${totalCost}|scrapItems=${JSON.stringify(scrapItems)}|rawMaterial=${JSON.stringify(rawMaterial)}`;
    console.log("Final Payload Data:", this.paramvaluedata);
    this.openConfirmation('Confirm?', 'Are you sure you want to proceed?', '1', '1', event);
  }


  submitcall() {
    try {
      this.isFormLoading = true;
      let query = '';
      let SP = '';
      const districtId = sessionStorage.getItem('District') || '';

      if (this.postType === 'update') {
        query = `${this.paramvaluedata}|Id=${this.selectedIndex.id}|appUserId=${sessionStorage.getItem('userId')}|districtId=${districtId}`;
        SP = `uspUpdateBillOfMaterialDetails`;
      }
      else {
        query = `${this.paramvaluedata}|appUserId=${sessionStorage.getItem('userId')}|districtId=${districtId}`;
        SP = `uspPostBillOfMaterialDetails`;
      }
      this.userService.SubmitPostTypeData(SP, query, 'header').subscribe({
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

    } catch (error) {
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


  deleteData() {
    try {
      this.isFormLoading = true;
      let query = `ID=${this.selectedIndex.id}|userId=${sessionStorage.getItem('userId')}`;
      this.userService.SubmitPostTypeData(`uspDeleteBillOfMaterial`, query, 'header').subscribe({
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
                detail: 'Data deleted successfully.',
                life: 3000
              });
              this.onDrawerHide();
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
              detail: 'Failed to delete data. Please try again later.',
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


  onDeleteRow(data: any, index: number) {
    this.selectedrowIndex = index
    this.openConfirmation("Confirm", "Are you sure want to delete?", '1', '5');
  }


  showGrouplist(data: any) {
    this.itemDailog = true;
    if (typeof data.rawMaterialDetails === 'string') {
      try {
        data.rawMaterialDetails = JSON.parse(data.rawMaterialDetails);
      } catch {
        data.rawMaterialDetails = [];
      }
    } else if (!Array.isArray(data.rawMaterialDetails)) {
      data.rawMaterialDetails = [];
    }
    this.groupListArray = data.rawMaterialDetails;
  }


  showGrouplist1(data: any) {
    this.itemDailog1 = true;
    if (typeof data.scrapMaterialDetails === 'string') {
      try {
        data.scrapMaterialDetails = JSON.parse(data.scrapMaterialDetails);
      } catch {
        data.scrapMaterialDetails = [];
      }
    } else if (!Array.isArray(data.scrapMaterialDetails)) {
      data.scrapMaterialDetails = [];
    }
    this.groupListArray1 = data.scrapMaterialDetails;
  }


}
