import { Component, ViewChild, TemplateRef, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { UserService } from '../../shared/user-service';
import { Customvalidation } from '../../shared/Validation';
import { TableTemplate, TableColumn } from '../../table-template/table-template';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { Popover } from 'primeng/popover';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Toast } from 'primeng/toast';
import { ProgressSpinner } from 'primeng/progressspinner';
import { PaginatorModule } from 'primeng/paginator';
import { DrawerModule } from 'primeng/drawer';

@Component({
  selector: 'app-my-jobs',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    TableTemplate,
    DialogModule,
    ButtonModule,
    SelectModule,
    TableModule,
    InputTextModule,
    BreadcrumbModule,
    Popover,
    CheckboxModule,
    ConfirmDialog,
    Toast,
    ProgressSpinner,
    PaginatorModule,
    DrawerModule,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './my-jobs.html',
  styleUrl: './my-jobs.scss',
})
export class MyJobs {
  visible: boolean = false;
  assignEmployeeModalVisible: boolean = false;

  param: any;
  menulabel: string = '';
  formlable: string = '';
  percentVal: any = 0;
  FormName = '';
  FormValue = '';
  postType: string = 'add';
  isView = true;
  paramvaluedata: string = '';
  showDeleteBtn: boolean = false;
  showActiveBtn: boolean = false;
  header: string = '';
  headerIcon: string = 'pi pi-plus';
  isFormLoading: boolean = false;

  allViewTablePendingData: any = [];
  allViewTableCompletedData: any = [];
  data: any[] = [];

  paginationPendingCountData: any = [];
  paginationCompletedCountData: any = [];
  pageNoPendingData: any = [];
  pageNoCompletedData: any = [];

  pendingPageNo: number = 1;
  pendingSearchText: string = '';
  pendingPageSize: number = 10;

  completedPageNo: number = 1;
  completedSearchText: string = '';
  completedPageSize: number = 10;

  pageNo: number = 1;
  pageSize: number = 10;
  searchText: string = '';
  totalCount: number = 0;
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  name: any;
  selectedItem: any = null;
  tablePendingHeaders: any[] = [];
  tableCompletedHeaders: any[] = [];
  selectedTab: string = 'pending';
  partsTableArray: any = [];

  selectedMachineData: any = [];
  showMachineModal: boolean = false;
  selectedAsset: any;
  faultForm!: FormGroup;
  maintenanceForm!: FormGroup;
  employeeDrpData: any;

  typeData: any[] = [];
  categoryData: any[] = [];
  faultData: any[] = [];
  partsData: any[] = [];
  faultTableArray: any = [];

  isLoading: boolean = false;

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
    {
      label: 'Home',
      title: 'Service Engineer Dashboard',
      routerLink: '/service-engineer-dashboard',
    },
    { label: 'My Jobs', title: 'My Jobs', routerLink: '/my-jobs' },
  ];

  constructor(
    public Customvalidation: Customvalidation,
    private userService: UserService,
    public zone: NgZone,
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private message: MessageService,
    private cdr: ChangeDetectorRef
  ) {
    this.faultForm = this.fb.group({
      readings: ['', Validators.required],
      typeId: ['', Validators.required],
      categoryId: ['', Validators.required],
      faultId: ['', Validators.required],
      faultDesc: ['', Validators.required],
      comments: ['', Validators.required],
    });
    this.maintenanceForm = this.fb.group({
      parts: ['', Validators.required],
      others: [''], // Not required by default, only required when "Others" is selected
      qty: ['', Validators.required],
      desc: ['', Validators.required],
    });
  }
  showOthers: boolean = false;

  get f() {
    return this.faultForm.controls;
  }
  get f1() {
    return this.maintenanceForm.controls;
  }

  ngOnInit(): void {
    this.param = sessionStorage.getItem('menuItem');
    if (this.param) {
      let paramjs = JSON.parse(this.param);
      this.FormName = paramjs.formName || 'My Jobs';
      this.FormValue = paramjs.formValue || '';
      this.menulabel = paramjs.menu || 'My Jobs';
    } else {
      this.FormName = 'My Jobs';
      this.menulabel = 'My Jobs';
    }
    this.getPendingData(true);
    this.getTypeData();
    this.getPartsData();
  }

  handleTabClick(action: string) {
    this.selectedTab = action;
    this.pageNo = 1;
    this.searchText = '';

    if (action === 'pending') {
      this.pendingPageNo = 1;
      this.pendingSearchText = '';
      this.getPendingData(true);
    } else if (action === 'completed') {
      this.completedPageNo = 1;
      this.completedSearchText = '';
      this.getCompletedData(true);
    }
  }

  getPendingData(isTrue: boolean) {
    try {
      if (isTrue) {
        this.isLoading = true;
      } else {
        this.pendingPageNo = 1;
        this.pageNo = 1;
      }
      let query = `action=JOBS|appUserId=${sessionStorage.getItem('userId')}|searchText=${
        this.searchText
      }|pageIndex=${Number(this.pageNo)}|size=${Number(this.pageSize)}`;
      this.userService.getQuestionPaper(`uspGetEngineersJobData|${query}`).subscribe(
        (res: any) => {
          setTimeout(() => {
            this.isLoading = false;
            this.cdr.markForCheck();
          }, 1000);
          const tableData = res['table1'] || [];
          this.allViewTablePendingData =
            this.selectedTab === 'pending' ? tableData : this.allViewTablePendingData;
          this.data = tableData.map((item: any, index: number) => ({
            ...item,
            rowNo: (this.pageNo - 1) * this.pageSize + index + 1,
          }));
          this.paginationPendingCountData = res['table'] || [];
          this.pageNoPendingData = res['table2'] || [];
          this.totalCount = res['table']?.[0]['totalCnt'] || 0;
          if (tableData.length > 0) {
            this.tablePendingHeaders = Object.keys(tableData[0]);
            if (!this.allColumns.length) {
              this.initializeColumns();
            }
          }
        },
        (err: HttpErrorResponse) => {
          this.isLoading = false;
          if (err.status == 403) {
            this.Customvalidation.loginroute(err.status);
          }
        }
      );
    } catch (error) {
      this.isLoading = false;
    }
  }

  getCompletedData(isTrue: boolean) {
    try {
      if (isTrue) {
        this.isLoading = true;
      } else {
        this.completedPageNo = 1;
        this.pageNo = 1;
      }
      let query = `action=COMPLETEDJOBS|appUserId=${sessionStorage.getItem('userId')}|searchText=${
        this.completedSearchText
      }|pageIndex=${Number(this.completedPageNo)}|size=${Number(this.completedPageSize)}`;
      this.userService.getQuestionPaper(`uspGetEngineersJobData|${query}`).subscribe(
        (res: any) => {
          setTimeout(() => {
            this.isLoading = false;
            this.cdr.markForCheck();
          }, 1000);
          const tableData = res['table1'] || [];
          this.allViewTableCompletedData = tableData;
          this.data = tableData.map((item: any, index: number) => ({
            ...item,
            rowNo: (this.completedPageNo - 1) * this.completedPageSize + index + 1,
          }));
          this.paginationCompletedCountData = res['table'] || [];
          this.pageNoCompletedData = res['table2'] || [];
          this.totalCount = res['table']?.[0]['totalCnt'] || 0;
          if (tableData.length > 0) {
            this.tableCompletedHeaders = Object.keys(tableData[0]);
            if (!this.allColumns.length) {
              this.initializeColumns();
            }
          }
        },
        (err: HttpErrorResponse) => {
          this.isLoading = false;
          if (err.status == 403) {
            this.Customvalidation.loginroute(err.status);
          }
        }
      );
    } catch (error) {
      this.isLoading = false;
    }
  }

  getTypeData() {
    this.userService
      .getQuestionPaper(`uspGetEngineersJobsDrpData|action=TYPE|commonId=0`)
      .subscribe(
        (res: any) => {
          this.typeData = res['table'] || [];
          this.cdr.markForCheck();
        },
        (err: HttpErrorResponse) => {
          if (err.status == 403) {
            this.Customvalidation.loginroute(err.status);
          }
        }
      );
  }

  getCategoryData() {
    let typeId = this.faultForm.get('typeId')?.value;
    this.userService
      .getQuestionPaper(`uspGetEngineersJobsDrpData|action=CATEGORY|commonId=${typeId}`)
      .subscribe(
        (res: any) => {
          this.categoryData = res['table'] || [];
          this.cdr.markForCheck();
        },
        (err: HttpErrorResponse) => {
          if (err.status == 403) {
            this.Customvalidation.loginroute(err.status);
          }
        }
      );
  }

  getFaultData() {
    let categoryId = this.faultForm.get('categoryId')?.value;
    this.userService
      .getQuestionPaper(`uspGetEngineersJobsDrpData|action=FAULT|commonId=${categoryId}`)
      .subscribe(
        (res: any) => {
          this.faultData = res['table'] || [];
          this.cdr.markForCheck();
        },
        (err: HttpErrorResponse) => {
          if (err.status == 403) {
            this.Customvalidation.loginroute(err.status);
          }
        }
      );
  }

  getPartsData() {
    this.userService
      .getQuestionPaper(`uspGetEngineersJobsDrpData|action=PARTS|commonId=0`)
      .subscribe(
        (res: any) => {
          this.partsData = res['table'] || [];
          this.partsData.push({
            drpValue: 'Others',
            drpOption: 'Others',
          });
          this.cdr.markForCheck();
        },
        (err: HttpErrorResponse) => {
          if (err.status == 403) {
            this.Customvalidation.loginroute(err.status);
          }
        }
      );
  }

  formatKey(key: string): string {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
  }

  viewMachineDetails(row: any, type: string) {
    this.selectedMachineData = JSON.parse(row);
    this.showMachineModal = true;
    this.title = type;
  }

  closeMachineModal() {
    this.showMachineModal = false;
  }

  hiddenModalKeys = ['typeId', 'categoryId', 'faultId', 'partId'];
  title: any;
  getModalKeys(obj: any): string[] {
    if (!obj) return [];
    return Object.keys(obj).filter((key) => !this.hiddenModalKeys.includes(key));
  }

  showDialog(view: string, data: any = null) {
    this.visible = true;
    this.postType = view;
    this.selectedAsset = data;
    if (view === 'add') {
      this.header = 'Assign Ticket';
      this.headerIcon = 'pi pi-plus';
      this.selectedAsset = null;
    } else if (view === 'view') {
      this.header = 'View Ticket';
      this.headerIcon = 'pi pi-eye';
    }
    if (data) {
      this.selectedAsset = data;
    }
  }

  onDrawerHide() {
    this.visible = false;
    this.selectedAsset = null;
    this.maintenanceForm.reset();
    this.faultForm.reset();
    this.faultTableArray = [];
    this.partsTableArray = [];
    this.categoryData = [];
    this.faultData = [];
    this.showOthers = false;
  }

  showAssignEmployeeModal(item: any) {
    this.showDialog('add', item);
  }

  closeAssignEmployeeModal() {
    this.onDrawerHide();
  }
  OnSubmitModal() {
    // Check if arrays have items
    // if (this.partsTableArray.length === 0) {
    //   this.openAlertDialog('Alert!', 'Please add at least one part.');
    //   return;
    // }

    if (this.faultTableArray.length === 0) {
      this.openAlertDialog('Alert!', 'Please add at least one fault.');
      return;
    }

    // Ensure all items have checked property (default to true if undefined)
    this.partsTableArray.forEach((p: any) => {
      if (p.checked === undefined || p.checked === null) {
        p.checked = true;
      }
    });

    this.faultTableArray.forEach((f: any) => {
      if (f.checked === undefined || f.checked === null) {
        f.checked = true;
      }
    });

    // Filter only checked items
    const checkedParts = this.partsTableArray.filter((p: any) => p.checked === true);
    const checkedFaults = this.faultTableArray.filter((f: any) => f.checked === true);

    // if (checkedParts.length === 0) {
    //   this.openAlertDialog('Alert!', 'Please select at least one part.');
    //   return;
    // }

    if (checkedFaults.length === 0) {
      this.openAlertDialog('Alert!', 'Please select at least one fault.');
      return;
    }

    let partsJsonArr = checkedParts.map((p: any) => {
      let isOthers = p.partsId === 'Others';
      return {
        partsId: isOthers ? '' : p.partsId,
        partName: isOthers ? p.parts : p.parts,
        qty: p.qty,
        description: p.desc,
      };
    });

    // Remove checked property from fault objects before sending
    let faultJsonArr = checkedFaults.map((f: any) => {
      const { checked, ...faultData } = f;
      return faultData;
    });

    let partsJson = JSON.stringify(partsJsonArr);
    let faultJson = JSON.stringify(faultJsonArr);
    this.paramvaluedata = '';

    this.paramvaluedata = `ticketId=${this.selectedAsset.id}|faultJson=${faultJson}|partsJson=${partsJson}`;
    this.openConfirmDialog('Confirm?', 'Are you sure you want to proceed?', '1', '1');
  }

  openConfirmDialog(title: string, msg: string, id: any, option?: string) {
    this.confirmationService.confirm({
      message: msg,
      header: title,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Yes' },
      rejectButtonProps: { label: 'No', severity: 'secondary', outlined: true },
      accept: () => {
        if (option == '1') {
          this.submitcall();
        } else if (option == '2') {
        } else if (option == '3') {
        }
      },
    });
  }

  submitcall() {
    this.isLoading = true;
    let query = `${this.paramvaluedata}|appUserId=${sessionStorage.getItem('userId')}`;
    let SP = `uspPostServiceRequestClosure`;
    this.userService.SubmitPostTypeData(SP, query, this.FormName).subscribe(
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
              this.isLoading = false;
              this.clearData();
              this.cdr.markForCheck();
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
          this.cdr.markForCheck();
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
  clearData() {
    this.closeAssignEmployeeModal();
    this.getPendingData(true);
  }

  onAddRow() {
    const selectedPartsId = this.maintenanceForm.get('parts')?.value || '';
    const qty = this.maintenanceForm.get('qty')?.value || '';
    const desc = this.maintenanceForm.get('desc')?.value || '';
    const isOthers = selectedPartsId === 'Others';
    const othersValue = this.maintenanceForm.get('others')?.value || '';

    // Manual validation instead of form.invalid
    if (!selectedPartsId) {
      this.maintenanceForm.get('parts')?.setErrors({ required: true });
      this.maintenanceForm.markAllAsTouched();
      return;
    }

    if (!qty) {
      this.maintenanceForm.get('qty')?.setErrors({ required: true });
      this.maintenanceForm.markAllAsTouched();
      return;
    }

    if (!desc) {
      this.maintenanceForm.get('desc')?.setErrors({ required: true });
      this.maintenanceForm.markAllAsTouched();
      return;
    }

    if (isOthers && !othersValue.trim()) {
      this.maintenanceForm.get('others')?.setErrors({ required: true });
      this.maintenanceForm.markAllAsTouched();
      return;
    }

    // Get the part name - either from others field or from partsData
    let partsName = '';
    if (isOthers) {
      partsName = othersValue;
    } else {
      const selectedPart = this.partsData.find((p: any) => p.drpValue === selectedPartsId);
      partsName = selectedPart?.drpOption || selectedPartsId;
    }

    let obj = {
      partsId: selectedPartsId,
      parts: partsName || 'Unknown Part',
      qty: qty,
      desc: desc,
      checked: true, // Default to checked when added
    };

    if (this.partsTableArray.some((e: any) => e.partsId == obj.partsId)) {
      this.openAlertDialog('Alert!', 'Part already exists.');
      return;
    }

    // Create new array reference to trigger change detection
    this.partsTableArray = [...this.partsTableArray, obj];
    this.maintenanceForm.reset();
    this.showOthers = false;
    this.maintenanceForm.get('others')?.clearValidators();
    this.maintenanceForm.get('others')?.updateValueAndValidity();
    this.updateSelectAllPartsState();
    this.cdr.detectChanges();
  }

  onAddFaultRow() {
    if (this.faultForm.invalid) {
      this.faultForm.markAllAsTouched();
      return;
    }

    const typeId = this.faultForm.get('typeId')?.value;
    const faultId = this.faultForm.get('faultId')?.value;
    const categoryId = this.faultForm.get('categoryId')?.value;

    const typeOption = this.typeData.find((t: any) => t.drpValue === typeId);
    const faultOption = this.faultData.find((f: any) => f.drpValue === faultId);
    const categoryOption = this.categoryData.find((c: any) => c.drpValue === categoryId);

    let obj = {
      reading: this.faultForm.get('readings')?.value,
      comments: this.faultForm.get('comments')?.value,
      typeId: typeId,
      typeId_text: typeOption?.drpOption || '',
      faultId: faultId,
      faultId_text: faultOption?.drpOption || '',
      categoryId: categoryId,
      categoryId_text: categoryOption?.drpOption || '',
      faultDesc: this.faultForm.get('faultDesc')?.value,
      checked: true, // Default to checked when added
    };

    this.faultTableArray.push(obj);
    this.faultForm.reset();
    this.categoryData = [];
    this.faultData = [];
    this.updateSelectAllFaultsState();
  }

  openAlertDialog(title: string, msg: string) {
    const element = document.getElementById('navbar');
    if (element) {
      element.scrollIntoView();
    }
    this.confirmationService.confirm({
      message: msg,
      header: title,
      icon: 'pi pi-exclamation-triangle',
      acceptVisible: false,
      rejectVisible: false,
    });
  }

  onDeleteRow(index: number) {
    this.partsTableArray.splice(index, 1);
    this.updateSelectAllPartsState();
  }

  onDeleteFaultRow(index: number) {
    this.faultTableArray.splice(index, 1);
    this.updateSelectAllFaultsState();
  }

  togglePartCheckbox(index: number) {
    // Checkbox value is already updated via ngModelChange, just update select all state
    this.updateSelectAllPartsState();
  }

  toggleFaultCheckbox(index: number) {
    // Checkbox value is already updated via ngModelChange, just update select all state
    this.updateSelectAllFaultsState();
  }

  selectAllParts: boolean = false;
  selectAllFaults: boolean = false;

  toggleAllParts() {
    this.partsTableArray.forEach((item: any) => {
      item.checked = this.selectAllParts;
    });
  }

  toggleAllFaults() {
    this.faultTableArray.forEach((item: any) => {
      item.checked = this.selectAllFaults;
    });
  }

  updateSelectAllPartsState() {
    if (this.partsTableArray.length === 0) {
      this.selectAllParts = false;
      return;
    }
    this.selectAllParts = this.partsTableArray.every((item: any) => item.checked === true);
  }

  updateSelectAllFaultsState() {
    if (this.faultTableArray.length === 0) {
      this.selectAllFaults = false;
      return;
    }
    this.selectAllFaults = this.faultTableArray.every((item: any) => item.checked === true);
  }

  onPartChange(event: any) {
    const selectedValue = event.target.value;

    if (selectedValue == 'Others') {
      this.showOthers = true;
      this.maintenanceForm.get('others')?.setValidators([Validators.required]);
      this.maintenanceForm.patchValue({ others: '' });
    } else {
      this.showOthers = false;
      this.maintenanceForm.get('others')?.clearValidators();
      this.maintenanceForm.get('others')?.updateValueAndValidity();
      const selected = this.partsData.find((p) => p.drpValue == selectedValue);
      this.maintenanceForm.patchValue({ others: selected?.drpOption || '' });
    }
  }

  onPendingPaginationChange(page: number) {
    this.pendingPageNo = page;
    this.getPendingData(true);
  }

  onPendingPaginatorChange(event: any) {
    this.pendingPageNo = event.page + 1;
    this.pendingPageSize = event.rows.toString();
    this.getPendingData(true);
  }

  onPendingSearchClick() {
    this.pendingPageNo = 1;
    this.getPendingData(false);
  }

  onPendingPagesizeChange() {
    this.pendingPageNo = 1;
    this.getPendingData(true);
  }

  onCompletedPaginationChange(page: number) {
    this.completedPageNo = page;
    this.getCompletedData(true);
  }

  onCompletedPaginatorChange(event: any) {
    this.completedPageNo = event.page + 1;
    this.completedPageSize = event.rows.toString();
    this.getCompletedData(true);
  }

  onCompletedSearchClick() {
    this.completedPageNo = 1;
    this.getCompletedData(false);
  }

  onCompletedPagesizeChange() {
    this.completedPageNo = 1;
    this.getCompletedData(true);
  }

  initializeColumns() {
    const headers =
      this.selectedTab === 'pending' ? this.tablePendingHeaders : this.tableCompletedHeaders;
    if (!headers || headers.length === 0) return;

    const dynamicColumns: TableColumn[] = headers
      .filter((key: string) => key !== 'rowNo' && key !== 'id' && key !== 'assetDetails')
      .map((key: string) => ({
        key: key,
        header: this.formatKey(key),
        isVisible: true,
        isSortable: false,
      }));

    this.allColumns = [...this.columns, ...dynamicColumns];
    this.availableColumns = [...dynamicColumns];
    this.importantColumns = this.columns.filter(
      (col) => col.key === 'rowNo' || col.key === 'actions'
    );
    this.requiredColumnKeys = new Set(this.importantColumns.map((col) => col.key));
    this.updateVisibleColumns();
  }

  updateVisibleColumns() {
    this.columns = this.allColumns.filter((col) => col.isVisible);
  }

  toggleColumnVisibility(col: TableColumn) {
    col.isVisible = !col.isVisible;
    this.updateVisibleColumns();
    this.updateSelectAllState();
  }

  getSelectedColumnsCount(): number {
    return this.availableColumns.filter((col) => col.isVisible).length;
  }

  toggleSelectAll() {
    // Use the current selectAllChecked value (already updated by ngModel)
    this.availableColumns.forEach((col) => {
      if (!this.requiredColumnKeys.has(col.key)) {
        col.isVisible = this.selectAllChecked;
      }
    });
    this.updateVisibleColumns();
  }

  updateSelectAllState() {
    // Check if all non-required columns are visible
    const nonRequiredColumns = this.availableColumns.filter(
      (col) => !this.requiredColumnKeys.has(col.key)
    );
    this.selectAllChecked =
      nonRequiredColumns.length > 0 && nonRequiredColumns.every((col) => col.isVisible);
  }

  getSelectedAvailableColumns(): TableColumn[] {
    return this.availableColumns.filter(
      (col) => col.isVisible && !this.requiredColumnKeys.has(col.key)
    );
  }

  getUnselectedAvailableColumns(): TableColumn[] {
    return this.availableColumns.filter(
      (col) => !col.isVisible && !this.requiredColumnKeys.has(col.key)
    );
  }

  refreshData(): void {
    if (this.selectedTab === 'pending') {
      this.pendingPageNo = 1;
      this.pageNo = 1;
      this.searchText = this.pendingSearchText;
    } else {
      this.completedPageNo = 1;
      this.pageNo = 1;
      this.searchText = this.completedSearchText;
    }
    this.getPendingData(true);
  }

  onPageChange(newPage: number) {
    if (this.selectedTab === 'pending') {
      this.pendingPageNo = newPage;
      this.pageNo = newPage;
    } else {
      this.completedPageNo = newPage;
      this.pageNo = newPage;
    }
    this.getPendingData(true);
  }

  onPageSizeChange(newSize: number) {
    this.pageSize = newSize;
    if (this.selectedTab === 'pending') {
      this.pendingPageSize = newSize;
      this.pendingPageNo = 1;
      this.pageNo = 1;
    } else {
      this.completedPageSize = newSize;
      this.completedPageNo = 1;
      this.pageNo = 1;
    }
    this.getPendingData(true);
  }

  onSearchChange(search: string) {
    if (this.selectedTab === 'pending') {
      this.pendingSearchText = search;
      this.searchText = search;
      this.pendingPageNo = 1;
      this.pageNo = 1;
    } else {
      this.completedSearchText = search;
      this.searchText = search;
      this.completedPageNo = 1;
      this.pageNo = 1;
    }
    this.getPendingData(false);
  }

  onSortChange(event: { column: string; direction: 'asc' | 'desc' }) {
    this.sortColumn = event.column;
    this.sortDirection = event.direction;
    this.getPendingData(true);
  }

  isInvalid(controlName: string, form: FormGroup): boolean {
    const control = form.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}
