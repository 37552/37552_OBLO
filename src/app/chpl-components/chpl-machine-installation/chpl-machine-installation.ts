import {
  Component,
  ChangeDetectorRef,
  signal,
  ViewChild,
  QueryList,
  ElementRef,
  NgZone,
} from '@angular/core';
import { TableTemplate, TableColumn } from '../../table-template/table-template';
import { ButtonModule } from 'primeng/button';
import { Popover } from 'primeng/popover';
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
import { ConfirmationService, MessageService, MenuItem } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { Customvalidation } from '../../shared/Validation';
import { HttpErrorResponse } from '@angular/common/http';
import { ConfigService } from '../../shared/config.service';
import { DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { DialogModule } from 'primeng/dialog';
import { MenuModule } from 'primeng/menu';
import { BreadcrumbModule } from 'primeng/breadcrumb';

@Component({
  selector: 'app-chpl-machine-installation',
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
    DatePickerModule,
    ConfirmDialog,
    Toast,
    RouterModule,
    TableModule,
    CheckboxModule,
    DialogModule,
    MenuModule,
    DatePipe,
    BreadcrumbModule,
  ],
  providers: [ConfirmationService, MessageService, DatePipe],
  templateUrl: './chpl-machine-installation.html',
  styleUrl: './chpl-machine-installation.scss',
})
export class ChplMachineInstallation {
  formFields!: QueryList<ElementRef>;
  dataDialogRef: any;
  postType: string = 'add';
  param: any;
  menulabel: string = '';
  formlable: string = '';
  percentVal: any = 0;
  FormName = '';
  isView = true;
  FormValue = '';
  paramvaluedata: string = '';
  pageNo: number = 1;
  searchText: string = '';
  pageSize: number = 10;
  approalHistoryData: any = null;
  allViewTableData: any = [];
  paginationCountData: any = [];
  pageNoData: any = [];
  selectedItem: any = null;
  selectedAction: any = null;
  updateDisable: boolean = false;
  tableHeaders: any[] = [];
  machineInstallationForm: FormGroup;
  addMultiMachineForm: FormGroup;
  selectedForm: any = '';
  selectedFormControl: any = '';
  selectedFolderName: string = '';
  uploadFileSize: any;
  FileerrorMessage: string = '';
  filesToUpload: any[] = [];
  selectedFileNames: any[] = [];
  attachmentArray = [];
  district: string = '10015';
  customerDrp: any[] = [];
  customerAddressDrp: any[] = [];
  salesOrderDrp: any[] = [];
  soldByDrp: any[] = [];
  machineDrp: any[] = [];
  machineTableArray: any[] = [];
  productData: any[] = [];
  isDisable = true;
  modelId: any;
  showMachineModal: boolean = false;
  selectedMachineData: any = {};
  viewDetailMenuItems: MenuItem[] = [];

  // Legacy properties for compatibility
  isLoading = true;
  visible: boolean = false;
  header: any = '';
  selectedIndex: any = [];
  headerIcon: string = 'pi pi-plus';
  isFormLoading: boolean = false;
  data: any[] = [];
  totalCount = 0;
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

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

  breadcrumbItems = [
    { label: 'Home', routerLink: '/crm-admin-dashboard' },
    { label: 'Operations', routerLink: '' },
    { label: 'Machine Installation', routerLink: '' },
  ];

  constructor(
    public Customvalidation: Customvalidation,
    private userService: UserService,
    public zone: NgZone,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private confirmationService: ConfirmationService,
    private message: MessageService,
    private cdr: ChangeDetectorRef,
    private configService: ConfigService
  ) {
    this.machineInstallationForm = this.fb.group({
      customerName: ['', [Validators.required]],
      salesOrder: ['', [Validators.required]],
      soldBy: ['', [Validators.required]],
      invoiceDate: ['', [Validators.required]],
      isCommisioned: [false],
      attachment: ['', [Validators.required]],
      address: [''],
      contactName: [''],
      contactNo: [''],
    });

    this.addMultiMachineForm = this.fb.group({
      machine: ['', [Validators.required]],
      model: [''],
      serialNumber: [''],
    });

    // Initialize menu items - not needed anymore but keeping for compatibility
    this.viewDetailMenuItems = [];
  }
  get f() {
    return this.machineInstallationForm.controls;
  }
  get f1() {
    return this.addMultiMachineForm.controls;
  }

  ngOnInit(): void {
    this.param = sessionStorage.getItem('menuItem');
    let paramjs = JSON.parse(this.param);
    this.FormName = paramjs.formName;
    this.FormValue = paramjs.formValue;
    this.menulabel = paramjs.menu;
    this.getCustomer();
    this.getTableData(true);
    
  }

  getCustomer() {
    this.userService
      .getQuestionPaper(
        `uspGetMachineInstallDrpData|action=CUSTOMER|customerAddId=0|customerId=0|orderId=0`
      )
      .subscribe(
        (res: any) => {
          this.customerDrp = res['table'];
        },
        (err: HttpErrorResponse) => {
          if (err.status == 403) {
            this.Customvalidation.loginroute(err.status);
          }
        }
      );
  }

  getSalesOrder() {
    let customerId = this.machineInstallationForm.get('customerName')?.value;
    this.soldByDrp = [];
    this.machineDrp = [];
    this.modelId = '';
    this.addMultiMachineForm.reset();

    this.userService
      .getQuestionPaper(`uspGetMachineInstallDrpData|action=ORDERDATA|customerId=${customerId}`)
      .subscribe(
        (res: any) => {
          this.salesOrderDrp = res['table'];
        },
        (err: HttpErrorResponse) => {
          if (err.status == 403) {
            this.Customvalidation.loginroute(err.status);
          }
        }
      );
  }

  onViewPageSizeChange() {
    this.getTableData(true);
  }

  onViewSearchClick() {
    this.getTableData(false);
  }

  onViewPaginationChange(page: number) {
    this.pageNo = page;
    this.getTableData(true);
  }

  getTableData(isTrue: boolean) {
    try {
      if (isTrue) this.isLoading = true;
      else this.pageNo = 1;

      this.userService
        .getQuestionPaper(
          `uspGetInstalledMachineData|size=${this.pageSize}|pageIndex=${Number(
            this.pageNo
          )}|searchText=${this.searchText}|appUserId=${sessionStorage.getItem('userId')}`
        )
        .subscribe((res: any) => {
          this.allViewTableData = res['table1'] || [];
          this.paginationCountData = res['table'] || [];
          this.pageNoData = res['table2'] || [];

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

          // Map data for table template
          this.data = this.allViewTableData.map((item: any, index: number) => ({
            ...item,
            rowNo: (this.pageNo - 1) * this.pageSize + index + 1,
          }));
          this.totalCount = this.paginationCountData?.length || 0;

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

  fetchViewData(isTrue: boolean) {
    this.getTableData(isTrue);
  }

  getSoldByAndMachine() {
    this.addMultiMachineForm.reset();

    let orderId = this.machineInstallationForm.get('salesOrder')?.value
      ? this.machineInstallationForm.get('salesOrder')?.value
      : 0;

    const selectedObj = this.salesOrderDrp.find((so: any) => so.drpValue == orderId);
    if (selectedObj) {
      this.machineInstallationForm.patchValue({
        address: (selectedObj as any).address || '',
        contactName: (selectedObj as any).contactName || '',
        contactNo: (selectedObj as any).contactNo || '',
      });
    }

    this.userService
      .getQuestionPaper(`uspGetMachineInstallDrpData|action=PRODUCT|orderId=${orderId}|customerId=0|customerAddId=0`)
      .subscribe(
        (res: any) => {
          this.productData = res['table'];
          this.soldByDrp = res['table1'];
        },
        (err: HttpErrorResponse) => {
          if (err.status == 403) {
            this.Customvalidation.loginroute(err.status);
          }
        }
      );
  }

  showDialog(view: string, data: any) {
    this.isFormLoading = true;
    if (view == 'add') {
      this.visible = true;
      this.postType = view;
      this.header = 'Add';
      this.headerIcon = 'pi pi-plus';
      this.machineInstallationForm.reset();
      this.productData = [];
      this.salesOrderDrp = [];
      this.soldByDrp = [];
      setTimeout(() => {
        this.isFormLoading = false;
        
      }, 1000);
    } else if (view == 'view') {
      this.selectedIndex = data;
      this.visible = true;
      this.postType = view;
      this.header = 'View';
      this.headerIcon = 'pi pi-eye';
      // Load data for view
      this.loadViewData(data);
      setTimeout(() => {
        this.isFormLoading = false;
        
      }, 1000);
    }
  }

  loadViewData(data: any) {
    console.log("Backend Raw Data:", data);

    
    this.machineInstallationForm.patchValue({
      customerName: data.customer || '',       
      salesOrder: data['sales Order'] || '',   
      address: data.address || '',
      contactName: data.contactName || '',
      contactNo: data.contactNo || '',
      soldBy: data['sold By'] || '',          
      invoiceDate: data['invoice Date'] || '', 
      isCommisioned: data['is Commissioned'] === 'YES', 
      attachment: data.attachedFile || '',
    });

    this.machineInstallationForm.disable();

   
    if (data.assetDetails) {
      try {
        const parsed = typeof data.assetDetails === 'string' 
          ? JSON.parse(data.assetDetails) 
          : data.assetDetails;
        
        
        this.productData = Array.isArray(parsed) ? parsed : [parsed];
      } catch (e) {
        console.error("Error parsing assetDetails:", e);
        this.productData = [];
      }
    }
}

  onDrawerHide() {
    document.body.style.overflow = 'visible';
    this.machineInstallationForm.enable();
    this.addMultiMachineForm.enable();
    this.visible = false;
    this.onClear();
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

  OnSubmitModal() {
    const selectedItems = this.productData.filter((item: any) => item.selected);
    if (selectedItems.length === 0) {
      this.openAlertDialog('Alert!', 'Please select at least one item.');
      return;
    }

    const machineIds = selectedItems.map((item: any) => ({ machineId: item.id }));

    if (this.machineInstallationForm.invalid) {
      this.machineInstallationForm.markAllAsTouched();
      this.scrollToFirstInvalidControl();
      return;
    }

    this.paramvaluedata = '';

    let customer = this.machineInstallationForm.get('customerName')?.value;
    let orderId = this.machineInstallationForm.get('salesOrder')?.value;
    let soldBy = this.machineInstallationForm.get('soldBy')?.value;
    const rawInvoiceDate = this.machineInstallationForm.get('invoiceDate')?.value;
    // Always send invoiceDate as yyyy-MM-dd
    const invoiceDate =
      this.datePipe.transform(rawInvoiceDate, 'yyyy-MM-dd') || rawInvoiceDate || '';
    let isCommisioned = this.machineInstallationForm.get('isCommisioned')?.value == false ? 0 : 1;
    let attachment = this.machineInstallationForm.get('attachment')?.value;

    this.paramvaluedata = `customerId=${customer}|orderId=${orderId}|soldBy=${soldBy}|invoiceDate=${invoiceDate}|isMachineCommissioned=${isCommisioned}|attachment=${attachment}|machineJson=${JSON.stringify(
      machineIds
    )}`;

    this.openConfirmDialog('Confirm?', 'Are you sure you want to proceed?', '1', '1');
  }

  openConfirmDialog(title: any, msg: any, id: any, option?: any) {
    this.confirmationService.confirm({
      message: msg,
      header: title,
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (option == '1') {
          this.submitcall();
        } else if (option == '2') {
        } else if (option == '3') {
        }
      },
    });
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
          // this.deleteData();
        } else if (option === '4') {
        } else if (option === '5') {
        }
      },
      reject: () => {
        if (option === '4') {
          // this.inputTypeData.patchValue({
          //   groupType: this.previousGroupType
          // })
        }
      },
    });
  }

  submitcall() {
    this.isLoading = true;

    let query = ``;
    let SP = ``;
    query = `${this.paramvaluedata}|appUserId=${sessionStorage.getItem('userId')}`;
    SP = `uspPostMachineInstallationDetails`;

    this.userService.SubmitPostTypeData(SP, query, this.FormName).subscribe(
      (datacom: any) => {
        if (datacom != '') {
          const resultarray = datacom.split('-');
          if (resultarray[1] == 'success') {
            setTimeout(() => {
              this.openAlertDialog('Success!', 'Data Saved Successfully.');
              this.isLoading = false;
              this.clearData();
            }, 500);
          } else if (resultarray[0] == '2') {
            setTimeout(() => {
              this.isLoading = false;
              this.openAlertDialog('Alert!', resultarray[1]);
            }, 1000);
          } else if (datacom == 'Error occured while processing data!--error') {
            setTimeout(() => {
              this.isLoading = false;
              this.openAlertDialog('Alert!', 'Something went wrong!');
            }, 1000);
          } else {
            this.isLoading = false;
            this.openAlertDialog('Alert!', datacom);
          }
        }
      },
      (err: HttpErrorResponse) => {
        setTimeout(() => {
          this.isLoading = false;
        }, 500);
        if (err.status == 401) {
          this.openAlertDialog('Error!', 'You are not authorized!');
        } else if (err.status == 403) {
          this.Customvalidation.loginroute(err.status);
        } else {
          this.openAlertDialog('Error!', err.error?.message?.toString() || 'An error occurred');
        }
      }
    );
  }

  clearData() {
    this.machineInstallationForm.reset();
    this.productData = [];
    this.salesOrderDrp = [];
    this.soldByDrp = [];
    this.getTableData(true);
  }

  onClear() {
    this.machineInstallationForm.reset();
    this.productData = [];
    this.salesOrderDrp = [];
    this.soldByDrp = [];
    this.addMultiMachineForm.reset();
    this.modelId = '';
  }

  scrollToFirstInvalidControl() {
    const firstInvalidControl = this.formFields?.find((field) =>
      field.nativeElement.classList.contains('ng-invalid')
    );
    if (firstInvalidControl) {
      firstInvalidControl.nativeElement.scrollIntoView({ behavior: 'smooth' });
      firstInvalidControl.nativeElement.focus();
    }
  }

  scrollToInvalidSection(form: FormGroup, sectionId: string) {
    if (form.invalid) {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  deleteItem(item: any) {
    this.selectedIndex = item;
    // this.openConfirmation("Confirm", "Are you sure want to delete?", '1', '2');
  }

  isInvalid(field: string, formName: any): boolean {
    const control = formName.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getKeys(obj: any): string[] {
    return Object.keys(obj).filter((key) => key !== 'id' && key !== 'selected');
  }

  getViewKeys(obj: any): string[] {
    return Object.keys(obj).filter(
      (key) => key !== 'id' && key !== 'rowNo' && key !== 'assetDetails' && key !== 'attachedFile'
    );
  }

  transformDate(event: any, formName: string, controlName: string) {
    if (!event || !event.value) return;
    const formatted = this.datePipe.transform(event.value, 'yyyy-MM-dd');
    (this as any)[formName].patchValue({
      [controlName]: formatted,
    });
  }

  onFileSelected(event: Event, formName: string, controlName: string, folderName: string): void {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    input.value = '';
    if (!files.length) return;

    this.userService.MastrtfileuploadNew(files, folderName).subscribe({
      next: (response: any) => {
        const result = String(response || '').split('-');
        if (result[0] === '1') {
          (this as any)[formName].patchValue({ [controlName]: result[1].toString() });
          this.openAlertDialog('Success!', 'File uploaded successfully.');
        } else {
          this.openAlertDialog('Error!', result[1] || 'Upload failed');
        }
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 401) {
          this.openAlertDialog('Error!', 'You are not authorized!');
        } else if (err.status === 403) {
          this.Customvalidation.loginroute(err.status);
        } else {
          this.openAlertDialog('Error!', err.message || 'Upload failed');
        }
      },
    });
  }

  removeUploadedFile(formName: string, controlName: string): void {
    (this as any)[formName].patchValue({ [controlName]: '' });
  }
  openImagePreview(imageUrl: string) {
    window.open(imageUrl, '_blank');
  }

  viewAttachment(url: string) {
    if (url) {
      window.open('https://elocker.nobilitasinfotech.com/' + url, '_blank');
      //window.open(this.configService.baseUrl+url, '_blank');
    } else {
      this.openAlertDialog('Alert!', 'File not Exist!');
    }
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

  viewMachineDetails(row: any) {
    this.selectedMachineData = row;
    this.showMachineModal = true;
  }

  closeMachineModal() {
    this.showMachineModal = false;
  }

  getModalKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  addRow(formName: any, form: any) {
    if (form.invalid) {
      form.markAllAsTouched();
      this.scrollToInvalidSection(form, 'section-two');
      return;
    }
    if (formName == 'addMultiMachineForm') {
      let obj: any = {
        machineId: this.addMultiMachineForm.get('machine')?.value.drpValue,
        machine: this.addMultiMachineForm.get('machine')?.value.drpOption,
        modelId: this.modelId,
        model: this.addMultiMachineForm.get('model')?.value,
        SerialNo: this.addMultiMachineForm.get('serialNumber')?.value,
      };

      if (this.machineTableArray.some((e: any) => e.machineId == obj.machineId)) {
        this.openAlertDialog('Alert!', 'Machine already exist.');
        return;
      }
      this.machineTableArray.push(obj);
      this.addMultiMachineForm.reset();
      this.modelId = '';
    }
  }

  getPaginationStart(): number {
    return (this.pageNo - 1) * +this.pageSize + 1;
  }

  getPaginationEnd(): number {
    const end = this.pageNo * +this.pageSize;
    const total = this.paginationCountData?.length || 0;
    return end > total ? total : end;
  }

  refreshData(): void {
    this.pageNo = 1;
    this.searchText = '';
    this.getTableData(true);
    this.cdr.detectChanges();
  }

  formatKey(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }

  initializeColumns(): void {
    const staticColumns: TableColumn[] = [
      { key: 'customer', header: 'Customer Name', isVisible: false, isSortable: false },
      { key: 'address', header: 'Address', isVisible: false, isSortable: false },
      { key: 'sales Order', header: 'Sales Order', isVisible: false, isSortable: false },
      { key: 'sold By', header: 'Sold BY', isVisible: false, isSortable: false },
      { key: 'is Commissioned', header: 'Is Commissioned', isVisible: false, isSortable: false },
      { key: 'invoice Date', header: 'Invoice Date', isVisible: false, isSortable: false },
      
    ];

    this.requiredColumnKeys.add('actions');
    this.requiredColumnKeys.add('rowNo');

    const importantCount = Math.min(10, staticColumns.length);
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

    this.availableColumns = staticColumns.filter(
      (col) => !this.requiredColumnKeys.has(col.key)
    );

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
}
