import { Component, ChangeDetectorRef, AfterViewInit, ChangeDetectionStrategy, ViewChild } from '@angular/core';
import { TableTemplate, TableColumn } from '../../table-template/table-template';
import { ButtonModule } from 'primeng/button';
import { Popover } from 'primeng/popover';
import { Tooltip } from "primeng/tooltip";
import { Dialog } from 'primeng/dialog';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CardModule } from 'primeng/card';
import { DrawerModule } from 'primeng/drawer';
import { UserService } from '../../shared/user-service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Toast } from 'primeng/toast';
import { FileUploadModule } from 'primeng/fileupload';
import { HttpErrorResponse } from '@angular/common/http';
import { ConfigService } from '../../shared/config.service';
import { OnlyNumberDirective } from '../../shared/directive/only-number.directive';
import { BreadcrumbModule } from 'primeng/breadcrumb';



@Component({
  selector: 'app-organisation-profile',
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
      InputTextModule,
      InputNumberModule,
      ConfirmDialog,
      ProgressSpinner,
      Toast,
      Tooltip,
      FileUploadModule,
      Dialog,
      OnlyNumberDirective,
      BreadcrumbModule 

    ],
  providers: [
    ConfirmationService,
    MessageService

  ],
  templateUrl: './organisation-profile.html',
  styleUrl: './organisation-profile.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganisationProfile implements AfterViewInit {
  isLoading = true;
  visible: boolean = false;
  postType: string = '';
  header: any = '';
  selectedIndex: any = [];
  headerIcon: string = 'pi pi-plus';
  paramvaluedata: string = '';
  isFormLoading: boolean = false;
  data: any[] = [];
  organisationProfileForm: FormGroup;
  uploadedLogoUrl: string | null = null;
  showLogoUploadDialog: boolean = false;
  selectedLogoFile: File | null = null;
  logoPreviewUrl: string | null = null;
  isUploadingLogo: boolean = false;
  showKycSidebar: boolean = false;
  kycDocuments: any[] = [];
  kycSupportingDocs: any[] = [];
  selectedKycDocument: any = null;
  selectedKycSupportingDoc: any = null;
  kycDocJson: any[] = [];
  selectedKycFile: File | null = null;
  kycFilePreviewUrl: string | null = null;
  isUploadingKyc: boolean = false;
  orgCategoryDrp: any[] = [];
  @ViewChild('fileUpload') fileUpload: any;
  @ViewChild('logoFileUpload') logoFileUpload: any;
  @ViewChild('kycFileUpload') kycFileUpload: any;

  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true },
    { key: 'orgategoryname', header: 'Organisation Category', isVisible: true, isSortable: false },
    { key: 'websiteUrl', header: 'Website URL', isVisible: true, isSortable: false },
    { key: 'panNo', header: 'PAN No', isVisible: true, isSortable: false },
    { key: 'cinNo', header: 'CIN No', isVisible: true, isSortable: false },
    { key: 'noticePeriod', header: 'Notice Period', isVisible: true, isSortable: false },
    { key: 'probationPeriod', header: 'probation Period', isVisible: true, isSortable: false },
    { key: 'probationNotice', header: 'probation Notice', isVisible: true, isSortable: false },
    { key: 'phoneNo', header: 'phone No', isVisible: true, isSortable: false },
    { key: 'address', header: 'Address', isVisible: true, isSortable: false }
  ];

  pageNo = 1;
  pageSize = 5;
  searchText = '';
  totalCount = 0;
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  DocumentNumber: any;
 param: string | null = null;
  FormName: any;
  FormValue: any;
  menulabel: any;
  breadcrumbItems!: ({ label: any; disabled?: undefined; } | { label: any; disabled: boolean; })[];
  home: { icon: string; routerLink: string; } | undefined;

  constructor(private fb: FormBuilder,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private configService: ConfigService,
    private message: MessageService,
    private cdr: ChangeDetectorRef) {
    this.organisationProfileForm = this.fb.group({
      orgCategoryId: [null, Validators.required],
      websiteUrl: ['', Validators.required],
      panNo: ['', Validators.required],
      cinNo: ['', Validators.required],
      orgLogo: ['', Validators.required],
      kycDocJson: ['', Validators.required],
      noticePeriod: [null, Validators.required],
      probationPeriod: [null, Validators.required],
      probationNotice: [null, Validators.required],
      phoneNo: ['', Validators.required],
      address: ['', Validators.required],
    });
  }

  get f() { return this.organisationProfileForm.controls }

  ngAfterViewInit(): void {
    // Post-view init logic if needed
  }

ngOnInit(): void {
  this.param = sessionStorage.getItem("menuItem");
  if (this.param) {
    let paramjs = JSON.parse(this.param);
    this.FormName = paramjs.formName;
    this.FormValue = paramjs.formValue;
    this.menulabel = paramjs.menu;
  }
  this.breadcrumbItems = [
    { label: this.menulabel },
    { label: this.FormName, disabled: true }
  ];

  this.loadOrgCategoryDropdown();
  this.loadKycDocuments();
  this.getTableData(true);
  this.isLoading = false;
  this.cdr.detectChanges();
}


  loadOrgCategoryDropdown() {
    this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblOrganisationCategoryMaster`).subscribe({
      next: (res: any) => {
        this.orgCategoryDrp = res['table'] || [];
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Error loading org categories:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to load organisation categories.' });
      }
    });
  }

  loadKycDocuments() {
    this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblKycDocumentsMaster`).subscribe({
      next: (res: any) => {
        this.kycDocuments = res['table'] || [];
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Error loading KYC documents:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to load KYC documents.' });
      }
    });
  }

  loadKycSupportingDocs() {
    this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblKycSupportingDocMaster`).subscribe({
      next: (res: any) => {
        this.kycSupportingDocs = res['table'] || [];
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Error loading KYC supporting docs:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to load KYC supporting documents.' });
      }
    });
  }

  isImage(filename: string): boolean {
    if (!filename) {
      return false;
    }
    const fullUrl = this.normalizeImagePath(filename);
    const cleanUrl = fullUrl.split('?')[0];
    return /\.(jpeg|jpg|png|gif|bmp|svg)$/i.test(cleanUrl);
  }

  isImageFile(filename: string): boolean {
    if (!filename) return false;
    return /\.(jpeg|jpg|png|gif|bmp|svg)$/i.test(filename);
  }

  openLogoUploadDialog() {
    this.showLogoUploadDialog = true;
    this.selectedLogoFile = null;
    this.logoPreviewUrl = null;
    this.cdr.detectChanges();
  }

  closeLogoUploadDialog() {
    this.showLogoUploadDialog = false;
    this.selectedLogoFile = null;
    this.logoPreviewUrl = null;
    this.cdr.detectChanges();
  }

  onLogoFileSelect(event: any) {
    if (event.files && event.files.length > 0) {
      this.selectedLogoFile = event.files[0];
      if (this.selectedLogoFile) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.logoPreviewUrl = e.target.result;
          this.cdr.detectChanges();
        };
        reader.readAsDataURL(this.selectedLogoFile);
      }
    }
  }

  clearLogoSelection() {
    this.selectedLogoFile = null;
    this.logoPreviewUrl = null;
    if (this.logoFileUpload) {
      this.logoFileUpload.clear();
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


  uploadLogo() {
    if (!this.selectedLogoFile) {
      this.message.add({ severity: 'warn', summary: 'Warning', detail: 'Please select a logo file.' });
      return;
    }
    this.isUploadingLogo = true;
    this.cdr.detectChanges();
    const filesArray: File[] = [this.selectedLogoFile];
    const folderName = 'OrganisationLogo';
    this.userService.MastrtfileuploadNew(filesArray, folderName).subscribe({
      next: (datacom: any) => {
        this.isUploadingLogo = false;
        const resultarray = datacom.split("-");
        if (resultarray[0] == "1") {
          let uploadedUrl = resultarray[1].toString();
          uploadedUrl = this.normalizeImagePath(uploadedUrl);
          this.organisationProfileForm.patchValue({
            orgLogo: uploadedUrl
          });
          this.uploadedLogoUrl = uploadedUrl;
          this.showToast('success', 'Logo uploaded successfully!');
          this.closeLogoUploadDialog();
        } else {
          this.openAlertDialog('Error!', resultarray[1].toString());
        }
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.isUploadingLogo = false;
        console.error('Logo upload error:', err);
        
        if (err.status == 401) {
          this.openAlertDialog('Error!', "You are not authorized!");
        } else if (err.status == 403) {
          this.openAlertDialog('Error!', "Access forbidden!");
        } else {
          this.openAlertDialog('Error!', err.message.toString());
        }
        this.cdr.detectChanges();
      }
    });
  }
   
  removeLogo() {
    this.organisationProfileForm.patchValue({
      orgLogo: ''
    });
    this.uploadedLogoUrl = null;
    this.cdr.detectChanges();
  }

  getFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  onKycFileSelect(event: any) {
    if (event.files && event.files.length > 0) {
      this.selectedKycFile = event.files[0];
      if (this.selectedKycFile && this.isImageFile(this.selectedKycFile.name)) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.kycFilePreviewUrl = e.target.result;
          this.cdr.detectChanges();
        };
        reader.readAsDataURL(this.selectedKycFile);
      } else {
        this.kycFilePreviewUrl = null;
      }
      
      this.cdr.detectChanges();
    }
  }

  clearKycFileSelection() {
    this.selectedKycFile = null;
    this.kycFilePreviewUrl = null;
    if (this.kycFileUpload) {
      this.kycFileUpload.clear();
    }
    this.cdr.detectChanges();
  }

  uploadKycDocument() {
    if (!this.selectedKycDocument) {
      this.message.add({ 
        severity: 'warn', 
        summary: 'Warning', 
        detail: 'Please select KYC document type.' 
      });
      return;
    }
    
    if (!this.selectedKycSupportingDoc) {
      this.message.add({ 
        severity: 'warn', 
        summary: 'Warning', 
        detail: 'Please select supporting document type.' 
      });
      return;
    }
    
    if (!this.selectedKycFile) {
      this.message.add({ 
        severity: 'warn', 
        summary: 'Warning', 
        detail: 'Please select a file to upload.' 
      });
      return;
    }
    
    this.isUploadingKyc = true;
    this.cdr.detectChanges();
    const filesArray: File[] = [this.selectedKycFile];
    const folderName = 'KYCDocuments';
    this.userService.MastrtfileuploadNew(filesArray, folderName).subscribe({
      next: (datacom: any) => {
        this.isUploadingKyc = false;
        const resultarray = datacom.split("-");
        if (resultarray[0] == "1") {
          this.showToast('success', 'KYC Document Uploaded Successfully!');
          let docUrl = resultarray[1].toString();
          docUrl = this.normalizeImagePath(docUrl);
          const kycEntry = {
            id:0,
            kycId: this.selectedKycDocument,
            kycSupportingDocId: this.selectedKycSupportingDoc,
            docUrl: docUrl,
            docNumber: this.DocumentNumber
          };
          this.kycDocJson.push(kycEntry);
          this.organisationProfileForm.patchValue({
            kycDocJson: JSON.stringify(this.kycDocJson)
          });
          this.clearKycFileSelection();
          this.selectedKycDocument = null;
          this.selectedKycSupportingDoc = null;
          this.DocumentNumber=null
          this.cdr.detectChanges();
        } else {
          this.openAlertDialog('Error!', resultarray[1].toString());
        }
        
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        this.isUploadingKyc = false;
        console.error('KYC upload error:', err);
        
        if (err.status == 401) {
          this.openAlertDialog('Error!', "You are not authorized!");
        } else if (err.status == 403) {
          this.openAlertDialog('Error!', "Access forbidden!");
        } else {
          this.openAlertDialog('Error!', err.message.toString());
        }
        this.cdr.detectChanges();
      }
    });
  }

getKycDocLabel(docId: number): string {
  const doc = this.kycDocuments.find(d => d.drpValue === docId);
  return doc ? doc.drpOption : 'Unknown';
}

getKycSupportingDocLabel(docId: number): string {
  const doc = this.kycSupportingDocs.find(d => d.drpValue === docId);
  return doc ? doc.drpOption : 'Unknown';
}


  openKycSidebar() {
    this.loadKycSupportingDocs();
    this.showKycSidebar = true;
    this.cdr.detectChanges();
  }

  closeKycSidebar() {
    this.showKycSidebar = false;
    this.selectedKycDocument = null;
    this.selectedKycSupportingDoc = null;
    this.clearKycFileSelection();
    this.cdr.detectChanges();
  }

  removeKycEntry(index: number) {
    this.kycDocJson.splice(index, 1);
    this.organisationProfileForm.patchValue({
      kycDocJson: JSON.stringify(this.kycDocJson)
    });
    this.cdr.detectChanges();
  }

  showToast(severity: string, summary: string) {
    this.message.add({ severity, summary });
  }

  openAlertDialog(title: string, message: string) {
    this.confirmationService.confirm({
      message: message,
      header: title,
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
      }
    });
  }

getTableData(isTrue: boolean) {
  if (isTrue) { 
    this.isLoading = true; 
    this.cdr.detectChanges();
  } else {
    this.pageNo = 1
  }
  const roleId = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId || 0;
  const query = `appUserId=${sessionStorage.getItem('userId')}`;
  this.userService.getQuestionPaper(`uspGetOrganisationProfile|${query}`).subscribe({
    next: (res: any) => {
      if (res?.table && res.table.length > 0) {
        this.data = res.table.map((item: any) => ({
          orgId: item.id,
          orgategoryname: item.orgategory,
          orgCategoryId: item.orgCategoryId,
          orgCategory: item.orgategory,
          websiteUrl: item.websiteUrl,
          panNo: item.pan,
          cinNo: item.cin,
          orgLogo: item.orgLogo,
          noticePeriod: item.noticePeriod,
          probationPeriod: item.probation,
          probationNotice: item.probationNotice,
          phoneNo: item.phone,
          address: item.address,
          kycDocJson: res.table1 || []
        }));
      } else {
        this.data = [];
      }
      this.totalCount = this.data.length;
      this.isLoading = false;
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error('Error loading table data:', err);
      this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to load organisation profiles.' });
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  });
}
openImagePreview(imageUrl: string) {
  window.open(imageUrl, '_blank');
}
showDialog(view: string, data: any) {
  this.isFormLoading = true;
  this.cdr.detectChanges();
  
  if (view == 'add') {
    this.visible = true;
    this.postType = view;
    this.header = 'Add Organisation Profile';
    this.headerIcon = 'pi pi-plus';
    this.organisationProfileForm.reset();
    this.uploadedLogoUrl = null;
    this.kycDocJson = [];
    this.isFormLoading = false;
    this.cdr.detectChanges();
  } else {
    this.visible = true;
    this.postType = view;
    this.header = view === 'update' ? 'Update Organisation Profile' : 'View Organisation Profile';
    this.headerIcon = view === 'update' ? 'pi pi-pencil' : 'pi pi-eye';
    this.selectedIndex = data;
    
    if (view === 'view') {
      this.organisationProfileForm.disable();
    } else {
      this.organisationProfileForm.enable();
    }

    const patchData = {
      orgCategoryId: data.orgCategoryId || null,
      websiteUrl: data.websiteUrl || '',
      panNo: data.panNo || '',
      cinNo: data.cinNo || '',
      orgLogo: data.orgLogo || '',
      kycDocJson: data.kycDocJson ? JSON.stringify(data.kycDocJson) : '',
      noticePeriod: data.noticePeriod || null,
      probationPeriod: data.probationPeriod || null,
      probationNotice: data.probationNotice || null,
      phoneNo: data.phoneNo || '',
      address: data.address || '',
    };

    this.organisationProfileForm.patchValue(patchData);

    // Handle logo preview
    if (data.orgLogo) {
      this.uploadedLogoUrl = this.normalizeImagePath(data.orgLogo);
    } else {
      this.uploadedLogoUrl = null;
    }

    if (data.kycDocJson && Array.isArray(data.kycDocJson)) {
      this.kycDocJson = data.kycDocJson.map((kyc: any) => ({
        id: kyc.id,
        kycId: kyc.kycId,
        kycSupportingDocId: kyc.kycSupportingDocId,
        docUrl: kyc.docUrl,
        docNumber: kyc.documentNo
      }));
    } else {
      this.kycDocJson = [];
    }

    this.isFormLoading = false;
    this.cdr.detectChanges();
  }
  document.body.style.overflow = 'hidden';
}

  onSubmit(event: any) {
    if (!this.organisationProfileForm.valid) {
      this.organisationProfileForm.markAllAsTouched();
      this.cdr.detectChanges();
      return;
    }

    const rawValues = this.organisationProfileForm.getRawValue();
    Object.keys(rawValues).forEach(key => {
      if (rawValues[key] === null || rawValues[key] === undefined) {
        rawValues[key] = '';
      }
    });
    
    this.paramvaluedata = Object.entries(rawValues)
      .map(([key, value]) => `${key}=${value}`)
      .join('|');

    this.openConfirmation('Confirm?', "Are you sure you want to proceed?", '1', '1', event);
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
      },
      reject: () => {
      }
    });
  }

  submitcall() {
    this.isFormLoading = true;
    this.cdr.detectChanges();
    const roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId || 0;
    let query = '';
    let SP = '';

    if (this.postType === 'update') {
      query = `${this.paramvaluedata}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${roleID}`;
      SP = `uspPostOrganisationProfile`;
    }
    else {
      query = `${this.paramvaluedata}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${roleID}`;
      SP = `uspPostOrganisationProfile`;
    }
    this.userService.SubmitPostTypeData(SP, query, 'header').subscribe({
      next: (datacom: any) => {
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
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Submit error:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to save data.' });
        this.isFormLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  deleteData() {
    const roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId || 0;
    let query = `action=DELETE|orgId=${this.selectedIndex.orgId || 0}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${roleID}`;
    this.userService.SubmitPostTypeData(`uspDeleteOrganisationProfile`, query, 'header').subscribe({
      next: (datacom: any) => {
        this.isFormLoading = false;
        if (!datacom) return;

        const resultarray = datacom.split("-");
        if (resultarray[1] === "success") {
          this.getTableData(true);
          this.message.add({ severity: 'success', summary: 'Success', detail: 'Data deleted' });
          this.onDrawerHide();
        } else {
          this.message.add({ severity: 'warn', summary: 'Warn', detail: datacom, });
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Delete error:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete data.' });
        this.isFormLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onDrawerHide() {
    document.body.style.overflow = 'visible';
    this.organisationProfileForm.enable();
    this.visible = false;
    this.onClear();
    this.cdr.detectChanges();
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



  isInvalid(field: string): boolean {
    const control = this.organisationProfileForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onClear() {
    this.organisationProfileForm.reset();
    this.uploadedLogoUrl = null;
    this.kycDocJson = [];
    this.cdr.detectChanges();
  }
}