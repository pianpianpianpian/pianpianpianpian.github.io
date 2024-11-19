import { ThemeOptions } from "@mui/material";
import { action, computed, makeObservable, observable} from "mobx";
import { createTheme } from "@mui/material/styles";
import { DARK_PALETTE, LIGHT_PALETTE } from "./palette";


export class ThemeStore {
    mode = 'light';
    customThemeOptions?: Partial<ThemeOptions>;
  
    constructor(props: { themeOptions?: ThemeOptions } = {}) {
      makeObservable(this, {
        mode: observable,
        palette: computed,
        theme: computed,
        customThemeOptions: false,
        toggleMode: action,
      });
      this.customThemeOptions = props.themeOptions;
    }
  
    // 计算属性
    get palette() {
      return this.mode === 'light' ? LIGHT_PALETTE : DARK_PALETTE;
    }
  
    // 计算属性
    get theme() {
      // 基于 mode 和 palette 计算主题
      return createTheme({
        palette: this.palette,
        ...this.customThemeOptions
      });
    }
  
    // action
    toggleMode() {
      console.log('toggleMode', this.mode);
      this.mode = this.mode === 'light' ? 'dark' : 'light';
    }
  }

  const themeStore = new ThemeStore();
  export default themeStore;