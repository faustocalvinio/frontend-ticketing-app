import { PayPalButtons } from "@paypal/react-paypal-js";
import { useEffect, useState } from "react";
// import { useParams } from "react-router";
import baseAPI from "../api/baseAPI";

interface EventOption {
   name: string;
   availableSeats: number;
   price: number;
   id: string;
}

export const CheckoutPage = () => {
   // const { id } = useParams();
   const [events, setEvents] = useState<EventOption[]>([]);
   const [email, setEmail] = useState("");
   const [eventId, setEventId] = useState("");
   const [area, setArea] = useState("General");
   // const [sendEmail, setSendEmail] = useState(true);
   const [ticketId, setTicketId] = useState<string | null>(null);
   useEffect(() => {
      document.title = "Genera tu QR";
      // console.log("ID de la orden:", id);
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
         // console.log(data);
         setEvents(data);
      } catch (err) {
         console.error("Error fetching events:", err);
      }
   };
   return (
      <main className="flex flex-col text-2xl items-center justify-center h-screen bg-gray-100 p-4">
         {/* <h1 className="text-2xl font-bold mb-4">Orden {id}</h1> */}
         <h1 className="text-2xl font-semibold mb-6">Genera tu QR</h1>
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
                  Evento:
               </label>
               <select
                  id="eventId"
                  required
                  value={eventId}
                  onChange={(e) => setEventId(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
               >
                  <option value="">Selecciona un evento</option>
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
                  Área:
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
                     // alert(`Transacción completada por asdas`);
                     console.log("Detalles de la transacción:", details);
                     fetch(
                        `${import.meta.env.VITE_API_HOST}/payments/paypal/checkout/${ticketId}`,
                        {
                           method: "POST",
                        }
                     ).then((response) => {
                        response.blob().then((blob) => {
                           const url = window.URL.createObjectURL(blob);
                           window.open(url);
                           // const a = document.createElement("a");
                           // a.href = url;
                           // a.download = "ticket.pdf"; // Nombre del archivo
                           // document.body.appendChild(a);
                           // a.click();
                           // a.remove();
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
