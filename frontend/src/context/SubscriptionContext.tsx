import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "../api/axios";
import { AuthContext } from "./AuthContext";

interface Subscription {
  plan: string;
  status: string;
  applicationsRemaining: number;
  applicationsUsed: number;
  applicationsLimit: number;
  startDate: string;
  endDate: string;
  price: number;
  currency: string;
  features: {
    prioritySupport: boolean;
    cvReview: boolean;
    interviewCoaching: boolean;
    whatsappNotifications: boolean;
  };
}

interface SubscriptionContextType {
  subscription: Subscription | null;
  loading: boolean;
  canApply: boolean;
  refreshSubscription: () => Promise<void>;
  purchasePlan: (plan: string, paymentMethod: string) => Promise<any>;
  cancelSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useContext(AuthContext)!;
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [canApply, setCanApply] = useState(false);

  const fetchSubscription = async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const res = await axios.get("/subscription/details");
      setSubscription(res.data.subscription);
      
      // Check if can apply
      const statusRes = await axios.get("/subscription/status");
      setCanApply(statusRes.data.canApply);
    } catch (error) {
      console.error("Error fetching subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [token]);

  const purchasePlan = async (plan: string, paymentMethod: string) => {
    try {
      const res = await axios.post("/subscription/purchase", { plan, paymentMethod });
      await fetchSubscription();
      return res.data;
    } catch (error) {
      console.error("Error purchasing plan:", error);
      throw error;
    }
  };

  const cancelSubscription = async () => {
    try {
      await axios.post("/subscription/cancel");
      await fetchSubscription();
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      throw error;
    }
  };

  return (
    <SubscriptionContext.Provider value={{
      subscription,
      loading,
      canApply,
      refreshSubscription: fetchSubscription,
      purchasePlan,
      cancelSubscription
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscription must be used within SubscriptionProvider");
  }
  return context;
};