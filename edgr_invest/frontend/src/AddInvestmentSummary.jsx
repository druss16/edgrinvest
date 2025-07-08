import { useState, useEffect } from 'react';
import api from './api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './addinvestmentsummary.css';

const AddInvestmentSummary = () => {
  const [userId, setUserId] = useState('');
  const [users, setUsers] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [formData, setFormData] = useState({
    month: '',
    beginning_balance: '',
    dividend_percent: '10.00',
    dividend_amount: '',
    unrealized_gain: '0.00',
    dividend_paid: '0.00',
    current_balance: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch CSRF token and users on mount
  useEffect(() => {
    const fetchCsrfAndUsers = async () => {
      try {
        // Fetch CSRF token
        await api.get('/get-csrf-token/');
        // Fetch users
        const response = await api.get('/api/users/'); // Adjust if endpoint differs
        setUsers(response.data);
      } catch (err) {
        console.error('Error fetching CSRF or users:', err);
        setError('Failed to load users');
      }
    };
    fetchCsrfAndUsers();
  }, []);

  // Fetch summaries when userId changes
  useEffect(() => {
    if (!userId) {
      setSummaries([]);
      return;
    }

    const fetchSummaries = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/user-summaries/${userId}/`);
        const sortedSummaries = response.data.sort(compareQuarters);
        setSummaries(sortedSummaries);

        // Update form with latest summary data
        if (sortedSummaries.length > 0) {
          const lastSummary = sortedSummaries[sortedSummaries.length - 1];
          setFormData((prev) => ({
            ...prev,
            beginning_balance: parseFloat(lastSummary.current_balance).toFixed(2),
            month: getNextQuarter(lastSummary.month),
          }));
          updateDividendCalculations({
            ...formData,
            beginning_balance: lastSummary.current_balance,
          });
        }
      } catch (err) {
        console.error('Error fetching summaries:', err);
        setSummaries([]);
        setError('Failed to load summaries');
      } finally {
        setLoading(false);
      }
    };

    fetchSummaries();
  }, [userId]);

  // Parse quarter (e.g., "Q1-23" to { quarter: 1, year: 2023 })
  const parseQuarter = (q) => {
    const [qtr, yr] = q.split('-');
    return {
      quarter: parseInt(qtr.replace('Q', '')),
      year: parseInt(yr.length === 2 ? `20${yr}` : yr),
      original: q,
    };
  };

  // Compare quarters for sorting
  const compareQuarters = (a, b) => {
    const qa = parseQuarter(a.month);
    const qb = parseQuarter(b.month);
    if (qa.year !== qb.year) return qa.year - qb.year;
    return qa.quarter - qb.quarter;
  };

  // Get next quarter (e.g., "Q4-23" -> "Q1-24")
  const getNextQuarter = (currentQuarter) => {
    const { quarter, year } = parseQuarter(currentQuarter);
    let nextQuarter = quarter + 1;
    let nextYear = year;
    if (nextQuarter > 4) {
      nextQuarter = 1;
      nextYear += 1;
    }
    return `Q${nextQuarter}-${String(nextYear).slice(-2)}`;
  };

  // Update dividend calculations
  const updateDividendCalculations = (data) => {
    const begBal = parseFloat(data.beginning_balance) || 0;
    const divPct = parseFloat(data.dividend_percent) || 0;
    const dividendAmount = begBal * (divPct / 100);
    const endBal = begBal; // Per HTML logic

    setFormData((prev) => ({
      ...prev,
      dividend_amount: dividendAmount.toFixed(2),
      current_balance: endBal.toFixed(2),
    }));
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'beginning_balance' || name === 'dividend_percent') {
        updateDividendCalculations(updated);
      }
      return updated;
    });
  };

  // Handle user selection
  const handleUserChange = (value) => {
    setUserId(value);
    setError('');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/add-investment-summary/', { ...formData, user_id: userId });
      // Refresh summaries
      const response = await api.get(`/user-summaries/${userId}/`);
      setSummaries(response.data.sort(compareQuarters));
      setFormData({
        month: getNextQuarter(formData.month),
        beginning_balance: parseFloat(formData.current_balance).toFixed(2),
        dividend_percent: '10.00',
        dividend_amount: '',
        unrealized_gain: '0.00',
        dividend_paid: '0.00',
        current_balance: '',
      });
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Failed to save summary');
    }
  };

  // Calculate summary stats
  const calculateSummary = () => {
    let initialInvestment = 0;
    let totalPaid = 0;
    let totalUnrealized = 0;

    summaries.forEach((s) => {
      const beg = parseFloat(s.beginning_balance) || 0;
      const paid = parseFloat(s.dividend_paid) || 0;
      const unreal = parseFloat(s.unrealized_gain) || 0;
      if (paid === 0) initialInvestment += beg;
      totalPaid += paid;
      totalUnrealized += unreal;
    });

    const profit = totalPaid + totalUnrealized - initialInvestment;
    return { initialInvestment, totalPaid, totalUnrealized, profit };
  };

  const { initialInvestment, totalPaid, totalUnrealized, profit } = calculateSummary();

  return (
    <motion.div
      className="container p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold text-center mb-6 text-blue-900">Add Investment Summary</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form Section */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="form-section">
            <CardHeader>
              <CardTitle>Enter Summary Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <Label htmlFor="user">User</Label>
                  <Select onValueChange={handleUserChange} value={userId}>
                    <SelectTrigger id="user">
                      <SelectValue placeholder="Select a user" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {Object.entries(formData).map(([key, value]) => (
                  <div key={key} className="mb-4">
                    <Label htmlFor={`id_${key}`}>
                      {key === 'month'
                        ? 'Quarter'
                        : key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </Label>
                    <Input
                      type={key.includes('balance') || key.includes('amount') || key.includes('percent') ? 'number' : 'text'}
                      step={key.includes('balance') || key.includes('amount') ? '0.01' : '0.1'}
                      id={`id_${key}`}
                      name={key}
                      value={value}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                ))}
                {error && <div className="text-red-500 mb-4">{error}</div>}
                <Button type="submit" className="w-full">
                  Save Summary
                </Button>
              </form>
              <Button
                variant="link"
                className="mt-4 text-blue-900"
                onClick={() => navigate('/dashboard')}
              >
                ← Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* History Section */}
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="history-section">
            <CardHeader>
              <CardTitle>Investment History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quarter</TableHead>
                    <TableHead>Beg</TableHead>
                    <TableHead>Div %</TableHead>
                    <TableHead>Div</TableHead>
                    <TableHead>Unrealized</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>End</TableHead>
                    <TableHead>Edit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : summaries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-gray-500">
                        {userId ? 'No data available' : 'Select a user to load history'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    summaries.map((summary) => (
                      <TableRow key={summary.id}>
                        <TableCell>{summary.month}</TableCell>
                        <TableCell>${parseFloat(summary.beginning_balance).toFixed(2)}</TableCell>
                        <TableCell>{parseFloat(summary.dividend_percent).toFixed(2)}%</TableCell>
                        <TableCell>${parseFloat(summary.dividend_amount).toFixed(2)}</TableCell>
                        <TableCell>${parseFloat(summary.unrealized_gain).toFixed(2)}</TableCell>
                        <TableCell>${parseFloat(summary.dividend_paid).toFixed(2)}</TableCell>
                        <TableCell>${parseFloat(summary.current_balance).toFixed(2)}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/edit-investment-summary/${summary.id}`)}
                          >
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <div className="mt-4 p-4 bg-gray-100 rounded">
                <div>
                  <strong>Initial Investment:</strong> ${initialInvestment.toFixed(2)}<br />
                  <strong>Dividends Paid:</strong> ${totalPaid.toFixed(2)}<br />
                  <strong>Unrealized Gain:</strong> ${totalUnrealized.toFixed(2)}<br />
                  <strong>Total Profit:</strong> ${profit.toFixed(2)}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AddInvestmentSummary;