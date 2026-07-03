import React, { useState } from 'react';
import { LogEntry, LedgerType, UserProfile } from '../types';
import { formatNaira } from '../utils/formatters';
import { Download, Printer, Calendar, TrendingUp, TrendingDown, Layers, FileSpreadsheet, FileText } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

interface ReportsExportProps {
  logs: LogEntry[];
  activeLedger: LedgerType;
  user: UserProfile;
}

export const ReportsExport: React.FC<ReportsExportProps> = ({ logs, activeLedger, user }) => {
  const [timeFilter, setTimeFilter] = useState<'all' | 'month' | 'week' | 'today'>('month');

  const filteredLogs = logs.filter((log) => {
    if (log.ledgerType !== activeLedger) return false;

    const logDate = new Date(log.date);
    const now = new Date();

    if (timeFilter === 'today') {
      return logDate.toDateString() === now.toDateString();
    }
    if (timeFilter === 'week') {
      const diffTime = Math.abs(now.getTime() - logDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }
    if (timeFilter === 'month') {
      return logDate.getMonth() === now.getMonth() && logDate.getFullYear() === now.getFullYear();
    }
    return true;
  });

  const totalIncome = filteredLogs
    .filter((l) => l.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = filteredLogs
    .filter((l) => l.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const netBalance = totalIncome - totalExpense;

  // Prepare Chart Data
  const categoryMap: { [key: string]: number } = {};
  filteredLogs.forEach((l) => {
    categoryMap[l.category] = (categoryMap[l.category] || 0) + l.amount;
  });

  const categoryChartData = Object.keys(categoryMap).map((cat) => ({
    name: cat,
    amount: categoryMap[cat],
  }));

  const comparisonChartData = [
    {
      name: 'Cash Summary',
      Income: totalIncome,
      Expense: totalExpense,
    },
  ];

  const PIE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#f97316'];

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['ID,Date,Type,Category,Description,Amount (NGN),Source,Ledger'];
    const rows = filteredLogs.map(
      (l) =>
        `"${l.id}","${l.date}","${l.type}","${l.category}","${l.description.replace(/"/g, '""')}","${l.amount}","${l.source}","${l.ledgerType}"`
    );

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `E-moneyLog_${activeLedger}_${timeFilter}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Statement
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Filters & Export Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs">
        
        {/* Period Buttons */}
        <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg border border-gray-200 w-full sm:w-auto overflow-x-auto">
          {(['month', 'week', 'today', 'all'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold capitalize transition-all ${
                timeFilter === filter
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {filter === 'month' ? 'This Month' : filter === 'week' ? 'This Week' : filter}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <button
            onClick={exportToCSV}
            className="flex-1 sm:flex-initial px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-emerald-700 border border-gray-200 rounded-md text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 sm:flex-initial px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-bold flex items-center justify-center space-x-1.5 shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>

      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs space-y-1">
          <span className="text-xs text-emerald-600 font-bold uppercase tracking-wider flex items-center space-x-1">
            <TrendingUp className="w-4 h-4" />
            <span>Total Cash In</span>
          </span>
          <p className="text-2xl font-black text-gray-900">{formatNaira(totalIncome)}</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs space-y-1">
          <span className="text-xs text-rose-600 font-bold uppercase tracking-wider flex items-center space-x-1">
            <TrendingDown className="w-4 h-4" />
            <span>Total Cash Out</span>
          </span>
          <p className="text-2xl font-black text-gray-900">{formatNaira(totalExpense)}</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-xs space-y-1">
          <span className="text-xs text-amber-700 font-bold uppercase tracking-wider flex items-center space-x-1">
            <Layers className="w-4 h-4" />
            <span>Net Cash Balance</span>
          </span>
          <p className={`text-2xl font-black ${netBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {formatNaira(netBalance)}
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Income vs Expense Bar Chart */}
        <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-xs space-y-3">
          <h4 className="font-bold text-sm text-gray-900">Cash In vs Cash Out Overview</h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" tickFormatter={(val) => `₦${val / 1000}k`} />
                <Tooltip
                  formatter={(val: any) => [formatNaira(Number(val)), 'Amount']}
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', color: '#111827', borderRadius: '8px' }}
                />
                <Legend />
                <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Pie Chart */}
        <div className="p-5 bg-white rounded-xl border border-gray-200 shadow-xs space-y-3">
          <h4 className="font-bold text-sm text-gray-900">Category Distribution (Naira)</h4>
          {categoryChartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-gray-400 text-xs">
              No transactions logged for this period.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    dataKey="amount"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {categoryChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [formatNaira(Number(val)), 'Total']}
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', color: '#111827', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

      </div>

      {/* Printable Statement Table */}
      <div id="printable-statement" className="p-6 bg-white rounded-xl border border-gray-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <div>
            <h3 className="text-lg font-black text-gray-900">{user.businessName || 'E-moneyLog Cash Book'}</h3>
            <p className="text-xs text-gray-500">
              Account Holder: {user.fullName} ({user.phone}) • {user.state}, Nigeria
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block">
              Official Statement
            </span>
            <span className="text-[11px] text-gray-400 font-mono">
              Generated: {new Date().toLocaleDateString('en-NG')}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-100 text-gray-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Category</th>
                <th className="p-3">Description</th>
                <th className="p-3">Source</th>
                <th className="p-3 text-right">Cash In (₦)</th>
                <th className="p-3 text-right">Cash Out (₦)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-3 font-mono text-[11px] text-gray-500">{log.date}</td>
                  <td className="p-3 font-semibold text-gray-900">{log.category}</td>
                  <td className="p-3 text-gray-600 max-w-xs truncate">{log.description}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-gray-100 border border-gray-200 text-gray-700 text-[10px] uppercase font-bold">
                      {log.source}
                    </span>
                  </td>
                  <td className="p-3 text-right font-bold text-emerald-600">
                    {log.type === 'income' ? formatNaira(log.amount) : '-'}
                  </td>
                  <td className="p-3 text-right font-bold text-rose-600">
                    {log.type === 'expense' ? formatNaira(log.amount) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
