# ============================================================
# RiTech SAS - Sistema de gestión de exportaciones
# Python + MySQL
#
# Sprint 2: HU-05 productos/lotes, HU-06 clientes, HU-07 historial
# Sprint 3: HU-08 contratos, HU-09 exportaciones, HU-10 documentos
# Sprint 4: HU-11 seguimiento, HU-12 normativa, HU-13 panel
# Incluye inicio de sesión con roles (Administrador / Cliente)
# ============================================================
#
# Antes de correr:
#   1. pip install mysql-connector-python
#   2. Ejecutar cambios_sprint3_y_4.sql en MySQL Workbench
#   3. Cambiar la contraseña de MySQL en la función conectar()

import mysql.connector

ESTADOS = ["Borrador", "Preparación", "Documentación",
           "Listo para embarque", "En tránsito", "Entregado"]

DOCS_REQUERIDOS = ["Factura comercial", "Lista de empaque", "Certificado de origen"]

PAISES_UE = ["Alemania", "Países Bajos", "España", "Francia",
             "Italia", "Bélgica", "Portugal"]


# ------------------------------------------------------------
# Conexión y funciones de ayuda
# ------------------------------------------------------------

def conectar():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="TU_CONTRASEÑA_AQUI",
        database="ritech"
    )


def consultar(sql, datos=()):
    # Para los SELECT: devuelve las filas
    conn = conectar()
    cur = conn.cursor()
    cur.execute(sql, datos)
    filas = cur.fetchall()
    cur.close()
    conn.close()
    return filas


def ejecutar(sql, datos=()):
    # Para INSERT, UPDATE y DELETE: guarda los cambios
    conn = conectar()
    cur = conn.cursor()
    cur.execute(sql, datos)
    conn.commit()
    nuevo_id = cur.lastrowid
    cur.close()
    conn.close()
    return nuevo_id


# ------------------------------------------------------------
# INICIO DE SESIÓN
# ------------------------------------------------------------

def iniciar_sesion():
    print("=========================================")
    print("   RITECH SAS - INICIO DE SESIÓN")
    print("=========================================")
    for intento in range(3):
        usuario = input("Usuario: ")
        clave = input("Contraseña: ")
        filas = consultar(
            "SELECT nombre, rol, cliente_id FROM usuarios WHERE usuario = %s AND clave = %s",
            (usuario, clave))
        if filas:
            nombre, rol, cliente_id = filas[0]
            print(f"\nBienvenido/a {nombre} ({rol})\n")
            return {"nombre": nombre, "rol": rol, "cliente_id": cliente_id}
        print("Usuario o contraseña incorrectos.\n")
    print("Demasiados intentos. Cerrando.")
    return None


# ------------------------------------------------------------
# HU-05: PRODUCTOS Y LOTES (trazabilidad)
# ------------------------------------------------------------

def registrar_producto():
    nombre = input("Nombre del producto (ej. Café Arábica): ")
    tipo = input("Tipo (Café / Cacao): ")
    calidad = input("Calidad (ej. Especial, Premium): ")
    nuevo = ejecutar("INSERT INTO productos (nombre, tipo, calidad) VALUES (%s, %s, %s)",
                     (nombre, tipo, calidad))
    print(f"Producto registrado con id {nuevo}.")


def listar_productos():
    print("\n--- PRODUCTOS ---")
    for f in consultar("SELECT id, nombre, tipo, calidad FROM productos"):
        print(f"ID {f[0]} | {f[1]} | {f[2]} | Calidad: {f[3]}")
    print()


def registrar_lote():
    listar_productos()
    producto_id = input("ID del producto de este lote: ")
    codigo = input("Código del lote (ej. CAF-2026-0020): ")
    origen = input("Origen (finca, municipio, departamento): ")
    fecha = input("Fecha de cosecha (AAAA-MM-DD): ")
    certificaciones = input("Certificaciones (ej. Orgánico, Fair Trade): ")
    ejecutar("""INSERT INTO lotes (codigo, producto_id, origen, fecha_cosecha, certificaciones)
                VALUES (%s, %s, %s, %s, %s)""",
             (codigo, producto_id, origen, fecha, certificaciones))
    print("Lote registrado correctamente.")


def listar_lotes():
    print("\n--- LOTES (trazabilidad) ---")
    filas = consultar("""SELECT l.id, l.codigo, p.nombre, l.origen, l.fecha_cosecha, l.certificaciones
                         FROM lotes l INNER JOIN productos p ON l.producto_id = p.id""")
    for f in filas:
        print(f"ID {f[0]} | {f[1]} | {f[2]} | Origen: {f[3]} | Cosecha: {f[4]} | {f[5]}")
    print()


# ------------------------------------------------------------
# HU-06: CLIENTES
# ------------------------------------------------------------

def registrar_cliente():
    nombre = input("Nombre del cliente/empresa: ")
    pais = input("País: ")
    email = input("Email: ")
    telefono = input("Teléfono: ")
    nuevo = ejecutar("INSERT INTO clientes (nombre, pais, email, telefono) VALUES (%s, %s, %s, %s)",
                     (nombre, pais, email, telefono))
    print(f"Cliente registrado con id {nuevo}.")


def listar_clientes():
    print("\n--- CLIENTES ---")
    for f in consultar("SELECT id, nombre, pais, email, telefono FROM clientes"):
        print(f"ID {f[0]} | {f[1]} | {f[2]} | {f[3]} | {f[4]}")
    print()


def actualizar_cliente():
    listar_clientes()
    cliente_id = input("ID del cliente a actualizar: ")
    telefono = input("Nuevo teléfono: ")
    email = input("Nuevo email: ")
    ejecutar("UPDATE clientes SET telefono = %s, email = %s WHERE id = %s",
             (telefono, email, cliente_id))
    print("Cliente actualizado.")


def eliminar_cliente():
    listar_clientes()
    cliente_id = input("ID del cliente a eliminar: ")
    ejecutar("DELETE FROM clientes WHERE id = %s", (cliente_id,))
    print("Cliente eliminado.")


# ------------------------------------------------------------
# HU-07: HISTORIAL DE COMPRAS
# ------------------------------------------------------------

def historial_cliente():
    listar_clientes()
    cliente_id = input("ID del cliente a consultar: ")
    filas = consultar("""SELECT codigo, pais_destino, estado, fecha_creacion
                         FROM exportaciones WHERE cliente_id = %s
                         ORDER BY fecha_creacion DESC""", (cliente_id,))
    print("\n--- HISTORIAL DE EXPORTACIONES ---")
    if not filas:
        print("Este cliente todavía no tiene exportaciones.")
    for f in filas:
        print(f"{f[0]} | Destino: {f[1]} | Estado: {f[2]} | Fecha: {f[3]}")
    print()


# ------------------------------------------------------------
# HU-08: CONTRATOS Y ACUERDOS COMERCIALES
# ------------------------------------------------------------

def registrar_contrato():
    listar_clientes()
    cliente_id = input("ID del cliente: ")
    descripcion = input("Descripción del contrato: ")
    fecha_firma = input("Fecha de firma (AAAA-MM-DD): ")
    fecha_venc = input("Fecha de vencimiento (AAAA-MM-DD): ")
    archivo = input("Ruta del archivo del contrato (ej. contratos/cliente.pdf): ")
    ejecutar("""INSERT INTO contratos (cliente_id, descripcion, fecha_firma, fecha_vencimiento, archivo)
                VALUES (%s, %s, %s, %s, %s)""",
             (cliente_id, descripcion, fecha_firma, fecha_venc, archivo))
    print("Contrato registrado.")


def ver_contratos(cliente_id=None):
    # Si es administrador, pregunta de qué cliente; si es cliente, usa el suyo
    if cliente_id is None:
        listar_clientes()
        cliente_id = input("ID del cliente: ")
    filas = consultar("""SELECT descripcion, fecha_firma, fecha_vencimiento, archivo
                         FROM contratos WHERE cliente_id = %s""", (cliente_id,))
    print("\n--- CONTRATOS ---")
    if not filas:
        print("No hay contratos registrados.")
    for f in filas:
        print(f"{f[0]} | Firma: {f[1]} | Vence: {f[2]} | Archivo: {f[3]}")
    print()


# ------------------------------------------------------------
# HU-09: EXPORTACIONES (producto + cliente + cantidad)
# ------------------------------------------------------------

def listar_exportaciones(cliente_id=None):
    sql = """SELECT e.id, e.codigo, c.nombre, e.pais_destino, e.estado
             FROM exportaciones e INNER JOIN clientes c ON e.cliente_id = c.id"""
    datos = ()
    if cliente_id is not None:
        sql += " WHERE e.cliente_id = %s"
        datos = (cliente_id,)
    print("\n--- EXPORTACIONES ---")
    for f in consultar(sql, datos):
        print(f"ID {f[0]} | {f[1]} | Cliente: {f[2]} | Destino: {f[3]} | Estado: {f[4]}")
    print()


def registrar_exportacion():
    listar_clientes()
    cliente_id = input("ID del cliente: ")
    codigo = input("Código de la exportación (ej. EXP-2026-0049): ")
    pais = input("País destino: ")
    puerto = input("Puerto de salida: ")

    exp_id = ejecutar("""INSERT INTO exportaciones (codigo, cliente_id, pais_destino, puerto)
                         VALUES (%s, %s, %s, %s)""",
                      (codigo, cliente_id, pais, puerto))
    ejecutar("INSERT INTO seguimiento (exportacion_id, estado) VALUES (%s, 'Preparación')",
             (exp_id,))

    # Se pueden agregar varios lotes (producto + cantidad) a la exportación
    while True:
        listar_lotes()
        lote_id = input("ID del lote a exportar: ")
        cantidad = input("Cantidad en kg: ")
        ejecutar("""INSERT INTO detalle_exportacion (exportacion_id, lote_id, cantidad_kg)
                    VALUES (%s, %s, %s)""", (exp_id, lote_id, cantidad))
        otro = input("¿Agregar otro lote? (s/n): ")
        if otro.lower() != "s":
            break
    print(f"Exportación {codigo} registrada.")


# ------------------------------------------------------------
# HU-10: DOCUMENTOS DE LA EXPORTACIÓN
# ------------------------------------------------------------

def adjuntar_documento():
    listar_exportaciones()
    exp_id = input("ID de la exportación: ")

    print("Tipos de documento:")
    tipos = DOCS_REQUERIDOS + ["Certificado fitosanitario", "Permiso de exportación"]
    for i, t in enumerate(tipos, start=1):
        print(f"  {i}. {t}")
    tipo = tipos[int(input("Elige el tipo: ")) - 1]
    archivo = input("Ruta del archivo (ej. docs/factura_0049.pdf): ")

    # Si ya existe ese documento, se actualiza; si no, se crea
    existe = consultar("SELECT id FROM documentos WHERE exportacion_id = %s AND tipo = %s",
                       (exp_id, tipo))
    if existe:
        ejecutar("""UPDATE documentos SET completado = TRUE, archivo = %s, fecha_carga = NOW()
                    WHERE id = %s""", (archivo, existe[0][0]))
    else:
        ejecutar("""INSERT INTO documentos (exportacion_id, tipo, completado, fecha_carga, archivo)
                    VALUES (%s, %s, TRUE, NOW(), %s)""", (exp_id, tipo, archivo))
    print(f"Documento '{tipo}' adjuntado.")


def ver_documentos(exp_id=None):
    if exp_id is None:
        listar_exportaciones()
        exp_id = input("ID de la exportación: ")
    filas = consultar("SELECT tipo, completado, archivo FROM documentos WHERE exportacion_id = %s",
                      (exp_id,))
    print("\n--- DOCUMENTOS ---")
    if not filas:
        print("Esta exportación no tiene documentos.")
    for f in filas:
        estado = "COMPLETO" if f[1] else "PENDIENTE"
        print(f"{f[0]} | {estado} | Archivo: {f[2]}")
    print()


# ------------------------------------------------------------
# HU-12: CUMPLIMIENTO NORMATIVO (Unión Europea)
# ------------------------------------------------------------

def verificar_cumplimiento(exp_id):
    # Devuelve una lista de (requisito, cumple True/False)
    resultado = []

    for doc in DOCS_REQUERIDOS:
        n = consultar("""SELECT COUNT(*) FROM documentos
                         WHERE exportacion_id = %s AND tipo = %s AND completado = TRUE""",
                      (exp_id, doc))[0][0]
        resultado.append((doc, n > 0))

    n_lotes = consultar("SELECT COUNT(*) FROM detalle_exportacion WHERE exportacion_id = %s",
                        (exp_id,))[0][0]
    resultado.append(("Lote de origen asociado (trazabilidad)", n_lotes > 0))

    puerto, pais = consultar("SELECT puerto, pais_destino FROM exportaciones WHERE id = %s",
                             (exp_id,))[0]
    resultado.append(("Puerto de salida definido", bool(puerto)))
    resultado.append(("País destino dentro de la Unión Europea", pais in PAISES_UE))
    return resultado


def validar_cumplimiento():
    listar_exportaciones()
    exp_id = input("ID de la exportación a validar: ")
    resultado = verificar_cumplimiento(exp_id)
    print("\n--- CUMPLIMIENTO NORMATIVO UE ---")
    for requisito, ok in resultado:
        print(("  [OK]  " if ok else "  [FALTA] ") + requisito)
    if all(ok for _, ok in resultado):
        print("\nResultado: CUMPLE. Puede pasar a 'Listo para embarque'.\n")
    else:
        print("\nResultado: NO CUMPLE. Hay riesgo de rechazo en aduana.\n")


# ------------------------------------------------------------
# HU-11: SEGUIMIENTO DEL ESTADO DEL ENVÍO
# ------------------------------------------------------------

def cambiar_estado():
    listar_exportaciones()
    exp_id = input("ID de la exportación: ")
    actual = consultar("SELECT estado FROM exportaciones WHERE id = %s", (exp_id,))[0][0]
    posicion = ESTADOS.index(actual)

    if posicion == len(ESTADOS) - 1:
        print("Esta exportación ya fue entregada.")
        return
    siguiente = ESTADOS[posicion + 1]

    # No se puede pasar a 'Listo para embarque' si no cumple la normativa
    if siguiente == "Listo para embarque":
        resultado = verificar_cumplimiento(exp_id)
        if not all(ok for _, ok in resultado):
            print("No se puede avanzar. Faltan requisitos:")
            for requisito, ok in resultado:
                if not ok:
                    print("  - " + requisito)
            return

    ejecutar("UPDATE exportaciones SET estado = %s WHERE id = %s", (siguiente, exp_id))
    ejecutar("INSERT INTO seguimiento (exportacion_id, estado) VALUES (%s, %s)",
             (exp_id, siguiente))
    print(f"Estado actualizado: {actual} -> {siguiente}")


def ver_seguimiento(exp_id=None):
    if exp_id is None:
        listar_exportaciones()
        exp_id = input("ID de la exportación: ")
    filas = consultar("""SELECT estado, fecha FROM seguimiento
                         WHERE exportacion_id = %s ORDER BY fecha, id""", (exp_id,))
    print("\n--- SEGUIMIENTO DEL ENVÍO ---")
    for f in filas:
        print(f"{f[1]} | {f[0]}")
    print()


# ------------------------------------------------------------
# HU-13: PANEL DE CONTROL
# ------------------------------------------------------------

def panel_control():
    print("\n=========== PANEL DE CONTROL ===========")
    print("Exportaciones por estado:")
    for estado, total in consultar("SELECT estado, COUNT(*) FROM exportaciones GROUP BY estado"):
        print(f"  {estado}: {total}")

    kg_exportados = consultar("""SELECT COALESCE(SUM(d.cantidad_kg), 0)
                                 FROM detalle_exportacion d
                                 INNER JOIN exportaciones e ON d.exportacion_id = e.id
                                 WHERE e.estado IN ('En tránsito', 'Entregado')""")[0][0]
    inventario = consultar("SELECT COALESCE(SUM(cantidad_kg), 0) FROM inventario")[0][0]
    clientes = consultar("SELECT COUNT(*) FROM clientes")[0][0]
    pendientes = consultar("SELECT COUNT(*) FROM documentos WHERE completado = FALSE")[0][0]

    print(f"\nKg exportados (en tránsito o entregados): {kg_exportados}")
    print(f"Kg en inventario: {inventario}")
    print(f"Clientes registrados: {clientes}")
    print(f"Documentos pendientes: {pendientes}")

    print("\nClientes con más exportaciones:")
    filas = consultar("""SELECT c.nombre, COUNT(*) FROM exportaciones e
                         INNER JOIN clientes c ON e.cliente_id = c.id
                         GROUP BY c.nombre ORDER BY COUNT(*) DESC""")
    for nombre, total in filas:
        print(f"  {nombre}: {total}")
    print("========================================\n")


# ------------------------------------------------------------
# MENÚS POR ROL
# ------------------------------------------------------------

def menu_administrador():
    while True:
        print("=========== MENÚ ADMINISTRADOR ===========")
        print("PRODUCTOS Y LOTES (HU-05)")
        print("  1. Registrar producto      2. Ver productos")
        print("  3. Registrar lote          4. Ver lotes")
        print("CLIENTES (HU-06, HU-07, HU-08)")
        print("  5. Registrar cliente       6. Ver clientes")
        print("  7. Actualizar cliente      8. Eliminar cliente")
        print("  9. Historial de compras   10. Registrar contrato")
        print(" 11. Ver contratos")
        print("EXPORTACIONES (HU-09, HU-10, HU-11, HU-12)")
        print(" 12. Registrar exportación  13. Ver exportaciones")
        print(" 14. Adjuntar documento     15. Ver documentos")
        print(" 16. Cambiar estado         17. Ver seguimiento")
        print(" 18. Validar normativa UE")
        print("PANEL (HU-13)")
        print(" 19. Panel de control")
        print("  0. Cerrar sesión")

        opcion = input("Elige una opción: ")
        acciones = {
            "1": registrar_producto, "2": listar_productos,
            "3": registrar_lote, "4": listar_lotes,
            "5": registrar_cliente, "6": listar_clientes,
            "7": actualizar_cliente, "8": eliminar_cliente,
            "9": historial_cliente, "10": registrar_contrato,
            "11": ver_contratos,
            "12": registrar_exportacion, "13": listar_exportaciones,
            "14": adjuntar_documento, "15": ver_documentos,
            "16": cambiar_estado, "17": ver_seguimiento,
            "18": validar_cumplimiento, "19": panel_control,
        }
        if opcion == "0":
            print("Sesión cerrada.\n")
            break
        elif opcion in acciones:
            try:
                acciones[opcion]()
            except mysql.connector.Error as error:
                print("Error de base de datos:", error)
            except (ValueError, IndexError):
                print("Dato no válido, intenta de nuevo.")
        else:
            print("Opción no válida.")


def menu_cliente(usuario):
    # El cliente solo puede consultar lo suyo
    mi_id = usuario["cliente_id"]
    while True:
        print("=========== MENÚ CLIENTE ===========")
        print("1. Mis exportaciones")
        print("2. Seguimiento de una exportación")
        print("3. Documentos de una exportación")
        print("4. Mis contratos")
        print("0. Cerrar sesión")

        opcion = input("Elige una opción: ")
        if opcion == "1":
            listar_exportaciones(mi_id)
        elif opcion in ("2", "3"):
            listar_exportaciones(mi_id)
            exp_id = input("ID de la exportación: ")
            es_mia = consultar("SELECT id FROM exportaciones WHERE id = %s AND cliente_id = %s",
                               (exp_id, mi_id))
            if not es_mia:
                print("Esa exportación no pertenece a su cuenta.")
            elif opcion == "2":
                ver_seguimiento(exp_id)
            else:
                ver_documentos(exp_id)
        elif opcion == "4":
            ver_contratos(mi_id)
        elif opcion == "0":
            print("Sesión cerrada.\n")
            break
        else:
            print("Opción no válida.")


# ------------------------------------------------------------
# PROGRAMA PRINCIPAL
# ------------------------------------------------------------

if __name__ == "__main__":
    usuario = iniciar_sesion()
    if usuario is not None:
        if usuario["rol"] == "Administrador":
            menu_administrador()
        else:
            menu_cliente(usuario)
