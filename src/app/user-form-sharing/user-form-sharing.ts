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
  selector: 'app-user-form-sharing',
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
    // Dialog
  ],
  providers: [
    ConfirmationService,
    MessageService
  ],
  templateUrl: './user-form-sharing.html',
  styleUrl: './user-form-sharing.scss'
})
export class UserFormSharing {

  isLoading = true;
  visible: boolean = false;
  postType: string = '';
  header: any = '';
  selectedIndex: any = [];
  headerIcon: string = 'pi pi-plus';
  paramvaluedata: string = '';
  isFormLoading: boolean = false;
  data: any[] = [];
  userSharingAccessForm: FormGroup;

  fromUserOrgDrp = []
  fromUserDepartmentDrp = []
  fromUserDesignationDrp = []
  fromUserActivityDrp = []
  fromUserEmpDrp = []

  toUserOrgDrp = []
  toUserDepartmentDrp = []
  toUserDesignationDrp = []
  // toUserActivityDrp = []
  toUserEmpDrp = []
  inputTypeData: any = []


  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true },
    { key: 'accessFrom', header: 'Access From', isVisible: true, isSortable: false },
    { key: 'accessTo', header: 'Access To', isVisible: true, isSortable: false },
    { key: 'activity', header: 'Activity', isVisible: true, isSortable: false }
  ];

  isLoadingFromDep: boolean = false
  isLoadingFromDes: boolean = false
  isLoadingFromUser: boolean = false
  isLoadingToDep: boolean = false
  isLoadingToDes: boolean = false
  isLoadingToUser: boolean = false
  isLoadingToActivity: boolean = false

  pageNo = 1;
  pageSize = 5;
  searchText = '';
  totalCount = 0;
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';




  constructor(private fb: FormBuilder,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private message: MessageService,
    private cdr: ChangeDetectorRef) {
    this.userSharingAccessForm = this.fb.group({
      fromUserorg: ['', Validators.required],
      fromUserdesg: ['', Validators.required],
      fromUserdept: ['', Validators.required],
      fromUserEmp: ['', Validators.required],
      fromUserActivity: ['', Validators.required],
      toUserorg: ['', Validators.required],
      toUserdesg: ['', Validators.required],
      toUserdept: ['', Validators.required],
      toUserEmp: ['', Validators.required],
      // toUserActivity: ['', Validators.required],
    });
  }

  get f() { return this.userSharingAccessForm.controls }


  ngOnInit(): void {
    this.getOrg("from")
    this.getOrg("to")
    this.getTableData(true);
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }


  getOrg(action: string) {
    this.userService.getQuestionPaper(`uspGetGroupDrpDown`).subscribe((res: any) => {
      if (action == 'from') {
        this.fromUserOrgDrp = res['table1']
        // this.fromUserActivityDrp = res['table7']
      } else {
        this.toUserOrgDrp = res['table1']
        // this.toUserActivityDrp = res['table7']
      }
      // this.inputTypeData = res['table6']
    })
  }


  getDepartment(action: string) {
    if (action === "from") {
      this.isLoadingFromDep = true
      this.userSharingAccessForm.patchValue({
        fromUserdept: '',
        fromUserdesg: '',
        fromUserEmp: '',
        fromUserActivity: ''
      })
      this.fromUserDesignationDrp = []
      this.fromUserEmpDrp = []
      this.fromUserActivityDrp = []
    } else {
      this.isLoadingToDep = true
      this.userSharingAccessForm.patchValue({
        toUserdept: '',
        toUserdesg: '',
        toUserEmp: ''
      })
      this.toUserDesignationDrp = []
      this.toUserEmpDrp = []
    }
    this.userService.getQuestionPaper(`uspGetGroupDrpDown`).subscribe((res: any) => {
      if (action === "from") {
        setTimeout(() => {
          this.fromUserDepartmentDrp = res['table2']
          this.isLoadingFromDep = false
          this.cdr.detectChanges();
        }, 1000);
      } else {
        setTimeout(() => {
          this.toUserDepartmentDrp = res['table2']
          this.isLoadingToDep = false
          this.cdr.detectChanges();
        }, 1000);
      }

    })
  }

  getDesignation(action: string) {
    if (action === "from") {
      this.isLoadingFromDes = true
      this.userSharingAccessForm.patchValue({
        fromUserdesg: '',
        fromUserEmp: '',
        fromUserActivity: ''
      })
      this.fromUserEmpDrp = []
      this.fromUserActivityDrp = []
    } else {
      this.isLoadingToDes = true
      this.userSharingAccessForm.patchValue({
        toUserdesg: '',
        toUserEmp: ''
      })
      this.toUserEmpDrp = []
    }

    this.userService.getQuestionPaper(`uspGetGroupDrpDown`).subscribe((res: any) => {
      if (action === "from") {
        setTimeout(() => {
          this.fromUserDesignationDrp = res['table3']
          this.isLoadingFromDes = false
          this.cdr.detectChanges();
        }, 1000);
      } else {
        setTimeout(() => {
          this.toUserDesignationDrp = res['table3']
          this.isLoadingToDes = false
          this.cdr.detectChanges();
        }, 1000);
      }
    })
  }

  getUser(action: string) {
    let org = ''
    let dep = ''
    let des = ''

    if (action === "from") {
      if (this.postType == 'add') {
        this.userSharingAccessForm.patchValue({
          fromUserEmp: '',
          fromUserActivity: ''
        })
        this.fromUserActivityDrp = []
        this.isLoadingFromUser = true
      }

      org = this.userSharingAccessForm.get('fromUserorg')?.value ? this.userSharingAccessForm.get('fromUserorg')?.value?.drpValue : 0
      dep = this.userSharingAccessForm.get('fromUserdept')?.value ? this.userSharingAccessForm.get('fromUserdept')?.value?.drpValue : 0
      des = this.userSharingAccessForm.get('fromUserdesg')?.value ? this.userSharingAccessForm.get('fromUserdesg')?.value?.drpValue : 0
      
    } else {
      this.isLoadingToUser = true
      org = this.userSharingAccessForm.get('toUserorg')?.value ? this.userSharingAccessForm.get('toUserorg')?.value?.drpValue : 0
      dep = this.userSharingAccessForm.get('toUserdept')?.value ? this.userSharingAccessForm.get('toUserdept')?.value?.drpValue : 0
      des = this.userSharingAccessForm.get('toUserdesg')?.value ? this.userSharingAccessForm.get('toUserdesg')?.value?.drpValue : 0
      
    }
    this.userService.getQuestionPaper(`uspGetGroupDrpDown|orgId=${org}|deptId=${dep}|desgId=${des}`).subscribe((res: any) => {
      if (action === "from") {
        if (this.postType == 'add') {
          this.userSharingAccessForm.patchValue({
            toUserEmp: '',
          })
        }

        setTimeout(() => {
          this.fromUserEmpDrp = res['table4']
          this.isLoadingFromUser = false
          this.cdr.detectChanges();
        }, 1000);
      } else {
        setTimeout(() => {
          let fromUser = this.userSharingAccessForm.get('fromUserEmp')?.value ? this.userSharingAccessForm.get('fromUserEmp')?.value?.drpValue : 0
          this.toUserEmpDrp = res['table4'].filter((item: any) => item.drpValue !== fromUser);
          this.isLoadingToUser = false
          this.cdr.detectChanges();
        }, 1000);
      }
    })
  }

  getActivity() {
    this.isLoadingToActivity = true
    if (this.postType == 'add') {
      this.userSharingAccessForm.patchValue({
        toUserorg: '',
        toUserdesg: '',
        toUserdept: '',
        toUserEmp: '',
        fromUserActivity: ''
      })
      this.toUserDepartmentDrp = []
      this.toUserDesignationDrp = []
      this.toUserDepartmentDrp = []
      this.fromUserActivityDrp = []
    }

    let emp = this.userSharingAccessForm.get('fromUserEmp')?.value ? this.userSharingAccessForm.get('fromUserEmp')?.value?.drpValue : 0
    this.userService.getQuestionPaper(`uspGetEmpActivityPermission|empId=${emp}`).subscribe((res: any) => {
      setTimeout(() => {
        this.fromUserActivityDrp = res['table']
        this.isLoadingToActivity = false
        this.cdr.detectChanges();
      }, 1000);
    })

  }

  getDrpData() {
    this.userService.getQuestionPaper(`uspGetGroupDrpDown`).subscribe((res: any) => {
      // this.orgDrp = res['table1']
      this.fromUserDepartmentDrp = res['table2']
      this.toUserDepartmentDrp = res['table2']
      this.fromUserDesignationDrp = res['table3']
      this.toUserDesignationDrp = res['table3']
    })
  }

  getTableData(isTrue: boolean) {
    if (isTrue) { this.isLoading = true; } else {
      this.pageNo = 1
    }
    const roleId = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
    const query = `appUserId=${sessionStorage.getItem('userId')}|appUserRole=${roleId}|districtId=${sessionStorage.getItem('District')}|searchText=${this.searchText}|pageIndex=${this.pageNo}|size=${this.pageSize}|activity=header`;
    this.userService.getQuestionPaper(`uspGetUserFormSharingAccess|${query}`).subscribe((res: any) => {
      this.data = res?.table1 || [];
      this.totalCount = res?.table?.[0]?.totalCnt || this.data.length;
      setTimeout(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }, 1000);
    });
  }

  showDialog(view: string, data: any) {
    
    this.isFormLoading = true
    if (view == 'add') {
      this.visible = true;
      this.postType = view;
      this.header = view === 'add' ? 'Add' : (view === 'update' ? 'Update' : 'View');
      this.headerIcon = view === 'add' ? 'pi pi-plus' : (view === 'update' ? 'pi pi-pencil' : 'pi pi-eye');
      setTimeout(() => {
        this.isFormLoading = false
        this.cdr.detectChanges();
      }, 1000);
    } else {
      this.visible = true;
      this.postType = view;
      this.header = view === 'add' ? 'Add' : (view === 'update' ? 'Update' : 'View');
      this.headerIcon = view === 'add' ? 'pi pi-plus' : (view === 'update' ? 'pi pi-pencil' : 'pi pi-eye');
      this.getDrpData()
      this.selectedIndex = data;
      if (view === 'view') {
        this.userSharingAccessForm.disable();
        setTimeout(() => {
          this.isFormLoading = false
          this.cdr.detectChanges();
        }, 1000);
      } else {
        this.userSharingAccessForm.get('fromUserorg')?.disable()
        this.userSharingAccessForm.get('fromUserdesg')?.disable()
        this.userSharingAccessForm.get('fromUserdept')?.disable()
        this.userSharingAccessForm.get('fromUserEmp')?.disable()
        this.userSharingAccessForm.get('fromUserActivity')?.disable()
        this.userSharingAccessForm.get('toUserorg')?.disable()
        this.userSharingAccessForm.get('toUserdesg')?.disable()
        this.userSharingAccessForm.get('toUserdept')?.disable()
        setTimeout(() => {
          this.isFormLoading = false
          this.cdr.detectChanges();
        }, 1000);


      }

      this.userSharingAccessForm.patchValue({
        fromUserorg: data.fromOrgId ? { drpOption: data.fromOrg, drpValue: data.fromOrgId } : '',
        fromUserdesg: data.fromDesgId ? { drpOption: data.fromDesg, drpValue: data.fromDesgId } : '',
        fromUserdept: data.fromDepId ? { drpOption: data.fromDep, drpValue: data.fromDepId } : '',
        fromUserEmp: data.accessFromId ? { drpOption: data.accessFrom, drpValue: data.accessFromId } : '',
        fromUserActivity: data.activityId ? { drpOption: data.activity, drpValue: data.activityId } : '',
        toUserorg: data.toOrgId ? { drpOption: data.toOrg, drpValue: data.toOrgId } : '',
        toUserdesg: data.toDesgId ? { drpOption: data.toDesg, drpValue: data.toDesgId } : '',
        toUserdept: data.toDepId ? { drpOption: data.toDep, drpValue: data.toDepId } : '',
        toUserEmp: data.accessToId ? { drpOption: data.accessTo, drpValue: data.accessToId } : '',
      })
      setTimeout(() => {
        this.getUser("from")
        this.getUser("to")
        this.getActivity()
      }, 1000);


      this.inputTypeData = JSON.parse(data?.permissionJson)
      setTimeout(() => {
        this.cdr.detectChanges();
        this.isFormLoading = false
      }, 1000);
    }
    document.body.style.overflow = 'hidden'
  }


  onSubmit(event: any) {

    if (!this.userSharingAccessForm.valid) {
      this.userSharingAccessForm.markAllAsTouched();
      return;
    }

    // if (this.postType === 'add' && !this.userSharingAccessForm.valid) {
    //   this.userSharingAccessForm.markAllAsTouched();
    //   return;
    // }

    const rawValues = this.userSharingAccessForm.getRawValue(); // includes disabled controls
    let fromUser = rawValues.fromUserEmp?.drpValue;
    let toUser = rawValues.toUserEmp?.drpValue;
    let activity = rawValues.fromUserActivity?.drpValue;

    // let user = this.userAccessForm.get('user')?.value ? this.userAccessForm.get('user')?.value?.drpValue : 0
    // let activity = this.userAccessForm.get('activity')?.value ? this.userAccessForm.get('activity')?.value?.drpValue : 0

    if (this.postType === 'update') {
      const anyChecked = this.inputTypeData.some((row: any) =>
        this.isCheckedValue(row.canAdd) ||
        this.isCheckedValue(row.canView) ||
        this.isCheckedValue(row.canEdit) ||
        this.isCheckedValue(row.canDelete)
      );

      if (!anyChecked) {
        this.message.add({
          severity: 'warn',
          summary: 'Validation',
          detail: 'Please select at least one permission before submitting.'
        });
        return;
      }
    }

    // formJson=${JSON.stringify(this.inputTypeData)}
    this.paramvaluedata = ''
    this.paramvaluedata = `accessFromId=${fromUser}|accessToId=${toUser}|activityId=${activity}`
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

          this.deleteData();
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
      query = `action=UPDATE|${this.paramvaluedata}|formJson=${JSON.stringify(this.inputTypeData)}|sharingId=${this.selectedIndex.sharingId}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${roleID}|activity=header`;
      SP = `uspUpdateUserFormSharingAccess`;
    }
    else {
      query = `${this.paramvaluedata}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${roleID}|activity=header`;
      SP = `uspPostUserFormSharingAccess`;
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
    
    const roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
    let query = `action=DELETE|accessFromId=0|accessToId=0|formJson=[]|sharingId=${this.selectedIndex.sharingId}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${roleID}|activityId=0|activity=header`;
    this.userService.SubmitPostTypeData(`uspUpdateUserFormSharingAccess`, query, 'header').subscribe((datacom: any) => {
      this.isFormLoading = false;
      if (!datacom) return;

      const resultarray = datacom.split("-");
      if (resultarray[1] === "success") {
        this.getTableData(true);
        this.message.add({ severity: 'success', summary: 'Success', detail: 'Data deleted' });
        this.onDrawerHide();
      } else {
        this.message.add({ severity: 'warn', summary: 'Warn', detail: datacom, });
      }
    });
  }

  onDrawerHide() {
    document.body.style.overflow = 'visible'; // restore scroll
    this.userSharingAccessForm.enable()
    this.visible = false;
    this.onClear()
  }


  onChangeToUser() {
    let fromUser = this.userSharingAccessForm.get('fromUserEmp')?.value ? this.userSharingAccessForm.get('fromUserEmp')?.value?.drpValue : 0
    if (fromUser == 0) {
      this.message.add({ severity: 'warn', summary: 'Warn', detail: 'select from user first!' });
      this.userSharingAccessForm.patchValue({
        toUserEmp: ''
      })
      return
    }
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
  isInvalid(field: string): boolean {
    const control = this.userSharingAccessForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onClear() {
    this.userSharingAccessForm.reset()
    this.fromUserDepartmentDrp = []
    this.fromUserDesignationDrp = []
    this.fromUserEmpDrp = []
    this.toUserDepartmentDrp = []
    this.toUserDesignationDrp = []
    this.toUserEmpDrp = []
    this.inputTypeData.forEach((row: any) => {
      row.canAdd = 0;
      row.canView = 0;
      row.canEdit = 0;
      row.canDelete = 0;
    });
  }

  onPermissionChange(row: any, key: 'canAdd' | 'canView' | 'canEdit' | 'canDelete', checked: boolean) {
    row[key] = checked ? 1 : 0;
    // Debug:
    // console.log(`changed ${row.drpOption}.${key} =>`, row[key]);
  }

  // Robust truth check for many input types (0/1, "0"/"1", true/false, "true")
  public isCheckedValue(val: any): boolean {
    if (val === true) return true;
    if (val === false) return false;
    if (val === 1 || val === '1') return true;
    if (val === 0 || val === '0') return false;
    const n = Number(val);
    if (!isNaN(n)) return n !== 0;
    if (typeof val === 'string') return val.toLowerCase() === 'true';
    return !!val;
  }
}
