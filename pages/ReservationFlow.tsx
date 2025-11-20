import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { RESTAURANT_TABLES, TIME_SLOTS } from '../constants';
import { TableMap } from '../components/TableMap';
import { Calendar, Users, Clock, Check, AlertTriangle, Loader2 } from 'lucide-react';

export const ReservationFlow: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Step State
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  
  // Form Data
  const [date, setDate] = useState('');
  const [partySize, setPartySize] = useState(2);
  const [timeSlotId, setTimeSlotId] = useState('');
  const [selectedTableNum, setSelectedTableNum] = useState<number | null>(null);
  const [contactPhone, setContactPhone] = useState('');

  // Data Fetching State
  const [bookedTableNumbers, setBookedTableNumbers] = useState<number[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Helper to get current date YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];

  // Effect: Check availability when Date or Time changes
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!date || !timeSlotId) return;

      setLoadingAvailability(true);
      setBookedTableNumbers([]); // Reset
      setSelectedTableNum(null); // Reset selection on time change

      try {
        const timeString = TIME_SLOTS.find(ts => ts.id === timeSlotId)?.time;
        if (!timeString) return;

        // Query: Find reservations for this date and time
        // Note: In a real production app, we might check overlapping ranges, 
        // but here we assume fixed 2h slots aligned with start times for simplicity 
        // or exact match prevention.
        const q = query(
          collection(db, 'reservations'),
          where('date', '==', date),
          where('timeSlot', '==', timeString),
          where('status', '==', 'confirmed')
        );

        const querySnapshot = await getDocs(q);
        const booked = querySnapshot.docs.map(doc => doc.data().tableNumber);
        setBookedTableNumbers(booked);
      } catch (err) {
        console.error("Error fetching availability:", err);
        setError("Konnte Verfügbarkeit nicht prüfen. Bitte überprüfen Sie Ihre Internetverbindung.");
      } finally {
        setLoadingAvailability(false);
      }
    };

    fetchAvailability();
  }, [date, timeSlotId]);

  const handleTimeSelect = (id: string) => {
    setTimeSlotId(id);
    if (step === 2) setStep(3);
  };

  const handleTableSelect = (tableNum: number) => {
    setSelectedTableNum(tableNum);
  };

  const handleSubmit = async () => {
    if (!currentUser) {
      navigate('/login?redirect=/reservation');
      return;
    }
    if (!selectedTableNum || !date || !timeSlotId) return;

    setSubmitting(true);
    setError('');

    try {
      const timeString = TIME_SLOTS.find(ts => ts.id === timeSlotId)?.time;
      
      // Final Double Check (Race Condition mitigation)
      const q = query(
        collection(db, 'reservations'),
        where('date', '==', date),
        where('timeSlot', '==', timeString),
        where('tableNumber', '==', selectedTableNum),
        where('status', '==', 'confirmed')
      );
      const checkSnap = await getDocs(q);
      
      if (!checkSnap.empty) {
        throw new Error("Dieser Tisch wurde gerade eben reserviert. Bitte wählen Sie einen anderen.");
      }

      await addDoc(collection(db, 'reservations'), {
        userId: currentUser.uid,
        userName: currentUser.displayName || "Gast",
        userEmail: currentUser.email,
        tableNumber: selectedTableNum,
        date: date,
        timeSlot: timeString,
        partySize: partySize,
        duration: 120,
        status: 'confirmed',
        createdAt: Timestamp.now(),
        phoneNumber: contactPhone
      });

      setStep(4); // Success Screen
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Reservierung fehlgeschlagen.");
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 4) {
    return (
      <div className="min-h-screen bg-stone-50 py-12 px-4">
        <div className="max-w-lg mx-auto bg-white rounded-lg shadow-xl p-8 text-center border-t-4 border-italian-green">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <Check className="h-8 w-8 text-italian-green" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-italian-dark mb-4">Grazie!</h2>
          <p className="text-lg text-gray-600 mb-8">
            Ihre Reservierung wurde bestätigt. Wir haben eine Bestätigungs-E-Mail an {currentUser?.email} gesendet.
          </p>
          <div className="bg-stone-50 p-4 rounded-md mb-8 text-left inline-block min-w-[250px]">
             <p><strong>Datum:</strong> {date.split('-').reverse().join('.')}</p>
             <p><strong>Zeit:</strong> {TIME_SLOTS.find(t => t.id === timeSlotId)?.time} Uhr</p>
             <p><strong>Tisch:</strong> Nr. {selectedTableNum}</p>
             <p><strong>Personen:</strong> {partySize}</p>
          </div>
          <div>
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-full bg-italian-green text-white font-bold py-3 px-6 rounded-md hover:bg-green-700 transition"
            >
              Meine Reservierungen ansehen
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-italian-dark mb-2">Tisch reservieren</h1>
          <p className="text-gray-500">Sichern Sie sich Ihren Platz in der Trattoria Bella Vista</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-2 text-sm">
            <span className={`flex items-center justify-center w-8 h-8 rounded-full border-2 font-bold ${step >= 1 ? 'bg-italian-red border-italian-red text-white' : 'border-gray-300 text-gray-400'}`}>1</span>
            <span className="hidden md:inline text-gray-600">Daten</span>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <span className={`flex items-center justify-center w-8 h-8 rounded-full border-2 font-bold ${step >= 2 ? 'bg-italian-red border-italian-red text-white' : 'border-gray-300 text-gray-400'}`}>2</span>
            <span className="hidden md:inline text-gray-600">Zeit</span>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <span className={`flex items-center justify-center w-8 h-8 rounded-full border-2 font-bold ${step >= 3 ? 'bg-italian-red border-italian-red text-white' : 'border-gray-300 text-gray-400'}`}>3</span>
            <span className="hidden md:inline text-gray-600">Tisch</span>
          </div>
        </div>

        {/* Validation Error */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 flex items-center">
            <AlertTriangle className="text-red-500 mr-3" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="p-6 md:p-8">
            
            {/* STEP 1: Date & People */}
            <div className={`${step !== 1 ? 'hidden' : 'block'} space-y-6`}>
              <h2 className="text-2xl font-serif font-bold text-italian-green flex items-center">
                <Calendar className="mr-2" /> Wählen Sie Datum & Personen
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Datum</label>
                  <input 
                    type="date" 
                    min={today}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-italian-green focus:border-italian-green"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Personenanzahl</label>
                  <select 
                    value={partySize}
                    onChange={(e) => setPartySize(Number(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-italian-green focus:border-italian-green"
                  >
                    {[2,3,4,5,6].map(n => (
                      <option key={n} value={n}>{n} Personen</option>
                    ))}
                  </select>
                </div>
              </div>

              <button 
                onClick={() => date && setStep(2)}
                disabled={!date}
                className="w-full bg-italian-red text-white font-bold py-3 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Weiter zur Zeitwahl
              </button>
            </div>

            {/* STEP 2: Time Slot */}
            <div className={`${step !== 2 ? 'hidden' : 'block'} space-y-6`}>
              <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-serif font-bold text-italian-green flex items-center">
                  <Clock className="mr-2" /> Uhrzeit wählen
                </h2>
                <button onClick={() => setStep(1)} className="text-sm text-gray-500 hover:underline">Zurück</button>
              </div>
              
              <p className="text-gray-600">Verfügbare Zeiten für {date.split('-').reverse().join('.')} ({partySize} Personen):</p>

              <div className="space-y-4">
                <h3 className="font-bold text-gray-700 border-b pb-2">Mittagstisch</h3>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                  {TIME_SLOTS.filter(ts => ts.period === 'lunch').map(ts => (
                    <button
                      key={ts.id}
                      onClick={() => handleTimeSelect(ts.id)}
                      className={`p-2 rounded border text-sm font-medium transition ${timeSlotId === ts.id ? 'bg-italian-green text-white border-italian-green' : 'bg-white hover:bg-green-50 border-gray-300'}`}
                    >
                      {ts.time}
                    </button>
                  ))}
                </div>

                <h3 className="font-bold text-gray-700 border-b pb-2 mt-6">Abendessen</h3>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                  {TIME_SLOTS.filter(ts => ts.period === 'dinner').map(ts => (
                    <button
                      key={ts.id}
                      onClick={() => handleTimeSelect(ts.id)}
                      className={`p-2 rounded border text-sm font-medium transition ${timeSlotId === ts.id ? 'bg-italian-green text-white border-italian-green' : 'bg-white hover:bg-green-50 border-gray-300'}`}
                    >
                      {ts.time}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* STEP 3: Table Map & Confirm */}
            <div className={`${step !== 3 ? 'hidden' : 'block'} space-y-6`}>
              <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-serif font-bold text-italian-green flex items-center">
                  <Users className="mr-2" /> Tisch wählen
                </h2>
                <button onClick={() => setStep(2)} className="text-sm text-gray-500 hover:underline">Zurück</button>
              </div>

              {loadingAvailability ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="animate-spin h-10 w-10 text-italian-green" />
                </div>
              ) : (
                <>
                  <TableMap 
                    tables={RESTAURANT_TABLES}
                    bookedTableNumbers={bookedTableNumbers}
                    selectedTableNumber={selectedTableNum}
                    onSelectTable={handleTableSelect}
                    requiredCapacity={partySize}
                  />

                  {selectedTableNum && (
                    <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg animate-fade-in">
                      <h3 className="font-bold text-italian-dark mb-2">Reservierung abschließen</h3>
                      
                      <div className="mb-4">
                         <label className="block text-sm font-medium text-gray-700 mb-1">Telefonnummer (für Rückfragen)</label>
                         <input 
                            type="tel" 
                            placeholder="+49 123 45678"
                            value={contactPhone} 
                            onChange={e => setContactPhone(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded"
                         />
                      </div>

                      {!currentUser && (
                         <div className="mb-4 text-sm text-red-600">
                           * Sie müssen angemeldet sein, um die Reservierung abzuschließen.
                         </div>
                      )}

                      <button
                        onClick={handleSubmit}
                        disabled={submitting || !currentUser}
                        className="w-full bg-italian-green text-white font-bold py-3 rounded-md hover:bg-green-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                      >
                        {submitting ? <Loader2 className="animate-spin mr-2" /> : null}
                        {currentUser ? 'Reservierung verbindlich bestätigen' : 'Bitte zuerst Anmelden'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
