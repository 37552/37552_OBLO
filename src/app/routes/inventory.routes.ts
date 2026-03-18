import { Routes } from '@angular/router';

export const inventoryRoutes: Routes = [
    {
        path: 'item-master',
        loadComponent: () => import('../Inventory-master/item-master/item-master').then((m) => m.ItemMaster)
    },
    {
        path: 'pricelist-master',
        loadComponent: () => import('../Inventory-master/pricelist-master/pricelist-master').then((m) => m.PricelistMaster)
    },
    {
        path: 'itempricelist-master',
        loadComponent: () => import('../Inventory-master/itempricelist-master/itempricelist-master').then((m) => m.ItempricelistMaster)
    },
    {
        path: 'inventory-settings',
        loadComponent: () => import('../inventory-settings/inventory-settings').then((m) => m.InventorySettings)
    },
    {
        path: 'purchase-settings',
        loadComponent: () => import('../purchase-settings/purchase-settings').then((m) => m.PurchaseSettingsComponent)
    },
    {
        path: 'material-request',
        loadComponent: () => import('../erp-components/material-request/material-request').then((m) => m.MaterialRequest)
    },
    {
        path: 'material-request-approval',
        loadComponent: () => import('../erp-components/material-request-approval/material-request-approval').then((m) => m.MaterialRequestApproval)
    },
    {
        path: 'material-issue-entry',
        loadComponent: () => import('../erp-components/material-issue-entry/material-issue-entry').then((m) => m.MaterialIssueEntry)
    },
    {
        path: 'purchase-request-approval',
        loadComponent: () => import('../erp-components/purchase-request-approval/purchase-request-approval').then((m) => m.PurchaseRequestApproval)
    },
    {
        path: 'Purchaserequest',
        loadComponent: () => import('../erp-components/purchase-request/purchase-request').then((m) => m.PurchaseRequest)
    },
    {
        path: 'material-receipt-note',
        loadComponent: () => import('../erp-components/material-receipt-note/material-receipt-note').then((m) => m.MaterialReceiptNote)
    },
    {
        path: 'inspection-entry',
        loadComponent: () => import('../erp-components/inspection-entry/inspection-entry').then((m) => m.InspectionEntry)
    },
    {
        path: 'item-received',
        loadComponent: () => import('../erp-components/item-receive/item-receive').then((m) => m.ItemReceive)
    },
    {
        path: 'material-receipt-note-approval',
        loadComponent: () => import('../erp-components/material-receipt-note-approval/material-receipt-note-approval').then((m) => m.MaterialReceiptNoteApproval)
    },
    {
        path: 'gate-pass-new',
        loadComponent: () => import('../erp-components/gate-pass-new/gate-pass-new').then((m) => m.GatePassNew)
    },
    {
        path: 'purchase-order-new',
        loadComponent: () => import('../erp-components/purchase-order-new/purchase-order-new').then((m) => m.PurchaseOrderNew)
    },
    {
        path: 'purchase-order-other-charges',
        loadComponent: () => import('../erp-components/purchase-order-other-charges/purchase-order-other-charges').then((m) => m.PurchaseOrderOtherCharges)
    },
    {
        path: 'purchase-order-approval',
        loadComponent: () => import('../erp-components/purchase-order-approval/purchase-order-approval').then((m) => m.PurchaseOrderApproval)
    },
    {
        path: 'purchase-order-amendment',
        loadComponent: () => import('../erp-components/purchase-order-amendment/purchase-order-amendment').then((m) => m.PurchaseOrderAmendment)
    }
];
