import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ThemedModal from '../components/ThemedModal'; // Ensure ThemedModal is explicitly imported

interface AccountDetail {
  id: number;
  accountName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
}

const AccountDetailsPage: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [accountDetails, setAccountDetails] = useState<AccountDetail[]>([]);
  const [form, setForm] = useState({
    accountName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalOnConfirm, setModalOnConfirm] = useState<(() => void) | undefined>(undefined);
  const [showConfirmButton, setShowConfirmButton] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    fetchAccountDetails();
  }, []);

  const fetchAccountDetails = async () => {
    setError(null); // Clear any previous errors
    try {
      const response = await fetch('http://localhost:5001/admin/accounts');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setAccountDetails(data);
    } catch (err) {
      console.error('Error fetching account details:', err);
      setError('Failed to fetch account details. Please try again later.'); // More specific error for actual failures
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      if (editingId) {
        await axios.put(`http://localhost:5001/admin/accounts/${editingId}`, form);
        setSuccess('Account details updated successfully!');
      } else {
        await axios.post('http://localhost:5001/admin/accounts', form);
        setSuccess('Account details added successfully!');
      }
      setForm({ accountName: '', bankName: '', accountNumber: '', ifscCode: '' });
      setEditingId(null);
      fetchAccountDetails();
    } catch (err) {
      console.error('Error submitting account details:', err);
      setError('Failed to save account details.');
    }
  };

  const handleEdit = (account: AccountDetail) => {
    setForm({ accountName: account.accountName, bankName: account.bankName, accountNumber: account.accountNumber, ifscCode: account.ifscCode });
    setEditingId(account.id);
  };

  const handleDelete = (id: number) => {
    setModalTitle('Confirm Deletion');
    setModalMessage('Are you sure you want to delete this account detail?');
    setModalOnConfirm(() => async () => {
      try {
        await axios.delete(`http://localhost:5001/admin/accounts/${id}`);
        setSuccess('Account details deleted successfully!');
        fetchAccountDetails();
        setIsModalOpen(false); // Close modal after successful deletion
      } catch (err) {
        console.error('Error deleting account details:', err);
        setError('Failed to delete account details.');
        setIsModalOpen(false); // Close modal even on error
      }
    });
    setShowConfirmButton(true);
    setIsModalOpen(true);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Manage Account Details</h1>

      {error && <div className="bg-red-500 p-3 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-500 p-3 rounded mb-4">{success}</div>}

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">{editingId ? 'Edit Account Detail' : 'Add New Account Detail'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="accountName" className="block text-sm font-medium text-gray-300">Account Name</label>
            <input
              type="text"
              id="accountName"
              name="accountName"
              value={form.accountName}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white"
              required
            />
          </div>
          <div>
            <label htmlFor="bankName" className="block text-sm font-medium text-gray-300">Bank Name</label>
            <input
              type="text"
              id="bankName"
              name="bankName"
              value={form.bankName}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white"
              required
            />
          </div>
          <div>
            <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-300">Account Number</label>
            <input
              type="text"
              id="accountNumber"
              name="accountNumber"
              value={form.accountNumber}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white"
              required
            />
          </div>
          <div>
            <label htmlFor="ifscCode" className="block text-sm font-medium text-gray-300">IFSC Code</label>
            <input
              type="text"
              id="ifscCode"
              name="ifscCode"
              value={form.ifscCode}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-white"
              required
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            {editingId ? 'Update Account' : 'Add Account'}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => { setEditingId(null); setForm({ accountName: '', bankName: '', accountNumber: '', ifscCode: '' }); }}
              className="ml-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
            >
              Cancel
            </button>
          )}
        </form>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Existing Account Details</h2>
        {accountDetails.length === 0 ? (
          <p>No account details added yet.</p>
        ) : (
          <ul className="space-y-4">
            {accountDetails.map((account) => (
              <li key={account.id} className="bg-gray-700 p-4 rounded-md flex justify-between items-center">
                <div>
                  <p className="font-semibold">{account.accountName} ({account.bankName})</p>
                  <p className="text-sm text-gray-300">Account No: {account.accountNumber}</p>
                  <p className="text-sm text-gray-300">IFSC: {account.ifscCode}</p>
                </div>
                <div>
                  <button
                    onClick={() => handleEdit(account)}
                    className="px-3 py-1 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(account.id)}
                    className="ml-2 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition text-sm"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ThemedModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
        message={modalMessage}
        onConfirm={modalOnConfirm}
        showConfirmButton={showConfirmButton}
      />
    </div>
  );
};

export default AccountDetailsPage;
