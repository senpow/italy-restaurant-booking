import React from 'react';
import { useCart } from '../context/CartContext';
import { ShoppingBag, Check } from 'lucide-react';

interface MenuItem {
    name: string;
    description: string;
    price: string;
}

interface MenuCategory {
    title: string;
    items: MenuItem[];
}

const menuData: MenuCategory[] = [
    {
        title: "Pizza",
        items: [
            { name: "Margherita", description: "Tomatensauce & Mozzarella", price: "9,50 €" },
            { name: "Salami", description: "Tomatensauce, Mozzarella & Salami", price: "11,50 €" },
            { name: "Tonno", description: "Tomatensauce, Mozzarella, Thunfisch, Kapern & Zwiebeln", price: "11,50 €" },
            { name: "Vegetariana", description: "Tomatensauce, Mozzarella & eingelegtes Gemüse", price: "11,50 €" },
            { name: "Hawaii", description: "Tomatensauce, Mozzarella, Kochschinken & Ananas", price: "11,50 €" },
            { name: "Prosciutto e Funghi", description: "Tomatensauce, Mozzarella, Kochschinken & Pilze", price: "11,50 €" },
            { name: "Bruschetta", description: "Mozzarella, würzige Tomaten, Rucola & Parmesan", price: "12,50 €" },
            { name: "Frutti di Mare", description: "Tomatensauce, Mozzarella & Meeresfrüchte", price: "14,50 €" },
            { name: "Quattro Stagiono", description: "Mozzarella, Pilze, Salami, Kochschinken & Artischocken", price: "13,50 €" },
            { name: "Tirolese", description: "Gorgonzola, Mozzarella, Parmaschinken, Rucola & Parmesan", price: "15,50 €" },
            { name: "Della Casa", description: "Tomatensauce, Mozzarella, Garnelen & Spinat", price: "17,50 €" },
            { name: "Calzone", description: "mit Schinken, Salami & Champignons", price: "13,50 €" },
        ]
    },
    {
        title: "Pasta & Risotto",
        items: [
            { name: "Spaghetti Classico", description: "Aglio e Olio o. Bolognese o. Pomodoro oder Pesto", price: "9,50 €" },
            { name: "Spaghetti all Amatriciana", description: "mit Speck & Zwiebeln", price: "9,50 €" },
            { name: "Spaghetti alla Carbonara", description: "mit Pancetta, Sahne & Ei", price: "10,50 €" },
            { name: "Penne all Arrabbiata", description: "mit scharfer Tomatensauce", price: "9,50 €" },
            { name: "Gnocchi", description: "mit Tomatensauce & Mozzarella", price: "9,50 €" },
            { name: "Tortellini alla Gorgonzola", description: "mit Gorgonzolasauce", price: "11,50 €" },
            { name: "Tortellini Alfredo", description: "mit Sahne, Kochschinken & Champignons", price: "11,50 €" },
            { name: "Grüne Tagiatelle Mare e Monte", description: "mit Garnelen & Steinpilze", price: "17,50 €" },
            { name: "Spaghetti con Gamberoni \"Luce\"", description: "mit Garnelen in Weißweinsauce", price: "17,50 €" },
            { name: "Spaghetti Frutti di Mare", description: "mit Meeresfrüchten", price: "15,50 €" },
            { name: "Tagliatelle Manzo", description: "mit Rinderfiletspitzen, Rucola & Parmesan", price: "18,50 €" },
            { name: "Tagliatelle Salmone", description: "mit Lachs in einer Tomatenrahmsauce", price: "16,50 €" },
            { name: "Risotto", description: "mit Lammfilet & Steinpilzen", price: "19,50 €" },
        ]
    }
];

export const Menu: React.FC = () => {
    const { addToCart } = useCart();
    const [addedItems, setAddedItems] = React.useState<Set<string>>(new Set());

    const handleAddToCart = (item: MenuItem) => {
        addToCart({
            name: item.name,
            description: item.description,
            price: item.price
        });

        setAddedItems(prev => new Set(prev).add(item.name));
        setTimeout(() => {
            setAddedItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(item.name);
                return newSet;
            });
        }, 1000);
    };

    return (
        <div className="bg-italian-white min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-italian-dark mb-4">Unsere Speisekarte</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Entdecken Sie die authentischen Gerichte des Ristorante Bellavista.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {menuData.map((category, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-xl overflow-hidden">
                            <div className="bg-italian-red py-4 px-6">
                                <h2 className="text-2xl font-serif font-bold text-white text-center">{category.title}</h2>
                            </div>
                            <div className="p-6 space-y-6">
                                {category.items.map((item, itemIndex) => {
                                    const isAdded = addedItems.has(item.name);
                                    return (
                                        <div key={itemIndex} className="flex justify-between items-start border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                                            <div className="pr-4 flex-grow">
                                                <h3 className="text-lg font-bold text-gray-800">{item.name}</h3>
                                                <p className="text-gray-600 text-sm mt-1">{item.description}</p>
                                            </div>
                                            <div className="flex flex-col items-end space-y-2">
                                                <div className="text-italian-red font-bold whitespace-nowrap">
                                                    {item.price}
                                                </div>
                                                <button
                                                    onClick={() => handleAddToCart(item)}
                                                    disabled={isAdded}
                                                    className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 ${isAdded
                                                        ? 'bg-green-600 text-white scale-105'
                                                        : 'bg-italian-green text-white hover:bg-green-700'
                                                        }`}
                                                >
                                                    {isAdded ? (
                                                        <>
                                                            <Check className="w-3 h-3" />
                                                            <span>Hinzugefügt</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ShoppingBag className="w-3 h-3" />
                                                            <span>Hinzufügen</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
