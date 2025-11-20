import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { Reservation } from '../types';
import { Calendar, Clock, Users, Trash2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReservations = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      // Note: Composite index might be needed for 'userId' + 'date' sorting
      const q = query(
        collection(db, 'reservations'),
        where('userId', '==', currentUser.uid)
      );
      
      const querySnapshot = await getDocs(q);
      const resList = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Reservation));
      
      // Client side sort because Firestore indexes can be tricky to setup immediately via code
      resList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
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
  }, [currentUser]);

  const handleCancel = async (id: string, dateStr: string) => {
    const reservationDate = new Date(dateStr);
    const now = new Date();
    const diffTime = reservationDate.getTime() - now.getTime();
    const diffHours = diffTime / (1000 * 3600);

    if (diffHours < 24) {
      alert("Stornierungen sind nur bis 24 Stunden vor dem Termin möglich. Bitte rufen Sie uns an.");
      return;
    }

    if (window.confirm("Möchten Sie diese Reservierung wirklich stornieren?")) {
       try {
         await deleteDoc(doc(db, 'reservations', id));
         fetchReservations();
       } catch (e) {
         console.error(e);
         alert("Fehler beim Stornieren.");
       }
    }
  };

  if (!currentUser) return <div className="p-8 text-center">Bitte melden Sie sich an.</div>;

  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-italian-dark">Hallo, {currentUser.displayName || 'Gast'}</h1>
          <Link to="/reservation" className="bg-italian-red text-white px-4 py-2 rounded-md hover:bg-red-700 transition text-sm font-bold">
            Neue Reservierung
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-italian-cream">
            <h2 className="text-xl font-bold text-gray-800">Ihre Reservierungen</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">Laden...</div>
          ) : reservations.length === 0 ? (
             <div className="p-12 text-center">
               <p className="text-gray-500 mb-4">Sie haben noch keine Reservierungen.</p>
               <Link to="/reservation" className="text-italian-green font-bold hover:underline">Jetzt reservieren</Link>
             </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {reservations.map((res) => (
                <li key={res.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center text-lg font-bold text-italian-green mb-1">
                        <Calendar className="w-5 h-5 mr-2" />
                        {res.date.split('-').reverse().join('.')}
                      </div>
                      <div className="flex items-center text-gray-600 space-x-4">
                        <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> {res.timeSlot} Uhr</span>
                        <span className="flex items-center"><Users className="w-4 h-4 mr-1" /> {res.partySize} Pers.</span>
                        <span className="text-sm bg-gray-200 px-2 py-0.5 rounded">Tisch {res.tableNumber}</span>
                      </div>
                    </div>
                    
                    <div>
                       <button 
                         onClick={() => res.id && handleCancel(res.id, res.date)}
                         className="text-red-600 hover:text-red-800 text-sm flex items-center border border-red-200 px-3 py-2 rounded hover:bg-red-50 transition"
                       >
                         <Trash2 className="w-4 h-4 mr-1" /> Stornieren
                       </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="mt-6 flex items-start p-4 bg-blue-50 text-blue-800 rounded-md text-sm">
           <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
           <p>
             Hinweis: Stornierungen sind online nur bis 24 Stunden vor dem Termin möglich. 
             Für kurzfristige Änderungen kontaktieren Sie uns bitte telefonisch unter +49 30 123456.
           </p>
        </div>
      </div>
    </div>
  );
};
