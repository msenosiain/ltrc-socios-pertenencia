import { Component, inject, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MembersService } from '../../services/members.service';
import { CreateMemberDto } from '@socios-pertenencia/shared';

@Component({
  selector: 'app-member-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './member-registration.component.html',
  styleUrl: './member-registration.component.scss'
})
export class MemberRegistrationComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly membersService = inject(MembersService);
  private readonly destroyRef = inject(DestroyRef);

  registrationForm!: FormGroup;
  selectedFile: File | null = null;
  isSubmitting = false;
  submitSuccess = false;
  submitError = '';

  ngOnInit(): void {
    this.initForm();
    this.setupFormListeners();
  }

  private initForm(): void {
    this.registrationForm = this.fb.group({
      // Member data
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      birthDate: ['', [Validators.required]],
      documentNumber: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(8)]],

      // Card holder data
      cardHolderFirstName: ['', [Validators.required]],
      cardHolderLastName: ['', [Validators.required]],
      cardHolderDocumentNumber: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(8)]],
      creditCardNumber: ['', [Validators.required, Validators.pattern(/^\d{13,19}$/)]],
      creditCardExpirationDate: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],

      // Same as member checkbox
      sameAsMember: [false]
    });
  }

  private setupFormListeners(): void {
    // Listen to sameAsMember changes
    this.registrationForm.get('sameAsMember')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((checked: boolean) => {
        if (checked) {
          this.copyMemberToCardHolder();
        }
      });

    // Also update when member fields change if checkbox is checked
    const memberFields = ['firstName', 'lastName', 'documentNumber'];
    memberFields.forEach(field => {
      this.registrationForm.get(field)?.valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          if (this.registrationForm.get('sameAsMember')?.value) {
            this.copyMemberToCardHolder();
          }
        });
    });
  }

  private copyMemberToCardHolder() {
    this.registrationForm.patchValue({
      cardHolderFirstName: this.registrationForm.get('firstName')?.value,
      cardHolderLastName: this.registrationForm.get('lastName')?.value,
      cardHolderDocumentNumber: this.registrationForm.get('documentNumber')?.value
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  onSubmit() {
    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.submitSuccess = false;
    this.submitError = '';

    const formValue = this.registrationForm.value;
    const memberData: CreateMemberDto = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      birthDate: formValue.birthDate,
      documentNumber: formValue.documentNumber,
      cardHolderFirstName: formValue.cardHolderFirstName,
      cardHolderLastName: formValue.cardHolderLastName,
      cardHolderDocumentNumber: formValue.cardHolderDocumentNumber,
      creditCardNumber: formValue.creditCardNumber,
      creditCardExpirationDate: formValue.creditCardExpirationDate
    };

    this.membersService.create(memberData, this.selectedFile || undefined).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.submitSuccess = true;
        this.registrationForm.reset();
        this.selectedFile = null;
      },
      error: (error) => {
        this.isSubmitting = false;
        this.submitError = error.error?.message || 'Error al registrar el socio. Por favor intente nuevamente.';
      }
    });
  }

  // Helper for template
  isFieldInvalid(fieldName: string): boolean {
    const field = this.registrationForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }
}
