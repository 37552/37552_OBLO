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
import { noInvalidPipelineName, Customvalidation } from '../../shared/Validation';

@Component({
  selector: 'app-compliances-forms',
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
  templateUrl: './compliances-forms.html',
  styleUrl: './compliances-forms.scss'
})

export class CompliancesForms {
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
  groupListArray: { frequent: string }[] = [];


  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true, },
    { key: 'comCode', header: 'Compliance', isVisible: true, isSortable: false },
    { key: 'tittle', header: 'Compliance Tittle', isVisible: true, isSortable: false },
    { key: 'compliance', header: 'Compliance Type', isVisible: true, isSortable: false },
    { key: 'law', header: 'Applicable Law', isVisible: true, isSortable: false },
    { key: 'department', header: 'Responsible Department', isVisible: true, isSortable: false },
    { key: 'responsiblePerson', header: 'Responsible Person', isVisible: true, isSortable: false },
    { key: 'status', header: 'Status', isVisible: true, isSortable: false },
    { key: 'penaltyForNonCompliance', header: 'Penalty for Non-compliance', isVisible: true, isSortable: false },
    { key: 'startDate', header: 'Start Date ', isVisible: true, isSortable: false },
    { key: 'remarks', header: 'Remarks', isVisible: true, isSortable: false },
    { key: 'jsonDetails', header: 'Frequency', isVisible: true, isSortable: false, isCustom: true }
  ];


  pageNo = 1;
  pageSize = 5;
  searchText = '';
  totalCount = 0;
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  partyTypesdrp = [];
  partyNamedrp = []
  departmentDrp = []
  pangstindrp = []
  pangstDrp = []
  lowMasterDrp = [];
  complienceDrp = [];
  childArrData: any[] = [];
  statusDrp = [];

  frequentComplienceDrp = [];

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
      compliancesType: ['', Validators.required],
      frequencyId: ['', Validators.required],
      applicableLaw: ['', Validators.required],
      departmentName: ['', Validators.required],
      responsiblePerson: ['', [Validators.required, noInvalidPipelineName()]],
      penalityText: ['', [Validators.required, noInvalidPipelineName()]],
      statusId: ['', Validators.required],
      startDate: ['', Validators.required],
      remarksId: ['', Validators.required],
    });

  }

  get f() { return this.groupMasterForm1.controls }


  ngOnInit(): void {
    this.getTableData(true);
    this.getComplianceTypeMaste()
    this.getDepartmentLis()
    this.getComplianceStatusMaster()
    this.getComplianceFreqMaster()
    this.getComplianceTypeMaste()
    this.getApplicableLawMaster()
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }


  getComplianceTypeMaste() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
    this.userService.getQuestionPaper(`uspGetComplianceTypeMaster`).subscribe((res: any) => {
      this.complienceDrp = res['table'];
    })

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  getComplianceFreqMaster() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
    this.userService.getQuestionPaper(`uspGetComplianceFreqMaster`).subscribe((res: any) => {
      this.frequentComplienceDrp = res['table'];
    })

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  getApplicableLawMaster() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
    this.userService.getQuestionPaper(`uspGetApplicableLawMaster`).subscribe((res: any) => {
      this.lowMasterDrp = res['table'];
    })

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  getDepartmentLis() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
    this.userService.getQuestionPaper(`uspGetDepartmentList`).subscribe((res: any) => {
      this.departmentDrp = res['table'];
    })

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }


  getComplianceStatusMaster() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
    this.userService.getQuestionPaper(`uspGetComplianceStatusMaster`).subscribe((res: any) => {
      this.statusDrp = res['table'];
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
      const query = `appUserId=${userId}|appUserRole=${roleId}|districtId=${sessionStorage.getItem('District')}|searchText=${this.searchText}|pageIndex=${this.pageNo}|size=${this.pageSize}`;
      this.userService.getQuestionPaper(`uspGetComplianceDetails|${query}`).subscribe({
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
    }
    else {
      if (view === 'view') {
        this.groupMasterForm1.disable();
      }
      else {
        this.groupMasterForm1.enable();
      }

      let customerTypes: any[] = [];

      try {
        const parsed = JSON.parse(data?.complianceFreq || '[]');
        parsed.forEach((item: any) => {
          customerTypes.push({
            drpOption: item.text || '',
            drpValue: item.FreqId || 0
          });
        });

      } catch (e) {
        console.error("Error parsing complianceFreq", e);
      }

      this.groupMasterForm1.patchValue({
        title: data.tittle || '',
        compliancesType: data.complianceTypeId || '',
        frequencyId: customerTypes,
        applicableLaw: data.lawId || '',
        departmentName: data.departmentId || '',
        responsiblePerson: data.responsiblePerson || '',
        penalityText: data.penaltyForNonCompliance || '',
        statusId: data.statusId || '',
        startDate: data.startDate || '',
        remarksId: data.remarks || ''
      });
      this.childArrData = customerTypes;
    }

    document.body.style.overflow = "hidden";
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

    let compliancesType = this.groupMasterForm1.get('compliancesType')?.value;
    const title = this.groupMasterForm1.get('title')?.value?.trim() || '';
    let applicableLaw = this.groupMasterForm1.get('applicableLaw')?.value;
    let departmentName = this.groupMasterForm1.get('departmentName')?.value;
    const responsiblePerson = this.groupMasterForm1.get('responsiblePerson')?.value?.trim() || '';
    const penalityText = this.groupMasterForm1.get('penalityText')?.value?.trim() || '';
    let statusId = this.groupMasterForm1.get('statusId')?.value;
    const startDate = this.groupMasterForm1.get('startDate')?.value?.trim() || '';
    const remarksId = this.groupMasterForm1.get('remarksId')?.value?.trim() || '';
    const frequency = this.groupMasterForm1.get('frequencyId')?.value ?? [];


    if (frequency.length === 0) {
      this.message.add({
        severity: 'warn',
        summary: 'Warn',
        detail: 'Select at least one Customer Type'
      });
      return;
    }

    const frequencyData = frequency.map((c: any) => ({
      complianceId: c.drpValue,
    }));

    const frequencyStr = JSON.stringify(frequencyData);
    this.paramvaluedata = `tittle=${title}|freqJson=${frequencyStr}|complianceTypeId=${compliancesType}|applicableLawId=${applicableLaw}|departmentId=${departmentName}|responsiblePerson=${responsiblePerson}|statusId=${statusId}|remarks=${remarksId}|penalty=${penalityText}|startDate=${startDate}`;
    this.openConfirmation('Confirm?', 'Are you sure you want to proceed?', '1', '1', event);
  }


  submitcall() {
    this.isFormLoading = true;
    let query = '';
    let SP = '';

    if (this.postType === 'update') {
      query = `${this.paramvaluedata}|Id=${this.selectedIndex.id}|userId=${sessionStorage.getItem('userId')}`;
      SP = `uspUpdateComplianceDetails`;
    }
    else {
      query = `${this.paramvaluedata}|userId=${sessionStorage.getItem('userId')}`;
      SP = `uspPostComplianceDetails`;
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
  blockTyping(event: KeyboardEvent) {
    event.preventDefault();
  }
  
  openCalendar(event: any) {
    event.target.showPicker();  // Browser ka built-in date picker open karega
  }


  
  deleteData() {
    try {
      this.isFormLoading = true;
      let query = `Id=${this.selectedIndex.id}|userId=${sessionStorage.getItem('userId')}`;
      this.userService.SubmitPostTypeData(`uspDeleteComplianceDetails`, query, 'header').subscribe({
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
        error: (err) => {
          this.isFormLoading = false;
          console.error('API call failed:', err);
          if (err.status === 401 || err.status === 403) {
            this.message.add({
              severity: 'error',
              summary: 'Session Expired',
              detail: 'Your session has expired. Please log in again.',
              life: 3000
            });
            this.Customvalidation.loginroute(err.status);
          } else {
            this.message.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete data. Please try again later.',
              life: 3000
            });
          }
        }
      });

    } catch (error) {
      console.error('Unexpected error in deleteData():', error);
      this.isFormLoading = false;
  }
  }

  onDeleteRow(data: any, index: number) {
    this.selectedrowIndex = index
    this.openConfirmation("Confirm", "Are you sure want to delete?", '1', '5');
  }

  showGrouplist(data: any) {
    this.itemDailog = true;
  
    try {
      const custArray: any[] = JSON.parse(data?.complianceFreq || '[]');
      this.groupListArray = custArray.map(item => ({ frequent: item.text }));
    } catch (e) {
      console.error('Error parsing complianceFreq', e);
      this.groupListArray = [];
    }
  }
  
}
