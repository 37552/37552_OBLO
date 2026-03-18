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
import { Customvalidation, noInvalidPipelineName, requiredCheckboxValue, validTimeFormat } from '../../shared/Validation';



@Component({
  selector: 'app-routing-master',
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
  templateUrl: './routing-master.html',
  styleUrl: './routing-master.scss'
})

export class RoutingMaster {
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
  childArrData: any[] = [];

  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true, },
    { key: 'routingName', header: 'Routing Name', isVisible: true, isSortable: false },
    { key: 'operatingCost', header: 'Operating Cost', isVisible: true, isSortable: false },
    { key: 'jsonDetails', header: 'Routing Operations', isVisible: true, isSortable: false, isCustom: true },
  ];

  pageNo = 1;
  pageSize = 5;
  searchText = '';
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  selectedrowIndex: any
  itemDailog: boolean = false
  routingMasterDrp: any = []


  constructor(private fb: FormBuilder,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private message: MessageService,
    public Customvalidation: Customvalidation,
    private cdr: ChangeDetectorRef) {

    this.groupMasterForm1 = this.fb.group({
      routingname: ['', [Validators.required, noInvalidPipelineName()]],
      operatingCost: ['', Validators.required],
      routingoperations: ['', Validators.required],
    });

  }

  get f() { return this.groupMasterForm1.controls }

  ngOnInit(): void {
    this.getTableData(true);
    this.getOperationMaster()
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }


  getOperationMaster() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
    this.userService.getQuestionPaper(`uspGetOperationMaster`).subscribe((res: any) => {
      this.routingMasterDrp = res['table']
    })

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
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
      this.userService.getQuestionPaper(`uspGetRoutingDetails|${query}`).subscribe({
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
    this.header =
      view === 'add' ? 'Add' : view === 'update' ? 'Update' : 'View';
    this.headerIcon =
      view === 'add'
        ? 'pi pi-plus'
        : view === 'update'
          ? 'pi pi-pencil'
          : 'pi pi-eye';

    if (view === 'add') {
      this.groupMasterForm1.reset();
      this.groupMasterForm1.enable();
      this.childArrData = [];
    } else {
      // Enable or disable form based on view
      if (view === 'view') {
        this.groupMasterForm1.disable();
      } else {
        this.groupMasterForm1.enable();
      }

      let customerTypes: any[] = [];

      try {
        const parsed = JSON.parse(data?.routingOperations || '[]');

        parsed.forEach((item: any) => {
          // Case 1: Nested ct array exists
          if (item.ct && Array.isArray(item.ct)) {
            item.ct.forEach((ctItem: any) => {
              customerTypes.push({
                drpOption: ctItem.OperationName,
                drpValue: ctItem.OperationId,
              });
            });
          } else {
            // Case 2: Direct array of operations
            customerTypes.push({
              drpOption: item.OperationName,
              drpValue: item.OperationId,
            });
          }
        });
      } catch (e) {
        console.error('Error parsing customerDetails', e);
      }

      this.groupMasterForm1.patchValue({
        routingname: data.routingName || '',
        operatingCost: data.operatingCost || '',
        routingoperations: customerTypes,
      });

      this.childArrData = customerTypes;
    }

    // Prevent background scroll
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
      routingname: '',
      operatingCost: '',
      routingoperations: [],
    });
    this.childArrData = []
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


  onSubmit(event: any) {
    if (!this.groupMasterForm1.valid) {
      this.groupMasterForm1.markAllAsTouched();
      return;
    }

    const routingnameCtrl = this.groupMasterForm1.get('routingname')?.value;
    const routingoperations = this.groupMasterForm1.get('routingoperations')?.value ?? [];
    const routingname = typeof routingnameCtrl === 'string' ? routingnameCtrl.trim() : '';
    const operatingcostCtrl = this.groupMasterForm1.get('operatingCost')?.value;
    const operatingcost = typeof operatingcostCtrl === 'string'? operatingcostCtrl.trim(): operatingcostCtrl ?? '';
    
    if (routingoperations.length === 0) {
      this.message.add({
        severity: 'warn',
        summary: 'Warn',
        detail: 'Select at least one Customer Type'
      });
      return;
    }

    const verticalCust = routingoperations.map((c: any) => ({
      routingId: c.drpValue
    }));

    const verticalCustStr = JSON.stringify(verticalCust);
    this.paramvaluedata = `routingName=${routingname}|routingOperations=${verticalCustStr}|cost=${operatingcost}`;
    this.openConfirmation('Confirm?', 'Are you sure you want to proceed?', '1', '1', event);
  }


  submitcall() {
    try {
      this.isFormLoading = true;
      let query = '';
      let SP = '';
      const districtId = sessionStorage.getItem('District') || '';

      if (this.postType === 'update') {
        query = `${this.paramvaluedata}|action=update|Id=${this.selectedIndex.id}|appUserId=${sessionStorage.getItem('userId')}`;
        SP = `uspupdateDeleteRoutingDetails`;
      }
      else {
        query = `${this.paramvaluedata}|appUserId=${sessionStorage.getItem('userId')}|distictId=${districtId}`;
        SP = `uspPostRoutingDetails`;
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
      let query = `action=delete|id=${this.selectedIndex.id}|cost=0|routingOperations=''|routingName=''|appUserId=${sessionStorage.getItem('userId')}`;
      this.userService.SubmitPostTypeData(`uspupdateDeleteRoutingDetails`, query, 'header').subscribe({
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
      const custArray = JSON.parse(data?.routingOperations || '[]');
      this.groupListArray = custArray.map((c: any) => ({
        routingId: c.OperationId,
        routingvalue: c.OperationName
      }));
    } catch (e) {
      console.error('Error parsing customerDetails', e);
      this.groupListArray = [];
    }
  }


}
