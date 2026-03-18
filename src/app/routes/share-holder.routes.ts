import { Routes } from '@angular/router';

export const shareHolderRoutes: Routes = [
    {
        path: 'share-holder',
        loadComponent: () => import('../ShareHolder/share-holder/share-holder').then((m) => m.ShareHolder)
    },
    {
        path: 'board-meetings',
        loadComponent: () => import('../ShareHolder/board-meetings/board-meetings').then((m) => m.BoardMeetings)
    },
    {
        path: 'directors',
        loadComponent: () => import('../ShareHolder/directors/directors').then((m) => m.Directors)
    },
    {
        path: 'resolutions',
        loadComponent: () => import('../ShareHolder/resolutions/resolutions').then((m) => m.Resolutions)
    },
    {
        path: 'share-transfer',
        loadComponent: () => import('../ShareHolder/share-transfer/share-transfer').then((m) => m.ShareTransfer)
    },
    {
        path: 'statutory-register',
        loadComponent: () => import('../ShareHolder/statutory-register/statutory-register').then((m) => m.StatutoryRegister)
    },
    {
        path: 'corprate-organization',
        loadComponent: () => import('../ShareHolder/corprate-organization/corprate-organization').then((m) => m.CorprateOrganization)
    }
];
