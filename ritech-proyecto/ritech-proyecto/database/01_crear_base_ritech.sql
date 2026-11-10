-- Base de datos del proyecto RiTech SAS (Sprint 1 y 2)
-- Ejecutar primero en MySQL Workbench

CREATE DATABASE IF NOT EXISTS ritech
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE ritech;

CREATE TABLE clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    pais VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE,
    telefono VARCHAR(30)
);

CREATE TABLE productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    calidad VARCHAR(50)
);

CREATE TABLE lotes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(30) UNIQUE NOT NULL,
    producto_id INT NOT NULL,
    origen VARCHAR(150),
    fecha_cosecha DATE,
    certificaciones VARCHAR(200),
    CONSTRAINT fk_lote_producto
        FOREIGN KEY (producto_id) REFERENCES productos(id)
);

CREATE TABLE inventario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    producto_id INT NOT NULL,
    cantidad_kg DECIMAL(10,2) NOT NULL DEFAULT 0,
    CONSTRAINT fk_inventario_producto
        FOREIGN KEY (producto_id) REFERENCES productos(id)
);

CREATE TABLE exportaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(30) UNIQUE NOT NULL,
    cliente_id INT NOT NULL,
    pais_destino VARCHAR(100) NOT NULL,
    puerto VARCHAR(100),
    fecha_creacion DATE DEFAULT (CURRENT_DATE),
    estado VARCHAR(50) NOT NULL DEFAULT 'Preparación',
    CONSTRAINT fk_exportacion_cliente
        FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

CREATE TABLE detalle_exportacion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exportacion_id INT NOT NULL,
    lote_id INT NOT NULL,
    cantidad_kg DECIMAL(10,2) NOT NULL,
    CONSTRAINT fk_detalle_exportacion
        FOREIGN KEY (exportacion_id) REFERENCES exportaciones(id),
    CONSTRAINT fk_detalle_lote
        FOREIGN KEY (lote_id) REFERENCES lotes(id)
);

CREATE TABLE documentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exportacion_id INT NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    completado BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_carga DATETIME,
    CONSTRAINT fk_documento_exportacion
        FOREIGN KEY (exportacion_id) REFERENCES exportaciones(id)
);

CREATE TABLE seguimiento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    exportacion_id INT NOT NULL,
    estado VARCHAR(50) NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_seguimiento_exportacion
        FOREIGN KEY (exportacion_id) REFERENCES exportaciones(id)
);

-- Datos de ejemplo
INSERT INTO clientes (nombre, pais, email, telefono) VALUES
('Kaffee Import GmbH', 'Alemania', 'contacto@kaffeeimport.de', '+49 30 1234567'),
('Cacao Nederland BV', 'Países Bajos', 'info@cacaonl.com', '+31 20 7654321'),
('Café Ibérico SL', 'España', 'ventas@cafeiberico.es', '+34 91 5551234');

INSERT INTO productos (nombre, tipo, calidad) VALUES
('Café Arábica', 'Café', 'Especial'),
('Cacao Fino de Aroma', 'Cacao', 'Premium'),
('Café Especial', 'Café', 'Premium');

INSERT INTO lotes (codigo, producto_id, origen, fecha_cosecha, certificaciones) VALUES
('CAF-2026-0012', 1, 'Finca El Porvenir, Consacá, Nariño', '2026-08-04', 'Orgánico, Fair Trade'),
('CAC-2026-0007', 2, 'Finca Los Alpes, Tumaco, Nariño', '2026-07-18', 'Orgánico'),
('CAF-2026-0009', 3, 'Finca Buenavista, Sandoná, Nariño', '2026-06-10', 'Fair Trade');

INSERT INTO inventario (producto_id, cantidad_kg) VALUES
(1, 3200.00), (2, 1500.00), (3, 2100.00);

INSERT INTO exportaciones (codigo, cliente_id, pais_destino, puerto, estado) VALUES
('EXP-2026-0048', 1, 'Alemania', 'Rotterdam', 'En tránsito'),
('EXP-2026-0047', 2, 'Países Bajos', 'Rotterdam', 'Preparación'),
('EXP-2026-0046', 3, 'España', 'Valencia', 'Entregado');

INSERT INTO detalle_exportacion (exportacion_id, lote_id, cantidad_kg) VALUES
(1, 1, 1200.00), (2, 2, 850.00), (3, 3, 2400.00);

INSERT INTO documentos (exportacion_id, tipo, completado, fecha_carga) VALUES
(1, 'Factura comercial', TRUE, '2026-08-10 09:00:00'),
(1, 'Certificado de origen', TRUE, '2026-08-10 09:15:00'),
(2, 'Factura comercial', TRUE, '2026-08-12 10:00:00'),
(2, 'Lista de empaque', FALSE, NULL),
(3, 'Factura comercial', TRUE, '2026-06-20 08:00:00');

INSERT INTO seguimiento (exportacion_id, estado) VALUES
(1, 'Preparación'), (1, 'En tránsito'), (2, 'Preparación'), (3, 'Entregado');
