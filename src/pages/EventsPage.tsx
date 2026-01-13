import { useEffect, useState } from "react";
import baseAPI from "../api/baseAPI";

interface Event {
   id: string;
   name: string;
   description?: string;
}

export const EventsPage = () => {
   const [events, setEvents] = useState<Event[]>([]);
   const [eventName, setEventName] = useState("");

   useEffect(() => {
      fetchEvents();
   }, []);

   const fetchEvents = async () => {
      try {
         const res = await baseAPI.get("/events");
         if (!res.status) throw new Error("Failed to fetch events");
         const data = await res.data;
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
         setEvents((prev) => [...prev, data]);
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
         const res = await baseAPI.delete(`/events/${id}`);
         if (!res.data) throw new Error("Failed to delete event");
         setEvents((prev) => prev.filter((event) => event.id !== id));
      } catch (err) {
         console.error("Error deleting event:", err);
      }
   };

   return (
      <div className="max-w-2xl mx-auto p-6 font-sans">
         <h1 className="text-2xl font-bold mb-6 text-gray-800">
            Manage Events
         </h1>

         <form
            onSubmit={handleAddEvent}
            className="mb-8 flex gap-4 items-center"
         >
            <div className="flex-1">
               <input
                  id="event-name"
                  type="text"
                  placeholder="Event Name"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
               />
            </div>
            <button
               type="submit"
               className="cursor-pointer bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition"
            >
               Add Event
            </button>
         </form>

         <div className="space-y-4">
            {events.map((event) => (
               <div
                  key={event.id}
                  className="border border-gray-200 rounded-md p-4 shadow-sm bg-white"
               >
                  <h2 className="text-lg font-semibold text-gray-800">
                     {event.name || "Unnamed Event"}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                     {event.description || "No description available."}
                  </p>
                  <div className="mt-4 flex gap-3">
                     <button
                        onClick={() => handleCopyId(event.id)}
                        className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-1 rounded"
                     >
                        Copy ID
                     </button>
                     <button
                        onClick={() => handleDelete(event.id)}
                        className="cursor-pointer bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded"
                     >
                        Delete
                     </button>
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
};
