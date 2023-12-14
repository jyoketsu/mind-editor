import {
  Box,
  Button,
  ButtonGroup,
  IconButton,
  Menu,
  MenuItem,
  Popover,
} from "@mui/material";
import screenfull from "screenfull";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../../redux/hooks";
import { setDark } from "../../../redux/reducer/commonSlice";
import {
  getSearchParamValue,
  isColorDark,
  isImageDarkOrLight,
} from "../../../utils/util";
import { TreeData, getDoc, setApi } from "../../../redux/reducer/serviceSlice";
import Editor from "../editor";
import Config from "../../../interface/Config";
import _ from "lodash";
import IconFontIconButton from "../../../components/common/IconFontIconButton";

const BASE = import.meta.env.VITE_BASE;

export default function Preview() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const getDataApi = useAppSelector((state) => state.service.getDataApi);
  const docData = useAppSelector((state) => state.service.docData);
  const [viewType, setViewType] = useState<string>(
    localStorage.getItem("VIEW_TYPE") || "mutil-tree"
  );
  const dispatch = useAppDispatch();
  const editorRef = useRef<any>(null);
  const [config, setConfig] = useState<Config | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [zoomAnchorEl, setZoomAnchorEl] = useState<null | HTMLElement>(null);
  const [zoomRatio, setZoomRatio] = useState(1);
  const zoomPercentage = useMemo(
    () => `${((zoomRatio / 1) * 100).toFixed()}%`,
    [zoomRatio]
  );

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
  }, [viewType]);

  useEffect(() => {
    if (getDataApi) {
      dispatch(getDoc(getDataApi));
    }
  }, [getDataApi]);

  useEffect(() => {
    if (docData?.config) {
      setConfig(docData.config);
      if (localStorage.getItem("DARK") === null) {
        const background = docData.config.background;
        if (/^#[a-zA-Z0-9]*/gm.test(background)) {
          const isDark = isColorDark(background);
          if (isDark) {
            dispatch(setDark(true));
          } else {
            dispatch(setDark(false));
          }
        } else {
          isImageDarkOrLight(background, (isDark: boolean) => {
            if (isDark) {
              dispatch(setDark(true));
            } else {
              dispatch(setDark(false));
            }
          });
        }
      }
    }
  }, [docData]);

  const iconName = useMemo(() => {
    switch (viewType) {
      case "mutil-tree":
        return "a-siweidaotu1";
      case "single-tree":
        return "a-luojitu11";
      case "single-mind":
        return "a-luojitu1";
      case "mutil-mind":
        return "a-bazhaoyu1";
      default:
        return "a-siweidaotu1";
    }
  }, [viewType]);

  const handleClickNode = (node: any) => {
    if (!node) {
      setSelectedIds([]);
    } else if (Array.isArray(node)) {
      setSelectedIds(node.map((item) => item._key));
    } else {
      setSelectedIds([node._key]);
    }
  };

  function toEdit() {
    navigate(`${BASE}editor${location.search}`);
  }

  const handleOpenZoom = (event: React.MouseEvent<HTMLButtonElement>) => {
    setZoomAnchorEl(event.currentTarget);
  };

  const handleZoomIn = () => {
    setZoomRatio(zoomRatio + 0.1);
  };

  const handleZoomOut = () => {
    if (zoomRatio - 0.1 > 0.1) {
      setZoomRatio(zoomRatio - 0.1);
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleFullScreen = () => {
    if (screenfull.isEnabled) {
      screenfull.request();
    }
  };

  return (
    <Box
      className="preview"
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        // display: "grid",
        // gridTemplateRows: "48px 1fr",
        // overflow: "hidden",
        background: config?.background
          ? /^#[a-zA-Z0-9]*/gm.test(config.background)
            ? config.background
            : `url("${config.background}")`
          : "unset",
        backgroundColor: config?.background ? undefined : "background.paper",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div>
        <Editor
          ref={editorRef}
          readonly={true}
          viewType={viewType}
          config={config}
          zoomRatio={zoomRatio}
          handleClickNode={handleClickNode}
        />
      </div>
      <ButtonGroup
        className="preview-actions"
        orientation="vertical"
        variant="text"
        color="inherit"
        sx={{ position: "absolute", left: "15px", bottom: "15px" }}
      >
        <IconFontIconButton
          iconName="quanping"
          fontSize={30}
          style={{ borderRadius: "unset", width: "100%", height: "37px" }}
          onClick={handleFullScreen}
        />
        <IconFontIconButton
          // title={t("mind.changeView")}
          iconName={iconName}
          fontSize={30}
          style={{ borderRadius: "unset", width: "100%", height: "37px" }}
          onClick={handleClick}
          // onMouseEnter={handleClick}
        />
        <Button key="one" onClick={toEdit}>
          {t("menu.edit")}
        </Button>
        <Button key="two" onClick={handleOpenZoom}>
          {zoomPercentage}
        </Button>
      </ButtonGroup>
      <Menu
        anchorEl={zoomAnchorEl}
        open={Boolean(zoomAnchorEl)}
        onClose={() => setZoomAnchorEl(null)}
      >
        <div style={{ padding: "0 15px" }}>
          <IconButton onClick={handleZoomOut}>
            <ZoomOutIcon />
          </IconButton>
          <span>{zoomPercentage}</span>
          <IconButton onClick={handleZoomIn}>
            <ZoomInIcon />
          </IconButton>
        </div>
      </Menu>
      <Popover
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        onClose={() => setAnchorEl(null)}
      >
        <div style={{ padding: "8px" }}>
          <IconFontIconButton
            title=""
            iconName="a-siweidaotu1"
            fontSize={30}
            color={viewType === "mutil-tree" ? "#35a6f8" : undefined}
            onClick={() => setViewType("mutil-tree")}
          />
          <IconFontIconButton
            title=""
            iconName="a-luojitu11"
            fontSize={30}
            color={viewType === "single-tree" ? "#35a6f8" : undefined}
            onClick={() => setViewType("single-tree")}
          />
          <IconFontIconButton
            title=""
            iconName="a-luojitu1"
            fontSize={30}
            color={viewType === "single-mind" ? "#35a6f8" : undefined}
            onClick={() => setViewType("single-mind")}
          />
          <IconFontIconButton
            title=""
            iconName="a-bazhaoyu1"
            fontSize={30}
            color={viewType === "mutil-mind" ? "#35a6f8" : undefined}
            onClick={() => setViewType("mutil-mind")}
          />
        </div>
      </Popover>
    </Box>
  );
}
