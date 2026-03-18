import { Component, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Popover } from 'primeng/popover';
import { Tooltip } from 'primeng/tooltip';
import { DrawerModule } from 'primeng/drawer';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Toast } from 'primeng/toast';
import { ProgressSpinner } from 'primeng/progressspinner';
import { CardModule } from 'primeng/card';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CheckboxModule } from 'primeng/checkbox';
import { TableColumn, TableTemplate } from '../table-template/table-template';
import { UserService } from '../shared/user-service';

@Component({
  selector: 'app-crm-settings',
  standalone: true,
  imports: [
    TableTemplate,
    ButtonModule,
    DrawerModule,
    Popover,
    Tooltip,
    ConfirmDialog,
    Toast,
    ProgressSpinner,
    CardModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    CheckboxModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './crm-settings.html',
  styleUrls: ['./crm-settings.scss']
})
export class CrmSettings{
  isLoading = true;
  visible = false;
  postType: 'add' | 'update' | 'view' = 'add';
  header = '';
  headerIcon = 'pi pi-plus';
  isFormLoading = false;

  data: any[] = [];
  columns: TableColumn[] = [
   { key: 'actions', header: '⚙️', isVisible: true, isSortable: false, isCustom: true },
    { key: 'campaignNaming', header: 'Campaign Naming', isVisible: true, isSortable: false },
    { key: 'autoContactCreation', header: 'Auto Creation Contact', isVisible: true, isSortable: false },
    { key: 'leadDuplicationEmailBased', header: 'allowLeadDuplication', isVisible: true, isSortable: false },
    { key: 'repliedOppoCloseDays', header: 'Close Opportunity Days', isVisible: true, isSortable: false },
    { key: 'quotationValidityDays', header: 'Default Quotation Days', isVisible: true, isSortable: false },
    { key: 'commCommentsCarryForward', header: 'Carry Forward Communication', isVisible: true, isSortable: false },
    { key: 'newCommTimestampUpdate', header: 'Update Timestamp', isVisible: true, isSortable: false }
  ];

  crmSettingsForm: FormGroup;

  pageNo = 1;
  pageSize = 5;
  totalCount = 0;
  searchText = '';
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  paramvaluedata: any;
  selectedIndex: any;
  orgMasterId: any;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private message: MessageService,
    private cdr: ChangeDetectorRef
  ) {
   this.crmSettingsForm = this.fb.group({
  campaignNamingBy: ['', Validators.required],
  autoCreationContact: [false],           // boolean for checkbox
  allowLeadDuplication: [false],
  closeOpportunityDays: [0, Validators.required],
  defaultQuotationDays: [0, Validators.required],
  carryForwardCommunication: [false],
  updateTimestamp: [false]
});

  }

  /** ================== CRUD & TABLE METHODS ================== */


  ngOnInit(): void {
    this.getTableData(true);
  }

  


  getTableData(isTrue: boolean) {
    try {
      if (isTrue) this.isLoading = true;
      else this.pageNo = 1;

      const roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
      const districtId = sessionStorage.getItem('District') || '';
      const userId = sessionStorage.getItem('userId') || '';
      const query = `appUserRole=${roleID}|districtId=${districtId}|appUserId=${userId}|searchText=${this.searchText}|pageIndex=${this.pageNo}|size=${this.pageSize}`;

      this.userService.getQuestionPaper(`uspGetCrmSettings|${query}`).subscribe({
        next: (res: any) => {
          this.data = res?.table1 || [];
          this.totalCount = res?.table?.[0]?.totalCnt || this.data.length;
          setTimeout(() => {
            this.isLoading = false;
            this.cdr.detectChanges();
          }, 500);
        },
        error: (err) => {
          this.isLoading = false;
        }
      });
    } catch {
      this.isLoading = false;
    }
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

  onSortChange(event: { column: string; direction: 'asc' | 'desc' }) {
    this.sortColumn = event.column;
    this.sortDirection = event.direction;
    this.getTableData(true);
  }

  showDialog(mode: 'add' | 'view' | 'update', data?: any) {
  this.isFormLoading = true;
  this.visible = true;
  this.postType = mode;
  this.header = mode === 'add' ? 'Add CRM Setting' : mode === 'update' ? 'Update CRM Setting' : 'View CRM Setting';
  this.headerIcon = mode === 'add' ? 'pi pi-plus' : mode === 'update' ? 'pi pi-pencil' : 'pi pi-eye';

  if (mode !== 'add' && data) {

    // patch values properly, converting 0/1 from backend to boolean

    this.crmSettingsForm.patchValue({
      campaignNamingBy: data.campaignNaming || '',
      autoCreationContact: !!data.autoContactCreation,   
      allowLeadDuplication: !!data.leadDuplicationEmailBased,
      closeOpportunityDays: data.repliedOppoCloseDays || 0,
      defaultQuotationDays: data.quotationValidityDays || 0,
      carryForwardCommunication: !!data.commCommentsCarryForward,
      updateTimestamp: !!data.newCommTimestampUpdate
    });
    this.selectedIndex=data

    if (mode === 'view') this.crmSettingsForm.disable();
    else this.crmSettingsForm.enable();
  } else {
    this.crmSettingsForm.enable();
    this.crmSettingsForm.reset();
  }

  setTimeout(() => {
    this.isFormLoading = false;
    this.cdr.detectChanges();
  }, 200);
}


  

  onDrawerHide() {
    this.visible = false;
    this.crmSettingsForm.enable();
    this.crmSettingsForm.reset();
  }

  onClear() {
    this.crmSettingsForm.reset();
  }

  onSubmit(event: any) {
    
     if (!this.crmSettingsForm.valid) {
      this.crmSettingsForm.markAllAsTouched();
      return;
    }

    const campaignNamingBy = this.crmSettingsForm.get('campaignNamingBy')?.value || 0;
    const autoCreationContact = this.crmSettingsForm.get('autoCreationContact')?.value ? 1:0;
    const allowLeadDuplication = this.crmSettingsForm.get('allowLeadDuplication')?.value ? 1:0;
    const closeOpportunityDays = this.crmSettingsForm.get('closeOpportunityDays')?.value || 0;
    const defaultQuotationDays = this.crmSettingsForm.get('defaultQuotationDays')?.value || 0;
    const carryForwardCommunication = this.crmSettingsForm.get('carryForwardCommunication')?.value ? 1:0;
    const updateTimestamp = this.crmSettingsForm.get('updateTimestamp')?.value ? 1:0;
    const userData = JSON.parse(sessionStorage.getItem('UserInfo') || '{}');
    this.orgMasterId = userData[0].orgMasterId

     this.paramvaluedata =`orgId=${this.orgMasterId}|campaignNaming=${campaignNamingBy}|repliedOppoCloseDays=${closeOpportunityDays}|autoContactCreation=${autoCreationContact}|leadDuplicationEmailBased=${allowLeadDuplication}|quotationValidityDays=${defaultQuotationDays}` +
      `|commCommentsCarryForward=${carryForwardCommunication}|newCommTimestampUpdate=${updateTimestamp}`;

    this.openConfirmation('Confirm?', 'Are you sure you want to proceed?', 'add',);



  }

  openConfirmation(title: string, msg: string, type: string) {
    
    this.confirmationService.confirm({
      message: msg,
      header: title,
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: { label: 'No', severity: 'secondary', outlined: true },
      acceptButtonProps: { label: 'Yes' },
      accept: () => {
        if (type === 'add' || type === 'update') this.submitCall();
        else if (type === 'delete') this.deleteData();
      }
    });
  
  }
submitCall() {
  
    this.isFormLoading = true;
    const userId = sessionStorage.getItem('userId') || '';
    let query = '';
    let SP = '';
    if (this.postType === 'update') {
      SP = `uspUpdateCrmSettings`
      query = `${this.paramvaluedata}|crmSettingId=${this.selectedIndex.crmSettingId}|appUserId=${userId}`
    } else {
      SP = `uspPostCrmSettings`
      query = `${this.paramvaluedata}|appUserId=${userId}`
    }

    this.userService.SubmitPostTypeData(SP, query, 'header').subscribe({
      next: (res: any) => {
        this.isFormLoading = false;
        const result = res.split('-');
        if (result[1] === 'success') {
          this.message.add({
            severity: 'success',
            summary: 'Success',
            detail: this.postType === 'update' ? 'Data Updated Successfully.' : 'Data Saved Successfully.',
            life: 3000
          });
          this.getTableData(false);
          this.onDrawerHide();
        } else {
          this.message.add({ severity: 'warn', summary: 'Warning', detail: result[1], life: 3000 });
        }
      },
      error: () => {
        this.isFormLoading = false;
        this.message.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Something went wrong. Please try again later.',
          life: 3000
        });
      }
    });
  }

   deleteItem(item: any) {
    this.selectedIndex = item;
    this.openConfirmation('Confirm', 'Are you sure want to delete?', 'delete');
  }

  deleteData() {
    this.isFormLoading = true;
    const userId = sessionStorage.getItem('userId') || '';
    const query = `crmSettingId=${this.selectedIndex.crmSettingId}|appUserId=${userId}`;
    this.userService.SubmitPostTypeData('uspDeleteCrmSettings', query, 'header').subscribe({
      next: (res: any) => {
        this.isFormLoading = false;
        const result = res.split('-');
        if (result[1] === 'success') {
          this.message.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Data deleted successfully.',
            life: 3000
          });
          this.getTableData(true);
          this.onDrawerHide();
        } else {
          this.message.add({ severity: 'warn', summary: 'Warning', detail: result[1], life: 3000 });
        }
      },
      error: () => {
        this.isFormLoading = false;
        this.message.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete data.',
          life: 3000
        });
      }
    });
  }




  isInvalid(field: string, form: FormGroup | null | undefined): boolean {


    if (!form || typeof form.get !== 'function') return false;

    const control = form.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

}
