import { AppConfigProvider } from '@/contexts/ConfigProviderContext';
import { ThemeProvider } from '@/contexts/ThemeProvider';
import { SocketProviderContext } from '@app/contexts';
import { RouterProvider } from 'react-router-dom';
import router from './router';

function App() {
  return (
    <AppConfigProvider>
      <ThemeProvider>
        <SocketProviderContext url="">
          <RouterProvider router={router} />
        </SocketProviderContext>
      </ThemeProvider>
    </AppConfigProvider>
  );
}

export default App;
