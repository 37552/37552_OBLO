// holiday-list.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from '../../shared/user-service';
import { Customvalidation } from '../../shared/Validation';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { TableTemplate } from '../../table-template/table-template';
import { MenuItem } from 'primeng/api';
import { ExcelService } from '../../shared/excel.service';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-holiday-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, BreadcrumbModule, TableTemplate, ButtonModule],
  providers: [ExcelService],
  templateUrl: './holiday-list.html',
  styleUrls: ['./holiday-list.scss'],
})
export class HolidayList implements OnInit {

  /* ── Breadcrumb ── */
  menulabel: string = '';
  formlable: string = '';
  breadcrumbItems: MenuItem[] = [];

  /* ── Table ── */
  allData: any[] = [];
  viewData: any[] = [];
  columns: any[] = [
    { key: 'rowNo', header: 'S.No', isVisible: true, isSortable: false, isCustom: false },
    { key: 'jsonDetails', header: 'Holiday', isVisible: true, isSortable: true, isCustom: true },
    { key: 'date', header: 'Date', isVisible: true, isSortable: true, isCustom: false },
    { key: 'day Name', header: 'Day Name', isVisible: true, isSortable: true, isCustom: false },
    { key: 'holiday Type', header: 'Holiday Type', isVisible: true, isSortable: true, isCustom: false }
  ];
  totalCount: number = 0;

  /* ── UI State ── */
  isLoading: boolean = false;
  noDatafoundCard: boolean = false;

  /* ── Search / Sort / Pagination ── */
  searchText: string = '';
  sortCol: string = '';
  sortDir: 'asc' | 'desc' = 'asc';
  pageNo: number = 1;
  pageSize: number = 10;

  /* ── Store actual API keys for search ── */
  private rawKeys: string[] = ['holiday', 'date', 'day Name', 'holiday Type'];

  private readonly IMG_BASE = 'https://elocker.nobilitasinfotech.com/';

  constructor(
    private userService: UserService,
    private Customvalidation: Customvalidation,
    private excelService: ExcelService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    const raw = sessionStorage.getItem('menuItem');
    if (raw) {
      const p = JSON.parse(raw);
      this.menulabel = p.menu ?? '';
      this.formlable = p.formName ?? '';
    } else {
      this.menulabel = 'ESS';
      this.formlable = 'Holiday List';
    }

    this.breadcrumbItems = [
      { label: 'Home', routerLink: '/home' },
      { label: this.menulabel, routerLink: '/ess' },
      { label: this.formlable },
    ];

    this.showData();
  }

  showData(): void {
    this.isLoading = true;
    this.noDatafoundCard = false;
    this.allData = [];
    this.pageNo = 1;
    this.cdr.detectChanges();

    this.userService
      .getQuestionPaper(
        `uspReportHolidayList|appUserId=${sessionStorage.getItem('userId')}`
      )
      .subscribe({
        next: (res: any) => {
          const table: any[] = res?.['table'] ?? [];

          if (table.length === 0) {
            this.isLoading = false;
            this.noDatafoundCard = true;
            this.cdr.detectChanges();
            return;
          }

          this.allData = table.map((row: any, i: number) => ({
            ...row,
            rowNo: i + 1,
            jsonDetails: row['holiday']
          }));

          this.noDatafoundCard = false;
          this.getViewData(false);
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err: HttpErrorResponse) => {
          this.isLoading = false;
          this.cdr.detectChanges();
          if (err.status === 403) this.Customvalidation.loginroute(err.status);
        },
      });
  }

  getViewData(showSpinner: boolean = false): void {
    if (showSpinner) {
      this.isLoading = true;
      this.cdr.detectChanges();
    }

    let data = [...this.allData];

    if (this.searchText.trim()) {
      const q = this.searchText.toLowerCase();
      data = data.filter(row =>
        this.rawKeys.some(k =>
          String(row[k] ?? '').toLowerCase().includes(q)
        )
      );
    }

    if (this.sortCol) {
      const actualKey = this.sortCol === 'jsonDetails' ? 'holiday' : this.sortCol;
      data.sort((a, b) => {
        const va = String(a[actualKey] ?? '').toLowerCase();
        const vb = String(b[actualKey] ?? '').toLowerCase();
        return this.sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      });
    }

    this.totalCount = data.length;
    const start = (this.pageNo - 1) * this.pageSize;
    this.viewData = data.slice(start, start + this.pageSize);

    if (showSpinner) {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  onSort(event: { column: string; direction: 'asc' | 'desc' }): void {
    this.sortCol = event.column;
    this.sortDir = event.direction;
    this.pageNo = 1;
    this.getViewData(false);
  }

  onPageChange(newPage: number) {
    this.pageNo = newPage;
    this.getViewData(false);
  }

  onPageSizeChange(newSize: number) {
    this.pageSize = newSize;
    this.pageNo = 1;
    this.getViewData(false);
  }

  onSearchChange(search: string): void {
    this.searchText = search;
    this.pageNo = 1;
    this.getViewData(false);
  }

  buildImageUrl(path: string): string {
    return `https://picsum.photos/seed/${encodeURIComponent(path || 'holiday')}/40/40`;
  }

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }

  min(a: number, b: number): number { return Math.min(a, b); }

  exportAsXLSX(): void {
    this.excelService.exportAsExcelFile(
      this.allData,
      (this.formlable || 'HolidayList').toString()
    );
  }
}