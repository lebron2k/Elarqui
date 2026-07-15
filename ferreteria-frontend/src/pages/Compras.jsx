import { useState, useEffect } from "react";
import { getProveedores, getProductos, getCategorias, getUnidades, getCompras, getCompraById, crearCompra, crearProveedor, editarProveedor } from "../services/api";
import "../css/compra.css";

function Compras() {
    const [compras, setCompras] = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [unidades, setUnidades] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [mensaje, setMensaje] = useState("");

    // mostrar u ocultar el formulario de registrar compra
    const [mostrarFormulario, setMostrarFormulario] = useState(false);

    // proveedor seleccionado para la compra
    const [idProveedor, setIdProveedor] = useState("");

    // lista de productos de la compra
    const [detalles, setDetalles] = useState([
        {
            esNuevo: false,
            idProducto: "",
            nombre: "",
            idCategoria: "",
            idUnidadMedida: "",
            precio: "",
            iva: false,
            stockMinimo: "",
            cantidad: "",
            precioUnitario: ""
        }
    ]);

    // búsqueda de compra por ID (para ver el detalle)
    const [buscarId, setBuscarId] = useState("");
    const [compraDetalle, setCompraDetalle] = useState(null);

    // mostrar/ocultar sección y formulario de proveedores
    const [mostrarProveedores, setMostrarProveedores] = useState(false);
    const [mostrarFormProveedor, setMostrarFormProveedor] = useState(false);
    // proveedor que se está editando (null = se está creando uno nuevo)
    const [proveedorEditar, setProveedorEditar] = useState(null);

    const [nuevoProveedor, setNuevoProveedor] = useState({
        nombre: "",
        telefono: "",
        nit: ""
    });

    const cargarCompras = () => {
        getCompras().then(data => { setCompras(data); setCargando(false); })
        .catch(err => { setError(err.message); setCargando(false); });
    }

    const cargarProveedores = () => {
        getProveedores().then(data => setProveedores(data))
        .catch(err => setError(err.message));
    }

    useEffect(() => {
        cargarCompras();
        cargarProveedores();

        getProductos().then(data => setProductos(data))
        .catch(err => setError(err.message));

        getCategorias().then(data => setCategorias(data))
        .catch(err => setError(err.message));

        getUnidades().then(data => setUnidades(data))
        .catch(err => setError(err.message));
    }, []);

    const handleAgregar = () => {
        setIdProveedor("");
        setDetalles([{
            esNuevo: false,
            idProducto: "",
            nombre: "",
            idCategoria: "",
            idUnidadMedida: "",
            precio: "",
            iva: false,
            stockMinimo: "",
            cantidad: "",
            precioUnitario: ""
        }]);
        setMensaje("");
        setMostrarFormulario(true);
    }

    // abre el formulario para agregar un proveedor nuevo
    const handleAgregarProveedor = () => {
        setProveedorEditar(null);
        setNuevoProveedor({ nombre: "", telefono: "", nit: "" });
        setMostrarFormProveedor(true);
    }

    // abre el formulario con los datos cargados para editar
    const handleEditarProveedor = (proveedor) => {
        setProveedorEditar(proveedor);
        setNuevoProveedor({
            nombre: proveedor.nombre,
            telefono: proveedor.telefono,
            nit: proveedor.nit
        });
        setMostrarFormProveedor(true);
    }

    const handleChangeNuevoProveedor = (e) => {
        const { name, value } = e.target;
        setNuevoProveedor({ ...nuevoProveedor, [name]: value });
    };

    const handleGuardarNuevoProveedor = () => {
        const datos = {
            nombre: nuevoProveedor.nombre,
            telefono: nuevoProveedor.telefono,
            nit: nuevoProveedor.nit
        };

        if (proveedorEditar) {
            editarProveedor(proveedorEditar.idProveedor, datos).then(() => {
                setMensaje(`Proveedor ${datos.nombre} editado`);
                cargarProveedores();
                setMostrarFormProveedor(false);
            }).catch(err => alert("Error al editar proveedor: " + err.message));
        } else {
            crearProveedor(datos).then((res) => {
                setMensaje(`Proveedor ${datos.nombre} registrado con ID: ${res.idProveedor}`);
                cargarProveedores();
                setMostrarFormProveedor(false);
            }).catch(err => alert("Error al crear proveedor: " + err.message));
        }
    }


    const handleChangeDetalle = (index, e) => {
        const { name, value, type, checked } = e.target;
        const nuevosDetalles = [...detalles];
        nuevosDetalles[index] = { ...nuevosDetalles[index], [name]: type === "checkbox" ? checked : value };
        setDetalles(nuevosDetalles);
    }

    // marca/desmarca si el producto de esa línea es nuevo
    const handleToggleNuevo = (index) => {
        const nuevosDetalles = [...detalles];
        nuevosDetalles[index] = {
            ...nuevosDetalles[index],
            esNuevo: !nuevosDetalles[index].esNuevo,
            idProducto: "",
            nombre: "",
            idCategoria: "",
            idUnidadMedida: "",
            precio: "",
            iva: false,
            stockMinimo: ""
        };
        setDetalles(nuevosDetalles);
    }

    const handleAgregarProducto = () => {
        setDetalles([...detalles, {
            esNuevo: false,
            idProducto: "",
            nombre: "",
            idCategoria: "",
            idUnidadMedida: "",
            precio: "",
            iva: false,
            stockMinimo: "",
            cantidad: "",
            precioUnitario: ""
        }]);
    }

    const handleQuitarProducto = (index) => {
        if (detalles.length === 1) return;
        setDetalles(detalles.filter((_, i) => i !== index));
    }

    const calcularTotal = () => {
        return detalles.reduce((total, d) => {
            const cantidad = parseFloat(d.cantidad) || 0;
            const precio = parseFloat(d.precioUnitario) || 0;
            return total + cantidad * precio;
        }, 0);
    }

    const handleGuardar = () => {
        if (!idProveedor) {
            alert("Selecciona un proveedor");
            return;
        }

        const datos = {
            idProveedor: parseInt(idProveedor),
            productos: detalles.map(d => ({
                esNuevo: d.esNuevo,
                idProducto: d.esNuevo ? null : parseInt(d.idProducto),
                nombre: d.esNuevo ? d.nombre : null,
                idCategoria: d.esNuevo ? parseInt(d.idCategoria) : null,
                idUnidadMedida: d.esNuevo ? parseInt(d.idUnidadMedida) : null,
                precio: d.esNuevo ? parseFloat(d.precio) : null,
                iva: d.esNuevo ? d.iva : null,
                stockMinimo: d.esNuevo ? parseFloat(d.stockMinimo) : null,
                cantidad: parseFloat(d.cantidad),
                precioUnitario: parseFloat(d.precioUnitario)
            }))
        };

        console.log(JSON.stringify(datos));

        crearCompra(datos).then((res) => {
            setMensaje(`Compra #${res.idCompra} registrada. Total: $${res.total}`);
            cargarCompras();
            setMostrarFormulario(false);
        }).catch(err => alert("Error al registrar compra: " + err.message));
    }

    // buscar el detalle de una compra por ID
    const handleBuscar = async () => {
        if (!buscarId) {
            setCompraDetalle(null);
            return;
        }
        try {
            const compra = await getCompraById(buscarId);
            setCompraDetalle(compra);
        } catch (error) {
            setCompraDetalle(null);
            alert("No se encontró la compra");
        }
    }

    if (cargando) return <p>Cargando...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div>
            <button className="agregar-btnn" onClick={handleAgregar}>Agregar compra</button>

            <input
                type="number"
                value={buscarId}
                onChange={(e) => {
                    setBuscarId(e.target.value);
                    if (!e.target.value) setCompraDetalle(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleBuscar()}
                placeholder="Buscar compra por ID"
                id="buscarP"
            />
            <button className="agregar-btnn" id="buscarP" onClick={handleBuscar}>Buscar ID</button>
            <button className="agregar-btnn" onClick={() => setMostrarProveedores(!mostrarProveedores)}>
                {mostrarProveedores ? "Ocultar proveedores" : "Gestionar proveedores"}
            </button>

            {mostrarProveedores && (
                <div>
                    <button className="agregar-btnn" onClick={handleAgregarProveedor}>Agregar proveedor</button>

                    {mostrarFormProveedor && (
                        <div className="form-producto">
                            <h3>{proveedorEditar ? "Editar Proveedor" : "Agregar Proveedor"}</h3>

                            <label>Nombre</label>
                            <input name="nombre" placeholder="Nombre" value={nuevoProveedor.nombre} onChange={handleChangeNuevoProveedor} />

                            <label>Teléfono</label>
                            <input name="telefono" placeholder="Teléfono" value={nuevoProveedor.telefono} onChange={handleChangeNuevoProveedor} />

                            <label>NIT</label>
                            <input name="nit" placeholder="NIT" value={nuevoProveedor.nit} onChange={handleChangeNuevoProveedor} />

                            <input name="guardar" className="btn-guardarf" type="button" value="Guardar" onClick={handleGuardarNuevoProveedor} />
                            <input name="cancelar" className="btn-cancelarf" type="button" value="Cancelar" onClick={() => setMostrarFormProveedor(false)} />
                        </div>
                    )}

                    <section className="wrapper proveedores-tabla">
                        <main className="row title">
                            <ul>
                                <li>ID</li>
                                <li>Nombre</li>
                                <li>Teléfono</li>
                                <li>NIT</li>
                                <li></li>
                            </ul>
                        </main>

                        {proveedores.map((proveedor) => (
                            <article className="row producto" key={proveedor.idProveedor}>
                                <ul>
                                    <li>{proveedor.idProveedor}</li>
                                    <li>{proveedor.nombre}</li>
                                    <li>{proveedor.telefono}</li>
                                    <li>{proveedor.nit}</li>
                                    <li>
                                        <button className="btn-editar" onClick={() => handleEditarProveedor(proveedor)}>Editar</button>
                                    </li>
                                </ul>
                            </article>
                        ))}
                    </section>
                </div>
            )}

            {mostrarFormulario ? (
                <div className="form-producto">
                    <h3>Registrar Compra</h3>

                    {mensaje && <p>{mensaje}</p>}

                    <label>Proveedor</label>
                    <select value={idProveedor} onChange={(e) => setIdProveedor(e.target.value)}>
                        <option value="">Seleccione un proveedor</option>
                        {proveedores.map((p) => (
                            <option key={p.idProveedor} value={p.idProveedor}>
                                {p.nombre}
                            </option>
                        ))}
                    </select>

                    {detalles.map((detalle, index) => (
                        <div key={index} className="detalle-linea">
                            <label>
                                <input type="checkbox" checked={detalle.esNuevo} onChange={() => handleToggleNuevo(index)} />
                                Producto nuevo
                            </label>

                            {!detalle.esNuevo ? (
                                <>
                                    <label>Producto</label>
                                    <select name="idProducto" value={detalle.idProducto} onChange={(e) => handleChangeDetalle(index, e)}>
                                        <option value="">Seleccione un producto</option>
                                        {productos.map((prod) => (
                                            <option key={prod.idProducto} value={prod.idProducto}>
                                                {prod.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </>
                            ) : (
                                <>
                                    <label>Nombre</label>
                                    <input name="nombre" placeholder="Nombre del producto" value={detalle.nombre} onChange={(e) => handleChangeDetalle(index, e)} />

                                    <label>Categoría</label>
                                    <select name="idCategoria" value={detalle.idCategoria} onChange={(e) => handleChangeDetalle(index, e)}>
                                        <option value="">Seleccione una categoría</option>
                                        {categorias.map((cat) => (
                                            <option key={cat.idCategoria} value={cat.idCategoria}>
                                                {cat.nombre}
                                            </option>
                                        ))}
                                    </select>

                                    <label>Unidad de Medida</label>
                                    <select name="idUnidadMedida" value={detalle.idUnidadMedida} onChange={(e) => handleChangeDetalle(index, e)}>
                                        <option value="">Seleccione una unidad</option>
                                        {unidades.map((u) => (
                                            <option key={u.idUnidadMedida} value={u.idUnidadMedida}>
                                                {u.nombre}
                                            </option>
                                        ))}
                                    </select>

                                    <label>Precio de venta</label>
                                    <input name="precio" type="number" placeholder="Precio de venta" value={detalle.precio} onChange={(e) => handleChangeDetalle(index, e)} />

                                    <label>Stock Mínimo</label>
                                    <input name="stockMinimo" type="number" placeholder="Stock Mínimo" value={detalle.stockMinimo} onChange={(e) => handleChangeDetalle(index, e)} />

                                    <label>
                                        <input name="iva" type="checkbox" checked={detalle.iva} onChange={(e) => handleChangeDetalle(index, e)} />
                                        Aplica IVA
                                    </label>
                                </>
                            )}

                            <label>Cantidad</label>
                            <input name="cantidad" type="number" placeholder="Cantidad" value={detalle.cantidad} onChange={(e) => handleChangeDetalle(index, e)} />

                            <label>Precio Unitario (compra)</label>
                            <input name="precioUnitario" type="number" placeholder="Precio Unitario" value={detalle.precioUnitario} onChange={(e) => handleChangeDetalle(index, e)} />

                            <input type="button" className="btn-eliminar" value="Quitar" onClick={() => handleQuitarProducto(index)} />
                        </div>
                    ))}

                    <input type="button" className="agregar-btnn" value="Agregar producto" onClick={handleAgregarProducto} />

                    <p>Total: ${calcularTotal().toFixed(2)}</p>

                    <input name="guardar" className="btn-guardarf" type="button" value="Guardar" onClick={handleGuardar} />
                    <input name="cancelar" className="btn-cancelarf" type="button" value="Cancelar" onClick={() => setMostrarFormulario(false)} />
                </div>
            ) : (
                <section className="wrapper compras-tabla">
                    <main className="row title">
                        <ul>
                            <li>ID</li>
                            <li>Proveedor</li>
                            <li>Fecha</li>
                            <li>Total</li>
                        </ul>
                    </main>

                    {compras.map((compra) => (
                        <article className="row producto" key={compra.idCompra}>
                            <ul>
                                <li>{compra.idCompra}</li>
                                <li>{compra.nombreProveedor}</li>
                                <li>{new Date(compra.fecha).toLocaleDateString()}</li>
                                <li>${compra.total.toFixed(2)}</li>
                            </ul>
                        </article>
                    ))}
                </section>
            )}

            {compraDetalle && (
                <section className="wrapper detalle-compra">
                    <h3>Detalle de la compra #{compraDetalle.idCompra}</h3>
                    <p>Proveedor: {compraDetalle.nombreProveedor}</p>
                    <p>Fecha: {new Date(compraDetalle.fecha).toLocaleDateString()}</p>

                    <main className="row title detalle-compra-tabla">
                        <ul>
                            <li>Producto</li>
                            <li>Medida</li>
                            <li>Cantidad</li>
                            <li>Precio Unitario</li>
                        </ul>
                    </main>

                    {compraDetalle.detalles.map((d, index) => (
                        <article className="row producto detalle-compra-tabla" key={index}>
                            <ul>
                                <li>{d.producto}</li>
                                <li>{d.medida}</li>
                                <li>{d.cantidad}</li>
                                <li>${d.precioUnitario.toFixed(2)}</li>
                            </ul>
                        </article>
                    ))}
<br></br>
                    <p>Total: ${compraDetalle.total.toFixed(2)}</p>
                </section>
            )}
        </div>
    )
}
export default Compras;