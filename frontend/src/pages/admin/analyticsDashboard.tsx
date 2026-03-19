import React, { useState, useEffect } from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import * as tf from "@tensorflow/tfjs";
import axios from "../../api/axios";
import { Link } from "react-router-dom";
import "../AppStyles.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface RevenueData {
  date: string;
  amount: number;
}

interface Summary {
  totalRevenue: number;
  totalTransactions: number;
  averageTransaction: number;
  projectedMonthly: number;
}

interface PlanBreakdown {
  BASIC: number;
  PREMIUM: number;
}

interface PredictionResult {
  predictions: number[];
  confidence: number;
  nextMonthRevenue: number;
  growth: number;
}

const AnalyticsDashboard: React.FC = () => {
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [summary, setSummary] = useState<Summary>({
    totalRevenue: 0,
    totalTransactions: 0,
    averageTransaction: 0,
    projectedMonthly: 0
  });
  const [planBreakdown, setPlanBreakdown] = useState<PlanBreakdown>({
    BASIC: 0,
    PREMIUM: 0
  });
  const [predictions, setPredictions] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch revenue data
      const revenueRes = await axios.get(`/analytics/revenue?period=${period}`);
      
      if (revenueRes.data.success) {
        setRevenueData(revenueRes.data.revenueData || []);
        setSummary(revenueRes.data.summary);
        setPlanBreakdown(revenueRes.data.planBreakdown);
        
        // Fetch prediction data
        await fetchPredictionData();
      }
    } catch (error: any) {
      console.error("Error fetching data:", error);
      setError(error.response?.data?.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const fetchPredictionData = async () => {
    try {
      setTraining(true);
      
      const predRes = await axios.get('/analytics/predict');
      
      if (predRes.data.success && predRes.data.trainingData.length >= 7) {
        await runPrediction(predRes.data.trainingData);
      }
    } catch (error) {
      console.error("Prediction error:", error);
    } finally {
      setTraining(false);
    }
  };

  const runPrediction = async (trainingData: any[]) => {
    try {
      const xs = trainingData.map((_, i) => i + 1);
      const ys = trainingData.map(d => d.revenue);

      // Normalize data
      const maxRevenue = Math.max(...ys);
      const normalizedYs = ys.map(y => y / maxRevenue);

      // Create model
      const model = tf.sequential();
      model.add(tf.layers.dense({ units: 10, activation: 'relu', inputShape: [1] }));
      model.add(tf.layers.dense({ units: 20, activation: 'relu' }));
      model.add(tf.layers.dense({ units: 10, activation: 'relu' }));
      model.add(tf.layers.dense({ units: 1 }));

      model.compile({
        optimizer: tf.train.adam(0.01),
        loss: 'meanSquaredError'
      });

      // Train
      const xsTensor = tf.tensor2d(xs, [xs.length, 1]);
      const ysTensor = tf.tensor2d(normalizedYs, [ys.length, 1]);

      await model.fit(xsTensor, ysTensor, { epochs: 200 });

      // Predict next 30 days
      const futureDays = Array.from({ length: 30 }, (_, i) => xs.length + i + 1);
      const futureTensor = tf.tensor2d(futureDays, [futureDays.length, 1]);
      const predictionsTensor = model.predict(futureTensor) as tf.Tensor;
      const predictionsArray = await predictionsTensor.array() as number[][];

      // Calculate confidence (R-squared)
      const yMean = ys.reduce((a, b) => a + b, 0) / ys.length;
      const ssTot = ys.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
      
      const predictedYs = xs.map(x => {
        const pred = model.predict(tf.tensor2d([x], [1, 1])) as tf.Tensor;
        return pred.dataSync()[0] * maxRevenue;
      });
      
      const ssRes = ys.reduce((sum, y, i) => sum + Math.pow(y - predictedYs[i], 2), 0);
      const rSquared = 1 - (ssRes / (ssTot || 1));

      // Calculate growth
      const totalCurrent = ys.reduce((a, b) => a + b, 0);
      const totalPredicted = predictionsArray.reduce((sum, p) => sum + (p[0] * maxRevenue), 0);
      const growth = ((totalPredicted / totalCurrent) - 1) * 100;

      // Cleanup
      xsTensor.dispose();
      ysTensor.dispose();
      futureTensor.dispose();
      predictionsTensor.dispose();

      setPredictions({
        predictions: predictionsArray.map(p => Math.round(p[0] * maxRevenue)),
        confidence: Math.max(0, Math.min(1, rSquared)),
        nextMonthRevenue: Math.round(totalPredicted),
        growth
      });

    } catch (error) {
      console.error("Prediction error:", error);
    }
  };

  const chartData = {
    labels: revenueData.map(d => {
      const date = new Date(d.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }),
    datasets: [
      {
        label: 'Revenue (KES)',
        data: revenueData.map(d => d.amount),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const planChartData = {
    labels: ['BASIC (KES 300)', 'PREMIUM (KES 600)'],
    datasets: [{
      data: [planBreakdown.BASIC, planBreakdown.PREMIUM],
      backgroundColor: ['rgba(54, 162, 235, 0.8)', 'rgba(255, 206, 86, 0.8)'],
      borderColor: ['rgb(54, 162, 235)', 'rgb(255, 206, 86)'],
      borderWidth: 1
    }]
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="analytics-dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Revenue Analytics</h1>
          <p className="dashboard-subtitle">Track revenue and AI predictions</p>
        </div>
        <div className="header-actions">
          <select 
            value={period} 
            onChange={(e) => setPeriod(e.target.value as any)} 
            className="period-select"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last 90 Days</option>
            <option value="year">Last Year</option>
          </select>
          <Link to="/admin" className="back-link">← Dashboard</Link>
        </div>
      </div>

      {error && (
        <div className="error-message">
          ⚠️ {error}
          <button onClick={fetchData} className="retry-button">Retry</button>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card stat-blue">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <p className="stat-label">Total Revenue</p>
            <p className="stat-value">KES {summary.totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        <div className="stat-card stat-green">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <p className="stat-label">Transactions</p>
            <p className="stat-value">{summary.totalTransactions}</p>
          </div>
        </div>

        <div className="stat-card stat-purple">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <p className="stat-label">Avg. Transaction</p>
            <p className="stat-value">KES {summary.averageTransaction.toLocaleString()}</p>
          </div>
        </div>

        <div className="stat-card stat-yellow">
          <div className="stat-icon">🔮</div>
          <div className="stat-content">
            <p className="stat-label">Projected Monthly</p>
            <p className="stat-value">KES {summary.projectedMonthly.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {training && (
        <div className="training-indicator">
          <div className="spinner-small"></div>
          <span>AI model training...</span>
        </div>
      )}

      {predictions && predictions.confidence > 0.6 && (
        <div className="confidence-card">
          <div className="confidence-header">
            <span>Model Confidence: {(predictions.confidence * 100).toFixed(1)}%</span>
            <span className={`confidence-badge ${
              predictions.confidence > 0.8 ? 'high' : 'medium'
            }`}>
              {predictions.confidence > 0.8 ? 'High' : 'Medium'}
            </span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${predictions.confidence * 100}%` }} />
          </div>
        </div>
      )}

      <div className="chart-container">
        <h3>Revenue Trend</h3>
        <div style={{ height: '400px' }}>
          <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </div>

      {predictions && predictions.nextMonthRevenue > 0 && (
        <div className="prediction-card">
          <h3>📈 30-Day Forecast</h3>
          <div className="prediction-grid">
            <div className="prediction-item">
              <span className="prediction-label">Expected</span>
              <span className="prediction-value">KES {predictions.nextMonthRevenue.toLocaleString()}</span>
            </div>
            <div className="prediction-item">
              <span className="prediction-label">Daily Avg</span>
              <span className="prediction-value">KES {Math.round(predictions.nextMonthRevenue / 30).toLocaleString()}</span>
            </div>
            <div className="prediction-item">
              <span className="prediction-label">Growth</span>
              <span className={`prediction-value ${predictions.growth > 0 ? 'positive' : 'negative'}`}>
                {predictions.growth > 0 ? '+' : ''}{predictions.growth.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Plan Distribution</h3>
          <div style={{ height: '250px' }}>
            <Bar data={planChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="insights-card">
          <h3>💰 Insights</h3>
          <div className="insights-list">
            <div className="insight-item">
              <span className="insight-icon">📊</span>
              <div>
                <strong>Most Popular:</strong> {planBreakdown.PREMIUM > planBreakdown.BASIC ? 'PREMIUM' : 'BASIC'}
              </div>
            </div>
            <div className="insight-item">
              <span className="insight-icon">💰</span>
              <div>
                <strong>Revenue/User:</strong> KES {Math.round(summary.totalRevenue / (planBreakdown.BASIC + planBreakdown.PREMIUM || 1)).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;