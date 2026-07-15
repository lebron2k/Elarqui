import { useState, useEffect } from "react";
import { crearVenta, getVentas, anularVenta, getVentaById, getProductos, getClientes,getInventario } from "../services/api";
import "../css/venta.css";

// lee el rol desde el token (mismo patrón que Navbar.jsx)
function getRol() {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
}

function Ventas() {
    const rol = getRol();

    const [ventas, setVentas] = useState([]);
    const [productos, setProductos] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [inventario, setInventario] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");

    // mostrar u ocultar el formulario de registrar venta
    const [mostrarFormulario, setMostrarFormulario] = useState(false);

    // datos generales de la venta
    const [idCliente, setIdCliente] = useState("");
    const [idTipoDocumento, setIdTipoDocumento] = useState("1");

    // lista de productos de la venta
    const [detalles, setDetalles] = useState([
        {
            idProducto: "",
            nombre: "",
            precioUnitario: "",
            
            cantidad: ""
        }
    ]);

    // búsqueda de venta por ID (para ver el detalle)
    const [buscarId, setBuscarId] = useState("");
    const [ventaDetalle, setVentaDetalle] = useState(null);

    // filtro de la tabla: todas / hoy / este mes
    const [filtro, setFiltro] = useState("todas");

    const cargarVentas = () => {
        getVentas().then(data => { setVentas(data); setCargando(false); })
        .catch(err => { setError(err.message); setCargando(false); });
    }

    useEffect(() => {
        cargarVentas();

        getProductos().then(data => setProductos(data))
        .catch(err => setError(err.message));

        getClientes().then(data => setClientes(data))
        .catch(err => setError(err.message));

        getInventario().then(data => setInventario(data))
        .catch(err => setError(err.message));
    }, []);

    const handleAgregar = () => {
        setIdCliente("");
        setIdTipoDocumento("1");
        setDetalles([{
            idProducto: "",
            nombre: "",
            precioUnitario: "",
            stockActual: "",
            cantidad: ""
        }]);
        setMensaje("");
        setMostrarFormulario(true);
    }

    // cuando se elige un producto en el select, autocompleta precio y stock
    const handleSeleccionarProducto = (index, idProductoStr) => {
        const producto = productos.find(p => p.idProducto === parseInt(idProductoStr));
        const nuevosDetalles = [...detalles];
        nuevosDetalles[index] = {
            ...nuevosDetalles[index],
            idProducto: idProductoStr,
            nombre: producto ? producto.nombre : "",
            precioUnitario: producto ? producto.precio : "",
            stockActual: inventario ? inventario.find(i => i.idProducto === parseInt(idProductoStr))?.stockActual : "",
            cantidad: ""
        };
        setDetalles(nuevosDetalles);
    }

    const handleChangeCantidad = (index, value) => {
        const nuevosDetalles = [...detalles];
        nuevosDetalles[index] = { ...nuevosDetalles[index], cantidad: value };
        setDetalles(nuevosDetalles);
    }

    const handleAgregarProducto = () => {
        setDetalles([...detalles, {
            idProducto: "",
            nombre: "",
            precioUnitario: "",
            stockActual: "",
            cantidad: ""
        }]);
    }

    const handleQuitarProducto = (index) => {
        if (detalles.length === 1) return;
        setDetalles(detalles.filter((_, i) => i !== index));
    }

    const calcularSubtotalLinea = (detalle) => {
        const cantidad = parseFloat(detalle.cantidad) || 0;
        const precio = parseFloat(detalle.precioUnitario) || 0;
        return cantidad * precio;
    }

    const calcularTotal = () => {
        return detalles.reduce((total, d) => total + calcularSubtotalLinea(d), 0);
    }

    const handleGuardar = () => {
        const lineas = detalles.filter(d => d.idProducto && parseFloat(d.cantidad) > 0);

        if (lineas.length === 0) {
            alert("Agrega al menos un producto con cantidad");
            return;
        }

        const excedeStock = lineas.find(d => parseFloat(d.cantidad) > parseFloat(d.stockActual));
        if (excedeStock) {
            alert(`No hay suficiente stock de "${excedeStock.nombre}" (disponible: ${excedeStock.stockActual})`);
            return;
        }

        const datos = {
            idCliente: idCliente ? parseInt(idCliente) : null,
            // el login actual no devuelve el idUsuario del cajero, se deja fijo por ahora
            idUsuario: 1,
            idTipoDocumento: parseInt(idTipoDocumento),
            productos: lineas.map(d => ({
                idProducto: parseInt(d.idProducto),
                cantidad: parseFloat(d.cantidad),
                precioUnitario: parseFloat(d.precioUnitario),
                stockActual: parseFloat(d.stockActual),
                
            }))
        };

        crearVenta(datos).then((res) => {
            setMensaje(`Venta ${res.correlativo} registrada. Total: $${res.total}`);
            cargarVentas();
            setMostrarFormulario(false);
        }).catch(err => alert("Error al registrar venta: " + err.message));
    }

    // anular una venta (solo Admin)
    const handleAnular = (id) => {
        if (!window.confirm(`¿Anular la venta #${id}? Esta acción no se puede deshacer.`)) return;

        anularVenta(id).then(() => {
            cargarVentas();
        }).catch(err => alert("Error al anular venta: " + err.message));
    }

    // buscar el detalle de una venta por ID
    const handleBuscar = async () => {
        if (!buscarId) {
            setVentaDetalle(null);
            return;
        }
        try {
            const venta = await getVentaById(buscarId);
            setVentaDetalle(venta);
        } catch {
            setVentaDetalle(null);
            alert("No se encontró la venta");
        }
    }

    // filtra el array de ventas según el filtro elegido, comparando la fecha de cada venta con hoy
    const obtenerVentasFiltradas = () => {
        if (filtro === "todas") return ventas;

        const hoy = new Date();
        return ventas.filter((v) => {
            const fecha = new Date(v.fecha);
            const mismoMes = fecha.getMonth() === hoy.getMonth() && fecha.getFullYear() === hoy.getFullYear();

            if (filtro === "mes") return mismoMes;
            if (filtro === "dia") return mismoMes && fecha.getDate() === hoy.getDate();
            return true;
        });
    }

    const ventasFiltradas = obtenerVentasFiltradas();
    const totalFiltrado = ventasFiltradas.reduce((acc, v) => acc + v.total, 0);

    if (cargando) return <p>Cargando...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div>
            <button className="agregar-btnn" onClick={handleAgregar}>Registrar venta</button>

            <input
                type="number"
                value={buscarId}
                onChange={(e) => {
                    setBuscarId(e.target.value);
                    if (!e.target.value) setVentaDetalle(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleBuscar()}
                placeholder="Buscar venta por ID"
                id="buscarP"
            />
            <button className="agregar-btnn" id="buscarP" onClick={handleBuscar}>Buscar ID</button>

            {mostrarFormulario ? (
                <div className="form-producto">
                    <h3>Registrar Venta</h3>

                    {mensaje && <p>{mensaje}</p>}

                    <label>Cliente</label>
                    <select value={idCliente} onChange={(e) => setIdCliente(e.target.value)}>
                        <option value="">Consumidor Final (sin cliente)</option>
                        {clientes.map((c) => (
                            <option key={c.idCliente} value={c.idCliente}>
                                {c.nombre}
                            </option>
                        ))}
                    </select>

                    <label>Tipo de Documento</label>
                    <select value={idTipoDocumento} onChange={(e) => setIdTipoDocumento(e.target.value)}>
                        <option value="1">Consumidor Final (CF)</option>
                        <option value="2">Crédito Fiscal (CCF)</option>
                    </select>

                    {detalles.map((detalle, index) => (
                        <div key={index} className="detalle-linea">
                            <label>Producto</label>
                            <select value={detalle.idProducto} onChange={(e) => handleSeleccionarProducto(index, e.target.value)}>
                                <option value="">Seleccione un producto</option>
                                {productos.map((prod) => (
                                    <option key={prod.idProducto} value={prod.idProducto}>
                                        {prod.nombre}
                                    </option>
                                ))}
                            </select>

                            {detalle.idProducto && (
                                <p className="small-info">
                                    Precio: ${parseFloat(detalle.precioUnitario || 0).toFixed(2)} &nbsp;|&nbsp; Stock disponible: {detalle.stockActual}
                                </p>
                            )}

                            <label>Cantidad</label>
                            <input
                                type="number"
                                placeholder="Cantidad"
                                value={detalle.cantidad}
                                onChange={(e) => handleChangeCantidad(index, e.target.value)}
                            />

                            <p className="small-info">Subtotal: ${calcularSubtotalLinea(detalle).toFixed(2)}</p>

                            <input type="button" className="btn-eliminar" value="Quitar" onClick={() => handleQuitarProducto(index)} />
                        </div>
                    ))}

                    <input type="button" className="agregar-btnn" value="Agregar producto" onClick={handleAgregarProducto} />

                    <p>Total: ${calcularTotal().toFixed(2)}</p>

                    <input name="guardar" className="btn-guardarf" type="button" value="Guardar" onClick={handleGuardar} />
                    <input name="cancelar" className="btn-cancelarf" type="button" value="Cancelar" onClick={() => setMostrarFormulario(false)} />
                </div>
            ) : ventaDetalle ? null : (
                <section className="wrapper ventas-tabla">
                    <div className="filtros-venta">
                       
                        <button
                           id="filtro-todas" className={filtro === "todas" ? "agregar-btnn activo" : "agregar-btnn"}
                            onClick={() => setFiltro("todas")}
                        >
                            Todas
                        </button>
                        <button
                            id="filtro-todas" className={filtro === "mes" ? "agregar-btnn activo" : "agregar-btnn"}
                            onClick={() => setFiltro("mes")}
                        >
                            Ventas del mes
                        </button>
                        <button
                            id="filtro-todas" className={filtro === "dia" ? "agregar-btnn activo" : "agregar-btnn"}
                            onClick={() => setFiltro("dia")}
                        >
                            Ventas de hoy
                        </button>
                    </div>
                    

                    <p id="filtro-todas" className="small-info">
                        {ventasFiltradas.length} venta(s) — Total: ${totalFiltrado.toFixed(2)}
                    </p>
                    <br></br>

                    <main className="row title">
                        <ul>
                            <li>ID</li>
                            <li>Cliente</li>
                            <li>Fecha</li>
                            <li>Total</li>
                            <li>Estado</li>
                            <li></li>
                        </ul>
                    </main>

                    {ventasFiltradas.map((venta) => (
                        <article className="row producto" key={venta.idVenta}>
                            <ul>
                                <li>{venta.idVenta}</li>
                                <li>{venta.nombreCliente || "Consumidor Final"}</li>
                                <li>{new Date(venta.fecha).toLocaleDateString()}</li>
                                <li>${venta.total.toFixed(2)}</li>
                                <li>{venta.estado}</li>
                                <li>
                                    {rol === "Admin" && venta.estado === "EMITIDA" && (
                                        <button className="btn-eliminar" onClick={() => handleAnular(venta.idVenta)}>Anular</button>
                                    )}
                                </li>
                            </ul>
                        </article>
                    ))}
                </section>
            )}

            {ventaDetalle && (
                <section className="wrapper detalle-venta">
                    <h3>Detalle de la venta #{ventaDetalle.idVenta} ({ventaDetalle.correlativo})</h3>
                    <p>Cliente: {ventaDetalle.nombreCliente || "Consumidor Final"}</p>
                    <p>Fecha: {new Date(ventaDetalle.fecha).toLocaleDateString()}</p>
                    <p>Estado: {ventaDetalle.estado}</p>

                    <main className="row title detalle-venta-tabla">
                        <ul>
                            <li>Producto</li>
                            <li>Medida</li>
                            <li>Cantidad</li>
                            <li>Precio Unitario</li>
                        </ul>
                    </main>

                    {ventaDetalle.productos.map((d, index) => (
                        <article className="row producto detalle-venta-tabla" key={index}>
                            <ul>
                                <li>{d.producto}</li>
                                <li>{d.medida}</li>
                                <li>{d.cantidad}</li>
                                <li>${d.precioUnitario.toFixed(2)}</li>
                            </ul>
                        </article>
                    ))}

                    <p>Subtotal: ${ventaDetalle.subtotal.toFixed(2)}</p>
                    <p>IVA: ${ventaDetalle.iva.toFixed(2)}</p>
                    <p>Total: ${ventaDetalle.total.toFixed(2)}</p>
                </section>
            )}
        </div>
    )
}
export default Ventas;
