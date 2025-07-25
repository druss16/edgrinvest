import { useState, useEffect, useRef } from 'react';
import api from './api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LogOut } from 'lucide-react';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './dashboard.css';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip);

const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const [summaries, setSummaries] = useState([]);
  const [accountValueData, setAccountValueData] = useState({ labels: [], data: [] });
  const [roiData, setRoiData] = useState({ labels: [], data: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const roiCounterRef = useRef(null);
  const [currentRoi, setCurrentRoi] = useState(0);
  const [targetRoi, setTargetRoi] = useState(0); // ✅ Add this
  const navigate = useNavigate();
  const [cumulativeProfitData, setCumulativeProfitData] = useState({ labels: [], data: [] })
  const profitCounterRef = useRef(null);
  const [animatedProfit, setAnimatedProfit] = useState(0);



  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Not authenticated. Please log in.');
          navigate('/login', { replace: true });
          return;
        }

        const config = {
          headers: {
            Authorization: `Token ${token}`,
          },
        };

        const [
          profileRes,
          summariesRes,
          roiGrowthRes,
          firstInvestmentRes,
          roiYieldRes,
          cumulativeProfitRes,
        ] = await Promise.all([
          api.get('/api/users/profile/', config),
          api.get('/api/users/summaries-deux/', config),
          api.get('/api/users/roi-growth/', config),
          api.get('/api/users/investment-first/', config),
          api.get('/api/users/roi-yield/', config),
          api.get('/api/users/cumulative-profit/', config),
        ]);

        const roiValues = roiYieldRes.data.data || [];
        const finalRoi = roiValues.length > 0 ? roiValues[roiValues.length - 1] : 0;

        setTargetRoi(finalRoi); 


        const userData = {
          username: profileRes.data.username,
          email: profileRes.data.email,
          first_name: profileRes.data.first_name,
          last_name: profileRes.data.last_name,
          total_portfolio_value: profileRes.data.total_portfolio_value,
          initial_investment_amount: profileRes.data.initial_investment_amount,
          unrealized_gain: profileRes.data.unrealized_gain,
          dividend_paid: profileRes.data.dividend_paid,
          profit: profileRes.data.profit,
          roi_percentage: profileRes.data.roi_percentage,
          is_staff: profileRes.data.is_staff,
        };




        setProfile(userData);
        localStorage.setItem('user', JSON.stringify(userData));

        const sortedSummaries = [...summariesRes.data].sort((a, b) => {
          const parseQuarter = (q) => new Date(`${q} 1`);
          return parseQuarter(a.quarter) - parseQuarter(b.quarter);
        });

        setRoiData({
          labels: roiYieldRes.data.labels,
          data: roiValues,
        });

        setSummaries(sortedSummaries);

        const initialInvestment = parseFloat(profileRes.data.initial_investment_amount || 0);
        const accountLabels = ['Initial Investment', ...sortedSummaries.map(s => s.quarter)];

        let runningTotal = initialInvestment;
        const accountValues = [initialInvestment, ...sortedSummaries.map(summary => {
          const unrealized = parseFloat(summary.unrealized_gain || 0);
          const dividend = parseFloat(summary.dividend_amount || 0);
          runningTotal += unrealized + dividend;
          return runningTotal;
        })];

        setAccountValueData({
          labels: accountLabels,
          data: accountValues,
        });


        setAccountValueData({
          labels: accountLabels,
          data: accountValues,
        });

        setRoiData({
          labels: roiYieldRes.data.labels,
          data: roiYieldRes.data.data,
        });

        setCumulativeProfitData({
          labels: cumulativeProfitRes.data.labels,
          data: cumulativeProfitRes.data.data,
        });

        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError(error.message || 'Failed to load dashboard data.');
        setLoading(false);
      }
    };



    fetchData();
  }, [navigate]);


  useEffect(() => {
    if (roiCounterRef.current) {
      let current = 0;
      const increment = targetRoi / 100;

      const animate = () => {
        current += increment;
        if ((increment > 0 && current >= targetRoi) || (increment < 0 && current <= targetRoi)) {
          current = targetRoi;
        }
        setCurrentRoi(current.toFixed(2));
        if (current !== targetRoi) {
          requestAnimationFrame(animate);
        }
      };

      animate();
    }
  }, [targetRoi]);


  useEffect(() => {
    if (profitCounterRef.current && profile?.profit != null) {
      const targetProfit = parseFloat(profile.profit);
      let current = 0;
      const increment = targetProfit / 100;

      const updateProfit = () => {
        current += increment;
        if ((increment > 0 && current >= targetProfit) || (increment < 0 && current <= targetProfit)) {
          current = targetProfit;
        }
        setAnimatedProfit(current.toFixed(2));
        if (current !== targetProfit) {
          requestAnimationFrame(updateProfit);
        }
      };

      updateProfit();
    }
  }, [profile]);


  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No session found. Please log in again.');
        localStorage.removeItem('token');
        navigate('/login', { replace: true });
        return;
      }
      await api.post('/api/users/logout/', {}, {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
        },
      });
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error.response?.data || error.message);
      setError('Failed to log out. Session cleared locally.');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login', { replace: true });
    }
  };


  const accountValueChartData = {
    labels: accountValueData.labels,
    datasets: [
      {
        label: 'Total Account Value',
        data: accountValueData.data,
        fill: true,
        tension: 0.5,
        borderColor: 'rgb(0, 255, 102)',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, 'rgba(0, 255, 102, 0.4)');
          gradient.addColorStop(1, 'rgba(0, 255, 102, 0.1)');
          return gradient;
        },
        pointRadius: 5,
        pointHoverRadius: 8,
        pointBackgroundColor: '#00ff66',
        pointHoverBackgroundColor: '#00ccff',
        pointHoverBorderColor: '#fff',
        borderWidth: 3,
      },
    ],
  };

  const accountValueChartOptions = {
    responsive: true,
    animation: {
      duration: 2000,
      easing: 'easeOutElastic',
    },
    layout: { padding: { top: 50, bottom: 30 } },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(30, 30, 47, 0.9)',
        titleColor: '#fff',
        bodyColor: '#00ff66',
        borderColor: '#00ccff',
        borderWidth: 2,
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: (ctx) => `Portfolio: $${ctx.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)', lineWidth: 1 },
        ticks: { color: '#94a3b8', font: { size: 14 } },
      },
      y: {
        beginAtZero: false,
        grid: { color: 'rgba(255, 255, 255, 0.05)', lineWidth: 1 },
        ticks: {
          color: '#94a3b8',
          font: { size: 14 },
          callback: (val) => `$${val.toLocaleString()}`,
        },
        suggestedMin: Math.min(...(accountValueData.data || [0])) * 0.8 || 0,
        suggestedMax: Math.max(...(accountValueData.data || [5000])) * 1.2 || 6000,
      },
    },
  };

  const cumulativeProfitChartData = {
    labels: cumulativeProfitData.labels,
    datasets: [
      {
        label: 'Cumulative Profit',
        data: cumulativeProfitData.data,
        fill: true,
        tension: 0.5,
        borderColor: 'rgb(255, 159, 64)', // Orange line
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, 'rgba(255, 159, 64, 0.4)'); // Light orange
          gradient.addColorStop(1, 'rgba(255, 159, 64, 0.1)');
          return gradient;
        },
        pointRadius: 5,
        pointHoverRadius: 8,
        pointBackgroundColor: '#ff9f40',
        pointHoverBackgroundColor: '#ffa94d',
        pointHoverBorderColor: '#fff',
        borderWidth: 3,
      },
    ],
  };


  const cumulativeProfitChartOptions = {
    responsive: true,
    animation: {
      duration: 2000,
      easing: 'easeOutElastic',
    },
    layout: { padding: { top: 50, bottom: 30 } },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(30, 30, 47, 0.9)',
        titleColor: '#fff',
        bodyColor: '#ff9f40', // Orange tooltip text
        borderColor: '#ffa94d',
        borderWidth: 2,
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: (ctx) => `$${ctx.parsed.y.toLocaleString()}`,
        },
      },

    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)', lineWidth: 1 },
        ticks: { color: '#94a3b8', font: { size: 14 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255, 255, 255, 0.05)', lineWidth: 1 },
        ticks: {
          color: '#94a3b8',
          font: { size: 14 },
          callback: (val) => `$${val.toLocaleString()}`,
        },
      },
    },
  };


  const roiChartData = {
    labels: roiData.labels,
    datasets: [
      {
        label: 'ROI Growth %',
        data: roiData.data,
        fill: true,
        tension: 0.5,
        borderColor: 'rgb(0, 204, 255)',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, 'rgba(0, 204, 255, 0.4)');
          gradient.addColorStop(1, 'rgba(0, 204, 255, 0.1)');
          return gradient;
        },
        pointRadius: 5,
        pointHoverRadius: 8,
        pointBackgroundColor: '#00ccff',
        pointHoverBackgroundColor: '#00ff66',
        pointHoverBorderColor: '#fff',
        borderWidth: 3,
      },
    ],
  };

  const roiChartOptions = {
    responsive: true,
    animation: {
      duration: 2000,
      easing: 'easeOutElastic',
    },
    layout: { padding: { top: 50, bottom: 30 } },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(30, 30, 47, 0.9)',
        titleColor: '#fff',
        bodyColor: '#00ff66',
        borderColor: '#00ccff',
        borderWidth: 2,
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: (ctx) => `${ctx.parsed.y.toFixed(2)}%`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)', lineWidth: 1 },
        ticks: { color: '#94a3b8', font: { size: 14 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255, 255, 255, 0.05)', lineWidth: 1 },
        ticks: {
          color: '#94a3b8',
          font: { size: 14 },
          callback: (val) => `${val}%`,
        },
        suggestedMin: 0,
        suggestedMax: Math.max(...(roiData.data || [0])) * 1.2 || 12,
      },
    },
  };

  const formatNumber = (value) => {
    if (value == null || isNaN(value)) return '0.00';
    return Number(value).toFixed(2);
  };

  const totalPortfolioValue = (profile?.initial_investment_amount || 0) + (profile?.profit || 0);

  return (
    <div className="dashboard-container p-4 md:p-8">
      {loading ? (
        <div className="loading-splash">
          <h1 className="text-3xl font-bold text-white">Portfolio</h1>
          <div className="loading-bar-container">
            <div className="loading-bar"></div>
          </div>
        </div>
      ) : (
        <div className="dashboard-content max-w-6xl mx-auto">
          <motion.div
            className="flex justify-between items-center mb-10"
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Welcome,{' '}
              <span className="text-white">
                {profile?.first_name && profile?.last_name
                  ? `${profile.first_name} ${profile.last_name}`
                  : profile?.username || profile?.email || 'User'}
              </span>
            </h1>

            <div className="flex space-x-3 items-center">
              {profile?.is_staff && (
                <>
                  <motion.button
                    onClick={() => navigate('/impersonate')}
                    className="blue-button px-3 py-1.5 rounded-lg flex items-center"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Impersonate
                  </motion.button>
                  <motion.button
                    onClick={() => navigate('/add-summary')}
                    className="blue-button px-3 py-1.5 rounded-lg flex items-center"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Add Summary
                  </motion.button>
                </>
              )}
              <motion.button
                onClick={handleLogout}
                className="blue-button px-3 py-1.5 rounded-lg flex items-center"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut className="mr-1.5 h-4 w-4" /> Logout
              </motion.button>
            </div>
          </motion.div>

          {error && (
            <motion.p
              className="text-red-400 bg-red-900/30 p-3 rounded-lg mb-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {error}
            </motion.p>
          )}
          <div className="space-y-10">
            {/* Portfolio and ROI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                className="card-glass rounded-lg p-5"
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <h3 className="text-base uppercase font-semibold text-gray-300 mb-3">
                  Principal Investment
                </h3>
                <div className="text-3xl font-bold text-neon">
                  {profile?.initial_investment_amount?.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="mt-3 space-y-1.5 text-base">
                  <p>
                    <span className="text-white">Initial Investment:</span>{' '}
                    <span className="text-gray-50">{profile?.initial_investment_amount?.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </p>
                  <p>
                    <span className="text-white">Unrealized Gain:</span>{' '}
                    <span className="text-green-200">{profile?.unrealized_gain?.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </p>
                  <p>
                    <span className="text-white">Dividend(s) Paid:</span>{' '}
                    <span className="text-yellow-50">{profile?.dividend_paid?.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </p>
                  <p>
                    <span className="text-white">Total Profit:</span>{' '}
                    <span className="text-green-200">{profile?.profit?.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </p>
                </div>
              </motion.div>
              <motion.div
                className="card-glass rounded-lg p-5"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <h3 className="text-base uppercase font-semibold text-gray-300 mb-3">
                  Return on Investment (ROI)
                </h3>
                <motion.div
                  ref={roiCounterRef}
                  className={`text-5xl font-bold text-neon ${currentRoi >= 0 ? 'text-green-400' : 'text-red-400'}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                >
                  {currentRoi >= 0 ? '+' : ''}{currentRoi}%
                </motion.div>
                <div className="mt-3 text-base">
                  {currentRoi >= 0 ? (
                    <span className="text-green-400">Profit</span>
                  ) : (
                    <span className="text-red-400">Loss</span>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Total Account Value Chart */}
            <motion.div
              className="card-glass rounded-lg p-5"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h3 className="text-base uppercase font-semibold text-gray-300">
                    Total Account Value
                  </h3>
                  <div className="text-3xl font-bold text-neon">
                    {totalPortfolioValue.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-green-400">
                    {profile?.profit?.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({currentRoi}%)
                  </div>
                </div>
                <div className="space-x-1.5">
                  {['1M', '3M', '1Y'].map((period) => (
                    <motion.button
                      key={period}
                      className="border border-gray-500 text-gray-300 px-2.5 py-1 rounded-lg hover:bg-gray-600 hover:text-white transition duration-300"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {period}
                    </motion.button>
                  ))}
                </div>
              </div>
              <div className="chart-container">
                <Line data={accountValueChartData} options={accountValueChartOptions} />
              </div>
            </motion.div>

            {/* Cumulative Profit Chart */}
            <motion.div
              className="card-glass rounded-lg p-5"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <div className="mb-5">
                <h3 className="text-base uppercase font-semibold text-gray-300">
                  Cumulative Profit
                </h3>
                <motion.div
                  ref={profitCounterRef}
                  className="text-3xl font-bold text-neon"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {Number(animatedProfit).toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </motion.div>
                <div className="text-xs text-green-400">Total Compounded Profit to Date</div>
              </div>


              <div className="chart-container">
                <Line data={cumulativeProfitChartData} options={cumulativeProfitChartOptions} />
              </div>
            </motion.div>


            {/* Quarterly ROI Growth Chart */}
            <motion.div
              className="card-glass rounded-lg p-5"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <div className="mb-5">
                <h3 className="text-base uppercase font-semibold text-gray-300">
                  Quarterly ROI Growth
                </h3>
                <div className="text-3xl font-bold text-neon">Yield Chart</div>
                <div className="text-xs text-gray-400">Quarter-over-Quarter</div>
              </div>
              <div className="chart-container">
                <Line data={roiChartData} options={roiChartOptions} />
              </div>
            </motion.div>


            {/* Investment Summary Table */}
            {/* Investment Summary Table */}
            <motion.div
              className="card-glass rounded-lg p-5"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <h3 className="text-lg font-semibold text-white mb-3">Investment Summary (Monthly)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-base">
                  <thead>
                    <tr className="bg-gray-800 border-b-2 border-teal-500">
                      <th className="py-3 px-5 text-center text-teal-300 font-medium">Month</th>
                      <th className="py-3 px-5 text-center text-teal-300 font-medium">Principal</th>
                      <th className="py-3 px-5 text-center text-teal-300 font-medium">Div %</th>
                      <th className="py-3 px-5 text-center text-teal-300 font-medium">Dividend</th>
                      <th className="py-3 px-5 text-center text-teal-300 font-medium">Unrealized</th>
                      <th className="py-3 px-5 text-center text-teal-300 font-medium">Paid</th>
                      <th className="py-3 px-5 text-center text-teal-300 font-medium">Current Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaries.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center text-gray-500 py-5">
                          No summary data available.
                        </td>
                      </tr>
                    ) : (
                      (() => {
                        let cumulativeUnrealized = 0;

                        return summaries.map((summary) => {
                          const principal = parseFloat(summary.beginning_balance || 0);
                          const dividend = parseFloat(summary.dividend_amount || 0);
                          const unrealized = parseFloat(summary.unrealized_gain || 0);
                          const paid = parseFloat(summary.dividend_paid || 0);
                          const divPct = formatNumber(summary.dividend_percent);

                          // Accumulate unrealized gain
                          cumulativeUnrealized += unrealized;

                          const currentBalance = principal + cumulativeUnrealized;

                          return (
                            <motion.tr
                              key={summary.id}
                              className="border-b border-gray-700 table-row-hover"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3 }}
                            >
                              <td className="py-3 px-5 text-white text-center">{summary.quarter}</td>
                              <td className="py-3 px-5 text-green-400 text-center">
                                {principal.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                              </td>
                              <td className="py-3 px-5 text-yellow-400 text-center">{divPct}%</td>
                              <td className="py-3 px-5 text-yellow-400 text-center">
                                {dividend.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                              </td>
                              <td className="py-3 px-5 text-green-400 text-center">
                                {unrealized.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                              </td>
                              <td className="py-3 px-5 text-yellow-400 text-center">
                                {paid.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                              </td>
                              <td className="py-3 px-5 text-green-400 text-center">
                                {currentBalance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                              </td>
                            </motion.tr>
                          );
                        });
                      })()
                    )}
                  </tbody>


                </table>
              </div>
            </motion.div>


          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;