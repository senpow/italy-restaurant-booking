import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';

export const OrderConfirmation: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-8 h-8 text-italian-green" />
                </div>

                <h1 className="text-3xl font-serif font-bold text-gray-900 mb-4">
                    Vielen Dank!
                </h1>

                <p className="text-gray-600 mb-8">
                    Ihre Bestellung wurde erfolgreich aufgenommen. Wir bereiten alles frisch für Sie zu.
                    <br /><br />
                    Bitte bezahlen Sie bei der Abholung im Restaurant.
                </p>

                <div className="space-y-4">
                    <button
                        onClick={() => navigate('/menu')}
                        className="w-full flex items-center justify-center px-6 py-3 bg-italian-green text-white rounded-md font-bold hover:bg-green-700 transition-colors"
                    >
                        Zurück zur Speisekarte
                    </button>

                    <button
                        onClick={() => navigate('/')}
                        className="w-full flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors"
                    >
                        Zur Startseite
                    </button>
                </div>
            </div>
        </div>
    );
};
