import {useState, useEffect} from 'react';
import {getUnidades, crearUnidad, editarUnidad, eliminarUnidad} from '../services/api';
import "../css/unidad.css";



function unidades()
{
    
    const [unidades, setUnidades] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [unidadEditar, setUnidadEditar] = useState(null);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [formulario, setFormulario] = useState({
        nombre: ''
    });

    const cargarUnidades=()=>{
        getUnidades()
        .then(data=>{setUnidades(data);setLoading(false);})
        .catch(err=>{setError(err.message);setLoading(false);})
        
    }

    useEffect(()=>{
cargarUnidades();
    },[])

 const handleChange = (e) => {
        setFormulario({
            ...formulario,
            [e.target.name]: e.target.value
        });
    }

    const handleAgregar=()=>{
        setUnidadEditar(null);
        setMostrarFormulario(true);
        setFormulario({nombre:"",
            abreviacion:""
        })
    }

    const handleEditar=(unidad)=>{
    setMostrarFormulario(unidad);
    setFormulario({
    nombre:unidad.nombre,
    abreviacion:unidad.abreviacion
    });
    setUnidadEditar(unidad);
    };

    const handleGuardar=()=>{
        
     const datos={
        nombre:formulario.nombre,
        abreviacion:formulario.abreviacion
     }

     if (unidadEditar){
        editarUnidad(unidadEditar.idUnidadMedida,datos)
        .then(()=>{cargarUnidades();setMostrarFormulario(false)})
     }
     else{
        crearUnidad(datos)
        .then(()=>{cargarUnidades();setMostrarFormulario(false)})
     }

    }


     const handleEliminar = (id) => {
        eliminarUnidad(id)
          .then(() => {
            cargarUnidades();
          })
          .catch((error) => {
            alert("No se pudo eliminar la unidad porque tiene productos asociados.");
          });
      };

if (loading) return <p>Cargando unidades...</p>;
    if (error) return <p>Error: {error}</p>;

    return(
         <>
    <div className="toolbar"><button id="agregar-btn" className="agregar-btnn" onClick={handleAgregar}>Agregar Unidad</button></div>

      {mostrarFormulario ? (
        <div className="form-producto">
          <h3><span>{unidadEditar? `Editar: ${unidadEditar.nombre}` : 'Crear Unidad:'}</span></h3>
          <label>Nombre</label>
          <input name="nombre" value={formulario.nombre} onChange={handleChange} />
          <label>Abreviacion</label>
          <input name="abreviacion" value={formulario.abreviacion} onChange={handleChange} />
          <div className="acciones-form">
            <button className="btn-guardar" onClick={handleGuardar}>Guardar</button>
            <button className="btn-cancelar" onClick={() => setMostrarFormulario(false)}>Cancelar</button>
          </div>
        </div>
      ) : (

        

        <section id="unidad-table">
          <main className="row title">
            <ul>
              <li>ID</li>
              <li>Nombre</li>
              <li>Abreviacion</li>
              <li>Acciones</li>
              
            </ul>
          </main>

          {unidades.map((unidad) => (
            <article className="row producto" key={unidad.idUnidadMedida}>
              <ul>
                <li>{unidad.idUnidadMedida}</li>
                <li>{unidad.nombre}</li>
                <li>{unidad.abreviacion}</li>
                <li>
                  <button
                    className="btn-editar"
                    onClick={() => handleEditar(unidad)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn-eliminar"
                    onClick={() => handleEliminar(unidad.idUnidadMedida)}
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
    )
}
export default unidades;