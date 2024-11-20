import { ThemeOptions } from "@mui/material";
import { action, computed, makeObservable, observable } from "mobx";
import { createTheme, PaletteOptions } from "@mui/material/styles";
import { DARK_PALETTE, LIGHT_PALETTE } from "./palette";

export class ThemeStore {
  mode = "light";
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

  get palette() {
    return this.mode === "light" ? LIGHT_PALETTE : DARK_PALETTE;
  }

  get theme() {
    return createTheme({
      palette: this.palette,
      ...this.customThemeOptions,
    });
  }

  toggleMode() {
    console.log("toggleMode", this.mode);
    this.mode = this.mode === "light" ? "dark" : "light";
  }
}

const themeStore = new ThemeStore();
export default themeStore;
