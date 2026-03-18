import { Routes } from '@angular/router';
import { AttendanceRegularizationAction } from '../ess-components/attendance-regularization-action/attendance-regularization-action';

export const hrRoutes: Routes = [
    {
        path: 'resource-requisition',
        loadComponent: () => import('../hr-admin-components/resource-requisition/resource-requisition').then((m) => m.ResourceRequisition)
    },
    {
        path: 'resume-upload',
        loadComponent: () => import('../hr-admin-components/resume-upload/resume-upload').then((m) => m.ResumeUpload)
    },
    {
        path: 'resume-screening',
        loadComponent: () => import('../hr-admin-components/resume-screening/resume-screening').then((m) => m.ResumeScreening)
    },
    {
        path: 'resume-acknowledgement',
        loadComponent: () => import('../hr-admin-components/resume-acknowledgement/resume-acknowledgement').then((m) => m.ResumeAcknowledgement)
    },
    {
        path: 'interview-assessment',
        loadComponent: () => import('../hr-admin-components/interview-assessment/interview-assessment').then((m) => m.InterviewAssessment)
    },
    {
        path: 'onboarding',
        loadComponent: () => import('../hr-admin-components/onboarding/onboarding').then((m) => m.Onboarding)
    },
    {
        path: 'appraisal-period',
        loadComponent: () => import('../performance appraisal/appraisal-period/appraisal-period').then((m) => m.AppraisalPeriod)
    },
    {
        path: 'employee-performance',
        loadComponent: () => import('../performance appraisal/employee-performance/employee-performance').then((m) => m.EmployeePerformance)
    },
    {
        path: 'employee-performance-member',
        loadComponent: () => import('../performance appraisal/employee-performance-member/employee-performance-member').then((m) => m.EmployeePerformanceMember)
    },
    {
        path: 'Performance-appraisal-form',
        loadComponent: () => import('../performance appraisal/performance-appraisal-form/performance-appraisal-form').then((m) => m.PerformanceAppraisalComponent)
    },
    {
        path: 'appraisal-data-view',
        loadComponent: () => import('../performance appraisal/appraisal-data-view/appraisal-data-view').then((m) => m.AppraisalDataView)
    },
    {
        path: 'tour-reimbursement',
        loadComponent: () => import('../tour-reimbursement/tour-reimbursement/tour-reimbursement').then((m) => m.TourReimbursement)
    },
    {
        path: 'office-expense-reimbursement',
        loadComponent: () => import('../Expense Management/office-expense-reimbursement/office-expense-reimbursement').then((m) => m.OfficeExpenseReimbursement)
    },
    {
        path: 'reimbursement-bank-details',
        loadComponent: () => import('../reports/reimbursement-bank-details/reimbursement-bank-details').then((m) => m.ReimbursementBankDetails)
    },
    {
        path: 'employee-imprest-history',
        loadComponent: () => import('../reports/employee-imprest-history/employee-imprest-history').then((m) => m.EmployeeImprestHistory)
    },
    {
        path: 'organisation-imprest-history',
        loadComponent: () => import('../reports/organisation-imprest-history/organisation-imprest-history').then((m) => m.OrganisationImprestHistory)
    },
    {
        path: 'employee-expense-statement',
        loadComponent: () => import('../reports/employee-expense-statement/employee-expense-statement').then((m) => m.EmployeeExpenseStatement)
    },
    {
        path: 'yearly-salary-components',
        loadComponent: () => import('../payroll/yearly-salary-components/yearly-salary-components').then((m) => m.YearlySalary)
    },
    {
        path: 'monthly-salary-components',
        loadComponent: () => import('../payroll/monthly-salary-components/monthly-salary-components').then((m) => m.MonthlySalaryComponents)
    },
    {
        path: 'monthly-salary-preparation',
        loadComponent: () => import('../payroll/monthly-salary-preparation/monthly-salary-preparation').then((m) => m.MonthlySalaryPreparation)
    },
    {
        path: 'monthly-salary-approval',
        loadComponent: () => import('../payroll/monthly-salary-approval/monthly-salary-approval').then((m) => m.MonthlySalaryApproval)
    },
    {
        path: 'employee-salary-preparation',
        loadComponent: () => import('../payroll/employee-salary-preparation/employee-salary-preparation').then((m) => m.EmployeeSalaryPreparation)
    },
    {
        path: 'hr-dashboard',
        loadComponent: () => import('../Dashboards/hr-dashboard/hr-dashboard').then((m) => m.HrDashboard)
    },
    {
        path: 'ess-dashboard',
        loadComponent: () => import('../Dashboards/ess-dashboard/ess-dashboard').then((m) => m.EssDashboard)
    },
    {
        path: 'employee-salary-slip',
        loadComponent: () => import('../payroll/employee-salary-slip/employee-salary-slip').then((m) => m.EmployeeSalarySlip)
    },
    {
        path: 'monthly-salary-report',
        loadComponent: () => import('../payroll/monthly-salary-report/monthly-salary-report').then((m) => m.MonthlySalaryReport)
    },
    {
        path: 'update-salary-wages',
        loadComponent: () => import('../payroll/update-salary-wages/update-salary-wages').then((m) => m.UpdateSalaryWages)
    },
    {
        path: 'bonus-accural', loadComponent: () => import('../payroll/bonus-accural/bonus-accural').then((m) => m.BonusAccural)
    },
    {
        path: 'fnf-settlement', loadComponent: () => import('../payroll/fnf-settlement/fnf-settlement').then((m) => m.FnfSettlement)
    },
    {
        path: 'arrear-report',
        loadComponent: () => import('../payroll-reports/arrear-report/arrear-report').then((m) => m.ArrearReport)
    },
    {
        path: 'bank-transfer-report',
        loadComponent: () => import('../payroll-reports/bank-transfer-report/bank-transfer-report').then((m) => m.BankTransferReport)
    },
    {
        path: 'esic-return-report',
        loadComponent: () => import('../payroll-reports/esic-return-report/esic-return-report').then((m) => m.EsicReturnReport)
    },
    {
        path: 'attendance-regularization-action',
        component: AttendanceRegularizationAction
    },

];
