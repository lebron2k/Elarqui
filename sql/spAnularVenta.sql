ALTER TABLE Venta ADD estado VARCHAR(20) NOT NULL DEFAULT 'EMITIDA'

CREATE PROCEDURE sp_AnularVenta
    @idVenta INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION
    BEGIN TRY

        -- 1. Verificar que la venta existe
        DECLARE @estado VARCHAR(20)

        SELECT @estado = estado
        FROM Venta
        WHERE idVenta = @idVenta

        IF @estado IS NULL
        BEGIN
            RAISERROR('La venta no existe.', 16, 1)
            RETURN
        END

        -- 2. Verificar que no esté ya anulada
        IF @estado = 'ANULADA'
        BEGIN
            RAISERROR('La venta ya está anulada.', 16, 1)
            RETURN
        END

        -- 3. Cambiar estado a ANULADA
        UPDATE Venta
        SET estado = 'ANULADA'
        WHERE idVenta = @idVenta

        -- 4. Declarar variables del cursor
        DECLARE @idProducto    INT
        DECLARE @cantidad      DECIMAL(10,2)
        DECLARE @correlativo   VARCHAR(20)

        SELECT @correlativo = correlativo
        FROM Venta
        WHERE idVenta = @idVenta

        -- 5. Recorrer detalle y devolver stock
        DECLARE cursorDetalle CURSOR FOR
            SELECT idProducto, cantidad
            FROM DetalleVenta
            WHERE idVenta = @idVenta

        OPEN cursorDetalle
        FETCH NEXT FROM cursorDetalle INTO @idProducto, @cantidad

        WHILE @@FETCH_STATUS = 0
        BEGIN
            -- Devolver stock al inventario
            UPDATE Inventario
            SET stockActual = stockActual + @cantidad
            WHERE idProducto = @idProducto

            -- Registrar movimiento de entrada por anulación
            INSERT INTO MovimientosInventario (idProducto, cantidad, fecha, tipoMovimiento, motivo)
            VALUES (@idProducto, @cantidad, GETDATE(), 'ENTRADA', 'Anulación ' + @correlativo)

            FETCH NEXT FROM cursorDetalle INTO @idProducto, @cantidad
        END

        CLOSE cursorDetalle
        DEALLOCATE cursorDetalle

        COMMIT TRANSACTION

        SELECT @idVenta AS idVenta, @correlativo AS correlativo, 'ANULADA' AS estado

    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION
        THROW
    END CATCH
END