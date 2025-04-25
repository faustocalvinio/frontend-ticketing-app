import { BrowserRouter, Route, Routes } from "react-router";
import { CreateEvent, GenerateQR, ValidateQR } from "./pages";

export const App = () => {
   return (
      <BrowserRouter>
         <Routes>
            <Route path="/" element={<GenerateQR />} />
            <Route path="/events" element={<CreateEvent />} />
            <Route path="/validate-qr" element={<ValidateQR />} />
            <Route path="*" element={<div>404 Not Found</div>} />
         </Routes>
      </BrowserRouter>
   );
};
