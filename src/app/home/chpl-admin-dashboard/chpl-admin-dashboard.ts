import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core'; // AfterViewInit ki jarurat nahi ab
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { UserService } from '../../shared/user-service';
import { BreadcrumbModule } from 'primeng/breadcrumb';

interface dynamicformvalues {
  formName: string;
  formValue: any;
  menu: any;
}

@Component({
  selector: 'app-chpl-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ChartModule,
    TableModule,
    DialogModule,
    InputTextModule,
    ButtonModule,
    BreadcrumbModule,
  ],
  templateUrl: './chpl-admin-dashboard.html',
  styleUrl: './chpl-admin-dashboard.css',
})
export class ChplAdminDashboard implements OnInit {
  Customvalidation: any;

  // Data Variables
  tickets: any[] = [];
  machinesData: any[] = [];

  // Modal Variables
  isModalOpen: boolean = false;
  modalTableData: any[] = [];
  tableColumns: string[] = [];
  searchText: string = ''; // Modal search functionality
  filteredRows: any[] = [];
  paginatedRows: any[] = [];

  // Chart Data Variables (PrimeNG format)
  serviceResponseChartData: any;
  priorityChartData: any;
  chartOptions: any;
  priorityChartOptions: any;
  breadcrumbItems: any[] = [];
  // breadcrumbItems = [
  //   { label: 'Home', title: 'Crm Admin Dashboard', routerLink: '/crm-admin-dashboard' },
  //   { label: 'Home', routerLink: '/home' },
  //   { label: 'Service Agreement', routerLink: '/service-agreement' },
  // ];

  // Stats
  stats = {
    totalRequests: 0,
    closedRequests: 0,
    openRequests: 0,
  };

  serviceResponse = {
    totalRequests: 0,
    labels: ['< 7 days', '7–15 days', '16–30 days', '> 30 days'],
    values: [0, 0, 0, 0],
    colors: ['#4CAF50', '#FFEB3B', '#FF9800', '#F44336'],
  };

  ticketPriority = {
    labels: [] as string[],
    values: [] as number[],
    colors: ['#4CAF50', '#FF9800', '#F44336'],
  };

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    // Chart options initialization
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false, // Hide legend as we have custom legend
        },
      },
      cutout: '70%', // Doughnut chart thickness
    };

    this.priorityChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false, // Hide legend as we have custom legend on the side
        },
      },
      cutout: '60%',
    };

    // Initial Data Fetching
    this.getDashboard();
    this.getTicketsCount();
    this.getPriorityCount();
    this.getResponseCount();
    this.getTickets();
  }

  // --- Helper Functions for Tailwind Classes ---

  priorityClass(priority: string): string {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-700 border border-red-200';
      case 'medium':
        return 'bg-orange-100 text-orange-700 border border-orange-200';
      case 'low':
        return 'bg-green-100 text-green-700 border border-green-200';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  statusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'closed':
        return 'bg-green-100 text-green-700';
      case 'open':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }

  // --- Data Fetching Methods ---

  getTicketsCount() {
    this.userService
      .getQuestionPaper(
        `uspGetCHPLAdminDashboardData|action=TICKETSCOUNT|appUserId=${sessionStorage.getItem(
          'userId'
        )}`
      )
      .subscribe(
        (res: any) => {
          if (res && res.table && res.table.length > 0) {
            const data = res.table[0];
            this.stats.totalRequests = data.total_count || 0;
            this.stats.openRequests = data.open_count || 0;
            this.stats.closedRequests = data.closed_count || 0;
            // Animation ki jarurat nahi hoti usually modern UI me, but agar chahiye to purana logic use kar sakte hain
          } else {
            // Ensure values are set to 0 if no data
            this.stats.totalRequests = 0;
            this.stats.openRequests = 0;
            this.stats.closedRequests = 0;
          }
        },
        (err: HttpErrorResponse) => {
          // Set default values on error
          this.stats.totalRequests = 0;
          this.stats.openRequests = 0;
          this.stats.closedRequests = 0;
          this.handleError(err);
        }
      );
  }

  getPriorityCount() {
    this.userService
      .getQuestionPaper(
        `uspGetCHPLAdminDashboardData|action=PRIORITYCOUNT|appUserId=${sessionStorage.getItem(
          'userId'
        )}`
      )
      .subscribe(
        (res: any) => {
          if (res && res.table.length > 0) {
            this.ticketPriority.labels = res.table.map((x: any) => x.priorityName);
            this.ticketPriority.values = res.table.map((x: any) => x.total_count);

            // Map colors to match priority labels dynamically
            const colors = this.ticketPriority.labels.map(
              (_: any, i: number) =>
                this.ticketPriority.colors[i % this.ticketPriority.colors.length]
            );

            // Set Data for PrimeNG Chart
            this.priorityChartData = {
              labels: this.ticketPriority.labels,
              datasets: [
                {
                  data: this.ticketPriority.values,
                  backgroundColor: colors,
                  hoverBackgroundColor: colors,
                },
              ],
            };
          }
        },
        (err: HttpErrorResponse) => this.handleError(err)
      );
  }

  getDashboard() {
    this.userService
      .getQuestionPaper(
        `uspGetCHPLAdminDashboardData|action=MACHINETICKETS|appUserId=${sessionStorage.getItem(
          'userId'
        )}`
      )
      .subscribe(
        (res: any) => {
          const data = res?.table || [];
          setTimeout(() => {
            this.machinesData = data;
          }, 0);
        },
        (err: HttpErrorResponse) => this.handleError(err)
      );
  }

  getResponseCount() {
    this.userService
      .getQuestionPaper(
        `uspGetCHPLAdminDashboardData|action=RESPONSETIME|appUserId=${sessionStorage.getItem(
          'userId'
        )}`
      )
      .subscribe(
        (res: any) => {
          if (res && res.table.length > 0) {
            const data = res.table[0];
            this.serviceResponse.values = [
              data['7days'],
              data['7to15days'],
              data['16to30days'],
              data['30days'],
            ];
            this.serviceResponse.totalRequests = data.total_tickets;

            // Set Data for PrimeNG Chart
            this.serviceResponseChartData = {
              labels: this.serviceResponse.labels,
              datasets: [
                {
                  data: this.serviceResponse.values,
                  backgroundColor: this.serviceResponse.colors,
                  hoverBackgroundColor: this.serviceResponse.colors,
                },
              ],
            };
          }
        },
        (err: HttpErrorResponse) => this.handleError(err)
      );
  }

  getTickets() {
    // this.spinner.show();
    const userId = sessionStorage.getItem('userId');

    this.userService
      .getQuestionPaper(`uspGetCHPLAdminDashboardData|action=TICKETDETAILS|appUserId=${userId}`)
      .subscribe(
        (res: any) => {
          //this.spinner.hide();
          if (res && res.table && res.table.length > 0) {
            this.tickets = res.table;
          } else {
            this.tickets = [];
          }
        },
        (err: HttpErrorResponse) => {
          //this.spinner.hide();
          this.handleError(err);
        }
      );
  }

  // --- Modal & Table Logic ---

  openModal(card: any) {
    this.userService
      .getQuestionPaper(
        `uspGetCHPLAdminDashboardData|action=MACHINETICKETSDETAILS|appUserId=${sessionStorage.getItem(
          'userId'
        )}|commonId=${card.id}`
      )
      .subscribe(
        (res: any) => {
          this.modalTableData = res['table'] || [];

          // Parse JSON if needed (legacy logic preserved)
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

          // Dynamic Headers setup
          if (this.modalTableData.length > 0) {
            this.tableColumns = Object.keys(this.modalTableData[0]);
          } else {
            this.tableColumns = [];
          }

          // Initialize filtered and paginated rows for modal table
          this.applyFilters();

          this.isModalOpen = true; // Opens PrimeNG Dialog
        },
        (err: HttpErrorResponse) => this.handleError(err)
      );
  }

  closeModal() {
    this.isModalOpen = false;
  }

  // --- Utility Methods ---

  getMachineImage(type: string): string {
    if (!type) return 'assets/chpl/tugger.png';

    type = type.toLowerCase();
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
        return 'assets/chpl/chpl_logo.png';
    }
  }

  onImageError(event: any) {
    // Use existing logo as fallback instead of non-existent default.png
    event.target.src = 'assets/chpl/gobbler_walk_along.png';
  }

  getKeys(obj: any): string[] {
    if (!obj) return [];
    return Object.keys(obj).filter(
      (key) => key !== 'priority' && key !== 'status' && key !== 'ratings'
    );
  }

  applyFilters(): void {
    const query = (this.searchText || '').toLowerCase().trim();

    if (!this.modalTableData || this.modalTableData.length === 0) {
      this.filteredRows = [];
      this.paginatedRows = [];
      return;
    }

    if (!query) {
      this.filteredRows = [...this.modalTableData];
    } else {
      this.filteredRows = this.modalTableData.filter((row: any) =>
        Object.keys(row).some((key) => {
          if (['ticketId', 'ratings', 'remarks', 'machineList'].includes(key)) {
            return false;
          }
          const value = row[key];
          return (
            value !== null && value !== undefined && String(value).toLowerCase().includes(query)
          );
        })
      );
    }

    this.paginatedRows = [...this.filteredRows];
  }

  // Menu navigation logic
  onPlusClick(event: any, menu: any, page: any, form: any, formvale: any) {
    const objList = <dynamicformvalues>{};
    objList.formName = form;
    objList.formValue = formvale;
    objList.menu = menu;
    this.userService.Setdynamicformparam(JSON.stringify(objList));

    if (sessionStorage.getItem('menuItem')) {
      sessionStorage.removeItem('menuItem');
    }
    sessionStorage.setItem('menuItem', JSON.stringify(objList));

    this.router.navigate(['/home']).then(() => {
      this.router.navigate(['/' + page]);
    });
    sessionStorage.removeItem('empId');
    localStorage.removeItem('EmpId');
  }

  setSubmenuItem(type: string, defaultmenu = '') {
    if (type === 'M') return 'MasterForm';
    if (type === 'T') return 'CustomForm';
    if (type === 'R') return 'ReportForm';
    return defaultmenu;
  }

  handleError(err: HttpErrorResponse) {
    console.error('API Error:', err);
    if (err.status === 403) {
      this.Customvalidation.loginroute(err.status);
    }
  }
}
