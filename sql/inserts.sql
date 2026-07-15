-- 1. Categorias
INSERT INTO Categoria (nombre) VALUES ('Herramientas')
INSERT INTO Categoria (nombre) VALUES ('Materiales')
INSERT INTO Categoria (nombre) VALUES ('Electrico')

-- 2. Unidades de medida
INSERT INTO UnidadMedida (nombre, abreviacion) VALUES ('Unidad', 'und')
INSERT INTO UnidadMedida (nombre, abreviacion) VALUES ('Metro', 'mts')
INSERT INTO UnidadMedida (nombre, abreviacion) VALUES ('Libra', 'lb')

-- 3. Productos
INSERT INTO Producto (nombre, precio, iva, idCategoria, idUnidadMedida)
VALUES ('Martillo 16oz', 11.30, 1, 1, 1)

INSERT INTO Producto (nombre, precio, iva, idCategoria, idUnidadMedida)
VALUES ('Tornillo 3/8"', 0.10, 1, 1, 1)

INSERT INTO Producto (nombre, precio, iva, idCategoria, idUnidadMedida)
VALUES ('Cable #12 AWG', 1.50, 1, 3, 2)

INSERT INTO Producto (nombre, precio, iva, idCategoria, idUnidadMedida)
VALUES ('Arroz Diana 5lb', 3.50, 0, 2, 1)

-- 4. Inventario (un registro por cada producto)
INSERT INTO Inventario (idProducto, stockActual, stockMinimo) VALUES (1, 50, 10)
INSERT INTO Inventario (idProducto, stockActual, stockMinimo) VALUES (2, 200, 50)
INSERT INTO Inventario (idProducto, stockActual, stockMinimo) VALUES (3, 100, 20)
INSERT INTO Inventario (idProducto, stockActual, stockMinimo) VALUES (4, 30, 10)

-- 5. Tipo de documento
INSERT INTO TipoDocumento (nombre, codigo) VALUES ('Consumidor Final', 'CF')
INSERT INTO TipoDocumento (nombre, codigo) VALUES ('Credito Fiscal', 'CCF')

-- 6. Usuario
INSERT INTO Usuario (nombre, email, contrasena, rol)
VALUES ('Carlos Admin', 'carlos@arqui.com', '1234', 'admin')

EXEC sp_RegistrarVenta
    @idCliente       = NULL,
    @idUsuario       = 1,
    @idTipoDocumento = 1,
    @productos       = '[
        {"idProducto": 1, "cantidad": 2,  "precioUnitario": 11.30},
        {"idProducto": 2, "cantidad": 10, "precioUnitario": 0.10},
        {"idProducto": 4, "cantidad": 1,  "precioUnitario": 3.50}
    ]'