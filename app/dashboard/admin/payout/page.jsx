"use client"
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign,
  CreditCard,
  Users,
  TrendingUp,
  Calendar,
  Download,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Wallet,
  Banknote,
  Receipt,
  FileText,
  AlertCircle,
  Check,
  X,
  Upload,
  Send,
  Printer,
  Settings,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Award,
  Star,
  UserCheck,
  ExternalLink,
  Copy,
  Mail,
  MessageSquare
} from 'lucide-react';

const AdminPaymentManagement = () => {
  const [transactions, setTransactions] = useState([]);
  const [payoutRequests, setPayoutRequests] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('transactions');
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [itemsPerPage] = useState(10);
  const [dateRange, setDateRange] = useState('month');
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutNote, setPayoutNote] = useState('');

  const initialTransactions = [/* Your existing transactions data */];
  const initialPayoutRequests = [/* Your existing payout requests */];
  const initialInstructors = [/* Your existing instructors data */];

  useEffect(() => { loadData(); }, []);
  const loadData = () => { /* Your existing loadData function */ };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          transaction.payer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          transaction.payee.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || transaction.status === selectedFilter;
    const matchesType = selectedType === 'all' || transaction.type === selectedType;
    return matchesSearch && matchesFilter && matchesType;
  });

  const filteredPayouts = payoutRequests.filter(payout => {
    const matchesSearch = payout.instructorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          payout.instructorEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || payout.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const currentData = activeTab === 'transactions' ? filteredTransactions : filteredPayouts;
  const totalPages = Math.ceil(currentData.length / itemsPerPage);
  const paginatedData = currentData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const handleProcessPayout = () => {
    if (!payoutAmount || parseFloat(payoutAmount) <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }
    const updatedPayouts = payoutRequests.map(p => p.id === selectedPayout.id ? { ...p, status: 'processing', processedDate: new Date().toISOString() } : p);
    setPayoutRequests(updatedPayouts);
    const updatedInstructors = instructors.map(i => i.id === selectedPayout.instructorId ? { ...i, balance: i.balance - parseFloat(payoutAmount), pendingPayout: 0 } : i);
    setInstructors(updatedInstructors);
    setShowPayoutModal(false);
    showToast(`Payout of $${payoutAmount} processed successfully!`, 'success');
  };

  const markPayoutCompleted = (id) => {
    setPayoutRequests(payoutRequests.map(p => p.id === id ? { ...p, status: 'completed' } : p));
    showToast('Payout marked as completed!', 'success');
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'completed': return { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle, label: 'Completed' };
      case 'pending': return { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock, label: 'Pending' };
      case 'processing': return { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: RefreshCw, label: 'Processing' };
      case 'failed': return { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle, label: 'Failed' };
      default: return { color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300', icon: Clock, label: status };
    }
  };

  const getTransactionTypeBadge = (type) => {
    switch(type) {
      case 'course_purchase': return { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CreditCard, label: 'Purchase' };
      case 'payout': return { color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', icon: Wallet, label: 'Payout' };
      case 'refund': return { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle, label: 'Refund' };
      default: return { color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300', icon: CreditCard, label: type };
    }
  };

  const totalRevenue = transactions.filter(t => t.status === 'completed' && t.type === 'course_purchase').reduce((sum, t) => sum + t.amount, 0);
  const totalFees = transactions.filter(t => t.status === 'completed' && t.type === 'course_purchase').reduce((sum, t) => sum + t.fee, 0);
  const totalPayouts = transactions.filter(t => t.status === 'completed' && t.type === 'payout').reduce((sum, t) => sum + t.amount, 0);
  const pendingPayouts = payoutRequests.filter(p => p.status === 'pending' || p.status === 'processing').reduce((sum, p) => sum + p.amount, 0);

  const stats = [
    { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'bg-green-500', change: '+15%' },
    { label: 'Platform Fees', value: `$${totalFees.toLocaleString()}`, icon: TrendingUp, color: 'bg-blue-500', change: '+12%' },
    { label: 'Total Payouts', value: `$${totalPayouts.toLocaleString()}`, icon: Wallet, color: 'bg-purple-500', change: '+8%' },
    { label: 'Pending Payouts', value: `$${pendingPayouts.toLocaleString()}`, icon: Clock, color: 'bg-yellow-500', change: '-5%' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      
      {/* Toast Notification - Dark Mode Fixed */}
      <AnimatePresence>
        {toast.show && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 text-white ${
              toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            {toast.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payout Modal - Dark Mode Fixed */}
      <AnimatePresence>
        {showPayoutModal && selectedPayout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowPayoutModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                  <Send className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Process Payout</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <img src={selectedPayout.instructorAvatar} alt="" className="w-10 h-10 rounded-full" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{selectedPayout.instructorName}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedPayout.instructorEmail}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payout Amount</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                    <input type="number" value={payoutAmount} onChange={(e) => setPayoutAmount(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                      placeholder="0.00" />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Available balance: ${selectedPayout.balance.toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method</label>
                  <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white">
                    <option value="bank_transfer">Bank Transfer</option><option value="paypal">PayPal</option><option value="stripe">Stripe</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes (Optional)</label>
                  <textarea rows={2} value={payoutNote} onChange={(e) => setPayoutNote(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Add internal notes..." />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowPayoutModal(false)} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">Cancel</button>
                <button onClick={handleProcessPayout} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Process Payout</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Transaction Details Modal - Dark Mode Fixed */}
      <AnimatePresence>
        {showTransactionModal && selectedTransaction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowTransactionModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-xl max-w-lg w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Transaction Details</h2>
                <button onClick={() => setShowTransactionModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700"><span className="text-gray-500 dark:text-gray-400">Transaction ID</span><span className="font-medium text-gray-900 dark:text-white">{selectedTransaction.id}</span></div>
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700"><span className="text-gray-500 dark:text-gray-400">Date</span><span className="text-gray-900 dark:text-white">{new Date(selectedTransaction.date).toLocaleString()}</span></div>
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700"><span className="text-gray-500 dark:text-gray-400">Type</span><span className="capitalize text-gray-900 dark:text-white">{selectedTransaction.type}</span></div>
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700"><span className="text-gray-500 dark:text-gray-400">Amount</span><span className={`font-bold ${selectedTransaction.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>${Math.abs(selectedTransaction.amount).toLocaleString()}</span></div>
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700"><span className="text-gray-500 dark:text-gray-400">Platform Fee</span><span className="text-gray-900 dark:text-white">${selectedTransaction.fee.toLocaleString()}</span></div>
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700"><span className="text-gray-500 dark:text-gray-400">Net Amount</span><span className="font-bold text-gray-900 dark:text-white">${selectedTransaction.netAmount.toLocaleString()}</span></div>
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700"><span className="text-gray-500 dark:text-gray-400">From</span><span className="text-gray-900 dark:text-white">{selectedTransaction.payer}</span></div>
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700"><span className="text-gray-500 dark:text-gray-400">To</span><span className="text-gray-900 dark:text-white">{selectedTransaction.payee}</span></div>
                <div className="flex justify-between py-2 border-b border-gray-200 dark:border-gray-700"><span className="text-gray-500 dark:text-gray-400">Payment Method</span><span className="text-gray-900 dark:text-white">{selectedTransaction.paymentMethod}</span></div>
                <div className="flex justify-between py-2"><span className="text-gray-500 dark:text-gray-400">Status</span><span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusBadge(selectedTransaction.status).color}`}>{React.createElement(getStatusBadge(selectedTransaction.status).icon, { className: "w-3 h-3" })}{getStatusBadge(selectedTransaction.status).label}</span></div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowTransactionModal(false)} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header - Dark Mode Fixed */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Payment Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage transactions, process payouts, and track revenue</p>
        </motion.div>

        {/* Stats Cards - Dark Mode Fixed */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <motion.div key={stat.label} whileHover={{ y: -5 }} transition={{ delay: index * 0.05 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">{stat.change}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-full`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Tabs - Dark Mode Fixed */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-700">
          {['transactions', 'payouts', 'instructors'].map((tab) => (
            <button key={tab} onClick={() => { setActiveTab(tab); setCurrentPage(1); setSelectedFilter('all'); }}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}>
              {tab === 'transactions' && <CreditCard className="w-4 h-4 inline mr-2" />}
              {tab === 'payouts' && <Wallet className="w-4 h-4 inline mr-2" />}
              {tab === 'instructors' && <Users className="w-4 h-4 inline mr-2" />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Search and Filter Bar - Dark Mode Fixed */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input type="text" placeholder={activeTab === 'transactions' ? "Search by description, payer, or payee..." : "Search by instructor name or email..."}
                value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:placeholder:text-gray-400" />
            </div>
            <div className="flex gap-2">
              {activeTab === 'transactions' && (
                <select value={selectedType} onChange={(e) => { setSelectedType(e.target.value); setCurrentPage(1); }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white">
                  <option value="all">All Types</option><option value="course_purchase">Purchases</option><option value="payout">Payouts</option><option value="refund">Refunds</option>
                </select>
              )}
              <select value={selectedFilter} onChange={(e) => { setSelectedFilter(e.target.value); setCurrentPage(1); }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white">
                <option value="all">All Status</option><option value="completed">Completed</option><option value="pending">Pending</option><option value="processing">Processing</option><option value="failed">Failed</option>
              </select>
              <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white">
                <option value="week">This Week</option><option value="month">This Month</option><option value="quarter">This Quarter</option><option value="year">This Year</option>
              </select>
              <button onClick={loadData} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                <RefreshCw className={`w-4 h-4 text-gray-600 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Transactions Table - Dark Mode Fixed */}
        {activeTab === 'transactions' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            {loading ? <div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div> : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                      <tr><th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Transaction ID</th><th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Date</th><th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Description</th><th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Type</th><th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Amount</th><th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Status</th><th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Actions</th></tr>
                    </thead>
                    <tbody>
                      {paginatedData.map((transaction, index) => {
                        const statusBadge = getStatusBadge(transaction.status);
                        const typeBadge = getTransactionTypeBadge(transaction.type);
                        return (
                          <tr key={transaction.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="py-3 px-4"><span className="font-mono text-sm text-gray-600 dark:text-gray-400">{transaction.id}</span></td>
                            <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{new Date(transaction.date).toLocaleDateString()}</td>
                            <td className="py-3 px-4"><div><p className="text-sm text-gray-900 dark:text-white">{transaction.description}</p><p className="text-xs text-gray-500 dark:text-gray-400">{transaction.payer} → {transaction.payee}</p></div></td>
                            <td className="py-3 px-4"><span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${typeBadge.color}`}>{React.createElement(typeBadge.icon, { className: "w-3 h-3" })}{typeBadge.label}</span></td>
                            <td className="py-3 px-4"><span className={`text-sm font-semibold ${transaction.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>${Math.abs(transaction.amount).toLocaleString()}</span></td>
                            <td className="py-3 px-4"><span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${statusBadge.color}`}>{React.createElement(statusBadge.icon, { className: "w-3 h-3" })}{statusBadge.label}</span></td>
                            <td className="py-3 px-4"><div className="flex items-center justify-center gap-2"><button onClick={() => { setSelectedTransaction(transaction); setShowTransactionModal(true); }} className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"><Eye className="w-4 h-4" /></button><button onClick={() => { navigator.clipboard.writeText(transaction.id); showToast('Transaction ID copied!', 'success'); }} className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"><Copy className="w-4 h-4" /></button></div></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {filteredTransactions.length === 0 && (<div className="text-center py-12"><Receipt className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" /><p className="text-gray-500 dark:text-gray-400">No transactions found</p></div>)}
              </>
            )}
          </motion.div>
        )}

        {/* Payout Requests Table - Dark Mode Fixed */}
        {activeTab === 'payouts' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            {loading ? <div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div> : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                      <tr><th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Instructor</th><th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Request Date</th><th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Amount</th><th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Payment Method</th><th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Status</th><th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Actions</th></tr>
                    </thead>
                    <tbody>
                      {paginatedData.map((payout, index) => {
                        const statusBadge = getStatusBadge(payout.status);
                        return (
                          <tr key={payout.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="py-3 px-4"><div className="flex items-center gap-3"><img src={payout.instructorAvatar} alt="" className="w-8 h-8 rounded-full" /><div><p className="font-medium text-gray-900 dark:text-white">{payout.instructorName}</p><p className="text-xs text-gray-500 dark:text-gray-400">{payout.instructorEmail}</p></div></div></td>
                            <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{new Date(payout.requestDate).toLocaleDateString()}</td>
                            <td className="py-3 px-4"><span className="text-sm font-semibold text-green-600 dark:text-green-400">${payout.amount.toLocaleString()}</span></td>
                            <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{payout.paymentMethod}</td>
                            <td className="py-3 px-4"><span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${statusBadge.color}`}>{React.createElement(statusBadge.icon, { className: "w-3 h-3" })}{statusBadge.label}</span></td>
                            <td className="py-3 px-4"><div className="flex items-center justify-center gap-2">{payout.status === 'pending' && (<button onClick={() => { setSelectedPayout(payout); setPayoutAmount(payout.amount.toString()); setShowPayoutModal(true); }} className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">Process</button>)}{payout.status === 'processing' && (<button onClick={() => markPayoutCompleted(payout.id)} className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">Mark Complete</button>)}<button className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"><Mail className="w-4 h-4" /></button></div></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {filteredPayouts.length === 0 && (<div className="text-center py-12"><Wallet className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" /><p className="text-gray-500 dark:text-gray-400">No payout requests found</p></div>)}
              </>
            )}
          </motion.div>
        )}

        {/* Instructor Balances Table - Dark Mode Fixed */}
        {activeTab === 'instructors' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                  <tr><th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Instructor</th><th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Total Earned</th><th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Pending Payout</th><th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Available Balance</th><th className="text-center py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-300">Actions</th></tr>
                </thead>
                <tbody>
                  {instructors.map((instructor, index) => (
                    <tr key={instructor.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="py-3 px-4"><div className="flex items-center gap-3"><img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(instructor.name)}&background=6366f1&color=fff`} alt="" className="w-8 h-8 rounded-full" /><div><p className="font-medium text-gray-900 dark:text-white">{instructor.name}</p><p className="text-xs text-gray-500 dark:text-gray-400">{instructor.email}</p></div></div></td>
                      <td className="py-3 px-4"><span className="text-sm font-semibold text-green-600 dark:text-green-400">${instructor.totalEarned.toLocaleString()}</span></td>
                      <td className="py-3 px-4"><span className="text-sm text-yellow-600 dark:text-yellow-400">${instructor.pendingPayout.toLocaleString()}</span></td>
                      <td className="py-3 px-4"><span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">${instructor.balance.toLocaleString()}</span></td>
                      <td className="py-3 px-4"><div className="flex items-center justify-center gap-2">{instructor.balance > 0 && (<button onClick={() => { const pendingPayout = { id: Date.now(), instructorId: instructor.id, instructorName: instructor.name, instructorEmail: instructor.email, instructorAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(instructor.name)}&background=6366f1&color=fff`, amount: instructor.balance, balance: instructor.balance, requestDate: new Date().toISOString(), status: 'pending', paymentMethod: 'Bank Transfer', accountDetails: 'Not provided' }; setSelectedPayout(pendingPayout); setPayoutAmount(instructor.balance.toString()); setShowPayoutModal(true); }} className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">Initiate Payout</button>)}</div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Pagination - Dark Mode Fixed */}
        {currentData.length > 0 && (
          <div className="flex justify-between items-center mt-6 px-4 py-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
            <p className="text-sm text-gray-600 dark:text-gray-400">Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, currentData.length)} of {currentData.length} items</p>
            <div className="flex gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700">
                <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <span className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">{currentPage} / {totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-700">
                <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPaymentManagement;