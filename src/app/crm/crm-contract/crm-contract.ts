import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { DrawerModule } from 'primeng/drawer';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { TextareaModule } from 'primeng/textarea';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { PopoverModule } from 'primeng/popover';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { UserService } from '../../shared/user-service';
import { Customvalidation } from '../../shared/Validation';
import { TableColumn, TableTemplate } from '../../table-template/table-template';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-crm-contract',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    DatePickerModule,
    DrawerModule,
    TableModule,
    ToastModule,
    TextareaModule,
    BreadcrumbModule,
    PopoverModule,
    ConfirmDialogModule,
    TableTemplate,
    DialogModule,
    TooltipModule
  ],
  templateUrl: './crm-contract.html',
  styleUrls: ['./crm-contract.scss'],
  providers: [MessageService, ConfirmationService, DatePipe],
})
export class CrmContract implements OnInit {
  visible = false;
  postType: 'add' | 'update' | 'view' = 'add';
  header = 'Add Contract';
  headerIcon = '';
  menulabel = '';
  FormName = 'header';
  FormValue = '';
  paramvaluedata = '';
  isLoading = false;

  showOverview = true;
  showItems = true;
  showStage = true;
  showContractDetails = true;
  showAttachments = true;
  showTerms = true;

  contractOverview!: FormGroup;
  itemsForm!: FormGroup;
  contractDetails!: FormGroup;
  attachmentsForm!: FormGroup;
  termsAndConditions!: FormGroup;

  breadcrumbItems = [
    { label: 'Home', routerLink: '/home' },
    { label: 'Contract', routerLink: 'crm-contract' },
  ];

  allViewTableData: any[] = [];
  totalCount = 0;
  pageNo = 1;
  pageSize = 10;
  searchText = '';
  selectedItem: any = null;

  customerTypeDrp: any[] = [];
  customerTableData: any[] = [];
  statusDrp: any[] = [];
  dealTypeDrp: any[] = [];
  currenyDrp: any[] = [];
  quotationDrp: any[] = [];
  termsAndConditionsDrp: any[] = [];
  modelHeading = '';
  recordViewData: any[] = [];
  recordHeaderViewData: any[] = [];
  dataDialogVisible = false;
  attachmentArray: any[] = [];
  itemsArray: any[] = [];
  termsAndConstionsTblArray: any[] = [];
  selectedItemEdit: any = null;

 columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true },
    { key: 'contractNo', header: 'Contract No', isVisible: true, isSortable: false },
    { key: 'contractTitle', header: 'Title', isVisible: true, isSortable: false },
    { key: 'customer', header: 'Customer', isVisible: true, isSortable: false },
    { key: 'dealType', header: 'Deal Type', isVisible: true, isSortable: false },
    { key: 'stage', header: 'Stage', isVisible: true, isSortable: false },
    { key: 'assignedTo', header: 'Assigned To', isVisible: true, isSortable: false },
    { key: 'contractDate', header: 'Contract Date', isVisible: true, isSortable: false },
    { key: 'startDate', header: 'Start Date', isVisible: true, isSortable: false },
    { key: 'endDate', header: 'End Date', isVisible: true, isSortable: false },
    { key: 'contractValue', header: 'Value', isVisible: true, isSortable: false },
    { key: 'currency', header: 'Currency', isVisible: true, isSortable: false },
    { key: 'quoteNo', header: 'Quotation No', isVisible: true, isSortable: false },
    { key: 'remarks', header: 'Remarks', isVisible: true, isSortable: false },
    { key: 'jsonDetails', header: 'Terms Details', isVisible: true, isSortable: false, isCustom: true },
    { key: 'jsonDetails1', header: 'Supporting Docs', isVisible: true, isSortable: false, isCustom: true },
  
];

hiddenViewKeys: string[] = [
    'contractChildId', 'trmsAndCndId', 'uploadFile', 'id',
    'contractId', 'customerId', 'quotationId', 'stageId',
    'dealTypeId', 'customerTypeId', 'currencyId', 'assignedToId',
    'rowNo', 'canUpdate', 'contractFile'
];

  
  private readonly dateColumns = ['contractDate', 'startDate', 'endDate'];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private datePipe: DatePipe,
    public Customvalidation: Customvalidation,
    private cdr: ChangeDetectorRef
  ) {
    this.initForms();
  }

  ngOnInit(): void {
    this.loadMenuMetadata();
    this.getDrp();
    this.getCurrencyDrp();
    this.getTermsAndConditions();
    this.getViewData(true);

    if (this.FormValue) {
      this.getCustomerData();
    } else {
      this.customerTableData = [];
    }
  }

  initForms(): void {
    this.contractOverview = this.fb.group({
      contractTitle: ['', Validators.required],
      customerType: ['', Validators.required],
      Customer: ['', Validators.required],
      dealType: [''],
      relatedQuotation: ['', Validators.required],
      contractDate: [null, Validators.required],
      status: ['', Validators.required],
      uploadSignedContract: [''],
    });

    this.contractDetails = this.fb.group({
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      contractValue: ['', Validators.required],
      currency: ['', Validators.required],
      renewaleAllowed: [false],
      remarks: [''],
    });

    this.itemsForm = this.fb.group({
      itemDetail: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      netPrice: [{ value: 0, disabled: true }],
    });

    this.itemsForm.valueChanges.subscribe((val) => {
      const qty = val.quantity || 0;
      const price = val.unitPrice || 0;
      const net = qty * price;
      if (this.itemsForm.get('netPrice')?.value !== net) {
        this.itemsForm.patchValue({ netPrice: net }, { emitEvent: false });
      }
    });

    this.attachmentsForm = this.fb.group({
      supportingDocument: ['', Validators.required],
      description: [''],
    });

    this.termsAndConditions = this.fb.group({
      termsConditions: ['', Validators.required],
      returnDays: [''],
      remarks: [''],
    });
  }

openDetail(data: any, title: string) {
    this.modelHeading = title;
    this.recordViewData = [];
    this.recordHeaderViewData = [];

    if (data && data !== '[]' && data !== null && data !== undefined) {
        try {
            const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
            if (Array.isArray(parsedData) && parsedData.length > 0) {
                this.recordViewData = parsedData;
                if (parsedData.length > 0) {
                    this.recordHeaderViewData = Object.keys(parsedData[0])
                        .filter(key => !this.hiddenViewKeys.includes(key));
                }
            } else {
                console.log('No data or empty array');
            }
        } catch (e) {
            console.error('Error parsing data:', e);
        }
    } else {
        console.log('No data provided');
    }
    if (this.recordViewData.length > 0) {
        this.dataDialogVisible = true;
    } else {
        this.openAlertDialog('Info', 'No details available');
    }
    
    this.cdr.detectChanges();
}

closeDataDialog() {
    this.dataDialogVisible = false;
    this.recordViewData = [];
    this.recordHeaderViewData = [];
    this.modelHeading = '';
    this.cdr.detectChanges();
}



  loadMenuMetadata(): void {
    const param = sessionStorage.getItem('menuItem');
    if (!param) return;
    try {
      const parsed = JSON.parse(param);
      this.FormName = parsed?.formName ?? 'Contract';
      this.FormValue = parsed?.formValue ?? '';
      this.menulabel = parsed?.menu ?? '';
    } catch {
      this.FormName = 'Contract';
    }
  }

getViewData(showLoader: boolean): void {
    if (showLoader) {
        this.isLoading = true;
    } else {
        this.pageNo = 1;
    }
    const userRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
    const procedure = 'uspGetAllContracts';
    const query = `appUserId=${sessionStorage.getItem( 'userId')}|districtId=${sessionStorage.getItem('District')}|searchText=${this.searchText}|pageIndex=${this.pageNo}|size=${this.pageSize}|appUserRole=${userRole}`;
    this.userService.getQuestionPaper(`${procedure}|${query}`).subscribe({
        next: (res: any) => {
            this.isLoading = false;
            setTimeout(() => {
                this.allViewTableData = res?.table1 || [];
                this.totalCount = res?.table?.[0]?.totalCnt || this.allViewTableData.length;
                this.allViewTableData.forEach(item => {
                    if (item.termsDetail && typeof item.termsDetail === 'string') {
                        try {
                            item.termsDetail = JSON.parse(item.termsDetail);
                        } catch (e) {
                            console.error('Error parsing termsDetail:', e);
                        }
                    }
                    if (item.supportingDocs && typeof item.supportingDocs === 'string') {
                        try {
                            item.supportingDocs = JSON.parse(item.supportingDocs);
                        } catch (e) {
                            console.error('Error parsing supportingDocs:', e);
                        }
                    }
                });
                
                this.cdr.detectChanges();
            }, 0);
        },
        error: (err: HttpErrorResponse) => {
            this.isLoading = false;
            if (err.status === 403) {
                this.Customvalidation.loginroute(err.status);
            } else {
                this.toastError('Failed to load contracts');
            }
        },
    });
}



  getDrp(): void {
    this.userService
      .getQuestionPaper(`uspGetOpportunityDetails|action=CUSTOMER|customerId=0`)
      .subscribe({
        next: (res: any) => {
          this.customerTableData = res?.table || [];
          this.statusDrp = res?.table9 || [];
          this.dealTypeDrp = res?.table8 || [];
          this.customerTypeDrp = res?.table4 || [];
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 403) {
            this.Customvalidation.loginroute(err.status);
          }
        },
      });
  }

  getCustomerData() {
    const ownershipTypeId = this.contractOverview.get('customerType')?.value;
    this.isLoading = true;
    this.userService
      .getQuestionPaper(
        `uspGetOpportunityDetails|action=CUSTOMER|customerId=0|ownershipTypeId=${ownershipTypeId}`
      )
      .subscribe(
        (res: any) => {
          this.customerTableData = res['table'] || [];
          this.isLoading = false;
        },

      );
  }

  getCurrencyDrp(): void {
    this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblCurrencyMaster`).subscribe({
      next: (res: any) => (this.currenyDrp = res?.table || []),
      error: (err: HttpErrorResponse) => {
        if (err.status === 403) {
          this.Customvalidation.loginroute(err.status);
        }
      },
    });
  }

  getTermsAndConditions(): void {
    this.userService
      .getQuestionPaper(`uspGetFillDrpDown|table=tblPurchaseTermsAndCondMstr`)
      .subscribe({
        next: (res: any) => (this.termsAndConditionsDrp = res?.table || []),
        error: (err: HttpErrorResponse) => {
          if (err.status === 403) {
            this.Customvalidation.loginroute(err.status);
          }
        },
      });
  }

  onCustomerTypeChange(value: any): void {
    if (value) {
      this.getCustomerData();
    } else {
      this.customerTableData = [];
      this.contractOverview.get('Customer')?.reset();
    }
  }

  onCustomerChange(customerId: any): void {
    this.contractOverview.patchValue({ relatedQuotation: '' });
    if (!customerId) {
      this.quotationDrp = [];
      return;
    }
    this.getQuotationData(customerId);
  }

  getQuotationData(customerId?: any): void {
    const customer =
      this.postType === 'add'
        ? customerId || this.contractOverview.get('Customer')?.value
        : this.selectedItem?.customerId;
    if (!customer) {
      this.quotationDrp = [];
      return;
    }
    this.userService
      .getQuestionPaper(
        `uspGetQuotationData|action=CONTRACTQUOTATIONDRP|customerId=${customer}|appUserId=${sessionStorage.getItem(
          'userId'
        )}|appUserRole=${JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId}`
      )
      .subscribe({
        next: (res: any) => (this.quotationDrp = res?.table || []),
        error: (err: HttpErrorResponse) => {
          if (err.status === 403) {
            this.Customvalidation.loginroute(err.status);
          }
        },
      });
  }

  openDrawer(type: 'add' | 'update' | 'view', data?: any): void {
    this.postType = type;
    this.selectedItem = data || null;
    this.attachmentArray = [];
    this.termsAndConstionsTblArray = [];
    this.selectedItemEdit = null;
    this.quotationDrp = [];
    this.initForms();

    if (type === 'add') {
      this.header = 'Add Contract';
      this.headerIcon = 'pi pi-plus';
      this.enableForms();
    } else if (type === 'update') {
      this.header = 'Update Contract';
      this.headerIcon = 'pi pi-pencil';
      this.patchForms(data);
      this.enableForms(true);
    } else {
      this.header = 'View Contract';
      this.headerIcon = 'pi pi-eye';
      this.patchForms(data);
      this.disableForms();
    }
    this.visible = true;
  }

  patchForms(data: any): void {
    if (!data) {
      return;
    }
    this.contractOverview.patchValue({
      contractTitle: data.contractTitle || '',
      customerType: data.customerTypeId || '',
      Customer: data.customerId || '',
      dealType: data.dealTypeId || '',
      relatedQuotation: data.quotationId || '',
      contractDate: this.parseDate(data.contractDate),
      status: data.stageId || '',
      uploadSignedContract: data.contractFile || '',
    });

    this.contractDetails.patchValue({
      startDate: this.parseDate(data.startDate),
      endDate: this.parseDate(data.endDate),
      contractValue: data.contractValue || '',
      currency: data.currencyId || '',
      renewaleAllowed: data.renewalAllowed ? data.renewalAllowed !== 0 : false,
      remarks: data.remarks || '',
    });

    this.attachmentArray = data.supportingDocs ? this.safeJsonParse(data.supportingDocs) : [];
    this.itemsArray = data.itemJson ? this.safeJsonParse(data.itemJson) : []; 
    this.termsAndConstionsTblArray = data.termsDetail ? this.safeJsonParse(data.termsDetail) : [];
    this.getQuotationData(data.customerId);
  }

  enableForms(keepCustomerDisabled = false): void {
    [
      this.contractOverview,
      this.contractDetails,
      this.itemsForm,
      this.attachmentsForm,
      this.termsAndConditions,
    ].forEach((form) => form.enable());
    if (keepCustomerDisabled) {
      this.contractOverview.get('Customer')?.disable();
    }
  }

  disableForms(): void {
    [
      this.contractOverview,
      this.contractDetails,
      this.itemsForm,
      this.attachmentsForm,
      this.termsAndConditions,
    ].forEach((form) => form.disable());
  }

  closeDrawer(): void {
    this.visible = false;
  }

  resetForms(): void {
    this.initForms();
    this.attachmentArray = [];
    this.termsAndConstionsTblArray = [];
    this.itemsArray = [];
    this.selectedItemEdit = null;
    this.selectedItem = null;
    // reset UI states
    this.showOverview = true;
    this.showContractDetails = true;
    this.showAttachments = true;
    this.showTerms = true;
  }

  onDrawerHide(): void {
    this.initForms();
    this.attachmentArray = [];
    this.itemsArray = [];
    this.termsAndConstionsTblArray = [];
    this.selectedItem = null;
    this.selectedItemEdit = null;
  }

  toggle(
    section:
      | 'showOverview'
      | 'showStage'
      | 'showContractDetails'
      | 'showAttachments'
      | 'showTerms'
      | 'showItems'
  ): void {
    (this as any)[section] = !(this as any)[section];
  }

  onFileSelected(event: Event, formName: string, controlName: string, folderName: string): void {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    input.value = '';
    if (!files.length) {
      return;
    }
    this.userService.MastrtfileuploadNew(files, folderName).subscribe({
      next: (response: any) => {
        const result = String(response || '').split('-');
        if (result[0] === '1') {
          this.getForm(formName).patchValue({ [controlName]: result[1].toString() });
          this.openAlertDialog('Success!', 'File uploaded successfully.');
        } else {
          this.openAlertDialog('Error!', result[1] || 'Upload failed');
        }
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 401) {
          this.openAlertDialog('Error!', 'You are not authorized!');
        } else if (err.status === 403) {
          this.Customvalidation.loginroute(err.status);
        } else {
          this.openAlertDialog('Error!', err.message || 'Upload failed');
        }
      },
    });
  }

  removeUploadedFile(formName: string, controlName: string): void {
    this.getForm(formName).patchValue({ [controlName]: '' });
  }

  onAddRow(formName: 'attachmentsForm' | 'termsAndConditions'): void {
    const targetForm = this.getForm(formName);
    if (targetForm.invalid) {
      targetForm.markAllAsTouched();
      return;
    }

    if (formName === 'attachmentsForm') {
      this.attachmentArray.push({
        uploadFile: targetForm.get('supportingDocument')?.value,
        documentName: targetForm.get('description')?.value,
      });
      targetForm.reset();
    } else {
      const termsId = targetForm.get('termsConditions')?.value;
      const termExists = this.termsAndConstionsTblArray.some(
        (term) => term.trmsAndCndId === Number(termsId)
      );
      if (termExists && !this.selectedItemEdit) {
        this.openAlertDialog('Alert!', 'Terms and conditions already exist');
        return;
      }
      const newEntry = {
        trmsAndCnd: this.findLabel(this.termsAndConditionsDrp, termsId),
        trmsAndCndId: Number(termsId),
        remarks: targetForm.get('remarks')?.value,
        returnDaysAllowed: targetForm.get('returnDays')?.value || 0,
        contractChildId: this.selectedItemEdit?.contractChildId || 0,
      };

      if (this.selectedItemEdit) {
        this.termsAndConstionsTblArray = this.termsAndConstionsTblArray.map((item) =>
          item.contractChildId === this.selectedItemEdit.contractChildId ? newEntry : item
        );
      } else {
        this.termsAndConstionsTblArray.push(newEntry);
      }
      this.selectedItemEdit = null;
      targetForm.reset();
    }
  }

  editRow(formName: 'termsAndConditions', data: any): void {
    this.selectedItemEdit = data;
    this.selectedItemEdit = data;
    this.termsAndConditions.patchValue({
      termsConditions: data.trmsAndCndId,
      returnDays: data.returnDaysAllowed,
      remarks: data.remarks,
    });
  }

  onDeleteRow(index: number, arrayName: 'attachmentArray' | 'termsAndConstionsTblArray' | 'itemsArray'): void {
    (this as any)[arrayName].splice(index, 1);
  }

  onAddItem(): void {
    if (this.itemsForm.invalid) {
      this.itemsForm.markAllAsTouched();
      return;
    }
    const val = this.itemsForm.getRawValue();
    this.itemsArray.push({
      itemId: 0,
      itemDetail: val.itemDetail,
      quantity: val.quantity,
      unitPrice: val.unitPrice,
      netPrice: val.quantity * val.unitPrice,
    });
    this.itemsForm.reset({ quantity: 1, unitPrice: 0, netPrice: 0 });
  }

  OnSubmitModal(): void {
    if (this.contractOverview.invalid || this.contractDetails.invalid) {
      this.markAllFormsTouched();
      this.scrollToFirstInvalidControl();
      return;
    }

    const overview = this.contractOverview.getRawValue();
    const details = this.contractDetails.getRawValue();
    const attachment = this.attachmentArray.length ? JSON.stringify(this.attachmentArray) : '';
    // Prepare itemJson with item details only
    const items = this.itemsArray.length
      ? JSON.stringify(
        this.itemsArray.map((item) => ({
          itemId: Number(item.itemId) || 0,
          itemDetail: item.itemDetail || '',
          quantity: Number(item.quantity) || 0,
          unitPrice: Number(item.unitPrice) || 0,
          netPrice: Number(item.netPrice) || 0,
        }))
      )
      : '';
    // Prepare termsJson separately
    const terms = this.termsAndConstionsTblArray.length
      ? JSON.stringify(this.termsAndConstionsTblArray)
      : '';

    this.paramvaluedata = [
      `contractTitle=${overview.contractTitle}`,
      `customerId=${overview.Customer}`,
      `customerTypeId=${overview.customerType}`,
      `dealTypeId=${overview.dealType || 0}`,
      `quotationId=${overview.relatedQuotation}`,
      `contractDate=${this.toApiDate(overview.contractDate)}`,
      `startDate=${this.toApiDate(details.startDate)}`,
      `endDate=${this.toApiDate(details.endDate)}`,
      `contractValue=${details.contractValue}`,
      `currencyId=${details.currency}`,
      `itemJson=[]`,
      `termsJson=${terms}`,
      `renewalAllowed=${details.renewaleAllowed ? 1 : 0}`,
      `remarks=${details.remarks || ''}`,
      `stageId=${overview.status}`,
      `contractFile=${overview.uploadSignedContract || ''}`,
      `attachmentJson=${attachment}`,
    ].join('|');

    const confirmMessage =
      this.postType === 'update'
        ? 'Are you sure you want to update this contract?'
        : 'Are you sure you want to save this contract?';

    const acceptLabel = this.postType === 'update' ? 'Update' : 'Yes';

    this.confirmationService.confirm({
      header: 'Are You Sure?',
      message: confirmMessage,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: acceptLabel,
      rejectLabel: 'No',
      acceptButtonStyleClass: 'p-button-success',
      accept: () => this.submitcall(),
    });
  }

  submitcall(): void {
    const roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
    let query = '';
    let spName = '';
    if (this.postType === 'update') {
      query = `contractId=${this.selectedItem?.contractId}|${this.paramvaluedata
        }|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${roleID}`;
      spName = 'uspUpdateContractDetails';
    } else {
      query = `${this.paramvaluedata}|appUserId=${sessionStorage.getItem(
        'userId'
      )}|appUserRole=${roleID}|districtId=${sessionStorage.getItem('District')}`;
      spName = 'uspPostContractDetails';
    }

    this.isLoading = true;
    this.userService.SubmitPostTypeData(spName, query, 'header').subscribe({
      next: (datacom: any) => {
        this.isLoading = false;
        const resultarray = typeof datacom === 'string' ? datacom.split('-') : [];
        if (resultarray[1] === 'success') {
          this.openAlertDialog(
            'Success!',
            this.postType === 'update' ? 'Data Updated Successfully.' : 'Data Saved Successfully.'
          );
          this.closeDrawer();
          this.getViewData(false);
        } else if (resultarray[0] === '2') {
          this.openAlertDialog('Alert!', resultarray[1]);
        } else if (String(datacom).includes('error')) {
          this.openAlertDialog('Alert!', 'Something went wrong!');
        } else {
          this.openAlertDialog('Alert!', datacom);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        if (err.status === 401) {
          this.openAlertDialog('Error!', 'You are not authorized!');
        } else if (err.status === 403) {
          this.Customvalidation.loginroute(err.status);
        } else {
          this.openAlertDialog('Error!', err.message || 'Server error');
        }
      },
    });
  }

  promptDelete(item: any): void {
    this.selectedItem = item;
    this.confirmationService.confirm({
      header: 'Confirm?',
      message: 'Are you sure you want to delete?',
      icon: 'pi pi-trash',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => this.deleteData(),
    });
  }

  deleteData(): void {
    if (!this.selectedItem) return;
    const roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
    const query = `contractId=${this.selectedItem.contractId}|appUserId=${sessionStorage.getItem(
      'userId'
    )}|appUserRole=${roleID}`;
    this.isLoading = true;
    this.userService.SubmitPostTypeData('uspDeleteContractDetails', query, 'header').subscribe({
      next: (datacom: any) => {
        this.isLoading = false;
        const resultarray = typeof datacom === 'string' ? datacom.split('-') : [];
        if (resultarray[1] === 'success') {
          this.openAlertDialog('Success!', 'Data deleted!');
          this.getViewData(false);
        } else if (resultarray[0] === '2') {
          this.openAlertDialog('Alert!', resultarray[1]);
        } else {
          this.openAlertDialog('Alert!', datacom);
        }
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        if (err.status === 401) {
          this.openAlertDialog('Error!', 'You are not authorized!');
        } else if (err.status === 403) {
          this.Customvalidation.loginroute(err.status);
        } else {
          this.openAlertDialog('Error!', err.message || 'Server error');
        }
      },
    });
  }

  viewAttachment(url: string): void {
    if (url) {
      window.open(`https://elocker.nobilitasinfotech.com/${url}`, '_blank');
    } else {
      this.openAlertDialog('Alert!', 'File not Exist!');
    }
  }

  isInvalid(controlName: string, form?: FormGroup): boolean {
    const targetForm =
      form ||
      [
        this.contractOverview,
        this.contractDetails,
        this.itemsForm,
        this.attachmentsForm,
        this.termsAndConditions,
      ].find((f) => !!f.get(controlName));
    const control = targetForm?.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  scrollToFirstInvalidControl(): void {
    setTimeout(() => {
      const firstInvalid = document.querySelector('.ng-invalid');
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        (firstInvalid as HTMLElement).focus();
      }
    }, 200);
  }

  markAllFormsTouched(): void {
    [
      this.contractOverview,
      this.contractDetails,
      this.itemsForm,
      this.attachmentsForm,
      this.termsAndConditions,
    ].forEach((form) => form.markAllAsTouched());
  }

  onPageChange(newPage: number): void {
    this.pageNo = newPage;
    this.getViewData(true);
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize = newSize;
    this.pageNo = 1;
    this.getViewData(true);
  }

  onSearchChange(search: string): void {
    this.searchText = search;
    this.pageNo = 1;
    this.getViewData(false);
  }

  formatKey(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .replace(/_/g, ' ');
  }

  formatDate(value: any): string {
    return value ? this.datePipe.transform(value, 'dd-MMM-yyyy') || '' : '';
  }

  formatCell(item: any, key: string): string {
    if (this.dateColumns.includes(key)) {
      return this.formatDate(item[key]);
    }
    return item[key] ?? '';
  }

  openAlertDialog(summary: string, detail: string): void {
    const severity = /error|alert/i.test(summary)
      ? 'error'
      : summary.toLowerCase().includes('success')
        ? 'success'
        : 'info';
    this.messageService.add({ severity, summary, detail });
  }

  toastError(detail: string): void {
    this.messageService.add({ severity: 'error', summary: 'Error', detail });
  }

  private getForm(formName: string): FormGroup {
    switch (formName) {
      case 'contractOverview':
        return this.contractOverview;
      case 'contractDetails':
        return this.contractDetails;
      case 'attachmentsForm':
        return this.attachmentsForm;
      case 'termsAndConditions':
        return this.termsAndConditions;
      default:
        return this.contractOverview;
    }
  }

  private parseDate(date: any): Date | null {
    if (!date) return null;
    const parsed = new Date(date);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  private toApiDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    return isNaN(d.getTime()) ? '' : this.datePipe.transform(d, 'yyyy-MM-dd') || '';
  }

  private safeJsonParse(jsonString: string): any[] {
    try {
      return jsonString ? JSON.parse(jsonString) : [];
    } catch (e) {
      return [];
    }
  }

  private findLabel(options: any[], value: any): string {
    const option = options.find((opt) => opt.drpValue == value);
    return option ? option.drpOption : '';
  }
}
