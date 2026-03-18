import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { TableTemplate, TableColumn } from '../table-template/table-template';
import { UserService } from '../shared/user-service';
import { Customvalidation } from '../shared/Validation';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { MultiSelectModule } from 'primeng/multiselect';
import { ChangeDetectionStrategy } from '@angular/core';
@Component({
  selector: 'app-purchase-settings',
  standalone: true,
  imports: [
    TableTemplate, ButtonModule, DrawerModule, Popover, Tooltip, ConfirmDialog, Toast, ProgressSpinner,
    CardModule, FormsModule, ReactiveFormsModule, CommonModule, SelectModule, CheckboxModule, MultiSelectModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './purchase-settings.html',
  styleUrls: ['./purchase-settings.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PurchaseSettingsComponent implements OnInit {
  // UI / state
  isLoading = true;
  visible = false;
  postType = '';
  header = '';
  headerIcon = 'pi pi-plus';
  isFormLoading = false;
  data: any[] = [];
  expandedCard: string | null = null;

  // Table config
  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true },
    { key: 'supplierNamingByTxt', header: 'supplierNaming', isVisible: true, isSortable: false },
    { key: 'defaultSupplierGroupTxt', header: 'defaultSupplierGroup', isVisible: true, isSortable: false }
  ];

  pageNo = 1;
  pageSize = 5;
  totalCount = 0;
  searchText = '';
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  selectedIndex: any = [];
  paramvaluedata = '';

  // Forms
  purchaseSettingsForm!: FormGroup;
  transactionForm!: FormGroup;
  subContractForm!: FormGroup;

  // Dropdown options used in template

  backflushOptions = [];
  supplierNamingOptions = [];
  supplierGroupOptions = [];
  poRequiredForInvoiceAndReceipt=[];
  priceListOptions = [];
  actionOptions = [];
  overrideRoles = [];
  receiptRequiredForInvoice: any;
  orgMasterId: any;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private message: MessageService,
    private cdr: ChangeDetectorRef,
    private Customvalidation: Customvalidation
  ) {

    this.purchaseSettingsForm = this.fb.group({
      supplierNamingBy: ['', Validators.required],
      defaultSupplierGroup: ['', Validators.required],
      defaultBuyingPriceList: ['', Validators.required],
      poRequiredForInvoiceAndReceipt: ['', Validators.required],
      blanketOrderAllowance: ['', Validators.required],
      actionIfSameNotMaintained: ['', Validators.required],
      roleAllowedToOverrideStop: ['', Validators.required],
      receiptRequiredForInvoice: ['', Validators.required]
    });

    this.transactionForm = this.fb.group({
      useTransactionDateRate: [false],
      allowRFQZeroQty: [false],
      billRejectedQtyPI: [false],
      valuationRateRejectedMaterials: [false],
      disableLastPurchaseRate: [false],
      allowPOZeroQty: [false],
      allowSupplierQuotationZeroQty: [false],
      maintainSameRateCycle: [false],
      allowItemMultipleTimes: [false],
    });

    this.subContractForm = this.fb.group({
    
      backflushBasedOn: ['',Validators.required],
      overTransferAllowance: [''],

      autoCreateSubcontractingOrder: [false],
      autoCreatePurchaseReceipt: [false],
     

    });


  }

  ngOnInit() {

    this.getTableData(true);
    this.getDropdown()

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }



  getTableData(isTrue: boolean) {
    try {
      if (isTrue) this.isLoading = true;
      else this.pageNo = 1;
       const districtId = sessionStorage.getItem('District') || '';
      const userId = sessionStorage.getItem('userId') || '';
      const roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
      const query = `appUserRole=${roleID}|appUserId=${userId}|searchText=${this.searchText}|pageIndex=${this.pageNo}|size=${this.pageSize}|districtId=${districtId}`;

      this.userService.getQuestionPaper(`uspGetPurchaseSettings|${query}`).subscribe({
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

  // -------------------
  // Drawer / Form flow
  // -------------------
    showDialog(mode: 'add' | 'view' | 'update', data?: any) {
    
    this.isFormLoading = true;
    this.visible = true;
    this.postType = mode;
    this.header = mode === 'add' ? 'Add purchase Setting' : mode === 'update' ? 'Update Purchase Setting' : 'View Purchase Setting';
    this.headerIcon = mode === 'add' ? 'pi pi-plus' : mode === 'update' ? 'pi pi-pencil' : 'pi pi-eye';

    if (mode !== 'add' && data) {

      

      this.purchaseSettingsForm.patchValue({
        supplierNamingBy: data.supplierNamingBy || '',
        defaultSupplierGroup: data.defaultSupplierGroup || '',
        defaultBuyingPriceList: data.defaultBuyingPriceList || '',
        poRequiredForInvoiceAndReceipt: data.poRequiredForPI || '',
        blanketOrderAllowance: data.blanketOrderAllowance || '',
        actionIfSameNotMaintained: data.sameRateNotMaintainedAction || '',
        roleAllowedToOverrideStop: data.roleForOverrideStopAction || '' ,  
        receiptRequiredForInvoice: data.purchReceiptforInvoiceCreation || ''
        
      });
  
      this.transactionForm.patchValue({
        useTransactionDateRate: data.transactionDateExchngRate,
        allowRFQZeroQty: data.requestQuotnWithZeroQty,
        billRejectedQtyPI: data.rejectedQtyBillinPurchInvoice,
        valuationRateRejectedMaterials: data.valuationRateForRejectedMaterial,
        disableLastPurchaseRate: data.disableLastPurchRate,
        allowPOZeroQty: data.poWithZeroQty
      });

      this.subContractForm.patchValue({
        backflushBasedOn: data.backflushSubcontractRawMaterialBasedOn|| '',
        overTransferAllowance: data.overTransferAllowance|| '',
        autoCreatePurchaseReceipt: data.autoCreateSubcontractingOrder ,
        
      });

     
      

      this.selectedIndex = data

      if (mode === 'view') {
        this.purchaseSettingsForm.disable();
        this.transactionForm.disable();
        this.subContractForm.disable();
        
      }
      else {
        this.purchaseSettingsForm.enable();
        this.transactionForm.enable();
        this.subContractForm.enable();
        

      }
    } else {
      this.purchaseSettingsForm.enable();
      this.purchaseSettingsForm.reset();

      this.transactionForm.enable();
      this.transactionForm.reset();

      this.subContractForm.enable();
      this.subContractForm.reset();

      
    }

    setTimeout(() => {
      this.isFormLoading = false;
      this.cdr.detectChanges();
    }, 200);
  }

  onDrawerHide() {
    this.visible = false;
    this.purchaseSettingsForm.enable();
    this.onClear();
  }

  onClear() {
    // reset only fields we created; keep defaults if needed
    this.purchaseSettingsForm.reset();
  }


onSubmit(event: any) {
    
    if (!this.purchaseSettingsForm.valid) {
      this.purchaseSettingsForm.markAllAsTouched();
      return;
    }
    if (!this.transactionForm.valid) {
      this.transactionForm.markAllAsTouched();
      return;
    }
    if (!this.subContractForm.valid) {
      this.subContractForm.markAllAsTouched();
      return;
    }
    

    const supplierNamingBy = this.purchaseSettingsForm.get('supplierNamingBy')?.value  || 0;
    const defaultSupplierGroup = this.purchaseSettingsForm.get('defaultSupplierGroup')?.value  || 0;
    const defaultBuyingPriceList = this.purchaseSettingsForm.get('defaultBuyingPriceList')?.value || 0;
    const poRequiredForInvoiceAndReceipt = this.purchaseSettingsForm.get('poRequiredForInvoiceAndReceipt')?.value|| 0;
    const blanketOrderAllowance = this.purchaseSettingsForm.get('blanketOrderAllowance')?.value || 0;
    const actionIfSameNotMaintained = this.purchaseSettingsForm.get('actionIfSameNotMaintained')?.value || 0;
    const roleAllowedToOverrideStop = this.purchaseSettingsForm.get('roleAllowedToOverrideStop')?.value || 0;
    const receiptRequiredForInvoice = this.purchaseSettingsForm.get('receiptRequiredForInvoice')?.value  || 0;
    
    

    const useTransactionDateRate = this.transactionForm.get('useTransactionDateRate')?.value ? 1 : 0;
    const allowRFQZeroQty = this.transactionForm.get('allowRFQZeroQty')?.value ? 1 : 0;
    const billRejectedQtyPI = this.transactionForm.get('billRejectedQtyPI')?.value ? 1 : 0;
    const valuationRateRejectedMaterials = this.transactionForm.get('valuationRateRejectedMaterials')?.value ? 1 : 0;
    const disableLastPurchaseRate = this.transactionForm.get('disableLastPurchaseRate')?.value ? 1 : 0;
    const allowPOZeroQty = this.transactionForm.get('allowPOZeroQty')?.value ? 1 : 0;
    const allowSupplierQuotationZeroQty = this.transactionForm.get('valuationRateRejectedMaterials')?.value ? 1 : 0;
    const maintainSameRateCycle = this.transactionForm.get('disableLastPurchaseRate')?.value ? 1 : 0;
    const allowItemMultipleTimes = this.transactionForm.get('allowPOZeroQty')?.value ? 1 : 0;
    

    const backflushBasedOn = this.subContractForm.get('backflushBasedOn')?.value || 0;
    const overTransferAllowance = this.subContractForm.get('overTransferAllowance')?.value || '';
    const autoCreateSubcontractingOrder = this.subContractForm.get('autoCreateSubcontractingOrder')?.value? 1 : 0;
    const autoCreatePurchaseReceipt = this.subContractForm.get('autoCreatePurchaseReceipt')?.value ? 1 : 0;
    

    const userData = JSON.parse(sessionStorage.getItem('UserInfo') || '{}');
    this.orgMasterId = userData[0].orgMasterId

    const userId = sessionStorage.getItem('userId') || '';


    this.paramvaluedata = `orgId=${this.orgMasterId}|supplierNamingBy=${supplierNamingBy}|defaultSupplierGroup=${defaultSupplierGroup}|defaultBuyingPriceList=${defaultBuyingPriceList}|poRequiredForPI=${poRequiredForInvoiceAndReceipt}|blanketOrderAllowance=${blanketOrderAllowance}` +
      `|sameRateNotMaintainedAction=${actionIfSameNotMaintained}|roleForOverrideStopAction=${roleAllowedToOverrideStop}|purchReceiptforInvoiceCreation=${receiptRequiredForInvoice}|supplierQuotnWithZeroQty=${allowSupplierQuotationZeroQty}` +
      `|transactionDateExchngRate=${useTransactionDateRate}|requestQuotnWithZeroQty=${allowRFQZeroQty}|valuationRateForRejectedMaterial=${valuationRateRejectedMaterials}|poWithZeroQty=${allowPOZeroQty}|purchCycleMaintainSameRate=${maintainSameRateCycle}` +
      `|multipleTimesItemAddinTrans=${allowItemMultipleTimes}|rejectedQtyBillinPurchInvoice=${billRejectedQtyPI}|disableLastPurchRate=${disableLastPurchaseRate}|backflushSubcontractRawMaterialBasedOn=${backflushBasedOn}` +
      `|overTransferAllowance=${overTransferAllowance}|autoCreateSubcontractingOrder=${autoCreateSubcontractingOrder}|autoCreatePurchReceipt=${autoCreatePurchaseReceipt}|appUserId=${userId}`;

    this.openConfirmation('Confirm?', 'Are you sure you want to proceed?', 'add',);



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

  submitCall() {
    this.isFormLoading = true;
    const userId = sessionStorage.getItem('userId') || '';
    let query = '';
    let SP = '';
    const userData = JSON.parse(sessionStorage.getItem('UserInfo') || '{}');
    this.orgMasterId = userData[0].orgMasterId
    if (this.postType === 'update') {
      SP = `uspUpdatePurchaseSettings`
      query = `${this.paramvaluedata}|purchaseSettingId=${this.selectedIndex.purchaseSettingId}`
    } else {
      SP = `uspPostPurchaseSettings`
      query = `${this.paramvaluedata}`
    }

    this.userService.SubmitPostTypeData(SP, query, 'header').subscribe({
      next: (res: any) => {
        this.isFormLoading = false;
        const result = res.split('-');
        if (result[1] === 'success') {
          this.message.add({
            severity: 'success',
            summary: 'Success',
            detail: this.postType === 'update' ? 'Data Updated Successfully.' : 'Data Saved Successfully.',
            life: 3000
          });
          this.getTableData(false);
          this.onDrawerHide();
        } else {
          this.message.add({ severity: 'warn', summary: 'Warning', detail: result[1], life: 3000 });
        }
      },
      error: () => {
        this.isFormLoading = false;
        this.message.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Something went wrong. Please try again later.',
          life: 3000
        });
      }
    });
  }
  toggleCard(cardName: string) {
    this.expandedCard = this.expandedCard === cardName ? '' : cardName;
  }

  

  getDropdown() {
    this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblSupplierNamingByMaster`).subscribe({
      next: (res: any) => {
        this.supplierNamingOptions = res['table'] || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading states:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to load states.' });
      }
    });

    
     this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblSupplierGroupMaster`).subscribe({
      next: (res: any) => {
        this.supplierGroupOptions = res['table'] || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading states:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to load states.' });
      }
    });

     this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblSupplierActionMaster`).subscribe({
      next: (res: any) => {
        this.actionOptions = res['table'] || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading states:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to load states.' });
      }
    });

      this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblPurchaseRole`).subscribe({
      next: (res: any) => {
        this.overrideRoles = res['table'] || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading states:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to load states.' });
      }
    });

    this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblSupplierMaterialProcessMaster`).subscribe({
      next: (res: any) => {
        this.backflushOptions = res['table'] || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading states:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to load states.' });
      }
    });

        this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblPriceList|filterColumn=buySellTypeId|filterValue=10000`).subscribe({
      next: (res: any) => {
        this.priceListOptions = res['table'] || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading states:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to load states.' });
      }
    });
          this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblEmployeYesNoMaster`).subscribe({
      next: (res: any) => {
        this.receiptRequiredForInvoice = res['table'] || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading states:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to load states.' });
      }
    });
          this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblEmployeYesNoMaster`).subscribe({
      next: (res: any) => {
        this.poRequiredForInvoiceAndReceipt = res['table'] || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading states:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to load states.' });
      }
    });
  }





deleteItem(item: any) {
    this.selectedIndex = item;
    this.openConfirmation('Confirm', 'Are you sure want to delete?', 'delete');
  }

  deleteData() {
    this.isFormLoading = true;
    const userId = sessionStorage.getItem('userId') || '';
    const query = `purchaseSettingId=${this.selectedIndex.purchaseSettingId}|appUserId=${userId}`;
    this.userService.SubmitPostTypeData('uspDeletePurchaseSettings', query, 'header').subscribe({
      next: (res: any) => {
        this.isFormLoading = false;
        const result = res.split('-');
        if (result[1] === 'success') {
          this.message.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Setting deleted successfully.',
            life: 3000
          });
          this.getTableData(true);
          this.onDrawerHide();
        } else {
          this.message.add({ severity: 'warn', summary: 'Warning', detail: result[1], life: 3000 });
        }
      },
      error: () => {
        this.isFormLoading = false;
        this.message.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete data.',
          life: 3000
        });
      }
    });
  }
 
   isInvalid(field: string, form: FormGroup | null | undefined): boolean {


    if (!form || typeof form.get !== 'function') return false;

    const control = form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

}
