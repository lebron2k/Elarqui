import "../css/navbar.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { Receipt, ShoppingCart, Package, ClipboardList, Tag, Ruler, LogOut,Users } from "lucide-react";

const iconColor = "rgba(109, 161, 228, 0.9)";

function getRol() {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
}

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const rol = getRol();

    const [principalOpen, setPrincipalOpen] = useState(true);
    const [catalogoOpen, setCatalogoOpen] = useState(true);
    const [adminOpen, setAdminOpen] = useState(true);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <h2>El Arqui</h2>
                <p>{rol}</p>
            </div>

            <div className="sidebar-section">
                <button
                    className="sidebar-title"
                    onClick={() => setPrincipalOpen(!principalOpen)}
                >
                    Principal
                </button>

                {principalOpen && (
                    <div className="sidebar-links">
                        <button
                            className={location.pathname === "/ventas" ? "active" : ""}
                            onClick={() => navigate("/ventas")}
                        >
                            <Receipt size={20} color={iconColor} /> Ventas
                        </button>

                        <button
                            className={location.pathname === "/compras" ? "active" : ""}
                            onClick={() => navigate("/compras")}
                        >
                            <ShoppingCart size={20} color={iconColor} /> Compras
                        </button>
                    </div>
                )}
            </div>

            <div className="sidebar-section">
                <button
                    className="sidebar-title"
                    onClick={() => setCatalogoOpen(!catalogoOpen)}
                >
                    Catálogo
                </button>

                {catalogoOpen && (
                    <div className="sidebar-links">
                        <button
                            className={location.pathname === "/productos" ? "active" : ""}
                            onClick={() => navigate("/productos")}
                        >
                            <Package size={20} color={iconColor} /> Productos
                        </button>

                        <button
                            className={location.pathname === "/inventario" ? "active" : ""}
                            onClick={() => navigate("/inventario")}
                        >
                            <ClipboardList size={20} color={iconColor} /> Inventario
                        </button>
                    </div>
                )}
            </div>

            {rol === "Admin" && (
                <div className="sidebar-section">
                    <button
                        className="sidebar-title"
                        onClick={() => setAdminOpen(!adminOpen)}
                    >
                        Administración
                    </button>

                    {adminOpen && (
                        <div className="sidebar-links">
                            <button
                                className={location.pathname === "/categorias" ? "active" : ""}
                                onClick={() => navigate("/categorias")}
                            >
                                <Tag size={20} color={iconColor} /> Categorías
                            </button>

                            <button
                                className={location.pathname === "/unidades" ? "active" : ""}
                                onClick={() => navigate("/unidades")}
                            >
                                <Ruler size={20} color={iconColor} /> Unidades de Medida
                            </button>

                             <button
                                className={location.pathname === "/clientes" ? "active" : ""}
                                onClick={() => navigate("/clientes")}
                            >
                                <Users size={20} color={iconColor} /> Clientes
                            </button>
                        </div>
                    )}
                </div>
            )}

            <button
                className="logout-btn"
                onClick={handleLogout}
            >
                <LogOut size={18} color={iconColor} /> Cerrar sesión
            </button>
        </aside>
    );
}

export default Navbar;