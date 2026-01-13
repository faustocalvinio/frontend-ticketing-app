import { BrowserRouter, Route, Routes } from "react-router";
import { ValidateQR, HomePage, EventsPage } from "./pages";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

const initialOptions = {
   clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
   currency: "USD",
   intent: "capture",
};

export const App = () => {
   return (
      <PayPalScriptProvider options={initialOptions}>
         <BrowserRouter>
            <Routes>
               <Route path="/" element={<HomePage />} />
               <Route path="/events" element={<EventsPage />} />
               <Route path="/validate-qr" element={<ValidateQR />} />
               <Route path="*" element={<div>404 Not Found</div>} />
            </Routes>
         </BrowserRouter>
      </PayPalScriptProvider>
   );
};
