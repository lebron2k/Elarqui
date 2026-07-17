import {useState, useEffect} from 'react';
import {getInventario,actualizarInventario,getInventarioById,getInventarioByCategoria,getCategorias} from '../services/api';
import '../css/inventario.css';

function Inventario()
{    const [inventario, setInventario] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

   const [inventarioEditar, setInventarioEditar] = useState(null);
   const [mostrarFormulario, setMostrarFormulario] = useState(false);
   const [formulario, setFormulario] = useState({
    
   stockMinimo: '',
    stockActual: '',
   });

   const handleChange =(e)=>{
        const [name, value] = [e.target.name, e.target.value];
       
       
        setFormulario({...formulario, [name]: value});
    }

    const handleEditar = (producto) => {
        setInventarioEditar(producto);
        setFormulario({ 
            idProducto: producto.idProducto,
            stockMinimo: producto.stockMinimo,
            stockActual: producto.stockActual
        });
        setMostrarFormulario(true); 
        };

const handleGuardar = () => {
  const datos = {
    idProducto: formulario.idProducto,
    stockMinimo: parseFloat(formulario.stockMinimo),
    stockActual: parseFloat(formulario.stockActual)
  };
  console.log(datos);
  actualizarInventario(inventarioEditar.idProducto, datos)
    .then(() => {
      cargarInventario();
      setMostrarFormulario(false);
    });
};

const [buscarId, setBuscarId] = useState("");
const [productosFiltrados, setProductosFiltrados] = useState(null);

const handleBuscar = async () => {
  if (!buscarId || isNaN(buscarId)) {   // ← valida que sea número
    setProductosFiltrados(null);
    return;
  }
  try {
    const producto = await getInventarioById(Number(buscarId)); // ← convierte a número
    setProductosFiltrados([producto]);
  } catch (error) {
    setError(error.message);
    setProductosFiltrados(null);
  }
};

 const [categorias, setCategorias] = useState([]);
const obtenerCategorias = async () => {
    try {
        const data = await getCategorias();
        setCategorias(data);
    } catch (error) {
        console.error(error);
    }
};


const[buscarCategoria, setBuscarCategoria] = useState("");
const[productosFiltradosCat, setProductosFiltradosCat] = useState(null);

const handleBuscarCategoria = async () => {
    if (!buscarCategoria) {
        setProductosFiltradosCat(null);
        return;
    }
    try {
        const productos = await getInventarioByCategoria(buscarCategoria);
        console.log(productos);
        setProductosFiltradosCat(productos); 
    } catch (error) {
        setProductosFiltradosCat(null);
    }
};



const cargarInventario = () => {
getInventario()
.then(data => setInventario(data))
.catch(err => setError(err.message))
.finally(() => setLoading(false));
}

useEffect(() => {
    cargarInventario();
    obtenerCategorias();
}, []);


    return  (
  <div className="inventario-page">

    <div className="toolbar"><input
    type="number"
    value={buscarId}
    onChange={(e) => {
        setBuscarId(e.target.value);
        if (!e.target.value) setProductosFiltrados(null);
    }}
    onKeyDown={(e) => e.key === "Enter" && handleBuscar()}
    placeholder="Buscar por ID"
    id="buscarP1"
/>
<button className="agregar-btnn" id="buscarP" onClick={handleBuscar}>Buscar ID</button>
               <select
    className="buscarCat"
    value={buscarCategoria}
    onChange={(e) => {
        setBuscarCategoria(e.target.value);
        if (!e.target.value) setProductosFiltradosCat(null);
    }}
>
    <option value="">Todas las categorías</option>
    {categorias.map((categoria) => (
        <option key={categoria.idCategoria} value={categoria.idCategoria}>
            {categoria.nombre}
        </option>
    ))}
</select>
<button className="buscarCat" onClick={handleBuscarCategoria}>Buscar Categoría</button>
</div>
    
    {loading && <p className="inventario-loading">Cargando...</p>}
    {error   && <p className="inventario-error">Error: {error}</p>}

    {mostrarFormulario ? (
      <div className="form-producto">
        <h3>Editar stock — <span>{inventarioEditar?.nombreProducto}</span></h3>
        <label>Stock mínimo</label>
        <input name="stockMinimo" value={formulario.stockMinimo} onChange={handleChange} />
        <label>Stock actual</label>
        <input name="stockActual" value={formulario.stockActual} onChange={handleChange} />
        <div className="acciones-form">
          <button className="btn-guardar" onClick={handleGuardar}>Guardar</button>
          <button className="btn-cancelar" onClick={() => setMostrarFormulario(false)}>Cancelar</button>
        </div>
      </div>
    ) : 
    

    
    <section id="inventario-table" >

      <main className="row title">
        <ul>
          <li>ID</li>
          <li>Producto</li>
          <li>Stock mínimo</li>
          <li>Stock actual</li>
          <li></li>
        </ul>
      </main>

      {(productosFiltradosCat ?? productosFiltrados ?? inventario).map((item) => (
        <article className="row nfl" key={item.idProducto}>
          <ul>
            <li>{item.idProducto}</li>
            <li>{item.nombreProducto}</li>
            <li>{item.stockMinimo}</li>
            <li>{item.stockActual}</li>
            <li>
              <button className="btn-editar" onClick={() => handleEditar(item)} >
                Editar
              </button>
            </li>
          </ul>
        </article>
      ))}

    </section>}

    
  </div>

      );
}
export default Inventario;