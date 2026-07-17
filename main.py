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
# 📡 ENVÍO DIRECTO A TRAVÉS DE MQTT (¡AHORA DINÁMICO!)
# =========================================================================
def enviar_a_mqtt(id_luz, estado, area):
    try:
        cliente_mqtt = mqtt.Client()
        cliente_mqtt.connect("10.14.15.28", 1883, 60)
        
        # ⭐ SOLUCIÓN: El tópico ahora se arma dinámicamente con el área real
        topico = f"cmnd/{area}/power{id_luz}"
        payload = "ON" if estado else "OFF"
        
        cliente_mqtt.publish(topico, payload)
        cliente_mqtt.disconnect()
        print(f"🚀 [MQTT] Comando enviado con éxito -> {topico}: {payload}")
    except Exception as e:
        print(f"❌ [MQTT] Error al enviar mensaje: {e}")

# =========================================================================
# 🔵 CONTROL INDIVIDUAL (PUESTOS)
# =========================================================================
@app.route('/api/luz', methods=['POST'])
def recibir_luz():
    try:
        datos = request.json
        id_luz = datos.get('luz_id') 
        estado = datos.get('estado')
        area = datos.get('area', 'innovacion') # Obtenemos el área enviada desde JS (por defecto 'innovacion')

        print(f"📡 [Flask] Recibido de Web -> Área: {area} | Luz: {id_luz} | Estado: {'ON' if estado else 'OFF'}")

        # ⭐ SOLUCIÓN: Pasamos el área a la función MQTT
        enviar_a_mqtt(id_luz, estado, area)

        # Después intentamos guardar en la base de datos de manera segura
        try:
            db = obtener_conexion()
            cursor = db.cursor()

            if estado:
                cursor.execute("SELECT id FROM sesiones_luz WHERE luz_id = %s AND hora_apagado IS NULL", (id_luz,))
                if not cursor.fetchone():
                    cursor.execute("INSERT INTO sesiones_luz (luz_id, hora_encendido) VALUES (%s, NOW())", (id_luz,))
            else:
                cursor.execute("UPDATE sesiones_luz SET hora_apagado = NOW() WHERE luz_id = %s AND hora_apagado IS NULL", (id_luz,))

            db.commit()
            cursor.close()
            db.close()
        except Exception as e_db:
            print(f"⚠️ [Base de Datos] Error al registrar historial (pero la luz se envió): {str(e_db)}")

        return jsonify({"status": "ok"})
    except Exception as e:
        print(f"❌ [Flask] Error crítico en /api/luz: {str(e)}")
        return jsonify({"status": "error", "mensaje": str(e)}), 500

# =========================================================================
# 🏢 CONTROL POR PISO (GENERAL)
# =========================================================================
@app.route('/api/luz/piso', methods=['POST'])
def recibir_piso():
    try:
        datos = request.json
        numero_piso = datos.get('piso')
        estado = datos.get('estado')

        print(f"🏢 [Flask] Comando general Piso {numero_piso} -> {'ON' if estado else 'OFF'}")

        db = obtener_conexion()
        cursor = db.cursor()

        if numero_piso == 0:
            cursor.execute("SELECT id FROM luces")
        else:
            cursor.execute("SELECT id FROM luces WHERE piso = %s", (numero_piso,))
        
        luces_a_procesar = cursor.fetchall() 

        for luz in luces_a_procesar:
            id_luz = luz[0]
            
            # Como control de piso usa base de datos, usamos 'innovacion' de fallback temporal
            enviar_a_mqtt(id_luz, estado, 'innovacion')

            try:
                if estado:
                    cursor.execute("SELECT id FROM sesiones_luz WHERE luz_id = %s AND hora_apagado IS NULL", (id_luz,))
                    if not cursor.fetchone():
                        cursor.execute("INSERT INTO sesiones_luz (luz_id, hora_encendido) VALUES (%s, NOW())", (id_luz,))
                else:
                    cursor.execute("UPDATE sesiones_luz SET hora_apagado = NOW() WHERE luz_id = %s AND hora_apagado IS NULL", (id_luz,))
            except Exception as e_db_piso:
                print(f"⚠️ [Base de Datos] Error en luz {id_luz}: {str(e_db_piso)}")

        db.commit()
        cursor.close()
        db.close()
        
        return jsonify({"status": "ok", "mensaje": f"Piso {numero_piso} procesado"})
    except Exception as e:
        print(f"❌ [Flask] Error crítico en /api/luz/piso: {str(e)}")
        return jsonify({"status": "error", "mensaje": str(e)}), 500

if __name__ == '__main__':
    print("🚀 Servidor Flask corriendo con Base de Datos compartida y MQTT...")
    app.run(host='0.0.0.0', port=5000, debug=True)