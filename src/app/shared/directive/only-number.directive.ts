import { Directive, HostListener, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[appOnlyNumber]',
  standalone: true
})
export class OnlyNumberDirective {

  @Input() min: number | null = null;
  @Input() max: number | null = null;
  @Input() maxLength: number | null = null;

  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event'])
  onInputChange(event: Event) {
    const initialValue = this.el.nativeElement.value;

    let newValue = initialValue.replace(/[^0-9]/g, '');

    if (this.maxLength !== null && newValue.length > this.maxLength) {
      newValue = newValue.slice(0, this.maxLength);
    }

    if (newValue !== '') {
      const numericValue = parseInt(newValue, 10);
      
      if (this.min !== null && numericValue < this.min) {
        newValue = this.min.toString();
      }
      
      if (this.max !== null && numericValue > this.max) {
        newValue = this.max.toString();
      }
    }

    this.el.nativeElement.value = newValue;

    if (initialValue !== this.el.nativeElement.value) {
      event.stopPropagation();
    }
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if ([46, 8, 9, 27, 13, 37, 38, 39, 40].indexOf(event.keyCode) !== -1 ||
        (event.ctrlKey === true && (event.key === 'a' || event.key === 'c' || event.key === 'v' || event.key === 'x'))) {
      return;
    }

    if ((event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105)) {
      event.preventDefault();
    }

    const currentValue = this.el.nativeElement.value;
    if (this.maxLength !== null && 
        currentValue.length >= this.maxLength && 
        !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Escape', 'Enter'].includes(event.key)) {
      event.preventDefault();
    }
  }

  @HostListener('blur')
  onBlur() {

    const value = this.el.nativeElement.value;
    if (value !== '') {
      let numericValue = parseInt(value, 10);
      
      if (this.min !== null && numericValue < this.min) {
        this.el.nativeElement.value = this.min.toString();
      } else if (this.max !== null && numericValue > this.max) {
        this.el.nativeElement.value = this.max.toString();
      }
    }
  }
}