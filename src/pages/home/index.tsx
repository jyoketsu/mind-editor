import {
  Box,
  FormControl,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Select,
  SelectChangeEvent,
  Tooltip,
  Typography,
} from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import IosShareIcon from "@mui/icons-material/IosShare";
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../redux/hooks";
import { setDark } from "../../redux/reducer/commonSlice";
import { exportFile, getSearchParamValue } from "../../utils/util";
import {
  getDoc,
  saveDoc,
  setApi,
  setDocData,
} from "../../redux/reducer/serviceSlice";
import { MoreHoriz } from "@mui/icons-material";

export default function Home() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const dark = useAppSelector((state) => state.common.dark);
  const getDataApi = useAppSelector((state) => state.service.getDataApi);
  const changed = useAppSelector((state) => state.service.changed);
  const docData = useAppSelector((state) => state.service.docData);
  const patchDataApi = useAppSelector((state) => state.service.patchDataApi);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const dispatch = useAppDispatch();
  const open = Boolean(anchorEl);

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

  const handleExport = () => {
    if (docData) {
      const root = docData.data[docData.rootKey];
      exportFile(JSON.stringify(docData), `${root.name}.mind`);
    }
  };

  const handleChange = (event: any) => {
    const file = event.target.files[0];
    if (!file || !patchDataApi) return;
    const reader = new FileReader();
    reader.onload = function fileReadCompleted() {
      // console.log(reader.result);
      if (
        reader.result &&
        typeof reader.result === "string" &&
        reader.result.includes("rootKey")
      ) {
        const data = JSON.parse(reader.result);
        dispatch(setDocData(data));
        dispatch(
          saveDoc({
            patchDataApi,
            data,
          })
        );
      }
    };
    reader.readAsText(file);
  };

  const handleClickMore = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMoreMenu = () => {
    setAnchorEl(null);
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
        <IconButton onClick={handleClickMore}>
          <MoreHoriz />
        </IconButton>
        <Menu anchorEl={anchorEl} open={open} onClose={handleCloseMoreMenu}>
          <MenuItem onClick={handleCloseMoreMenu}>
            <Select
              value={i18n.language}
              size="small"
              onChange={changeLanguage}
            >
              <MenuItem value="zh-CN">简体字</MenuItem>
              <MenuItem value="zh-TW">繁體字</MenuItem>
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="ja">日本語</MenuItem>
            </Select>
          </MenuItem>
          <MenuItem onClick={handleExport}>
            <ListItemIcon>
              <SystemUpdateAltIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t("mind.export")}</ListItemText>
          </MenuItem>
          <MenuItem>
            <ListItemIcon>
              <IosShareIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{t("mind.import")}</ListItemText>
            <input
              type="file"
              multiple
              style={{
                opacity: 0,
                position: "absolute",
                fontSize: "100px",
                right: 0,
                top: 0,
                width: "100%",
                height: "100%",
                cursor: "pointer",
              }}
              onChange={handleChange}
            />
          </MenuItem>

          <MenuItem onClick={toggleMode}>
            <ListItemIcon>
              {dark ? <LightModeIcon /> : <DarkModeIcon />}
            </ListItemIcon>
            <ListItemText>
              {t(dark ? "menu.lightMode" : "menu.darkMode")}
            </ListItemText>
          </MenuItem>
        </Menu>
      </Box>
      <Box sx={{ flex: 1 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
