import { Routes } from '@angular/router';

export const importExportRoutes: Routes = [
    {
        path: 'custom-clearance',
        loadComponent: () => import('../Import-Export/custom-clearance/custom-clearance').then((m) => m.CustomClearance)
    },
    {
        path: 'exim-document-tracker',
        loadComponent: () => import('../Import-Export/exim-document-tracker/exim-document-tracker').then((m) => m.EximDocumentTracker)
    },
    {
        path: 'exim-documents',
        loadComponent: () => import('../Import-Export/exim-documents/exim-documents').then((m) => m.EximDocuments)
    },
    {
        path: 'exim-shipment',
        loadComponent: () => import('../Import-Export/exim-shipment/exim-shipment').then((m) => m.EximShipment)
    },
    {
        path: 'international-commercial-terms',
        loadComponent: () => import('../Import-Export/international-commercial-terms/international-commercial-terms').then((m) => m.InternationalCommercialTerms)
    }
];
