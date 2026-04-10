if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const cron = require("node-cron");
const mongoose = require("mongoose");
const stripePaymentGatewayModel = require("./models/payment.model");
const subscriptionModel = require("./models/supscription.model");

let databaseConnectionPromise = null;
let scheduledJobsRegistered = false;

function connectDatabase() {
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve(mongoose.connection);
  }

  if (databaseConnectionPromise) {
    return databaseConnectionPromise;
  }

  if (!process.env.MONGO_DB_URL) {
    return Promise.reject(new Error("MONGO_DB_URL is not configured"));
  }

  databaseConnectionPromise = mongoose
    .connect(process.env.MONGO_DB_URL)
    .then((connection) => {
      console.log(`Database Connected (${process.pid})`);
      return connection;
    })
    .catch((error) => {
      databaseConnectionPromise = null;
      throw error;
    });

  return databaseConnectionPromise;
}

function registerScheduledJobs() {
  if (scheduledJobsRegistered) {
    return;
  }

  scheduledJobsRegistered = true;

  cron.schedule("0 0 0 * * *", async () => {
    try {
      const payments = await stripePaymentGatewayModel.find({});
      const now = new Date();
      const thresholdMs = (23 * 60 + 50) * 60 * 1000;

      for (const payment of payments) {
        const createdAt = new Date(payment.createdAt);
        const diffMs = now - createdAt;

        if (diffMs >= thresholdMs && payment.payment_status === "unpaid") {
          await stripePaymentGatewayModel.findByIdAndDelete(payment._id);
        }
      }
    } catch (error) {
      console.error("Payment cleanup cron error:", error);
    }
  });

  cron.schedule("0 0 1 * * *", async () => {
    try {
      await subscriptionModel.updateMany(
        { coachingUnlimited: { $ne: true }, coachingDays: { $gt: 0 } },
        [
          {
            $set: {
              coachingDays: {
                $cond: [
                  { $gt: ["$coachingDays", 0] },
                  { $subtract: ["$coachingDays", 1] },
                  0,
                ],
              },
            },
          },
        ]
      );
    } catch (error) {
      console.error("Coaching days cron error:", error);
    }
  });

  console.log(`Scheduled jobs registered (${process.pid})`);
}

module.exports = {
  connectDatabase,
  registerScheduledJobs,
};
