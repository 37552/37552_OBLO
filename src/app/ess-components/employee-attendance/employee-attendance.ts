import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { UserService } from '../../shared/user-service';
import { CardModule } from 'primeng/card';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { ProgressBarModule } from 'primeng/progressbar';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Subject, from } from 'rxjs';
import { exhaustMap, finalize } from 'rxjs/operators';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-employee-attendance',
  standalone: true,
  imports: [
    CommonModule,
    BreadcrumbModule,
    CardModule,
    AvatarModule,
    ButtonModule,
    DialogModule,
    FormsModule,
    ReactiveFormsModule,
    ConfirmDialogModule,
    ToastModule,
    ProgressBarModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './employee-attendance.html',
  styleUrl: './employee-attendance.scss'
})
export class EmployeeAttendance implements OnInit, OnDestroy {
  swipeClick$ = new Subject<void>();
  userId: number = 0;
  entryType: string = '';
  loginBtnTxtIs: string = '';
  loading: boolean = false;

  attendanceData: any[] = [];
  counter: number = 0;
  totalHours: string = '00:00:00';
  balanceHours: string = '09:00:00';
  progressValue: number = 0;
  isNineHoursCompleted: boolean = false;

  currentDate: Date = new Date();
  currentTime: Date = new Date();
  breadcrumbItems: any[] = [
    { label: 'Home', routerLink: '/home' }
  ];

  systemInfo = {
    latitude: 0,
    longitude: 0,
    ip: "",
    browser_name: "",
    os_name: "",
    os_version: null,
    platform: ""
  };


  constructor(
    private userService: UserService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
  ) { }

  ngOnInit(): void {

    this.userId = Number(sessionStorage.getItem('userId')) || 0;

    const menu = sessionStorage.getItem('menuItem');
    if (menu) {
      const menuData = JSON.parse(menu);
      this.breadcrumbItems = [
        { label: 'Home', routerLink: '/home' },
        { label: menuData.menu, routerLink: '/ess' },
        { label: menuData.formName, routerLink: '/ess/' + menuData.formValue }
      ];
    }

    this.startLiveClock();
    this.getAttendanceEntries();
    this.loadSystemData();
    this.updateClock();

    // 🔥 RxJS click handler
    this.swipeClick$
      .pipe(
        exhaustMap(() => from(this.handleSwipe()))
      )
      .subscribe();
  }

  // ================= LIVE CLOCK =================

  startLiveClock(): void {
    this.ngZone.runOutsideAngular(() => {
      this.clockInterval = setInterval(() => {
        this.ngZone.run(() => {
          this.currentDate = new Date();
          this.currentTime = new Date();
          this.updateClock();

          if (this.loginBtnTxtIs === 'Swipe Out') {
            this.calculateTotalHours();
          }

          this.cdr.detectChanges();
        });
      }, 1000);
    });
  }

  // ================= SWIPE BUTTON =================

  handleSwipe(): Promise<void> {

    if (this.loginBtnTxtIs === 'Swipe Out') {

      return new Promise((resolve) => {

        this.confirmationService.confirm({
          message: 'Are you sure you want to Swipe Out?',
          header: 'Confirmation',
          icon: 'pi pi-exclamation-triangle',
          accept: async () => {
            await this.processAttendance();
            resolve();
          },
          reject: () => resolve()
        });

      });

    }

    return this.processAttendance();
  }

  async processAttendance(): Promise<void> {

    this.loading = true;

    await this.loadSystemData();

    const query =
      `appUserId=${this.userId}|entryType=${this.entryType}|Device=${this.systemInfo.os_name}|Latitude=${this.systemInfo.latitude}|Longitude=${this.systemInfo.longitude}|browser=${this.systemInfo.browser_name}|ipAddress=${this.systemInfo.ip}`;

    return new Promise((resolve) => {

      this.userService
        .SubmitSwipeInSwaipeOut('uspEmpAttendance', query, "Employee Attendance")
        .pipe(
          finalize(() => {
            this.loading = false;
            resolve();
          })
        )
        .subscribe({

          next: (res: any) => {

            const resStr = res as string;

            this.messageService.add({
              severity: resStr.startsWith('1-') || resStr.startsWith('2-') ? 'success' : 'warn',
              summary: resStr,
              life: 3000
            });

            if (resStr.startsWith('1-') || resStr.startsWith('2-')) {
              this.getAttendanceEntries();
            }

          },

          error: () => {

            this.messageService.add({
              severity: 'error',
              summary: 'Server Error',
              life: 3000
            });

          }

        });

    });
  }

  // ================= GET RECORDS =================

  getAttendanceEntries(): void {

    this.userService
      .getQuestionPaper("uspEmpAttendanceRecord|appUserId=" + this.userId)
      .subscribe({
        next: (res: any) => {

          this.attendanceData = [...res["table1"]].sort(
            (a, b) => new Date(b.edate).getTime() - new Date(a.edate).getTime()
          );

          this.counter = res["table"][0]["totalEntry"] || 0;

          this.setButtonState(); // 🔥 backend based state
          this.calculateTotalHours();

          this.cdr.detectChanges();
        }
      });
  }

  // ================= BUTTON STATE FIX =================

  setButtonState(): void {

    if (!this.attendanceData.length) {
      this.loginBtnTxtIs = "Swipe In";
      this.entryType = "IN";
      return;
    }

    const todayStr = new Date().toDateString();

    const todayRecords = this.attendanceData.filter(item =>
      new Date(item.edate).toDateString() === todayStr
    );

    if (!todayRecords.length) {
      this.loginBtnTxtIs = "Swipe In";
      this.entryType = "IN";
      return;
    }

    const latest = todayRecords[0];
    const type = latest.etype.toLowerCase();

    // Check if the latest action was an IN (matches "in", "swipe in", etc.)
    if (type.includes('in') && !type.includes('out')) {
      this.loginBtnTxtIs = "Swipe Out";
      this.entryType = "OUT";
    } else {
      this.loginBtnTxtIs = "Swipe In";
      this.entryType = "IN";
    }
  }

  // ================= TOTAL HOURS =================

  // ================= TOTAL HOURS =================

  calculateTotalHours(): void {

    const today = new Date().toDateString();

    const todayRecords = this.attendanceData.filter(item =>
      new Date(item.edate).toDateString() === today
    );

    let totalMs = 0;
    let startTime: number | null = null;

    const sorted = [...todayRecords].sort(
      (a, b) => new Date(a.edate).getTime() - new Date(b.edate).getTime()
    );

    sorted.forEach(item => {
      const type = item.etype.toLowerCase();

      if (type.includes('in') && !type.includes('out')) {
        startTime = new Date(item.edate).getTime();
      }

      if (type.includes('out') && startTime) {
        totalMs += new Date(item.edate).getTime() - startTime;
        startTime = null;
      }
    });

    if (startTime) {
      totalMs += new Date().getTime() - startTime;
    }

    const totalSeconds = Math.floor(totalMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    this.totalHours =
      `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    const balanceSeconds = Math.max(0, 9 * 3600 - totalSeconds);
    const bHours = Math.floor(balanceSeconds / 3600);
    const bMinutes = Math.floor((balanceSeconds % 3600) / 60);
    const bSeconds = balanceSeconds % 60;

    this.balanceHours =
      `${bHours.toString().padStart(2, '0')}:${bMinutes.toString().padStart(2, '0')}:${bSeconds.toString().padStart(2, '0')}`;

    // Calculate Progress Percentage for 9 hours (9 * 3600 seconds)
    const targetSeconds = 9 * 3600;
    this.progressValue = Math.min(100, Math.floor((totalSeconds / targetSeconds) * 100));

    // Optional: Show Success Message once when 100% reached
    if (this.progressValue >= 100 && !this.isNineHoursCompleted) {
      this.isNineHoursCompleted = true;
      this.messageService.add({
        severity: 'success',
        summary: 'Goal Achieved!',
        detail: 'You have completed 9 hours of work today.',
        life: 5000
      });
    } else if (this.progressValue < 100) {
      this.isNineHoursCompleted = false;
    }

    // Pass the calculated total hours to the Global Celebration Service
    // this.celebrationService.checkAndCelebrate(this.totalHours);
  }

  // ================= SYSTEM INFO HELPERS =================

  async loadSystemData(): Promise<void> {
    try {
      await Promise.all([
        this.getLocation(),
        this.getIPAddress()
      ]);
    } catch (e) {
      console.error("Error loading system data:", e);
    }
    this.detectBrowserAndOS();
  }

  async getLocation(): Promise<void> {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            this.systemInfo.latitude = position.coords.latitude;
            this.systemInfo.longitude = position.coords.longitude;
            resolve();
          },
          (error) => {
            console.error("Geolocation error:", error);
            resolve();
          },
          { timeout: 5000, enableHighAccuracy: true }
        );
      } else {
        resolve();
      }
    });
  }

  async getIPAddress(): Promise<void> {
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      this.systemInfo.ip = data.ip || '0.0.0.0';
    } catch (e) {
      this.systemInfo.ip = '0.0.0.0';
    }
  }

  detectBrowserAndOS(): void {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    this.systemInfo.platform = platform;

    // Detect OS
    if (/android/i.test(userAgent)) this.systemInfo.os_name = "Android";
    else if (/iPad|iPhone|iPod/.test(userAgent)) this.systemInfo.os_name = "iOS";
    else if (/Win/i.test(userAgent)) this.systemInfo.os_name = "Windows";
    else if (/Mac/i.test(userAgent)) this.systemInfo.os_name = "MacOS";
    else if (/Linux/i.test(userAgent)) this.systemInfo.os_name = "Linux";
    else this.systemInfo.os_name = platform || "Unknown";

    // Detect Browser
    if (/edg/i.test(userAgent)) this.systemInfo.browser_name = "Edge";
    else if (/chrome|crios/i.test(userAgent)) this.systemInfo.browser_name = "Chrome";
    else if (/firefox|fxios/i.test(userAgent)) this.systemInfo.browser_name = "Firefox";
    else if (/safari/i.test(userAgent)) this.systemInfo.browser_name = "Safari";
    else if (/trident/i.test(userAgent)) this.systemInfo.browser_name = "IE";
    else this.systemInfo.browser_name = "Unknown";
  }


  trackByFn(index: number, item: any): any {
    return item.edate;
  }

  digitalTime: any;
  todayDate: any;

  hourHand: any;
  minuteHand: any;
  secondHand: any;

  clockInterval: any;



  updateClock() {

    const now = new Date()

    const hours = now.getHours()
    const minutes = now.getMinutes()
    const seconds = now.getSeconds()

    this.digitalTime = now.toLocaleTimeString('en-IN')

    this.todayDate = now.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })

    const hourDeg = (hours % 12) * 30 + minutes * 0.5
    const minuteDeg = minutes * 6
    const secondDeg = seconds * 6

    this.hourHand = `rotate(${hourDeg}deg)`
    this.minuteHand = `rotate(${minuteDeg}deg)`
    this.secondHand = `rotate(${secondDeg}deg)`

  }

  ngOnDestroy() {
    clearInterval(this.clockInterval)
  }
}