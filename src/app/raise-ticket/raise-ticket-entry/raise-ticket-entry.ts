import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { DrawerModule } from 'primeng/drawer';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { PopoverModule } from 'primeng/popover';

import { TableColumn, TableTemplate } from '../../table-template/table-template';
import { UserService } from '../../shared/user-service';
import { Customvalidation } from '../../shared/Validation';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-raise-ticket-entry',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    BreadcrumbModule,
    DrawerModule,
    InputNumberModule,
    TableTemplate,
    SelectModule,
    ToastModule,
    ConfirmDialogModule,
    PopoverModule,
  ],
  providers: [DatePipe, MessageService, ConfirmationService],
  templateUrl: './raise-ticket-entry.html',
  styleUrls: ['./raise-ticket-entry.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RaiseTicketEntry implements OnInit {
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
    { key: 'sno', header: 'S.No', isVisible: true, isSortable: false },
    { key: 'text', header: 'Ticket No', isVisible: true, isSortable: false },
    { key: 'serviceCategory', header: 'Service Category', isVisible: true, isSortable: false },
    { key: 'subCategory', header: 'Sub Category', isVisible: true, isSortable: false },
    { key: 'subSubCategory', header: 'Sub SubCategory', isVisible: true, isSortable: false },
    { key: 'remarks', header: 'Remarks', isVisible: true, isSortable: false },
    {
      key: 'attachment',
      header: 'Attachments',
      isVisible: true,
      isSortable: false,
      isCustom: true,
    },
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
  nameList: any;
  selectedPostApi = '';

  orgDrp: any[] = [];
  serviceCatDrp: any[] = [];
  serviceSubCatDrp: any[] = [];
  serviceSubSubCatDrp: any[] = [];

  tiketNo = '';
  showDateAndImprestFields = false;
  ticketForm: FormGroup;
  attachmentForm: FormGroup;

  selectedRow: any = null;

  attachmentArray: any[] = [];
  uploadFileSize: any;
  isUploadingAttachment = false;

  isCollapsed = false;
  showOverview = true;
  showAttachments = true;

  attachmentViewerVisible = false;
  attachmentViewerData: Array<{ docDetail?: string; image: string }> = [];
  attachmentViewerTitle = '';

  selectedPreview: any = null;
  selectedFile: File | null = null;

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private Customvalidation: Customvalidation,
    private cdr: ChangeDetectorRef
  ) {
    this.ticketForm = this.fb.group({
      // ticketNo: [{ value: '', disabled: true }],
      orgId: [],
      serviceCatId: [],
      serviceSubCatId: [null, Validators.required],
      serviceSubSubCatId: [null, Validators.required],
      issueDescription: [],
      fromDate: [null],
      toDate: [null],
      imprest: [null],
    });

    this.attachmentForm = this.fb.group({
      image: ['', Validators.required],
      docDetail: [''],
    });
  }

  ngOnInit(): void {
    const params = this.route.snapshot.queryParams;
    this.id = params['id'];
    this.FormName = params['formName'];
    this.name = `Raise Ticket - ${params['name']}`;
    this.nameList = params['name'];
    this.selectedPostApi = params['postApi'];

    this.getTabelData();
    //this.getTicketNumber();
    this.getServiceDrpData();
    this.getOrgDrp();
  }

  getTabelData(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    this.userService
      .getQuestionPaper(
        `uspGetRaisedTicket|appUserId=${sessionStorage.getItem('userId')}|serviceCategoryId=${
          this.id
        }`
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

          this.tblData = (res['table'] || []).map((e: any, idx: number) => {
            const imageJson = e.imageJson ? JSON.parse(e.imageJson) : [];
            const ticketHistory = e.ticketHistory ? JSON.parse(e.ticketHistory) : [];
            return {
              ...e,
              ticketHistory,
              imageJson,
              sno: idx + 1,
              serviceCategory: e.serviceCategory,
              subCategory: e.subCategory,
              subSubCategory: e.subSubCategory,
              attachment: imageJson,
            };
          });

          this.noDatafoundCard = this.tblData.length === 0;
          this.viewData = this.tblData;
          this.totalCount = this.viewData.length;
          this.pageNo = 1;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 403) console.error(err);
          this.isLoading = false;
          this.cdr.detectChanges();
        },
      });
  }

  // getTicketNumber() {
  //   this.userService
  //     .getQuestionPaper(`uspGetMasterDataRaiseTicket|action=TICKETNO|id=0`)
  //     .subscribe({
  //       next: (res: any) => {
  //         this.tiketNo = res['table'][0]['ticketNo'];
  //         if (this.postType === 'add') {
  //           this.ticketForm.patchValue({ ticketNo: this.tiketNo });
  //         }
  //       },
  //       error: (err) => console.error(err),
  //     });
  // }

  getServiceDrpData() {
    this.userService
      .getQuestionPaper(`uspGetMasterDataRaiseTicket|action=CATEGORY|id=0`)
      .subscribe({
        next: (res: any) => {
          this.serviceCatDrp = res['table'];
          this.cdr.detectChanges();
        },
        error: (err) => console.error(err),
      });
  }

  getServiceSubCategory(eventOrId: any, action: number, callback?: () => void) {
    const id = action === 1 ? eventOrId.value : eventOrId;
    this.userService
      .getQuestionPaper(`uspGetMasterDataRaiseTicket|action=SUBCATEGORY|id=${id}`)
      .subscribe({
        next: (res: any) => {
          this.serviceSubCatDrp = res['table'];
          const numericId = Number(id);
          const match = this.serviceCatDrp.find((e: any) => e.drpValue === numericId);
          this.selectedPostApi = match?.postapi?.trim() || '';
          this.ticketForm.patchValue({ serviceCatId: numericId });
          this.cdr.detectChanges();
          if (callback) callback();
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 403) console.error(err);
          this.router.navigate(['/raise-ticket']);
          if (callback) callback();
        },
      });
  }

  showDialog(mode: 'add' | 'view' | 'update', item?: any): void {
    this.visible = true;
    this.ticketForm.reset();
    this.ticketForm.enable();

    this.attachmentArray = [];
    this.showDateAndImprestFields = false;

    this.postType = mode;
    this.selectedRow = item || null;

    if (mode === 'add') {
      this.header = `Create Ticket for ${this.nameList}`;
      this.headerIcon = 'pi pi-plus';
      this.ticketForm.patchValue({
        // ticketNo: this.tiketNo,
        orgId: 0,
        serviceCatId: this.id,
        serviceSubCatId: null,
        serviceSubSubCatId: null,
      });
      this.getServiceSubCategory(this.id, 2);
    } else {
      this.header = mode === 'update' ? 'Update Ticket' : 'View Ticket';
      this.headerIcon = mode === 'update' ? 'pi pi-pencil' : 'pi pi-eye';
      this.loadTicketForEdit(item, mode);
    }
  }

  loadTicketForEdit(data: any, type: string): void {
    const row = data || {};
    const serviceCatId = row.serviceCategoryId || row.ServiceCategoryId || this.id || null;
    const serviceSubCatId =
      row.serviceSubCategoryId ||
      row.ServiceSubCategoryId ||
      row.subCategoryId ||
      row.SubCategoryId ||
      null;
    const serviceSubSubCatId =
      row.serviceSubSubCategoryId ||
      row.ServiceSubSubCategoryId ||
      row.subSubCategoryId ||
      row.SubSubCategoryId ||
      null;
    const orgId = row.raisedForOrgId || row.RaisedForOrgId || row.orgId || row.OrgId || 0;
    //const ticketNo = row.text || row.ticketNo || row.TicketNo || '';
    const issueDescription =
      row.remarks || row.Remarks || row.issueDescription || row.IssueDescription || '';
    const fromDateRaw = row.fromDate || row.FromDate || null;
    const fromDate = fromDateRaw
      ? fromDateRaw instanceof Date
        ? this.datePipe.transform(fromDateRaw, 'yyyy-MM-dd')
        : this.datePipe.transform(new Date(fromDateRaw), 'yyyy-MM-dd')
      : null;
    const toDateRaw = row.toDate || row.ToDate || null;
    const toDate = toDateRaw
      ? toDateRaw instanceof Date
        ? this.datePipe.transform(toDateRaw, 'yyyy-MM-dd')
        : this.datePipe.transform(new Date(toDateRaw), 'yyyy-MM-dd')
      : null;
    const imprest = row.imprest || row.Imprest || row.imprestAmount || row.ImprestAmount || null;

    this.showDateAndImprestFields = String(serviceSubSubCatId) === '10038';

    const buildAttachmentArray = (src: any[]): any[] => {
      return (src || [])
        .map((att: any, idx: number) => {
          if (!att) return null;

          if (typeof att === 'string') {
            return {
              image: att,
              docDetail: `Attachment ${idx + 1}`,
              fileSize: null,
            };
          }

          const rawPath =
            att.image || att.preview || att.filePath || att.filepath || att.url || att.path || '';

          return {
            ...att,
            image: rawPath || '',
            docDetail: att.docDetail || att.description || `Attachment ${idx + 1}`,
          };
        })
        .filter((x: any) => !!x);
    };

    if (row.attachment && Array.isArray(row.attachment)) {
      this.attachmentArray = buildAttachmentArray(row.attachment);
    } else if (row.imageJson) {
      try {
        const parsed =
          typeof row.imageJson === 'string' ? JSON.parse(row.imageJson) : row.imageJson;
        this.attachmentArray = Array.isArray(parsed) ? buildAttachmentArray(parsed) : [];
      } catch (e) {
        this.attachmentArray = [];
      }
    } else {
      this.attachmentArray = [];
    }

    this.showAttachments = true;

    const patchFormValues = () => {
      this.ticketForm.patchValue({
        // ticketNo,
        orgId,
        serviceCatId,
        serviceSubCatId,
        serviceSubSubCatId,
        issueDescription,
        fromDate,
        toDate,
        imprest,
      });
      this.cdr.detectChanges();
    };

    if (serviceCatId) {
      this.getServiceSubCategory(serviceCatId, 2, () => {
        if (serviceSubCatId) {
          this.userService
            .getQuestionPaper(
              `uspGetMasterDataRaiseTicket|action=SUBSUBCATEGORY|id=${serviceSubCatId}`
            )
            .subscribe({
              next: (res: any) => {
                this.serviceSubSubCatDrp = res['table'];
                this.cdr.detectChanges();
                patchFormValues();
              },
              error: (err) => {
                console.error('Error loading sub-sub-category:', err);
                patchFormValues();
              },
            });
        } else {
          this.ticketForm.patchValue({
            // ticketNo,
            orgId,
            serviceCatId,
            issueDescription,
            fromDate,
            toDate,
            imprest,
          });
          this.cdr.detectChanges();
        }
      });
    } else {
      patchFormValues();
    }

    if (type === 'view') {
      this.ticketForm.disable();
    }
  }

  onsearchChange(event: any): void {
    this.searchText = event.value;
    this.getTabelData();
  }

  onDrawerHide(): void {
    this.visible = false;
    this.isCollapsed = false;
    this.showOverview = true;
    this.showAttachments = true;
  }

  toggleOverview(): void {
    this.showOverview = !this.showOverview;
  }

  toggleAttachments(): void {
    this.showAttachments = !this.showAttachments;
  }

  onOrgChange(event: any): void {
    this.ticketForm.patchValue({ orgId: event.value });
  }

  onServiceCatChange(event: any): void {
    this.ticketForm.patchValue({ serviceCatId: event.value });
    this.getServiceSubCategory(event, 1);
  }

  getOrgDrp() {
    this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblOrgMaster`).subscribe(
      (res: any) => (this.orgDrp = res['table']),
      (err: HttpErrorResponse) => {
        if (err.status == 403) console.error(err);
      }
    );
  }

  onServiceSubCatChange(event: any): void {
    const id = event.value;
    this.ticketForm.patchValue({ serviceSubCatId: id });

    this.userService
      .getQuestionPaper(`uspGetMasterDataRaiseTicket|action=SUBSUBCATEGORY|id=${id}`)
      .subscribe({
        next: (res: any) => {
          this.serviceSubSubCatDrp = res['table'];
          this.ticketForm.patchValue({ serviceSubSubCatId: null });
        },
      });
  }

  onServiceSubSubCatChange(event: any): void {
    const id = event.value;
    this.ticketForm.patchValue({ serviceSubSubCatId: id });
    this.showDateAndImprestFields = String(id) === '10038';
  }

  onFromDateChange(event: any): void {
    this.ticketForm.patchValue({ fromDate: event });
  }

  onToDateChange(event: any): void {
    this.ticketForm.patchValue({ toDate: event });
  }

  onImprestChange(event: any): void {
    this.ticketForm.patchValue({ imprest: event.value });
  }

  onFileSelected(event: any) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.selectedFile = file;
    this.attachmentForm.get('image')?.setValue(file);
    this.attachmentForm.get('image')?.markAsTouched();
    this.attachmentForm.updateValueAndValidity();
    this.selectedPreview = URL.createObjectURL(file);
    input.value = '';
  }

  openPreviewModal(): void {
    if (this.attachmentArray && this.attachmentArray.length > 0) {
      const first = this.attachmentArray[0];
      const url =
        (typeof first === 'string' && first) ||
        first?.image ||
        first?.preview ||
        first?.filePath ||
        first?.filepath ||
        first?.url ||
        first?.path ||
        '';

      if (url) {
        this.viewAttachment(url);
        return;
      }
    }

    if (this.attachmentViewerData && this.attachmentViewerData.length > 0) {
      const first = this.attachmentViewerData[0];
      if (first?.image) {
        this.viewAttachment(first.image);
        return;
      }
    }

    this.messageService.add({
      severity: 'info',
      summary: 'No Preview',
      detail: 'No attachment is available for preview.',
    });
  }

  viewAttachment(url: string): void {
    if (!url) {
      this.messageService.add({
        severity: 'info',
        summary: 'No URL',
        detail: 'File path is not available.',
      });
      return;
    }

    if (url.startsWith('http://') || url.startsWith('https://')) {
      window.open(url, '_blank');
      return;
    }

    const normalizedPath = this.normalizeAttachmentPath(url);
    const fullUrl = `https://elocker.nobilitasinfotech.com/${normalizedPath}`;
    window.open(fullUrl, '_blank');
  }

  onAddAttachment(): void {
    if (this.attachmentForm.invalid) {
      this.attachmentForm.markAllAsTouched();
      return;
    }

    const file: File | null = this.attachmentForm.get('image')?.value;
    const docDetail =
      this.attachmentForm.get('docDetail')?.value ||
      'Attachment ' + (this.attachmentArray.length + 1);

    if (!file) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Please select a file first',
      });
      return;
    }

    if (typeof file === 'string') {
      this.attachmentArray.push({
        image: file,
        docDetail: docDetail,
        fileSize: this.uploadFileSize,
      });

      if (this.selectedPreview) {
        URL.revokeObjectURL(this.selectedPreview);
      }

      this.attachmentForm.reset();
      this.selectedFile = null;
      this.selectedPreview = null;
      this.uploadFileSize = null;
      this.cdr.detectChanges();
      return;
    }

    if (file instanceof File) {
      this.isUploadingAttachment = true;
      this.cdr.markForCheck();

      this.userService.MastrtfileuploadNew([file], 'ticketClosureDoc').subscribe({
        next: (res: any) => {
          this.isUploadingAttachment = false;
          const responseStr = String(res);
          const parts = responseStr.split('-');

          if (parts[0] === '1' && parts[1]) {
            const uploadedPath = parts[1].trim();

            this.attachmentArray.push({
              image: uploadedPath,
              docDetail: docDetail,
              fileSize: file.size || this.uploadFileSize,
            });

            if (this.selectedPreview) {
              URL.revokeObjectURL(this.selectedPreview);
            }

            this.attachmentForm.reset();
            this.selectedFile = null;
            this.selectedPreview = null;
            this.uploadFileSize = null;

            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'File uploaded and added successfully',
            });

            this.cdr.detectChanges();
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Upload Failed',
              detail: parts[1] || 'Failed to upload file. Please try again.',
            });
            this.cdr.detectChanges();
          }
        },
        error: (err: any) => {
          this.isUploadingAttachment = false;
          console.error('File upload error:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to upload file. Please try again.',
          });
          this.cdr.detectChanges();
        },
      });
    }
  }

  onDeleteAttachment(index: number): void {
    this.attachmentArray.splice(index, 1);
  }

  private normalizeAttachmentPath(raw: string): string {
    if (!raw) return '';

    if (raw.includes('/') || raw.includes('\\')) {
      return raw.replace(/\\/g, '/').replace(/\/+/g, '/');
    }

    const knownFolders = ['ticketClosureDoc', 'crmContract'];

    for (const folderName of knownFolders) {
      const escapedFolder = folderName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = raw.match(new RegExp(`^(\\d{6})(ICOMSAMS)(${escapedFolder})(.+)$`, 'i'));
      if (pattern) {
        const [, yymm, folder, docFolder, filename] = pattern;
        return `${yymm}/${folder}/${docFolder}/${filename}`;
      }
    }

    const genericPattern = raw.match(/^(\d{6})(ICOMSAMS)([A-Z][a-zA-Z]+)([a-z].*)$/);
    if (genericPattern) {
      const [, yymm, folder, docFolder, filename] = genericPattern;
      return `${yymm}/${folder}/${docFolder}/${filename}`;
    }

    const fallbackPattern = raw.match(
      /^(\d{6})(ICOMSAMS)([A-Za-z]+)(.+\.(jpg|jpeg|png|pdf|doc|docx|xls|xlsx|txt|JPG|JPEG|PNG|PDF))$/i
    );
    if (fallbackPattern) {
      const [, yymm, folder, docFolder, filename] = fallbackPattern;
      return `${yymm}/${folder}/${docFolder}/${filename}`;
    }

    return raw;
  }

  openAttachmentList(row: any): void {
    let list: Array<any> = [];

    if (row?.attachment && Array.isArray(row.attachment) && row.attachment.length > 0) {
      list = row.attachment;
    } else if (row?.imageJson) {
      try {
        const parsed =
          typeof row.imageJson === 'string' ? JSON.parse(row.imageJson) : row.imageJson;
        if (Array.isArray(parsed) && parsed.length > 0) {
          list = parsed;
        }
      } catch (e) {
        console.error('Error parsing imageJson:', e);
        list = [];
      }
    }

    if (!list || list.length === 0) {
      this.messageService.add({
        severity: 'info',
        summary: 'No Attachments',
        detail: 'This ticket has no attachments.',
      });
      return;
    }

    this.attachmentViewerData = list
      .map((x: any, idx: number) => {
        if (!x) return null;

        if (typeof x === 'string') {
          return {
            docDetail: `Attachment ${idx + 1}`,
            image: this.normalizeAttachmentPath(x),
          } as { docDetail?: string; image: string };
        }

        const rawPath = x.image || x.preview || x.filePath || x.filepath || x.url || x.path || '';

        return {
          docDetail: x.docDetail || x.description || `Attachment ${idx + 1}`,
          image: this.normalizeAttachmentPath(rawPath || ''),
        } as { docDetail?: string; image: string };
      })
      .filter(
        (
          x: { docDetail?: string; image: string } | null
        ): x is { docDetail?: string; image: string } => !!x
      );

    if (this.attachmentViewerData.length === 0) {
      this.messageService.add({
        severity: 'info',
        summary: 'No Valid Attachments',
        detail: 'Attachments found but no valid file paths.',
      });
      return;
    }

    this.attachmentViewerTitle = row.text || 'Attachments';
    this.attachmentViewerVisible = true;
    this.cdr.detectChanges();
  }

  closeAttachmentViewer(): void {
    this.attachmentViewerVisible = false;
    this.attachmentViewerData = [];
    this.attachmentViewerTitle = '';
  }

  hasAttachments(item: any): boolean {
    if (!item) return false;

    if (item.attachment && Array.isArray(item.attachment) && item.attachment.length > 0) {
      return true;
    }

    if (item.imageJson) {
      try {
        const parsed =
          typeof item.imageJson === 'string' ? JSON.parse(item.imageJson) : item.imageJson;
        if (Array.isArray(parsed) && parsed.length > 0) {
          return true;
        }
      } catch (e) {
        return false;
      }
    }

    return false;
  }

  isInvalid(controlName: string): boolean {
    const ctrl = this.ticketForm.get(controlName);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  onSubmitTicketForm(): void {
    if (this.ticketForm.invalid) {
      this.ticketForm.markAllAsTouched();
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
    const raw = this.ticketForm.getRawValue();
    const userId = sessionStorage.getItem('userId') || '';
    const today = new Date();
    const formattedToday = this.datePipe.transform(today, 'yyyy-MM-dd')!;

    let fromDate = formattedToday;
    let toDate = formattedToday;
    let imprestAmount = '0';

    if (this.showDateAndImprestFields) {
      fromDate = this.datePipe.transform(raw.fromDate, 'yyyy-MM-dd') || formattedToday;
      toDate = this.datePipe.transform(raw.toDate, 'yyyy-MM-dd') || formattedToday;
      imprestAmount = raw.imprest != null ? String(raw.imprest) : '0';
    }

    const safeAttachments = (this.attachmentArray || [])
      .map((att: any, idx: number) => {
        if (!att) return null;

        let imagePath = '';

        if (typeof att.image === 'string') {
          imagePath = att.image;
        } else if (att.image && typeof att.image === 'object') {
          imagePath =
            att.image.image ||
            att.image.preview ||
            att.image.filePath ||
            att.image.filepath ||
            att.image.url ||
            att.image.path ||
            '';
        }

        return {
          image: imagePath,
          docDetail: att.docDetail || att.description || `Attachment ${idx + 1}`,
          fileSize: att.fileSize ?? null,
        };
      })
      .filter((x: any) => !!x);

    const attachmentJson = JSON.stringify(safeAttachments);
    //const ticketNo = raw.ticketNo || this.tiketNo;

    const addPayload =
      `ticketNo= ''|` +
      `ServiceCategoryId=${raw.serviceCatId}|` +
      `ServiceSubCategoryId=${raw.serviceSubCatId}|` +
      `ServicesubsubCategoryId=${raw.serviceSubSubCatId}|` +
      `IssueDescription=${(raw.issueDescription || '').trim()}|` +
      `fromDate=${fromDate}|` +
      `toDate=${toDate}|` +
      `imprestAmount=${imprestAmount}|` +
      `Image=${attachmentJson}|` +
      `raisedForOrgId=${raw.orgId}|` +
      `appUserId=${userId}`;

    let spName = 'uspPostTicket';
    let finalPayload = addPayload;

    if (this.postType === 'update') {
      const ticketId = this.selectedRow?.id ?? this.selectedRow?.ticketId ?? 0;
      const raisedForOrgId = this.selectedRow?.raisedForOrgId ?? raw.orgId ?? 0;

      finalPayload =
        `ServiceCategoryId=${raw.serviceCatId}|` +
        `ServiceSubCategoryId=${raw.serviceSubCatId}|` +
        `ServicesubsubCategoryId=${raw.serviceSubSubCatId}|` +
        `IssueDescription=${(raw.issueDescription || '').trim()}|` +
        `Image=${attachmentJson}|` +
        `action=UPDATE|` +
        `id=${ticketId}|` +
        `raisedForOrgId=${raisedForOrgId}|` +
        `appUserId=${userId}`;

      spName = 'uspUpdateRaiseTicket';
    }

    this.userService.SubmitPostTypeData(spName, finalPayload, this.FormName).subscribe({
      next: (res: any) => {
        const response = String(res).trim();

        if (response.toLowerCase().startsWith('error occured while processing data')) {
          this.messageService.add({
            severity: 'error',
            summary: 'Server Error',
            detail:
              'Ticket could not be processed. Please contact support with this payload from console.',
          });
          return;
        }

        const [statusCode, ...msg] = response.split('-');
        const message = msg.join('-') || response;

        if (statusCode === '1' || response.toLowerCase().includes('success')) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: message,
          });
          this.getTabelData();
          this.ticketForm.reset();
          this.attachmentArray = [];
          this.visible = false;
          this.selectedRow = null;

          if (this.postType === 'add') {
            // this.getTicketNumber();
          }
        } else {
          this.messageService.add({
            severity: 'warn',
            summary: 'Warning',
            detail: message,
          });
        }
      },
      error: (err) => {
        console.error(`${spName} HTTP error:`, err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.message,
        });
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
    const ticketId = row.id ?? row.ticketId ?? 0;
    const raisedForOrgId = row.raisedForOrgId ?? 0;

    const payload =
      `ServiceCategoryId=0|` +
      `ServiceSubCategoryId=0|` +
      `ServicesubsubCategoryId=0|` +
      `IssueDescription=|` +
      `Image=[]|` +
      `action=DELETE|` +
      `id=${ticketId}|` +
      `raisedForOrgId=${raisedForOrgId}|` +
      `appUserId=${userId}`;

    this.userService.SubmitPostTypeData('uspUpdateRaiseTicket', payload, this.FormName).subscribe({
      next: (res: any) => {
        const response = String(res).trim();
        const [statusCode, ...msg] = response.split('-');
        const message = msg.join('-') || response;

        if (statusCode === '1' || response.toLowerCase().includes('success')) {
          this.messageService.add({
            severity: 'success',
            summary: 'Deleted',
            detail: message || 'Ticket deleted successfully.',
          });
          this.getTabelData();
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: message || 'Failed to delete ticket.',
          });
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('uspUpdateRaiseTicket delete error:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.message || 'Failed to delete ticket.',
        });
      },
    });
  }

  onPageChange(newPage: number): void {
    this.pageNo = newPage;
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize = newSize;
    this.pageNo = 1;
  }
}
