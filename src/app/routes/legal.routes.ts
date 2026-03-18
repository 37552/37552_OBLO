import { Routes } from '@angular/router';

export const legalRoutes: Routes = [
    {
        path: 'parties-form',
        loadComponent: () => import('../legal-management/parties-form/parties-form').then((m) => m.PartiesForm)
    },
    {
        path: 'courts-form',
        loadComponent: () => import('../legal-management/courts-form/courts-form').then((m) => m.CourtsForm)
    },
    {
        path: 'legal-team-form',
        loadComponent: () => import('../legal-management/legal-team-form/legal-team-form').then((m) => m.LegalTeamForm)
    },
    {
        path: 'contracts-forms',
        loadComponent: () => import('../legal-management/contracts-forms/contracts-forms').then((m) => m.ContractsForms)
    },
    {
        path: 'notices-forms',
        loadComponent: () => import('../legal-management/notices-forms/notices-forms').then((m) => m.NoticesForms)
    },
    {
        path: 'cases-litigation-forms',
        loadComponent: () => import('../legal-management/cases-litigation-forms/cases-litigation-forms').then((m) => m.CasesLitigationForms)
    },
    {
        path: 'arbitrations-forms',
        loadComponent: () => import('../legal-management/arbitrations-forms/arbitrations-forms').then((m) => m.ArbitrationsForms)
    },
    {
        path: 'hearings-forms',
        loadComponent: () => import('../legal-management/hearings-forms/hearings-forms').then((m) => m.HearingsForms)
    },
    {
        path: 'compliances-forms',
        loadComponent: () => import('../legal-management/compliances-forms/compliances-forms').then((m) => m.CompliancesForms)
    },
    {
        path: 'compliances-activities-forms',
        loadComponent: () => import('../legal-management/compliances-activities-forms/compliances-activities-forms').then((m) => m.CompliancesActivitiesForms)
    },
    {
        path: 'tax-rate',
        loadComponent: () => import('../taxes-and-compliance/tax-rate/tax-rate').then((m) => m.TaxRate)
    },
    {
        path: 'kyc-documents',
        loadComponent: () => import('../taxes-and-compliance/kyc-documents/kyc-documents').then((m) => m.KycDocuments)
    },
    {
        path: 'tax-exemption',
        loadComponent: () => import('../taxes-and-compliance/tax-exemption/tax-exemption').then((m) => m.TaxExemption)
    },
    {
        path: 'msme-settings',
        loadComponent: () => import('../taxes-and-compliance/msme-settings/msme-settings').then((m) => m.MsmeSettings)
    }
];
