import React from "react";
import { useState, useEffect } from "react";
import { getCategorias, crearCategoria, editarCategoria, eliminarCategoria } from "../services/api";
import "../css/categorias.css";

function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [categoriaEditar, setCategoriaEditar] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formulario, setFormulario] = useState({
    nombre: ''
  });

  const cargarCategorias = () => {
    getCategorias()
      .then(data => { setCategorias(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  };

  useEffect(() => {
    cargarCategorias();
  }, []);

  const handleChange = (e) => {
    setFormulario({
      ...formulario,
      [e.target.name]: e.target.value
    });
  };

  const handleAgregar = () => {
    setMostrarFormulario(true);
    setFormulario({ nombre: "" });
    setCategoriaEditar(null);
  };

  const handleEditar = (categoria) => {
    setMostrarFormulario(true);
    setFormulario({ nombre: categoria.nombre });
    setCategoriaEditar(categoria);
  };

  const handleGuardar = () => {
    const datos = { nombre: formulario.nombre };

    if (categoriaEditar) {
      editarCategoria(categoriaEditar.idCategoria, datos)
        .then(() => {
          cargarCategorias();
          setMostrarFormulario(false);
        });
    } else {
      crearCategoria(datos)
        .then(() => {
          cargarCategorias();
          setMostrarFormulario(false);
        });
    }
  };

  const handleEliminar = (id) => {
    eliminarCategoria(id)
      .then(() => {
        cargarCategorias();
      })
      .catch((error) => {
        alert("No se pudo eliminar la categoría porque tiene productos asociados.");
      });
  };

  if (loading) return <p>Cargando categorías...</p>;
    if (error) return <p>Error: {error}</p>;

  return (
 
    <>
    <div className="toolbar"><button id="agregar-btnn" className="agregar-btnn" onClick={handleAgregar}>Agregar Categoria</button></div>

      {mostrarFormulario ? (
        <div className="form-producto">
          <h3><span>{categoriaEditar? `Editar: ${categoriaEditar.nombre}` : 'Agregar Categoría'}</span></h3>
          <label>Nombre</label>
          <input name="nombre" value={formulario.nombre} onChange={handleChange} />
          <div className="acciones-form">
            <button className="btn-guardar" onClick={handleGuardar}>Guardar</button>
            <button className="btn-cancelar" onClick={() => setMostrarFormulario(false)}>Cancelar</button>
          </div>
        </div>
      ) : (

        

        <section id="categoria-table">
          <main className="row title">
            <ul>
              <li>ID</li>
              <li>Nombre</li>
              <li>Acciones</li>
              
            </ul>
          </main>

          {categorias.map((categoria) => (
            <article className="row producto" key={categoria.idCategoria}>
              <ul>
                <li>{categoria.idCategoria}</li>
                <li>{categoria.nombre}</li>
                <li>
                  <button
                    className="btn-editar"
                    onClick={() => handleEditar(categoria)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn-eliminar"
                    onClick={() => handleEliminar(categoria.idCategoria)}
                  >
                    Eliminar
                  </button>
                </li>
              </ul>
            </article>
          ))}
        </section>
      )}
    </>
  );
}

export default Categorias;