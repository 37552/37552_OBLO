import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: '[appNoDot]',
  standalone: true 
})
export class NoDotDirective {
  
  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event']) 
  onInputChange(event: Event) {
    const inputElement = this.el.nativeElement;
    const initialValue = inputElement.value;
    inputElement.value = initialValue.replace(/\./g, '');
    if (initialValue !== inputElement.value) {
      event.stopPropagation();
    }
  }
}