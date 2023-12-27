import {
  Box,
  Button,
  ButtonGroup,
  IconButton,
  Menu,
  MenuItem,
  Popover,
  Slider,
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
  const [value, setValue] = useState<number>(50);

  useEffect(() => {
    const isEdit = getSearchParamValue(location.search, "isEdit");
    if (isEdit === "2") {
      toEdit();
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

  useEffect(() => {
    setZoomRatio(value / 50);
  }, [value]);

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
    if (value + 5 <= 100) {
      setValue(value + 5);
    }
  };

  const handleZoomOut = () => {
    if (value - 5 > 10) {
      setValue(value - 5);
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

  function handleOpen() {
    window.open(
      `${window.location.origin}${BASE}editor${location.search}`,
      "_blank"
    );
  }

  const handleChange = (event: Event, newValue: number | number[]) => {
    setValue(newValue as number);
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
        sx={{
          position: "absolute",
          left: "15px",
          bottom: "15px",
          background: "background.paper",
          borderRadius: "8px",
          boxShadow: 2,
          width: "48px",
          height: "238px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-around",
          alignItems: "center",
        }}
      >
        <IconFontIconButton
          iconName="fangdajing"
          fontSize={30}
          style={{ borderRadius: "8px", width: "42px", height: "42px" }}
          onClick={handleOpenZoom}
        />
        <IconFontIconButton
          // title={t("mind.changeView")}
          iconName={iconName}
          fontSize={30}
          style={{ borderRadius: "8px", width: "42px", height: "42px" }}
          onClick={handleClick}
          // onMouseEnter={handleClick}
        />
        <IconFontIconButton
          iconName="quanping"
          fontSize={30}
          style={{ borderRadius: "8px", width: "42px", height: "42px" }}
          onClick={handleFullScreen}
        />
        <IconFontIconButton
          iconName="bi"
          fontSize={30}
          style={{ borderRadius: "8px", width: "42px", height: "42px" }}
          onClick={toEdit}
        />
      </ButtonGroup>
      <Menu
        anchorEl={zoomAnchorEl}
        open={Boolean(zoomAnchorEl)}
        onClose={() => setZoomAnchorEl(null)}
      >
        <div
          style={{ padding: "0 15px", display: "flex", alignItems: "center" }}
        >
          <IconFontIconButton
            iconName="suoxiao"
            fontSize={20}
            onClick={handleZoomOut}
          />
          <div
            style={{ width: "196px", display: "flex", alignItems: "center" }}
          >
            <Slider value={value} min={10} max={100} onChange={handleChange} />
          </div>
          <IconFontIconButton
            iconName="fangdajing"
            fontSize={20}
            onClick={handleZoomIn}
          />
          <IconFontIconButton
            iconName="yijianhuanyuan"
            fontSize={20}
            onClick={() => setValue(50)}
          />
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
      <IconFontIconButton
        className="new-open-button"
        iconName="xin"
        fontSize={20}
        style={{
          position: "absolute",
          top: 10,
          right: 15,
          borderRadius: "unset",
          // width: "24px",
          // height: "24px",
        }}
        onClick={handleOpen}
      />
    </Box>
  );
}
