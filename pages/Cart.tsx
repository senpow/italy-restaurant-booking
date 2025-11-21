import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebaseConfig';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { Trash2, Plus, Minus, Clock, ArrowLeft } from 'lucide-react';
import { Order } from '../types';

export const Cart: React.FC = () => {
    const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [pickupTime, setPickupTime] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCheckout = async () => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        if (!pickupTime) {
            alert('Bitte wählen Sie eine Abholzeit.');
            return;
        }

        setLoading(true);
        try {
            const orderData: Order = {
                userId: currentUser.uid,
                userEmail: currentUser.email || '',
                userName: currentUser.displayName || 'Gast',
                items: cart,
                totalAmount: cartTotal,
                status: 'pending',
                createdAt: Timestamp.now(),
                pickupTime: pickupTime
            };

            await addDoc(collection(db, 'orders'), orderData);
            clearCart();
            navigate('/order-confirmation');
        } catch (error) {
            console.error("Error placing order:", error);
            alert("Fehler beim Bestellen. Bitte versuchen Sie es erneut.");
        } finally {
            setLoading(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <h2 className="text-2xl font-serif font-bold text-gray-800 mb-4">Ihr Warenkorb ist leer</h2>
                <button
                    onClick={() => navigate('/menu')}
                    className="flex items-center space-x-2 text-italian-red hover:text-red-700 font-medium"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Zurück zur Speisekarte</span>
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">Warenkorb</h1>

                <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
                    <div className="p-6 space-y-6">
                        {cart.map((item, index) => (
                            <div key={index} className="flex items-center justify-between border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-800">{item.name}</h3>
                                    <p className="text-sm text-gray-500">{item.description}</p>
                                    <div className="text-italian-red font-bold mt-1">{item.price}</div>
                                </div>

                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center border rounded-lg">
                                        <button
                                            onClick={() => updateQuantity(item.name, item.quantity - 1)}
                                            className="p-2 hover:bg-gray-100 text-gray-600"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.name, item.quantity + 1)}
                                            className="p-2 hover:bg-gray-100 text-gray-600"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item.name)}
                                        className="text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="bg-gray-50 p-6 border-t border-gray-200">
                        <div className="flex justify-between items-center text-xl font-bold text-gray-900">
                            <span>Gesamtsumme</span>
                            <span>{cartTotal.toFixed(2).replace('.', ',')} €</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <Clock className="w-5 h-5 mr-2 text-italian-green" />
                        Abholzeit wählen
                    </h2>
                    <input
                        type="time"
                        value={pickupTime}
                        onChange={(e) => setPickupTime(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-italian-green focus:border-italian-green"
                        required
                    />
                    <p className="text-sm text-gray-500 mt-2">
                        Bitte beachten Sie unsere Öffnungszeiten (11:30 - 23:00 Uhr).
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={() => navigate('/menu')}
                        className="flex-1 px-6 py-3 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors text-center"
                    >
                        Weiter einkaufen
                    </button>
                    <button
                        onClick={handleCheckout}
                        disabled={loading}
                        className="flex-1 px-6 py-3 bg-italian-green text-white rounded-md font-bold hover:bg-green-700 transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-center"
                    >
                        {loading ? 'Wird bearbeitet...' : 'Jetzt bestellen (Zahlung im Restaurant)'}
                    </button>
                </div>
            </div>
        </div>
    );
};
