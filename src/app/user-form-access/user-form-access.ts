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
  selector: 'app-user-form-access',
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
  templateUrl: './user-form-access.html',
  styleUrl: './user-form-access.scss'
})
export class UserFormAccess {


  isLoading = true;
  visible: boolean = false;
  postType: string = '';
  header: any = '';
  selectedIndex: any = [];
  headerIcon: string = 'pi pi-plus';
  paramvaluedata: string = '';
  isFormLoading: boolean = false;
  data: any[] = [];
  userAccessForm: FormGroup;


  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true },
    { key: 'org', header: 'Organisation', isVisible: true, isSortable: false },
    { key: 'dept', header: 'department', isVisible: true, isSortable: false },
    { key: 'desg', header: 'designation', isVisible: true, isSortable: false },
    { key: 'emp', header: 'User', isVisible: true, isSortable: false },
    { key: 'activityName', header: 'Activity', isVisible: true, isSortable: false }
    
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
  activityDrp = []
  inputTypeData: any = []

  constructor(private fb: FormBuilder,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private message: MessageService,
    private cdr: ChangeDetectorRef) {
    this.userAccessForm = this.fb.group({
      organisation: ['', Validators.required],
      designation: ['', Validators.required],
      department: ['', Validators.required],
      user: ['', Validators.required],
      activity: ['', Validators.required],
    });
  }

  get f() { return this.userAccessForm.controls }

  ngOnInit(): void {
    this.getOrg()
    this.getTableData(true);
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  getOrg() {
    this.userService.getQuestionPaper(`uspGetGroupDrpDown`).subscribe((res: any) => {
      this.orgDrp = res['table1']
      this.activityDrp = res['table7']
      this.inputTypeData = res['table6']
    })
  }

  getDrpData() {
    this.userService.getQuestionPaper(`uspGetGroupDrpDown`).subscribe((res: any) => {
      this.orgDrp = res['table1']
      this.departmentDrp = res['table2']
      this.designationDrp = res['table3']
    })
  }

  getDepartment() {
    this.isLoadingDep = true
    this.userAccessForm.patchValue({
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
    this.userAccessForm.patchValue({
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
    let org = this.userAccessForm.get('organisation')?.value ? this.userAccessForm.get('organisation')?.value?.drpValue : 0
    let dep = this.userAccessForm.get('department')?.value ? this.userAccessForm.get('department')?.value?.drpValue : 0
    let des = this.userAccessForm.get('designation')?.value ? this.userAccessForm.get('designation')?.value?.drpValue : 0
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
    this.userService.getQuestionPaper(`uspGetUserFormAccess|${query}`).subscribe((res: any) => {
      this.data = res?.table1 || [];
      this.totalCount = res?.table?.[0]?.totalCnt || this.data.length;
      setTimeout(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
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
      this.getDrpData()

      this.selectedIndex = data;
      if (view === 'view') {
        this.userAccessForm.disable();
        setTimeout(() => {
          this.isFormLoading = false
          this.cdr.detectChanges();
        }, 1000);
      }
      else {
        this.userAccessForm.get('organisation')?.disable({ onlySelf: true });
        this.userAccessForm.get('designation')?.disable({ onlySelf: true });
        this.userAccessForm.get('department')?.disable({ onlySelf: true });
        this.userAccessForm.get('user')?.disable({ onlySelf: true });
        this.userAccessForm.get('activity')?.disable({ onlySelf: true });
        setTimeout(() => {
          this.isFormLoading = false
          this.cdr.detectChanges();
        }, 1000);
      }

      
      this.userAccessForm.patchValue({
        organisation: data.orgId ? { drpOption: data.org, drpValue: data.orgId } : '',
        designation: data.desgId ? { drpOption: data.desg, drpValue: data.desgId } : '',
        department: data.deptId ? { drpOption: data.dept, drpValue: data.deptId } : '',
        user: data.empId ? { drpOption: data.emp, drpValue: data.empId } : '',
        activity: data.activityId ? { drpOption: data.activityName, drpValue: data.activityId } : '',
      })
      this.getUser()
      this.inputTypeData = JSON.parse(data?.childDetails)
      setTimeout(() => {
        this.userAccessForm.updateValueAndValidity();
        this.cdr.detectChanges();
        this.isFormLoading = false
      }, 1000);

    }

    setTimeout(() => {
      this.isFormLoading = false
      this.cdr.detectChanges();
    }, 1000);
    document.body.style.overflow = 'hidden'
  }
  onDrawerHide() {
    document.body.style.overflow = 'visible'; // restore scroll
    this.userAccessForm.enable()
    this.visible = false;
    this.onClear()
  }




  onSubmit(event: any) {

    if (this.postType === 'add' && !this.userAccessForm.valid) {
      this.userAccessForm.markAllAsTouched();
      return;
    }

    const rawValues = this.userAccessForm.getRawValue(); // includes disabled controls
    let user = rawValues.user?.drpValue;
    let activity = rawValues.activity?.drpValue;

    // let user = this.userAccessForm.get('user')?.value ? this.userAccessForm.get('user')?.value?.drpValue : 0
    // let activity = this.userAccessForm.get('activity')?.value ? this.userAccessForm.get('activity')?.value?.drpValue : 0

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

    this.paramvaluedata = ''
    this.paramvaluedata = `empId=${user}|activityId=${activity}|formJson=${JSON.stringify(this.inputTypeData)}`
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
      query = `action=UPDATE|${this.paramvaluedata}|permissionId=${this.selectedIndex.id}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${roleID}|activity=header`;
      SP = `uspUpdateUserFormAccess`;
    }
    else {
      query = `${this.paramvaluedata}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${roleID}|activity=header`;
      SP = `uspPostUserFormAccess`;
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
    let query = `action=DELETE|empId=0|activityId=0|formJson=[]|permissionId=${this.selectedIndex.id}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${roleID}|activity=header`;
    this.userService.SubmitPostTypeData(`uspUpdateUserFormAccess`, query, 'header').subscribe((datacom: any) => {
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
    const control = this.userAccessForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
  onClear() {
    this.userAccessForm.reset()
    this.departmentDrp = []
    this.designationDrp = []
    this.userDrp = []
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
