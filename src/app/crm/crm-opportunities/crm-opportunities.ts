// Key fixes applied:
// 1. Fixed drawer not opening in edit mode by moving this.visible = true AFTER data is loaded
// 2. Added validation for Follow-up Date in update mode
// 3. Fixed Document Details label typo
// 4. Improved form state management

import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { forkJoin, of } from 'rxjs';
import { tap, map, catchError, finalize } from 'rxjs/operators';
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
import { MessageModule } from 'primeng/message';
import { PopoverModule } from 'primeng/popover';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { FileUploadModule, FileUpload } from 'primeng/fileupload';
import { TooltipModule } from 'primeng/tooltip';
import { UserService } from '../../shared/user-service';
import { ConfigService } from '../../shared/config.service';
import { TableColumn, TableTemplate } from '../../table-template/table-template';
import { Customvalidation } from "../../shared/Validation";

@Component({
  selector: 'app-crm-opportunities',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    DatePickerModule,
    DrawerModule,
    TableModule,
    ToastModule,
    TextareaModule,
    BreadcrumbModule,
    MessageModule,
    TableTemplate,
    PopoverModule,
    ConfirmDialogModule,
    DialogModule,
    FileUploadModule,
    TooltipModule
  ],
  templateUrl: './crm-opportunities.html',
  providers: [MessageService, ConfirmationService, DatePipe, CurrencyPipe],
})
export class CrmOpportunities implements OnInit {
  @ViewChild('attachmentUpload') attachmentUpload!: FileUpload;

  visible = false;
  postType: 'add' | 'update' | 'view' = 'add';
  header = 'Add Opportunity';
  headerIcon = '';
  menulabel = '';
  FormName = 'header';
  isLoading = false;
  isUploadingAttachment = false;

  showOpportunity = true;
  showItems = true;
  showStage = true;
  showNextFollowUp = true;
  showNotes = true;
  showAttachments = true;

  masterUpdateVisible = false;
  itemDetailsVisible = false;
  dataDialogVisible = false;
  isDropdownDataLoaded = false;

  currentMasterHeader = '';
  currentMasterTable = '';
  newMasterText = '';

  // Forms
  opportunityDetails!: FormGroup;
  itemsDetails!: FormGroup;
  nextFollowUp!: FormGroup;
  notes!: FormGroup;
  attachmentDetail!: FormGroup;
  stageForm!: FormGroup;

  // Pagination
  totalCount = 0;
  pageNo = 1;
  pageSize = 5;
  searchText = '';

  // Dropdown Data
  opportunityTypeDrop: any[] = [];
  leadDrp: any[] = [];
  customerTableData: any[] = [];
  customerAddressDrp: any[] = [];
  contactDrp: any[] = [];
  sourceTableData: any[] = [];
  stageTableData: any[] = [];
  probTableData: any[] = [];
  customerType: any[] = [];
  assignedToTableData: any[] = [];
  priceListTableData: any[] = [];
  itemListTableDataArray: any[] = [];
  meetingModeDrop: any[] = [];

  // Table Data
  allViewTableData: any[] = [];
  itemsDetailsChildData: any[] = [];
  attachmentDetailArray: any[] = [];
  followUpArray: any[] = [];
  stageTableArray: any[] = [];
  selectedItemDetails: any[] = [];

  // Dialog Data
  modelHeading = '';
  recordViewData: any[] = [];
  recordHeaderViewData: any[] = [];
  hiddenViewKeys: string[] = [
    'id',
    'opportunityChildId',
    'followupId',
    'materialId',
    'priceListId',
    'meetingModeId',
    'statusId',
    'sourceId',
    'probabilityId',
    'orgTypeId',
    'customerId',
    'contactId',
    'custAddId',
    'assignedToId',
    'leadId',
    'opportunityTypeId',
    'documentId',
    'uploadFile',
    'documentName',
    'rowNo',
    'freezeStatus',
    'wonStage',
    'lostStage',
    'freeze',
    'canUpdate',
    'approveStatus',
    'approvalRemarks',
    'districtId',
    'appUserId',
    'appUserRole',
    'opportunityId',
    'itemId',
    'itemCodeId',
    'childId',
    'srNo',
    'followupId',
    'attachmentId',
    'stageId',
    'probability'
  ];

  selectedItem: any;
  paramvaluedata = '';
  param: any;
  tomorrow: Date;
  closeWon = 0;
  closeLost = 0;
  lostAndWonTxt = '';
  closureDateValidate: any;
  nextFollowUpDateValidate: any;
  show = true;
  sel: any;
  disableSubmit = true;
  modalHeading: any;
  rowId: any;
  editText: any;
  EdittableidUpdate: any;
  viewData: any[] = [];

  // File Upload
  selectedAttachmentFile: File | null = null;
  attachmentPreviewUrl: string | null = null;

  breadcrumbItems = [
    { label: 'Crm' },
    { label: ' Opportunities', routerLink: '/crm-opportunities' },
  ];

  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true },
    { key: 'opportunityCode', header: 'Opportunity Code', isVisible: true, isSortable: false },
    { key: 'assignedTo', header: 'Assigned To', isVisible: true, isSortable: false },
    { key: 'opportunityName', header: 'Subject', isVisible: true, isSortable: false },
    { key: 'opportunityType', header: 'Opportunity Type', isVisible: true, isSortable: false },
    { key: 'lead', header: 'Lead', isVisible: true, isSortable: false },
    { key: 'priceList', header: 'Price List', isVisible: true, isSortable: false },
    { key: 'customer', header: 'Customer', isVisible: true, isSortable: false },
    { key: 'contact', header: 'Contact Details', isVisible: true, isSortable: false },
    { key: 'source', header: 'Source', isVisible: true, isSortable: false },
    { key: 'probability', header: 'Probability', isVisible: true, isSortable: false },
    { key: 'lostStage', header: 'Lost Stage', isVisible: true, isSortable: false },
    { key: 'status', header: 'Status', isVisible: true, isSortable: false },
    { key: 'expectedDate', header: 'Expected Date of Closure', isVisible: true, isSortable: false },
    { key: 'nextfollowUpDate', header: 'Next Follow-up Date', isVisible: true, isSortable: false },
    { key: 'notes', header: 'Notes', isVisible: true, isSortable: false },
    { key: 'amount', header: 'Opportunity Amount', isVisible: true, isSortable: false },
    { key: 'jsonDetails', header: 'Item Details', isVisible: true, isSortable: false, isCustom: true },
    { key: 'jsonDetails1', header: 'Follow-up Details', isVisible: true, isSortable: false, isCustom: true },
    { key: 'jsonDetails2', header: 'Stage History', isVisible: true, isSortable: false, isCustom: true },
    { key: 'jsonDetails3', header: 'Attachments', isVisible: true, isSortable: false, isCustom: true },
  ];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private configService: ConfigService,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef,
    private confirmationService: ConfirmationService,
    private datePipe: DatePipe,
    private currencyPipe: CurrencyPipe,
    public Customvalidation: Customvalidation
  ) {
    const today = new Date();
    this.tomorrow = new Date(today.setDate(today.getDate() + 1));
  }

  ngOnInit(): void {
    const paramStr = sessionStorage.getItem('menuItem');
    if (paramStr) {
      try {
        const p = JSON.parse(paramStr);
        this.menulabel = p.menu;
        this.FormName = p.formName;
        this.breadcrumbItems = [
          { label: 'CRM' },
          { label: this.menulabel },
          { label: this.FormName }
        ];
      } catch { }
    }
    this.initForm();
    this.getViewData(true);
  }

  initForm() {
    this.opportunityDetails = this.fb.group({
      subject: ['', Validators.required],
      opportunityType: ['', Validators.required],
      lead: [''],
      customerType: ['', Validators.required],
      customer: ['', Validators.required],
      customerAddress: ['', Validators.required],
      contactDetails: ['', Validators.required],
      source: ['', Validators.required],
      expectedDate: ['', Validators.required],
      assignedTo: ['', Validators.required],
    });

    this.itemsDetails = this.fb.group({
      priceList: ['', Validators.required],
      totalAmount: [{ value: 0, disabled: true }],
      item: ['', Validators.required],
      quantity: [1, [Validators.required, this.nonZeroNumberValidator()]],
      unitPrice: [{ value: 0, disabled: true }],
      totalPrice: [{ value: 0, disabled: true }],
      details: [''],
    });
    this.nextFollowUp = this.fb.group({
      nextFollowUpDate: [null, Validators.required],
      description: [''],
      meetingDate: [null],
      meetingMode: [''],
      remarks: [''],
    });

    this.notes = this.fb.group({ Notes: [''] });

    this.stageForm = this.fb.group({
      stage: ['', Validators.required],
      probability: [''],
    });

    this.attachmentDetail = this.fb.group({
      documentType: ['', Validators.required],
      documentDetails: [''],
      attachment: ['']
    });
    this.opportunityDetails.get('customerType')?.valueChanges
      .pipe(
        tap(() => {
          if (this.isDropdownDataLoaded) {
            this.getCustomerData();
          }
        })
      )
      .subscribe();
  }

  nonZeroNumberValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value !== null && control.value !== undefined) {
        const value = control.value;
        if (isNaN(value) || value <= 0) {
          return { nonZeroNumber: true };
        }
      }
      return null;
    };
  }


  openDetail(data: any, title: string) {
    this.modelHeading = title;
    this.recordViewData = [];
    this.recordHeaderViewData = [];

    if (data && data.length) {
      let parsedData = data;
      if (typeof data === 'string') {
        try {
          parsedData = JSON.parse(data);
        } catch (e) {
          console.error('Error parsing JSON:', e);
          parsedData = [];
        }
      }

      this.recordViewData = parsedData;
      if (this.recordViewData.length > 0) {
        this.recordHeaderViewData = Object.keys(this.recordViewData[0])
          .filter(key => !this.hiddenViewKeys.includes(key));
      }
    }

    this.dataDialogVisible = true;
    this.cdr.detectChanges();
  }


  closeDataDialog() {
    this.dataDialogVisible = false;
    this.recordViewData = [];
    this.recordHeaderViewData = [];
    this.modelHeading = '';
    this.cdr.detectChanges();
  }


  formatDisplayValue(item: any, key: string): string {
    const value = item[key];

    if (value === null || value === undefined || value === '') {
      return '-';
    }

    if (key.toLowerCase().includes('date') || key.toLowerCase().includes('followup')) {
      if (typeof value === 'string') {
        if (value.includes('T')) {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            return this.datePipe.transform(date, 'dd-MM-yyyy') || value;
          }
        }
      }
      return value;
    }

    if (key.toLowerCase().includes('price') ||
      key.toLowerCase().includes('amount') ||
      key.toLowerCase().includes('total')) {
      if (typeof value === 'number') {
        return this.currencyPipe.transform(value, 'INR') || value.toString();
      }
    }

    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    return value.toString();
  }

  getColumnWidth(key: string): string {
    const widthMap: { [key: string]: string } = {
      'material': '200px',
      'itemDetail': '250px',
      'description': '250px',
      'remarks': '200px',
      'address': '300px',
      'documentDetails': '200px',
      'itemDetails': '250px',
      'meetingMode': '150px'
    };

    return widthMap[key] || 'auto';
  }


  private parseJsonFields(data: any) {
    if (!data) return;

    if (data.itemDetails && typeof data.itemDetails === 'string' && data.itemDetails !== '[]') {
      try {
        data.itemDetails = JSON.parse(data.itemDetails);
      } catch (e) {
        data.itemDetails = [];
      }
    }

    if (data.opportunityFollowup && typeof data.opportunityFollowup === 'string' && data.opportunityFollowup !== '[]') {
      try {
        data.opportunityFollowup = JSON.parse(data.opportunityFollowup);
      } catch (e) {
        data.opportunityFollowup = [];
      }
    }

    if (data.opportunityStageHistory && typeof data.opportunityStageHistory === 'string' && data.opportunityStageHistory !== '[]') {
      try {
        data.opportunityStageHistory = JSON.parse(data.opportunityStageHistory);
      } catch (e) {
        data.opportunityStageHistory = [];
      }
    }

    if (data.opportunityDocs && typeof data.opportunityDocs === 'string' && data.opportunityDocs !== '[]') {
      try {
        data.opportunityDocs = JSON.parse(data.opportunityDocs);
      } catch (e) {
        data.opportunityDocs = [];
      }
    }
  }


  showDialog(type: 'add' | 'update' | 'view', data?: any) {
    this.postType = type;
    this.selectedItem = data;

    this.initForm();
    this.itemsDetailsChildData = [];
    this.attachmentDetailArray = [];
    this.followUpArray = [];
    this.stageTableArray = [];

    if (type === 'add') {
      this.header = 'Add Opportunities';
      this.headerIcon = 'pi pi-plus';
      this.stageForm.get('probability')?.disable();
      this.enableAllForms();
      this.visible = true;
      this.cdr.detectChanges();
    } else if (type === 'update') {
      this.header = 'Update Opportunities';
      this.headerIcon = 'pi pi-pencil';
      this.stageForm.get('probability')?.disable();
    } else {
      this.header = 'View Opportunities';
      this.headerIcon = 'pi pi-eye';
    }
    setTimeout(() => {
      this.loadMasterDropdowns().subscribe(() => {
        if (type !== 'add' && data) {
          const custId = Number(data.customerId) || 0;
          const districtId = sessionStorage.getItem('District') || '0';
          const priceListId = data.priceListId || 0;

          forkJoin({
            customerDetails: this.userService.getQuestionPaper(
              `uspGetOpportunityDetails|action=CUSTOMERDETAILS|customerId=${custId}`
            ),
            priceList: this.userService.getQuestionPaper(
              `uspGetOpportunityDetails|action=PRICELIST|customerId=${custId}|districtId=${districtId}`
            )
          }).subscribe({
            next: (res: any) => {
              setTimeout(() => {
                this.customerAddressDrp = res.customerDetails?.table || [];
                this.contactDrp = res.customerDetails?.table1 || [];
                this.priceListTableData = res.priceList?.table || [];

                if (this.postType === 'update' && priceListId) {
                  this.getItem({ value: priceListId }).subscribe(() => {
                    setTimeout(() => {
                      this.patchAllForms(data);
                      this.closeLost = data['lostStage'];
                      this.closeWon = data['wonStage'];
                      this.closureDateValidate = data['closureDate'];
                      this.nextFollowUpDateValidate = data['nextfollowUpDate'];

                      if (this.postType == 'view') {
                        this.disableAllForms();
                      } else {
                        this.enableAllForms();
                        this.opportunityDetails.get('assignedTo')?.disable();
                        this.opportunityDetails.get('customer')?.disable();
                      }
                      this.visible = true;
                      this.cdr.detectChanges();
                    }, 0);
                  });
                } else {
                  setTimeout(() => {
                    this.patchAllForms(data);
                    if (this.postType === 'view') {
                      this.disableAllForms();
                    } else {
                      this.enableAllForms();
                      this.opportunityDetails.get('assignedTo')?.disable();
                      this.opportunityDetails.get('customer')?.disable();
                    }
                    this.visible = true;
                    this.cdr.detectChanges();
                  }, 0);
                }
              }, 0);
            },
            error: (err: HttpErrorResponse) => {
              if (err.status == 403) {
                this.Customvalidation.loginroute(err.status);
              }
              setTimeout(() => {
                this.visible = true;
                this.cdr.detectChanges();
              }, 0);
            }
          });
        }
      });
    }, 0);
  }

  isViewMode(): boolean {
    return this.postType === 'view';
  }

  isUpdateMode(): boolean {
    return this.postType === 'update';
  }

  isAddMode(): boolean {
    return this.postType === 'add';
  }

  private resolveValue(options: any[], raw: any): any {
    if (raw == null || raw === '') return null;
    const s = String(raw).trim().toLowerCase();
    const idMatch = options.find((o) => String(o.drpValue).trim() === String(raw).trim());
    if (idMatch) return idMatch.drpValue;
    const labelMatch = options.find((o) => String(o.drpOption).trim().toLowerCase() === s);
    if (labelMatch) return labelMatch.drpValue;
    return raw;
  }

  private parseDate(val: any): Date | null {
    if (!val) return null;
    if (val instanceof Date && !isNaN(val.getTime())) return val;

    if (typeof val === 'string') {
      const trimmed = val.trim();
      const isoTry = new Date(trimmed);
      if (!isNaN(isoTry.getTime())) return isoTry;
      const ddMMyyyyMatch = /^(\d{2})-(\d{2})-(\d{4})$/.exec(trimmed);
      if (ddMMyyyyMatch) {
        const day = +ddMMyyyyMatch[1];
        const month = +ddMMyyyyMatch[2] - 1;
        const year = +ddMMyyyyMatch[3];
        const d = new Date(year, month, day);
        return isNaN(d.getTime()) ? null : d;
      }
      const yyyyMMddMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
      if (yyyyMMddMatch) {
        const year = +yyyyMMddMatch[1];
        const month = +yyyyMMddMatch[2] - 1;
        const day = +yyyyMMddMatch[3];
        const d = new Date(year, month, day);
        return isNaN(d.getTime()) ? null : d;
      }
    }

    return null;
  }

  loadMasterDropdowns() {
    const userInfo = JSON.parse(sessionStorage.getItem('UserInfo') || '{}');
    const empId = userInfo?.empId || 0;
    const userId = userInfo?.userID || 0;

    return forkJoin({
      assigned: this.userService.getQuestionPaper(
        `uspGetFillDrpDown|table=CrmEmployeeDrp|filterValue=${empId}|filterColumn=`
      ),
      details: this.userService.getQuestionPaper(
        'uspGetOpportunityDetails|action=CUSTOMER|customerId=0'
      ),
      oppType: this.userService.getQuestionPaper(
        'uspGetOpportunityDetails|action=OPPORTUNITYTYPE'
      ),
      lead: this.userService.getQuestionPaper(
        `uspGetOpportunityDetails|action=LEAD|appUserId=${userId}`
      ),
    }).pipe(
      tap((res: any) => {
        setTimeout(() => {
          this.assignedToTableData = res.assigned?.table || [];
          this.probTableData = res.details?.table3 || [];
          this.customerTableData = res.details?.table || [];
          this.stageTableData = res.details?.table1 || [];
          this.sourceTableData = res.details?.table2 || [];
          this.customerType = res.details?.table4 || [];
          this.opportunityTypeDrop = res.oppType?.table || [];
          this.leadDrp = res.lead?.table || [];
          this.meetingModeDrop = res.details?.table10 || [];
          this.isDropdownDataLoaded = true;
          this.cdr.detectChanges();
        }, 0);
      }),
      map(() => void 0)
    );
  }

  getCustomerData() {
    const ownershipTypeId = this.opportunityDetails.get('customerType')?.value;

    if (!ownershipTypeId) {
      this.customerTableData = [];
      return;
    }

    this.userService
      .getQuestionPaper(`uspGetOpportunityDetails|action=CUSTOMER|customerId=0|ownershipTypeId=${ownershipTypeId}`)
      .subscribe({
        next: (res: any) => {
          setTimeout(() => {
            this.customerTableData = res['table'] || [];
            this.cdr.detectChanges();
          }, 0);
        },
        error: (err: HttpErrorResponse) => {
          if (err.status == 403) {
            this.Customvalidation.loginroute(err.status);
          }
          this.customerTableData = [];
        }
      });
  }

  enableAllForms() {
    [
      this.opportunityDetails,
      this.itemsDetails,
      this.nextFollowUp,
      this.notes,
      this.attachmentDetail,
      this.stageForm,
    ].forEach((f) => f.enable());
    this.itemsDetails.get('totalAmount')?.disable();
    this.itemsDetails.get('unitPrice')?.disable();
    this.itemsDetails.get('totalPrice')?.disable();

    if (this.postType === 'add') {
      this.stageForm.get('probability')?.disable();
    }
    if (this.postType === 'add') {
      this.itemsDetails.get('priceList')?.enable();
    }
  }

  disableAllForms() {
    [
      this.opportunityDetails,
      this.itemsDetails,
      this.nextFollowUp,
      this.notes,
      this.attachmentDetail,
      this.stageForm,
    ].forEach((f) => f.disable());
  }


  getViewData(isTrue: any) {
    if (!isTrue) this.pageNo = 1;

    this.isLoading = true;

    const roleId = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
    this.userService
      .getQuestionPaper(
        `uspGetOpportunitiesViewData|appUserId=${sessionStorage.getItem(
          'userId'
        )}|appUserRole=${roleId}|districtId=${sessionStorage.getItem('District')}|searchText=${this.searchText
        }|pageIndex=${this.pageNo}|size=${this.pageSize}`
      )
      .subscribe({
        next: (res: any) => {
          this.allViewTableData = res['table1'] || [];
          this.totalCount = res?.table?.[0]?.totalCnt || this.allViewTableData.length;
          this.allViewTableData.forEach((element: any) => {
            element.rowNo = (this.pageNo - 1) * this.pageSize + this.allViewTableData.indexOf(element) + 1;
            this.parseJsonFields(element);
          });

          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
          if (err.status == 403) {
            this.Customvalidation.loginroute(err.status);
          } else {
            this.openAlertDialog('Error!', err.message || 'Server Error');
          }
          this.cdr.detectChanges();
        }
      });
  }

  onPageChange(newPage: number) {
    this.pageNo = newPage;
    this.getViewData(true);
  }

  onPageSizeChange(newSize: number) {
    this.pageSize = newSize;
    this.pageNo = 1;
    this.getViewData(true);
  }

  onSearchChange(search: string) {
    this.searchText = search;
    this.pageNo = 1;
    this.getViewData(false);
  }

  getAddressAndDetails(event: any) {
    const id = event?.value;
    if (!id) return;
    this.userService
      .getQuestionPaper(`uspGetOpportunityDetails|action=CUSTOMERDETAILS|customerId=${id}`)
      .subscribe({
        next: (res: any) => {
          this.customerAddressDrp = res['table'] || [];
          this.contactDrp = res['table1'] || [];
          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => {
          if (err.status == 403) {
            this.Customvalidation.loginroute(err.status);
          }
        }
      });
  }

  getcontactdetails() {
    let customerId = this.opportunityDetails.get(`customer`)?.value;
    let addressId = this.opportunityDetails.get(`customerAddress`)?.value;
    if (!customerId || !addressId) return;
    this.userService
      .getQuestionPaper(`uspGetOpportunityDetails|action=CUSTOMERDETAILS|customerId=${customerId}|customerAddId=${addressId}`)
      .subscribe({
        next: (res: any) => {
          this.contactDrp = res['table1'] || [];
          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => {
          if (err.status == 403) {
            this.Customvalidation.loginroute(err.status);
          }
        }
      });
  }

  getItem(event: any) {
    const priceListId = event?.value || 0;
    const customerId = this.opportunityDetails.get('customer')?.value || 0;

    console.log('getItem called with:', { priceListId, customerId, event });

    if (!priceListId) {
      console.warn('No priceListId provided');
      return of(void 0);
    }

    if (!customerId) {
      console.warn('No customerId available');
      this.openAlertDialog('Alert!', 'Please select a customer first!');
      return of(void 0);
    }

    return this.userService
      .getQuestionPaper(
        `uspGetOpportunityDetails|action=ITEM|customerId=${customerId}|priceListId=${priceListId}`
      )
      .pipe(
        tap((res: any) => {
          console.log('getItem API response:', res);
          const newItems = (res?.table || []).map((item: any) => ({
            drpValue: item.drpValue,
            drpOption: item.drpOption,
            itemCodeId: item.itemCodeId
          }));

          if (this.itemsDetailsChildData.length > 0) {
            const existingItemIds = new Set(
              this.itemsDetailsChildData.map(item => item.itemId)
            );

            this.itemListTableDataArray = newItems.filter(
              (item: any) => !existingItemIds.has(item.drpValue)
            );
          } else {
            this.itemListTableDataArray = newItems;
          }
          console.log('Updated itemListTableDataArray:', this.itemListTableDataArray); // Debug log
          this.itemsDetails.patchValue({
            item: null,
            quantity: 1,
            unitPrice: 0,
            totalPrice: 0
          });

          this.cdr.detectChanges();
        }),
        catchError((err: HttpErrorResponse) => {
          console.error('getItem API error:', err);
          if (err.status == 403) {
            this.Customvalidation.loginroute(err.status);
          } else {
            this.openAlertDialog('Error!', 'Failed to load items. Please try again.');
          }
          return of(void 0);
        })
      );
  }

  getUnitPrice(event: any) {
    const itemId = event?.value || 0;
    const priceListId = this.itemsDetails.get('priceList')?.value || 0;
    this.userService
      .getQuestionPaper(
        `uspGetOpportunityDetails|action=ITEMPRICE|itemId=${itemId}|priceListId=${priceListId}`
      )
      .subscribe({
        next: (res: any) => {
          const row = res?.table?.[0];
          this.itemsDetails.patchValue({
            unitPrice: row ? row.unitPrice : 0,
            quantity: 1,
            totalPrice: row ? row.unitPrice : 0,
          });
          this.calculateTotal();
          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => {
          if (err.status == 403) {
            this.Customvalidation.loginroute(err.status);
          }
        }
      });
  }

  getPriceList() {
    const customerValue = this.opportunityDetails.get('customer')?.value || 0;
    this.userService
      .getQuestionPaper(
        `uspGetOpportunityDetails|action=PRICELIST|customerId=${customerValue}|districtId=${sessionStorage.getItem(
          'District'
        )}`
      )
      .subscribe({
        next: (res: any) => {
          this.priceListTableData = res['table'] || [];
        },
        error: (err: HttpErrorResponse) => {
          if (err.status == 403) {
            this.Customvalidation.loginroute(err.status);
          }
        }
      });
  }

  onCustomerChange(event: any) {
    this.getPriceList();
  }
  onPriceListChange(event: any) {
    console.log('Price list changed:', event);

    if (!event || !event.value) {
      console.warn('No price list value in event');
      return;
    }
    const customerId = this.opportunityDetails.get('customer')?.value;
    if (!customerId) {
      this.openAlertDialog('Alert!', 'Please select a customer first!');
      this.itemsDetails.patchValue({ priceList: null });
      return;
    }
    this.itemsDetails.patchValue({
      item: null,
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0
    });
    this.itemListTableDataArray = [];
    this.getItem(event).subscribe({
      next: () => {
        console.log('Items loaded successfully');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading items:', err);
      }
    });
  }


  getItemName(itemId: any): string {
    if (!itemId || !this.itemListTableDataArray.length) return '';
    const item = this.itemListTableDataArray.find(x => x.drpValue === itemId);
    return item ? item.drpOption : '';
  }

  getSumOfRow(dataArray: any[], key: string): number {
    return dataArray.reduce(
      (sum, item) => sum + (Number(item[key]) || Number(item.totalPrice) || 0),
      0
    );
  }

  calculateOpportunityTotal() {
    const childTotal = this.itemsDetailsChildData.reduce(
      (sum, item) => sum + (Number(item.itemTotalPrice) || Number(item.totalPrice) || 0),
      0
    );
    const currentRowTotal = Number(this.itemsDetails.get('totalPrice')?.value) || 0;
    const grandTotal = childTotal + currentRowTotal;
    this.itemsDetails.get('totalAmount')?.setValue(grandTotal);
  }

  totalPriceVal(event: any) {
    const quantity = Number(event?.target?.value || event?.value) || 0;
    const unitPrice = this.itemsDetails.get('unitPrice')?.value || 0;
    const total = quantity * unitPrice;
    this.itemsDetails.patchValue({ totalPrice: total });
    this.calculateOpportunityTotal();
  }

  calculateTotal() {
    const qty = Number(this.itemsDetails.get('quantity')?.value) || 0;
    const price = Number(this.itemsDetails.get('unitPrice')?.value) || 0;
    const total = qty * price;
    this.itemsDetails.get('totalPrice')?.setValue(total);
    this.calculateOpportunityTotal();
  }


  onChangeStage() {
    const stageVal = this.stageForm.get('stage')?.value;
    if (stageVal != null && stageVal !== '') {
      const filterStage = this.stageTableData.find(
        (item: any) => String(item.drpValue) === String(stageVal)
      );
      const progressId = filterStage?.progressId ?? null;
      const probValue = progressId != null
        ? this.resolveValue(this.probTableData, progressId)
        : '';
      this.stageForm.get('probability')?.setValue(probValue ?? '');
    } else {
      this.stageForm.get('probability')?.setValue('');
    }
  }


  AddRow(formName: string) {
    if (formName === 'itemsDetails') {
      if (this.itemsDetails.invalid) {
        this.itemsDetails.markAllAsTouched();
        return;
      }

      const val = this.itemsDetails.getRawValue();
      if (val.quantity <= 0) {
        this.openAlertDialog('Error', 'Quantity should be greater than 0!');
        return;
      }

      const selectedItemObj = this.itemListTableDataArray.find(
        (x) => x.drpValue === val.item
      );
      const itemName = selectedItemObj ? selectedItemObj.drpOption : '';
      const itemCodeId = selectedItemObj ? selectedItemObj.itemCodeId : 0;

      this.itemsDetailsChildData.push({
        itemCodeId: itemCodeId,
        itemId: val.item,
        itemVal: itemName,
        itemDetail: val.details || '',
        itemQty: val.quantity,
        itemUnitPrice: val.unitPrice,
        itemTotalPrice: val.totalPrice,
        opportunityChildId: 0,
        priceListId: val.priceList,
        material: itemName,
        quantity: val.quantity,
        unitPrice: val.unitPrice,
        totalPrice: val.totalPrice,
      });

      const grandTotal = this.itemsDetailsChildData.reduce(
        (sum, item) => sum + (Number(item.itemTotalPrice) || Number(item.totalPrice) || 0),
        0
      );
      this.itemsDetails.get('totalAmount')?.setValue(grandTotal);

      this.itemListTableDataArray = this.itemListTableDataArray.filter(
        item => item.drpValue !== val.item
      );

      this.itemsDetails.patchValue({
        item: null,
        quantity: 1,
        unitPrice: 0,
        totalPrice: 0,
        details: '',
      });
      this.itemsDetails.markAsUntouched();
    } else if (formName === 'attachmentDetail') {
      if (this.attachmentDetail.invalid || !this.selectedAttachmentFile) {
        this.attachmentDetail.markAllAsTouched();

        if (!this.selectedAttachmentFile) {
          this.openAlertDialog('Alert!', 'Please select an attachment file!');
        }
        return;
      }

      this.isUploadingAttachment = true;

      const filesArray: File[] = [this.selectedAttachmentFile];
      const folderName = 'OpportunityAttachments';

      this.userService.MastrtfileuploadNew(filesArray, folderName).subscribe({
        next: (datacom: any) => {
          this.isUploadingAttachment = false;

          const resultarray = datacom.split("-");

          if (resultarray[0] === "1") {
            let uploadedUrl = resultarray[1].toString();
            uploadedUrl = this.normalizeImagePath(uploadedUrl);
            const val = this.attachmentDetail.value;
            const obj = {
              documentType: val.documentType || '',
              documentName: this.selectedAttachmentFile
                ? this.selectedAttachmentFile.name
                : '',
              documentDetails: val.documentDetails || '',
              uploadFile: uploadedUrl
            };

            this.attachmentDetailArray.push(obj);

            this.openAlertDialog('Success!', 'Attachment uploaded and added successfully.');

            this.attachmentDetail.reset();
            this.clearAttachmentSelection();
          } else {
            this.openAlertDialog('Error!', resultarray[1].toString());
          }

          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => {
          this.isUploadingAttachment = false;

          if (err.status === 401) {
            this.openAlertDialog('Error!', "You are not authorized!");
          } else if (err.status === 403) {
            this.Customvalidation.loginroute(err.status);
          } else {
            this.openAlertDialog('Error!', err.message || 'Server Error');
          }

          this.cdr.detectChanges();
        }
      });
    } else if (formName === 'nextFollowUp') {
      if (this.nextFollowUp.invalid) {
        this.nextFollowUp.markAllAsTouched();
        return;
      }

      const meetingModeId = this.nextFollowUp.get('meetingMode')?.value || 0;
      const meetingModeText =
        this.meetingModeDrop.find(item => item.drpValue == meetingModeId)?.drpOption || '';
      const followupDateValue = this.nextFollowUp.get('nextFollowUpDate')?.value;
      const meetingDateValue = this.nextFollowUp.get('meetingDate')?.value;
      this.followUpArray.push({
        followupId: 0,
        followupDate: followupDateValue,
        description: this.nextFollowUp.get('description')?.value || '',
        meetingDate: meetingDateValue,
        meetingModeId: meetingModeId,
        meetingMode: meetingModeText,
        remarks: this.nextFollowUp.get('remarks')?.value || '',
      });
      this.nextFollowUp.reset();
      this.nextFollowUp.markAsUntouched();

      this.openAlertDialog('Success!', 'Follow-up entry added successfully.');
    }
  }

  deleteChildTableRow(arg1: any, arg2?: number) {
    if (typeof arg1 === 'number') {
      const deletedItem = this.itemsDetailsChildData[arg1];
      if (deletedItem?.itemId) {
        const exists = this.itemListTableDataArray.find(item => item.drpValue === deletedItem.itemId);
        if (!exists && deletedItem.material) {
          this.itemListTableDataArray.push({
            drpValue: deletedItem.itemId,
            drpOption: deletedItem.material || deletedItem.itemVal,
            itemCodeId: deletedItem.itemCodeId
          });
        }
      }
      this.itemsDetailsChildData.splice(arg1, 1);
      this.calculateOpportunityTotal();

      if (this.itemsDetailsChildData.length === 0) {
        this.itemsDetails.patchValue({
          priceList: '',
          totalAmount: 0
        });
      }
    } else if (typeof arg1 === 'string' && arg2 !== undefined) {
      if (arg1 === 'followUpArray') {
        this.followUpArray.splice(arg2, 1);
      } else if (arg1 === 'attachmentDetailArray') {
        this.attachmentDetailArray.splice(arg2, 1);
      }
    }
  }


  patchAllForms(data: any) {
    if (!data) return;
    setTimeout(() => {
      this.opportunityDetails.patchValue({
        subject: data.opportunityName || '',
        opportunityType: data.opportunityTypeId ?? '',
        lead: data.leadId ?? '',
        customerType: data.orgTypeId ?? '',
        customer: data.customerId ?? '',
        source: data.sourceId ?? '',
        expectedDate: this.parseDate(data.expectedDate),
        assignedTo: data.assignedToId ?? '',
        customerAddress: data.custAddId ?? '',
        contactDetails: data.contactId ?? '',
      });

      const customerId = data.customerId ?? '';
      const addressId = data.custAddId ?? '';
      if (customerId && addressId) {
        this.userService
          .getQuestionPaper(
            `uspGetOpportunityDetails|action=CUSTOMERDETAILS|customerId=${customerId}|customerAddId=${addressId}`
          )
          .subscribe({
            next: (res: any) => {
              setTimeout(() => {
                this.contactDrp = res['table1'] || [];
                this.opportunityDetails.patchValue({ contactDetails: data.contactId ?? '' });
                this.cdr.detectChanges();
              }, 0);
            },
            error: (err: HttpErrorResponse) => {
              if (err.status == 403) {
                this.Customvalidation.loginroute(err.status);
              }
            }
          });
      }

      this.itemsDetails.patchValue({
        priceList: data.priceListId ?? '',
      });

      this.stageForm.patchValue({
        stage: data.statusId ?? '',
        probability: data.probabilityId ?? '',
      });

      this.notes.patchValue({
        Notes: data.notes || '',
      });
      try {
        const parsedItems =
          typeof data.itemDetails === 'string'
            ? JSON.parse(data.itemDetails || '[]')
            : data.itemDetails || [];

        this.itemsDetailsChildData = parsedItems.map((item: any) => {
          const itemId = item.materialId ?? item.itemId ?? 0;
          const itemVal = item.material ?? item.itemVal ?? '';
          const itemQty = Number(item.quantity ?? item.itemQty ?? 0);
          const itemUnitPrice = Number(item.unitPrice ?? item.itemUnitPrice ?? 0);
          const itemTotalPrice = Number(item.totalPrice ?? item.itemTotalPrice ?? 0);

          const dropdownMatch = this.itemListTableDataArray.find(
            (x: any) => x.drpValue == itemId
          );

          const resolvedItemCodeId = dropdownMatch
            ? dropdownMatch.itemCodeId
            : item.itemCodeId ?? 0;

          return {
            itemCodeId: resolvedItemCodeId,
            itemId: itemId,
            itemVal: itemVal,
            itemDetail: item.itemDetail ?? '',
            itemQty: itemQty,
            itemUnitPrice: itemUnitPrice,
            itemTotalPrice: itemTotalPrice,
            opportunityChildId: item.opportunityChildId ?? 0,
            priceListId: item.priceListId ?? data.priceListId ?? 0,
            material: itemVal,
            quantity: itemQty,
            unitPrice: itemUnitPrice,
            totalPrice: itemTotalPrice,
          };
        });
      } catch {
        this.itemsDetailsChildData = [];
      }
      const computedTotal = this.itemsDetailsChildData.reduce(
        (sum, item) => sum + (Number(item.itemTotalPrice) || Number(item.totalPrice) || 0),
        0
      );
      this.itemsDetails.get('totalAmount')?.setValue(computedTotal);
      try {
        this.stageTableArray =
          typeof data.opportunityStageHistory === 'string'
            ? JSON.parse(data.opportunityStageHistory || '[]')
            : data.opportunityStageHistory || [];
      } catch {
        this.stageTableArray = [];
      }
      try {
        const parsedFollowUp =
          typeof data.opportunityFollowup === 'string'
            ? JSON.parse(data.opportunityFollowup || '[]')
            : data.opportunityFollowup || [];

        this.followUpArray = parsedFollowUp.map((f: any) => {
          const followupDate = f.followupDate ? this.parseDate(f.followupDate) : null;
          const meetingDate = f.meetingDate ? this.parseDate(f.meetingDate) : null;

          return {
            followupId: f.followupId,
            followupDate: followupDate,
            description: f.description || '',
            meetingDate: meetingDate,
            meetingModeId: f.meetingModeId ?? 0,
            meetingMode: f.meetingMode || '',
            remarks: f.remarks || '',
          };
        });
      } catch (e) {
        console.error('Error parsing follow-up data:', e);
        this.followUpArray = [];
      }

      try {
        const parsedDocs =
          typeof data.opportunityDocs === 'string'
            ? JSON.parse(data.opportunityDocs || '[]')
            : data.opportunityDocs || [];

        this.attachmentDetailArray = parsedDocs.map((doc: any) => ({
          documentType: doc.documentType,
          documentName: doc.documentName,
          documentDetails: doc.documentDetails || '',
          uploadFile: doc.uploadFile || doc.documentDetails,
        }));
      } catch {
        this.attachmentDetailArray = [];
      }

      this.cdr.detectChanges();
    }, 0);
  }


  OnSubmitModal() {
    if (this.opportunityDetails.invalid) {
      this.opportunityDetails.markAllAsTouched();
      this.scrollToFirstInvalidControl();
      return;
    }

    if (this.opportunityDetails.get('opportunityType')?.value == '10001') {
      if (this.opportunityDetails.get('lead')?.value == '') {
        this.openAlertDialog('Alert!', 'Please select lead!');
        return;
      }
    }

    if (this.itemsDetailsChildData.length == 0) {
      this.openAlertDialog('Alert!', 'Please enter Item details!');
      this.paramvaluedata = '';
      return;
    }

    if (this.stageForm.invalid) {
      this.stageForm.markAllAsTouched();
      this.scrollToFirstInvalidControl();
      return;
    }
    if (this.postType == 'update') {
      const hasFormDate = this.nextFollowUp.get('nextFollowUpDate')?.value;
      const hasFollowUpEntries = this.followUpArray.length > 0;

      if (!hasFormDate && !hasFollowUpEntries) {
        this.nextFollowUp.markAllAsTouched();
        this.openAlertDialog('Alert!', 'Please enter at least one follow-up entry or select a Follow-up Date!');
        this.scrollToFirstInvalidControl();
        return;
      }
    } else {
      if (this.nextFollowUp.invalid) {
        this.nextFollowUp.markAllAsTouched();
        this.scrollToFirstInvalidControl();
        return;
      }
    }

    if (this.postType == 'update') {
      if (this.attachmentDetailArray.length == 0) {
        this.openAlertDialog('Alert!', 'Please enter attachment details!');
        this.paramvaluedata = '';
        return;
      }
    }

    const fVal = this.opportunityDetails.getRawValue();
    const fmtDate = (d: any) => (d ? this.datePipe.transform(d, 'yyyy-MM-dd') : '');

    const subject = fVal.subject;
    const opportunityTypeId = fVal.opportunityType;
    const leadId = fVal.lead || 0;
    const customerType = fVal.customerType;
    const customer = fVal.customer;
    const customerAddres = fVal.customerAddress;
    const contactDetails = fVal.contactDetails;
    const source = fVal.source;
    const rawStage = this.stageForm.getRawValue();
    const probability = rawStage.probability;
    const stage = rawStage.stage;
    const expectedDate = fmtDate(fVal.expectedDate);
    const assignedTo = fVal.assignedTo;
    const rawItems = this.itemsDetails.getRawValue();
    const priceList = rawItems.priceList;
    const totalAmount = rawItems.totalAmount;
    const itemJson = this.itemsDetailsChildData;
    const notes = this.notes.value.Notes;

    let followUpDate = '';
    let followUpDescription = '';
    let remarks = '';
    let meetingModeId = 0;
    let meetingDate = '';
    let followUpJson: any[] = [];

    if (this.postType === 'add') {
      followUpDate = fmtDate(this.nextFollowUp.get('nextFollowUpDate')?.value) || '';
      followUpDescription = this.nextFollowUp.get('description')?.value || '';
      remarks = this.nextFollowUp.get('remarks')?.value || '';
      meetingModeId = Number(this.nextFollowUp.get('meetingMode')?.value) || 0;
      meetingDate = fmtDate(this.nextFollowUp.get('meetingDate')?.value) || '';

      followUpJson = [{
        followupId: 0,
        followupDate: followUpDate,
        description: followUpDescription,
        meetingDate: meetingDate,
        meetingModeId: meetingModeId,
        remarks: remarks
      }];
    } else {
      // Update mode
      followUpDescription = this.nextFollowUp.get('description')?.value || '';
      remarks = this.nextFollowUp.get('remarks')?.value || '';
      meetingModeId = Number(this.nextFollowUp.get('meetingMode')?.value) || 0;
      meetingDate = fmtDate(this.nextFollowUp.get('meetingDate')?.value) || '';

      if (this.followUpArray.length > 0) {
        // Use the follow-up array entries
        followUpJson = this.followUpArray.map(entry => ({
          followupId: entry.followupId || 0,
          followupDate: fmtDate(entry.followupDate) || '',
          description: entry.description || '',
          meetingDate: fmtDate(entry.meetingDate) || '',
          meetingModeId: entry.meetingModeId || 0,
          remarks: entry.remarks || ''
        }));

        // Determine the followUpDate to send
        const formDate = fmtDate(this.nextFollowUp.get('nextFollowUpDate')?.value);
        if (formDate) {
          // If user entered a new date in the form, use it
          followUpDate = formDate;
        } else {
          // Otherwise, use the last entry's date from the array
          const lastEntry = this.followUpArray[this.followUpArray.length - 1];
          followUpDate = fmtDate(lastEntry?.followupDate) || String(lastEntry?.followupDate || '');
        }
      } else {
        // No array entries, must have form date (already validated above)
        followUpDate = fmtDate(this.nextFollowUp.get('nextFollowUpDate')?.value) || '';
        followUpJson = [{
          followupId: 0,
          followupDate: followUpDate,
          description: followUpDescription,
          meetingDate: meetingDate,
          meetingModeId: meetingModeId,
          remarks: remarks
        }];
      }
    }

    this.paramvaluedata = `opportunityName=${subject}|opportunityTypeId=${opportunityTypeId}|leadId=${leadId}|employeeId=${assignedTo}|orgType=${customerType}|customer=${customer}|custAdd=${customerAddres}|contact=${contactDetails}|source=${source}|probability=${probability}|stage=${stage}|expectedDate=${expectedDate}|priceList=${priceList}|amount=${totalAmount}|itemJson=${JSON.stringify(itemJson)}|followUpDate=${followUpDate}|notes=${notes}|followUpJson=${JSON.stringify(followUpJson)}`;

    this.confirmationService.confirm({
      message: 'Are you sure you want to proceed?',
      header: 'Confirm?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.submitcall(),
    });
  }

  submitcall() {
    this.isLoading = true;
    const roleId = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
    const userId = sessionStorage.getItem('userId');
    const action = this.postType == 'update' ? 'UPDATE' : 'INSERT';
    const oppId = this.selectedItem?.opportunityId || 0;
    const attachmentData = this.postType == 'update' ? JSON.stringify(this.attachmentDetailArray) : '';
    const query = `action=${action}|attachment=${attachmentData}|opportunityId=${oppId}|${this.paramvaluedata}|appUserId=${userId}|appUserRole=${roleId}`;

    this.userService
      .SubmitPostTypeData('uspPostOpportunitiesDetails', query, this.FormName)
      .subscribe({
        next: (datacom: any) => {
          this.isLoading = false;
          if (typeof datacom === 'string') {
            const resultarray = datacom.split("-");
            if (resultarray[1] === "success") {
              this.closeDrawer();
              this.getViewData(false);
              this.openAlertDialog('Success!', this.postType == 'update' ? 'Data Updated Successfully.' : 'Data Saved Successfully.');

              if (this.postType == 'update') {
                this.closeDrawer();
              } else {
                this.resetAllForms();
              }
            } else if (resultarray[0] === "2") {
              this.openAlertDialog('Alert!', resultarray[1]);
            } else if (datacom === "Error occured while processing data!--error") {
              this.openAlertDialog('Alert!', 'Something went wrong!');
            } else {
              this.openAlertDialog('Alert!', datacom);
            }
          } else {
            const msg = datacom.message || datacom.toString();
            if (msg && msg.toLowerCase().includes('error')) {
              this.openAlertDialog('Error!', msg.replace('--error', ''));
            } else {
              this.openAlertDialog('Success!', this.postType == 'update' ? 'Data Updated Successfully.' : 'Data Saved Successfully.');
              this.postType == 'update' ? this.closeDrawer() : this.resetAllForms();
              this.getViewData(false);
            }
          }
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
          if (err.status == 401) {
            this.openAlertDialog('Error!', "You are not authorized!");
          } else if (err.status == 403) {
            this.Customvalidation.loginroute(err.status);
          } else {
            this.openAlertDialog('Error!', err.message || 'Server Error');
          }
        },
      });
  }

  // ============= FULL SCREEN METHODS =============
  isFullScreen: boolean = false;
  toggleFullScreen(): void {
    this.isFullScreen = !this.isFullScreen;
  }

  getDrawerStyle(): { width: string } {
    return { width: this.isFullScreen ? '100vw' : '60vw' };
  }
  // ============= CLOSE WON/LOST METHODS =============

  closeWonAndLost(text: string) {
    this.lostAndWonTxt = text;
    this.confirmationService.confirm({
      message: `Are you sure you want to ${text}?`,
      header: 'Are You Sure?',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.submitCloseWonAndLost(),
    });
  }

  submitCloseWonAndLost() {
    const freezeStage = this.lostAndWonTxt == 'Close Won' ? 'Closed Won' : 'Closed Lost';
    this.isLoading = true;
    const query = `opportunityId=${this.selectedItem.opportunityId}|freezeStage=${freezeStage}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId}`;

    this.userService.SubmitPostTypeData(`uspPostOpportunitiesFreezeStatus`, query, this.FormName)
      .subscribe({
        next: (datacom: any) => {
          this.isLoading = false;
          if (typeof datacom === 'string') {
            const resultarray = datacom.split("-");
            if (resultarray[1] === "success") {
              this.getViewData(false);
              this.openAlertDialog('Success!', this.lostAndWonTxt == 'Close Won' ? 'Data Close Won Successfully.' : 'Data Close Lost Successfully.');
              this.closeDrawer();
            } else {
              this.openAlertDialog('Alert!', datacom);
            }
          }
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
          this.openAlertDialog('Error!', err.message || 'Server Error');
        }
      });
  }

  // ============= ATTACHMENT METHODS =============

  onAttachmentSelect(event: any) {
    if (event.files && event.files.length > 0) {
      this.selectedAttachmentFile = event.files[0];
      if (this.selectedAttachmentFile && this.isImage(this.selectedAttachmentFile.name)) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.attachmentPreviewUrl = e.target.result;
          this.cdr.detectChanges();
        };
        reader.readAsDataURL(this.selectedAttachmentFile);
      } else {
        this.attachmentPreviewUrl = null;
      }
      this.cdr.detectChanges();
    }
  }

  clearAttachmentSelection() {
    this.selectedAttachmentFile = null;
    this.attachmentPreviewUrl = null;
    if (this.attachmentUpload) {
      this.attachmentUpload.clear();
    }
    this.cdr.detectChanges();
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

  isImage(filename: string): boolean {
    if (!filename) {
      return false;
    }
    const cleanUrl = filename.split('?')[0];
    return /\.(jpeg|jpg|png|gif|bmp|svg)$/i.test(cleanUrl);
  }

  getFileName(path: string): string {
    return path.split(/[\/\\]/).pop() || '';
  }

  getFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  openPreview(url: string) {
    const fullUrl = this.normalizeImagePath(url);
    window.open(fullUrl, '_blank');
  }

  // ============= MASTER UPDATE METHODS =============

  openMasterUpdateDialog(tableName: string, header: string) {
    this.currentMasterTable = tableName;
    this.currentMasterHeader = header;
    this.newMasterText = '';
    this.masterUpdateVisible = true;
  }

  submitMasterData() {
    if (!this.newMasterText?.trim()) {
      this.openAlertDialog('Alert!', 'Please enter a value.');
      return;
    }
    this.masterUpdateVisible = false;
    this.newMasterText = '';
    this.openAlertDialog('Success!', 'Value saved.');
  }

  UpdateMasterCustom(tbname: string, heading: string) {
    this.sel = tbname;
    this.modalHeading = heading;
    this.openMasterUpdateDialog(tbname, heading);
  }

  // ============= ITEM DETAILS DIALOG =============

  showItemDetailsDialog(itemDetails: any) {
    this.selectedItemDetails = [];
    try {
      if (typeof itemDetails === 'string') {
        this.selectedItemDetails = JSON.parse(itemDetails);
      } else if (Array.isArray(itemDetails)) {
        this.selectedItemDetails = itemDetails;
      }
    } catch {
      this.selectedItemDetails = [];
    }
    this.itemDetailsVisible = true;
  }

  // ============= FORM RESET METHODS =============

  resetAllForms() {
    [
      this.opportunityDetails,
      this.itemsDetails,
      this.stageForm,
      this.nextFollowUp,
      this.notes,
      this.attachmentDetail,
    ].forEach((f) => f.reset());

    this.itemsDetailsChildData = [];
    this.attachmentDetailArray = [];
    this.followUpArray = [];
    this.itemListTableDataArray = [];
    this.itemsDetails.get('totalAmount')?.setValue(0);
    this.itemsDetails.get('unitPrice')?.setValue(0);
    this.itemsDetails.get('totalPrice')?.setValue(0);
    this.cdr.detectChanges();
  }

  closeDrawer() {
    this.visible = false;
    this.resetAllForms();
    this.cdr.detectChanges();
  }

  onDrawerHide() {
    this.initForm();
    this.cdr.detectChanges();
  }

  // ============= UTILITY METHODS =============

  openAlertDialog(summary: string, detail: string) {
    const sev = /error|alert/i.test(summary) ? 'error' : 'success';
    this.messageService.add({ severity: sev, summary, detail });
  }

  scrollToFirstInvalidControl() {
    setTimeout(() => {
      const firstInvalid = document.querySelector('.ng-invalid');
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        (firstInvalid as HTMLElement).focus();
      }
    }, 200);
  }

  isInvalid(controlName: string): boolean {
    const form = [
      this.opportunityDetails,
      this.itemsDetails,
      this.stageForm,
      this.nextFollowUp,
      this.attachmentDetail,
    ].find((f) => f?.get(controlName));
    const ctrl = form?.get(controlName);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  markAllFormsTouched() {
    [
      this.opportunityDetails,
      this.itemsDetails,
      this.stageForm,
      this.nextFollowUp,
      this.notes,
      this.attachmentDetail,
    ].forEach((f) => f?.markAllAsTouched());
  }

  toggle(
    section:
      | 'showOpportunity'
      | 'showItems'
      | 'showStage'
      | 'showNextFollowUp'
      | 'showNotes'
      | 'showAttachments'
  ) {
    (this as any)[section] = !(this as any)[section];
    this.cdr.detectChanges();
  }

  getLeadDrp(event: any) {
    const opportunityId = this.opportunityDetails.get('opportunityType')?.value;
    const ctrl = this.opportunityDetails.get('lead');
    if (opportunityId == '10000') {
      ctrl?.disable();
      ctrl?.setValue('');
    } else {
      ctrl?.enable();
    }

    this.userService
      .getQuestionPaper(
        `uspGetOpportunityDetails|action=LEAD|appUserId=${sessionStorage.getItem('userId')}`
      )
      .subscribe({
        next: (res: any) => {
          this.leadDrp = res['table'] || [];
          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => {
          if (err.status == 403) {
            this.Customvalidation.loginroute(err.status);
          }
        }
      });
  }
}