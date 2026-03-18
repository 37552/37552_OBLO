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
import { noInvalidPipelineName,Customvalidation } from '../../shared/Validation';

@Component({
  selector: 'app-parties-form',
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
  templateUrl: './parties-form.html',
  styleUrl: './parties-form.scss'
})

export class PartiesForm {
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


  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true, },
    { key: 'partyCode', header: 'Party ID', isVisible: true, isSortable: false },
    { key: 'partyType', header: 'Party Type', isVisible: true, isSortable: false },
    { key: 'partyName', header: 'Party partyName', isVisible: true, isSortable: false },
    { key: 'intExt', header: 'Internal or External', isVisible: true, isSortable: false },
    { key: 'email', header: 'E-Mail', isVisible: true, isSortable: false },
    { key: 'mobile', header: 'Mobile Number', isVisible: true, isSortable: false },
    { key: 'pan', header: 'PAN/CIN/GSTIN', isVisible: true, isSortable: false },
  ];


  pageNo = 1;
  pageSize = 5;
  searchText = '';
  totalCount = 0;
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  partyTypesdrp = [];
  partyNamedrp = []
  internaldrp = []
  pangstindrp = []
  pangstDrp = []


  previousGroupType: any;
  selectedrowIndex: any
  selectedItemEdit = null
  slectedEdtIndex = null
  itemDailog: boolean = false


  constructor(private fb: FormBuilder,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private message: MessageService,
    public Customvalidation: Customvalidation,
    private cdr: ChangeDetectorRef) {

    this.groupMasterForm1 = this.fb.group({
      partytype: ['', Validators.required],
      Partyname: ['', [Validators.required, noInvalidPipelineName()]],
      internalExternal: ['', Validators.required],
      email: ['', [Validators.required, Validators.email, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]],
      mobile: ['', [ Validators.required,Validators.pattern('^[6-9][0-9]{9}$')]],
      panGSTIN: ['', [Validators.required, noInvalidPipelineName()]],
    });

  }

  get f() { return this.groupMasterForm1.controls }


  ngOnInit(): void {
    this.getTableData(true);
    this.getPartyType()
    this.getInternalType()
    this.getPANCINGSTIN()
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }


  getPartyType() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
    this.userService.getQuestionPaper(`uspGetpartyType|action=PartyType`).subscribe((res: any) => {
      this.partyTypesdrp = res['table'];
    })

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }


  getInternalType() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
    this.userService.getQuestionPaper(`uspGetpartyType|action=IntExt`).subscribe((res: any) => {
      this.internaldrp = res['table'];
    })

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }


  getPANCINGSTIN() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
    this.userService.getQuestionPaper(`uspGetpartyType|action=PartyType`).subscribe((res: any) => {
      this.pangstDrp = res['table'];
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
      const roleId = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
      const query = `appUserId=${sessionStorage.getItem('userId')}|appUserRole=${roleId}|districtId=${sessionStorage.getItem('District')}|searchText=${this.searchText}|pageIndex=${this.pageNo}|size=${this.pageSize}|sortColumn=${this.sortColumn || ''}|sortDirection=${this.sortDirection || ''}|activity=header`;      
      this.userService.getQuestionPaper(`uspGetPartiesDetails|${query}`).subscribe({
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
          console.error('API call failed:', err);
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

      this.selectedIndex = data;
      if (view === 'view') {
        this.groupMasterForm1.disable();
      }
      else {
        this.groupMasterForm1.enable();
        this.groupMasterForm1.get('groupType')?.disable();
      }

      this.groupMasterForm1.patchValue({
        partytype: data.partyTypeId || '',
        Partyname: data.partyName || '',
        internalExternal: data.entExtId || '',
        email: data.email || '',
        mobile: data.mobile || '',
        panGSTIN: data.pan || ''
      });
    }
    document.body.style.overflow = 'hidden'
  }


  onDrawerHide() {
    document.body.style.overflow = 'visible'; // restore scroll
    this.groupMasterForm1.enable();
    this.groupMasterForm1.reset();
    this.visible = false;
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
        }
        else if (option === '5') {
          this.groupMasterForm1.reset()
        }
      },
    });
  }


  onClear() {
    this.groupMasterForm1.reset()
  }

  
  onSubmit(event: any) {
    if (!this.groupMasterForm1.valid) {
      this.groupMasterForm1.markAllAsTouched();
      return;
    }

    let partytype = this.groupMasterForm1.get('partytype')?.value;
    const partyName = this.groupMasterForm1.get('Partyname')?.value?.trim() || '';
    let internalExternal = this.groupMasterForm1.get('internalExternal')?.value;
    let panGSTIN = this.groupMasterForm1.get('panGSTIN')?.value;
    let email = this.groupMasterForm1.get('email')?.value;
    let mobile = this.groupMasterForm1.get('mobile')?.value;

    this.paramvaluedata = `partyTypeId=${partytype}|partyName=${partyName}|partyIntExId=${internalExternal}|email=${email}|mobile=${mobile}|pan=${panGSTIN}`;
    this.openConfirmation('Confirm?', 'Are you sure you want to proceed?', '1', '1', event);
  }

  submitcall() {
    this.isFormLoading = true;
    let query = '';
    let SP = '';

    if (this.postType === 'update') {
      query = `action=Update|${this.paramvaluedata}|id=${this.selectedIndex.id}|userId=${sessionStorage.getItem('userId')}`;
      SP = `uspUpdateDeletePartyDetails`;
    }
    else {
      query = `${this.paramvaluedata}|userId=${sessionStorage.getItem('userId')}|districtI=${sessionStorage.getItem('District')}`;
      SP = `uspPostPartyDetails`;
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
    let query = `action=delete|Id=${this.selectedIndex.id}|partyTypeId=0|partyName=''|partyIntExId=0|email=''|mobile=''|pan=''|userId=${sessionStorage.getItem('userId')}`;
    this.userService.SubmitPostTypeData(`uspUpdateDeletePartyDetails`, query, 'header').subscribe((datacom: any) => {
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


  onDeleteRow(data: any, index: number) {
    this.selectedrowIndex = index
    this.openConfirmation("Confirm", "Are you sure want to delete?", '1', '5');
  }

  showGrouplist(data: any) {
    this.itemDailog = true
    this.groupListArray = JSON.parse(data?.childDetails)
  }

}
