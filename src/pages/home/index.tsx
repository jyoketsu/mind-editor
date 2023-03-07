import {
  Box,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  SelectChangeEvent,
  Tooltip,
  Typography,
} from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../redux/hooks";
import { setDark } from "../../redux/reducer/commonSlice";
import { getSearchParamValue } from "../../utils/util";
import { getDoc, setApi } from "../../redux/reducer/serviceSlice";

export default function Home() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const dark = useAppSelector((state) => state.common.dark);
  const getDataApi = useAppSelector((state) => state.service.getDataApi);
  const changed = useAppSelector((state) => state.service.changed);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const token = getSearchParamValue(location.search, "token");
    const getDataApiQuery = getSearchParamValue(location.search, "getDataApi");
    const patchDataApiQuery = getSearchParamValue(
      location.search,
      "patchDataApi"
    );
    const getUptokenApiQuery = getSearchParamValue(
      location.search,
      "getUptokenApi"
    );
    if (token && getDataApiQuery && patchDataApiQuery && getUptokenApiQuery) {
      const getDataApi = JSON.parse(decodeURIComponent(getDataApiQuery));
      const patchDataApi = JSON.parse(decodeURIComponent(patchDataApiQuery));
      const getUptokenApi = JSON.parse(decodeURIComponent(getUptokenApiQuery));
      dispatch(
        setApi({
          getDataApi,
          patchDataApi,
          getUptokenApi,
          token,
        })
      );
    }
  }, []);

  useEffect(() => {
    if (getDataApi) {
      dispatch(getDoc(getDataApi));
    }
  }, [getDataApi]);

  const changeLanguage = (event: SelectChangeEvent) => {
    i18n.changeLanguage(event.target.value);
  };

  const toggleMode = () => {
    dispatch(setDark(!dark));
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          width: "100%",
          height: "50px",
          display: "flex",
          alignItems: "center",
          padding: "0 15px",
          boxSizing: "border-box",
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Mind
        </Typography>
        <span style={{ flex: 1 }} />
        <Typography
          sx={{ color: "text.secondary", fontSize: "14px", padding: "0 5px" }}
        >
          {changed ? t("mind.changed") : t("mind.saved")}
        </Typography>
        <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
          <Select value={i18n.language} onChange={changeLanguage}>
            <MenuItem value="zh-CN">简体字</MenuItem>
            <MenuItem value="zh-TW">繁體字</MenuItem>
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="ja">日本語</MenuItem>
          </Select>
        </FormControl>

        <Tooltip title={t(dark ? "menu.lightMode" : "menu.darkMode")}>
          <IconButton onClick={toggleMode}>
            {dark ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Tooltip>
      </Box>
      <Box sx={{ flex: 1 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
