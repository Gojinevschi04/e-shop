import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class EmailService {
  constructor(
    @InjectQueue('email')
    private readonly emailQueue: Queue,
  ) {}

  async sendEmail(data: { to: string; subject: string; text: string }) {
    await this.emailQueue.add(data);
    return { message: 'Email added to the queue' };
  }

  async sendResetPasswordEmail(
    userEmail: string,
    token: string,
  ): Promise<void> {
    await this.sendEmail({
      to: userEmail,
      subject: 'Password reset request',
      text: `We received a request to reset your password.
      Please use the token below to reset your password:
       ${token}`,
    });
  }

  async sendNewOrderEmail(
    userEmail: string,
    orderId: number,
    orderStatus: string,
  ): Promise<void> {
    await this.sendEmail({
      to: userEmail,
      subject: 'New order info',
      text: `Thank you for shopping with us! We’re excited to let you know that
       we’ve received your order #${orderId} is ${orderStatus}.`,
    });
  }

  async sendChangedOrderStatusEmail(
    userEmail: string,
    orderId: number,
    orderStatus: string,
  ): Promise<void> {
    await this.sendEmail({
      to: userEmail,
      subject: 'Update on your order',
      text: `We wanted to let you know that the status of your order
       #${orderId} has changed to ${orderStatus}.`,
    });
  }

  async sendChangedOrderPaymentStatusEmail(
    userEmail: string,
    orderId: number,
    orderPaymentStatus: string,
  ): Promise<void> {
    await this.sendEmail({
      to: userEmail,
      subject: 'Payment status update for your order',
      text: `We wanted to let you know that the payment status for your order
       #${orderId} has changed to ${orderPaymentStatus}.`,
    });
  }
}
