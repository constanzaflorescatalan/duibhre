import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { AgendaPage } from '../pages/AgendaPage';
import { ChapterPage } from '../pages/ChapterPage';
import { CoverPage } from '../pages/CoverPage';
import { DedicationPage } from '../pages/DedicationPage';
import { CreatePage } from '../pages/CreatePage';
import { EntryFormPage } from '../pages/EntryFormPage';
import { EventFormPage } from '../pages/EventFormPage';
import { EventPage } from '../pages/EventPage';
import { EntryPage } from '../pages/EntryPage';
import { HomePage } from '../pages/HomePage';
import { IndexPage } from '../pages/IndexPage';
import { JournalFormPage } from '../pages/JournalFormPage';
import { JournalPage } from '../pages/JournalPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ProfilePage } from '../pages/ProfilePage';
import { RecordPage } from '../pages/RecordPage';
import { SearchPage } from '../pages/SearchPage';
import { SubtopicPage } from '../pages/SubtopicPage';

/** Rutas de la sección 12. La portada vive fuera del shell con navbar. */
export const routes: RouteObject[] = [
  { path: '/', element: <CoverPage /> },
  {
    element: <AppShell />,
    children: [
      { path: '/inicio', element: <HomePage /> },
      { path: '/indice', element: <IndexPage /> },
      { path: '/capitulos/:chapterId', element: <ChapterPage /> },
      { path: '/capitulos/:chapterId/subtemas/:subtopicId', element: <SubtopicPage /> },
      { path: '/fichas/:entryId', element: <EntryPage /> },
      { path: '/fichas/:entryId/editar', element: <EntryFormPage mode="edit" /> },
      { path: '/crear', element: <CreatePage /> },
      { path: '/crear/ficha', element: <EntryFormPage mode="create" /> },
      { path: '/crear/nota', element: <JournalFormPage mode="create" /> },
      { path: '/crear/evento', element: <EventFormPage mode="create" /> },
      { path: '/agenda', element: <AgendaPage /> },
      { path: '/agenda/eventos/:eventId', element: <EventPage /> },
      { path: '/agenda/eventos/:eventId/editar', element: <EventFormPage mode="edit" /> },
      { path: '/bitacora', element: <JournalPage /> },
      { path: '/bitacora/:recordId', element: <RecordPage /> },
      { path: '/bitacora/:recordId/editar', element: <JournalFormPage mode="edit" /> },
      { path: '/buscar', element: <SearchPage /> },
      { path: '/perfil', element: <ProfilePage /> },
      { path: '/dedicatoria', element: <DedicationPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];

export const router = createBrowserRouter(routes);
