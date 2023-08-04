import {
  Box,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import IosShareIcon from "@mui/icons-material/IosShare";
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
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
import Toolbar from "./Toolbar";
import Editor from "./editor";
import NodeToolbar from "./NodeToolbar";
import CNode from "tree-graph-react/dist/interfaces/CNode";

export default function Home() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const dark = useAppSelector((state) => state.common.dark);
  const getDataApi = useAppSelector((state) => state.service.getDataApi);
  const changed = useAppSelector((state) => state.service.changed);
  const docData = useAppSelector((state) => state.service.docData);
  const patchDataApi = useAppSelector((state) => state.service.patchDataApi);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [viewType, setViewType] = useState<
    "mutil-tree" | "single-tree" | "mutil-mind" | "single-mind"
  >("mutil-tree");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const dispatch = useAppDispatch();
  const editorRef = useRef<any>(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    const viewtype: any = localStorage.getItem("VIEW_TYPE");
    if (viewtype) {
      setViewType(viewtype);
    }
  }, []);

  useEffect(() => {
    editorRef?.current?.resetMove();
    localStorage.setItem("VIEW_TYPE", viewType);
  }, [viewType]);

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

  const handleAddChild = () => {
    editorRef?.current?.handleAddChild();
  };

  const handleAddNext = () => {
    editorRef?.current?.handleAddNext();
  };

  const handleDelete = () => {
    editorRef?.current?.handleDelete();
  };

  const handleAddNote = () => {
    editorRef?.current?.addNote();
  };

  const handleAddIcon = () => {
    editorRef?.current?.addIcon();
  };

  const handleClickNode = (node: any) => {
    if (!node) {
      setSelectedIds([]);
    } else if (Array.isArray(node)) {
      setSelectedIds(node.map((item) => item._key));
    } else {
      setSelectedIds([node._key]);
    }
  };

  const handleCheckBox = () => {
    if (selectedIds.length) {
      editorRef?.current?.handleCheckbox(selectedIds, {
        showCheckbox: true,
        checked: false,
      });
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "grid",
        gridTemplateRows: "69px 1fr",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          padding: "0 15px",
          boxSizing: "border-box",
          borderBottom: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.head",
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Mind
        </Typography>
        <div style={{ flex: 1 }}>
          <Toolbar
            viewType={viewType}
            handleAddChild={handleAddChild}
            handleAddNext={handleAddNext}
            handleDelete={handleDelete}
            handleSetViewType={setViewType}
            handleAddNote={handleAddNote}
            handleAddIcon={handleAddIcon}
          />
        </div>
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
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "68px 1fr",
          overflow: "hidden",
        }}
      >
        <Box sx={{ backgroundColor: "background.slide" }}>
          <NodeToolbar handleCheckBox={handleCheckBox} />
        </Box>
        <Editor
          ref={editorRef}
          viewType={viewType}
          handleClickNode={handleClickNode}
        />
      </Box>
    </Box>
  );
}
