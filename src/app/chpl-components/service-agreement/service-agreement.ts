import { Component, ChangeDetectorRef, signal, ViewChild } from '@angular/core';
import { TableTemplate, TableColumn } from '../../table-template/table-template';
import { ButtonModule } from 'primeng/button';
import { Popover } from 'primeng/popover';
import { Tooltip } from 'primeng/tooltip';
import { ConfirmDialog } from 'primeng/confirmdialog';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { CardModule } from 'primeng/card';
import { DrawerModule } from 'primeng/drawer';
import { UserService } from '../../shared/user-service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { Customvalidation } from '../../shared/Validation';
import { HttpErrorResponse } from '@angular/common/http';
import { FileUploadModule } from 'primeng/fileupload';
import { ConfigService } from '../../shared/config.service';
import { FileUploadService } from '../../shared/file-upload.service';
import { OnlyNumberDirective } from '../../shared/directive/only-number.directive';
import { OnlyDecimalDirective } from '../../shared/directive/number-decimal.directive';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-service-agreement',
  imports: [
    TableTemplate,
    FileUploadModule,
    CardModule,
    ButtonModule,
    DrawerModule,
    Popover,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    SelectModule,
    DatePickerModule,
    ConfirmDialog,
    BreadcrumbModule,
    CheckboxModule,
    Toast,
    Tooltip,
    OnlyNumberDirective,
    OnlyDecimalDirective,
  ],
  providers: [ConfirmationService, MessageService, DatePipe],
  templateUrl: './service-agreement.html',
  styleUrl: './service-agreement.scss',
})
export class ServiceAgreement {
  isLoading = true;
  visible: boolean = false;
  postType: string = '';
  header: any = '';
  selectedIndex: any = [];
  headerIcon: string = 'pi pi-plus';
  paramvaluedata: string = '';
  isFormLoading: boolean = false;
  data: any[] = [];
  customerSiteInfoForm: FormGroup;
  otherInfoForm: FormGroup;

  district: string = '10001';
  customerDrp: any[] = [];
  salesOrderDrp: any[] = [];
  customerAddressDrp: any[] = [];
  selectedOrderId: number = 0;
  countryId: any;
  stateId: any;
  cityId: any;
  pincode: any;
  productData: any[] = [];
  schedulesId: any;

  allColumns: TableColumn[] = [];
  availableColumns: TableColumn[] = [];
  importantColumns: TableColumn[] = [];
  requiredColumnKeys: Set<string> = new Set();
  selectAllChecked: boolean = false;

  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true },
    { key: 'rowNo', header: 'S.No', isVisible: true, isSortable: false },
  ];

  breadcrumbItems = [
    { label: 'Home', routerLink: '/crm-admin-dashboard' },
    { label: 'Operations', routerLink: '' },
    { label: 'Service Agreement', routerLink: '/service-agreement' },
  ];

  pageNo = 1;
  pageSize = 10;
  searchText = '';
  totalCount = 0;
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  allViewTableData: any[] = [];
  paginationCountData: any[] = [];

  pageNoData: number[] = [];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private message: MessageService,
    private cdr: ChangeDetectorRef,
    private Customvalidation: Customvalidation,
    private configService: ConfigService,
    private fileUploadService: FileUploadService,
    private datePipe: DatePipe
  ) {
    this.customerSiteInfoForm = this.fb.group({
      customerName: ['', [Validators.required]],
      salesOrder: ['', [Validators.required]],
      salesOrderDate: [{ value: '', disabled: true }, [Validators.required]],
      streetAddress: ['', [Validators.required]],
      country: [''],
      state: [''],
      city: [''],
      pincode: [''],
      emailId: [{ value: '', disabled: true }, [Validators.email]],
    });

    this.otherInfoForm = this.fb.group({
      invoiceNumber: [''],
      invoiceDate: [''],
      deliveryChallanNumber: [''],
      deliveryDate: [''],
      warrantyStartDate: [''],
      warrantyEndDate: [''],
      gpsCoordinates: [''],
      deviceDetails: [''],
      noOfFreeServices: [0],
      schedules: [''],
      notes: [''],
    });
  }

  get f() {
    return this.customerSiteInfoForm.controls;
  }
  get f2() {
    return this.otherInfoForm.controls;
  }

  ngOnInit(): void {
    this.getCustomer();
    this.getScheduleData();
    this.fetchViewData(true);
  }
  getCustomer() {
    this.userService
      .geChplData(
        `uspGetServiceAgreementDrpData|action=CUSTOMER|customerAddId=0|assetId=0|customerId=0|orderId=0`
      )
      .subscribe((res: any) => {
        this.customerDrp = res['table'] || [];
      });
  }

  customerAddressdrp: any;
  getCustomerAddress() {
    const selectedCustomer = this.customerSiteInfoForm.get('customerName')?.value;
    const customerId = selectedCustomer?.drpValue || 0;

    // Dynamically set User ID / Email based on selected customer
    if (customerId) {
      const customerFromList = this.customerDrp.find((c: any) => c.drpValue === customerId);

      this.customerSiteInfoForm.patchValue({
        emailId: customerFromList?.emailId || '',
      });
    } else {
      this.customerSiteInfoForm.patchValue({
        emailId: '',
      });
    }

    this.userService
      .geChplData(
        `uspGetServiceAgreementDrpData|action=ORDERDATA|customerId=${customerId}|customerAddId=0|assetId=0|orderId=0`
      )
      .subscribe((res: any) => {
        this.salesOrderDrp = res?.table || [];
        this.customerAddressDrp = this.salesOrderDrp.map((item: any) => ({
          drpValue: item.customerAddressId,
          drpOption: item.drpOption,
        }));
      });
  }
  getProductDetail() {
    const orderId = this.selectedOrderId || 0;
    if (!orderId) return;

    this.userService
      .getQuestionPaper(
        `uspGetServiceAgreementDrpData|action=PRODUCT|orderId=${orderId}|customerId=0|assetId=0|customerAddId=0`
      )
      .subscribe((res: any) => {
        if (res?.table && res.table.length > 0) {
          this.productData = res.table;
        } else {
          this.productData = [];
        }
      });
  }
  scheduleDrp: any[] = [];
  getScheduleData() {
    this.userService.geChplData(`uspGetServiceAgreementDrpData|action=SERVICESCHEDULE`).subscribe(
      (res: any) => {
        const table = res['table'] || [];
        this.scheduleDrp = table;
      },
      (err: HttpErrorResponse) => {
        if (err.status === 403) {
          this.Customvalidation.loginroute(err.status);
        }
      }
    );
  }

  getCustomerLocation() {
    const customerId = this.customerSiteInfoForm.get('customerName')?.value?.drpValue || 0;
    const customerAddId = this.customerSiteInfoForm.get('streetAddress')?.value?.drpValue || 0;
    const orderId = this.selectedOrderId || 0;

    if (!customerId || !customerAddId || !orderId) {
      this.resetLocationData();
      return;
    }

    this.userService
      .geChplData(
        `uspGetServiceAgreementDrpData|action=CUSTOMERLOCATION|customerAddId=${customerAddId}|customerId=${customerId}|assetId=0|orderId=${orderId}`
      )
      .subscribe((res: any) => {
        if (res?.table?.length > 0) {
          const loc = res.table[0];

          this.customerSiteInfoForm.patchValue({
            country: loc.country,
            state: loc.state,
            city: loc.district,
            pincode: loc.pincode,
          });

          this.countryId = loc.countryId;
          this.stateId = loc.stateId;
          this.cityId = loc.districtId;
          this.pincode = loc.pincode;
        } else {
          this.resetLocationData();
        }
      });
  }

  resetLocationData() {
    this.customerSiteInfoForm.patchValue({
      country: '',
      state: '',
      city: '',
    });

    this.countryId = 0;
    this.stateId = 0;
    this.cityId = 0;
    this.pincode = 0;
  }

  fetchViewData(isTrue: boolean) {
    try {
      if (isTrue) this.isLoading = true;
      else this.pageNo = 1;

      this.userService
        .getQuestionPaper(
          `uspGetCustomerServiceAgreement|size=${this.pageSize}|pageIndex=${Number(
            this.pageNo
          )}|searchText=${this.searchText}|appUserId=${sessionStorage.getItem('userId')}`
        )
        .subscribe((res: any) => {
          this.allViewTableData = res['table1'] || [];
          this.paginationCountData = res['table'] || [];
          this.pageNoData = res['table2'] || [];

          const arrayObject = this.allViewTableData;
          arrayObject.forEach((item: any) => {
            if (item.addressList) {
              try {
                item.addressList = JSON.parse(item.addressList);
              } catch (e) {
                item.addressList = [];
              }
            } else {
              item.addressList = [];
            }
          });

          this.allViewTableData = arrayObject;
          this.totalCount = this.paginationCountData.length > 0 ? this.paginationCountData[0]['totalCnt'] : 0;

          this.data = this.allViewTableData.map((item: any, index: number) => ({
            ...item,
            rowNo: (this.pageNo - 1) * this.pageSize + index + 1,
          }));

          if (this.allColumns.length === 0 && this.allViewTableData.length > 0) {
            this.initializeColumns();
          }

          setTimeout(() => {
            this.isLoading = false;
            this.cdr.markForCheck();
          }, 1000);
        });
    } catch (error) {
      this.isLoading = false;
      console.error(error);
    }
  }

  getTableData(isTrue: boolean) {
    this.fetchViewData(isTrue);
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

  refreshData(): void {
    this.pageNo = 1;
    this.searchText = '';
    this.fetchViewData(true);
  }

  formatKey(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }

  initializeColumns(): void {
    const staticColumns: TableColumn[] = [
      { key: 'customer Name', header: 'Customer Name', isVisible: false, isSortable: false },
      { key: 'salesOrder', header: 'Sales Order', isVisible: false, isSortable: false },
      { key: 'saleOrderDate', header: 'Sales Order Date', isVisible: false, isSortable: false },
      { key: 'address', header: 'Address', isVisible: false, isSortable: false },
      { key: 'country', header: 'Country', isVisible: false, isSortable: false },
      { key: 'state', header: 'State', isVisible: false, isSortable: false },
      { key: 'city', header: 'City', isVisible: false, isSortable: false },
      { key: 'invoiceDate', header: 'Invoice Date', isVisible: false, isSortable: false },
      { key: 'invoiceNumber', header: 'Invoice Number', isVisible: false, isSortable: false },
      {
        key: 'deliveryChallanNo',
        header: 'Delivery Challan No',
        isVisible: false,
        isSortable: false,
      },
      { key: 'deliveryDate', header: 'Delivery Date', isVisible: false, isSortable: false },
      { key: 'warrantyStartDate', header: 'Warranty Start', isVisible: false, isSortable: false },
      { key: 'warrantyEndDate', header: 'Warranty End', isVisible: false, isSortable: false },
      { key: 'gpsCoordinates', header: 'GPS Coordinates', isVisible: false, isSortable: false },
      { key: 'deviceDetails', header: 'Device Details', isVisible: false, isSortable: false },
      { key: 'freeServices', header: 'Free Services', isVisible: false, isSortable: false },
      { key: 'schedule', header: 'Schedule', isVisible: false, isSortable: false },
      { key: 'notes', header: 'Notes', isVisible: false, isSortable: false },
    ];

    this.requiredColumnKeys.add('actions');
    this.requiredColumnKeys.add('rowNo');

    const importantCount = 5;
    this.importantColumns = [];
    staticColumns.forEach((col, index) => {
      if (index < importantCount) {
        col.isVisible = true;
        this.requiredColumnKeys.add(col.key);
        this.importantColumns.push(col);
      }
    });

    this.allColumns = [
      { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true },
      { key: 'rowNo', header: 'S.No', isVisible: true, isSortable: false },
      ...staticColumns,
    ];

    this.availableColumns = staticColumns.filter((col) => !this.requiredColumnKeys.has(col.key));

    this.updateVisibleColumns();
  }

  updateVisibleColumns(): void {
    this.columns = this.allColumns.filter((col) => col.isVisible);
    this.updateSelectAllState();
  }

  toggleColumnVisibility(column: TableColumn): void {
    if (this.requiredColumnKeys.has(column.key)) {
      return;
    }
    column.isVisible = !column.isVisible;
    this.updateVisibleColumns();
  }

  getSelectedColumnsCount(): number {
    return (
      this.importantColumns.length + this.availableColumns.filter((col) => col.isVisible).length
    );
  }

  toggleSelectAll(): void {
    if (this.selectAllChecked) {
      this.availableColumns.forEach((col) => {
        if (!this.requiredColumnKeys.has(col.key)) {
          col.isVisible = true;
        }
      });
    } else {
      this.availableColumns.forEach((col) => {
        if (!this.requiredColumnKeys.has(col.key)) {
          col.isVisible = false;
        }
      });
    }
    this.updateVisibleColumns();
  }

  updateSelectAllState(): void {
    if (this.availableColumns.length === 0) {
      this.selectAllChecked = false;
      return;
    }
    const selectableColumns = this.availableColumns.filter(
      (col) => !this.requiredColumnKeys.has(col.key)
    );
    this.selectAllChecked =
      selectableColumns.length > 0 && selectableColumns.every((col) => col.isVisible);
  }

  getSelectedAvailableColumns(): TableColumn[] {
    return this.availableColumns.filter((col) => col.isVisible);
  }

  getUnselectedAvailableColumns(): TableColumn[] {
    return this.availableColumns.filter((col) => {
      return !col.isVisible && !this.requiredColumnKeys.has(col.key);
    });
  }

  deleteItem(item: any, event: any) {
    this.selectedIndex = item;
    this.confirmationService.confirm({
      target: event.target,
      message: 'Are you sure you want to delete this service agreement?',
      header: 'Confirm Deletion',
      icon: 'pi pi-trash',
      accept: () => {
        this.message.add({
          severity: 'info',
          summary: 'Info',
          detail: 'Delete functionality to be implemented.',
        });
      },
    });
  }

  showDialog(view: string, data: any = null) {
    this.visible = true;
    this.customerSiteInfoForm.reset();
    this.otherInfoForm.reset();
    this.customerSiteInfoForm.enable();
    this.otherInfoForm.enable();

    this.postType = view;
    this.selectedIndex = data;

    if (view === 'add') {
      this.header = 'Add Service Agreement';
      this.headerIcon = 'pi pi-plus';
      this.customerAddressDrp = [];
      this.productData = [];
      this.selectedOrderId = 0;
      this.resetLocationData();
    } else {
      this.header = view === 'update' ? 'Update Service Agreement' : 'View Service Agreement';
      this.headerIcon = view === 'update' ? 'pi pi-pencil' : 'pi pi-eye';
      this.loadDataForEdit(data, view);
    }

    this.customerSiteInfoForm.get('salesOrderDate')?.disable();
    this.customerSiteInfoForm.get('emailId')?.disable();
  }

  loadDataForEdit(data: any, type: string) {
    const row = data._raw || data;

    const customerId = this.getCustomerIdFromRow(row);
    if (customerId) {
      this.userService
        .geChplData(
          `uspGetServiceAgreementDrpData|action=ORDERDATA|customerId=${customerId}|customerAddId=0|orderId=0`
        )
        .subscribe((res: any) => {
          this.salesOrderDrp = res?.table || [];
          this.customerAddressDrp = this.salesOrderDrp.map((item: any) => ({
            drpValue: item.customerAddressId,
            drpOption: item.drpOption,
          }));

          const customerOption = this.customerDrp.find(
            (c: any) => c.drpOption === row['customer Name']
          );
          const salesOrderOption = this.salesOrderDrp.find(
            (s: any) => s.drpOption === row.salesOrder
          );

          const addressOption = this.customerAddressDrp.find(
            (addr: any) => addr.drpOption === row.address
          );

          if (salesOrderOption) {
            this.selectedOrderId = salesOrderOption.drpValue || 0;
          }

          this.customerSiteInfoForm.patchValue({
            customerName: customerOption || null,
            salesOrder: salesOrderOption || null,
            salesOrderDate: row.saleOrderDate ? new Date(row.saleOrderDate) : '',
            streetAddress: addressOption || null,
            country: row.country || '',
            state: row.state || '',
            city: row.city || '',
            pincode: row.pincode || '',
            emailId: row.emailId || row.userId || '',
          });

          if (addressOption && customerId && this.selectedOrderId) {
            this.getCustomerLocation();
          }

          if (this.selectedOrderId) {
            this.getProductDetail();
          }

          this.otherInfoForm.patchValue({
            invoiceNumber: row.invoiceNumber || '',
            invoiceDate: row.invoiceDate ? new Date(row.invoiceDate) : '',
            deliveryChallanNumber: row.deliveryChallanNo || '',
            deliveryDate: row.deliveryDate ? new Date(row.deliveryDate) : '',
            warrantyStartDate: row.warrantyStartDate ? new Date(row.warrantyStartDate) : '',
            warrantyEndDate: row.warrantyEndDate ? new Date(row.warrantyEndDate) : '',
            gpsCoordinates: row.gpsCoordinates || '',
            deviceDetails: row.deviceDetails || '',
            noOfFreeServices: row.freeServices || 0,
            schedules: row.schedule || '',
            notes: row.notes || '',
          });

          if (type === 'view') {
            this.customerSiteInfoForm.disable();
            this.otherInfoForm.disable();
          } else {
            this.customerSiteInfoForm.get('country')?.disable();
            this.customerSiteInfoForm.get('state')?.disable();
            this.customerSiteInfoForm.get('city')?.disable();
            this.customerSiteInfoForm.get('pincode')?.disable();
            this.otherInfoForm.get('noOfFreeServices')?.disable();
          }
        });
    } else {
      const customerOption = this.customerDrp.find(
        (c: any) => c.drpOption === row['customer Name']
      );

      this.customerSiteInfoForm.patchValue({
        customerName: customerOption || null,
        country: row.country || '',
        state: row.state || '',
        city: row.city || '',
        pincode: row.pincode || '',
        emailId: row.emailId || row.userId || '',
      });

      this.otherInfoForm.patchValue({
        invoiceNumber: row.invoiceNumber || '',
        invoiceDate: row.invoiceDate ? new Date(row.invoiceDate) : '',
        deliveryChallanNumber: row.deliveryChallanNo || '',
        deliveryDate: row.deliveryDate ? new Date(row.deliveryDate) : '',
        warrantyStartDate: row.warrantyStartDate ? new Date(row.warrantyStartDate) : '',
        warrantyEndDate: row.warrantyEndDate ? new Date(row.warrantyEndDate) : '',
        gpsCoordinates: row.gpsCoordinates || '',
        deviceDetails: row.deviceDetails || '',
        noOfFreeServices: row.freeServices || 0,
        schedules: row.schedule || '',
        notes: row.notes || '',
      });

      if (type === 'view') {
        this.customerSiteInfoForm.disable();
        this.otherInfoForm.disable();
      }
    }
  }

  getCustomerIdFromRow(row: any): number {
    const customerOption = this.customerDrp.find((c: any) => c.drpOption === row['customer Name']);
    return customerOption?.drpValue || 0;
  }
  onSubmit(event: any) {
    if (!this.customerSiteInfoForm.valid) {
      this.customerSiteInfoForm.markAllAsTouched();
      this.scrollToInvalidSection(this.customerSiteInfoForm, 'section-one');
      return;
    }
    this.paramvaluedata = ``;
    let customerName =
      this.customerSiteInfoForm.get('customerName')?.value?.drpValue ||
      this.customerSiteInfoForm.get('customerName')?.value;
    let salesOrder =
      this.customerSiteInfoForm.get('salesOrder')?.value?.drpValue ||
      this.customerSiteInfoForm.get('salesOrder')?.value;

    const rawSalesOrderDate = this.customerSiteInfoForm.get('salesOrderDate')?.value;
    let salesOrderDate = rawSalesOrderDate
      ? this.datePipe.transform(rawSalesOrderDate, 'yyyy-MM-dd') || ''
      : '';

    let streetAddress =
      this.customerSiteInfoForm.get('streetAddress')?.value?.drpValue ||
      this.customerSiteInfoForm.get('streetAddress')?.value;
    let country = this.countryId ? this.countryId : 0;
    let state = this.stateId ? this.stateId : 0;
    let city = this.cityId ? this.cityId : 0;
    let pincode = this.customerSiteInfoForm.get('pincode')?.value || '';

    let productJson = this.productData.length > 0 ? JSON.stringify(this.productData) : '[]';

    let invoiceNumber = this.otherInfoForm.get('invoiceNumber')?.value || '';

    const rawInvoiceDate = this.otherInfoForm.get('invoiceDate')?.value;
    let invoiceDate = rawInvoiceDate
      ? this.datePipe.transform(rawInvoiceDate, 'yyyy-MM-dd') || ''
      : '';

    let deliveryChallanNumber = this.otherInfoForm.get('deliveryChallanNumber')?.value || '';

    const rawDeliveryDate = this.otherInfoForm.get('deliveryDate')?.value;
    let deliveryDate = rawDeliveryDate
      ? this.datePipe.transform(rawDeliveryDate, 'yyyy-MM-dd') || ''
      : '';
    let userId = this.customerSiteInfoForm.get('emailId')?.value || '';

    const rawWarrantyStart = this.otherInfoForm.get('warrantyStartDate')?.value;
    let warrantyStartDate = rawWarrantyStart
      ? this.datePipe.transform(rawWarrantyStart, 'yyyy-MM-dd') || ''
      : '';

    const rawWarrantyEnd = this.otherInfoForm.get('warrantyEndDate')?.value;
    let warrantyEndDate = rawWarrantyEnd
      ? this.datePipe.transform(rawWarrantyEnd, 'yyyy-MM-dd') || ''
      : '';
    let gpsCoordinates = this.otherInfoForm.get('gpsCoordinates')?.value || '';
    let deviceDetails = this.otherInfoForm.get('deviceDetails')?.value || '';
    let noOfFreeServices = this.otherInfoForm.get('noOfFreeServices')?.value || 0;
    let schedules =
      this.otherInfoForm.get('schedules')?.value?.drpValue ||
      this.otherInfoForm.get('schedules')?.value ||
      0;
    let notes = this.otherInfoForm.get('notes')?.value || '';

    this.paramvaluedata = `customerId=${customerName}|salesOrder=${salesOrder}|saleOrderDate=${salesOrderDate}|officeAddress=${streetAddress}|countryId=${country}|stateId=${state}|cityId=${city}|pincode=${pincode}|invoiceNumber=${invoiceNumber}|invoiceDate=${invoiceDate}|deliveryChallanNo=${deliveryChallanNumber}|deliveryDate=${deliveryDate}|warrantyStartDate=${warrantyStartDate}|warrantyEndDate=${warrantyEndDate}|gpsCoordinates=${gpsCoordinates}|deviceDetails=${deviceDetails}|freeServices=${noOfFreeServices}|schedule=${schedules}|notes=${notes}|userId=${userId}|appUserId=${sessionStorage.getItem(
      'userId'
    )}`;
    this.openConfirmation('Confirm?', 'Are you sure you want to proceed?', '1', '1');
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
        } else if (option === '3') {
        }
      },
      reject: () => { },
    });
  }

  submitcall() {
    this.isFormLoading = true;
    let query = this.paramvaluedata;
    let SP = `uspPostServiceAgreementData`;
    const FormName = sessionStorage.getItem('menuItem')
      ? JSON.parse(sessionStorage.getItem('menuItem') || '{}').formName
      : 'header';

    this.userService.SubmitPostTypeData(SP, query, FormName).subscribe(
      (datacom: any) => {
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
              this.isFormLoading = false;
              this.onClear();
              this.onDrawerHide();
              this.fetchViewData(true);
            }, 500);
          } else if (resultarray[0] == '2') {
            setTimeout(() => {
              this.isFormLoading = false;
              this.openAlertDialog('Alert!', resultarray[1]);
            }, 1000);
          } else if (datacom == 'Error occured while processing data!--error') {
            setTimeout(() => {
              this.isFormLoading = false;
              this.openAlertDialog('Alert!', 'Something went wrong!');
            }, 1000);
          } else {
            this.isFormLoading = false;
            this.openAlertDialog('Alert!', datacom);
          }
        }
      },
      (err: HttpErrorResponse) => {
        setTimeout(() => {
          this.isFormLoading = false;
        }, 500);
        if (err.status == 401) {
          this.openAlertDialog('Error!', 'You are not authorized!');
        } else if (err.status == 403) {
          this.Customvalidation.loginroute(err.status);
        } else {
          this.openAlertDialog('Error!', err.error?.message?.toString() || 'Something went wrong!');
        }
      }
    );
  }

  onDrawerHide() {
    document.body.style.overflow = 'visible';
    this.customerSiteInfoForm.enable();
    this.otherInfoForm.enable();
    this.visible = false;
    this.onClear();
  }

  onClear() {
    this.customerSiteInfoForm.reset();
    this.otherInfoForm.reset();
    this.customerAddressDrp = [];
    this.productData = [];
    this.countryId = 0;
    this.stateId = 0;
    this.cityId = 0;
    this.pincode = 0;
    this.schedulesId = 0;
  }

  openAlertDialog(title: string, message: string) {
    this.confirmationService.confirm({
      message: message,
      header: title,
      icon: 'pi pi-exclamation-triangle',
      acceptVisible: false,
      rejectVisible: false,
    });
  }

  scrollToInvalidSection(form: FormGroup, sectionId: string) {
    if (form.invalid) {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  isInvalid(field: string, formName: any): boolean {
    const control = formName.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  transformDate(event: any, formName: string, controlName: string) {
    if (!event || !event.value) return;
    const formatted = this.datePipe.transform(event.value, 'yyyy-MM-dd');
    if (formName === 'customerSiteInfoForm') {
      this.customerSiteInfoForm.patchValue({
        [controlName]: formatted,
      });
    } else if (formName === 'otherInfoForm') {
      this.otherInfoForm.patchValue({
        [controlName]: formatted,
      });
    }
  }

  onSelectSalesOrder() {
    const soControlValue = this.customerSiteInfoForm.get('salesOrder')?.value;
    const salesOrderId =
      soControlValue && typeof soControlValue === 'object' && 'drpValue' in soControlValue
        ? soControlValue.drpValue
        : soControlValue || 0;

    if (!salesOrderId) {
      this.customerSiteInfoForm.patchValue({
        salesOrderDate: '',
        streetAddress: '',
      });
      this.otherInfoForm.patchValue({
        invoiceNumber: '',
      });
      this.productData = [];
      this.resetLocationData();
      return;
    }

    this.selectedOrderId = salesOrderId;

    let customerId = this.customerSiteInfoForm.get('customerName')?.value?.drpValue || 0;
    this.userService
      .geChplData(
        `uspGetServiceAgreementDrpData|action=ORDERDATA|customerId=${customerId}|customerAddId=0|orderId=${salesOrderId}`
      )
      .subscribe((res: any) => {
        if (res['table'] && res['table'].length > 0) {
          const orderData = res['table'][0];
          if (orderData.salesOrderDate) {
            this.customerSiteInfoForm.patchValue({
              salesOrderDate: new Date(orderData.salesOrderDate),
            });
          }
          if (orderData.customerAddressId) {
            const addressOption = this.customerAddressDrp.find(
              (addr: any) => addr.drpValue === orderData.customerAddressId
            );
            if (addressOption) {
              this.customerSiteInfoForm.patchValue({
                streetAddress: addressOption,
              });
              this.getCustomerLocation();
            }
          }
          if (orderData.invoiceNo) {
            this.otherInfoForm.patchValue({
              invoiceNumber: orderData.invoiceNo,
            });
          }
          if (orderData.invoiceDate) {
            this.otherInfoForm.patchValue({
              invoiceDate: new Date(orderData.invoiceDate),
            });
          }
          if (res['table1'] && res['table1'].length > 0) {
            this.productData = res['table1'];
          } else {
            this.productData = [];
          }
        }
      });
  }

  onchangewarrantyStartDate(event: any, formName: string, controlName: string) {
    this.transformDate(event, formName, controlName);
    this.onChangeWSD();
  }

  onchangewarrantyEndDate(event: any, formName: string, controlName: string) {
    this.transformDate(event, formName, controlName);
    this.onChangeWED();
  }

  getKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }
  onChangeWSD() {
    this.otherInfoForm.patchValue({
      warrantyEndDate: '',
      noOfFreeServices: 0,
    });
  }

  onChangeWED() {
    if (this.otherInfoForm.get('warrantyStartDate')?.value == '') {
      this.openAlertDialog('Alert!', 'Select warranty Start Date.');
      this.otherInfoForm.patchValue({
        warrantyEndDate: '',
      });
      return;
    }
    this.getNumberOfFreeServices();
  }

  getNumberOfFreeServices() {
    let startDate = this.otherInfoForm.get('warrantyStartDate')?.value
      ? this.datePipe.transform(this.otherInfoForm.get('warrantyStartDate')?.value, 'yyyy-MM-dd')
      : '';
    let endDate = this.otherInfoForm.get('warrantyEndDate')?.value
      ? this.datePipe.transform(this.otherInfoForm.get('warrantyEndDate')?.value, 'yyyy-MM-dd')
      : '';
    this.userService
      .geChplData(`uspGetMachineFreeServices|startDate=${startDate}|endDate=${endDate}`)
      .subscribe((res: any) => {
        if (res?.table && res.table.length > 0) {
          this.otherInfoForm.patchValue({
            noOfFreeServices: res.table[0].freeServices,
          });
        } else {
          this.otherInfoForm.patchValue({
            noOfFreeServices: 0,
          });
        }
      });
  }
}
