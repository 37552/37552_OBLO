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
  selector: 'app-international-commercial-terms',
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
  templateUrl: './international-commercial-terms.html',
  styleUrl: './international-commercial-terms.scss'
})

export class InternationalCommercialTerms {
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
    { key: 'name', header: 'Name', isVisible: true, isSortable: false },
    { key: 'shortCode', header: 'Short Code', isVisible: true, isSortable: false },
    { key: 'fullForm', header: 'Full Form', isVisible: true, isSortable: false },
    { key: 'payMainTransport', header: 'Who pays main transport', isVisible: true, isSortable: false },
    { key: 'payInsurance', header: 'Who pays insurance', isVisible: true, isSortable: false },
    { key: 'clearImportDuties', header: 'Who clears import & duties', isVisible: true, isSortable: false },
    { key: 'description', header: 'Description', isVisible: true, isSortable: false },
    { key: 'jsonDetails', header: 'Seller Responsibilities', isVisible: true, isSortable: false, isCustom: true },
    { key: 'jsonDetails1', header: 'Buyer Responsibilities', isVisible: true, isSortable: false, isCustom: true },
  ];


  pageNo = 1;
  pageSize = 5;
  searchText = '';
  totalCount = 0;
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  buyerSellerData = [];
  buyerMasterData: { drpOption: string; drpValue: number }[] = [];
  sellerMasterData: { drpOption: string; drpValue: number }[] = [];
  childArrData: { drpOption: string; drpValue: number }[] = [];
  childArrData1: { drpOption: string; drpValue: number }[] = [];

  sellerMasterData1 = [];
  buyerMasterData1 = []

  previousGroupType: any;
  selectedrowIndex: any
  selectedItemEdit = null
  slectedEdtIndex = null
  itemDailog: boolean = false
  itemDailog1: boolean = false


  constructor(private fb: FormBuilder,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private message: MessageService,
    public Customvalidation: Customvalidation,
    private cdr: ChangeDetectorRef) {

    this.groupMasterForm1 = this.fb.group({
      name: ['', [Validators.required, noInvalidPipelineName()]],
      shortCode: ['', [Validators.required, noInvalidPipelineName()]],
      fullFormName: ['', [Validators.required, noInvalidPipelineName()]],
      transportId: ['', Validators.required],
      insuranceId: ['', Validators.required],
      dutiesId: ['', Validators.required],
      responsibilitiId: ['', Validators.required],
      BuyerResponsibiliti: ['', Validators.required],
      description: ['', [Validators.required, noInvalidPipelineName()]],
    });

  }

  get f() { return this.groupMasterForm1.controls }


  ngOnInit(): void {
    this.getTableData(true);
    this.getBuyerSellerMaster()
    this.getSellerMaster()
    this.GetBuyerMaster()
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }


  getBuyerSellerMaster() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
    this.userService.getQuestionPaper(`BuyerSellerMaster`).subscribe((res: any) => {
      this.buyerSellerData = res['table'];
    })

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }


  getSellerMaster() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
    this.userService.getQuestionPaper(`uspGetSellerMaster`).subscribe((res: any) => {
      this.sellerMasterData1 = res['table'];
    })

    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 1000);
  }


  GetBuyerMaster() {
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges(); // Fix ExpressionChangedAfterItHasBeenCheckedError
    }, 1000);
    this.userService.getQuestionPaper(`uspGetBuyerMaster`).subscribe((res: any) => {
      this.buyerMasterData1 = res['table'];
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
      const roleId = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
      const query = `appUserId=${sessionStorage.getItem('userId')}|appUserRole=${roleId}|districtId=${sessionStorage.getItem('District')}|searchText=${this.searchText}|pageIndex=${this.pageNo}|size=${this.pageSize}|sortColumn=${this.sortColumn || ''}|sortDirection=${this.sortDirection || ''}|activity=header`;
      this.userService.getQuestionPaper(`uspGetInternationalCommercialTerms|${query}`).subscribe({
        next: (res: any) => {
          try {
            setTimeout(() => {
              this.data = res?.table || [];
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
    this.header = view === 'add' ? 'Add' : view === 'update' ? 'Update' : 'View';
    this.headerIcon = view === 'add' ? 'pi pi-plus' : view === 'update' ? 'pi pi-pencil' : 'pi pi-eye';

    if (view === 'add') {
      this.groupMasterForm1.reset();
      this.groupMasterForm1.enable();
      this.childArrData = [];
      this.childArrData1 = [];
      this.sellerMasterData = [];
      this.buyerMasterData = [];
    } else {
      if (view === 'view') {
        this.groupMasterForm1.disable();
      } else {
        this.groupMasterForm1.enable();
      }

      // Parse Buyer Responsibilities
      let customerTypes: { drpOption: string; drpValue: number }[] = [];
      try {
        const parsedBuyers = JSON.parse(data?.buyerResponsibile || '[]');
        customerTypes = parsedBuyers.map((x: any) => ({
          drpOption: x.Buyer,
          drpValue: x.buyerId
        }));
        this.buyerMasterData = customerTypes;
      } catch (e) {
        console.error('Error parsing buyerResponsibile', e);
        this.buyerMasterData = [];
      }

      // Parse Seller Responsibilities
      let customerTypes1: { drpOption: string; drpValue: number }[] = [];
      try {
        const parsedSellers = JSON.parse(data?.sellerResponsibile || '[]');
        customerTypes1 = parsedSellers.map((x: any) => ({
          drpOption: x.seller,
          drpValue: x.sellerID
        }));
        this.sellerMasterData = customerTypes1;
      } catch (e) {
        console.error('Error parsing sellerResponsibile', e);
        this.sellerMasterData = [];
      }

      // Patch form values
      this.groupMasterForm1.patchValue({
        name: data.name || '',
        shortCode: data.shortCode || '',
        fullFormName: data.fullForm || '',
        transportId: data.payMainTransportId || '',
        insuranceId: data.payInsuranceId || '',
        dutiesId: data.clearImportDutiesId || '',
        description: data.description || '',
        responsibilitiId: customerTypes1, // Seller
        BuyerResponsibiliti: customerTypes // Buyer
      });

      // Store child arrays
      this.childArrData = customerTypes1; // seller
      this.childArrData1 = customerTypes; // buyer
    }

    document.body.style.overflow = 'hidden';
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

    const name = this.groupMasterForm1.get('name')?.value?.trim() || '';
    const shortCode = this.groupMasterForm1.get('shortCode')?.value?.trim() || '';
    const fullFormName = this.groupMasterForm1.get('fullFormName')?.value?.trim() || '';
    let transportId = this.groupMasterForm1.get('transportId')?.value;
    let insuranceId = this.groupMasterForm1.get('insuranceId')?.value;
    let dutiesId = this.groupMasterForm1.get('dutiesId')?.value;
    const description = this.groupMasterForm1.get('description')?.value?.trim() || '';

    const BuyerResponsibiliti = this.groupMasterForm1.get('BuyerResponsibiliti')?.value ?? [];
    const responsibilitysaller = this.groupMasterForm1.get('responsibilitiId')?.value ?? [];


    if (BuyerResponsibiliti.length === 0) {
      this.message.add({
        severity: 'warn',
        summary: 'Warn',
        detail: 'Select at least one Customer Type'
      });
      return;
    }

    const verticalCust = BuyerResponsibiliti.map((c: any) => ({
      buyerId: c.drpValue
    }));

    const verticalCustStr = JSON.stringify(verticalCust);


    if (responsibilitysaller.length === 0) {
      this.message.add({
        severity: 'warn',
        summary: 'Warn',
        detail: 'Select at least one Customer Type'
      });
      return;
    }

    const sallerCust = responsibilitysaller.map((c: any) => ({
      sellerId: c.drpValue
    }));

    const sallerCustStr = JSON.stringify(sallerCust);
    this.paramvaluedata = `name=${name}|shortCode=${shortCode}|fullForm=${fullFormName}|description=${description}|payMainTransprtId=${transportId}|payInsuranceId=${insuranceId}|clearImportDutiesId=${dutiesId}|sellerJson=${sallerCustStr}|buyerJson=${verticalCustStr}`;
    this.openConfirmation('Confirm?', 'Are you sure you want to proceed?', '1', '1', event);
  }


  submitcall() {
    this.isFormLoading = true;
    let query = '';
    let SP = '';

    if (this.postType === 'update') {
      query = `${this.paramvaluedata}|id=${this.selectedIndex.id}|userId=${sessionStorage.getItem('userId')}`;
      SP = `uspUpdateInternationCmrcTerms`;
    }
    else {
      query = `${this.paramvaluedata}|userId=${sessionStorage.getItem('userId')}`;
      SP = `uspPostInterCommercTermDetails`;
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
      } else if (resultarray[0] == "2") {
        this.message.add({ severity: 'warn', summary: 'Warn', detail: resultarray[1] || datacom });
      }
      else {
        this.message.add({ severity: 'warn', summary: 'Warn', detail: datacom, });
      }
    });

  }


  deleteData() {
    let query = `Id=${this.selectedIndex.id}|userId=${sessionStorage.getItem('userId')}`;
    this.userService.SubmitPostTypeData(`uspDeleteInternationCmrcTerms`, query, 'header').subscribe((datacom: any) => {      
      this.isFormLoading = false;
      if (!datacom) return;
      const resultarray = datacom.split("-");
      if (resultarray[1] === "success") {
        this.getTableData(true);
        this.message.add({ severity: 'success', summary: 'Success', detail: 'Data deleted' });
        this.onDrawerHide();
      } else {
        this.message.add({ severity: 'warn', summary: 'Warn', detail: resultarray[1] || datacom, });
      }
    });
  }


  onDeleteRow(data: any, index: number) {
    this.selectedrowIndex = index
    this.openConfirmation("Confirm", "Are you sure want to delete?", '1', '5');
  }


  showGrouplist(data: any) {
    debugger
    this.itemDailog = true;
    try {
      const custArray = JSON.parse(data?.sellerResponsibile || '[]');
      this.groupListArray = custArray.map((x: any) => ({
        seller: x.seller
      }));
      debugger
    } catch (e) {
      console.error('Error parsing customerDetails', e);
      this.groupListArray = [];
    }
  }


  showGrouplist1(data: any) {
    this.itemDailog1 = true;
    try {
      const custArray = JSON.parse(data?.buyerResponsibile || '[]');
      this.groupListArray1 = custArray.map((x: any) => ({
        Buyer: x.Buyer
      }));
    } catch (e) {
      console.error('Error parsing customerDetails', e);
      this.groupListArray1 = [];
    }
  }


}
