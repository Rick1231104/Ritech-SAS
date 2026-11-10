-- Cambios en la base ritech para Sprint 3 y Sprint 4
-- Ejecutar UNA sola vez en MySQL Workbench (seleccionar todo + Ctrl+Enter)

USE ritech;

-- HU-08: contratos y acuerdos comerciales con cada cliente
CREATE TABLE contratos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    fecha_firma DATE,
    fecha_vencimiento DATE,
    archivo VARCHAR(255),
    CONSTRAINT fk_contrato_cliente
        FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

-- HU-10: ruta del archivo adjunto de cada documento
ALTER TABLE documentos ADD COLUMN archivo VARCHAR(255);

-- Inicio de sesion con roles (Administrador / Cliente)
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    clave VARCHAR(100) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    rol VARCHAR(20) NOT NULL,
    cliente_id INT NULL,
    CONSTRAINT fk_usuario_cliente
        FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

-- Datos de ejemplo
INSERT INTO contratos (cliente_id, descripcion, fecha_firma, fecha_vencimiento, archivo) VALUES
(1, 'Contrato de suministro anual de café', '2026-01-15', '2027-01-15', 'contratos/kaffee_import_2026.pdf'),
(2, 'Acuerdo comercial de cacao fino', '2026-03-01', '2027-03-01', 'contratos/cacao_nederland_2026.pdf');

INSERT INTO usuarios (usuario, clave, nombre, rol, cliente_id) VALUES
('admin', 'admin123', 'Camila Noguera', 'Administrador', NULL),
('cliente', 'cliente123', 'Kaffee Import GmbH', 'Cliente', 1);

SELECT * FROM usuarios;
