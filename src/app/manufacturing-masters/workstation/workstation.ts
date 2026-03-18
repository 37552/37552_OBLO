import { Component, ChangeDetectorRef } from '@angular/core';
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
import { Customvalidation,validTimeFormat, noInvalidPipelineName} from '../../shared/Validation';

@Component({
  selector: 'app-workstation',
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
    Dialog,
    DatePickerModule
  ],
  providers: [
    ConfirmationService,
    MessageService
  ],
  templateUrl: './workstation.html',
  styleUrl: './workstation.scss'
})

export class Workstation {
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
    { key: 'stationName', header: 'Workstation Name', isVisible: true, isSortable: false },
    { key: 'jobCapacity', header: 'Job Capacity', isVisible: true, isSortable: false },
    { key: 'workStation', header: 'Workstation Type', isVisible: true, isSortable: false },
    { key: 'wareHouse', header: 'Warehouse', isVisible: true, isSortable: false },
    { key: 'floorId', header: 'Plant Floor', isVisible: true, isSortable: false },
    { key: 'electricCostPerHour', header: 'Electricity Cost', isVisible: true, isSortable: false },
    { key: 'rentCostPerHour', header: 'Rent Cost', isVisible: true, isSortable: false },
    { key: 'consumableCostPerHour', header: 'Consumable Cost ', isVisible: true, isSortable: false },
    { key: 'wagesCostPerHour', header: 'Wages Cost  ', isVisible: true, isSortable: false },
    { key: 'statusId', header: 'Status ', isVisible: true, isSortable: false },
    { key: 'startTime', header: 'Start Time', isVisible: true, isSortable: false },
    { key: 'endTime', header: 'End Time', isVisible: true, isSortable: false },
    { key: 'totalWorkHour', header: 'Total Working Hours', isVisible: true, isSortable: false },
    { key: 'description', header: 'Description', isVisible: true, isSortable: false },
  ];


  pageNo = 1;
  pageSize = 5;
  searchText = '';
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  workStationDrp: any = []
  wareHouseDrp: any = []
  workStationStatusDrp: any = []
  plantFloorDrp: any = []

  selectedrowIndex: any
  itemDailog: boolean = false


  constructor(private fb: FormBuilder,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private message: MessageService,
    public Customvalidation: Customvalidation,
    private cdr: ChangeDetectorRef) {

    this.groupMasterForm1 = this.fb.group({
      workstationType: ['', Validators.required],
      warehouse: ['', Validators.required],
      plantFloor: ['', Validators.required],
      status: ['', Validators.required],
      electricityCost: ['',Validators.required],
      rentCost: ['', Validators.required],
      consumableCost: ['', Validators.required],
      wagesCost: ['', Validators.required],
      workstationName: ['', [Validators.required, noInvalidPipelineName()]],
      jobCapacity: ['', [Validators.required,noInvalidPipelineName()]],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      totalWorkingHours: ['', Validators.required],
      description: ['', [Validators.required,noInvalidPipelineName()]],
    });

  }

  get f() { return this.groupMasterForm1.controls }

  ngOnInit(): void {
    this.getTableData(true);
    this.getWorkStationMaster()
    this.getWorkStationStatus()
    this.getPlantFloorMaster()
    this.getWareHouseMaster()
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }


  getWorkStationMaster() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
    const currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
    const roleId = currentRole?.roleId || '';
    const userId = sessionStorage.getItem('userId') || '';
    const districtId = sessionStorage.getItem('District') || '';
    this.userService.getQuestionPaper(`uspGetWorkStationMaster|appUserId=${userId}|appUserRole=${roleId}|districtId=${districtId}`).subscribe((res: any) => {
      this.workStationDrp = res['table']      
    })

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  getWorkStationStatus() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
    const currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
    const roleId = currentRole?.roleId || '';
    const userId = sessionStorage.getItem('userId') || '';
    const districtId = sessionStorage.getItem('District') || '';
    this.userService.getQuestionPaper(`uspGetWorkStatusMaster|appUserId=${userId}|appUserRole=${roleId}|districtId=${districtId}`).subscribe((res: any) => {
      this.workStationStatusDrp = res['table']
    })

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  getWareHouseMaster() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);

    const currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
    const roleId = currentRole?.roleId || '';
    const userId = sessionStorage.getItem('userId') || '';
    const districtId = sessionStorage.getItem('District') || '';

    this.userService.getQuestionPaper(`uspGetWareHouseMaster|appUserId=${userId}|appUserRole=${roleId}|districtId=${districtId}`).subscribe((res: any) => {
      this.wareHouseDrp = res['table'];
    })

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  getPlantFloorMaster() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
    const currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
    const roleId = currentRole?.roleId || '';
    const userId = sessionStorage.getItem('userId') || '';
    const districtId = sessionStorage.getItem('District') || '';
    this.userService.getQuestionPaper(`uspGetPlantMaster|appUserId=${userId}|appUserRole=${roleId}|districtId=${districtId}`).subscribe((res: any) => {
      this.plantFloorDrp = res['table']
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
      const currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
      const roleId = currentRole?.roleId || '';
      const districtId = sessionStorage.getItem('District') || '';

      const query = `appUserId=${userId}|appUserRole=${roleId}|districtId=${districtId}|searchText=${this.searchText}|pageIndex=${this.pageNo}|size=${this.pageSize}`;
      this.userService.getQuestionPaper(`uspGetWorkStationDetails|${query}`).subscribe({
        next: (res: any) => {
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
      // this.data = [];
      // this.totalCount = 0;
      // sessionStorage.clear();
      // localStorage.clear();
      // this.router.navigate(['/login']);
    }
  }


  allowFloat(event: KeyboardEvent) {
    const input = (event.target as HTMLInputElement).value;
    const char = String.fromCharCode(event.which ? event.which : event.keyCode);

    // 1️⃣ Allow only numbers and single dot
    if (!/[0-9.]/.test(char)) {
      event.preventDefault();
      return;
    }

    // 2️⃣ Allow only one dot
    if (char === '.' && input.includes('.')) {
      event.preventDefault();
      return;
    }

    // 3️⃣ Allow only 2 digits after dot
    const parts = input.split('.');
    if (parts.length === 2 && parts[1].length >= 2) {
      event.preventDefault();
    }
  }


  allowTimeInput(event: KeyboardEvent) {
    const char = String.fromCharCode(event.which ? event.which : event.keyCode);

    // Allow only numbers, colon, space, A, M, P
    if (!/[0-9:AMPamp\s]/.test(char)) {
      event.preventDefault();
    }

    // Optional: Prevent multiple spaces
    const input = (event.target as HTMLInputElement).value;
    if (char === ' ' && input.includes(' ')) {
      event.preventDefault();
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
    }
     else {
      if (view === 'view') {
        this.groupMasterForm1.disable();
      } 
      else {
        this.groupMasterForm1.enable();
      }
  
      this.groupMasterForm1.patchValue({
        workstationName: data.stationName,
        jobCapacity: data.jobCapacity,
        workstationType: data.workStationTypeId,
        warehouse: data.warehouseId,
        plantFloor: data.floorId,
        electricityCost: data.electricCostPerHour,
        rentCost: data.rentCostPerHour,
        consumableCost: data.consumableCostPerHour,
        wagesCost: data.wagesCostPerHour,
        status: data.statusId,
        startTime:data.startTime,   // ✅ optional: ensure hh:mm AM/PM format
        endTime:data.endTime,       // ✅ optional
        totalWorkingHours: data.totalWorkHour,        // ✅ matches formControlName exactly
        description: data.description
      });
    }
  
    document.body.style.overflow = 'hidden'; // prevent background scroll
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


  onDrawerHide() {
    document.body.style.overflow = 'visible'; // restore scroll
    this.groupMasterForm1.enable()
    this.groupMasterForm1.reset()
    this.groupMasterForm1.patchValue({
      workstationName: '',
      jobCapacity: '',
      workstationType: '',
      warehouse: '',
      plantFloor: '',
      electricityCost: '',
      rentCost: '',
      wagesCost: '',
      consumableCost: '',
      status: '',
      startTime: '',
      endTime: '',
      totalWorkingHours: '',
      description: '',
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
        }
        else if (option === '2') {
          this.deleteData();
        }
        else if (option === '4') {
          // this.childArrData = []
        }
        else if (option === '5') {
          this.groupMasterForm1.reset()
        }
      },
    });
  }


  onClear() {
    this.groupMasterForm1.reset();
  }


  private formatTime(value: any): string {
    if (!value) return '';
  
    const date = new Date(value);
    const hh = date.getHours().toString().padStart(2, '0');
    const mm = date.getMinutes().toString().padStart(2, '0');
  
    return `${hh}:${mm}`;
  }
  


  onSubmit(event: any) {
    if (!this.groupMasterForm1.valid) {
      this.groupMasterForm1.markAllAsTouched();
      return;
    }
  
    const getTrimmed = (controlName: string): string => {
      const val = this.groupMasterForm1.get(controlName)?.value;
      return val !== null && val !== undefined ? String(val).trim() : '';
    };
  
    const getValue = (controlName: string): any =>this.groupMasterForm1.get(controlName)?.value || 0;
    const workstationType = getValue('workstationType');
    const warehouse = getValue('warehouse');
    const status = getValue('status');
    const plantFloor = getValue('plantFloor');
    const workstationName = getTrimmed('workstationName');
    const jobCapacity = getTrimmed('jobCapacity');
    const electricityCost = getTrimmed('electricityCost');
    const rentCost = getTrimmed('rentCost');
    const consumableCost = getTrimmed('consumableCost');
    const wagesCost = getTrimmed('wagesCost');
    // const startTime = getTrimmed('startTime');
    // const endTime = getTrimmed('endTime');
    const TotalWorkingHours = getTrimmed('totalWorkingHours');
    const description = getTrimmed('description');
  
    const startTime = this.formatTime(
      this.groupMasterForm1.get('startTime')?.value
    );
    
    const endTime = this.formatTime(
      this.groupMasterForm1.get('endTime')?.value
    );

    this.paramvaluedata = 
      `StationName=${workstationName}|` +
      `jobCapacity=${jobCapacity}|` +
      `workStationTypeId=${workstationType}|` +
      `wareHouseId=${warehouse}|` +
      `floorId=${plantFloor}|` +
      `electricCost=${electricityCost}|` +
      `rentCost=${rentCost}|` +
      `consumableCost=${consumableCost}|` +
      `wagesCost=${wagesCost}|` +
      `statusId=${status}|` +
      `startTime=${startTime}|` +
      `endTime=${endTime}|` +
      `totWork=${TotalWorkingHours}|` +
      `description=${description}`;
    this.openConfirmation('Confirm?', 'Are you sure you want to proceed?', '1', '1', event);
  }
  

  submitcall() {
    try {
      this.isFormLoading = true;
      let query = '';
      let SP = '';
      const districtId = sessionStorage.getItem('District') || '';
      const roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;

      if (this.postType === 'update') {
        query = `${this.paramvaluedata}|action=update|id=${this.selectedIndex.id}|appUserId=${sessionStorage.getItem('userId')}`;
        SP = `uspUpdateDeleteStationDetails`;
      }
      else {
        query = `${this.paramvaluedata}|appUserId=${sessionStorage.getItem('userId')}|distictId=${districtId}|appUserRole=${roleID}`;
        SP = `uspPostWorkStationDetails`;
      }
      this.userService.SubmitPostTypeData(SP, query, 'header').subscribe({
        next: (datacom: any) => {
          this.isFormLoading = false;
          try {
            if (!datacom) return;
            const resultarray = datacom.split('-');
            if (resultarray[1] === 'success') {
              this.getTableData(false);
              this.message.add({
                severity: 'success',
                summary: 'Success',
                detail: this.postType === 'update' ? 'Data Updated Successfully.' : 'Data Saved Successfully.',
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
            console.warn('Unauthorized or Forbidden - redirecting to login...');
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
              detail: 'Something went wrong.',
              life: 3000
            });
          }
        }
      });

    } catch (error) {
      console.error('Unexpected error in submitcall():', error);
      this.isFormLoading = false;
      this.message.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Something went wrong',
        life: 3000
      });
      // sessionStorage.clear();
      // localStorage.clear();
      // this.router.navigate(['/login']);
    }
  }


  deleteData() {
    try {
      this.isFormLoading = true;
      let query  = `StationName=''|jobCapacity=''|workStationTypeId=0|wareHouseId=0|floorId=0|electricCost=0|rentCost=0|consumableCost=0|wagesCost=0|statusId=0|startTime=09:55pm|endTime=09:55pm|totWork=0|description=''|action=delete|id=${this.selectedIndex.id}|appUserId=${sessionStorage.getItem('userId')}`
      this.userService.SubmitPostTypeData(`uspUpdateDeleteStationDetails`, query, 'header').subscribe({
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
      // this.message.add({
      //   severity: 'error',
      //   summary: 'Error',
      //   detail: 'Unexpected error occurred. Please log in again.',
      //   life: 3000
      // });
      // sessionStorage.clear();
      // localStorage.clear();
      // this.router.navigate(['/login']);
    }
  }


  onDeleteRow(data: any, index: number) {
    this.selectedrowIndex = index
    this.openConfirmation("Confirm", "Are you sure want to delete?", '1', '5');
  }


  showGrouplist(data: any) {
    this.itemDailog = true;
    try {
      const custArray = JSON.parse(data?.customerDetails || '[]');
      this.groupListArray = custArray.flatMap((c: any) => c.ct.map((x: any) => ({
        CustomerId: x.CustomerId,
        CustomerValue: x.CustomerValue
      })));
    } catch (e) {
      console.error('Error parsing customerDetails', e);
      this.groupListArray = [];
    }
  }

}
