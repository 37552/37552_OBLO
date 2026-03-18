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
  selector: 'app-share-holder',
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
  templateUrl: './share-holder.html',
  styleUrl: './share-holder.scss'
})

export class ShareHolder {
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
  totalCount = 0;

  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true, },
    { key: 'organization', header: 'Organization', isVisible: true, isSortable: false },
    { key: 'shareHolderName', header: 'Shareholder Name', isVisible: true, isSortable: false },
    { key: 'shareType', header: 'Type', isVisible: true, isSortable: false },
    { key: 'mobile', header: 'Mobile Number', isVisible: true, isSortable: false },
    { key: 'email', header: 'E-Mail', isVisible: true, isSortable: false },
    { key: 'noOfShares', header: 'Number of Shares Held', isVisible: true, isSortable: false },
    { key: 'percentageHolding', header: 'Percentage Holding', isVisible: true, isSortable: false },
    { key: 'shareClass', header: 'Share Class', isVisible: true, isSortable: false },
    { key: 'holdingStatus', header: 'Holding Status', isVisible: true, isSortable: false },
  ];


  pageNo = 1;
  pageSize = 5;
  searchText = '';
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  productTypedrp: any = []
  previousGroupType: any;
  selectedrowIndex: any
  itemDailog: boolean = false
  salesMetricDrp = [];
  organisationDrp = [];
  sharHolderTypeDrp = [];
  sharClassDrp = [];
  shareHoldingStatusDrp = [];

  constructor(private fb: FormBuilder,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private message: MessageService,
    public Customvalidation: Customvalidation,
    private cdr: ChangeDetectorRef) {

    this.groupMasterForm1 = this.fb.group({
      organization: ['', Validators.required],
      shareHolderName: ['', [Validators.required, noInvalidPipelineName()]],
      holderType: ['', Validators.required],
      mobileNumber: ['', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]],
      emailId: ['', [Validators.required, Validators.email]],
      numberofshareHeld: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\d+(\.\d+)?$/)   // only numbers + decimal allowed
        ]
      ],
      percentageHolder: ['', [Validators.required, Validators.pattern(/^\d+(\.\d+)?$/)]],
      shareClass: ['', Validators.required],
      holdingStatus: ['', Validators.required],
    });

  }

  get f() { return this.groupMasterForm1.controls }

  ngOnInit(): void {
    this.getTableData(true);
    this.getOrganization()
    this.GetSharClassMaster()
    this.GetSharClassMaster()
    this.GetSharHolderTypeMaster()
    this.GetShareHoldingStatusMaster()
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  getOrganization() {
    const currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
    const roleId = currentRole?.roleId || '';
    const userId = sessionStorage.getItem('userId') || '';
    const districtId = sessionStorage.getItem('District') || '';
    this.userService.getQuestionPaper(`uspGetOrganisationMaster|appUserId=${userId}|appUserRole=${roleId}|districtId=${districtId}`).subscribe((res: any) => {
      this.organisationDrp = res['table']
    })
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  GetSharClassMaster() {
    const currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
    const roleId = currentRole?.roleId || '';
    const userId = sessionStorage.getItem('userId') || '';
    const districtId = sessionStorage.getItem('District') || '';
    this.userService.getQuestionPaper(`uspGetSharClassMaster|appUserId=${userId}|appUserRole=${roleId}|districtId=${districtId}`).subscribe((res: any) => {
      this.sharClassDrp = res['table']
    })
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  GetSharHolderTypeMaster() {
    const currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
    const roleId = currentRole?.roleId || '';
    const userId = sessionStorage.getItem('userId') || '';
    const districtId = sessionStorage.getItem('District') || '';
    this.userService.getQuestionPaper(`uspGetSharHolderTypeMaster|appUserId=${userId}|appUserRole=${roleId}|districtId=${districtId}`).subscribe((res: any) => {
      this.sharHolderTypeDrp = res['table']
    })
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  GetShareHoldingStatusMaster() {
    const currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
    const roleId = currentRole?.roleId || '';
    const userId = sessionStorage.getItem('userId') || '';
    const districtId = sessionStorage.getItem('District') || '';
    this.userService.getQuestionPaper(`uspGetShareHoldingStatusMaster|appUserId=${userId}|appUserRole=${roleId}|districtId=${districtId}`).subscribe((res: any) => {
      this.shareHoldingStatusDrp = res['table']
    })
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  allowOnlyNumberDecimal(event: KeyboardEvent) {
    const input = event.key;
    if (['Backspace', 'ArrowLeft', 'ArrowRight', 'Delete', 'Tab'].includes(input)) {
      return;
    }
    if (/^[0-9]$/.test(input)) {
      return;
    }
    if (input === '.') {
      const value = (event.target as HTMLInputElement).value;
      if (!value.includes('.')) {
        return;
      }
    }
    event.preventDefault();
  }

  blockInvalidPaste(event: ClipboardEvent) {
    const pasteData = event.clipboardData?.getData('text') ?? '';
    const valid = /^\d*\.?\d*$/.test(pasteData);

    if (!valid) {
      event.preventDefault();
    }
  }

  allowOnlyDigits(event: KeyboardEvent) {
    const input = event.key;

    // Allow control keys
    if (['Backspace', 'ArrowLeft', 'ArrowRight', 'Delete', 'Tab'].includes(input)) {
      return;
    }

    // Allow digits only
    if (/^[0-9]$/.test(input)) {
      return;
    }

    event.preventDefault();
  }

  blockNonDigitPaste(event: ClipboardEvent) {
    const paste = event.clipboardData?.getData('text') ?? '';
    if (!/^\d+$/.test(paste)) {
      event.preventDefault();
    }
  }


  getTableData(isTrue: boolean) {
    try {
      if (isTrue) {
        this.isLoading = true;
      }
      else {
        this.pageNo = 1;
      }
      const currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
      const roleId = currentRole?.roleId || '';
      const userId = sessionStorage.getItem('userId') || '';
      const districtId = sessionStorage.getItem('District') || '';

      const query = `appUserId=${userId}|appUserRole=${roleId}|districtId=${districtId}|searchText=${this.searchText}|pageIndex=${this.pageNo}|size=${this.pageSize}`;
      this.userService.getQuestionPaper(`uspGetShareHolderDetails|${query}`).subscribe({
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
    this.header = view === 'add' ? 'Add' : view === 'update' ? 'Update' : 'View';
    this.headerIcon = view === 'add' ? 'pi pi-plus' : view === 'update' ? 'pi pi-pencil' : 'pi pi-eye';

    if (view === 'add') {
      this.groupMasterForm1.reset();
      this.groupMasterForm1.enable();
    }
    else {
      if (view === 'view') {
        this.groupMasterForm1.disable();
      }
      else {
        this.groupMasterForm1.enable();
      }

      this.groupMasterForm1.patchValue({
        organization: data.organizationId || '',
        shareHolderName: data.shareHolderName || '',
        holderType: data.shareTypeId || '',
        mobileNumber: data.mobile || '',
        emailId: data.email || '',
        numberofshareHeld: data.noOfShares || '',
        percentageHolder: data.percentageHolding || '',
        shareClass: data.shareClassId || '',
        holdingStatus: data.holdingStatusId || '',
      });
    }

    document.body.style.overflow = 'hidden'; // prevent background scroll
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

  onDrawerHide() {
    document.body.style.overflow = 'visible'; // restore scroll
    this.groupMasterForm1.enable()
    this.groupMasterForm1.reset()
    this.visible = false;
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
          // this.childArrData = []
        }
        else if (option === '5') {
          this.groupMasterForm1.reset()
        }
      },
      reject: () => {
        if (option === '4') {
          this.groupMasterForm1.patchValue({
            groupType: this.previousGroupType
          })
        }
      }
    });
  }

  onClear() {
    this.groupMasterForm1.reset();
  }


  onSubmit(event: any) {
    if (!this.groupMasterForm1.valid) {
      this.groupMasterForm1.markAllAsTouched();
      return;
    }

    let organization = this.groupMasterForm1.get('organization')?.value;
    const shareHolderName = String(this.groupMasterForm1.get('shareHolderName')?.value || '').trim();
    let holderType = this.groupMasterForm1.get('holderType')?.value;
    const mobileNumber = String(this.groupMasterForm1.get('mobileNumber')?.value || '').trim();
    const emailId = String(this.groupMasterForm1.get('emailId')?.value || '').trim();
    const numberofshareHeld = String(this.groupMasterForm1.get('numberofshareHeld')?.value || '').trim();
    const percentageHolder = String(this.groupMasterForm1.get('percentageHolder')?.value || '').trim();
    let shareClass = this.groupMasterForm1.get('shareClass')?.value;
    let holdingStatus = this.groupMasterForm1.get('holdingStatus')?.value;

    this.paramvaluedata = `orgId=${organization}|shareHolderName=${shareHolderName}|shareTypeId=${holderType}|mobile=${mobileNumber}|email=${emailId}|noOfshares=${numberofshareHeld}|percentageHolding=${percentageHolder}|shareClassId=${shareClass}|holdingStatusId=${holdingStatus}`;
    this.openConfirmation('Confirm?', 'Are you sure you want to proceed?', '1', '1', event);
  }


  submitcall() {
    this.isFormLoading = true;
    let query = '';
    let SP = '';

    if (this.postType === 'update') {
      query = `${this.paramvaluedata}|id=${this.selectedIndex.id}|userId=${sessionStorage.getItem('userId')}`;
      SP = `uspUpdateShareHolderDetails`;
    }
    else {
      query = `${this.paramvaluedata}|userId=${sessionStorage.getItem('userId')}`;
      SP = `uspPostSharHolderDetails`;
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
    try {
      this.isFormLoading = true;
      let query = `id=${this.selectedIndex.id}|userId=${sessionStorage.getItem('userId')}`;
      this.userService.SubmitPostTypeData(`uspDeleteShareHolderDetails`, query, 'header').subscribe({
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
      // this.message.add({
      //   severity: 'error',
      //   summary: 'Error',
      //   detail: 'Unexpected error occurred. Please log in again.',
      //   life: 3000
      // });
      // sessionStorage.clear();
      // localStorage.clear();
      // this.router.navigate(['/login']);
    }
  }


  onDeleteRow(data: any, index: number) {
    this.selectedrowIndex = index
    this.openConfirmation("Confirm", "Are you sure want to delete?", '1', '5');
  }

  showGrouplist(data: any) {
    this.itemDailog = true;
    try {
      const custArray = JSON.parse(data?.customerDetails || '[]');
      this.groupListArray = custArray.flatMap((c: any) => c.ct.map((x: any) => ({
        CustomerId: x.CustomerId,
        CustomerValue: x.CustomerValue
      })));
    } catch (e) {
      console.error('Error parsing customerDetails', e);
      this.groupListArray = [];
    }
  }

}
