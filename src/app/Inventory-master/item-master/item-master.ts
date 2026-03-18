import { Component, ChangeDetectorRef, AfterViewInit, ChangeDetectionStrategy, ViewChild, TemplateRef } from '@angular/core';
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
import { SkeletonModule } from 'primeng/skeleton';
import { MultiSelectModule } from 'primeng/multiselect';
import { DatePickerModule } from 'primeng/datepicker';
import { Drawer } from 'primeng/drawer';

@Component({
  selector: 'app-item-master',
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
    SkeletonModule,
    MultiSelectModule,
    DatePickerModule,
    Drawer
  ],
  providers: [
    ConfirmationService,
    MessageService
  ],
  templateUrl: './item-master.html',
  styleUrl: './item-master.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemMaster {
  isLoading = true;
  visible: boolean = false;
  postType: string = '';
  header: any = '';
  selectedIndex: any = [];
  headerIcon: string = 'pi pi-plus';
  paramvaluedata: string = '';
  isFormLoading: boolean = false;
  data: any[] = [];
  materialForm: FormGroup;
  
  // JSON Details Drawer
  jsonDetailsVisible: boolean = false;
  selectedItemDetails: any = null;
  jsonSectionType: 'vendor' | 'make' | 'company' | 'GST' | null = null;
  
  // Dropdown arrays
  itemTypes: any[] = [];
  itemCategories: any[] = [];
  itemGroups: any[] = [];
  itemSubgroups: any[] = [];
  units: any[] = [];
  itemNatures: any[] = [];
  companies: any[] = [];
  makes: any[] = [];
  vendorTypes: any[] = [];
  vendors: any[] = [];
  taxSlabs: any[] = [];
  gstMasters: any[] = [];
  selectedMakes: any[] = [];
  selectedVendors: any[] = [];
  selectedTaxSlabs: any[] = [];
  selectedGSTs: any[] = [];
  selectedWarranties: any[] = [];
  selectedCompanies: any[] = [];
  vendorsLoading = false;

columns: TableColumn[] = [
  { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true },
  { key: 'itemName', header: 'Item Name', isVisible: true },
  { key: 'itemType', header: 'Item Type', isVisible: true },
  { key: 'itemCategory', header: 'Category', isVisible: true },
  { key: 'itemGroup', header: 'Group', isVisible: true },
  { key: 'itemSubgroup', header: 'Subgroup', isVisible: true },
  { key: 'unit', header: 'Unit', isVisible: true },
  { key: 'HSNCode', header: 'HSN Code', isVisible: true },
  { key: 'size', header: 'Size', isVisible: true },
  { key: 'itemNature', header: 'Nature', isVisible: true },
  { key: 'itemCode', header: 'Item Code', isVisible: false },
  { key: 'isActive', header: 'Status', isVisible: false },
  { key: 'jsonDetails',  header: ' Vendor Details', isVisible: true, isSortable: false, isCustom: true },
  { key: 'jsonDetails1',header: 'Make Details', isVisible: true, isSortable: false, isCustom: true },
  {  key: 'jsonDetails2', header: 'Company Details',  isVisible: true,  isSortable: false,  isCustom: true },
  {  key: 'jsonDetails3', header: 'GST Details',  isVisible: true,  isSortable: false,  isCustom: true },
];
  
  pageNo = 1;
  pageSize = 5;
  searchText = '';
  totalCount = 0;
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  searchTimeout: any;
  debounceTime = 500;
  
 
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
    this.materialForm = this.fb.group({
      id: [0],
      itemName: ['', Validators.required],
      itemTypeId: [null, Validators.required],
      itemCategoryId: [null, Validators.required],
      itemGroupId: [null, Validators.required],
      itemSubgroupId: [null, Validators.required],
      HSNCode: ['', Validators.required],
      unitId: [null, Validators.required],
      size: ['', Validators.required],
      shortDesc: ['', Validators.required],
      longDesc: ['', Validators.required],
      itemNatureId: [null, Validators.required],
      shipTerms: ['', Validators.required],
      freight: ['', Validators.required],
      remarks: ['', Validators.required]
    });
  }

  get f() { return this.materialForm.controls }

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
    this.cdr.detectChanges();
    setTimeout(() => {
      if (this.isLoading) {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    }, 1000);
  }

  loadDropdowns() {
    const dropdownConfigs = [
      { key: 'itemTypes', table: 'tblMaterialType', action: 'ITEMTYPE' },
      { key: 'itemCategories', table: 'tblMaterialCategory' },
      { key: 'itemGroups', table: 'tblMaterialGroupMaster' },
      { key: 'itemSubgroups', table: 'tblMaterialSubgroupMaster' },
      { key: 'units', table: 'tblUnitMaster' },
      { key: 'itemNatures', table: 'tblItemNature' },
      { key: 'companies', table: 'tblOrgMaster' },
      { key: 'makes', table: 'tblMakeMaster' },
      { key: 'vendorTypes', table: 'tblVendorTypeMaster' },
      { key: 'vendors', table: 'tblCustomerMasterHeader' },
      { key: 'taxSlabs', table: 'tblTaxSlabMaster' },
      { key: 'gstMasters', table: 'tblGSTMaster' }
    ];

    dropdownConfigs.forEach(config => {
      if (config.action) {
        this.userService.getQuestionPaper(`uspGetItemsDrpData|id=0|action=${config.action}`).subscribe({
          next: (res: any) => {
            (this as any)[config.key] = res['table'] || [];
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error(`Error loading ${config.key}:`, err);
          }
        });
      } else {
        this.userService.getQuestionPaper(`uspGetFillDrpDown|table=${config.table}`).subscribe({
          next: (res: any) => {
            (this as any)[config.key] = res['table'] || [];
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error(`Error loading ${config.key}:`, err);
          }
        });
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
    
    this.userService.getQuestionPaper(`uspGetMaterialMaster|${query}`).subscribe({
      next: (res: any) => {
        try {
          this.data = res?.table1 || [];
          
          this.data = this.data.map(item => ({
            ...item,
            id: item.transId || item.id,
            itemName: item.itemName || item.text || '',
            itemType: item.itemType || item.materialType || '',
            itemTypeId: item.itemTypeId,
            itemCategory: item.itemCategory || item.materialCategory || '',
            itemCategoryId: item.itemCategoryId,
            itemGroup: item.itemGroup || item.materialGroup || '',
            itemGroupId: item.itemGroupId,
            itemSubgroup: item.itemSubgroup || item.materialSubgroup || '',
            itemSubgroupId: item.itemSubgroupId,
            unit: item.unit || item.unitName || '',
            unitId: item.unitId,
            HSNCode: item.hsnCode || item.HSNCode || '',
            size: item.size || '',
            itemNature: item.itemNature || '',
            itemNatureId: item.itemNatureId,
            shortDesc: item.shortDesc || item.shortDescription || '',
            longDesc: item.longDesc || item.itemDescription || '',
            shipTerms: item.shipTerms || item.shipmentTerm || '',
            freight: item.freight || '',
            remarks: item.remarks || '',
            itemCode: item.itemCode,
            itemNumber: item.itemNumber,
            isActive: item.isActive,
            vendorDetails: item['vendor Details'] ? JSON.parse(item['vendor Details']) : [],
            makeDetails: item['make Details'] ? JSON.parse(item['make Details']) : [],
            companyDetails: item['company Details'] ? JSON.parse(item['company Details']) : [],
            taxDetails: item['taxDetails'] ? JSON.parse(item['taxDetails']) : [] 
          }));
          
          this.totalCount = res?.table?.[0]?.totalCnt || 
                           res?.table1?.[0]?.totalCount || 
                           this.data.length;

        } catch (innerErr) {
          this.data = [];
          this.totalCount = 0;
          this.message.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: 'Failed to process material data.' 
          });
        } finally {
          setTimeout(() => {
            this.isLoading = false;
            this.cdr.detectChanges();
          }, 1000);
        }
      },
      error: (err) => {
        console.error('Error loading table data:', err);
        this.message.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'Failed to load materials.' 
        });
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSearchChange(search: string) {
    this.searchText = search;
    this.pageNo = 1;
    
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    this.searchTimeout = setTimeout(() => {
      this.getTableData(false);
    }, this.debounceTime);
    
    this.cdr.markForCheck();
  }

  clearSearch() {
    this.searchText = '';
    this.pageNo = 1;
    this.getTableData(false);
    this.cdr.markForCheck();
  }

  showDialog(view: string, data: any) {
    this.isFormLoading = true;
    this.cdr.detectChanges();

    if (view == 'add') {
      this.visible = true;
      this.postType = view;
      this.header = 'Add Material';
      this.headerIcon = 'pi pi-plus';
      this.materialForm.reset({ id: 0 });
      this.selectedMakes = [];
      this.selectedVendors = [];
      this.selectedTaxSlabs = [];
      this.selectedGSTs = [];
      this.selectedWarranties = [];
      this.selectedCompanies = [];
      this.isFormLoading = false;
      this.cdr.detectChanges();
    } else {
      this.visible = true;
      this.postType = view;
      this.header = view === 'update' ? 'Update Material' : 'View Material';
      this.headerIcon = view === 'update' ? 'pi pi-pencil' : 'pi pi-eye';
      this.selectedIndex = data;

      if (view === 'view') {
        this.materialForm.disable();
      } else {
        this.materialForm.enable();
      }

      const patchData = {
        id: data.transId || data.id || 0,
        itemName: data.itemName || '',
        itemTypeId: data.itemTypeId || null,
        itemCategoryId: data.itemCategoryId || null,
        itemGroupId: data.itemGroupId || null,
        itemSubgroupId: data.itemSubgroupId || null,
        HSNCode: data.hsnCode || data.HSNCode || '', 
        unitId: data.unitId || null,
        size: data.size || '',
        shortDesc: data.shortDesc || data.shortDescription || '',
        longDesc: data.longDesc || data.longDesc || '', 
        itemNatureId: data.itemNatureId || null,
        shipTerms: data.shipTerms || data.shipmentTerm || '',
        freight: data.freight || '',
        remarks: data.remarks || ''
      };

      this.materialForm.patchValue(patchData);
      
      try {
        if (data.vendorDetails && data.vendorDetails.length > 0) {
          this.selectedVendors = data.vendorDetails.map((vendor: any) => ({
             id: vendor.id || 0,
            vendorTypeId: vendor.vendorTypeId,
            vendorId: vendor.vendorId, 
            partNumber: vendor.partNumber
          }));
        } else {
          this.selectedVendors = [];
        }

        if (data.makeDetails && data.makeDetails.length > 0) {
          this.selectedMakes = data.makeDetails.map((make: any) => ({
             id: make.id || 0,
            makeId: make.makeId,
            code: make.code,
            size: make.size
          }));
        } else {
          this.selectedMakes = [];
        }
        
        let companyDetails = data.companyDetails;
        if (typeof companyDetails === 'string') {
          try {
            companyDetails = JSON.parse(companyDetails);
          } catch (e) {
            console.error('Error parsing companyDetails:', e);
            companyDetails = [];
          }
        }
        
        if (Array.isArray(companyDetails) && companyDetails.length > 0) {
          this.selectedCompanies = companyDetails.map((company: any) => company.companyId);
        } else {
          this.selectedCompanies = [];
        }
        
        if (data.taxDetails && data.taxDetails.length > 0) {
        this.selectedTaxSlabs = data.taxDetails.map((tax: any) => ({
           id: tax.id || 0,
          taxSlabId: tax.taxSlabId, 
          remarks: tax.remarks || '' 
        }));
      } else {
        this.selectedTaxSlabs = [];
      }

      } catch (parseError) {
        console.error('Error parsing nested details:', parseError);
        this.selectedVendors = [];
        this.selectedMakes = [];
        this.selectedCompanies = [];
      }

      this.isFormLoading = false;
      this.cdr.detectChanges();
    }
    document.body.style.overflow = 'hidden';
  }

  onSubmit(event: any) {
    if (!this.materialForm.valid) {
      this.materialForm.markAllAsTouched();
      this.scrollToFirstInvalidControl();
      this.cdr.detectChanges();
      return;
    }
    
    const formData = this.materialForm.getRawValue();

    const itemJSON = [{
      id: formData.id,
      itemName: formData.itemName,
      itemTypeId: formData.itemTypeId,
      itemCategoryId: formData.itemCategoryId,
      itemGroupId: formData.itemGroupId,
      itemSubgroupId: formData.itemSubgroupId,
      hsnCode: formData.HSNCode,
      unitId: formData.unitId,
      size: formData.size,
      shortDesc: formData.shortDesc,
      longDesc: formData.longDesc,
      itemNatureId: formData.itemNatureId,
      shipTerms: formData.shipTerms,
      freight: formData.freight,
      remarks: formData.remarks
    }];

    const vendorJSON = this.selectedVendors.map(vendor => ({
      id:vendor.id || 0,
      vendorTypeId: vendor.vendorTypeId,
      vendorId: vendor.vendorId,
      partNumber: vendor.partNumber
    }));

    const makeJSON = this.selectedMakes.map(make => ({
      id:make.id || 0,
      makeId: make.makeId,
      code: make.code,
      size: make.size
    }));

    const taxSlabJSON = this.selectedTaxSlabs.map(tax => ({
      id:tax.id || 0,
      taxSlabId: tax.taxSlabId,
      remarks: tax.remarks
    }));

    const companyJSON = this.selectedCompanies.map((companyId: any) => ({
      id:companyId.id || 0,
      companyId: companyId
    }));

    this.paramvaluedata = `itemJSON=${JSON.stringify(itemJSON)}|vendorJSON=${JSON.stringify(vendorJSON)}|makeJSON=${JSON.stringify(makeJSON)}|taxSlabJSON=${JSON.stringify(taxSlabJSON)}|companyJSON=${JSON.stringify(companyJSON)}`;
    
    this.openConfirmation('Confirm?', "Are you sure you want to proceed?", '1', '1', event);
  }

  private scrollToFirstInvalidControl() {
    const firstInvalidControlName = this.findFirstInvalidControlName();
    if (firstInvalidControlName) {
      const element = document.querySelector(`input[formControlName="${firstInvalidControlName}"], select[formControlName="${firstInvalidControlName}"], textarea[formControlName="${firstInvalidControlName}"]`) as HTMLElement;
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus({ preventScroll: true });
        element.classList.add('p-invalid');
        setTimeout(() => element.classList.remove('p-invalid'), 3000);
      }
    }
  }

  private findFirstInvalidControlName(): string | null {
    const controls = this.materialForm.controls;
    for (const controlName in controls) {
      const control = controls[controlName];
      if (control.invalid && (control.touched || control.dirty)) {
        return controlName;
      }
    }
    return null;
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
    const districtId = sessionStorage.getItem('District') || '';
    const userId = sessionStorage.getItem('userId') || '';
    const isUpdate = this.postType === 'update';
    const SP = isUpdate ? 'uspPostUpdateMaterialMaster' : 'uspPostMaterialMaster';
    const matHeadId = isUpdate ? (this.selectedIndex.id || 0) : 0;
     let query = '';

  if (isUpdate) {
    query = `matHeadId=${matHeadId}|districtId=${districtId}|appUserId=${userId}|appUserRole=${roleID}|${this.paramvaluedata}}`;
  } else {
    query = `${this.paramvaluedata}|districtId=${districtId}|appUserId=${userId}|appUserRole=${roleID}`;
  }


    this.userService.SubmitPostTypeData(SP, query, 'header').subscribe({
      next: (datacom: any) => {
        this.isFormLoading = false;
        if (!datacom) return;
        const resultarray = datacom.split('-');
        if (resultarray[1] === 'success') {
          this.getTableData(false);
          this.message.add({
            severity: 'success',
            summary: 'Success',
            detail: this.postType === 'update'
              ? 'Material Updated Successfully.'
              : 'Material Saved Successfully.',
          });
          this.onDrawerHide();
        } else if (resultarray[0] === '2') {
          this.message.add({
            severity: 'warn',
            summary: 'Warn',
            detail: resultarray[1] || datacom,
          });
        } else {
          this.message.add({
            severity: 'warn',
            summary: 'Warn',
            detail: datacom,
          });
        }

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Submit error:', err);
        this.message.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to save material data.',
        });
        this.isFormLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  deleteData() {
    const roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId || 0;
    let query = `action=DELETE|id=${this.selectedIndex.id || 0}|appUserId=${sessionStorage.getItem('userId')}|appUserRole=${roleID}`;
    this.userService.SubmitPostTypeData(`uspDeleteMaterialMaster`, query, 'header').subscribe({
      next: (datacom: any) => {
        this.isFormLoading = false;
        if (!datacom) return;
        const resultarray = datacom.split("-");
        if (resultarray[1] === "success") {
          this.getTableData(true);
          this.message.add({ severity: 'success', summary: 'Success', detail: 'Material deleted successfully' });
          this.onDrawerHide();
        } else {
          this.message.add({ severity: 'warn', summary: 'Warn', detail: datacom, });
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Delete error:', err);
        this.message.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete material.' });
        this.isFormLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onDrawerHide() {
    document.body.style.overflow = 'visible';
    this.materialForm.enable();
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

  onSortChange(event: { column: string, direction: 'asc' | 'desc' }) {
    this.sortColumn = event.column;
    this.sortDirection = event.direction;
    this.getTableData(true);
  }

  isInvalid(field: string): boolean {
    const control = this.materialForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onClear() {
    this.materialForm.reset({
      id: 0
    });
    this.selectedMakes = [];
    this.selectedVendors = [];
    this.selectedTaxSlabs = [];
    this.selectedGSTs = [];
    this.selectedWarranties = [];
    this.selectedCompanies = [];
    this.cdr.detectChanges();
  }

  addMake() {
    this.selectedMakes.push({ makeId: null, code: '', size: '' });
  }

  removeMake(index: number) {
    this.selectedMakes.splice(index, 1);
  }

  addVendor() {
    this.selectedVendors.push({ vendorTypeId: null, vendorId: null, partNumber: '' });
  }

  removeVendor(index: number) {
    this.selectedVendors.splice(index, 1);
  }

  addTaxSlab() {
    this.selectedTaxSlabs.push({ taxSlabId: null, remarks: '' });
  }

  removeTaxSlab(index: number) {
    this.selectedTaxSlabs.splice(index, 1);
  }

  addGST() {
    this.selectedGSTs.push({ gstMasterId: null, gstCategory: '' });
  }

  removeGST(index: number) {
    this.selectedGSTs.splice(index, 1);
  }

  addWarranty() {
    this.selectedWarranties.push({ dateFrom: '', dateTo: '', wntyRemarks: '' });
  }

  removeWarranty(index: number) {
    this.selectedWarranties.splice(index, 1);
  }

viewVendorDetails(item: any) {
  this.selectedItemDetails = {
    itemName: item.itemName,
    itemCode: item.itemCode,
    vendorDetails: item.vendorDetails || [],
    makeDetails: [],
    companyDetails: []
  };
  this.jsonSectionType = 'vendor';
  this.jsonDetailsVisible = true;
  this.cdr.detectChanges();
}

viewMakeDetails(item: any) {
  this.selectedItemDetails = {
    itemName: item.itemName,
    itemCode: item.itemCode,
    vendorDetails: [],
    makeDetails: item.makeDetails || [],
    companyDetails: []
  };
  this.jsonSectionType = 'make';
  this.jsonDetailsVisible = true;
  this.cdr.detectChanges();
}

viewCompanyDetails(item: any) {
  this.selectedItemDetails = {
    itemName: item.itemName,
    itemCode: item.itemCode,
    vendorDetails: [],
    makeDetails: [],
    companyDetails: item.companyDetails || []
  };
  this.jsonSectionType = 'company';
  this.jsonDetailsVisible = true;
  this.cdr.detectChanges();
}


GSTDetails(item: any) {
  this.selectedItemDetails = {
    itemName: item.itemName,
    itemCode: item.itemCode,
    vendorDetails: [],
    makeDetails: [],
    companyDetails: [],
    taxDetails: item.taxDetails || []
  };
  this.jsonSectionType = 'GST'; 
  this.jsonDetailsVisible = true;
  this.cdr.detectChanges();
}


  closeJsonDetails() {
    this.jsonDetailsVisible = false;
    this.selectedItemDetails = null;
    this.jsonSectionType = null;
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }
}