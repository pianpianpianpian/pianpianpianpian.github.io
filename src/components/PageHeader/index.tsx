import { Box, Button, IconButton, Menu, MenuItem, SvgIcon } from "@mui/material";
import themeStore from "../../utils/theme/theme";
import { observer } from "mobx-react-lite";
import { useCallback, useState } from "react";
import i18n from '../../utils/i18n';
import { I18nextProvider } from 'react-i18next';
import ViewBlog from "../../pages/ViewBlog";
import {BedtimeOutlined, LightModeOutlined} from '@mui/icons-material';
import TranslateOutlinedIcon from '@mui/icons-material/TranslateOutlined';
import { Language } from '../../utils/i18n';

// 在 React 组件中使用
function PageHeader() {
  const [langAnchorEle, setLangAnchorEle] = useState<null | HTMLElement>(null);
  const [userAnchorEle, setUserAnchorEle] = useState<null | HTMLElement>(null);

  // const changeLang = useCallback(
  //   (lang: Language) => {
  //     commonStore.changeLanguage(lang);
  //     setLangAnchorEle(null);
  //   },
  //   [commonStore]
  // );

  const changeLang = useCallback(
    (lang: Language) => {
      i18n.changeLanguage(lang);
      setLangAnchorEle(null);
    },
    []
  );

  return (
    <Box sx={{
      backgroundColor: themeStore.theme.palette.background.default, 
      color: themeStore.theme.palette.text.primary ,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 2,
      fontSize: '1.5rem',
      borderBottom: `1px solid ${themeStore.theme.palette.divider}`,
      borderRadius: '0.5rem', 
      }}>
      <Box>
        Qin.Dev
      </Box>
      <Box sx={{display: 'flex', alignItems: 'center'}}>
        <IconButton onClick={() => themeStore.toggleMode()}  sx={{color: themeStore.theme.palette.text.primary}}>
          {themeStore.mode === 'dark' ?  <BedtimeOutlined/>: <LightModeOutlined/>}
        </IconButton>
        <IconButton onClick={(e) => setLangAnchorEle(e.currentTarget)} sx={{color: themeStore.theme.palette.text.primary}}>
          <TranslateOutlinedIcon/>
        </IconButton>        
      </Box>
      <Menu
        anchorEl={langAnchorEle}
        open={!!langAnchorEle}
        onClose={() => setLangAnchorEle(null)}
        MenuListProps={{ 'aria-labelledby': 'basic-button' }}
      >
        <MenuItem onClick={() => changeLang(Language.EN_US)}>English</MenuItem>
        <MenuItem onClick={() => changeLang(Language.ZH_CN)}>中文</MenuItem>
      </Menu>
    </Box>
  );
}

export default observer(PageHeader);


