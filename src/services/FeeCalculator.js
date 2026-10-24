class FeeCalculator {
  calculate({ entryTime, exitTime, hourlyRate, billingMode = "CEIL_HOUR" }) {
    const durationMs = exitTime.getTime() - entryTime.getTime();
    if (durationMs < 0) {
      const error = new Error("Exit time cannot be earlier than entry time.");
      error.status = 400;
      throw error;
    }
    // Any started hour is charged as one hour. A zero-duration stay costs zero.
    const hours = durationMs === 0 ? 0 : Math.ceil(durationMs / (60 * 60 * 1000));
    if (billingMode !== "CEIL_HOUR") throw new Error("Unsupported billing mode.");
    return { durationMinutes: Math.ceil(durationMs / 60000), billableHours: hours, feeAmount: hours * hourlyRate };
  }
}

module.exports = new FeeCalculator();
