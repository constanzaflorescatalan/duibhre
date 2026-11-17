/** Textos de interfaz centralizados (secciones 6 y 7). */
export const UI = {
  appName: 'DUIBHRÉ',
  tagline: 'Grimorio de un alma',
  coverAlt:
    'Portada de cuero verde oscuro con cinco fases lunares en la parte superior, el título DUIBHRÉ con una D capitular de nudos celtas, la bajada «Grimorio de un alma» y una triquetra dorada en la parte inferior.',
  openGrimoire: 'Abrir grimorio',

  nav: {
    home: 'Inicio',
    index: 'Índice',
    create: 'Crear',
    agenda: 'Agenda',
    journal: 'Bitácora',
  },

  pages: {
    home: { title: 'Mi grimorio', subtitle: 'Cada página guarda un fragmento de tu historia' },
    index: { title: 'Índice del grimorio', subtitle: 'Escoge el sendero que deseas explorar' },
    agenda: { title: 'Agenda mágica', subtitle: 'Tus ciclos, celebraciones y páginas por venir' },
    journal: { title: 'Memorias del alma', subtitle: 'Todo lo que has vivido y conservado en tus páginas' },
    search: { title: 'Buscar en mi grimorio' },
    profile: { title: 'Guardiana del grimorio' },
    create: { title: 'Crear', subtitle: '¿Qué página deseas escribir?' },
    createEntry: { title: 'Escribir una nueva página' },
    editEntry: { title: 'Editar página' },
    createNote: { title: 'Dejar una memoria' },
    createEvent: { title: 'Nuevo evento o recordatorio' },
  },

  createOptions: {
    entry: 'Nueva ficha de conocimiento',
    note: 'Nueva entrada de bitácora',
    event: 'Nuevo evento o recordatorio',
  },

  empty: {
    app: { title: 'Tu grimorio todavía espera su primera página', action: 'Crear mi primera ficha' },
    family: { title: 'Aún no has escrito sobre este sendero', action: 'Agregar conocimiento' },
    notes: { title: 'Todavía no hay memorias guardadas', action: 'Escribir una memoria' },
    search: { title: 'No encontramos páginas con esa búsqueda', action: 'Limpiar filtros' },
    aiUnavailable: 'La transformación ilustrada estará disponible próximamente',
  },

  stage2: 'Disponible en la Etapa 2',
  localDataNotice: 'Tus datos se guardan en este dispositivo',
  exampleBadge: 'Ejemplo',
} as const;
