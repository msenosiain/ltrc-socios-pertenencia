import { Component, inject, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MembersService } from '../../services/members.service';
import { CreateMemberDto } from '@socios-pertenencia/shared';
import { InputMaskDirective } from '../../directives/input-mask.directive';

@Component({
  selector: 'ltrc-member-registration',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
    InputMaskDirective,
  ],
  templateUrl: './member-registration.component.html',
  styleUrl: './member-registration.component.scss'
})
export class MemberRegistrationComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly membersService = inject(MembersService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly snackBar = inject(MatSnackBar);

  registrationForm!: FormGroup;
  selectedFile: File | null = null;
  selectedFileName = '';
  isSubmitting = false;
  fileRequired = false; // Track if file validation should show error

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
      creditCardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
      creditCardExpirationDate: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],

      // Same as member checkbox
      sameAsMember: [false]
    });
  }

  private setupFormListeners(): void {
    this.registrationForm.get('sameAsMember')?.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((checked: boolean) => {
        if (checked) {
          this.copyMemberToCardHolder();
        }
      });

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

  private copyMemberToCardHolder(): void {
    this.registrationForm.patchValue({
      cardHolderFirstName: this.registrationForm.get('firstName')?.value,
      cardHolderLastName: this.registrationForm.get('lastName')?.value,
      cardHolderDocumentNumber: this.registrationForm.get('documentNumber')?.value
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.selectedFileName = this.selectedFile.name;
      this.fileRequired = false; // Clear error when file is selected
    }
  }

  onSubmit(): void {
    // Validate file is required
    if (!this.selectedFile) {
      this.fileRequired = true;
    }

    if (this.registrationForm.invalid || !this.selectedFile) {
      this.registrationForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const formValue = this.registrationForm.value;

    // Handle birthDate - can be moment object, Date, or ISO string
    let birthDate: string;
    if (formValue.birthDate && typeof formValue.birthDate === 'object' && formValue.birthDate.format) {
      // Moment object from datepicker
      birthDate = formValue.birthDate.format('YYYY-MM-DD');
    } else if (formValue.birthDate instanceof Date) {
      birthDate = formValue.birthDate.toISOString().split('T')[0];
    } else {
      // Already ISO string
      birthDate = formValue.birthDate;
    }

    const memberData: CreateMemberDto = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      birthDate,
      documentNumber: formValue.documentNumber,
      cardHolderFirstName: formValue.cardHolderFirstName,
      cardHolderLastName: formValue.cardHolderLastName,
      cardHolderDocumentNumber: formValue.cardHolderDocumentNumber,
      creditCardNumber: formValue.creditCardNumber,
      creditCardExpirationDate: formValue.creditCardExpirationDate
    };

    this.membersService.create(memberData, this.selectedFile).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.snackBar.open('¡Registro exitoso! Su solicitud ha sido enviada.', 'Cerrar', {
          duration: 5000,
          panelClass: ['success-snackbar']
        });
        this.registrationForm.reset();
        this.selectedFile = null;
        this.selectedFileName = '';
        this.fileRequired = false;
      },
      error: (error) => {
        this.isSubmitting = false;
        const message = error.error?.message || 'Error al registrar. Por favor intente nuevamente.';
        this.snackBar.open(message, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        console.error('Registration error:', error);
      }
    });
  }

  getErrorMessage(fieldName: string): string {
    const field = this.registrationForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (field?.hasError('minlength') || field?.hasError('maxlength')) {
      return 'Debe tener exactamente 8 dígitos';
    }
    if (field?.hasError('pattern')) {
      if (fieldName === 'creditCardNumber') {
        return 'El número de tarjeta debe tener 16 dígitos';
      }
      if (fieldName === 'creditCardExpirationDate') {
        return 'Formato: MM/AA (ej: 12/25)';
      }
    }
    return '';
  }
}
