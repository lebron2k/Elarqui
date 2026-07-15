import { useState, useEffect } from "react";
import { getProductos,crearProducto,editarProducto,eliminarProducto,getProductoById,getProductosByCategoria,getCategorias } from "../services/api";
import "../css/producto.css";


function Productos(){
    const [productos, setProductos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");

    

    const [categorias, setCategorias] = useState([]);
    //donde vamos a guardar el producto que se va a editar
    const [productoEditar,setProductoEditar] = useState(null);
    //mostrar si esta visible el formulario de agregar/editar
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    //estado para el formulario
    const [form, setForm] = useState({
        codigo: "",
        nombre: "",
        idCategoria: "",
        idUnidadMedida: "",
        precio: "",
        iva: "",
        activo: true,
        stockMinimo: ""
    });

    //copia el form con los cambios del input
    const handleChange =(e)=>{
        const [name, value] = [e.target.name, e.target.value];
       
       
        setForm({...form, [name]: value});
    }

    //abrir formulario para agregar producto
    const handleAgregar =()=>{
        setProductoEditar(null);
        setForm({
            codigo: "",
            nombre: "",
            categoria: "",
            idUnidadMedida: "",
            precio: "",
            iva: false,
            activo: true,
            stockMinimo: ""
        });
        setMostrarFormulario(true);
    }

    //abrir formulario para editar producto con datos cargados
    const handleEditar =(producto)=>{
        setProductoEditar(producto);
        setForm({
            idProducto: producto.idProducto,
            codigo: producto.codigo?? "",
            nombre: producto.nombre,
            categoria: producto.categoria,
            idUnidadMedida: producto.idUnidadMedida,
            precio: producto.precio,
            iva: producto.iva,
            activo: producto.activo,
            stockMinimo: producto.stockMinimo
        });
        setMostrarFormulario(true);
    }

    //eliminar producto
    const handleEliminar = (producto) =>{
        if(!confirm("¿Confirma que desea eliminar este producto?")) return;
        eliminarProducto(producto.idProducto).then(()=>cargarProductos())
        .catch(err => alert("Error al eliminar producto: " + err.message));
    }

    //handle para guardar producto (agregar o editar)
    const handleGuardar = () =>{
        const datos={
            ...form,
             
  idUnidadMedida: parseInt(form.idUnidadMedida),
  precio:         parseFloat(form.precio),
  stockMinimo:    parseFloat(form.stockMinimo) ,
  idCategoria:    categorias.find(c => c.nombre === form.categoria)?.idCategoria || null,
  iva:            form.iva === true || form.iva === "true",
    activo:         form.activo === true || form.activo === "true"
        }
       console.log(JSON.stringify(datos));
        if(productoEditar){
            editarProducto(productoEditar.idProducto, datos).then(()=> {cargarProductos(); setMostrarFormulario(false);})
            
        } else {
            crearProducto(datos).then(()=> {cargarProductos(); setMostrarFormulario(false);})
            
        }
    }   
    const cargarProductos = () => {
  getProductos()
    .then(data => { setProductos(data); setCargando(false); })
    .catch(err => { setError(err.message); setCargando(false); });
};

    useEffect(() => {
        getProductos().then(data => {setProductos(data); setCargando(false);})
        .catch(err => {setError(err.message); setCargando(false);});}, []);

          useEffect(() => {
    obtenerCategorias();
}, []);

const obtenerCategorias = async () => {
    try {
        const data = await getCategorias();
        setCategorias(data);
    } catch (error) {
        console.error(error);
    }
};

//buscar producto por ID
const [buscarId, setBuscarId] = useState("");
const [productosFiltrados, setProductosFiltrados] = useState(null);

const handleBuscar = async () => {
    if (!buscarId) {
        setProductosFiltrados(null);
        return;
    }
    try {
        const producto = await getProductoById(buscarId);
        console.log(producto);
        setProductosFiltrados([producto]);
    } catch (error) {
        setProductosFiltrados(null);
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
        const productos = await getProductosByCategoria(buscarCategoria);
        console.log(productos);
        setProductosFiltradosCat(productos); 
    } catch (error) {
        setProductosFiltradosCat(null);
    }
};

    if (cargando) return <p>Cargando productos...</p>;
    if (error) return <p>Error: {error}</p>;

  
    return (
        <div><button className="agregar-btnn" onClick={handleAgregar}>Agregar producto</button>
       
    <input
    type="number"
    value={buscarId}
    onChange={(e) => {
        setBuscarId(e.target.value);
        if (!e.target.value) setProductosFiltrados(null);
    }}
    onKeyDown={(e) => e.key === "Enter" && handleBuscar()}
    placeholder="Buscar por ID"
    id="buscarP"
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

        {mostrarFormulario ?(
            <div className="form-producto">
                
                <h3>{productoEditar ? "Editar Producto" : "Agregar Producto"}</h3>
               <label>Código</label>
                <input name="codigo" placeholder="Código" value={form.codigo} onChange={handleChange} />
                <label>Nombre</label>
                <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} />
                <label>Categoría</label>
                <select name="categoria" value={form.categoria} onChange={handleChange}>
                 {categorias.map((categoria) => (
    <option key={categoria.idCategoria} value={categoria.idCategoria}>
        {categoria.nombre}
    </option>
))}
                </select>
                <label>Unidad de Medida</label>
                <input name="idUnidadMedida" placeholder="ID Unidad de Medida" value={form.idUnidadMedida} onChange={handleChange} />
                <label>Precio</label>
                <input name="precio" placeholder="Precio" value={form.precio} onChange={handleChange} />
                <label>IVA</label>
<select name="iva" value={form.iva} onChange={handleChange}>
  <option value={true}>Sí</option>
  <option value={false}>No</option>
</select>
   <label>Activo</label>
<select name="activo" value={form.activo} onChange={handleChange}>
  <option value={true}>Sí</option>
  <option value={false}>No</option>
</select>
                <label>Stock Mínimo</label>
                <input name="stockMinimo" placeholder="Stock Mínimo" value={form.stockMinimo} onChange={handleChange} />
                
                <input name="guardar" className="btn-guardarf" type="button" value="Guardar" onClick={handleGuardar} />
                <input name="cancelar" className="btn-cancelarf" type="button" value="Cancelar" onClick={() => setMostrarFormulario(false)}  />
            </div>
        ): <section className="wrapper">

  <main className="row title">
    <ul>
      <li>ID</li>
      <li>Código</li>
      <li>Nombre</li>
      <li>Categoría</li>
      <li>Unidad</li>
      <li>Precio</li>
      <li>IVA</li>
      <li>Activo</li>
      <li></li>
      <li></li>
    </ul>
  </main>
 

  {( productosFiltradosCat??productosFiltrados ?? productos).map((producto)  => (
    <article className="row producto" key={producto.idProducto}>
      <ul>
        <li>{producto.idProducto}</li>
        <li>{producto.codigo}</li>
        <li>{producto.nombre}</li>
        <li>{producto.categoria}</li>
        <li>{producto.idUnidadMedida}</li>
        <li>${producto.precio.toFixed(2)}</li>
        <li>{producto.iva ? "Sí" : "No"}</li>
        <li>{producto.activo ? "Sí" : "No"}</li>
        <li>
              <button
                className="btn-editar"
                onClick={() => handleEditar(producto)}
              >
                Editar
              </button>
        </li>

        <li>
          {producto.activo && (
            <>
            

              <button
                className="btn-eliminar"
                onClick={() => handleEliminar(producto)}
              >
                Eliminar
              </button>
            </>
          )}
        </li>
      </ul>
      
    </article>
  ))}
</section>}
        <br />

           


            <br />
            
        </div>
        
    )
}
export default Productos;