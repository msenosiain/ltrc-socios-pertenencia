import { Directive, ElementRef, HostListener, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[ltrcCreditCardMask]',
  standalone: true
})
export class CreditCardMaskDirective {
  private readonly el = inject(ElementRef);
  private readonly ngControl = inject(NgControl, { optional: true });

  @HostListener('input')
  onInput(): void {
    const input = this.el.nativeElement as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); // Remove non-digits

    // Limit to 16 digits
    if (value.length > 16) {
      value = value.substring(0, 16);
    }

    // Format with spaces every 4 digits
    const formatted = this.formatCardNumber(value);

    // Update input value with formatted display
    input.value = formatted;

    // Update form control with raw value (digits only) for validation
    if (this.ngControl?.control) {
      this.ngControl.control.setValue(value, { emitEvent: false });
    }
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // Allow: backspace, delete, tab, escape, enter, home, end, arrows
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'Home', 'End',
                         'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];

    if (allowedKeys.includes(event.key)) {
      return;
    }

    // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    if (event.ctrlKey || event.metaKey) {
      return;
    }

    // Block non-numeric keys
    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';
    const digits = pastedData.replace(/\D/g, '').substring(0, 16);

    const input = this.el.nativeElement as HTMLInputElement;
    input.value = this.formatCardNumber(digits);

    if (this.ngControl?.control) {
      this.ngControl.control.setValue(digits, { emitEvent: false });
    }
  }

  @HostListener('focus')
  onFocus(): void {
    // Re-format on focus to ensure display is correct
    const input = this.el.nativeElement as HTMLInputElement;
    const value = this.ngControl?.control?.value || '';
    if (value) {
      input.value = this.formatCardNumber(value);
    }
  }

  private formatCardNumber(value: string): string {
    const groups = value.match(/.{1,4}/g) || [];
    return groups.join(' ');
  }
}

