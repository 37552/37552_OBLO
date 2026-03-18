import { Routes } from "@angular/router";
import { EmployeeAttendance } from "../ess-components/employee-attendance/employee-attendance";
import { AttendanceRegularization } from "../ess-components/attendance-regularization/attendance-regularization";
import { EmployeeCalendar } from "../ess-components/employee-calendar/employee-calendar";
import { LeaveApplication } from "../ess-components/leave-application/leave-application";
import { MyAssets } from "../ess-components/my-assets/my-assets";
import { ShortLeave } from "../ess-components/short-leave/short-leave";
import { FinalAttendance } from "../ess-components/final-attendance/final-attendance";
import { LeaveCardDetail } from "../ess-components/leave-card-detail/leave-card-detail";
import { HolidayList } from "../ess-components/holiday-list/holiday-list";
import { ParentalLeave } from "../ess-components/parental-leave/parental-leave";
import { EmployeeOfficialDetail } from "../ess-components/employee-official-detail/employee-official-detail";
import { AttendanceRegularizationAction } from "../ess-components/attendance-regularization-action/attendance-regularization-action";

export const essRoutes: Routes = [
    { path: 'my-assets', component: MyAssets },
    { path: 'employee-attendance', component: EmployeeAttendance },
    { path: 'attendance-regularization', component: AttendanceRegularization },
    { path: 'employee-calendar', component: EmployeeCalendar },
    { path: 'leave-application', component: LeaveApplication },
    { path: 'short-leave', component: ShortLeave },
    { path: 'final-attendance', component: FinalAttendance },
    { path: 'leave-card-detail', component: LeaveCardDetail },
    { path: 'holiday-list', component: HolidayList },
    { path: 'parental-leave', component: ParentalLeave },
    { path: 'employee-official-detail', component: EmployeeOfficialDetail },
    { path: 'attendance-regularization-action', component: AttendanceRegularizationAction },



]
