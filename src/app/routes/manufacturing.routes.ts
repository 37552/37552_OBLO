import { Routes } from '@angular/router';

export const manufacturingRoutes: Routes = [
    {
        path: 'sub-contracting',
        loadComponent: () => import('../manufacturing/sub-contracting/sub-contracting').then((m) => m.SubContracting)
    },
    {
        path: 'workstation',
        loadComponent: () => import('../manufacturing-masters/workstation/workstation').then((m) => m.Workstation)
    },
    {
        path: 'operations-master',
        loadComponent: () => import('../manufacturing-masters/operations-master/operations-master').then((m) => m.OperationsMaster)
    },
    {
        path: 'bill-material',
        loadComponent: () => import('../manufacturing/bill-material/bill-material').then((m) => m.BillMaterial)
    },
    {
        path: 'bom-view',
        loadComponent: () => import('../manufacturing/bom-view/bom-view').then((m) => m.BomView)
    },
    {
        path: 'routing-master',
        loadComponent: () => import('../manufacturing-masters/routing-master/routing-master').then((m) => m.RoutingMaster)
    },
    {
        path: 'plant-floor-master',
        loadComponent: () => import('../manufacturing-masters/plant-floor-master/plant-floor-master').then((m) => m.PlantFloorMaster)
    },
    {
        path: 'work-order',
        loadComponent: () => import('../manufacturing/work-order/work-order').then((m) => m.WorkOrder)
    },
    {
        path: 'job-card',
        loadComponent: () => import('../manufacturing/job-card/job-card').then((m) => m.JobCard)
    },
    {
        path: 'production-plan',
        loadComponent: () => import('../manufacturing/production-plan/production-plan').then((m) => m.ProductionPlan)
    }
];
