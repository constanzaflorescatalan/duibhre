import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell';
import { AgendaPage } from '../pages/AgendaPage';
import { ChapterPage } from '../pages/ChapterPage';
import { CoverPage } from '../pages/CoverPage';
import { CreateEntryPage } from '../pages/CreateEntryPage';
import { CreatePage } from '../pages/CreatePage';
import { CreatePlaceholderPage } from '../pages/CreatePlaceholderPage';
import { EntryPage } from '../pages/EntryPage';
import { HomePage } from '../pages/HomePage';
import { IndexPage } from '../pages/IndexPage';
import { JournalPage } from '../pages/JournalPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ProfilePage } from '../pages/ProfilePage';
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
      { path: '/fichas/:entryId/editar', element: <CreateEntryPage mode="edit" /> },
      { path: '/crear', element: <CreatePage /> },
      { path: '/crear/ficha', element: <CreateEntryPage /> },
      { path: '/crear/nota', element: <CreatePlaceholderPage kind="nota" /> },
      { path: '/crear/evento', element: <CreatePlaceholderPage kind="evento" /> },
      { path: '/agenda', element: <AgendaPage /> },
      { path: '/bitacora', element: <JournalPage /> },
      { path: '/buscar', element: <SearchPage /> },
      { path: '/perfil', element: <ProfilePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];

export const router = createBrowserRouter(routes);
