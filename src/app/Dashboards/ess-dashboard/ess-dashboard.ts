import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, NgModule, ViewChild } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { CommonModule } from '@angular/common';
import { DatePickerModule } from 'primeng/datepicker';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../shared/user-service';
import { HttpErrorResponse } from '@angular/common/http';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Customvalidation } from '../../shared/Validation';
import moment from 'moment';

CommonModule
@Component({
  selector: 'app-ess-dashboard',
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    AvatarModule,
    DatePickerModule,
    BadgeModule,
    FormsModule
  ],
  templateUrl: './ess-dashboard.html',
  styleUrl: './ess-dashboard.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class EssDashboard {
  date: Date[] | undefined;
  activeTab: 'dashboard' | 'pending' = 'dashboard';
  userInfo: any = null;
  isLoading = true;
  loggeduser = sessionStorage.getItem('userId');
  essEmpIdVal = '';
  totalLeaves: any = [];
  allposts = [];
  allHolidays = []
  leaveList: any[] = [];
  holidays: any[] = [];
  currentIndex = 0;
  feeds: any[] = [];
  latestEntry: any;
  monthlyData = [];
  events: any[] = [];

  counter = 0;
  attendanceData = [];
  loginBtnTxtIs = "Swipe In";
  entryType = "";

  detailData: any = null;
  commentsDetail: any[] = [];
  likesDetail: any[] = [];
  selectedBolgData: any;
  actionType: string = '';
  commentInput: string = '';
  commentType: string = 'ADD';
  userId = sessionStorage.getItem('userId');
  selectedCommentData: any = null;
  empDrp: any;


  attendanceMap: any = {};
  calendarDays: any[] = [];
  currentDate: Date = new Date();


  showData(empid: string) {
    this.userService.getQuestionPaper(`uspEmployeeAttendanceCalendar|empId=${empid}`)
      .subscribe((res) => {
        this.monthlyData = res['table'] || [];
        this.events = this.monthlyData.map((entry: any) => ({
          date: new Date(entry.dateLabel).toDateString(),
          backColor: entry.backColor,
          status: entry.dayStatus,
          time: entry.inOutTime
        }));
  
        this.attendanceMap = {};
        this.events.forEach((e: any) => {
          this.attendanceMap[e.date] = e;
        });
  
        this.generateCalendar();
        this.cdr.detectChanges();  // ✅ FIX
      });
  }


  mapAttendanceData() {
    this.attendanceMap = {};

    this.monthlyData.forEach((item: any) => {
      const key = new Date(item.dateLabel).toDateString();
      this.attendanceMap[key] = item;
    });
  }

  generateCalendar() {
    this.calendarDays = [];

    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay(); // Sunday = 0
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const startDay = firstDay === 0 ? 6 : firstDay - 1;

    for (let i = 0; i < startDay; i++) {
      this.calendarDays.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      this.calendarDays.push(date);
    }
  }

  getDayData(date: Date) {
    if (!date) return null;
    return this.attendanceMap[date.toDateString()];
  }

  nextMonth() {
    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() + 1,
      1
    );
    this.generateCalendar();
  }

  prevMonth() {
    this.currentDate = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() - 1,
      1
    );
    this.generateCalendar();
  }

  nextHoliday() {
    if (this.holidays.length === 0) return;
    this.currentIndex = (this.currentIndex + 1) % this.holidays.length;
  }

  prevHoliday() {
    if (this.holidays.length === 0) return;
    this.currentIndex =
      (this.currentIndex - 1 + this.holidays.length) % this.holidays.length;
  }


  setTab(tab: 'dashboard' | 'pending') {
    this.activeTab = tab;
  }


  constructor(
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private message: MessageService,
    public Customvalidation: Customvalidation,
    private cdr: ChangeDetectorRef,

  ) {
  }


  ngOnInit(): void {
    this.getEmployeeData();
    this.getEployeeLeaves();
    this.getAllPosts();
    this.getAttendanceEntries();
    this.getDropdownEmp();
  }

  getEmployeeData() {
    this.isLoading = true;

    this.userService
      .getQuestionPaper('uspGetPersonalInfoHome|UserId=' + this.loggeduser)
      .subscribe(
        (res: any) => {
          if (res?.table?.length) {
            this.userInfo = res.table[0];
            this.essEmpIdVal = this.userInfo.empId;
          }
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        (err: HttpErrorResponse) => {
          this.isLoading = false;

          if (err.status == 403) {
            this.Customvalidation.loginroute(err.status);
          }
        }
      );
  }


  getEployeeLeaves() {
    this.userService.getQuestionPaper(
      'uspLeaveBalanceStatusHome|UserId=' + sessionStorage.getItem('userId')
    ).subscribe((res: any) => {
      this.totalLeaves = res['table'] || [];
      this.leaveList = this.totalLeaves.map((item: any) => ({
        name: item['leave Type'],
        status: item['leave Status'],
        value: Math.abs(item.leaves)
      }));
      this.cdr.detectChanges();
    });
  }

  getDropdownEmp() {
    this.monthlyData = [];

    const currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
    const roleId = currentRole?.roleId || '';

    this.userService.getQuestionPaper(`uspGetDepartmentDetail|userId=${this.userId}|roleId=${roleId}`).subscribe(
      (res) => {
        if (res['table2'] && res['table2'].length > 0) {
          this.empDrp = res['table2'][0];
          const empId = this.empDrp.id;
          this.showData(empId);
        }
        else {
        }

      },
      (err: HttpErrorResponse) => {
        if (err.status == 403) {
          this.Customvalidation.loginroute(err.status);
        }
      }
    );
  }

  getAttendanceEntries() {
    this.userService
      .getQuestionPaper("uspEmpAttendanceRecord|appUserId=" + this.userId)
      .subscribe(
        (res) => {
          this.attendanceData = res["table1"] || [];
          if (this.attendanceData.length > 0) {
            this.latestEntry = this.attendanceData[this.attendanceData.length - 1];
          }
        },
        (err: HttpErrorResponse) => {
          if (err.status == 403) {
            this.Customvalidation.loginroute(err.status);
          }
        }
      );
  }

  formatTime(date: string) {
    return moment(date).format('ddd, hh:mm:ss a'); // Fri, 09:15:32 am
  }

  formatDate1(date: string) {
    return moment(date).format('DD MMMM YYYY'); // 13 December 2025
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB'); // dd/mm/yyyy
  }

  getAllPosts() {
    this.userService.getQuestionPaper(
      'uspBlogTemplate|appUserId=' + sessionStorage.getItem('userId')
    ).subscribe(
      res => {
        this.feeds = (res['table'] || []).map((item: any) => ({
          id: item.id,
          title: item.blogtype,
          date: this.formatDate(item.blogdate),
          message: item.blogMessage,
          image: item.blogImage,
          likes: item.likesCount,
          comments: item.commentCount,
          myLike: item.myLike
        }));

        const holidayData = res['table1'] || [];

        this.holidays = (holidayData as any[]).map((item: any) => ({
          name: item.holidayName,
          date: item.hdate,
          type: item.htype,
          image: item.image && item.image !== ''
            ? item.image
            : 'assets/images/default-holiday.png'
        }));

        this.currentIndex = 0;
        this.cdr.detectChanges();
      },
      (err: HttpErrorResponse) => {
        if (err.status == 403) {
          this.Customvalidation.loginroute(err.status);
        }
      }
    );
  }


  onClickLike(data: any) {
    const action = data.myLike ? 'UNLIKE' : 'LIKE';
    const query = `action=${action}|blogId=${data.id}|comment=|appUserId=${sessionStorage.getItem('userId')}`;
    this.userService.SubmitPostTypeData(`uspPostAndUpdateBlogLikes`, query, 'header')
      .subscribe(
        (res: any) => {
          if (res && res.includes('Data Saved.-success')) {
            data.myLike = !data.myLike;
            data.likes = data.myLike ? data.likes + 1 : data.likes - 1;

            const message = data.myLike ? 'Liked' : 'Unliked';
            this.message.add({
              severity: 'success',
              summary: 'Success',
              detail: message,
            });
            setTimeout(() => {
              this.getAllPosts();
            }, 1000);

          }
          else {
            this.message.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Something went wrong!',
            });
          }
        },
        (err: HttpErrorResponse) => {
          if (err.status == 403) {
            this.Customvalidation.loginroute(err.status);
          }
        }
      );
  }

  getBlogLikeandCommentDetails(data: any, action: string) {
    this.selectedBolgData = data;
    this.actionType = action;

    this.userService
      .getQuestionPaper(`uspBlogLikesAndCommentDetails|blogId=${data.id}|type=${action}`)
      .subscribe((res: any) => {
        const arr = res['table'] || [];

        if (arr.length > 0) {

          if (action === "LIKES") {
            this.likesDetail = arr;
            this.detailData = this.likesDetail;
          }
          else {
            this.commentsDetail = arr;
            this.detailData = this.commentsDetail;
            this.commentType = 'ADD';
          }

        } else {
          this.detailData = "isActive";
        }

      });
  }

  onLikesClick(data: any) {
    this.detailData = data;
  }

  addComment() {
    const commentData = this.commentInput?.trim();

    if (!commentData) {
      this.message.add({
        severity: 'warn',
        summary: 'Warning',
        detail: 'Enter comment!'
      });
      return;
    }

    let sp = '';
    let query = '';

    if (this.commentType === "ADD") {
      sp = 'uspPostAndUpdateBlogLikes';
      query = `action=COMMENT|blogId=${this.selectedBolgData.id}|comment=${commentData}|appUserId=${this.userId}`;
    } else {
      sp = 'uspPostAndUpdateBlogComments';
      query = `action=UPDATE|blogId=${this.selectedCommentData.blogId}|commentId=${this.selectedCommentData.commentId}|comment=${commentData}|appUserId=${this.userId}`;
    }

    this.userService.SubmitPostTypeData(sp, query, 'header')
      .subscribe((res: any) => {

        if (res && res.includes('Data Saved.-success')) {

          const message = this.commentType === "ADD"
            ? 'Comment Added'
            : 'Comment Updated';

          this.message.add({
            severity: 'success',
            summary: 'Success',
            detail: message
          });

          // ✅ RESET
          this.commentInput = '';
          this.commentType = 'ADD';
          this.selectedCommentData = null;

          // ✅ CLOSE MODAL
          this.detailData = null;

          // ✅ REFRESH LIST
          this.getAllPosts();

        } else {
          this.message.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Something went wrong!'
          });
        }

      },
        (err: HttpErrorResponse) => {
          if (err.status == 403) {
            this.Customvalidation.loginroute(err.status);
          }
        });
  }

  cancelEdit() {
    this.commentType = 'ADD';
    this.commentInput = '';
    this.selectedCommentData = null;
  }

  onDelelteComment(data: any) {
    const query = `action=DELETE|blogId=${data.blogId}|commentId=${data.commentId}|comment=${data.comment}|appUserId=${this.userId}`;
    this.userService.SubmitPostTypeData(`uspPostAndUpdateBlogComments`, query, 'header')
      .subscribe((res: any) => {
        if (res && res.includes('Data Saved.-success')) {

          this.message.add({
            severity: 'success',
            summary: 'Deleted',
            detail: 'Comment deleted'
          });
          this.getBlogLikeandCommentDetails(this.selectedBolgData, 'COMMENTS');
          setTimeout(() => {
            this.getAllPosts();
          }, 100);
        }
        else {
          this.message.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Something went wrong!'
          });
        }

      });
  }

  onEditComment(data: any) {
    this.selectedCommentData = data;
    this.commentType = "EDIT";
    this.commentInput = data.comment;
  }

  timeSinceComment(commentTimestamp: string) {
    const commentTime = new Date(commentTimestamp);
    const currentTime = new Date();

    const diff = currentTime.getTime() - commentTime.getTime();

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hr ago`;
    if (days < 7) return `${days} day ago`;

    return commentTime.toLocaleDateString();
  }


  closeModal() {
    this.detailData = null;
    this.commentInput = '';
    this.commentType = 'ADD';
  }


}
