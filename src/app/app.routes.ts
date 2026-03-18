import { Routes } from '@angular/router';
import { Applayout } from './applayout/applayout';
import { authGuard } from './shared/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./login/login').then((m) => m.Login) },
  {
    path: '',
    component: Applayout,
    canActivate: [authGuard],
    children: [
      { path: 'home', loadComponent: () => import('./home/home').then((m) => m.Home) },
      { path: 'user-profile', loadComponent: () => import('./user-profile/user-profile').then((m) => m.UserProfile) },
      { path: 'demo', loadComponent: () => import('./demo/demo').then((m) => m.Demo) },

      // Feature Routes
      { path: '', loadChildren: () => import('./routes/crm.routes').then((m) => m.crmRoutes) },
      { path: '', loadChildren: () => import('./routes/sales.routes').then((m) => m.salesRoutes) },
      { path: '', loadChildren: () => import('./routes/inventory.routes').then((m) => m.inventoryRoutes) },
      { path: '', loadChildren: () => import('./routes/manufacturing.routes').then((m) => m.manufacturingRoutes) },
      { path: '', loadChildren: () => import('./routes/hr.routes').then((m) => m.hrRoutes) },
      { path: '', loadChildren: () => import('./routes/masters.routes').then((m) => m.mastersRoutes) },
      { path: '', loadChildren: () => import('./routes/legal.routes').then((m) => m.legalRoutes) },
      { path: '', loadChildren: () => import('./routes/tender.routes').then((m) => m.tenderRoutes) },
      { path: '', loadChildren: () => import('./routes/import-export.routes').then((m) => m.importExportRoutes) },
      { path: '', loadChildren: () => import('./routes/share-holder.routes').then((m) => m.shareHolderRoutes) },
      { path: '', loadChildren: () => import('./routes/chpl.routes').then((m) => m.chplRoutes) },
      { path: '', loadChildren: () => import('./routes/others.routes').then((m) => m.othersRoutes) },
      { path: '', loadChildren: () => import('./routes/ess.routes').then((m) => m.essRoutes) },

      // Page Not Found
      { path: '**', loadComponent: () => import('./page-not-found/page-not-found').then((m) => m.PageNotFound) },
    ],
  },
];
