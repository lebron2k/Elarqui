create table Categoria
(
idCategoria int primary key  identity(1,1),
nombre varchar(20)not null
)

create table UnidadMedida
(
idUnidadMedida int primary key IDENTITY(1,1),
nombre varchar(20) not null,
abreviacion varchar(10)not null
)

create table Producto
(
idProducto int PRIMARY key IDENTITY(1,1),
codigo varchar(50),
nombre varchar(20)not null,
idCategoria int not null,
idUnidadMedida int not null,
precio decimal(10,2) not null,
iva BIT not null DEFAULT 1,
activo BIT not null DEFAULT 1,
foreign key (idCategoria) references Categoria(idCategoria) ,
foreign key (idUnidadMedida) references UnidadMedida(idUnidadMedida) 
)

CREATE TABLE Inventario
(
    idInventario  int           PRIMARY KEY IDENTITY(1,1),
    idProducto    int           NOT NULL,
    stockActual   decimal(10,2) NOT NULL DEFAULT 0,
    stockMinimo   decimal(10,2) NOT NULL DEFAULT 0,
    FOREIGN KEY (idProducto) REFERENCES Producto(idProducto)
)

create table MovimientosInventario
(
idMovimiento int primary key IDENTITY(1,1), 
idProducto int not null,
cantidad DECIMAL(10,2) not null,
fecha datetime not null,
tipoMovimiento varchar(20) not null,
motivo varchar(255) not null,
foreign key (idProducto) references Producto(idProducto)
)

create table Proveedor
(
idProveedor int primary key IDENTITY(1,1),
nombre varchar(50) not null,
telefono varchar(20) not null,
nit varchar(20) not null
)

create table Compra
(
idCompra int primary key IDENTITY(1,1),
idProveedor int not null,
fecha datetime not null,
total decimal(10,2) not null,
foreign key (idProveedor) references Proveedor(idProveedor) 
)

create table DetalleCompra
(
idDetalleCompra int primary key IDENTITY(1,1),
idCompra int not null,
idProducto int not null,
cantidad decimal(10,2) not null,
precioUnitario decimal(10,2) not null,
foreign key (idCompra) references Compra(idCompra) ,
foreign key (idProducto) references Producto(idProducto) 
)

create table Cliente
(
idCliente int primary key IDENTITY(1,1),
nombre varchar(50) not null ,
direccion varchar(100) ,
nrc varchar(25) ,
nit varchar(25) 
)

create table TipoDocumento
(
idTipoDocumento int primary key IDENTITY(1,1),
nombre varchar(20) not null,
codigo varchar(10) not null
)

create table Usuario
(
idUsuario int primary key IDENTITY(1,1),
nombre varchar(50) not null,
email varchar(100) not null,
contrasena varchar(255) not null,
rol varchar(20) not null
)

create table Venta
(idVenta int primary key IDENTITY(1,1),
idCliente int ,
idUsuario int not null,
idTipoDocumento int not null,
fecha datetime not null,
total decimal(10,2) not null,
subtotal decimal(10,2) not null,
iva decimal(10,2) not null,
correlativo varchar(20) not null,
foreign key (idCliente) references Cliente(idCliente) ,
foreign key (idUsuario) references Usuario(idUsuario) ,
foreign key (idTipoDocumento) references TipoDocumento(idTipoDocumento) 
)

CREATE TABLE DetalleVenta
(
    idDetalleVenta  int           PRIMARY KEY IDENTITY(1,1),
    idVenta         int           NOT NULL,
    idProducto      int           NOT NULL,
    cantidad        decimal(10,2) NOT NULL,
    precioUnitario  decimal(10,2) NOT NULL,
    ivaLinea        decimal(10,2) NOT NULL DEFAULT 0,
    subtotalLinea   decimal(10,2) NOT NULL,
    FOREIGN KEY (idVenta)     REFERENCES Venta(idVenta),
    FOREIGN KEY (idProducto)  REFERENCES Producto(idProducto)
)