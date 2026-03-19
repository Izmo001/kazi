import Subscription from "../models/Subscription.js";
import User from "../models/User.js";
import crypto from "crypto";

// Initialize free subscription for new users
export const initializeFreeTier = async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;
    
    const existingSub = await Subscription.findOne({ user: userId });
    if (existingSub) {
      return res.status(200).json({ subscription: existingSub });
    }

    const subscription = await Subscription.create({
      user: userId,
      plan: "FREE",
      status: "ACTIVE",
      applicationsLimit: 0,
      applicationsUsed: 0,
      applicationsRemaining: 0,
      features: {
        prioritySupport: false,
        cvReview: false,
        interviewCoaching: false,
        whatsappNotifications: false
      }
    });

    await User.findByIdAndUpdate(userId, { 
      subscription: subscription._id,
      subscriptionStatus: "FREE"
    });

    res.status(201).json({
      message: "Free tier initialized",
      subscription
    });
  } catch (error) {
    console.error("Error initializing free tier:", error);
    res.status(500).json({ message: error.message });
  }
};

// Purchase subscription
export const purchaseSubscription = async (req, res) => {
  try {
    const { plan, paymentMethod, autoRenew } = req.body;
    const userId = req.user.id;

    const plans = {
      BASIC: {
        price: 300,
        applicationsLimit: 30,
        features: {
          prioritySupport: false,
          cvReview: false,
          interviewCoaching: false,
          whatsappNotifications: true
        }
      },
      PREMIUM: {
        price: 600,
        applicationsLimit: 100,
        features: {
          prioritySupport: true,
          cvReview: true,
          interviewCoaching: false,
          whatsappNotifications: true
        }
      }
    };

    const selectedPlan = plans[plan];
    if (!selectedPlan) {
      return res.status(400).json({ message: "Invalid plan selected" });
    }

    const paymentReference = crypto.randomBytes(16).toString('hex');
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    const subscription = await Subscription.findOneAndUpdate(
      { user: userId },
      {
        user: userId,
        plan,
        status: "ACTIVE",
        applicationsLimit: selectedPlan.applicationsLimit,
        applicationsUsed: 0,
        applicationsRemaining: selectedPlan.applicationsLimit,
        price: selectedPlan.price,
        currency: "KES",
        startDate,
        endDate,
        paymentReference,
        paymentMethod,
        autoRenew: autoRenew || false,
        features: selectedPlan.features
      },
      { upsert: true, new: true }
    );

    await User.findByIdAndUpdate(userId, {
      subscription: subscription._id,
      subscriptionStatus: "ACTIVE"
    });

    res.status(201).json({
      message: "Subscription activated successfully",
      subscription: {
        plan: subscription.plan,
        applicationsRemaining: subscription.applicationsRemaining,
        endDate: subscription.endDate,
        features: subscription.features
      }
    });
  } catch (error) {
    console.error("Subscription error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Check application eligibility
export const checkApplicationEligibility = async (req, res) => {
  try {
    const userId = req.user.id;
    
    let subscription = await Subscription.findOne({ user: userId });
    
    if (!subscription) {
      // Instead of calling initializeFreeTier directly, return default values
      return res.json({
        canApply: false,
        plan: "FREE",
        status: "ACTIVE",
        applicationsRemaining: 0,
        applicationsUsed: 0,
        applicationsLimit: 0,
        daysRemaining: 0,
        endDate: null,
        features: {
          prioritySupport: false,
          cvReview: false,
          interviewCoaching: false,
          whatsappNotifications: false
        },
        message: "Free tier does not include job applications. Upgrade to BASIC plan (300 KES/month) to start applying."
      });
    }

    const canApply = subscription.canApply();
    const daysRemaining = subscription.endDate 
      ? Math.ceil((subscription.endDate - new Date()) / (1000 * 60 * 60 * 24))
      : 0;

    res.json({
      canApply,
      plan: subscription.plan,
      status: subscription.status,
      applicationsRemaining: subscription.applicationsRemaining,
      applicationsUsed: subscription.applicationsUsed,
      applicationsLimit: subscription.applicationsLimit,
      daysRemaining,
      endDate: subscription.endDate,
      features: subscription.features
    });
  } catch (error) {
    console.error("Error checking eligibility:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get subscription details
export const getSubscriptionDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    
    let subscription = await Subscription.findOne({ user: userId });
    
    if (!subscription) {
      return res.json({
        subscription: {
          plan: "FREE",
          status: "ACTIVE",
          applicationsRemaining: 0,
          applicationsUsed: 0,
          applicationsLimit: 0,
          startDate: new Date(),
          endDate: null,
          price: 0,
          currency: "KES",
          features: {
            prioritySupport: false,
            cvReview: false,
            interviewCoaching: false,
            whatsappNotifications: false
          }
        }
      });
    }

    res.json({
      subscription: {
        plan: subscription.plan,
        status: subscription.status,
        applicationsRemaining: subscription.applicationsRemaining,
        applicationsUsed: subscription.applicationsUsed,
        applicationsLimit: subscription.applicationsLimit,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        price: subscription.price,
        currency: subscription.currency,
        features: subscription.features
      }
    });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    res.status(500).json({ message: error.message });
  }
};

// Cancel subscription
export const cancelSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const subscription = await Subscription.findOneAndUpdate(
      { user: userId },
      { 
        status: "CANCELLED",
        autoRenew: false
      },
      { new: true }
    );

    await User.findByIdAndUpdate(userId, {
      subscriptionStatus: "EXPIRED"
    });

    res.json({ message: "Subscription cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    res.status(500).json({ message: error.message });
  }
};