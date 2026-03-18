import { Component, ChangeDetectorRef, signal, ViewChild } from '@angular/core';
import { TableTemplate, TableColumn } from '../../table-template/table-template';
import { ButtonModule } from 'primeng/button';
import { Popover } from 'primeng/popover';
import { Tooltip } from "primeng/tooltip";
import { Dialog } from 'primeng/dialog';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
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
import { ConfigService } from '../../shared/config.service';
import { HttpErrorResponse } from '@angular/common/http';
import { TableModule } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { FileUploadModule } from 'primeng/fileupload';
import { OnlyNumberDirective } from '../../shared/directive/only-number.directive';
import { OnlyStringDirective } from '../../shared/directive/only-string.directive';
import { BreadcrumbModule } from 'primeng/breadcrumb';

declare var $: any;

interface DropdownItem {
  drpValue: number | string;
  drpOption: string;
}

interface ContactRow {
  id?: number;
  contAddress: string;          // 👈 selected address
  contatcPerson: string;
  officePhoneNo?: string;
  officeMobileNo: string;
  personalMobileNo?: string;
  contactOfficeMail?: string;
  personalEmailContact?: string;
}

interface AddressRow {
  id?: number;
  officeAddress: string;
  countryId: any;
  countryName: string;
  stateId: any;
  stateName: string;
  cityId: any;
  cityName: string;
  pincode: string;
  officeMobile?: string;
  officeEmail?: string;
  gst: 'Yes' | 'No';
  gstNo?: string;
  gstImage?: any;
  gstFileUrl?: string;
  contactList: ContactRow[];
}


interface ItemDetail {
  officeAdd: string;
  country: string;
  countryId: string | number;
  state: string;
  stateId: string | number;
  district: string;
  districtId: string | number;
  pincode: string;
  officeMobile: string;
  officeEmail: string;
  contactPerson: string;
  officeMobileNo: string;
  personalMobileNo: string;
  officePhoneNo: string;
  contOfficeEmail: string;
  personalEmail: string;
}


@Component({
  selector: 'app-customer-details',
  imports: [
    TableTemplate,
    TableModule,
    IconFieldModule,
    CardModule,
    InputIconModule,
    InputTextModule,
    ButtonModule,
    FileUploadModule,
    OnlyNumberDirective,
    OnlyStringDirective,
    BreadcrumbModule,
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
  templateUrl: './customer-details.html',
  styleUrl: './customer-details.scss'
})

export class CustomerDetails {
  @ViewChild('panileUpload') panileUpload: any;
  @ViewChild('gstFileUpload') gstFileUpload: any;
  @ViewChild('dt') dt: any;

  isLoading = true;

  activeTab: 'details' | 'kyc' | 'payment' = 'details';
  dialogTab: 'address' | 'contact' = 'address';
  setTab(tab: 'details' | 'kyc' | 'payment') {
    this.activeTab = tab;
  }

  setIfsc() {
    const selectedBranchId = this.groupMasterForm1.get('branchName')?.value;

    if (!selectedBranchId || !this.branchNameDrp?.length) {
      this.groupMasterForm1.patchValue({ ifsc: '' });
      return;
    }

    const selectedBranch = this.branchNameDrp.find(
      (b: any) => b.drpValue === selectedBranchId
    );

    if (selectedBranch && selectedBranch.ifsc) {
      this.groupMasterForm1.patchValue({
        ifsc: selectedBranch.ifsc
      });
    } else {
      this.groupMasterForm1.patchValue({
        ifsc: ''
      });
    }
  }

  visible: boolean = false;
  postType: string = '';
  header: any = '';
  selectedIndex: any = [];
  headerIcon: string = 'pi pi-plus';
  paramvaluedata: string = '';
  isFormLoading: boolean = false;
  data: any[] = [];
  groupMasterForm1: FormGroup;
  showContact: boolean = false;
  contactAddressDrp: DropdownItem[] = [];
  bankNameDrp: any = [];
  custTypeDrp = []

  groupListArray: ItemDetail[] = [];
  editContactIndex: number | null = null;
  editContactAddressIndex: number | null = null;

  itemDailog: boolean = false
  itemDailog1: boolean = false
  selectedPanImage: string | null = null;

  countryDrp: DropdownItem[] = [];
  stateDrp: DropdownItem[] = [];
  cityDrp: DropdownItem[] = [];

  editAddressIndex: number | null = null;
  custCategoryDrp: any = [];
  OwnershipType: any = [];
  clinicTypeDrp: any = [];
  isIndian: boolean = true;

  branchNameDrp: any = [];
  branchList: any = [];

  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true, },
    { key: 'name', header: 'Name', isVisible: true, isSortable: false },
    { key: 'custType', header: 'Type', isVisible: true, isSortable: false },
    { key: 'clientCat', header: 'Category', isVisible: true, isSortable: false },
    { key: 'website', header: 'Website', isVisible: true, isSortable: false },
    { key: 'panNo', header: 'Pan No', isVisible: true, isSortable: false },
    { key: 'jsonDetails', header: 'Pan Upload', isVisible: true, isSortable: false, isCustom: true },
    { key: 'uinNo', header: 'Uin No', isVisible: true, isSortable: false },
    { key: 'cinNo', header: 'Cin No', isVisible: true, isSortable: false },
    { key: 'msmeNo', header: 'MSME No', isVisible: true, isSortable: false },
    { key: 'accName', header: 'Bank(Supplier Name)', isVisible: true, isSortable: false },
    { key: 'ifsc', header: 'IFSC', isVisible: true, isSortable: false },
    { key: 'branchName', header: 'Branch Name', isVisible: true, isSortable: false },
    { key: 'bankName', header: 'Bank Name', isVisible: true, isSortable: false },
    { key: 'accountNo', header: 'Account No', isVisible: true, isSortable: false },
    { key: 'jsonDetails1', header: 'Address', isVisible: true, isSortable: false, isCustom: true }

  ];

  pageNo = 1;
  pageSize = 5;
  searchText = '';
  totalCount = 0;
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  isBranchLoading: boolean = false;
  selectedRowDetails: any[] = [];

  showGstUploadDialog = false;
  selectedGstFile: File | null = null;
  uploadedGstFileUrl: string | null = null;
  isUploadingGstFile = false;

  showViewBtn = false;
  showEditBtn = false;
  showDeleteBtn = false;
  showActiveBtn = false;

  showPanUploadDialog = false;
  selectedPanFile: File | null = null;
  uploadedPanFileUrl: string | null = null;
  isUploadingPanFile = false;


  addressList: AddressRow[] = [];
  contactList: ContactRow[] = [];
  editContactId: number | null = null;

  constructor(private fb: FormBuilder,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private message: MessageService,
    private configService: ConfigService,
    public Customvalidation: Customvalidation,
    private cdr: ChangeDetectorRef) {

    this.groupMasterForm1 = this.fb.group({
      /* DETAILS */
      name: ['', [Validators.required, noInvalidPipelineName()]],
      detailstype: ['', Validators.required],
      category: [''],
      ownershipType: ['', Validators.required],
      website: ['', [this.noInvalidPipelineName()]],

      /* KYC */
      isIndian: [true],
      panNo: [
        '',
        [
          Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]$/)
        ]
      ],
      panImage: [''],
      uinNo: [''],
      cinNo: [''],
      msme: [false],              // checkbox
      msmeNo: [{ value: '', disabled: true }], // input

      /* PAYMENT */
      bankSupplierName: [''],
      bankName: [''],
      branchName: [''],
      ifsc: [{ value: '', disabled: true }], // ⭐ IMPORTANT
      accountNo: [
        '',
        [
          Validators.minLength(8),
          Validators.maxLength(17)
        ]
      ],

      /* Address - Other Details */
      officeAddress: ['', [Validators.required, noInvalidPipelineName()]],
      countryId: ['', Validators.required],
      stateId: ['', Validators.required],
      cityId: ['', Validators.required],
      pincode: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[1-9][0-9]{5}$/)  // 🔥 cannot start with 0 + 6 digits
        ]
      ],
      officeMobile: [
        '',
        [
          Validators.pattern(/^[6-9]\d{9}$/) // ⭐ starts with 6/7/8/9 + total 10 digits
        ]
      ],
      officeEmail: [
        '',
        [
          Validators.email,
          Validators.pattern(/^(?![.\s]+$)[^\s@]+@[^\s@]+\.[^\s@]{2,}$/)
        ]
      ],
      gst: [false],
      gstNo: [
        '',
        [
          Validators.required,
          Validators.pattern('^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$')
        ]
      ],
      gstImage: [''],

      /* Cotact Details */
      contAddress: ['', Validators.required],
      contatcPerson: ['', [Validators.required, noInvalidPipelineName()]],
      officePhoneNo: [
        '',
        [
          Validators.pattern(/^[6-9]\d{9}$/)
        ]
      ],
      officeMobileNo: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[6-9]\d{9}$/)
        ]
      ],
      personalMobileNo: [
        '',
        [
          Validators.pattern(/^[6-9]\d{9}$/)
        ]
      ],
      contactOfficeMail: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
        ]
      ],
      personalEmailContact: [
        '',
        [
          Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
        ]
      ],
    });

  }

  get f() { return this.groupMasterForm1.controls }

  noInvalidPipelineName(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value || value.trim() === '') {
        return null;  // optional field
      }
  
      if (/^[.\s]+$/.test(value)) {
        return { invalidValue: true };
      }
      if (!/[a-zA-Z0-9]/.test(value)) {
        return { noAlphaNumeric: true };
      }
  
      return null;
    };
  }

  ngOnInit(): void {
    this.getTableData(true);
    this.getMasterDrp()
    this.Getowernshiptype()
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  checkGST() {
    const gstCtrl = this.groupMasterForm1.get('gst');
    const gstImageCtrl = this.groupMasterForm1.get('gstImage');
    const gstNoCtrl = this.groupMasterForm1.get('gstNo');

    if (gstCtrl?.value === true) {
      // ✅ GST checked → mandatory
      gstImageCtrl?.setValidators([Validators.required]);
      gstNoCtrl?.setValidators([
        Validators.required,
        Validators.pattern('^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$')
      ]);
    } else {
      // ✅ GST unchecked → NOT mandatory
      gstImageCtrl?.clearValidators();
      gstNoCtrl?.clearValidators();

      gstImageCtrl?.setValue('');
      gstNoCtrl?.setValue('');
      this.uploadedGstFileUrl = null;
    }

    gstImageCtrl?.updateValueAndValidity();
    gstNoCtrl?.updateValueAndValidity();
  }


  allowOnlyDigits(event: KeyboardEvent) {
    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];
    if (allowedKeys.includes(event.key)) return;
    if (!/^\d$/.test(event.key)) event.preventDefault();
  }

  onPasteDigits(event: ClipboardEvent) {
    const pasted = event.clipboardData?.getData('text') || '';
    if (!/^\d+$/.test(pasted)) event.preventDefault();
  }

  checkIndian() {
    const isIndian = this.groupMasterForm1.get('isIndian')?.value;

    const panNoCtrl = this.groupMasterForm1.get('panNo');
    const panImgCtrl = this.groupMasterForm1.get('panImage');

    if (isIndian) {

      panNoCtrl?.setValidators([
        Validators.required,
        Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]$/)
      ]);

      panImgCtrl?.setValidators([Validators.required]);

    } else {

      panNoCtrl?.setValidators([
        Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]$/)
      ]);

      panImgCtrl?.clearValidators();
      panNoCtrl?.setValue('');
      panImgCtrl?.setValue('');

    }

    panNoCtrl?.updateValueAndValidity();
    panImgCtrl?.updateValueAndValidity();
  }


  addOrUpdateAddress() {
    if (
      this.groupMasterForm1.get('officeAddress')?.invalid ||
      this.groupMasterForm1.get('countryId')?.invalid ||
      this.groupMasterForm1.get('stateId')?.invalid ||
      this.groupMasterForm1.get('cityId')?.invalid ||
      this.groupMasterForm1.get('pincode')?.invalid
    ) {
      this.groupMasterForm1.markAllAsTouched();
      return;
    }

    if (this.groupMasterForm1.value.gst) {
      if (
        this.groupMasterForm1.get('gstNo')?.invalid ||
        !this.uploadedGstFileUrl
      ) {
        this.groupMasterForm1.get('gstNo')?.markAsTouched();
        this.groupMasterForm1.get('gstImage')?.markAsTouched();
        return;
      }
    }

    const addressObj: AddressRow = {
      id: this.editAddressIndex !== null ? this.addressList[this.editAddressIndex].id || 0 : 0,

      officeAddress: this.groupMasterForm1.value.officeAddress,
      countryId: this.groupMasterForm1.value.countryId,
      countryName: this.countryDrp.find(x => x.drpValue === this.groupMasterForm1.value.countryId)?.drpOption || '',
      stateId: this.groupMasterForm1.value.stateId,
      stateName: this.stateDrp.find(x => x.drpValue === this.groupMasterForm1.value.stateId)?.drpOption || '',
      cityId: this.groupMasterForm1.value.cityId,
      cityName: this.cityDrp.find(x => x.drpValue === this.groupMasterForm1.value.cityId)?.drpOption || '',
      pincode: this.groupMasterForm1.value.pincode,
      officeMobile: this.groupMasterForm1.value.officeMobile,
      officeEmail: this.groupMasterForm1.value.officeEmail,
      gst: this.groupMasterForm1.value.gst ? 'Yes' : 'No',
      gstNo: this.groupMasterForm1.value.gst ? this.groupMasterForm1.value.gstNo : '',
      gstImage: this.groupMasterForm1.value.gst ? this.groupMasterForm1.value.gstImage : '',
      gstFileUrl: this.groupMasterForm1.value.gst ? this.uploadedGstFileUrl || '' : '',
      contactList: this.editAddressIndex !== null ? this.addressList[this.editAddressIndex].contactList : []
    };

    if (this.editAddressIndex !== null) {
      this.addressList[this.editAddressIndex] = addressObj;
      this.editAddressIndex = null;
    }
    else {
      this.addressList.push(addressObj);
    }

    this.syncContactAddressDropdown();
    this.uploadedGstFileUrl = null;
    this.resetAddressControls();
    this.groupMasterForm1.markAsPristine();
    this.groupMasterForm1.markAsUntouched();
    // this.showContact = true;
  }

  addOrUpdateContact() {
    const contAddressCtrl = this.groupMasterForm1.get('contAddress');
    const contPersonCtrl = this.groupMasterForm1.get('contatcPerson');
    const mobileCtrl = this.groupMasterForm1.get('officeMobileNo');
    const officeEmailCtrl = this.groupMasterForm1.get('contactOfficeMail');

    if (
      contAddressCtrl?.invalid ||
      contPersonCtrl?.invalid ||
      mobileCtrl?.invalid ||
      officeEmailCtrl?.invalid
    ) {
      contAddressCtrl?.markAsTouched();
      contPersonCtrl?.markAsTouched();
      mobileCtrl?.markAsTouched();
      officeEmailCtrl?.markAsTouched();
      return;
    }

    const addressIndex = this.addressList.findIndex(
      a => a.officeAddress === this.groupMasterForm1.value.contAddress
    );

    if (addressIndex === -1) return;
    const addressContacts = this.addressList[addressIndex].contactList;
    if (this.editContactId !== null) {
      const contactIndex = addressContacts.findIndex(
        c => c.id === this.editContactId
      );

      if (contactIndex !== -1) {
        addressContacts[contactIndex] = {
          id: this.editContactId,  // preserve original id
          contAddress: this.groupMasterForm1.value.contAddress,
          contatcPerson: this.groupMasterForm1.value.contatcPerson,
          officePhoneNo: this.groupMasterForm1.value.officePhoneNo,
          officeMobileNo: this.groupMasterForm1.value.officeMobileNo,
          personalMobileNo: this.groupMasterForm1.value.personalMobileNo,
          contactOfficeMail: this.groupMasterForm1.value.contactOfficeMail,
          personalEmailContact: this.groupMasterForm1.value.personalEmailContact
        };

      }
      this.editContactId = null;  // reset after update
    }
    else {

      const isExist = addressContacts.some(c =>
        c.contatcPerson === this.groupMasterForm1.value.contatcPerson
      );

      if (isExist) {
        alert('Contact person already exists for this address');
        return;
      }

      addressContacts.push({
        id: 0,   // new entry
        contAddress: this.groupMasterForm1.value.contAddress,
        contatcPerson: this.groupMasterForm1.value.contatcPerson,
        officePhoneNo: this.groupMasterForm1.value.officePhoneNo,
        officeMobileNo: this.groupMasterForm1.value.officeMobileNo,
        personalMobileNo: this.groupMasterForm1.value.personalMobileNo,
        contactOfficeMail: this.groupMasterForm1.value.contactOfficeMail,
        personalEmailContact: this.groupMasterForm1.value.personalEmailContact
      });
    }

    this.contactList = this.addressList.reduce<ContactRow[]>(
      (all, addr) => [...all, ...(addr.contactList || [])],
      []
    );

    this.resetContactControls();
  }

 
  syncContactAddressDropdown() {
    this.contactAddressDrp = this.addressList.map((addr, index) => ({
      drpValue: addr.officeAddress,   // ya index use kar sakte ho
      drpOption: addr.officeAddress
    }));
  }

  onAddressSearch(event: any) {
    const value = (event.target as HTMLInputElement).value;
    this.dt.filterGlobal(value, 'contains');
  }

  editAddress(row: AddressRow, index: number) {
    this.editAddressIndex = index;

    this.groupMasterForm1.patchValue({
      officeAddress: row.officeAddress,
      pincode: row.pincode,
      officeMobile: row.officeMobile,
      officeEmail: row.officeEmail,
      gst: row.gst === 'Yes',
      gstNo: row.gstNo || '',
      gstImage: row.gstImage || ''
    });

    this.groupMasterForm1.patchValue({
      countryId: row.countryId
    });

    this.onCountryChange({ value: row.countryId });
    setTimeout(() => {
      this.groupMasterForm1.patchValue({
        stateId: row.stateId
      });
      this.onStateChange({ value: row.stateId });
      setTimeout(() => {
        this.groupMasterForm1.patchValue({
          cityId: row.cityId
        });
      }, 300);
    }, 300);

    if (row.gstImage) {
      this.uploadedGstFileUrl = this.normalizeImagePath(row.gstImage);
    }
    else {
      this.uploadedGstFileUrl = null;
    }
    this.checkGST();
  }


  editContact(row: any) {
    this.editContactId = row.id
    this.groupMasterForm1.patchValue({
      contAddress: row.contAddress,
      contatcPerson: row.contatcPerson,
      officePhoneNo: row.officePhoneNo,
      officeMobileNo: row.officeMobileNo,
      personalMobileNo: row.personalMobileNo,
      contactOfficeMail: row.contactOfficeMail,
      personalEmailContact: row.personalEmailContact
    });
  }

  deleteAddress(index: number) {
    this.addressList.splice(index, 1);
    this.syncContactAddressDropdown();
  }

  deleteContact(index: number) {
    const deletedContact = this.contactList[index];
    this.contactList.splice(index, 1);
    const addressIndex = this.addressList.findIndex(
      a => a.officeAddress === deletedContact.contAddress
    );
    if (addressIndex !== -1) {
      this.addressList[addressIndex].contactList =
        this.addressList[addressIndex].contactList.filter(
          (c: any) =>
            !(c.contAddress === deletedContact.contAddress &&
              c.contatcPerson === deletedContact.contatcPerson)
        );
    }

    this.editContactIndex = null;
  }


  resetAddressControls() {
    this.groupMasterForm1.patchValue({
      officeAddress: '',
      countryId: '',
      stateId: '',
      cityId: '',
      pincode: '',
      officeMobile: '',
      officeEmail: '',
      gst: false,
      gstNo: ''
    });
  }

  resetContactControls1() {
    this.groupMasterForm1.patchValue({
      contAddress: '',
      contatcPerson: '',
      officePhoneNo: '',
      officeMobileNo: '',
      personalMobileNo: '',
      contactOfficeMail: '',
      personalEmailContact: ''
    });
  }

  resetContactControls() {
    this.groupMasterForm1.patchValue({
      contAddress: '',
      contatcPerson: '',
      officePhoneNo: '',
      officeMobileNo: '',
      personalMobileNo: '',
      contactOfficeMail: '',
      personalEmailContact: ''
    });

    [
      'contAddress',
      'contatcPerson',
      'officePhoneNo',
      'officeMobileNo',
      'personalMobileNo',
      'contactOfficeMail',
      'personalEmailContact'
    ].forEach(field => {
      const ctrl = this.groupMasterForm1.get(field);
      ctrl?.markAsPristine();
      ctrl?.markAsUntouched();
    });
  }


  onPanInput() {
    const ctrl = this.groupMasterForm1.get('panNo');
    let value = ctrl?.value;

    if (value) {
      value = value.toUpperCase().trim();
      ctrl?.setValue(value, { emitEvent: false });
    }
  }

  
  checkMsme() {
    const isMsme = this.groupMasterForm1.get('msme')?.value;
    const msmeNoCtrl = this.groupMasterForm1.get('msmeNo');

    if (isMsme) {
      msmeNoCtrl?.enable();
      msmeNoCtrl?.setValidators([Validators.required]);
    } else {
      msmeNoCtrl?.reset();
      msmeNoCtrl?.clearValidators();
      msmeNoCtrl?.disable();
    }

    msmeNoCtrl?.updateValueAndValidity();
  }

  getMasterDrp() {
    this.userService.getQuestionPaper(`uspGetCustomerDrpData|id=0|action=DETAILS`).subscribe((res: any) => {
      this.custTypeDrp = res['table'];
      this.custCategoryDrp = res['table1'];
      this.countryDrp = res['table2'];
      this.bankNameDrp = res['table3'];
    })
  }

  Getowernshiptype() {
    this.userService.getQuestionPaper(`uspGetOpportunityDetails|action=CUSTOMER|customerId=0`).subscribe((res: any) => {
      this.OwnershipType = res['table4'];
    })
  }

  onBankChange(event: any) {
    const bankId = event?.value;
    console.log("bankId======", bankId);

    if (!bankId) {
      this.branchNameDrp = [];
      this.groupMasterForm1.patchValue({
        branchName: '',
        ifsc: ''
      });
      return;
    }

    this.getBranchData(bankId);
  }

  getBranchData(bankId: any) {
    this.isBranchLoading = true;
    this.userService
      .getQuestionPaper(`uspGetCustomerDrpData|id=${bankId}|action=BRANCH`)
      .subscribe({
        next: (res: any) => {
          this.branchNameDrp = res?.table || [];
          this.groupMasterForm1.patchValue({
            branchName: '',
            ifsc: ''
          });
          this.isBranchLoading = false;
        },
        error: (err) => {
          console.error("Branch API error", err);
          this.branchNameDrp = [];
          this.isBranchLoading = false;
        }
      });
  }

  ngAfterViewInit() {
    this.groupMasterForm1.get('ifsc')?.disable();
  }

  getIfscData() {
    const branchId = this.groupMasterForm1.get('branchName')?.value;

    const branch = this.branchNameDrp.find(
      (b: any) => b.drpValue === branchId
    );
    this.groupMasterForm1.get('ifsc')?.setValue(branch?.ifsc || '');
  }

  onCountryChange(event: any) {
    const countryId = event?.value;

    this.stateDrp = [];
    this.cityDrp = [];

    this.groupMasterForm1.patchValue({
      stateId: '',
      cityId: ''
    });

    if (!countryId) return;

    this.getStateDrp(countryId);
  }

  getStateDrp(countryId: any) {
    this.userService
      .getQuestionPaper(`uspGetCustomerDrpData|id=${countryId}|action=STATE`)
      .subscribe({
        next: (res: any) => {
          this.stateDrp = res?.table || [];
        },
        error: () => {
          this.stateDrp = [];
        }
      });
  }

  onStateChange(event: any) {
    const stateId = event?.value;

    this.cityDrp = [];
    this.groupMasterForm1.patchValue({ cityId: '' });

    if (!stateId) return;

    this.getCityDrp(stateId);
  }

  getCityDrp(stateId: any) {
    this.userService
      .getQuestionPaper(`uspGetCustomerDrpData|id=${stateId}|action=CITY`)
      .subscribe({
        next: (res: any) => {
          this.cityDrp = res?.table || [];
        },
        error: () => {
          this.cityDrp = [];
        }
      });
  }


  allowOnlyNumbers(event: KeyboardEvent) {
    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];
    if (allowedKeys.includes(event.key)) return;

    const input = (event.target as HTMLInputElement).value;
    const key = event.key;

    if (!/^\d*\.?\d*$/.test(input + key)) {
      event.preventDefault();
    }
  }

  onPasteNumbers(event: ClipboardEvent) {
    const pastedData = event.clipboardData?.getData('text') || '';
    if (!/^\d*\.?\d*$/.test(pastedData)) {
      event.preventDefault();
    }
  }


  getTableData(isTrue: boolean) {
    try {
      if (isTrue) {
        this.isLoading = true;
      } else {
        this.pageNo = 1;
      }
      const userId = sessionStorage.getItem('userId') || '';
      const roleId = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
      const query =
        `appUserId=${userId}` +
        `|userRoleId=${roleId}` +
        `|districtId=${sessionStorage.getItem('District')}` +
        `|searchText=${this.searchText}` +
        `|pageIndex=${this.pageNo}` +
        `|size=${this.pageSize}`;
      this.userService
        .getQuestionPaper(`uspGetCustomerDetailsNew|${query}`)
        .subscribe({
          next: (res: any) => {
            try {
              setTimeout(() => {
                this.data = res?.table1 || [];
                this.totalCount = res?.table?.[0]?.totalCnt || this.data.length;
                this.showViewBtn = false;
                this.showEditBtn = false;
                this.showDeleteBtn = false;
                this.showActiveBtn = false;
                if (res?.table3 && res.table3.length) {
                  this.showViewBtn = res.table3[0].viewBtn;
                  this.showEditBtn = res.table3[0].editBtn;
                  this.showDeleteBtn = res.table3[0].deleteBtn;
                  this.showActiveBtn = res.table3[0].activeBtn;
                }
                this.cdr.detectChanges();
              }, 0);
            } catch (innerErr) {
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

    } catch (error) {
      console.error('Unexpected error in getTableData():', error);
      this.isLoading = false;
    }
  }


  showDialog(view: string, data: any) {
    this.selectedIndex = data;
    this.visible = true;
    this.postType = view;

    this.header =
      view === 'add' ? 'Add' :
        view === 'update' ? 'Update' : 'View';

    this.headerIcon =
      view === 'add' ? 'pi pi-plus' :
        view === 'update' ? 'pi pi-pencil' : 'pi pi-eye';

    if (view === 'add') {
      this.groupMasterForm1.reset();
      this.groupMasterForm1.enable();

      this.addressList = [];
      this.uploadedGstFileUrl = null;
      this.uploadedPanFileUrl = null;
      this.selectedPanImage = null;

      return;
    }

    if (view === 'view') {
      this.groupMasterForm1.disable();
    } else {
      this.groupMasterForm1.enable();
    }

    this.groupMasterForm1.patchValue({
      name: data.name || '',
      detailstype: data.custTypeId || '',
      category: data.clientCatId != null ? +data.clientCatId : '',
      ownershipType: data.ownershipTypeId || '',
      website: data.website || '',

      isIndian: data.isIndian === true,
      panNo: data.panNo || '',
      panImage: data.panImage || '',
      uinNo: data.uinNo || '',
      cinNo: data.cinNo || '',

      msme: data.isMsme || false,
      msmeNo: data.msmeNo || '',

      bankSupplierName: data.accName || '',
      bankName: data.bankId || '',
      branchName: data.branchId || '',
      ifsc: data.ifsc || '',
      accountNo: data.accountNo || ''
    });

    this.uploadedPanFileUrl = data.panImage ? this.normalizeImagePath(data.panImage) : null;
    this.selectedPanImage = this.uploadedPanFileUrl;
    this.addressList = [];

    const raw = data['item Details'];
    if (raw) {
      let parsed: any[] = [];

      if (typeof raw === 'string') {
        try {
          parsed = JSON.parse(raw);
        } catch {
          parsed = [];
        }
      } else if (Array.isArray(raw)) {
        parsed = raw;
      }

      this.addressList = parsed.map(a => ({
        id: a.id || 0,

        officeAddress: a.officeAdd || '',
        countryId: +a.countryId || 0,
        countryName: a.country || '',

        stateId: +a.stateId || 0,
        stateName: a.state || '',

        cityId: +a.districtId || 0,
        cityName: a.district || '',

        pincode: a.pincode || '',
        officeMobile: a.officeMobile || '',
        officeEmail: a.officeEmail || '',

        gst: a.isGST ? 'Yes' : 'No',
        gstNo: a.gstNo || '',
        gstImage: a.gstImage || '',
        gstFileUrl: a.gstImage
          ? this.normalizeImagePath(a.gstImage)
          : '',

        contactList: Array.isArray(a.contactDetails)
          ? a.contactDetails.map((c: any) => ({
            id: c.contactId || 0,
            contAddress: a.officeAdd || '',
            contatcPerson: c.contactPerson || '',
            officePhoneNo: c.officePhoneNo || '',
            officeMobileNo: c.officeMobileNo || '',
            personalMobileNo: c.personalMobileNo || '',
            contactOfficeMail: c.contOfficeEmail || '',
            personalEmailContact: c.personalEmail || ''
          }))
          : []
      }));

      this.syncContactAddressDropdown();

      this.contactList = this.addressList.reduce<ContactRow[]>(
        (all, addr) => [...all, ...(addr.contactList || [])],
        []
      );

    }
    document.body.style.overflow = 'hidden';
  }


  getFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }


  openUploadDialog() {
    this.showGstUploadDialog = true;
    this.selectedGstFile = null;
    this.cdr.detectChanges();
  }

  closeGstUploadDialog() {
    this.showGstUploadDialog = false;
    this.selectedGstFile = null;
    this.cdr.detectChanges();
  }

  onGstFileSelect(event: any) {
    if (event.files && event.files.length > 0) {
      this.selectedGstFile = event.files[0];
      this.cdr.detectChanges();
    }
  }


  clearGstSelection() {
    this.selectedGstFile = null;
    if (this.gstFileUpload) {
      this.gstFileUpload.clear();
    }
    this.cdr.detectChanges();
  }

  clearPanSelection() {
    this.selectedPanFile = null;
    if (this.panileUpload) {
      this.panileUpload.clear();
    }
    this.cdr.detectChanges();
  }

  removeGstFile() {
    this.uploadedGstFileUrl = '';
    this.groupMasterForm1.patchValue({
      gstImage: ''
    });
    this.message.add({
      severity: 'info',
      summary: 'Removed',
      detail: 'Resume removed successfully.',
      life: 2000
    });
  }


  normalizeImagePath(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) {
      return path;
    }
    let normalizedPath = path.replace(/\\/g, '/');
    normalizedPath = normalizedPath.replace(/([^:]\/)\/+/g, '$1');
    return this.configService.baseUrl + normalizedPath;
  }

  onDrawerHide() {
    document.body.style.overflow = 'visible';
  
    this.groupMasterForm1.reset();
    this.groupMasterForm1.enable();
  
    Object.keys(this.groupMasterForm1.controls).forEach(key => {
      const control = this.groupMasterForm1.get(key);
      control?.setErrors(null);
      control?.markAsPristine();
      control?.markAsUntouched();
      control?.updateValueAndValidity({ emitEvent: false });
    });
  
    this.uploadedGstFileUrl = '';
    this.selectedGstFile = null;
    this.showGstUploadDialog = false;
  
    this.uploadedPanFileUrl = '';
    this.selectedPanFile = null;
    this.showPanUploadDialog = false;
  
    this.editAddressIndex = null;
    this.editContactIndex = null;
    this.editContactId = null;
  
    this.addressList = [];
    this.contactList = [];
  
    this.showContact = false;
    this.visible = false;
  
    this.addressList = [...this.addressList];
    this.contactList = [...this.contactList];
    this.cdr.detectChanges();
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

  onGstInput() {
    const ctrl = this.groupMasterForm1.get('gstNo');
    const value = ctrl?.value;

    if (value) {
      ctrl?.setValue(value.toUpperCase(), { emitEvent: false });
    }
  }



  onSubmit(event: any) {
    const addressControls = [
      'officeAddress',
      'countryId',
      'stateId',
      'cityId',
      'pincode',
      'officeMobile',
      'officeEmail',
      'gst',
      'gstNo',
      'gstImage'
    ];

    const contactControls = [
      'contAddress',
      'contatcPerson',
      'officePhoneNo',
      'officeMobileNo',
      'personalMobileNo',
      'contactOfficeMail',
      'personalEmailContact'
    ];

    [...addressControls, ...contactControls].forEach(c =>
      this.groupMasterForm1.get(c)?.disable({ emitEvent: false })
    );

    if (this.groupMasterForm1.invalid) {

      Object.keys(this.groupMasterForm1.controls).forEach(key => {
        if (
          !addressControls.includes(key) &&
          !contactControls.includes(key)
        ) {
          this.groupMasterForm1.get(key)?.markAsTouched();
        }
      });

      [...addressControls, ...contactControls].forEach(c =>
        this.groupMasterForm1.get(c)?.enable({ emitEvent: false })
      );

      return;
    }

    if (!this.addressList || this.addressList.length === 0) {
      this.message.add({
        severity: 'warn',
        summary: 'Alert!',
        detail: 'Please add at least one address.'
      });

      [...addressControls, ...contactControls].forEach(c =>
        this.groupMasterForm1.get(c)?.enable({ emitEvent: false })
      );

      return;
    }

    const addressWithoutContact = this.addressList.find(
      a => !a.contactList || a.contactList.length === 0
    );

    if (addressWithoutContact) {
      this.message.add({
        severity: 'warn',
        summary: 'Alert!',
        detail: `Please add at least one contact for address ${addressWithoutContact.officeAddress}`
      });

      [...addressControls, ...contactControls].forEach(c =>
        this.groupMasterForm1.get(c)?.enable({ emitEvent: false })
      );

      return;
    }

    [...addressControls, ...contactControls].forEach(c =>
      this.groupMasterForm1.get(c)?.enable({ emitEvent: false })
    );

    const itemVar: any = {
      name: this.groupMasterForm1.get('name')?.value || '',
      custTypeId: this.groupMasterForm1.get('detailstype')?.value || 0,
      clientCatId: this.groupMasterForm1.get('category')?.value || 0,
      ownershipTypeId: this.groupMasterForm1.get('ownershipType')?.value || 0,
      website: this.groupMasterForm1.get('website')?.value || '',
      panNo: this.groupMasterForm1.get('panNo')?.value || '',
      uinNo: this.groupMasterForm1.get('uinNo')?.value || '',
      cinNo: this.groupMasterForm1.get('cinNo')?.value || '',
      accName: this.groupMasterForm1.get('bankSupplierName')?.value || '',
      ifsc: this.groupMasterForm1.get('ifsc')?.value || '',
      branchId: this.groupMasterForm1.get('branchName')?.value || 0,
      bankId: this.groupMasterForm1.get('bankName')?.value || 0,
      accountNo: this.groupMasterForm1.get('accountNo')?.value || '',
      isMsme: this.groupMasterForm1.get('msme')?.value,
      msmeNo: this.groupMasterForm1.get('msmeNo')?.value || '',
      panImage: this.groupMasterForm1.get('panImage')?.value || '',
      isIndian: this.groupMasterForm1.get('isIndian')?.value
    };

    if (this.postType === 'update') {
      itemVar['id'] = this.selectedIndex.transId;
    }


    const addressJSON = this.addressList.map(a => ({
      id: a.id || 0,

      officeAdd: a.officeAddress,
      countryId: a.countryId,
      country: a.countryName,
      stateId: a.stateId,
      state: a.stateName,
      cityId: a.cityId,
      city: a.cityName,
      pincode: a.pincode,
      officeMobile: a.officeMobile || '',
      officeEmail: a.officeEmail || '',
      isGST: a.gst === 'Yes',
      gstNo: a.gst === 'Yes' ? a.gstNo : '',
      gstImage: a.gst === 'Yes' ? a.gstImage : '',

      contactJson: (a.contactList || []).map(c => ({
        id: c.id || 0,
        address: c.contAddress,
        contactPerson: c.contatcPerson,
        officePhoneNo: c.officePhoneNo || '',
        officeMobileNo: c.officeMobileNo || '',
        personalMobileNo: c.personalMobileNo || '',
        contOfficeEmail: c.contactOfficeMail || '',
        personalEmail: c.personalEmailContact || ''
      }))
    }));


    this.paramvaluedata =
      `detailsJSON=${JSON.stringify([itemVar])}` +
      `|addressJSON=${JSON.stringify(addressJSON)}`;
    this.openConfirmation(
      'Confirm?',
      'Are you sure you want to proceed?',
      '1',
      '1',
      event
    );
  }

  submitcall() {
    this.isFormLoading = true;
    let query = '';
    let SP = '';

    if (this.postType === 'update') {
      query = `custHeadId=${this.selectedIndex.transId}|${this.paramvaluedata}|districtId=${sessionStorage.getItem('District')}|appUserId=${sessionStorage.getItem('userId')}`;
      SP = `uspPostUpdateCustomerDetailsNew`;
    }
    else {
      query = `${this.paramvaluedata}|districtId=${sessionStorage.getItem('District')}|appUserId=${sessionStorage.getItem('userId')}`;
      SP = `uspPostCustomerDetailsNew`;
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



  deleteItem(item: any) {
    this.selectedIndex = item;
    this.openConfirmation("Confirm", "Are you sure want to delete?", '1', '2');
  }

  openDetailModal(rowData: any) {
    this.itemDailog = true;

    if (typeof rowData.uploadDocuments === 'string' && rowData.uploadDocuments.includes('[')) {
      try {
        this.selectedRowDetails = JSON.parse(rowData.uploadDocuments);
      } catch (e) {
        console.error('Error parsing attachment JSON:', e);
        this.selectedRowDetails = [];
      }
    }
    else if (typeof rowData.uploadDocuments === 'string' && rowData.uploadDocuments.trim() !== '') {
      this.selectedRowDetails = [{ resumeUpload: rowData.uploadDocuments }];
    }
    else {
      this.selectedRowDetails = [];
    }
  }


  deleteData() {
    try {
      this.isFormLoading = true;
      let query = `action=Delete|id=${this.selectedIndex.transId}|appUserId=${sessionStorage.getItem('userId')}`;
      this.userService.SubmitPostTypeData(`uspPostCustomerDetailsAction`, query, 'header').subscribe({
        next: (datacom: any) => {
          this.isFormLoading = false;
          try {
            if (!datacom) return;
            const resultarray = datacom.split('-');
            if (resultarray[1] === 'success') {
              this.pageNo = 1;

              this.addressList = [];
              this.contactList = [];

              this.getTableData(true);
              this.message.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Data deleted successfully.',
                life: 3000
              });
              this.onDrawerHide();
            }
            else {
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


  openPanUploadDialog() {
    this.showPanUploadDialog = true;
    this.selectedPanFile = null;
    this.cdr.detectChanges();
  }

  closePanUploadDialog() {
    this.showPanUploadDialog = false;
    this.selectedPanFile = null;
    this.cdr.detectChanges();
  }

  onPanFileSelect(event: any) {
    if (event.files && event.files.length > 0) {
      this.selectedPanFile = event.files[0];
      this.cdr.detectChanges();
    }
  }

  uploadPanImage() {
    if (!this.selectedPanFile) {
      this.message.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please select PAN Document.',
        life: 3000
      });
      return;
    }

    this.isUploadingPanFile = true;
    this.cdr.detectChanges();

    const filesArray: File[] = [this.selectedPanFile];
    const folderName = 'PanDocuments';

    this.userService.MastrtfileuploadNew(filesArray, folderName).subscribe({
      next: (datacom: any) => {
        this.isUploadingPanFile = false;

        const resultarray = datacom?.split('-');
        if (resultarray?.[0] === '1') {
          const relativePath = resultarray[1];
          const fullUrl = this.normalizeImagePath(relativePath);

          this.groupMasterForm1.patchValue({
            panImage: relativePath
          });

          this.uploadedPanFileUrl = fullUrl;

          this.message.add({
            severity: 'success',
            summary: 'Success',
            detail: 'PAN Document Uploaded Successfully!',
            life: 3000
          });

          this.closePanUploadDialog();
        } else {
          this.message.add({
            severity: 'warn',
            summary: 'Warning',
            detail: resultarray?.[1] || datacom,
            life: 3000
          });
        }

        this.cdr.detectChanges();
      },
      error: () => {
        this.isUploadingPanFile = false;
        this.message.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to upload PAN Document.',
          life: 3000
        });
        this.cdr.detectChanges();
      }
    });
  }


  uploadGstImage() {
    try {
      if (!this.selectedGstFile) {
        this.message.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'Please select a resume file.',
          life: 3000
        });
        return;
      }

      this.isUploadingGstFile = true;
      this.cdr.detectChanges();

      const filesArray: File[] = [this.selectedGstFile];
      const folderName = 'GstDocuments';

      this.userService.MastrtfileuploadNew(filesArray, folderName).subscribe({
        next: (datacom: any) => {
          this.isUploadingGstFile = false;

          try {
            if (!datacom) {
              this.message.add({
                severity: 'warn',
                summary: 'Warning',
                detail: 'No response received from server.',
                life: 3000
              });
              return;
            }

            const resultarray = datacom.split('-');
            if (resultarray[0] === '1') {

              const relativePath = resultarray[1].toString();
              const fullUrl = this.normalizeImagePath(relativePath);

              this.groupMasterForm1.patchValue({
                gstImage: relativePath
              });

              const ctrl = this.groupMasterForm1.get('gstImage');
              ctrl?.markAsDirty();
              ctrl?.markAsTouched();
              ctrl?.updateValueAndValidity();

              this.uploadedGstFileUrl = fullUrl;

              this.message.add({
                severity: 'success',
                summary: 'Success',
                detail: 'GST File uploaded successfully!',
                life: 3000
              });

              this.closeGstUploadDialog();
            }

            else {
              this.message.add({
                severity: 'warn',
                summary: 'Warning',
                detail: resultarray[1] || datacom,
                life: 3000
              });
            }
          } catch (innerErr) {
            console.error('Error processing resume upload response:', innerErr);
            this.message.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Something went wrong while processing the upload response.',
              life: 3000
            });
          }

          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => {
          this.isUploadingGstFile = false;
          try {
            if (err.status === 401 || err.status === 403) {
              const msg = err.status === 401 ? 'You are not authorized!' : 'Access forbidden!';
              this.message.add({
                severity: 'error',
                summary: 'Error',
                detail: msg,
                life: 3000
              });
            } else {
              this.message.add({
                severity: 'error',
                summary: 'Error',
                detail: err.message.toString(),
                life: 3000
              });
            }
          } catch (innerErr) {
            console.error('Error handling upload error response:', innerErr);
            this.message.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Unexpected error while handling upload failure.',
              life: 3000
            });
          }

          this.cdr.detectChanges();
        }
      });

    } catch (error: any) {
      this.isUploadingGstFile = false
      this.message.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Something went wrong while uploading resume.',
        life: 3000
      });

      this.cdr.detectChanges();
    }
  }


  removePanFile() {
    this.uploadedPanFileUrl = '';
    this.groupMasterForm1.patchValue({
      panImage: ''
    });

    this.message.add({
      severity: 'info',
      summary: 'Removed',
      detail: 'PAN Document Removed Successfully.',
      life: 2000
    });
  }


  showGrouplist(data: any) {
    if (!data?.panImage) {
      this.message.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'PAN Document not available.',
        life: 3000
      });
      return;
    }

    this.itemDailog = true;

    this.selectedPanImage = this.normalizeImagePath(data.panImage);

    const raw = data['item Details'];

    if (typeof raw === 'string') {
      try {
        this.groupListArray = JSON.parse(raw);
      } catch (e) {
        console.error('Invalid JSON', e);
        this.groupListArray = [];
      }
    } else if (Array.isArray(raw)) {
      this.groupListArray = raw;
    } else {
      this.groupListArray = [];
    }
  }


  showGrouplist1(data: any) {

    this.itemDailog1 = true;
    this.dialogTab = 'address';

    const raw = data['item Details'];
    let parsed: any[] = [];

    if (typeof raw === 'string') {
      try {
        parsed = JSON.parse(raw);
      } catch {
        parsed = [];
      }
    } else if (Array.isArray(raw)) {
      parsed = raw;
    }

    this.addressList = [];
    this.contactList = [];

    parsed.forEach((address: any) => {
      this.addressList.push(address);
      if (Array.isArray(address.contactDetails)) {
        address.contactDetails.forEach((contact: any) => {
          this.contactList.push({
            ...contact,
            officeAdd: address.officeAdd   // optional agar dikhana ho
          });
        });
      }

    });

  }


}
