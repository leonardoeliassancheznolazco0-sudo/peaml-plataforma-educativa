from app.db.database import SessionLocal
from app.models.user import User
from app.models.student import Student
from app.models.content import Content
from app.models.quiz import Question
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
            # --- Contenidos adicionales: 1 por cada perfil x nivel (cobertura completa) ---
            # TEA -> visual
            Content(title="Colores y Formas Básicas", description="Identifica colores y formas simples con imágenes",
                    content_type="visual", level="basico", recommended_profile="TEA", url=""),
            Content(title="Emociones en Imágenes", description="Reconoce emociones a partir de expresiones",
                    content_type="visual", level="intermedio", recommended_profile="TEA", url=""),
            Content(title="Secuencias Visuales de una Historia", description="Ordena los momentos de una historia con apoyo visual",
                    content_type="visual", level="avanzado", recommended_profile="TEA", url=""),
            # TDAH -> interactivo
            Content(title="Encuentra las Diferencias", description="Juego de observación y atención",
                    content_type="interactivo", level="basico", recommended_profile="TDAH", url=""),
            Content(title="Juego de Memoria y Atención", description="Encuentra pares y entrena la concentración",
                    content_type="interactivo", level="intermedio", recommended_profile="TDAH", url=""),
            Content(title="Reto de Lógica por Pasos", description="Resuelve patrones y secuencias lógicas",
                    content_type="interactivo", level="avanzado", recommended_profile="TDAH", url=""),
            # dislexia -> auditivo
            Content(title="Sonidos de las Letras", description="Asocia letras con sus sonidos",
                    content_type="auditivo", level="basico", recommended_profile="dislexia", url=""),
            Content(title="Rimas y Palabras", description="Identifica palabras que riman",
                    content_type="auditivo", level="intermedio", recommended_profile="dislexia", url=""),
            Content(title="Cuento Narrado con Preguntas", description="Escucha un cuento y responde sobre él",
                    content_type="auditivo", level="avanzado", recommended_profile="dislexia", url=""),
            # general -> lectura
            Content(title="Mi Primera Lectura", description="Lectura inicial de palabras y oraciones",
                    content_type="lectura", level="basico", recommended_profile="general", url=""),
            Content(title="Comprensión de Párrafos", description="Lee párrafos y encuentra la idea principal",
                    content_type="lectura", level="intermedio", recommended_profile="general", url=""),
            Content(title="Lectura Crítica de un Texto", description="Distingue hechos, opiniones y propósito del texto",
                    content_type="lectura", level="avanzado", recommended_profile="general", url=""),
        ]
        for c in contents:
            db.add(c)
        db.flush()  # para obtener los IDs de los contenidos recién creados

        # Preguntas reales de opción múltiple (3 por contenido)
        questions_by_content = {
            contents[0].id: [
                ("¿Cuántos lados tiene un triángulo?", "2", "3", "4", "5", "B"),
                ("¿De qué color es el cielo en un día despejado?", "Verde", "Rojo", "Azul", "Negro", "C"),
                ("¿Qué figura es completamente redonda?", "Cuadrado", "Triángulo", "Círculo", "Rectángulo", "C"),
            ],
            contents[1].id: [
                ("¿Dónde ocurre la historia del bosque?", "En el mar", "En el bosque", "En la ciudad", "En el desierto", "B"),
                ("¿Qué usamos para escuchar el cuento?", "Los ojos", "Las manos", "Los oídos", "Los pies", "C"),
                ("Si la historia es mágica, ¿es real o imaginaria?", "Real", "Imaginaria", "Aburrida", "Triste", "B"),
            ],
            contents[2].id: [
                ("¿Cuánto es 2 + 3?", "4", "5", "6", "7", "B"),
                ("¿Cuánto es 5 - 2?", "2", "3", "4", "5", "B"),
                ("¿Cuánto es 4 + 4?", "6", "7", "8", "9", "C"),
            ],
            contents[3].id: [
                ("¿Cuál es el planeta en el que vivimos?", "Marte", "Tierra", "Júpiter", "Venus", "B"),
                ("¿Qué astro nos da luz y calor durante el día?", "La Luna", "El Sol", "Una estrella lejana", "Un cometa", "B"),
                ("¿Cuál es el planeta rojo?", "Tierra", "Saturno", "Marte", "Neptuno", "C"),
            ],
            contents[4].id: [
                ("¿Dónde viven los peces?", "En el aire", "En el agua", "En los árboles", "Bajo tierra", "B"),
                ("¿Cuál de estos animales vive en el océano?", "El león", "El pulpo", "El perro", "La vaca", "B"),
                ("¿Qué mamífero gigante vive en el mar?", "La ballena", "El elefante", "La jirafa", "El caballo", "A"),
            ],
            contents[5].id: [
                ("¿Qué número va después del 3?", "1", "2", "4", "6", "C"),
                ("En la secuencia 2, 4, 6, ¿qué número sigue?", "7", "8", "9", "10", "B"),
                ("¿Qué pasa primero en el día?", "El almuerzo", "La cena", "El desayuno", "Dormir de noche", "C"),
            ],
            contents[6].id: [
                ("¿Cuántos días tiene una semana?", "5", "6", "7", "8", "C"),
                ("¿Qué usamos para medir el tiempo?", "Un reloj", "Una regla", "Una balanza", "Un termómetro", "A"),
                ("¿Qué viene después de la mañana?", "La madrugada", "La tarde", "La semana pasada", "El año", "B"),
            ],
            contents[7].id: [
                ("Al leer un texto, ¿qué hacemos con los ojos?", "Cerrarlos", "Leer", "Dormir", "Llorar", "B"),
                ("¿Con qué signo termina una pregunta escrita?", "Punto (.)", "Coma (,)", "Signo (?)", "Signo (!)", "C"),
                ("Una palabra que nombra algo (mesa, perro) se llama:", "Acción", "Sustantivo", "Número", "Color", "B"),
            ],
            # TEA - básico: Colores y Formas Básicas
            contents[8].id: [
                ("¿De qué color es una banana madura?", "Rojo", "Amarillo", "Azul", "Verde", "B"),
                ("¿Cuál de estas figuras tiene 4 lados iguales?", "Círculo", "Triángulo", "Cuadrado", "Línea", "C"),
                ("¿Qué color se forma al mezclar azul y amarillo?", "Verde", "Rojo", "Morado", "Naranja", "A"),
            ],
            # TEA - intermedio: Emociones en Imágenes
            contents[9].id: [
                ("Si una persona sonríe, ¿cómo se siente?", "Triste", "Feliz", "Enojada", "Asustada", "B"),
                ("Una persona llora porque está:", "Contenta", "Aburrida", "Triste", "Emocionada", "C"),
                ("¿Qué expresión muestra sorpresa?", "Ojos cerrados", "Ojos y boca muy abiertos", "Ceño fruncido", "Sonrisa pequeña", "B"),
            ],
            # TEA - avanzado: Secuencias Visuales de una Historia
            contents[10].id: [
                ("En una historia, ¿qué ocurre primero?", "El final", "El inicio", "La mitad", "El desenlace", "B"),
                ("Si plantas una semilla, ¿qué pasa después?", "Crece una planta", "Desaparece", "Se vuelve piedra", "Vuela", "A"),
                ("Despertar, vestirse, ir a la escuela: ¿qué es lo último?", "Despertar", "Vestirse", "Desayunar", "Ir a la escuela", "D"),
            ],
            # TDAH - básico: Encuentra las Diferencias
            contents[11].id: [
                ("Si dos dibujos son iguales, tienen:", "Muchas diferencias", "Ninguna diferencia", "Colores distintos", "Tamaños distintos", "B"),
                ("Para encontrar diferencias hay que:", "Cerrar los ojos", "Observar con atención", "Adivinar", "Correr", "B"),
                ("¿Cuál de estos NO es un color?", "Rojo", "Azul", "Mesa", "Verde", "C"),
            ],
            # TDAH - intermedio: Juego de Memoria y Atención
            contents[12].id: [
                ("En un juego de memoria buscas cartas:", "Iguales", "Diferentes", "Rotas", "Invisibles", "A"),
                ("Si memorizas 3 cosas y olvidas 1, recordaste:", "0", "1", "2", "Ninguna", "C"),
                ("¿Qué ayuda a concentrarse mejor?", "Mucho ruido", "Un lugar tranquilo", "Muchas pantallas", "Correr", "B"),
            ],
            # TDAH - avanzado: Reto de Lógica por Pasos
            contents[13].id: [
                ("Si 2 + 2 = 4, entonces 4 + 4 = ?", "6", "7", "8", "9", "C"),
                ("Sigue el patrón: 5, 10, 15, ?", "16", "18", "20", "25", "C"),
                ("Si hoy es lunes, ¿qué día será en 2 días?", "Martes", "Miércoles", "Jueves", "Viernes", "B"),
            ],
            # dislexia - básico: Sonidos de las Letras
            contents[14].id: [
                ("¿Con qué letra empieza la palabra 'sol'?", "S", "L", "O", "M", "A"),
                ("La palabra 'mamá' empieza con el sonido:", "M", "P", "T", "S", "A"),
                ("¿Cuántas sílabas tiene 'ca-sa'?", "1", "2", "3", "4", "B"),
            ],
            # dislexia - intermedio: Rimas y Palabras
            contents[15].id: [
                ("¿Qué palabra rima con 'gato'?", "Perro", "Pato", "Casa", "Sol", "B"),
                ("'Sol' rima con:", "Luna", "Farol", "Estrella", "Nube", "B"),
                ("¿Cuál NO rima con 'flor'?", "Color", "Amor", "Mesa", "Calor", "C"),
            ],
            # dislexia - avanzado: Cuento Narrado con Preguntas
            contents[16].id: [
                ("Si escuchas un cuento, usas tu:", "Vista", "Oído", "Olfato", "Gusto", "B"),
                ("El personaje principal de un cuento es el más:", "Olvidado", "Importante", "Pequeño", "Lejano", "B"),
                ("Después de escuchar, para entender mejor conviene:", "Dormir", "Pensar en lo que pasó", "Gritar", "Olvidar", "B"),
            ],
            # general - básico: Mi Primera Lectura
            contents[17].id: [
                ("Leemos las palabras de izquierda a:", "Derecha", "Arriba", "Abajo", "Atrás", "A"),
                ("Una oración empieza con letra:", "Minúscula", "Mayúscula", "Número", "Símbolo", "B"),
                ("¿Qué usamos al final de una oración?", "Coma", "Punto", "Guion", "Asterisco", "B"),
            ],
            # general - intermedio: Comprensión de Párrafos
            contents[18].id: [
                ("La idea principal de un texto es:", "Lo menos importante", "El tema central", "Un dibujo", "Solo el título", "B"),
                ("Si un párrafo habla de perros, su tema es:", "Gatos", "Perros", "Autos", "Comida", "B"),
                ("Para entender un texto difícil conviene:", "Leerlo rápido una vez", "Leerlo con calma y releer", "No leerlo", "Adivinar", "B"),
            ],
            # general - avanzado: Lectura Crítica de un Texto
            contents[19].id: [
                ("Una opinión es algo que:", "Siempre es verdad", "Expresa lo que alguien piensa", "Es un número", "No existe", "B"),
                ("Un hecho se puede:", "Comprobar", "Solo inventar", "Nunca verificar", "Ignorar", "A"),
                ("Si un texto quiere convencerte, su propósito es:", "Informar", "Persuadir", "Solo entretener", "Aburrir", "B"),
            ],
        }
        for content_id, qs in questions_by_content.items():
            for text, a, b, c_opt, d, correct in qs:
                db.add(Question(content_id=content_id, text=text,
                                option_a=a, option_b=b, option_c=c_opt, option_d=d,
                                correct_option=correct))

        db.commit()
        print("✅ Base de datos sembrada con 24 estudiantes, 20 contenidos y 60 preguntas.")
    except Exception as e:
        db.rollback()
        print(f"⚠️ Seed error: {e}")
    finally:
        db.close()