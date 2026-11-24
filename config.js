/* =====================================================================
   MICA FEST — CONFIGURACIÓN DE LA INVITACIÓN
   Edita SOLO este archivo. Guarda y vuelve a publicar.
   ===================================================================== */
window.INVITACION = {

  // true muestra la cinta «Vista de demostración». Pon false al enviar.
  demo: true,

  // ---------------- Portada ----------------
  nombre: "Mica",                       // se usa en el mensaje de WhatsApp
  titulo: "MICA FEST",                  // título grande
  saludo: "It's my birthday",           // frase en letra manuscrita
  frase: "Mi gran noche llegó y te quiero en ella",

  // ---------------- Fecha y hora ----------------
  // 03/01/2027 = 3 de enero de 2027. Hora de inicio 15:00, hora de España (+01:00).
  fechaHoraISO: "2027-01-03T15:00:00+01:00",
  mes: "ENERO",
  dia: "03",
  anio: "2027",
  hora: "15:00 H",
  fechaTexto: "Domingo 3 de enero de 2027",

  // ---------------- Familia ----------------
  padres: ["Alexander Aguilar Ayaviri", "Micaela Toro Bobarin"],
  padrinos: ["Wendy Toro Bobarin", "Alexander Aguilar Toro"],

  // ---------------- Lugar ----------------
  lugar: {
    nombre: "",        // ej. "Salón Los Olivos" (vacío = no se muestra)
    direccion: "",     // ej. "Calle Mayor 10, Madrid" (vacío = no se muestra)
    enlaceMaps: "https://maps.app.goo.gl/rsZy7WDxK629k8YA9"
  },

  dressCode: "FORMAL",

  cronograma: [
    { hora: "15:00", icono: "🕰️", texto: "Recepción" },
    { hora: "17:00", icono: "👑", texto: "Ingreso de la Quinceañera" },
    { hora: "17:45", icono: "💫", texto: "Ceremonia del Vals" },
    { hora: "18:15", icono: "🥂", texto: "Brindis" },
    { hora: "18:30", icono: "🎼", texto: "Primer Bloque de Baile" },
    { hora: "20:00", icono: "🕯️", texto: "Cena" },
    { hora: "21:00", icono: "🍰", texto: "Corte de Tarta" },
    { hora: "21:30", icono: "✨", texto: "Segundo Bloque de Baile" },
    { hora: "23:30", icono: "🌙", texto: "Despedida" }
  ],

  regalo: "No hace falta regalo, pero si quieres sumarte a mis próximos sueños habrá sobres disponibles.",
  avisoAdultos: "La celebración es un evento reservado exclusivamente para adultos. Gracias por vuestra comprensión.",
  textoConfirmar: "Para una perfecta organización del evento, necesitamos que confirmes tu presencia con brevedad.",

  // ---------------- WhatsApp para confirmar ----------------
  whatsapp: "34666803347",          // solo dígitos, con indicativo (34 = España)

  // ---------------- Fotos ----------------
  // Las 4 actuales son ilustraciones genéricas. Reemplázalas por fotos reales
  // subiéndolas junto a index.html (JPG, máx. 1600 px de ancho, < 400 KB).
  fotoPortada: "foto-2.jpeg",       // foto tipo polaroid junto a la familia
  fotoCuentaRegresiva: "foto-5.jpeg",
  fotos: [
    { src: "foto-2.jpeg", alt: "Mica" },
    { src: "foto-1.jpeg", alt: "Bola de discoteca" },
    { src: "foto-3.jpeg", alt: "Tiara XV" },
    { src: "foto-4.jpeg", alt: "Brindis" }
  ],

  // ---------------- Música de fondo ----------------
  // Sube los MP3 al repositorio (junto a index.html) con estos nombres. Suenan en orden y
  // se repiten. Si un archivo no está, suena una melodía ambiental de respaldo.
  musica: [
    { archivo: "dance.mp3",     titulo: "Dance — Dua Lipa" },
    { archivo: "i-love-it.mp3", titulo: "I Love It — Icona Pop" }
  ],

   // ---------------- Confirmación ----------------
  // En el formulario cada invitado escribe cuántas personas van.
  // Este es el máximo que puede elegir (no se muestra en la invitación).
  maxPersonas: 10,

  // ---------------- Registro central opcional (Supabase) ----------------
  supabase: { url: "", anonKey: "" },

  // ---------------- Colores y tipografías ----------------
  colores: { negro: "#0b0b0c", blanco: "#fafafa", gris: "#e8e8ea", boton: "#6d6e74", plata: "#c4c6cc" },
  tipografias: { manuscrita: "Allura", titulos: "Cinzel", condensada: "Oswald", texto: "Jost" }
};
