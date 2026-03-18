import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ConfirmationService, MessageService } from 'primeng/api';

import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DrawerModule } from 'primeng/drawer';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { PopoverModule } from 'primeng/popover';
import { InputNumberModule } from 'primeng/inputnumber';

import { TableColumn, TableTemplate } from '../../table-template/table-template';
import { UserService } from '../../shared/user-service';
import { Customvalidation } from '../../shared/Validation';

@Component({
  selector: 'app-rt-pro-cleaning',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ToastModule,
    ConfirmDialogModule,
    SelectModule,
    BreadcrumbModule,
    ButtonModule,
    DrawerModule,
    DialogModule,
    InputTextModule,
    TableModule,
    TableTemplate,
    PopoverModule,
    InputNumberModule,
  ],
  templateUrl: './rt-pro-cleaning.html',
  styleUrl: './rt-pro-cleaning.scss',
  providers: [ConfirmationService, MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RtProCleaning implements OnInit {
  get breadcrumbItems(): any[] {
    return [{ label: 'Raise Ticket', routerLink: '/raise-ticket' }, { label: this.nameList || '' }];
  }

  visible = false;
  approvalDialogVisible = false;
  header = '';
  headerIcon = 'pi pi-ticket';
  postType: 'add' | 'update' | 'view' = 'add';
  approvalItemDetails: any[] = [];
  approvalAction: 'Approve' | 'Forward' | 'Reject' | null = null;
  approvalRemarksText: string = '';
  approvalRemarksInvalid = false;
  approvalDetailData: any = null;

  viewData: any[] = [];
  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true },
    { key: 'series', header: 'Series Number', isVisible: true, isSortable: false },
    { key: 'name', header: 'Raised By', isVisible: true, isSortable: false },
    { key: 'org', header: 'Organisation', isVisible: true, isSortable: false },
    { key: 'department', header: 'Department', isVisible: true, isSortable: false },

    { key: 'serviceCategory', header: 'Category', isVisible: true, isSortable: false },
    { key: 'subCategory', header: 'Sub Category', isVisible: true, isSortable: false },
    { key: 'subSubCategory', header: 'Sub Sub Category', isVisible: true, isSortable: false },

    { key: 'fleet', header: 'Fleet', isVisible: true, isSortable: false },
    { key: 'fleetDescription', header: 'Fleet Description', isVisible: true, isSortable: false },
    { key: 'fleetSeries', header: 'Fleet Series', isVisible: true, isSortable: false },

    { key: 'status', header: 'Status', isVisible: true, isSortable: false },
    { key: 'remarks', header: 'Remarks', isVisible: true, isSortable: false },
  ];

  isLoading = false;
  pageNo = 1;
  pageSize = 10;
  totalCount = 0;
  searchText = '';

  id: any;
  FormName = '';
  name = '';
  nameList: string = '';
  actitvityName: string = '';

  showOverview = true;
  showItems = true;

  categoryDrp: any[] = [];
  subCategoryDrp: any[] = [];
  requestTypeDrp: any[] = [];
  itemDrp: any[] = [];
  uomDrp: any[] = [];

  proCleaningForm!: FormGroup;
  itemForm!: FormGroup;
  itemFormApproval!: FormGroup;
  selectedRow: any = null;
  selectedItem: any = null;
  itemDetailsArray: any[] = [];
  selectedItemEdit: any = null;
  selectedEditIndex: number | null = null;
  approvalItemDetailJson: any[] = [];
  selectedItemEditApproval: any = null;
  selectedEditIndexApproval: number | null = null;
  historyDrawerVisible = false;
  approvalHistory: any[] = [];
  paramvaluedata: string = '';
  selectedAction: string = '';
  isValidremark: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private userService: UserService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private Customvalidation: Customvalidation,
    private cdr: ChangeDetectorRef
  ) {
    this.initForms();
  }

  ngOnInit(): void {
    const params = this.route.snapshot.queryParams;
    this.id = params['id'];
    this.FormName = params['formName'];
    this.name = `Raise Ticket - ${params['name']}`;
    this.nameList = params['name'];
    this.actitvityName = params['name'];

    this.getCategory();
    this.getPermission();
    this.getRequestType();
    this.getUomData();
    this.getTabelData();
  }

  initForms(): void {
    this.proCleaningForm = this.fb.group({
      category: [null, Validators.required],
      subCategory: [null, Validators.required],
      remarks: ['', Validators.required],
      requestType: [null, Validators.required],
    });

    this.itemForm = this.fb.group({
      item: [null, Validators.required],
      uom: [null, Validators.required],
      quantity: [null, [Validators.required, Validators.min(0.01)]],
    });

    this.itemFormApproval = this.fb.group({
      item: [{ value: null, disabled: true }],
      uom: [{ value: null, disabled: true }],
      quantity: [null, [Validators.required, Validators.min(0.01)]],
    });
  }

  isCreator: boolean = false;
  selectedRequest: string = 'pending';
  allViewTableData: any[] = [];
  wfLevel: any;
  isApprove: number = 0;
  isForward: number = 0;
  isReject: number = 0;
  isReturn: number = 0;
  isSave: number = 0;

  getTabelData(): void {
    if (!this.isLoading) {
      this.isLoading = true;
      this.cdr.markForCheck();
    }

    let userRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
    let procedure =
      this.selectedRequest == 'pending'
        ? 'uspGetRaiseOrgTicketPending'
        : 'uspGetRaiseOrgTicketProcessed';
    let query = `appUserId=${sessionStorage.getItem('userId')}|districtId=${sessionStorage.getItem(
      'District'
    )}|searchText=${this.searchText || ''}|pageIndex=${Number(this.pageNo)}|size=${Number(
      this.pageSize
    )}|appUserRole=${userRole}|activity=${this.actitvityName}`;

    this.userService.getQuestionPaper(`${procedure}|${query}`).subscribe({
      next: (res: any) => {
        const rawData = res['table1'] || [];

        this.allViewTableData = rawData.map((e: any, idx: number) => {
          let approvalDetail = [];
          try {
            approvalDetail = e.approvalDetail ? JSON.parse(e.approvalDetail) : [];
          } catch {
            approvalDetail = [];
          }
          return {
            ...e,
            approvalDetail,
            rowNo: (this.pageNo - 1) * this.pageSize + idx + 1,
            category: e.subCategory || '',
            subCategory: e.subSubCategory || '',
            requestType: e.requestType || '',
          };
        });

        this.viewData = [...this.allViewTableData];
        this.totalCount =
          res['table']?.[0]?.totalCount ??
          res['table']?.[0]?.totalCnt ??
          this.allViewTableData.length;

        if (res['table4'] && res['table4'].length) {
          this.isCreator = res['table4'][0]['wfLevel'] === 'Creator';
        } else {
          this.isCreator = false;
        }

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.viewData = [];
        this.allViewTableData = [];
        this.totalCount = 0;
        if (err.status === 403) {
          this.Customvalidation.loginroute(err.status);
        }
        this.cdr.detectChanges();
      },
    });
  }

  getPermission() {
    let roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
    this.userService
      .getQuestionPaper(
        `uspGetPermissionByactivity_role|actitvityName=${
          this.actitvityName
        }|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${roleID}`
      )
      .subscribe(
        (res: any) => {
          if (res['table'].length !== 0) {
            this.wfLevel = res['table'][0]['wfLevel'];
            this.isApprove = res['table'][0]['wfApprove'];
            this.isForward = res['table'][0]['wfForword'];
            this.isReject = res['table'][0]['wfReject'];
            this.isReturn = res['table'][0]['wfReturn'];
            this.isSave = res['table'][0]['wfSave'];
          } else {
            this.wfLevel = '';
            this.isApprove = 0;
            this.isForward = 0;
            this.isReject = 0;
            this.isReturn = 0;
            this.isSave = 0;
          }
        },
        (err: HttpErrorResponse) => {
          if (err.status == 403) {
            this.Customvalidation.loginroute(err.status);
          }
        }
      );
  }

  getCategory(): void {
    const districtId = sessionStorage.getItem('District') || '';
    this.userService
      .getQuestionPaper(
        `uspGetMasterDataRaiseTicket|districtId=${districtId}|action=TICKETSUBCATEGORY|id=${this.id}`
      )
      .subscribe({
        next: (res: any) => {
          this.categoryDrp = res['table'] || [];
          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 403) {
            this.Customvalidation.loginroute(err.status);
          }
        },
      });
  }

  getSubCategory(categoryId: number): void {
    const districtId = sessionStorage.getItem('District') || '';
    this.userService
      .getQuestionPaper(
        `uspGetMasterDataRaiseTicket|districtId=${districtId}|action=TICKETSUBSUBCATEGORY|id=${categoryId}`
      )
      .subscribe({
        next: (res: any) => {
          this.subCategoryDrp = res['table'] || [];
          this.proCleaningForm.patchValue({ subCategory: null });
          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 403) {
            this.Customvalidation.loginroute(err.status);
          }
        },
      });
  }

  getRequestType(): void {
    this.userService
      .getQuestionPaper(
        'uspGetFillDrpDown|table=tblMaterialIndentTypeMaster|filterColumn=|filterValue='
      )
      .subscribe({
        next: (res: any) => {
          this.requestTypeDrp = (res.table || []).filter(
            (item: any) => ![10003, 10002].includes(item.drpValue)
          );
          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error getting request type:', err);
          if (err.status === 403) {
            this.Customvalidation.loginroute(err.status);
          }
        },
      });
  }

  getItemsByRequestType(requestTypeId: number): void {
    this.userService
      .getQuestionPaper(`uspGetItemsByRequestType|IssueTypeID=${requestTypeId}`)
      .subscribe({
        next: (res: any) => {
          this.itemDrp = res['table'] || [];
          this.itemForm.patchValue({ item: null });
          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error getting items:', err);
          if (err.status === 403) {
            this.Customvalidation.loginroute(err.status);
          }
        },
      });
  }

  getUomData(): void {
    this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblUnitMaster`).subscribe({
      next: (res: any) => {
        this.uomDrp = res['table'] || [];
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error getting UOM:', err);
        if (err.status === 403) {
          this.Customvalidation.loginroute(err.status);
        }
      },
    });
  }

  showDialog(mode: 'add' | 'view' | 'update', item?: any): void {
    this.visible = true;
    this.proCleaningForm.reset();
    this.itemForm.reset();
    this.itemDetailsArray = [];
    this.selectedItemEdit = null;
    this.selectedEditIndex = null;
    this.proCleaningForm.enable();
    this.itemForm.enable();

    this.postType = mode;
    this.selectedRow = item || null;

    if (mode === 'add') {
      this.header = `Create Ticket for ${this.nameList}`;
      this.headerIcon = 'pi pi-plus';
    } else {
      this.header = mode === 'update' ? 'Update Ticket' : 'View Ticket';
      this.headerIcon = mode === 'update' ? 'pi pi-pencil' : 'pi pi-eye';
      if (item) {
        this.loadTicketForEdit(item, mode);
      }
    }
  }

  loadTicketForEdit(data: any, type: string): void {
    const categoryId = data.subCategoryId || data.categoryId || null;
    const subCategoryId = data.subSubCategoryId || data.subCategoryId || null;
    const requestTypeId = data.requestTypeId || null;
    const remarks = data.remarks || '';

    if (categoryId) {
      this.getSubCategory(categoryId);
    }

    if (requestTypeId) {
      this.getItemsByRequestType(requestTypeId);
    }

    try {
      this.itemDetailsArray = data.itemJson ? JSON.parse(data.itemJson) : [];
    } catch (e) {
      this.itemDetailsArray = [];
    }

    setTimeout(() => {
      this.proCleaningForm.patchValue({
        category: categoryId,
        subCategory: subCategoryId,
        requestType: requestTypeId,
        remarks: remarks,
      });
      this.cdr.detectChanges();
    }, 500);

    if (type === 'view') {
      this.proCleaningForm.disable();
      this.itemForm.disable();
    }
  }

  onDrawerHide(): void {
    this.visible = false;
    this.showOverview = true;
    this.showItems = true;
  }

  toggleOverview(): void {
    this.showOverview = !this.showOverview;
  }

  toggleItems(): void {
    this.showItems = !this.showItems;
  }

  onCategoryChange(event: any): void {
    const categoryId = event.value;
    this.proCleaningForm.patchValue({ subCategory: null });
    if (categoryId) {
      this.getSubCategory(categoryId);
    } else {
      this.subCategoryDrp = [];
    }
    this.cdr.detectChanges();
  }

  onSubCategoryChange(event: any): void {
    this.proCleaningForm.patchValue({ subCategory: event.value });
  }

  onRequestTypeChange(event: any): void {
    const requestTypeId = event.value;
    if (this.postType === 'update' && this.selectedRow) {
      this.getItemsByRequestType(requestTypeId);
      return;
    }

    if (this.itemDetailsArray.length === 0) {
      this.getItemsByRequestType(requestTypeId);
    } else {
      this.confirmationService.confirm({
        header: 'Confirm',
        message:
          'Material request can be done for one request type at a time. Do you really want to proceed?',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.itemDetailsArray = [];
          this.getItemsByRequestType(requestTypeId);
        },
      });
    }
  }

  isInvalid(controlName: string): boolean {
    const ctrl = this.proCleaningForm.get(controlName);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  isItemFormInvalid(controlName: string): boolean {
    const ctrl = this.itemForm.get(controlName);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  addItem(): void {
    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please fill all item fields',
      });
      return;
    }

    const formValue = this.itemForm.getRawValue();
    const item = this.itemDrp.find((i: any) => i.drpValue === formValue.item);
    const uom = this.uomDrp.find((u: any) => u.drpValue === formValue.uom);

    if (!formValue.quantity || formValue.quantity <= 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Quantity must be greater than 0',
      });
      return;
    }

    const obj = {
      itemId: formValue.item,
      item: item?.drpOption || '',
      itemCodeid: 0,
      itemCode: '',
      itemPrice: 0,
      makeId: 0,
      make: '',
      size: 0,
      uomId: formValue.uom,
      uom: uom?.drpOption || '',
      quantity: formValue.quantity,
      remarks: '',
    };

    if (this.selectedItemEdit && this.selectedEditIndex !== null) {
      this.itemDetailsArray[this.selectedEditIndex] = obj;
      this.selectedItemEdit = null;
      this.selectedEditIndex = null;
    } else {
      this.itemDetailsArray.push(obj);
    }

    this.itemForm.reset();
    this.cdr.detectChanges();
  }

  editItem(item: any, index: number): void {
    this.selectedItemEdit = item;
    this.selectedEditIndex = index;
    this.itemForm.patchValue({
      item: item.itemId || null,
      uom: item.uomId || null,
      quantity: item.quantity || null,
    });
    this.cdr.detectChanges();
  }

  deleteItem(index: number): void {
    this.confirmationService.confirm({
      header: 'Confirm Delete',
      message: 'Are you sure you want to remove this item?',
      icon: 'pi pi-trash',
      accept: () => {
        this.itemDetailsArray.splice(index, 1);
        this.cdr.detectChanges();
      },
    });
  }

  clearItemForm(): void {
    this.itemForm.reset();
    this.selectedItemEdit = null;
    this.selectedEditIndex = null;
    this.cdr.detectChanges();
  }

  onSubmitTicketForm(): void {
    if (this.proCleaningForm.invalid) {
      this.proCleaningForm.markAllAsTouched();
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please fill required fields',
      });
      return;
    }

    if (this.itemDetailsArray.length === 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please add at least one item',
      });
      return;
    }

    const isUpdate = this.postType === 'update';

    this.confirmationService.confirm({
      header: isUpdate ? 'Confirm Update' : 'Confirm',
      message: isUpdate ? 'Do you want to update this ticket?' : 'Do you want to submit ticket?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => this.submitTicketAfterConfirm(),
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Cancelled',
          detail: isUpdate ? 'Ticket update cancelled' : 'Ticket submission cancelled',
        });
      },
    });
  }

  submitTicketAfterConfirm(): void {
    const formValue = this.proCleaningForm.getRawValue();
    const userId = sessionStorage.getItem('userId') || '';
    const districtId = sessionStorage.getItem('District') || '';
    const roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId || '';

    const category = formValue.category;
    const subCategory = formValue.subCategory;
    const remarks = formValue.remarks;
    const requestType = formValue.requestType;
    const requestTypeText =
      this.requestTypeDrp.find((r: any) => r.drpValue === requestType)?.drpOption || '';

    const paramvaluedata = `requestTypeId=${requestType}|requestType=${requestTypeText}|fleetId=0|itemJson=${JSON.stringify(
      this.itemDetailsArray
    )}|districtId=${districtId}|serviceCatId=${
      this.id
    }|serviceSubCatId=${category}|serviceSubSubCatId=${subCategory}|issue=${remarks}|activity=${
      this.actitvityName
    }`;

    const ticketId = this.postType === 'update' && this.selectedRow ? this.selectedRow.id : 0;
    const query = `ticketId=${ticketId}|${paramvaluedata}|appUserId=${userId}|appUserRole=${roleID}|audio=`;
    const spName = 'uspPostRaiseOrgTicket';

    this.isLoading = true;
    this.cdr.markForCheck();

    this.userService.SubmitPostTypeData(spName, query, this.FormName).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        const response = String(res).trim();

        if (response.toLowerCase().startsWith('error occured while processing data')) {
          this.messageService.add({
            severity: 'error',
            summary: 'Server Error',
            detail: 'Ticket could not be processed. Please try again.',
          });
          this.cdr.detectChanges();
          return;
        }

        const resultarray = response.split('-');
        const code = (resultarray[0] || '').trim();
        const status = (resultarray[1] || '').trim().toLowerCase();
        const lowerResponse = response.toLowerCase();

        if (status === 'success' || code === '1' || lowerResponse.includes('success')) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail:
              resultarray.length > 2 && resultarray[2]
                ? resultarray.slice(2).join('-')
                : response || 'Ticket submitted successfully',
          });
          this.getTabelData();
          this.proCleaningForm.reset();
          this.itemForm.reset();
          this.itemDetailsArray = [];
          this.visible = false;
          this.selectedRow = null;
          this.cdr.detectChanges();
        } else if (code === '2' || lowerResponse.includes('warning')) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Warning',
            detail: resultarray[1] || 'Operation failed',
          });
          this.cdr.detectChanges();
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: response || 'Failed to submit ticket',
          });
          this.cdr.detectChanges();
        }
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        if (err.status === 401) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'You are not authorized!',
          });
        } else if (err.status === 403) {
          this.Customvalidation.loginroute(err.status);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.message || 'Failed to submit ticket',
          });
        }
        this.cdr.detectChanges();
      },
    });
  }

  onEdit(row: any): void {
    this.showDialog('update', row);
  }

  onView(row: any): void {
    this.showDialog('view', row);
  }

  onDeleteRow(row: any): void {
    if (!row) return;

    this.confirmationService.confirm({
      header: 'Confirm Delete',
      message: 'Are you sure you want to delete this ticket?',
      icon: 'pi pi-trash',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => this.deleteTicket(row),
    });
  }

  private deleteTicket(row: any): void {
    const userId = sessionStorage.getItem('userId') || '';
    const roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId || '';
    const ticketId = row.id || row.ticketId || 0;

    const paramvaluedata = `requestTypeId=0|requestType=|fleetId=0|itemJson=[]|districtId=${
      sessionStorage.getItem('District') || ''
    }|serviceCatId=${this.id}|serviceSubCatId=0|serviceSubSubCatId=0|issue=|activity=${
      this.actitvityName
    }`;
    const query = `ticketId=${ticketId}|${paramvaluedata}|appUserId=${userId}|appUserRole=${roleID}|audio=`;

    this.isLoading = true;
    this.cdr.markForCheck();

    this.userService.SubmitPostTypeData('uspPostRaiseOrgTicket', query, this.FormName).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        const response = String(res).trim();
        const resultarray = response.split('-');

        if (resultarray[1] === 'success' || resultarray[0] === '1') {
          this.messageService.add({
            severity: 'success',
            summary: 'Deleted',
            detail: 'Ticket deleted successfully.',
          });
          this.getTabelData();
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: resultarray[1] || 'Failed to delete ticket.',
          });
        }
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;
        if (err.status === 403) {
          this.Customvalidation.loginroute(err.status);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.message || 'Failed to delete ticket.',
          });
        }
        this.cdr.detectChanges();
      },
    });
  }

  onChangeRequestTab(type: string): void {
    this.selectedRequest = type === 'pending' ? 'pending' : 'proceed';
    this.pageNo = 1;
    this.viewData = [];
    this.allViewTableData = [];
    this.isLoading = true;
    this.cdr.markForCheck();
    this.getTabelData();
  }

  openApprovalModal(item: any): void {
    this.selectedRow = item;
    this.selectedItem = item;
    this.approvalAction = null;
    this.approvalRemarksText = '';
    this.selectedItemEditApproval = null;
    this.selectedEditIndexApproval = null;
    this.approvalRemarksInvalid = false;

    // Get permissions for action buttons
    this.getPermission();

    // Parse itemJson to get item details
    let itemJson = [];
    if (item.itemJson) {
      try {
        itemJson =
          typeof item.itemJson === 'string'
            ? JSON.parse(item.itemJson || '[]')
            : item.itemJson || [];
      } catch (e) {
        itemJson = [];
      }
    }

    this.approvalItemDetailJson = itemJson;
    this.approvalItemDetails = itemJson;

    // Populate form with first item's values by default
    if (itemJson.length > 0) {
      const firstItem = itemJson[0];
      this.itemFormApproval.patchValue({
        item: firstItem.item || firstItem.itemName || '',
        uom: firstItem.uom || firstItem.uomName || '',
        quantity: firstItem.quantity || null,
      });
    } else {
      this.itemFormApproval.reset();
    }

    this.approvalDialogVisible = true;
    this.cdr.detectChanges();
  }

  onApprovalDialogHide(): void {
    this.approvalDialogVisible = false;
    this.approvalItemDetails = [];
    this.approvalItemDetailJson = [];
    this.approvalRemarksText = '';
    this.approvalRemarksInvalid = false;
    this.approvalDetailData = null;
    this.selectedItem = null;
    this.selectedItemEditApproval = null;
    this.selectedEditIndexApproval = null;
    this.itemFormApproval.reset();
  }

  setApprovalAction(action: 'Approve' | 'Forward' | 'Reject'): void {
    this.approvalAction = action;
    this.approvalRemarksInvalid = false;
  }

  getwfStatusId(action: string | null): number {
    if (!action) return 0;
    let code: number;
    switch (action) {
      case 'Approve':
        code = 1;
        break;
      case 'Forward':
        code = 6;
        break;
      case 'Reject':
        code = 3;
        break;
      case 'Return':
        code = 4;
        break;
      default:
        code = 0;
        break;
    }
    return code;
  }

  submitApproval(): void {
    if (!this.selectedRow || !this.approvalAction) return;

    const remarksRequired = this.approvalAction === 'Reject' || this.approvalAction === 'Forward';
    const hasRemarks = !!this.approvalRemarksText.trim();
    this.approvalRemarksInvalid = remarksRequired && !hasRemarks;
    if (this.approvalRemarksInvalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Remarks required',
        detail: 'Please enter reason/remarks before proceeding.',
      });
      return;
    }

    const confirmMsg =
      this.approvalAction === 'Forward'
        ? 'Are you sure you want to forward this ticket?'
        : this.approvalAction === 'Reject'
        ? 'Are you sure you want to reject this ticket?'
        : 'Are you sure you want to approve this ticket?';

    this.confirmationService.confirm({
      header: `${this.approvalAction || ''} Ticket`,
      message: confirmMsg,
      icon: 'pi pi-question-circle',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => this.performApproval(),
    });
  }

  private performApproval(): void {
    if (!this.selectedRow || !this.approvalAction) return;

    const id = this.selectedRow.id || this.selectedRow.ticketId || 0;
    const userId = sessionStorage.getItem('userId') || '';
    const roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId || '';

    const wfStatusId = this.getwfStatusId(this.approvalAction);
    const approvalRemarks = this.approvalRemarksText || this.approvalAction || '';
    const activity = this.actitvityName || '';
    const itemJson = JSON.stringify(this.approvalItemDetails || []);
    const paramvaluedata = `itemJson=${itemJson}|appUserId=${userId}|approvalRemarks=${approvalRemarks}|id=${id}|appUserRole=${roleID}|activity=${activity}|wfStatusId=${wfStatusId}`;

    this.isLoading = true;
    this.cdr.markForCheck();

    this.userService
      .SubmitPostTypeData('uspPostRaiseOrgTicketApproval', paramvaluedata, this.FormName)
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;

          if (response != '') {
            const resultArray = String(response).split('-');
            const lastIndex = resultArray.length - 1;
            const isSuccess =
              resultArray[lastIndex]?.toLowerCase() === 'success' ||
              resultArray[1]?.toLowerCase() === 'success';

            if (isSuccess) {
              let apiMessage = '';
              if (resultArray.length > 5) {
                const messageParts = resultArray
                  .slice(4, lastIndex)
                  .filter((part) => part && part.trim() !== '');
                apiMessage = messageParts.join(' ') || response;
              } else if (resultArray.length > 4) {
                apiMessage = resultArray[4] || response;
              } else {
                apiMessage = response;
              }

              this.getPermission();
              this.selectedRequest = 'proceed';
              this.pageNo = 1;
              this.viewData = [];
              this.allViewTableData = [];

              setTimeout(() => {
                this.messageService.add({
                  severity: this.approvalAction === 'Reject' ? 'warn' : 'success',
                  summary: this.approvalAction === 'Reject' ? 'Rejected' : 'Success',
                  detail:
                    apiMessage ||
                    (this.approvalAction === 'Forward'
                      ? 'Ticket forwarded successfully!'
                      : this.approvalAction === 'Reject'
                      ? 'You rejected this ticket.'
                      : 'Ticket approved successfully!'),
                });
                this.cdr.detectChanges();
              }, 500);

              this.getTabelData();
              this.onApprovalDialogHide();
            } else if (resultArray[0] === '2') {
              setTimeout(() => {
                this.messageService.add({
                  severity: 'warn',
                  summary: 'Warning',
                  detail: resultArray[1] || response,
                });
                this.cdr.detectChanges();
              }, 1000);
            } else {
              setTimeout(() => {
                this.messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: resultArray[1] || response || 'Failed to approve ticket',
                });
                this.cdr.detectChanges();
              }, 1000);
            }
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Something went wrong!',
            });
            this.cdr.detectChanges();
          }
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
          console.error('Approve error:', err);

          if (err.status === 401) {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'You are not authorized!',
            });
          } else if (err.status === 403) {
            this.Customvalidation.loginroute(err.status);
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail:
                err.error?.message?.toString() || 'Failed to approve ticket. Please try again.',
            });
          }

          this.cdr.detectChanges();
        },
      });
  }

  openHistoryModal(item: any): void {
    this.selectedRow = item;
    try {
      const historyRaw =
        item?.approvalDetail || item?.approvaldetail || item?.approvalHistory || '[]';
      this.approvalHistory =
        typeof historyRaw === 'string' ? JSON.parse(historyRaw || '[]') : historyRaw || [];
    } catch {
      this.approvalHistory = [];
    }

    this.historyDrawerVisible = true;
    this.cdr.detectChanges();
  }

  closeHistoryDrawer(): void {
    this.historyDrawerVisible = false;
    this.approvalHistory = [];
    this.cdr.detectChanges();
  }

  onsearchChange(search: string): void {
    this.searchText = search;
    this.pageNo = 1;
    this.viewData = [];
    this.isLoading = true;
    this.cdr.markForCheck();
    this.getTabelData();
  }

  onPageChange(newPage: number): void {
    this.pageNo = newPage;
    this.isLoading = true;
    this.cdr.markForCheck();
    this.getTabelData();
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize = newSize;
    this.pageNo = 1;
    this.viewData = [];
    this.isLoading = true;
    this.cdr.markForCheck();
    this.getTabelData();
  }

  OnSubmitAction(action: string): void {
    if (this.selectedItemEditApproval) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Alert!',
        detail: 'Update selected item first!',
      });
      return;
    }

    // Validate remarks for Forward and Reject actions
    const remark = this.approvalRemarksText?.trim() || '';
    if (action === 'Forward' || action === 'Reject' || action === 'Return') {
      if (remark === '') {
        this.approvalRemarksInvalid = true;
        this.messageService.add({
          severity: 'warn',
          summary: 'Alert!',
          detail: 'Please enter remarks',
        });
        this.isValidremark = false;
        return;
      }
    }

    this.approvalRemarksInvalid = false;
    this.selectedAction = action === 'Approve' ? 'Approved' : action + 'ed';
    this.paramvaluedata = '';

    const wfStatusId = this.getwfStatusId(action);
    const roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
    const itemJson = JSON.stringify(this.approvalItemDetailJson);

    this.paramvaluedata = `itemJson=${itemJson}|appUserId=${sessionStorage.getItem(
      'userId'
    )}|approvalRemarks=${remark}|id=${this.selectedItem?.id}|appUserRole=${roleID}|activity=${
      this.actitvityName
    }|wfStatusId=${wfStatusId}`;

    this.confirmationService.confirm({
      header: 'Confirm?',
      message: `Are you sure you want to ${action}?`,
      icon: 'pi pi-question-circle',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => this.submitActionForm(),
    });
  }

  submitActionForm(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    this.userService
      .SubmitPostTypeData('uspPostRaiseOrgTicketApproval', this.paramvaluedata, this.FormName)
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;

          if (response != '') {
            const resultArray = String(response).split('-');
            const lastIndex = resultArray.length - 1;
            const isSuccess =
              resultArray[lastIndex]?.toLowerCase() === 'success' ||
              resultArray[1]?.toLowerCase() === 'success' ||
              String(response).toLowerCase().includes('success');

            if (isSuccess) {
              let apiMessage = '';
              if (resultArray.length > 5) {
                const messageParts = resultArray
                  .slice(4, lastIndex)
                  .filter((part) => part && part.trim() !== '');
                apiMessage = messageParts.join(' ') || response;
              } else if (resultArray.length > 4) {
                apiMessage = resultArray[4] || response;
              } else {
                apiMessage = response;
              }

              this.getPermission();
              this.getTabelData();

              setTimeout(() => {
                this.onApprovalDialogHide();
                this.messageService.add({
                  severity: 'success',
                  summary: 'Success!',
                  detail: apiMessage || `Data ${this.selectedAction} successfully.`,
                });
                this.cdr.detectChanges();
              }, 500);
            } else if (resultArray[0] === '2') {
              setTimeout(() => {
                this.messageService.add({
                  severity: 'warn',
                  summary: 'Alert!',
                  detail: resultArray[1] || response,
                });
                this.cdr.detectChanges();
              }, 1000);
            } else {
              this.messageService.add({
                severity: 'error',
                summary: 'Alert!',
                detail: resultArray[1] || response || 'Something went wrong!',
              });
              this.cdr.detectChanges();
            }
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Alert!',
              detail: 'Something went wrong!',
            });
            this.cdr.detectChanges();
          }
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
          if (err.status === 401) {
            this.messageService.add({
              severity: 'error',
              summary: 'Error!',
              detail: 'You are not authorized!',
            });
          } else if (err.status === 403) {
            this.Customvalidation.loginroute(err.status);
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error!',
              detail: err.error?.message?.toString() || 'Failed to process request.',
            });
          }
          this.cdr.detectChanges();
        },
      });
  }

  onChangeFinalRemark(event: any): void {
    const value = event.target.value?.trim() || '';
    if (value === '') {
      this.isValidremark = false;
      this.approvalRemarksInvalid = false;
    } else {
      this.isValidremark = true;
      this.approvalRemarksInvalid = false;
    }
  }

  editRowApproval(item: any, index: number): void {
    this.selectedItemEditApproval = item;
    this.selectedEditIndexApproval = index;
    this.itemFormApproval.patchValue({
      item: item.item || '',
      uom: item.uom || '',
      quantity: item.quantity || null,
    });
    this.cdr.detectChanges();
  }

  updateRowApproval(): void {
    if (this.itemFormApproval.get('quantity')?.invalid) {
      this.itemFormApproval.get('quantity')?.markAllAsTouched();
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please enter valid quantity',
      });
      return;
    }

    if (this.selectedItemEditApproval && this.selectedEditIndexApproval !== null) {
      const formValue = this.itemFormApproval.getRawValue();
      this.approvalItemDetailJson[this.selectedEditIndexApproval] = {
        ...this.selectedItemEditApproval,
        quantity: formValue.quantity,
      };

      this.selectedItemEditApproval = null;
      this.selectedEditIndexApproval = null;
      this.itemFormApproval.reset();
      this.cdr.detectChanges();
    }
  }

  onClearApproval(): void {
    this.itemFormApproval.reset();
    this.selectedItemEditApproval = null;
    this.selectedEditIndexApproval = null;
    this.cdr.detectChanges();
  }

  openAvailableStockModal(type: string, item: any): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Available Stock',
      detail: 'No stock data available.',
    });
  }
}
