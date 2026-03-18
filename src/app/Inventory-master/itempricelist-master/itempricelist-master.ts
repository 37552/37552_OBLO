import { Component, ChangeDetectorRef, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { TableTemplate, TableColumn } from '../../table-template/table-template';
import { ButtonModule } from 'primeng/button';
import { Popover } from 'primeng/popover';
import { Tooltip } from "primeng/tooltip";
import { Dialog } from 'primeng/dialog';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CardModule } from 'primeng/card';
import { DrawerModule } from 'primeng/drawer';
import { UserService } from '../../shared/user-service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Toast } from 'primeng/toast';
import { FileUploadModule } from 'primeng/fileupload';
import { HttpErrorResponse } from '@angular/common/http';
import { ConfigService } from '../../shared/config.service';
import { OnlyNumberDirective } from '../../shared/directive/only-number.directive';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { SkeletonModule } from 'primeng/skeleton';
import { MultiSelectModule } from 'primeng/multiselect';
import { DatePickerModule } from 'primeng/datepicker';
import { Drawer } from 'primeng/drawer';
import { OnlyDecimalDirective } from '../../shared/directive/number-decimal.directive';

@Component({
  selector: 'app-itempricelist-master',
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
    InputTextModule,
    InputNumberModule,
    ConfirmDialog,
    ProgressSpinner,
    Toast,
    Tooltip,
    FileUploadModule,
    Dialog,
    OnlyNumberDirective,
    BreadcrumbModule,
    SkeletonModule,
    MultiSelectModule,
    DatePickerModule,
    Drawer,
    OnlyDecimalDirective
  ],
  providers: [
    ConfirmationService,
    MessageService
  ],
  templateUrl: './itempricelist-master.html',
  styleUrl: './itempricelist-master.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItempricelistMaster {
  isLoading = true;
  visible: boolean = false;
  postType: string = '';
  header: any = '';
  selectedIndex: any = [];
  headerIcon: string = 'pi pi-plus';
  paramvaluedata: string = '';
  isFormLoading: boolean = false;
  data: any[] = [];
  itemPriceListForm: FormGroup;

  // Dropdown arrays
  priceLists: any[] = [];
  items: any[] = [];
  makers: any[] = [];
  units: any[] = [];
  itemJson: any[] = [];

  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true },
    { key: 'itemName', header: 'Item Name', isVisible: true },
    { key: 'itemCode', header: 'Item Code', isVisible: true },
    { key: 'makerName', header: 'Maker Code', isVisible: true },
    { key: 'unitName', header: 'Unit', isVisible: true },
    { key: 'itemRate', header: 'Item Rate', isVisible: true },
  ];

  pageNo = 1;
  pageSize = 5;
  searchText = '';
  totalCount = 0;
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  searchTimeout: any;
  debounceTime = 500;

  param: string | null = null;
  FormName: any;
  FormValue: any;
  menulabel: any;
  breadcrumbItems!: ({ label: any; disabled?: undefined; } | { label: any; disabled: boolean; })[];
  home: { icon: string; routerLink: string; } | undefined;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private configService: ConfigService,
    private message: MessageService,
    private cdr: ChangeDetectorRef
  ) {
    this.itemPriceListForm = this.fb.group({
      id: [0],
      priceListId: [null, Validators.required],
      itemCodeId: [null],
      makerCodeId: [null],
      unitId: [null],
      itemRate: [null]
    });
  }

  get f() { return this.itemPriceListForm.controls }

  ngOnInit(): void {
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
    this.loadDropdowns();
    this.getTableData(true);
    this.itemJson = [];
    this.cdr.detectChanges();
    setTimeout(() => {
      if (this.isLoading) {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    }, 1000);
  }

  loadDropdowns() {
    const dropdownConfigs = [
      { key: 'priceLists', table: 'tblPriceList' },
      { key: 'items', table: 'tblmaterialmaster' },
      { key: 'units', table: 'tblUnitMaster' }
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
    this.makers = [];
  }

  loadMakersByItem(itemId: number) {
    if (!itemId) {
      this.makers = [];
      this.itemPriceListForm.patchValue({ makerCodeId: null });
      this.cdr.detectChanges();
      return;
    }
    const userId = sessionStorage.getItem('userId') || '';
    const currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
    const roleId = currentRole?.roleId || '';

    this.userService.getQuestionPaper(`uspGetMatReqMasters|action=MAKERCODE|appUserId=${userId}|itemId=${itemId}|appUserRole=${roleId}`).subscribe({
      next: (res: any) => {
        this.makers = res['table'] || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading makers:', err);
        this.makers = [];
        this.message.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load makers for selected item.'
        });
        this.cdr.detectChanges();
      }
    });
  }


  onItemChange(event: any) {
    const selectedItemId = event.value;
    this.loadMakersByItem(selectedItemId);
    this.itemPriceListForm.patchValue({ makerCodeId: null });
  }

  getTableData(isTrue: boolean) {
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

    this.userService.getQuestionPaper(`uspGetItemPriceList|${query}`).subscribe({
      next: (res: any) => {
        try {
          this.data = res?.table1 || [];

          this.data = this.data.map(item => ({
            ...item,
            id: item.transId || item.id,
            priceListId: item.priceListId,
            itemCode: item.itemCode || '',
            itemCodeId: item.itemCodeId,
            makerName: item.make || '',
            makerCodeId: item.makerCodeId,
            unitName: item.unitText || '',
            unitId: item.unit,
            itemRate: item.itemRate || 0,
            isActive: item.isActive
          }));

          this.totalCount = res?.table?.[0]?.totalCnt ||
            res?.table1?.[0]?.totalCount ||
            this.data.length;

        } catch (innerErr) {
          console.error('Error processing response:', innerErr);
          this.data = [];
          this.totalCount = 0;
          this.message.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to process item price list data.'
          });
        } finally {
          setTimeout(() => {
            this.isLoading = false;
            this.cdr.detectChanges();
          }, 1000);
        }
      },
      error: (err) => {
        console.error('Error loading table data:', err);
        this.message.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load item price lists.'
        });
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSearchChange(search: string) {
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

  clearSearch() {
    this.searchText = '';
    this.pageNo = 1;
    this.getTableData(false);
    this.cdr.markForCheck();
  }

  showDialog(view: string, data: any) {
    this.isFormLoading = true;
    this.cdr.detectChanges();

    if (view == 'add') {
      this.visible = true;
      this.postType = view;
      this.header = this.FormName;
      this.headerIcon = 'pi pi-plus';
      this.itemPriceListForm.reset({ id: 0 });
      this.itemPriceListForm.reset({ id: 0 });
      this.makers = [];
      this.itemJson = [];
      this.isFormLoading = false;
      this.cdr.detectChanges();
      this.itemPriceListForm.disable();
    } else {
      this.visible = true;
      this.postType = view;
      this.header = view === 'update' ? this.FormName : this.FormName;
      this.headerIcon = view === 'update' ? 'pi pi-pencil' : 'pi pi-eye';
      this.selectedIndex = data;

      if (view === 'view') {
        this.itemPriceListForm.disable();
      } else {
        this.itemPriceListForm.enable();
      }

      const patchData = {
        id: data.transId || data.id || 0,
        priceListId: data.priceListId || null,
        itemCodeId: data.itemCodeId || null,
        makerCodeId: data.makerCodeId || null,
        unitId: data.unitId || null,
        itemRate: data.itemRate || null
      };

      this.itemPriceListForm.patchValue(patchData);
      if (data.itemCodeId) {
        this.loadMakersByItem(data.itemCodeId);
      } else {
        this.makers = [];
      }

      this.isFormLoading = false;
      this.cdr.detectChanges();
    }
    document.body.style.overflow = 'hidden';
  }

  onSubmit(event: any) {
    // Only check priceListId validity here, as item fields are in itemJson
    if (this.itemPriceListForm.get('priceListId')?.invalid) {
      this.itemPriceListForm.get('priceListId')?.markAsTouched();
      this.message.add({ severity: 'warn', summary: 'Warn', detail: 'Please select a Price List.' });
      return;
    }

    if (this.itemJson.length === 0 && this.postType !== 'update') {
      this.message.add({ severity: 'warn', summary: 'Warn', detail: 'Please add at least one item.' });
      return;
    }

    const formData = this.itemPriceListForm.getRawValue();

    const userId = sessionStorage.getItem('userId') || '';
    const roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId || 0;


    let itemJsonPayload = this.itemJson;
    if (this.postType === 'update') {
      itemJsonPayload = [];
    }

    this.paramvaluedata = `id=${formData.id}|priceListId=${formData.priceListId}|itemCodeId=${formData.itemCodeId ?? 0}|makerCodeId=${formData.makerCodeId ?? 0}|unitId=${formData.unitId ?? 0}|itemRate=${formData.itemRate ?? 0}|appUserId=${userId}|appUserRole=${roleID}|itemJson=${JSON.stringify(itemJsonPayload)}`;

    this.openConfirmation('Confirm?', "Are you sure you want to proceed?", '1', '1', event);
  }

  private scrollToFirstInvalidControl() {
    const firstInvalidControlName = this.findFirstInvalidControlName();
    if (firstInvalidControlName) {
      const element = document.querySelector(`input[formControlName="${firstInvalidControlName}"], select[formControlName="${firstInvalidControlName}"], textarea[formControlName="${firstInvalidControlName}"]`) as HTMLElement;
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus({ preventScroll: true });
        element.classList.add('p-invalid');
        setTimeout(() => element.classList.remove('p-invalid'), 3000);
      }
    }
  }

  private findFirstInvalidControlName(): string | null {
    const controls = this.itemPriceListForm.controls;
    for (const controlName in controls) {
      const control = controls[controlName];
      if (control.invalid && (control.touched || control.dirty)) {
        return controlName;
      }
    }
    return null;
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
        }
      },
      reject: () => {
      }
    });
  }

  submitcall() {
    this.isFormLoading = true;
    this.cdr.detectChanges();

    const SP = 'uspPostItemPriceList';

    this.userService.SubmitPostTypeData(SP, this.paramvaluedata, 'header').subscribe({
      next: (datacom: any) => {
        this.isFormLoading = false;
        if (!datacom) return;
        const resultarray = datacom.split('-');
        if (resultarray[1] === 'success') {
          this.getTableData(false);
          this.message.add({
            severity: 'success',
            summary: 'Success',
            detail: this.postType === 'update'
              ? 'Item Price List Updated Successfully.'
              : 'Item Price List Saved Successfully.',
          });
          this.onDrawerHide();
        } else if (resultarray[0] === '2') {
          this.message.add({
            severity: 'warn',
            summary: 'Warn',
            detail: resultarray[1] || datacom,
          });
        } else {
          this.message.add({
            severity: 'warn',
            summary: 'Warn',
            detail: datacom,
          });
        }

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Submit error:', err);
        this.message.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to save item price list data.',
        });
        this.isFormLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  deleteData() {
    const roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId || 0;
    let query = `action=DELETE|id=${this.selectedIndex.id || 0}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${roleID}`;
    this.userService.SubmitPostTypeData(`uspDeleteItemPriceListMaster`, query, 'header').subscribe({
      next: (datacom: any) => {
        this.isFormLoading = false;
        if (!datacom) return;
        const resultarray = datacom.split("-");
        if (resultarray[1] === "success") {
          this.getTableData(true);
          this.message.add({ severity: 'success', summary: 'Success', detail: 'Item Price List deleted successfully' });
          this.onDrawerHide();
        } else {
          this.message.add({ severity: 'warn', summary: 'Warn', detail: datacom, });
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Delete error:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete item price list.' });
        this.isFormLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onDrawerHide() {
    document.body.style.overflow = 'visible';
    this.itemPriceListForm.enable();
    this.visible = false;
    this.onClear();
    this.cdr.detectChanges();
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

  onSortChange(event: { column: string, direction: 'asc' | 'desc' }) {
    this.sortColumn = event.column;
    this.sortDirection = event.direction;
    this.getTableData(true);
  }

  isInvalid(field: string): boolean {
    const control = this.itemPriceListForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onClear() {
    this.itemPriceListForm.reset({
      id: 0
    });
    this.makers = [];
    this.itemJson = [];
    this.cdr.detectChanges();
  }

  addItem() {
    const formData = this.itemPriceListForm.getRawValue();

    if (!formData.itemCodeId || !formData.makerCodeId || !formData.unitId || !formData.itemRate) {
      this.message.add({ severity: 'warn', summary: 'Warn', detail: 'Please fill all item fields.' });
      return;
    }

    const itemObj = this.items.find(x => x.drpValue == formData.itemCodeId);
    const makerObj = this.makers.find(x => x.drpvalue == formData.makerCodeId);
    const unitObj = this.units.find(x => x.drpValue == formData.unitId);

    this.itemJson.push({
      itemCodeId: formData.itemCodeId,
      itemName: itemObj ? itemObj.drpOption : '',
      makerCodeId: formData.makerCodeId,
      makerName: makerObj ? makerObj.drpoption : '',
      unitId: formData.unitId,
      unitName: unitObj ? unitObj.drpOption : '',
      itemRate: formData.itemRate
    });

    // Reset item fields
    this.itemPriceListForm.patchValue({
      itemCodeId: null,
      makerCodeId: null,
      unitId: null,
      itemRate: null
    });

    // Mark as pristine/untouched to avoid validation errors if any validators remained
    this.itemPriceListForm.get('itemCodeId')?.markAsPristine();
    this.itemPriceListForm.get('itemCodeId')?.markAsUntouched();
    this.itemPriceListForm.get('makerCodeId')?.markAsPristine();
    this.itemPriceListForm.get('makerCodeId')?.markAsUntouched();
    this.itemPriceListForm.get('unitId')?.markAsPristine();
    this.itemPriceListForm.get('unitId')?.markAsUntouched();
    this.itemPriceListForm.get('itemRate')?.markAsPristine();
    this.itemPriceListForm.get('itemRate')?.markAsUntouched();

    this.makers = []; // Clear makers as item code is cleared
  }

  deleteItem(index: number) {
    this.itemJson.splice(index, 1);
  }

  ngOnDestroy() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }
}