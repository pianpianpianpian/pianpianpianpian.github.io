import { Button } from "@mui/material";
import themeStore from "../../utils/theme/theme";
import { observer } from "mobx-react-lite";
import { useCallback } from "react";
import i18n from '../../utils/i18n';
import { I18nextProvider } from 'react-i18next';
// 在 React 组件中使用
function PageHeader() {
  return (
    <div style={{display: 'flex', alignItems: 'center'}}>
        <button onClick={() => themeStore.toggleMode()}>
        切换主题
      </button>
        <Button color="error" onClick={() => i18n.changeLanguage('en')}>EN</Button>
        <Button color="error" onClick={() => i18n.changeLanguage('zh')}>CN</Button>
      当前主题：{themeStore.mode}
      
    </div>
  );
}

export default observer(PageHeader);


