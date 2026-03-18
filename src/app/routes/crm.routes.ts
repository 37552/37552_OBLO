import { Routes } from '@angular/router';

export const crmRoutes: Routes = [
    {
        path: 'crm-lead',
        loadComponent: () => import('../crm/crm-lead/crm-lead').then((m) => m.CrmLead)
    },
    {
        path: 'crm-opportunities',
        loadComponent: () => import('../crm/crm-opportunities/crm-opportunities').then((m) => m.CrmOpportunities)
    },
    {
        path: 'crm-quotation',
        loadComponent: () => import('../crm/crm-quotation/crm-quotation').then((m) => m.CrmQuotation)
    },
    {
        path: 'crm-contract',
        loadComponent: () => import('../crm/crm-contract/crm-contract').then((m) => m.CrmContract)
    },
    {
        path: 'crm-targets',
        loadComponent: () => import('../crm-targets/crm-targets').then((m) => m.CrmTargets)
    },
    {
        path: 'crm-settings',
        loadComponent: () => import('../crm-settings/crm-settings').then((m) => m.CrmSettings)
    },
    {
        path: 'crm-admin-dashboard',
        loadComponent: () => import('../home/chpl-admin-dashboard/chpl-admin-dashboard').then((m) => m.ChplAdminDashboard)
    },
      {
        path: 'crm-csr-dashboard',
        loadComponent: () => import('../home/crm-customer-sr-dashboard/crm-customer-sr-dashboard/crm-customer-sr-dashboard').then((m) => m.CrmCustomerSrDashboard)
    },
    {
        path: 'customer-details',
        loadComponent: () => import('../crm/customer-details/customer-details').then((m) => m.CustomerDetails)
    },
];
