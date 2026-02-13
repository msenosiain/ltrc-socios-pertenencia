import {
  IsString,
  IsDateString,
  IsNotEmpty,
  Length,
  Matches,
  IsOptional,
} from 'class-validator';

export interface FileUpload {
  originalname: string;
  buffer: Buffer;
}

export class CreateMemberDto {
  // Member (socio) information
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsDateString()
  @IsNotEmpty()
  birthDate: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 8, { message: 'Document number must be exactly 8 characters' })
  documentNumber: string;

  @IsOptional()
  documentImage?: FileUpload;

  // Card holder (titular de tarjeta) information - flat fields
  @IsString()
  @IsNotEmpty()
  cardHolderFirstName: string;

  @IsString()
  @IsNotEmpty()
  cardHolderLastName: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 8, { message: 'Card holder document number must be exactly 8 characters' })
  cardHolderDocumentNumber: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{13,19}$/, {
    message: 'Credit card number must be between 13 and 19 digits',
  })
  creditCardNumber: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(0[1-9]|1[0-2])\/\d{2}$/, {
    message: 'Expiration date must be in MM/YY format',
  })
  creditCardExpirationDate: string;
}
