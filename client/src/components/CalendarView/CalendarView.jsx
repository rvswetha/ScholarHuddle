import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import "./calendarview.css";

export default function CalendarView() {
  const events = [
    { title: "Math Assignment", date: "2025-10-24" },
    { title: "Hackathon", date: "2025-10-26" },
    { title: "Physics Quiz", date: "2025-10-28" },
    { title: "Group Study", date: "2025-10-29" },
  ];

  return (
    <div className="calendar-root">
      <h2 className="calendar-title">Assignments & Deadlines</h2>
      <div className="calendar-card">
        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          events={events}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "",
          }}
          height="auto"
        />
      </div>
    </div>
  );
}
