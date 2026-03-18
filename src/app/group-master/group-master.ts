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
@Component({
  selector: 'app-group-master',
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
  templateUrl: './group-master.html',
  styleUrl: './group-master.scss'
})
export class GroupMaster {
  isLoading = true;
  visible: boolean = false;
  postType: string = '';
  header: any = '';
  selectedIndex: any = [];
  headerIcon: string = 'pi pi-plus';
  paramvaluedata: string = '';
  isFormLoading: boolean = false;
  data: any[] = [];
  groupMasterForm: FormGroup;
  groupListArray = []

  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true },
    { key: 'groupName', header: 'Group Name', isVisible: true, isSortable: false },
    { key: 'groupType', header: 'Group Type', isVisible: true, isSortable: false },
    { key: 'jsonDetails', header: 'Group List', isVisible: true, isSortable: false, isCustom: true },
  ];
  pageNo = 1;
  pageSize = 5;
  searchText = '';
  totalCount = 0;
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';


  showOrganisation = signal(false);
  showDepartment = signal(false);
  showDesignation = signal(false);
  showUser = signal(false);
  showAddBtn = signal(false)

  groupTypes = [];
  orgDrp = []
  departmentDrp = []
  designationDrp = []
  userDrp = []

  departmentDrpNew = []
  designationDrpNew = []
  childArrData: any = []
  previousGroupType: any;

  selectedrowIndex: any

  selectedItemEdit = null
  slectedEdtIndex = null

  itemDailog: boolean = false

  constructor(private fb: FormBuilder,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private message: MessageService,
    private cdr: ChangeDetectorRef) {
    this.groupMasterForm = this.fb.group({
      groupName: ['', Validators.required],
      groupType: ['', Validators.required],
      organisation: [''],
      designation: [''],
      department: [''],
      user: ['']
    });
  }

  get f() { return this.groupMasterForm.controls }

  ngOnInit(): void {
    this.getTableData(true);
    this.getGroupType()
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  getGroupType() {
    this.userService.getQuestionPaper(`uspGetGroupDrpDown`).subscribe((res: any) => {
      this.groupTypes = res['table']
      this.orgDrp = res['table1']
      this.designationDrp = res['table3']
      this.departmentDrp = res['table2']
    })
  }

  getUser() {
    let org = this.groupMasterForm.get('organisation')?.value ? this.groupMasterForm.get('organisation')?.value?.drpValue : 0
    let dep = this.groupMasterForm.get('department')?.value ? this.groupMasterForm.get('department')?.value?.drpValue : 0
    let des = this.groupMasterForm.get('designation')?.value ? this.groupMasterForm.get('designation')?.value?.drpValue : 0
    this.userService.getQuestionPaper(`uspGetGroupDrpDown|orgId=${org}|deptId=${dep}|desgId=${des}`).subscribe((res: any) => {
      this.userDrp = res['table4']
    })
  }



  getTableData(isTrue: boolean) {
    if (isTrue) { this.isLoading = true; } else {
      this.pageNo = 1
    }

    const roleId = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
    const query = `appUserId=${sessionStorage.getItem('userId')}|appUserRole=${roleId}|districtId=${sessionStorage.getItem('District')}|searchText=${this.searchText}|pageIndex=${this.pageNo}|size=${this.pageSize}|activity=header`;

    this.userService.getQuestionPaper(`uspGetUserGroupDetail|${query}`).subscribe((res: any) => {
      this.data = res?.table1 || [];
      this.totalCount = res?.table?.[0]?.totalCnt || this.data.length;
      setTimeout(() => {
        this.isLoading = false;
        this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
      }, 1000);
    });
  }

  showDialog(view: string, data: any) {

    if (view == 'add') {
      this.visible = true;
      this.postType = view;
      this.header = view === 'add' ? 'Add' : (view === 'update' ? 'Update' : 'View');
      this.headerIcon = view === 'add' ? 'pi pi-plus' : (view === 'update' ? 'pi pi-pencil' : 'pi pi-eye');
    } else {
      
      this.visible = true;
      this.postType = view;
      this.header = view === 'add' ? 'Add' : (view === 'update' ? 'Update' : 'View');
      this.headerIcon = view === 'add' ? 'pi pi-plus' : (view === 'update' ? 'pi pi-pencil' : 'pi pi-eye');

      this.selectedIndex = data;
      if (view === 'view') {
        this.groupMasterForm.disable();
      }
      else {
        this.groupMasterForm.enable();
        this.groupMasterForm.get('groupType')?.disable();
      }
      this.groupMasterForm.patchValue({
        groupName: data.groupName ? data.groupName : '',
        groupType: data.groupType ? { drpOption: data.groupType, drpValue: data.groupTypeId } : ''
      })
      this.toggleDropDowns()
      this.childArrData = JSON.parse(data?.childDetails)

    }


    document.body.style.overflow = 'hidden'
  }



  onSubmit(event: any) {

    let groupName = this.groupMasterForm.get('groupName')?.value
    let groupType = this.groupMasterForm.get('groupType')?.value


    if (groupName == '') {
      this.message.add({ severity: 'warn', summary: 'Warn', detail: 'Enter group name' });
      return
    }
    else if (groupType == '') {
      this.message.add({ severity: 'warn', summary: 'Warn', detail: 'Select group type' });
      return
    }
    else if (this.childArrData.length == 0) {
      this.message.add({ severity: 'warn', summary: 'Warn', detail: 'Add atleast one group' });
      return
    }


    this.paramvaluedata = ''
    this.paramvaluedata = `groupName=${groupName}|groupTypeId=${groupType?.drpValue}|childJson=${JSON.stringify(this.childArrData)}`
    this.openConfirmation('Confirm?', "Are you sure you want to proceed?", '1', '1', event);
  }


  toggleDropDowns() {
    if (this.childArrData.length == 0) {

      let groupType = this.groupMasterForm.get('groupType')?.value;
      this.previousGroupType = groupType
      // Reset signals
      this.showOrganisation.set(false);
      this.showDepartment.set(false);
      this.showDesignation.set(false);
      this.showUser.set(false);
      this.showAddBtn.set(false);

      // Clear all validators first
      this.setRequired('organisation', false);
      this.setRequired('department', false);
      this.setRequired('designation', false);
      this.setRequired('user', false);
      if (this.postType == 'add') {
        switch (groupType?.drpValue) {
          case 10000.0: // Organisation Wise
            this.showOrganisation.set(true);
            this.setRequired('organisation', true);
            break;

          case 10001.0: // Department Wise
            this.showOrganisation.set(true);
            this.showDepartment.set(true);
            this.setRequired('organisation', true);
            this.setRequired('department', true);
            break;

          case 10002.0: // Designation Wise
            this.showOrganisation.set(true);
            this.showDepartment.set(true);
            this.showDesignation.set(true);
            this.setRequired('organisation', true);
            this.setRequired('department', true);
            this.setRequired('designation', true);
            break;

          case 10003.0: // User Wise
            this.showOrganisation.set(true);
            this.showDepartment.set(true);
            this.showDesignation.set(true);
            this.showUser.set(true);
            this.setRequired('organisation', true);
            this.setRequired('department', true);
            this.setRequired('designation', true);
            this.setRequired('user', true);
            break;
        }
      } else {
        this.showOrganisation.set(true);
        this.showDepartment.set(true);
        this.showDesignation.set(true);
        this.showUser.set(true);
        this.setRequired('organisation', true);
        this.setRequired('department', true);
        this.setRequired('designation', true);
        this.setRequired('user', true);
      }


      this.showAddBtn.set(true);

      // Reset field values when type changes
      this.groupMasterForm.patchValue({
        organisation: '',
        department: '',
        designation: '',
        user: ''
      });



    } else {
      this.openConfirmation('Confirm?', "Are you sure you want to change group type?", '1', '4', '');
      return
    }


  }




  onDrawerHide() {
    document.body.style.overflow = 'visible'; // restore scroll
    this.groupMasterForm.enable()
    this.groupMasterForm.reset()
    this.showOrganisation.set(false);
    this.showDepartment.set(false);
    this.showDesignation.set(false);
    this.showUser.set(false);
    this.childArrData = []
    this.visible = false;
  }


  isInvalid(field: string): boolean {
    const control = this.groupMasterForm.get(field);
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
        } else if (option === '4') {
          
          this.childArrData = []
          this.toggleDropDowns()
        } else if (option === '5') {
          this.childArrData.splice(this.selectedrowIndex, 1);
        }
      },
      reject: () => {
        if (option === '4') {
          this.groupMasterForm.patchValue({
            groupType: this.previousGroupType
          })
        }
      }
    });
  }


  onClear() {
    // this.groupMasterForm.enable()
    this.groupMasterForm.reset()
    this.showOrganisation.set(false);
    this.showDepartment.set(false);
    this.showDesignation.set(false);
    this.showUser.set(false);
  }


  onChangeOrg() {
    setTimeout(() => {
      this.departmentDrpNew = this.departmentDrp
      this.designationDrpNew = []
      this.userDrp = []
      this.groupMasterForm.patchValue({
        department: '',
        designation: '',
        user: ''
      })
    }, 1000);

  }

  onChangeDepartment() {
    setTimeout(() => {
      this.designationDrpNew = this.designationDrp
      this.userDrp = []
      this.groupMasterForm.patchValue({
        designation: '',
        user: ''
      })
    }, 1000);
  }


  submitcall() {

    this.isFormLoading = true;
    const roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
    let query = '';
    let SP = '';

    if (this.postType === 'update') {
      query = `action=UPDATE|${this.paramvaluedata}|userGroupId=${this.selectedIndex.id}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${roleID}|activity=header`;
      SP = `uspUpdateUserGroupDetail`;
    }
    else {
      query = `${this.paramvaluedata}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${roleID}|activity=header`;
      SP = `uspPostUserGroupDetail`;
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
      } else if (resultarray[0] == "2") {
        this.message.add({ severity: 'warn', summary: 'Warn', detail: resultarray[1] || datacom });
      }
      else {
        this.message.add({ severity: 'warn', summary: 'Warn', detail: datacom, });
      }
    });

  }



  deleteData() {
    const roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
    let query = `action=DELETE|groupName=|groupTypeId=0|childJson=[]|userGroupId=${this.selectedIndex.id}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${roleID}|activity=header`;
    this.userService.SubmitPostTypeData(`uspUpdateUserGroupDetail`, query, 'header').subscribe((datacom: any) => {
      this.isFormLoading = false;
      if (!datacom) return;

      const resultarray = datacom.split("-");
      if (resultarray[1] === "success") {
        this.getTableData(true);
        this.message.add({ severity: 'success', summary: 'Success', detail: 'Data deleted' });
        this.onDrawerHide();
      } else {
        this.message.add({ severity: 'warn', summary: 'Warn', detail: resultarray[1] || datacom, });
      }
    });
  }


  AddRow() {

    if (!this.groupMasterForm.valid) {
      this.groupMasterForm.markAllAsTouched();
      return
    }

    let obj: any = {
      org: this.groupMasterForm.get('organisation')?.value?.drpOption,
      orgId: this.groupMasterForm.get('organisation')?.value?.drpValue,
      dept: this.groupMasterForm.get('department')?.value?.drpOption ? this.groupMasterForm.get('department')?.value?.drpOption : '',
      deptId: this.groupMasterForm.get('department')?.value?.drpValue ? this.groupMasterForm.get('department')?.value?.drpValue : 0,
      desg: this.groupMasterForm.get('designation')?.value?.drpOption ? this.groupMasterForm.get('designation')?.value?.drpOption : '',
      desgId: this.groupMasterForm.get('designation')?.value?.drpValue ? this.groupMasterForm.get('designation')?.value?.drpValue : 0,
      emp: this.groupMasterForm.get('user')?.value?.drpOption ? this.groupMasterForm.get('user')?.value?.drpOption : '',
      empId: this.groupMasterForm.get('user')?.value?.drpValue ? this.groupMasterForm.get('user')?.value?.drpValue : 0
    }

    if (this.childArrData?.length > 0) {
      let isUserAvailable = this.childArrData.some((item: any) => item.empId === obj.empId)
      
      if (isUserAvailable) {
        this.message.add({ severity: 'warn', summary: 'Warn', detail: 'Selected employee already exist in list!' });
        return
      }
    }

    this.childArrData.push(obj);
    this.groupMasterForm.patchValue({
      organisation: '',
      department: '',
      designation: '',
      user: ''
    })

    // this.setRequired('organisation', false);
    // this.setRequired('department', false);
    // this.setRequired('designation', false);
    // this.setRequired('user', false);





  }




  private setRequired(field: string, isRequired: boolean) {
    const control = this.groupMasterForm.get(field);
    if (!control) return;

    if (isRequired) {
      control.setValidators([Validators.required]);
    } else {
      control.clearValidators();
    }
    control.updateValueAndValidity();
  }
  onDeleteRow(data: any, index: number) {
    
    this.selectedrowIndex = index
    this.openConfirmation("Confirm", "Are you sure want to delete?", '1', '5');
  }


  showGrouplist(data: any) {
    this.itemDailog = true
    this.groupListArray = JSON.parse(data?.childDetails)
  }

}
