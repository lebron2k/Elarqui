CREATE VIEW vw_VentasDelDia AS
SELECT 
    v.correlativo,
    v.fecha,
    ISNULL(c.nombre, 'Consumidor Final') AS cliente,
    td.nombre                            AS tipoDocumento,
    u.nombre                             AS cajero,
    p.nombre                             AS producto,
    dv.cantidad,
    dv.precioUnitario,
    dv.ivaLinea,
    dv.subtotalLinea,
    v.subtotal,
    v.iva,
    v.total,
    v.estado
FROM Venta v
LEFT JOIN Cliente        c  ON v.idCliente       = c.idCliente
INNER JOIN TipoDocumento td ON v.idTipoDocumento  = td.idTipoDocumento
INNER JOIN Usuario       u  ON v.idUsuario        = u.idUsuario
INNER JOIN DetalleVenta  dv ON v.idVenta          = dv.idVenta
INNER JOIN Producto      p  ON dv.idProducto      = p.idProducto
WHERE CAST(v.fecha AS DATE) = CAST(GETDATE() AS DATE)
AND v.estado = 'EMITIDA'