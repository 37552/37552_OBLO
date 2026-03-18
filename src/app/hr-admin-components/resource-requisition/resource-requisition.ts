import { Component, ChangeDetectorRef, signal } from '@angular/core';
import { TableTemplate, TableColumn, Tab } from '../../table-template/table-template';
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
import { Customvalidation, noInvalidPipelineName } from '../../shared/Validation';
import { HttpErrorResponse } from '@angular/common/http';
import { TableModule } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TimelineModule } from 'primeng/timeline';
import { OnlyNumberDirective } from '../../shared/directive/only-number.directive';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { InputNumberModule } from 'primeng/inputnumber';

interface DropdownItem {
  drpvalue: number;
  drpoption: string;
}

@Component({
  selector: 'app-resource-requisition',
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
    TableModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    TimelineModule,
    OnlyNumberDirective,
    BreadcrumbModule,
    InputNumberModule
  ],
  providers: [
    ConfirmationService,
    MessageService
  ],
  templateUrl: './resource-requisition.html',
  styleUrl: './resource-requisition.scss'
})
export class ResourceRequisition {
  breadcrumbItems!: ({ label: any; disabled?: undefined; } | { label: any; disabled: boolean; })[];
  isLoading = true;
  visible: boolean = false;
  postType: string = '';
  header: any = '';
  selectedIndex: any = [];
  headerIcon: string = 'pi pi-plus';
  paramvaluedata: string = '';
  isFormLoading: boolean = false;
  data: any[] = [];
  jobForm: FormGroup;
  mrfForm: FormGroup;
  assetsForm: FormGroup;
  skillsForm: FormGroup;
  groupListArray = []
  totalCount = 0;
  jobData: any = [];
  qualificationDrp: any = [];
  indentNumber: any = [];
  divisionDrp: any = [];
  departmentDrp: any = [];
  designationDrp: any = [];
  profileDrp: any = [];
  locationDrp: any = [];
  reportingTo: any = [];
  goalsDrp: any = [];
  attributeDrp: any = [];
  validateDrp: any = [];
  assetDrp: any = [];
  skillsDrp: any = [];
  replacementDrp: any = [];
  isApprove: number = 0;
  isForward: number = 0;
  isReject: number = 0;
  isSave: number = 0;
  replacementArr: any[] = [];
  replacementHeaderKeys: string[] = [];
  activeJobTab: string = 'JOBDesc';
  activeAssetTab: string = 'assets';
  assetsList: any[] = [];
  skillsList: any[] = [];
  addDisabled = false;
  skillsAddDisabled = false;
  replacementSelected = false;
  replacementJson: { employeeId: number }[] = [];
  selectedEmployees: any[] = [];
  searchValue: string = '';
  isViewMode: boolean = false;
  selectedResignedEmp: any[] = [];
  isValidremark: boolean = true
  remark: string = '';
  selectedItem: any = null;
  selectedAction: any = null;
  approalHistoryData: any = null;
  previousReplacementId: number | null = null;
  printDialog: boolean = false;
  printContent: string = '';
  isPrint: boolean = false;
  filters: any = {};

  tabs: Tab[] = [
    { label: 'Pending Request', count: 0, value: 0 },
    { label: 'Processed Request', count: 0, value: 1 }
  ];

  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true, },
    { key: 'indentNo', header: 'Indent No', isVisible: true, isSortable: false },
    { key: 'division', header: 'Division', isVisible: true, isSortable: false },
    { key: 'department', header: 'Department', isVisible: true, isSortable: false },
    { key: 'designation', header: 'Designation', isVisible: true, isSortable: false },
    { key: 'jobProfile', header: 'Job Profile', isVisible: true, isSortable: false },
    { key: 'location', header: 'Location', isVisible: true, isSortable: false },
    { key: 'reporting', header: 'Reporting', isVisible: true, isSortable: false },
    { key: 'replacement', header: 'Replacement', isVisible: true, isSortable: false },
    { key: 'jobType', header: 'Job Type', isVisible: true, isSortable: false },
    { key: 'jobPurpose', header: 'Job Purpose', isVisible: true, isSortable: false },
    { key: 'minCtc', header: 'Min CTC', isVisible: true, isSortable: false },
    { key: 'maxCtc', header: 'Max CTC', isVisible: true, isSortable: false },
    { key: 'description', header: 'Description', isVisible: true, isSortable: false },
    { key: 'experience', header: 'Experience', isVisible: true, isSortable: false },
    { key: 'qualification', header: 'Qualification', isVisible: true, isSortable: false },
    { key: 'specificCond', header: 'Specific Condition', isVisible: true, isSortable: false },
    { key: 'status', header: 'Status', isVisible: true, isSortable: false },
    { key: 'assets', header: 'Assets Required', isVisible: true, isSortable: false },
    { key: 'skills', header: 'Skills Required', isVisible: true, isSortable: false },
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
  approvalDailog: boolean = false
  resignedEmpList: any = [];
  updateRowId: any;
  rowId: any;

  menulabel: any;
  FormName: any;
  FormValue: any;
  historyDrawerVisible: boolean = false;
  param: string = '';
  printDailog: boolean = false;

  constructor(private fb: FormBuilder,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private message: MessageService,
    public Customvalidation: Customvalidation,
    private cdr: ChangeDetectorRef) {

    this.jobForm = this.fb.group({
      jobType: ['', Validators.required],
      qualification: [''],
      experience: ['', Validators.min(0)],
      specificCondition: ['']
    });

    this.mrfForm = this.fb.group({
      indentNoControl: [''],
      division: ['', Validators.required],
      department: ['', Validators.required],
      designation: ['', Validators.required],
      profile: ['', Validators.required],
      location: ['', Validators.required],
      reportingTo: ['', Validators.required],
      replacement: ['', Validators.required],
      minCtc: [null],
      maxCtc: [null],
      jobDescription: ['', [Validators.required, noInvalidPipelineName()]],
      additionalRemarks: ['']
    });

    this.assetsForm = this.fb.group({
      assets: [[]],
    });

    this.skillsForm = this.fb.group({
      skills: [[]],
    });

  }

  get f() { return this.jobForm.controls }
  get f1() { return this.mrfForm.controls }
  get f2() { return this.assetsForm.controls }
  get f3() { return this.skillsForm.controls }

  ngOnInit(): void {
    this.param = sessionStorage.getItem('menuItem') ?? '';
    let paramjs = JSON.parse(this.param);
    this.menulabel = paramjs.menu;
    this.FormName = paramjs.formName;
    this.FormValue = paramjs.formValue;
    this.getPermissionData()
    this.getTableData(true)
    this.getTabCounts();
    this.breadcrumbItems = [
      { label: this.menulabel },
      { label: this.FormName }
    ];
    setTimeout(() => {
      this.isLoading = false;

    }, 1000);

  }


  onReplacementChange(event: any) {
    const newVal = event.value;
    if (newVal === 10000) {
      this.replacementSelected = true;
      this.activeAssetTab = 'replacements';
      if (this.previousReplacementId === 10000) {
        this.getResignedEmp(false);
      } else {
        this.selectedEmployees = [];
        this.replacementArr = [];
        this.getResignedEmp(true);
      }
    } else {
      this.replacementSelected = false;
      this.activeAssetTab = 'assets';
      this.selectedEmployees = [];
      this.replacementArr = [];
    }

    this.previousReplacementId = newVal;
  }

  getTabCounts() {
    const userId = sessionStorage.getItem('userId') || '';
    const roleId = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;

    const query =
      `searchText=` +
      `|pageIndex=1` +
      `|size=1` +
      `|districtId=${sessionStorage.getItem('District')}` +
      `|appUserId=${userId}` +
      `|appUserRole=${roleId}`;

    // Pending API
    this.userService
      .getQuestionPaper(`uspGetResourceRequisitionViewDetails|${query}`)
      .subscribe((res: any) => {
        const count = res?.table?.[0]?.totalCnt || 0;
        const pendingTab = this.tabs.find(t => t.value === 0);
        if (pendingTab) pendingTab.count = count;
      });

    this.cdr.detectChanges();
    // Processed API
    this.userService
      .getQuestionPaper(`uspGetResourceRequisitionViewDetailsProcessed|${query}`)
      .subscribe((res: any) => {
        const count = res?.table?.[0]?.totalCnt || 0;
        const processedTab = this.tabs.find(t => t.value === 1);
        if (processedTab) processedTab.count = count;
      });
    this.cdr.detectChanges();
  }



  getResignedEmp(fresh: boolean = false) {
    this.isLoading = true;
    this.userService
      .getQuestionPaper(`uspGetDepartmentResignedEmp|appUserId=${sessionStorage.getItem('userId')}`)
      .subscribe(
        (res: any) => {
          this.resignedEmpList = res?.table || [];

          if (!fresh && this.replacementArr.length > 0) {
            this.selectedEmployees = this.resignedEmpList.filter((emp: any) =>
              this.replacementArr.some(r => r.EmpCode === emp.empCode && r.replacementStatus === 1)
            );
          } else {
            this.selectedEmployees = [];
          }
          this.onSelectionChange(this.selectedEmployees);

          this.isLoading = false;

        },
        (err: HttpErrorResponse) => {
          this.isLoading = false;
          if (err.status === 403) this.Customvalidation.loginroute(err.status);
        }
      );
  }

  getPermissionData() {
    this.isLoading = true;
    const roleId = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
    this.userService.getQuestionPaper(`uspGetPermissionByactivity_role|actitvityName=${this.FormName}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${roleId}`).subscribe((res: any) => {
      if (res['table'].length !== 0) {
        this.isApprove = res['table'][0]['wfApprove']
        this.isForward = res['table'][0]['wfForword']
        this.isReject = res['table'][0]['wfReject']
        this.isSave = res['table'][0]['wfSave']
      }
      else {
        this.isApprove = 0
        this.isForward = 0
        this.isReject = 0
        this.isSave = 0
      }
    },
    );

    setTimeout(() => {
      this.isLoading = false;

    }, 1000);
  }

  getDropDownData() {
    this.isLoading = true;
    const roleId = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;

    this.userService.getQuestionPaper(`uspGetResourceRequisitionDetails|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${roleId}`).subscribe((res: any) => {
      this.jobData = res['table']
      this.qualificationDrp = res['table1']
      this.indentNumber = res['table14'][0].indentNo
      this.divisionDrp = res['table2']
      this.departmentDrp = res['table3']
      this.designationDrp = res['table4']
      this.profileDrp = res['table5']
      this.locationDrp = res['table6']
      this.reportingTo = res['table7']
      this.goalsDrp = res['table9']
      this.attributeDrp = res['table10']
      this.validateDrp = res['table11']
      this.assetDrp = res['table12']
      this.skillsDrp = res['table13']
      this.replacementDrp = res['table15']
    })

    setTimeout(() => {
      this.isLoading = false;

    }, 1000);
  }


  activeTabValue: number = 0;

  private scrollToFirstInvalidControl(): void {
    setTimeout(() => {
      const drawer = document.querySelector('.p-drawer-content') as HTMLElement;
      if (!drawer) return;

      const invalid = drawer.querySelector(
        'input.ng-invalid, textarea.ng-invalid, .p-invalid, .ng-invalid'
      ) as HTMLElement | null;

      if (!invalid) return;

      const target =
        (invalid.querySelector('input, textarea') as HTMLElement) || (invalid as HTMLElement);

      const drawerRect = drawer.getBoundingClientRect();
      const fieldRect = target.getBoundingClientRect();
      const scrollY = fieldRect.top - drawerRect.top - 140;

      drawer.scrollTo({ top: drawer.scrollTop + scrollY, behavior: 'smooth' });

      target.focus({ preventScroll: true });
      target.classList.add('p-invalid');
      setTimeout(() => target.classList.remove('p-invalid'), 2000);
    }, 100);
  }

  onTabChange(newValue: string | number) {
    this.activeTabValue = Number(newValue);
    this.pageNo = 1;
    this.searchText = '';
    this.getTableData(true);
    this.cdr.detectChanges();
  }

  getTableData(isTrue: boolean) {
    try {
      if (isTrue) this.isLoading = true;
      else this.pageNo = 1;

      const userId = sessionStorage.getItem('userId') || '';
      const roleId = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
      const query = `searchText=${this.searchText}|pageIndex=${this.pageNo}|size=${this.pageSize}|districtId=${sessionStorage.getItem('District')}|appUserId=${userId}|appUserRole=${roleId}`;

      const spName = this.activeTabValue === 0
        ? 'uspGetResourceRequisitionViewDetails'
        : 'uspGetResourceRequisitionViewDetailsProcessed';

      this.userService.getQuestionPaper(`${spName}|${query}`).subscribe({
        next: (res: any) => {
          try {
            this.data = res?.table1 || [];


            this.data.forEach(item => {
              if (typeof item.approvalDetail === 'string') {
                try { item.approvalDetail = JSON.parse(item.approvalDetail); } catch { item.approvalDetail = []; }
              } else if (!Array.isArray(item.approvalDetail)) item.approvalDetail = [];

              if (typeof item.replacementArr === 'string') {
                try { item.replacementArr = JSON.parse(item.replacementArr); } catch { item.replacementArr = []; }
              } else if (!Array.isArray(item.replacementArr)) item.replacementArr = [];



            });

            this.totalCount = res?.table?.[0]?.totalCnt || this.data.length;
            this.updateTabCount();


          } catch (innerErr) {
            console.error('Error processing response:', innerErr);
            this.data = [];
            this.totalCount = 0;
          } finally {
            this.isLoading = false;
            this.cdr.detectChanges();
          }
        },
        error: (err) => {
          console.error('API call failed:', err);
          this.isLoading = false;
          if (err.status === 403) this.Customvalidation.loginroute(err.status);
          else { this.data = []; this.totalCount = 0; }
        }
      });

      this.cdr.detectChanges();
    } catch (error) {
      console.error('Unexpected error in getTableData():', error);
      this.isLoading = false;
    }
  }

  updateTabCount() {
    const activeTab = this.tabs.find(tab => tab.value === this.activeTabValue);
    if (activeTab) {
      activeTab.count = this.totalCount;
    }
  }

  setActiveJobTab(tab: string) {
    this.activeJobTab = tab;
  }

  setActiveAssetTab(tab: string) {
    this.activeAssetTab = tab;
  }

  showDialog(view: string, data: any) {
    this.getDropDownData()

    this.selectedIndex = data;
    this.visible = true;
    this.updateRowId = data?.id;
    this.postType = view;
    this.header = view === 'add' ? 'Add ' + this.FormName : view === 'update' ? 'Update ' + this.FormName : 'View ' + this.FormName;
    this.headerIcon = view === 'add' ? 'pi pi-plus' : view === 'update' ? 'pi pi-pencil' : 'pi pi-eye';

    this.isViewMode = view === 'view';

    if (view === 'add') {
      this.mrfForm.reset();
      this.jobForm.reset();
      this.assetsForm.reset();
      this.skillsForm.reset();

      this.mrfForm.enable();
      this.jobForm.enable();
      this.assetsForm.enable();
      this.skillsForm.enable();

      this.assetsList = [];
      this.skillsList = [];

      this.addDisabled = false;
      this.skillsAddDisabled = false;

      this.replacementSelected = false;
      this.selectedEmployees = [];
      this.replacementArr = [];

    } else {
      if (view === 'view') {
        this.mrfForm.disable();
        this.jobForm.disable();
        this.assetsForm.disable();
        this.skillsForm.disable();
        this.addDisabled = true;
        this.skillsAddDisabled = true;
      } else {
        this.mrfForm.enable();
        this.jobForm.enable();
        this.assetsForm.enable();
        this.skillsForm.enable();
      }

      this.jobForm.patchValue({
        jobType: data.jobTypeId,
        qualification: data.qualificationId,
        experience: data.experience,
        specificCondition: data.specificCond
      });

      this.mrfForm.patchValue({
        indentNoControl: data.indentNo,
        division: data.divisionId,
        department: data.departmentId,
        designation: data.designationId,
        profile: data.jobProfileId,
        location: data.locationId,
        reportingTo: data.reportingId,
        replacement: data.replacementId,
        minCtc: data.minCtc ? Number(data.minCtc) : null,
        maxCtc: data.maxCtc ? Number(data.maxCtc) : null,
        jobDescription: data.jobPurpose,
        additionalRemarks: data.description
      });

      const selectedAssets: DropdownItem[] = data.assetsRequired
        .split(',')
        .map((id: string) => this.assetDrp.find((a: DropdownItem) => a.drpvalue === +id))
        .filter((a: any): a is DropdownItem => !!a);

      const selectedSkills: DropdownItem[] = data.skillsRequired
        .split(',')
        .map((id: string) => this.skillsDrp.find((s: DropdownItem) => s.drpvalue === +id))
        .filter((s: any): s is DropdownItem => !!s);

      this.assetsForm.patchValue({ assets: selectedAssets });
      this.skillsForm.patchValue({ skills: selectedSkills });

      this.assetsList = [...selectedAssets];
      this.skillsList = [...selectedSkills];

      if (view === 'update') {
        const hasAssets = data.assetsRequired && data.assetsRequired !== '0';
        const hasSkills = data.skillsRequired && data.skillsRequired !== '0';

        this.addDisabled = !!hasAssets;
        this.skillsAddDisabled = !!hasSkills;
      } else if (view === 'add') {
        this.addDisabled = false;
        this.skillsAddDisabled = false;
      } else {
        this.addDisabled = true;
        this.skillsAddDisabled = true;
      }

      this.replacementSelected = data.replacementId === 10000;
      if (this.replacementSelected) {
        this.activeAssetTab = 'replacements';
        if (typeof data.replacementArr === 'string') {
          try {
            this.replacementArr = JSON.parse(data.replacementArr) || [];
          } catch {
            this.replacementArr = [];
          }
        } else {
          this.replacementArr = data.replacementArr || [];
        }

        this.getResignedEmp();
      }
    }

    document.body.style.overflow = 'hidden';
  }

  setReplacementSelection(parsedReplacementArr: any[]) {
    if (!this.resignedEmpList || !parsedReplacementArr) return;
    this.selectedEmployees = [];
    parsedReplacementArr.forEach(rep => {
      if (rep.replacementStatus === 1) {
        const emp = this.resignedEmpList.find(
          (e: any) => e.empCode?.toString().trim().toLowerCase() === rep.EmpCode?.toString().trim().toLowerCase()
        );
        if (emp) {
          this.selectedEmployees.push(emp);
        }
      }
    });
    this.onSelectionChange(this.selectedEmployees);


  }


  isInvalid(field: string): boolean {
    const control =
      this.jobForm.get(field) || this.mrfForm.get(field);
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
    this.rowId = item.id;
    this.selectedIndex = item;
    this.openConfirmation("Confirm", "Are you sure want to delete?", '1', '2');
  }

  onDrawerHide() {
    document.body.style.overflow = 'visible';
    this.visible = false;
    this.mrfForm.enable();
    this.mrfForm.reset();
    this.jobForm.enable();
    this.jobForm.reset();
    this.assetsForm.enable();
    this.assetsForm.reset();
    this.skillsForm.enable();
    this.skillsForm.reset();
    this.assetsList = [];
    this.skillsList = [];
    this.addDisabled = false;
    this.skillsAddDisabled = false;
    this.replacementSelected = false;
  }


  addAssets() {
    const selectedAssets = this.assetsForm.value.assets;
    if (selectedAssets && selectedAssets.length) {
      this.assetsList = [...selectedAssets];
      this.assetsForm.get('assets')?.setValue([]);
      this.addDisabled = true;
    }
  }

  addSkills() {
    const selectedSkills = this.skillsForm.value.skills;
    if (selectedSkills && selectedSkills.length) {
      this.skillsList = [...selectedSkills];
      this.skillsForm.get('skills')?.setValue([]);
      this.skillsAddDisabled = true;
    }
  }

  deleteAssetRow() {
    this.assetsList = [];
    this.addDisabled = false;
  }


  deleteSkillsRow() {
    this.skillsList = [];
    this.skillsAddDisabled = false;
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
          this.submitActionForm();
        }
        else if (option === '5') {
          this.mrfForm.reset()
          this.jobForm.reset()
          this.assetsForm.reset()
          this.skillsForm.reset()
          this.assetsList = [];
          this.skillsList = [];
          this.addDisabled = false;
          this.skillsAddDisabled = false;
          this.replacementSelected = false;
        }
      },
      reject: () => {
        if (option === '4') {
        }
      }
    });
  }

  onClear() {
    this.mrfForm.reset()
    this.jobForm.reset()
    this.assetsForm.reset()
    this.skillsForm.reset()
    this.assetsList = [];
    this.skillsList = [];
    this.addDisabled = false;
    this.skillsAddDisabled = false;
    this.replacementSelected = false;
  }


  onSubmit(event: any) {
    if (this.jobForm.invalid || this.mrfForm.invalid || this.assetsForm.invalid || this.skillsForm.invalid) {
      this.jobForm.markAllAsTouched();
      this.mrfForm.markAllAsTouched();
      this.assetsForm.markAllAsTouched();
      this.skillsForm.markAllAsTouched();

      this.scrollToFirstInvalidControl();

      this.message.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill all the required fields.',
        life: 3000
      });

      // If jobForm is invalid and we are in MRF tab, switch to JOBDesc tab
      if (this.jobForm.invalid && this.activeJobTab === 'MRF') {
        this.activeJobTab = 'JOBDesc';
      }

      return;
    }


    const jobData = this.jobForm.value;
    const mrfData = this.mrfForm.value;

    const minCtc = mrfData.minCtc || '0';
    const maxCtc = mrfData.maxCtc || '0';
    const experience = jobData.experience || '0';

    const replacements = JSON.stringify(this.replacementJson || []);

    // Check both list and form control for assets
    let finalAssets = this.assetsList;
    if (!finalAssets || finalAssets.length === 0) {
      const formAssets = this.assetsForm.get('assets')?.value;
      if (formAssets && formAssets.length > 0) {
        finalAssets = formAssets;
      }
    }
    const assetRequired = finalAssets?.length
      ? finalAssets.map((a: any) => a.drpvalue).join(',')
      : '0';

    // Check both list and form control for skills
    let finalSkills = this.skillsList;
    if (!finalSkills || finalSkills.length === 0) {
      const formSkills = this.skillsForm.get('skills')?.value;
      if (formSkills && formSkills.length > 0) {
        finalSkills = formSkills;
      }
    }
    const skillsRequired = finalSkills?.length
      ? finalSkills.map((s: any) => s.drpvalue).join(',')
      : '0';

    const roleId = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;

    const query =
      `districtId=${sessionStorage.getItem('District')}` +
      `|jobType=${jobData.jobType}` +
      `|qualification=${jobData.qualification || 0}` +
      `|experience=${experience}` +
      `|condition=${jobData.specificCondition || ''}` +
      `|division=${mrfData.division}` +
      `|department=${mrfData.department}` +
      `|designation=${mrfData.designation}` +
      `|profile=${mrfData.profile}` +
      `|location=${mrfData.location}` +
      `|reportingTo=${mrfData.reportingTo}` +
      `|replacement=${mrfData.replacement}` +
      `|jobPurpose=${(mrfData.jobDescription || '').toString().trim()}` +
      `|minCTC=${minCtc}` +
      `|maxCTC=${maxCtc}` +
      `|description=${(mrfData.additionalRemarks || '').toString().trim()}` +
      `|assetRequired=${assetRequired}` +
      `|skillsRequired=${skillsRequired}` +
      `|appUserId=${sessionStorage.getItem('userId')}` +
      `|goalJson=[]` +
      `|attributeJson=[]` +
      `|replacementJson=${replacements}` +
      `|appUserRole=${roleId}`;

    this.paramvaluedata = query;
    this.openConfirmation('Confirm?', 'Are you sure want to proceed?', '1', '1', event);
  }


  submitcall() {
    try {
      setTimeout(() => {
        this.isFormLoading = true;

      }, 0);
      let query = '';
      let SP = '';

      if (this.postType === 'update') {
        query = `mpHeadId=${this.updateRowId}|${this.paramvaluedata}`;
        SP = `uspPostUpdateResourceRequisitionDetails`;
      }
      else {
        query = `${this.paramvaluedata}`;
        SP = `uspPostResourceRequisitionDetails`;
      }

      this.userService.SubmitPostTypeData(SP, query, 'header').subscribe({
        next: (datacom: any) => {
          setTimeout(() => {
            this.isFormLoading = false;

          }, 0);
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

        }
      });
    } catch (error: any) {
      console.error('Unexpected error in submitcall():', error);
      this.isFormLoading = false;
      this.message.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Something went wrong',
        life: 3000
      });
    }

  }

  deleteData() {
    try {
      this.isFormLoading = true;
      let query = `id=${this.rowId}|action=DELETE|appUserId=${sessionStorage.getItem('userId')}`;
      this.userService.SubmitPostTypeData(`uspPostResourceRequisitionDetailsAction`, query, 'header').subscribe({
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

      });

    } catch (error) {
      console.error('Unexpected error in deleteData():', error);
      this.isFormLoading = false;
    }
  }

  onSelectionChange(selected: any[]) {
    this.selectedEmployees = selected;
    this.replacementJson = selected.map(emp => ({ employeeId: emp.id }));
  }

  openApprovalModal(data: any) {
    this.selectedItem = data;
    this.approvalDailog = true;
  }

  openApprovalHistoryModal(data: any) {
    this.approalHistoryData = data
    this.historyDrawerVisible = true;
  }

  onHistoryDrawerHide() {
    this.historyDrawerVisible = false;
  }

  getwfStatusId(action: string): number {
    let code: number;
    switch (action) {
      case 'Approve':
        code = 1;
        break;
      case 'Forward':
        code = 6;
        break;
      case 'Reject':
        code = 3;
        break;
      default:
        code = 0;
        break;
    }
    return code;
  }


  OnSubmitAction(action: string) {
    this.selectedAction = action === 'Approve' ? 'Approved' : action;
    const remark = this.remark?.trim();
    if (!remark) {
      this.isValidremark = false;
      return;
    } else {
      this.isValidremark = true;
    }

    this.paramvaluedata = '';
    const wfStatusId = this.getwfStatusId(action);
    const roleData = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
    const roleID = roleData?.roleId || '';

    this.paramvaluedata = `id=${this.selectedItem.id}|statusId=${wfStatusId}|remarks=${remark}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${roleID}`;
    this.openConfirmation('Confirm?', `Are you sure you want to ${action}?`, '1', '4');
  }


  submitActionForm() {
    try {
      this.isFormLoading = true;
      let query = '';
      let SP = '';

      query = `${this.paramvaluedata}`;
      SP = `uspPostUpdateManpowerRequisitionStatus`;


      this.userService.SubmitPostTypeData(SP, query, 'header').subscribe({
        next: (datacom: any) => {
          setTimeout(() => {
            this.isFormLoading = false;

          }, 0);
          try {
            if (!datacom) return;
            const resultarray = datacom.split('-');
            if (resultarray[1] === 'success') {
              this.getTableData(false);
              this.message.add({
                severity: 'success',
                summary: 'Success',
                detail: `Data ${this.selectedAction} Successfully.`,
                life: 3000
              });
              this.approvalDailog = false;
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
          setTimeout(() => {
            this.isFormLoading = false;

          }, 0);
          console.error('API call failed:', err);


        }
      });
    } catch (error: any) {
      console.error('Unexpected error in submitcall():', error);
      this.isFormLoading = false;
      this.message.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Something went wrong',
        life: 3000
      });
    }

  }


  hasUserAlreadyActed(data: any): boolean {
    const userData = JSON.parse(sessionStorage.getItem('UserInfo') || '{}');
    const userRole = userData?.currentRole?.trim();

    if (!data?.approvalDetail) return false;

    let approvals: any[] = [];
    if (Array.isArray(data.approvalDetail)) {
      approvals = data.approvalDetail;
    } else {
      try {
        approvals = JSON.parse(data.approvalDetail);
      } catch (e) {
        console.error('Error parsing approvalDetail', e, data.approvalDetail);
        return false;
      }
    }

    if (!approvals.length) return false;
    const hasActed = approvals.some(item =>
      item.role?.trim() === userRole &&
      ['Forwarded', 'Approved/ Accepted', 'Rejected', 'Approved/Accepted'].includes(item.WfStatus)
    );

    if (userRole === 'MD Office') {
      const mdActed = approvals.some(
        item =>
          item.role?.trim() === 'MD Office' &&
          ['Approved/ Accepted', 'Approved/Accepted', 'Rejected'].includes(item.WfStatus)
      );
      if (mdActed) return true;

      const hrForwarded = approvals.some(
        item => item.role?.trim() === 'HR Admin' && item.WfStatus === 'Forwarded'
      );
      return !hrForwarded;
    }
    return hasActed;
  }

  canDelete(data: any): boolean {
    try {
      let approvalDetail = data.approvalDetail || [];
      if (typeof approvalDetail === 'string') {
        approvalDetail = JSON.parse(approvalDetail);
      }
      if (!Array.isArray(approvalDetail)) {
        approvalDetail = [];
      }
      const hasProgressed = approvalDetail.some(
        (item: any) =>
          item.wflevel !== 'Creator' && item.createdOn && item.createdOn !== ''
      );
      return !hasProgressed;
    } catch (e) {
      console.error('Invalid approvalDetail JSON', e);
      return true;
    }
  }

  canEdit(data: any): boolean {
    try {
      let approvalDetail = data.approvalDetail || [];
      if (typeof approvalDetail === 'string') {
        approvalDetail = JSON.parse(approvalDetail);
      }
      if (!Array.isArray(approvalDetail)) {
        approvalDetail = [];
      }
      const hasProgressed = approvalDetail.some(
        (item: any) =>
          item.wflevel !== 'Creator' && item.createdOn && item.createdOn !== ''
      );
      return !hasProgressed;
    } catch (e) {
      console.error('Invalid approvalDetail JSON', e);
      return true;
    }
  }


  printData(id: any) {
    try {
      this.isLoading = true;

      this.userService.getQuestionPaper(`uspMRFDynamicPrint|reauisitionId=${id}`).subscribe({
        next: (res: any) => {
          try {
            this.isLoading = false;
            const printText = res?.table?.[0]?.printText ?? '';
            this.printContent = printText || `<h2 class="text-center m-0">Data Not Found.</h2>`;
            this.isPrint = !!printText;
            this.printDialog = true;


          } catch (innerErr) {
            this.isLoading = false;
            console.error('Error processing print data:', innerErr);
          }
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Service error while fetching print data:', err);
        }
      });
    } catch (outerErr) {
      this.isLoading = false;
      console.error('Unexpected error in printData():', outerErr);
    }
  }

  trackByDrp(index: number, item: any) {
    return item.drpvalue;
  }

  printContentAction() {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Print</title>');
      printWindow.document.write('<style>body { font-family: Arial, sans-serif; padding: 20px; } table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid #ddd; padding: 8px; } </style>');
      printWindow.document.write('</head><body>');
      printWindow.document.write(this.printContent);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
     // printWindow.print();
    }
  }


}
