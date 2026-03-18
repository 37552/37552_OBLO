import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../../shared/user-service';
import { HttpErrorResponse } from '@angular/common/http';
import { Customvalidation } from '../../../shared/Validation';
import { MessageService } from 'primeng/api';
import { dynamicformvalues } from '../../../shared/object-param.model';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { Toast } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-crm-customer-sr-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    TableModule,
    InputTextModule,
    ButtonModule,
    Toast,
    TooltipModule,
  ],
  providers: [MessageService],
  templateUrl: './crm-customer-sr-dashboard.html',
  styleUrl: './crm-customer-sr-dashboard.scss',
})
export class CrmCustomerSrDashboard implements OnInit {
  hoverPrev = false;
  hoverNext = false;
  isMachineModalOpen: boolean = false;
  machineTableData: any[] = [];
  isRatingModalOpen = false;
  selectedRow: any = null;
  rating: number = 0;
  ratingDescription: string = '';
  cardData: any[] = [];
  isModalOpen = false;
  modalTableData: any[] = [];
  filteredRows: any[] = [];
  paginatedRows: any[] = [];
  tableColumns: string[] = [];
  tableMachineColumns: string[] = [];
  searchText: string = '';
  currentPage: number = 1;
  pageSize: number = 5;
  totalPages: number = 1;
  modalType: any;
  appUserId: string = '';
  isLoading: boolean = false;

  constructor(
    private userService: UserService,
    private Customvalidation: Customvalidation,
    private router: Router,
    private messageService: MessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.appUserId = sessionStorage.getItem('userId') || '';
    this.getCustomerDashboard();
  }

  getCustomerDashboard() {
    this.isLoading = true;
    this.userService
      .getQuestionPaper(`uspGetCustomerDashboardData|action=CUSTOMER|appUserId=${this.appUserId}`)
      .subscribe(
        (res: any) => {
          this.cardData = res?.table || [];
          this.isLoading = false;
        },
        (err: HttpErrorResponse) => {
          this.isLoading = false;
          if (err.status === 403) {
            this.Customvalidation.loginroute(err.status);
          } else {
            console.error('Error fetching customer dashboard data', err);
          }
        }
      );
  }

  openModal(card: any, type: any, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.modalType = type;
    this.userService
      .getQuestionPaper(
        `uspGetCustomerDashboardData|action=${type}|appUserId=${this.appUserId}|subGroupId=${card.id}`
      )
      .subscribe(
        (res: any) => {
          this.modalTableData = res?.table || [];
          if (type === 'TICKETDETAILS') {
            this.modalTableData.forEach((item: any) => {
              if (item.machineList) {
                try {
                  item.machineList = JSON.parse(item.machineList);
                } catch (e) {
                  item.machineList = [];
                }
              } else {
                item.machineList = [];
              }
            });
          }
          this.initializeTable();
          // Use setTimeout to avoid ExpressionChangedAfterItHasBeenCheckedError
          setTimeout(() => {
            this.isModalOpen = true;
            this.cdr.detectChanges();
          }, 0);
        },
        (err: HttpErrorResponse) => {
          if (err.status === 403) {
            this.Customvalidation.loginroute(err.status);
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to load data.',
              life: 3000,
            });
          }
        }
      );
  }

  initializeTable() {
    if (this.modalTableData && this.modalTableData.length > 0) {
      this.tableColumns = Object.keys(this.modalTableData[0]);
    }
    this.searchText = '';
    this.currentPage = 1;
    this.applyFilters();
  }

  applyFilters() {
    const term = this.searchText.toLowerCase();
    if (!term) {
      this.filteredRows = [...this.modalTableData];
    } else {
      this.filteredRows = this.modalTableData.filter((row) =>
        Object.values(row).some(
          (v) => v !== null && v !== undefined && String(v).toLowerCase().includes(term)
        )
      );
    }
    this.totalPages = Math.max(1, Math.ceil(this.filteredRows.length / this.pageSize));
    this.paginate();
  }

  paginate() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = this.currentPage * this.pageSize;
    this.paginatedRows = this.filteredRows.slice(start, end);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.paginate();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.paginate();
    }
  }

  closeModal() {
    this.isModalOpen = false;
  }

  onPlusClick(event: Event, card: any) {
    event.stopPropagation();
    const objList = <dynamicformvalues>{};
    const submenuItem = this.setSubmenuItem('C', 'customer-service-request');
    objList.formName = 'Customer Service Requests';
    objList.formValue = 'customer-service-request';
    objList.menu = submenuItem;
    this.userService.Setdynamicformparam(JSON.stringify(objList));

    if (!sessionStorage.getItem('menuItem')) {
      sessionStorage.setItem('menuItem', JSON.stringify(objList));
    } else {
      sessionStorage.removeItem('menuItem');
      sessionStorage.setItem('menuItem', JSON.stringify(objList));
    }

    this.router.navigate(['/home']).then(() => {
      this.router.navigate(['/customer-service-request']);
    });
    sessionStorage.removeItem('empId');
    localStorage.removeItem('EmpId');
  }

  private setSubmenuItem(type: string, defaultmenu = ''): string {
    if (type === 'M') {
      return 'MasterForm';
    }
    if (type === 'T') {
      return 'CustomForm';
    }
    if (type === 'R') {
      return 'ReportForm';
    } else {
      return defaultmenu;
    }
  }

  openRatingModal(row: any, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.selectedRow = row;
    this.rating = 0;
    this.ratingDescription = '';
    this.isRatingModalOpen = true;
  }

  closeRatingModal() {
    this.isRatingModalOpen = false;
  }

  setRating(star: number) {
    this.rating = star;
  }

  submitRating() {
    this.isLoading = true;
    let query = `ticketsId=${this.selectedRow?.ticketId}|ratings=${this.rating}|remarks=${this.ratingDescription}|appUserId=${this.appUserId}`;
    let SP = `uspPostCustomerRatings`;

    this.userService.SubmitPostTypeData(SP, query, 'Customer Service Request').subscribe(
      (datacom: any) => {
        this.isLoading = false;
        if (datacom != '') {
          const resultarray = datacom.split('-');
          if (resultarray[1] == 'success') {
            setTimeout(() => {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Rating submitted successfully.',
                life: 3000,
              });
              this.clearData();
            }, 500);
          } else {
            this.messageService.add({
              severity: 'warn',
              summary: 'Alert',
              detail: resultarray[1] || 'Failed to submit rating.',
              life: 3000,
            });
          }
        }
      },
      (err: HttpErrorResponse) => {
        this.isLoading = false;
        if (err.status === 401) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'You are not authorized!',
            life: 3000,
          });
        } else if (err.status === 403) {
          this.Customvalidation.loginroute(err.status);
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: err.error?.message?.toString() || 'An error occurred',
            life: 3000,
          });
        }
      }
    );
  }

  clearData() {
    this.isRatingModalOpen = false;
    this.rating = 0;
    this.ratingDescription = '';
    this.isMachineModalOpen = false;
    this.isModalOpen = false;
    this.getCustomerDashboard();
  }

  openMachineModal(data: any, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.isModalOpen = false;
    this.machineTableData = data.machineList || [];
    if (this.machineTableData.length > 0) {
      this.tableMachineColumns = Object.keys(this.machineTableData[0]);
    }
    this.isMachineModalOpen = true;
  }

  closeMachineModal() {
    this.isMachineModalOpen = false;
    this.isModalOpen = true;
  }

  getMachineImage(type: string): string {
    if (!type) return 'assets/chpl/tugger.png';

    type = type.toLowerCase().trim();
    switch (type) {
      case 'gobbler ride on':
        return 'assets/chpl/gobbler_ride_on.png';
      case 'moppy':
        return 'assets/chpl/moppy.png';
      case 'chariot scooter':
        return 'assets/chpl/chariot.png';
      case 'tugger':
        return 'assets/chpl/tugger.png';
      case 'gobbler walk along':
        return 'assets/chpl/gobbler_walk_along.png';
      default:
        return 'assets/chpl/tugger.png';
    }
  }

  onImageError(event: any) {
    event.target.src = 'assets/chpl/tugger.png';
  }
}
