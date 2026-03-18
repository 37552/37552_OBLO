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
  selector: 'app-form-access',
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
  templateUrl: './form-access.html',
  styleUrl: './form-access.scss'
})
export class FormAccess {


  isLoading = true;
  visible: boolean = false;
  postType: string = '';
  header: any = '';
  selectedIndex: any = [];
  headerIcon: string = 'pi pi-plus';
  paramvaluedata: string = '';
  isFormLoading: boolean = false;
  data: any[] = [];
  formAccess: FormGroup;
  formAccessArray = []

  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true },
    { key: 'groupName', header: 'Group Name', isVisible: true, isSortable: true },
    { key: 'activityName', header: 'Group Type', isVisible: true, isSortable: true },
  ];
  pageNo = 1;
  pageSize = 5;
  searchText = '';
  totalCount = 0;
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  groupDrp = []
  inputTypeData: any = []
  activityDrp = []

  constructor(private fb: FormBuilder,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private message: MessageService,
    private cdr: ChangeDetectorRef) {
    this.formAccess = this.fb.group({
      group: ['', Validators.required],
      activity: ['', Validators.required]
    });
  }

  get f() { return this.formAccess.controls }

  ngOnInit(): void {
    this.getTableData(true);
    this.getDrp()
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }


  getDrp() {
    this.userService.getQuestionPaper(`uspGetGroupDrpDown`).subscribe((res: any) => {
      this.groupDrp = res['table5']
      this.inputTypeData = res['table6']

      this.activityDrp = res['table7']
    })
  }




  getTableData(isTrue: boolean) {
    if (isTrue) { this.isLoading = true; } else {
      this.pageNo = 1
    }
    const roleId = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
    const query = `appUserId=${sessionStorage.getItem('userId')}|appUserRole=${roleId}|districtId=${sessionStorage.getItem('District')}|searchText=${this.searchText}|pageIndex=${this.pageNo}|activity=header`;
    this.userService.getQuestionPaper(`uspGetUserGroupFormPermission|${query}`).subscribe((res: any) => {
      this.data = res?.table1 || [];
      this.totalCount = res?.table?.[0]?.totalCnt || this.data.length;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
      setTimeout(() => {
        this.isLoading = false;
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

      this.selectedIndex = data;
      if (view === 'view') {
        this.formAccess.disable();
        setTimeout(() => {
          this.isFormLoading = false
          this.cdr.detectChanges();
        }, 1000);
      }
      else {
        this.formAccess.get('group')?.disable({ onlySelf: true });
        this.formAccess.get('activity')?.disable({ onlySelf: true });
        setTimeout(() => {
          this.isFormLoading = false
          this.cdr.detectChanges();
        }, 1000);
      }

      this.formAccess.patchValue({
        group: data.userGroupId
          ? { drpOption: data.groupName, drpValue: data.userGroupId }
          : '',
        activity: data.activityId
          ? { drpOption: data.activityName, drpValue: data.activityId }
          : ''
      })
      this.inputTypeData = JSON.parse(data?.childDetails)
      setTimeout(() => {
        this.formAccess.updateValueAndValidity();
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


  isInvalid(field: string): boolean {
    const control = this.formAccess.get(field);
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

  onDrawerHide() {
    document.body.style.overflow = 'visible'; // restore scroll
    this.onClear()
    this.visible = false;
    this.formAccess.get('group')?.enable();
    this.formAccess.get('activity')?.enable();
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


  onSubmit(event: any) {
    
    // if (!this.formAccess.valid) {
    //   this.formAccess.markAllAsTouched();
    //   return
    // }

    if (this.postType === 'add' && !this.formAccess.valid) {
      this.formAccess.markAllAsTouched();
      return;
    }

    const rawValues = this.formAccess.getRawValue(); // includes disabled controls
    let group = rawValues.group?.drpValue;
    let activity = rawValues.activity?.drpValue;
    // let group = this.formAccess.get('group')?.value?.drpValue
    // let activity = this.formAccess.get('activity')?.value?.drpValue
    // Check if at least one checkbox is selected in inputTypeData
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
    this.paramvaluedata = `userGroupId=${group}|activityId=${activity}|formJson=${JSON.stringify(this.inputTypeData)}`
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
      SP = `uspUpdateUserGroupFormPermission`;
    }
    else {
      query = `${this.paramvaluedata}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${roleID}|activity=header`;
      SP = `uspPostUserGroupFormPermission`;
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


  onClear() {
    this.formAccess.reset()
    this.inputTypeData.forEach((row: any) => {
      row.canAdd = 0;
      row.canView = 0;
      row.canEdit = 0;
      row.canDelete = 0;
    });
  }

  deleteItem(item: any) {
    this.selectedIndex = item;
    this.openConfirmation("Confirm", "Are you sure want to delete?", '1', '2');
  }

  deleteData() {
    const roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
    let query = `action=DELETE|userGroupId=0|activityId=0|formJson=[]|permissionId=${this.selectedIndex.id}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${roleID}|activity=header`;
    this.userService.SubmitPostTypeData(`uspUpdateUserGroupFormPermission`, query, 'header').subscribe((datacom: any) => {
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

}
