'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

export default function Home() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Direct Live Cloud Backend Call (Removed all localhost instances)
    axios.get('https://meeting-room-mern.onrender.com/api/rooms')
      .then(res => {
        setRooms(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Primary fetch error, retrying cloud endpoint...", err);
        // Secure retry strategy hitting the live server again
        axios.get('https://meeting-room-mern.onrender.com/api/rooms')
          .then(res => {
            setRooms(res.data);
            setLoading(false);
          })
          .catch(fallbackErr => {
            console.error("Final network stack failure:", fallbackErr);
            setLoading(false);
          });
      });
  }, []);

  const filteredRooms = rooms.filter(room => 
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-indigo-600 font-semibold animate-pulse">Loading Advanced Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <h1 className="text-2xl font-black bg-gradient-to-r bg-clip-text text-transparent from-indigo-600 to-violet-600 tracking-tight">RoomIt Pro</h1>
          </div>
          <Link href="/bookings" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-xl shadow-md shadow-indigo-100 transition-all transform hover:-translate-y-0.5">
            📋 My Bookings Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 mt-8">
        {/* Live Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Live Rooms</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">{rooms.length} Rooms</h3>
            </div>
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-xl text-indigo-600">🏢</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">System Status</p>
              <h3 className="text-3xl font-bold text-emerald-600 mt-1">Operational</h3>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-xl text-emerald-600">🟢</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Concurrency Layer</p>
              <h3 className="text-3xl font-bold text-violet-600 mt-1">Active (Index)</h3>
            </div>
            <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center text-xl text-violet-600">🔒</div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Select a Workspace</h2>
            <p className="text-sm text-slate-500 mt-0.5">Click to check dynamic 30-minute availability slots</p>
          </div>
          <div className="relative w-full md:w-80">
            <input 
              type="text" 
              placeholder="Search room name or floor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm shadow-sm transition-all"
            />
          </div>
        </div>
        
        {/* Rooms Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredRooms.map(room => (
            <div key={room._id} className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden flex flex-col justify-between hover:shadow-lg hover:border-slate-300/80 transition-all duration-300 group">
              <div className="p-6">
                <div className="w-full h-36 bg-gradient-to-br from-indigo-50 to-slate-50 rounded-xl mb-4 flex items-center justify-center text-5xl group-hover:scale-105 transition-all duration-300">
                  🏢
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{room.name}</h3>
                <div className="mt-3 space-y-1.5 text-slate-600 text-xs font-medium">
                  <p className="flex items-center gap-1.5">📍 <span className="text-slate-500">Floor:</span> {room.location}</p>
                  <p className="flex items-center gap-1.5">👥 <span className="text-slate-500">Capacity:</span> {room.capacity} Seats</p>
                </div>
              </div>
              
              <div className="px-6 pb-6">
                <Link href={`/rooms/${room._id}`} className="block text-center bg-slate-900 hover:bg-indigo-600 text-white py-3 rounded-xl text-xs font-bold tracking-wide transition-all shadow-sm shadow-slate-900/10 hover:shadow-indigo-600/20">
                  EXPLORE AVAILABILITY GRID
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}