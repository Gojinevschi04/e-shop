import * as process from 'process';
import * as dotenv from 'dotenv';

dotenv.config();

const stripeConfig = () => ({
  NODE_ENV: process.env.APP_ENV,
  GLOBAL: {
    PORT: process.env.APP_PORT,
  },
  STRIPE_CONFIG: {
    apiKey: process.env.STRIPE_API_KEY,
    webhookConfig: {
      requestBodyProperty: 'rawBody',
      stripeSecrets: {
        account: process.env.STRIPE_WEBHOOK_SECRET,
      },
    },
  },
});
export default stripeConfig;
