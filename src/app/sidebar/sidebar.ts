import { Component, ChangeDetectionStrategy, signal, ChangeDetectorRef, computed, ViewChild, ElementRef, input, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { dynamicformvalues } from '../shared/object-param.model';
import { UserService } from '../shared/user-service';
import { Router } from '@angular/router';
import { SkeletonModule } from 'primeng/skeleton';
import { LoadingService } from '../shared/loading.service';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, SkeletonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  outputs: ['toggleSidebar'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sidebar {
  @Output() toggleSidebar = new EventEmitter<void>();
  // receives open/close state from parent
  isSidebarOpen = input<boolean>();
  // dynamic submenu state
  private submenus = signal<{ [key: string]: boolean }>({});
  // menu data
  currentusermenu = signal<any[]>([]);
  currenusermenusub = signal<any[]>([]);
  CurrentUserMenusub_level2 = signal<any[]>([]);
  isLoading: boolean = true; // This is the key variable
  loading$!: Observable<boolean>;

  hoveredMenuSubmenus: any[] = [];
  hoverMenuPosition: { top: number; left: number } | null = null;
  hoveredOverPopup = false;
  private eventSub!: Subscription;
  constructor(private userService: UserService, private router: Router,
    public loadingService: LoadingService, private cdr: ChangeDetectorRef,
  ) {

  }

  ngOnInit(): void {
    this.loading$ = this.loadingService.loading$;
    this.loadMenuData();

    // Listen for role/menu change events and reload menus without full page refresh
    this.eventSub = this.userService.currentEvent.subscribe((evt: any) => {
      if (evt && evt.eventName === 'NAV_BAR') {
        this.loadMenuData();
        this.cdr.markForCheck();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.eventSub) {
      this.eventSub.unsubscribe();
    }
  }

  loadMenuData() {
    this.loadingService.startLoading(); // Start loading
    const state: { [key: string]: boolean } = {};
    const currentUserMenu = JSON.parse(sessionStorage.getItem('CurrentUserMenu') || '[]');
    const currentUserMenuSub = JSON.parse(sessionStorage.getItem('CurrentUserMenusub') || '[]');
    const currentUserMenuSubLevel2 = JSON.parse(sessionStorage.getItem('CurrentUserMenusub_level2') || '[]');

    this.currentusermenu.set(currentUserMenu);
    this.currenusermenusub.set(currentUserMenuSub);
    this.CurrentUserMenusub_level2.set(currentUserMenuSubLevel2);

    [...currentUserMenu, ...currentUserMenuSub, ...currentUserMenuSubLevel2].forEach(item => {
      state[item.menu] = false;
    });
    this.submenus.set(state);
    this.loadingService.stopLoading(); // Stop loading
  }

  isSubmenuOpen(name: string): boolean {
    return this.submenus()[name];
  }

  toggleSubmenu(name: string, accordion = false): void {
    this.submenus.update(state => {
      const newState: { [key: string]: boolean } = {};
      if (accordion) {
        // close all when opening a top-level menu
        Object.keys(state).forEach(k => (newState[k] = false));
      } else {
        Object.assign(newState, state);
      }

      newState[name] = !state[name];
      return newState;
    });
  }

  closeSidebarOnMobile(): void {
    if (window.innerWidth < 768) {
      this.toggleSidebar.emit();
    }
  }

  // --- Helpers for menus ---
  hasSubmenu(menu: string): boolean {
    return this.currenusermenusub().some((sub: any) => sub.menu === menu);
  }

  getSubmenus(menu: string) {
    return this.currenusermenusub().filter((sub: any) => sub.menu === menu);
  }

  hasSubmenuLevel2(submenu: string): boolean {

    return this.CurrentUserMenusub_level2().some((lvl2: any) => lvl2.menu === submenu);
  }

  getSubmenuLevel2(submenu: string) {
    return this.CurrentUserMenusub_level2().filter((lvl2: any) => lvl2.menu === submenu);
  }


  action(menu: string, page: string, form: string, formValue: string) {

    const objList = <dynamicformvalues>{};
    objList.formName = form;
    objList.formValue = formValue;
    objList.menu = menu;
    this.userService.Setdynamicformparam(JSON.stringify(objList));
    if (!sessionStorage['menuItem']) {
      sessionStorage.setItem('menuItem', JSON.stringify(objList));
    } else {
      sessionStorage.removeItem('menuItem');
      sessionStorage.setItem('menuItem', JSON.stringify(objList));
    }
    if (page == 'MasterForm' || page == 'ReportForm' || page == 'CustomForm') {
      this.router.navigate(['/Loading']).then(() => {
        this.router.navigate(['/' + page]);
      });
    }
    else {
      this.router.navigate(['/' + page]);
    }
    this.submenus.update(state => {
      const newState: { [key: string]: boolean } = {};
      newState[form] = !state[form];
      return newState;
    });

  }
  setSubmenuItem(type: string, defaultmenu = '') {
    if (type === "M") {
      return 'MasterForm';
    }
    if (type === "T") {
      return 'CustomForm';
    }
    if (type === "R") {
      return 'ReportForm';
    }
    else {
      return defaultmenu
    }
  }

  onHoverMenu(menuName: string, event: MouseEvent) {
    if (!this.isSidebarOpen()) {
      this.hoveredMenuSubmenus = this.getSubmenus(menuName);
      const target = event.target as HTMLElement;
      const rect = target.getBoundingClientRect();
      this.hoverMenuPosition = { top: rect.top, left: rect.right + 5 };
    }
  }

  onLeaveMenu() {
    setTimeout(() => {
      if (!this.hoveredOverPopup) this.clearHover();
    }, 200); // small delay to allow moving mouse to popup
  }

  keepHover() {
    this.hoveredOverPopup = true;
  }

  clearHover() {
    this.hoveredOverPopup = false;
    this.hoveredMenuSubmenus = [];
    this.hoverMenuPosition = null;
  }

}
