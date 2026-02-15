import { createRoot } from 'react-dom/client';
import App from './App.tsx';

import '@/assets/css/base.css';
import 'uno.css';

createRoot(document.getElementById('root')!).render(<App />);
