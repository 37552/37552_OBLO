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
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-pricelist-master',
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
    Drawer
  ],
  providers: [
    ConfirmationService,
    MessageService,
    DatePipe
  ],
  templateUrl: './pricelist-master.html',
  styleUrl: './pricelist-master.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PricelistMaster {
  isLoading = true;
  visible: boolean = false;
  postType: string = '';
  header: any = '';
  selectedIndex: any = [];
  headerIcon: string = 'pi pi-plus';
  paramvaluedata: string = '';
  isFormLoading: boolean = false;
  data: any[] = [];
  priceListForm: FormGroup;
  
  // Dropdown arrays
  currencies: any[] = [];
  buySellTypes: any[] = [];
  countries: any[] = [];
  location: any[] = [];
  
  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true },
    { key: 'priceListName', header: 'Price List Name', isVisible: true },
    { key: 'currency', header: 'Currency', isVisible: true },
    { key: 'buySellType', header: 'Buy/Sell Type', isVisible: true },
    { key: 'validFrom', header: 'Valid From', isVisible: true },
    { key: 'validTill', header: 'Valid Till', isVisible: true },
    { key: 'country', header: 'Country', isVisible: true },
    { key: 'Location', header: 'Location', isVisible: true },
    { key: 'isActive', header: 'Status', isVisible: false }
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
    private cdr: ChangeDetectorRef,
    private datePipe: DatePipe 
  ) {
    this.priceListForm = this.fb.group({
      id: [0],
      priceListName: ['', Validators.required],
      currencyId: [null, Validators.required],
      buySellTypeId: [null, Validators.required],
      validFrom: ['', Validators.required],
      validTill: ['', Validators.required],
      countryId: [null, Validators.required],
      districtId: [ null,Validators.required ]
    });
  }

  get f() { return this.priceListForm.controls }

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
      { key: 'currencies', table: 'tblCurrencyMaster' },
      { key: 'buySellTypes', table: 'tblBuyingSellingTypeMaster' },
      { key: 'countries', table: 'tblCountryMaster' },
      { key: 'location', table: 'tbldistrictMaster' }
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
    
    this.userService.getQuestionPaper(`uspGetPriceListMaster|${query}`).subscribe({
      next: (res: any) => {
        try {
          this.data = res?.table1 || [];
          
          this.data = this.data.map(item => ({
            ...item,
            id: item.transId || item.id,
            priceListName: item.priceList || '',
            currency: item.currency || '',
            currencyId: item.currencyId,
            buySellType: item.buySell || '',
            buySellTypeId: item.buySellTypeId,
            validFromDate: item.validFrom ? new Date(item.validFrom) : null,
            validTillDate: item.validTill ? new Date(item.validTill) : null,
            validFrom: item.validFrom ? this.datePipe.transform(new Date(item.validFrom), 'dd-MM-yyyy') : '',
            validTill: item.validTill ? this.datePipe.transform(new Date(item.validTill), 'dd-MM-yyyy') : '',
            country: item.country || '',
            countryId: item.countryId,
            isActive: item.isActive,
            districtId: item.districtId,
            Location:item.district

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
            detail: 'Failed to process price list data.' 
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
          detail: 'Failed to load price lists.' 
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
      this.header = 'Add Price List';
      this.headerIcon = 'pi pi-plus';
      this.priceListForm.reset({ id: 0 });
      this.isFormLoading = false;
      this.cdr.detectChanges();
    } else {
      this.visible = true;
      this.postType = view;
      this.header = view === 'update' ? 'Update Price List' : 'View Price List';
      this.headerIcon = view === 'update' ? 'pi pi-pencil' : 'pi pi-eye';
      this.selectedIndex = data;

      if (view === 'view') {
        this.priceListForm.disable();
      } else {
        this.priceListForm.enable();
      }

      const patchData = {
        id: data.transId || data.id || 0,
        priceListName: data.priceList || '',
        currencyId: data.currencyId || null,
        buySellTypeId: data.buySellTypeId || null,
         validFrom: data.validFromDate || '',
         validTill: data.validTillDate || '',
        countryId: data.countryId || null,
        districtId: data.districtId || null
      };

      this.priceListForm.patchValue(patchData);
      this.isFormLoading = false;
      this.cdr.detectChanges();
    }
    document.body.style.overflow = 'hidden';
  }

  onSubmit(event: any) {
    if (!this.priceListForm.valid) {
      this.priceListForm.markAllAsTouched();
      this.scrollToFirstInvalidControl();
      this.cdr.detectChanges();
      return;
    }
    
    const formData = this.priceListForm.getRawValue();
    const validFrom = formData.validFrom ? this.formatDate(formData.validFrom) : '';
    const validTill = formData.validTill ? this.formatDate(formData.validTill) : '';

    const districtId = sessionStorage.getItem('District') || '';
    const userId = sessionStorage.getItem('userId') || '';
    const roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId || 0;

    this.paramvaluedata = `id=${formData.id}|priceListName=${formData.priceListName}|currencyId=${formData.currencyId}|buySellTypeId=${formData.buySellTypeId}|validFrom=${validFrom}|validTill=${validTill}|countryId=${formData.countryId}|districtId=${districtId}|appUserId=${userId}|appUserRole=${roleID}`;
    
    this.openConfirmation('Confirm?', "Are you sure you want to proceed?", '1', '1', event);
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
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
    const controls = this.priceListForm.controls;
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

    const SP = 'uspPostPriceListMaster';

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
              ? 'Price List Updated Successfully.'
              : 'Price List Saved Successfully.',
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
          detail: 'Failed to save price list data.',
        });
        this.isFormLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  deleteData() {
    const roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId || 0;
    let query = `action=DELETE|id=${this.selectedIndex.id || 0}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${roleID}`;
    this.userService.SubmitPostTypeData(`uspDeletePriceListMaster`, query, 'header').subscribe({
      next: (datacom: any) => {
        this.isFormLoading = false;
        if (!datacom) return;
        const resultarray = datacom.split("-");
        if (resultarray[1] === "success") {
          this.getTableData(true);
          this.message.add({ severity: 'success', summary: 'Success', detail: 'Price List deleted successfully' });
          this.onDrawerHide();
        } else {
          this.message.add({ severity: 'warn', summary: 'Warn', detail: datacom, });
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Delete error:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete price list.' });
        this.isFormLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onDrawerHide() {
    document.body.style.overflow = 'visible';
    this.priceListForm.enable();
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
    const control = this.priceListForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onClear() {
    this.priceListForm.reset({
      id: 0
    });
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }
}