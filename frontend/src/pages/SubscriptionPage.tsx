import React, { useState } from "react";
import { useSubscription } from "../context/SubscriptionContext";
import { useNavigate } from "react-router-dom";
import "./AppStyles.css";

const SubscriptionPage: React.FC = () => {
  const { subscription, loading, purchasePlan, canApply } = useSubscription();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState("BASIC");
  const [paymentMethod, setPaymentMethod] = useState("MPESA");
  const [processing, setProcessing] = useState(false);

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

  const handlePurchase = async () => {
    setProcessing(true);
    try {
      await purchasePlan(selectedPlan, paymentMethod);
      alert(`Subscription activated! You can now apply for jobs.`);
      navigate("/dashboard");
    } catch (error) {
      alert("Payment failed. Please try again.");
    } finally {
      setProcessing(false);
    }
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
              onClick={() => setSelectedPlan(plan.id)}
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
              >
                {plan.id === "FREE" ? "Current Plan" : "Select Plan"}
              </button>
            </div>
          ))}
        </div>

        {/* Payment Section */}
        {selectedPlan !== "FREE" && (
          <div className="payment-section">
            <h2>Payment Details</h2>
            
            <div className="payment-methods">
              <label className="payment-method">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="MPESA"
                  checked={paymentMethod === "MPESA"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span>M-PESA</span>
              </label>
              
              <label className="payment-method">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="CARD"
                  checked={paymentMethod === "CARD"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span>Card Payment</span>
              </label>
            </div>

            {paymentMethod === "MPESA" && (
              <div className="mpesa-instructions">
                <h3>M-PESA Payment Instructions:</h3>
                <ol>
                  <li>Go to M-PESA on your phone</li>
                  <li>Select "Lipa na M-PESA"</li>
                  <li>Enter Business Number: <strong>123456</strong></li>
                  <li>Enter Amount: <strong>KES {selectedPlan === "BASIC" ? "300" : "600"}</strong></li>
                  <li>Enter your phone number below</li>
                  <li>Enter M-PESA confirmation code</li>
                </ol>
                
                <div className="form-group">
                  <label>Phone Number</label>
                  <input 
                    type="tel" 
                    placeholder="0712345678"
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label>M-PESA Confirmation Code</label>
                  <input 
                    type="text" 
                    placeholder="e.g., OK12345678"
                    className="form-input"
                  />
                </div>
              </div>
            )}

            <button 
              className="subscribe-button"
              onClick={handlePurchase}
              disabled={processing}
            >
              {processing ? (
                <span className="button-content">
                  <span className="spinner"></span>
                  Processing...
                </span>
              ) : (
                `Pay KES ${selectedPlan === "BASIC" ? "300" : "600"}`
              )}
            </button>
          </div>
        )}

        {/* Current Status */}
        {subscription && (
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
    </div>
  );
};

export default SubscriptionPage;