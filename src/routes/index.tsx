import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../pages/home";
import Preview from "../pages/home/preview";
import { useMemo } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { PaletteMode } from "@mui/material";
import { grey, blue } from "@mui/material/colors";
import { useAppSelector } from "../redux/hooks";
import Loading from "../components/common/Loading";
const BASE = import.meta.env.VITE_BASE;

export default function Router() {
  const isDark = useAppSelector((state) => state.common.dark);
  const loading = useAppSelector((state) => state.common.loading);
  const serviceLoading = useAppSelector((state) => state.service.loading);

  // 配色
  // 默认颜色：https://mui.com/zh/material-ui/customization/default-theme/
  // 调色：https://mui.com/zh/material-ui/customization/color/#picking-colors
  const getDesignTokens = (mode: PaletteMode) => ({
    palette: {
      mode,
      ...(mode === "light"
        ? {
            // palette values for light mode
            primary: {
              main: blue[500],
            },
            background: {
              default: "#F3F3F5",
              paper: "#FFF",
              slide: "#F5F5F5",
              head: "#F9F9F9",
            },
          }
        : {
            // palette values for dark mode
            primary: {
              main: blue[700],
            },
            background: {
              default: grey[900],
              paper: grey[600],
              slide: grey[800],
              head: grey[700],
            },
          }),
    },
  });

  const theme = useMemo(
    () =>
      createTheme({
        ...getDesignTokens(isDark ? "dark" : "light"),
        breakpoints: {
          values: {
            xs: 0,
            sm: 400,
            md: 600,
            lg: 900,
            xl: 1200,
          },
        },
      }),
    [isDark]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path={BASE} element={<Preview />} />
          <Route path="editor" element={<Home />} />
        </Routes>
      </BrowserRouter>
      {loading || serviceLoading ? <Loading /> : null}
    </ThemeProvider>
  );
}
