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
import { Customvalidation, nonMandatoryFieldValidation } from '../../shared/Validation';


@Component({
  selector: 'app-sales-target',
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
  templateUrl: './sales-target.html',
  styleUrl: './sales-target.scss'
})

export class SalesTarget {
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
    { key: 'salesExecutive', header: 'Sales Executive', isVisible: true, isSortable: false },
    { key: 'targetFor', header: 'Target For', isVisible: true, isSortable: false },
    { key: 'year', header: 'Target Year', isVisible: true, isSortable: false },
    { key: 'metricPeriod', header: 'Metric Period', isVisible: true, isSortable: false },
    { key: 'yearAnnualRevTarget', header: 'Yearly Annual Revenue Target', isVisible: true, isSortable: false },
    { key: 'yearAnnualRevAcheive', header: 'Yearly Annual Revenue Achievement', isVisible: true, isSortable: false },
    { key: 'yearRevVariance', header: 'Yearly Revenue Variance', isVisible: true, isSortable: false },
    { key: 'description', header: 'Remarks', isVisible: true, isSortable: false },
  ];


  pageNo = 1;
  pageSize = 5;
  searchText = '';
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  salesExecutiveDrp: any = []
  targetForDrp: any = []
  yearMasterDrp: any = []
  salesMetricDrp: any = []

  previousGroupType: any;
  selectedrowIndex: any
  itemDailog: boolean = false


  constructor(private fb: FormBuilder,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private message: MessageService,
    public Customvalidation: Customvalidation,
    private cdr: ChangeDetectorRef) {

    this.groupMasterForm1 = this.fb.group({
      salesexecutive: ['', Validators.required],
      targetfor: ['', Validators.required],
      targetyear: ['', Validators.required],
      metricperiod: ['', Validators.required],
      yearlyannualrevenueTarget: ['', Validators.required],
      yearlyannualrevenueAchievement: ['', Validators.required],
      yearlyrevenueVariance: ['', Validators.required],
      Remarks: ['', [nonMandatoryFieldValidation()]]
    });

  }

  get f() { return this.groupMasterForm1.controls }

  ngOnInit(): void {
    this.getTableData(true);
    this.getSalesExecutive();
    this.getTargetForMaster();
    this.getYearMaster();
    this.getSalesMetricMaster();
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }


  getSalesExecutive() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
    const query = `userID=${sessionStorage.getItem('userId')}`;
    this.userService.getQuestionPaper(`uspGetSalesExecutiveDet|${query}`).subscribe((res: any) => {
      this.salesExecutiveDrp = res['table']
    })

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }


  getTargetForMaster() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
    this.userService.getQuestionPaper(`uspGetSalesTargetForMaster`).subscribe((res: any) => {
      this.targetForDrp = res['table']
    })

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }


  getYearMaster() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
    this.userService.getQuestionPaper(`uspGetYearMaster`).subscribe((res: any) => {
      this.yearMasterDrp = res['table']      
    })

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  getSalesMetricMaster() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
    this.userService.getQuestionPaper(`uspGetSalesMetricMaster`).subscribe((res: any) => {
      this.salesMetricDrp = res['table']
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
      const query = `userID=${sessionStorage.getItem('userId')}|searchText=${this.searchText}|pageIndex=${this.pageNo}|size=${this.pageSize}`;
      this.userService.getQuestionPaper(`uspGETSalesTargetDetails|${query}`).subscribe({
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
          console.error('API call failed:=====', err);
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
        Remarks: data.description || '',
        yearlyannualrevenueTarget: data.yearAnnualRevTarget || '',
        yearlyannualrevenueAchievement: data.yearAnnualRevAcheive || '',
        yearlyrevenueVariance: data.yearRevVariance || '',

        salesexecutive: data?.executiveId ? data?.executiveId  : '',
        targetfor: data?.targetId  ? data?.targetId  : '',
        targetyear: data?.yearId  ? data?.yearId  : '',
        metricperiod: data?.metricPeriodId  ? data?.metricPeriodId  : '',

      });
    }

    document.body.style.overflow = 'hidden'; // prevent background scroll
  }


  validateNumberInput(event: any, action: string) {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    value = value.replace(/[^0-9.]/g, '');

    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts[1];
    }

    if (value.startsWith('.')) {
      value = value.substring(1);
    }

    if (parts.length === 2 && parts[1].length > 2) {
      value = parts[0] + '.' + parts[1].substring(0, 2);
    }

    input.value = value;
    if (action == '1') {
      this.groupMasterForm1.get('yearlyannualrevenueTarget')?.setValue(value);
    }
    else if (action == '2') {
      this.groupMasterForm1.get('yearlyannualrevenueAchievement')?.setValue(value);
    }
    else {
      this.groupMasterForm1.get('yearlyrevenueVariance')?.setValue(value);
    }
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
      salesexecutive: '',
      targetfor: '',
      targetyear: '',
      metricperiod: '',
      yearlyannualrevenueTarget: '',
      yearlyannualrevenueAchievement: '',
      yearlyrevenueVariance: '',
      Remarks: '',
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
      reject: () => {
        if (option === '4') {
          this.groupMasterForm1.patchValue({
            groupType: this.previousGroupType
          })
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

    const salesexecutive = this.groupMasterForm1.get('salesexecutive')?.value || 0;
    const targetfor = this.groupMasterForm1.get('targetfor')?.value || 0;
    const targetyear = this.groupMasterForm1.get('targetyear')?.value || 0;
    const metricperiod = this.groupMasterForm1.get('metricperiod')?.value || 0;

    const yearlyannualrevenueTarget = String(this.groupMasterForm1.get('yearlyannualrevenueTarget')?.value || '').trim();
    const yearlyannualrevenueAchievement = String(this.groupMasterForm1.get('yearlyannualrevenueAchievement')?.value || '').trim();
    const yearlyrevenueVariance = String(this.groupMasterForm1.get('yearlyrevenueVariance')?.value || '').trim();

    let Remarks = this.groupMasterForm1.get('Remarks')?.value;
    Remarks = Remarks && String(Remarks).trim() !== '' ? String(Remarks).trim() : '';

    this.paramvaluedata = `description=${Remarks}|salesExecutiveId=${salesexecutive}|targetForId=${targetfor}|targetYearId=${targetyear}|metricPeriodId=${metricperiod}|RevAcheive=${yearlyannualrevenueAchievement}|RevTarget=${yearlyannualrevenueTarget}|RevVariance=${yearlyrevenueVariance}`;
    this.openConfirmation('Confirm?', 'Are you sure you want to proceed?', '1', '1', event);
  }


  submitcall() {
    try {
      this.isFormLoading = true;
      let query = '';
      let SP = '';

      if (this.postType === 'update') {
        query = `${this.paramvaluedata}|action=update|salesTargetId=${this.selectedIndex.id}|userId=${sessionStorage.getItem('userId')}`;
        SP = `uspUpdateDeleteSalesTargetDetails`;
      }
      else {
        query = `${this.paramvaluedata}|userId=${sessionStorage.getItem('userId')}`;
        SP = `uspPostSalesTargetDetails`;
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
      let query = `action=Delete|salesTargetId=${this.selectedIndex.id}|description=''|salesExecutiveId=0|targetForId=0|targetYearId=0|metricPeriodId=0|RevAcheive=0|RevTarget=0|RevVariance=0|userId=${sessionStorage.getItem('userId')}`;    
      this.userService.SubmitPostTypeData(`uspUpdateDeleteSalesTargetDetails`, query, 'header').subscribe({
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
