import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Ventas from "./pages/Ventas";
import Productos from "./pages/Productos";
import Inventario from "./pages/Inventario";
import Categorias from "./pages/Categorias";
import Unidades from "./pages/Unidades";
import Compras from "./pages/Compras";
import Clientes from "./pages/Clientes";


function RutaProtegida({ children }) {
  const token = localStorage.getItem("token");
  return token ? <Layout>{children}</Layout> : <Navigate to="/login" />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/ventas" element={<RutaProtegida><Ventas /></RutaProtegida>} />
        <Route path="/productos" element={<RutaProtegida><Productos /></RutaProtegida>} />
        <Route path="/inventario" element={<RutaProtegida><Inventario /></RutaProtegida>} />
        <Route path="/categorias" element={<RutaProtegida><Categorias /></RutaProtegida>} />
        <Route path="/unidades" element={<RutaProtegida><Unidades /></RutaProtegida>} />
        <Route path="/compras" element={<RutaProtegida><Compras /></RutaProtegida>} />
        <Route path="/clientes" element={<RutaProtegida><Clientes /></RutaProtegida>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
