from app.core.database import SessionLocal
from app.core.security import hashear_contrasena
from app.models.usuario import Usuario
from app.models.estudiante import Estudiante
from app.models.actividad import Actividad

def seed():
    db = SessionLocal()
    try:
        # Verificar si ya hay datos
        if db.query(Usuario).first():
            print("La base de datos ya tiene datos, saltando seed.")
            return

        print("Creando usuarios...")

        # Usuarios docentes
        docente1 = Usuario(nombre="Prof. María García", email="docente@peaml.com", contrasena=hashear_contrasena("123456"), rol="docente")
        docente2 = Usuario(nombre="Prof. Carlos López", email="docente2@peaml.com", contrasena=hashear_contrasena("123456"), rol="docente")

        # Usuario padre
        padre1 = Usuario(nombre="Roberto Pérez", email="padre@peaml.com", contrasena=hashear_contrasena("123456"), rol="padre")

        db.add_all([docente1, docente2, padre1])
        db.commit()

        print("Creando estudiantes...")

        estudiantes_data = [
            ("Lucas Torres", "TEA", "visual", 2),
            ("Sofía Ramírez", "TDAH", "auditivo", 3),
            ("Mateo Flores", "Dislexia", "kinestesico", 1),
            ("Valentina Cruz", "TEA", "visual", 4),
            ("Diego Mendoza", "TDAH", "mixto", 2),
            ("Isabella Rojas", "Discalculia", "visual", 3),
            ("Sebastián Vargas", "Dislexia", "auditivo", 2),
            ("Camila Herrera", "TEA", "kinestesico", 1),
            ("Nicolás Jiménez", "TDAH", "visual", 5),
            ("Daniela Morales", "Dislexia", "mixto", 3),
            ("Alejandro Castro", "TEA", "auditivo", 2),
            ("Valeria Ortega", "Discalculia", "visual", 4),
            ("Samuel Ruiz", "TDAH", "kinestesico", 1),
            ("María José Silva", "TEA", "visual", 3),
            ("Andrés Navarro", "Dislexia", "auditivo", 2),
            ("Luciana Guerrero", "TDAH", "mixto", 4),
            ("Felipe Ramos", "TEA", "visual", 1),
            ("Gabriela Medina", "Discalculia", "kinestesico", 3),
            ("Tomás Reyes", "Dislexia", "visual", 2),
            ("Antonella Soto", "TDAH", "auditivo", 5),
            ("Emilio Paredes", "TEA", "mixto", 2),
            ("Renata Vega", "Dislexia", "visual", 3),
            ("Joaquín Ibáñez", "Discalculia", "auditivo", 4),
            ("Ximena Fuentes", "TDAH", "kinestesico", 1),
        ]

        grados = ["1° Primaria", "2° Primaria", "3° Primaria", "4° Primaria", "5° Primaria", "6° Primaria"]

        for i, (nombre, condicion, estilo, nivel) in enumerate(estudiantes_data):
            usuario = Usuario(
                nombre=nombre,
                email=f"alumno{i+1}@peaml.com",
                contrasena=hashear_contrasena("123456"),
                rol="alumno"
            )
            db.add(usuario)
            db.commit()

            estudiante = Estudiante(
                usuario_id=usuario.id,
                grado=grados[i % len(grados)],
                condicion=condicion,
                estilo_aprendizaje=estilo,
                nivel_actual=nivel,
                docente_id=docente1.id
            )
            db.add(estudiante)

        db.commit()

        print("Creando actividades...")

        actividades = [
            ("Aprendo las vocales con imágenes", "lectura", "visual", 1, "TEA"),
            ("Cuento con mis dedos", "ejercicio", "kinestesico", 1, "Discalculia"),
            ("El abecedario cantado", "audio", "auditivo", 1, "Dislexia"),
            ("Formas y colores", "juego", "visual", 2, "TEA"),
            ("Suma con objetos", "ejercicio", "kinestesico", 2, "Discalculia"),
            ("Historia corta con audio", "audio", "auditivo", 2, "Dislexia"),
            ("Laberinto de letras", "juego", "visual", 3, "TDAH"),
            ("Multiplicación visual", "video", "visual", 3, "Discalculia"),
            ("Comprensión lectora nivel 3", "lectura", "visual", 3, "Dislexia"),
            ("Secuencias lógicas", "ejercicio", "kinestesico", 4, "TEA"),
            ("Fracciones con pizza", "video", "visual", 4, "Discalculia"),
            ("Dictado adaptado", "audio", "auditivo", 4, "Dislexia"),
            ("Resolución de problemas", "ejercicio", "visual", 5, "TDAH"),
            ("Geometría interactiva", "juego", "visual", 5, "TEA"),
            ("Lectura avanzada con TTS", "audio", "auditivo", 5, "Dislexia"),
        ]

        for titulo, tipo, modalidad, nivel, condicion in actividades:
            actividad = Actividad(
                titulo=titulo,
                tipo=tipo,
                modalidad=modalidad,
                nivel=nivel,
                condicion_objetivo=condicion,
                duracion_min=10
            )
            db.add(actividad)

        db.commit()
        print("Seed completado exitosamente.")
        print("Usuarios creados: docente@peaml.com, padre@peaml.com, alumno1@peaml.com ... (todos con contraseña: 123456)")

    except Exception as e:
        print(f"Error en seed: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
