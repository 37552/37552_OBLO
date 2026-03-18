import { Component, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Popover } from 'primeng/popover';
import { Tooltip } from 'primeng/tooltip';
import { DrawerModule } from 'primeng/drawer';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Toast } from 'primeng/toast';
import { ProgressSpinner } from 'primeng/progressspinner';
import { CardModule } from 'primeng/card';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DatePipe } from '@angular/common';
import { TableTemplate, TableColumn } from '../table-template/table-template';
import { UserService } from '../shared/user-service';
import { Customvalidation } from '../shared/Validation';

import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { MultiSelectModule } from 'primeng/multiselect';
import { DatePicker } from 'primeng/datepicker';

@Component({
  selector: 'app-inventory-settings',
  standalone: true,
  imports: [
    TableTemplate, ButtonModule, DrawerModule, Popover, Tooltip, ConfirmDialog, Toast, ProgressSpinner,
    CardModule, FormsModule, ReactiveFormsModule, CommonModule, SelectModule, CheckboxModule, MultiSelectModule
  ],
  providers: [ConfirmationService, MessageService, DatePipe],
  templateUrl: './inventory-settings.html',
  styleUrls: ['./inventory-settings.scss']
})
export class InventorySettings {
  isLoading = true;
  visible = false;
  postType = '';
  header = '';
  headerIcon = 'pi pi-plus';
  isFormLoading = false;
  data: any[] = [];
  expandedCard: string | null = null;
  // inventorySettingsForm: FormGroup;

  // Individual form groups per section
  defaultsForm: FormGroup;
  validationsForm: FormGroup;
  serialBatchForm: FormGroup;
  reservationForm: FormGroup;
  qualityForm: FormGroup;
  planningForm: FormGroup;
  closingForm: FormGroup;

  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true },
    { key: 'itemNamingByTxt', header: 'Item Naming By Text', isVisible: true, isSortable: false },
    { key: 'warehouseIdTxt', header: 'Warehouse Text', isVisible: true, isSortable: false },
    { key: 'valuationMethodTxt', header: 'Valuation Methd Text', isVisible: true, isSortable: false },
    { key: 'sampleRetentionWarehouseTxt', header: 'Sample Retention Warehouse Text', isVisible: true, isSortable: false },
    { key: 'defaultItemGroupTxt', header: 'Default Item Group Text', isVisible: true, isSortable: false },
    { key: 'defaultStockUOMTxt', header: 'Default Stock Uom Text', isVisible: true, isSortable: false },
    { key: 'editStockUOMQtyForSalesDoc', header: 'edit Stock UOM Qty For Sales Doc', isVisible: true, isSortable: false },
    { key: 'itemUOMConversationRateDefined', header: 'item UOM Conversation Rate Defined', isVisible: true, isSortable: false },

    { key: 'overDeliveryReceiptAllowance', header: 'over Delivery Receipt Allowance', isVisible: true, isSortable: false },
    // { key: 'overTransferAllowance', header: 'over Transfer Allowance', isVisible: true, isSortable: false },
    { key: 'allowNegativeStock', header: 'allowNegativeStock', isVisible: true, isSortable: false },
    { key: 'itemDescConvToHTML', header: 'Item Desc Conv To HTML', isVisible: true, isSortable: false },
    { key: 'roleAllowedToOverDeliverReceiveTxt', header: 'role Allowed To Over Deliver Receive', isVisible: true, isSortable: false },
    { key: 'overPickingAllowance', header: 'over Picking Allowance', isVisible: true, isSortable: false },
    { key: 'overTransferAllowance', header: 'over Transfer Allowance', isVisible: true, isSortable: false },
    { key: 'barcodeInStockTran', header: 'barcode In Stock Tran', isVisible: true, isSortable: false },
    { key: 'intTransferAtArmLengthPrice', header: 'int Transfer At Arm Length Price', isVisible: true, isSortable: false },

    { key: 'duplicateManfctSerialNo', header: 'duplicate Manfct Serial No', isVisible: true, isSortable: false },
    { key: 'dontUseBatchWise', header: 'dont Use Batch Wise', isVisible: true, isSortable: false },
    { key: 'autoCreateOutwardSerialBatchBundle', header: 'auto Create Outward Serial Batch Bundle', isVisible: true, isSortable: false },
    { key: 'serialBatchBundleNamingSeries', header: 'serial Batch Bundle Naming Series', isVisible: true, isSortable: false },
    { key: 'useSerialBatchField', header: 'use Serial Batch Field', isVisible: true, isSortable: false },
    { key: 'pickSerialBatchBasedOnTxt', header: 'pick Serial Batch Based On Txt', isVisible: true, isSortable: false },
    { key: 'batchIdDefaultNamingSeries', header: 'batch Id Default Naming Series', isVisible: true, isSortable: false },

    { key: 'enableStockReservation', header: 'enable Stock Reservation', isVisible: true, isSortable: false },

    { key: 'qualifyInspectionNotSubmittedActionTxt', header: 'qualifyInspectionNotSubmittedActionTxt', isVisible: true, isSortable: false },
    { key: 'qualifyInspectionRejectedActionTxt', header: 'qualifyInspectionRejectedActionTxt', isVisible: true, isSortable: false },
    { key: 'qualityInspectionAfterPurchaseDelivery', header: 'quality Inspection After Purchase Delivery', isVisible: true, isSortable: false },

    {
      key: 'raiseMRonReorderLevelReach', header: 'raise MR on Reorder Level Reach', isVisible: true, isSortable: false
    },
    { key: 'deliveryNoteToSalesInvoiceAllowMT', header: 'delivery Note To Sales Invoice Allow MT', isVisible: true, isSortable: false },
    { key: 'emailNotifyOnMRautoCreation', header: 'email Notify On MR auto Creation', isVisible: true, isSortable: false },
    { key: 'purchReceiptToPurchInvoiceAllowMT', header: 'purch Receipt To Purch Invoice Allow MT', isVisible: true, isSortable: false },
    { key: 'stockFrozenUpto', header: 'stock Frozen Upto', isVisible: true, isSortable: false },
    {
      key: 'roleToCreateEditBackDateTranTxt', header: 'role To Create Edit Back Date Tran', isVisible: true, isSortable: false
    },
    { key: 'freezeStockOlderThanDays', header: 'freeze Stock Older Than Days', isVisible: true, isSortable: false },

  ];

  pageNo = 1;
  pageSize = 5;
  totalCount = 0;
  searchText = '';
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  selectedIndex: any = [];
  paramvaluedata = '';
  param: any;
  FormName: any;
  FormValue: any;
  menulabel: any;
  breadcrumbItems!: ({ label: any; disabled?: undefined; } | { label: any; disabled: boolean; })[];

  // itemNaming: any = [];
  valuationMethods: any = [];
  itemGroupOptions: any = [];
  roleOptions: any = [];
  fifoOptions: any = [];
  qualityActionOptions: any = [];

  itemNaming: any = [];
  valuationDrp: any = [];
  supplierAction: any = [];
  units: any = [];
  purchaseRole: any = [];
  retentionWarehouse: any = [];
  materialType: any = [];
  wareHouseDrp = []

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private message: MessageService,
    private cdr: ChangeDetectorRef,
    private Customvalidation: Customvalidation,
    private datePipe: DatePipe
  ) {
    // ====== Initialize Forms ======
    this.defaultsForm = this.fb.group({
      itemNamingBy: ['', Validators.required],
      warehouseName: ['', Validators.required],
      valuationMethod: ['', Validators.required],
      sampleRetentionWarehouse: ['', Validators.required],
      defaultItemGroup: ['', Validators.required],
      defaultStockUOM: ['', Validators.required],
      allowEditStockUOMSales: [false],
      // allowEditStockUOMPurchase: [false],
      allowUOMConversationRate: [false],
    });

    this.validationsForm = this.fb.group({
      overDeliveryAllowance: ['', Validators.required],
      roleOverDeliver: ['', Validators.required],
      overTransferAllowance: ['', Validators.required],
      overPickingAllowance: ['', Validators.required],
      allowNegativeStock: [false],
      showBarcodeField: [false],
      convertItemDescription: [false],
      allowInternalTransfers: [false],
      // validateWarehouse: [false]
    });

    this.serialBatchForm = this.fb.group({
      allowExistingSerialNo: [false],
      disableSerialBatchSelector: [false],
      doNotUseBatchWiseValuation: [false],
      useSerialBatchFields: [false],
      autoCreateSerialBatchBundle: [false],
      pickSerialBatchBasedOn: ['', Validators.required],
      setSerialBatchNaming: [false],
      defaultBatchNamingSeries: [false],
    });

    this.reservationForm = this.fb.group({
      enableStockReservation: [false],
    });

    this.qualityForm = this.fb.group({
      qualityNotSubmitted: ['', Validators.required],
      qualityRejected: ['', Validators.required],
      allowPostQualityInspection: [false],
    });

    this.planningForm = this.fb.group({
      raiseMaterialRequest: [false],
      notifyByEmail: [false],
      allowMaterialTransferDNtoSI: [false],
      allowMaterialTransferPRtoPI: [false],
    });

    this.closingForm = this.fb.group({
      stockFrozenUpto: ['', Validators.required],
      roleBackdatedTransactions: ['', Validators.required],
      freezeStockDays: ['', Validators.required],
    });

  }

  get d() { return this.defaultsForm.controls; }
  get v() { return this.validationsForm.controls; }
  get s() { return this.serialBatchForm.controls; }
  get r() { return this.reservationForm.controls; }
  get q() { return this.qualityForm.controls; }
  get p() { return this.planningForm.controls; }
  get c() { return this.closingForm.controls; }

  toggleCard(card: string) {
    this.expandedCard = this.expandedCard === card ? null : card;
    // setTimeout(() => this.cdr.detectChanges(), 100);
  }

  onDrawerShow() {
    // Force a change detection once Drawer DOM is fully attached
    setTimeout(() => this.cdr.detectChanges(), 300);
  }


  ngOnInit() {
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
    this.loadDropdowns()
    this.getWareHouse()
    this.getTableData(true);
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }


  loadDropdowns() {
    const dropdownConfigs = [
      // { key: 'itemTypes', table: 'tblMaterialType', action: 'ITEMTYPE' },
      { key: 'itemNaming', table: 'tblItemNamingByMaster' },
      { key: 'valuationDrp', table: 'tblValuationMethodMaster' },
      { key: 'supplierAction', table: 'tblSupplierActionMaster' },
      { key: 'units', table: 'tblUnitMaster' },
      { key: 'purchaseRole', table: 'tblPurchaseRole' },
      { key: 'retentionWarehouse', table: 'tblRetentionWarehouseMaster' },
      { key: 'materialType', table: 'tblMaterialTypeMaster' },
      // { key: 'vendorTypes', table: 'tblVendorTypeMaster' },
      // { key: 'vendors', table: 'tblCustomerMasterHeader' },
      // { key: 'taxSlabs', table: 'tblTaxSlabMaster' },
      // { key: 'gstMasters', table: 'tblGSTMaster' }
    ];

    dropdownConfigs.forEach(config => {
      this.userService.getQuestionPaper(`uspGetFillDrpDown|table=${config.table}`).subscribe({
        next: (res: any) => {
          (this as any)[config.key] = res['table'] || [];
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(`Error loading ${config.key}:`, err);
        }
      });
    });
  }

  getWareHouse() {
    this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblWarehouseMaster|filterColumn=orgId|filterValue=10000`).subscribe({
      next: (res: any) => {
        this.wareHouseDrp = res['table']
      }, error: (err) => {
        if (err.status === 403) {
          this.Customvalidation.loginroute(err.status);
        }
      }
    }
    )
  }

  getTableData(isTrue: boolean) {
    try {
      if (isTrue) this.isLoading = true;
      else this.pageNo = 1;
      const userId = sessionStorage.getItem('userId') || '';
      const currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
      const roleId = currentRole?.roleId || '';
      const query = `appUserId=${userId}|searchText=${this.searchText}|pageIndex=${this.pageNo}|size=${this.pageSize}|districtId=${sessionStorage.getItem('District')}|appUserRole=${roleId}`;
      this.userService.getQuestionPaper(`uspGetInventorySettings|${query}`).subscribe({
        next: (res: any) => {
          this.data = res?.table1 || [];
          this.totalCount = res?.table?.[0]?.totalCnt || this.data.length;
          setTimeout(() => {
            this.isLoading = false;
            this.cdr.detectChanges();
          }, 1000);
        },
        error: (err) => {
          this.isLoading = false;
          if (err.status === 403) this.Customvalidation.loginroute(err.status);
        }
      });
    } catch {
      this.isLoading = false;
    }
  }

  onSubmit(event: any) {
    // Check each form and scroll if invalid  
    
    if (this.defaultsForm.invalid) {
      this.defaultsForm.markAllAsTouched();
      this.scrollToInvalidSection(this.defaultsForm, 'defaults-section');
      return;
    }

    if (this.validationsForm.invalid) {
      this.validationsForm.markAllAsTouched();
      this.scrollToInvalidSection(this.validationsForm, 'validations-section');
      return;
    }

    if (this.serialBatchForm.invalid) {
      this.serialBatchForm.markAllAsTouched();
      this.scrollToInvalidSection(this.serialBatchForm, 'serialbatch-section');
      return;
    }

    if (this.reservationForm.invalid) {
      this.reservationForm.markAllAsTouched();
      this.scrollToInvalidSection(this.reservationForm, 'reservation-section');
      return;
    }

    if (this.qualityForm.invalid) {
      this.qualityForm.markAllAsTouched();
      this.scrollToInvalidSection(this.qualityForm, 'quality-section');
      return;
    }

    if (this.planningForm.invalid) {
      this.planningForm.markAllAsTouched();
      this.scrollToInvalidSection(this.planningForm, 'quality-planning');
      return;
    }

    if (this.closingForm.invalid) {
      this.closingForm.markAllAsTouched();
      this.scrollToInvalidSection(this.closingForm, 'closing-planning');
      return;
    }



    this.paramvaluedata = ''

    let itemNamingBy = this.defaultsForm.get('itemNamingBy')?.value ? this.defaultsForm.get('itemNamingBy')?.value.drpValue : 0
    let warehouseName = this.defaultsForm.get('warehouseName')?.value ? this.defaultsForm.get('warehouseName')?.value.drpValue : 0
    let valuationMethod = this.defaultsForm.get('valuationMethod')?.value ? this.defaultsForm.get('valuationMethod')?.value.drpValue : 0
    let sampleRetentionWarehouse = this.defaultsForm.get('sampleRetentionWarehouse')?.value ? this.defaultsForm.get('sampleRetentionWarehouse')?.value.drpValue : 0
    let defaultItemGroup = this.defaultsForm.get('defaultItemGroup')?.value ? this.defaultsForm.get('defaultItemGroup')?.value.drpValue : 0
    let defaultStockUOM = this.defaultsForm.get('defaultStockUOM')?.value ? this.defaultsForm.get('defaultStockUOM')?.value.drpValue : 0
    let allowEditStockUOMSales = this.defaultsForm.get('allowEditStockUOMSales')?.value == false ? 0 : 1
    // let allowEditStockUOMPurchase = this.defaultsForm.get('allowEditStockUOMPurchase')?.value == false ? 0 : 1
    let allowUOMConversationRate = this.defaultsForm.get('allowUOMConversationRate')?.value == false ? 0 : 1


    let overDeliveryAllowance = this.validationsForm.get('overDeliveryAllowance')?.value
    let roleOverDeliver = this.validationsForm.get('roleOverDeliver')?.value ? this.validationsForm.get('roleOverDeliver')?.value.drpValue : 0
    let overTransferAllowance = this.validationsForm.get('overTransferAllowance')?.value
    let overPickingAllowance = this.validationsForm.get('overPickingAllowance')?.value
    let allowNegativeStock = this.validationsForm.get('allowNegativeStock')?.value == false ? 0 : 1
    let showBarcodeField = this.validationsForm.get('showBarcodeField')?.value == false ? 0 : 1
    let convertItemDescription = this.validationsForm.get('convertItemDescription')?.value == false ? 0 : 1
    let allowInternalTransfers = this.validationsForm.get('allowInternalTransfers')?.value == false ? 0 : 1


    let allowExistingSerialNo = this.serialBatchForm.get('allowExistingSerialNo')?.value == false ? 0 : 1
    let disableSerialBatchSelector = this.serialBatchForm.get('disableSerialBatchSelector')?.value == false ? 0 : 1
    let doNotUseBatchWiseValuation = this.serialBatchForm.get('doNotUseBatchWiseValuation')?.value == false ? 0 : 1
    let useSerialBatchFields = this.serialBatchForm.get('useSerialBatchFields')?.value == false ? 0 : 1
    let autoCreateSerialBatchBundle = this.serialBatchForm.get('autoCreateSerialBatchBundle')?.value == false ? 0 : 1
    let pickSerialBatchBasedOn = this.serialBatchForm.get('pickSerialBatchBasedOn')?.value ? this.serialBatchForm.get('pickSerialBatchBasedOn')?.value.drpValue : 0
    let setSerialBatchNaming = this.serialBatchForm.get('setSerialBatchNaming')?.value == false ? 0 : 1
    let defaultBatchNamingSeries = this.serialBatchForm.get('defaultBatchNamingSeries')?.value == false ? 0 : 1

    let enableStockReservation = this.reservationForm.get('enableStockReservation')?.value == false ? 0 : 1

    let qualityNotSubmitted = this.qualityForm.get('qualityNotSubmitted')?.value ? this.qualityForm.get('qualityNotSubmitted')?.value.drpValue : 0
    let qualityRejected = this.qualityForm.get('qualityRejected')?.value ? this.qualityForm.get('qualityRejected')?.value.drpValue : 0
    let allowPostQualityInspection = this.qualityForm.get('allowPostQualityInspection')?.value == false ? 0 : 1


    let raiseMaterialRequest = this.planningForm.get('raiseMaterialRequest')?.value == false ? 0 : 1
    let notifyByEmail = this.planningForm.get('notifyByEmail')?.value == false ? 0 : 1
    let allowMaterialTransferDNtoSI = this.planningForm.get('allowMaterialTransferDNtoSI')?.value == false ? 0 : 1
    let allowMaterialTransferPRtoPI = this.planningForm.get('allowMaterialTransferPRtoPI')?.value == false ? 0 : 1


    let stockFrozenUpto = this.closingForm.get('stockFrozenUpto')?.value
    let roleBackdatedTransactions = this.closingForm.get('roleBackdatedTransactions')?.value ? this.closingForm.get('roleBackdatedTransactions')?.value.drpValue : 0
    let freezeStockDays = this.closingForm.get('freezeStockDays')?.value

    let orgId = JSON.parse(sessionStorage.getItem('UserInfo') || '').orgMasterId
    let userId = sessionStorage.getItem('userId')
    this.paramvaluedata = `orgId=${orgId}|itemNamingBy=${itemNamingBy}|warehouseId=${warehouseName}|valuationMethod=${valuationMethod}|sampleRetentionWarehouse=${sampleRetentionWarehouse}|defaultItemGroup=${defaultItemGroup}|defaultStockUOM=${defaultStockUOM}|editStockUOMQtyForSalesDoc=${allowEditStockUOMSales}|itemUOMConversationRateDefined=${allowUOMConversationRate}|overDeliveryReceiptAllowance=${overDeliveryAllowance}|overTransferAllowance=${overTransferAllowance}|allowNegativeStock=${allowNegativeStock}|itemDescConvToHTML=${convertItemDescription}|roleAllowedToOverDeliverReceive=${roleOverDeliver}|overPickingAllowance=${overPickingAllowance}|barcodeInStockTran=${showBarcodeField}|intTransferAtArmLengthPrice=${allowInternalTransfers}|duplicateManfctSerialNo=${allowExistingSerialNo}|dontUseBatchWise=${disableSerialBatchSelector}|autoCreateOutwardSerialBatchBundle=${autoCreateSerialBatchBundle}|serialBatchBundleNamingSeries=${setSerialBatchNaming}|disableSerialNoBatchSelect=${doNotUseBatchWiseValuation}|useSerialBatchField=${useSerialBatchFields}|pickSerialBatchBasedOn=${pickSerialBatchBasedOn}|batchIdDefaultNamingSeries=${defaultBatchNamingSeries}|enableStockReservation=${enableStockReservation}|qualifyInspectionNotSubmittedAction=${qualityNotSubmitted}|qualifyInspectionRejectedAction=${qualityRejected}|qualityInspectionAfterPurchaseDelivery=${allowPostQualityInspection}|raiseMRonReorderLevelReach=${raiseMaterialRequest}|deliveryNoteToSalesInvoiceAllowMT=${allowMaterialTransferDNtoSI}|emailNotifyOnMRautoCreation=${notifyByEmail}|purchReceiptToPurchInvoiceAllowMT=${allowMaterialTransferPRtoPI}|stockFrozenUpto=${stockFrozenUpto}|freezeStockOlderThanDays=${freezeStockDays}|roleToCreateEditBackDateTran=${roleBackdatedTransactions}|appUserId=${userId}`
    

    this.openConfirmation('Confirm', 'Are you sure you want to save Inventory Settings?', 'add');
  }



  scrollToInvalidSection(form: FormGroup, sectionId: string) {
    if (form.invalid) {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }


  // openConfirmation(title: string, msg: string, type: string, paramdata: string, userId: string) {
  //   this.confirmationService.confirm({
  //     message: msg,
  //     header: title,
  //     icon: 'pi pi-exclamation-triangle',
  //     rejectButtonProps: { label: 'No', severity: 'secondary', outlined: true },
  //     acceptButtonProps: { label: 'Yes' },
  //     accept: () => {
  //       if (type === 'add') this.submitCall();
  //     }
  //   });
  // }

  submitCall() {
    this.isFormLoading = true;
    const currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
    // const roleID = currentRole?.roleId || '';
    // const userId = sessionStorage.getItem('userId') || '';
    let query = '';
    let SP = '';
    if (this.postType === 'update') {
      query = `${this.paramvaluedata}|inventorySettingId=${this.selectedIndex.inventorySettingId}`;
      SP = `uspUpdateInventorySettings`;
    } else {
      query = `${this.paramvaluedata}`;
      SP = `uspPostInventorySettings`;
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
  }

  // isInvalid(field: string, form: FormGroup | null | undefined): boolean {
  //   if (!form || typeof form.get !== 'function') return false;
  //   const control = form.get(field);
  //   return !!(control && control.invalid && (control.dirty || control.touched));
  // }




  // isInvalid(control: AbstractControl | null | undefined): boolean {
  //   return !!(control && control.invalid && (control.dirty || control.touched));
  // }


  isInvalid(field: string, formName: any): boolean {
    const control = formName.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
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

  onSortChange(event: { column: string; direction: 'asc' | 'desc' }) {
    this.sortColumn = event.column;
    this.sortDirection = event.direction;
    this.getTableData(true);
  }

  showDialog(view: string, data: any) {
    this.isFormLoading = true;
    if (view == 'add') {
      this.visible = true;
      this.postType = view;
      this.header = view === 'add' ? 'Add' : (view === 'update' ? 'Update' : 'View');
      this.headerIcon = view === 'add' ? 'pi pi-plus' : (view === 'update' ? 'pi pi-pencil' : 'pi pi-eye');
      setTimeout(() => {
        this.isFormLoading = false
        this.cdr.detectChanges();
      }, 1000);
    } else {

      this.visible = true;
      this.postType = view;
      this.header = view === 'add' ? 'Add' : (view === 'update' ? 'Update' : 'View');
      this.headerIcon = view === 'add' ? 'pi pi-plus' : (view === 'update' ? 'pi pi-pencil' : 'pi pi-eye');
      this.selectedIndex = data;
      if (view === 'view') {
        this.defaultsForm.disable();
        this.validationsForm.disable();
        this.serialBatchForm.disable();
        this.reservationForm.disable();
        this.qualityForm.disable();
        this.planningForm.disable();
        this.closingForm.disable();
        setTimeout(() => {
          this.isFormLoading = false
          this.cdr.detectChanges();
        }, 1000);
      }
      this.defaultsForm.patchValue({
        itemNamingBy: data.itemNamingBy ? { drpOption: data.itemNamingByTxt, drpValue: data.itemNamingBy } : '',
        warehouseName: data.warehouseId ? { drpOption: data.warehouseIdTxt, drpValue: data.warehouseId } : '',
        valuationMethod: data.valuationMethod ? { drpOption: data.valuationMethodTxt, drpValue: data.valuationMethod } : '',
        sampleRetentionWarehouse: data.sampleRetentionWarehouse ? { drpOption: data.sampleRetentionWarehouseTxt, drpValue: data.sampleRetentionWarehouse } : '',
        defaultItemGroup: data.defaultItemGroup ? { drpOption: data.defaultItemGroupTxt, drpValue: data.defaultItemGroup } : '',
        defaultStockUOM: data.defaultStockUOM ? { drpOption: data.defaultStockUOMTxt, drpValue: data.defaultStockUOM } : '',
        allowEditStockUOMSales: data.editStockUOMQtyForSalesDoc,
        allowUOMConversationRate: data.itemUOMConversationRateDefined,

      })
      this.validationsForm.patchValue({
        overDeliveryAllowance: data.overDeliveryReceiptAllowance ? data.overDeliveryReceiptAllowance : '',
        roleOverDeliver: data.roleAllowedToOverDeliverReceive ? { drpValue: data.roleAllowedToOverDeliverReceive, drpOption: data.roleAllowedToOverDeliverReceiveTxt } : '',
        overTransferAllowance: data.overTransferAllowance ? data.overTransferAllowance : '',
        overPickingAllowance: data.overPickingAllowance ? data.overPickingAllowance : '',
        allowNegativeStock: data.allowNegativeStock,
        showBarcodeField: data.barcodeInStockTran,
        convertItemDescription: data.itemDescConvToHTML,
        allowInternalTransfers: data.intTransferAtArmLengthPrice,
      })


      this.serialBatchForm.patchValue({
        allowExistingSerialNo: data.duplicateManfctSerialNo,
        disableSerialBatchSelector: data.dontUseBatchWise,
        // doNotUseBatchWiseValuation: data.dontUseBatchWise,
        useSerialBatchFields: data.useSerialBatchField,
        autoCreateSerialBatchBundle: data.autoCreateOutwardSerialBatchBundle,
        pickSerialBatchBasedOn: data.pickSerialBatchBasedOn ? { drpOption: data.pickSerialBatchBasedOnTxt, drpValue: data.pickSerialBatchBasedOn } : '',
        setSerialBatchNaming: data.serialBatchBundleNamingSeries ? data.serialBatchBundleNamingSeries : '',
        defaultBatchNamingSeries: data.batchIdDefaultNamingSeries,
      })

      this.reservationForm.patchValue({
        enableStockReservation: data.enableStockReservation
      })

      this.qualityForm.patchValue({
        qualityNotSubmitted: data.qualifyInspectionNotSubmittedAction ? { drpOption: data.qualifyInspectionNotSubmittedActionTxt, drpValue: data.qualifyInspectionNotSubmittedAction } : '',
        qualityRejected: data.qualifyInspectionNotSubmittedAction ? { drpOption: data.qualifyInspectionRejectedActionTxt, drpValue: data.qualifyInspectionRejectedAction } : '',
        allowPostQualityInspection: data.qualityInspectionAfterPurchaseDelivery
      })
      this.planningForm.patchValue({
        raiseMaterialRequest: data.raiseMRonReorderLevelReach,
        notifyByEmail: data.emailNotifyOnMRautoCreation,
        allowMaterialTransferDNtoSI: data.deliveryNoteToSalesInvoiceAllowMT,
        allowMaterialTransferPRtoPI: data.purchReceiptToPurchInvoiceAllowMT
      })
      this.closingForm.patchValue({
        stockFrozenUpto: data.stockFrozenUpto,
        roleBackdatedTransactions: data.roleToCreateEditBackDateTran ? { drpOption: data.roleToCreateEditBackDateTranTxt, drpValue: data.roleToCreateEditBackDateTran } : '',
        freezeStockDays: data.freezeStockOlderThanDays,
      })
    }
    setTimeout(() => {
      this.isFormLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  onDrawerHide() {
    this.visible = false;
    this.defaultsForm.enable();
    this.validationsForm.enable();
    this.serialBatchForm.enable();
    this.reservationForm.enable();
    this.qualityForm.enable();
    this.planningForm.enable();
    this.closingForm.enable();
    this.onClear();
  }

  onClear() {
    // this.inventorySettingsForm.reset();
    this.defaultsForm.reset();
    this.validationsForm.reset();
    this.serialBatchForm.reset();
    this.reservationForm.reset();
    this.qualityForm.reset();
    this.planningForm.reset();
    this.closingForm.reset();

  }



  deleteItem(item: any) {
    this.selectedIndex = item;
    this.openConfirmation('Confirm', 'Are you sure want to delete?', 'delete');
  }

  openConfirmation(title: string, msg: string, type: string) {
    this.confirmationService.confirm({
      message: msg,
      header: title,
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: { label: 'No', severity: 'secondary', outlined: true },
      acceptButtonProps: { label: 'Yes' },
      accept: () => {
        if (type === 'add' || type === 'update') this.submitCall();
        else if (type === 'delete') this.deleteData();
      }
    });
  }

  deleteData() {
    this.isFormLoading = true;
    const userId = sessionStorage.getItem('userId') || '';
    const query = `inventorySettingId=${this.selectedIndex.inventorySettingId}|appUserId=${userId}`;
    this.userService.SubmitPostTypeData(`uspDeleteInventorySettings`, query, 'header').subscribe({
      next: (datacom: any) => {
        this.isFormLoading = false;
        try {
          if (!datacom) return;
          const resultarray = datacom.split('-');
          if (resultarray[1] === 'success') {
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
  }


  transformDate(event: any, formName: any, controlName: string) {
    const formatted = this.datePipe.transform(event, 'yyyy-MM-dd');
    
    formName.patchValue({
      [controlName]: formatted
    });
  }
}
