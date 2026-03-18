import { Routes } from '@angular/router';

export const chplRoutes: Routes = [
    {
        path: 'chpl-machine-installation',
        loadComponent: () => import('../chpl-components/chpl-machine-installation/chpl-machine-installation').then((m) => m.ChplMachineInstallation)
    },
    {
        path: 'create-service',
        loadComponent: () => import('../chpl-components/create-service/create-service').then((m) => m.CreateService)
    },
    {
        path: 'raise-ticket',
        loadComponent: () => import('../raise-ticket/raise-ticket/raise-ticket').then((m) => m.RaiseTicket)
    },
    {
        path: 'raise-ticket-entry',
        loadComponent: () => import('../raise-ticket/raise-ticket-entry/raise-ticket-entry').then((m) => m.RaiseTicketEntry)
    },
    {
        path: 'rt-lsl',
        loadComponent: () => import('../raise-ticket/rt-lsl/rt-lsl').then((m) => m.RtLsl)
    },
    {
        path: 'rt-pro-cleaning',
        loadComponent: () => import('../raise-ticket/rt-pro-cleaning/rt-pro-cleaning').then((m) => m.RtProCleaning)
    },
    {
        path: 'conveyance-request',
        loadComponent: () => import('../raise-ticket/conveyance-request/conveyance-request').then((m) => m.ConveyanceRequest)
    },
    {
        path: 'expense-approval',
        loadComponent: () => import('../raise-ticket/expense-approval/expense-approval').then((m) => m.ExpenseApproval)
    },
    {
        path: 'expense-request-details',
        loadComponent: () => import('../raise-ticket/expense-request-details/expense-request-details').then((m) => m.ExpenseRequestDetails)
    },
    {
        path: 'expense-request',
        loadComponent: () => import('../raise-ticket/expense-request/expense-request').then((m) => m.ExpenseRequest)
    },
    {
        path: 'service-agreement',
        loadComponent: () => import('../chpl-components/service-agreement/service-agreement').then((m) => m.ServiceAgreement)
    },
    {
        path: 'machine-installation',
        loadComponent: () => import('../chpl-components/chpl-machine-installation/chpl-machine-installation').then((m) => m.ChplMachineInstallation)
    },
    {
        path: 'service-request',
        loadComponent: () => import('../chpl-components/create-service/create-service').then((m) => m.CreateService)
    },
    {
        path: 'unassigned-requests',
        loadComponent: () => import('../chpl-components/unassigned-requests/unassigned-requests').then((m) => m.UnassignedRequests)
    },
    {
        path: 'my-jobs',
        loadComponent: () => import('../chpl-components/my-jobs/my-jobs').then((m) => m.MyJobs)
    },
    {
        path: 'customer-service-request',
        loadComponent: () => import('../chpl-components/customer-service-request/customer-service-request').then((m) => m.CustomerServiceRequest)
    },
    {
        path: 'service-engineer-dashboard',
        loadComponent: () => import('../home/service-engineer-dashboard/chpl-service-engineer-dashboard/chpl-service-engineer-dashboard').then((m) => m.ChplServiceEngineerDashboard)
    },
    {
        path: 'office-request',
        loadComponent: () => import('../raise-ticket/office-request/office-request').then((m) => m.OfficeRequest)
    },
    {
        path: 'fleet-dashboard',
        loadComponent: () => import('../Dashboards/fleet-dashboard/fleet-dashboard').then((m) => m.FleetDashboard)
    }
];
