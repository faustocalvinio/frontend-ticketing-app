import { PayPalButtons } from "@paypal/react-paypal-js";
import { useEffect, useState } from "react";
// import { useParams } from "react-router";
import baseAPI from "../api/baseAPI";
import { QRLogo } from "../components";

interface EventOption {
   name: string;
   availableSeats: number;
   price: number;
   id: string;
}

export const CheckoutPage = () => {
   const [events, setEvents] = useState<EventOption[]>([]);
   const [email, setEmail] = useState("");
   const [eventId, setEventId] = useState("");
   const [area, setArea] = useState("General");
   const [successMessage, setSuccessMessage] = useState(false);
   const [ticketId, setTicketId] = useState<string | null>(null);
   useEffect(() => {
      document.title = "Genera tu QR";
      fetchEvents();
   }, []);

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
   };

   const fetchEvents = async () => {
      try {
         const res = await baseAPI.get("/events");
         if (!res.status) throw new Error("Failed to fetch events");
         const data = (await res.data) as EventOption[];
         setEvents(data);
      } catch (err) {
         console.error("Error fetching events:", err);
      }
   };
   return (
      <main className="flex flex-col text-2xl items-center justify-center min-h-screen bg-gray-100 p-4">
         <div className="flex flex-col items-center gap-2 py-4">
            <QRLogo />
            {/* <h1 className="text-2xl font-semibold mb-6">Genera tu Ticket QR</h1> */}
         </div>
         <form
            onSubmit={handleSubmit}
            className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-md"
         >
            <div className="mb-4">
               <label
                  htmlFor="email"
                  className="block text-gray-700 text-sm font-bold mb-2"
               >
                  Email:
               </label>
               <input
                  type="email"
                  id="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
               />
            </div>

            <div className="mb-4">
               <label
                  htmlFor="eventId"
                  className="block text-gray-700 text-sm font-bold mb-2"
               >
                  Event:
               </label>
               <select
                  id="eventId"
                  required
                  value={eventId}
                  onChange={(e) => setEventId(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
               >
                  <option value="">Pick an event</option>
                  {events.map((event) => (
                     <option key={event.id} value={event.id}>
                        {event.name}
                     </option>
                  ))}
               </select>
            </div>

            <div className="mb-4">
               <label
                  htmlFor="area"
                  className="block text-gray-700 text-sm font-bold mb-2"
               >
                  Area:
               </label>
               <select
                  id="area"
                  required
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
               >
                  <option value="General">General</option>
                  <option value="VIP">VIP</option>
                  <option value="UltraVIP">UltraVIP</option>
               </select>
            </div>

            {/* <div className="mb-4 flex items-center">
               <input
                  type="checkbox"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  className="mr-2 leading-tight"
               />
               <label className="text-gray-700 text-sm">Enviar por email</label>
            </div>

            <button
               type="submit"
               className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            >
               Generar Ticket PDF
            </button> */}
         </form>
         {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 w-full max-w-md">
               <strong className="font-bold">¡Success!</strong>
               <br />
               <span className="block sm:inline">
                 Your ticket has been generated successfully and sent to <strong>{email}</strong>
                 </span>
               <br />
               <span className="block sm:inline">
                 You can download it from the link that will appear after the payment is completed.
               </span>
            </div>
         )}
         <div className="w-full max-w-md">
            <PayPalButtons
               createOrder={async (_data, actions) => {
                  const resp = await baseAPI.post(
                     "/tickets/generate-without-sending",
                     {
                        email,
                        eventId,
                        area: "UltraVIP",
                        sendEmail: true,
                     }
                  );
                  console.log("Respuesta del servidor:", resp.data);
                  setTicketId(resp.data.ticketId);
                  return actions.order.create({
                     intent: "CAPTURE",
                     purchase_units: [
                        {
                           amount: {
                              value: "40.00",
                              currency_code: "USD",
                           },
                        },
                     ],
                  });
               }}
               onApprove={(_data, actions) => {
                  return actions.order!.capture().then(async (details) => {
                     setSuccessMessage(true);
                     console.log("Detalles de la transacción:", details);
                     fetch(
                        `${
                           import.meta.env.VITE_API_HOST
                        }/payments/paypal/checkout/${ticketId}`,
                        {
                           method: "POST",
                        }
                     ).then((response) => {
                        response.blob().then((blob) => {
                           const url = window.URL.createObjectURL(blob);
                           window.open(url);
                           const a = document.createElement("a");
                           a.href = url;
                           a.download = "ticket.pdf"; // Nombre del archivo
                           document.body.appendChild(a);
                           a.click();
                           a.remove();
                        });
                     });

                     // const resp = await baseAPI.post(
                     //    `/payments/paypal/checkout/${ticketId}`
                     // );
                     // const data = await resp.data;
                     // console.log("Detalles de la transacción:", details, data);
                     // const blob = resp.data;
                     // console.log("Blob:", blob);
                     // const blob = new Blob(data, { type: "application/pdf" });
                     // const url = window.URL.createObjectURL(blob);
                     // window.open(url);
                  });
               }}
            />
         </div>
      </main>
   );
};
