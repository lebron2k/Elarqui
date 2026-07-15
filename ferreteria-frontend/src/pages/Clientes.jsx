import{useState,useEffect} from 'react';
import {getClientes, createCliente, editarCliente} from '../services/api';
import "../css/cliente.css";



function clientes(){

const [clientes, setClientes] = useState([]);
const [cargando, setCargando] = useState(true);
const [error, setError] = useState(null);
const [clienteEditar, setClienteEditar] = useState(null);
const [mostrarFormulario, setMostrarFormulario] = useState(false);
const [formulario, setFormulario] = useState({
    nombre: '',
    direccion: '',
    nit: '',
    nrc: ''
});

const cargarClientes = () => {
    getClientes()
        .then(data => { setClientes(data); setCargando(false); })
        .catch(err => { setError(err.message); setCargando(false); });}

useEffect(() => {
    cargarClientes();
}, []);        

const handleChange = (e) => {
    setFormulario({
        ...formulario,
        [e.target.name]: e.target.value
    });
}

const handleAgregar = () => {
    setClienteEditar(null);
    setMostrarFormulario(true);
    setFormulario({
        nombre: '',
        direccion: '',
        nit: '',
        nrc: ''
    });
}

const handleEditar =(cliente)=>{
    
    setMostrarFormulario(true);
    setFormulario({
      
        nombre: cliente.nombre,
        direccion: cliente.direccion,
        nit: cliente.nit,
        nrc: cliente.nrc
    });
    setClienteEditar(cliente);
}

const handleGuardar = () => {
    const datos = {
        
        nombre: formulario.nombre,
        direccion: formulario.direccion,
        nit: formulario.nit,
        nrc: formulario.nrc
    };

    if (clienteEditar) {
        editarCliente(clienteEditar.idCliente, datos)
            .then(() => {
                cargarClientes();
                setMostrarFormulario(false);
            })
            .catch(err => setError(err.message));
    } else {
        createCliente(datos)
            .then(() => {
                cargarClientes();
                setMostrarFormulario(false);
            })
            .catch(err => setError(err.message));
    }
};
 if (cargando) return <p>Cargando clientes...</p>;
    if (error) return <p>Error: {error}</p>;

    return(
       
 
    <>
    <button id="agregar-btnnn" className="agregar-btnn" onClick={handleAgregar}>Agregar Cliente</button>

      {mostrarFormulario ? (
        <div className="form-producto">
          <h3><span>{clienteEditar? `Editar: ${clienteEditar.nombre}` : 'Agregar Cliente'}</span></h3>
          <label>Nombre</label>
          <input name="nombre" value={formulario.nombre} onChange={handleChange} />
          <label>Dirección</label>
          <input name="direccion" value={formulario.direccion} onChange={handleChange} />
          <label>NIT</label>
          <input name="nit" value={formulario.nit} onChange={handleChange} />
          <label>NRC</label>
          <input name="nrc" value={formulario.nrc} onChange={handleChange} />
          <div className="acciones-form">
            <button className="btn-guardar" onClick={handleGuardar}>Guardar</button>
            <button className="btn-cancelar" onClick={() => setMostrarFormulario(false)}>Cancelar</button>
          </div>
        </div>
      ) : (

        

        <section id="cliente-table">
          <main className="row title">
            <ul>
              <li>ID</li>
              <li>Nombre</li>
              <li>Dirección</li>
              <li>NIT</li>
              <li>NRC</li>
              <li>Acciones</li>
            </ul>
          </main>

          {clientes.map((cliente) => (
            <article className="row producto" key={cliente.idCliente}>
              <ul>
                <li>{cliente.idCliente}</li>
                <li>{cliente.nombre}</li>
                <li>{cliente.direccion}</li>
                <li>{cliente.nit}</li>
                <li>{cliente.nrc}</li>
                <li>
                  <button
                    className="btn-editar"
                    onClick={() => handleEditar(cliente)}
                  >
                    Editar
                  </button>
                  
                </li>
              </ul>
            </article>
          ))}
        </section>
      )}
    </>
    )
}


               

export default clientes;