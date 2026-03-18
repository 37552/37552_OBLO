import { ChangeDetectionStrategy, Component, signal, OnInit, input, output } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { Sidebar } from '../sidebar/sidebar';
import { Header } from '../header/header';
import { RouterOutlet } from '@angular/router';

import { MenuItem } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { RouterModule } from '@angular/router';
import { UserService } from '../shared/user-service';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Toast } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';


@Component({
  selector: 'app-applayout',
  imports: [CommonModule, Sidebar, Header, RouterOutlet, BreadcrumbModule, RouterModule, ConfirmDialog, Toast],
  providers: [ConfirmationService, MessageService],
  templateUrl: './applayout.html',
  styleUrl: './applayout.scss'
})
export class Applayout {
  items: MenuItem[] | undefined;

  home: MenuItem | undefined;

  param: any;
  FormValue: any;
  FormName: any;
  formlable: any;
  menulabel: any;

  constructor(private userService: UserService) { }

  ngOnInit() {

    if (sessionStorage.getItem('menuItem') !== null) {
      this.param = sessionStorage.getItem('menuItem');
      let paramjs = JSON.parse(this.param);
      this.FormValue = paramjs.formValue;
      this.FormName = paramjs.formName;
      this.formlable = paramjs.formName;
      this.menulabel = paramjs.menu;
      this.items = [{ icon: 'pi pi-home', route: '/home' }, { label: this.menulabel }, { label: this.formlable },];
    }

    // else {
    //   this.items = [{ icon: 'pi pi-home', route: '/home' }, { label: '' }, { label: '' }];
    // }


  }
  // private sidebarState = signal(true);
  isSidebarOpen() {
    // return this.sidebarState();
    return this.userService.sidebarState();
  }
  toggleSidebar() {
    this.userService.sidebarState.update(open => !open);
  }

  // private sidebarState = signal(true);
  // isSidebarOpen() {
  //   return this.sidebarState();
  // }
  // toggleSidebar() {
  //   this.sidebarState.update(open => !open);
  // }
}
