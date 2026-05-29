from app.db.database import SessionLocal
from app.models.user import User
from app.models.student import Student
from app.models.content import Content
from app.core.security import get_password_hash


def seed_initial_data():
    db = SessionLocal()
    try:
        if db.query(User).count() > 0:
            return

        # Admin
        admin = User(name="Administrador PEAML", email="admin@peaml.edu",
                     password_hash=get_password_hash("admin123"), role="admin",
                     status="active")
        db.add(admin)
        db.flush()

        # Docentes
        teacher = User(name="Prof. María García", email="docente@peaml.edu",
                       password_hash=get_password_hash("docente123"), role="teacher",
                       status="active", created_by=admin.id)
        teacher2 = User(name="Prof. Carlos López", email="docente2@peaml.edu",
                        password_hash=get_password_hash("docente123"), role="teacher",
                        status="active", created_by=admin.id)
        db.add_all([teacher, teacher2])
        db.flush()

        # 24 estudiantes
        students_data = [
            ("Lucas Torres",       "lucas@peaml.edu",      9,  "TEA",         "visual"),
            ("Sofía Ramírez",      "sofia@peaml.edu",      10, "TDAH",        "interactivo"),
            ("Mateo Flores",       "mateo@peaml.edu",      8,  "dislexia",    "auditivo"),
            ("Valentina Cruz",     "valentina@peaml.edu",  11, "TEA",         "visual"),
            ("Diego Mendoza",      "diego@peaml.edu",      9,  "TDAH",        "interactivo"),
            ("Isabella Rojas",     "isabella@peaml.edu",   10, "general",     "visual"),
            ("Sebastián Vargas",   "sebastian@peaml.edu",  8,  "dislexia",    "auditivo"),
            ("Camila Herrera",     "camila@peaml.edu",     11, "TEA",         "visual"),
            ("Nicolás Jiménez",    "nicolas@peaml.edu",    9,  "TDAH",        "interactivo"),
            ("Daniela Morales",    "daniela@peaml.edu",    10, "dislexia",    "lectura"),
            ("Alejandro Castro",   "alejandro@peaml.edu",  8,  "TEA",         "visual"),
            ("Valeria Ortega",     "valeria@peaml.edu",    11, "general",     "lectura"),
            ("Samuel Ruiz",        "samuel@peaml.edu",     9,  "TDAH",        "interactivo"),
            ("María José Silva",   "mariajose@peaml.edu",  10, "TEA",         "visual"),
            ("Andrés Navarro",     "andres@peaml.edu",     8,  "dislexia",    "auditivo"),
            ("Luciana Guerrero",   "luciana@peaml.edu",    11, "TDAH",        "interactivo"),
            ("Felipe Ramos",       "felipe@peaml.edu",     9,  "TEA",         "visual"),
            ("Gabriela Medina",    "gabriela@peaml.edu",   10, "general",     "lectura"),
            ("Tomás Reyes",        "tomas@peaml.edu",      8,  "dislexia",    "auditivo"),
            ("Antonella Soto",     "antonella@peaml.edu",  11, "TDAH",        "interactivo"),
            ("Emilio Paredes",     "emilio@peaml.edu",     9,  "TEA",         "visual"),
            ("Renata Vega",        "renata@peaml.edu",     10, "dislexia",    "auditivo"),
            ("Joaquín Ibáñez",     "joaquin@peaml.edu",    8,  "general",     "lectura"),
            ("Ximena Fuentes",     "ximena@peaml.edu",     11, "TDAH",        "interactivo"),
        ]

        for name, email, age, profile, pref in students_data:
            user = User(name=name, email=email,
                        password_hash=get_password_hash("estudiante123"), role="student",
                        status="active", created_by=teacher.id)
            db.add(user)
            db.flush()
            student = Student(user_id=user.id, age=age,
                              cognitive_profile=profile, learning_preference=pref,
                              assigned_by=teacher.id)
            db.add(student)

        # Contenidos
        contents = [
            Content(title="Figuras Geométricas en Colores", description="Aprende formas con animaciones coloridas",
                    content_type="visual", level="basico", recommended_profile="TEA", url="https://example.com/geo"),
            Content(title="Cuento Sonoro: El Bosque Mágico", description="Historia narrada con efectos de sonido",
                    content_type="auditivo", level="basico", recommended_profile="dislexia", url="https://example.com/cuento"),
            Content(title="Juego de Matemáticas Interactivo", description="Suma y resta con puzzles divertidos",
                    content_type="interactivo", level="intermedio", recommended_profile="TDAH", url="https://example.com/mates"),
            Content(title="Lectura: Los Planetas del Sistema Solar", description="Texto adaptado con imágenes de apoyo",
                    content_type="lectura", level="avanzado", recommended_profile="general", url="https://example.com/planetas"),
            Content(title="Video: Animales del Océano", description="Documental breve con subtítulos",
                    content_type="visual", level="basico", recommended_profile="TEA", url="https://example.com/oceano"),
            Content(title="Actividad: Ordenar Secuencias", description="Ejercicio de lógica con tarjetas",
                    content_type="interactivo", level="intermedio", recommended_profile="TDAH", url="https://example.com/secuencias"),
            Content(title="Podcast Educativo: Historia del Tiempo", description="Audio explicativo sobre el tiempo",
                    content_type="auditivo", level="intermedio", recommended_profile="dislexia", url="https://example.com/tiempo"),
            Content(title="Texto: Comprensión Lectora Nivel 1", description="Párrafos cortos con preguntas",
                    content_type="lectura", level="basico", recommended_profile="general", url="https://example.com/comprension"),
        ]
        for c in contents:
            db.add(c)

        db.commit()
        print("✅ Base de datos sembrada con 24 estudiantes y contenidos.")
    except Exception as e:
        db.rollback()
        print(f"⚠️ Seed error: {e}")
    finally:
        db.close()