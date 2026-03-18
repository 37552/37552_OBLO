import { Component, ChangeDetectorRef, signal } from '@angular/core';
import { TableTemplate, TableColumn } from '../../table-template/table-template';
import { ButtonModule } from 'primeng/button';
import { Popover } from 'primeng/popover';
import { Tooltip } from "primeng/tooltip";
import { ConfirmDialog } from 'primeng/confirmdialog';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { CardModule } from 'primeng/card';
import { DrawerModule } from 'primeng/drawer';
import { UserService } from '../../shared/user-service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Toast } from 'primeng/toast';
import { MultiSelectModule } from 'primeng/multiselect';
import { Customvalidation, noInvalidPipelineName, salesOrderValidator } from '../../shared/Validation';
@Component({
  selector: 'app-production-plan',
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
    ProgressSpinner,
    MultiSelectModule,
    Toast,
    Tooltip,
  ],
  providers: [
    ConfirmationService,
    MessageService
  ],
  templateUrl: './production-plan.html',
  styleUrls: ['./production-plan.scss']
})
export class ProductionPlan {
  isLoading = true;
  visible: boolean = false;
  postType: string = '';
  header: any = '';
  selectedIndex: any = [];
  headerIcon: string = 'pi pi-plus';
  paramvaluedata: string = '';
  isFormLoading: boolean = false;
  data: any[] = [];
  groupMasterForm1: FormGroup;
  groupListArray = []
  totalCount = 0;

  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true, },
    { key: 'prodCode', header: 'Naming Series', isVisible: true, isSortable: false },
    { key: 'postingDate', header: 'Posting Date', isVisible: true, isSortable: false },
    { key: 'salesOrder', header: 'Sales Order', isVisible: true, isSortable: false },
    { key: 'orderDate', header: 'Order Date', isVisible: true, isSortable: false },
    { key: 'consolSalesOrder', header: 'Consolidated Sales', isVisible: true, isSortable: false },
    // { key: 'itemToManufacture', header: 'Posting Date', isVisible: true, isSortable: false },
    // { key: 'itemName', header: 'Get Item From', isVisible: true, isSortable: false },
    // { key: 'allowAlternativeItem', header: 'Customer Name', isVisible: true, isSortable: false },
    // { key: 'useMultilevelBom', header: 'Grand Total', isVisible: true, isSortable: false },
    // { key: 'updateConsumedMaterial', header: 'Consolidate Sales', isVisible: true, isSortable: false },
    // { key: 'warehouseName', header: 'Warehouse Name ', isVisible: true, isSortable: false },
    // { key: 'sourceWarehouse', header: 'PP Raw Material', isVisible: true, isSortable: false },
    // { key: 'workInProgressWarehouse', header: 'Total Planned Quantity', isVisible: true, isSortable: false },
    // { key: 'workOrderOperations', header: 'Status', isVisible: true, isSortable: false },
  ];


  
  pageNo = 1;
  pageSize = 5;
  searchText = '';
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  productTypedrp: any = []
  previousGroupType: any;
  selectedrowIndex: any
  itemDailog: boolean = false
  itemManufactureDrp = []
  relatedToDrp = []
  salesOrdersDrp = []
  workOrderDrp = []
  workOrderOpsDrp = []

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private message: MessageService,
    public Customvalidation: Customvalidation,
    private cdr: ChangeDetectorRef
  ) {
    this.groupMasterForm1 = this.fb.group({
      postingDate: ['', Validators.required],
      salesOrder: ['', [Validators.required, salesOrderValidator()]],
      orderDate: ['', Validators.required],
      consolidateSales: [false, ''],
      // getItemFrom: ['', Validators.required],
      // customerName: ['', Validators.required],
      // grandTotal: ['', Validators.required],
      // warehouseName: ['', Validators.required],
      // ppRawMaterial: ['', Validators.required],
      // totalPlannedQuantity: ['', Validators.required],
      // totalProducedQuantity: ['', Validators.required],
      // status: ['', Validators.required],
      // jobCardTimeLogs: [''],
      // operations: [''],
      // operationName: [''],
      // workstation: [''],
      // wipWarehouse: [''],
      // qualityInspectionTemplate: [''],
      // rawMaterial: [''],
      // scrapItems: ['']
    });
  }

  get f() { return this.groupMasterForm1.controls }

  ngOnInit(): void {
    this.getTableData(true);
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  onCheckboxChange(fieldName: string, event: any) {
    const isChecked = event.target.checked;
    this.groupMasterForm1.get(fieldName)?.setValue(isChecked);
  }

  allowOnlyNumbers(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  getTableData(isTrue: boolean) {
    try {
      if (isTrue) this.isLoading = true;
      else this.pageNo = 1;

      const userId = sessionStorage.getItem('userId') || '';
      const query = `appUserId=${userId}|appUserRole=${JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId}|searchText=${this.searchText}|pageIndex=${this.pageNo}|size=${this.pageSize}`;
      this.userService.getQuestionPaper(`uspGetProductionDetails|${query}`).subscribe({
        next: (res: any) => {
          try {
            setTimeout(() => {
              this.data = res?.table1 || [];
              this.totalCount = res?.table?.[0]?.totalCnt || this.data.length;
              this.cdr.detectChanges();
            }, 0);
          } catch (innerErr) {
            console.error('Error processing response:', innerErr);
            this.data = [];
            this.totalCount = 0;
          } finally {
            setTimeout(() => {
              this.isLoading = false;
              this.cdr.detectChanges();
            }, 1000);
          }
        },
        error: (err) => {
          console.error('API call failed:', err);
          this.isLoading = false;
          if (err.status === 403) this.Customvalidation.loginroute(err.status);
          else {
            this.data = [];
            this.totalCount = 0;
          }
        }
      });
    } catch (error) {
      console.error('Unexpected error in getTableData():', error);
      this.isLoading = false;
    }
  }

  showDialog(view: string, data: any) {
    this.selectedIndex = data;
    this.visible = true;
    this.postType = view;
    this.header = view === 'add' ? 'Add' : view === 'update' ? 'Update' : 'View';
    this.headerIcon = view === 'add' ? 'pi pi-plus' : view === 'update' ? 'pi pi-pencil' : 'pi pi-eye';

    if (view === 'add') {
      this.groupMasterForm1.reset();
      this.groupMasterForm1.enable();
    } else {
      if (view === 'view') this.groupMasterForm1.disable();
      else this.groupMasterForm1.enable();

      this.groupMasterForm1.patchValue({
        postingDate: data.postingDate || '',
        getItemFrom: data.getItemFrom || '',
        salesOrder: data.salesOrder || '',
        orderDate: data.orderDate || '',
        consolidateSales: data.consolSalesOrder ?? false,
        // customerName: data.customerName || '',
        // grandTotal: data.grandTotal || '',
        // consolidateSales: data.consolidateSales || '',
        // warehouseName: data.warehouseName || '',
        // ppRawMaterial: data.ppRawMaterial || '',
        // totalPlannedQuantity: data.totalPlannedQuantity || '',
        // totalProducedQuantity: data.totalProducedQuantity || '',
        // status: data.status || '',
        // jobCardTimeLogs: data.jobCardTimeLogs || '',
        // operations: data.operations || '',
        // operationName: data.operationName || '',
        // workstation: data.workstation || '',
        // wipWarehouse: data.wipWarehouse || '',
        // qualityInspectionTemplate: data.qualityInspectionTemplate || '',
        // rawMaterial: data.rawMaterial || '',
        // scrapItems: data.scrapItems || ''
      });
    }

    document.body.style.overflow = 'hidden';
  }

  isInvalid(field: string): boolean {
    const control = this.groupMasterForm1.get(field);
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

  onSortChange(event: { column: string, direction: 'asc' | 'desc' }) {
    this.sortColumn = event.column;
    this.sortDirection = event.direction;
    this.getTableData(true);
  }

  deleteItem(item: any) {
    this.selectedIndex = item;
    this.openConfirmation("Confirm", "Are you sure want to delete?", '1', '2');
  }

  onDrawerHide() {
    document.body.style.overflow = 'visible';
    this.groupMasterForm1.enable();
    this.groupMasterForm1.reset();
    this.visible = false;
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
        if (option === '1') this.submitcall();
        else if (option === '2') this.deleteData();
        else if (option === '5') this.groupMasterForm1.reset();
      }
    });
  }

  onClear() {
    this.groupMasterForm1.reset();
  }

  onSubmit(event: any) {
    if (!this.groupMasterForm1.valid) {
      this.groupMasterForm1.markAllAsTouched();
      return;
    }

    const postingDate = this.groupMasterForm1.get('postingDate')?.value?.trim() || '';
    const salesOrder = this.groupMasterForm1.get('salesOrder')?.value?.trim() || '';
    const orderDate = this.groupMasterForm1.get('orderDate')?.value?.trim() || '';
    const consolidateSales = this.groupMasterForm1.get('consolidateSales')?.value ? '1' : '0';

    this.paramvaluedata = `postingDate=${postingDate}|salesOrder=${salesOrder}|orderDate=${orderDate}|consolidateSales=${consolidateSales}`;
    this.openConfirmation('Confirm?', 'Are you sure you want to proceed?', '1', '1', event);
  }

  submitcall() {
    this.isFormLoading = true;
    let query = '';
    let SP = '';

    if (this.postType === 'update') {
      query = `${this.paramvaluedata}|Id=${this.selectedIndex.id}|userId=${sessionStorage.getItem('userId')}`;
      SP = `uspUpdateProductionPlanDetails`;
    } else {
      query = `${this.paramvaluedata}|userId=${sessionStorage.getItem('userId')}`;
      SP = `uspPostProductionPlanDetails`;
    }

    this.userService.SubmitPostTypeData(SP, query, 'header').subscribe((datacom: any) => {
      this.isFormLoading = false;
      if (!datacom) return;
      const resultarray = datacom.split("-");
      if (resultarray[1] === "success") {
        this.getTableData(false);
        setTimeout(() => this.cdr.detectChanges(), 0);
        this.message.add({
          severity: 'success',
          summary: 'Success',
          detail: this.postType === 'update' ? 'Data Updated Successfully.' : 'Data Saved Successfully.',
        });
        this.onDrawerHide();
      } else {
        this.message.add({ severity: 'warn', summary: 'Warn', detail: resultarray[1] || datacom });
      }
    });
  }

  deleteData() {
    try {
      this.isFormLoading = true;
      let query = `Id=${this.selectedIndex.id}|userId=${sessionStorage.getItem('userId')}`;
      this.userService.SubmitPostTypeData(`uspdeleteProductionPlanDetails`, query, 'header').subscribe({
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
    } catch (error) {
      console.error('Unexpected error in deleteData():', error);
      this.isFormLoading = false;
    }
  }

  onDeleteRow(data: any, index: number) {
    this.selectedrowIndex = index;
    this.openConfirmation("Confirm", "Are you sure want to delete?", '1', '5');
  }

  showGrouplist(data: any) {
    this.itemDailog = true;
    try {
      const custArray = JSON.parse(data?.customerDetails || '[]');
      this.groupListArray = custArray.flatMap((c: any) =>
        c.ct.map((x: any) => ({
          CustomerId: x.CustomerId,
          CustomerValue: x.CustomerValue
        }))
      );
    } catch (e) {
      console.error('Error parsing customerDetails', e);
      this.groupListArray = [];
    }
  }


  blockTyping(event: KeyboardEvent) {
    event.preventDefault();
  }

  openCalendar(event: any) {
    event.target.showPicker(); 
  }



}
