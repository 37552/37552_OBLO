import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ErpDashboard } from './erp-dashboard/erp-dashboard';
import { EssDashboard } from '../Dashboards/ess-dashboard/ess-dashboard';
import { HrDashboard } from '../Dashboards/hr-dashboard/hr-dashboard';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ErpDashboard,EssDashboard,HrDashboard],
  providers: [DatePipe],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home implements OnInit {
  userCurrentRoleId = '';
  isERPUser = false;
  isESSUser = false;
  isHRMSUser = false;

  ngOnInit() {
    const currentRole = JSON.parse(sessionStorage.getItem('currentRole') || '{}');
    this.userCurrentRoleId = String(currentRole?.roleId || '');
    
    this.isERPUser = this.userCurrentRoleId === '44';
    this.isESSUser = this.userCurrentRoleId === '16';
    this.isHRMSUser = this.userCurrentRoleId === '12';

  }
}
