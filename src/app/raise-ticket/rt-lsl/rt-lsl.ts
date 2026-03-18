import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { ConfirmationService, MessageService } from 'primeng/api';

import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DrawerModule } from 'primeng/drawer';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { PopoverModule } from 'primeng/popover';

import { TableColumn, TableTemplate } from '../../table-template/table-template';
import { UserService } from '../../shared/user-service';
import { Customvalidation } from '../../shared/Validation';

@Component({
  selector: 'app-rt-lsl',
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
    InputTextModule,
    TableModule,
    TableTemplate,
    PopoverModule,
  ],
  templateUrl: './rt-lsl.html',
  styleUrl: './rt-lsl.scss',
  providers: [ConfirmationService, MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RtLsl implements OnInit {
  get breadcrumbItems(): any[] {
    return [{ label: 'Raise Ticket', routerLink: '/raise-ticket' }, { label: this.nameList || '' }];
  }

  visible = false;
  header = '';
  headerIcon = 'pi pi-ticket';
  postType: 'add' | 'update' | 'view' = 'add';

  tblData: any[] = [];
  viewData: any[] = [];
  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true },
    { key: 'rowNo', header: 'S.No.', isVisible: true, isSortable: false },
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
  noDatafoundCard = false;

  id: any;
  FormName = '';
  name = '';
  nameList: string = '';
  selectedPostApi: string = '';
  actitvityName: string = '';

  showOverview = true;

  categoryDrp: any[] = [];
  subCategoryDrp: any[] = [];
  fleetDrp: any[] = [];

  rticketLsl!: FormGroup;
  selectedRow: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private userService: UserService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private Customvalidation: Customvalidation,
    private cdr: ChangeDetectorRef
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    const params = this.route.snapshot.queryParams;
    this.id = params['id'];
    this.FormName = params['formName'];
    this.name = `Raise Ticket - ${params['name']}`;
    this.nameList = params['name'];
    this.actitvityName = params['name'];
    this.selectedPostApi = params['postApi'];

    this.getCategory();
    this.getTabelData();
  }

  initForm(): void {
    this.rticketLsl = this.fb.group({
      category: [null, Validators.required],
      subCategory: [null, Validators.required],
      fleet: [null, Validators.required],
      remarks: ['', Validators.required],
    });
  }

  getTabelData(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    const userId = sessionStorage.getItem('userId') || '';
    const districtId = sessionStorage.getItem('District') || '';
    const userRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId || '';

    this.userService
      .getQuestionPaper(
        `uspGetRaiseOrgTicketPending|appUserId=${userId}|districtId=${districtId}|searchText=${this.searchText}|pageIndex=${this.pageNo}|size=${this.pageSize}|appUserRole=${userRole}|activity=${this.actitvityName}`
      )
      .subscribe({
        next: (res: any) => {
          if (!res || Object.keys(res).length === 0) {
            this.noDatafoundCard = true;
            this.tblData = [];
            this.viewData = [];
            this.totalCount = 0;
            this.isLoading = false;
            this.cdr.detectChanges();
            return;
          }

          this.tblData = (res['table1'] || []).map((e: any, idx: number) => {
            const approvalDetail = e.approvalDetail ? JSON.parse(e.approvalDetail) : [];
            const closureImage = e.closureImage ? JSON.parse(e.closureImage) : [];
            return {
              ...e,
              approvalDetail,
              closureImage,
              sno: idx + 1,
              category: e.subCategory || '',
              subCategory: e.subSubCategory || '',
              fleet: e.fleet || '',
            };
          });

          this.noDatafoundCard = this.tblData.length === 0;
          this.viewData = this.tblData;
          this.totalCount = res['table']?.[0]?.totalCount || this.viewData.length;
          this.pageNo = 1;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 403) {
            this.Customvalidation.loginroute(err.status);
          }
          this.isLoading = false;
          this.cdr.detectChanges();
        },
      });
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
          this.rticketLsl.patchValue({ subCategory: null });
          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 403) {
            this.Customvalidation.loginroute(err.status);
          }
        },
      });
  }

  getFleet(categoryId: number): void {
    const districtId = sessionStorage.getItem('District') || '';
    this.userService
      .getQuestionPaper(
        `uspGetMasterDataRaiseTicket|action=VEHICLE|districtId=${districtId}|id=${categoryId}`
      )
      .subscribe({
        next: (res: any) => {
          this.fleetDrp = res['table'] || [];
          this.rticketLsl.patchValue({ fleet: null });
          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 403) {
            this.Customvalidation.loginroute(err.status);
          }
        },
      });
  }

  showDialog(mode: 'add' | 'view' | 'update', item?: any): void {
    this.visible = true;
    this.rticketLsl.reset();
    this.rticketLsl.enable();

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
    const fleetId = data.fleetId || null;
    const remarks = data.remarks || '';

    if (categoryId) {
      this.getSubCategory(categoryId);
      this.getFleet(categoryId);
    }

    setTimeout(() => {
      this.rticketLsl.patchValue({
        category: categoryId,
        subCategory: subCategoryId,
        fleet: fleetId,
        remarks: remarks,
      });
      this.cdr.detectChanges();
    }, 500);

    if (type === 'view') {
      this.rticketLsl.disable();
    }
  }

  onDrawerHide(): void {
    this.visible = false;
    this.showOverview = true;
  }

  toggleOverview(): void {
    this.showOverview = !this.showOverview;
  }

  onCategoryChange(event: any): void {
    const categoryId = event.value;
    this.rticketLsl.patchValue({ category: categoryId, subCategory: null, fleet: null });
    if (categoryId) {
      this.getSubCategory(categoryId);
      this.getFleet(categoryId);
    } else {
      this.subCategoryDrp = [];
      this.fleetDrp = [];
    }
    this.cdr.detectChanges();
  }

  onSubCategoryChange(event: any): void {
    this.rticketLsl.patchValue({ subCategory: event.value });
  }

  onFleetChange(event: any): void {
    this.rticketLsl.patchValue({ fleet: event.value });
  }

  isInvalid(controlName: string): boolean {
    const ctrl = this.rticketLsl.get(controlName);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  onSubmitTicketForm(): void {
    if (this.rticketLsl.invalid) {
      this.rticketLsl.markAllAsTouched();
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please fill required fields',
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
    const formValue = this.rticketLsl.getRawValue();
    const userId = sessionStorage.getItem('userId') || '';
    const districtId = sessionStorage.getItem('District') || '';
    const roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId || '';

    const category = formValue.category;
    const subCategory = formValue.subCategory;
    const fleet = formValue.fleet;
    const remarks = formValue.remarks;

    const paramvaluedata = `requestTypeId=0|requestType=|itemJson=[]|districtId=${districtId}|serviceCatId=${this.id}|serviceSubCatId=${category}|serviceSubSubCatId=${subCategory}|fleetId=${fleet}|issue=${remarks}|activity=${this.actitvityName}`;

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

        if (resultarray[1] === 'success' || resultarray[0] === '1') {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Ticket submitted successfully',
          });
          this.getTabelData();
          this.rticketLsl.reset();
          this.visible = false;
          this.selectedRow = null;
          this.cdr.detectChanges();
        } else if (resultarray[0] === '2') {
          this.messageService.add({
            severity: 'warn',
            summary: 'Warning',
            detail: resultarray[1] || 'Operation failed',
          });
          this.cdr.detectChanges();
        } else if (resultarray[0] === '5') {
          const newId = resultarray[2];
          // this.getStringData(newId);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Ticket submitted successfully',
          });
          this.getTabelData();
          this.rticketLsl.reset();
          this.visible = false;
          this.selectedRow = null;
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

  getStringData(id: any): void {
    this.userService.getQuestionPaper(`uspGetVEPLRaisedTicketData|id=${id}`).subscribe({
      next: (res: any) => {
        if (res.table && res.table.length > 0) {
          this.pushDataToVercalux(res.table[0]);
        }
      },
      error: (err) => console.error('Error getting ticket data:', err),
    });
  }

  pushDataToVercalux(data: any): void {
    const query = `audio=${data.audio || ''}|requestTypeId=${data.requestTypeId || 0}|requestType=${
      data.requestType || ''
    }|fleetId=${data.fleetId || ''}|itemJson=${data.itemJson || '[]'}|serviceCategoryId=${
      data.serviceCategoryId || ''
    }|subCategoryId=${data.subCategoryId || ''}|subSubCategoryId=${
      data.subSubCategoryId || ''
    }|districtId=${data.districtId || ''}|fleet=${data.fleet || ''}|fleetDescription=${
      data.fleetDescription || ''
    }|fleetSeries=${data.fleetSeries || ''}|ticketNo=${data.ticketNo || ''}|ticketId=${
      data.ticketId || ''
    }|date=${data.date || ''}|serviceCategory=${data.serviceCategory || ''}|subCategory=${
      data.subCategory || ''
    }|subSubCategory=${data.subSubCategory || ''}|remarks=${data.remarks || ''}|state=${
      data.state || ''
    }|status=${data.status || ''}|district=${data.district || ''}|name=${
      data.name || ''
    }|department=${data.department || ''}|org=${data.org || ''}|mobile=${
      data.mobile || ''
    }|emailId=${data.emailId || ''}|approvedBy=${data.approvedBy || ''}|appUserId=${
      data.appUserId || ''
    }`;

    this.userService
      .SubmitPostErpTicket(`uspPostTransferTicket`, query, this.selectedPostApi)
      .subscribe({
        next: (res: any) => {
          console.log('Ticket transferred successfully:', res);
        },
        error: (err) => console.error('Error transferring ticket:', err),
      });
  }

  onEdit(row: any): void {
    this.showDialog('update', row);
  }

  onView(row: any): void {
    this.showDialog('view', row);
  }

  onsearchChange(event: any): void {
    this.searchText = event.value;
    this.getTabelData();
  }

  onPageChange(newPage: number): void {
    this.pageNo = newPage;
    this.getTabelData();
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize = newSize;
    this.pageNo = 1;
    this.getTabelData();
  }
}
