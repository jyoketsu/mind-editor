import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../pages/home";
import Editor from "../pages/home/editor";
import Preview from "../pages/home/preview";
import { useMemo } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useAppSelector } from "../redux/hooks";
const BASE = import.meta.env.VITE_BASE;

export default function Router() {
  const dark = useAppSelector((state) => state.common.dark);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: dark ? "dark" : "light",
        },
      }),
    [dark]
  );
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path={BASE} element={<Home />}>
            <Route path="" element={<Editor />} />
            <Route path="preview" element={<Preview />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
