import React from 'react';
import { Table } from '../types';
import { Users, CheckCircle, XCircle } from 'lucide-react';

interface TableMapProps {
  tables: Table[];
  bookedTableNumbers: number[];
  selectedTableNumber: number | null;
  onSelectTable: (tableNumber: number) => void;
  requiredCapacity: number;
}

export const TableMap: React.FC<TableMapProps> = ({
  tables,
  bookedTableNumbers,
  selectedTableNumber,
  onSelectTable,
  requiredCapacity,
}) => {
  
  const getTableStatus = (table: Table) => {
    const isBooked = bookedTableNumbers.includes(table.tableNumber);
    const isTooSmall = table.capacity < requiredCapacity;
    const isSelected = selectedTableNumber === table.tableNumber;
    
    if (isBooked) return 'booked';
    if (isTooSmall) return 'unavailable';
    if (isSelected) return 'selected';
    return 'available';
  };

  return (
    <div className="bg-stone-100 p-6 rounded-xl border-2 border-stone-200 shadow-inner relative overflow-hidden">
      {/* Floor Decoration */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]"></div>
      
      <h3 className="text-center text-italian-dark font-serif mb-6 text-lg italic">Saalplan</h3>

      {/* Simplified Grid Layout for Map */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-12 max-w-3xl mx-auto relative z-10">
        {tables.map((table) => {
          const status = getTableStatus(table);
          
          let bgClass = "bg-white";
          let borderClass = "border-stone-300";
          let textClass = "text-stone-600";
          let cursorClass = "cursor-pointer hover:shadow-lg hover:border-italian-green";
          let icon = <Users className="w-4 h-4" />;

          if (status === 'booked') {
            bgClass = "bg-red-100";
            borderClass = "border-red-300";
            textClass = "text-red-400";
            cursorClass = "cursor-not-allowed opacity-70";
            icon = <XCircle className="w-4 h-4" />;
          } else if (status === 'unavailable') {
            bgClass = "bg-gray-100";
            borderClass = "border-gray-200";
            textClass = "text-gray-400";
            cursorClass = "cursor-not-allowed opacity-50";
          } else if (status === 'selected') {
            bgClass = "bg-italian-green";
            borderClass = "border-italian-green";
            textClass = "text-white";
            cursorClass = "cursor-pointer ring-4 ring-italian-green/30";
            icon = <CheckCircle className="w-4 h-4" />;
          }

          return (
            <div
              key={table.id}
              onClick={() => {
                if (status === 'available' || status === 'selected') {
                  onSelectTable(table.tableNumber);
                }
              }}
              className={`
                relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-300
                ${table.shape === 'round' ? 'rounded-full aspect-square' : 'rounded-lg aspect-[4/3]'}
                ${bgClass} ${borderClass} ${textClass} ${cursorClass}
              `}
            >
              <span className="text-2xl font-serif font-bold mb-1">{table.tableNumber}</span>
              <div className="flex items-center space-x-1 text-xs font-medium uppercase tracking-wide">
                {icon}
                <span>{table.capacity} Pers.</span>
              </div>
              <div className="text-[10px] mt-1 opacity-75 text-center">{table.location}</div>
              
              {/* Chairs visual (simplified) */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-stone-400 rounded-full opacity-30"></div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-stone-400 rounded-full opacity-30"></div>
              {table.capacity > 2 && (
                <>
                  <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-1 h-8 bg-stone-400 rounded-full opacity-30"></div>
                  <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-1 h-8 bg-stone-400 rounded-full opacity-30"></div>
                </>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm text-stone-600">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-white border border-stone-300"></div>
          <span>Frei</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-italian-green"></div>
          <span>Ausgewählt</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-100 border border-red-300"></div>
          <span>Belegt</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-gray-100 border border-gray-300 opacity-50"></div>
          <span>Zu klein</span>
        </div>
      </div>
    </div>
  );
};
