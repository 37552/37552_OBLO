import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { UserService } from '../../shared/user-service';
import { Customvalidation } from '../../shared/Validation';
import { NgxSpinnerService } from 'ngx-spinner';

import { TooltipModule } from 'primeng/tooltip';
import { BreadcrumbModule } from 'primeng/breadcrumb';

@Component({
  selector: 'app-employee-calendar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SelectModule,
    ButtonModule,
    DatePickerModule,
    ProgressSpinnerModule,
    TooltipModule,
    BreadcrumbModule
  ],
  templateUrl: './employee-calendar.html',
  styleUrl: './employee-calendar.scss',
})
export class EmployeeCalendar implements OnInit {
  userId = sessionStorage.getItem('userId');
  param: any;
  menulabel: string = '';
  formlable: string = '';
  breadcrumbItems: any[] = [];

  empDrp: any[] = [];
  selectedEmp: any = null;

  monthlyData: any[] = [];
  calendarEvents: { [key: string]: any } = {};
  viewDate: Date = new Date();
  showCaldata = false;
  showSpinner: boolean = false;

  constructor(
    private userService: UserService,
    public customValidation: Customvalidation,
    private spinner: NgxSpinnerService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.getDropdownEmp();
    this.param = sessionStorage.getItem('menuItem');
    if (this.param) {
      const paramjs = JSON.parse(this.param);
      this.menulabel = paramjs.menu;
      this.formlable = paramjs.formName;
    }

    this.breadcrumbItems = [
      { label: 'Home', routerLink: '/home' },
      { label: this.menulabel, routerLink: '/ess' },
      { label: this.formlable }
    ];
  }

  getDropdownEmp() {
    this.spinner.show();
    const roleID = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;
    this.userService
      .getQuestionPaper(`uspGetDepartmentDetail|userId=${this.userId}|roleId=${roleID}`)
      .subscribe(
        (res: any) => {
          this.empDrp = res['table2'];
          this.spinner.hide();
        },
        () => this.spinner.hide(),
      );
  }

  isSubmitted = false;
  showData() {
    this.isSubmitted = true;

    if (!this.selectedEmp) {
      return;
    }

    this.showSpinner = true;
    this.showCaldata = true;
    this.spinner.show();

    const query = `empId=${this.selectedEmp}`;
    this.userService
      .getQuestionPaper(
        `uspEmployeeAttendanceCalendar|${query}|orgId=${sessionStorage.getItem('Organization')}`,
      )
      .subscribe(
        (res: any) => {
          this.monthlyData = res['table'] || [];
          this.calendarEvents = {};

          this.monthlyData.forEach((entry: any) => {
            if (entry.dateLabel) {
              // Robust date extraction: "2026-03-05T00:00:00" -> "2026-03-05"
              const datePart = entry.dateLabel.split('T')[0];

              // Pre-process inOutTime for the tooltip
              let cleanTime = '';
              if (entry.inOutTime && entry.inOutTime.trim()) {
                cleanTime = entry.inOutTime.trim().replace(/\n/g, '<br>');
              }

              this.calendarEvents[datePart] = {
                ...entry,
                cleanTime: cleanTime,
              };
            }
          });

          this.showSpinner = false;
          this.spinner.hide();

          // Force PrimeNG calendar to re-render by giving it a new reference
          this.viewDate = new Date(this.viewDate);

          this.cdr.detectChanges();
        },
        () => {
          this.showSpinner = false;
          this.spinner.hide();
        },
      );
  }

  getDayStatus(date: any): any {
    if (!date) return null;
    // PrimeNG month is 0-indexed, which aligns with Date constructor
    const dateObj = new Date(date.year, date.month, date.day);
    const dateString = this.formatDate(dateObj);
    return this.calendarEvents[dateString];
  }

  private formatDate(date: Date): string {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }

  goToPreviousMonth(): void {
    const d = new Date(this.viewDate);
    d.setMonth(d.getMonth() - 1);
    this.viewDate = d;
  }

  goToNextMonth(): void {
    const d = new Date(this.viewDate);
    d.setMonth(d.getMonth() + 1);
    this.viewDate = d;
  }

  goToToday(): void {
    this.viewDate = new Date();
  }

  onMonthChange(event: any) {
    this.viewDate = new Date(event.year, event.month - 1, 1);
  }
}
