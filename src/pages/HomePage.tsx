import { PayPalButtons } from "@paypal/react-paypal-js";
import { useEffect, useRef, useState } from "react";
import baseAPI from "../api/baseAPI";
import { QRLogo } from "../components";

interface EventOption {
   name: string;
   availableSeats: number;
   price: number;
   id: string;
}

export const HomePage = () => {
   const [events, setEvents] = useState<EventOption[]>([]);
   const [email, setEmail] = useState("");

   const [eventId, setEventId] = useState("");
   const [area, setArea] = useState("General");
   const [successMessage, setSuccessMessage] = useState(false);
   const ticketIdRef = useRef<string | null>(null);
   const [isPayPalFlowActive, setIsPayPalFlowActive] = useState(false);
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
      <main className="min-h-screen bg-gray-100 py-8 px-4">
         <div className="mx-auto w-full max-w-6xl">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-start md:gap-10">
               <section className="flex flex-col gap-4">
                  <div className="flex flex-col items-center gap-3 py-4">
                     <QRLogo />
                  </div>

                  <form
                     onSubmit={handleSubmit}
                     className="bg-white shadow-lg rounded-lg px-8 pt-8 pb-8 w-full"
                  >
                     <div className="mb-5">
                        <label
                           htmlFor="email"
                           className="block text-gray-800 text-sm font-semibold mb-2"
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
                           disabled={isPayPalFlowActive}
                           className="shadow-sm appearance-none border border-gray-300 rounded-md w-full py-2.5 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60 disabled:bg-gray-100"
                        />
                     </div>

                     <div className="mb-5">
                        <label
                           htmlFor="eventId"
                           className="block text-gray-800 text-sm font-semibold mb-2"
                        >
                           Event:
                        </label>
                        <select
                           id="eventId"
                           required
                           value={eventId}
                           onChange={(e) => setEventId(e.target.value)}
                           disabled={isPayPalFlowActive}
                           className="shadow-sm appearance-none border border-gray-300 rounded-md w-full py-2.5 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60 disabled:bg-gray-100"
                        >
                           <option value="">Pick an event</option>
                           {events.map((event) => (
                              <option key={event.id} value={event.id}>
                                 {event.name}
                              </option>
                           ))}
                        </select>
                     </div>

                     <div className="mb-5">
                        <label
                           htmlFor="area"
                           className="block text-gray-800 text-sm font-semibold mb-2"
                        >
                           Area:
                        </label>
                        <select
                           id="area"
                           required
                           value={area}
                           onChange={(e) => setArea(e.target.value)}
                           disabled={isPayPalFlowActive}
                           className="shadow-sm appearance-none border border-gray-300 rounded-md w-full py-2.5 px-3 text-gray-900 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-60 disabled:bg-gray-100"
                        >
                           <option value="General">General</option>
                           <option value="VIP">VIP</option>
                           <option value="UltraVIP">UltraVIP</option>
                        </select>
                     </div>

                     {isPayPalFlowActive && (
                        <div className="text-sm text-blue-600 font-medium bg-blue-50 p-3 rounded-md border border-blue-200">
                           Checkout de PayPal en curso: datos bloqueados.
                        </div>
                     )}
                  </form>
               </section>

               <section className="flex flex-col gap-4">
                  {successMessage && (
                     <div className="bg-green-50 border-2 border-green-400 text-green-800 px-5 py-4 rounded-lg relative shadow-sm">
                        <strong className="font-bold text-lg">¡Success!</strong>
                        <br />
                        <span className="block sm:inline">
                           Your ticket has been generated successfully and sent
                           to <strong>{email}</strong>
                        </span>
                        <br />
                        <span className="block sm:inline">
                           You can download it from the link that will appear
                           after the payment is completed.
                        </span>
                     </div>
                  )}

                  <div className="bg-white shadow-lg rounded-lg px-6 py-7 w-full">
                     <div className="text-lg text-gray-900 font-bold mb-5">
                        Pago
                     </div>
                     <PayPalButtons
                        disabled={!email || !eventId || isPayPalFlowActive}
                        onClick={() => {
                           setIsPayPalFlowActive(true);
                        }}
                        createOrder={async (_data, actions) => {
                           setIsPayPalFlowActive(true);
                           const resp = await baseAPI.post(
                              "/tickets/generate-without-sending",
                              {
                                 email,
                                 eventId,
                                 area,
                                 sendEmail: true,
                              }
                           );
                           ticketIdRef.current = resp.data.ticketId;
                           return actions.order.create({
                              intent: "CAPTURE",
                              application_context: {
                                 shipping_preference: "NO_SHIPPING",
                              },
                              purchase_units: [
                                 {
                                    amount: {
                                       value: resp.data.price.toFixed(2),
                                       currency_code: "USD",
                                    },
                                 },
                              ],
                           });
                        }}
                        onCancel={() => {
                           setIsPayPalFlowActive(false);
                        }}
                        onError={(err) => {
                           console.error("PayPal error:", err);
                           setIsPayPalFlowActive(false);
                        }}
                        onApprove={(_data, actions) => {
                           return actions
                              .order!.capture()
                              .then(async (details) => {
                                 setSuccessMessage(true);

                                 const id = ticketIdRef.current;
                                 if (!id) {
                                    console.error(
                                       "No hay ticketId para completar el checkout."
                                    );
                                    setIsPayPalFlowActive(false);
                                    return;
                                 }

                                 fetch(
                                    `${
                                       import.meta.env.VITE_API_HOST
                                    }/payments/paypal/checkout/${id}`,
                                    {
                                       method: "POST",
                                    }
                                 )
                                    .then((response) => response.blob())
                                    .then((blob) => {
                                       const url =
                                          window.URL.createObjectURL(blob);
                                       window.open(url);
                                       const a = document.createElement("a");
                                       a.href = url;
                                       a.download = "ticket.pdf";
                                       document.body.appendChild(a);
                                       a.click();
                                       a.remove();
                                    })
                                    .finally(() => {
                                       setIsPayPalFlowActive(false);
                                    });
                              });
                        }}
                     />
                  </div>
               </section>
            </div>
         </div>
      </main>
   );
};
