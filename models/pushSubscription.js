import { Schema, model } from 'mongoose';

const pushSubscriptionSchema = new Schema({
  kitchenId: { type: String, required: true, unique: true }, // Ensure unique kitchenId
  subscription: {
    endpoint: { type: String, required: true },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
  },
});

const PushSubscription = model('PushSubscription', pushSubscriptionSchema);
export default PushSubscription;