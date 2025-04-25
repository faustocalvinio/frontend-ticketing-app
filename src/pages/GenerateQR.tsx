import { useEffect, useState } from "react";

interface EventOption {
   id: string;
   name: string;
}

export const GenerateQR = () => {
   const [events, setEvents] = useState<EventOption[]>([]);
   const [email, setEmail] = useState("");
   const [eventId, setEventId] = useState("");
   const [area, setArea] = useState("General");
   const [sendEmail, setSendEmail] = useState(true);

   useEffect(() => {
      document.title = "Genera tu QR";
      fetch("https://ticketing-app-bu5y.onrender.com/api/events")
         .then((res) => res.json())
         .then((data) => setEvents(data))
         .catch((err) => {
            console.error("Error fetching events:", err);
            alert("Ocurrió un error al obtener los eventos.");
         });
   }, []);

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      fetch(
         "https://ticketing-app-bu5y.onrender.com/api/tickets/generate-ticket-pdf",
         {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, eventId, area, sendEmail }),
         }
      )
         .then((res) => res.blob())
         .then((blob) => {
            const url = window.URL.createObjectURL(blob);
            window.open(url);
         })
         .catch((error) => {
            console.error("Error:", error);
            alert("Ocurrió un error al generar el PDF.");
         });
   };

   return (
      <div className="">
         <h1>Genera tu QR</h1>
         <form onSubmit={handleSubmit}>
            <label htmlFor="email">Email:</label>
            <input
               type="email"
               id="email"
               required
               value={email}
               onChange={(e) => setEmail(e.target.value)}
            />

            <label htmlFor="eventId">Evento:</label>
            <select
               id="eventId"
               required
               value={eventId}
               onChange={(e) => setEventId(e.target.value)}
            >
               <option value="">Selecciona un evento</option>
               {events.map((event) => (
                  <option key={event.id} value={event.id}>
                     {event.name}
                  </option>
               ))}
            </select>

            <label htmlFor="area">Área:</label>
            <select
               id="area"
               required
               value={area}
               onChange={(e) => setArea(e.target.value)}
            >
               <option value="General">General</option>
               <option value="VIP">VIP</option>
               <option value="UltraVIP">UltraVIP</option>
            </select>

            <label>
               <input
                  type="checkbox"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
               />
               Enviar por email
            </label>

            <button type="submit">Generar Ticket PDF</button>
         </form>
      </div>
   );
};
