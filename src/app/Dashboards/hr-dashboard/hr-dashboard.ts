import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { UserService } from '../../shared/user-service';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Customvalidation } from '../../shared/Validation';
import { ChartConfiguration, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';


@Component({
  selector: 'app-hr-dashboard',
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TableModule,
    TagModule,
    AvatarModule,
    BaseChartDirective
  ],
  providers: [DatePipe],
  standalone: true,
  templateUrl: './hr-dashboard.html',
  styleUrl: './hr-dashboard.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})



export class HrDashboard {
  attendanceData: any[] = [];
  attendanceSourceData: any[] = [];
  pendingRequest: any[] = [];
  ExceptionData: any[] = [];

  pieChartData: any[] = [];
  pieChartData1: any[] = [];
  colors = ['#2ECC70', '#CB032C', '#6483EF', '#D8854C', '#d9ccf8', '#FF8E3A'];


  pieChartLabels: string[] = [];
  pieChartDatasets: any[] = [];
  pieChartType: ChartType = 'pie';

  barChartLabels: string[] = [];
  barChartData: any[] = [];
  barChartType: ChartType = 'bar';


  getFontSize(base: number): number {
    const width = window.innerWidth;

    if (width < 640) return base - 6;   // mobile
    if (width < 1024) return base - 3;  // tablet
    return base;                        // desktop
  }


  pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,

    layout: {
      padding: 30,
    },
    plugins: {
      legend: {
        position: 'bottom',
        display: window.innerWidth > 480,   // 👈 mobile pe hide

        labels: {
          boxWidth: 10,
          boxHeight: 10,
          padding: 8,
          usePointStyle: true,              // 👈 round dots

          font: {
            size: this.getFontSize(14)      // 👈 reduced for fit
          },
          color: '#374151'
        }
      },

      tooltip: {
        bodyFont: {
          size: this.getFontSize(14)
        },
        titleFont: {
          size: this.getFontSize(14)
        }
      }
    }
  };


  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: 30
    },

    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 12,
          padding: 20,
          usePointStyle: true,
          font: {
            size: this.getFontSize(14)
          },
          color: '#374151'
        }
      },

      tooltip: {
        bodyFont: {
          size: this.getFontSize(14)
        },
        titleFont: {
          size: this.getFontSize(14)
        }
      }
    },

    scales: {
      x: {
        ticks: {
          font: {
            size: this.getFontSize(12)
          },
          maxRotation: 0,     // 👈 prevent tilt
          minRotation: 0,
          color: '#374151'
        }
      },

      y: {
        beginAtZero: true,

        ticks: {
          font: {
            size: this.getFontSize(12)
          },
          color: '#374151'
        }
      }
    }
  };

  exceptionChartLabels: string[] = [];
  exceptionChartData: any[] = [];
  exceptionChartType: any = 'doughnut';

  pendingChartLabels: string[] = [];
  pendingChartData: any[] = [];
  pendingChartType: any = 'doughnut';

  exceptionChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          boxWidth: 12,
          padding: 14,

          font: {
            size: 16,   // 👈 increase font
            weight: '500'
          },

          color: '#374151'
        }
      }
    }
  };

  pendingChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          boxWidth: 10,
          padding: 10,
          font: {
            size: 16,
            weight: '500'
          },
          color: '#374151'
        }
      }
    }
  };


  setExceptionChart() {
    this.exceptionChartLabels = this.ExceptionData.map(x => x.key);

    this.exceptionChartData = [
      {
        data: this.ExceptionData.map(x => x.cnt),

        backgroundColor: [
          '#6483EF', // Late Coming
          '#FF8E3A'  // Early Swipe Out
        ],

        borderWidth: 2,
        borderColor: '#fff',
        hoverOffset: 8
      }
    ];
  }

  setPendingChart() {
    this.pendingChartLabels = this.pendingRequest.map(x => x.key);

    this.pendingChartData = [
      {
        data: this.pendingRequest.map(x => x.cnt),
        backgroundColor: [
          '#0D6EFD',        // blue
          'rgb(229, 101, 144)'  // pink
        ],
        borderWidth: 2,
        borderColor: '#fff',
        hoverOffset: 8
      }
    ];
  }

  getIcon(key: string): string {
    switch (key) {
      case 'Swipe In': return 'pi pi-sign-in';
      case 'Not Swipe In': return 'pi pi-times-circle';
      case 'On Leave': return 'pi pi-calendar';
      case 'OD': return 'pi pi-briefcase';
      case 'Short Leave': return 'pi pi-clock';
      case 'Swipe Out': return 'pi pi-sign-out';
      default: return 'pi pi-info-circle';
    }
  }

  animateCount(target: number, duration = 1000): number {
    let start = 0;
    const increment = target / (duration / 16);
    const interval = setInterval(() => {
      start += increment;
      if (start >= target) {
        start = target;
        clearInterval(interval);
      }
    }, 16);
    return Math.floor(start);
  }


  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private Customvalidation: Customvalidation,
    private cdr: ChangeDetectorRef,
    private message: MessageService,
    private datePipe: DatePipe
  ) { }


  ngOnInit(): void {
    this.getDashBoardAttendaceData()
  }
  get totalPending(): number {
    return this.pendingRequest.reduce((sum, item) => sum + item.cnt, 0);
  }


  getDashBoardAttendaceData() {
    this.userService.getQuestionPaper(`uspGetHRMSDashboardCount|districtId=${sessionStorage.getItem('District')}`)
      .subscribe((res: any) => {

        this.attendanceData = res?.table || [];
        this.attendanceSourceData = res['table1']
        this.pendingRequest = res['table2'];
        this.setPendingChart();
        this.ExceptionData = res['table3']
        this.setExceptionChart();

        this.pieChartLabels = this.attendanceData.map(item => item.key);
        this.pieChartDatasets = [{
          data: this.attendanceData.map(item => item.cnt),
          backgroundColor: this.attendanceData.map(item => item.colorCode)
        }];

        this.pieChartData1 = res['table4'].map((item: any) => ({
          xAxis: item.week,
          ot: item.ot,
          lc: item.lc,
        }));

        this.barChartLabels = this.pieChartData1.map(item => item.xAxis);
        this.barChartData = [
          {
            label: 'On Time (OT)',
            data: this.pieChartData1.map(item => item.ot),
            backgroundColor: '#2ECC70'
          },
          {
            label: 'Late Coming (LC)',
            data: this.pieChartData1.map(item => item.lc),
            backgroundColor: '#FF3C00'
          }
        ];

        this.cdr.detectChanges();
      });
  }


  get totalSwipeIn(): number {
    return this.attendanceSourceData.reduce((sum, item) => sum + item.cnt, 0);
  }


  getPercentage(cnt: number): number {
    return this.totalSwipeIn ? Math.round((cnt / this.totalSwipeIn) * 100) : 0;
  }


  get totalException(): number {
    return this.ExceptionData.reduce((sum, item) => sum + item.cnt, 0);
  }

  getExceptionPercentage(cnt: number): number {
    return this.totalException ? Math.round((cnt / this.totalException) * 100) : 0;
  }


}
