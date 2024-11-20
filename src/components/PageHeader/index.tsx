import { Button, IconButton, SvgIcon } from "@mui/material";
import themeStore from "../../utils/theme/theme";
import { observer } from "mobx-react-lite";
import { useCallback } from "react";
import i18n from '../../utils/i18n';
import { I18nextProvider } from 'react-i18next';
import ViewBlog from "../../pages/ViewBlog";
import {BedtimeOutlined, LightModeOutlined} from '@mui/icons-material';

// 在 React 组件中使用
function PageHeader() {
  return (
    <div style={{backgroundColor: themeStore.theme.palette.background.default, color: themeStore.theme.palette.text.primary }}>
    <div style={{display: 'flex', alignItems: 'center'}}>
        <button onClick={() => themeStore.toggleMode()}>
        切换主题
      </button>
      <IconButton>
      <BedtimeOutlined>

      </BedtimeOutlined>
      </IconButton>
      
      <LightModeOutlined>

      </LightModeOutlined>

      {/* <PublicOutlined>

      </PublicOutlined> */}

      <IconButton onClick={() => i18n.changeLanguage('zh')} sx={{color: themeStore.theme.palette.text.primary}}>
        <SvgIcon>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
          </svg>
        </SvgIcon>

        {/* <Language /> */}    
      </IconButton>
      <IconButton onClick={() => i18n.changeLanguage('en')} sx={{color: themeStore.theme.palette.text.primary}}>
        <SvgIcon>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
</svg>
</SvgIcon>
</IconButton>
      
        {/* <Button onClick={() => i18n.changeLanguage('en')} color={themeStore.theme.palette.primary}>EN</Button>
        <Button onClick={() => i18n.changeLanguage('zh')} color={themeStore.theme.palette.primary}>CN</Button> */}
      当前主题：{themeStore.mode}
      
    </div>
    <ViewBlog />
    </div>
  );
}

export default observer(PageHeader);


