import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule, NgIf, NgFor, NgClass } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// PrimeNG modules used in template
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { CheckboxModule } from 'primeng/checkbox';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { CardModule } from 'primeng/card';
import { Tooltip } from 'primeng/tooltip';
import { Popover } from 'primeng/popover';

import { UserService } from '../../shared/user-service';
import { OnlyNumberDirective } from '../../shared/directive/only-number.directive';
import { HttpClient } from '@angular/common/http';
import { TableModule } from 'primeng/table';
import { TableTemplate, TableColumn } from '../../table-template/table-template';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';

@Component({
  selector: 'app-sales-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgIf,
    NgFor,
    NgClass,
    TableModule,
    Popover,
    Tooltip,
    BreadcrumbModule,
    ButtonModule,
    DrawerModule,
    CheckboxModule,
    SelectModule,
    InputNumberModule,
    CardModule,
    TableTemplate,
    OnlyNumberDirective,
    Toast,
    ConfirmDialog,
  ],
  providers: [ConfirmationService, MessageService],

  templateUrl: './sales-settings.html',
  styleUrls: ['./sales-settings.scss'],
})
export class SalesSettings {
  visible = false;
  salesSettingsForm!: FormGroup;

  // dropdowns
  tblNamingBy: any[] = [];
  PriceList: any[] = [];
  tblCustGroup: any[] = [];
  tblMatCategory: any[] = [];
  yesNoOptions: any[] = [];
  territoryOptions: any[] = [];

  // table / pagination
  pageNo = 1;
  isLoading = true;
  resData: any[] = [];
  totalCount = 0;
  pageSize = 5;
  header = '';
  headerIcon = 'pi pi-plus';
  searchText = '';
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // form / state
  isFormLoading = false;
  postType: string = '';

  selectedIndex: any = null;

  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true },
    { key: 'rowNo', header: 'Row No', isVisible: true, isSortable: false },
    { key: 'customerNamingTxt', header: 'Customer Naming', isVisible: true, isSortable: false },
    { key: 'customerGroupTxt', header: 'customer Group', isVisible: true, isSortable: false },
    { key: 'territoryTxt', header: 'territory', isVisible: true, isSortable: false },
    { key: 'priceListTxt', header: 'price List', isVisible: true, isSortable: false },
    {
      key: 'sameRateForSalesCycle',
      header: 'same Rate For Sales Cycle',
      isVisible: true,
      isSortable: false,
    },
    {
      key: 'userEditPriceListRate',
      header: 'user Edit Price List Rate',
      isVisible: true,
      isSortable: false,
    },
    {
      key: 'validateItemSellingPrice',
      header: 'validate Item Selling Price',
      isVisible: true,
      isSortable: false,
    },
    {
      key: 'productBundlePriceOnChildItems',
      header: 'product Bundle Price On Child Items',
      isVisible: true,
      isSortable: false,
    },
    { key: 'itemsNegativeRate', header: 'items Negative Rate', isVisible: true, isSortable: false },
    {
      key: 'salesOrderForSalesInvoiceAndDeliveryNote',
      header: 'sales Order For Sales Invoice And Delivery Note',
      isVisible: true,
      isSortable: false,
    },
    {
      key: 'deliveryNoteRequiredForSalesInvoice',
      header: 'delivery Note Required For Sales Invoice',
      isVisible: true,
      isSortable: false,
    },
    {
      key: 'blanketOrderAllowance',
      header: 'blanket Order Allowance',
      isVisible: true,
      isSortable: false,
    },
    {
      key: 'itemAddedMultipleTimes',
      header: 'item Added Multiple Times',
      isVisible: true,
      isSortable: false,
    },
    {
      key: 'multipleSOagainstPO',
      header: 'multiple SO against PO',
      isVisible: true,
      isSortable: false,
    },
    {
      key: 'salesOrderCreationForExpiredQuotation',
      header: 'sales Order Creation For Expired Quotation',
      isVisible: true,
      isSortable: false,
    },
    {
      key: 'notReserveSalesOrderQtyOnReturn',
      header: 'not Reserve Sales Order Qty On Return',
      isVisible: true,
      isSortable: false,
    },
    {
      key: 'hideCustomerTaxIdFromTransaction',
      header: 'hide Customer Tax Id From Transaction',
      isVisible: true,
      isSortable: false,
    },
    {
      key: 'enableDiscountAccountingForSelling',
      header: 'enable Discount Accounting For Selling',
      isVisible: true,
      isSortable: false,
    },
    {
      key: 'quotationWithZeroQuantity',
      header: 'quotation With Zero Quantity',
      isVisible: true,
      isSortable: false,
    },
    {
      key: 'salesOrderWithZeroQuantity',
      header: 'sales Order With Zero Quantity',
      isVisible: true,
      isSortable: false,
    },
    { key: 'createdBy', header: 'created By', isVisible: true, isSortable: false },
    { key: 'createdOn', header: 'created On', isVisible: true, isSortable: false },
    { key: 'modifiedBy', header: 'modified By', isVisible: true, isSortable: false },
    { key: 'modifiedOn', header: 'modified On', isVisible: true, isSortable: false },
  ];

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private userService: UserService,
    private http: HttpClient,
    private message: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.getTableData(true);
  }

  initForm() {
    this.salesSettingsForm = this.fb.group({
      // CUSTOMER DEFAULTS
      customerNamingBy: ['', Validators.required],
      defaultCustomerGroup: ['', Validators.required],
      defaultTerritory: ['', Validators.required],

      defaultPriceList: ['', Validators.required],
      maintainSameRate: [false],
      allowUserEditPrice: [false],
      validateSellingPrice: [false],
      calculateBundlePrice: [false],
      allowNegativeRates: [false],

      salesOrderRequired: ['', Validators.required],
      deliveryNoteRequired: ['', Validators.required],
      blanketOrderAllowance: [false],
      allowMultipleItems: [false],
      allowMultipleSO: [false],
      allowSOExpiredQuote: [false],
      dontReserveQtyOnReturn: [false],
      hideCustomerTaxId: [false],
      enableDiscountAccounting: [false],
      allowQuotationZeroQty: [false],
      allowSOZeroQty: [false],
    });
  }

  private toBit(val: any): number {
    if (val === 10000 || val === '10000') return 1;
    if (val === 10001 || val === '10001') return 0;
    return !!val ? 1 : 0;
  }

  toBoolean(value: any): boolean {
    return value == 1 || value === true || value === '1' || value === '10000';
  }
  private scrollToFirstInvalidControl() {
    const firstInvalidControlName = this.findFirstInvalidControlName();
    if (firstInvalidControlName) {
      // Use a timeout to ensure the DOM is updated before we try to find the element.
      setTimeout(() => {
        const element = document.querySelector(
          `[formcontrolname="${firstInvalidControlName}"]`
        ) as HTMLElement;
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus({ preventScroll: true });
          element.classList.add('p-invalid');
          setTimeout(() => element.classList.remove('p-invalid'), 3000);
        }
      }, 100);
    }
  }
  private findFirstInvalidControlName(): string | null {
    return (
      Object.keys(this.salesSettingsForm.controls).find(
        (key) => this.salesSettingsForm.get(key)?.invalid
      ) || null
    );
  }
  onSubmit(event: any) {
    if (!this.salesSettingsForm.valid) {
      this.salesSettingsForm.markAllAsTouched();
      this.scrollToFirstInvalidControl();
      this.cdr.detectChanges();
      return;
    }

    this.openConfirmation('Confirm?', 'Are you sure you want to proceed?', '1', '1', event);
  }

  deleteItem(item: any) {
    this.selectedIndex = item;
    this.openConfirmation(
      'Confirm Deletion',
      'Are you sure you want to delete this sales setting?',
      item,
      '2'
    );
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
        } else if (option === '2') {
          this.deleteData();
        } else if (option === '4') {
          // this.childArrData = []
        } else if (option === '5') {
          this.salesSettingsForm.reset();
        }
      },
      reject: () => {
        if (option === '4') {
          this.salesSettingsForm.patchValue({
            // groupType: this.previousGroupType,
          });
        }
      },
    });
  }

  paramvaluedata: string = '';

  submitcall() {
    try {
      this.isFormLoading = true;
      let query = '';
      let SP = '';
      const districtId = sessionStorage.getItem('District') || '';

      const f = this.salesSettingsForm.value;
      const userId = sessionStorage.getItem('userId') || '';
      let orgId = JSON.parse(sessionStorage.getItem('UserInfo') || '')[0]['orgMasterId'];

      let postData =
        `orgId=${orgId}` +
        `|customerNaming=${f.customerNamingBy}` +
        `|territory=${f.defaultTerritory}` +
        `|customerGroup=${f.defaultCustomerGroup}` +
        `|priceList=${f.defaultPriceList}` +
        `|sameRateForSalesCycle=${this.toBit(f.maintainSameRate)}` +
        `|userEditPriceListRate=${this.toBit(f.allowUserEditPrice)}` +
        `|validateItemSellingPrice=${this.toBit(f.validateSellingPrice)}` +
        `|productBundlePriceOnChildItems=${this.toBit(f.calculateBundlePrice)}` +
        `|itemsNegativeRate=${this.toBit(f.allowNegativeRates)}` +
        `|salesOrderForSalesInvoiceAndDeliveryNote=${this.toBit(f.salesOrderRequired)}` +
        `|deliveryNoteRequiredForSalesInvoice=${this.toBit(f.deliveryNoteRequired)}` +
        `|blanketOrderAllowance=${this.toBit(f.blanketOrderAllowance)}` +
        `|itemAddedMultipleTimes=${this.toBit(f.allowMultipleItems)}` +
        `|multipleSOagainstPO=${this.toBit(f.allowMultipleSO)}` +
        `|salesOrderCreationForExpiredQuotation=${this.toBit(f.allowSOExpiredQuote)}` +
        `|notReserveSalesOrderQtyOnReturn=${this.toBit(f.dontReserveQtyOnReturn)}` +
        `|hideCustomerTaxIdFromTransaction=${this.toBit(f.hideCustomerTaxId)}` +
        `|enableDiscountAccountingForSelling=${this.toBit(f.enableDiscountAccounting)}` +
        `|quotationWithZeroQuantity=${this.toBit(f.allowQuotationZeroQty)}` +
        `|salesOrderWithZeroQuantity=${this.toBit(f.allowSOZeroQty)}` +
        `|appUserId=${userId}`;

      if (this.postType === 'update') {
        const saleSettingId =
          this.selectedIndex?.saleSettingId ||
          this.selectedIndex?.transId ||
          this.selectedIndex?.id;
        postData = `saleSettingId=${saleSettingId}|` + postData;

        query = `${postData}`;

        SP = `uspUpdateSalesSettings`;
      } else {
        query = `${postData}`;
        SP = `uspPostSalesSettings`;
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
                detail:
                  this.postType === 'update'
                    ? 'Data Updated Successfully.'
                    : 'Data Saved Successfully.',
                life: 3000,
              });
              this.onDrawerHide();
            } else {
              this.message.add({
                severity: 'warn',
                summary: 'Warning',
                detail: resultarray[1] || datacom,
                life: 3000,
              });
            }
          } catch (innerErr) {
            console.error('Error processing response:', innerErr);
            this.message.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Something went wrong while processing response.',
              life: 3000,
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
              life: 3000,
            });
            // this.Customvalidation.loginroute(err.status);
          } else {
            this.message.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Something went wrong.',
              life: 3000,
            });
          }
        },
      });
    } catch (error) {
      console.error('Unexpected error in submitcall():', error);
      this.isFormLoading = false;
      this.message.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Something went wrong',
        life: 3000,
      });
      // sessionStorage.clear();
      // localStorage.clear();
      // this.router.navigate(['/login']);
    }
  }

  deleteData() {
    try {
      this.isFormLoading = true;
      const userId = sessionStorage.getItem('userId') || 'NULL';

      // Get the correct ID from selectedIndex - it should be saleSettingId, transId, or id
      const saleSettingId =
        this.selectedIndex?.saleSettingId || this.selectedIndex?.transId || this.selectedIndex?.id;

      if (!saleSettingId) {
        this.message.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No valid ID found for deletion.',
          life: 3000,
        });
        this.isFormLoading = false;
        return;
      }

      let query = `saleSettingId=${saleSettingId}|appUserId=${userId}`;

      this.userService.SubmitPostTypeData(`uspDeleteSalesSettings`, query, 'header').subscribe({
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
                life: 3000,
              });
              this.onDrawerHide();
            } else {
              this.message.add({
                severity: 'warn',
                summary: 'Warning',
                detail: resultarray[1] || datacom,
                life: 3000,
              });
            }
          } catch (innerErr) {
            console.error('Error processing response:', innerErr);
            this.message.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Something went wrong while processing response.',
              life: 3000,
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
              life: 3000,
            });
            //this.Customvalidation.loginroute(err.status);
          } else {
            this.message.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete data. Please try again later.',
              life: 3000,
            });
          }
        },
      });
    } catch (error) {
      console.error('Unexpected error in deleteData():', error);
      this.isFormLoading = false;
    }
  }

  refreshData() {
    setTimeout(() => {
      this.isLoading = true;
      this.cdr.detectChanges();
      this.getTableData(true);
    }, 0);
  }

  getTableData(isTrue: boolean) {
    try {
      if (isTrue) {
        setTimeout(() => {
          this.isLoading = true;
          this.cdr.detectChanges();
        }, 0);
      } else {
        this.pageNo = 1;
      }

      const districtId = sessionStorage.getItem('District') || '0';
      const orgId = JSON.parse(sessionStorage.getItem('UserInfo') || '')[0]['orgMasterId'];
      const userId = sessionStorage.getItem('userId') || 'NULL';
      const roleId = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId || '0';

      const query = `districtId=${districtId}|appUserId=${userId}|appUserRole=${roleId}|searchText=${
        this.searchText || ''
      }|pageIndex=${this.pageNo}|size=${this.pageSize}`;

      this.userService.getQuestionPaper(`uspGetSalesSettings|${query}`).subscribe({
        next: (res: any) => {
          try {
            this.resData = res?.table1 || [];
            this.totalCount = res?.table?.[0]?.totalCnt || 0;
          } catch (innerErr) {
            console.error('Error processing sales settings response:', innerErr);
            this.resData = [];
            this.totalCount = 0;
          } finally {
            setTimeout(() => {
              this.isLoading = false;
              this.cdr.detectChanges();
            }, 0);
          }
        },
        error: (err) => {
          console.error('API error getTableData:', err);
          setTimeout(() => {
            this.isLoading = false;
            this.resData = [];
            this.totalCount = 0;
            this.cdr.detectChanges();
          }, 0);
          this.message.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to fetch sales settings. Please try again.',
            life: 3000,
          });
        },
      });
    } catch (error) {
      console.error('Unexpected error in getTableData():', error);
      setTimeout(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }, 0);
    }
  }

  loadDropdowns() {
    const dropdownConfigs = [
      { key: 'tblCustGroup', table: 'tblCustomerGroupMaster', action: 'ITEMTYPE' },
      { key: 'tblMatCategory', table: 'tblMaterialCategory' },
      { key: 'yesNoOptions', table: 'tblEmployeYesNoMaster' },
      { key: 'tblNamingBy', table: 'tblCustomerNamingByMaster' },
      { key: 'territoryOptions', table: 'tblRegionMaster' },
      {
        key: 'PriceList',
        table: 'tblPriceList',
        filterColumn: 'buySellTypeId',
        filterValue: '10001',
      },
    ];

    dropdownConfigs.forEach((config) => {
      let api = '';
      if (config.action) {
        api = `uspGetItemsDrpData|id=0|action=${config.action}`;
      } else if (config.filterColumn && config.filterValue) {
        api = `uspGetFillDrpDown|table=${config.table}|filterColumn=${config.filterColumn}|filterValue=${config.filterValue}`;
      } else {
        api = `uspGetFillDrpDown|table=${config.table}`;
      }

      this.userService.getQuestionPaper(api).subscribe({
        next: (res: any) => {
          (this as any)[config.key] = res?.table || [];
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(`Error loading ${config.key}:`, err);
          if (config.key === 'yesNoOptions' && !(this as any)[config.key]?.length) {
            this.yesNoOptions = [
              { drpOption: 'Yes', drpValue: 10000 },
              { drpOption: 'No', drpValue: 10001 },
            ];
          }
        },
      });
    });
  }

  onClear() {
    this.salesSettingsForm.reset();

    this.cdr.detectChanges();
  }

  showDialog(view: string, data: any) {
    this.loadDropdowns();
    this.isFormLoading = true;
    this.selectedIndex = data;

    this.cdr.detectChanges();

    if (view == 'add') {
      this.visible = true;
      this.postType = view;
      this.header = 'Add Sales Settings';
      this.headerIcon = 'pi pi-plus';
      this.salesSettingsForm.reset({ id: 0 });

      this.isFormLoading = false;
      this.cdr.detectChanges();
    } else {
      this.visible = true;
      this.postType = view;
      this.header = view === 'update' ? 'Update Material' : 'View Material';
      this.headerIcon = view === 'update' ? 'pi pi-pencil' : 'pi pi-eye';
      this.selectedIndex = data;

      if (view === 'view') {
        this.salesSettingsForm.disable();
      } else {
        this.salesSettingsForm.enable();
      }

      const patchData = {
        customerNamingBy: data.customerNaming || '',
        defaultCustomerGroup: data.customerGroup || '',
        defaultTerritory: data.territory || '',
        defaultPriceList: data.priceList || '',
        maintainSameRate: this.toBoolean(data.sameRateForSalesCycle),
        allowUserEditPrice: this.toBoolean(data.userEditPriceListRate),
        validateSellingPrice: this.toBoolean(data.validateItemSellingPrice),
        calculateBundlePrice: this.toBoolean(data.productBundlePriceOnChildItems),
        allowNegativeRates: this.toBoolean(data.itemsNegativeRate),
        salesOrderRequired: data.salesOrderForSalesInvoiceAndDeliveryNote == 1 ? 10000 : 10001,
        deliveryNoteRequired: data.deliveryNoteRequiredForSalesInvoice == 1 ? 10000 : 10001,
        blanketOrderAllowance: this.toBoolean(data.blanketOrderAllowance),
        allowMultipleItems: this.toBoolean(data.itemAddedMultipleTimes),
        allowMultipleSO: this.toBoolean(data.multipleSOagainstPO),
        allowSOExpiredQuote: this.toBoolean(data.salesOrderCreationForExpiredQuotation),
        dontReserveQtyOnReturn: this.toBoolean(data.notReserveSalesOrderQtyOnReturn),
        hideCustomerTaxId: this.toBoolean(data.hideCustomerTaxIdFromTransaction),
        enableDiscountAccounting: this.toBoolean(data.enableDiscountAccountingForSelling),
        allowQuotationZeroQty: this.toBoolean(data.quotationWithZeroQuantity),
        allowSOZeroQty: this.toBoolean(data.salesOrderWithZeroQuantity),
      };

      this.salesSettingsForm.patchValue(patchData);

      this.isFormLoading = false;
      this.cdr.detectChanges();
    }
    document.body.style.overflow = 'hidden';
  }

  onDrawerHide(): void {
    this.visible = false;
  }

  isInvalid(field: string): boolean {
    const control = this.salesSettingsForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  // Pagination helpers
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
}
