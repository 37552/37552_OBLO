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
import { Customvalidation, noInvalidPipelineName, nonMandatoryFieldValidation } from '../../shared/Validation';

@Component({
  selector: 'app-legal-team-form',
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
  templateUrl: './legal-team-form.html',
  styleUrl: './legal-team-form.scss'
})

export class LegalTeamForm {
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
  groupListArray1 = []
  groupListArray2 = []


  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true, },
    { key: 'legalTeamCode', header: 'Legal Team ', isVisible: true, isSortable: false },
    { key: 'name', header: 'Name', isVisible: true, isSortable: false },
    { key: 'role', header: 'Role', isVisible: true, isSortable: false },
    { key: 'caseTittle', header: 'Case Tittle', isVisible: true, isSortable: false },
    { key: 'arbitrationTitle', header: 'Title (from Assigned Arbitration)', isVisible: true, isSortable: false },
    { key: 'contractTittle', header: 'Tittle (from Assigned Contracts )', isVisible: true, isSortable: false },
    { key: 'compliances', header: 'Compliances', isVisible: true, isSortable: false },
    { key: 'jsonDetails', header: 'Assigned Arbitration', isVisible: true, isSortable: false, isCustom: true },
    { key: 'jsonDetails1', header: 'Hearing', isVisible: true, isSortable: false, isCustom: true },
    { key: 'jsonDetails2', header: 'Notices', isVisible: true, isSortable: false, isCustom: true },

  ];


  pageNo = 1;
  pageSize = 5;
  searchText = '';
  totalCount = 0;
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  assignedArbitrationDrp = [];
  legalRoleDrp = [];

  noticesDrp = [];
  roleDrp = [];
  hearingsDrp = [];
  arbitrationDetailsDrp = [];

  previousGroupType: any;
  selectedrowIndex: any
  selectedItemEdit = null
  slectedEdtIndex = null

  itemDailog: boolean = false
  itemDailog1: boolean = false
  itemDailog2: boolean = false

  childArrData: any[] = [];
  childArrData1: any[] = [];
  childArrData2: any[] = [];



  constructor(private fb: FormBuilder,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private message: MessageService,
    public Customvalidation: Customvalidation,
    private cdr: ChangeDetectorRef) {

    this.groupMasterForm1 = this.fb.group({
      name: ['', [Validators.required, noInvalidPipelineName()]],
      caseTitle: ['', [nonMandatoryFieldValidation()]],
      compliances: ['', [nonMandatoryFieldValidation()]],
      titleContracts: ['', [nonMandatoryFieldValidation()]],
      titleassigned: ['', [nonMandatoryFieldValidation()]],
      assignedArbitration: [''],
      notice: ['',],
      roleId: ['', [Validators.required]],
      hearings: ['',],
    });

  }

  get f() { return this.groupMasterForm1.controls }

  ngOnInit(): void {
    this.getTableData(true);
    this.getNotices()
    this.getRole()
    this.getHearing()
    this.getlegalRoleMaster();
    this.getArbitrationDetailsMaster()
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }


  getlegalRoleMaster() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
    this.userService.getQuestionPaper(`uspGetLegalRoleMaster`).subscribe((res: any) => {
      this.legalRoleDrp = res['table']
    })

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
  }

  getNotices() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
    this.userService.getQuestionPaper(`uspGetNoticesDetailsMaster`).subscribe((res: any) => {
      this.noticesDrp = res['table'];
    })

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  getRole() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
    this.userService.getQuestionPaper(`uspGetpartyType|action=PartyType`).subscribe((res: any) => {
      this.roleDrp = res['table'];
    })

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  getHearing() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
    this.userService.getQuestionPaper(`uspGetHearingDetailsMaster`).subscribe((res: any) => {
      this.hearingsDrp = res['table'];
    })

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }


  getArbitrationDetailsMaster() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
    this.userService.getQuestionPaper(`uspGetArbitrationDetailsMaster`).subscribe((res: any) => {
      this.arbitrationDetailsDrp = res['table'];
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
      this.userService.getQuestionPaper(`uspLegalTeamDetails|${query}`).subscribe({
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
    this.selectedIndex = data;
    this.visible = true;
    this.postType = view;
    this.header =
      view === 'add' ? 'Add' : view === 'update' ? 'Update' : 'View';

    this.headerIcon =
      view === 'add' ? 'pi pi-plus' : view === 'update' ? 'pi pi-pencil' : 'pi pi-eye';

    if (view === 'add') {
      this.groupMasterForm1.reset();
      this.groupMasterForm1.enable();
      this.childArrData = [];
      this.childArrData1 = [];
      this.childArrData2 = [];
    }
    else {
      if (view === 'view') {
        this.groupMasterForm1.disable();
      } else {
        this.groupMasterForm1.enable();
      }

      let customerTypes: any[] = [];
      let customerTypes1: any[] = [];
      let customerTypes2: any[] = [];

      try {
        const parsed = JSON.parse(data?.hearingDetails || '[]');

        parsed.forEach((item: any) => {
          customerTypes.push({
            drpOption: item.Hearing || '',
            drpValue: item.hearingsId || 0
          });
        });

      } catch (e) {
        console.error("Error parsing hearingDetails", e);
      }

      try {
        const parsed = JSON.parse(data?.noticeDetails || '[]');

        parsed.forEach((item: any) => {
          customerTypes1.push({
            drpOption: item.noticeTittle || '',
            drpValue: item.noticesId || 0
          });
        });

      } catch (e) {
        console.error("Error parsing noticeDetails", e);
      }


      try {
        const parsed = JSON.parse(data?.arbitrationDetails || '[]');
        parsed.forEach((item: any) => {
          customerTypes2.push({
            drpOption: item.arbitration || '',
            drpValue: item.arbitrationId || 0
          });
        });

      } catch (e) {
        console.error("Error parsing arbitrationDetails", e);
      }


      this.groupMasterForm1.patchValue({
        name: data.name || '',
        caseTitle: data.caseTittle || '',
        roleId: data.roleId || '',
        titleassigned: data.arbitrationTitle || '',
        titleContracts: data.contractTittle || '',
        compliances: data.compliances || '',
        hearings: customerTypes,
        notice: customerTypes1,
        assignedArbitration: customerTypes2,
      });

      this.childArrData = customerTypes;
      this.childArrData1 = customerTypes1;
      this.childArrData2 = customerTypes2;
    }

    document.body.style.overflow = "hidden";
  }


  onSubmit(event: any) {
    if (!this.groupMasterForm1.valid) {
      this.groupMasterForm1.markAllAsTouched();
      return;
    }

    const name = this.groupMasterForm1.get('name')?.value?.trim() || '';
    const caseTitle = this.groupMasterForm1.get('caseTitle')?.value?.trim() || '';
    const titleassigned = this.groupMasterForm1.get('titleassigned')?.value || '';
    const titleContracts = this.groupMasterForm1.get('titleContracts')?.value || '';
    const compliances = this.groupMasterForm1.get('compliances')?.value?.trim() || '';
    let roleId = this.groupMasterForm1.get('roleId')?.value;

    const assignedArbitration = this.groupMasterForm1.get('assignedArbitration')?.value ?? [];
    const noticeArray = this.groupMasterForm1.get('notice')?.value ?? [];
    const hearingsArray = this.groupMasterForm1.get('hearings')?.value ?? [];

    const noticeData = noticeArray.map((c: any) => ({
      noticeId: c.drpValue,
      tittle: c.drpOption
    }));


    const hearingsData = hearingsArray.map((c: any) => ({
      hearingId: c.drpValue,
      title: c.drpOption,
    }));

    const assignedArbitrationData = assignedArbitration.map((c: any) => ({
      arbId: c.drpValue,
      title: c.drpOption
    }));

    const noticeDataStr = JSON.stringify(noticeData);
    const hearingsDataStr = JSON.stringify(hearingsData);
    const assignedStr = JSON.stringify(assignedArbitrationData);

    this.paramvaluedata = `Name=${name}|caseTittle=${caseTitle}|arbitratoinsJson=${assignedStr}|noticesJson=${noticeDataStr}|roleId=${roleId}|arbTittle=${titleassigned}|contractTittle=${titleContracts}|hearingsJson=${hearingsDataStr}|compliance=${compliances}`;
    this.openConfirmation('Confirm?', 'Are you sure you want to proceed?', '1', '1', event);
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


  submitcall() {
    this.isFormLoading = true;
    let query = '';
    let SP = '';

    if (this.postType === 'update') {
      query = `action=update|${this.paramvaluedata}|Id=${this.selectedIndex.id}|userId=${sessionStorage.getItem('userId')}`;
      SP = `uspUpdateDeleteLegalTeamDetails`;
    }
    else {
      query = `${this.paramvaluedata}|userId=${sessionStorage.getItem('userId')}`;
      SP = `uspPostLegalTeamDetails`;
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
    let query = `action=delete|Id=${this.selectedIndex.id}|Name=''|caseTittle=''|arbitratoinsJson=''|noticesJson=''|roleId=0|arbTittle=''|contractTittle=''|hearingsJson=''|complianc=''|userId=${sessionStorage.getItem('userId')}`;
    this.userService.SubmitPostTypeData(`uspUpdateDeleteLegalTeamDetails`, query, 'header').subscribe((datacom: any) => {
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
    this.itemDailog = true;

    const arr = this.safeParse(data?.arbitrationDetails);

    this.groupListArray = arr.map((x: any) => ({
      arbitration: x.arbitration || ''
    }));
  }

  showGrouplist1(data: any) {
    this.itemDailog1 = true;

    const arr = this.safeParse(data?.hearingDetails);

    this.groupListArray1 = arr.map((x: any) => ({
      Hearing: x.Hearing || ''
    }));
  }


  safeParse(value: any) {
    if (!value) return [];

    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return [];
      }
    }

    if (Array.isArray(value)) return value;

    return [];
  }


  showGrouplist2(data: any) {
    this.itemDailog2 = true;

    const arr = this.safeParse(data?.noticeDetails);

    this.groupListArray2 = arr.map((x: any) => ({
      Notice: x.noticeTittle || ''
    }));
  }



}
