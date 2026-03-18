import { Routes } from '@angular/router';

export const salesRoutes: Routes = [
    {
        path: 'sales-order',
        loadComponent: () => import('../Sales/sales-order/sales-order').then((m) => m.SalesOrder)
    },
    {
        path: 'sales-order-amendment',
        loadComponent: () => import('../Sales/sales-order-amendment/sales-order-amendment').then((m) => m.SalesOrderAmendment)
    },
    {
        path: 'sales-order-approval',
        loadComponent: () => import('../Sales/sales-order-approval/sales-order-approval').then((m) => m.SalesOrderApproval)
    },
    {
        path: 'delivery-chalan',
        loadComponent: () => import('../Sales/delivery-chalan/delivery-chalan').then((m) => m.DeliveryChalan)
    },
    {
        path: 'package',
        loadComponent: () => import('../Sales/package/package').then((m) => m.Package)
    },
    {
        path: 'shipment',
        loadComponent: () => import('../Sales/shipment/shipment').then((m) => m.Shipment)
    },
    {
        path: 'picklist',
        loadComponent: () => import('../Sales/picklist/picklist').then((m) => m.Picklist)
    },
    {
        path: 'sale-setting',
        loadComponent: () => import('../sales-settings/sales-settings/sales-settings').then((m) => m.SalesSettings)
    },
    {
        path: 'payment-receipt',
        loadComponent: () => import('../Sales/received-payments/received-payments').then((m) => m.ReceivedPayments)
    },
    {
        path: 'credit-note',
        loadComponent: () => import('../Sales/credit-note/credit-note').then((m) => m.CreditNote)
    },
    {
        path: 'sales-return',
        loadComponent: () => import('../Sales/sales-return/sales-return').then((m) => m.SalesReturn)
    },
    {
        path: 'sales-return-approval',
        loadComponent: () => import('../Sales/sales-return-approval/sales-return-approval').then((m) => m.SalesReturnApproval)
    },
    {
        path: 'sales-target',
        loadComponent: () => import('../setup-and-administration/sales-target/sales-target').then((m) => m.SalesTarget)
    },
    {
        path: 'corporate-pipeline',
        loadComponent: () => import('../setup-and-administration/corporate-pipeline/corporate-pipeline').then((m) => m.CorporatePipeline)
    },
    {
        path: 'government-pipeline',
        loadComponent: () => import('../setup-and-administration/government-pipeline/government-pipeline').then((m) => m.GovernmentPipeline)
    },
    {
        path: 'territory-form',
        loadComponent: () => import('../setup-and-administration/territory-form/territory-form').then((m) => m.TerritoryForm)
    },
    {
        path: 'business-verticals',
        loadComponent: () => import('../setup-and-administration/business-verticals-form/business-verticals-form').then((m) => m.BusinessVerticalsForm)
    },
    {
        path: 'product-hierarchy',
        loadComponent: () => import('../setup-and-administration/product-hierarchy/product-hierarchy').then((m) => m.ProductHierarchy)
    }
];
