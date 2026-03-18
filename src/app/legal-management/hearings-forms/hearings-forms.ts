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
import { Customvalidation, noInvalidPipelineName } from '../../shared/Validation';

@Component({
  selector: 'app-hearings-forms',
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
  templateUrl: './hearings-forms.html',
  styleUrl: './hearings-forms.scss'
})

export class HearingsForms {
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
    { key: 'hearingCode', header: 'Hearing', isVisible: true, isSortable: false },
    { key: 'hearingDate', header: ' Hearing Date', isVisible: true, isSortable: false },
    { key: 'hearingType', header: 'Hearing Type', isVisible: true, isSortable: false },
    { key: 'relatedCase', header: 'Related Cases', isVisible: true, isSortable: false },
    { key: 'outCome', header: 'Outcome / Notes', isVisible: true, isSortable: false },
    { key: 'legalTeam', header: 'Assigned Legal', isVisible: true, isSortable: false },
    { key: 'relatedArbitration', header: 'Related Arbitration', isVisible: true, isSortable: false },
    { key: 'hearingStatus', header: 'Status', isVisible: true, isSortable: false },
  ];


  pageNo = 1;
  pageSize = 5;
  searchText = '';
  totalCount = 0;
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  hearingMasterDrpr = [];
  hearinfStatusDrp= [];
  partyNamedrp = []
  internaldrp = []
  pangstindrp = []
  pangstDrp = []
  partyTypesdrp= []
  legalMasterDrp= []
  caseDetailsDrp= []
  arbitrationDrp= []

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
      hearingDate: ['', Validators.required],
      hearingType: ['', Validators.required],
      relatedCase: ['', Validators.required],
      outcomeNotes: ['', [Validators.required, noInvalidPipelineName()]],
      assignedLegal: ['', Validators.required],
      relatedArbitration: ['', Validators.required],
      status: ['', Validators.required],
    });
  }

  get f() { return this.groupMasterForm1.controls }


  ngOnInit(): void {
    this.getTableData(true);
    this.getGetHearingTypeMaster()
    this.getHearingStatusMaster()
    this.geLegalTeamMaster()
    this.geCaseDetailsMaster()
    this.geArbitrationMaster()
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  validateAmountInput(event: KeyboardEvent) {
    const char = event.key;
    const currentValue = (event.target as HTMLInputElement).value;

    // Allow control keys (backspace, tab, arrows)
    if (['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(char)) {
      return;
    }

    // Allow only one dot and digits
    if (!/^[0-9.]$/.test(char) || (char === '.' && currentValue.includes('.'))) {
      event.preventDefault();
    }
  }


  getGetHearingTypeMaster() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
    this.userService.getQuestionPaper(`uspGetHearingTypeMaster`).subscribe((res: any) => {
      this.hearingMasterDrpr = res['table'];
    })

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }


  getHearingStatusMaster() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
    this.userService.getQuestionPaper(`uspGetHearingStatusMaster|`).subscribe((res: any) => {
      this.hearinfStatusDrp = res['table'];
    })

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }


  geLegalTeamMaster() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
    this.userService.getQuestionPaper(`uspGetLegalTeamMaster`).subscribe((res: any) => {
      this.legalMasterDrp = res['table'];      
    })

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  geCaseDetailsMaster() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
    this.userService.getQuestionPaper(`uspGetCaseDetailsMaster`).subscribe((res: any) => {
      this.caseDetailsDrp = res['table'];
    })

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }
  

  geArbitrationMaster() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
    this.userService.getQuestionPaper(`uspGetArbitrationDetailsMaster`).subscribe((res: any) => {
      this.arbitrationDrp = res['table'];
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
      const query = `searchText=${this.searchText}|pageIndex=${this.pageNo}|size=${this.pageSize}|appUserRole=${roleId}|appUserId=${sessionStorage.getItem('userId')}|districtId=${sessionStorage.getItem('District')}`;
      this.userService.getQuestionPaper(`uspGetHearingDetails|${query}`).subscribe({
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
    this.visible = true;
    this.postType = view;
    this.header = view === 'add' ? 'Add' : view === 'update' ? 'Update' : 'View';
    this.headerIcon = view === 'add' ? 'pi pi-plus' : view === 'update' ? 'pi pi-pencil' : 'pi pi-eye';

    if (view === 'add') {
      this.groupMasterForm1.reset();
      this.groupMasterForm1.enable();
    } else {
      this.selectedIndex = data;

      if (view === 'view') {
        this.groupMasterForm1.disable();
      } else {
        this.groupMasterForm1.enable();
      }

      this.groupMasterForm1.patchValue({
        hearingDate: data.hearingDate || '',
        hearingType: data.hearingId || '',
        relatedCase: data.relatedCaseId || '',
        outcomeNotes: data.outCome || '',
        assignedLegal: data.legalTeamId || '',
        relatedArbitration: data.arbitrationId || '',
        status: data.hearingStatusId || ''
      });
      
    }

    document.body.style.overflow = 'hidden';
  }


  onDrawerHide() {
    document.body.style.overflow = 'visible'; // restore scroll
    this.groupMasterForm1.reset(); // clear all form fields
    this.groupMasterForm1.enable(); // make form editable again
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

    const form = this.groupMasterForm1.value;
    this.paramvaluedata =
      `hearingDate=${form.hearingDate}|` +
      `hearingTypeId=${form.hearingType}|` +
      `relatedCaseId=${form.relatedCase}|` +
      `outcome=${form.outcomeNotes}|` +
      `hearingStatusId=${form.status}|`+
      `relatedArbitrationId=${form.relatedArbitration}|` +
      `legalTeamID=${form.assignedLegal}`;
    this.openConfirmation('Confirm?', 'Are you sure you want to proceed?', '1', '1', event);
  }

  blockTyping(event: KeyboardEvent) {
    event.preventDefault();
  }
  
  openCalendar(event: any) {
    event.target.showPicker();  // Browser ka built-in date picker open karega
  }


  submitcall() {
    this.isFormLoading = true;
    let query = '';
    let SP = '';

    if (this.postType === 'update') {
      query = `${this.paramvaluedata}|id=${this.selectedIndex.id}|userId=${sessionStorage.getItem('userId')}`;
      SP = `uspUpdateHearingDetails`;
    }
    else {
      query = `${this.paramvaluedata}|userId=${sessionStorage.getItem('userId')}`;
      SP = `uspPostHearingDetails`;
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
    let query = `Id=${this.selectedIndex.id}|userId=${sessionStorage.getItem('userId')}`;
    this.userService.SubmitPostTypeData(`uspDeleteHearingDetails`, query, 'header').subscribe((datacom: any) => {
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
