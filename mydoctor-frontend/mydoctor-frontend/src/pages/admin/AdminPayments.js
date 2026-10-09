import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  RefreshCw,
  ArrowUpRight,
  ShieldCheck,
  Download
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { getAdminPayments } from '../../services/api';
import { exportToCsv } from '../../utils/exportCsv';

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await getAdminPayments();
      setPayments(res.data.data);
    } catch (err) {
      toast.error('Failed to load transaction audit records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const totalVolume = payments
    .filter(p => p.status === 'PAID')
    .reduce((sum, p) => sum + (p.amount ? p.amount / 100 : 0), 0);

  const successfulTxCount = payments.filter(p => p.status === 'PAID').length;
  const pendingTxCount    = payments.filter(p => p.status === 'CREATED').length;
  const failedTxCount     = payments.filter(p => p.status === 'FAILED').length;

  const filteredPayments = payments.filter(p => {
    const matchesStatus = !statusFilter || p.status === statusFilter;
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch = !q ||
      (p.razorpayOrderId && p.razorpayOrderId.toLowerCase().includes(q)) ||
      (p.razorpayPaymentId && p.razorpayPaymentId.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  const handleExportCsv = () => {
    if (!filteredPayments.length) {
      toast.error('No transactions available to export');
      return;
    }

    const columns = [
      { key: 'id', label: 'Transaction ID' },
      { key: 'razorpayOrderId', label: 'Razorpay Order ID' },
      { key: 'razorpayPaymentId', label: 'Razorpay Payment ID' },
      { key: 'amount', label: 'Amount (Paise)' },
      { key: 'status', label: 'Status' },
      { key: 'currency', label: 'Currency' },
      { key: 'createdAt', label: 'Created At' },
    ];

    exportToCsv(
      `mydoctor_financial_ledger_${new Date().toISOString().slice(0, 10)}`,
      columns,
      filteredPayments
    );
    toast.success('Financial ledger CSV downloaded');
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1400, margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
        marginBottom: 24
      }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--navy)', letterSpacing: '-0.02em' }}>
            Payments & Financial Audits
          </h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.92rem' }}>
            Live record of Razorpay gateways, orders, transaction captures, and platform settlements.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={handleExportCsv}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px' }}
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>

          <button
            onClick={fetchPayments}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px' }}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Ledger</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 20,
        marginBottom: 28
      }}>
        <div style={{ background: 'white', borderRadius: 16, padding: 22, border: '1px solid var(--gray-200)', boxShadow: '0 4px 18px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-500)' }}>Gross Paid Volume</span>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(16,185,129,0.12)', color: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--navy)' }}>
            ₹{totalVolume.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--gray-400)', marginTop: 4 }}>
            Settled via Razorpay gateway
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: 16, padding: 22, border: '1px solid var(--gray-200)', boxShadow: '0 4px 18px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-500)' }}>Successful Transactions</span>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(99,102,241,0.12)', color: 'var(--indigo)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--navy)' }}>
            {successfulTxCount}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--green)', fontWeight: 600, marginTop: 4 }}>
            Captured & Verified
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: 16, padding: 22, border: '1px solid var(--gray-200)', boxShadow: '0 4px 18px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-500)' }}>Pending Captures</span>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(245,158,11,0.12)', color: 'var(--amber)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--navy)' }}>
            {pendingTxCount}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--gray-400)', marginTop: 4 }}>
            Order generated, awaiting callback
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: 16, padding: 22, border: '1px solid var(--gray-200)', boxShadow: '0 4px 18px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-500)' }}>Failed Orders</span>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(244,63,94,0.12)', color: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <XCircle size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--navy)' }}>
            {failedTxCount}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--gray-400)', marginTop: 4 }}>
            Cancelled or aborted checkout
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        background: 'white',
        borderRadius: 14,
        padding: '16px 20px',
        border: '1px solid var(--gray-200)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 280 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: 38, height: 40 }}
            placeholder="Search by Razorpay Order ID or Payment ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--gray-600)', fontWeight: 500 }}>Status:</span>
          <select
            className="form-input"
            style={{ height: 38, padding: '0 12px', fontSize: '0.85rem', minWidth: 140 }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Transactions</option>
            <option value="PAID">PAID</option>
            <option value="CREATED">CREATED</option>
            <option value="FAILED">FAILED</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div style={{
        background: 'white',
        borderRadius: 16,
        border: '1px solid var(--gray-200)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        overflow: 'hidden'
      }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 240 }}>
            <div className="spinner" style={{ width: 32, height: 32 }} />
          </div>
        ) : filteredPayments.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
              <thead>
                <tr style={{ background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)', textAlign: 'left', color: 'var(--gray-500)' }}>
                  <th style={{ padding: '14px 16px', fontWeight: 600 }}>Tx ID</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600 }}>Razorpay Order ID</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600 }}>Payment Reference ID</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600 }}>Amount</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600 }}>Created Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--gray-100)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--navy)' }}>
                      #{p.id}
                    </td>

                    <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--gray-700)' }}>
                      {p.razorpayOrderId}
                    </td>

                    <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '0.82rem', color: 'var(--indigo)' }}>
                      {p.razorpayPaymentId || <span style={{ color: 'var(--gray-400)' }}>—</span>}
                    </td>

                    <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--navy)' }}>
                      ₹{p.amount ? (p.amount / 100).toLocaleString() : 0}
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      {p.status === 'PAID' ? (
                        <span className="badge badge-success"><CheckCircle2 size={12} /> Captured</span>
                      ) : p.status === 'CREATED' ? (
                        <span className="badge badge-warning"><Clock size={12} /> Pending</span>
                      ) : (
                        <span className="badge badge-danger"><XCircle size={12} /> Failed</span>
                      )}
                    </td>

                    <td style={{ padding: '14px 16px', color: 'var(--gray-500)', fontSize: '0.8rem' }}>
                      {p.createdAt ? new Date(p.createdAt).toLocaleString() : 'Recent'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--gray-400)' }}>
            No payment transaction entries found.
          </div>
        )}
      </div>
    </div>
  );
}
