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
import { CommonModule } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { CardModule } from 'primeng/card';
import { DrawerModule } from 'primeng/drawer';
import { UserService } from '../../shared/user-service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Toast } from 'primeng/toast';
import { Customvalidation } from '../../shared/Validation';
import { HttpErrorResponse } from '@angular/common/http';
import { Dialog } from 'primeng/dialog';
import { FileUploadModule } from 'primeng/fileupload';
import { ConfigService } from '../../shared/config.service';
import { ImageUploadDialog } from '../../common-components/image-upload-dialog/image-upload-dialog';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-create-service',
  imports: [
    TableTemplate,
    FileUploadModule,
    DialogModule,
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
    Toast,
    Tooltip,
    ImageUploadDialog,
    TableModule,
    CheckboxModule,
    BreadcrumbModule,
    RouterModule,
    DatePipe,
  ],
  providers: [ConfirmationService, MessageService, DatePipe],
  templateUrl: './create-service.html',
  styleUrl: './create-service.scss',
})
export class CreateService {
  isLoading = true;
  visible: boolean = false;
  postType: string = '';
  header: any = '';
  selectedIndex: any = [];
  headerIcon: string = 'pi pi-plus';
  paramvaluedata: string = '';
  isFormLoading: boolean = false;
  data: any[] = [];
  minDate: Date = new Date();
  serviceForm: FormGroup;
  addMultiMachineForm: FormGroup;

  // Column management properties
  allColumns: TableColumn[] = [];
  availableColumns: TableColumn[] = [];
  importantColumns: TableColumn[] = [];
  requiredColumnKeys: Set<string> = new Set();
  selectAllChecked: boolean = false;

  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true },
    { key: 'rowNo', header: 'S.No', isVisible: true, isSortable: false },
  ];

  pageNo = 1;
  pageSize = 10;
  searchText: string = '';
  totalCount = 0;
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  district: string = '10001';
  customerDrp = [];
  customerAddressDrp = [];
  soldByDrp = [];
  assetDrp = [];
  machineTableArray: any[] = [];
  modelId: any;

  priorityDrp = [];

  dialogVisible = false;
  dialogTargetField = '';
  dialogFolderName = 'chplImages';
  formGroupName: any;
  createdBy: any;
  areaId: any;
  contactDetailDrp: any;

  serviceRequestDrp = [];
  assignedToDrp = [];
  modelDrp = [];
  problemCatDrp = [];
  problemTypeDrp = [];

  isView: boolean = true;
  FormName: string = '';
  breadcrumbItems: any[] = [
    { label: 'Home', routerLink: '/crm-admin-dashboard' },
    { label: 'Operations', routerLink: '' },
    { label: 'Create Service', routerLink: '' },
  ];
  productData: any[] = [];
  selectedMachineData: any[] = [];
  showMachineModal: boolean = false;
  today: Date = new Date();
  allViewTableData: any[] = [];
  paginationCountData: any[] = [];
  pageNoData: any[] = [];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private message: MessageService,
    private cdr: ChangeDetectorRef,
    private Customvalidation: Customvalidation,
    private configService: ConfigService,
    public datePipe: DatePipe
  ) {
    this.serviceForm = this.fb.group({
      customerName: ['', [Validators.required]],
      companyAdress: ['', [Validators.required]],
      contactDetail: ['', [Validators.required]],
      assignTo: ['', [Validators.required]],
      priority: ['', [Validators.required]],
      serviceRequest: ['', [Validators.required]],
      requiredDate: ['', [Validators.required]],
      recievedDate: ['', [Validators.required]],
    });

    this.addMultiMachineForm = this.fb.group({
      asset: ['', [Validators.required]],
      model: ['', [Validators.required]],
      serialNumber: ['', [Validators.required]],
      subject: ['', [Validators.required]],
      problemCat: ['', [Validators.required]],
      problemType: ['', [Validators.required]],
      serviceDetail: ['', [Validators.required]],
      attachment: [''],
    });
  }

  get f() {
    return this.serviceForm.controls;
  }
  get f1() {
    return this.addMultiMachineForm.controls;
  }

  ngOnInit(): void {
    const param = sessionStorage.getItem('menuItem');
    if (param) {
      const paramjs = JSON.parse(param);
      this.FormName = paramjs.formName || 'Create Service';
      this.breadcrumbItems = [
        { label: 'Home', routerLink: '/crm-admin-dashboard' },
        { label: 'Operations', routerLink: '' },
        { label: this.FormName, routerLink: '' },
      ];
    } else {
      this.breadcrumbItems = [
        { label: 'Home', routerLink: '/crm-admin-dashboard' },
        { label: 'Operations', routerLink: '' },
        { label: 'Create Service', routerLink: '' },
      ];
    }

    this.getCustomer();
    this.getEngineers();
    let name: any = sessionStorage.getItem('UserInfo');
    if (name) {
      try {
        let parseName = JSON.parse(name);
        if (parseName && Array.isArray(parseName) && parseName.length > 0 && parseName[0]) {
          this.createdBy = parseName[0]['empnam'] || '';
        }
      } catch (e) {
        console.error('Error parsing UserInfo:', e);
        this.createdBy = '';
      }
    }
    this.getTableData(true);
  }

  getCustomer() {
    this.userService
      .getQuestionPaper(
        `uspGetServiceRequestDropdownData|action=CUSTOMERS|appUserId=${sessionStorage.getItem(
          'userId'
        )}`
      )
      .subscribe(
        (res: any) => {
          this.customerDrp = res['table'] || [];
        },
        (err: HttpErrorResponse) => {
          if (err.status == 403) {
            this.Customvalidation.loginroute(err.status);
          }
        }
      );
  }

  getEngineers() {
    this.userService
      .getQuestionPaper(
        `uspGetServiceRequestDropdownData|action=ASSIGNEDTO|appUserId=${sessionStorage.getItem(
          'userId'
        )}`
      )
      .subscribe(
        (res: any) => {
          this.assignedToDrp = res['table'] || [];
        },
        (err: HttpErrorResponse) => {
          if (err.status == 403) {
            this.Customvalidation.loginroute(err.status);
          }
        }
      );
  }

  getCustomerAddres() {
    let customerId = this.serviceForm.get('customerName')?.value;
    if (!customerId) {
      this.customerAddressDrp = [];
      this.priorityDrp = [];
      this.serviceRequestDrp = [];
      this.contactDetailDrp = [];
      this.productData = [];
    }

    this.assetDrp = [];
    this.productData = [];
    this.contactDetailDrp = [];
    this.addMultiMachineForm.reset();

    this.userService
      .getQuestionPaper(
        `uspGetServiceRequestDropdownData|action=CUSTOMERDETAILS|customerId=${customerId}|customerAddressId=0|appUserId=${sessionStorage.getItem(
          'userId'
        )}`
      )
      .subscribe(
        (res: any) => {
          setTimeout(() => {
            this.customerAddressDrp = res['table'] || [];
            this.priorityDrp = res['table2'] || [];
            this.serviceRequestDrp = res['table3'] || [];
            this.cdr.detectChanges();
          }, 0);
        },
        (err: HttpErrorResponse) => {
          if (err.status == 403) {
            this.Customvalidation.loginroute(err.status);
          }
        }
      );
  }

  getProductDetails() {
    let customerId = this.serviceForm.get('customerName')?.value;
    let customerAddressId = this.serviceForm.get('companyAdress')?.value || 0;

    if (!customerId) return;

    this.userService
      .getQuestionPaper(
        `uspGetServiceRequestDropdownData|action=CUSTOMERPRODUCT|customerId=${customerId}|customerAddressId=${customerAddressId}|appUserId=${sessionStorage.getItem(
          'userId'
        )}`
      )
      .subscribe(
        (res: any) => {
          setTimeout(() => {
            this.productData = (res['table'] || []).map((item: any) => ({
              ...item,
              selected: false,
            }));
            this.cdr.detectChanges();
          }, 0);
        },
        (err: HttpErrorResponse) => {
          if (err.status == 403) {
            this.Customvalidation.loginroute(err.status);
          }
        }
      );
  }

  getMachineModelNum() {
    let assetId = this.addMultiMachineForm.get('asset')?.value
      ? this.addMultiMachineForm.get('asset')?.value.drpValue
      : 0;
    this.userService
      .geChplData(
        `uspGetServiceRequestDropdownData|action=ASSETDETAIL|assetId=${assetId}|districtId=${this.district}`
      )
      .subscribe(
        (res: any) => {
          if (res.table1.length > 0) {
            this.modelDrp = res.table1;
            this.addMultiMachineForm.patchValue({
              serialNumber: res.table2[0]['serialNumber'],
            });
          } else {
            this.addMultiMachineForm.patchValue({
              serialNumber: '',
            });
            this.modelDrp = [];
          }

          this.problemCatDrp = res['table3'];
        },
        (err: HttpErrorResponse) => {
          if (err.status == 403) {
            this.Customvalidation.loginroute(err.status);
          }
        }
      );
  }

  getProblemCatType() {
    let assetId = this.addMultiMachineForm.get('asset')?.value
      ? this.addMultiMachineForm.get('asset')?.value.drpValue
      : 0;
    let problemCat = this.addMultiMachineForm.get('problemCat')?.value
      ? this.addMultiMachineForm.get('problemCat')?.value.drpValue
      : 0;
    this.userService
      .geChplData(
        `uspGetServiceRequestDropdownData|action=ASSETDETAIL|assetId=${assetId}|problemCategoryId=${problemCat}|districtId=${this.district}`
      )
      .subscribe(
        (res: any) => {
          this.problemTypeDrp = res.table4;
        },
        (err: HttpErrorResponse) => {
          if (err.status == 403) {
            this.Customvalidation.loginroute(err.status);
          }
        }
      );
  }

  getContactDetail() {
    let customerId = this.serviceForm.get('customerName')?.value;
    let customerAddressId = this.serviceForm.get('companyAdress')?.value;

    if (!customerId || !customerAddressId) return;

    this.userService
      .getQuestionPaper(
        `uspGetServiceRequestDropdownData|action=CUSTOMERDETAILS|customerId=${customerId}|customerAddressId=${customerAddressId}|appUserId=${sessionStorage.getItem(
          'userId'
        )}`
      )
      .subscribe(
        (res: any) => {
          setTimeout(() => {
            this.contactDetailDrp = res['table1'] || [];
            this.cdr.detectChanges();
            this.getProductDetails();
          }, 0);
        },
        (err: HttpErrorResponse) => {
          if (err.status == 403) {
            this.Customvalidation.loginroute(err.status);
          }
        }
      );
  }

  onSubmit(event: any) {
    this.paramvaluedata = '';

    const normalizeDate = (val: any): string => {
      if (!val) return '';
      // If already a string (from transformDate), use as-is
      if (typeof val === 'string') return val;
      // If Date object, format to yyyy-MM-dd
      return this.datePipe.transform(val, 'yyyy-MM-dd') || '';
    };

    const customerId = this.serviceForm.get('customerName')?.value || 0;
    const recievedDate = normalizeDate(this.serviceForm.get('recievedDate')?.value);
    const createdBy = this.serviceForm.get('createdBy')?.value || '';
    const priorityId = this.serviceForm.get('priority')?.value || 0;
    const companyAddressId = this.serviceForm.get('companyAdress')?.value || 0;
    const contactId = this.serviceForm.get('contactDetail')?.value || 0;
    const serviceRequestId = this.serviceForm.get('serviceRequest')?.value || 0;
    const requiredDate = normalizeDate(this.serviceForm.get('requiredDate')?.value);
    const assignToValue = this.serviceForm.get('assignTo')?.value;
    const assignToId =
      assignToValue !== null && assignToValue !== undefined && assignToValue !== ''
        ? Number(assignToValue)
        : 0;

    const selectedItems = this.productData.filter((item: any) => item.selected);

    if (selectedItems.length === 0) {
      this.message.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select atleast one machine',
        life: 3000,
      });
      return;
    }

    const assetJson = selectedItems.map((item: any) => ({
      assetId: item.id || item.assetId || '',
      assetSerialNo: item['serial Number'] || item['SERIAL NUMBER'] || item.serialNumber || '',
      chassis: item['chassis Number'] || item['CHASSIS NUMBER'] || item.chassisNumber || '',
    }));

    this.paramvaluedata = `customerId=${customerId}|priorityId=${priorityId}|companyAddressId=${companyAddressId}|contactId=${contactId}|serviceRequestId=${serviceRequestId}|requiredDate=${requiredDate}|assignToId=${assignToId}|receivedDate=${recievedDate}|assetJson=${JSON.stringify(
      assetJson
    )}|appUserId=${sessionStorage.getItem('userId')}`;

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
        } else if (option === '4') {
        } else if (option === '5') {
        }
      },
      reject: () => {
        if (option === '4') {
        }
      },
    });
  }

  submitcall() {
    try {
      this.isFormLoading = true;
      let query = this.paramvaluedata;
      let SP = `uspPostServiceRequest`;
      let roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
      this.isFormLoading = false;
      this.userService.SubmitPostTypeData(SP, query, 'header').subscribe({
        next: (datacom: any) => {
          this.isFormLoading = false;
          try {
            if (!datacom) return;
            const resultarray = datacom.split('-');
            if (resultarray[1] === 'success') {
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
              this.clearData();
              this.getTableData(true);
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
            this.Customvalidation.loginroute(err.status);
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
    }
  }

  addRow(formName: any, form: any) {
    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }

    if (formName == 'addMultiMachineForm') {
      let obj = {
        assetId: this.addMultiMachineForm.get('asset')?.value.drpValue,
        asset: this.addMultiMachineForm.get('asset')?.value.drpOption,
        assetModel: this.addMultiMachineForm.get('model')?.value.drpValue,
        model: this.addMultiMachineForm.get('model')?.value.drpOption,
        assetSerialNo: this.addMultiMachineForm.get('serialNumber')?.value,
        assetSubject: this.addMultiMachineForm.get('subject')?.value,
        problemCategory: this.addMultiMachineForm.get('problemCat')?.value.drpValue,
        problemCat: this.addMultiMachineForm.get('problemCat')?.value.drpOption,
        problemType: this.addMultiMachineForm.get('problemType')?.value.drpValue,
        problemTypeTxt: this.addMultiMachineForm.get('problemType')?.value.drpOption,
        othersType: '',
        serviceDescription: this.addMultiMachineForm.get('serviceDetail')?.value,
        assetImage: this.addMultiMachineForm.get('attachment')?.value,
      };
      if (this.machineTableArray.some((e) => e.assetId == obj.assetId)) {
        this.openAlertDialog('Alert!', 'Asset already exist.');
        return;
      }

      this.machineTableArray.push(obj);
      this.addMultiMachineForm.reset();
      this.addMultiMachineForm.patchValue({
        attachment: '',
      });
      this.modelDrp = [];
      this.problemCatDrp = [];
      this.problemTypeDrp = [];
    }
  }

  showDialog(view: string, data: any) {
    this.isFormLoading = true;
    if (view == 'add') {
      this.visible = true;
      this.postType = view;
      this.header = view === 'add' ? 'Add' : view === 'update' ? 'Update' : 'View';
      this.headerIcon =
        view === 'add' ? 'pi pi-plus' : view === 'update' ? 'pi pi-pencil' : 'pi pi-eye';
      setTimeout(() => {
        this.isFormLoading = false;
        this.cdr.detectChanges();
      }, 1000);
    } else {
      this.selectedIndex = data;
    }

    this.serviceForm.patchValue({
      createdBy: this.createdBy,
    });

    this.serviceForm.get('createdBy')?.disable();
    this.serviceForm.get('area')?.disable();
    this.addMultiMachineForm.get('serialNumber')?.disable();
  }

  getTableData(isTrue: boolean) {
    try {
      if (isTrue) this.isLoading = true;
      else this.pageNo = 1;

      this.userService
        .getQuestionPaper(
          `uspGetServiceRequestsData|size=${this.pageSize}|pageIndex=${Number(
            this.pageNo
          )}|searchText=${this.searchText}|appUserId=${sessionStorage.getItem('userId')}`
        )
        .subscribe((res: any) => {
          this.allViewTableData = res['table1'] || [];
          this.paginationCountData = res['table'] || [];
          const arrayObject = this.allViewTableData;
          arrayObject.forEach((item: any) => {
            if (item.assetDetails) {
              try {
                item.assetDetails = JSON.parse(item.assetDetails);
              } catch (e) {
                item.assetDetails = [];
              }
            } else {
              item.assetDetails = [];
            }
          });

          this.data = this.allViewTableData.map((item: any, index: number) => ({
            ...item,
            rowNo: (this.pageNo - 1) * this.pageSize + index + 1,
          }));
          this.totalCount = this.paginationCountData?.[0]?.totalCnt || 0;

          // Initialize columns on first load
          if (this.allColumns.length === 0 && this.allViewTableData.length > 0) {
            this.initializeColumns();
          }

          setTimeout(() => {
            this.isLoading = false;
            this.cdr.detectChanges();
          }, 1000);
        });
    } catch (error) {
      this.isLoading = false;
      console.error(error);
    }
  }

  onAdd() {
    this.serviceForm.enable();
    this.postType = 'add';
    // this.isView = false;
  }

  gotoView() {
    this.onClear();
    this.isView = true;
    this.postType = 'add';
    this.visible = false;
  }

  transformDate(event: any, formName: string, controlName: string) {
    if (!event || !event.value) return;
    const formatted = this.datePipe.transform(event.value, 'yyyy-MM-dd');
    (this as any)[formName].patchValue({
      [controlName]: formatted,
    });
  }

  OnSubmitModal(event?: any) {
    debugger;
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (!this.serviceForm.valid) {
      this.serviceForm.markAllAsTouched();
      this.cdr.detectChanges();
      return;
    }
    this.onSubmit(event);
  }

  viewMachineDetails(row: any) {
    if (row && Array.isArray(row) && row.length > 0) {
      this.selectedMachineData = row;
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

  onSortChange(event: { column: string; direction: 'asc' | 'desc' }) {
    this.sortColumn = event.column;
    this.sortDirection = event.direction;
    this.getTableData(true);
  }

  // refreshData(): void {
  //   this.pageNo = 1;
  //   this.searchText = '';
  //   this.getTableData(true);
  //   this.cdr.detectChanges();
  // }

  formatKey(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }

  initializeColumns(): void {
    const staticColumns: TableColumn[] = [
      { key: 'ticket Number', header: 'Ticket Number', isVisible: false, isSortable: false },
      { key: 'customer', header: 'Customer Name', isVisible: false, isSortable: false },
      { key: 'customer contact', header: 'Customer Contact', isVisible: false, isSortable: false },
      { key: 'address', header: 'Customer Address', isVisible: false, isSortable: false },
      { key: 'assign To', header: 'Engineer Name', isVisible: false, isSortable: false },
      { key: 'engineer Contact', header: 'Engineer Contact', isVisible: false, isSortable: false },
      { key: 'request Type', header: 'Request Type', isVisible: false, isSortable: false },
      { key: 'priority', header: 'Priority', isVisible: false, isSortable: false },
      { key: 'status', header: 'Status', isVisible: false, isSortable: false },
      { key: 'request Date', header: 'Request Date', isVisible: false, isSortable: false },
      { key: 'required Date', header: 'Required Date', isVisible: false, isSortable: false },
    ];

    this.requiredColumnKeys.add('actions');
    this.requiredColumnKeys.add('rowNo');

    const importantCount = 15;
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
    this.cdr.detectChanges();
  }

  toggleColumnVisibility(column: TableColumn): void {
    if (this.requiredColumnKeys.has(column.key)) {
      return;
    }
    column.isVisible = !column.isVisible;
    this.updateVisibleColumns();
    this.cdr.detectChanges();
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
    this.cdr.detectChanges();
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

  deleteItem(item: any) {
    this.selectedIndex = item;
  }
  onDrawerHide() {
    document.body.style.overflow = 'visible'; // restore scroll
    this.serviceForm.enable();
    this.addMultiMachineForm.enable;
    this.visible = false;
  }
  isInvalid(field: string, formName: any): boolean {
    const control = formName.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  openDialogForField(fieldName: string, formName?: any, folderName?: string) {
    this.dialogTargetField = fieldName;
    this.formGroupName = formName;
    if (folderName) this.dialogFolderName = folderName;
    else this.dialogFolderName = 'chplImages';
    this.dialogVisible = true;
  }

  onImageUploaded(event: { field: string; url: string }) {
    if (!event || !event.field) return;
    const patchObj: any = {};
    patchObj[event.field] = event.url;
    this.formGroupName.patchValue(patchObj);
    this.cdr.detectChanges();
  }

  viewAttachment(url: string) {
    if (url) {
      window.open('https://elocker.nobilitasinfotech.com/' + url, '_blank');
    } else {
      this.openAlertDialog('Alert!', 'File not Exist!');
    }
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
  removeAttachment(selectedForm?: any, selectedFormControl?: any) {
    selectedForm.patchValue({
      [selectedFormControl]: '',
    });
  }

  clearData() {
    this.serviceForm.reset();
    this.addMultiMachineForm.reset();
    this.customerAddressDrp = [];
    this.priorityDrp = [];
    this.serviceRequestDrp = [];
    this.contactDetailDrp = [];
    this.productData = [];
    this.visible = false;
    this.isView = true;
  }

  onClear() {
    this.serviceForm.reset();
    this.addMultiMachineForm.reset();
    this.customerAddressDrp = [];
    this.priorityDrp = [];
    this.serviceRequestDrp = [];
    this.contactDetailDrp = [];
    this.productData = [];
  }
}
