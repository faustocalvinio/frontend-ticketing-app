import { useEffect, useState } from "react";
import baseAPI from "../api/baseAPI";

interface Event {
   id: string;
   name: string;
   description?: string;
}

export const CreateEvent = () => {
   const [events, setEvents] = useState<Event[]>([]);
   const [eventName, setEventName] = useState("");

   const API_BASE = "https://ticketing-app-bu5y.onrender.com/api/events";

   useEffect(() => {
      fetchEvents();
   }, []);

   const fetchEvents = async () => {
      try {
         //  const res = await fetch(API_BASE);
         const res = await baseAPI.get("/events");
         const data = res.data;
         setEvents(data);
      } catch (err) {
         console.error("Error fetching events:", err);
      }
   };

   const handleAddEvent = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
         const res = await baseAPI.post("/events", {
            name: eventName,
            availableSeats: 3129,
         });
         if (!res.status) throw new Error("Failed to add event");
         const data = await res.data;
         console.log("Event added:", data);
         const newEvent = await res.data;
         setEvents((prev) => [...prev, newEvent]);
         setEventName("");
      } catch (err) {
         console.error("Error adding event:", err);
      }
   };

   const handleCopyId = async (id: string) => {
      try {
         await navigator.clipboard.writeText(id);
         alert("Event ID copied to clipboard!");
      } catch (err) {
         console.error("Failed to copy ID:", err);
      }
   };

   const handleDelete = async (id: string) => {
      try {
         const res = await fetch(`${API_BASE}/${id}`, {
            method: "DELETE",
         });

         if (!res.ok) throw new Error("Failed to delete event");

         setEvents((prev) => prev.filter((event) => event.id !== id));
      } catch (err) {
         console.error("Error deleting event:", err);
      }
   };

   return (
      <div style={{ margin: "20px", fontFamily: "Arial, sans-serif" }}>
         <h1>Events</h1>

         <form onSubmit={handleAddEvent} style={{ marginBottom: "20px" }}>
            <label htmlFor="event-name">Event Name:</label>
            <input
               id="event-name"
               type="text"
               value={eventName}
               onChange={(e) => setEventName(e.target.value)}
               required
               style={{ marginLeft: "10px", padding: "5px" }}
            />
            <button type="submit" style={{ marginLeft: "10px" }}>
               Add Event
            </button>
         </form>

         <div>
            {events.map((event) => (
               <div
                  key={event.id}
                  style={{
                     border: "1px solid #ccc",
                     padding: "10px",
                     marginBottom: "10px",
                     borderRadius: "5px",
                  }}
               >
                  <h2>{event.name || "Unnamed Event"}</h2>
                  <p>{event.description || "No description available."}</p>
                  <button onClick={() => handleCopyId(event.id)}>
                     Copy ID
                  </button>
                  <button
                     onClick={() => handleDelete(event.id)}
                     style={{
                        marginLeft: "10px",
                        backgroundColor: "red",
                        color: "white",
                        border: "none",
                        padding: "5px 10px",
                        cursor: "pointer",
                     }}
                  >
                     Delete Event
                  </button>
               </div>
            ))}
         </div>
      </div>
   );
};
