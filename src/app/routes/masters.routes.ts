import { Routes } from '@angular/router';

export const mastersRoutes: Routes = [
    {
        path: 'group-master',
        loadComponent: () => import('../group-master/group-master').then((m) => m.GroupMaster)
    },
    {
        path: 'input-type-master',
        loadComponent: () => import('../input-type-master/input-type-master').then((m) => m.InputTypeMaster)
    },
    {
        path: 'form-access-master',
        loadComponent: () => import('../form-access/form-access').then((m) => m.FormAccess)
    },
    {
        path: 'user-form-access-master',
        loadComponent: () => import('../user-form-access/user-form-access').then((m) => m.UserFormAccess)
    },
    {
        path: 'user-form-sharing-master',
        loadComponent: () => import('../user-form-sharing/user-form-sharing').then((m) => m.UserFormSharing)
    },
    {
        path: 'user-hierarchy-flow',
        loadComponent: () => import('../user-hierarchy-flow/user-hierarchy-flow').then((m) => m.UserHierarchyFlow)
    },
    {
        path: 'activity-master',
        loadComponent: () => import('../activity-master/activity-master').then((m) => m.ActivityMaster)
    },
    {
        path: 'role-activity-master',
        loadComponent: () => import('../role-activity-master/role-activity-master').then((m) => m.RoleActivityMaster)
    },
    {
        path: 'menu-master',
        loadComponent: () => import('../menu-master/menu-master').then((m) => m.MenuMaster)
    },
    {
        path: 'role-master',
        loadComponent: () => import('../role-master/role-master').then((m) => m.RoleMaster)
    },
    {
        path: 'user-role-mapping',
        loadComponent: () => import('../user-role-mapping/user-role-mapping').then((m) => m.UserRoleMapping)
    },
    {
        path: 'role-activity-mapping',
        loadComponent: () => import('../role-activity-mapping/role-activity-mapping').then((m) => m.RoleActivityMapping)
    },
    {
        path: 'organization-master',
        loadComponent: () => import('../Organisation-Master/organisation-profile/organisation-profile').then((m) => m.OrganisationProfile)
    },
    {
        path: 'branch-master',
        loadComponent: () => import('../Organisation-Master/branchmaster/branchmaster').then((m) => m.Branchmaster)
    },
    {
        path: 'warehouse-master',
        loadComponent: () => import('../Organisation-Master/warehouse-master/warehouse-master').then((m) => m.WarehouseMaster)
    },
    {
        path: 'location-master',
        loadComponent: () => import('../Organisation-Master/location-master/location-master').then((m) => m.LocationMaster)
    },
    {
        path: 'binLocation-Master',
        loadComponent: () => import('../Organisation-Master/bin-location-master/bin-location-master').then((m) => m.BinLocationMaster)
    },
    {
        path: 'holiday-Master',
        loadComponent: () => import('../Organisation-Master/holiday-master/holiday-master').then((m) => m.HolidayMaster)
    },
    {
        path: 'shift-Master',
        loadComponent: () => import('../Organisation-Master/shiftmaster/shiftmaster').then((m) => m.Shiftmaster)
    },
    {
        path: 'department-Master',
        loadComponent: () => import('../Organisation-Master/department-master/department-master').then((m) => m.DepartmentMaster)
    },
    {
        path: 'division-master',
        loadComponent: () => import('../Organisation-Master/division-master/division-master').then((m) => m.DivisionMaster)
    },
    {
        path: 'sbu-master',
        loadComponent: () => import('../Organisation-Master/business-master/business-master').then((m) => m.BusinessMaster)
    },
    {
        path: 'designation-master',
        loadComponent: () => import('../Organisation-Master/designation-master/designation-master').then((m) => m.DesignationMaster)
    },
    {
        path: 'holiday-calender-master',
        loadComponent: () => import('../Organisation-Master/holiday-calender-master/holiday-calender-master').then((m) => m.HolidayCalenderMaster)
    },
    {
        path: 'system-settings',
        loadComponent: () => import('../system-settings/system-settings').then((m) => m.SystemSettings)
    },
    {
        path: 'account-settings',
        loadComponent: () => import('../account-settings/account-settings').then((m) => m.AccountSettings)
    }
];
