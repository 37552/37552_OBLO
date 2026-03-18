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
import { Dialog } from 'primeng/dialog';

@Component({
  selector: 'app-work-order',
  imports: [
    TableTemplate,
    CardModule,
    ButtonModule,
    DrawerModule,
    Popover,
    Dialog,
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
  templateUrl: './work-order.html',
  styleUrl: './work-order.scss'
})
export class WorkOrder {
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
  groupListArray: any[] = [];
  totalCount = 0;

  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true, },
    { key: 'workOrderCode', header: 'Series Name', isVisible: true, isSortable: false },
    { key: 'itemName', header: 'Item Name ', isVisible: true, isSortable: false },
    { key: 'quantity', header: 'Quantity to Manufacture', isVisible: true, isSortable: false },
    { key: 'bomCode', header: 'BOM Number', isVisible: true, isSortable: false },
    { key: 'salesOrderId', header: 'Sales Orders', isVisible: true, isSortable: false },
    { key: 'warehouseName', header: 'Warehouse Name ', isVisible: true, isSortable: false },
    { key: 'sourceWarehouse', header: 'Source Warehouse', isVisible: true, isSortable: false },
    { key: 'workInprogressWarehouse', header: 'Work in Progress Warehouse', isVisible: true, isSortable: false },
    { key: 'targetWarehouse', header: 'Target Warehouse', isVisible: true, isSortable: false },
    { key: 'scrapWarehouse', header: 'Scrap Warehouse', isVisible: true, isSortable: false },
    { key: 'relatedTo', header: 'Related to', isVisible: true, isSortable: false },
    { key: 'planStartDate', header: 'Planned Start Date', isVisible: true, isSortable: false },
    { key: 'planEndDate', header: 'Planned End Date', isVisible: true, isSortable: false },
    { key: 'actualStartDate', header: 'Actual Start Date', isVisible: true, isSortable: false },
    { key: 'actualEndDate', header: 'Actual End Date', isVisible: true, isSortable: false },
    { key: 'expectDelieveryDate', header: 'Expected Delivery Date', isVisible: true, isSortable: false },
    { key: 'stockUom', header: 'Stock UOM', isVisible: true, isSortable: false },
    { key: 'allowItem', header: 'Allow Material Transfer to WIP', isVisible: true, isSortable: false },
    { key: 'skipmtrlTransfer', header: 'Skip Material Transfer to WIP', isVisible: true, isSortable: false },
    { key: 'useMultilevelBom', header: 'Use Multilevel BOM', isVisible: true, isSortable: false },
    { key: 'updateConsmMaterial', header: 'Update Consumed Material', isVisible: true, isSortable: false },
    { key: 'jsonDetails', header: 'Work Order Operations', isVisible: true, isSortable: false, isCustom: true },
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
  salesOrdersDrp = []
  workOrderDrp = []
  workOrderOpsDrp = []
  operationDrp = []
  relatedToDrp = []
  wareHouseDrp = []
  billOfMaterialDrp = []
  unitMasterDrp = []
  childArrData: any[] = [];

  minToDate: string;
  minToDate1: string;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private message: MessageService,
    public Customvalidation: Customvalidation,
    private cdr: ChangeDetectorRef
  ) {

    this.minToDate = '';
    this.minToDate1 = '';

    this.groupMasterForm1 = this.fb.group({
      itemName: ['', [Validators.required, noInvalidPipelineName()]],
      quantity: ['', Validators.required],
      bomId: ['', Validators.required],
      relatedToFormId: ['', Validators.required],
      salesOrderId: ['', [Validators.required, salesOrderValidator()]],
      allowItem: [false, [Validators.requiredTrue]],
      skipmtrlTransfer: [false, [Validators.requiredTrue]],
      useMultilevelBom: [false, [Validators.requiredTrue]],
      updateConsmMaterial: [false, [Validators.requiredTrue]],
      sourceWarehouseId: ['', Validators.required],
      targetWarehouseId: ['', Validators.required],
      workInprogressWarehouseId: ['', Validators.required],
      scrapWarehouseId: ['', Validators.required],
      planStartDate: ['', Validators.required],
      planEndDate: ['', Validators.required],
      actualStartDate: ['', Validators.required],
      actualEndDate: ['', Validators.required],
      expectDelieveryDate: ['', Validators.required],
      stockUom: ['', Validators.required],
      operatJson: ['', Validators.required]
    });
    
  }

  
  get f() { return this.groupMasterForm1.controls }

  ngOnInit(): void {
    this.getTableData(true);
    this.getOperationsMaster()
    this.getFormTypeMaster()
    this.getWareHouseMaster()
    this.getbillMaterialMaster()
    this.getUnitMaster()

    this.groupMasterForm1.get('planStartDate')?.valueChanges.subscribe(planStartDate => {
      this.minToDate = planStartDate || '';
      const planEndDate = this.groupMasterForm1.get('planEndDate');
      if (planEndDate?.value && planEndDate.value < this.minToDate) {
        planEndDate.setValue('');
      }
    });

    this.groupMasterForm1.get('actualStartDate')?.valueChanges.subscribe(actualStartDate => {
      this.minToDate1 = actualStartDate || '';
      const actualEndDate = this.groupMasterForm1.get('actualEndDate');
      if (actualEndDate?.value && actualEndDate.value < this.minToDate1) {
        actualEndDate.setValue('');
      }
    });


    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  allowOnlyNumbers(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  getOperationsMaster() {
    this.userService.getQuestionPaper(`uspGetOperationsDetailsMaster`).subscribe((res: any) => {
      this.operationDrp = res['table']      
    })
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }


  getFormTypeMaster() {
    this.userService.getQuestionPaper(`uspGetFormTypeMaster`).subscribe((res: any) => {
      this.relatedToDrp = res['table']
    })
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  getWareHouseMaster() {
    const currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
    const roleId = currentRole?.roleId || '';
    const userId = sessionStorage.getItem('userId') || '';
    const districtId = sessionStorage.getItem('District') || '';
    this.userService.getQuestionPaper(`uspGetWareHouseMaster|appUserId=${userId}|appUserRole=${roleId}|districtId=${districtId}`).subscribe((res: any) => {
      this.wareHouseDrp = res['table']
    })
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  getbillMaterialMaster() {
    this.userService.getQuestionPaper(`uspGetBillOfmaterialMaster`).subscribe((res: any) => {
      this.billOfMaterialDrp = res['table']
    })
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }


  getUnitMaster() {
    this.userService.getQuestionPaper(`uspGetUnitMaster`).subscribe((res: any) => {
      this.unitMasterDrp = res['table']
    })
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }


  onCheckboxChange(fieldName: string, event: any) {
    const isChecked = event.target.checked;
    this.groupMasterForm1.get(fieldName)?.setValue(isChecked);
  }


  getTableData(isTrue: boolean) {
    try {
      if (isTrue) {
        this.isLoading = true;
      } else {
        this.pageNo = 1;
      }
      const userId = sessionStorage.getItem('userId') || '';
      const currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
      const roleId = currentRole?.roleId || '';
      const districtId = sessionStorage.getItem('District') || '';

      const query = `appUserId=${userId}|appUserRole=${roleId}|districtId=${districtId}|searchText=${this.searchText}|pageIndex=${this.pageNo}|size=${this.pageSize}`;
      this.userService.getQuestionPaper(`uspGetWorkOrderDetails|${query}`).subscribe({
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
          if (err.status === 403) {
            this.Customvalidation.loginroute(err.status);
          } else {
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
  
    this.header =
      view === 'add' ? 'Add' :
      view === 'update' ? 'Update' :
      'View';
  
    this.headerIcon =
      view === 'add' ? 'pi pi-plus' :
      view === 'update' ? 'pi pi-pencil' :
      'pi pi-eye';
  
    if (view === 'add') {
      this.groupMasterForm1.reset();
      this.groupMasterForm1.enable();
      this.childArrData = [];
    }
    else {
  
      if (view === 'view') this.groupMasterForm1.disable();
      else this.groupMasterForm1.enable();
  
      let customerTypes: any[] = [];
  
      // 🟪 Correct Parsing for Your JSON Format
      try {
        const parsed = JSON.parse(data?.operationJson || '[]');
  
        customerTypes = parsed.map((item: any) => ({
          drpOption: item.operationName,
          drpValue: item.Id
        }));
  
      } catch (e) {
        console.error("Error parsing operationJson:", e);
        customerTypes = [];
      }
  
      // 🟩 Patch Values
      this.groupMasterForm1.patchValue({
        itemName: data.itemName ?? '',
        quantity: data.quantity ?? '',
        bomId: data.bomId ?? '',
        relatedToFormId: data.relatedToFormId ?? '',
        salesOrderId: data.salesOrderId ?? '',
        allowItem: data.allowItem ?? false,
        skipmtrlTransfer: data.skipmtrlTransfer ?? false,
        useMultilevelBom: data.useMultilevelBom ?? false,
        updateConsmMaterial: data.updateConsmMaterial ?? false,
        sourceWarehouseId: data.sourceWarehouseId ?? '',
        targetWarehouseId: data.targetWarehouseId ?? '',
        workInprogressWarehouseId: data.workInprogressWarehouseId ?? '',
        scrapWarehouseId: data.scrapWarehouseId ?? '',
        planEndDate: data.planEndDate ?? '',
        planStartDate: data.planStartDate ?? '',
        actualStartDate: data.actualStartDate ?? '',
        actualEndDate: data.actualEndDate ?? '',
        expectDelieveryDate: data.expectDelieveryDate ?? '',
        stockUom: data.stockUomId ?? '',
        operatJson: customerTypes,    // 🟦 MultiSelect Pre-Selected Values
      });
  
      this.childArrData = customerTypes;
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
    this.groupMasterForm1.patchValue({
      seriesName: '',
      itemToManufacture: '',
      itemName: '',
      qtyToManufacture: '',
      bomNumber: '',
      productionItem: '',
      relatedTo: '',
      salesOrders: [],
      workOrder: '',
      skipMaterialTransferToWip: false,
      useMultilevelBom: false,
      updateConsumedMaterial: false,
      warehouseName: '',
      sourceWarehouse: '',
      workInProgressWarehouse: '',
      workOrderOperations: '',
      plannedStartDate: '',
      plannedEndDate: '',
      actualStartDate: '',
      actualEndDate: '',
      expectedDeliveryDate: '',
      stockUOM: '',
      materialRequest: ''
    });
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
        if (option === '1') {
          this.submitcall();
        } else if (option === '2') {
          this.deleteData();
        } else if (option === '5') {
          this.groupMasterForm1.reset()
        }
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
  
    // Safe trim function — only trim if value is a string
    const safeTrim = (val: any) => {
      return typeof val === 'string' ? val.trim() : val;
    };
  
    const itemName = safeTrim(this.groupMasterForm1.get('itemName')?.value);
    const quantity = safeTrim(this.groupMasterForm1.get('quantity')?.value);
    const salesOrderId = safeTrim(this.groupMasterForm1.get('salesOrderId')?.value);
  
    const allowItem = this.groupMasterForm1.get('allowItem')?.value ? '1' : '0';
    const skipmtrlTransfer = this.groupMasterForm1.get('skipmtrlTransfer')?.value ? '1' : '0';
    const useMultilevelBom = this.groupMasterForm1.get('useMultilevelBom')?.value ? '1' : '0';
    const updateConsmMaterial = this.groupMasterForm1.get('updateConsmMaterial')?.value ? '1' : '0';
  
    // Date fields — NO TRIM
    const planStartDate = this.groupMasterForm1.get('planStartDate')?.value || '';
    const PlanEndDate = this.groupMasterForm1.get('planEndDate')?.value || '';
    const actualStartDate = this.groupMasterForm1.get('actualStartDate')?.value || '';
    const actualEndDate = this.groupMasterForm1.get('actualEndDate')?.value || '';
    const expectDelieveryDate = this.groupMasterForm1.get('expectDelieveryDate')?.value || '';
  
    // Numeric dropdown values — NO TRIM
    const bomId = this.groupMasterForm1.get('bomId')?.value || 0;
    const stockUom = this.groupMasterForm1.get('stockUom')?.value || 0;
    const relatedToFormId = this.groupMasterForm1.get('relatedToFormId')?.value || 0;
    const sourceWarehouseId = this.groupMasterForm1.get('sourceWarehouseId')?.value || 0;
    const targetWarehouseId = this.groupMasterForm1.get('targetWarehouseId')?.value || 0;
    const workInprogressWarehouseId = this.groupMasterForm1.get('workInprogressWarehouseId')?.value || 0;
    const scrapWarehouseId = this.groupMasterForm1.get('scrapWarehouseId')?.value || 0;
  
    const operatJson = this.groupMasterForm1.get('operatJson')?.value ?? [];
  
    if (operatJson.length === 0) {
      this.message.add({
        severity: 'warn',
        summary: 'Warn',
        detail: 'Select at least one Customer Type'
      });
      return;
    }
  
    const operatJsonCust = operatJson.map((c: any) => ({
      operationId: c.drpValue
    }));
  
    const operatJsonStr = JSON.stringify(operatJsonCust);
  
    this.paramvaluedata =`itemName=${itemName}|quantity=${quantity}|bomId=${bomId}|relatedToFormId=${relatedToFormId}|salesOrderId=${salesOrderId}|allowItem=${allowItem}|skipmtrlTransfer=${skipmtrlTransfer}|useMultilevelBom=${useMultilevelBom}|updateConsmMaterial=${updateConsmMaterial}|sourceWarehouseId=${sourceWarehouseId}|targetWarehouseId=${targetWarehouseId}|workInprogressWarehouseId=${workInprogressWarehouseId}|scrapWarehouseId=${scrapWarehouseId}|planStartDate=${planStartDate}|PlanEndDate=${PlanEndDate}|actualStartDate=${actualStartDate}|actualEndDate=${actualEndDate}|expectDelieveryDate=${expectDelieveryDate}|stockUom=${stockUom}|operatJson=${operatJsonStr}`;
  
    this.openConfirmation('Confirm?', 'Are you sure you want to proceed?', '1', '1', event);
  }
  


  submitcall() {
    this.isFormLoading = true;
    let query = '';
    let SP = '';
    const districtId = sessionStorage.getItem('District') || '';

    if (this.postType === 'update') {
      query = `${this.paramvaluedata}|Id=${this.selectedIndex.id}|districtId=${districtId}|userId=${sessionStorage.getItem('userId')}`;
      SP = `uspUpdateWorkOrderDetails`;
    } else {
      query = `${this.paramvaluedata}|userId=${sessionStorage.getItem('userId')}|districtId=${districtId}`;
      SP = `uspPostWorkOrderDetails `;
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
      } else if (resultarray[0] == "2") {
        this.message.add({ severity: 'warn', summary: 'Warn', detail: resultarray[1] || datacom });
      } else {
        this.message.add({ severity: 'warn', summary: 'Warn', detail: datacom });
      }
    });
  }


  deleteData() {
    try {
      this.isFormLoading = true;
      let query = `Id=${this.selectedIndex.id}|userId=${sessionStorage.getItem('userId')}`;
      this.userService.SubmitPostTypeData(`uspDeleteWorkOrderDetails`, query, 'header').subscribe({
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
      const custArray = JSON.parse(data.operationJson || '[]');
  
      this.groupListArray = custArray.map((item: any) => ({
        operationId: item.Id,
        operationName: item.operationName
      }));
  
    } catch (e) {
      console.error('Error parsing operationJson', e);
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
