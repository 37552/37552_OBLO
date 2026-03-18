import { Component, ChangeDetectorRef, signal } from '@angular/core';
import { TableTemplate, TableColumn } from '../../table-template/table-template';
import { ButtonModule } from 'primeng/button';
import { Popover } from 'primeng/popover';
import { Tooltip } from "primeng/tooltip";
import { Dialog } from 'primeng/dialog';
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
import { noInvalidPipelineName,Customvalidation} from '../../shared/Validation';


@Component({
  selector: 'app-exim-shipment',
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
    Dialog
  ],
  providers: [
    ConfirmationService,
    MessageService
  ],
  templateUrl: './exim-shipment.html',
  styleUrl: './exim-shipment.scss'
})

export class EximShipment {
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

  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true, },
    // { key: 'courtCode', header: 'Import Shipment', isVisible: true, isSortable: false },
    { key: 'transportMode', header: 'Transport Mode', isVisible: true, isSortable: false },
    { key: 'blAwbNumber', header: 'BL/AWB Number', isVisible: true, isSortable: false },
    { key: 'vesselFlightName', header: 'Vessel/Flight Name', isVisible: true, isSortable: false },
    { key: 'container', header: 'Container ', isVisible: true, isSortable: false },
    { key: 'expectedArrivalTime', header: 'ETA (Expected Time of Arrival)', isVisible: true, isSortable: false },
    { key: 'freightForwarder', header: 'Freight Forwarder', isVisible: true, isSortable: false },
    { key: 'actualFrieght', header: 'Actual Freight', isVisible: true, isSortable: false },
    { key: 'purchaseOrder', header: 'Purchase Orders', isVisible: true, isSortable: false },
  ];

  pageNo = 1;
  pageSize = 5;
  searchText = '';
  totalCount = 0;
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  transportModeDrp = [];
  partyNamedrp = []
  purchaseOrder = []
  cityDrp = []
  itemDailog: boolean = false
  minDate: string = '';

  constructor(private fb: FormBuilder,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private message: MessageService,
    public Customvalidation: Customvalidation,
    private cdr: ChangeDetectorRef) {

    this.groupMasterForm1 = this.fb.group({
      transportMode: ['', Validators.required],
      blNumber: ['', [Validators.required, noInvalidPipelineName()]],
      vesselName: ['', [Validators.required, noInvalidPipelineName()]],
      container:['', [Validators.required, noInvalidPipelineName()]],
      ETA:['', Validators.required,],
      freightForwarder: ['', [Validators.required, noInvalidPipelineName()]],
      actualFreight: ['', Validators.required,],
      purchaseOrders:['', Validators.required],
    });

  }

  get f() { return this.groupMasterForm1.controls }


  ngOnInit(): void {
    this.getTableData(true);
    this.getTransportModeMaster()
    this.getPurchaseOrder()

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months start at 0!
    const dd = String(today.getDate()).padStart(2, '0');
    this.minDate = `${yyyy}-${mm}-${dd}`;
  
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  

  openCalendar(event: any) {
    event.target.showPicker();
  }

  blockTyping(event: KeyboardEvent) {
    event.preventDefault();
  }

  allowOnlyNumbers(event: KeyboardEvent) {
    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];
    if (allowedKeys.includes(event.key)) return;
  
    const input = (event.target as HTMLInputElement).value;
    const key = event.key;
  
    if (!/^\d*\.?\d*$/.test(input + key)) {
      event.preventDefault();
    }
  }
  
  onPasteNumbers(event: ClipboardEvent) {
    const pastedData = event.clipboardData?.getData('text') || '';
    // Allow only digits and a single dot
    if (!/^\d*\.?\d*$/.test(pastedData)) {
      event.preventDefault();
    }
  }
  

  formatNumber(controlName: string) {
    let value = this.groupMasterForm1.get(controlName)?.value;
    if (value) {
      // Remove any accidental commas
      value = value.replace(/,/g, '');
      this.groupMasterForm1.get(controlName)?.setValue(value);
    }
  }
  
  

  getTransportModeMaster() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
    this.userService.getQuestionPaper(`uspGetTransportModeMaster`).subscribe((res: any) => {
      this.transportModeDrp = res['table'];
    })

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  getPurchaseOrder() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
    this.userService.getQuestionPaper(`uspGetPurchaseOrder`).subscribe((res: any) => {
      this.purchaseOrder = res['table'];
    })

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  getCityDrp() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
    this.userService.getQuestionPaper(`uspGetCityList|action=IntExt`).subscribe((res: any) => {
      this.cityDrp = res['table'];
    })

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  getTableData(isTrue: boolean) {
    try {
      if (isTrue) {
        this.isLoading = true;
      }
      else {
        this.pageNo = 1;
      }
      const userId = sessionStorage.getItem('userId') || '';
      const query = `appUserId=${userId}|appUserRole=${JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId}|districtId=${sessionStorage.getItem('District') || ''}|searchText=${this.searchText}|pageIndex=${this.pageNo}|size=${this.pageSize}`;
      this.userService.getQuestionPaper(`uspGetEximShipment|${query}`).subscribe({
        next: (res: any) => {
          console.log("uspGetEximShipment=======", res);
          try {
            setTimeout(() => {
              this.data = res?.table1 || [];
              this.totalCount = res?.table?.[0]?.totalCnt || this.data.length;
              this.cdr.detectChanges();
            }, 0);
          }
          catch (innerErr) {
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

    }
    catch (error) {
      console.error('Unexpected error in getTableData():', error);
      this.isLoading = false;
    }
  }


  showDialog(view: string, data: any) {
    if (view == 'add') {
      this.visible = true;
      this.postType = view;
      this.header = view === 'add' ? 'Add' : (view === 'update' ? 'Update' : 'View');
      this.headerIcon = view === 'add' ? 'pi pi-plus' : (view === 'update' ? 'pi pi-pencil' : 'pi pi-eye');
    }
    else {
      this.visible = true;
      this.postType = view;
      this.header = view === 'add' ? 'Add' : (view === 'update' ? 'Update' : 'View');
      this.headerIcon = view === 'add' ? 'pi pi-plus' : (view === 'update' ? 'pi pi-pencil' : 'pi pi-eye');

      this.selectedIndex = data;
      if (view === 'view') {
        this.groupMasterForm1.disable();
      }
      else {
        this.groupMasterForm1.enable();
        this.groupMasterForm1.get('groupType')?.disable();
      }
      this.groupMasterForm1.patchValue({
        transportMode: data.transportId || '',
        blNumber: data.blAwbNumber || '',
        vesselName: data.vesselFlightName || '',
        container: data.container || '',
        ETA: data.expectedArrivalTime || '',
        freightForwarder: data.freightForwarder || '',
        actualFreight: data.actualFrieght || '',
        purchaseOrders: data.purchaseOrderId || '',

      });

    }
    document.body.style.overflow = 'hidden'
  }

  
  onDrawerHide() {
    document.body.style.overflow = 'visible'; // restore scroll
    this.groupMasterForm1.enable();
    this.groupMasterForm1.reset();
    this.visible = false;
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
    this.pageNo = 1; // reset to first page
    this.getTableData(true); // fetch data from API again
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
        }
        else if (option === '2') {
          this.deleteData();
        }
        else if (option === '4') {
        }
        else if (option === '5') {
          this.groupMasterForm1.reset()
        }
      },
    });
  }

  onClear() {
    this.groupMasterForm1.reset()
  }


  onSubmit(event: any) {
    if (!this.groupMasterForm1.valid) {
      this.groupMasterForm1.markAllAsTouched();
      return;
    }

    let transportMode = this.groupMasterForm1.get('transportMode')?.value;
    let purchaseOrders = this.groupMasterForm1.get('purchaseOrders')?.value;
    const blNumber = String(this.groupMasterForm1.get('blNumber')?.value || '').trim();
    const vesselName = String(this.groupMasterForm1.get('vesselName')?.value || '').trim();
    const container = String(this.groupMasterForm1.get('container')?.value || '').trim();
    const ETA = String(this.groupMasterForm1.get('ETA')?.value || '').trim();
    const freightForwarder = String(this.groupMasterForm1.get('freightForwarder')?.value || '').trim();
    const actualFreight = String(this.groupMasterForm1.get('actualFreight')?.value || '').trim();
    
    this.paramvaluedata = `purchaseOrderId=${purchaseOrders}|actualFrieght=${actualFreight}|transportModeId=${transportMode}|blAwbNumber=${blNumber}|VesselFlightName=${vesselName}|container=${container}|arrivalDate=${ETA}|FreightForwarder=${freightForwarder}`;
    this.openConfirmation('Confirm?', 'Are you sure you want to proceed?', '1', '1', event);
  }

  submitcall() {
    this.isFormLoading = true;
    let query = '';
    let SP = '';

    if (this.postType === 'update') {
      query = `${this.paramvaluedata}|Id=${this.selectedIndex.id}|userId=${sessionStorage.getItem('userId')}`;
      SP = `uspUpdateEximShipment`;
    }
    else {
      query = `${this.paramvaluedata}|userId=${sessionStorage.getItem('userId')}`;
      SP = `uspPostEximShipment`;
    }

    this.userService.SubmitPostTypeData(SP, query, 'header').subscribe((datacom: any) => {
      this.isFormLoading = false;
      if (!datacom) return;
      const resultarray = datacom.split("-");
      if (resultarray[1] === "success") {
        this.getTableData(false);
        this.message.add({
          severity: 'success',
          summary: 'Success',
          detail: this.postType === 'update' ? 'Data Updated Successfully.' : 'Data Saved Successfully.',
        });
        this.onDrawerHide();
      }
      else if (resultarray[0] == "2") {
        this.message.add({ severity: 'warn', summary: 'Warn', detail: resultarray[1] || datacom });
      }
      else {
        this.message.add({ severity: 'warn', summary: 'Warn', detail: datacom, });
      }
    });

  }

  deleteData() {
    let query = `id=${this.selectedIndex.id}|userId=${sessionStorage.getItem('userId')}`;
    this.userService.SubmitPostTypeData(`uspDeleteEximShipment`, query, 'header').subscribe((datacom: any) => {
      this.isFormLoading = false;
      if (!datacom) return;
      const resultarray = datacom.split("-");      
      if (resultarray[1] === "success") {
        this.getTableData(true);
        this.message.add({ severity: 'success', summary: 'Success', detail: 'Data deleted' });
        this.onDrawerHide();
      } 
      else {
        this.message.add({ severity: 'warn', summary: 'Warn', detail: resultarray[1] || datacom, });
      }
    });
  }


  showGrouplist(data: any) {
    this.itemDailog = true
    this.groupListArray = JSON.parse(data?.childDetails)
  }

}
