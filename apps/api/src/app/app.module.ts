import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {AppController} from './app.controller';
import {MembersModule} from './members/members.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/socios-pertenencia',
    ),
    MembersModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
