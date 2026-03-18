import { Directive, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: '[appOnlyString]',
  standalone: true 
})
export class OnlyStringDirective {

  private allowedKeys = [
    'Backspace', 'Delete', 'Tab', 'Escape', 'Enter', ' ',
    'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'
  ];

  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event'])
  onInputChange(event: Event) {
    const initialValue = this.el.nativeElement.value;
    this.el.nativeElement.value = initialValue.replace(/[^a-zA-Z ]*/g, '');

    if (initialValue !== this.el.nativeElement.value) {
      event.stopPropagation();
    }
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: Event) {
    if (!(event instanceof KeyboardEvent)) {
      return;
    }

    // Allow special keys
    if (this.allowedKeys.includes(event.key) ||
        (event.ctrlKey && ['a', 'c', 'v', 'x'].includes(event.key.toLowerCase()))) {
      return;
    }

    // Allow only alphabetic characters
    const isAlphabet = /^[a-zA-Z]$/.test(event.key);
    if (!isAlphabet) {
      event.preventDefault();
    }
  }
}