import "./globals.css";

export const metadata = {
  title: "Nusantara RPG",
  description: "Tactical Map & Economy RPG Game of Nusantara Kingdoms",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link 
          rel="stylesheet" 
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" 
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" 
          crossOrigin="" 
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
