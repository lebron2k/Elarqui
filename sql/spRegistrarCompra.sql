CREATE PROCEDURE sp_RegistrarCompra
    @idProveedor INT,
    @productos   NVARCHAR(MAX)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION
    BEGIN TRY

        -- 1. Insertar encabezado de compra
        DECLARE @idCompra INT
        DECLARE @total    DECIMAL(10,2) = 0

        INSERT INTO Compra (idProveedor, fecha, total)
        VALUES (@idProveedor, GETDATE(), 0)

        SET @idCompra = SCOPE_IDENTITY()

        -- 2. Declarar variables del cursor
        DECLARE @esNuevo        BIT
        DECLARE @idProducto     INT
        DECLARE @nombre         VARCHAR(200)
        DECLARE @idCategoria    INT
        DECLARE @idUnidadMedida INT
        DECLARE @precio         DECIMAL(10,2)
        DECLARE @iva            BIT
        DECLARE @stockMinimo    DECIMAL(10,2)
        DECLARE @cantidad       DECIMAL(10,2)
        DECLARE @precioUnitario DECIMAL(10,2)

        -- 3. Declarar y abrir cursor
        DECLARE cursorProductos CURSOR FOR
            SELECT esNuevo, idProducto, nombre, idCategoria, idUnidadMedida,
                   precio, iva, stockMinimo, cantidad, precioUnitario
            FROM OPENJSON(@productos)
            WITH (
                esNuevo        BIT           '$.esNuevo',
                idProducto     INT           '$.idProducto',
                nombre         VARCHAR(200)  '$.nombre',
                idCategoria    INT           '$.idCategoria',
                idUnidadMedida INT           '$.idUnidadMedida',
                precio         DECIMAL(10,2) '$.precio',
                iva            BIT           '$.iva',
                stockMinimo    DECIMAL(10,2) '$.stockMinimo',
                cantidad       DECIMAL(10,2) '$.cantidad',
                precioUnitario DECIMAL(10,2) '$.precioUnitario'
            )

        OPEN cursorProductos
        FETCH NEXT FROM cursorProductos INTO @esNuevo, @idProducto, @nombre,
              @idCategoria, @idUnidadMedida, @precio, @iva, @stockMinimo,
              @cantidad, @precioUnitario

        -- 4. Recorrer cada producto
        WHILE @@FETCH_STATUS = 0
        BEGIN
            IF @esNuevo = 1
            BEGIN
                INSERT INTO Producto (nombre, precio, iva, idCategoria, idUnidadMedida, activo)
                VALUES (@nombre, @precio, @iva, @idCategoria, @idUnidadMedida, 1)

                SET @idProducto = SCOPE_IDENTITY()

                INSERT INTO Inventario (idProducto, stockActual, stockMinimo)
                VALUES (@idProducto, 0, @stockMinimo)
            END

            INSERT INTO DetalleCompra (idCompra, idProducto, cantidad, precioUnitario)
            VALUES (@idCompra, @idProducto, @cantidad, @precioUnitario)

            UPDATE Inventario
            SET stockActual = stockActual + @cantidad
            WHERE idProducto = @idProducto

            INSERT INTO MovimientosInventario (idProducto, cantidad, fecha, tipoMovimiento, motivo)
            VALUES (@idProducto, @cantidad, GETDATE(), 'ENTRADA', 'Compra #' + CAST(@idCompra AS VARCHAR))

            SET @total = @total + (@cantidad * @precioUnitario)

            FETCH NEXT FROM cursorProductos INTO @esNuevo, @idProducto, @nombre,
                  @idCategoria, @idUnidadMedida, @precio, @iva, @stockMinimo,
                  @cantidad, @precioUnitario
        END

        CLOSE cursorProductos
        DEALLOCATE cursorProductos

        UPDATE Compra
        SET total = @total
        WHERE idCompra = @idCompra

        COMMIT TRANSACTION

        SELECT @idCompra AS idCompra, @total AS total

    END TRY
    BEGIN CATCH
        -- Cerrar cursor si quedó abierto
        IF CURSOR_STATUS('global', 'cursorProductos') >= 0
        BEGIN
            CLOSE cursorProductos
            DEALLOCATE cursorProductos
        END

        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION

        THROW
    END CATCH
END                                                                                 

