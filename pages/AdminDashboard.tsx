import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc, orderBy } from 'firebase/firestore';
import { Reservation, Order, OrderStatus } from '../types';
import { TIME_SLOTS, RESTAURANT_TABLES } from '../constants';
import { Calendar, Clock, Users, Trash2, Edit2, Check, X, Search, Phone, ShoppingBag } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'reservations' | 'orders'>('reservations');

  // Reservation State
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTable, setEditTable] = useState<number>(0);
  const [editTime, setEditTime] = useState<string>('');
  const [editSize, setEditSize] = useState<number>(0);

  // Order State
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // --- Reservation Logic ---
  const fetchReservations = async () => {
    if (!isAdmin) return;
    setLoadingReservations(true);
    try {
      const q = query(
        collection(db, 'reservations'),
        where('date', '==', selectedDate)
      );

      const querySnapshot = await getDocs(q);
      const resList = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Reservation));

      resList.sort((a, b) => {
        const timeA = parseInt(a.timeSlot.replace(':', ''));
        const timeB = parseInt(b.timeSlot.replace(':', ''));
        return timeA - timeB;
      });

      setReservations(resList);
    } catch (err) {
      console.error("Error fetching reservations", err);
    } finally {
      setLoadingReservations(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'reservations') {
      fetchReservations();
    }
  }, [selectedDate, isAdmin, activeTab]);

  const handleDeleteReservation = async (id: string) => {
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

  // --- Order Logic ---
  const fetchOrders = async () => {
    if (!isAdmin) return;
    setLoadingOrders(true);
    try {
      // Fetch all orders, sorted by creation time (newest first)
      // Note: Requires index in Firestore. If fails, remove orderBy or create index.
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));

      const querySnapshot = await getDocs(q);
      const orderList = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order));

      setOrders(orderList);
    } catch (err) {
      console.error("Error fetching orders", err);
      // Fallback without sorting if index missing
      try {
        const q = query(collection(db, 'orders'));
        const querySnapshot = await getDocs(q);
        const orderList = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order));
        // Manual sort
        orderList.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
        setOrders(orderList);
      } catch (e) {
        console.error("Fallback fetch failed", e);
      }
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [isAdmin, activeTab]);

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      fetchOrders();
    } catch (e) {
      console.error("Error updating order status", e);
      alert("Fehler beim Aktualisieren des Status.");
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'Ausstehend';
      case 'preparing': return 'In Zubereitung';
      case 'ready': return 'Abholbereit';
      case 'completed': return 'Abgeschlossen';
      case 'cancelled': return 'Storniert';
      default: return status;
    }
  };

  if (!isAdmin) return <div className="p-8 text-center text-red-600 font-bold">Zugriff verweigert. Nur für Administratoren.</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500">Verwaltung des Restaurants</p>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('reservations')}
              className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center ${activeTab === 'reservations' ? 'bg-italian-green text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Reservierungen
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center ${activeTab === 'orders' ? 'bg-italian-green text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Bestellungen
            </button>
          </div>
        </div>

        {activeTab === 'reservations' ? (
          <>
            {/* Date Picker for Reservations */}
            <div className="flex justify-end mb-6">
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

            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Reservierungsliste ({selectedDate})</h2>
              </div>

              {loadingReservations ? (
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zeit</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tisch</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gast</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kontakt</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pers.</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aktionen</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reservations.map((res) => {
                        const isEditing = editingId === res.id;
                        return (
                          <tr key={res.id} className={isEditing ? 'bg-yellow-50' : 'hover:bg-gray-50'}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {isEditing ? (
                                <select value={editTime} onChange={e => setEditTime(e.target.value)} className="p-1 border rounded text-sm w-24">
                                  {TIME_SLOTS.map(t => <option key={t.id} value={t.time}>{t.time}</option>)}
                                </select>
                              ) : (
                                <div className="flex items-center text-gray-900 font-medium"><Clock className="w-4 h-4 mr-2 text-gray-400" />{res.timeSlot}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {isEditing ? (
                                <select value={editTable} onChange={e => setEditTable(Number(e.target.value))} className="p-1 border rounded text-sm w-16">
                                  {RESTAURANT_TABLES.map(t => <option key={t.id} value={t.tableNumber}>{t.tableNumber}</option>)}
                                </select>
                              ) : (
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Tisch {res.tableNumber}</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{res.userName}</div>
                              <div className="text-sm text-gray-500">{res.userEmail}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center"><Phone className="w-3 h-3 mr-1" />{res.phoneNumber || '-'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {isEditing ? (
                                <input type="number" min="1" max="10" value={editSize} onChange={e => setEditSize(Number(e.target.value))} className="p-1 border rounded w-16 text-sm" />
                              ) : (
                                <div className="flex items-center"><Users className="w-4 h-4 mr-1 text-gray-400" />{res.partySize}</div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              {isEditing ? (
                                <div className="flex justify-end space-x-2">
                                  <button onClick={() => res.id && saveEdit(res.id)} className="text-green-600 hover:text-green-900 p-1"><Check className="w-5 h-5" /></button>
                                  <button onClick={() => setEditingId(null)} className="text-red-600 hover:text-red-900 p-1"><X className="w-5 h-5" /></button>
                                </div>
                              ) : (
                                <div className="flex justify-end space-x-3">
                                  <button onClick={() => startEdit(res)} className="text-blue-600 hover:text-blue-900"><Edit2 className="w-4 h-4" /></button>
                                  <button onClick={() => res.id && handleDeleteReservation(res.id)} className="text-red-600 hover:text-red-900"><Trash2 className="w-4 h-4" /></button>
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
          </>
        ) : (
          /* --- Orders View --- */
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Bestellungen</h2>
              <button onClick={fetchOrders} className="text-sm text-italian-green hover:underline">Aktualisieren</button>
            </div>

            {loadingOrders ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-italian-green mx-auto mb-4"></div>
                <p className="text-gray-500">Lade Bestellungen...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="p-12 text-center">
                <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Keine Bestellungen gefunden.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {orders.map(order => (
                  <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col md:flex-row justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-3 mb-1">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {order.createdAt?.seconds ? new Date(order.createdAt.seconds * 1000).toLocaleString() : 'Datum n/a'}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">{order.userName}</h3>
                        <div className="text-sm text-gray-600">{order.userEmail}</div>
                        <div className="flex items-center mt-2 text-italian-red font-bold">
                          <Clock className="w-4 h-4 mr-1" />
                          Abholung: {order.pickupTime} Uhr
                        </div>
                      </div>
                      <div className="mt-4 md:mt-0 text-right">
                        <div className="text-2xl font-bold text-gray-900">{order.totalAmount.toFixed(2).replace('.', ',')} €</div>
                        <div className="text-sm text-gray-500">{order.items.length} Artikel</div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-md p-4 mb-4">
                      <ul className="space-y-2">
                        {order.items.map((item, idx) => (
                          <li key={idx} className="flex justify-between text-sm">
                            <span className="text-gray-800"><span className="font-bold">{item.quantity}x</span> {item.name}</span>
                            <span className="text-gray-600">{item.price}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-end">
                      {order.status === 'pending' && (
                        <button onClick={() => order.id && updateOrderStatus(order.id, 'preparing')} className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                          In Zubereitung
                        </button>
                      )}
                      {order.status === 'preparing' && (
                        <button onClick={() => order.id && updateOrderStatus(order.id, 'ready')} className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                          Abholbereit
                        </button>
                      )}
                      {order.status === 'ready' && (
                        <button onClick={() => order.id && updateOrderStatus(order.id, 'completed')} className="px-3 py-1 bg-gray-800 text-white rounded text-sm hover:bg-gray-900">
                          Abschließen
                        </button>
                      )}
                      {order.status !== 'cancelled' && order.status !== 'completed' && (
                        <button onClick={() => order.id && updateOrderStatus(order.id, 'cancelled')} className="px-3 py-1 border border-red-200 text-red-600 rounded text-sm hover:bg-red-50">
                          Stornieren
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};