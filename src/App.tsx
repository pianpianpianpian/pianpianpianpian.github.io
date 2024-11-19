import { Button, createTheme, ThemeProvider, useColorScheme } from '@mui/material';
import ViewBlog from './pages/ViewBlog';
import i18n from './utils/i18n';
import { I18nextProvider } from 'react-i18next';
import PageHeader from './components/PageHeader';
import themeStore from './utils/theme/theme';



 export default function App() {
  
  return (
    <I18nextProvider i18n={i18n}>
    <ThemeProvider theme={themeStore.theme}>
        <div className="App"
        
        >
        <PageHeader />
        
        <ViewBlog />
      </div>
    </ThemeProvider>
    </I18nextProvider>
  );
}

// export default App;

