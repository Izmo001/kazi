import Payment from "../models/payment.js";
import mongoose from 'mongoose';

// Get revenue analytics
export const getRevenueAnalytics = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const now = new Date();
    let startDate;

    // Calculate date range
    switch(period) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'quarter':
        startDate = new Date(now.setMonth(now.getMonth() - 3));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }

    // Get user ID from authenticated request
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Get all successful payments for this user in the date range
    const payments = await Payment.find({
      user: userId,
      status: "SUCCESS",
      createdAt: { $gte: startDate }
    }).sort({ createdAt: 1 });

    // Calculate summary metrics
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalTransactions = payments.length;
    const averageTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    // Group by date for chart
    const revenueByDate = {};
    payments.forEach(p => {
      const date = p.createdAt.toISOString().split('T')[0];
      revenueByDate[date] = (revenueByDate[date] || 0) + p.amount;
    });

    const revenueData = Object.entries(revenueByDate).map(([date, amount]) => ({
      date,
      amount
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    // Plan breakdown
    const planBreakdown = {
      BASIC: payments.filter(p => p.plan === 'BASIC').length,
      PREMIUM: payments.filter(p => p.plan === 'PREMIUM').length
    };

    // Calculate projected monthly revenue
    const daysInPeriod = Math.ceil((new Date() - startDate) / (1000 * 60 * 60 * 24));
    const projectedMonthly = Math.round(totalRevenue * (30 / daysInPeriod));

    res.json({
      success: true,
      period,
      summary: {
        totalRevenue,
        totalTransactions,
        averageTransaction: Math.round(averageTransaction),
        projectedMonthly
      },
      revenueData,
      planBreakdown,
      payments: payments.map(p => ({
        id: p._id,
        amount: p.amount,
        plan: p.plan,
        date: p.createdAt,
        method: p.paymentMethod
      }))
    });

  } catch (error) {
    console.error("Revenue analytics error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get prediction data for TensorFlow
export const getPredictionData = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    
    // Get last 90 days of payments
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const payments = await Payment.find({
      user: userId,
      status: "SUCCESS",
      createdAt: { $gte: ninetyDaysAgo }
    }).sort({ createdAt: 1 });

    // Group by day for ML training
    const dailyData = {};
    payments.forEach(p => {
      const date = p.createdAt.toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = { revenue: 0, count: 0 };
      }
      dailyData[date].revenue += p.amount;
      dailyData[date].count += 1;
    });

    // Convert to array format for training
    const trainingData = Object.entries(dailyData).map(([date, data], index) => ({
      day: index + 1,
      revenue: data.revenue,
      transactions: data.count,
      date
    }));

    res.json({
      success: true,
      trainingData,
      metadata: {
        totalDays: trainingData.length,
        totalRevenue: trainingData.reduce((sum, d) => sum + d.revenue, 0),
        averageDaily: trainingData.length > 0 
          ? Math.round(trainingData.reduce((sum, d) => sum + d.revenue, 0) / trainingData.length) 
          : 0
      }
    });

  } catch (error) {
    console.error("Prediction data error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};