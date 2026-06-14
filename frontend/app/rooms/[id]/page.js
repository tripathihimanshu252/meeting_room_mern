'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

export default function RoomAvailability() {
  const { id } = useParams();
  const [slots, setSlots] = useState([]);
  const [allRooms, setAllRooms] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [date, setDate] = useState("2026-06-16"); // Direct target clean testing date axis
  const [loading, setLoading] = useState(true);
  
  // Form hooks fields
  const [name, setName] = useState('Himanshu Tripathi');
  const [email, setEmail] = useState('himanshu@gmail.com');
  const [title, setTitle] = useState('MERN Interview Prep');
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      // Clean Production Live URL Integration
      const res = await axios.get(`https://meeting-room-mern.onrender.com/api/rooms/${id}/availability?date=${date}`);
      setSlots(res.data.slots || []);

      const roomsRes = await axios.get('https://meeting-room-mern.onrender.com/api/rooms');
      if (roomsRes && roomsRes.data) {
        setAllRooms(roomsRes.data.filter(r => r._id !== id));
      }
      setSelectedSlots([]);
    } catch (err) {
      console.error("Fetch network stack error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id, date]);

  const handleSlotClick = (slotTime, isAvailable) => {
    if (!isAvailable) return;
    if (selectedSlots.includes(slotTime)) {
      setSelectedSlots(selectedSlots.filter(s => s !== slotTime));
    } else {
      setSelectedSlots([...selectedSlots, slotTime]);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSlots.length) {
      setMessage({ type: 'error', text: 'Kam se kam ek timeline slot select karein!' });
      return;
    }

    try {
      const payload = { room: id, date, slots: selectedSlots, bookedBy: { name, email }, title };
      
      // Post requests directly hitting live Render cloud backend
      await axios.post('https://meeting-room-mern.onrender.com/api/bookings', payload);

      setMessage({ type: 'success', text: 'Booking successful! Grid updated live. 🎉' });
      setSelectedSlots([]);
      fetchData(); // Instantly triggers and turns slots Red!
    } catch (err) {
      const errorResponse = err.response?.data?.error || "Booking fail ho gayi.";
      setMessage({ type: 'error', text: errorResponse });
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-6">
        <Link href="/" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1 mb-4">
          ← Back to Rooms Hub
        </Link>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-8">Advanced Room Booking Layer</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Target Date Axis</label>
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700"
              />

              <div className="flex items-center justify-between mt-6 mb-4">
                <h3 className="font-bold text-slate-800 text-sm">30-Minute Timeline Matrix:</h3>
                <div className="flex gap-4 text-xs font-medium">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-white rounded border border-slate-200 block"></span> Available</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-indigo-600 rounded block"></span> Selected</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-red-50 rounded border border-red-100 block"></span> Booked</span>
                </div>
              </div>
              
              {loading ? (
                <div className="text-center py-12 text-indigo-600 font-medium animate-pulse">Syncing timeline registry...</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {slots.map((s) => {
                    const isSelected = selectedSlots.includes(s.slot);
                    return (
                      <button
                        key={s.slot}
                        type="button"
                        onClick={() => handleSlotClick(s.slot, s.isAvailable)}
                        className={`p-3 text-xs font-bold rounded-xl border text-center transition-all ${
                          !s.isAvailable 
                            ? 'bg-red-50 border-red-100 text-red-400 cursor-not-allowed opacity-75' 
                            : isSelected
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-md'
                              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        {s.slot}
                        <div className={`text-[9px] font-medium mt-0.5 opacity-70 ${isSelected ? 'text-indigo-100' : ''}`}>
                          {s.isAvailable ? 'Available' : 'Unavailable'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Booking Side Panel Grid Layout */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 h-fit">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Booking Gateway</h3>
            
            {message.text && (
              <div className={`p-3 rounded-xl mb-4 text-xs font-semibold border ${
                message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
              }`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Your Name</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none" />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Your Email</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none" />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Meeting Title</label>
                <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none" />
              </div>
              
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                <span className="font-bold text-slate-700 block">Queue Pipeline Stack:</span>
                <p className="mt-1 font-mono text-indigo-600 font-bold overflow-x-auto whitespace-nowrap">{selectedSlots.length ? selectedSlots.join(', ') : 'Empty Pipeline'}</p>
              </div>

              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold text-xs tracking-wider transition-all shadow-md">
                EXECUTE TRANSACTION BOOKING
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}