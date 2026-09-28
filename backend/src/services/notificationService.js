const sendNotification = async (userId, message) => {
  console.log(`[Notification to User ${userId}]: ${message}`);
  return true;
};

module.exports = {
  sendNotification
};
