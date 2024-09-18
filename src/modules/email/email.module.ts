import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { EmailQueue } from '../users/queues/email.queue';
import { EmailService } from './email.service';

@Global()
@Module({
  imports: [BullModule.registerQueueAsync({ name: 'email' })],
  exports: [EmailService],
  providers: [EmailService, EmailQueue],
  controllers: [],
})
export class EmailModule {}
