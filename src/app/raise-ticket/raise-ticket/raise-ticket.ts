import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { CardModule } from 'primeng/card';
import { UserService } from '../../shared/user-service';
import { Router } from '@angular/router';
declare const $: any;

@Component({
  selector: 'app-raise-ticket',
  imports: [CommonModule, CardModule],
  templateUrl: './raise-ticket.html',
  styleUrl: './raise-ticket.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RaiseTicket implements OnInit {
  // view state
  isView = true;
  noDatafoundCard = false;

  // table-related
  tblData: any[] = [];
  tableHeaders: string[] = [];
  dtTrigger = new Subject<any>();

  // service dependencies
  constructor(
    private userService: UserService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  serviceCatDrp: Array<{
    drpValue: number;
    drpOption: string;
    postapi: string;
    color: string;
    backgroundColor: string;
    routing: string;
  }> = [];

  param: any;
  percentVal: any = 0;
  FormName = '';
  FormValue = '';
  isLoading = true;
  tabsData: any[] = [];

  roleId: any;

  ngOnInit(): void {
    this.param = sessionStorage.getItem('menuItem');
    let paramjs = JSON.parse(this.param);
    this.FormName = paramjs.formName;
    this.roleId = JSON.parse(sessionStorage.getItem('currentRole') || '{}').roleId;

    this.getTabsData(true);
  }

  getTabsData(showLoader: boolean = false) {
    if (showLoader) {
      this.isLoading = true;
      this.cdr.detectChanges();
    }

    this.userService.getQuestionPaper(`uspGetMasterDataRaiseTicket|action=CATEGORY|id=0`).subscribe(
      (res: any) => {
        const allowedRoles = ['16'];
        if (allowedRoles.includes(this.roleId)) {
          this.tabsData = res['table']; // show all
        } else {
          this.tabsData = (res['table'] as any[]).filter(
            (x: any) => x.drpValue === 10099 || x.drpValue === 10097
          );
        }
      },
      (error: HttpErrorResponse) => {
        console.error('Error fetching tabs data:', error);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    );
  }

  onSelectCategory(data: any) {
    const routingPath = `/${data.routing}`;
    this.router.navigate([routingPath], {
      queryParams: {
        id: data.drpValue,
        name: data.drpOption,
        status: 'active',
        formName: this.FormName,
        postApi: data.postapi,
      },
    });
  }

  // clickableIds = [10097, 10100, 10099];

  // isClickable(id: number): boolean {
  //   return this.clickableIds.includes(id);
  // }

  // shouldHide(data: any): boolean {
  //   // hide Lion Services Limited when roleId is 5 or 97
  //   if (data.drpValue === 10097 && (this.roleId === '5' || this.roleId === '97')) {
  //     return true;
  //   }
  //   return false;
  // }
}
