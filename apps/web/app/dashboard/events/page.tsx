"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { marketingEvents } from "@/lib/constants/marketingEvents";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function EventsPage() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const monthIndex = currentDate.getMonth();

  // Get events for the currently selected month
  const currentMonthEvents = useMemo(() => {
    return marketingEvents
      .filter((e) => e.month === monthIndex)
      .sort((a, b) => a.date - b.date);
  }, [monthIndex]);

  // Generate calendar grid dates dynamically
  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, monthIndex, 1).getDay(); // 0 (Sun) to 6 (Sat)
    
    const days = [];

    // Previous month padding
    const daysInPrevMonth = new Date(year, monthIndex, 0).getDate();
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        currentMonth: false,
        isEvent: false,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const isEvent = currentMonthEvents.some((e) => e.date === i);
      days.push({
        day: i,
        currentMonth: true,
        isEvent,
      });
    }

    // Next month padding (to complete the last row, up to 35 or 42 slots)
    const totalSlots = days.length <= 35 ? 35 : 42;
    const remainingSlots = totalSlots - days.length;
    for (let i = 1; i <= remainingSlots; i++) {
      days.push({
        day: i,
        currentMonth: false,
        isEvent: false,
      });
    }

    return days;
  }, [year, monthIndex, currentMonthEvents]);

  // Handlers for month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(year, monthIndex - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, monthIndex + 1, 1));
  };

  const setMonth = (mIndex: number) => {
    setCurrentDate(new Date(year, mIndex, 1));
  };

  const currentMonthName = months[monthIndex];

  return (
    <div className="flex flex-col items-center justify-start min-h-full pb-20 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto px-4 w-full">
      
      {/* Top Header */}
      <div className="flex flex-col items-center mb-10 w-full text-center space-y-4 order-1">
        <Button variant="outline" className="rounded-full shadow-sm bg-background border-border/50 text-xs px-4 h-8 gap-2 pointer-events-none">
          <CalendarDays className="w-3.5 h-3.5" />
          Plan your content
        </Button>
        
        <h1 className="text-4xl font-bold tracking-tight text-foreground mt-2">
          Event Calendar {year}
        </h1>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto">
          Discover important events, holidays, and celebrations to plan your content strategy.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-5xl mb-12 order-3 lg:order-2">
        
        {/* Calendar Left Panel */}
        <div className="bg-background rounded-3xl p-8 shadow-sm border border-border/30 flex flex-col">
          {/* Calendar Header */}
          <div className="flex justify-between items-center mb-8">
            <button onClick={prevMonth} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="font-semibold text-lg">{currentMonthName} {year}</h2>
            <button onClick={nextMonth} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 text-center mb-4">
            {["SU", "MO", "TU", "WE", "TH", "FR", "SA"].map((day) => (
              <div key={day} className="text-xs font-medium text-muted-foreground/60 tracking-wider">
                {day}
              </div>
            ))}
          </div>

          {/* Dates Grid */}
          <div className="grid grid-cols-7 gap-y-2 gap-x-2 text-center flex-1">
            {calendarDays.map((date, i) => (
              <div key={i} className="flex items-center justify-center aspect-square">
                <div 
                  className={`
                    flex items-center justify-center w-full h-full rounded-2xl text-sm font-medium transition-all
                    ${date.currentMonth ? "text-foreground" : "text-muted-foreground/40"}
                    ${date.isEvent ? "bg-secondary text-secondary-foreground shadow-sm border border-border/50" : ""}
                    ${!date.isEvent && date.currentMonth ? "hover:bg-muted cursor-pointer" : ""}
                  `}
                >
                  {date.day}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Events Right Panel */}
        <div className="bg-background rounded-3xl p-8 shadow-sm border border-border/30 flex flex-col h-[500px]">
          <div className="mb-6">
            <h2 className="font-bold text-xl">{currentMonthName} Events</h2>
            <p className="text-sm text-muted-foreground mt-1">{currentMonthEvents.length} events this month</p>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {currentMonthEvents.length > 0 ? (
              currentMonthEvents.map((event, i) => (
                <div key={i} className="flex items-center bg-secondary/40 hover:bg-secondary/60 transition-colors p-3 rounded-2xl gap-4">
                  <div className="bg-background flex flex-col items-center justify-center rounded-xl w-14 h-14 shrink-0 shadow-sm border border-border/50">
                    <span className="font-bold text-lg leading-none">{event.date}</span>
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase">{currentMonthName}</span>
                  </div>
                  <div className="font-medium text-sm text-foreground">
                    {event.name}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                No major events tracked for this month.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Month Selector Pill */}
      <div className="order-2 lg:order-3 w-full max-w-5xl flex justify-center mb-8 lg:mb-0">
        <div className="bg-secondary/50 p-1.5 rounded-full flex items-center justify-start lg:justify-center gap-1 shadow-sm border border-border/30 max-w-full overflow-x-auto custom-scrollbar">
          {months.map((m, index) => (
            <button
              key={m}
              onClick={() => setMonth(index)}
              className={`
                px-4 py-1.5 text-xs font-semibold rounded-full transition-all shrink-0
                ${monthIndex === index 
                  ? "bg-foreground text-background shadow-md" 
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }
              `}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
      
    </div>
  );
}
