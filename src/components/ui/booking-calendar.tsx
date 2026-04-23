"use client";

import React, { useState, useMemo, useCallback } from "react";

const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function buildGoogleCalendarUrl(year: number, month: number, day: number): string {
  // Create a 30-min event at 10:00 AM on the selected date
  const startDate = new Date(year, month, day, 10, 0, 0);
  const endDate = new Date(year, month, day, 10, 30, 0);

  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: "Chat with Kshitij Betwal",
    details:
      "30 min call to discuss projects, collaborations, or opportunities.\n\nBooked via portfolio: https://theneuralhorizon.github.io/portfolio/",
    location: "Google Meet (link will be added)",
    dates: `${fmt(startDate)}/${fmt(endDate)}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

interface CalendarDayProps {
  day: number | string;
  isHeader?: boolean;
  isPast?: boolean;
  isToday?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}

const CalendarDay: React.FC<CalendarDayProps> = ({
  day,
  isHeader,
  isPast,
  isToday,
  isSelected,
  onClick,
}) => {
  const base = "flex h-7 w-7 items-center justify-center text-center";
  const headerCls = "text-[#334155]";
  const pastCls = "text-[#1e293b] cursor-default";
  const todayCls =
    "rounded-md ring-1 ring-[#22d3ee]/40 text-[#22d3ee] cursor-pointer hover:bg-[#22d3ee]/10";
  const selectedCls =
    "rounded-md bg-[#22d3ee]/20 text-[#22d3ee] cursor-pointer";
  const normalCls =
    "rounded-md text-[#64748b] cursor-pointer hover:bg-[rgba(255,255,255,0.04)] hover:text-[#e2e8f0]";

  let cls = base;
  if (isHeader) cls += ` ${headerCls}`;
  else if (isPast) cls += ` ${pastCls}`;
  else if (isSelected) cls += ` ${selectedCls}`;
  else if (isToday) cls += ` ${todayCls}`;
  else cls += ` ${normalCls}`;

  return (
    <div
      className={cls}
      onClick={!isHeader && !isPast ? onClick : undefined}
      role={!isHeader && !isPast ? "button" : undefined}
      tabIndex={!isHeader && !isPast ? 0 : undefined}
    >
      <span
        className={`font-mono font-medium ${isHeader ? "text-[9px] tracking-wider" : "text-[11px]"}`}
      >
        {day}
      </span>
    </div>
  );
};

export function BookingCalendar() {
  const now = new Date();
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const monthName = new Date(viewYear, viewMonth).toLocaleString("default", {
    month: "long",
  });
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const todayDay =
    now.getMonth() === viewMonth && now.getFullYear() === viewYear
      ? now.getDate()
      : -1;

  const isCurrentOrPastMonth =
    viewYear < now.getFullYear() ||
    (viewYear === now.getFullYear() && viewMonth <= now.getMonth());

  const prevMonth = useCallback(() => {
    // Don't go before current month
    if (isCurrentOrPastMonth) return;
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
    setSelectedDay(null);
  }, [viewMonth, viewYear, isCurrentOrPastMonth]);

  const nextMonth = useCallback(() => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
    setSelectedDay(null);
  }, [viewMonth]);

  const isDayPast = useCallback(
    (day: number) => {
      if (viewYear < now.getFullYear()) return true;
      if (viewYear === now.getFullYear() && viewMonth < now.getMonth())
        return true;
      if (
        viewYear === now.getFullYear() &&
        viewMonth === now.getMonth() &&
        day < now.getDate()
      )
        return true;
      return false;
    },
    [viewYear, viewMonth, now]
  );

  const calendarDays = useMemo(() => {
    const days: React.ReactNode[] = [];

    dayNames.forEach((name) => {
      days.push(<CalendarDay key={`h-${name}`} day={name} isHeader />);
    });

    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(<div key={`e-${i}`} className="h-7 w-7" />);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const past = isDayPast(d);
      days.push(
        <CalendarDay
          key={`d-${d}`}
          day={d}
          isPast={past}
          isToday={d === todayDay}
          isSelected={d === selectedDay}
          onClick={() => !past && setSelectedDay(d)}
        />
      );
    }

    return days;
  }, [firstDayOfWeek, daysInMonth, todayDay, selectedDay, isDayPast]);

  const googleCalUrl = selectedDay
    ? buildGoogleCalendarUrl(viewYear, viewMonth, selectedDay)
    : null;

  const canGoPrev = !(
    viewYear === now.getFullYear() && viewMonth === now.getMonth()
  );

  return (
    <div className="rounded-lg border border-[rgba(255,255,255,0.06)] bg-[#0a0e17] p-5 transition-colors hover:border-[rgba(34,211,238,0.15)]">
      {/* Month nav */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            disabled={!canGoPrev}
            className={`flex h-6 w-6 items-center justify-center rounded text-xs transition-colors ${
              canGoPrev
                ? "text-[#64748b] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#e2e8f0]"
                : "text-[#1e293b] cursor-default"
            }`}
            aria-label="Previous month"
          >
            &larr;
          </button>
          <span className="font-mono text-sm font-medium text-[#e2e8f0] min-w-[130px] text-center">
            {monthName.toUpperCase()} {viewYear}
          </span>
          <button
            onClick={nextMonth}
            className="flex h-6 w-6 items-center justify-center rounded text-xs text-[#64748b] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#e2e8f0] transition-colors"
            aria-label="Next month"
          >
            &rarr;
          </button>
        </div>
        <span className="font-mono text-[10px] text-[#334155]">30 MIN</span>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 px-1">{calendarDays}</div>

      {/* Selected date info + CTA */}
      <div className="mt-4 pt-3 border-t border-[rgba(255,255,255,0.06)]">
        {selectedDay ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-mono text-[11px] text-[#64748b]">
                <span className="text-[#e2e8f0]">
                  {monthName} {selectedDay}, {viewYear}
                </span>{" "}
                — 10:00 AM
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]"></span>
                <span className="font-mono text-[9px] tracking-widest text-[#22c55e]">
                  OPEN
                </span>
              </div>
            </div>
            <a
              href={googleCalUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-md border border-[#22d3ee]/30 bg-[#22d3ee]/5 py-2 font-mono text-[11px] tracking-widest text-[#22d3ee] uppercase transition-all hover:border-[#22d3ee] hover:bg-[#22d3ee]/10"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                <line x1="16" x2="16" y1="2" y2="6" />
                <line x1="8" x2="8" y1="2" y2="6" />
                <line x1="3" x2="21" y1="10" y2="10" />
              </svg>
              Add to Google Calendar
            </a>
          </div>
        ) : (
          <p className="text-center font-mono text-[10px] text-[#334155] tracking-wider">
            SELECT A DATE TO SCHEDULE
          </p>
        )}
      </div>
    </div>
  );
}
