import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type MemberDocument = HydratedDocument<Member>;

@Schema({ timestamps: true })
export class Member {
  // Member (socio) information
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  birthDate: Date;

  @Prop({ required: true, unique: true })
  documentNumber: string;

  @Prop({ type: Types.ObjectId })
  documentImageFileId: Types.ObjectId; // GridFS file ID

  @Prop()
  documentImageFileName: string; // Original filename

  // Card holder (titular de tarjeta) information - flat fields
  @Prop({ required: true })
  cardHolderFirstName: string;

  @Prop({ required: true })
  cardHolderLastName: string;

  @Prop({ required: true })
  cardHolderDocumentNumber: string;

  @Prop({ required: true })
  creditCardNumber: string;

  @Prop({ required: true })
  creditCardExpirationDate: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const MemberSchema = SchemaFactory.createForClass(Member);


