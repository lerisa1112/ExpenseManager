import React, { useState, useEffect } from 'react';
import { Users, DollarSign, FileText, CheckCircle, XCircle, Clock, Menu, X, Upload, Search, Filter, Settings, Home, BarChart3, Plus, Eye, Edit, Trash2, ChevronRight, AlertCircle } from 'lucide-react';

// Main App Component
export default function ExpenseManagementApp() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('login');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [approvalRules, setApprovalRules] = useState([]);
  const [countries, setCountries] = useState([]);

  // Fetch countries on mount
  useEffect(() => {
    fetch('https://restcountries.com/v3.1/all?fields=name,currencies')
      .then(res => res.json())
      .then(data => {
        const formattedCountries = data.map(country => ({
          name: country.name.common,
          currencies: country.currencies
        })).filter(c => c.currencies);
        setCountries(formattedCountries.sort((a, b) => a.name.localeCompare(b.name)));
      })
      .catch(err => console.error('Error fetching countries:', err));
  }, []);

  // Login/Signup Handler
  const handleAuth = (email, password, name, selectedCountry, isSignup) => {
    if (isSignup) {
      const currencyCode = Object.keys(selectedCountry.currencies)[0];
      const newCompany = {
        id: Date.now(),
        name: `${name}'s Company`,
        currency: currencyCode,
        country: selectedCountry.name
      };
      const newUser = {
        id: Date.now() + 1,
        name,
        email,
        role: 'Admin',
        companyId: newCompany.id,
        managerId: null
      };
      setCompanies([...companies, newCompany]);
      setUsers([...users, newUser]);
      setCurrentUser(newUser);
      setCurrentPage('dashboard');
    } else {
      const user = users.find(u => u.email === email);
      if (user) {
        setCurrentUser(user);
        setCurrentPage('dashboard');
      } else {
        alert('User not found');
      }
    }
  };

  // Create Employee/Manager
  const createUser = (userData) => {
    const newUser = {
      id: Date.now(),
      ...userData,
      companyId: currentUser.companyId
    };
    setUsers([...users, newUser]);
  };

  // Submit Expense
  const submitExpense = (expenseData) => {
    const newExpense = {
      id: Date.now(),
      ...expenseData,
      userId: currentUser.id,
      companyId: currentUser.companyId,
      status: 'Pending',
      submittedAt: new Date().toISOString(),
      approvalHistory: [],
      currentApproverIndex: 0
    };
    setExpenses([...expenses, newExpense]);
  };

  // Approve/Reject Expense
  const handleApproval = (expenseId, action, comments) => {
    setExpenses(expenses.map(exp => {
      if (exp.id === expenseId) {
        const newHistory = [...exp.approvalHistory, {
          approverId: currentUser.id,
          action,
          comments,
          timestamp: new Date().toISOString()
        }];
        
        // Check approval rules and move to next approver
        const rule = approvalRules.find(r => r.companyId === currentUser.companyId);
        let newStatus = exp.status;
        let nextApproverIndex = exp.currentApproverIndex;

        if (action === 'Reject') {
          newStatus = 'Rejected';
        } else if (rule && rule.approvers && rule.approvers.length > exp.currentApproverIndex + 1) {
          nextApproverIndex = exp.currentApproverIndex + 1;
          newStatus = 'Pending';
        } else {
          newStatus = 'Approved';
        }

        return {
          ...exp,
          status: newStatus,
          approvalHistory: newHistory,
          currentApproverIndex: nextApproverIndex
        };
      }
      return exp;
    }));
  };

  const currentCompany = companies.find(c => c.id === currentUser?.companyId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {!currentUser ? (
        <AuthPage onAuth={handleAuth} countries={countries} />
      ) : (
        <div className="flex h-screen overflow-hidden">
          <Sidebar 
            isOpen={sidebarOpen} 
            setIsOpen={setSidebarOpen}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            userRole={currentUser.role}
          />
          <MainContent
            currentPage={currentPage}
            currentUser={currentUser}
            currentCompany={currentCompany}
            users={users}
            expenses={expenses}
            approvalRules={approvalRules}
            createUser={createUser}
            submitExpense={submitExpense}
            handleApproval={handleApproval}
            setApprovalRules={setApprovalRules}
            countries={countries}
          />
        </div>
      )}
    </div>
  );
}

// Auth Page Component
function AuthPage({ onAuth, countries }) {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isSignup && !selectedCountry) {
      alert('Please select a country');
      return;
    }
    onAuth(email, password, name, selectedCountry, isSignup);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-slate-200">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800">ExpenseFlow</h1>
            <p className="text-slate-600 mt-2">Manage expenses effortlessly</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Country</label>
                  <select
                    onChange={(e) => {
                      const country = countries.find(c => c.name === e.target.value);
                      setSelectedCountry(country);
                    }}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    required
                  >
                    <option value="">Select Country</option>
                    {countries.map(country => (
                      <option key={country.name} value={country.name}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition shadow-lg hover:shadow-xl"
            >
              {isSignup ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sidebar Component
function Sidebar({ isOpen, setIsOpen, currentPage, setCurrentPage, userRole }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, roles: ['Admin', 'Manager', 'Employee'] },
    { id: 'expenses', label: 'My Expenses', icon: FileText, roles: ['Employee', 'Manager', 'Admin'] },
    { id: 'submit', label: 'Submit Expense', icon: Plus, roles: ['Employee', 'Manager', 'Admin'] },
    { id: 'approvals', label: 'Approvals', icon: CheckCircle, roles: ['Manager', 'Admin'] },
    { id: 'users', label: 'Manage Users', icon: Users, roles: ['Admin'] },
    { id: 'rules', label: 'Approval Rules', icon: Settings, roles: ['Admin'] },
    { id: 'reports', label: 'Reports', icon: BarChart3, roles: ['Admin', 'Manager'] },
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <>
      <div className={`${isOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300 flex flex-col shadow-2xl`}>
        <div className="p-6 flex items-center justify-between border-b border-slate-700">
          {isOpen && <h2 className="text-xl font-bold">ExpenseFlow</h2>}
          <button onClick={() => setIsOpen(!isOpen)} className="p-2 hover:bg-slate-700 rounded-lg transition">
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {filteredMenuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                currentPage === item.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'hover:bg-slate-700 text-slate-300'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {isOpen && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}

// Main Content Component
function MainContent({ currentPage, currentUser, currentCompany, users, expenses, approvalRules, createUser, submitExpense, handleApproval, setApprovalRules, countries }) {
  return (
    <div className="flex-1 overflow-auto">
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            {currentPage === 'dashboard' && 'Dashboard'}
            {currentPage === 'expenses' && 'My Expenses'}
            {currentPage === 'submit' && 'Submit New Expense'}
            {currentPage === 'approvals' && 'Pending Approvals'}
            {currentPage === 'users' && 'Manage Users'}
            {currentPage === 'rules' && 'Approval Rules'}
            {currentPage === 'reports' && 'Reports & Analytics'}
          </h1>
          <p className="text-slate-600">Welcome back, {currentUser.name} • {currentUser.role}</p>
          {currentCompany && (
            <p className="text-sm text-slate-500 mt-1">
              Company: {currentCompany.name} • Currency: {currentCompany.currency}
            </p>
          )}
        </div>

        {currentPage === 'dashboard' && <Dashboard currentUser={currentUser} expenses={expenses} users={users} />}
        {currentPage === 'expenses' && <ExpensesList currentUser={currentUser} expenses={expenses} currentCompany={currentCompany} />}
        {currentPage === 'submit' && <SubmitExpense currentUser={currentUser} submitExpense={submitExpense} currentCompany={currentCompany} countries={countries} />}
        {currentPage === 'approvals' && <ApprovalsPage currentUser={currentUser} expenses={expenses} users={users} handleApproval={handleApproval} currentCompany={currentCompany} />}
        {currentPage === 'users' && <ManageUsers users={users} createUser={createUser} currentUser={currentUser} />}
        {currentPage === 'rules' && <ApprovalRules approvalRules={approvalRules} setApprovalRules={setApprovalRules} currentUser={currentUser} users={users} />}
        {currentPage === 'reports' && <Reports expenses={expenses} users={users} currentCompany={currentCompany} />}
      </div>
    </div>
  );
}

// Dashboard Component
function Dashboard({ currentUser, expenses, users }) {
  const myExpenses = expenses.filter(e => e.userId === currentUser.id);
  const pendingApprovals = currentUser.role !== 'Employee' 
    ? expenses.filter(e => e.status === 'Pending')
    : [];

  const stats = [
    { label: 'Total Expenses', value: myExpenses.length, icon: FileText, color: 'blue' },
    { label: 'Approved', value: myExpenses.filter(e => e.status === 'Approved').length, icon: CheckCircle, color: 'green' },
    { label: 'Pending', value: myExpenses.filter(e => e.status === 'Pending').length, icon: Clock, color: 'yellow' },
    { label: 'Rejected', value: myExpenses.filter(e => e.status === 'Rejected').length, icon: XCircle, color: 'red' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-800 mt-2">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg bg-${stat.color}-100 flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Expenses</h3>
          <div className="space-y-3">
            {myExpenses.slice(0, 5).map(exp => (
              <div key={exp.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-800">{exp.description}</p>
                  <p className="text-sm text-slate-600">{exp.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-800">{exp.amount} {exp.currency}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    exp.status === 'Approved' ? 'bg-green-100 text-green-700' :
                    exp.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {exp.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {currentUser.role !== 'Employee' && (
          <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Pending Approvals</h3>
            <div className="space-y-3">
              {pendingApprovals.slice(0, 5).map(exp => (
                <div key={exp.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-800">{exp.description}</p>
                    <p className="text-sm text-slate-600">{exp.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-800">{exp.amount} {exp.currency}</p>
                  </div>
                </div>
              ))}
              {pendingApprovals.length === 0 && (
                <p className="text-slate-500 text-center py-4">No pending approvals</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Expenses List Component
function ExpensesList({ currentUser, expenses, currentCompany }) {
  const myExpenses = expenses.filter(e => e.userId === currentUser.id);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">All My Expenses</h3>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-slate-100 rounded-lg transition">
              <Search className="w-5 h-5 text-slate-600" />
            </button>
            <button className="p-2 hover:bg-slate-100 rounded-lg transition">
              <Filter className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {myExpenses.map(exp => (
              <tr key={exp.id} className="hover:bg-slate-50 transition">
                <td className="px-6 py-4 text-sm text-slate-800">{exp.description}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{exp.category}</td>
                <td className="px-6 py-4 text-sm font-medium text-slate-800">{exp.amount} {exp.currency}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{new Date(exp.date).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                    exp.status === 'Approved' ? 'bg-green-100 text-green-700' :
                    exp.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {exp.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Submit Expense Component
function SubmitExpense({ currentUser, submitExpense, currentCompany, countries }) {
  const [formData, setFormData] = useState({
    amount: '',
    currency: currentCompany?.currency || 'USD',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    submitExpense(formData);
    alert('Expense submitted successfully!');
    setFormData({
      amount: '',
      currency: currentCompany?.currency || 'USD',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
  };

  const categories = ['Travel', 'Food', 'Accommodation', 'Transport', 'Office Supplies', 'Entertainment', 'Other'];

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Amount</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({...formData, currency: e.target.value})}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              >
                <option value={currentCompany?.currency}>{currentCompany?.currency}</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="INR">INR</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              required
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              rows="3"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              required
            />
          </div>

          <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-500 transition cursor-pointer">
            <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">Upload Receipt (OCR)</p>
            <p className="text-sm text-slate-500 mt-1">Click to upload or drag and drop</p>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition shadow-lg hover:shadow-xl"
          >
            Submit Expense
          </button>
        </form>
      </div>
    </div>
  );
}

// Approvals Page Component
function ApprovalsPage({ currentUser, expenses, users, handleApproval, currentCompany }) {
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [comments, setComments] = useState('');

  const pendingExpenses = expenses.filter(e => 
    e.status === 'Pending' && e.companyId === currentUser.companyId
  );

  const handleAction = (expenseId, action) => {
    handleApproval(expenseId, action, comments);
    setSelectedExpense(null);
    setComments('');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {pendingExpenses.map(exp => {
          const submitter = users.find(u => u.id === exp.userId);
          return (
            <div key={exp.id} className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-slate-800">{exp.description}</h4>
                  <p className="text-sm text-slate-600 mt-1">Submitted by: {submitter?.name}</p>
                </div>
                <span className="bg-yellow-100 text-yellow-700 text-xs px-3 py-1 rounded-full font-medium">
                  Pending
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Category:</span>
                  <span className="font-medium text-slate-800">{exp.category}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Amount:</span>
                  <span className="font-semibold text-slate-800">{exp.amount} {exp.currency}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Date:</span>
                  <span className="font-medium text-slate-800">{new Date(exp.date).toLocaleDateString()}</span>
                </div>
              </div>

              <textarea
                value={selectedExpense === exp.id ? comments : ''}
                onChange={(e) => {
                  setSelectedExpense(exp.id);
                  setComments(e.target.value);
                }}
                placeholder="Add comments (optional)"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition mb-4"
                rows="2"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => handleAction(exp.id, 'Approve')}
                  className="flex-1 bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600 transition flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </button>
                <button
                  onClick={() => handleAction(exp.id, 'Reject')}
                  className="flex-1 bg-red-500 text-white py-2 rounded-lg font-semibold hover:bg-red-600 transition flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {pendingExpenses.length === 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-12 text-center">
          <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-800 mb-2">No Pending Approvals</h3>
          <p className="text-slate-600">All expenses have been reviewed</p>
        </div>
      )}
    </div>
  );
}

// Manage Users Component
function ManageUsers({ users, createUser, currentUser }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Employee',
    managerId: ''
  });

  const companyUsers = users.filter(u => u.companyId === currentUser.companyId);
  const managers = companyUsers.filter(u => u.role === 'Manager' || u.role === 'Admin');

  const handleSubmit = (e) => {
    e.preventDefault();
    createUser(formData);
    setShowForm(false);
    setFormData({ name: '', email: '', role: 'Employee', managerId: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-slate-800">Team Members</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition shadow-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add User
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <h4 className="text-lg font-semibold text-slate-800 mb-4">Create New User</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                >
                  <option value="Employee">Employee</option>
                  <option value="Manager">Manager</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Manager</label>
                <select
                  value={formData.managerId}
                  onChange={(e) => setFormData({...formData, managerId: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                >
                  <option value="">No Manager</option>
                  {managers.map(mgr => (
                    <option key={mgr.id} value={mgr.id}>{mgr.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition"
              >
                Create User
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 bg-slate-200 text-slate-700 py-2 rounded-lg font-semibold hover:bg-slate-300 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase">Manager</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {companyUsers.map(user => {
              const manager = users.find(u => u.id === user.managerId);
              return (
                <tr key={user.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 text-sm font-medium text-slate-800">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      user.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                      user.role === 'Manager' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {manager ? manager.name : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Approval Rules Component
function ApprovalRules({ approvalRules, setApprovalRules, currentUser, users }) {
  const [showForm, setShowForm] = useState(false);
  const [ruleType, setRuleType] = useState('sequential');
  const [selectedApprovers, setSelectedApprovers] = useState([]);
  const [percentageRule, setPercentageRule] = useState(50);
  const [specificApprover, setSpecificApprover] = useState('');

  const companyUsers = users.filter(u => 
    u.companyId === currentUser.companyId && 
    (u.role === 'Manager' || u.role === 'Admin')
  );

  const handleCreateRule = () => {
    const newRule = {
      id: Date.now(),
      companyId: currentUser.companyId,
      type: ruleType,
      approvers: selectedApprovers,
      percentageRequired: percentageRule,
      specificApproverId: specificApprover
    };
    setApprovalRules([...approvalRules, newRule]);
    setShowForm(false);
    setSelectedApprovers([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-slate-800">Approval Rules</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition shadow-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Rule
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
          <h4 className="text-lg font-semibold text-slate-800 mb-4">Create Approval Rule</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Rule Type</label>
              <select
                value={ruleType}
                onChange={(e) => setRuleType(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              >
                <option value="sequential">Sequential Approval</option>
                <option value="percentage">Percentage Based</option>
                <option value="specific">Specific Approver</option>
                <option value="hybrid">Hybrid (Percentage OR Specific)</option>
              </select>
            </div>

            {(ruleType === 'sequential' || ruleType === 'percentage' || ruleType === 'hybrid') && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Select Approvers</label>
                <div className="space-y-2">
                  {companyUsers.map(user => (
                    <label key={user.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition">
                      <input
                        type="checkbox"
                        checked={selectedApprovers.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedApprovers([...selectedApprovers, user.id]);
                          } else {
                            setSelectedApprovers(selectedApprovers.filter(id => id !== user.id));
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="font-medium text-slate-800">{user.name}</span>
                      <span className="text-sm text-slate-600">({user.role})</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {(ruleType === 'percentage' || ruleType === 'hybrid') && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Percentage Required: {percentageRule}%
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={percentageRule}
                  onChange={(e) => setPercentageRule(e.target.value)}
                  className="w-full"
                />
              </div>
            )}

            {(ruleType === 'specific' || ruleType === 'hybrid') && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Specific Approver (Auto-approve)</label>
                <select
                  value={specificApprover}
                  onChange={(e) => setSpecificApprover(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                >
                  <option value="">Select Approver</option>
                  {companyUsers.map(user => (
                    <option key={user.id} value={user.id}>{user.name} ({user.role})</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleCreateRule}
                className="flex-1 bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition"
              >
                Create Rule
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 bg-slate-200 text-slate-700 py-2 rounded-lg font-semibold hover:bg-slate-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6">
        {approvalRules.filter(r => r.companyId === currentUser.companyId).map(rule => (
          <div key={rule.id} className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="text-lg font-semibold text-slate-800 capitalize">{rule.type} Rule</h4>
                <p className="text-sm text-slate-600 mt-1">
                  {rule.type === 'sequential' && 'Sequential approval flow'}
                  {rule.type === 'percentage' && `${rule.percentageRequired}% approval required`}
                  {rule.type === 'specific' && 'Auto-approve by specific user'}
                  {rule.type === 'hybrid' && `${rule.percentageRequired}% OR specific approver`}
                </p>
              </div>
              <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-medium">
                Active
              </span>
            </div>
            {rule.approvers && rule.approvers.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {rule.approvers.map((approverId, idx) => {
                  const approver = users.find(u => u.id === approverId);
                  return approver ? (
                    <span key={idx} className="bg-slate-100 text-slate-700 text-sm px-3 py-1 rounded-full">
                      {idx + 1}. {approver.name}
                    </span>
                  ) : null;
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Reports Component
function Reports({ expenses, users, currentCompany }) {
  const totalExpenses = expenses.filter(e => e.status === 'Approved').reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const pendingExpenses = expenses.filter(e => e.status === 'Pending').length;
  const approvedCount = expenses.filter(e => e.status === 'Approved').length;
  const rejectedCount = expenses.filter(e => e.status === 'Rejected').length;

  const categoryData = expenses.reduce((acc, exp) => {
    if (exp.status === 'Approved') {
      acc[exp.category] = (acc[exp.category] || 0) + parseFloat(exp.amount);
    }
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <p className="text-green-100 text-sm font-medium">Total Approved</p>
          <p className="text-3xl font-bold mt-2">{totalExpenses.toFixed(2)} {currentCompany?.currency}</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white shadow-lg">
          <p className="text-yellow-100 text-sm font-medium">Pending Review</p>
          <p className="text-3xl font-bold mt-2">{pendingExpenses}</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
          <p className="text-red-100 text-sm font-medium">Rejected</p>
          <p className="text-3xl font-bold mt-2">{rejectedCount}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Expenses by Category</h3>
        <div className="space-y-4">
          {Object.entries(categoryData).map(([category, amount]) => {
            const percentage = (amount / totalExpenses) * 100;
            return (
              <div key={category}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-slate-800">{category}</span>
                  <span className="text-slate-600">{amount.toFixed(2)} {currentCompany?.currency}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}