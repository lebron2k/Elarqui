import Navbar from "./Navbar";
import "../css/layout.css";

function Layout({ children }) {
  return (
    <div className="layout">
      <Navbar />

      <main className="content">
        {children}
      </main>
    </div>
  );
}

export default Layout;
