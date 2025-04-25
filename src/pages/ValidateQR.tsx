import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

export const ValidateQR = () => {
   const [result, setResult] = useState<string | null>(null);
   const readerRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      const html5QrCode = new Html5Qrcode("reader");
      const baseURL =
         "https://ticketing-app-bu5y.onrender.com/api/tickets/validate/";
      console.log(readerRef.current);
      const onScanSuccess = (qrCodeMessage: string) => {
         console.log("✅ QR leído:", qrCodeMessage);
         html5QrCode.stop().then(() => {
            console.log("⛔ Escaneo detenido");

            fetch(`${baseURL}${qrCodeMessage}`)
               .then((res) => res.json())
               .then((data) => {
                  setResult(
                     `<strong>${data.message}</strong><br /><p>Evento: ${data.eventName}</p><p>Email: ${data.email}</p>`
                  );
               })
               .catch(() => {
                  setResult("<strong>Error al validar el ticket</strong>");
               });
         });
      };

      html5QrCode.start(
         { facingMode: "environment" },
         {
            fps: 10,
            qrbox: { width: 250, height: 250 },
         },
         onScanSuccess,
         (errorMessage) => {
            console.warn("⚠️ Error de escaneo:", errorMessage);
         }
      );

      return () => {
         html5QrCode
            .stop()
            .catch((err) => console.error("Error al detener la cámara", err));
      };
   }, []);

   return (
      <div>
         <h1>Escanea tu ticket</h1>
         <div id="reader" ref={readerRef}></div>
         <div id="result" dangerouslySetInnerHTML={{ __html: result || "" }} />
         <button onClick={() => window.location.reload()}>Escanear otro</button>
      </div>
   );
};
