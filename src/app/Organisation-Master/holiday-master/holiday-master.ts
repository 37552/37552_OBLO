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
import { DatePickerModule } from 'primeng/datepicker';

@Component({
  selector: 'app-holiday-master',
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
    BreadcrumbModule,
    DatePickerModule
  ],
  providers: [
    ConfirmationService,
    MessageService
  ],
  templateUrl: './holiday-master.html',
  styleUrl: './holiday-master.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HolidayMaster {
  isLoading = true;
  visible: boolean = false;
  postType: string = '';
  header: any = '';
  selectedIndex: any = [];
  headerIcon: string = 'pi pi-plus';
  paramvaluedata: string = '';
  isFormLoading: boolean = false;
  data: any[] = [];
  holidayForm: FormGroup;
  
  // New fields for holiday master
  holidays: any[] = [];
  holidayTypes: any[] = [];
  regions: any[] = [];

  uploadedImageUrl: string | null = null;
  uploadedMobileImageUrl: string | null = null;
  showImageUploadDialog: boolean = false;
  selectedImageFile: File | null = null;
  selectedMobileImageFile: File | null = null;
  imagePreviewUrl: string | null = null;
  mobileImagePreviewUrl: string | null = null;
  isUploadingImage: boolean = false;
  isUploadingMobileImage: boolean = false;
  currentUploadType: 'image' | 'mobileImage' = 'image';

  @ViewChild('imageFileUpload') imageFileUpload: any;

  columns: TableColumn[] = [
    { key: 'actions', header: '⚙️', isVisible: true, isCustom: true },
    { key: 'holidayDate', header: 'Holiday Date', isVisible: true },
    { key: 'holidayName', header: 'Holiday', isVisible: true },
    { key: 'holidayTypeName', header: 'Holiday Type', isVisible: true },
    { key: 'regionName', header: 'Region', isVisible: true }
  ];

  pageNo = 1;
  pageSize = 5;
  searchText = '';
  totalCount = 0;
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  
  param: string | null = null;
  FormName: any;
  FormValue: any;
  menulabel: any;
  breadcrumbItems!: ({ label: any; disabled?: undefined; } | { label: any; disabled: boolean; })[];
  home: { icon: string; routerLink: string; } | undefined;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private configService: ConfigService,
    private message: MessageService,
    private cdr: ChangeDetectorRef
  ) {
    this.holidayForm = this.fb.group({
      id: [0],
      holidayDate: [null, Validators.required], 
      holidayId: [null, Validators.required],
      holidayTypeId: [null, Validators.required],
      regionId: [null, Validators.required],
      image: [null, Validators.required],
      mobileImage: [null, Validators.required]
    });
  }

  get f() { return this.holidayForm.controls }

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

    this.loadDropdowns();
    this.getTableData(true);
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  loadDropdowns() {
    // Load holidays
    this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblHolidayMaster`).subscribe({
      next: (res: any) => {
        this.holidays = res['table'] || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading holidays:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to load holidays.' });
      }
    });

    // Load holiday types
    this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblHolidayTypeMaster`).subscribe({
      next: (res: any) => {
        this.holidayTypes = res['table'] || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading holiday types:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to load holiday types.' });
      }
    });

    // Load regions
    this.userService.getQuestionPaper(`uspGetFillDrpDown|table=tblRegionMaster`).subscribe({
      next: (res: any) => {
        this.regions = res['table'] || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading regions:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to load regions.' });
      }
    });
  }

  getTableData(isTrue: boolean) {
    if (isTrue) { 
      this.isLoading = true; 
      this.cdr.detectChanges();
    } else {
      this.pageNo = 1;
    }
    
    const currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
    const roleId = currentRole?.roleId || '';
    const userId = sessionStorage.getItem('userId') || '';
    const districtId = sessionStorage.getItem('District') || '';
    
    let query = `appUserId=${userId}|appUserRole=${roleId}|districtId=${districtId}|pageIndex=${this.pageNo}|size=${this.pageSize}|searchText=${this.searchText}`;
    
    this.userService.getQuestionPaper(`uspGetHolidayCalender|${query}`).subscribe({
      next: (res: any) => {
        try {
          this.data = res?.table1 || [];
          this.data = this.data.map(item => ({
            ...item,
            mobileImage: item.mobileImages,
            holidayDate: item.holidayDate,
            holidayName: item.holidayName,
            holidayTypeName: item.holidayType,
            regionName: item.region
          }));
         
          this.totalCount = res?.table?.[0]?.totalCnt || this.data.length;
        } catch (innerErr) {
          console.error('Error processing response:', innerErr);
          this.data = [];
          this.totalCount = 0;
        } finally {
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error loading table data:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to load holidays.' });
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Image upload methods
  openImageUploadDialog(type: 'image' | 'mobileImage') {
    this.currentUploadType = type;
    this.showImageUploadDialog = true;
    if (type === 'image') {
      this.selectedImageFile = null;
      this.imagePreviewUrl = null;
    } else {
      this.selectedMobileImageFile = null;
      this.mobileImagePreviewUrl = null;
    }
    this.cdr.detectChanges();
  }

  closeImageUploadDialog() {
    this.showImageUploadDialog = false;
    this.selectedImageFile = null;
    this.selectedMobileImageFile = null;
    this.imagePreviewUrl = null;
    this.mobileImagePreviewUrl = null;
    this.cdr.detectChanges();
  }

  onImageFileSelect(event: any, type: 'image' | 'mobileImage') {
    if (event.files && event.files.length > 0) {
      const file = event.files[0];
      
      if (type === 'image') {
        this.selectedImageFile = file;
        if (this.selectedImageFile) {
          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.imagePreviewUrl = e.target.result;
            this.cdr.detectChanges();
          };
          reader.readAsDataURL(this.selectedImageFile);
        }
      } else {
        this.selectedMobileImageFile = file;
        if (this.selectedMobileImageFile) {
          const reader = new FileReader();
          reader.onload = (e: any) => {
            this.mobileImagePreviewUrl = e.target.result;
            this.cdr.detectChanges();
          };
          reader.readAsDataURL(this.selectedMobileImageFile);
        }
      }
    }
  }

  clearImageSelection(type: 'image' | 'mobileImage') {
    if (type === 'image') {
      this.selectedImageFile = null;
      this.imagePreviewUrl = null;
      if (this.imageFileUpload) {
        this.imageFileUpload.clear();
      }
    } else {
      this.selectedMobileImageFile = null;
      this.mobileImagePreviewUrl = null;
      if (this.imageFileUpload) {
        this.imageFileUpload.clear();
      }
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

  uploadImage(type: 'image' | 'mobileImage') {
    const selectedFile = type === 'image' ? this.selectedImageFile : this.selectedMobileImageFile;
    
    if (!selectedFile) {
      this.message.add({ severity: 'warn', summary: 'Warning', detail: 'Please select an image file.' });
      return;
    }

    if (type === 'image') {
      this.isUploadingImage = true;
    } else {
      this.isUploadingMobileImage = true;
    }
    
    this.cdr.detectChanges();
    
    const filesArray: File[] = [selectedFile];
    const folderName = type === 'image' ? 'HolidayImages' : 'HolidayMobileImages';
    
    this.userService.MastrtfileuploadNew(filesArray, folderName).subscribe({
      next: (datacom: any) => {
        if (type === 'image') {
          this.isUploadingImage = false;
        } else {
          this.isUploadingMobileImage = false;
        }
        
        const resultarray = datacom.split("-");
        if (resultarray[0] == "1") {
          let uploadedUrl = resultarray[1].toString();
          uploadedUrl = this.normalizeImagePath(uploadedUrl);
          
          if (type === 'image') {
            this.holidayForm.patchValue({
              image: uploadedUrl
            });
            this.uploadedImageUrl = uploadedUrl;
          } else {
            this.holidayForm.patchValue({
              mobileImage: uploadedUrl
            });
            this.uploadedMobileImageUrl = uploadedUrl;
          }
          
          this.showToast('success', `${type === 'image' ? 'Image' : 'Mobile Image'} uploaded successfully!`);
          this.closeImageUploadDialog();
        } else {
          this.openAlertDialog('Error!', resultarray[1].toString());
        }
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        if (type === 'image') {
          this.isUploadingImage = false;
        } else {
          this.isUploadingMobileImage = false;
        }
        
        console.error('Image upload error:', err);
        
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

  removeImage(type: 'image' | 'mobileImage') {
    if (type === 'image') {
      this.holidayForm.patchValue({
        image: ''
      });
      this.uploadedImageUrl = null;
    } else {
      this.holidayForm.patchValue({
        mobileImage: ''
      });
      this.uploadedMobileImageUrl = null;
    }
    this.cdr.detectChanges();
  }

  getFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  isImageFile(filename: string): boolean {
    if (!filename) return false;
    return /\.(jpeg|jpg|png|gif|bmp|svg)$/i.test(filename);
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
      this.header = 'Add Holiday';
      this.headerIcon = 'pi pi-plus';
      this.holidayForm.reset({
        id: 0,
        holidayDate: null
      });
      this.uploadedImageUrl = null;
      this.uploadedMobileImageUrl = null;
      this.isFormLoading = false;
      this.cdr.detectChanges();
    } else {
      this.visible = true;
      this.postType = view;
      this.header = view === 'update' ? 'Update Holiday' : 'View Holiday';
      this.headerIcon = view === 'update' ? 'pi pi-pencil' : 'pi pi-eye';
      this.selectedIndex = data;
      
      if (view === 'view') {
        this.holidayForm.disable();
      } else {
        this.holidayForm.enable();
      }

      const patchData = {
        id: data.id || 0,
        holidayDate: data.holidayDate ? new Date(data.holidayDate) : null,
        holidayId: data.holidayId || null,
        holidayTypeId: data.holidayTypeId || null,
        regionId: data.regionId || null,
        image: data.image || '',
        mobileImage: data.mobileImage || ''
      };

      this.holidayForm.patchValue(patchData);

      // Handle image previews
      if (data.image) {
        this.uploadedImageUrl = this.normalizeImagePath(data.image);
      } else {
        this.uploadedImageUrl = null;
      }

      if (data.mobileImage) {
        this.uploadedMobileImageUrl = this.normalizeImagePath(data.mobileImage);
      } else {
        this.uploadedMobileImageUrl = null;
      }

      this.isFormLoading = false;
      this.cdr.detectChanges();
    }
    document.body.style.overflow = 'hidden';
  }

  onSubmit(event: any) {
    if (!this.holidayForm.valid) {
      this.holidayForm.markAllAsTouched();
      this.cdr.detectChanges();
      return;
    }

    const rawValues = this.holidayForm.getRawValue();
    
    // Convert date back to YYYY-MM-DD string if it's a Date object
    if (rawValues.holidayDate instanceof Date) {
      rawValues.holidayDate = rawValues.holidayDate.toISOString().split('T')[0];
    }
    
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
        } else if (option === '2') {
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
    let SP = 'uspPostHolidayCalender';
    
    query = `${this.paramvaluedata}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${roleID}`;
    
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
            detail: this.postType === 'update' ? 'Holiday Updated Successfully.' : 'Holiday Saved Successfully.',
          });
          this.onDrawerHide();
        } else if (resultarray[0] == "2") {
          this.message.add({ severity: 'warn', summary: 'Warn', detail: resultarray[1] || datacom });
        } else {
          this.message.add({ severity: 'warn', summary: 'Warn', detail: datacom, });
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Submit error:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to save holiday data.' });
        this.isFormLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  deleteData() {
    const roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId || 0;
    let query = `action=DELETE|id=${this.selectedIndex.id || 0}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${roleID}`;
    this.userService.SubmitPostTypeData(`uspDeleteHolidayCalender`, query, 'header').subscribe({
      next: (datacom: any) => {
        this.isFormLoading = false;
        if (!datacom) return;

        const resultarray = datacom.split("-");
        if (resultarray[1] === "success") {
          this.getTableData(true);
          this.message.add({ severity: 'success', summary: 'Success', detail: 'Holiday deleted successfully' });
          this.onDrawerHide();
        } else {
          this.message.add({ severity: 'warn', summary: 'Warn', detail: datacom, });
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Delete error:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete holiday.' });
        this.isFormLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onDrawerHide() {
    document.body.style.overflow = 'visible';
    this.holidayForm.enable();
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
    const control = this.holidayForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onClear() {
    this.holidayForm.reset({
      id: 0,
      holidayDate: null
    });
    this.uploadedImageUrl = null;
    this.uploadedMobileImageUrl = null;
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
}