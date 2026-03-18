import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from '../../../shared/user-service';
import { Customvalidation } from '../../../shared/Validation';

@Component({
  selector: 'app-chpl-service-engineer-dashboard',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    DialogModule,
    TableModule,
    InputTextModule,
    ChartModule,
    ButtonModule,
  ],
  templateUrl: './chpl-service-engineer-dashboard.html',
  styleUrl: './chpl-service-engineer-dashboard.scss',
})
export class ChplServiceEngineerDashboard {
  machinesData: any[] = [];
  stats: any = {};
  responseTimeData: any;
  priorityData: any;
  chartOptions: any;
  barChartOptions: any;
  serviceResponse = {
    totalRequests: 0,
    labels: ['< 7 days', '7–15 days', '16–30 days', '> 30 days'],
    values: [0, 0, 0, 0],
    colors: ['#4ade80', '#facc15', '#f97316', '#f87171'],
  };

  ticketPriority = {
    labels: [] as string[],
    values: [] as number[],
    colors: ['#94a3b8', '#60a5fa', '#f97316', '#ef4444'],
  };

  isModalOpen: boolean = false;
  selectedMachineType: string = '';
  filteredRows: any[] = [];
  filteredTickets: any[] = [];
  tableColumns: string[] = ['ticketId', 'issue', 'status', 'date', 'requestedBy', 'priority'];
  searchText: string = '';
  tickets: any[] = [];
  priorityChartOptions: any;

  private userId: string = '';

  constructor(
    private userService: UserService,
    private customvalidation: Customvalidation,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initCharts();
    this.initializeChartsWithDefaults();
    this.userId = sessionStorage.getItem('userId') || '';
    if (this.userId) {
      this.loadDashboardData();
    }
  }

  private initializeChartsWithDefaults(): void {
    this.responseTimeData = {
      labels: this.serviceResponse.labels,
      datasets: [
        {
          data: [0, 0, 0, 0],
          backgroundColor: this.serviceResponse.colors,
          hoverBackgroundColor: this.serviceResponse.colors,
        },
      ],
    };
    this.priorityData = {
      labels: [],
      datasets: [
        {
          label: 'Tickets by Priority',
          data: [],
          backgroundColor: [],
          hoverBackgroundColor: [],
        },
      ],
    };
  }

  private loadDashboardData() {
    this.loadTicketsCount();
    this.loadPriorityCount();
    this.loadResponseTime();
    this.loadMachineTickets();
    this.loadTickets();
  }

  private handleAuthError(err: HttpErrorResponse) {
    if (err.status === 401 || err.status === 403) {
      this.customvalidation.loginroute(err.status);
    }
  }

  private loadTicketsCount() {
    const query = `uspGetEngineerDashboardData|action=TICKETSCOUNT|appUserId=${this.userId}|commonId=0`;
    this.userService.getQuestionPaper(query).subscribe(
      (res: any) => {
        const data = res?.table?.[0];
        const data1 = res?.table1?.[0];
        if (!data) {
          this.stats = {
            totalRequests: 0,
            closedRequests: 0,
            openRequests: 0,
            unassignedRequests: 0,
          };
          return;
        }

        this.stats.totalRequests = data.total_count ?? 0;
        this.stats.openRequests = data.open_count ?? 0;
        this.stats.closedRequests = data.closed_count ?? 0;
        this.stats.unassignedRequests = data1?.unassigned_count ?? 0;
      },
      (err: HttpErrorResponse) => this.handleAuthError(err)
    );
  }

  getMachineImage(type: string): string {
    if (!type) return 'assets/chpl/gobbler_walk_along.png';

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
        return 'assets/chpl/gobbler_walk_along.png';
    }
  }

  onImageError(event: any) {
    event.target.src = 'assets/chpl/gobbler_walk_along.png';
  }
  private loadPriorityCount() {
    const query = `uspGetEngineerDashboardData|action=PRIORITYCOUNT|appUserId=${this.userId}|commonId=0`;
    this.userService.getQuestionPaper(query).subscribe(
      (res: any) => {
        const rows = res?.table || [];
        if (!rows.length) {
          this.ticketPriority.labels = [];
          this.ticketPriority.values = [];
          this.priorityData = null;
          return;
        }
        this.ticketPriority.labels = rows.map((x: any) => x.priorityName);
        this.ticketPriority.values = rows.map((x: any) => x.total_count ?? 0);

        const colors = this.ticketPriority.labels.map(
          (_: any, i: number) => this.ticketPriority.colors[i % this.ticketPriority.colors.length]
        );

        this.priorityData = {
          labels: this.ticketPriority.labels,
          datasets: [
            {
              label: 'Tickets by Priority',
              data: this.ticketPriority.values,
              backgroundColor: colors,
              hoverBackgroundColor: colors,
            },
          ],
        };
      },
      (err: HttpErrorResponse) => this.handleAuthError(err)
    );
  }

  private loadResponseTime() {
    const query = `uspGetEngineerDashboardData|action=RESPONSETIME|appUserId=${this.userId}|commonId=0`;
    this.userService.getQuestionPaper(query).subscribe(
      (res: any) => {
        const data = res?.table?.[0];
        if (!data) {
          this.serviceResponse.values = [0, 0, 0, 0];
          this.serviceResponse.totalRequests = 0;
        } else {
          this.serviceResponse.values = [
            data['7days'] ?? 0,
            data['7to15days'] ?? 0,
            data['16to30days'] ?? 0,
            data['30days'] ?? 0,
          ];
          this.serviceResponse.totalRequests = data.total_tickets ?? 0;
        }
        this.responseTimeData = {
          labels: [...this.serviceResponse.labels],
          datasets: [
            {
              data: [...this.serviceResponse.values],
              backgroundColor: [...this.serviceResponse.colors],
              hoverBackgroundColor: [...this.serviceResponse.colors],
            },
          ],
        };
        setTimeout(() => {
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        }, 0);
      },
      (err: HttpErrorResponse) => {
        this.handleAuthError(err);
      }
    );
  }

  private loadMachineTickets() {
    const query = `uspGetEngineerDashboardData|action=MACHINETICKETS|appUserId=${this.userId}|commonId=0`;
    this.userService.getQuestionPaper(query).subscribe(
      (res: any) => {
        const rows = res?.table || [];
        this.machinesData = rows.map((r: any) => ({
          ...r,
          machineType: r.machineType,
          colour: r.colour || '#3b82f6',
          ticketCount: r.ticketCount ?? 0,
          id: r.id,
          commonId: r.commonId ?? r.id,
        }));
      },
      (err: HttpErrorResponse) => this.handleAuthError(err)
    );
  }

  initCharts() {
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false, // Hide legend as we have custom legend
        },
      },
      cutout: '70%',
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

    this.barChartOptions = {
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: '#f3f4f6' },
        },
        x: {
          grid: { display: false },
        },
      },
    };
  }

  openModal(card: any) {
    this.selectedMachineType = card.machineType;
    this.isModalOpen = true;
    const commonId = card.commonId ?? card.id;
    this.loadTicketsForMachine(commonId);
  }

  loadTicketsForMachine(commonId: any) {
    if (!commonId || !this.userId) {
      this.filteredRows = [];
      return;
    }

    const query = `uspGetEngineerDashboardData|action=MACHINETICKETSDETAILS|appUserId=${this.userId}|commonId=${commonId}`;
    this.userService.getQuestionPaper(query).subscribe(
      (res: any) => {
        let rows = res?.table || [];
        rows = rows.map((item: any) => {
          if (item.machineList) {
            try {
              item.machineList = JSON.parse(item.machineList);
            } catch {
              item.machineList = [];
            }
          } else {
            item.machineList = [];
          }
          return item;
        });

        this.filteredRows = rows;
        if (this.filteredRows.length) {
          this.tableColumns = Object.keys(this.filteredRows[0]);
        }
      },
      (err: HttpErrorResponse) => this.handleAuthError(err)
    );
  }

  closeModal() {
    this.isModalOpen = false;
  }

  onClickCard(type: string) {
    if (type === 'open') {
      this.router.navigate(['/my-jobs']);
    } else if (type === 'unassigned') {
      this.router.navigate(['/unassigned-requests']);
    }
  }

  shouldShowColumn(col: string): boolean {
    const hiddenCols = ['ticketId', 'ratings', 'remarks', 'machineList'];
    return !hiddenCols.includes(col);
  }

  applyFilters() {
    const searchTerm = this.searchText.toLowerCase().trim();
    if (!searchTerm) {
      this.filteredTickets = [...this.tickets];
    } else {
      this.filteredTickets = this.tickets.filter((ticket) =>
        this.tableColumns.some((col) => {
          const value = ticket[col];
          return (
            value !== null &&
            value !== undefined &&
            String(value).toLowerCase().includes(searchTerm)
          );
        })
      );
    }
  }

  createNewRequest() {
    // Navigate to create new request page
    this.router.navigate(['/service-request']);
  }

  getPriorityClass(priority: string): string {
    if (!priority) return 'bg-gray-100 text-gray-600';
    const p = priority.toLowerCase();
    if (p.includes('high')) return 'bg-red-100 text-red-700';
    if (p.includes('medium')) return 'bg-yellow-100 text-yellow-700';
    if (p.includes('low')) return 'bg-green-100 text-green-700';
    if (p.includes('very low')) return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-600';
  }

  getStatusClass(status: string): string {
    if (!status) return 'bg-gray-100 text-gray-600';
    const s = status.toLowerCase();
    if (s === 'open') return 'bg-red-100 text-red-700';
    if (s === 'closed') return 'bg-green-100 text-green-700';
    if (s === 'in progress' || s === 'in-progress') return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-600';
  }

  private loadTickets() {
    const query = `uspGetEngineerDashboardData|action=TICKETDETAILS|appUserId=${this.userId}|commonId=0`;
    this.userService.getQuestionPaper(query).subscribe(
      (res: any) => {
        this.tickets = res?.table || [];
        this.filteredTickets = [...this.tickets];
        if (this.tickets.length > 0) {
          const firstTicket = this.tickets[0];
          this.tableColumns = Object.keys(firstTicket).filter(
            (key) => !['ratings', 'remarks', 'machineList'].includes(key)
          );
        }
      },
      (err: HttpErrorResponse) => this.handleAuthError(err)
    );
  }

  getVisibleColumnsCount(): number {
    return this.tableColumns.filter((col) => this.shouldShowColumn(col)).length + 3; // +3 for Priority, Status, Customer Ratings
  }
}
