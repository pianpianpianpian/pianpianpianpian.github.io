import { ThemeOptions } from "@mui/material";
import { action, computed, makeObservable, observable} from "mobx";
import { createTheme, Palette } from "@mui/material/styles";
import { DARK_PALETTE, LIGHT_PALETTE } from "./palette";

import { PaletteOptions } from "@mui/material/styles";

type QinColorItem = typeof LIGHT_PALETTE | typeof DARK_PALETTE;
export interface QinColorPalette extends Omit<Palette, 'getContrastText' | 'augmentColor'> {
  vesoft: QinColorItem;
}




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