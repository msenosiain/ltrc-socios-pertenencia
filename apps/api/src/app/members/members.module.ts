import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MembersService } from './members.service';
import { MembersController } from './members.controller';
import { GoogleAppsScriptService } from './google-apps-script.service';
import { Member, MemberSchema } from './entities/member.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Member.name, schema: MemberSchema }]),
  ],
  controllers: [MembersController],
  providers: [MembersService, GoogleAppsScriptService],
})
export class MembersModule {}

