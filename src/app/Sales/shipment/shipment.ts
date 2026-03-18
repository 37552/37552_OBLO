import { Component, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
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
  selector: 'app-shipment',
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
  templateUrl: './shipment.html',
  styleUrl: './shipment.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Shipment {
  isLoading = true;
  visible: boolean = false;
  postType: string = '';
  header: any = '';
  selectedIndex: any = [];
  headerIcon: string = 'pi pi-plus';
  paramvaluedata: string = '';
  isFormLoading: boolean = false;
  data: any[] = [];
  shipmentForm: FormGroup;
  
  // JSON Details Drawer
  jsonDetailsVisible: boolean = false;
  selectedItemDetails: any = null;
  jsonSectionType: 'shipment' | null = null;
  
  // Dropdown arrays
  salesOrders: any[] = [];
  warehouses: any[] = [];
  packages: any[] = [];
  items: any[] = [];
  units: any[] = [];
  deliveryStatuses: any[] = [];
  
  selectedShipmentDetails: any[] = [];
  
  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true },
    { key: 'text', header: 'Shipment No', isVisible: true },
    { key: 'soNumber', header: 'Sales Order No', isVisible: true },
    { key: 'warehouse', header: 'Warehouse', isVisible: true },
    { key: 'packageNo', header: 'Package No', isVisible: true },
    { key: 'shipmentDate', header: 'Shipment Date', isVisible: true },
    { key: 'carrierName', header: 'Carrier', isVisible: true },
    { key: 'trackingNo', header: 'Tracking No', isVisible: true },
    { key: 'deliveryStatus', header: 'Delivery Status', isVisible: true },
    { key: 'expectedDeliveryDate', header: 'Expected Delivery', isVisible: true },
    { key: 'totalWeight', header: 'Total Weight', isVisible: true },
    { key: 'totalVolume', header: 'Total Volume', isVisible: true },
    { key: 'remarks', header: 'Remarks', isVisible: true },
    { key: 'jsonDetails', header: 'Shipment Details', isVisible: true, isSortable: false, isCustom: true }
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
    this.shipmentForm = this.fb.group({
      id: [0],
      soHeaderId: [null, Validators.required],
      warehouseId: [null, Validators.required],
      packageId: [null, Validators.required],
      shipmentDate: [null, Validators.required],
      carrierName: ['', Validators.required],
      trackingNo: ['', Validators.required],
      deliveryStatusId: [null, Validators.required],
      expectedDeliveryDate: [null, Validators.required],
      remarks: ['']
    });
  }

  get f() { return this.shipmentForm.controls }

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
    this.getOrders();
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
      { key: 'warehouses', table: 'tblWarehouseMaster' },
      { key: 'units', table: 'tblUnitMaster' },
      { key: 'deliveryStatuses', table: 'tblShipmentStatusMaster' }
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

    this.loadItems();
  }

  loadItems() {
    this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblmaterialmaster`).subscribe({
      next: (res: any) => {
        this.items = res['table'] || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading items:', err);
        this.items = [];
      }
    });
  }

  loadPackagesBySalesOrder(soHeaderId?: number) {
    this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblSOPackageHeader`).subscribe({
      next: (res: any) => {
        this.packages = res['table'] || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading items:', err);
        this.packages = [];
      }
    });
  }

  getOrders() {
    this.userService.getQuestionPaper(`uspGetSalesOrderDrp|districtID=${sessionStorage.getItem('District')}`)
      .subscribe({
        next: (res: any) => {
          this.salesOrders = res?.['table'] || [];
          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error loading sales orders:', err);
          this.salesOrders = [];
          if (err.status == 403) {
            this.message.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Access denied to load sales orders'
            });
          }
          this.cdr.detectChanges();
        }
      });
  }

  onSalesOrderChange(soHeaderId: number) {
    if (!soHeaderId) {
      this.shipmentForm.patchValue({
        warehouseId: null,
        packageId: null
      });
      this.loadPackagesBySalesOrder(); 
      return;
    }

    this.isFormLoading = true;
    this.cdr.detectChanges();
    this.userService
      .getQuestionPaper(`uspGetSelectedSalesOrderDetails|soId=${soHeaderId}`)
      .subscribe({
        next: (res: any) => {
          if (res.table?.length) {
            const data = res.table[0];
            this.shipmentForm.patchValue({
              warehouseId: data.warehouseId || null
            });
            this.loadPackagesBySalesOrder(soHeaderId);
          }
          this.isFormLoading = false;
          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error loading sales order details:', err);
          this.isFormLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  onItemChange(event: any, index: number) {
    const itemId = event.value;
    const detail = this.selectedShipmentDetails[index];
    
    if (!itemId) {
      detail.makerCodes = [];
      detail.makerCodeId = null;
      this.cdr.detectChanges();
      return;
    }

    detail.makerCodeId = null;
    detail.makerCodes = [];
    
    this.loadMakerCodes(itemId, index);
  }

  loadMakerCodes(itemId: number, index: number) {
    const currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
    const roleId = currentRole?.roleId || '';
    const userId = sessionStorage.getItem('userId') || '';
    
    this.userService.getQuestionPaper(`uspGetMatReqMasters|action=MAKERCODE|itemId=${itemId}|appUserId=${userId}|appUserRole=${roleId}`)
      .subscribe({
        next: (res: any) => {
          const makerCodes = res?.['table'] || [];
          this.selectedShipmentDetails[index].makerCodes = makerCodes;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.selectedShipmentDetails[index].makerCodes = [];
          this.message.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load maker codes for the selected item.'
          });
          this.cdr.detectChanges();
        }
      });
  }

  private loadMakerCodesForExistingItem(itemId: number, index: number, shipmentDetail: any): void {
    const currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
    const roleId = currentRole?.roleId || '';
    const userId = sessionStorage.getItem('userId') || '';
    const savedMakerCodeId = shipmentDetail.makerCodeId;
    
    this.userService.getQuestionPaper(`uspGetMatReqMasters|action=MAKERCODE|itemId=${itemId}|appUserId=${userId}|appUserRole=${roleId}`)
      .subscribe({
        next: (res: any) => {
          const makerCodes = res?.['table'] || [];
          this.selectedShipmentDetails[index].makerCodes = makerCodes;
          
          // Check if saved maker code exists in the loaded list
          if (savedMakerCodeId && makerCodes.length > 0) {
            const exists = makerCodes.find((code: any) => code.drpvalue == savedMakerCodeId);
            if (!exists) {
              this.selectedShipmentDetails[index].makerCodeId = null;
            }
          }
          
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.selectedShipmentDetails[index].makerCodes = [];
          this.selectedShipmentDetails[index].makerCodeId = null;
          this.cdr.detectChanges();
        }
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
    
    let query = `searchText=${this.searchText}|pageIndex=${this.pageNo}|size=${this.pageSize}|districtId=${districtId}|appUserId=${userId}|appUserRole=${roleId}`;
    
    this.userService.getQuestionPaper(`uspGetShipmentDetails|${query}`).subscribe({
      next: (res: any) => {
        try {
          // Get data from table1 array
          this.data = res?.table1 || [];
          
          this.data = this.data.map(item => {
            let shipmentDetails: any[] = [];
            
            if (item.shipmentDetail) {
              try {
                shipmentDetails = JSON.parse(item.shipmentDetail);
                shipmentDetails = shipmentDetails.map((detail: any) => ({
                  id: detail.id || 0,
                  shipmentHeadId: detail.shipmentHeadId,
                  packageBoxNo: detail.packageBoxNo || '',
                  itemId: detail.itemId || detail.itemCodeId,
                  itemCodeId: detail.itemCodeId,
                  item: detail.item || '',
                  ItemCode: detail.ItemCode || '',
                  makerCodeId: detail.itemCodeId,
                  makerCode: detail.makerCode || detail.make || '',
                  unitId: detail.unitId,
                  unit: detail.uom || '',
                  shipmentQty: detail.shipmentQty || 0,
                  boxWeight: detail.boxWeight || 0,
                  volumeCBM: detail.volumeCBM || 0,
                  remarks: detail.remarks || ''
                }));
              } catch (parseError) {
                console.error('Error parsing shipmentDetail:', parseError);
                shipmentDetails = [];
              }
            }
            
            const totalWeight = shipmentDetails.reduce((sum, detail) => sum + (detail.boxWeight || 0), 0);
            const totalVolume = shipmentDetails.reduce((sum, detail) => sum + (detail.volumeCBM || 0), 0);
            const totalQuantity = shipmentDetails.reduce((sum, detail) => sum + (detail.shipmentQty || 0), 0);
            
            return {
              ...item,
              rowNo: item.rowNo || 0,
              id: item.id,
              text: item.text || '',
              soNumber: item.soNo || '',
              soHeaderId: item.soHeaderId,
              warehouse: item.dispatchedWarehouse || '',
              warehouseId: item.dispatchWarehouseId,
              packageNo: item.packageNo || '',
              packageId: item.packageId,
              shipmentDate: item.shipmentDate ? this.datePipe.transform(item.shipmentDate, 'dd/MM/yyyy') : '',
              carrierName: item.carrierName || '',
              trackingNo: item.trackingNo || '',
              deliveryStatus: item.deliveryStatusId || '',
              deliveryStatusId: item.deliveryStatusId,
              expectedDeliveryDate: item.expectedDeliveryDate ? this.datePipe.transform(item.expectedDeliveryDate, 'dd/MM/yyyy') : '',
              totalWeight: totalWeight,
              totalVolume: totalVolume,
              remarks: item.remarks || '',
              shipmentDetails: shipmentDetails,
              totalQuantity: totalQuantity,
              orgName: item.orgName || '',
              dispatchWarehouseId: item.dispatchWarehouseId,
              orgMasterId: item.orgMasterId
            };
          });
          
          // Get total count from table array
          this.totalCount = res?.table?.[0]?.totalCnt || 
                           res?.table?.[0]?.totalCount || 
                           this.data.length;

        } catch (innerErr) {
          console.error('Error processing shipment data:', innerErr);
          this.data = [];
          this.totalCount = 0;
          this.message.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: 'Failed to process shipment data.' 
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
          detail: 'Failed to load shipments.' 
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

private formatDateString(dateStr: string): string {
    if (!dateStr) return '';
    const parts = dateStr.split('/'); // ["dd", "mm", "yyyy"]
    if (parts.length !== 3) return '';
    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}



  showDialog(view: string, data: any) {
    this.isFormLoading = true;
    this.cdr.detectChanges();

    if (view == 'add') {
      this.visible = true;
      this.postType = view;
      this.header = 'Add Shipment';
      this.headerIcon = 'pi pi-plus';
      this.shipmentForm.reset({ id: 0 });
      this.selectedShipmentDetails = [];
      this.isFormLoading = false;
      this.cdr.detectChanges();
    } else {
      this.visible = true;
      this.postType = view;
      this.header = view === 'update' ? 'Update Shipment' : 'View Shipment';
      this.headerIcon = view === 'update' ? 'pi pi-pencil' : 'pi pi-eye';
      this.selectedIndex = data;

      if (view === 'view') {
        this.shipmentForm.disable();
      } else {
        this.shipmentForm.enable();
      }

      const patchData = {
        id: data.id || 0,
        soHeaderId: data.soHeaderId || null,
        warehouseId: data.dispatchWarehouseId || data.warehouseId || null,
        packageId: data.packageId || null,
        shipmentDate: data.shipmentDate,
        carrierName: data.carrierName || '',
        trackingNo: data.trackingNo || '',
        deliveryStatusId: data.deliveryStatusId || null,
        expectedDeliveryDate: data.expectedDeliveryDate,
        remarks: data.remarks || ''
      };

      this.shipmentForm.patchValue(patchData);
      
      if (data.soHeaderId) {
        this.loadPackagesBySalesOrder();
      }

      this.initializeShipmentDetails(data);
    }
    document.body.style.overflow = 'hidden';
  }

  private initializeShipmentDetails(data: any): void {
    try {
      const details = data.shipmentDetails || [];
      
      if (details && details.length > 0) {
        this.selectedShipmentDetails = details.map((detail: any, index: number) => {
          const shipmentDetail = {
            id: detail.id || 0,
            packageBoxNo: detail.packageBoxNo || '',
            itemCodeId: detail.itemId || detail.itemCodeId,
            makerCodeId: detail.makerCodeId || detail.itemCodeId,
            unitId: detail.unitId,
            boxWeight: detail.boxWeight || 0,
            volumeCBM: detail.volumeCBM || 0,
            shipmentQty: detail.shipmentQty || 0,
            remarks: detail.remarks || '',
            makerCodes: [],
            item: detail.item || '',
            ItemCode: detail.ItemCode || '',
            makerCode: detail.makerCode || detail.make || '',
            unit: detail.unit || detail.uom || ''
          };

          // Load maker codes if item is selected
          if (shipmentDetail.itemCodeId) {
            this.loadMakerCodesForExistingItem(shipmentDetail.itemCodeId, index, shipmentDetail);
          } else {
            this.cdr.detectChanges();
          }
          
          return shipmentDetail;
        });
      } else {
        this.selectedShipmentDetails = [];
      }
    } catch (parseError) {
      console.error('Error parsing shipment details:', parseError);
      this.selectedShipmentDetails = [];
    }
    
    this.isFormLoading = false;
    this.cdr.detectChanges();
  }

  onSubmit(event: any) {
    debugger
    if (!this.shipmentForm.valid) {
      this.shipmentForm.markAllAsTouched();
      this.scrollToFirstInvalidControl();
      this.cdr.detectChanges();
      return;
    }
    
    if (this.selectedShipmentDetails.length === 0) {
      this.message.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Add shipment details'
      });
      return;
    }

    let invalidRow = this.selectedShipmentDetails.find(detail =>
      !detail.packageBoxNo ||
      !detail.itemCodeId ||
      !detail.makerCodeId ||
      !detail.unitId ||
      !detail.boxWeight ||
      detail.boxWeight <= 0 ||
      !detail.volumeCBM ||
      detail.volumeCBM <= 0 ||
      !detail.shipmentQty ||
      detail.shipmentQty <= 0
    );

    if (invalidRow) {
      this.message.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please fill all required fields in shipment details.'
      });
      return;
    }
    
    const formData = this.shipmentForm.getRawValue();
const shipmentDate = this.formatDateString(formData.shipmentDate);
const expectedDeliveryDate = this.formatDateString(formData.expectedDeliveryDate);

if (!shipmentDate) {
  this.message.add({ severity: 'error', summary: 'Error', detail: 'Invalid Shipment Date' });
  return;
}

if (!expectedDeliveryDate) {
  this.message.add({ severity: 'error', summary: 'Error', detail: 'Invalid Expected Delivery Date' });
  return;
}


    const shipmentDetailJSON = this.selectedShipmentDetails.map(detail => ({
      id: detail.id || 0,
      packageBoxNo: detail.packageBoxNo,
      itemCodeId: detail.makerCodeId, 
      unitId: detail.unitId,
      boxWeight: detail.boxWeight,
      volumeCBM: detail.volumeCBM,
      shipmentQty: detail.shipmentQty,
      remarks: detail.remarks
    }));

    const roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId || '';
    const userId = sessionStorage.getItem('userId') || '';
    
    // Build the parameter string with formatted dates
    let paramArray = [
      `soHeaderId=${formData.soHeaderId}`,
      `warehouseId=${formData.warehouseId}`,
      `packageId=${formData.packageId}`,
      `shipmentDate=${shipmentDate}`,
      `carrierName=${formData.carrierName}`,
      `trackingNo=${formData.trackingNo}`,
      `deliveryStatusId=${formData.deliveryStatusId}`,
      `expectedDeliveryDate=${expectedDeliveryDate}`,
      `remarks=${formData.remarks || ''}`,
      `shipmentDetailJson=${JSON.stringify(shipmentDetailJSON)}`,
      `appUserId=${userId}`,
      `appUserRole=${roleID}`
    ];

    if (this.postType === 'update') {
      paramArray.unshift(`id=${formData.id}`);
    }

    this.paramvaluedata = paramArray.join('|');
    
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
    const controls = this.shipmentForm.controls;
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

    const SP = this.postType === 'update' ? 'uspPostUpdateSOShipment' : 'uspPostSOShipment';

    this.userService.SubmitPostTypeData(SP, this.paramvaluedata, 'header').subscribe({
      next: (datacom: any) => {
        this.isFormLoading = false;
        if (!datacom) return;
        
        // Check if response is a string with dash separator
        if (typeof datacom === 'string' && datacom.includes('-')) {
          const resultarray = datacom.split("-");
          
          if (resultarray[1] === "success") {
            this.getTableData(false);
            this.message.add({
              severity: 'success',
              summary: 'Success',
              detail: this.postType === 'update'
                ? 'Shipment Updated Successfully.'
                : 'Shipment Created Successfully.',
            });
            this.onDrawerHide();
          } else if (resultarray[0] == "2") {
            this.message.add({
              severity: 'warn',
              summary: 'Warn',
              detail: resultarray[1] || datacom
            });
          } else {
            this.message.add({
              severity: 'warn',
              summary: 'Warn',
              detail: datacom,
            });
          }
        } 
        // Check if response is an object with result property
        else if (datacom.result === 1) {
          this.getTableData(false);
          this.message.add({
            severity: 'success',
            summary: 'Success',
            detail: this.postType === 'update'
              ? 'Shipment Updated Successfully.'
              : 'Shipment Created Successfully.',
          });
          this.onDrawerHide();
        } else if (datacom.result === 2) {
          this.message.add({
            severity: 'warn',
            summary: 'Warn',
            detail: datacom.msg || 'Operation failed.',
          });
        } else {
          this.message.add({
            severity: 'warn',
            summary: 'Warn',
            detail: datacom.errormessage || 'Unknown error occurred.',
          });
        }

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Submit error:', err);
        this.message.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to save shipment data.',
        });
        this.isFormLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  deleteData() {
    const roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId || '';
    let query = `action=DELETE|id=${this.selectedIndex.id || 0}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${roleID}`;
    this.userService.SubmitPostTypeData(`uspDeleteSOShipment`, query, 'header').subscribe({
      next: (datacom: any) => {
        this.isFormLoading = false;
        if (!datacom) return;
        if (datacom.result === 1) {
          this.getTableData(true);
          this.message.add({ severity: 'success', summary: 'Success', detail: 'Shipment deleted successfully' });
          this.onDrawerHide();
        } else {
          this.message.add({ severity: 'warn', summary: 'Warn', detail: datacom.msg || 'Delete failed', });
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Delete error:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete shipment.' });
        this.isFormLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onDrawerHide() {
    document.body.style.overflow = 'visible';
    this.shipmentForm.enable();
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
    const control = this.shipmentForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onClear() {
    this.shipmentForm.reset({
      id: 0
    });
    this.selectedShipmentDetails = [];
    this.loadPackagesBySalesOrder(); 
    this.cdr.detectChanges();
  }

  addShipmentDetail() {
    this.selectedShipmentDetails.push({ 
      packageBoxNo: '',
      itemCodeId: null, 
      makerCodeId: null,
      unitId: null, 
      boxWeight: null, 
      volumeCBM: null, 
      shipmentQty: null, 
      remarks: '',
      makerCodes: []
    });
  }

  removeShipmentDetail(index: number) {
    this.selectedShipmentDetails.splice(index, 1);
  }

  getTotalWeight(): number {
    return this.selectedShipmentDetails.reduce((total, detail) => total + (detail.boxWeight || 0), 0);
  }

  getTotalVolume(): number {
    return this.selectedShipmentDetails.reduce((total, detail) => total + (detail.volumeCBM || 0), 0);
  }

  getTotalQuantity(): number {
    return this.selectedShipmentDetails.reduce((total, detail) => total + (detail.shipmentQty || 0), 0);
  }

  viewShipmentDetails(item: any) {
    let parsedDetails: any[] = [];

    if (item.shipmentDetail) {
      try {
        parsedDetails = JSON.parse(item.shipmentDetail);
      } catch (err) {
        console.error('Invalid shipmentDetail JSON:', err);
        parsedDetails = [];
      }
    } else if (item.shipmentDetails) {
      parsedDetails = item.shipmentDetails;
    }

    const normalizedDetails = parsedDetails.map((p: any) => ({
      packageBoxNo: p.packageBoxNo || '',
      item: p.item || p.itemName || '',
      makerCode: p.makerCode || p.make || '',
      unit: p.unit || p.uom || '',
      shipmentQty: p.shipmentQty || 0,
      boxWeight: p.boxWeight || 0,
      volumeCBM: p.volumeCBM || 0,
      remarks: p.remarks || ''
    }));

    this.selectedItemDetails = {
      text: item.text,
      soNumber: item.soNo || item.soNumber,
      warehouse: item.dispatchedWarehouse || item.warehouse,
      packageNo: item.packageNo,
      shipmentDate: item.shipmentDate ,
      carrierName: item.carrierName,
      trackingNo: item.trackingNo,
      deliveryStatus: item.deliveryStatusId,
      expectedDeliveryDate: item.expectedDeliveryDate ? this.datePipe.transform(item.expectedDeliveryDate, 'dd/MM/yyyy') : '',
      totalWeight: item.totalWeight || 0,
      totalVolume: item.totalVolume || 0,
      remarks: item.remarks || '',
      shipmentDetails: normalizedDetails
    };

    this.jsonSectionType = 'shipment';
    this.jsonDetailsVisible = true;
    this.cdr.detectChanges();
  }

  closeJsonDetails() {
    this.jsonDetailsVisible = false;
    this.selectedItemDetails = null;
    this.jsonSectionType = null;
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }
}