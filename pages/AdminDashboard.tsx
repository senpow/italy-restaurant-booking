import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Reservation } from '../types';
import { TIME_SLOTS, RESTAURANT_TABLES } from '../constants';
import { Calendar, Clock, Users, Trash2, Edit2, Check, X, Search, Phone } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { isAdmin } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Edit Form State
  const [editTable, setEditTable] = useState<number>(0);
  const [editTime, setEditTime] = useState<string>('');
  const [editSize, setEditSize] = useState<number>(0);

  const fetchReservations = async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, 'reservations'),
        where('date', '==', selectedDate)
      );
      
      const querySnapshot = await getDocs(q);
      const resList = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Reservation));
      
      // Sort by time
      resList.sort((a, b) => {
        const timeA = parseInt(a.timeSlot.replace(':', ''));
        const timeB = parseInt(b.timeSlot.replace(':', ''));
        return timeA - timeB;
      });
      
      setReservations(resList);
    } catch (err) {
      console.error("Error fetching reservations", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, isAdmin]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Möchten Sie diese Reservierung wirklich als Admin löschen?")) {
       try {
         await deleteDoc(doc(db, 'reservations', id));
         fetchReservations();
       } catch (e) {
         console.error(e);
         alert("Fehler beim Löschen.");
       }
    }
  };

  const startEdit = (res: Reservation) => {
    setEditingId(res.id || null);
    setEditTable(res.tableNumber);
    setEditTime(res.timeSlot);
    setEditSize(res.partySize);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id: string) => {
    try {
      await updateDoc(doc(db, 'reservations', id), {
        tableNumber: editTable,
        timeSlot: editTime,
        partySize: editSize
      });
      setEditingId(null);
      fetchReservations();
    } catch (e) {
      console.error(e);
      alert("Fehler beim Aktualisieren.");
    }
  };

  if (!isAdmin) return <div className="p-8 text-center text-red-600 font-bold">Zugriff verweigert. Nur für Administratoren.</div>;

  // Stats
  const totalGuests = reservations.reduce((acc, curr) => acc + curr.partySize, 0);
  const totalBookings = reservations.length;

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500">Verwaltung aller Reservierungen</p>
          </div>
          
          <div className="flex items-center bg-white p-2 rounded-lg shadow-sm border border-gray-300">
            <Calendar className="w-5 h-5 text-gray-500 mr-2" />
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="outline-none bg-transparent font-medium text-gray-700"
            />
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
           <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-italian-green">
              <div className="text-sm text-gray-500 mb-1">Datum</div>
              <div className="text-2xl font-bold text-gray-800">{selectedDate.split('-').reverse().join('.')}</div>
           </div>
           <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
              <div className="text-sm text-gray-500 mb-1">Reservierungen</div>
              <div className="text-2xl font-bold text-gray-800">{totalBookings}</div>
           </div>
           <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-italian-red">
              <div className="text-sm text-gray-500 mb-1">Erwartete Gäste</div>
              <div className="text-2xl font-bold text-gray-800">{totalGuests}</div>
           </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Reservierungsliste</h2>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-italian-green mx-auto mb-4"></div>
              <p className="text-gray-500">Lade Daten...</p>
            </div>
          ) : reservations.length === 0 ? (
             <div className="p-12 text-center">
               <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
               <p className="text-gray-500">Keine Reservierungen für diesen Tag gefunden.</p>
             </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zeit</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tisch</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gast</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kontakt</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pers.</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aktionen</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reservations.map((res) => {
                    const isEditing = editingId === res.id;

                    return (
                      <tr key={res.id} className={isEditing ? 'bg-yellow-50' : 'hover:bg-gray-50'}>
                        {/* Time Column */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isEditing ? (
                             <select 
                               value={editTime} 
                               onChange={e => setEditTime(e.target.value)}
                               className="p-1 border rounded text-sm w-24"
                             >
                               {TIME_SLOTS.map(t => (
                                 <option key={t.id} value={t.time}>{t.time}</option>
                               ))}
                             </select>
                          ) : (
                            <div className="flex items-center text-gray-900 font-medium">
                              <Clock className="w-4 h-4 mr-2 text-gray-400" />
                              {res.timeSlot}
                            </div>
                          )}
                        </td>

                        {/* Table Column */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isEditing ? (
                             <select 
                               value={editTable} 
                               onChange={e => setEditTable(Number(e.target.value))}
                               className="p-1 border rounded text-sm w-16"
                             >
                               {RESTAURANT_TABLES.map(t => (
                                 <option key={t.id} value={t.tableNumber}>{t.tableNumber}</option>
                               ))}
                             </select>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Tisch {res.tableNumber}
                            </span>
                          )}
                        </td>

                        {/* Guest Name */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{res.userName}</div>
                          <div className="text-sm text-gray-500">{res.userEmail}</div>
                        </td>

                         {/* Contact */}
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                           <div className="flex items-center">
                             <Phone className="w-3 h-3 mr-1" />
                             {res.phoneNumber || '-'}
                           </div>
                        </td>

                        {/* Party Size */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {isEditing ? (
                             <input 
                               type="number" 
                               min="1" max="10" 
                               value={editSize} 
                               onChange={e => setEditSize(Number(e.target.value))}
                               className="p-1 border rounded w-16 text-sm"
                             />
                          ) : (
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-1 text-gray-400" />
                              {res.partySize}
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {isEditing ? (
                            <div className="flex justify-end space-x-2">
                              <button onClick={() => res.id && saveEdit(res.id)} className="text-green-600 hover:text-green-900 p-1">
                                <Check className="w-5 h-5" />
                              </button>
                              <button onClick={cancelEdit} className="text-red-600 hover:text-red-900 p-1">
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex justify-end space-x-3">
                              <button onClick={() => startEdit(res)} className="text-blue-600 hover:text-blue-900 flex items-center">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => res.id && handleDelete(res.id)} className="text-red-600 hover:text-red-900 flex items-center">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};