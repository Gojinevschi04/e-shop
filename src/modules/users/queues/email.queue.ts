import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
@Processor('email')
export class EmailQueue {
  constructor(private readonly mailerService: MailerService) {}

  @Process()
  async sendEmail(job: Job<{ to: string; subject: string; text: string }>) {
    const { data } = job;
    const { to, subject, text } = data;

    await this.mailerService.sendMail({
      to,
      subject,
      text: text,
      context: { text },
    });
  }
}
