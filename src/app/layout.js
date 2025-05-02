import "@/app/globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Container } from "react-bootstrap";
import Footer from "@/components/Footer";
import NavigationBar from "@/components/Navbar";
export const metadata = {
  title: "FS Shop",
  description: "CS391's 2nd Project",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="d-flex flex-column min-vh-100">
        <NavigationBar />
        <Container className="flex-grow-1 px-0">{children}</Container>
        <Footer />
      </body>
    </html>
  );
}
