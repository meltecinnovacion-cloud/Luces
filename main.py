import paho.mqtt.client as mqtt
from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector

app = Flask(__name__)
CORS(app)

# =========================================================================
# 🔌 CONEXIÓN UNIFICADA A TU BASE DE DATOS ORIGINAL
# =========================================================================
def obtener_conexion():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="Luz2710*",       # Tu contraseña real
        database="luces_oficina"   # Tu base de datos original compartida
    )

# =========================================================================
# 2. 🌟 EL "OÍDO" MQTT (SUBSCRIBER 24/7)
# =========================================================================
def on_connect(client, userdata, flags, rc):
    print(f"✅ [MQTT Escucha] Conectado exitosamente al broker (Código {rc})")
    # Nos suscribimos a todos los tópicos de estado (stat) de todas las áreas
    # El símbolo '#' significa "escuchar todo lo que siga después de stat/"
    client.subscribe("stat/#") 

def on_message(client, userdata, msg):
    try:
        topic = msg.topic
        payload = msg.payload.decode('utf-8').strip().upper()
        print(f"📥 [Físico -> Servidor] Detectado cambio: {topic} -> {payload}")

        # Ejemplo de tópico esperado: stat/innovacion/POWER1
        partes = topic.split('/')
        if len(partes) >= 3 and partes[0] == "stat" and partes[2].startswith("POWER"):
            area = partes[1]
            id_luz_str = partes[2].replace("POWER", "")
            
            if not id_luz_str.isdigit():
                return
                
            id_luz = int(id_luz_str)
            estado_real = (payload == "ON")

            # Actualizamos la Base de Datos con la verdad absoluta
            db = obtener_conexion()
            cursor = db.cursor()

            if estado_real:
                # Revisamos si ya estaba encendida en BD para no duplicar
                cursor.execute("SELECT id FROM sesiones_luz WHERE luz_id = %s AND hora_apagado IS NULL", (id_luz,))
                if not cursor.fetchone():
                    cursor.execute("INSERT INTO sesiones_luz (luz_id, hora_encendido) VALUES (%s, NOW())", (id_luz,))
                    print(f"📝 [BD] Registrada luz {id_luz} como ENCENDIDA desde hardware.")
            else:
                # Revisamos si estaba encendida y la apagamos
                cursor.execute("SELECT id FROM sesiones_luz WHERE luz_id = %s AND hora_apagado IS NULL", (id_luz,))
                if cursor.fetchone():
                    cursor.execute("UPDATE sesiones_luz SET hora_apagado = NOW() WHERE luz_id = %s AND hora_apagado IS NULL", (id_luz,))
                    print(f"📝 [BD] Registrada luz {id_luz} como APAGADA desde hardware.")

            db.commit()
            cursor.close()
            db.close()

    except Exception as e:
        print(f"❌ [MQTT Escucha] Error procesando mensaje: {e}")

def iniciar_oido_mqtt():
    cliente_escucha = mqtt.Client(client_id="ServidorFlask_Listener")
    cliente_escucha.on_connect = on_connect
    cliente_escucha.on_message = on_message
    
    try:
        cliente_escucha.connect("10.14.15.28", 1883, 60)
        # loop_start() ejecuta la escucha en un hilo (thread) invisible
        # para que no bloquee tu servidor Flask. ¡Es la magia del tiempo real!
        cliente_escucha.loop_start() 
    except Exception as e:
        print(f"❌ [MQTT Escucha] No se pudo conectar al broker para escuchar: {e}")

# =========================================================================
# 3. ENVÍO DE COMANDOS (PUBLISHER)
# =========================================================================
def enviar_a_mqtt(id_luz, estado, area):
    try:
        cliente_mqtt = mqtt.Client()
        cliente_mqtt.connect("10.14.15.28", 1883, 60)
        topico = f"cmnd/{area}/power{id_luz}"
        payload = "ON" if estado else "OFF"
        
        cliente_mqtt.publish(topico, payload)
        cliente_mqtt.disconnect()
        print(f"🚀 [Web -> Físico] Comando enviado: {topico} -> {payload}")
    except Exception as e:
        print(f"❌ [MQTT] Error al enviar: {e}")

# =========================================================================
# 4. RUTAS WEB (API)
# =========================================================================
@app.route('/api/luz', methods=['POST'])
def recibir_luz():
    try:
        datos = request.json
        id_luz = datos.get('luz_id') 
        estado = datos.get('estado')
        area = datos.get('area', 'innovacion')
        enviar_a_mqtt(id_luz, estado, area)
        return jsonify({"status": "ok"})
    except Exception as e:
        return jsonify({"status": "error", "mensaje": str(e)}), 500

@app.route('/api/luces/estado', methods=['POST'])
def obtener_estado_luces():
    try:
        datos = request.json or {}
        numero_piso = datos.get('piso', 0) 
        db = obtener_conexion()
        cursor = db.cursor()

        if numero_piso == 0:
            sql = "SELECT e.id_luz, e.nombre, e.cargo, e.piso_id, CASE WHEN s.hora_apagado IS NULL AND s.luz_id IS NOT NULL THEN 1 ELSE 0 END AS estado FROM empleados e LEFT JOIN sesiones_luz s ON e.id_luz = s.luz_id AND s.hora_apagado IS NULL"
            cursor.execute(sql)
        else:
            sql = "SELECT e.id_luz, e.nombre, e.cargo, e.piso_id, CASE WHEN s.hora_apagado IS NULL AND s.luz_id IS NOT NULL THEN 1 ELSE 0 END AS estado FROM empleados e LEFT JOIN sesiones_luz s ON e.id_luz = s.luz_id AND s.hora_apagado IS NULL WHERE e.piso_id = %s"
            cursor.execute(sql, (numero_piso,))
        
        luces_procesadas = [{"id_luz": f[0], "nombre": f[1], "cargo": f[2], "piso_id": f[3], "estado": bool(f[4])} for f in cursor.fetchall()]
        cursor.close()
        db.close()
        return jsonify(luces_procesadas), 200
    except Exception as e:
        return jsonify({"status": "error", "mensaje": str(e)}), 500


@app.route('/debug/bd', methods=['GET'])
def debug_bd():
    try:
        db = obtener_conexion()
        # dictionary=True hace que nos devuelva los datos con el nombre de las columnas
        cursor = db.cursor(dictionary=True) 
        cursor.execute("SELECT * FROM sesiones_luz")
        datos = cursor.fetchall()
        cursor.close()
        db.close()
        return jsonify({"total_registros": len(datos), "datos": datos}), 200
    except Exception as e:
        return jsonify({"error_real": str(e)}), 500

if __name__ == '__main__':
    # 🌟 ENCENDEMOS EL OÍDO ANTES DE ARRANCAR LA WEB
    print("Iniciando conexión MQTT permanente...")
    iniciar_oido_mqtt()
    
    print("🚀 Servidor Flask corriendo...")
    app.run(host='0.0.0.0', port=5000, debug=False) # IMPORTANTE: debug=False evita que el listener se duplique