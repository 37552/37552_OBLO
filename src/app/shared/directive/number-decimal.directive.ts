import { Directive, HostListener, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[appOnlyDecimal]',
  standalone: true
})
export class OnlyDecimalDirective {

  @Input() min: number | null = null;
  @Input() max: number | null = null;
  @Input() maxLength: number | null = null; // total digits including decimals

  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event'])
  onInputChange(event: Event) {
    const inputElement = this.el.nativeElement as HTMLInputElement;
    const initialValue = inputElement.value;

    // Allow only digits and one decimal point
    let newValue = initialValue.replace(/[^0-9.]/g, '');

    // Prevent more than one decimal point
    const parts = newValue.split('.');
    if (parts.length > 2) {
      newValue = parts[0] + '.' + parts.slice(1).join('');
    }

    // Enforce maxLength (excluding the decimal point)
    if (this.maxLength !== null) {
      const numericPart = newValue.replace('.', '');
      if (numericPart.length > this.maxLength) {
        newValue = numericPart.slice(0, this.maxLength);
        // Re-insert decimal point if user typed one early
        if (initialValue.includes('.')) {
          newValue =
            newValue.slice(0, initialValue.indexOf('.')) +
            '.' +
            newValue.slice(initialValue.indexOf('.'));
        }
      }
    }

    // Validate numeric range
    if (newValue !== '' && newValue !== '.') {
      const numericValue = parseFloat(newValue);
      if (this.min !== null && numericValue < this.min) {
        newValue = this.min.toString();
      } else if (this.max !== null && numericValue > this.max) {
        newValue = this.max.toString();
      }
    }

    inputElement.value = newValue;

    if (initialValue !== inputElement.value) {
      event.stopPropagation();
    }
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
      'ArrowLeft', 'ArrowRight', 'Home', 'End'
    ];

    if (
      allowedKeys.includes(event.key) ||
      (event.ctrlKey && ['a', 'c', 'v', 'x'].includes(event.key.toLowerCase()))
    ) {
      return; // Allow these keys
    }

    // Allow digits
    if (event.key >= '0' && event.key <= '9') {
      const currentValue = this.el.nativeElement.value;
      if (
        this.maxLength !== null &&
        currentValue.replace('.', '').length >= this.maxLength
      ) {
        event.preventDefault();
      }
      return;
    }

    // Allow one decimal point
    if (event.key === '.') {
      const currentValue = this.el.nativeElement.value;
      if (currentValue.includes('.')) {
        event.preventDefault();
      }
      return;
    }

    // Prevent everything else
    event.preventDefault();
  }

  @HostListener('blur')
  onBlur() {
    const inputElement = this.el.nativeElement as HTMLInputElement;
    const value = inputElement.value;

    if (value !== '' && value !== '.') {
      let numericValue = parseFloat(value);

      if (this.min !== null && numericValue < this.min) {
        numericValue = this.min;
      } else if (this.max !== null && numericValue > this.max) {
        numericValue = this.max;
      }

      // Format to trimmed value (remove trailing dots)
      inputElement.value = numericValue.toString();
    }
  }
}
