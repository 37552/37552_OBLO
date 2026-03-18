import { Component, EventEmitter, Input, Output, ChangeDetectorRef, ViewChild } from '@angular/core';
import { TableTemplate, TableColumn } from '../../table-template/table-template';
import { ButtonModule } from 'primeng/button';
import { Popover } from 'primeng/popover';
import { Tooltip } from "primeng/tooltip";
import { Dialog } from 'primeng/dialog';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { AbstractControl, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { CardModule } from 'primeng/card';
import { DrawerModule } from 'primeng/drawer';
import { UserService } from '../../shared/user-service';
import { ExcelService } from '../../shared/excel.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Toast } from 'primeng/toast';
import { MultiSelectModule } from 'primeng/multiselect';
import { Customvalidation, noInvalidPipelineName } from '../../shared/Validation';
import { HttpErrorResponse } from '@angular/common/http';
import { TableModule } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { FileUpload, FileUploadModule } from 'primeng/fileupload';
import { ConfigService } from '../../shared/config.service';
import { DatePipe } from '@angular/common';
import { TabsModule } from 'primeng/tabs';
import { OnlyNumberDirective } from '../../shared/directive/only-number.directive';
import { OnlyStringDirective } from '../../shared/directive/only-string.directive';
import { CheckboxModule } from 'primeng/checkbox';
import { CheckboxChangeEvent } from 'primeng/checkbox';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { AccordionModule } from 'primeng/accordion';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RadioButtonModule } from 'primeng/radiobutton';

interface PrevExperience {
  id: number;
  prevCompanyId: number;
  prevCompany_Text: string;
  designationId: number;
  designation_Text: string;
  reportingMng: string;
  reprtMngPhone: string;
  reprtMngEmail: string;
  dateFrom: string | null;
  dateTo: string | null;
  isDeleted?: boolean;
}

interface Family {
  id: number;
  name: string;
  age: number;
  relationShip_Text: string;
  relationShipId: number;
  phone: string;
  dob: string | null;
  address: string;
  addressProof: string;
  idProof: string;
  isDeleted?: boolean;
}

interface Performance {
  id: number;
  taskId: number;
  task_Text: string;
  score: any;
  status: any;
  upload: string;
  isDeleted?: boolean;
}

interface Qualification {
  id: number;
  empQualifnId: number;
  empQualifn_Text: string;
  qualfBrnchId: number;
  qualfBrnch_Text: string;
  university: string;
  dateFrom: string | null;
  dateTo: string | null;
  degreeDoc: any;
  twelveDoc: any;
  tenthDoc: any;
  isDeleted?: boolean;
}

interface Bank {
  id: number;
  bankNameId: number;
  bankName_Text: string;
  branchId: number;
  branch_Text: string;
  account: string;
  reAccount: string;
  panDetails: string;
  PF: string;
  UAN: string;
  ESI: string;
  checkUpload: any;
  isDeleted?: boolean;
}

interface Transfer {
  id: number;
  districtId: number;
  district_Text: string;
  sectorId: number;
  sector_Text: string;
  officeLocationId: number;
  officeLocation_Text: string;
  Latitude: any;
  Longitude: any;
  date: string | null;
  attendance: any;
  isDeleted?: boolean;
}

interface IdentityProof {
  id: number;
  idPrfTypid: number;
  idPrfType_Text: string;
  idNo: string;
  validDate: string | null;
  phne: string;
  attachFile: any;
  isDeleted?: boolean;
}

interface WeeklyOff {
  id: number;
  weekOffId: number;
  weekOff_Text: string;
  isDeleted?: boolean;
}

interface Nominee {
  id: number;
  nomineeForId: number;
  nomineeFor: string;
  familyId: number;
  shareAccumulation: number;
  guardianName: string;
  nomineedob: string | null;
  nomineeAge: number;
  isDeleted?: boolean;
}

interface Organisation {
  empHeadId: number;
  orgId: number;
  org_Text: string;
  departmentId: number;
  department_Text: string;
  designationId: number;
  designation_Text: string;
  officeMobileNo: number;
  officeEmailId: any;
  effectiveDate: any;
  isDeleted?: boolean;
}

interface Reporting {
  id: number;
  typeId: number,
  type_Text: string,
  managerId: number,
  manager_Text: string,
  isDeleted?: boolean;
}

@Component({
  selector: 'app-onboarding',
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
    Dialog,
    TableModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
    FileUploadModule,
    TabsModule,
    OnlyNumberDirective,
    OnlyStringDirective,
    CheckboxModule,
    BreadcrumbModule,
    AccordionModule,
    ProgressSpinnerModule,
    RadioButtonModule
  ],
  providers: [
    ConfirmationService,
    MessageService,
    DatePipe,
    ExcelService
  ],
  templateUrl: './onboarding.html',
  styleUrl: './onboarding.scss'
})
export class Onboarding {
  @ViewChild('fileUpload') fileUpload: any;
  @ViewChild('excelFileUpload') excelFileUpload: FileUpload | undefined;
  breadcrumbItems!: ({ label: any; disabled?: undefined; } | { label: any; disabled: boolean; })[];
  apiBaseUrl: string = "https://elocker.nobilitasinfotech.com/";
  param: any;
  FormValue: any;
  FormName: any;
  formlable: any;
  menulabel: any;
  isLoading = true;
  visible: boolean = false;
  postType: string = '';
  header: any = '';
  selectedIndex: any = [];
  headerIcon: string = 'pi pi-plus';
  paramvaluedata: string = '';
  isFormLoading: boolean = false;
  data: any[] = [];
  showProfileImageUploadDialog = false;
  selectedProfileImageFile: File | null = null;
  uploadedProfileImageUrl: string = '';
  profileImagePreviewUrl: string = '';
  isUploadingProfileImage = false;
  employeeForm: FormGroup;
  addressForm: FormGroup;
  familyForm: FormGroup;
  performanceForm: FormGroup;
  qualificationForm: FormGroup;
  prevExpForm: FormGroup;
  bankForm: FormGroup;
  transferForm: FormGroup;
  idProofForm: FormGroup;
  weekOffForm: FormGroup;
  orgForm: FormGroup;
  idNomineeForm: FormGroup;
  reportingsForm: FormGroup;
  masterUpdateForm: FormGroup
  dailtAttendanceForm: FormGroup
  showGuardianField: boolean = false;
  designationDataDrp: any = []
  bloodGroupDataDrp = []
  organizationDataDrp: any = []
  empCategoryDataDrp: any = [];
  genderDataDrp: any = [];
  reportingToDataDrp: any = [];
  departmentDataDrp: any = [];
  employeeTypeDataDrp: any = [];
  profileDataDrp: any = [];
  SBUDataDrp: any = [];
  resourceTypeDataDrp: any = [];
  punchTypeDataDrp: any = [];
  maritalStatusDataDrp: any = [];
  managerTypeDataDrp: any = [];
  gradeDataDrp: any = [];
  religionDrp: any = [];
  nomineeDataDrp: any = [];
  currentDate = new Date();
  selectedItemEdit = null;
  stateDataDrp: any = [];
  cityDataDrp: any = [];
  selectedIfsc: any | null = null;
  ifscCode: string = '';
  ifscDataDrpAll: any = [];
  selectedTable = ''
  performanceChildData: any = [];
  weeklyoffChildData: any = [];
  relationshipDataDrp: any = [];
  qualificationDataDrp: any = [];
  branchDataDrp: any = [];
  bankDataDrp: any = [];
  ifscDataDrp: any = [];
  idProofDataDrp: any = [];
  prevCompanyDataDrp: any = [];
  prevDesignationDataDrp: any = [];
  employeeTypeId: any;
  taskDataDrp: any = [];
  weekOffDataDrp: any = [];
  drpOptionsE: any = [];
  sectorDataDrp: any = [];
  officeLocationDataDrp: any = []
  districtDataDrp: any = []
  isDisable: boolean = false;

  prevExperienceChildData: any = [];
  addressChildData: any = [];
  familyChildData: any = [];
  qualificationChildData: any = [];
  bankChildData: any = [];
  identityProofChildData: any = [];
  nomineeChildData: any = [];
  transferChildData: any = [];
  reportingsChildData: any = [];

  selectedPrevExpEdit: PrevExperience | null = null;
  selectedFamilyEdit: Family | null = null;
  selectedPerformanceEdit: Performance | null = null;
  selectedQualificationEdit: Qualification | null = null;
  selectedBankEdit: Bank | null = null;
  selectedIdProofEdit: IdentityProof | null = null;
  selectedWeeklyOffEdit: WeeklyOff | null = null;
  selectedNomineeEdit: Nominee | null = null;
  selectedTransferEdit: Transfer | null = null;
  selectedOrgEdit: Organisation | null = null;
  selectedReportingEdit: Reporting | null = null;

  activeUpload: any = null;
  selectedFile: File | null = null;
  filePreviewUrl: string = '';
  isUploading: boolean = false;
  dialogVisible: boolean = false;
  uploads: any[] = [];
  sameAsPermanent = false;
  permCityDataDrp: any = [];
  currCityDataDrp: any = [];
  organizationChildData: any = [];
  selectedPermanentEdit: any = null;
  selectedCurrentEdit: any = null;
  hrStatus: any;
  headId: any;
  candidateDetailsArray: any = [];
  personalMobileNo: any;
  requestDataDrp: any;
  candidateDataDrp: any;
  selectionType: string = 'Direct';
  isDistrictLoading = false;
  isSectorLoading = false;
  isOfficeLocationLoading = false;
  selectedItem: any = null;
  isOrgFormEditMode: boolean = false;

  updateMasterModel: boolean = false;
  selectedAction: any = null;
  textSearch = ''
  masterTableData: any = [];
  modelHeading: string = ''
  selectedMasterEditItem: any = null;
  selectedMasterUpdateTable: any = '';
  callbacks: Array<() => void> = [];
  upateView: boolean = false;
  displayedColumns: string[] = ['sno', 'text', 'action'];
  searchValue: string = '';

  pageNo = 1;
  pageSize = 5;
  searchText = '';
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  totalCount = 0;
  rowId: any;
  employeeDetailsArray: any = [];
  selectedForm: any = '';
  selectedFormControl: any = '';
  selectedFolderName: any = ''
  dataSource: any = [];
  isSelectionTypeDisabled: boolean = false;
  importDrawer: boolean = false;
  excelDialogVisible = false;
  activeExcelUpload: any = null;
  selectedExcelFile: File | null = null;

  itemDialog: boolean = false;
  detailSections: { title: string, data: any[], keys: string[] }[] = [];
  recordViewData: any[] = [];
  recordHeaderViewData: any = [];
  nomineeRecordViewData: any[] = [];
  nomineeRecordHeaderViewData: string[] = [];
  nomineeDialog: boolean = false;

  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true, },
    { key: 'empId', header: 'Employee Id', isVisible: true, isSortable: false },
    { key: 'employeeName', header: 'Employee Name', isVisible: true, isSortable: false },
    { key: 'fhName', header: 'Father/Husband', isVisible: true, isSortable: false },
    { key: 'aadhar', header: 'Aadhar', isVisible: true, isSortable: false },
    { key: 'bloodGroup', header: 'Blood Group', isVisible: true, isSortable: false },
    { key: 'orgMaster', header: 'Organisation Name', isVisible: true, isSortable: false },
    { key: 'department', header: 'Department', isVisible: true, isSortable: false },
    { key: 'designation', header: 'Designation', isVisible: true, isSortable: false },
    { key: 'empCategory', header: 'Employee Category', isVisible: true, isSortable: false },
    { key: 'reportingTo', header: 'Reporting To', isVisible: true, isSortable: false },
    { key: 'gender', header: 'Gender', isVisible: true, isSortable: false },
    { key: 'officeEmailId', header: 'Office Email', isVisible: true, isSortable: false },
    { key: 'personalEmail', header: 'Personal Email', isVisible: true, isSortable: false },
    { key: 'phone', header: 'Phone', isVisible: true, isSortable: false },
    { key: 'officeMobileNo', header: 'Office Mobile No', isVisible: true, isSortable: false },
    { key: 'personalMobileNo', header: 'Personal Mobile No', isVisible: true, isSortable: false },
    { key: 'dob', header: 'DOB', isVisible: true, isSortable: false },
    { key: 'doj', header: 'DOJ', isVisible: true, isSortable: false },
    { key: 'realDob', header: 'Real DOB', isVisible: true, isSortable: false },
    { key: 'empType', header: 'Employee Type', isVisible: true, isSortable: false },
    { key: 'profile', header: 'Profile', isVisible: true, isSortable: false },
    { key: 'sbu', header: 'SBU', isVisible: true, isSortable: false },
    { key: 'empResType', header: 'Resource Type', isVisible: true, isSortable: false },
    { key: 'punchType', header: 'Punch Type', isVisible: true, isSortable: false },
    { key: 'fileNo', header: 'File No', isVisible: true, isSortable: false },
    { key: 'prevExp', header: 'Previouse Experience', isVisible: true, isSortable: false },
    { key: 'maritalStatus', header: 'Marital Status', isVisible: true, isSortable: false },
    { key: 'grade', header: 'Grade', isVisible: true, isSortable: false },
    { key: 'religion', header: 'Religion', isVisible: true, isSortable: false },
    { key: 'esicbranch', header: 'Esic Branch Office', isVisible: true, isSortable: false },
    { key: 'dispensary', header: 'Dispensary', isVisible: true, isSortable: false },
    { key: 'jsonDetails', header: 'Address Details', isVisible: true, isSortable: false, isCustom: true },
    { key: 'jsonDetails1', header: 'Family Details', isVisible: true, isSortable: false, isCustom: true },
    { key: 'jsonDetails2', header: 'Performance Details', isVisible: true, isSortable: false, isCustom: true },
    { key: 'jsonDetails3', header: 'Qualification Details', isVisible: true, isSortable: false, isCustom: true },
    { key: 'jsonDetails4', header: 'Prev Exp Details', isVisible: true, isSortable: false, isCustom: true },
    { key: 'jsonDetails5', header: 'Bank Details', isVisible: true, isSortable: false, isCustom: true },
    { key: 'jsonDetails6', header: 'Transfer Details', isVisible: true, isSortable: false, isCustom: true },
    { key: 'jsonDetails7', header: 'Identity Proof Details', isVisible: true, isSortable: false, isCustom: true },
    { key: 'jsonDetails8', header: 'Weekly Off Details', isVisible: true, isSortable: false, isCustom: true },
    { key: 'jsonDetails9', header: 'Reporting Details', isVisible: true, isSortable: false, isCustom: true },
  ];
 

  constructor(private fb: FormBuilder,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private message: MessageService,
    public Customvalidation: Customvalidation,
    private cdr: ChangeDetectorRef,
    private configService: ConfigService,
    private datePipe: DatePipe,
    private excelService: ExcelService,) {

    this.employeeForm = fb.group({
      requestNoIdControl: [{ value: '', disabled: true }],
      candidateNameControl: [{ value: '', disabled: true }],
      empIdControl: ['', [Validators.required]],
      employeeNameControl: ['', [Validators.required, noInvalidPipelineName(), Validators.minLength(3), Validators.maxLength(35)]],
      fhNameControl: ['', [Validators.required, noInvalidPipelineName(), Validators.minLength(3), Validators.maxLength(35)]],
      aadharControl: ['', [Validators.required, Validators.minLength(12)]],
      bloodGroupIdControl: [''],
      genderIdControl: ['', [Validators.required]],
      orgMasterIdControl: ['', [Validators.required]],
      departmentIdControl: ['', [Validators.required]],
      designationIdControl: ['', [Validators.required]],
      employeeCategoryIdControl: ['', [Validators.required]],
      reportingToIdControl: ['', [Validators.required]],
      officeEmailIdControl: ['', Validators.pattern('^[A-Za-z0-9._%-]+@[A-Za-z0-9._%-]+\\.[a-z]{2,3}$')],
      personalEmailControl: ['', Validators.pattern('^[A-Za-z0-9._%-]+@[A-Za-z0-9._%-]+\\.[a-z]{2,3}$')],
      phoneControl: ['', [Validators.pattern('^[0-9]{12}$')]],
      officeMobileNoControl: ['', [Validators.pattern('^((\\+91-?)|0)?[6-9]{1}[0-9]{9}$')]],
      personalMobileNoControl: ['', [Validators.required, Validators.pattern('^((\\+91-?)|0)?[6-9]{1}[0-9]{9}$')]],
      dobControl: ['', Validators.required],
      fileNoControl: [''],
      prevExpControl: [''],
      esicBranch: [''],
      dispensaryId: [''],
      religionId: ['', [Validators.required]],
      dojControl: ['', [Validators.required]],
      empTypeIdControl: ['', [Validators.required]],
      profileIdControl: ['', [Validators.required]],
      sbuMstIdControl: ['', [Validators.required]],
      empResTypeIdControl: ['', [Validators.required]],
      punchTypeIdControl: ['', [Validators.required]],
      maritalStatusIdControl: ['', [Validators.required]],
      gradeIdControl: ['', [Validators.required]],
      realDob: [''],
      profileImageUploadControl: ['', [Validators.required]],
      signatureImageUploadControl: ['', [Validators.required]],
    })

    this.prevExpForm = fb.group({
      prevCompanyIdControl: ['', [Validators.required]],
      designationIdControl: ['', [Validators.required]],
      reportingMngControl: [''],
      reprtMngPhoneControl: [''],
      reprtMngEmailControl: ['', Validators.pattern('^[A-Za-z0-9._%-]+@[A-Za-z0-9._%-]+\\.[a-z]{2,3}$')],
      prevDateFromControl: ['', [Validators.required]],
      prevDateToControl: ['', [Validators.required]],
    })

    this.addressForm = this.fb.group({
      // Permanent
      perm_stateIdControl: ['', Validators.required],
      perm_districtIdControl: ['', Validators.required],
      perm_pincodeControl: ['', [Validators.required, Validators.pattern('^[1-9][0-9]{5}$')]],
      perm_addressControl: ['', Validators.required],
      PerAddressProof: [''],

      // Current
      stateIdControl: ['', Validators.required],
      districtIdControl: ['', Validators.required],
      pincodeControl: ['', [Validators.required, Validators.pattern('^[1-9][0-9]{5}$')]],
      addressControl: ['', Validators.required],
      currAddressProof: ['']
    });

    this.familyForm = fb.group({
      nameControl: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(35), Validators.pattern('[a-zA-Z ]+$')]],
      ageControl: [{ value: '', disabled: true }],
      relationShipIdControl: ['', [Validators.required]],
      familyPhoneControl: [''],
      familyDob: ['', [Validators.required]],
      familyaddress: [''],
      AddressProof: [''],
      idProof: ['']
    })

    this.performanceForm = fb.group({
      taskIdControl: ['', [Validators.required]],
      scoreControl: [''],
      statusControl: [''],
      uploadControl: [''],
    })

    this.qualificationForm = fb.group({
      empQualifnIdControl: ['', [Validators.required]],
      qualfBrnchIdControl: ['', [Validators.required]],
      universityControl: ['', [Validators.required]],
      dateFromControl: ['', [Validators.required]],
      dateToControl: ['', [Validators.required]],
      degreeDocControl: [''],
      twelveDocControl: [''],
      tenthDocControl: [''],
    })

    this.bankForm = fb.group({
      bankNameIdControl: ['', [Validators.required]],
      branchIdControl: ['', [Validators.required]],
      accountControl: ['', [Validators.required, Validators.minLength(9), Validators.maxLength(18)]],
      reAccountControl: ['', [Validators.required]],
      panDetailsControl: ['', [Validators.pattern('^[A-Z]{5}[0-9]{4}[A-Z]{1}$')]],
      pfControl: [''],
      uANControl: [''],
      eSIControl: [''],
      checkUploadControl: ['']
    },

      { validators: this.matchAccountNumbers }
    )

    this.transferForm = fb.group({
      districtIdControl: ['', [Validators.required]],
      sectorIdControl: ['', [Validators.required]],
      officeLocationIdControl: [''],
      LatitudeControl: [''],
      LongitudeControl: [''],
      transferDateControl: ['', [Validators.required]],
      attendanceControl: ['']
    })

    this.idProofForm = fb.group({
      idPrfTypidControl: ['', [Validators.required]],
      idNoControl: ['', [Validators.required]],
      validDateControl: [''],
      phneControl: ['', [Validators.pattern('^[0-9]{10}$')]],
      attachFileControl: ['', [Validators.required]],
    })

    this.weekOffForm = fb.group({
      weekOffIdControl: ['', [Validators.required]],
    })

    this.reportingsForm = fb.group({
      managerTypeIdControl: ['', [Validators.required]],
      managerIdControl: ['', [Validators.required]],
    })

    this.orgForm = fb.group({
      orgMasterIdControl: ['', [Validators.required]],
      departmentIdControl: ['', [Validators.required]],
      designationIdControl: ['', [Validators.required]],
      officeEmailIdControl: ['', [Validators.pattern('^[A-Za-z0-9._%-]+@[A-Za-z0-9._%-]+\\.[a-z]{2,3}$')]],
      officeMobileNoControl: ['', [Validators.pattern('^((\\+91-?)|0)?[6-9]{1}[0-9]{9}$')]],
      effectiveDateControl: ['', [Validators.required]],
    })

    this.dailtAttendanceForm = fb.group({
      excelDrpId: ['', [Validators.required]],
      documents: ['', [Validators.required]],
    })

    this.masterUpdateForm = fb.group({
      masterInput: ['', [Validators.required, noInvalidPipelineName()]],
    })


    this.idNomineeForm = fb.group({
      idnomineeControl: ['', [Validators.required]],
      familyNameControl: ['', [Validators.required]],
      dobNominee: [{ value: '', disabled: true }],
      autoCalculateAge: [{ value: '', disabled: true }],
      guardianNameControl: ['', [Validators.pattern('^[a-zA-Z ]*$')]],
      accumulationControl: ['', [Validators.required, Validators.min(1), Validators.max(100), Validators.maxLength(3)]]
    })

    this.idNomineeForm.get('accumulationControl')?.valueChanges.subscribe(value => {
      if (value !== null && value !== '') {
        let cleaned = value.toString().replace(/\D/g, '');
        cleaned = cleaned.replace(/^0+/, '');
        if (cleaned.length > 3) {
          cleaned = cleaned.slice(0, 3);
        }
        const numeric = parseInt(cleaned || '0', 10);
        if (numeric > 100) {
          cleaned = '100';
        }
        if (cleaned !== value) {
          this.idNomineeForm.get('accumulationControl')?.patchValue(cleaned, { emitEvent: false });
        }
      }
    });

    this.familyForm.get('familyDob')?.valueChanges.subscribe(dob => {
      if (dob) {
        const age = this.calculateAge(dob);
        this.familyForm.get('ageControl')?.setValue(age);
      }
    });

    this.idNomineeForm.get('familyNameControl')?.valueChanges.subscribe((selectedName: string) => {
      const selectedFamily = this.familyChildData.find((member: any) => member.name === selectedName);

      if (selectedFamily) {
        const dobDate = new Date(selectedFamily.dob);
        const age = this.calculateAge(dobDate);
        this.idNomineeForm.get('dobNominee')?.setValue(selectedFamily.dob);
        this.idNomineeForm.get('autoCalculateAge')?.setValue(age);
        this.showGuardianField = age < 18;
        const guardianControl = this.idNomineeForm.get('guardianNameControl');

        if (age < 18) {
          guardianControl?.setValidators([Validators.required]);
        }
        else {
          guardianControl?.clearValidators();
          guardianControl?.setValue('');
        }

        guardianControl?.updateValueAndValidity();
      }
      else {
        this.showGuardianField = false;
        this.idNomineeForm.patchValue({
          dobNominee: '',
          autoCalculateAge: '',
        });
        const guardianControl = this.idNomineeForm.get('guardianNameControl');
        guardianControl?.clearValidators();
        guardianControl?.setValue('');
        guardianControl?.updateValueAndValidity();
      }
    });

    this.uploads = [
      { label: 'Profile Image', form: this.employeeForm, controlName: 'profileImageUploadControl', accept: 'image/*,.pdf', uploadFolder: 'EmpDetails', uploadedFileUrl: '' },
      { label: 'Signature Image', form: this.employeeForm, controlName: 'signatureImageUploadControl', accept: 'image/*,.pdf', uploadFolder: 'EmpDetails', uploadedFileUrl: '' },
      { label: 'Current Address Proof', form: this.addressForm, controlName: 'currAddressProof', accept: 'image/*,.pdf', uploadFolder: 'EmpAddressDetail', uploadedFileUrl: '' },
      { label: 'Permanent Address Proof', form: this.addressForm, controlName: 'PerAddressProof', accept: 'image/*,.pdf', uploadFolder: 'EmpAddressDetail', uploadedFileUrl: '' },
      { label: 'Cancel Cheque Upload', form: this.bankForm, controlName: 'checkUploadControl', accept: 'image/*,.pdf', uploadFolder: 'EmpBankDetails', uploadedFileUrl: '' },
      { label: 'Attachment', form: this.performanceForm, controlName: 'uploadControl', accept: 'image/*,.pdf', uploadFolder: 'EmpPerformanceDetail', uploadedFileUrl: '' },
      { label: 'ID Proof', form: this.idProofForm, controlName: 'attachFileControl', accept: 'image/*,.pdf', uploadFolder: 'EmpIdProofDetails', uploadedFileUrl: '' },
      { label: 'Address Proof', form: this.familyForm, controlName: 'AddressProof', accept: 'image/*,.pdf', uploadFolder: 'EmpFamilyDetail', uploadedFileUrl: '' },
      { label: 'ID Proof', form: this.familyForm, controlName: 'idProof', accept: 'image/*,.pdf', uploadFolder: 'EmpFamilyDetail', uploadedFileUrl: '' },
      { label: 'Highest Degree', form: this.qualificationForm, controlName: 'degreeDocControl', accept: 'image/*,.pdf', uploadFolder: 'EmpQualificationDetails', uploadedFileUrl: '' },
      { label: '12th Document', form: this.qualificationForm, controlName: 'twelveDocControl', accept: 'image/*,.pdf', uploadFolder: 'EmpQualificationDetails', uploadedFileUrl: '' },
      { label: '10th Document', form: this.qualificationForm, controlName: 'tenthDocControl', accept: 'image/*,.pdf', uploadFolder: 'EmpQualificationDetails', uploadedFileUrl: '' },
      { label: 'Attachment', form: this.dailtAttendanceForm, controlName: 'documents', accept: '.xls,.xlsx', uploadFolder: 'Excle', uploadedFileUrl: '' }
    ]
  }

  onSelectionTypeChange() {
    this.handleSelectionTypeChange(this.selectionType);
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 100);
  }

  handleSelectionTypeChange(value: string) {
    const reqCtrl = this.employeeForm.get('requestNoIdControl');
    const candCtrl = this.employeeForm.get('candidateNameControl');

    if (value === 'By Request') {
      reqCtrl?.enable();
      candCtrl?.enable();
      reqCtrl?.setValidators([Validators.required]);
      candCtrl?.setValidators([Validators.required]);
    } else {
      // Reset everything when switching to Direct
      this.resetEmployeeForm();
    }

    reqCtrl?.updateValueAndValidity();
    candCtrl?.updateValueAndValidity();

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 100);
  }

  removeCurrentAddressIfSameAsPermanent() {
    const perm = this.addressForm.value;
    // Find and remove current address that matches permanent one
    this.addressChildData = this.addressChildData.filter((item: any) =>
      !(item.isPermanent === false &&
        item.stateId === perm.perm_stateIdControl &&
        item.districtId === perm.perm_districtIdControl &&
        item.pincode === perm.perm_pincodeControl &&
        item.Address === perm.perm_addressControl)
    );
  }

  onSameAsPermanentChange(event: CheckboxChangeEvent) {
    const checked = event.checked;
    this.sameAsPermanent = checked;


    if (checked) {
      const perm = this.addressForm.value;

      this.addressForm.patchValue({
        stateIdControl: perm.perm_stateIdControl,
        pincodeControl: perm.perm_pincodeControl,
        addressControl: perm.perm_addressControl,
        districtIdControl: '' // clear before dropdown loads
      });

      // Disable current address fields
      this.addressForm.get('stateIdControl')?.disable();
      this.addressForm.get('districtIdControl')?.disable();
      this.addressForm.get('pincodeControl')?.disable();
      this.addressForm.get('addressControl')?.disable();
      // Load city dropdown for selected state
      this.getCityDrp('current', perm.perm_districtIdControl);
    }
    else {
      // Re-enable fields
      this.addressForm.get('stateIdControl')?.enable();
      this.addressForm.get('districtIdControl')?.enable();
      this.addressForm.get('pincodeControl')?.enable();
      this.addressForm.get('addressControl')?.enable();

      this.addressForm.patchValue({
        stateIdControl: '',
        districtIdControl: '',
        pincodeControl: '',
        addressControl: ''
      });
      this.currCityDataDrp = [];
    }

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 200);
  }

  allowOnlyLetters(event: KeyboardEvent) {
    const inputChar = String.fromCharCode(event.keyCode);
    if (!/^[a-zA-Z ]$/.test(inputChar)) {
      event.preventDefault();
    }
  }

  calculateAge(dob: Date): number {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  matchAccountNumbers(group: AbstractControl): ValidationErrors | null {
    const account = group.get('accountControl');
    const reAccount = group.get('reAccountControl');
    if (!account || !reAccount) return null;
    if (reAccount.errors && !reAccount.errors['notMatching']) {
      return null;
    }

    if (account.value !== reAccount.value) {
      reAccount.setErrors({ notMatching: true });
    } else {
      reAccount.setErrors(null);
    }
    return null;
  }

  get f() {
    return this.employeeForm.controls;
  }

  get f1() {
    return this.addressForm.controls;
  }

  get f2() {
    return this.familyForm.controls;
  }

  get f3() {
    return this.performanceForm.controls;
  }

  get f4() {
    return this.qualificationForm.controls;
  }

  get f5() {
    return this.prevExpForm.controls;
  }

  get f6() {
    return this.bankForm.controls;
  }

  get f7() {
    return this.transferForm.controls;
  }

  get f8() {
    return this.idProofForm.controls;
  }

  get f9() {
    return this.weekOffForm.controls;
  }

  get f10() {
    return this.orgForm.controls;
  }
  get f11() {
    return this.dailtAttendanceForm.controls;
  }
  get f12() {
    return this.reportingsForm.controls;
  }

  get fM() {
    return this.masterUpdateForm.controls;
  }

  get fN() {
    return this.idNomineeForm.controls;
  }


  ngOnInit(): void {
    this.param = sessionStorage.getItem('menuItem');
    let paramjs = JSON.parse(this.param);
    this.menulabel = paramjs.menu;
    this.FormName = paramjs.formName;
    this.FormValue = paramjs.formValue;
    this.getTableData(true);
    this.getHeaderTableDrp();
    this.getprevCompanyDrp();
    this.getStateDrp();
    this.getRelationshipDrp();
    this.getTaskDrp();
    this.getQualificationDrp();
    this.getDistrictDrp();
    this.getBankDrp();
    this.getIdProofDrp();
    this.getWeekOffDrp();
    this.loadExcelType();
    this.getRequestIdDrp();
    this.employeeForm.get('orgMasterIdControl')?.enable();
    this.employeeForm.get('designationIdControl')?.enable();
    this.employeeForm.get('departmentIdControl')?.enable();
    this.breadcrumbItems = [
      { label: this.menulabel },
      { label: this.FormName, disabled: true }
    ];
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);

  }

  showDialog(view: any, data: any) {
    this.selectedIndex = data;
    this.visible = true;
    this.postType = view;
    this.header = view === 'add' ? 'Add' : view === 'update' ? 'Update' : 'View';
    this.headerIcon = view === 'add' ? 'pi pi-plus' : view === 'update' ? 'pi pi-pencil' : 'pi pi-eye';
    this.ifscCode = ''
    this.selectedIfsc = null
    this.selectedItem = null
    this.organizationChildData = []
    this.selectedItem = data

    if (view == 'view') {
      this.employeeForm.disable();
      this.selectionType = data.selectionType || 'Direct';
      this.isSelectionTypeDisabled = true;
      this.employeeForm.get('requestNoIdControl')?.setValue('');
      this.employeeForm.get('candidateNameControl')?.setValue('');
      this.employeeForm.get('requestNoIdControl')?.disable();
      this.employeeForm.get('candidateNameControl')?.disable();
      this.employeeForm.get('reportingToIdControl')?.disable();
      if (this.profileImageUpload) {
        this.profileImageUpload.uploadedFileUrl = data.profileImage ? this.getFullImageUrl(data.profileImage) : '';
      }
      if (this.signatureImageUpload) {
        this.signatureImageUpload.uploadedFileUrl = data.signatureImage ? this.getFullImageUrl(data.signatureImage) : '';
      }
    }
    else if (view == 'update') {
      this.employeeForm.enable();
      this.selectionType = data.selectionType || 'Direct';
      this.isSelectionTypeDisabled = true;
      this.employeeForm.get('requestNoIdControl')?.setValue('');
      this.employeeForm.get('candidateNameControl')?.setValue('');
      this.employeeForm.get('requestNoIdControl')?.disable();
      this.employeeForm.get('candidateNameControl')?.disable();
      this.employeeForm.get('empIdControl')?.disable();
      this.employeeForm.get('orgMasterIdControl')?.disable();
      this.employeeForm.get('designationIdControl')?.disable();
      this.employeeForm.get('departmentIdControl')?.disable();
      this.employeeForm.get('officeEmailIdControl')?.disable();
      this.employeeForm.get('officeMobileNoControl')?.disable();
      this.employeeForm.get('reportingToIdControl')?.disable();
      this.employeeTypeId = data.empTypeId;
      if (this.profileImageUpload) {
        this.profileImageUpload.uploadedFileUrl = data.profileImage ? this.getFullImageUrl(data.profileImage) : '';
      }
      if (this.signatureImageUpload) {
        this.signatureImageUpload.uploadedFileUrl = data.signatureImage ? this.getFullImageUrl(data.signatureImage) : '';
      }
    }
    else {
      this.employeeForm.enable();
      this.selectionType = 'Direct';
      this.isSelectionTypeDisabled = false;
      this.employeeForm.get('candidateNameControl')?.setValue('');
      this.employeeForm.get('requestNoIdControl')?.disable();
      this.employeeForm.get('candidateNameControl')?.disable();
      if (this.profileImageUpload) {
        this.profileImageUpload.uploadedFileUrl = '';
      }
      if (this.signatureImageUpload) {
        this.signatureImageUpload.uploadedFileUrl = '';
      }
      this.employeeForm.get('reportingToIdControl')?.valueChanges.subscribe((selectedManagerId) => {
        if (this.postType === 'view') return;
        if (selectedManagerId) {
          this.addOrUpdateFunctionalReporting(selectedManagerId);
        } else {
          this.removeFunctionalReporting();
        }
      });
    }
    this.employeeForm.patchValue({
      empIdControl: data.empId,
      employeeNameControl: data.employeeName ? data.employeeName : '',
      fhNameControl: data.fhName ? data.fhName : '',
      aadharControl: data.aadhar ? data.aadhar : '',
      designationIdControl: data.designationId ? data.designationId : '',
      bloodGroupIdControl: data.bloodGroupId ? data.bloodGroupId : '',
      orgMasterIdControl: data.orgMasterId ? data.orgMasterId : '',
      employeeCategoryIdControl: data.employeeCategoryId ? data.employeeCategoryId : '',
      reportingToIdControl: data.reportingToId ? data.reportingToId : '',
      genderIdControl: data.genderId ? data.genderId : '',
      officeEmailIdControl: data.officeEmailId ? data.officeEmailId : '',
      personalEmailControl: data.personalEmail ? data.personalEmail : '',
      phoneControl: data.phone ? data.phone : '',
      officeMobileNoControl: data.officeMobileNo ? data.officeMobileNo : '',
      personalMobileNoControl: data.personalMobileNo ? data.personalMobileNo : '',
      dobControl: data.dob ? new Date(data.dob) : null,
      dojControl: data.doj ? new Date(data.doj) : null,
      empTypeIdControl: data.empTypeId ? data.empTypeId : '',
      departmentIdControl: data.departmentId ? data.departmentId : '',
      profileIdControl: data.profileId ? data.profileId : '',
      sbuMstIdControl: data.sbuMstId ? data.sbuMstId : '',
      empResTypeIdControl: data.empResTypeId ? data.empResTypeId : '',
      punchTypeIdControl: data.punchTypeId ? data.punchTypeId : '',
      fileNoControl: data.fileNo ? data.fileNo : '',
      prevExpControl: data.prevExp ? data.prevExp : '',
      esicBranch: data.esicbranch ? data.esicbranch : '',
      dispensaryId: data.dispensary ? data.dispensary : '',
      religionId: data.religionId ? data.religionId : '',
      maritalStatusIdControl: data.maritalStatusId ? data.maritalStatusId : '',
      gradeIdControl: data.gradeId ? data.gradeId : '',
      realDob: data.realDob ? data.realDob : '',
      profileImageUploadControl: data.profileImage ? data.profileImage : '',
      signatureImageUploadControl: data.signatureImage ? data.signatureImage : ''
    })
    this.addressChildData = JSON.parse(data.addressDetails)
    this.familyChildData = JSON.parse(data.familyDetails)

    this.nomineeChildData = [];

    this.nomineeChildData = this.familyChildData.flatMap((familyMember: any) => {
      if (Array.isArray(familyMember.nomineeDetails)) {
        return familyMember.nomineeDetails.map((nominee: any) => {
          const { nomineeDetails, ...cleanedNominee } = nominee;
          return cleanedNominee;
        });
      }
      return [];
    });


    this.familyChildData = this.familyChildData.map((member: any) => {
      const { nomineeDetails, ...rest } = member;
      return rest;
    });


    this.performanceChildData = data.performanceDetails ? JSON.parse(data.performanceDetails) : [];
    this.qualificationChildData = data.qualificationDetails ? JSON.parse(data.qualificationDetails) : [];
    this.prevExperienceChildData = data.prevExpDetails ? JSON.parse(data.prevExpDetails) : [];
    this.bankChildData = data.bankDetails ? JSON.parse(data.bankDetails) : [];
    this.transferChildData = data.transferDetails ? JSON.parse(data.transferDetails) : [];
    this.identityProofChildData = data.identityProofDetails ? JSON.parse(data.identityProofDetails) : [];
    this.weeklyoffChildData = data.weeklyOffDetails ? JSON.parse(data.weeklyOffDetails) : [];
    this.reportingsChildData = data.reportingDetails ? JSON.parse(data.reportingDetails) : [];

    let obj: Organisation = {
      empHeadId: data.empMasterId,
      orgId: data.orgMasterId,
      org_Text: data.orgMaster,
      departmentId: data.departmentId,
      department_Text: data.department,
      designationId: data.designationId,
      designation_Text: data.designation,
      officeEmailId: data.officeEmailId,
      officeMobileNo: data.officeMobileNo,
      effectiveDate: data.effectiveDate,
    }
    this.organizationChildData.push(obj)

    this.getRequestIdDrp();

    setTimeout(() => {
      this.employeeForm.get('requestNoIdControl')?.setValue(data.sourceId || '');
      this.getSelectedCandidate(data.sourceId);
      setTimeout(() => {
        this.employeeForm.get('candidateNameControl')?.setValue(data.candidateId || '');
        if (this.postType === 'view' || this.postType === 'update') {
          this.employeeForm.get('candidateNameControl')?.disable();
        }
        this.cdr.detectChanges();
      }, 500);
    }, 500);
  
    document.body.style.overflow = 'hidden';
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
      const query = `userID=${userId}|searchText=${this.searchText}|pageIndex=${this.pageNo}|size=${this.pageSize}|appUserRole=${roleId}|districtId=${sessionStorage.getItem('District')}`;
      this.userService.getQuestionPaper(`uspGetOnboardEmployeesDataAdvSearch|${query}`).subscribe({
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

  onItemAction(id: any, type: any) {
    let action = type == 'Delete' ? 'Delete' : type;
    this.selectedAction = type
    this.openConfirmation('Confirm?', "Are you sure you want to " + action + "?", id, '2')
  }

  actionSubmit(id: any) {
    try {
      this.isFormLoading = true;
      let query = `action=${this.selectedAction}|employeeId=${id}|appUserId=${sessionStorage.getItem('userId')}`;
      this.userService.SubmitPostTypeData(`UspPostOnboardingActionStatus`, query, this.FormName).subscribe({
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
                detail: `Data ${this.selectedAction} successfully.`,
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


  onDrawerHide() {
    document.body.style.overflow = 'visible';
    this.clearData();
    this.visible = false;
  }

  resetData() {
    this.clearData();
  }


  onPageChange(newPage: number) {
    this.pageNo = newPage;
    this.getTableData(true);
  }

  onPageSizeChange(newSize: number) {
    this.pageSize = newSize;
    this.pageNo = 1;
    this.getTableData(true);
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

  onChangeEmployeeType() {
    this.employeeTypeId = this.employeeForm.get('empTypeIdControl')?.value;
    if (this.selectionType === 'Direct' && this.employeeTypeId === '10000') {
      this.bankChildData = this.bankChildData.filter((e: any) => e.panDetails !== '');
    }
  }


  getRequestIdDrp() {
    try {
      this.userService.getQuestionPaper('uspGetOnboardmaster|action=INDENT|id=0').subscribe({
        next: (res: any) => {
          try {
            this.requestDataDrp = res['table'];
          } catch (innerErr) {
            console.error('Error while processing response:', innerErr);
          }
        },
        error: (err) => {
          console.error('Error fetching data:', err);
        },
        complete: () => {
          this.cdr.detectChanges();
        }
      });
    } catch (err) {
      console.error('Unexpected error', err);
    }

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 1000);
  }

  getSelectedCandidate(candidateId?: any) {
    try {
      const selectedRequestId = candidateId || this.employeeForm.get('requestNoIdControl')?.value;

      if (!selectedRequestId) {
        this.candidateDataDrp = [];
        this.employeeForm.get('candidateNameControl')?.setValue('');
        this.employeeForm.get('candidateNameControl')?.disable();

        setTimeout(() => this.cdr.detectChanges(), 50);
        return;
      }

      this.employeeForm.get('candidateNameControl')?.enable();

      this.userService
        .getQuestionPaper(`uspGetOnboardmaster|action=CANDIDATE|id=${selectedRequestId}`)
        .subscribe(
          (res: any) => {
            try {
              this.candidateDataDrp = res?.table || [];
              this.employeeForm.get('candidateNameControl')?.setValue('');
              setTimeout(() => this.cdr.detectChanges(), 50);
            } catch (innerErr) {
              console.error('Error processing candidate data:', innerErr);
            }
          },
          (error) => {
            console.error('Error fetching candidates:', error);
            try {
              this.candidateDataDrp = [];
              this.employeeForm.get('candidateNameControl')?.setValue('');
              setTimeout(() => this.cdr.detectChanges(), 50);
            } catch (innerErr) {
              console.error('Error resetting candidate data after failure:', innerErr);
            }
          }
        );
    } catch (outerErr) {
      console.error('Unexpected error in getSelectedCandidate:', outerErr);
    }
  }

  getCandidateDetail() {
    try {
      const selectedcandidateId = this.employeeForm.get('candidateNameControl')?.value;

      if (!selectedcandidateId) {
        this.candidateDataDrp = [];
        this.employeeForm.patchValue({
          employeeNameControl: '',
          fhNameControl: '',
          aadharControl: '',
          personalEmailControl: '',
          personalMobileNoControl: '',
          emergencyMobileNoControl: '',
          prevExpControl: '',
          dobControl: '',
          empUploadControl: ''
        });
        this.employeeForm.get('bloodGroupIdControl')?.setValue('');
        this.employeeForm.get('genderIdControl')?.setValue('');
        this.employeeForm.get('religionId')?.setValue('');
        this.employeeForm.get('maritalStatusIdControl')?.setValue('');

        setTimeout(() => this.cdr.detectChanges(), 50);
        return;
      }

      this.userService
        .getQuestionPaper(`uspGetPreOnboardCanddate|id=${selectedcandidateId}`)
        .subscribe(
          (res: any) => {
            try {
              const data = res?.table?.[0] ?? {};

              // Parse child data safely
              const safeParse = (json: string) => {
                try {
                  return json ? JSON.parse(json) : [];
                } catch {
                  return [];
                }
              };

              this.addressChildData = safeParse(data.addressDetails);
              this.familyChildData = safeParse(data.familyDetails);
              this.prevExperienceChildData = safeParse(data.prevExpDetails);
              this.qualificationChildData = safeParse(data.qualificationDetails);
              this.bankChildData = safeParse(data.bankDetails);
              this.identityProofChildData = safeParse(data.identityProofDetails);

              this.employeeForm.patchValue({
                employeeNameControl: data.employeeName ?? '',
                fhNameControl: data.fhName ?? '',
                aadharControl: data.aadhar ?? '',
                personalEmailControl: data.personalEmail ?? '',
                personalMobileNoControl: data.personalMobileNo ?? '',
                emergencyMobileNoControl: data.emergencyMobile ?? '',
                prevExpControl: data.prevExp ?? '',
                dobControl: data.dob ? new Date(data.dob) : null,
                profileImageUploadControl: data.profileImage ? data.profileImage : '',
              });


              if (this.profileImageUpload) {
                this.profileImageUpload.uploadedFileUrl = data.profileImage ? this.getFullImageUrl(data.profileImage) : '';
              }

              const safeSet = (controlName: string, value: any) => {
                const v = (value === null || value === undefined) ? '' : value;
                this.employeeForm.get(controlName)?.setValue(v);
                this.employeeForm.get(controlName)?.updateValueAndValidity();
              };

              safeSet('bloodGroupIdControl', data.bloodGroupId ?? '');
              safeSet('genderIdControl', data.genderId ?? '');
              safeSet('religionId', data.religionId ?? '');
              safeSet('maritalStatusIdControl', data.maritalStatusId ?? '');

              this.nomineeChildData = [];
              this.nomineeChildData = this.familyChildData.flatMap((familyMember: any) => {
                if (Array.isArray(familyMember.nomineeDetails)) {
                  return familyMember.nomineeDetails.map((nominee: any) => {
                    const { nomineeDetails, ...cleanedNominee } = nominee;
                    return cleanedNominee;
                  });
                }
                return [];
              });

              this.familyChildData = this.familyChildData.map((member: any) => {
                const { nomineeDetails, ...rest } = member;
                return rest;
              });

              setTimeout(() => this.cdr.detectChanges(), 60);
            } catch (innerErr) {
              console.error('Error processing candidate details:', innerErr);
            }
          },
          (err: HttpErrorResponse) => {
            if (err.status === 403) {
              this.Customvalidation.loginroute(err.status);
            } else {
              console.error('getCandidateDetail error:', err);
            }
          }
        );
    } catch (outerErr) {
      console.error('Unexpected error in getCandidateDetail:', outerErr);
    }
  }


  resetEmployeeForm() {
    this.employeeForm.reset({
      empIdControl: '',
      employeeNameControl: '',
      fhNameControl: '',
      aadharControl: '',
      designationIdControl: '',
      bloodGroupIdControl: '',
      orgMasterIdControl: '',
      employeeCategoryIdControl: '',
      reportingToIdControl: '',
      genderIdControl: '',
      officeEmailIdControl: '',
      personalEmailControl: '',
      phoneControl: '',
      officeMobileNoControl: '',
      personalMobileNoControl: '',
      dobControl: '',
      dojControl: '',
      empTypeIdControl: '',
      departmentIdControl: '',
      profileIdControl: '',
      sbuMstIdControl: '',
      empResTypeIdControl: '',
      punchTypeIdControl: '',
      fileNoControl: '',
      prevExpControl: '',
      esicBranch: '',
      dispensaryId: '',
      religionId: '',
      maritalStatusIdControl: '',
      gradeIdControl: '',
      realDob: ''
    });

    this.resetUploads(["profileImageUploadControl"]);
    this.resetUploads(["signatureImageUploadControl"]);

    setTimeout(() => this.cdr.detectChanges(), 100);

    this.employeeForm.get('requestNoIdControl')?.setValue('');
    this.employeeForm.get('candidateNameControl')?.setValue('');
    this.employeeForm.get('requestNoIdControl')?.disable();
    this.employeeForm.get('candidateNameControl')?.disable();

    this.candidateDataDrp = [];
    this.addressChildData = []
    this.familyChildData = []
    this.performanceChildData = []
    this.qualificationChildData = []
    this.prevExperienceChildData = []
    this.bankChildData = []
    this.transferChildData = []
    this.identityProofChildData = []
    this.weeklyoffChildData = []
    this.organizationChildData = []
    this.nomineeChildData = []
    this.addressForm.reset()
    this.familyForm.reset()
    this.idNomineeForm.reset()
    this.performanceForm.reset()
    this.qualificationForm.reset()
    this.prevExpForm.reset()
    this.bankForm.reset()
    this.transferForm.reset()
    this.idProofForm.reset()
    this.weekOffForm.reset()
    this.orgForm.reset()
    this.addressForm.patchValue({
      stateId: '',
      districtIdControl: ''
    });
    this.familyForm.patchValue({
      relationShipIdControl: '',
    });
    this.performanceForm.patchValue({
      taskIdControl: '',
    });
    this.qualificationForm.patchValue({
      empQualifnIdControl: '',
      qualfBrnchIdControl: ''
    });
    this.prevExpForm.patchValue({
      prevCompanyIdControl: '',
      designationIdControl: ''
    });
    this.bankForm.patchValue({
      bankNameIdControl: '',
    });
    this.transferForm.patchValue({
      districtIdControl: '',
      sectorIdControl: '',
      officeLocationIdControl: ''
    });
    this.idProofForm.patchValue({
      idPrfTypidControl: '',
    });
    this.weekOffForm.patchValue({
      weekOffIdControl: '',
    });
    this.reportingsForm.patchValue({
      managerTypeIdControl: '',
      managerIdControl: ''
    });
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 100)
  }

  getHeaderTableDrp() {
    try {
      this.userService.getQuestionPaper(`uspGetEmployeeAttributesMasters|appUserId=${sessionStorage.getItem('userId')}`).subscribe({
        next: (res: any) => {
          try {
            this.designationDataDrp = res['table']
            this.bloodGroupDataDrp = res['table1']
            this.organizationDataDrp = res['table2']
            this.empCategoryDataDrp = res['table3']
            this.reportingToDataDrp = res['table4']
            this.genderDataDrp = res['table5']
            this.departmentDataDrp = res['table6']
            this.employeeTypeDataDrp = res['table7']
            this.profileDataDrp = res['table8']
            this.SBUDataDrp = res['table9']
            this.resourceTypeDataDrp = res['table10']
            this.punchTypeDataDrp = res['table11']
            this.maritalStatusDataDrp = res['table12']
            this.gradeDataDrp = res['table13']
            this.religionDrp = res['table22']
            this.nomineeDataDrp = res['table23']
            this.managerTypeDataDrp = res['table25']
          } catch (innerErr) {
            console.error('Error while processing response:', innerErr);
          }
        },
        error: (err) => {
          console.error('Error fetching data:', err);
        },
        complete: () => {
          this.cdr.detectChanges();
        }
      });
    } catch (err) {
      console.error('Unexpected error in getHeaderTableDrp:', err);
    }

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 1000);
  }

  getprevCompanyDrp() {
    try {
      this.userService.getQuestionPaper('uspGetPrevExpDetailDropdownData').subscribe({
        next: (res: any) => {
          try {
            this.prevCompanyDataDrp = res['table1']
            this.prevDesignationDataDrp = res['table2']
          } catch (innerErr) {
            console.error('Error while processing response:', innerErr);
          }
        },
        error: (err) => {
          console.error('Error fetching data:', err);
        },
        complete: () => {
          this.cdr.detectChanges();
        }
      });
    } catch (err) {
      console.error('Unexpected error in getHeaderTableDrp:', err);
    }

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 1000);
  }

  getStateDrp() {
    try {
      this.userService.getQuestionPaper(`uspGetStateCityDrp|action=STATE|id=0`).subscribe({
        next: (res: any) => {
          try {
            this.stateDataDrp = res['table'];
          } catch (innerErr) {
            console.error('Error while processing response:', innerErr);
          }
        },
        error: (err) => {
          console.error('Error fetching data:', err);
        },
        complete: () => {
          this.cdr.detectChanges();
        }
      });
    } catch (err) {
      console.error('Unexpected error', err);
    }

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 1000);

  }


  getRelationshipDrp() {
    try {
      this.userService.getQuestionPaper('uspGetFamilyDetailsDropdownData').subscribe({
        next: (res: any) => {
          try {
            this.relationshipDataDrp = res['table1']
          } catch (innerErr) {
            console.error('Error while processing response:', innerErr);
          }
        },
        error: (err) => {
          console.error('Error fetching data:', err);
        },
        complete: () => {
          this.cdr.detectChanges();
        }
      });
    } catch (err) {
      console.error('Unexpected error', err);
    }

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 1000);
  }

  getTaskDrp() {
    try {
      this.userService.getQuestionPaper('uspGetPerformanceDetailDropdownData').subscribe({
        next: (res: any) => {
          try {
            this.taskDataDrp = res['table1']
          } catch (innerErr) {
            console.error('Error while processing response:', innerErr);
          }
        },
        error: (err) => {
          console.error('Error fetching data:', err);
        },
        complete: () => {
          this.cdr.detectChanges();
        }
      });
    } catch (err) {
      console.error('Unexpected error', err);
    }

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 1000);
  }

  getQualificationDrp() {
    try {
      this.userService.getQuestionPaper('uspGetQualificationDetailDropdownData').subscribe({
        next: (res: any) => {
          try {
            this.qualificationDataDrp = res['table1']
            this.branchDataDrp = res['table2']
          } catch (innerErr) {
            console.error('Error while processing response:', innerErr);
          }
        },
        error: (err) => {
          console.error('Error fetching data:', err);
        },
        complete: () => {
          this.cdr.detectChanges();
        }
      });
    } catch (err) {
      console.error('Unexpected error', err);
    }

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 1000);
  }

  getDistrictDrp() {
    this.isDistrictLoading = true;
    try {
      this.userService.getQuestionPaper(`uspGetTransferDetailDropdownData`).subscribe({
        next: (res: any) => {
          try {
            this.districtDataDrp = res['table1'] || [];
          } catch (innerErr) {
            console.error('Error while processing district response:', innerErr);
          }
        },
        error: (err) => {
          console.error('Error fetching district data:', err);
          this.isDistrictLoading = false;
        },
        complete: () => {
          this.isDistrictLoading = false;
          this.cdr.detectChanges();
        },
      });
    } catch (err) {
      console.error('Unexpected error in getDistrictDrp:', err);
      this.isDistrictLoading = false;
    }

    setTimeout(() => {
      this.isDistrictLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  getSectorDrp(sectorId?: any) {
    this.isSectorLoading = true;
    try {
      const districtId = this.transferForm.get('districtIdControl')?.value;
      this.userService
        .getQuestionPaper(`uspGetTransferDetailDropdownData|districtId=${districtId}`)
        .subscribe({
          next: (res: any) => {
            try {
              this.transferForm.patchValue({
                sectorIdControl: sectorId || '',
              });

              if (!sectorId) this.officeLocationDataDrp = [];
              this.sectorDataDrp = res['table2'] || [];
            } catch (innerErr) {
              console.error('Error while processing sector response:', innerErr);
            }
          },
          error: (err) => {
            console.error('Error fetching sector data:', err);
            this.isSectorLoading = false;
          },
          complete: () => {
            this.isSectorLoading = false;
            this.cdr.detectChanges();
          },
        });
    } catch (err) {
      console.error('Unexpected error in getSectorDrp:', err);
      this.isSectorLoading = false;
    }

    setTimeout(() => {
      this.isSectorLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  getOfficeLocationDrp(officeLocationId?: any) {
    this.isOfficeLocationLoading = true;
    try {
      const districtId = this.transferForm.get('districtIdControl')?.value;
      const sectorId = this.transferForm.get('sectorIdControl')?.value;

      this.userService
        .getQuestionPaper(`uspGetTransferDetailDropdownData|districtId=${districtId}|sectorId=${sectorId}`)
        .subscribe({
          next: (res: any) => {
            try {
              this.transferForm.patchValue({
                officeLocationIdControl: officeLocationId || '',
              });

              this.officeLocationDataDrp = res['table3'] || [];
            } catch (innerErr) {
              console.error('Error while processing office location response:', innerErr);
            }
          },
          error: (err) => {
            console.error('Error fetching office location data:', err);
            this.isOfficeLocationLoading = false;
          },
          complete: () => {
            this.isOfficeLocationLoading = false;
            this.cdr.detectChanges();
          },
        });
    } catch (err) {
      console.error('Unexpected error in getOfficeLocationDrp:', err);
      this.isOfficeLocationLoading = false;
    }

    setTimeout(() => {
      this.isOfficeLocationLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }


  getWeekOffDrp() {
    try {
      this.userService.getQuestionPaper('uspGetWeekOffDropdownData').subscribe({
        next: (res: any) => {
          try {
            this.weekOffDataDrp = res['table1']
          } catch (innerErr) {
            console.error('Error while processing response:', innerErr);
          }
        },
        error: (err) => {
          console.error('Error fetching data:', err);
        },
        complete: () => {
          this.cdr.detectChanges();
        }
      });
    } catch (err) {
      console.error('Unexpected error', err);
    }

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 1000);
  }

  loadExcelType() {
    this.isLoading = true;
    const roleId = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
    try {
      this.userService.getQuestionPaperOne('uspGetExcelType|appUserId=' + this.FormName + '|appUserRole=' + roleId).subscribe({
        next: (res: any) => {
          try {
            this.drpOptionsE = res['table'];
          } catch (innerErr) {
            console.error('Error while processing response:', innerErr);
          }
        },
        error: (err: any) => {
          console.error('Error fetching data:', err);
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    } catch (err) {
      console.error('Unexpected error', err);
      this.isLoading = false;
    }

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  get profileImageUpload() {
    return this.uploads.find(u => u.form === this.employeeForm && u.controlName === 'profileImageUploadControl');
  }

  get signatureImageUpload() {
    return this.uploads.find(u => u.form === this.employeeForm && u.controlName === 'signatureImageUploadControl');
  }

  get permanentAddressProofUpload() {
    return this.uploads.find(u => u.form === this.addressForm && u.controlName === 'PerAddressProof');
  }

  get currentAddressProofUpload() {
    return this.uploads.find(u => u.form === this.addressForm && u.controlName === 'currAddressProof');
  }

  get performanceUpload() {
    return this.uploads.find(u => u.form === this.performanceForm && u.controlName === 'uploadControl');
  }

  get familyAddressProofUpload() {
    return this.uploads.find(u => u.form === this.familyForm && u.controlName === 'AddressProof');
  }

  get familyIdProofUpload() {
    return this.uploads.find(u => u.form === this.familyForm && u.controlName === 'idProof');
  }

  get qualificationDegreeUpload() {
    return this.uploads.find(u => u.form === this.qualificationForm && u.controlName === 'degreeDocControl');
  }

  get qualificationTwelveUpload() {
    return this.uploads.find(u => u.form === this.qualificationForm && u.controlName === 'twelveDocControl');
  }

  get qualificationTenthUpload() {
    return this.uploads.find(u => u.form === this.qualificationForm && u.controlName === 'tenthDocControl');
  }

  get chequeUpload() {
    return this.uploads.find(u => u.form === this.bankForm && u.controlName === 'checkUploadControl');
  }

  get idProofUpload() {
    return this.uploads.find(u => u.form === this.idProofForm && u.controlName === 'attachFileControl');
  }

  openDialog(upload: any) {
    if (!upload) return;
    this.activeUpload = upload;
    this.dialogVisible = true;
  }

  closeDialog() {
    this.dialogVisible = false;
    this.clearSelection();
    this.activeUpload = null;
  }

  onFileSelect(event: any) {
    if (event.files && event.files.length > 0) {
      const file = event.files[0];
      if (this.activeUpload?.accept && !file.type.match(this.activeUpload.accept.split(',').join('|'))) {
        this.message.add({
          severity: 'warn',
          summary: 'Warning',
          detail: 'Invalid file type!',
          life: 3000
        });
        return;
      }
      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = (e: any) => this.filePreviewUrl = e.target.result;
      reader.readAsDataURL(file);
      this.cdr.detectChanges();
    }
  }

  clearSelection() {
    this.selectedFile = null;
    this.filePreviewUrl = '';
    if (this.fileUpload) this.fileUpload.clear();
    this.cdr.detectChanges();
  }

  uploadFile() {
    if (!this.selectedFile || !this.activeUpload) return;

    try {
      this.isUploading = true;

      if (!this.activeUpload || !this.activeUpload.form || !this.activeUpload.controlName) {
        console.error("Active upload item is not properly set:", this.activeUpload);
        this.isUploading = false;
        return;
      }

      let empId = this.employeeForm.get('empIdControl')?.value || '';
      let finalFolderName = this.activeUpload.uploadFolder;

      if (empId) {
        if (this.activeUpload.form === this.employeeForm) {
          finalFolderName = `${this.FormName}/${empId}`;
        } else {
          finalFolderName = `${this.FormName}/${empId}/${this.activeUpload.uploadFolder}`;
        }
      }

      let selectedOrgId = this.employeeForm.get('orgMasterIdControl')?.value;

      let selectedOrg = this.organizationDataDrp?.find(
        (org: any) =>
          org.drpValue == selectedOrgId ||
          org.id == selectedOrgId ||
          org.value == selectedOrgId
      );

      let orgCode = selectedOrg?.orgCode || '';

      this.isUploading = true;
      const filesArray: File[] = [this.selectedFile];

      this.userService.MastrtfileuploadMasters(filesArray, finalFolderName, orgCode).subscribe({
        next: (datacom: any) => {
          this.isUploading = false;
          if (datacom && datacom.startsWith('1-')) {
            const relativePath = datacom.split('-')[1];
            this.activeUpload.uploadedFileUrl = this.normalizeImagePath(relativePath);

            this.activeUpload.form.patchValue({ [this.activeUpload.controlName]: relativePath });
            this.clearSelection();
            this.message.add({ severity: 'success', summary: 'Success', detail: 'File uploaded successfully!', life: 3000 });
            this.closeDialog();
          } else {
            this.message.add({ severity: 'warn', summary: 'Warning', detail: datacom, life: 3000 });
          }
          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => {
          this.isUploading = false;
          console.error('Upload error:', err);
          this.message.add({ severity: 'error', summary: 'Error', detail: err.message, life: 3000 });
          this.cdr.detectChanges();
        }
      });
      
    }
    catch (error) {
      this.isUploading = false;
      console.log('Error occurred while uploading file', error);
    }
  }

  removeFile(upload: any) {
    upload.uploadedFileUrl = '';
    upload.form.patchValue({ [upload.controlName]: '' });
    this.message.add({ severity: 'info', summary: 'Removed', detail: 'File removed successfully.', life: 2000 });
  }

  normalizeImagePath(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    let normalizedPath = path.replace(/\\/g, '/');
    normalizedPath = normalizedPath.replace(/([^:]\/)\/+/g, '$1');
    return this.configService.baseUrl + normalizedPath;
  }

  isImageFile(url: string): boolean {
    return url ? /\.(jpg|jpeg|png)$/i.test(url) : false;
  }

  getFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  filedownloadview(url: string) {
    if (url) {
      window.open('https://elocker.nobilitasinfotech.com/' + url, '_blank');
    }
    else {
      this.message.add({ severity: 'warn', summary: 'Warning', detail: 'File not Exist', life: 3000 });
    }
  }

  onChangeTabs(tabValue?: any) {
    this.clearChildform();
    if (tabValue === 'divcalling_NomineeDetails' && this.familyChildData.length === 0) {
      this.message.add({ severity: 'warn', summary: 'Warning', detail: 'Family details must be entered first.', life: 3000 });
    }
  }

  clearChildform() {
    this.selectedPrevExpEdit = null;
    this.selectedPermanentEdit = null;
    this.selectedCurrentEdit = null;
    this.selectedFamilyEdit = null;
    this.selectedQualificationEdit = null;
    this.selectedBankEdit = null;
    this.selectedIdProofEdit = null;
    this.selectedNomineeEdit = null;
    this.addressForm.reset()
    this.familyForm.reset()
    this.idNomineeForm.reset()
    this.qualificationForm.reset()
    this.prevExpForm.reset()
    this.bankForm.reset()
    this.idProofForm.reset()
    this.addressForm.reset({
      stateId: '',
      districtIdControl: ''
    });
    this.familyForm.reset({
      relationShipIdControl: '',
    });
    this.qualificationForm.reset({
      empQualifnIdControl: '',
      qualfBrnchIdControl: ''
    });
    this.prevExpForm.patchValue({
      prevCompanyIdControl: '',
      designationIdControl: ''
    });
    this.bankForm.reset({
      bankNameIdControl: '',
    });
    this.idProofForm.reset({
      idPrfTypidControl: '',
    });
    this.resetUploads(['PerAddressProof', 'currAddressProof']);
    this.resetUploads(["AddressProof", "idProof"]);
    this.resetUploads(["uploadControl"]);
    this.resetUploads(['degreeDocControl', 'twelveDocControl', 'tenthDocControl']);
    this.resetUploads(["checkUploadControl"]);
    this.resetUploads(["attachFileControl"]);
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 100)
  }

  AddRow1() {
    const formValues = this.addressForm.value;

    const createAddressObj = (isPermanent: boolean) => {
      const prefix = isPermanent ? 'perm_' : '';
      const stateVal = isPermanent ? formValues.perm_stateIdControl : formValues.stateIdControl;
      const districtVal = isPermanent ? formValues.perm_districtIdControl : formValues.districtIdControl;
      const pincodeVal = isPermanent ? formValues.perm_pincodeControl : formValues.pincodeControl;
      const addressVal = isPermanent ? formValues.perm_addressControl : formValues.addressControl;
      const proofVal = isPermanent ? formValues.PerAddressProof : formValues.currAddressProof;
      const selectedEdit = isPermanent ? this.selectedPermanentEdit : this.selectedCurrentEdit;
      const cityList = isPermanent ? this.permCityDataDrp : this.currCityDataDrp;

      return {
        stateId: stateVal,
        state_Text: this.stateDataDrp.find((x: any) => x.drpValue === stateVal)?.drpOption ?? '',
        districtId: districtVal,
        district_Text: cityList.find((x: any) => x.drpValue === districtVal)?.drpOption ?? '',
        pincode: pincodeVal,
        Address: addressVal,
        isPermanent,
        id: selectedEdit ? selectedEdit.id : 0,
        addressProof: proofVal,
      };
    };

    // Check if fields are filled
    const isFilled = (isPermanent: boolean) => {
      const stateVal = isPermanent ? formValues.perm_stateIdControl : formValues.stateIdControl;
      const districtVal = isPermanent ? formValues.perm_districtIdControl : formValues.districtIdControl;
      const pincodeVal = isPermanent ? formValues.perm_pincodeControl : formValues.pincodeControl;
      const addressVal = isPermanent ? formValues.perm_addressControl : formValues.addressControl;

      return stateVal && districtVal && districtVal !== '' && pincodeVal && String(pincodeVal).length === 6 && addressVal && addressVal.trim().length > 0;
    };

    const permanentAddressFilled = isFilled(true);
    const currentAddressFilled = isFilled(false);

    this.addressForm.markAllAsTouched();
    if (this.addressForm.invalid) return;

    this.addressChildData = this.addressChildData.filter((x: any) => !(x.id !== 0 && (x.id === (this.selectedPermanentEdit?.id ?? -1) || x.id === (this.selectedCurrentEdit?.id ?? -1))));

    if (this.sameAsPermanent) {
      if (!permanentAddressFilled) {
        this.message.add({ severity: 'warn', summary: 'Warning', detail: 'Please fill all required fields', life: 3000 });
        return;
      }
      // Add permanent and copy to current
      const permObj = createAddressObj(true);
      const currObj = { ...createAddressObj(true), isPermanent: false, addressProof: formValues.currAddressProof, id: this.selectedCurrentEdit ? this.selectedCurrentEdit.id : 0 };
      this.addressChildData.push(permObj, currObj);
    } else {
      if (permanentAddressFilled) this.addressChildData.push(createAddressObj(true));
      if (currentAddressFilled) this.addressChildData.push(createAddressObj(false));
    }

    console.log('Final address data ->', this.addressChildData);

    this.addressForm.reset();
    this.resetUploads(['PerAddressProof', 'currAddressProof']);
    this.sameAsPermanent = false;
    this.selectedPermanentEdit = null;
    this.selectedCurrentEdit = null;

    this.addressForm.get('stateIdControl')?.enable();
    this.addressForm.get('districtIdControl')?.enable();
    this.addressForm.get('pincodeControl')?.enable();
    this.addressForm.get('addressControl')?.enable();
    this.currCityDataDrp = [];

    setTimeout(() => this.cdr.detectChanges(), 200);
  }


  get isPermanentAddressIncomplete(): boolean {
    const form = this.addressForm?.value;
    return !(
      form?.perm_stateIdControl &&
      form?.perm_districtIdControl &&
      form?.perm_pincodeControl &&
      form?.perm_addressControl
    );
  }

  editRow1(section: string, item: any) {
    const uploadMapping: { [controlName: string]: { uploadObj: any, itemKey: string } } = {

      PerAddressProof: { uploadObj: this.permanentAddressProofUpload, itemKey: 'addressProof' },
      currAddressProof: { uploadObj: this.currentAddressProofUpload, itemKey: 'addressProof' },
    };

    if (section === 'AddressDetail') {
      if (item.isPermanent) {
        this.selectedPermanentEdit = item;
        this.addressForm.patchValue({
          perm_stateIdControl: item.stateId,
          perm_pincodeControl: item.pincode,
          perm_addressControl: item.Address,
          PerAddressProof: item.addressProof
        });

        ['PerAddressProof'].forEach(control => {
          const { uploadObj, itemKey } = uploadMapping[control];
          const value = item[itemKey] ?? null;
          this.setUploadFile(uploadObj, value);
          this.addressForm.get(control)?.setValue(value);
        });

        this.getCityDrp('permanent');
        setTimeout(() => {
          this.addressForm.patchValue({
            perm_districtIdControl: item.districtId
          });
          this.cdr.detectChanges();
        }, 200);
      }
      else {
        this.selectedCurrentEdit = item;
        this.addressForm.patchValue({
          stateIdControl: item.stateId,
          pincodeControl: item.pincode,
          addressControl: item.Address,
          currAddressProof: item.addressProof
        });

        ['currAddressProof'].forEach(control => {
          const { uploadObj, itemKey } = uploadMapping[control];
          const value = item[itemKey] ?? null;
          this.setUploadFile(uploadObj, value);
          this.addressForm.get(control)?.setValue(value);
        });

        this.getCityDrp('current');
        setTimeout(() => {
          this.addressForm.patchValue({
            districtIdControl: item.districtId
          });
          this.cdr.detectChanges();
        }, 200);
      }
      this.sameAsPermanent = false;
    }
  }

  AddRow(formName: string, postType: any): void {

    let form: FormGroup | undefined;
    switch (formName) {
      case 'prevExpForm': form = this.prevExpForm; break;
      case 'familyForm': form = this.familyForm; break;
      case 'performanceForm': form = this.performanceForm; break;
      case 'qualificationForm': form = this.qualificationForm; break;
      case 'bankForm': form = this.bankForm; break;
      case 'transferForm': form = this.transferForm; break;
      case 'idProofForm': form = this.idProofForm; break;
      case 'weekOffForm': form = this.weekOffForm; break;
      case 'idNomineeForm': form = this.idNomineeForm; break;
      case 'orgForm': form = this.orgForm; break;
      case 'reportingsForm': form = this.reportingsForm; break;
      default: return;
    }

    if (!form) return;

    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }

    const resetForm = () => { form!.reset(); };

    // ================= PREVIOUS EXPERIENCE =================
    if (formName === 'prevExpForm') {
      const dateFrom = new Date(form.get('prevDateFromControl')?.value);
      const dateTo = new Date(form.get('prevDateToControl')?.value);

      if (dateFrom >= dateTo) {
        this.message.add({ severity: 'warn', summary: 'Warning', detail: 'Date To should be greater than Date From', life: 3000 });
        return;
      }

      const obj: PrevExperience = {
        id: this.selectedPrevExpEdit?.id ?? 0,
        prevCompanyId: form.get('prevCompanyIdControl')?.value,
        prevCompany_Text: this.prevCompanyDataDrp.find((x: any) => x.drpValue === form.get('prevCompanyIdControl')?.value)?.drpOption ?? '',
        designationId: form.get('designationIdControl')?.value,
        designation_Text: this.prevDesignationDataDrp.find((x: any) => x.drpValue === form.get('designationIdControl')?.value)?.drpOption ?? '',
        reportingMng: form.get('reportingMngControl')?.value,
        reprtMngPhone: form.get('reprtMngPhoneControl')?.value,
        reprtMngEmail: form.get('reprtMngEmailControl')?.value,
        dateFrom: this.datePipe.transform(form.get('prevDateFromControl')?.value, 'yyyy-MM-dd'),
        dateTo: this.datePipe.transform(form.get('prevDateToControl')?.value, 'yyyy-MM-dd')
      };

      if (this.selectedPrevExpEdit) {
        obj.id = this.selectedPrevExpEdit.id;
        this.prevExperienceChildData = this.prevExperienceChildData.map((x: any) => x.id === this.selectedPrevExpEdit!.id ? obj : x);
      } else {
        obj.id = 0;
        this.prevExperienceChildData.push(obj);
      }

      this.selectedPrevExpEdit = null;
      resetForm();
      return;
    }

    // ================= FAMILY =================
    if (formName === 'familyForm') {
      const relationId = form.get('relationShipIdControl')?.value;
      const nameVal = form.get('nameControl')?.value;

      const obj: Family = {
        id: this.selectedFamilyEdit?.id ?? 0,
        name: nameVal + (relationId ? ` (${this.relationshipDataDrp.find((x: any) => x.drpValue === relationId)?.drpOption})` : ''),
        age: form.get('ageControl')?.value,
        relationShip_Text: this.relationshipDataDrp.find((x: any) => x.drpValue === form.get('relationShipIdControl')?.value)?.drpOption ?? '',
        relationShipId: form.get('relationShipIdControl')?.value,
        phone: form.get('familyPhoneControl')?.value,
        dob: this.datePipe.transform(form.get('familyDob')?.value, 'yyyy-MM-dd'),
        address: form.get('familyaddress')?.value,
        addressProof: form.get('AddressProof')?.value,
        idProof: form.get('idProof')?.value
      };

      const duplicate = this.familyChildData.some((e: any) => e.name.toLowerCase() === obj.name.toLowerCase() && e.id !== obj.id);
      if (duplicate) {
        this.message.add({ severity: 'warn', summary: 'Warning', detail: 'Name already exists.', life: 3000 });
        return;
      }

      if (this.selectedFamilyEdit) {
        obj.id = this.selectedFamilyEdit.id;
        this.familyChildData = this.familyChildData.map((x: any) => x.id === this.selectedFamilyEdit!.id ? obj : x);
      } else {
        obj.id = 0;
        this.familyChildData.push(obj);
        this.familyChildData = [...this.familyChildData]; // refresh for dropdown binding
        this.cdr.detectChanges();
      }

      this.selectedFamilyEdit = null;
      resetForm();
      this.resetUploads(['AddressProof', 'idProof']);
      return;
    }

    // ================= Performance =================
    if (formName === 'performanceForm') {

      const obj: Performance = {
        id: this.selectedPerformanceEdit?.id ?? 0,
        taskId: this.performanceForm.get(`taskIdControl`)?.value,
        task_Text: this.taskDataDrp.find((x: any) => x.drpValue === form.get('taskIdControl')?.value)?.drpOption ?? '',
        score: this.performanceForm.get(`scoreControl`)?.value,
        status: this.performanceForm.get(`statusControl`)?.value,
        upload: this.performanceForm.get(`uploadControl`)?.value,
      };

      if (this.selectedPerformanceEdit) {
        obj.id = this.selectedPerformanceEdit.id;
        this.performanceChildData = this.performanceChildData.map((x: any) => x.id === this.selectedPerformanceEdit!.id ? obj : x);
      } else {
        obj.id = 0;
        this.performanceChildData.push(obj);
        this.performanceChildData = [...this.performanceChildData]; // refresh for dropdown binding
        this.cdr.detectChanges();
      }

      this.selectedPerformanceEdit = null;
      resetForm();
      this.resetUploads(['uploadControl']);
      return;
    }

    // ================= QUALIFICATION =================
    if (formName === 'qualificationForm') {
      const dateFrom = new Date(form.get('dateFromControl')?.value);
      const dateTo = new Date(form.get('dateToControl')?.value);
      if (dateFrom >= dateTo) {
        this.message.add({ severity: 'warn', summary: 'Warning', detail: 'Date To should be greater than Date From', life: 3000 });
        return;
      }

      const empQualifnId = form.get('empQualifnIdControl')?.value;

      const obj: Qualification = {
        id: this.selectedQualificationEdit?.id ?? 0,
        empQualifnId: form.get('empQualifnIdControl')?.value,
        empQualifn_Text: this.qualificationDataDrp.find((x: any) => x.drpValue === form.get('empQualifnIdControl')?.value)?.drpOption ?? '',
        qualfBrnchId: form.get('qualfBrnchIdControl')?.value,
        qualfBrnch_Text: this.branchDataDrp.find((x: any) => x.drpValue === form.get('qualfBrnchIdControl')?.value)?.drpOption ?? '',
        university: form.get('universityControl')?.value,
        dateFrom: this.datePipe.transform(form.get('dateFromControl')?.value, 'yyyy-MM-dd'),
        dateTo: this.datePipe.transform(form.get('dateToControl')?.value, 'yyyy-MM-dd'),
        degreeDoc: form.get('degreeDocControl')?.value,
        twelveDoc: form.get('twelveDocControl')?.value,
        tenthDoc: form.get('tenthDocControl')?.value
      };

      const duplicate = this.qualificationChildData.some((e: any) => e.empQualifnId === empQualifnId && e.id !== obj.id);
      if (duplicate) {
        this.message.add({ severity: 'warn', summary: 'Warning', detail: 'Qualification already exists.', life: 3000 });
        return;
      }

      if (this.selectedQualificationEdit) {
        obj.id = this.selectedQualificationEdit.id;
        this.qualificationChildData = this.qualificationChildData.map((x: any) => x.id === this.selectedQualificationEdit!.id ? obj : x);
      } else {
        obj.id = 0;
        this.qualificationChildData.push(obj);
      }

      this.selectedQualificationEdit = null;
      resetForm();
      this.resetUploads(['degreeDocControl', 'twelveDocControl', 'tenthDocControl']);
      return;
    }

    // ================= BANK =================
    if (formName === 'bankForm') {
      if (this.employeeForm.get(`empTypeIdControl`)?.value == '') {
        this.message.add({ severity: 'warn', summary: 'Warning', detail: 'Please select employee type in the main detail.', life: 3000 });
        return;
      }
      if (!this.selectedIfsc) {
        this.message.add({ severity: 'warn', summary: 'Warning', detail: 'Please enter valid IFSC code.', life: 3000 });
        return;
      }
      if (form.get('accountControl')?.value !== form.get('reAccountControl')?.value) {
        this.message.add({ severity: 'warn', summary: 'Warning', detail: 'Account number does not match.', life: 3000 });
        return;
      }
      if (this.employeeTypeId == '10000' && form.get(`panDetailsControl`)?.value == '') {
        this.message.add({ severity: 'warn', summary: 'Warning', detail: 'PAN Number is required.', life: 3000 });
        return;
      }

      const bankNameId = form.get('bankNameIdControl')?.value;
      const obj: Bank = {
        id: this.selectedBankEdit?.id ?? 0,
        bankNameId,
        bankName_Text: this.bankDataDrp.find((x: any) => x.drpValue === bankNameId)?.drpOption ?? '',
        branchId: form.get('branchIdControl')?.value,
        branch_Text: this.selectedIfsc?.drpOption ?? '',
        account: form.get('accountControl')?.value,
        reAccount: form.get('reAccountControl')?.value,
        panDetails: form.get('panDetailsControl')?.value,
        PF: form.get('pfControl')?.value,
        UAN: form.get('uANControl')?.value,
        ESI: form.get('eSIControl')?.value,
        checkUpload: form.get('checkUploadControl')?.value
      };

      const duplicate = this.bankChildData.some((e: any) => e.bankNameId === bankNameId && e.id !== obj.id);
      if (duplicate) {
        this.message.add({ severity: 'warn', summary: 'Warning', detail: 'Bank already exists.', life: 3000 });
        return;
      }

      if (this.selectedBankEdit) {
        obj.id = this.selectedBankEdit.id;
        this.bankChildData = this.bankChildData.map((x: any) => x.id === this.selectedBankEdit!.id ? obj : x);
      } else {
        obj.id = 0;
        this.bankChildData.push(obj);
      }

      this.selectedBankEdit = null;
      this.selectedIfsc = null;
      this.ifscDataDrp = [];
      this.ifscCode = '';
      resetForm();
      this.resetUploads(['checkUploadControl']);
      return;
    }

    // ================= TRANSFER FORM =================
    if (formName === 'transferForm') {

      const obj: Transfer = {
        id: this.selectedTransferEdit?.id ?? 0,
        districtId: form.get('districtIdControl')?.value,
        district_Text: this.districtDataDrp.find((x: any) => x.drpValue === form.get('districtIdControl')?.value)?.drpOption ?? '',
        sectorId: form.get('sectorIdControl')?.value,
        sector_Text: this.sectorDataDrp.find((x: any) => x.drpValue === form.get('sectorIdControl')?.value)?.drpOption ?? '',
        officeLocationId: form.get('officeLocationIdControl')?.value ?? '0',
        officeLocation_Text: this.officeLocationDataDrp.find((x: any) => x.drpValue === form.get('officeLocationIdControl')?.value)?.drpOption ?? '',
        Latitude: form.get('LatitudeControl')?.value,
        Longitude: form.get('LongitudeControl')?.value,
        date: this.datePipe.transform(form.get('transferDateControl')?.value, 'yyyy-MM-dd'),
        attendance: form.get('attendanceControl')?.value
      };

      if (this.selectedTransferEdit) {
        this.transferChildData = this.transferChildData.map((x: any) =>
          x.id === this.selectedTransferEdit!.id ? obj : x
        );
      } else {
        this.transferChildData.push(obj);
      }

      this.selectedTransferEdit = null;
      this.sectorDataDrp = [];
      this.officeLocationDataDrp = [];

      form.reset();
      return;
    }


    // ================= ID PROOF =================
    if (formName === 'idProofForm') {
      const idPrfTypid = form.get('idPrfTypidControl')?.value;
      const obj: IdentityProof = {
        id: this.selectedIdProofEdit?.id ?? 0,
        idPrfTypid,
        idPrfType_Text: this.idProofDataDrp.find((x: any) => x.drpValue === idPrfTypid)?.drpOption ?? '',
        idNo: form.get('idNoControl')?.value,
        validDate: this.datePipe.transform(form.get('validDateControl')?.value, 'yyyy-MM-dd'),
        phne: form.get('phneControl')?.value,
        attachFile: form.get('attachFileControl')?.value
      };

      const duplicate = this.identityProofChildData.some((e: any) => e.idPrfTypid === idPrfTypid && e.id !== obj.id);
      if (duplicate) {
        this.message.add({ severity: 'warn', summary: 'Warning', detail: 'Id Proof Type already exists.', life: 3000 });
        return;
      }

      if (this.selectedIdProofEdit) {
        obj.id = this.selectedIdProofEdit.id;
        this.identityProofChildData = this.identityProofChildData.map((x: any) => x.id === this.selectedIdProofEdit!.id ? obj : x);
      } else {
        obj.id = 0;
        this.identityProofChildData.push(obj);
      }

      this.selectedIdProofEdit = null;
      resetForm();
      this.resetUploads(['attachFileControl']);
      return;
    }

    // ================= Weekly Off =================
    if (formName === 'weekOffForm') {

      const obj: WeeklyOff = {
        id: this.selectedWeeklyOffEdit?.id ?? 0,
        weekOffId: this.weekOffForm.get(`weekOffIdControl`)?.value,
        weekOff_Text: this.weekOffDataDrp.find((x: any) => x.drpValue === form.get('weekOffIdControl')?.value)?.drpOption ?? '',
      };

      if (this.selectedWeeklyOffEdit) {
        obj.id = this.selectedWeeklyOffEdit.id;
        this.weeklyoffChildData = this.weeklyoffChildData.map((x: any) => x.id === this.selectedWeeklyOffEdit!.id ? obj : x);
      } else {
        obj.id = 0;
        this.weeklyoffChildData.push(obj);
        this.weeklyoffChildData = [...this.weeklyoffChildData]; // refresh for dropdown binding
        this.cdr.detectChanges();
      }

      this.selectedWeeklyOffEdit = null;
      resetForm();
      return;
    }

    // ================= NOMINEE =================
    if (formName === 'idNomineeForm') {
      const id = this.selectedNomineeEdit?.id ?? 0;
      const nomineeForId = form.get('idnomineeControl')?.value;
      const nomineeFor = this.nomineeDataDrp.find((x: any) => x.drpValue === nomineeForId)?.drpOption ?? '';
      const familyId = form.get('familyNameControl')?.value;
      const shareAccumulation = Number(form.get('accumulationControl')?.value);

      const duplicate = this.nomineeChildData.some((x: any) => x.familyId === familyId && x.nomineeFor === nomineeFor && x.id !== id);
      if (duplicate) {
        this.message.add({ severity: 'warn', summary: 'Warning', detail: `Nominee already exists for Family Member ${familyId} For ${nomineeFor}.`, life: 3000 });
        return;
      }

      const totalAccumulation = this.nomineeChildData
        .filter((x: any) => x.nomineeFor === nomineeFor && x.id !== id)
        .reduce((sum: any, x: any) => sum + Number(x.shareAccumulation || 0), 0) + shareAccumulation;

      if (totalAccumulation > 100) {
        this.message.add({ severity: 'warn', summary: 'Warning', detail: `Total share accumulation for '${nomineeFor}' cannot exceed 100%. Currently ${totalAccumulation - shareAccumulation}%.`, life: 3000 });
        return;
      }

      const obj: Nominee = {
        id,
        nomineeForId,
        nomineeFor,
        familyId,
        shareAccumulation,
        guardianName: form.get('guardianNameControl')?.value,
        nomineedob: form.get('dobNominee')?.value,
        nomineeAge: form.get('autoCalculateAge')?.value
      };

      if (this.selectedNomineeEdit) {
        obj.id = this.selectedNomineeEdit.id;
        this.nomineeChildData = this.nomineeChildData.map((x: any) => x.id === this.selectedNomineeEdit!.id ? obj : x);
      } else {
        obj.id = 0;
        this.nomineeChildData.push(obj);
      }

      this.selectedNomineeEdit = null;
      resetForm();
      return;
    }

    // ================= Org/Dept =================

    if (formName == 'orgForm') {
      let obj: Organisation = {
        empHeadId: this.selectedItem.empMasterId,
        orgId: this.orgForm.get(`orgMasterIdControl`)?.value,
        org_Text: this.organizationDataDrp.find((x: any) => x.drpValue === form.get('orgMasterIdControl')?.value)?.drpOption ?? '',
        departmentId: this.orgForm.get(`departmentIdControl`)?.value,
        department_Text: this.departmentDataDrp.find((x: any) => x.drpValue === form.get('departmentIdControl')?.value)?.drpOption ?? '',
        designationId: this.orgForm.get(`designationIdControl`)?.value,
        designation_Text: this.designationDataDrp.find((x: any) => x.drpValue === form.get('designationIdControl')?.value)?.drpOption ?? '',
        officeMobileNo: this.orgForm.get(`officeMobileNoControl`)?.value,
        officeEmailId: this.orgForm.get(`officeEmailIdControl`)?.value,
        effectiveDate: this.datePipe.transform(this.orgForm.get('effectiveDateControl')?.value, 'yyyy-MM-dd'),
      }
      this.organizationChildData = [obj]
      this.isOrgFormEditMode = true;
      resetForm()
    }

    // ================= Reporting =================

    // if (formName === 'reportingsForm') {
    //   const obj: Reporting = {
    //     id: this.selectedReportingEdit?.id ?? 0,
    //     typeId: this.reportingsForm.get('managerTypeIdControl')?.value,
    //     type_Text: this.managerTypeDataDrp.find((x: any) => x.drpValue === this.reportingsForm.get('managerTypeIdControl')?.value)?.drpOption ?? '',
    //     managerId: this.reportingsForm.get('managerIdControl')?.value,
    //     manager_Text: this.reportingToDataDrp.find((x: any) => x.drpValue === this.reportingsForm.get('managerIdControl')?.value)?.drpOption ?? '',
    //   };

    //   if (this.selectedReportingEdit) {
    //     if (this.reportingsForm.get(`managerTypeIdControl`)?.value != this.selectedReportingEdit.typeId) {
    //       if (this.reportingsChildData.some((e: any) => e.typeId == this.reportingsForm.get(`managerTypeIdControl`)?.value)) {
    //         this.message.add({ severity: 'warn', summary: 'Warning', detail: 'Reporting Type already exist.', life: 3000 });
    //         return;
    //       }
    //     }
    //     obj.id = this.selectedReportingEdit.id
    //     this.reportingsChildData = this.reportingsChildData.map((x: any) => (x.id === this.selectedReportingEdit!.id ? obj : x));
    //   }
    //   else {
    //     if (this.reportingsChildData.some((e: any) => e.typeId == this.reportingsForm.get(`managerTypeIdControl`)?.value)) {
    //       this.message.add({ severity: 'warn', summary: 'Warning', detail: 'Reporting Type already exist.', life: 3000 });
    //       return;
    //     }
    //     obj.id = 0
    //     this.reportingsChildData.push(obj)
    //   }

    //   this.selectedReportingEdit = null;
    //   resetForm();
    //   return;
    // }

    // ================= Reporting =================
    if (formName === 'reportingsForm') {
      const obj: Reporting = {
        id: this.selectedReportingEdit?.id ?? 0,
        typeId: this.reportingsForm.get('managerTypeIdControl')?.value,
        type_Text: this.managerTypeDataDrp.find((x: any) => x.drpValue === this.reportingsForm.get('managerTypeIdControl')?.value)?.drpOption ?? '',
        managerId: this.reportingsForm.get('managerIdControl')?.value,
        manager_Text: this.reportingToDataDrp.find((x: any) => x.drpValue === this.reportingsForm.get('managerIdControl')?.value)?.drpOption ?? '',
      };

      // =================== UPDATE CHILD DATA ===================
      if (this.selectedReportingEdit) {
        if (this.reportingsForm.get(`managerTypeIdControl`)?.value != this.selectedReportingEdit.typeId) {
          if (this.reportingsChildData.some((e: any) => e.typeId == this.reportingsForm.get(`managerTypeIdControl`)?.value)) {
            this.message.add({ severity: 'warn', summary: 'Warning', detail: 'Reporting Type already exist.', life: 3000 });
            return;
          }
        }
        obj.id = this.selectedReportingEdit.id;
        this.reportingsChildData = this.reportingsChildData.map((x: any) => (x.id === this.selectedReportingEdit!.id ? obj : x));
      } else {
        if (this.reportingsChildData.some((e: any) => e.typeId == this.reportingsForm.get(`managerTypeIdControl`)?.value)) {
          this.message.add({ severity: 'warn', summary: 'Warning', detail: 'Reporting Type already exist.', life: 3000 });
          return;
        }
        obj.id = 0;
        this.reportingsChildData.push(obj);
      }

      // =================== UPDATE EMPLOYEE FORM ===================
      if (obj.typeId === 10000) {
        this.employeeForm.patchValue({
          reportingToIdControl: obj.managerId
        });
      }

      this.selectedReportingEdit = null;
      resetForm();
      return;
    }


  }

  resetUploads(controlNames: string[]): void {
    controlNames.forEach(name => {
      const upload = this.uploads.find(u => u.controlName === name);
      if (upload) {
        upload.uploadedFileUrl = null;
        upload.file = null;
      }
    });

    this.cdr.detectChanges();
  }


  getCityDrp(type: 'current' | 'permanent', districtId?: any) {
    const stateControl = type === 'current' ? 'stateIdControl' : 'perm_stateIdControl';
    const districtControl = type === 'current' ? 'districtIdControl' : 'perm_districtIdControl';
    const stateId = this.addressForm.get(stateControl)?.value;

    try {
      this.userService.getQuestionPaper(`uspGetStateCityDrp|action=CITY|id=${stateId}`).subscribe({
        next: (res: any) => {
          try {
            if (type === 'current') {
              this.currCityDataDrp = res['table'];
            } else {
              this.permCityDataDrp = res['table'];
            }

            // Patch city if value was passed
            if (districtId) {
              setTimeout(() => {
                this.addressForm.patchValue({
                  [districtControl]: districtId
                });
              });
            }

          } catch (innerErr) {
            console.error('Error while processing response:', innerErr);
          }
        },
        error: (err) => {
          console.error('Error fetching data:', err);
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    } catch (err) {
      console.error('Unexpected error in getHeaderTableDrp:', err);
      this.isLoading = false;
    }

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);

  }


  editRow(tablename: any, item: any) {
    this.postType = 'update';

    const uploadMapping: { [controlName: string]: { uploadObj: any, itemKey: string } } = {
      // Family
      AddressProof: { uploadObj: this.familyAddressProofUpload, itemKey: 'addressProof' },
      Idproof: { uploadObj: this.familyIdProofUpload, itemKey: 'idProof' },

      // Performance
      uploadControl: { uploadObj: this.performanceUpload, itemKey: 'upload' },

      // Qualification
      degreeDocControl: { uploadObj: this.qualificationDegreeUpload, itemKey: 'degreeDoc' },
      twelveDocControl: { uploadObj: this.qualificationTwelveUpload, itemKey: 'twelveDoc' },
      tenthDocControl: { uploadObj: this.qualificationTenthUpload, itemKey: 'tenthDoc' },

      // Bank 
      checkUploadControl: { uploadObj: this.chequeUpload, itemKey: 'checkUpload' },

      // Id Proof
      attachFileControl: { uploadObj: this.idProofUpload, itemKey: 'attachFile' }

    };

    // ================== FAMILY ==================
    if (tablename == 'FamilyDetail') {
      this.selectedFamilyEdit = item;
      this.familyForm.patchValue({
        nameControl: item.name,
        ageControl: item.age,
        relationShipIdControl: item.relationShipId,
        familyPhoneControl: item.phone,
        familyaddress: item.address,
        familyDob: item.dob ? new Date(item.dob) : null,
        AddressProof: item.addressProof,
        Idproof: item.idProof
      });

      ['AddressProof', 'Idproof'].forEach(control => {
        const { uploadObj, itemKey } = uploadMapping[control];
        const value = item[itemKey] ?? null;
        this.setUploadFile(uploadObj, value);
        this.familyForm.get(control)?.setValue(value);
      });
    }

    // ================== PERFORMANCE ==================
    if (tablename == 'PerformanceDetail') {
      this.selectedPerformanceEdit = item;
      this.performanceForm.patchValue({
        taskIdControl: item.taskId,
        scoreControl: item.score,
        statusControl: item.status,
        uploadControl: item.upload,
      });

      ['uploadControl'].forEach(control => {
        const { uploadObj, itemKey } = uploadMapping[control];
        const value = item[itemKey] ?? null;
        this.setUploadFile(uploadObj, value);
        this.performanceForm.get(control)?.setValue(value);
      });
    }

    // ================== QUALIFICATION ==================
    if (tablename == 'QualificationDetails') {
      this.selectedQualificationEdit = item;
      this.qualificationForm.patchValue({
        empQualifnIdControl: item.empQualifnId,
        qualfBrnchIdControl: item.qualfBrnchId,
        universityControl: item.university,
        dateFromControl: item.dateFrom ? new Date(item.dateFrom) : null,
        dateToControl: item.dateTo ? new Date(item.dateTo) : null,
        degreeDocControl: item.degreeDoc,
        twelveDocControl: item.twelveDoc,
        tenthDocControl: item.tenthDoc
      });

      ['degreeDocControl', 'twelveDocControl', 'tenthDocControl'].forEach(control => {
        const { uploadObj, itemKey } = uploadMapping[control];
        const value = item[itemKey] ?? null;
        this.setUploadFile(uploadObj, value);
        this.qualificationForm.get(control)?.setValue(value);
      });
    }

    // ================== PREVIOUS EXPERIENCE ==================
    if (tablename == 'PreviousExperienceDetails') {
      this.selectedPrevExpEdit = item;
      this.prevExpForm.patchValue({
        prevCompanyIdControl: item.prevCompanyId,
        designationIdControl: item.designationId,
        reportingMngControl: item.reportingMng,
        reprtMngPhoneControl: item.reprtMngPhone,
        reprtMngEmailControl: item.reprtMngEmail,
        prevDateFromControl: item.dateFrom ? new Date(item.dateFrom) : null,
        prevDateToControl: item.dateTo ? new Date(item.dateTo) : null
      });
    }

    // ================== BANK ==================
    if (tablename == 'BankDetails') {
      this.selectedBankEdit = item;
      this.bankForm.patchValue({
        bankNameIdControl: item.bankNameId ?? '',
        accountControl: item.account,
        reAccountControl: item.account,
        panDetailsControl: item.panDetails,
        checkUploadControl: item.checkUpload,
        pfControl: item.PF,
        uANControl: item.UAN,
        eSIControl: item.ESI
      });

      ['checkUploadControl'].forEach(control => {
        const { uploadObj, itemKey } = uploadMapping[control];
        const value = item[itemKey] ?? null;
        this.setUploadFile(uploadObj, value);
        this.bankForm.get(control)?.setValue(value);
      });
      this.getIFSCDrp(item);
      this.ifscCode = item.branch_Text;
      this.selectedIfsc = { drpValue: item.branchId, drpOption: item.branch_Text };
    }

    // ================== TRANSFER ==================
    if (tablename == 'TransferDetails') {
      this.selectedTransferEdit = item;
      this.transferForm.patchValue({
        districtIdControl: item.districtId ? item.districtId : '',
        sectorIdControl: item.sectorId ? item.sectorId : '',
        officeLocationIdControl: item.officeLocationId ? item.officeLocationId : '',
        LatitudeControl: item.Latitude,
        LongitudeControl: item.Longitude,
        transferDateControl: item.date,
        attendanceControl: item.attendance,
      });
      this.getSectorDrp(item.sectorId)
      this.getOfficeLocationDrp(item.officeLocationId)
    }

    // ================== IDENTITY PROOF ==================
    if (tablename == 'IdentityProofDetails') {
      this.selectedIdProofEdit = item;
      this.idProofForm.patchValue({
        idPrfTypidControl: item.idPrfTypid,
        idNoControl: item.idNo,
        validDateControl: item.validDate ? new Date(item.validDate) : null,
        phneControl: item.phne,
        attachFileControl: item.attachFile
      });
      ['attachFileControl'].forEach(control => {
        const { uploadObj, itemKey } = uploadMapping[control];
        const value = item[itemKey] ?? null;
        this.setUploadFile(uploadObj, value);
        this.idProofForm.get(control)?.setValue(value);
      });

    }

    // ================== WEEKLY OFF ==================
    if (tablename == 'WeeklyOff') {
      this.selectedWeeklyOffEdit = item;
      this.weekOffForm.patchValue({
        weekOffIdControl: item.weekOffId
      });
    }

    // ================== NOMINEE ==================
    if (tablename == 'nomineeDetails') {
      this.selectedNomineeEdit = item;
      this.idNomineeForm.patchValue({
        idnomineeControl: item.nomineeForId,
        familyNameControl: item.familyId,
        autoCalculateAge: item.nomineeAge,
        dobNominee: item.nomineedob,
        guardianNameControl: item.guardianName,
        accumulationControl: item.shareAccumulation
      });
    }


    //================== ORG/DEPT ==================
    if (tablename == 'OrganizationDetails') {

      this.isOrgFormEditMode = true;

      this.orgForm.patchValue({
        orgMasterIdControl: item.orgId,
        departmentIdControl: item.departmentId,
        designationIdControl: item.designationId,
        officeEmailIdControl: item.officeEmailId,
        officeMobileNoControl: item.officeMobileNo,
        effectiveDateControl: item.effectiveDate ? new Date(item.effectiveDate) : null,
      });
    }

    // ================== REPORTINGS ==================
    if (tablename == 'reportings') {
      this.selectedReportingEdit = item;
      this.reportingsForm.patchValue({
        managerTypeIdControl: item.typeId,
        managerIdControl: item.managerId,
      });
    }

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 200);
    
  }


  setUploadFile(uploadObj: any, value: string | null) {
    if (value) {
      uploadObj.uploadedFileUrl = value.startsWith('http') ? value : this.apiBaseUrl + value;
      uploadObj.file = null;
    } else {
      uploadObj.uploadedFileUrl = null;
      uploadObj.file = null;
    }
  }


  getBankDrp() {
    try {
      this.userService.getQuestionPaper(`uspGetBankDetailDropdownData`).subscribe({
        next: (res: any) => {
          try {
            this.bankDataDrp = res['table1']
          } catch (innerErr) {
            console.error('Error while processing response:', innerErr);
          }
        },
        error: (err) => {
          console.error('Error fetching data:', err);
        },
        complete: () => {
          this.cdr.detectChanges();
        }
      });
    } catch (err) {
      console.error('Unexpected error', err);
    }

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 1000);

  }

  getIFSCDrp(item?: any) {
    let bankName = this.bankForm.get('bankNameIdControl')?.value;
    try {
      this.userService.getQuestionPaper(`uspGetBankDetailDropdownData|bankName=${bankName}`).subscribe({
        next: (res: any) => {
          try {
            if (item) {
              this.bankForm.patchValue({
                branchIdControl: item ? item.branchId : ''
              });
            }
            else {
              this.ifscCode = ''
              this.selectedIfsc = null
              this.bankForm.patchValue({
                branchIdControl: ''
              });
            }
            this.ifscDataDrpAll = res['table2']
          } catch (innerErr) {
            console.error('Error while processing response:', innerErr);
          }
        },
        error: (err) => {
          console.error('Error fetching data:', err);
        },
        complete: () => {
          this.cdr.detectChanges();
        }
      });
    } catch (err) {
      console.error('Unexpected error', err);
    }

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 1000);

  }

  onChangeIfsc(event: any) {
    const search = event.target.value.toUpperCase();
    this.ifscCode = search;

    if (search.length > 6) {
      this.ifscDataDrp = this.ifscDataDrpAll.filter((item: any) =>
        item.drpOption.includes(search)
      );
    } else {
      this.ifscDataDrp = [];
      if (search.length === 0) {
        this.bankForm.get('branchIdControl')?.setValue('');
        this.selectedIfsc = null;
      }
    }
  }

  onSelectIfscCode(item: any) {
    this.selectedIfsc = item
    this.ifscCode = item.drpOption
    this.bankForm.get('branchIdControl')?.setValue(item.drpValue);
    this.ifscDataDrp = []
  }

  getIdProofDrp() {
    try {
      this.userService.getQuestionPaper(`uspGetIDProofDetailDropdownData`).subscribe({
        next: (res: any) => {
          try {
            this.idProofDataDrp = res['table1']
          } catch (innerErr) {
            console.error('Error while processing response:', innerErr);
          }
        },
        error: (err) => {
          console.error('Error fetching data:', err);
        },
        complete: () => {
          this.cdr.detectChanges();
        }
      });
    } catch (err) {
      console.error('Unexpected error', err);
    }

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 1000);

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
          this.actionSubmit(id)
        }
        else if (option == '3' && id) {
          // const { arr, index } = id;
          const { arr, index, isFunctional } = id;
          arr.splice(index, 1);

          const formMap = new Map<any, { form: any; editVar: string }>([
            [this.prevExperienceChildData, { form: this.prevExpForm, editVar: 'selectedPrevExpEdit' }],
            [this.addressChildData, { form: this.addressForm, editVar: 'selectedPermanentEdit' }],
            [this.addressChildData, { form: this.addressForm, editVar: 'selectedCurrentEdit' }],
            [this.familyChildData, { form: this.familyForm, editVar: 'selectedFamilyEdit' }],
            [this.performanceChildData, { form: this.performanceForm, editVar: 'selectedPerformanceEdit' }],
            [this.qualificationChildData, { form: this.qualificationForm, editVar: 'selectedQualificationEdit' }],
            [this.bankChildData, { form: this.bankForm, editVar: 'selectedBankEdit' }],
            [this.transferChildData, { form: this.transferForm, editVar: 'selectedTransferEdit' }],
            [this.identityProofChildData, { form: this.idProofForm, editVar: 'selectedIdentityEdit' }],
            [this.weeklyoffChildData, { form: this.weekOffForm, editVar: 'selectedWeeklyOffEdit' }],
            [this.nomineeChildData, { form: this.idNomineeForm, editVar: 'selectedNomineeEdit' }],
            [this.reportingsChildData, { form: this.reportingsForm, editVar: 'selectedReportingEdit' }]
          ]);

          const target = formMap.get(arr);
          if (target) {
            target.form.reset();
            (this as any)[target.editVar] = null;

            switch (arr) {
              case this.addressChildData:
                this.resetUploads(['PerAddressProof', 'currAddressProof']);
                break;
              case this.familyChildData:
                this.resetUploads(['AddressProof', 'idProof']);
                break;
              case this.performanceChildData:
                this.resetUploads(['uploadControl']);
                break;
              case this.qualificationChildData:
                this.resetUploads(['degreeDocControl', 'twelveDocControl', 'tenthDocControl']);
                break;
              case this.bankChildData:
                this.resetUploads(['checkUploadControl']);
                break;
              case this.identityProofChildData:
                this.resetUploads(['attachFileControl']);
                break;
              default:
                break;
            }
          }

          if (isFunctional && arr === this.reportingsChildData) {
            this.employeeForm.get('reportingToIdControl')?.reset();
          }

          this.message.add({
            severity: 'info',
            summary: 'Deleted',
            detail: 'Data deleted successfully',
            life: 2000
          });
        }
        else if (option === '5') {
          this.employeeForm.reset()
        }
        else if (option == '6') {
          this.confirmDeleteUpdateMasterData(id)
        }
        else if (option == '7') {
          this.submitcallMasterUpdate()
        }
      },
      reject: () => {
        if (option === '4') {
        }
      }
    });
  }

  deleteRow(table: string, index: number) {
    const tableMap: Record<string, any[]> = {
      prevExperienceChildData: this.prevExperienceChildData,
      addressChildData: this.addressChildData,
      familyChildData: this.familyChildData,
      performanceChildData: this.performanceChildData,
      qualificationChildData: this.qualificationChildData,
      bankChildData: this.bankChildData,
      transferChildData: this.transferChildData,
      identityProofChildData: this.identityProofChildData,
      weeklyoffChildData: this.weeklyoffChildData,
      nomineeChildData: this.nomineeChildData,
      organizationChildData: this.organizationChildData,
      reportingsChildData: this.reportingsChildData
    };

    // const arr = tableMap[table];
    // if (!arr || !arr[index]) return;
    // this.openConfirmation('Confirm?', "Are you sure you want to remove?", { arr, index }, '3');

    const arr = tableMap[table];
    if (!arr || !arr[index]) return;

    const deletedItem = arr[index];

    const isFunctional = deletedItem?.type_Text?.toLowerCase() === 'functional' || deletedItem?.typeId === 10000;
    this.openConfirmation('Confirm?', 'Are you sure you want to remove?', { arr, index, isFunctional }, '3');


  }

  onClear(tablename: any) {
    if (tablename == 'AddressDetail') {
      this.addressForm.patchValue({
        perm_stateIdControl: '',
        perm_districtIdControl: '',
        perm_pincodeControl: '',
        perm_addressControl: '',

        stateIdControl: '',
        districtIdControl: '',
        pincodeControl: '',
        addressControl: '',
      });
      this.resetUploads(['PerAddressProof', 'currAddressProof']);

      this.selectedPermanentEdit = null;
      this.selectedCurrentEdit = null;
      this.sameAsPermanent = false;
      this.permCityDataDrp = [];
      this.currCityDataDrp = [];

      this.addressForm.get('stateIdControl')?.enable();
      this.addressForm.get('districtIdControl')?.enable();
      this.addressForm.get('pincodeControl')?.enable();
      this.addressForm.get('addressControl')?.enable();

    }

    if (tablename == 'FamilyDetail') {
      this.selectedFamilyEdit = null;
      this.familyForm.reset({
        nameControl: '',
        ageControl: '',
        relationShipIdControl: '',
        familyPhoneControl: '',
        familyDob: '',
        familyaddress: '',
        AddressProof: '',
        idProof: ''
      });
      this.resetUploads(["AddressProof", "idProof"]);

    }

    if (tablename == 'PerformanceDetail') {
      this.selectedPerformanceEdit = null;
      this.performanceForm.patchValue({
        taskIdControl: '',
        scoreControl: '',
        statusControl: '',
        uploadControl: '',
      });
      this.resetUploads(["uploadControl"]);
    }

    if (tablename == 'QualificationDetails') {
      this.selectedQualificationEdit = null;
      this.qualificationForm.reset({
        empQualifnIdControl: '',
        qualfBrnchIdControl: '',
        universityControl: '',
        dateFromControl: '',
        dateToControl: '',
        degreeDocControl: '',
        twelveDocControl: '',
        tenthDocControl: '',
      });
      this.resetUploads(['degreeDocControl', 'twelveDocControl', 'tenthDocControl']);

    }
    if (tablename == 'PreviousExperienceDetails') {
      this.selectedPrevExpEdit = null;
      this.prevExpForm.reset({
        prevCompanyIdControl: '',
        designationIdControl: '',
        reportingMngControl: '',
        reprtMngPhoneControl: '',
        reprtMngEmailControl: '',
        prevDateFromControl: '',
        prevDateToControl: '',
      });

    }
    if (tablename == 'BankDetails') {
      this.selectedBankEdit = null;
      this.bankForm.reset({
        bankNameIdControl: '',
        branchIdControl: '',
        accountControl: '',
        reAccountControl: '',
        panDetailsControl: '',
        checkUploadControl: '',
        pfControl: '',
        uANControl: '',
        eSIControl: '',
      });
      this.ifscCode = ''
      this.selectedIfsc = null
      this.resetUploads(["checkUploadControl"]);
    }
    if (tablename == 'IdentityProofDetails') {
      this.selectedIdProofEdit = null;
      this.idProofForm.reset({
        idPrfTypidControl: '',
        idNoControl: '',
        validDateControl: '',
        phneControl: '',
        attachFileControl: '',
      });
      this.resetUploads(["attachFileControl"]);
    }

    if (tablename == 'WeeklyOff') {
      this.selectedWeeklyOffEdit = null;
      this.weekOffForm.patchValue({
        weekOffIdControl: '',
      });

    }

    if (tablename == 'IdNomineeDetails') {
      this.selectedNomineeEdit = null;
      this.idNomineeForm.reset({
        idnomineeControl: '',
        familyNameControl: '',
        dobNominee: '',
        autoCalculateAge: '',
        guardianNameControl: '',
        accumulationControl: '',
      });

    }

    if (tablename == 'reportings') {
      this.selectedReportingEdit = null;
      this.reportingsForm.reset({
        managerTypeIdControl: '',
        managerIdControl: '',
      });

    }

  }

  isInvalid(controlName: string): boolean {
    const forms: FormGroup[] = [
      this.employeeForm,
      this.prevExpForm,
      this.addressForm,
      this.familyForm,
      this.performanceForm,
      this.qualificationForm,
      this.bankForm,
      this.transferForm,
      this.idProofForm,
      this.weekOffForm,
      this.idNomineeForm,
      this.orgForm,
      this.reportingsForm
    ];

    for (let form of forms) {
      const control = form.get(controlName);
      if (control) {
        return !!(control.invalid && (control.dirty || control.touched));
      }
    }
    return false;
  }

  onSubmit(event: any) {
    if (!this.employeeForm.valid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    this.paramvaluedata = ''
    this.employeeDetailsArray = [];

    if (this.addressChildData.length == 0) {
      this.message.add({ severity: 'warn', summary: 'Warning', detail: "Please enter address details.", life: 3000 });
      this.paramvaluedata = '';
      return;
    }
    if (this.transferChildData.length == 0) {
      this.message.add({ severity: 'warn', summary: 'Warning', detail: "Please enter transfer details.", life: 3000 });
      this.paramvaluedata = '';
      return;
    }
    if (this.weeklyoffChildData.length == 0) {
      this.message.add({ severity: 'warn', summary: 'Warning', detail: "Please enter weekly off details.", life: 3000 });
      this.paramvaluedata = '';
      return;
    }

    if (this.reportingsChildData.length == 0) {
      this.message.add({ severity: 'warn', summary: 'Warning', detail: "Please enter reportings details.", life: 3000 });
      this.paramvaluedata = '';
      return;
    }

    const nomineeTotals: { [key: string]: number } = {};
    this.nomineeChildData.forEach((item: any) => {
      const type = item.nomineeFor;
      const value = Number(item.shareAccumulation);
      nomineeTotals[type] = (nomineeTotals[type] || 0) + value;
    });


    const invalidNominees = Object.entries(nomineeTotals)
      .filter(([_, total]) => total !== 100);

    if (invalidNominees.length > 0) {
      let combinedTypes = invalidNominees.map(([type, total]) => `${type} (${total}%)`).join(', ');
      let combinedTypesOnly = invalidNominees.map(([type]) => `${type}`).join(', ');
      const msg = `The total share accumulation for ${combinedTypesOnly} must add up to exactly 100%. Currently, The Totals are: ${combinedTypes}. Please adjust the values accordingly.`;
      this.message.add({ severity: 'warn', summary: 'Warning', detail: msg, life: 3000 });
      return;
    }

    if (['10037', '10023', '10106'].includes(this.employeeForm.get(`designationIdControl`)?.value.toString()) && !this.identityProofChildData.some((item: any) => item.idPrfTypid == '10005')) {
      this.message.add({ severity: 'warn', summary: 'Warning', detail: 'Please add the driving license as Id proof for the designation you have chosen!', life: 3000 });
      this.paramvaluedata = '';
      return;
    }

    if (this.employeeTypeId == '10000' && this.employeeForm.get(`officeEmailIdControl`)?.value == '') {
      this.message.add({ severity: 'warn', summary: 'Warning', detail: 'Office Email is required.', life: 3000 });
      return;
    }

    let empId = this.postType == 'update' ? this.selectedItem.empId : this.employeeForm.get(`empIdControl`)?.value;
    let employeeName = this.employeeForm.get(`employeeNameControl`)?.value;
    let fhName = this.employeeForm.get(`fhNameControl`)?.value;
    let aadhar = this.employeeForm.get(`aadharControl`)?.value;
    let designationId = this.postType == 'update' ? this.selectedItem.designationId : this.employeeForm.get(`designationIdControl`)?.value;
    let bloodGroupId = (this.employeeForm.get(`bloodGroupIdControl`)?.value === '') ? 0 : this.employeeForm.get(`bloodGroupIdControl`)?.value;
    let orgMasterId = this.postType == 'update' ? this.selectedItem.orgMasterId : this.employeeForm.get(`orgMasterIdControl`)?.value;
    let employeeCategoryId = this.employeeForm.get(`employeeCategoryIdControl`)?.value;
    let reportingToId = this.employeeForm.get(`reportingToIdControl`)?.value;
    let genderId = this.employeeForm.get(`genderIdControl`)?.value;
    let officeEmailId = (this.employeeForm.get(`officeEmailIdControl`)?.value === '') ? '' : this.employeeForm.get(`officeEmailIdControl`)?.value;
    let personalEmail = (this.employeeForm.get(`personalEmailControl`)?.value === '') ? '' : this.employeeForm.get(`personalEmailControl`)?.value;
    let phone = (this.employeeForm.get(`phoneControl`)?.value === '') ? '' : this.employeeForm.get(`phoneControl`)?.value;
    let officeMobileNo = (this.employeeForm.get(`officeMobileNoControl`)?.value === '') ? '' : this.employeeForm.get(`officeMobileNoControl`)?.value;
    let personalMobileNo = this.employeeForm.get(`personalMobileNoControl`)?.value;
    let dob = this.datePipe.transform(this.employeeForm.get('dobControl')?.value, 'yyyy-MM-dd');
    let doj = this.datePipe.transform(this.employeeForm.get('dojControl')?.value, 'yyyy-MM-dd');
    let realDob = this.datePipe.transform(this.employeeForm.get('realDob')?.value, 'yyyy-MM-dd');
    let departmentId = this.postType == 'update' ? this.selectedItem.departmentId : this.employeeForm.get(`departmentIdControl`)?.value;
    let empTypeId = this.employeeForm.get(`empTypeIdControl`)?.value;
    let profileId = this.employeeForm.get(`profileIdControl`)?.value;
    let sbuMstId = this.employeeForm.get(`sbuMstIdControl`)?.value;
    let empResTypeId = this.employeeForm.get(`empResTypeIdControl`)?.value;
    let punchTypeId = this.employeeForm.get(`punchTypeIdControl`)?.value;
    let fileNo = (this.employeeForm.get(`fileNoControl`)?.value === '') ? '' : this.employeeForm.get(`fileNoControl`)?.value;
    let prevExp = (this.employeeForm.get(`prevExpControl`)?.value === '') ? '' : this.employeeForm.get(`prevExpControl`)?.value;
    let esicbranch = (this.employeeForm.get(`esicBranch`)?.value === '') ? '' : this.employeeForm.get(`esicBranch`)?.value;
    let dispensary = (this.employeeForm.get(`dispensaryId`)?.value === '') ? '' : this.employeeForm.get(`dispensaryId`)?.value;
    let religion = this.employeeForm.get(`religionId`)?.value;
    let maritalStatusId = this.employeeForm.get(`maritalStatusIdControl`)?.value;
    let gradeId = this.employeeForm.get(`gradeIdControl`)?.value;
    let profileImage = this.employeeForm.get(`profileImageUploadControl`)?.value;
    let signatureImage = this.employeeForm.get(`signatureImageUploadControl`)?.value;

    let itemVar = {
      empId: empId,
      employeeName: employeeName,
      fhName: fhName,
      aadhar: aadhar,
      designationId: designationId,
      bloodGroupId: bloodGroupId,
      orgMasterId: orgMasterId,
      employeeCategoryId: employeeCategoryId,
      reportingToId: reportingToId,
      genderId: genderId,
      officeEmailId: officeEmailId,
      personalEmail: personalEmail,
      phone: phone,
      officeMobileNo: officeMobileNo,
      personalMobileNo: personalMobileNo,
      dob: dob,
      doj: doj,
      departmentId: departmentId,
      empTypeId: empTypeId,
      profileId: profileId,
      sbuMstId: sbuMstId,
      empResTypeId: empResTypeId,
      punchTypeId: punchTypeId,
      fileNo: fileNo,
      prevExp: prevExp,
      esicbranch: esicbranch,
      religion: religion,
      dispensary: dispensary,
      maritalStatusId: maritalStatusId,
      gradeId: gradeId,
      profileImage: profileImage,
      realDob: realDob,
      signatureImage: signatureImage
    };

    this.employeeDetailsArray.push(itemVar);
    const validFamilyNames = this.familyChildData.map((f: any) => f.name.toLowerCase());

    this.nomineeChildData = this.nomineeChildData.filter((n: any) =>
      validFamilyNames.includes(n.familyId?.toLowerCase())
    );

    this.familyChildData = this.familyChildData.map((familyMember: any) => {
      const matchedNominees = this.nomineeChildData.filter((nominee: any) => nominee.familyId === familyMember.name);
      return {
        ...familyMember,
        nomineeDetailsJson: matchedNominees.length > 0 ? matchedNominees : []
      };
    });


    const removeKeys = (obj: any) => {
      return obj.map((item: any) => {
        let filteredItem = Object.fromEntries(
          Object.entries(item).filter(([key]) => !key.includes('_Text'))
        );
        if (this.postType == 'update') {
          if (item['nomineeDetailsJson']) {
            filteredItem['nomineeDetailsJson'] = item['nomineeDetailsJson'].map((nominee: any) => {
              const { nomineedob, ageAutoCalulate, ...rest } = nominee;
              return rest;
            });
          }
          return filteredItem;
        }
        else {
          if (item['nomineeDetailsJson']) {
            filteredItem['nomineeDetailsJson'] = item['nomineeDetailsJson'].map((nominee: any) => {
              const { nomineedob, ageAutoCalulate, id, ...rest } = nominee;
              return rest;
            });
          }
          return filteredItem;
        }

      });
    };

    //remove key that include '_Text' from all child array
    let table1 = removeKeys(this.addressChildData)
    let table2 = removeKeys(this.familyChildData)
    let table3 = removeKeys(this.performanceChildData)
    let table4 = removeKeys(this.qualificationChildData)
    let table5 = removeKeys(this.prevExperienceChildData)
    let table6 = removeKeys(this.bankChildData)
    let table7 = removeKeys(this.transferChildData)
    let table8 = removeKeys(this.identityProofChildData)
    let table9 = removeKeys(this.weeklyoffChildData)
    let table10 = removeKeys(this.organizationChildData)
    let table11 = removeKeys(this.reportingsChildData)

    delete this.employeeDetailsArray['id']
    if (this.postType == 'update') {
      this.employeeDetailsArray[0]['id'] = this.selectedItem.empMasterId
    }
    this.openConfirmation('Confirm?', 'Are you sure you want to proceed?', '1', '1', event);


    let obj = {
      EmpJson: [
        { tblEmployeeMaster: this.employeeDetailsArray },
        { tblEmployeeAddressDetails: table1 },
        { tblEmployeeFamilyDetails: table2 },
        { tblEmployeePerformance: table3 },
        { tblEmployeeQualificationDetail: table4 },
        { tblEmployeePreviousExprnDtls: table5 },
        { tblBankDetails: table6 },
        { tblEmployeeTransferDetails: table7 },
        { tblEmployeeIdPrfDtls: table8 },
        { tblEmployeeWeeklyOff: table9 },
        { tblEmloyeeReporting: table11 },
      ]
    }
    if (this.postType == 'update') {
      let org: any = {
        tblEmployeeOrgDepTransfer: table10
      }
      obj.EmpJson.push(org)
    }
    this.paramvaluedata = JSON.stringify(obj)


  }

  submitcall() {
    try {
      this.isFormLoading = true;
      let query = '';
      let SP = '';

      if (this.postType == 'add') {
        query = `EmpJson=${this.paramvaluedata}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId}|districtId=${sessionStorage.getItem('District')}`;
        SP = 'uspPostEmployeeOnboarding'
      }
      else {
        query = `EmpJson=${this.paramvaluedata}|empHeadId=${this.selectedItem.empMasterId}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId}|districtId=${sessionStorage.getItem('District')}`;
        SP = 'uspOnboardingDataUpdate'
      }

      this.userService.SubmitPostTypeData(SP, query, this.FormName).subscribe({
        next: (datacom: any) => {
          this.isFormLoading = false;
          try {
            if (!datacom) return;
            const resultarray = datacom.split('-');
            if (resultarray[1] === 'success') {
              this.getTableData(false);
              this.message.add({
                severity: 'success',
                summary: 'Success',
                detail: this.postType === 'update' ? 'Data Updated Successfully.' : 'Data Saved Successfully.',
                life: 3000
              });
              this.clearData();
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
            console.warn('Unauthorized or Forbidden - redirecting to login...');
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
              detail: 'Something went wrong.',
              life: 3000
            });
          }
        }
      });
    } catch (error: any) {
      console.error('Unexpected error in submitcall():', error);
      this.isFormLoading = false;
      this.message.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Something went wrong',
        life: 3000
      });
    }
  }

 

  clearData() {
    this.selectedItem = null
    this.clearAllChildTable()
    this.postType = 'add'
    this.employeeForm.enable();
    this.employeeForm.reset({
      designationIdControl: '',
      bloodGroupIdControl: '',
      orgMasterIdControl: '',
      employeeCategoryIdControl: '',
      reportingToIdControl: '',
      genderIdControl: '',
      empTypeIdControl: '',
      departmentIdControl: '',
      profileIdControl: '',
      sbuMstIdControl: '',
      empResTypeIdControl: '',
      punchTypeIdControl: '',
      maritalStatusIdControl: '',
      dispensaryId: '',
      esicBranch: '',
      religionId: '',
      gradeIdControl: '',
      realDob: ''
    });
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 1000);

  }

  clearAllChildTable() {
    this.addressChildData = []
    this.familyChildData = []
    this.performanceChildData = []
    this.qualificationChildData = []
    this.prevExperienceChildData = []
    this.bankChildData = []
    this.transferChildData = []
    this.identityProofChildData = []
    this.weeklyoffChildData = []
    this.organizationChildData = []
    this.nomineeChildData = []
    this.reportingsChildData = []
  }


  /* update dropdown master code start */

  get masterInputControl(): FormControl {
    return this.masterUpdateForm.get('masterInput') as FormControl;
  }

  UpdateMasterCustom(tbname: any, heading: any, callbacks: Array<() => void>) {
    this.upateView = false
    const boundCallbacks = callbacks.map((callback) => callback.bind(this));
    this.callbacks.push(...boundCallbacks);
    this.selectedMasterUpdateTable = tbname
    this.modelHeading = heading;
    this.getMasterTableData(false)
  }

  openUpdateMasterModal() {
    this.updateMasterModel = true;
  }

  closeUpdateMasterDialog() {
    this.updateMasterModel = false;
    this.masterTableData = []
    this.masterUpdateForm.reset()
    this.callbacks = [];
    this.selectedItem = null
    this.selectedAction = ''
    this.selectedMasterUpdateTable = ''
    this.modelHeading = '';
  }

  getMasterTableData(isOpened: boolean) {
    try {
      const query = `tableName=${this.selectedMasterUpdateTable}|appUserID=${sessionStorage.getItem('userId')}`;

      this.userService.getQuestionPaper(`uspGetMastersAccessDetails|${query}`).subscribe({
        next: (res: any) => {
          try {
            if (res['table'][0].result == 2) {
              this.message.add({
                severity: 'warn',
                summary: 'Warning',
                detail: res.table[0].column1,
                life: 3000
              });

              this.masterTableData = [];

              if (!isOpened) {
                this.callbacks = [];
                this.selectedMasterUpdateTable = '';
                this.modelHeading = '';
              }

              setTimeout(() => {
                this.dataSource = [];
                this.cdr.detectChanges();
              }, 500);
            } else {
              this.masterTableData = res?.table || [];

              if (!isOpened) {
                this.openUpdateMasterModal();
              }

              if (this.masterTableData.length) {
                setTimeout(() => {
                  this.dataSource = this.masterTableData;
                  this.cdr.detectChanges();
                }, 500);
              }
            }
          } catch (innerErr) {
            console.error('Error processing response in getMasterTableData():', innerErr);
            this.masterTableData = [];
            setTimeout(() => {
              this.dataSource = [];
              this.cdr.detectChanges();
            }, 500);
          } finally {
            setTimeout(() => {
              this.cdr.detectChanges();
            }, 500);
          }
        },
        error: (err) => {
          console.error('API call failed in getMasterTableData():', err);
          this.masterTableData = [];
          setTimeout(() => {
            this.dataSource = [];
            this.cdr.detectChanges();
          }, 500);

          if (err.status === 403) {
            this.Customvalidation.loginroute(err.status);
          }
        }
      });
    } catch (error) {
      console.error('Unexpected error in getMasterTableData():', error);
      this.masterTableData = [];
      setTimeout(() => {
        this.dataSource = [];
        this.cdr.detectChanges();
      }, 500);
    }
  }

  onChangeUpdateMasterTab(isTrue: boolean) {
    try {
      this.upateView = isTrue
      this.postType = 'add'
      this.selectedMasterEditItem = null
      this.masterUpdateForm.reset()
    }
    catch (error) {
    }

  }

  editUpdateMasterRow(item: any) {
    this.selectedMasterEditItem = item
    this.postType = 'update'
    this.masterUpdateForm.patchValue({
      masterInput: item.text,
    });
  }

  onMasterUpdateAction(item: any, type: any) {
    this.selectedAction = type
    let action = type == 'Delete' ? 'InActive' : type
    this.openConfirmation('Confirm?', "Are you sure you want to " + action + "?", item.id, '6')
  }

  confirmDeleteUpdateMasterData(id: any) {
    try {
      this.isLoading = true;
      const query = `tableName=${this.selectedMasterUpdateTable}|id=${id}|action=${this.selectedAction}|appUserId=${sessionStorage.getItem('userId')}`;

      this.userService.SubmitPostTypeData('uspPostDeleteMastersDetails', query, this.FormName).subscribe({
        next: (res: any) => {
          try {
            this.isLoading = false;

            if (!res) {
              this.message.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Empty response received from server.',
                life: 3000
              });
              return;
            }

            if (res === 'Data Saved.-success') {
              this.message.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Data Updated Successfully.',
                life: 3000
              });
              this.getMasterTableData(true);
              this.executeCallbacks();
            } else {
              this.message.add({
                severity: 'warn',
                summary: 'Warning',
                detail: res,
                life: 3000
              });
            }
          } catch (innerErr) {
            console.error('Error processing response in confirmDeleteUpdateMasterData():', innerErr);
            this.message.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Something went wrong while processing the response.',
              life: 3000
            });
          }
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
          console.error('API call failed in confirmDeleteUpdateMasterData():', err);

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
              detail: err.message || 'Something went wrong while deleting data.',
              life: 3000
            });
          }
        }
      });
    } catch (error: any) {
      this.isLoading = false;
      console.error('Unexpected error in confirmDeleteUpdateMasterData():', error);
      this.message.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Unexpected error occurred while deleting data.',
        life: 3000
      });
    }
  }

  OnSubmitUpdateMasterModal() {
    if (this.masterUpdateForm.invalid) {
      this.masterUpdateForm.markAllAsTouched();
      return
    }
    this.openConfirmation('Confirm?', `Are you sure you want to ${this.postType == 'update' ? 'update' : 'proceed'}?`, '1', '7')

  }

  submitcallMasterUpdate() {
    try {
      this.isFormLoading = true;
      let query = '';
      let SP = '';

      const text = this.masterUpdateForm.get('masterInput')?.value || '';

      if (this.selectedMasterEditItem) {
        SP = 'uspPostEditMastersDetails';
        query = `tableName=${this.selectedMasterUpdateTable}|id=${this.selectedMasterEditItem.id}|text=${text}|appUserId=${sessionStorage.getItem('userId')}`;
      } else {
        SP = 'uspPostNewMastersDetails';
        query = `tableName=${this.selectedMasterUpdateTable}|masterText=${text}|appUserId=${sessionStorage.getItem('userId')}`;
      }

      this.userService.SubmitPostTypeData(SP, query, 'change').subscribe({
        next: (datacom: any) => {
          this.isFormLoading = false;
          try {
            if (!datacom) {
              this.message.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Empty response received from server.',
                life: 3000
              });
              return;
            }

            const resultarray = datacom.split('-');

            if (resultarray[1] === 'success') {
              this.getMasterTableData(true);
              this.executeCallbacks();

              this.message.add({
                severity: 'success',
                summary: 'Success',
                detail: this.selectedMasterEditItem
                  ? 'Data Updated Successfully.'
                  : 'Data Saved Successfully.',
                life: 3000
              });
              this.updateMasterModel = false;
              this.masterUpdateForm.reset();
              this.postType = 'add';
              this.selectedMasterEditItem = null;
              this.onDrawerHide();
            } else if (resultarray[0] === '2') {
              this.message.add({
                severity: 'warn',
                summary: 'Warning',
                detail: resultarray[1],
                life: 3000
              });
            } else if (datacom.includes('Error occured while processing data')) {
              this.message.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Something went wrong while processing data.',
                life: 3000
              });
            } else {
              this.message.add({
                severity: 'error',
                summary: 'Error',
                detail: datacom,
                life: 3000
              });
            }
          } catch (innerErr) {
            console.error('Error processing response in submitcallMasterUpdate():', innerErr);
            this.message.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Something went wrong while processing the response.',
              life: 3000
            });
          }
        },
        error: (err: HttpErrorResponse) => {
          this.isFormLoading = false;
          console.error('API call failed in submitcallMasterUpdate():', err);

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
              detail: err.message || 'Something went wrong while saving data.',
              life: 3000
            });
          }
        }
      });
    } catch (error: any) {
      console.error('Unexpected error in submitcallMasterUpdate():', error);
      this.isFormLoading = false;
      this.message.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Unexpected error occurred while submitting data.',
        life: 3000
      });
    }
  }

  executeCallbacks() {
    this.callbacks.forEach((callback) => callback());
  }

  /* update dropdown master code end */


  /* Import attendance file start */

  importFile() {
    this.importDrawer = true;
  }

  onImportDrawerHide() {
    this.importDrawer = false;
    this.dailtAttendanceForm.reset();
    this.dailtAttendanceForm.patchValue({ excelDrpId: '' });
  }


  get excelUpload() {
    return this.uploads.find(u => u.form === this.dailtAttendanceForm && u.controlName === 'documents');
  }

  // Open/Close dialog
  openExcelDialog(upload: any) {
    this.activeExcelUpload = upload;
    this.excelDialogVisible = true;
    this.clearExcelSelection();
  }

  closeExcelDialog() {
    this.excelDialogVisible = false;
    this.clearExcelSelection();
    this.activeExcelUpload = null;
  }

  // File selection
  onExcelSelect(event: any) {
    if (event.files && event.files.length > 0) {
      this.selectedExcelFile = event.files[0];
    }
  }

  // Clear selection
  clearExcelSelection() {
    this.selectedExcelFile = null;
    if (this.excelFileUpload) this.excelFileUpload.clear();
    this.cdr.detectChanges();
  }

  // Upload Excel file
  uploadExcelFile() {
    try {
      if (!this.selectedExcelFile || !this.activeExcelUpload) return;

      const file = this.selectedExcelFile;
      const formControl = this.activeExcelUpload.form.get(this.activeExcelUpload.controlName);

      let Exceldrp = this.dailtAttendanceForm.get(`excelDrpId`)?.value;
      let proc = Exceldrp == 'tblAttendanceDetails' ? 'UploadExcelFiles' : 'UploadBulkEmployeeOnboarding';

      this.userService.Excelfileupload([file], proc, Exceldrp)
        .subscribe({
          next: (res: any) => {
            try {
              if (res === 'OK') {
                this.activeExcelUpload.uploadedFileName = file.name;
                formControl?.setValue(file.name);
                this.message.add({ severity: 'success', summary: 'Success', detail: 'Excel file uploaded successfully!', life: 3000 });
                this.closeExcelDialog();

                this.dailtAttendanceForm.reset();
                this.dailtAttendanceForm.patchValue({ excelDrpId: '' });
                this.clearExcelSelection();

                if (Exceldrp != 'tblAttendanceDetails') {
                  this.getTableData(false);
                }
              } else {
                this.message.add({ severity: 'warn', summary: 'Warning', detail: res, life: 3000 });
              }
            } catch (innerErr) {
              console.error('Error handling upload response', innerErr);
              this.message.add({ severity: 'error', summary: 'Error', detail: 'Error processing upload response', life: 3000 });
            }
          },
          error: (err: any) => {
            console.error('Excel upload HTTP error:', err);
            this.message.add({ severity: 'error', summary: 'Error', detail: err.message, life: 3000 });
          }
        });

    } catch (err) {
      console.error('Unexpected error in uploadExcelFile:', err);
      this.message.add({ severity: 'error', summary: 'Error', detail: 'Unexpected error occurred during upload', life: 3000 });
    }
  }

  /* Import attendance file end */


  exportAsXLSXCustom(): void {
    let query = `uspGetOnboardEmployeesExcelData|districtId=${sessionStorage.getItem('District')}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId}`
    this.userService.LoadReport(query, this.FormName)
      .subscribe((data: any) => {
        if (data['table'] && data['table'].length > 0)
          this.excelService.exportAsExcelFile(data['table'], this.FormName.toString());
      },
        (err: HttpErrorResponse) => {
          if (err.status == 403) {
            this.Customvalidation.loginroute(err.status);
          }
        }
      );
  }

  getFullImageUrl(relativePath: string): string {
    const baseUrl = this.configService.baseUrl;
    return relativePath ? baseUrl + relativePath.replace(/\\/g, '/') : '';
  }


  openDetail(data: any, title: string) {
    this.itemDialog = true;
    this.modelHeading = title;
    this.recordViewData = [];
    this.recordHeaderViewData = [];

    if (data && data !== '') {
      this.recordViewData = JSON.parse(data);

      this.recordViewData = this.recordViewData.map(item => {
        let newItem: any = {};
        for (let key in item) {
          if (item.hasOwnProperty(key)) {
            let newKey = key.replace('_Text', '');
            let value = item[key];

            if (typeof value === 'string') {
              if (/\.(jpg|jpeg|png|gif|pdf)$/i.test(value)) {
                newItem[newKey] = { type: 'file', path: value };
              } else {
                newItem[newKey] = value;
              }
            } else {
              newItem[newKey] = value;
            }
          }
        }
        return newItem;
      });

      if (this.recordViewData.length) {
        this.recordHeaderViewData = Object.keys(this.recordViewData[0]);
      }
    } else {
      this.recordViewData = [];
      this.recordHeaderViewData = [];
    }

  }

  openNomineeDialog(nomineeData: any[]) {
    
    this.nomineeDialog = true;
    if (!nomineeData || nomineeData.length === 0) {
      alert('No nominee details available');
      return;
    }
    const keysToRemove = ['id', 'nomineeForId'];
    const allKeys = Object.keys(nomineeData[0]);

    let filteredKeys = allKeys.filter(key => !keysToRemove.includes(key));

    if (filteredKeys.includes('nomineeFor')) {
      filteredKeys = ['nomineeFor', ...filteredKeys.filter(k => k !== 'nomineeFor')];
    }

    this.nomineeRecordHeaderViewData = filteredKeys;
    this.nomineeRecordViewData = nomineeData.map(item => {
      const newItem: any = {};
      for (const key of this.nomineeRecordHeaderViewData) {
        newItem[key] = item[key];
      }
      return newItem;
    });

  }


  closeNomineeDialog() {
    this.nomineeDialog = false;
    this.nomineeRecordViewData = [];
    this.nomineeRecordHeaderViewData = [];
  
  }

  closeDataDialog() {
    this.itemDialog = false
    this.recordViewData = [];
    this.recordHeaderViewData = [];
    this.modelHeading = '';
  }

  isArray(value: any): boolean {
    return Array.isArray(value);
  }

  getKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  safeFirstElement(arr: any): any {
    if (Array.isArray(arr) && arr.length > 0) {
      return arr[0];
    }
    return null;
  }

  isFile(value: any): boolean {
    if (!value) return false;
    if (typeof value === 'object' && value.type === 'file') return true;
    if (typeof value === 'string') return /\.(jpg|jpeg|png|gif|pdf)$/i.test(value);
    return false;
  }

  getFileUrl(file: any): string {
    if (!file) return '';

    const baseUrl = this.configService?.baseUrl || '';

    if (typeof file === 'object' && file.path) {
      return `${baseUrl}/${file.path.replace(/\\/g, '/')}`;
    }

    if (typeof file === 'string') {
      return `${baseUrl}/${file.replace(/\\/g, '/')}`;
    }

    return '';
  }


  addOrUpdateFunctionalReporting(selectedManagerId: number): void {
    const selectedManager = this.reportingToDataDrp.find(
      (x: any) => x.drpValue === selectedManagerId
    );

    const functionalType = this.managerTypeDataDrp.find(
      (x: any) => x.drpOption === 'Functional' || x.drpValue === 10000
    );

    if (!functionalType) {
      console.warn('Functional type not found in managerTypeDataDrp.');
      return;
    }

    // check if Functional reporting already exists
    const existingIndex = this.reportingsChildData.findIndex(
      (x: any) => x.typeId === functionalType.drpValue
    );

    const newReporting = {
      id: 0,
      typeId: functionalType.drpValue,
      type_Text: functionalType.drpOption,
      managerId: selectedManagerId,
      manager_Text: selectedManager?.drpOption ?? '',
    };
    if (existingIndex > -1) {
      // Update existing Functional row
      this.reportingsChildData[existingIndex] = newReporting;
    } else {
      // Add new Functional row
      this.reportingsChildData.push(newReporting);
    }
    this.reportingsChildData = [...this.reportingsChildData]; // refresh table
  }

  removeFunctionalReporting(): void {
    const functionalType = this.managerTypeDataDrp.find(
      (x: any) => x.drpOption === 'Functional' || x.drpValue === 10000
    );
    if (!functionalType) return;
    this.reportingsChildData = this.reportingsChildData.filter(
      (x: any) => x.typeId !== functionalType.drpValue
    );
  }

}

