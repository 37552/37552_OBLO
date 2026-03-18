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
  selector: 'app-arbitrations-forms',
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
  templateUrl: './arbitrations-forms.html',
  styleUrl: './arbitrations-forms.scss'
})

export class ArbitrationsForms {
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
    { key: 'arbCode', header: 'Arbitration', isVisible: true, isSortable: false },
    { key: 'tittle', header: 'Title', isVisible: true, isSortable: false },
    { key: 'relatedContracts', header: 'Related Contract', isVisible: true, isSortable: false },
    { key: 'claimantParty', header: 'Claimants', isVisible: true, isSortable: false },
    { key: 'respondentParty', header: 'Respondents', isVisible: true, isSortable: false },
    { key: 'tribunalType', header: 'Tribunal Type', isVisible: true, isSortable: false },
    { key: 'arbitrator', header: 'Arbitrator', isVisible: true, isSortable: false },
    { key: 'institution', header: 'Institution', isVisible: true, isSortable: false },
    { key: 'seatOfarbitration', header: 'Seat of Arbitration', isVisible: true, isSortable: false },
    { key: 'governingLaw', header: 'Governing Law', isVisible: true, isSortable: false },
    { key: 'startDate', header: 'Start Date', isVisible: true, isSortable: false },
    { key: 'status', header: 'Status', isVisible: true, isSortable: false },
    { key: 'awardSummary', header: 'Award Summary', isVisible: true, isSortable: false },
    { key: 'awardAmount', header: 'Award Amount', isVisible: true, isSortable: false },
    { key: 'finalAwardDate', header: 'Final Award Date', isVisible: true, isSortable: false },
    { key: 'legalTeamName', header: 'Legal Team', isVisible: true, isSortable: false },
  ];


  pageNo = 1;
  pageSize = 5;
  searchText = '';
  totalCount = 0;
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  partyTypesdrp = [];
  internaldrp = []
  pangstindrp = []
  pangstDrp = []
  instituteMaster =[]
  tribunalTypeDrp =[]
  legalTeamDrp=[]
  partyMaster=[]
  statusMasterDrp=[]
  relatedContractDrp=[]
  contractMasterDrp=[]

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
      title: ['', [Validators.required, noInvalidPipelineName()]],
      relatedContract: ['', Validators.required],
      claimant: ['', Validators.required],
      respondent: ['', Validators.required],
      tribunalType: ['', Validators.required],
      arbitrator: ['', [Validators.required, noInvalidPipelineName()]],
      institution: ['', Validators.required],
      seatofArbitration: ['', [Validators.required, noInvalidPipelineName()]],
      governingLaw: ['', [Validators.required, noInvalidPipelineName()]],
      startDate: ['', Validators.required],
      statusId: ['', Validators.required],
      awardsummary: ['', [Validators.required, noInvalidPipelineName()]],
      awardAmount: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{0,2})?$/)]],
      finalDate: ['', Validators.required],
      legalTeam: ['', Validators.required],
    });

  }

  get f() { return this.groupMasterForm1.controls }


  ngOnInit(): void {
    this.getTableData(true);
    this.getStatusTypeMaster()
    this.getContractTypeMaster()
    this.getInstituteMaster()
    this.getTribunalTypeMaster()
    this.getLegalTeamMaster()
    this.getPartyTypeMaster()
    this.getRelatedContractMaster()
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


  getStatusTypeMaster() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
    this.userService.getQuestionPaper(`uspGetCaseStatusMaster`).subscribe((res: any) => {
      this.statusMasterDrp = res['table'];
    })
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  
  getRelatedContractMaster() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
    this.userService.getQuestionPaper(`uspGetpartyType|action=PartyType`).subscribe((res: any) => {
      this.relatedContractDrp = res['table'];
    })

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }
  

  getContractTypeMaster() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
    this.userService.getQuestionPaper(`uspContractTypeDetailsMaster`).subscribe((res: any) => {
      this.contractMasterDrp = res['table'];
    })

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }


  getInstituteMaster() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
    this.userService.getQuestionPaper(`uspGetInstitutionTypeMaster|`).subscribe((res: any) => {
      this.instituteMaster = res['table'];
    })

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  getTribunalTypeMaster() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
    this.userService.getQuestionPaper(`uspGetTribunalTypeMaster|`).subscribe((res: any) => {
      this.tribunalTypeDrp = res['table'];
    })

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  getLegalTeamMaster() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
    this.userService.getQuestionPaper(`uspGetLegalTeamMaster|`).subscribe((res: any) => {
      this.legalTeamDrp = res['table'];      
    })

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  getPartyTypeMaster() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
    this.userService.getQuestionPaper(`uspGetPartyTypeMaster|`).subscribe((res: any) => {
      this.partyMaster = res['table'];
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
      const userId = sessionStorage.getItem('userId') || '';
      const roleId = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
      const districtId = sessionStorage.getItem('District') || '';

      const query = `searchText=${this.searchText}|pageIndex=${this.pageNo}|size=${this.pageSize}|appUserRole=${roleId}|appUserId=${userId}|districtId=${districtId}`;
      this.userService.getQuestionPaper(`uspGetarbitrationDetails|${query}`).subscribe({
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
    this.header =
      view === 'add'
        ? 'Add'
        : view === 'update'
          ? 'Update'
          : 'View';
    this.headerIcon =
      view === 'add'
        ? 'pi pi-plus'
        : view === 'update'
          ? 'pi pi-pencil'
          : 'pi pi-eye';

    if (view === 'add') {
      // New entry — clear form
      this.groupMasterForm1.reset();
      this.groupMasterForm1.enable();
    } else {
      // Edit or View existing record
      this.selectedIndex = data;

      if (view === 'view') {
        this.groupMasterForm1.disable();
      } else {
        this.groupMasterForm1.enable();
      }

      this.groupMasterForm1.patchValue({
        title: data.tittle || '',
        relatedContract: data.contractId || '',
        claimant: data.claimantPartyId || '',
        respondent: data.respondPartyId || '',
        tribunalType: data.tribunalId || '',
        arbitrator: data.arbitrator || '',
        institution: data.institutionId || '',
        seatofArbitration: data.seatOfarbitration || '',
        governingLaw: data.governingLaw || '',
        startDate: data.startDate || '',
        statusId: data.statusId || '',
        awardsummary: data.awardSummary || '',
        awardAmount: data.awardAmount || '',
        finalDate: data.finalAwardDate || '',
        legalTeam: data.legalTeamId || ''
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

  blockTyping(event: KeyboardEvent) {
    event.preventDefault();
  }
  
  openCalendar(event: any) {
    event.target.showPicker();  // Browser ka built-in date picker open karega
  }
  

  onClear() {
    this.groupMasterForm1.reset()
  }

  onSubmit(event: any) {
    if (!this.groupMasterForm1.valid) {
      this.groupMasterForm1.markAllAsTouched();
      return;
    }
  
    // safe trim helper
    const safeTrim = (v: any) =>
      typeof v === 'string' ? v.trim() : (v ?? '');
  
    const title = safeTrim(this.groupMasterForm1.get('title')?.value);
    const relatedContractId = this.groupMasterForm1.get('relatedContract')?.value || '';
    const claimant = this.groupMasterForm1.get('claimant')?.value || '';
    const respondentId = this.groupMasterForm1.get('respondent')?.value || '';
    const tribunalType = this.groupMasterForm1.get('tribunalType')?.value || '';
    const arbitrator = safeTrim(this.groupMasterForm1.get('arbitrator')?.value);
    const institution = this.groupMasterForm1.get('institution')?.value || '';
    const seatofArbitration = safeTrim(this.groupMasterForm1.get('seatofArbitration')?.value);
    const governingLaw = safeTrim(this.groupMasterForm1.get('governingLaw')?.value);
    const startDate = this.groupMasterForm1.get('startDate')?.value || '';
    const finalDate = this.groupMasterForm1.get('finalDate')?.value || '';
    const awardsummary = safeTrim(this.groupMasterForm1.get('awardsummary')?.value);
    const awardAmount = safeTrim(this.groupMasterForm1.get('awardAmount')?.value);
    const legalTeam = this.groupMasterForm1.get('legalTeam')?.value || '';
    const statusId = this.groupMasterForm1.get('statusId')?.value || '';
  
    this.paramvaluedata =
      `tittle=${title}|` +
      `contractId=${relatedContractId}|` +
      `ClaimPartyId=${claimant}|` +
      `respondPartyId=${respondentId}|` +
      `tribunalTypeId=${tribunalType}|` +
      `arbitrator=${arbitrator}|` +
      `institutionId=${institution}|` +
      `seatOfArbitration=${seatofArbitration}|` +
      `governingLaw=${governingLaw}|` +
      `startDate=${startDate}|` +
      `finalAwardDate=${finalDate}|` +
      `awardSummary=${awardsummary}|` +
      `awardAmount=${awardAmount}|` +
      `statusId=${statusId}|` +
      `legalTeamId=${legalTeam}`;
  
    this.openConfirmation('Confirm?', 'Are you sure you want to proceed?', '1', '1', event);
  }
  
  

  submitcall() {
    this.isFormLoading = true;
    let query = '';
    let SP = '';

    if (this.postType === 'update') {
      query = `action=update|${this.paramvaluedata}|id=${this.selectedIndex.id}|userID=${sessionStorage.getItem('userId')}`;
      SP = `uspUpdateDeleteArbitrationDetails `;
    }
    else {
      query = `${this.paramvaluedata}|userID=${sessionStorage.getItem('userId')}`;
      SP = `uspPostArbitrationDetails  `;
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
    let query = `Id=${this.selectedIndex.id}|userID=${sessionStorage.getItem('userId')}`;   
    this.userService.SubmitPostTypeData(`uspDeleteArbitrationDetails `, query, 'header').subscribe((datacom: any) => {
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


  showGrouplist(data: any) {
    this.itemDailog = true
    this.groupListArray = JSON.parse(data?.childDetails)
  }

}
