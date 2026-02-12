import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Types } from 'mongoose';

export type MemberDocument = HydratedDocument<Member>;

@Schema({ timestamps: true })
export class Member {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  birthDate: Date;

  @Prop({ required: true, unique: true })
  documentNumber: string;

  @Prop({ required: true })
  creditCardNumber: string;

  @Prop({ required: true })
  creditCardExpirationDate: string;

  @Prop({ type: Types.ObjectId })
  documentImageFileId: Types.ObjectId; // GridFS file ID

  @Prop()
  documentImageFileName: string; // Original filename

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const MemberSchema = SchemaFactory.createForClass(Member);


