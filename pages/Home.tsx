import React from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, Clock, MapPin } from 'lucide-react';

export const Home: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[600px] flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
            alt="Italienisches Restaurant Ambiente" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        
        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-7xl font-serif text-white font-bold mb-4 drop-shadow-lg">
            Trattoria Bella Vista
          </h1>
          <p className="text-xl md:text-2xl text-italian-cream mb-8 max-w-2xl mx-auto font-light">
            Erleben Sie authentische italienische Küche in familiärer Atmosphäre.
            Handgemachte Pasta, erlesene Weine und Leidenschaft.
          </p>
          <Link 
            to="/reservation" 
            className="inline-block bg-italian-red text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-red-700 transition-all transform hover:scale-105 shadow-xl border-2 border-white/20"
          >
            Jetzt Tisch reservieren
          </Link>
        </div>
      </div>

      {/* Info Section */}
      <div className="py-16 bg-italian-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-md">
              <Clock className="w-12 h-12 text-italian-green mb-4" />
              <h3 className="text-xl font-serif font-bold mb-2">Öffnungszeiten</h3>
              <p className="text-gray-600">
                Mittag: 12:00 - 14:30<br/>
                Abend: 18:00 - 22:00<br/>
                <span className="text-sm text-gray-400 mt-2 block">Montag Ruhetag</span>
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-md">
              <ChefHat className="w-12 h-12 text-italian-red mb-4" />
              <h3 className="text-xl font-serif font-bold mb-2">Unsere Küche</h3>
              <p className="text-gray-600">
                Traditionelle Rezepte aus der Toskana.<br/>
                Frische Zutaten, täglich zubereitet von<br/>
                unserem Chefkoch Giovanni.
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-md">
              <MapPin className="w-12 h-12 text-italian-gold mb-4" />
              <h3 className="text-xl font-serif font-bold mb-2">Standort</h3>
              <p className="text-gray-600">
                Hauptstraße 123<br/>
                10115 Berlin<br/>
                Deutschland
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Dishes (Static) */}
      <div className="py-16 bg-stone-100">
         <div className="max-w-7xl mx-auto px-4">
           <h2 className="text-3xl font-serif text-center mb-12 text-italian-dark">Unsere Spezialitäten</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <img src="https://images.unsplash.com/photo-1595295333158-4742f28fbd85?auto=format&fit=crop&w=600&q=80" alt="Pasta" className="rounded-lg shadow-lg h-64 w-full object-cover hover:opacity-90 transition"/>
              <img src="https://images.unsplash.com/photo-1574868261505-1243e061f2a3?auto=format&fit=crop&w=600&q=80" alt="Pizza" className="rounded-lg shadow-lg h-64 w-full object-cover hover:opacity-90 transition"/>
              <img src="https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?auto=format&fit=crop&w=600&q=80" alt="Tiramisu" className="rounded-lg shadow-lg h-64 w-full object-cover hover:opacity-90 transition"/>
           </div>
         </div>
      </div>
    </div>
  );
};
