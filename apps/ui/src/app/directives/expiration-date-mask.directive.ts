import { Directive, ElementRef, HostListener, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[ltrcExpirationDateMask]',
  standalone: true
})
export class ExpirationDateMaskDirective {
  private readonly el = inject(ElementRef);
  private readonly ngControl = inject(NgControl, { optional: true });

  @HostListener('input')
  onInput(): void {
    const input = this.el.nativeElement as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); // Remove non-digits

    // Limit to 4 digits (MMYY)
    if (value.length > 4) {
      value = value.substring(0, 4);
    }

    // Format as MM/YY
    let formatted = '';
    if (value.length >= 2) {
      const month = value.substring(0, 2);
      // Validate month (01-12)
      const monthNum = parseInt(month, 10);
      if (monthNum > 12) {
        formatted = '12';
      } else if (monthNum === 0) {
        formatted = '01';
      } else {
        formatted = month;
      }

      if (value.length > 2) {
        formatted += '/' + value.substring(2);
      }
    } else {
      formatted = value;
    }

    input.value = formatted;

    // Update form control
    if (this.ngControl?.control) {
      this.ngControl.control.setValue(formatted, { emitEvent: false });
    }
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'Home', 'End',
                         'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];

    if (allowedKeys.includes(event.key)) {
      return;
    }

    if (event.ctrlKey || event.metaKey) {
      return;
    }

    // Block non-numeric keys
    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
    }

    // Block if already at max length (5 chars: MM/YY)
    const input = this.el.nativeElement as HTMLInputElement;
    if (input.value.length >= 5 && !input.selectionStart) {
      event.preventDefault();
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';
    const digits = pastedData.replace(/\D/g, '').substring(0, 4);

    if (digits.length >= 2) {
      const month = digits.substring(0, 2);
      const year = digits.substring(2);
      const input = this.el.nativeElement as HTMLInputElement;
      input.value = year ? `${month}/${year}` : month;

      if (this.ngControl?.control) {
        this.ngControl.control.setValue(input.value, { emitEvent: false });
      }
    }
  }
}

