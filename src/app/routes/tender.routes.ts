import { Routes } from '@angular/router';

export const tenderRoutes: Routes = [
    {
        path: 'vendor-profile',
        loadComponent: () => import('../tender-document/vendor-profile/vendor-profile').then((m) => m.VendorProfile)
    },
    {
        path: 'tender-details',
        loadComponent: () => import('../tender-document/tender-details/tender-details').then((m) => m.TenderDetails)
    },
    {
        path: 'pre-bid-queries',
        loadComponent: () => import('../tender-document/pre-bid-queries/pre-bid-queries').then((m) => m.PreBidQueries)
    },
    {
        path: 'technical-bid-submission',
        loadComponent: () => import('../tender-document/technical-bid-submission/technical-bid-submission').then((m) => m.TechnicalBidSubmission)
    },
    {
        path: 'technical-bid-evaluation',
        loadComponent: () => import('../tender-document/technical-bid-evaluation/technical-bid-evaluation').then((m) => m.TechnicalBidEvaluation)
    },
    {
        path: 'financial-bid',
        loadComponent: () => import('../tender-document/financial-bid/financial-bid').then((m) => m.FinancialBid)
    },
    {
        path: 'tender-approval',
        loadComponent: () => import('../tender-document/tender-approval/tender-approval').then((m) => m.TenderApproval)
    },
    {
        path: 'tender-agreement',
        loadComponent: () => import('../tender-document/tender-agreement/tender-agreement').then((m) => m.TenderAgreement)
    },
    {
        path: 'letter-of-acceptance',
        loadComponent: () => import('../tender-document/letter-of-acceptance/letter-of-acceptance').then((m) => m.LetterOfAcceptance)
    },
    {
        path: 'tender-closure',
        loadComponent: () => import('../tender-document/tender-closure/tender-closure').then((m) => m.TenderClosure)
    }
];
