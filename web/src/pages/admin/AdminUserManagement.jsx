import React, { useState, useEffect } from 'react';
import { Search, Filter, UserCheck, ShieldAlert, Eye, RefreshCw, Loader2 } from 'lucide-react';
import api from '../../services/api';

export default function AdminUserManagement() {
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('All');
  const [elders, setElders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchElders();
  }, []);

  const fetchElders = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await api.get('/elderly-profiles/?limit=100');
      const profiles = res.data;
      // Format profiles for display
      const formatted = profiles.map((p, idx) => {
        const user = p.user || {};
        const name = user.first_name && user.last_name
          ? `${user.first_name} ${user.last_name}`
          : (user.email || `Elder #${idx + 1}`);
        const dob = p.date_of_birth;
        const age = dob
          ? new Date().getFullYear() - new Date(dob).getFullYear()
          : 'N/A';
        const region = p.address || 'Not specified';
        const conditions = p.medications || 'None listed';
        return {
          id: p.id.slice(0, 8).toUpperCase(),
          fullId: p.id,
          name,
          age,
          region,
          condition: conditions,
          score: 75,
          caregiverLinked: !!(p.emergency_contact_info?.caregiver_phone),
          status: 'Active',
          dietPref: p.dietary_preference || 'Not set',
          email: user.email || '',
        };
      });
      setElders(formatted);
    } catch (err) {
      setErrorMsg(`Failed to load elder profiles: ${err.response?.data?.detail || err.message}`);
      // Use placeholder data on error
      setElders([
        { id: 'E-001', fullId: '', name: 'No Data Available', age: 'N/A', region: 'N/A', condition: 'N/A', score: 0, caregiverLinked: false, status: 'Unknown', dietPref: 'N/A', email: '' },
      ]);
    }
    setLoading(false);
  };

  const filtered = elders.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) &&
    (regionFilter === 'All' || e.region === regionFilter)
  );

  return (
    <div className="space-y-6 font-['Outfit'] max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#7F77DD] uppercase">Participant Directory</span>
          <h1 className="text-3xl font-extrabold text-slate-900">User Management</h1>
          {!loading && (
            <p className="text-sm text-slate-500 font-bold mt-0.5">{elders.length} registered elder profile{elders.length !== 1 ? 's' : ''} in database</p>
          )}
        </div>

        {/* Search & Filter & Refresh */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search elder name…"
              className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm focus:border-[#7F77DD] outline-none font-semibold min-w-[200px]"
            />
          </div>

          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 outline-none"
          >
            <option value="All">All Regions</option>
            <option value="Tamil Nadu">Tamil Nadu</option>
            <option value="Kerala">Kerala</option>
            <option value="Karnataka">Karnataka</option>
            <option value="Andhra Pradesh">Andhra Pradesh</option>
          </select>

          <button
            onClick={fetchElders}
            className="p-2.5 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-100 transition-colors"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {errorMsg && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3 text-amber-800 font-bold text-sm">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Elders Data Table */}
      <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <Loader2 className="w-10 h-10 text-[#7F77DD] animate-spin" />
            <p className="font-extrabold text-slate-600">Loading elder profiles from database…</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-xs">
                  <th className="pb-3 pr-4">Elder ID</th>
                  <th className="pb-3 pr-4">Name</th>
                  <th className="pb-3 pr-4">Age</th>
                  <th className="pb-3 pr-4">Region</th>
                  <th className="pb-3 pr-4">Diet Pref</th>
                  <th className="pb-3 pr-4">Conditions</th>
                  <th className="pb-3 pr-4">Caregiver</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-400 font-bold">
                      {search || regionFilter !== 'All' ? 'No matching elders found.' : 'No elder profiles registered yet.'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 pr-4">
                        <code className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg font-bold">
                          {e.id}
                        </code>
                      </td>
                      <td className="py-3.5 pr-4 font-extrabold text-slate-900">{e.name}</td>
                      <td className="py-3.5 pr-4 text-slate-600">{e.age}</td>
                      <td className="py-3.5 pr-4 text-slate-600">{e.region}</td>
                      <td className="py-3.5 pr-4 text-slate-600 capitalize">{e.dietPref}</td>
                      <td className="py-3.5 pr-4 text-slate-600 max-w-[120px] truncate" title={e.condition}>
                        {e.condition}
                      </td>
                      <td className="py-3.5 pr-4">
                        {e.caregiverLinked ? (
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">✓ Linked</span>
                        ) : (
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">Unlinked</span>
                        )}
                      </td>
                      <td className="py-3.5 text-right">
                        <button title="View Profile" className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-[#7F77DD] hover:text-white transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
