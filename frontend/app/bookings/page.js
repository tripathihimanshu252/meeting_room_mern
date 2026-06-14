'use client';
import { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

export default function BookingsDashboard() {
  const [email, setEmail] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Email ke basis par bookings fetch karne ka function
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Hit directly to live production Render link
      const res = await axios.get(`https://meeting-room-mern.onrender.com/api/bookings?email=${email}`);
      
      // Grouping consecutive slots by bookingGroupId for clean UI
      const grouped = {};
      res.data.forEach(b => {
        if (!grouped[b.bookingGroupId]) {
          grouped[b.bookingGroupId] = {
            ...b,
            slots: [b.slot]
          };
        } else {
          grouped[b.bookingGroupId].slots.push(b.slot);
        }
      });

      setBookings(Object.values(grouped));
    } catch (err) {
      console.error("Dashboard Fetch Error, retrying live endpoint...", err);
      try {
        // Safe backup retry to clean production link
        const retryRes = await axios.get(`https://meeting-room-mern.onrender.com/api/bookings?email=${email}`);
        const groupedRetry = {};
        retryRes.data.forEach(b => {
          if (!groupedRetry[b.bookingGroupId]) {
            groupedRetry[b.bookingGroupId] = { ...b, slots: [b.slot] };
          } else {
            groupedRetry[b.bookingGroupId].slots.push(b.slot);
          }
        });
        setBookings(Object.values(groupedRetry));
      } catch (retryErr) {
        console.error("Final pipeline failure:", retryErr);
        setMessage({ type: 'error', text: 'Bookings fetch karne me dikkat aayi.' });
      }
    } finally {
      setLoading(false);
    }
  };

  // Booking Cancel karne ka function
  const handleCancel = async (groupId) => {
    const confirmCancel = window.confirm("Kya aap sach me yeh booking cancel karna chahte hain?");
    if (!confirmCancel) return;

    try {
      // Patched directly using live production architecture URL
      const res = await axios.patch(`https://meeting-room-mern.onrender.com/api/bookings/${groupId}/cancel`);

      setMessage({ 
        type: 'success', 
        text: `Booking cancel ho gayi! Refund status: ${res.data.status === 'cancelled-refundable' ? 'Refundable (Full Refund)' : 'Non-Refundable (No Refund)'}` 
      });
      
      // List ko refresh karo
      const fakeEvent = { preventDefault: () => {} };
      handleSearch(fakeEvent);
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Cancellation fail ho gayi.";
      setMessage({ type: 'error', text: errorMsg });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <header className="flex justify-between items-center mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-indigo-600">My Bookings Dashboard</h1>
        <Link href="/" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">
          ← Back to Rooms
        </Link>
      </header>

      {/* Search Bar Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
        <form onSubmit={handleSearch} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Enter Your Email to Lookup:</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="chotu@gmail.com"
              className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button type="submit" className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition shadow-sm">
            Search Bookings
          </button>
        </form>
      </div>

      {message.text && (
        <div className={`p-4 rounded-lg mb-6 text-sm font-medium border ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Bookings List Display */}
      {loading ? (
        <div className="text-center py-10 text-indigo-600 animate-pulse">Bookings dhoondh rahe hain...</div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-10 text-gray-500 bg-white rounded-xl border border-dashed">Koi active bookings nahi mili is email par.</div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b.bookingGroupId} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center">
              <div>
                <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold mb-2 ${
                  b.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-600 border border-gray-200'
                }`}>
                  {b.status.toUpperCase()}
                </span>
                <h3 className="text-lg font-bold text-gray-900">{b.title}</h3>
                <p className="text-sm text-gray-600 mt-1">🏢 Room: <span className="font-semibold">{b.room?.name || 'Meeting Room'}</span></p>
                <p className="text-sm text-gray-600">📅 Date: {b.date}</p>
                <p className="text-sm text-gray-600">⏰ Slots: <span className="font-mono bg-gray-50 px-1.5 py-0.5 rounded border">{b.slots.join(', ')}</span></p>
              </div>

              {b.status === 'confirmed' && (
                <button 
                  onClick={() => handleCancel(b.bookingGroupId)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-red-600 transition shadow-sm"
                >
                  Cancel Booking
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}