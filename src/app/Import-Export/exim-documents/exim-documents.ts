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
  selector: 'app-exim-documents',
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
  templateUrl: './exim-documents.html',
  styleUrl: './exim-documents.scss'
})

export class EximDocuments {
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
  groupListArray1 = []


  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true, },
    // { key: 'courtCode', header: 'Sequance', isVisible: true, isSortable: false },
    { key: 'documentName', header: 'Document Name', isVisible: true, isSortable: false },
    { key: 'purpose', header: 'Purpose', isVisible: true, isSortable: false },
    { key: 'category', header: 'Category', isVisible: true, isSortable: false },
    { key: 'jsonDetails', header: 'Required By', isVisible: true, isSortable: false, isCustom: true },
    { key: 'jsonDetails1', header: 'Upload Portal', isVisible: true, isSortable: false, isCustom: true },
  ];

  pageNo = 1;
  pageSize = 5;
  searchText = '';
  totalCount = 0;
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  courtType = [];
  partyNamedrp = []
  stateNameDrp = []
  cityDrp = []
  itemDailog: boolean = false
  itemDailog1: boolean = false

  uploadMasterDrp = [];
  documentCategoryDrp = [];
  eximDocumentDrp = [];
  childArrData: any[] = [];
  childArrData1: any[] = [];

  constructor(private fb: FormBuilder,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private message: MessageService,
    public Customvalidation: Customvalidation,
    private cdr: ChangeDetectorRef) {

    this.groupMasterForm1 = this.fb.group({
      documentName: ['', [Validators.required, noInvalidPipelineName()]],
      purpose: ['', [Validators.required, noInvalidPipelineName()]],
      requiredBy: ['', Validators.required,],
      uploadPortal: ['', Validators.required],
      category: ['', Validators.required],
    });

  }

  get f() { return this.groupMasterForm1.controls }


  ngOnInit(): void {
    this.getTableData(true);
    this.GetUploadPortalMaster()
    this.GetEximDocumentCategory()
    this.GetEximDocument()
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  allowOnlyNumbers(event: KeyboardEvent) {
    const allowedKeys = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete'];
    if (allowedKeys.includes(event.key)) {
      return;
    }

    const regex = /^[0-9.]$/;
    if (!regex.test(event.key)) {
      event.preventDefault();
    }
  }

  GetUploadPortalMaster() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
    this.userService.getQuestionPaper(`uspGetUploadPortalMaster`).subscribe((res: any) => {
      this.uploadMasterDrp = res['table'];
    })

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }

  GetEximDocumentCategory() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
    this.userService.getQuestionPaper(`uspGetEximDocumentCategoryMaster`).subscribe((res: any) => {
      this.documentCategoryDrp = res['table'];
    })

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }


  GetEximDocument() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
    this.userService.getQuestionPaper(`uspGetEximDocumentMaster`).subscribe((res: any) => {
      this.eximDocumentDrp = res['table'];
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
      const query = `appUserId=${userId}|appUserRole=${JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId}|districtId=${sessionStorage.getItem('District') || ''}|searchText=${this.searchText}|pageIndex=${this.pageNo}|size=${this.pageSize}`;
      this.userService.getQuestionPaper(`uspGetEximDocuments|${query}`).subscribe({
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
    this.header =
      view === 'add' ? 'Add' : view === 'update' ? 'Update' : 'View';
    this.headerIcon =
      view === 'add' ? 'pi pi-plus' : view === 'update' ? 'pi pi-pencil' : 'pi pi-eye';

    if (view === 'add') {
      this.groupMasterForm1.reset();
      this.groupMasterForm1.enable();
      this.childArrData = [];
      this.childArrData1 = [];
    }
    else {
      if (view === 'view') {
        this.groupMasterForm1.disable();
      }
      else {
        this.groupMasterForm1.enable();
      }


      let customerTypes: any[] = [];
      let customerTypes1: any[] = [];
      try {
        const parsedRequired = JSON.parse(data?.requiredBy || '[]');
        customerTypes = parsedRequired.map((item: any) => ({
          drpOption: item.RequiredByText,
          drpValue: item.RequiredById,
        }));
      } catch (e) {
        console.error('Error parsing requiredBy', e);
      }

      try {
        const parsedUpload = JSON.parse(data?.uploadPortal || '[]');
        customerTypes1 = parsedUpload.map((item: any) => ({
          drpOption: item.uploadByText,
          drpValue: item.uploadId,
        }));
      } catch (e) {
        console.error('Error parsing uploadPortal', e);
      }

      // Patch form
      this.groupMasterForm1.patchValue({
        documentName: data.documentName || '',
        purpose: data.purpose || '',
        category: data.categoryId || '',
        requiredBy: customerTypes,
        uploadPortal: customerTypes1,
      });

      this.childArrData = customerTypes;
      this.childArrData1 = customerTypes1;
    }
    document.body.style.overflow = 'hidden'; // prevent background scroll
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
    const documentName = this.groupMasterForm1.get('documentName')?.value?.trim() || '';
    const purpose = this.groupMasterForm1.get('purpose')?.value?.trim() || '';
    let category = this.groupMasterForm1.get('category')?.value;
    const requiredBy = this.groupMasterForm1.get('requiredBy')?.value ?? [];
    const uploadPortal = this.groupMasterForm1.get('uploadPortal')?.value ?? [];

    if (requiredBy.length === 0) {
      this.message.add({
        severity: 'warn',
        summary: 'Warn',
        detail: 'Select at least one Customer Type'
      });
      return;
    }

    const requiredByCust = requiredBy.map((c: any) => ({
      requirId: c.drpValue
    }));


    if (uploadPortal.length === 0) {
      this.message.add({
        severity: 'warn',
        summary: 'Warn',
        detail: 'Select at least one Customer Type'
      });
      return;
    }

    const uploadPortalCust = uploadPortal.map((c: any) => ({
      uploadId: c.drpValue
    }));

    const requiredCustStr = JSON.stringify(requiredByCust);
    const uploadPortalCustStr = JSON.stringify(uploadPortalCust);
    this.paramvaluedata = `docName=${documentName}|purpose=${purpose}|categoryId=${category}|requiredByJson=${requiredCustStr}|uploadedByJson=${uploadPortalCustStr}`;
    this.openConfirmation('Confirm?', 'Are you sure you want to proceed?', '1', '1', event);
  }


  submitcall() {
    this.isFormLoading = true;
    let query = '';
    let SP = '';

    if (this.postType === 'update') {
      query = `${this.paramvaluedata}|Id=${this.selectedIndex.id}|userId=${sessionStorage.getItem('userId')}`;
      SP = `uspUpdateEximDocuments`;
    }
    else {
      query = `${this.paramvaluedata}|userId=${sessionStorage.getItem('userId')}`;
      SP = `uspPostEximDocumentDetails`;
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
    let query = `id=${this.selectedIndex.id}|userId=${sessionStorage.getItem('userId')}`;
    this.userService.SubmitPostTypeData(`uspDeleteEximDocuments`, query, 'header').subscribe((datacom: any) => {
      this.isFormLoading = false;
      if (!datacom) return;
      const resultarray = datacom.split("-");
      if (resultarray[1] === "success") {
        this.getTableData(true);
        this.message.add({ severity: 'success', summary: 'Success', detail: 'Data deleted' });
        this.onDrawerHide();
      }
      else {
        this.message.add({ severity: 'warn', summary: 'Warn', detail: resultarray[1] || datacom, });
      }
    });
  }


  showGrouplist(data: any) {
    this.itemDailog = true;
    try {
      const custArray = JSON.parse(data?.requiredBy || '[]');
      this.groupListArray = custArray.map((c: any) => ({
        RequiredByText: c.RequiredByText
      }));
    } catch (e) {
      console.error('Error parsing customerDetails', e);
      this.groupListArray = [];
    }
  }

  showGrouplist1(data: any) {
    this.itemDailog1 = true;
    try {
      const custArray = JSON.parse(data?.uploadPortal || '[]');
      this.groupListArray1 = custArray.map((c: any) => ({
        uploadByText: c.uploadByText
      }));
    } catch (e) {
      console.error('Error parsing customerDetails', e);
      this.groupListArray1 = [];
    }
  }



}
