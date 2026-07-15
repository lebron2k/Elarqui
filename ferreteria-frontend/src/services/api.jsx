const BASE_URL = "elarqui-api-h9d9aed5ggfrdpe8.centralus-01.azurewebsites.net";

function getHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
}

// ─── PRODUCTOS ───────────────────────────────────────
export async function getProductos() {
  const res = await fetch(`${BASE_URL}/producto`, { headers: getHeaders() });
  if (!res.ok) throw new Error("Error al cargar productos");
  return res.json();
}

export async function getProductoById(id) {
  const res = await fetch(`${BASE_URL}/producto/${id}`, { headers: getHeaders() });
  if (!res.ok) throw new Error("Producto no encontrado");
  return res.json();
}

export async function crearProducto(producto) {
  const res = await fetch(`${BASE_URL}/producto`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(producto)
  });
  if (!res.ok) {
    const errorTexto = await res.text();
    throw new Error(errorTexto);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function editarProducto(id, producto) {
  const res = await fetch(`${BASE_URL}/producto/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(producto)
  });
  if (!res.ok) throw new Error("Error al editar producto");
   const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function eliminarProducto(id) {
  const res = await fetch(`${BASE_URL}/producto/${id}`, {
    method: "DELETE",
    headers: getHeaders()
  });
  if (!res.ok) throw new Error("Error al eliminar producto");
}

export async function getProductosStockMinimo() {
  const res = await fetch(`${BASE_URL}/producto/stockminimo`, { headers: getHeaders() });
  if (!res.ok) throw new Error("Error al cargar productos con stock mínimo");
  return res.json();
}

export async function getProductosByCategoria(categoria) {
  const res = await fetch(`${BASE_URL}/producto/categoria/${categoria}`, { headers: getHeaders() });
  if (!res.ok) throw new Error("Error al cargar productos por categoría");
  return res.json();
}

// ─── CATEGORÍAS ──────────────────────────────────────
export async function getCategorias() {
  const res = await fetch(`${BASE_URL}/categorias`, { headers: getHeaders() });
  if (!res.ok) throw new Error("Error al cargar categorías");
  return res.json();
}

export async function crearCategoria(categoria) {
  const res = await fetch(`${BASE_URL}/categorias`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(categoria)
  });
  if (!res.ok) throw new Error("Error al crear categoría");
 const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function editarCategoria(id, categoria) {
  const res = await fetch(`${BASE_URL}/categorias/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(categoria)
  });
  if (!res.ok) throw new Error("Error al editar categoría");
 const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function eliminarCategoria(id) {
  const res = await fetch(`${BASE_URL}/categorias/${id}`, {
    method: "DELETE",
    headers: getHeaders()
  });
  if (!res.ok) throw new Error("Error al eliminar categoría");
}

// ─── UNIDADES DE MEDIDA ──────────────────────────────
export async function getUnidades() {
  const res = await fetch(`${BASE_URL}/unidadmedida`, { headers: getHeaders() });
  if (!res.ok) throw new Error("Error al cargar unidades");
  return res.json();
}

export async function crearUnidad(unidad) {
  const res = await fetch(`${BASE_URL}/unidadmedida`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(unidad)
  });
  if (!res.ok) throw new Error("Error al crear unidad");
 const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function editarUnidad(id, unidad) {
  const res = await fetch(`${BASE_URL}/unidadmedida/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(unidad)
  });
  if (!res.ok) throw new Error("Error al editar unidad");
 const text = await res.text();
  return text ? JSON.parse(text) : null ;
}

export async function eliminarUnidad(id) {
  const res = await fetch(`${BASE_URL}/unidadmedida/${id}`, {
    method: "DELETE",
    headers: getHeaders()
  });
  if (!res.ok) throw new Error("Error al eliminar unidad");
}

// ─── INVENTARIO ──────────────────────────────────────
export async function getInventario() {
  const res = await fetch(`${BASE_URL}/inventario`, { headers: getHeaders() });
  if (!res.ok) throw new Error("Error al cargar inventario");
  return res.json();
}

export async function actualizarInventario(id, datos) {
  const res = await fetch(`${BASE_URL}/inventario/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(datos)
  });
  if (!res.ok) throw new Error("Error al actualizar inventario");
 const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function getInventarioById(id) {
  const res = await fetch(`${BASE_URL}/inventario/${id}`, { headers: getHeaders() });
  if (!res.ok) throw new Error("Inventario no encontrado para el producto");
  return res.json();
}

export async function getInventarioByCategoria(categoria){
  const res = await fetch(`${BASE_URL}/inventario/categoria/${categoria}`, { headers: getHeaders() });
  if (!res.ok) throw new Error("Error al cargar inventario por categoría");
  return res.json();
}

// ─── VENTAS ──────────────────────────────────────────
export async function getVentas() {
  const res = await fetch(`${BASE_URL}/venta`, { headers: getHeaders() });
  if (!res.ok) throw new Error("Error al cargar ventas");
  return res.json();

}

export async function getVentaById(id) {
  const res = await fetch(`${BASE_URL}/venta/${id}`, { headers: getHeaders() });
  if (!res.ok) throw new Error("Venta no encontrada");
  return res.json();
}

export async function crearVenta(venta) {
  const res = await fetch(`${BASE_URL}/venta`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(venta)
  });
  if (!res.ok) throw new Error("Error al crear venta");
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function anularVenta(id) {
  const res = await fetch(`${BASE_URL}/venta/anular/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({ anulado: true })
  });
  if (!res.ok) throw new Error("Error al anular venta");
   const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// ─── COMPRAS ─────────────────────────────────────────
export async function getCompras() {
  const res = await fetch(`${BASE_URL}/compra`, { headers: getHeaders() });
  if (!res.ok) throw new Error("Error al cargar compras");
  return res.json();
}

export async function getCompraById(id) {
  const res = await fetch(`${BASE_URL}/compra/${id}`, { headers: getHeaders() });
  if (!res.ok) throw new Error("Compra no encontrada");
  return res.json();
}

export async function crearCompra(compra) {
  const res = await fetch(`${BASE_URL}/compra`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(compra)
  });
  if (!res.ok) throw new Error("Error al crear compra");
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// ─── PROVEEDORES ─────────────────────────────────────
export async function getProveedores() {
  const res = await fetch(`${BASE_URL}/proveedor`, { headers: getHeaders() });
  if (!res.ok) throw new Error("Error al cargar proveedores");
  return res.json();
}
 
export async function getProveedorById(id) {
  const res = await fetch(`${BASE_URL}/proveedor/${id}`, { headers: getHeaders() });
  if (!res.ok) throw new Error("Proveedor no encontrado");
  return res.json();
}
 
export async function crearProveedor(proveedor) {
  const res = await fetch(`${BASE_URL}/proveedor`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(proveedor)
  });
  if (!res.ok) throw new Error("Error al crear proveedor");
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}
 
export async function editarProveedor(id, proveedor) {
  const res = await fetch(`${BASE_URL}/proveedor/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(proveedor)
  });
  if (!res.ok) throw new Error("Error al editar proveedor");
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}
 
export async function eliminarProveedor(id) {
  const res = await fetch(`${BASE_URL}/proveedor/${id}`, {
    method: "DELETE",
    headers: getHeaders()
  });
  if (!res.ok) throw new Error("Error al eliminar proveedor");
}

//clientes

export async function getClientes() {
  const res = await fetch(`${BASE_URL}/cliente`, { headers: getHeaders() });
  if (!res.ok) throw new Error("Error al cargar clientes");
  return res.json();
}



export async function crearCliente(cliente) {
  const res = await fetch(`${BASE_URL}/cliente`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(cliente)
  });
  if (!res.ok) throw new Error("Error al crear cliente");
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function editarCliente(id, cliente) {
  const res = await fetch(`${BASE_URL}/cliente/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(cliente)
  });
  if (!res.ok) throw new Error("Error al editar cliente");
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function createCliente(cliente) {
  const res = await fetch(`${BASE_URL}/cliente`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(cliente)
  });
  if (!res.ok) throw new Error("Error al agregar cliente");
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}
