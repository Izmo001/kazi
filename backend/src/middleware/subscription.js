export const requireSubscription = (req, res, next) => {
  if (
    !req.user.subscriptionStatus ||
    new Date() > req.user.subscriptionExpiry
  ) {
    return res.status(403).json({ message: "Subscription required" });
  }
  next();
};