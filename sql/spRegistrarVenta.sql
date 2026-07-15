CREATE PROCEDURE sp_RegistrarVenta
    @idCliente       INT,
    @idUsuario       INT,
    @idTipoDocumento INT,
    @productos       NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION
    BEGIN TRY

        -- 1. Generar correlativo
        DECLARE @codigo      VARCHAR(10)
        DECLARE @ultimo      INT
        DECLARE @correlativo VARCHAR(20)

        SELECT @codigo = codigo 
        FROM TipoDocumento 
        WHERE idTipoDocumento = @idTipoDocumento

        SELECT @ultimo = COUNT(*) 
        FROM Venta 
        WHERE idTipoDocumento = @idTipoDocumento

        SET @correlativo = @codigo + '-' + RIGHT('0000000' + CAST(@ultimo + 1 AS VARCHAR), 7)

        -- 2. Declarar variables
        DECLARE @idProducto     INT
        DECLARE @cantidad       DECIMAL(10,2)
        DECLARE @precioUnitario DECIMAL(10,2)
        DECLARE @aplicaIva      BIT
        DECLARE @ivaLinea       DECIMAL(10,2)
        DECLARE @subtotalLinea  DECIMAL(10,2)

        DECLARE @subtotal DECIMAL(10,2) = 0
        DECLARE @iva      DECIMAL(10,2) = 0
        DECLARE @total    DECIMAL(10,2) = 0

        -- 3. Insertar venta con totales en 0 (se actualizan al final)
        DECLARE @idVenta INT

        INSERT INTO Venta (idCliente, idUsuario, idTipoDocumento, fecha, subtotal, iva, total, correlativo)
        VALUES (@idCliente, @idUsuario, @idTipoDocumento, GETDATE(), 0, 0, 0, @correlativo)

        SET @idVenta = SCOPE_IDENTITY()

        -- 4. Declarar y abrir cursor
        DECLARE cursorProductos CURSOR FOR
            SELECT idProducto, cantidad, precioUnitario
            FROM OPENJSON(@productos)
            WITH (
                idProducto     INT           '$.idProducto',
                cantidad       DECIMAL(10,2) '$.cantidad',
                precioUnitario DECIMAL(10,2) '$.precioUnitario'
            )

        OPEN cursorProductos
        FETCH NEXT FROM cursorProductos INTO @idProducto, @cantidad, @precioUnitario

        -- 5. Recorrer cada producto
        WHILE @@FETCH_STATUS = 0
        BEGIN
            -- Consultar si el producto aplica IVA
            SELECT @aplicaIva = iva
            FROM Producto
            WHERE idProducto = @idProducto

            -- Calcular IVA y subtotal de la línea
            IF @aplicaIva = 1
            BEGIN
                SET @subtotalLinea = ROUND(@precioUnitario / 1.13, 2)
                SET @ivaLinea      = ROUND(@precioUnitario - @subtotalLinea, 2)
            END
            ELSE
            BEGIN
                SET @subtotalLinea = @precioUnitario
                SET @ivaLinea      = 0
            END

            -- Multiplicar por cantidad
            SET @subtotalLinea = @subtotalLinea * @cantidad
            SET @ivaLinea      = @ivaLinea      * @cantidad

            -- Acumular totales de la venta
            SET @subtotal = @subtotal + @subtotalLinea
            SET @iva      = @iva      + @ivaLinea

            -- Insertar detalle de venta
            INSERT INTO DetalleVenta (idVenta, idProducto, cantidad, precioUnitario, ivaLinea, subtotalLinea)
            VALUES (@idVenta, @idProducto, @cantidad, @precioUnitario, @ivaLinea, @subtotalLinea)

            -- Descontar inventario
            UPDATE Inventario
            SET stockActual = stockActual - @cantidad
            WHERE idProducto = @idProducto

            -- Registrar movimiento de inventario
            INSERT INTO MovimientosInventario (idProducto, cantidad, fecha, tipoMovimiento, motivo)
            VALUES (@idProducto, @cantidad, GETDATE(), 'SALIDA', 'Venta ' + @correlativo)

            FETCH NEXT FROM cursorProductos INTO @idProducto, @cantidad, @precioUnitario
        END

        CLOSE cursorProductos
        DEALLOCATE cursorProductos

        -- 6. Actualizar totales reales en la venta
        SET @total = @subtotal + @iva

        UPDATE Venta
        SET subtotal = @subtotal,
            iva      = @iva,
            total    = @total
        WHERE idVenta = @idVenta

        COMMIT TRANSACTION

        -- 7. Devolver resultado a C#
        SELECT @idVenta AS idVenta, @correlativo AS correlativo, @total AS total

    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION
        THROW
    END CATCH
END



    
 



