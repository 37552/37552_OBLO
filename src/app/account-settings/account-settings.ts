import { Component, ChangeDetectorRef } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
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
import { DatePickerModule } from 'primeng/datepicker';

@Component({
  selector: 'app-account-settings',
  standalone: true,
  imports: [
    TableTemplate,
    ButtonModule,
    DrawerModule,
    Popover,
    Tooltip,
    ConfirmDialog,
    Toast,
    ProgressSpinner,
    CardModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    SelectModule,
    CheckboxModule,
    MultiSelectModule,
    DatePickerModule,
  ],
  providers: [ConfirmationService, MessageService, DatePipe],
  templateUrl: './account-settings.html',
  styleUrls: ['./account-settings.scss'],
})
export class AccountSettings {
  isLoading = true;
  visible = false;
  postType = '';
  header = '';
  headerIcon = 'pi pi-plus';
  isFormLoading = false;
  data: any[] = [];
  expandedCard: string | null = null;

  // ⭐ MAIN FORM (mapped to your accounting settings HTML)
  accountingForm: FormGroup;
  assetsForm: FormGroup;
  creditLimitsForm: FormGroup;
  accountsClosingForm!: FormGroup;

  orgMasterId = '';
  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true },
    {
      key: 'bookDeferredEntriesBasedOnTxt',
      header: 'Book Deferred Entries BasedOn',
      isVisible: true,
      isSortable: false,
    },
    {
      key: 'addressTaxCategoryFromTxt',
      header: 'Address Tax Category From ',
      isVisible: true,
      isSortable: false,
    },
    {
      key: 'postDateInheritForExchngGainLossTxt',
      header: 'Post Date Inherit For ExchngGainLoss',
      isVisible: true,
      isSortable: false,
    },
    {
      key: 'roleAllowedToOverBillTxt',
      header: 'Role Allowed To OverBill ',
      isVisible: true,
      isSortable: false,
    },
    {
      key: 'roleAllowedToBypassLimitTxt',
      header: 'Role Allowed To BypassLimit ',
      isVisible: true,
      isSortable: false,
    },
    {
      key: 'accountFrozenTillDate',
      header: 'Account Frozen Till Date',
      isVisible: true,
      isSortable: false,
    },
  ];

  pageNo = 1;
  pageSize = 5;
  totalCount = 0;
  searchText = '';
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  selectedIndex: any = [];
  paramvaluedata = '';
  bankingForm: any;
  roleAllowed: any;
  determineAddressTaxFrom: any[] = [];
  postingDateInheritanceOptions: any[] = [];
  deferredOptions: any[] = [];
  myService: any;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private message: MessageService,
    private cdr: ChangeDetectorRef,
    private Customvalidation: Customvalidation,
    private datePipe: DatePipe
  ) {
    // ⭐ FORM MAPPED EXACTLY WITH YOUR HTML CHECKBOXES & INPUTS
    this.accountingForm = this.fb.group({
      unlinkPaymentOnInvoiceCancel: [false],
      unlinkAdvanceOnOrderCancel: [false],
      checkSupplierInvoiceUniqueness: [false],
      autoFetchPaymentTermsFromOrder: [false],
      mergeSimilarAccountHeads: [false],
      bookDeferredEntriesBasedOn: ['', Validators.required],
      determineAddressTaxFrom: ['', Validators.required],
      bookTaxLossEarlyPayment: [false],
      showInclusiveTaxInPrint: [false],
      showTaxAsTableInPrint: [false],
      autoReconcilePayments: [false],
      autoReconcileInterval: ['', Validators.required],
      deleteLedgerEntriesOnDelete: [false],
      enableImmutableLedger: [false],
      enableCommonPartyAccounting: [false],
      allowMultiCurrencyInvoices: [false],
      autoProcessDeferredAccounting: [false],
      autoAddTaxesFromTemplate: [false],
      roundTaxAmountRowWise: [false],
      showPaymentScheduleInPrint: [false],
      allowStateExchangeRates: [false],
      postingDateInheritanceForGainLoss: ['', Validators.required],
      reconcileQueueSize: ['', Validators.required],
    });

    this.creditLimitsForm = this.fb.group({
  overBillingAllowance: ['', Validators.required],
  roleAllowedToOverBill: ['', Validators.required],
  roleAllowedToBypassLimit: ['', Validators.required]
});

    this.assetsForm = this.fb.group({
      calculateDailyDepreciation: [false],
      bookAssetDepreciationAutomatically: [false],
    });
    this.accountsClosingForm = this.fb.group({
       accountsFrozenTillDate: ['', Validators.required],
      roleAllowedToFreezeEdit: [null, Validators.required],
      ignoreAccountClosingBalance: [false],
    });

    this.bankingForm = this.fb.group({
      enableCommonPartyAcc: [false],
    });
  }

  toggleCard(card: string) {
    this.expandedCard = this.expandedCard === card ? null : card;
  }

  ngOnInit() {
    this.getTableData(true);
    this.getDropdown();
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 800);
  }

  getDropdown() {
    this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblRoleMaster`).subscribe({
      next: (res: any) => {
        this.roleAllowed = res['table'] || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading states:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to load states.' });
      },
    });

    this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblAddressTypeMaster`).subscribe({
      next: (res: any) => {
        this.determineAddressTaxFrom = res['table'] || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading states:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to load states.' });
      },
    });

    this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblDateTypeMaster`).subscribe({
      next: (res: any) => {
        this.postingDateInheritanceOptions = res['table'] || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading states:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to load states.' });
      },
    });
    this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblTimeDimensionMaster`).subscribe({
      next: (res: any) => {
        this.deferredOptions = res['table'] || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading states:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to load states.' });
      },
    });
  }

  getTableData(isTrue: boolean) {
    try {
      if (isTrue) this.isLoading = true;
      else this.pageNo = 1;
      const districtId = sessionStorage.getItem('District') || '';
      const userId = sessionStorage.getItem('userId') || '';
      const roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
      const query = `appUserRole=${roleID}|appUserId=${userId}|searchText=${this.searchText}|pageIndex=${this.pageNo}|size=${this.pageSize}|districtId=${districtId}`;

      this.userService.getQuestionPaper(`uspGetAccountSettings|${query}`).subscribe({
        next: (res: any) => {
          this.data = res?.table1 || [];
          console.log('data', this.data);

          this.totalCount = res?.table?.[0]?.totalCnt || this.data.length;
          setTimeout(() => {
            this.isLoading = false;
            this.cdr.detectChanges();
          }, 1000);
        },
        error: (err) => {
          this.isLoading = false;
          if (err.status === 403) this.Customvalidation.loginroute(err.status);
        },
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

  // ⭐ OPEN DRAWER
  showDialog(mode: 'add' | 'view' | 'update', data?: any) {
    ;
    this.isFormLoading = true;
    this.visible = true;
    this.postType = mode;
    this.header =
      mode === 'add'
        ? 'Add Account Setting'
        : mode === 'update'
        ? 'Update Account Setting'
        : 'View Account Setting';
    this.headerIcon =
      mode === 'add' ? 'pi pi-plus' : mode === 'update' ? 'pi pi-pencil' : 'pi pi-eye';

    if (mode !== 'add' && data) {
      // patch values properly, converting 0/1 from backend to boolean
      ;
      this.accountingForm.patchValue({
        unlinkPaymentOnInvoiceCancel: data.unlinkPaymentOnInvoiceCancel,
        unlinkAdvanceOnOrderCancel: data.unlinkAdvancePaymentOnOrderCancel,
        checkSupplierInvoiceUniqueness: data.uniqueSupplierInvoiceNumber,
        autoFetchPaymentTermsFromOrder: data.fetchPaymentTermsFromOrder,
        mergeSimilarAccountHeads: data.similarAccountHeadMerge || '',
        bookDeferredEntriesBasedOn: data.bookDeferredEntriesBasedOn || '',
        determineAddressTaxFrom: data.addressTaxCategoryFrom || '',
        bookTaxLossEarlyPayment: data.bookTaxLossOnEarlyPayDisc,
        showInclusiveTaxInPrint: data.showExclusiveTaxInPrint,
        showTaxAsTableInPrint: data.showTaxesAsTableInPrint,
        autoReconcilePayments: data.autoReconcilePay,
        autoReconcileInterval: data.autoReconcileJobTriggerInMin || '',
        deleteLedgerEntriesOnDelete: data.deleteAccountStockLedgerOnTranDel,
        enableImmutableLedger: data.enableImmutableLedger,
        enableCommonPartyAccounting: data.enableCommonPartyAccounting,
        allowMultiCurrencyInvoices: data.multiCurrInvoicesAgainstSinglePartyAcc,
        autoProcessDeferredAccounting: data.autoProcessDeferredAccEntry || '',
        autoAddTaxesFromTemplate: data.autoAddTaxChargeFromItemTax,
        roundTaxAmountRowWise: data.roundTaxAmtRowWise,
        showPaymentScheduleInPrint: data.showPayScheduleInPrint,
        allowStateExchangeRates: data.allowStateExchngRates,
        postingDateInheritanceForGainLoss: data.postDateInheritForExchngGainLoss || '',
        reconcileQueueSize: data.reconcileQueueSize || '',
      });

      this.creditLimitsForm.patchValue({
        overBillingAllowance: data.overBillingAllowance || '',
        roleAllowedToOverBill: data.roleAllowedToOverBill || '',
        roleAllowedToBypassLimit: data.roleAllowedToBypassLimit || '',
      });

      this.assetsForm.patchValue({
        calculateDailyDepreciation: data.calcDailyDeprcUsingPeriodTotalDays,
        bookAssetDepreciationAutomatically: data.autoBookAssetDeprcEntry,
      });
      ;
      const frozenDate = data.accountFrozenTillDate
        ? new Date(data.accountFrozenTillDate) // <-- important
        : '';
      this.accountsClosingForm.patchValue({
        accountsFrozenTillDate: frozenDate
          ? this.datePipe.transform(data.accountFrozenTillDate, 'yyyy-MM-dd')
          : '',
        roleAllowedToFreezeEdit: data.roleForSetFrozenAccAndEntry || '',
        ignoreAccountClosingBalance: data.ignoreAccClosingBal,
      });
   
      this.bankingForm.patchValue({
        enableCommonPartyAcc: data.enableCommonPartyAcc,
      });

      this.selectedIndex = data;

      if (mode === 'view') {
        this.accountingForm.disable();
        this.creditLimitsForm.disable();
        this.assetsForm.disable();
        this.accountsClosingForm.disable();
        this.bankingForm.disable();
      } else {
        this.accountingForm.enable();
        this.creditLimitsForm.enable();
        this.assetsForm.enable();
        this.accountsClosingForm.enable();
        this.bankingForm.enable();
      }
    } else {
      this.accountingForm.enable();
      this.accountingForm.reset();

      this.creditLimitsForm.enable();
      this.creditLimitsForm.reset();

      this.assetsForm.enable();
      this.assetsForm.reset();

      this.accountsClosingForm.enable();
      this.accountsClosingForm.reset();

      this.bankingForm.enable();
      this.bankingForm.reset();
    }

    setTimeout(() => {
      this.isFormLoading = false;
      this.cdr.detectChanges();
    }, 200);
  }

  onDrawerHide() {
    this.visible = false;
    this.accountingForm.enable();
    this.onClear();
  }

  onClear() {
    this.accountingForm.reset();
    this.creditLimitsForm.reset();
    this.assetsForm.reset();
    this.accountsClosingForm.reset();
    this.bankingForm.reset();
  }
  

  // ⭐ SUBMIT
  onSubmit(event: any) {
    
    if (!this.accountingForm.valid) {
      this.accountingForm.markAllAsTouched();
      return;
    }
    if (!this.creditLimitsForm.valid) {
      this.creditLimitsForm.markAllAsTouched();
      return;
    }
    if (!this.assetsForm.valid) {
      this.assetsForm.markAllAsTouched();
      return;
    }
    if (!this.accountsClosingForm.valid) {
      this.accountsClosingForm.markAllAsTouched();
      return;
    }
    if (!this.bankingForm.valid) {
      this.bankingForm.markAllAsTouched();
      return;
    }

    const unlinkPaymentOnInvoiceCancel = this.accountingForm.get('unlinkPaymentOnInvoiceCancel')
      ?.value
      ? 1
      : 0;
    const unlinkAdvanceOnOrderCancel = this.accountingForm.get('unlinkAdvanceOnOrderCancel')?.value
      ? 1
      : 0;
    const checkSupplierInvoiceUniqueness = this.accountingForm.get('checkSupplierInvoiceUniqueness')
      ?.value
      ? 1
      : 0;
    const autoFetchPaymentTermsFromOrder = this.accountingForm.get('autoFetchPaymentTermsFromOrder')
      ?.value
      ? 1
      : 0;
    const mergeSimilarAccountHeads = this.accountingForm.get('mergeSimilarAccountHeads')?.value
      ? 1
      : 0;
    const bookDeferredEntriesBasedOn =
      this.accountingForm.get('bookDeferredEntriesBasedOn')?.value || 0;
    const determineAddressTaxFrom = this.accountingForm.get('determineAddressTaxFrom')?.value || 0;
    const bookTaxLossEarlyPayment = this.accountingForm.get('bookTaxLossEarlyPayment')?.value
      ? 1
      : 0;
    const showInclusiveTaxInPrint = this.accountingForm.get('showInclusiveTaxInPrint')?.value
      ? 1
      : 0;
    const showTaxAsTableInPrint = this.accountingForm.get('showTaxAsTableInPrint')?.value ? 1 : 0;
    const autoReconcilePayments = this.accountingForm.get('autoReconcilePayments')?.value ? 1 : 0;
    const autoReconcileInterval = this.accountingForm.get('autoReconcileInterval')?.value || '';
    const deleteLedgerEntriesOnDelete = this.accountingForm.get('deleteLedgerEntriesOnDelete')
      ?.value
      ? 1
      : 0;
    const enableImmutableLedger = this.accountingForm.get('enableImmutableLedger')?.value ? 1 : 0;
    const enableCommonPartyAccounting = this.accountingForm.get('enableCommonPartyAccounting')
      ?.value
      ? 1
      : 0;
    const allowMultiCurrencyInvoices = this.accountingForm.get('allowMultiCurrencyInvoices')?.value
      ? 1
      : 0;
    const autoProcessDeferredAccounting =
      this.accountingForm.get('autoProcessDeferredAccounting')?.value || '';
    const autoAddTaxesFromTemplate = this.accountingForm.get('autoAddTaxesFromTemplate')?.value
      ? 1
      : 0;
    const roundTaxAmountRowWise = this.accountingForm.get('roundTaxAmountRowWise')?.value ? 1 : 0;
    const showPaymentScheduleInPrint = this.accountingForm.get('showPaymentScheduleInPrint')?.value
      ? 1
      : 0;
    const allowStateExchangeRates = this.accountingForm.get('allowStateExchangeRates')?.value
      ? 1
      : 0;
    const postingDateInheritanceForGainLoss =
      this.accountingForm.get('postingDateInheritanceForGainLoss')?.value || 0;
    const reconcileQueueSize = this.accountingForm.get('reconcileQueueSize')?.value || '';

    const overBillingAllowance = this.creditLimitsForm.get('overBillingAllowance')?.value || '';
    const roleAllowedToOverBill = this.creditLimitsForm.get('roleAllowedToOverBill')?.value || 0;
    const roleAllowedToBypassLimit =
      this.creditLimitsForm.get('roleAllowedToBypassLimit')?.value || 0;

    const calculateDailyDepreciation = this.assetsForm.get('calculateDailyDepreciation')?.value
      ? 1
      : 0;
    const bookAssetDepreciationAutomatically = this.assetsForm.get(
      'bookAssetDepreciationAutomatically'
    )?.value
      ? 1
      : 0;

    const accountsFrozenTillDate = this.accountsClosingForm.get('accountsFrozenTillDate')?.value
      ? this.datePipe.transform(
          this.accountsClosingForm.get('accountsFrozenTillDate')?.value,
          'yyyy-MM-dd'
        )
      : '';
    ;
    const roleAllowedToFreezeEdit =
      this.accountsClosingForm.get('roleAllowedToFreezeEdit')?.value || 0;
    const ignoreAccountClosingBalance = this.accountsClosingForm.get('ignoreAccountClosingBalance')
      ?.value
      ? 1
      : 0;

    const enableCommonPartyAcc = this.bankingForm.get('enableCommonPartyAcc')?.value ? 1 : 0;
    const userData = JSON.parse(sessionStorage.getItem('UserInfo') || '{}');
    this.orgMasterId = userData[0].orgMasterId;

    const userId = sessionStorage.getItem('userId') || '';

    this.paramvaluedata =
      `orgId=${this.orgMasterId}|unlinkPaymentOnInvoiceCancel=${unlinkPaymentOnInvoiceCancel}|unlinkAdvancePaymentOnOrderCancel=${unlinkAdvanceOnOrderCancel}|uniqueSupplierInvoiceNumber=${checkSupplierInvoiceUniqueness}` +
      `|fetchPaymentTermsFromOrder=${autoFetchPaymentTermsFromOrder}|similarAccountHeadMerge=${mergeSimilarAccountHeads}|bookDeferredEntriesBasedOn=${bookDeferredEntriesBasedOn}|addressTaxCategoryFrom=${determineAddressTaxFrom}` +
      `|bookTaxLossOnEarlyPayDisc=${bookTaxLossEarlyPayment}|showExclusiveTaxInPrint=${showInclusiveTaxInPrint}|showTaxesAsTableInPrint=${showTaxAsTableInPrint}|autoReconcilePay=${autoReconcilePayments}|autoReconcileJobTriggerInMin=${autoReconcileInterval}` +
      `|deleteAccountStockLedgerOnTranDel=${deleteLedgerEntriesOnDelete}|enableImmutableLedger=${enableImmutableLedger}|enableCommonPartyAccounting=${enableCommonPartyAccounting}|multiCurrInvoicesAgainstSinglePartyAcc=${allowMultiCurrencyInvoices}` +
      `|autoProcessDeferredAccEntry=${autoProcessDeferredAccounting}|autoAddTaxChargeFromItemTax=${autoAddTaxesFromTemplate}|roundTaxAmtRowWise=${roundTaxAmountRowWise}|showPayScheduleInPrint=${showPaymentScheduleInPrint}` +
      `|allowStateExchngRates=${allowStateExchangeRates}|postDateInheritForExchngGainLoss=${postingDateInheritanceForGainLoss}|reconcileQueueSize=${reconcileQueueSize}` +
      `|overBillingAllowance=${overBillingAllowance}|roleAllowedToOverBill=${roleAllowedToOverBill}|roleAllowedToBypassLimit=${roleAllowedToBypassLimit}|calcDailyDeprcUsingPeriodTotalDays=${calculateDailyDepreciation}` +
      `|autoBookAssetDeprcEntry=${bookAssetDepreciationAutomatically}|accountFrozenTillDate=${accountsFrozenTillDate}|roleForSetFrozenAccAndEntry=${roleAllowedToFreezeEdit}` +
      `|ignoreAccClosingBal=${ignoreAccountClosingBalance}|enableCommonPartyAcc=${enableCommonPartyAcc}|appUserId=${userId}`;

    this.openConfirmation('Confirm?', 'Are you sure you want to proceed?', 'add');
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
      },
    });
  }

  submitCall() {
    this.isFormLoading = true;
    const userId = sessionStorage.getItem('userId') || '';
    let query = '';
    let SP = '';
    const userData = JSON.parse(sessionStorage.getItem('UserInfo') || '{}');
    this.orgMasterId = userData[0].orgMasterId;
    if (this.postType === 'update') {
      SP = `uspUpdateAccountSettings`;
      query = `${this.paramvaluedata}|accountSettingId=${this.selectedIndex.accountSettingId}`;
    } else {
      SP = `uspPostAccountSettings`;
      query = `${this.paramvaluedata}`;
    }

    this.userService.SubmitPostTypeData(SP, query, 'header').subscribe({
      next: (res: any) => {
        this.isFormLoading = false;
        const result = res.split('-');
        if (result[1] === 'success') {
          this.message.add({
            severity: 'success',
            summary: 'Success',
            detail:
              this.postType === 'update'
                ? 'Data Updated Successfully.'
                : 'Data Saved Successfully.',
            life: 3000,
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
          life: 3000,
        });
      },
    });
  }

  deleteItem(item: any) {
    this.selectedIndex = item;
    this.openConfirmation('Confirm', 'Are you sure want to delete?', 'delete');
  }

  deleteData() {
    this.isFormLoading = true;
    const userId = sessionStorage.getItem('userId') || '';
    const query = `accountSettingId=${this.selectedIndex.accountSettingId}|appUserId=${userId}`;
    this.userService.SubmitPostTypeData('uspDeleteAccountSettings', query, 'header').subscribe({
      next: (res: any) => {
        this.isFormLoading = false;
        const result = res.split('-');
        if (result[1] === 'success') {
          this.message.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Setting deleted successfully.',
            life: 3000,
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
          life: 3000,
        });
      },
    });
  }

  isInvalid(field: string, form: FormGroup | null | undefined): boolean {
    if (!form || typeof form.get !== 'function') return false;
    const control = form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}
