import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, QueryList, ElementRef } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { Popover } from 'primeng/popover';
import { TableTemplate, TableColumn } from '../../table-template/table-template';
import { UserService } from '../../shared/user-service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Customvalidation } from '../../shared/Validation';
import { HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { RouterLink, RouterModule } from '@angular/router';
import { Title } from 'chart.js';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-customer-service-request',
  standalone: true,
  imports: [
    TableTemplate,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BreadcrumbModule,
    ButtonModule,
    DrawerModule,
    SelectModule,
    InputTextModule,
    DatePickerModule,
    TableModule,
    CheckboxModule,
    Popover,
    RouterModule,
    DialogModule,
  ],
  providers: [DatePipe],
  templateUrl: './customer-service-request.html',
  styleUrl: './customer-service-request.scss',
})
export class CustomerServiceRequest implements OnInit {
  visible = false;
  dialogMode: 'add' | 'edit' | 'view' = 'add';

  header = '';
  headerIcon = '';
  isFormLoading: boolean = false;
  formFields!: QueryList<ElementRef>;

  csrForm!: FormGroup;

  FormName: any;
  FormValue: any;
  menulabel: any;
  paramvaluedata: string = '';

  customerId!: number;
  appUserId: string = '';

  customerAddressDrp: any[] = [];
  contactDetailDrp: any[] = [];
  priorityList: any[] = [];
  serviceTypeList: any[] = [];

  customerProductList: any[] = [];
  selectedProducts: any[] = [];
  selectAllChecked: boolean = false;

  // Table properties
  isLoading = true;
  data: any[] = [];
  totalCount = 0;
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  pageNo: number = 1;
  searchText: string = '';
  pageSize: number = 10;
  allViewTableData: any[] = [];
  paginationCountData: any[] = [];

  selectedMachineData: any[] = [];
  showMachineModal: boolean = false;

  minDate: Date = new Date();
  // Table columns
  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true },
    { key: 'rowNo', header: 'S.No', isVisible: true, isSortable: false },
  ];

  breadcrumbItems = [
    { label: 'Home', routerLink: '/crm-csr-dashboard', title: 'Go to CRM CSR Dashboard' },
    { label: 'Ticket', title: 'not in use' },
    {
      label: 'Customer Service Request',
      routerLink: '/customer-service-request',
      title: 'You are here',
    },
  ];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private message: MessageService,
    private cdr: ChangeDetectorRef,
    private Customvalidation: Customvalidation,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.appUserId = sessionStorage.getItem('userId') || '';

    const menuItem = sessionStorage.getItem('menuItem');
    if (menuItem) {
      const paramjs = JSON.parse(menuItem);
      this.FormName = paramjs.formName;
      this.FormValue = paramjs.formValue;
      this.menulabel = paramjs.menu;
    }

    this.getTableData(true);
    this.createForm();
  }

  createForm(): void {
    this.csrForm = this.fb.group({
      customerAddress: ['', Validators.required],
      contactDetail: ['', Validators.required],
      priority: [null, Validators.required],
      serviceType: [null, Validators.required],
      requiredDate: ['', Validators.required],
    });
  }

  get f() {
    return this.csrForm.controls;
  }

  getCustomerId(): void {
    this.userService
      .getQuestionPaper(
        `uspGetServiceRequestDropdownData|action=CUSTOMERID|appUserId=${this.appUserId}`
      )
      .subscribe(
        (res: any) => {
          setTimeout(() => {
            this.customerId = res?.table?.[0]?.id ?? null;
            if (this.customerId) {
              this.getInitialDropdowns();
            }
            this.cdr.detectChanges();
          }, 0);
        },
        (err: HttpErrorResponse) => {
          if (err.status === 403) {
            this.Customvalidation.loginroute(err.status);
          }
        }
      );
  }

  getInitialDropdowns(): void {
    this.userService
      .getQuestionPaper(
        `uspGetServiceRequestDropdownData|action=CUSTOMERDETAILS|appUserId=${this.appUserId}|customerId=${this.customerId}`
      )
      .subscribe(
        (res: any) => {
          setTimeout(() => {
            this.customerAddressDrp = res?.table ?? [];
            this.contactDetailDrp = res?.table1 ?? [];
            this.priorityList = res?.table2 ?? [];
            this.serviceTypeList = res?.table3 ?? [];
            this.cdr.detectChanges();
          }, 0);
        },
        (err: HttpErrorResponse) => {
          if (err.status === 403) {
            this.Customvalidation.loginroute(err.status);
          }
        }
      );
  }

  handleCustomerAddressChange(): void {
    this.csrForm.get('customerAddress')?.valueChanges.subscribe((addressId) => {
      if (!addressId || !this.customerId) return;
      this.loadDetailsForAddress(addressId);
    });
  }

  private loadDetailsForAddress(addressId: any, preselectedContactId?: any, viewData?: any): void {
    if (!addressId || !this.customerId) return;

    const baseQuery = `uspGetServiceRequestDropdownData|appUserId=${this.appUserId}|customerId=${this.customerId}|customerAddressId=${addressId}`;

    this.userService.getQuestionPaper(`${baseQuery}|action=CUSTOMERDETAILS`).subscribe(
      (res: any) => {
        setTimeout(() => {
          this.contactDetailDrp = res?.table1 ?? [];
          if (preselectedContactId && this.dialogMode === 'view') {
            const contactId =
              this.findIdFromDropdown(this.contactDetailDrp, preselectedContactId) ||
              preselectedContactId;
            this.csrForm.patchValue({ contactDetail: contactId });
          }
          this.cdr.detectChanges();
        }, 0);
      },
      (err: HttpErrorResponse) => {
        if (err.status === 403) this.Customvalidation.loginroute(err.status);
      }
    );

    this.userService.getQuestionPaper(`${baseQuery}|action=CUSTOMERPRODUCT`).subscribe(
      (res: any) => {
        setTimeout(() => {
          this.customerProductList = res?.table ?? [];
          if (this.dialogMode !== 'view') {
            this.selectedProducts = [];
            this.selectAllChecked = false;
            this.customerProductList.forEach((p: any) => (p.selected = false));
          } else if (
            viewData &&
            (viewData.assetJson || viewData.assetDetails || viewData.selectedProducts)
          ) {
            setTimeout(() => this.loadSelectedProducts(viewData), 200);
          }
          this.cdr.detectChanges();
        }, 0);
      },
      (err: HttpErrorResponse) => {
        if (err.status === 403) this.Customvalidation.loginroute(err.status);
      }
    );
  }

  showDialog(mode: 'add' | 'edit' | 'view', data?: any): void {
    this.getCustomerId();
    this.handleCustomerAddressChange();
    this.dialogMode = mode;

    const modeConfig = {
      add: { header: 'Add Service Request', icon: 'pi pi-plus', enable: true },
      view: { header: 'View Service Request', icon: 'pi pi-eye', enable: false },
      edit: { header: 'Edit Service Request', icon: 'pi pi-pencil', enable: true },
    };

    const config = modeConfig[mode];
    this.header = config.header;
    this.headerIcon = config.icon;
    mode === 'add' ? this.csrForm.reset() : this.csrForm[mode === 'view' ? 'disable' : 'enable']();

    if (mode === 'add') {
      this.selectedProducts = [];
      this.customerProductList = [];
      this.selectAllChecked = false;
    } else if (data) {
      this.loadViewData(data);
    }

    setTimeout(() => {
      this.visible = true;
      this.cdr.detectChanges();
    }, 0);
  }

  private findIdFromDropdown(
    dropdown: any[],
    searchValue: any,
    searchKey: string = 'drpOption'
  ): any {
    if (!searchValue || !dropdown?.length) return null;
    const value = String(searchValue).toLowerCase().trim();
    return (
      dropdown.find(
        (item) =>
          String(item[searchKey] || item.drpOption || '')
            .toLowerCase()
            .trim() === value
      )?.drpValue || null
    );
  }

  loadViewData(data: any) {
    const getValue = (...keys: string[]) => {
      const foundKey = keys.find((k) => data[k] !== undefined && data[k] !== null);
      return foundKey ? data[foundKey] : '';
    };

    const addressValue = getValue(
      'address',
      'companyAddressId',
      'customerAddressId',
      'customerAddress',
      'companyAddress',
      'addressId'
    );
    const contactValue = getValue('contact', 'contactId', 'contactDetail');
    const priorityValue = getValue('priority', 'priorityId', 'priorityName');
    const serviceTypeValue = getValue(
      'requestType',
      'serviceRequestId',
      'serviceType',
      'serviceRequestType',
      'serviceTypeId'
    );
    const requiredDate = getValue(
      'requiredDate',
      'required_date',
      'requiredDateText',
      'requiredDateValue'
    );

    setTimeout(() => {
      const addressId =
        this.findIdFromDropdown(this.customerAddressDrp, addressValue) || addressValue;
      const contactId =
        this.findIdFromDropdown(this.contactDetailDrp, contactValue) || contactValue;
      const priorityId = this.findIdFromDropdown(this.priorityList, priorityValue) || priorityValue;
      const serviceTypeId =
        this.findIdFromDropdown(this.serviceTypeList, serviceTypeValue) || serviceTypeValue;

      this.csrForm.patchValue({
        customerAddress: addressId,
        contactDetail: contactId,
        priority: priorityId,
        serviceType: serviceTypeId,
        requiredDate: requiredDate,
      });

      if (addressId) {
        this.loadDetailsForAddress(addressId, contactId, data);
      } else {
        this.cdr.detectChanges();
      }
    }, 200);
  }

  loadSelectedProducts(data: any) {
    try {
      const getProductsData = () => {
        const source = data.assetJson || data.assetDetails || data.selectedProducts;
        if (!source) return [];
        return typeof source === 'string' ? JSON.parse(source) : source;
      };

      const productsData = getProductsData();
      if (!Array.isArray(productsData) || productsData.length === 0) return;

      this.customerProductList.forEach((product: any) => {
        const found = productsData.find((p: any) =>
          [p.assetId, p.id, p.machineId].includes(product.id)
        );
        if (found) {
          product.selected = true;
          if (!this.selectedProducts.find((sp: any) => sp.id === product.id)) {
            this.selectedProducts.push(product);
          }
        }
      });
      this.updateSelectAllState();
    } catch (error) {}
  }

  onDrawerHide(): void {
    this.visible = false;
    setTimeout(() => {
      this.csrForm.enable();
      this.clearData();
      this.cdr.detectChanges();
    }, 0);
  }

  onProductSelect(product: any) {
    setTimeout(() => {
      if (product.selected) {
        if (!this.selectedProducts.find((p) => p.id === product.id)) {
          this.selectedProducts.push(product);
        }
      } else {
        this.selectedProducts = this.selectedProducts.filter((p) => p.id !== product.id);
      }
      this.updateSelectAllState();
      this.cdr.detectChanges();
    }, 0);
  }

  toggleSelectAll(checkedValue?: boolean) {
    // Use the value passed from ngModelChange (which is the new checked state)
    const shouldSelectAll = checkedValue !== undefined ? checkedValue : this.selectAllChecked;

    setTimeout(() => {
      if (shouldSelectAll) {
        // Select all products
        this.customerProductList.forEach((product: any) => {
          product.selected = true;
          if (!this.selectedProducts.find((p) => p.id === product.id)) {
            this.selectedProducts.push(product);
          }
        });
      } else {
        // Unselect all products
        this.customerProductList.forEach((product: any) => {
          product.selected = false;
        });
        this.selectedProducts = [];
      }

      this.cdr.detectChanges();
    }, 0);
  }

  updateSelectAllState() {
    if (this.customerProductList.length === 0) {
      this.selectAllChecked = false;
      return;
    }
    const allSelected = this.customerProductList.every((product: any) => product.selected);
    this.selectAllChecked = allSelected;
  }

  OnSubmitModal() {
    if (this.csrForm.invalid) {
      this.csrForm.markAllAsTouched();
      this.scrollToFirstInvalidControl();
      return;
    }

    const selectedItems = this.customerProductList.filter((item: any) => item.selected);
    if (selectedItems.length === 0) {
      this.openAlertDialog('Alert!', 'Please select at least one product.');
      setTimeout(() => {
        const productTable = document.querySelector('[data-product-table]');
        if (productTable) {
          productTable.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
      return;
    }

    const form = this.csrForm.value;
    const normalizeDate = (val: any): string => {
      if (!val) return '';
      if (typeof val === 'string') return val;
      return this.datePipe.transform(val, 'yyyy-MM-dd') || '';
    };

    const machineIds = selectedItems.map((item: any) => ({
      assetId: item.id,
      assetSerialNo: item['serial Number'] || item.serialNumber || '',
      chassis: item['chassis Number'] || item.chassisNumber || '',
    }));

    this.paramvaluedata = `customerId=${this.customerId}|priorityId=${
      form.priority || 0
    }|companyAddressId=${form.customerAddress || 0}|contactId=${
      form.contactDetail || 0
    }|serviceRequestId=${form.serviceType || 0}|requiredDate=${normalizeDate(
      form.requiredDate
    )}|assetJson=${JSON.stringify(machineIds)}`;

    this.openConfirmDialog('Confirm?', 'Do you want to submit?', '1', '1');
  }

  openConfirmDialog(title: any, msg: any, id: any, option?: any) {
    this.confirmationService.confirm({
      message: msg,
      header: title,
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: { label: 'No', severity: 'secondary', outlined: true },
      acceptButtonProps: { label: 'Yes', severity: 'info' },
      accept: () => {
        if (option == '1') this.submitcall();
      },
    });
  }

  submitcall() {
    this.isFormLoading = true;

    let query = `${this.paramvaluedata}|appUserId=${this.appUserId}`;
    let SP = `uspPostCustomerServiceRequest`;

    this.userService.SubmitPostTypeData(SP, query, this.FormName).subscribe(
      (datacom: any) => {
        setTimeout(() => {
          this.isFormLoading = false;
          if (datacom != '') {
            const resultarray = datacom.split('-');
            if (resultarray[1] == 'success') {
              setTimeout(() => {
                this.message.add({
                  severity: 'success',
                  summary: 'Success',
                  detail: 'Data Saved Successfully.',
                  life: 3000,
                });
                this.clearData();
                this.visible = false; // Close the drawer
                this.getTableData(true);
                this.cdr.detectChanges();
              }, 500);
            } else if (resultarray[0] == '2') {
              setTimeout(() => {
                this.message.add({
                  severity: 'warn',
                  summary: 'Alert',
                  detail: resultarray[1],
                  life: 3000,
                });
                this.cdr.detectChanges();
              }, 1000);
            } else if (datacom == 'Error occured while processing data!--error') {
              setTimeout(() => {
                this.message.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: 'Something went wrong!',
                  life: 3000,
                });
                this.cdr.detectChanges();
              }, 1000);
            } else {
              this.message.add({
                severity: 'error',
                summary: 'Alert',
                detail: datacom,
                life: 3000,
              });
              this.cdr.detectChanges();
            }
          }
        }, 0);
      },
      (err: HttpErrorResponse) => {
        setTimeout(() => {
          this.isFormLoading = false;
          if (err.status == 401) {
            this.message.add({
              severity: 'error',
              summary: 'Error',
              detail: 'You are not authorized!',
              life: 3000,
            });
          } else if (err.status == 403) {
            this.Customvalidation.loginroute(err.status);
          } else {
            this.message.add({
              severity: 'error',
              summary: 'Error',
              detail: err.error?.message?.toString() || 'An error occurred',
              life: 3000,
            });
          }
          this.cdr.detectChanges();
        }, 0);
      }
    );
  }

  openAlertDialog(title: any, msg: any) {
    const element = document.getElementById('navbar');
    if (element) {
      element.scrollIntoView();
    }

    this.confirmationService.confirm({
      message: msg,
      header: title,
      icon: 'pi pi-exclamation-triangle',
      acceptVisible: true,
      rejectVisible: false,
      accept: () => {},
    });
  }

  scrollToFirstInvalidControl() {
    setTimeout(() => {
      const formControls = [
        'customerAddress',
        'contactDetail',
        'priority',
        'serviceType',
        'requiredDate',
      ];

      for (const controlName of formControls) {
        const control = this.csrForm.get(controlName);
        if (control && control.invalid) {
          const fieldElement = document.getElementById(`field-${controlName}`);
          if (fieldElement) {
            fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => {
              const formControlElement = fieldElement.querySelector(
                `[formControlName="${controlName}"]`
              );
              if (formControlElement) {
                const inputElement =
                  formControlElement.querySelector('input') ||
                  formControlElement.querySelector('.p-inputtext') ||
                  formControlElement.querySelector('.p-select') ||
                  formControlElement;
                if (inputElement && typeof (inputElement as any).focus === 'function') {
                  (inputElement as any).focus();
                } else if (formControlElement instanceof HTMLElement) {
                  formControlElement.focus();
                }
              }
            }, 300);
            break;
          }
        }
      }
    }, 100);
  }

  clearData() {
    this.csrForm.reset();
    this.selectedProducts = [];
    this.customerProductList = [];
    this.selectAllChecked = false;
    this.paramvaluedata = '';
  }

  onReset() {
    this.csrForm.reset();
    this.selectedProducts = [];
    this.customerProductList = [];
    this.selectAllChecked = false;
    this.cdr.detectChanges();
  }

  isInvalid(field: string): boolean {
    const control = this.csrForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  transformDate(event: any, controlName: string) {
    if (!event || !event.value) return;
    const formatted = this.datePipe.transform(event.value, 'yyyy-MM-dd');
    this.csrForm.patchValue({
      [controlName]: formatted,
    });
  }

  // Table Methods
  getTableData(isTrue: boolean) {
    try {
      if (isTrue) this.isLoading = true;
      else this.pageNo = 1;

      const query = `uspGetCustomerServiceRequestData|appUserId=${this.appUserId}|searchText=${this.searchText}|pageIndex=${this.pageNo}|size=${this.pageSize}`;

      this.userService.getQuestionPaper(query).subscribe(
        (res: any) => {
          this.allViewTableData = res?.table1 || [];
          this.paginationCountData = res?.table || [];

          // Map data for table template
          this.data = this.allViewTableData.map((item: any, index: number) => ({
            ...item,
            rowNo: (this.pageNo - 1) * this.pageSize + index + 1,
          }));
          this.totalCount = this.paginationCountData?.[0]?.totalCnt || 0;

          // Initialize columns on first load
          if (this.columns.length === 2 && this.allViewTableData.length > 0) {
            this.initializeColumns(this.allViewTableData[0]);
          }

          setTimeout(() => {
            this.isLoading = false;
            this.cdr.detectChanges();
          }, 1000);
        },
        (err: HttpErrorResponse) => {
          this.isLoading = false;
          if (err.status === 403) {
            this.Customvalidation.loginroute(err.status);
          } else {
            this.message.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to load data.',
              life: 3000,
            });
          }
          this.cdr.detectChanges();
        }
      );
    } catch (error) {
      this.isLoading = false;
    }
  }

  initializeColumns(firstRow: any) {
    const dynamicColumns: TableColumn[] = [];
    const excludeKeys = ['id', 'rowNo', 'actions', 'assetDetails'];

    Object.keys(firstRow).forEach((key) => {
      if (!excludeKeys.includes(key)) {
        dynamicColumns.push({
          key: key,
          header: this.formatKey(key),
          isVisible: dynamicColumns.length < 20, // Show first 5 columns by default
          isSortable: true,
        });
      }
    });

    this.columns = [
      { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true },
      { key: 'rowNo', header: 'S.No', isVisible: true, isSortable: false },
      // Naya Rating Column

      ...dynamicColumns,
    ];
  }

  formatKey(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
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

  viewMachineDetails(row: any) {
    let data = JSON.parse(row.assetDetails);

    if (data && Array.isArray(data) && data.length > 0) {
      this.selectedMachineData = data;
      this.showMachineModal = true;
    }
  }

  closeMachineModal() {
    this.showMachineModal = false;
  }

  getModalKeys(obj: any): string[] {
    if (!obj) return [];
    return Object.keys(obj);
  }

  getKeys(obj: any): string[] {
    if (!obj) return [];
    return Object.keys(obj).filter((key) => key !== 'id' && key !== 'selected');
  }
}
