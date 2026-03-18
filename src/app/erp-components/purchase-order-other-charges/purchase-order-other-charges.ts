import { Component, ChangeDetectorRef, signal, ViewChild, ElementRef } from '@angular/core';
import { TableTemplate, TableColumn } from '../../table-template/table-template';
import { ButtonModule } from 'primeng/button';
import { Popover } from 'primeng/popover';
import { Tooltip } from "primeng/tooltip";
import { Dialog } from 'primeng/dialog';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
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
import { HttpErrorResponse } from '@angular/common/http';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { FileUploadModule } from 'primeng/fileupload';
import { ConfigService } from '../../shared/config.service';
import { OnlyNumberDirective } from '../../shared/directive/only-number.directive';
import { OnlyStringDirective } from '../../shared/directive/only-string.directive';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { TabsModule } from 'primeng/tabs';
import { ExcelService } from '../../shared/excel.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
declare var $: any;

@Component({
  selector: 'app-purchase-order-other-charges',
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
    OnlyNumberDirective,
    OnlyStringDirective,
    BreadcrumbModule,
    TabsModule,
    CheckboxModule
  ],
  providers: [
    ConfirmationService,
    MessageService,
    DatePipe,
    ExcelService
  ],
  templateUrl: './purchase-order-other-charges.html',
  styleUrl: './purchase-order-other-charges.scss'
})
export class PurchaseOrderOtherCharges {

  breadcrumbItems!: ({ label: any; disabled?: undefined; } | { label: any; disabled: boolean; })[];
  pageNo = 1;
  pageSize = 5;
  searchText = '';
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  menulabel: any;
  FormName: any;
  FormValue: any;
  param: string = '';
  isLoading = true;
  visible: boolean = false;
  postType: string = 'add';
  header: any = '';
  selectedIndex: any = [];
  headerIcon: string = 'pi pi-plus';
  paramvaluedata: string = '';
  isFormLoading: boolean = false;
  documentDrp: any;
  chargeTypeDrp: any;
  NatureDrp: any;
  otherChargesData: any = []
  POForm: FormGroup;
  itemDetailForm: FormGroup;
  isProccess: any = false;

  constructor(private fb: FormBuilder,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private message: MessageService,
    public Customvalidation: Customvalidation,
    private configService: ConfigService,
    private cdr: ChangeDetectorRef,
    private datePipe: DatePipe,
    private excelService: ExcelService,
    private sanitizer: DomSanitizer,
    private router: Router) { 
    
    this.POForm = fb.group({
      documentId: ['', [Validators.required]],
      invoiceNo: ['', [Validators.required]],
      invoiceDate: ['', [Validators.required]]
    })
    this.itemDetailForm = fb.group({
      chargesId: ['', [Validators.required]],
      natureId: ['', [Validators.required]],
      value: ['', [Validators.required]],
      remarks: ['']
    })
  }
  
  get f() {
    return this.POForm.controls;
  }
  get f1() {
    return this.itemDetailForm.controls;
  }

  ngOnInit(): void {
    this.param = sessionStorage.getItem('menuItem') ?? '';
    let paramjs = JSON.parse(this.param);
    this.menulabel = paramjs.menu;
    this.FormName = paramjs.formName;
    this.FormValue = paramjs.formValue;
    this.getDocumentNumber();
    this.getChargeType();
    this.getNature();
    this.breadcrumbItems = [
      { label: this.menulabel },
      { label: this.FormName, disabled: true }
    ];
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  getDocumentNumber() {
    try {
      this.userService.getQuestionPaper(`uspGetPOforInvoiceDrp|districtId=${sessionStorage.getItem('District')}`)
        .subscribe({
          next: (res: any) => {
            this.documentDrp = res?.table || [];
          },
          error: (err) => {
            console.error('Error while fetching document number:', err);
            this.documentDrp = [];
          }
        });
    } catch (error) {
      console.error('Unexpected error in getDocumentNumber:', error);
      this.documentDrp = [];
    }
  }


  getChargeType() {
    try {
      const roleData = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
      const roleId = roleData?.roleId || 0;
      const userId = sessionStorage.getItem('userId');

      this.userService
        .getQuestionPaper(
          `uspGetFillDrpDown|table=tblChargesTypeMaster|filterColumn=|filterValue=|appUserId=${userId}|appUserRole=${roleId}`
        )
        .subscribe({
          next: (res: any) => {
            this.chargeTypeDrp = res?.table ?? [];
          },
          error: (err) => {
            console.error('Error loading charge types', err);
            this.chargeTypeDrp = [];
          }
        });

    } catch (error) {
      console.error('Unexpected error in getChargeType()', error);
      this.chargeTypeDrp = [];
    }
  }


  getNature() {
    try {
      const roleData = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
      const roleId = roleData?.roleId || 0;
      const userId = sessionStorage.getItem('userId');

      this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblNatureOfChargesMaster|filterColumn=|filterValue=|appUserId=${userId}|appUserRole=${roleId}`)
        .subscribe({
          next: (res: any) => {
            this.NatureDrp = res?.table ?? [];
          },
          error: (err) => {
            console.error('Error while loading nature dropdown', err);
            this.NatureDrp = [];
          }
        });

    } catch (error) {
      console.error('Unexpected error in getNature()', error);
      this.NatureDrp = [];
    }
  }


  getOtherDtlTbl() {
    this.otherChargesData = []
    this.isFormLoading = true;
    let poId = this.POForm.get(`documentId`)?.value
    this.isFormLoading = true;
    this.userService.getQuestionPaper(`uspGetSelectedPurchaseOrderDetails|poId=${poId ? poId : 0}`).subscribe((res: any) => {
      if (res['table5'].length !== 0) {
        res['table5'].forEach((element:any) => {
          let objP = {
            id: element.id,
            chargesId: element.chargesId,
            charges: element.chargesId_Text,
            natureId: element.natureId,
            nature: element.natureId_Text,
            value: element.value,
            remarks: element.remarks,
            basic: element.basic,
          }
          this.otherChargesData.push(objP)
        });
        setTimeout(() => {
          this.isFormLoading = false;
        }, 1000)
      } else {
        this.otherChargesData = []
        setTimeout(() => {
          this.isFormLoading = false;
        }, 2000)
      }
    })
  }

  AddRow() {
    if (this.itemDetailForm.invalid) {
      this.itemDetailForm.markAllAsTouched();
      return
    }
    let obj = {
      chargesId: this.itemDetailForm.get(`chargesId`)?.value,
      charges: this.chargeTypeDrp.find((x: any) => x.drpValue === this.itemDetailForm.get('chargesId')?.value)?.drpOption ?? '',
      natureId: this.itemDetailForm.get(`natureId`)?.value,
      nature: this.NatureDrp.find((x: any) => x.drpValue === this.itemDetailForm.get('natureId')?.value)?.drpOption ?? '',
      value: this.itemDetailForm.get(`value`)?.value,
      remarks: this.itemDetailForm.get(`remarks`)?.value,
      basic: "false",
      id: 0
    }
    if (obj.value <= 0) {
      this.message.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please enter value.',
        life: 3000
      });
      return
    }
    this.otherChargesData.push(obj);
    this.itemDetailForm.reset()
    this.itemDetailForm.patchValue({
      chargesId: '',
      natureId: '',
      value: '',
      remarks: ''
    })
    setTimeout(() => {
      $("#chargeTypeId").selectpicker("refresh")
      $("#natureId").selectpicker("refresh")
    }, 100)
  }

  deleteOtherDtl(index:any) {
    this.otherChargesData.splice(index, 1)
  }

  allowOnlyNumbers(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  isInvalid(controlName: string): boolean {
    const forms: FormGroup[] = [
      this.POForm,
      this.itemDetailForm
    ];

    let isInvalid = false;

    for (let form of forms) {
      const control = form.get(controlName);
      if (control && control.invalid && (control.dirty || control.touched)) {
        isInvalid = true;
        break;
      }
    }

    return isInvalid;
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
      }
    });
  }

  OnSubmitModal() {
    if (this.POForm.invalid) {
      this.POForm.markAllAsTouched();
      return
    }
    if (this.otherChargesData.length == 0) {
      this.message.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Please add other charges details.',
        life: 3000
      });
      return
    }
    this.openConfirmation('Confirm?', "Are you sure you want to proceed?", '1', '1')

  }

  submitcall() {
    if (this.isProccess) {
      return;
    }
    try {
      this.isProccess = true;
      this.isFormLoading = true;

      const documentId = this.POForm.get('documentId')?.value;
      const invoiceNo = this.POForm.get('invoiceNo')?.value;
      const invoiceDate = this.datePipe.transform(this.POForm.get('invoiceDate')?.value,'yyyy-MM-dd');

      const query =
        `tblPurchOrdOtherCharges=${JSON.stringify(this.otherChargesData)}` +
        `|prchHeadId=${documentId}` +
        `|invoiceNo=${invoiceNo}` +
        `|invoiceDate=${invoiceDate}` +
        `|appUserId=${sessionStorage.getItem('userId')}`;

      this.userService.SubmitPostTypeData('uspPostPurOrderOtherCharge', query, this.FormName)
        .subscribe({
          next: (datacom: any) => {
            this.isProccess = false;
            this.isFormLoading = false;
            try {
              if (!datacom) {
                this.message.add({
                  severity: 'warn',
                  summary: 'Warning',
                  detail: 'Something went wrong!',
                  life: 3000
                });
                return;
              }
              const resultarray = datacom.split('-');
              if (resultarray[1] === 'success') {
                this.getDocumentNumber();
                this.message.add({
                  severity: 'success',
                  summary: 'Success',
                  detail: 'Data Saved Successfully.',
                  life: 3000
                });
                this.POForm.reset();
                this.POForm.patchValue({
                  documentId: '',
                  invoiceNo: '',
                  invoiceDate: ''
                });

                this.otherChargesData = [];
              }
              else if (resultarray[0] === '2') {
                this.message.add({
                  severity: 'warn',
                  summary: 'Warning',
                  detail: resultarray[1],
                  life: 3000
                });
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
            this.isProccess = false;
            this.isFormLoading = true;
            console.error('API call failed:', err);
            if (err.status === 401) {
              this.message.add({
                severity: 'error',
                summary: 'Error',
                detail: 'You are not authorized!',
                life: 3000
              });
              
            }
            else if (err.status === 403) {
              this.Customvalidation.loginroute(err.status);
            }
            else {
              this.message.add({
                severity: 'error',
                summary: 'Error',
                detail: err?.error?.message || 'Something went wrong.',
                life: 3000
              });
            }
          }
        });

    } catch (error) {
      this.isProccess = false;
      this.isFormLoading = false;

      console.error('Unexpected error in submitcall():', error);
      this.message.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Something went wrong.',
        life: 3000
      });
    }
  }




}
