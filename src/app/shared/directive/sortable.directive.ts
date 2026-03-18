import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appSortable]',
  standalone: true 
})
export class SortableDirective {
  @Input() appSortable: any[] = [];
  @Input() sortKey: string = '';
  
  private sortDirection: 'asc' | 'desc' = 'asc';

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('click')
  onClick() {
    if (this.sortKey) {
      this.sortData();
      this.toggleSortDirection();
      this.updateSortIcon();
    }
  }

  private sortData() {
    this.appSortable.sort((a: any, b: any) => {
      const valueA = a[this.sortKey];
      const valueB = b[this.sortKey];
      if (valueA < valueB) {
        return this.sortDirection === 'asc' ? -1 : 1;
      } else if (valueA > valueB) {
        return this.sortDirection === 'asc' ? 1 : -1;
      } else {
        return 0;
      }
    });
  }

  private toggleSortDirection() {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  }

  private updateSortIcon() {
    const icon = this.el.nativeElement.querySelector('.sort-icon');
    if (icon) {
      this.renderer.removeClass(icon, 'fa-arrow-up');
      this.renderer.removeClass(icon, 'fa-arrow-down');
      this.renderer.addClass(icon, this.sortDirection === 'asc' ? 'fa-arrow-up ' : 'fa-arrow-down');
    }
  }
}
