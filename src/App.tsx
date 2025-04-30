import { BrowserRouter, Route, Routes } from "react-router";
import { CreateEvent, ValidateQR, CheckoutPage } from "./pages";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

const initialOptions = {
   clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
   currency: "USD",
   intent: "capture",
};

export const App = () => {
   return (
      <PayPalScriptProvider options={initialOptions}>
         {/* <Checkout/> */}
         <BrowserRouter>
            <Routes>
               {/* <Route path="/" element={<GenerateQR />} /> */}
               <Route path="/events" element={<CreateEvent />} />
               <Route path="/validate-qr" element={<ValidateQR />} />
               <Route path="/" element={<CheckoutPage />} />
               <Route path="*" element={<div>404 Not Found</div>} />
            </Routes>
         </BrowserRouter>
      </PayPalScriptProvider>
   );
};
