import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
// @ts-ignore
import "./AppStyles.css";

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
}

const SubscriptionPage: React.FC = () => {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"BASIC" | "PREMIUM">("BASIC");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  const plans = [
    {
      id: "FREE",
      name: "Free",
      price: 0,
      applications: 0,
      features: [
        "CV Upload",
        "Profile Creation",
        "Browse Jobs"
      ],
      disabled: false
    },
    {
      id: "BASIC",
      name: "Basic",
      price: 300,
      applications: 30,
      features: [
        "30 Applications/month",
        "CV Upload",
        "Admin Apply Service",
        "WhatsApp Notifications",
        "Email Support"
      ],
      popular: true,
      disabled: false
    },
    {
      id: "PREMIUM",
      name: "Premium",
      price: 600,
      applications: 100,
      features: [
        "100 Applications/month",
        "Priority Support",
        "CV Review Service",
        "Interview Coaching",
        "WhatsApp Notifications",
        "Featured Profile"
      ],
      disabled: false
    }
  ];

  // Fetch current subscription on load
  useEffect(() => {
    fetchSubscription();
  }, []);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/subscription/details");
      setSubscription(response.data.subscription);
    } catch (error) {
      console.error("Error fetching subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  const initiatePayment = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      alert("Please enter a valid M-PESA phone number");
      return;
    }

    setProcessing(true);
    setPaymentStatus("initiating");

    try {
      const response = await axios.post("/payments/initiate", {
        plan: selectedPlan,
        phoneNumber: phoneNumber,
      });

      if (response.data.success) {
        setPaymentStatus("pending");
        alert(response.data.message);
        
        // Start polling for payment status
        const interval = setInterval(() => {
          checkPaymentStatus(response.data.paymentId);
        }, 3000);
        
        setPollingInterval(interval);
        
        // Stop polling after 2 minutes
        setTimeout(() => {
          if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
            if (paymentStatus === "pending") {
              setPaymentStatus("timeout");
              alert("Payment is taking longer than expected. Please check your M-PESA messages.");
            }
          }
        }, 120000);
      } else {
        setPaymentStatus("failed");
        alert(response.data.message || "Payment initiation failed");
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      setPaymentStatus("failed");
      alert(error.response?.data?.message || "Failed to initiate payment");
    } finally {
      setProcessing(false);
    }
  };

  const checkPaymentStatus = async (paymentId: string) => {
    try {
      const response = await axios.get(`/payments/status/${paymentId}`);
      
      if (response.data.status === "SUCCESS") {
        // Payment successful
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
        setPaymentStatus("success");
        alert("Payment successful! Your subscription has been activated.");
        
        // Refresh subscription details
        await fetchSubscription();
        
        // Close modal and reset
        setShowPaymentModal(false);
        setPhoneNumber("");
        setPaymentStatus(null);
        
        // Redirect to dashboard
        navigate("/dashboard");
      } else if (response.data.status === "FAILED") {
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
        setPaymentStatus("failed");
        alert("Payment failed. Please try again.");
      }
    } catch (error) {
      console.error("Status check error:", error);
    }
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId as "BASIC" | "PREMIUM");
    if (planId !== "FREE") {
      setShowPaymentModal(true);
      setPaymentStatus(null);
      setPhoneNumber("");
    } else {
      // Handle free plan selection
      alert("Free plan selected. You can browse jobs but cannot apply.");
    }
  };

  const getSelectedPlanPrice = () => {
    const plan = plans.find(p => p.id === selectedPlan);
    return plan?.price || 0;
  };

  if (loading) {
    return (
      <div className="dashboard-body">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading subscription details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-body">
      <div className="dashboard-container">
        {/* Current Subscription Status */}
        {subscription && subscription.plan !== "FREE" && (
          <div className="subscription-status-card">
            <h2>Current Subscription</h2>
            <div className="status-details">
              <p><strong>Plan:</strong> {subscription.plan}</p>
              <p><strong>Applications:</strong> {subscription.applicationsUsed}/{subscription.applicationsLimit}</p>
              <p><strong>Remaining:</strong> {subscription.applicationsRemaining}</p>
              <p><strong>Valid Until:</strong> {new Date(subscription.endDate).toLocaleDateString()}</p>
            </div>
          </div>
        )}

        {/* Plans Header */}
        <div className="plans-header">
          <h1 className="page-title">Choose Your Plan</h1>
          <p className="page-subtitle">300 KES/month for 30 job applications</p>
        </div>

        {/* Plans Grid */}
        <div className="plans-grid">
          {plans.map(plan => (
            <div 
              key={plan.id}
              className={`plan-card ${selectedPlan === plan.id ? 'selected' : ''} ${plan.popular ? 'popular' : ''}`}
              onClick={() => setSelectedPlan(plan.id as "BASIC" | "PREMIUM")}
            >
              {plan.popular && <div className="popular-badge">Most Popular</div>}
              <h3 className="plan-name">{plan.name}</h3>
              <div className="plan-price">
                <span className="price">{plan.price}</span>
                <span className="currency">KES</span>
                <span className="period">/month</span>
              </div>
              <p className="plan-applications">{plan.applications} applications</p>
              <ul className="plan-features">
                {plan.features.map((feature, index) => (
                  <li key={index} className="feature-item">
                    <span className="feature-check">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button 
                className={`plan-select-btn ${selectedPlan === plan.id ? 'selected' : ''}`}
                disabled={plan.disabled}
                onClick={() => handlePlanSelect(plan.id)}
              >
                {plan.id === "FREE" ? "Current Plan" : "Select Plan"}
              </button>
            </div>
          ))}
        </div>

        {/* Current Usage Stats */}
        {subscription && subscription.plan !== "FREE" && (
          <div className="usage-stats">
            <h3>Your Usage</h3>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ 
                  width: `${(subscription.applicationsUsed / subscription.applicationsLimit) * 100}%` 
                }}
              ></div>
            </div>
            <p>
              {subscription.applicationsUsed} of {subscription.applicationsLimit} applications used
            </p>
          </div>
        )}
      </div>

      {/* M-PESA Payment Modal */}
      {showPaymentModal && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="payment-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>M-PESA Payment</h2>
              <button className="modal-close" onClick={() => setShowPaymentModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="payment-details">
                <p><strong>Plan:</strong> {selectedPlan}</p>
                <p><strong>Amount:</strong> KES {getSelectedPlanPrice()}</p>
                <p><strong>Applications:</strong> {selectedPlan === "BASIC" ? 30 : 100} per month</p>
              </div>

              {paymentStatus === "initiating" && (
                <div className="payment-status">
                  <div className="spinner-small"></div>
                  <p>Initiating payment...</p>
                </div>
              )}

              {paymentStatus === "pending" && (
                <div className="payment-status">
                  <div className="spinner-small"></div>
                  <p>Waiting for payment confirmation...</p>
                  <p className="text-sm">Please check your phone and enter your PIN</p>
                </div>
              )}

              {paymentStatus === "success" && (
                <div className="payment-status success">
                  <span className="check-mark">✓</span>
                  <p>Payment successful! Redirecting...</p>
                </div>
              )}

              {paymentStatus === "failed" && (
                <div className="payment-status failed">
                  <span className="error-mark">✗</span>
                  <p>Payment failed. Please try again.</p>
                  <button className="retry-button" onClick={() => setPaymentStatus(null)}>
                    Try Again
                  </button>
                </div>
              )}

              {paymentStatus === "timeout" && (
                <div className="payment-status failed">
                  <span className="error-mark">⏱</span>
                  <p>Payment timeout. Please check your M-PESA messages.</p>
                  <button className="retry-button" onClick={() => setPaymentStatus(null)}>
                    Try Again
                  </button>
                </div>
              )}

              {!paymentStatus && (
                <>
                  <div className="form-group">
                    <label>M-PESA Phone Number</label>
                    <input
                      type="tel"
                      placeholder="0712345678"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="form-input"
                    />
                    <p className="text-sm text-gray-500 mt-1">Enter the number registered with M-PESA</p>
                  </div>

                  <div className="payment-instructions">
                    <h4>How to pay:</h4>
                    <ol>
                      <li>Enter your M-PESA phone number above</li>
                      <li>Click "Pay Now" to receive an STK Push</li>
                      <li>Enter your M-PESA PIN on your phone</li>
                      <li>Wait for confirmation</li>
                    </ol>
                  </div>

                  <div className="modal-actions">
                    <button 
                      className="pay-button"
                      onClick={initiatePayment}
                      disabled={processing}
                    >
                      {processing ? "Processing..." : `Pay KES ${getSelectedPlanPrice()}`}
                    </button>
                    <button 
                      className="cancel-button"
                      onClick={() => setShowPaymentModal(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPage;