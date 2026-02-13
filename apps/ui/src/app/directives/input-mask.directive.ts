import { Directive, ElementRef, HostListener, inject, Input, OnInit } from '@angular/core';
import { NgControl } from '@angular/forms';

export type MaskFormat = 'date' | 'expiration' | 'creditCard';

interface MaskConfig {
  maxDigits: number;
  separator: string;
  groupSizes: number[];
  validateGroups?: (groups: string[]) => string[];
}

const MASK_CONFIGS: Record<MaskFormat, MaskConfig> = {
  date: {
    maxDigits: 8,
    separator: '/',
    groupSizes: [2, 2, 4],
    validateGroups: (groups: string[]) => {
      const result = [...groups];
      // Validate day (01-31)
      if (result[0]?.length === 2) {
        const day = parseInt(result[0], 10);
        if (day > 31) result[0] = '31';
        else if (day === 0) result[0] = '01';
      }
      // Validate month (01-12)
      if (result[1]?.length === 2) {
        const month = parseInt(result[1], 10);
        if (month > 12) result[1] = '12';
        else if (month === 0) result[1] = '01';
      }
      return result;
    }
  },
  expiration: {
    maxDigits: 4,
    separator: '/',
    groupSizes: [2, 2],
    validateGroups: (groups: string[]) => {
      const result = [...groups];
      // Validate month (01-12)
      if (result[0]?.length === 2) {
        const month = parseInt(result[0], 10);
        if (month > 12) result[0] = '12';
        else if (month === 0) result[0] = '01';
      }
      return result;
    }
  },
  creditCard: {
    maxDigits: 16,
    separator: '-',
    groupSizes: [4, 4, 4, 4]
  }
};

@Directive({
  selector: '[ltrcInputMask]',
  standalone: true
})
export class InputMaskDirective implements OnInit {
  @Input('ltrcInputMask') format: MaskFormat = 'date';

  private readonly el = inject(ElementRef);
  private readonly ngControl = inject(NgControl, { optional: true });

  private config!: MaskConfig;

  ngOnInit(): void {
    this.config = MASK_CONFIGS[this.format];
  }

  @HostListener('input')
  onInput(): void {
    const input = this.el.nativeElement as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');

    // Limit digits
    if (value.length > this.config.maxDigits) {
      value = value.substring(0, this.config.maxDigits);
    }

    // Split into groups
    const groups: string[] = [];
    let pos = 0;
    for (const size of this.config.groupSizes) {
      if (pos >= value.length) break;
      groups.push(value.substring(pos, pos + size));
      pos += size;
    }

    // Validate groups if needed
    const validatedGroups = this.config.validateGroups
      ? this.config.validateGroups(groups)
      : groups;

    // Format with separator
    const formatted = validatedGroups.join(this.config.separator);
    input.value = formatted;

    // Update form control
    if (this.ngControl?.control) {
      // For credit card, store raw digits; for dates, store formatted
      const controlValue = this.format === 'creditCard' ? value : formatted;
      this.ngControl.control.setValue(controlValue, { emitEvent: false });
    }
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'Home', 'End',
                         'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];

    if (allowedKeys.includes(event.key) || event.ctrlKey || event.metaKey) {
      return;
    }

    // Block non-numeric keys
    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
      return;
    }

    // Block if at max length
    const input = this.el.nativeElement as HTMLInputElement;
    const currentDigits = input.value.replace(/\D/g, '');
    if (currentDigits.length >= this.config.maxDigits) {
      event.preventDefault();
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';
    let digits = pastedData.replace(/\D/g, '').substring(0, this.config.maxDigits);

    // Split into groups
    const groups: string[] = [];
    let pos = 0;
    for (const size of this.config.groupSizes) {
      if (pos >= digits.length) break;
      groups.push(digits.substring(pos, pos + size));
      pos += size;
    }

    // Validate and format
    const validatedGroups = this.config.validateGroups
      ? this.config.validateGroups(groups)
      : groups;

    const input = this.el.nativeElement as HTMLInputElement;
    input.value = validatedGroups.join(this.config.separator);

    if (this.ngControl?.control) {
      const controlValue = this.format === 'creditCard' ? digits : input.value;
      this.ngControl.control.setValue(controlValue, { emitEvent: false });
    }
  }
}

