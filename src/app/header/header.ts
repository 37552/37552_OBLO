import {
  Component,
  Output,
  EventEmitter,
  signal,
  Input,
  ElementRef,
  ViewChild,
  HostListener,
} from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { UserService } from '../shared/user-service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { Listbox } from 'primeng/listbox';
import { ChangeDetectorRef } from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { Customvalidation } from '../shared/Validation';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-header',
  imports: [
    AvatarModule,
    OverlayBadgeModule,
    CommonModule,
    TooltipModule,
    MenuModule,
    ButtonModule,
    FormsModule,
    SelectModule,
    ConfirmDialogModule,
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  @Output() toggleSidebar = new EventEmitter<void>();
  @ViewChild('dropdownMenu') dropdownMenu!: ElementRef;
  items: MenuItem[] = [];
  userMenuItems: MenuItem[] = []; // For PrimeNG Menu
  private dropdowns = signal<{ [key: string]: boolean }>({ 'ui-kit': false });
  public sidebarState = signal(true);
  @Input() isSidebarOpen: boolean = true;
  @ViewChild('userMenu') userMenu: any; // Reference to PrimeNG Menu
  userData: any;
  profileImageUrl: string = '';
  currentRole: any;
  avatarDisplay: string = '';
  userIdValue: any;
  constructor(
    private userService: UserService,
    private router: Router,
    private elementRef: ElementRef,
    private cdRef: ChangeDetectorRef,
    private Customvalidation: Customvalidation,
    private confirmationService: ConfirmationService
  ) { }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Check if the click occurred outside of the component's host element
    const isClickInsideComponent = this.elementRef.nativeElement.contains(event.target);
    // If the click is outside the component and the dropdown is open, close it
    if (!isClickInsideComponent && this.isUserDropdownOpen) {
      this.isUserDropdownOpen = false;
      this.isRoleBoxVisible = false;
    }

    if (!isClickInsideComponent && this.isRoleBoxVisible) {
      this.isRoleBoxVisible = false;
    }
    if (!isClickInsideComponent && this.isDistrictBoxVisible) {
      this.isDistrictBoxVisible = false;
    }
  }

  isUserDropdownOpen = false;

  toggleUserDropdown() {
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
    this.isRoleBoxVisible = false;
    this.isDistrictBoxVisible = false;
  }

  // Method to handle menu hide event
  onUserMenuHide() {
    // Optional: Add any cleanup logic here
  }

  // Helper methods for user data
  getUserName(): string {
    if (Array.isArray(this.userData) && this.userData.length > 0) {
      return this.userData[0]?.empnam || 'User';
    }
    return this.userData?.empnam || 'User';
  }

  getUserInitial(): string {
    const name = this.getUserName();
    return name.charAt(0).toUpperCase();
  }

  roleList: any = [];
  selectedRole: any;
  isRoleBoxVisible = false;
  isDistrictBoxVisible = false;

  searchQuery = '';
  searchDistrict = '';
  filteredRoleList: any[] = [];
  filteredDistList: any[] = [];
  districtArr: any[] = [];
  selectedDistrict: string = '';
  selectedDistrictValue: any = null; // For PrimeNG dropdown
  selectedRoleId: any = null; // For PrimeNG dropdown
  ngOnInit() {
    if (sessionStorage.getItem('userRole')) {
      let RoleListOne = (this.roleList = JSON.parse(sessionStorage.getItem('userRole') || ''));
      this.roleList = RoleListOne.Roles;
      var curRole = sessionStorage.getItem('currentRole') || '';
      this.userData = JSON.parse(sessionStorage.getItem('UserInfo') || '');
      if (this.userData?.photopath) {
        this.profileImageUrl =
          'https://elocker.nobilitasinfotech.com/' + this.userData['photopath'];
      } else {
        this.profileImageUrl = 'assets/images/avatars/avatar2.pn'; // fallback image
      }
      let i = JSON.parse(curRole);
      this.currentRole = i?.rolDes;
    }
    this.items = [
      {
        label: 'Log out',
        icon: 'pi pi-sign-out', // Use PrimeIcons for the icon
        command: () => {
          this.onLogout();
        },
      },
    ];

    // Setup User Menu Items for PrimeNG Menu
    this.userMenuItems = [
      {
        label: 'Profile',
        icon: 'pi pi-user',
        command: () => {
          this.router.navigate(['/user-profile']);
        },
      },
      {
        label: 'Change Password',
        icon: 'pi pi-lock',
        command: () => {
          this.router.navigate(['/change-password']);
        },
      },
      { separator: true },
      {
        label: 'Logout',
        icon: 'pi pi-sign-out',
        command: () => {
          this.confirmLogout();
        },
      },
    ];

    this.filteredRoleList = [...this.roleList];
    this.getDistrictDropdownDtDc();
    this.getOrganizationDropdown();
  }
  confirmLogout() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to logout?',
      header: 'Logout Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes',
      rejectLabel: 'No',
      accept: () => {
        this.onLogout();

      },
      reject: () => {
        this.confirmationService.close();
      },

    });
  }
  filterRoles() {
    if (!this.searchQuery) {
      // If the search query is empty, show all roles
      this.filteredRoleList = [...this.roleList];
    } else {
      // Filter roles based on the search query (case-insensitive)
      const query = this.searchQuery.toLowerCase();
      this.filteredRoleList = this.roleList.filter((role: any) =>
        role.rolDes.toLowerCase().includes(query)
      );
    }
  }

  filterDistrict() {
    if (!this.searchDistrict) {
      this.filteredDistList = [...this.districtArr];
    } else {
      const query = this.searchDistrict.toLowerCase();
      this.filteredDistList = this.districtArr.filter((dist: any) =>
        dist.drpoption.toLowerCase().includes(query)
      );
    }
  }

  isDropdownOpen(name: string): boolean {
    return this.dropdowns()[name];
  }

  // isSidebarOpen() {
  //
  //   return this.sidebarState();
  // }

  toggleDropdown(name: string): void {
    this.dropdowns.update((state) => ({
      ...state,
      [name]: !state[name],
    }));
  }
  getIcon() {
    return this.isSidebarOpen ? 'pi pi-angle-double-left' : 'pi pi-angle-double-right';
  }

  onLogout() {
    let token = sessionStorage.getItem('userToken') || '';
    let userId = sessionStorage.getItem('userId') || '';
    this.userService.userAuthenticationLogOutHome(token, userId).subscribe(
      (res: any) => {
        this.router.navigate(['/login']);
      },

    );
  }

  // Method to toggle the visibility
  toggleListBox() {
    this.isRoleBoxVisible = !this.isRoleBoxVisible;
    this.isUserDropdownOpen = false;
    this.isDistrictBoxVisible = false;
    if (this.isRoleBoxVisible) {
      this.searchQuery = '';
      this.filterRoles();
    }
  }

  toggleDistrictBox() {
    this.isDistrictBoxVisible = !this.isDistrictBoxVisible;
    this.isUserDropdownOpen = false;
    this.isRoleBoxVisible = false;
    if (this.isDistrictBoxVisible) {
      this.searchDistrict = '';
      this.filterDistrict();
    }
  }

  private notifyNavBar1(reason: 'role' | 'district') {
    this.userService.changeEvent({
      eventName: 'NAV_BAR',
      reason,
      roleId: this.selectedRoleId,
      districtId: this.selectedDistrictValue,
    });
  }

  changeRole(roleId: string, roleDes: string) {
    this.selectedRoleId = roleId;
    sessionStorage.setItem(
      'currentRole',
      JSON.stringify({ roleId: roleId, rolDes: roleDes })
    );

    console.log('Updated currentRole:-', sessionStorage.getItem('currentRole'));
    this.userService
      .getChangeRoleUserData(
        sessionStorage.getItem('userId') || '',
        roleId,
        'header'
      )
      .subscribe({
        next: (datacomget: any) => {

          sessionStorage.removeItem('UserInfo');
          sessionStorage.removeItem('CurrentUserMenu');
          sessionStorage.removeItem('CurrentUserMenusub');
          sessionStorage.removeItem('CurrentUserMenusub_level2');

          sessionStorage.setItem('UserInfo', JSON.stringify(datacomget.table[0]));
          sessionStorage.setItem('CurrentUserMenu', JSON.stringify(datacomget.table1));
          sessionStorage.setItem('CurrentUserMenusub', JSON.stringify(datacomget.table2));
          sessionStorage.setItem('CurrentUserMenusub_level2', JSON.stringify(datacomget.table3));

          this.notifyNavBar('role');

          this.searchQuery = '';

          const normalizedRole = (roleDes || '').toLowerCase().trim();

          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            if (normalizedRole === 'crm admin') {
              this.router.navigate(['/crm-admin-dashboard']);
            }
            else if (normalizedRole === 'service engineer') {
              this.router.navigate(['/service-engineer-dashboard']);
            }
            else if (normalizedRole === 'crm') {
              this.router.navigate(['/crm-csr-dashboard']);
            }
            else {
              this.router.navigate(['/home']);
            }
          });
        },

        error: (err: HttpErrorResponse) => {
          this.Customvalidation.loginroute(err.status);
          this.router.navigate(['/login']);
        }
      });
  }

  private notifyNavBar(reason: 'role' | 'district') {
    this.userService.changeEvent({
      eventName: 'NAV_BAR',
      reason,
      roleId: this.selectedRoleId,      // ✅ updated roleId
      districtId: this.selectedDistrictValue
    });
  }


  getDistrictDropdownDtDc() {
    let infoTostring = sessionStorage.getItem('UserInfo') || '';
    if (sessionStorage.getItem('UserInfo') && infoTostring.toString() != '') {
      let user = JSON.parse(sessionStorage.getItem('UserInfo') || '');
      this.userIdValue = sessionStorage.getItem('userId');
      this.userService.getQuestionPaper(`uspGetHomePageCity|userId=${this.userIdValue}`).subscribe(
        (res: any) => {
          this.districtArr = res['table'];

          this.filteredDistList = [...this.districtArr];
          let districtData = JSON.parse(sessionStorage.getItem('SelectedDistrict') || '{}');
          if (districtData && districtData.value) {
            if (this.districtArr.some((e: any) => e.drpvalue == districtData.value)) {
              this.selectedDistrict = districtData.option;
              this.selectedDistrictValue = districtData.value; // Set PrimeNG dropdown value
              // this.getDistrictLogo(districtData.value);
            } else {
              this.selectedDistrict = this.districtArr[0]['drpoption'];
              this.selectedDistrictValue = this.districtArr[0]['drpvalue']; // Set PrimeNG dropdown value
              // this.getDistrictLogo(this.districtArr[0]['drpvalue']);
              sessionStorage.removeItem('SelectedDistrict');
              sessionStorage.removeItem('District');
              sessionStorage.setItem('District', this.districtArr[0]['drpvalue']);
              let obj = {
                option: this.districtArr[0]['drpoption'],
                value: this.districtArr[0]['drpvalue'],
              };
              sessionStorage.setItem('SelectedDistrict', JSON.stringify(obj));
            }
          } else {
            sessionStorage.removeItem('SelectedDistrict');
            sessionStorage.removeItem('District');
            let selected: any = [];
            if (res['table1'] && res['table1'].length > 0) {
              selected = this.districtArr.filter(
                (e: any) => e.drpvalue == res['table1'][0]['districtId']
              );
            }
            let selectedDistrict =
              res['table1'] && res['table1'].length > 0 ? selected[0] : this.districtArr[0];
            let obj = {
              option: selectedDistrict['drpoption'],
              value: selectedDistrict['drpvalue'],
            };
            sessionStorage.setItem('District', selectedDistrict['drpvalue']);
            this.selectedDistrict = selectedDistrict['drpoption'];
            this.selectedDistrictValue = selectedDistrict['drpvalue']; // Set PrimeNG dropdown value
            sessionStorage.setItem('SelectedDistrict', JSON.stringify(obj));
            // this.getDistrictLogo(sessionStorage.getItem('District'));
            // this.router.navigate(['/home']);
          }
          // Set selected role for PrimeNG dropdown
          let curRole = sessionStorage.getItem('currentRole') || '';
          if (curRole) {
            try {
              let roleObj = JSON.parse(curRole);
              this.selectedRoleId = roleObj?.roleId || null;
            } catch (e) {
              console.error('Error parsing currentRole:', e);
            }
          }
          this.cdRef.detectChanges();
        },
      );
    }
  }

  // getDistrictLogo(districtID) {
  //   let query = "uspGetCityLogo|districtId=" + districtID
  //   this.userService
  //     .getQuestionPaperOne(query)
  //     .subscribe(
  //       (datacom: any) => {
  //         this.districtImg = datacom.table[0].logo;
  //         this.districtLogo = datacom.table[0].company_logo;
  //         this.dataEmitter.emit(this.districtLogo);
  //       },
  //       (err: HttpErrorResponse) => {
  //         console.log(err.message);
  //       }
  //     );
  // }

  changeDistrict(districtValue: any) {
    // Find the district object from the value
    const district = this.districtArr.find((d: any) => (d as any).drpvalue == districtValue);
    if (!district) return;

    let obj = {
      option: (district as any).drpoption,
      value: (district as any).drpvalue,
    };
    sessionStorage.removeItem('SelectedDistrict');
    sessionStorage.removeItem('District');
    sessionStorage.setItem('District', (district as any).drpvalue);
    sessionStorage.setItem('SelectedDistrict', JSON.stringify(obj));
    this.selectedDistrict = (district as any).drpoption;
    this.selectedDistrictValue = (district as any).drpvalue;
    this.notifyNavBar('district');
  }

  onRoleDropdownChange(event: any) {
    const roleId = event.value;
    if (!roleId) return;

    // Find the role object
    const role = this.roleList.find((r: any) => (r as any).roleId == roleId);
    if (role) {
      this.changeRole(role.roleId, role.rolDes);
    }
  }

  organizationArr: any[] = [];
  selectedOrganization: string = '';
  selectedOrgImage: string = '';


  getOrganizationDropdown() {
    const userId = sessionStorage.getItem('userId');

    if (userId) {
      this.userService
        .getQuestionPaper(`uspGetUserOrgMapping|appUserId=${userId}`)
        .subscribe(
          (res: any) => {
            if (res?.table && res.table.length > 0) {
              this.organizationArr = res.table;

              const storedOrg = sessionStorage.getItem('SelectedOrganization');

              if (storedOrg) {
                const parsedOrg = JSON.parse(storedOrg);
                this.selectedOrganization = parsedOrg.option;
                this.selectedOrgImage = parsedOrg.image || 'assets/images/company_logo_small.png';
              }
              else {
                const defaultOrgFromAPI = res.table.find((org: any) => org.isDefault) || res.table[0];
                const defaultOrg = {
                  option: defaultOrgFromAPI.drpOption,
                  value: defaultOrgFromAPI.drpValue,
                  image: defaultOrgFromAPI.orgImage || 'assets/images/company_logo_small.png'
                };
                sessionStorage.setItem('Organization', defaultOrg.value);
                sessionStorage.setItem('SelectedOrganization', JSON.stringify(defaultOrg));

                this.selectedOrganization = defaultOrg.option;
                this.selectedOrgImage = defaultOrg.image;
              }
            }
          },
          (err) => {
            console.error('Organization API Error:', err);
          }
        );
    }
  }
}
