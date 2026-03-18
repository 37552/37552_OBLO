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
  selector: 'app-vendor-profile',
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
    Tooltip 
  ],
  providers: [
    ConfirmationService,
    MessageService
  ],
  templateUrl: './vendor-profile.html',
  styleUrl: './vendor-profile.scss'
})

export class VendorProfile {
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
    { key: 'orgName', header: 'Company Name', isVisible: true, isSortable: false },
    { key: 'registrationNo', header: 'Registration No', isVisible: true, isSortable: false },
    { key: 'pan', header: 'Pan No', isVisible: true, isSortable: false },
    { key: 'gstin', header: 'Gst In', isVisible: true, isSortable: false },
    { key: 'district', header: 'District', isVisible: true, isSortable: false },
    { key: 'state', header: 'State', isVisible: true, isSortable: false },
    { key: 'address', header: 'Address', isVisible: true, isSortable: false },
    { key: 'pincode', header: 'Pin Code', isVisible: true, isSortable: false },
    { key: 'contactPerson', header: 'Contact Person', isVisible: true, isSortable: false },
    { key: 'bankAccountNo', header: 'Bank Account No', isVisible: true, isSortable: false },
    { key: 'ifscCode', header: 'IFSC Code ', isVisible: true, isSortable: false },
    { key: 'isVerified', header: 'Is Verified ', isVisible: true, isSortable: false },
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
  stateListDrp = [];
  districtListDrp = [];


  constructor(private fb: FormBuilder,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private message: MessageService,
    public Customvalidation: Customvalidation,
    private cdr: ChangeDetectorRef) {

    this.groupMasterForm1 = this.fb.group({
      companyName: ['', [Validators.required, noInvalidPipelineName()]],
      registrationno: ['', [Validators.required, noInvalidPipelineName()]],
      panNumber: ['', [Validators.required, Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)]],
      gstIn: ['', [Validators.required, Validators.pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)]],
      address: ['', [Validators.required, noInvalidPipelineName()]],
      district: ['', Validators.required],
      stateId: ['', Validators.required],
      pincone: ['', [Validators.required, Validators.pattern(/^[1-9][0-9]{5}$/)]],
      contactperson: ['', [Validators.required, noInvalidPipelineName()]],
      bankAccountNo: ['', [Validators.required, Validators.pattern(/^[0-9]{9,18}$/)]],
      iFSCcode: ['', [Validators.required, Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)]],
      isVerified: [false, ''],
    });

  }

  toUppercase(controlName: string) {
    const control = this.groupMasterForm1.get(controlName);
    if (control?.value) {
      control.setValue(control.value.toUpperCase(), { emitEvent: false });
    }
  }

  allowOnlyNumbers(event: any) {
    event.target.value = event.target.value.replace(/[^0-9]/g, '');
  }


  get f() { return this.groupMasterForm1.controls }

  ngOnInit(): void {
    this.getTableData(true);
    this.GetStateList()
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  onCheckboxChange(fieldName: string, event: any) {
    const isChecked = event.target.checked;
    this.groupMasterForm1.get(fieldName)?.setValue(isChecked);
  }

  GetStateList() {
    this.userService.getQuestionPaper(`uspGetStateCityDrp|action=STATE|id=0`).subscribe((res: any) => {
      this.stateListDrp = res['table']
    })
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  onStateChange(event: any) {
    const stateId = event.value;
    this.GetDistrictList(stateId);
  }

  GetDistrictList(stateId: any, callback?: Function) {
    this.userService
      .getQuestionPaper(`uspGetCityList|action=CITY|id=${stateId}`)
      .subscribe((res: any) => {
        this.districtListDrp = res['table'] || [];
        if (callback) callback(); // district patch after list loaded
      });
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
      this.userService.getQuestionPaper(`uspGetVendorProfileDetails|${query}`).subscribe({
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


  // showDialog(view: string, data: any) {
  //   this.selectedIndex = data;
  //   this.visible = true;
  //   this.postType = view;
  //   this.header = view === 'add' ? 'Add' : view === 'update' ? 'Update' : 'View';
  //   this.headerIcon = view === 'add' ? 'pi pi-plus' : view === 'update' ? 'pi pi-pencil' : 'pi pi-eye';

  //   if (view === 'add') {
  //     this.groupMasterForm1.reset();
  //     this.groupMasterForm1.enable();
  //   }
  //   else {
  //     if (view === 'view') {
  //       this.groupMasterForm1.disable();
  //     }
  //     else {
  //       this.groupMasterForm1.enable();
  //     }

  //     this.groupMasterForm1.patchValue({
  //       companyName: data.orgName || '',
  //       registrationno: data.registrationNo || '',
  //       panNumber: data.pan || '',
  //       gstIn: data.gstin || '',
  //       address: data.address || '',
  //       district: data.districtId || '',
  //       stateId: data.stateId || '',
  //       pincone: data.pincode || '',
  //       contactperson: data.contactPerson || '',
  //       bankAccountNo: data.bankAccountNo || '',
  //       iFSCcode: data.ifscCode || '',
  //       isVerified: data.isVerified || '',
  //     });
  //   }

  //   document.body.style.overflow = 'hidden'; // prevent background scroll
  // }

  showDialog(view: string, data: any) {
    this.selectedIndex = data;
    this.visible = true;
    this.postType = view;
    this.header = view === 'add' ? 'Add' : view === 'update' ? 'Update' : 'View';
    this.headerIcon = view === 'add' ? 'pi pi-plus' : view === 'update' ? 'pi pi-pencil' : 'pi pi-eye';

    if (view === 'add') {
      this.groupMasterForm1.reset();
      this.groupMasterForm1.enable();
    } else {
      if (view === 'view') {
        this.groupMasterForm1.disable();
      } else {
        this.groupMasterForm1.enable();
      }

      // Step 1: Patch stateId first
      this.groupMasterForm1.patchValue({
        stateId: data.stateId || ''
      });


      // this.GetDistrictList(data.stateId)
      this.GetDistrictList(data.stateId, () => {
        this.groupMasterForm1.patchValue({
          district: data.districtId || '' // district bind correctly after list load
        });
      });
      // Step 4: Patch other fields
      this.groupMasterForm1.patchValue({
        companyName: data.orgName || '',
        registrationno: data.registrationNo || '',
        panNumber: data.pan || '',
        gstIn: data.gstin || '',
        address: data.address || '',
        pincone: data.pincode || '',
        contactperson: data.contactPerson || '',
        bankAccountNo: data.bankAccountNo || '',
        iFSCcode: data.ifscCode || '',
        isVerified: data.isVerified || '',
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

    const companyName = String(this.groupMasterForm1.get('companyName')?.value || '').trim();
    const registrationno = String(this.groupMasterForm1.get('registrationno')?.value || '').trim();
    const panNumber = String(this.groupMasterForm1.get('panNumber')?.value || '').trim();
    const gstIn = String(this.groupMasterForm1.get('gstIn')?.value || '').trim();
    const address = String(this.groupMasterForm1.get('address')?.value || '').trim();
    let stateId = this.groupMasterForm1.get('stateId')?.value;
    let district = this.groupMasterForm1.get('district')?.value;
    const pincone = String(this.groupMasterForm1.get('pincone')?.value || '').trim();
    const contactperson = String(this.groupMasterForm1.get('contactperson')?.value || '').trim();
    const bankAccountNo = String(this.groupMasterForm1.get('bankAccountNo')?.value || '').trim();
    const iFSCcode = String(this.groupMasterForm1.get('iFSCcode')?.value || '').trim();
    const isVerified = this.groupMasterForm1.get('isVerified')?.value ? '1' : '0';

    this.paramvaluedata = `companyName=${companyName}|registrationNo=${registrationno}|pan=${panNumber}|gstIn=${gstIn}|Address=${address}|districtId=${district}|stateId=${stateId}|pincode=${pincone}|contactPerson=${contactperson}|bankAccountNo=${bankAccountNo}|IFSCCode=${iFSCcode}|isVerified=${isVerified}`;
    this.openConfirmation('Confirm?', 'Are you sure you want to proceed?', '1', '1', event);
  }


  submitcall() {
    this.isFormLoading = true;
    let query = '';
    let SP = '';

    if (this.postType === 'update') {
      query = `${this.paramvaluedata}|id=${this.selectedIndex.id}|userId=${sessionStorage.getItem('userId')}`;
      SP = `uspUpdateVendorProfile`;
    }
    else {
      query = `${this.paramvaluedata}|userId=${sessionStorage.getItem('userId')}`;
      SP = `uspPostOrganizationProfile`;
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
      this.userService.SubmitPostTypeData(`uspDeleteVendorProfile`, query, 'header').subscribe({
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
