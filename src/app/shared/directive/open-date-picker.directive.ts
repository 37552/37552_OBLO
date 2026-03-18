import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: '[appOpenDatePicker]',
  standalone: true 
})
export class OpenDatePickerDirective {

  constructor(private el: ElementRef) { }

  @HostListener('click')
  onClick() {
    this.el.nativeElement.showPicker();
  }
}
