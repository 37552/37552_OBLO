import { Component, ChangeDetectorRef, signal } from '@angular/core';
import { TableTemplate, TableColumn } from '../table-template/table-template';
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
import { UserService } from '../shared/user-service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Toast } from 'primeng/toast';
import { MultiSelectModule } from 'primeng/multiselect';
import { Checkbox } from 'primeng/checkbox';
import { TreeNode } from "primeng/api";
import { TreeModule } from 'primeng/tree';
@Component({
  selector: 'app-user-hierarchy-flow',
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
    // Dialog,
    Checkbox,
    TreeModule
  ],
  providers: [
    ConfirmationService,
    MessageService
  ],
  templateUrl: './user-hierarchy-flow.html',
  styleUrl: './user-hierarchy-flow.scss'
})
export class UserHierarchyFlow {

  isLoading = true;
  visible: boolean = false;
  postType: string = '';
  header: any = '';
  selectedIndex: any = [];
  headerIcon: string = 'pi pi-plus';
  paramvaluedata: string = '';
  isFormLoading: boolean = false;
  data: any[] = [];
  userHieararchyForm: FormGroup;
  // groupListArray = []

  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true },
    { key: 'organisationName', header: 'Organisation', isVisible: true, isSortable: false },
    { key: 'departmentName', header: 'department', isVisible: true, isSortable: false },
    { key: 'designationName', header: 'designation', isVisible: true, isSortable: false },
    { key: 'employeeName', header: 'User', isVisible: true, isSortable: false },
    { key: 'indirectAccess', header: 'Indirect Access', isVisible: true, isSortable: false },
  ];
  pageNo = 1;
  pageSize = 5;
  searchText = '';
  totalCount = 0;
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  orgDrp = []
  departmentDrp = []
  designationDrp = []
  userDrp = []

  isLoadingDep: boolean = false
  isLoadingDes: boolean = false
  isLoadingUser: boolean = false
  // activityDrp = []
  upWardInWarDrp = []
  treeData = []

  files: TreeNode[] = [];
  selectedNode: TreeNode | null = null;
  expandedKeys: { [key: string]: boolean } = {};
  isDisable: boolean = true

  constructor(private fb: FormBuilder,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private message: MessageService,
    private cdr: ChangeDetectorRef) {
    this.userHieararchyForm = this.fb.group({
      organisation: ['', Validators.required],
      designation: ['', Validators.required],
      department: ['', Validators.required],
      user: ['', Validators.required],
      upWardInward: ['', Validators.required],
      isDirect: [false]
    });
  }


  get f() { return this.userHieararchyForm.controls }

  ngOnInit(): void {
    this.getOrg()
    this.getTableData(true);
    this.getUpwarInwardDrp()
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }


  getOrg() {
    this.userService.getQuestionPaper(`uspGetGroupDrpDown`).subscribe((res: any) => {
      this.orgDrp = res['table1']
      // this.activityDrp = res['table7']
      // this.inputTypeData = res['table6']
    })
  }

  getDrpData() {
    this.userService.getQuestionPaper(`uspGetGroupDrpDown`).subscribe((res: any) => {
      this.orgDrp = res['table1']
      this.departmentDrp = res['table2']
      this.designationDrp = res['table3']
    })
  }

  getUpwarInwardDrp() {
    this.userService.getQuestionPaper(`uspGetHierarchyFlowData`).subscribe((res: any) => {
      this.upWardInWarDrp = res['table']
    })
  }

  getDepartment() {
    this.isLoadingDep = true
    this.userHieararchyForm.patchValue({
      department: '',
      designation: '',
      user: ''
    })
    this.designationDrp = []
    this.userDrp = []
    this.userService.getQuestionPaper(`uspGetGroupDrpDown`).subscribe((res: any) => {
      setTimeout(() => {
        this.departmentDrp = res['table2']
        this.isLoadingDep = false
        this.cdr.detectChanges();
      }, 1000);
    })
  }

  getDesignation() {
    this.isLoadingDes = true
    this.userHieararchyForm.patchValue({
      designation: '',
      user: ''
    })
    this.userDrp = []
    this.userService.getQuestionPaper(`uspGetGroupDrpDown`).subscribe((res: any) => {
      setTimeout(() => {
        this.designationDrp = res['table3']
        this.isLoadingDes = false
        this.cdr.detectChanges();
      }, 1000);
    })
  }

  getUser() {
    this.isLoadingUser = true
    let org = this.userHieararchyForm.get('organisation')?.value ? this.userHieararchyForm.get('organisation')?.value?.drpValue : 0
    let dep = this.userHieararchyForm.get('department')?.value ? this.userHieararchyForm.get('department')?.value?.drpValue : 0
    let des = this.userHieararchyForm.get('designation')?.value ? this.userHieararchyForm.get('designation')?.value?.drpValue : 0
    this.userService.getQuestionPaper(`uspGetGroupDrpDown|orgId=${org}|deptId=${dep}|desgId=${des}`).subscribe((res: any) => {
      setTimeout(() => {
        this.userDrp = res['table4']
        this.isLoadingUser = false
        this.cdr.detectChanges();
      }, 1000);
    })
  }

  getTableData(isTrue: boolean) {
    if (isTrue) { this.isLoading = true; } else {
      this.pageNo = 1
    }
    const roleId = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
    const query = `appUserId=${sessionStorage.getItem('userId')}|appUserRole=${roleId}|districtId=${sessionStorage.getItem('District')}|searchText=${this.searchText}|pageIndex=${this.pageNo}|size=${this.pageSize}|activity=header`;
    this.userService.getQuestionPaper(`uspGetHierarchyFlow|${query}`).subscribe((res: any) => {
      this.data = res?.table1 || [];
      this.totalCount = res?.table?.[0]?.totalCnt || this.data.length;
      setTimeout(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }, 1000);
    });
  }
  getUserTree() {
    let flowId = this.userHieararchyForm.get('upWardInward')?.value?.drpValue
    if (flowId == '10001' || flowId == '10002') { this.isDisable = false } else { this.isDisable = true }
    let isDirect = this.userHieararchyForm.get('isDirect')?.value == true ? 1 : 0
    let user = this.userHieararchyForm.get('user')?.value?.drpValue
    this.files = []
    this.treeData = []
    this.userHieararchyForm.patchValue({
      isDirect: false
    })

    this.userService.getQuestionPaper(`uspGetHierarchyFlowData|flowId=${flowId}|indirectAccess=${isDirect}|empId=${user}`).subscribe((res: any) => {
      // let obj = JSON.parse(res['table1'][0].childJson)
      // this.files = [this.mapToTreeNode(obj)];
      setTimeout(() => {
        this.treeData = res['table1']
        this.files = res['table1'].map((item: any) => this.mapToTreeNode(item));
        // Optional: expand all nodes by default
        this.expandAllNodes(this.files);
        this.cdr.detectChanges();
      }, 1000);

    })
  }



  mapToTreeNode(obj: any): TreeNode {
    const node: TreeNode = {
      label: obj.employee ?? `#${obj.id}`,
      data: obj,
      key: String(obj.id),
    };

    try {
      const childrenRaw =
        typeof obj.childJson === 'string'
          ? JSON.parse(obj.childJson)
          : obj.childJson || [];

      if (Array.isArray(childrenRaw) && childrenRaw.length) {
        node.children = childrenRaw.map((c: any) => this.mapToTreeNode(c));
      }
    } catch (err) {
      console.warn('Failed to parse childJson', obj, err);
    }

    return node;
  }

  // Expand all nodes
  expandAllNodes(nodes: TreeNode[]) {

    nodes.forEach((node) => {

      this.expandedKeys[node.key!] = true;
      if (node.children) {
        this.expandAllNodes(node.children);
      }
    });
  }

  onNodeSelect(event: any) {
    this.selectedNode = event.node;
  }

  onNodeUnselect() {
    this.selectedNode = null;
  }


  isInvalid(field: string): boolean {
    const control = this.userHieararchyForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
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
      this.getDrpData()
      this.selectedIndex = data;
      if (view === 'view') {
        this.userHieararchyForm.disable();
        setTimeout(() => {
          this.isFormLoading = false
          this.cdr.detectChanges();
        }, 1000);
      }
    }

    this.userHieararchyForm.patchValue({
      organisation: data.orgId ? { drpOption: data.organisationName, drpValue: data.orgId } : '',
      designation: data.desgId ? { drpOption: data.designationName, drpValue: data.desgId } : '',
      department: data.deptId ? { drpOption: data.departmentName, drpValue: data.deptId } : '',
      user: data.empId ? { drpOption: data.employeeName, drpValue: data.empId } : '',
      upWardInward: data.hierarchyFlowId ? { drpOption: data.hierarchyFlow, drpValue: data.hierarchyFlowId } : '',
      isDirect: data.indirectAccess ? data.indirectAccess : false
    })
    this.getUser()


  }


  onSubmit(event: any) {
    
    if (!this.userHieararchyForm.valid) {
      this.userHieararchyForm.markAllAsTouched();
      return;
    }

    this.paramvaluedata = ``
    let org = this.userHieararchyForm.get('organisation')?.value?.drpValue
    let dept = this.userHieararchyForm.get('department')?.value?.drpValue
    let desg = this.userHieararchyForm.get('designation')?.value?.drpValue
    let user = this.userHieararchyForm.get('user')?.value?.drpValue
    let upWardInward = this.userHieararchyForm.get('upWardInward')?.value?.drpValue
    let isDirect = this.userHieararchyForm.get('isDirect')?.value == true ? 1 : 0
    this.paramvaluedata = `hierarchyId=${upWardInward}|orgId=${org}|deptId=${dept}|desgId=${desg}|empId=${user}|indirectAccess=${isDirect}|childJson=${JSON.stringify(this.treeData)}`
    this.openConfirmation('Confirm?', "Are you sure you want to proceed?", '1', '1', event);
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
          
          // this.deleteData();
        } else if (option === '4') {

        } else if (option === '5') {

        }
      },
      reject: () => {
        if (option === '4') {
          // this.inputTypeData.patchValue({
          //   groupType: this.previousGroupType
          // })
        }
      }
    });
  }

  submitcall() {
    this.isFormLoading = true;
    const roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
    let query = '';
    let SP = '';

    if (this.postType === 'update') {
      query = `action=UPDATE|${this.paramvaluedata}|id=${this.selectedIndex.id}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${roleID}`;
      SP = `uspUpdateHierarchyFlow`;
    }
    else {
      query = `${this.paramvaluedata}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${roleID}`;
      SP = `uspPostHierarchyFlow`;
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


  onDrawerHide() {
    document.body.style.overflow = 'visible'; // restore scroll
    this.userHieararchyForm.enable()
    this.visible = false;
    this.onClear()
  }
  onClear() {
    this.userHieararchyForm.reset()
    this.departmentDrp = []
    this.designationDrp = []
    this.userDrp = []
    this.treeData = []
    this.files = []
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




}
