import { Component, OnInit, signal, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TableTemplate, TableColumn } from '../../table-template/table-template';
import { UserService } from '../../shared/user-service';
import { MessageService, ConfirmationService } from 'primeng/api';
import { PopoverModule } from 'primeng/popover';
import { DrawerModule } from 'primeng/drawer';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { DialogModule } from 'primeng/dialog';
import { Customvalidation } from '../../shared/Validation';
import { ConfigService } from '../../shared/config.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-my-assets',
  standalone: true,
  imports: [
    CommonModule,
    BreadcrumbModule,
    ButtonModule,
    TableTemplate,
    ConfirmDialogModule,
    ToastModule,
    ReactiveFormsModule,
    FormsModule,
    PopoverModule,
    DrawerModule,
    SelectModule,
    InputTextModule,
    TextareaModule,
    DialogModule
  ],
  providers: [MessageService, ConfirmationService, DatePipe],
  templateUrl: './my-assets.html',
  styleUrls: ['./my-assets.scss']
})
export class MyAssets implements OnInit {

  // Signals for reactive state
  setData = signal<any[]>([]);
  viewAccessoryData = signal<any[]>([]);
  isLoading = signal(false);

  // Form
  locationForm!: FormGroup;

  // UI state
  visible: boolean = false;
  showViewAccessoryModal: boolean = false;
  showRemarksModal: boolean = false;
  selectedItem: any;

  // Breadcrumb & labels
  breadcrumbItems: any[] = [];
  menulabel: string = '';
  formlable: string = '';

  // Table pagination & sorting
  pageSize: number = 10;
  totalCount: number = 0;
  pageNo: number = 1;
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  searchText: string = '';

  // Remarks & Actions
  returnRemark: string = '';
  pendingAction: { item: any; key: string; action: string } | null = null;
  officeLocationData: any[] = [];
  selectedLocation: string = 'same';
  receiptImage: string = '';

  // File upload
  filesToUpload: Array<File> = [];
  selectedFileNames: string[] = [];
  selectedFolderName: string = '';
  showFileUploadModal: boolean = false;

  // Table columns
  columns: TableColumn[] = [
    { key: 'actions', header: 'Accessory⚙️', isVisible: true, isSortable: false, isCustom: true },
    { key: 'asset', header: 'Asset', isVisible: true, isSortable: true },
    { key: 'officeLocation', header: 'Office Location', isVisible: true, isSortable: true },
    { key: 'asset Type', header: 'Asset Type', isVisible: true, isSortable: true },
    { key: 'department', header: 'Department', isVisible: true, isSortable: true },
    { key: 'dept Remarks', header: 'Dept Remarks', isVisible: true, isSortable: false },
    { key: 'emp Remarks', header: 'Emp Remarks', isVisible: true, isSortable: false },
    { key: 'date', header: 'Date', isVisible: true, isSortable: true },
    { key: 'status', header: 'Status', isVisible: true, isSortable: true },
  ];

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private configService: ConfigService,
    private customValidation: Customvalidation,
    private datePipe: DatePipe,
    public zone: NgZone
  ) { }

  ngOnInit(): void {
    const param = sessionStorage.getItem('menuItem') || '{}';
    const paramjs = JSON.parse(param);
    this.formlable = paramjs.formName || 'My Assets';
    this.menulabel = paramjs.menu || 'Asset List';

    this.breadcrumbItems = [
      { label: 'Home', routerLink: '/' },
      { label: this.formlable, routerLink: '/home' },
      { label: this.menulabel, routerLink: '/my-assets' },
    ];

    this.locationForm = this.fb.group({
      officeLocation: [''],
      courierNo: [''],
      courierDate: [''],
      attachment: [''],
    });

    this.getOfficeLocation();
    this.getTableData(true);
  }

  getTableData(showLoader: boolean) {
    if (showLoader) this.isLoading.set(true);
    const userId = sessionStorage.getItem('userId');
    const orgId = sessionStorage.getItem('Organization');

    this.userService
      .getQuestionPaper(
        `uspGetAssetTaggingEmpView|commonId=0|action=ASSET|userId=${userId}|orgId=${orgId}`
      )
      .subscribe(
        (res: any) => {
          const data = (!res.message && res.table) ? res.table.map((e: any) => ({ ...e, remark: '' })) : [];
          this.setData.set(data);
          this.totalCount = data.length;
          this.isLoading.set(false);
        },
        (error) => {
          this.setData.set([]);
          this.isLoading.set(false);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load assets.' });
        }
      );
  }

  onViewAccessory(item: any) {
    if (!item) return;
    const userId = sessionStorage.getItem('userId');
    const orgId = sessionStorage.getItem('Organization');

    this.userService
      .getQuestionPaper(
        `uspGetAssetTaggingEmpView|commonId=${item?.trnId}|action=ACCESSORY|userId=${userId}|orgId=${orgId}`
      )
      .subscribe((res: any) => {
        if (res.table) {
          this.viewAccessoryData.set(res.table.map((e: any) => ({ ...e, remark: '' })));
        } else {
          this.viewAccessoryData.set([]);
        }
        this.showViewAccessoryModal = true;
        this.selectedItem = item;
      });
  }

  closeAccessoryModal() {
    this.showViewAccessoryModal = false;
    this.selectedItem = null;
  }

  addedAccReason(text: string, i: number) {
    const currentData = this.viewAccessoryData();
    currentData[i].remark = text;
    this.viewAccessoryData.set([...currentData]);
  }

  openRemarksModal(item: any, key: string, action: string) {
    this.pendingAction = { item, key, action };
    this.returnRemark = '';
    this.showRemarksModal = true;
  }

  closeModal() {
    this.showRemarksModal = false;
    this.returnRemark = '';
    this.pendingAction = null;
    this.receiptImage = '';
    this.selectedLocation = 'same';
    this.locationForm.reset();
  }

  setLocation(type: string) {
    this.selectedLocation = type;
  }

  submitReturn() {
    if (!this.returnRemark.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Required', detail: 'Remark is required.' });
      return;
    }
    if (!this.pendingAction) return;

    this.confirmationService.confirm({
      message: `Are you sure you want to ${this.pendingAction.action} this asset?`,
      header: 'Confirm Action',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.pendingAction!.item.remark = this.returnRemark.trim();
        this.executeAssetAction(
          this.pendingAction!.item,
          this.pendingAction!.key,
          this.pendingAction!.action
        );
      }
    });
  }

  executeAssetAction(item: any, key: string, action: string): void {
    const formValues = this.locationForm.value;
    if (this.selectedLocation === 'different' && !formValues.officeLocation) {
      this.messageService.add({ severity: 'warn', summary: 'Required', detail: 'Please select a location.' });
      return;
    }

    this.isLoading.set(true);

    const orgId = sessionStorage.getItem('Organization');
    const userId = sessionStorage.getItem('userId');
    const trnId = item?.trnId;
    let loc = '0', courier = '', date = '', image = '';

    if (this.selectedLocation === 'different') {
      loc = formValues.officeLocation || '0';
      courier = formValues.courierNo || '';
      date = formValues.courierDate || '';
      image = formValues.attachment || this.receiptImage || '';
    }

    const raw = `userId=${userId}|actionId=${key}|empRemarks=${item.remark}|trnId=${trnId}|locationId=${loc}|courierNo=${courier}|date=${date}|image=${image}|orgId=${orgId}`;
    this.userService
      .SubmitPostTypeData('uspPostAssetTaggingAction', raw, this.formlable)
      .subscribe(
        (response: any) => {
          this.isLoading.set(false);
          if (response === 'Data Saved.-success') {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: `Asset ${action} Successfully` });
            this.getTableData(false);
            this.closeModal();
          } else {
            const result = response.split('-');
            this.messageService.add({ severity: 'error', summary: 'Error', detail: result[1] || response });
          }
        },
        (error) => {
          this.isLoading.set(false);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Action failed.' });
        }
      );
  }

  accessoryAccept(item: any, key: string, action: string) {
    if (!item.remark || !item.remark.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Required', detail: 'Remark is required.' });
      return;
    }

    this.isLoading.set(true);
    const userId = sessionStorage.getItem('userId');
    const trnId = item?.id;
    const raw = `appUserId=${userId}|actionId=${key}|empRemarks=${item.remark}|storeId=|trnId=${trnId}`;

    this.userService
      .SubmitPostTypeData('uspPostAssetTaggingAccessoryAction', raw, this.formlable)
      .subscribe(
        (response: any) => {
          this.isLoading.set(false);
          if (response === 'Data Saved.-success') {
            this.messageService.add({ severity: 'success', summary: 'Success', detail: `Accessory ${action} Successfully` });
            this.onViewAccessory(this.selectedItem);
          } else {
            const result = response.split('-');
            this.messageService.add({ severity: 'error', summary: 'Error', detail: result[1] || response });
          }
        },
        (error) => {
          this.isLoading.set(false);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Action failed.' });
        }
      );
  }

  getOfficeLocation() {
    this.userService
      .getQuestionPaper(`uspGetMasterDataRaiseTicket|action=OFFICELOCATION|id=0|districtId=0`)
      .subscribe((res: any) => {
        this.officeLocationData = res['table'] || [];
      });
  }

  // File Upload Logic
  fileupload(folderName?: string) {
    this.selectedFolderName = folderName || '';
    this.showFileUploadModal = true;
  }

  onCloseFileUploadModal() {
    this.filesToUpload = [];
    this.selectedFileNames = [];
    this.showFileUploadModal = false;
    this.selectedFolderName = '';
  }

  fileChangeEvent(event: any) {
    this.filesToUpload = Array.from(event.target.files);
    this.selectedFileNames = this.filesToUpload.map((file) => file.name);
  }

  uploadFiles() {
    if (this.filesToUpload.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'No File', detail: 'Please select a file.' });
      return;
    }

    this.isLoading.set(true);
    this.userService.MastrtfileuploadNew(this.filesToUpload, this.selectedFolderName)
      .subscribe(
        (datacom: any) => {
          this.isLoading.set(false);
          const resultarray = datacom.split('-');
          if (resultarray[0] === '1') {
            this.receiptImage = resultarray[1];
            this.locationForm.patchValue({ attachment: this.receiptImage });
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'File Uploaded!' });
            this.onCloseFileUploadModal();
          } else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: resultarray[1] || 'Upload failed.' });
          }
        },
        (err: HttpErrorResponse) => {
          this.isLoading.set(false);
          this.customValidation.loginroute(err.status);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: err.message });
        }
      );
  }

  viewAttachment(url: string) {
    if (url) {
      window.open(this.configService.elockerUrl + '/' + url, '_blank');
    } else {
      this.messageService.add({ severity: 'warn', summary: 'Not Found', detail: 'File does not exist!' });
    }
  }

  removeAttachment() {
    this.receiptImage = '';
    this.locationForm.patchValue({ attachment: '' });
  }

  // Table Template Events
  onPageChange(newPage: number) {
    this.pageNo = newPage;
    // For now, getTableData is not paginated on server, but we can call it
    this.getTableData(false);
  }

  onPageSizeChange(newSize: number) {
    this.pageSize = newSize;
    this.pageNo = 1;
    this.getTableData(false);
  }

  onSearchChange(search: string) {
    this.searchText = search;
    this.pageNo = 1;
    this.getTableData(false);
  }

  onSortChange(event: { column: string, direction: 'asc' | 'desc' }) {
    this.sortColumn = event.column;
    this.sortDirection = event.direction;
    this.getTableData(false);
  }
}