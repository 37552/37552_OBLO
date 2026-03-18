import { Component, OnInit, ViewChild, ElementRef, QueryList, ViewChildren, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { TableModule } from 'primeng/table';
import { FormControl, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { UserService } from '../../shared/user-service';
import { DatePickerModule } from 'primeng/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { HttpErrorResponse } from '@angular/common/http';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableTemplate, TableColumn } from '../../table-template/table-template';
import { PopoverModule } from 'primeng/popover';

@Component({
  selector: 'app-update-salary-wages',
  standalone: true,
  imports: [
    BreadcrumbModule,
    ButtonModule,
    DrawerModule,
    TableModule,
    CommonModule,
    SelectModule,
    ReactiveFormsModule,
    DatePickerModule,
    InputTextModule,
    ToastModule,
    ToastModule,
    ConfirmDialogModule,
    ToastModule,
    ConfirmDialogModule,
    FormsModule,
    TableTemplate,
    PopoverModule
  ],
  providers: [MessageService, ConfirmationService, DatePipe],
  templateUrl: './update-salary-wages.html',
  styleUrl: './update-salary-wages.scss'
})
export class UpdateSalaryWages implements OnInit {

  // @ViewChildren('organisation,site,empType,department,newBasic,oldBasic,effectiveDate') formFields!: QueryList<ElementRef>;

  breadcrumbItems: any[] = [];
  menulabel: string = '';
  FormName: string = '';
  FormValue: string = '';
  salaryWagesForm!: FormGroup;

  // Dropdown Lists
  organisationList: any[] = [];
  projectList: any[] = [];
  employeeList: any[] = [];
  departmentDrp: any[] = [];
  wagesList: any[] = [];

  // Table Data
  allViewTableData: any[] = [];
  paginationCountData: any[] = [];
  pageNoData: any[] = [];
  totalRecords: number = 0;
  loading: boolean = false;

  // Pagination & Search
  pageNo: number = 1;
  pageSize: number = 10;
  searchText: string = '';

  // Drawer & Dialog State
  visible: boolean = false;
  header: string = '';
  headerIcon: string = '';
  isMaximized: boolean = false;
  postType: string = 'add';
  selectedItem: any = null;

  constructor(
    private userService: UserService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private datePipe: DatePipe,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const param = sessionStorage.getItem("menuItem");
    if (param) {
      const paramjs = JSON.parse(param);
      this.FormName = paramjs.formName;
      this.FormValue = paramjs.formValue;
      this.menulabel = paramjs.menu;
      this.breadcrumbItems = [
        { label: 'Home', routerLink: '/home' },
        { label: this.menulabel },
        { label: this.FormName }
      ];
    }

    this.initform();
    this.loadDropdowns();
    this.getViewData(true);
  }

  initform() {
    this.salaryWagesForm = new FormGroup({
      organisation: new FormControl('', Validators.required),
      ProjectId: new FormControl('', Validators.required),
      empType: new FormControl('', Validators.required),
      department: new FormControl(''), // Optional based on user code
      newBasic: new FormControl('', Validators.required),
      oldBasic: new FormControl('', Validators.required),
      effectiveDate: new FormControl('', Validators.required)
    });
  }

  columns: TableColumn[] = [
    { key: 'actions', header: 'Action', isSortable: false, isVisible: true, isCustom: true },
    { key: 'org', header: 'Organisation', isSortable: true, isVisible: true },
    { key: 'projectDetail', header: 'Project', isSortable: true, isVisible: true },
    { key: 'empType', header: 'Employee Type', isSortable: true, isVisible: true },
    { key: 'dept', header: 'Department', isSortable: true, isVisible: true },
    { key: 'newBasicValue', header: 'New Basic', isSortable: true, isVisible: true },
    { key: 'oldBasicValue', header: 'Old Basic', isSortable: true, isVisible: true },
    { key: 'effectiveDate', header: 'Effective Date', isSortable: true, isVisible: true, isCustom: true },
  ];

  loadDropdowns() {
    this.getDrpData();
    this.getProjectDrpData();
    this.getEmployeeDrpData();
    this.getDepartmentDrpData();
  }

  getDrpData() {
    this.userService.getQuestionPaper('uspGetEmployeeCtcDrp|action=ORG').subscribe((res: any) => {
      this.organisationList = res['table'];
    });
  }

  getProjectDrpData() {
    const districtId = sessionStorage.getItem('District');
    const userId = sessionStorage.getItem('userId');
    const roleId = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
    this.userService.getQuestionPaper(`uspGetExpanseMaster|action=COSTCENTER|id=0|districtId=${districtId}|appUserId=${userId}|appUserRole=${roleId}`).subscribe((res: any) => {
      this.projectList = res['table'];
    });
  }

  getEmployeeDrpData() {
    this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblEmpTypeMaster`).subscribe((res: any) => {
      this.employeeList = res['table'];
    });
  }

  getDepartmentDrpData() {
    this.userService.getQuestionPaper(`uspGetDepartmentDetail`).subscribe((res: any) => {
      this.departmentDrp = res['table'];
    });
  }

  getViewData(isRefresh: boolean) {
    if (isRefresh) {
      this.pageNo = 1;
    }
    this.loading = true;
    const userId = sessionStorage.getItem('userId');
    const districtId = sessionStorage.getItem('District');
    const userRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;

    let query = `appUserId=${userId}|districtId=${districtId}|searchText=${this.searchText}|pageIndex=${this.pageNo}|size=${this.pageSize}|appUserRole=${userRole}`;

    this.userService.getQuestionPaper(`uspGetSiteFixedWages|${query}`).subscribe({
      next: (res: any) => {
        this.allViewTableData = res['table1'] || [];
        this.paginationCountData = res['table'] || [];
        // Assuming table[0].totalCount exists for total records if standard pagination
        if (this.paginationCountData.length > 0) {
          this.totalRecords = this.paginationCountData[0]['totalCnt'];
        } else {
          this.totalRecords = this.allViewTableData.length; // Fallback
        }
        this.pageNoData = res['table2'];
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        // Error handling is managed by interceptor generally, but can add specific handling here
      }
    });
    this.cdr.detectChanges();
  }

  onPageChange(event: any) {
    this.pageNo = (event.first / event.rows) + 1;
    this.pageSize = event.rows;
    this.getViewData(false);
  }

  onSearch() {
    this.pageNo = 1;
    this.getViewData(true);
  }

  onPageSizeChange(event: number) {
    this.pageSize = event;
    this.pageNo = 1;
    this.getViewData(true);
  }

  onSearchChange(event: string) {
    this.searchText = event;
    this.pageNo = 1;
    this.getViewData(true);
  }

  showDialog(type: string, data?: any) {
    this.postType = type;
    this.header = type === 'add' ? 'Add Fixed Wages Revision' : 'Update Fixed Wages Revision';
    this.headerIcon = type === 'add' ? 'pi pi-plus' : 'pi pi-pencil';
    this.visible = true;

    if ((type === 'update' || type === 'view') && data) {
      this.selectedItem = data;
      this.patchForm(data);
    } else {
      this.selectedItem = null;
      this.salaryWagesForm.reset();
      this.salaryWagesForm.enable();
    }
  }

  patchForm(data: any) {
    if (this.postType === 'view') {
      this.salaryWagesForm.disable();
    } else {
      this.salaryWagesForm.enable();
    }

    // Find IDs based on names from the table data
    const orgObj = this.organisationList.find(x => x.drpOption === data.org);
    const projObj = this.projectList.find(x => x.drpOption === data.projectDetail);
    const empTypeObj = this.employeeList.find(x => x.drpOption === data.empType);
    const deptObj = this.departmentDrp.find(x => x.department === data.dept); // Note: 'department' key for dept

    this.salaryWagesForm.patchValue({
      organisation: orgObj ? orgObj.drpValue : null,
      ProjectId: projObj ? projObj.drpValue : null,
      empType: empTypeObj ? empTypeObj.drpValue : null,
      department: deptObj ? deptObj.id : null,
      newBasic: data.newBasicValue,
      oldBasic: data.oldBasicValue,
      effectiveDate: data.effectiveDate ? new Date(data.effectiveDate) : null
    });
  }

  onDrawerHide() {
    this.visible = false;
  }

  onReset() {
    this.salaryWagesForm.reset();
  }

  submitcall() {
    if (this.salaryWagesForm.invalid) {
      this.salaryWagesForm.markAllAsTouched();
      return;
    }

    this.confirmationService.confirm({

      message: 'Are you sure you want to proceed?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.saveData();
      }
    });
  }

  saveData() {
    this.loading = true;

    let org = this.salaryWagesForm.get('organisation')?.value;
    let projectDetailId = this.salaryWagesForm.get('ProjectId')?.value;
    let empType = this.salaryWagesForm.get('empType')?.value;
    let department = this.salaryWagesForm.get('department')?.value || 0;
    let newBasic = this.salaryWagesForm.get('newBasic')?.value;
    let oldBasic = this.salaryWagesForm.get('oldBasic')?.value;

    // Transform date
    let effectiveDateVal = this.salaryWagesForm.get('effectiveDate')?.value;
    let effectiveDate = this.datePipe.transform(effectiveDateVal, 'yyyy-MM-dd');

    let districtId = sessionStorage.getItem('District') || '';
    let userId = sessionStorage.getItem('userId') || '';

    let query = `orgId=${org}|projectDetailId=${projectDetailId}|deptId=${department}|empTypeId=${empType}|oldBasicValue=${oldBasic}|newBasicValue=${newBasic}|effectiveDate=${effectiveDate}|districtId=${districtId}|appUserId=${userId}`;
    let SP = `uspUpdateSiteFixedWages`;

    this.userService.SubmitPostTypeData(SP, query, this.FormName).subscribe({
      next: (datacom: any) => {
        this.loading = false;
        if (datacom) {
          const resultarray = datacom.split("-");
          if (resultarray[1] == "success") {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Data Saved Successfully' });
            this.visible = false;
            this.getViewData(true);
          } else if (resultarray[0] == "2") {
            this.messageService.add({ severity: 'warn', summary: 'Alert', detail: resultarray[1] });
          } else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: datacom });
          }
        }
      },
      error: (err: HttpErrorResponse) => {
        this.loading = false;
        // ErrorInterceptor handles globally, but we can add specific logic if needed
      }
    });
  }

  getDrawerWidth(): string {
    return this.isMaximized ? '100%' : '50%';
  }

  toggleMaximize() {
    this.isMaximized = !this.isMaximized;
  }

  get f() { return this.salaryWagesForm.controls; }

}
