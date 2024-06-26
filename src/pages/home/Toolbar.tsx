import { useTranslation } from "react-i18next";
import IconFontIconButton from "../../components/common/IconFontIconButton";
import Divider from "@mui/material/Divider";
import { useEffect, useMemo, useState } from "react";
import Popover from "@mui/material/Popover";
import screenfull from "screenfull";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { setDark, setLoading } from "../../redux/reducer/commonSlice";
import Button from "@mui/material/Button";
import { Box, Checkbox, FormControlLabel, Typography } from "@mui/material";
import Config from "../../interface/Config";
import api from "../../utils/api";
import qiniuUpload from "../../utils/qiniu";
import { isColorDark, isImageDarkOrLight } from "../../utils/util";
import TaskStat from "./TaskStat";
import IconFont from "../../components/common/IconFont";

export default function Toolbar({
  viewType,
  config,
  undoDisabled,
  redoDisabled,
  mode,
  handleSetViewType,
  handleSetConfig,
  handleUndo,
  handleRedo,
  handleExport,
  handleImport,
  exportImage,
  handleToggleMode,
}: {
  viewType: string;
  config: Config | null;
  undoDisabled: boolean;
  redoDisabled: boolean;
  mode: "normal" | "simple";
  handleSetViewType: (
    viewType: "mutil-tree" | "single-tree" | "mutil-mind" | "single-mind"
  ) => void;
  handleSetConfig: (config: Config) => void;
  handleUndo: () => void;
  handleRedo: () => void;
  handleExport: (type?: string) => void;
  handleImport: (type: string, e: any) => void;
  exportImage: (type: "svg" | "png" | "pdf") => void;
  handleToggleMode: () => void;
}) {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const dark = useAppSelector((state) => state.common.dark);
  const changed = useAppSelector((state) => state.service.changed);
  const getUptokenApi = useAppSelector((state) => state.service.getUptokenApi);
  const qiniuDomain = useAppSelector((state) => state.service.qiniuDomain);
  const qiniuRegion = useAppSelector((state) => state.service.qiniuRegion);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [languageAnchorEl, setLanguageAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [optionsAnchorEl, setOptionsAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [rainbowColor, setRainbowColor] = useState(false);
  const [taskStatOpen, setTaskStatOpen] = useState(false);
  const languageOpen = Boolean(languageAnchorEl);
  const [themeAnchorEl, setThemeAnchorEl] = useState<null | HTMLElement>(null);
  const themeOpen = Boolean(themeAnchorEl);
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const exportOpen = Boolean(exportAnchorEl);
  const [importAnchorEl, setImportAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const [wallpapers, setWallpapers] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const importOpen = Boolean(importAnchorEl);

  const boxStyle: React.CSSProperties = {
    position: "relative",
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    columnGap: "12px",
    rowGap: "12px",
    margin: "15px 0",
    width: "100%",
  };

  const inputStype: React.CSSProperties = {
    opacity: 0,
    position: "absolute",
    fontSize: "100px",
    right: 0,
    top: 0,
    width: "100%",
    height: "100%",
    cursor: "pointer",
  };

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

  useEffect(() => {
    setRainbowColor(config?.rainbowColor || false);
  }, [config]);

  useEffect(() => {
    getWallpapers(page);
  }, [page]);

  async function getWallpapers(page: number) {
    const res: any = await api.wallpaper.get(page, 30);
    if (res.status === 200) {
      setWallpapers([...wallpapers, ...res.data]);
    }
  }

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOpenLanguage = (event: React.MouseEvent<HTMLButtonElement>) => {
    setLanguageAnchorEl(event.currentTarget);
  };

  const handleOpenOptions = (event: React.MouseEvent<HTMLButtonElement>) => {
    setOptionsAnchorEl(event.currentTarget);
  };

  const handleCloseOptions = () => {
    setOptionsAnchorEl(null);
  };

  const handleCloseLanguage = () => {
    setLanguageAnchorEl(null);
  };

  const handleOpenTheme = (event: React.MouseEvent<HTMLButtonElement>) => {
    setThemeAnchorEl(event.currentTarget);
  };

  const handleCloseTheme = () => {
    setThemeAnchorEl(null);
  };

  const handleFullScreen = () => {
    if (screenfull.isEnabled) {
      screenfull.toggle();
    }
  };

  const toggleMode = () => {
    dispatch(setDark(!dark));
  };

  const changeLanguage = (lan: string) => {
    i18n.changeLanguage(lan);
  };
  const handleClickColor = (value: string, key: string) => {
    let data: { [_key: string]: string } = {};
    data[key] = value;
    if (/^#[a-zA-Z0-9]*/gm.test(value)) {
      const isDark = isColorDark(value);
      if (key === "lineColor") {
        if (!config?.background) {
          if (isDark) {
            dispatch(setDark(false));
          } else {
            dispatch(setDark(true));
          }
        }
      } else {
        if (isDark) {
          dispatch(setDark(true));
        } else {
          dispatch(setDark(false));
        }
      }
    } else {
      isImageDarkOrLight(value, (isDark: boolean) => {
        if (isDark) {
          dispatch(setDark(true));
        } else {
          dispatch(setDark(false));
        }
      });
    }
    // @ts-ignore
    handleSetConfig({ ...(config || {}), ...data });
  };

  const customBackground = async (event: any) => {
    const file = event.target.files[0];
    if (file.type.startsWith("image/")) {
      if (getUptokenApi) {
        const res: any = await api.request.get(getUptokenApi.url, {
          ...getUptokenApi.params,
          ...{ token: api.getToken() },
        });
        if (res.statusCode === "200") {
          const upToken = res.result;
          try {
            dispatch(setLoading(true));
            const url = await qiniuUpload(
              upToken,
              file,
              qiniuRegion,
              qiniuDomain
            );
            dispatch(setLoading(false));
            if (
              typeof url === "string" &&
              url.startsWith(qiniuDomain || "https://cdn-icare.qingtime.cn/")
            ) {
              handleClickColor(url, "background");
            }
          } catch (error) {
            alert("error!");
          }
        } else {
          alert("error!");
        }
      }
    }
  };

  const handleReset = () => {
    // @ts-ignore
    handleSetConfig({});
  };

  const handleChangeRainbowColor = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    // @ts-ignore
    handleSetConfig({
      ...(config || {}),
      ...{ rainbowColor: event.target.checked },
    });
  };

  const handleOpenExport = (event: React.MouseEvent<HTMLButtonElement>) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleCloseExport = () => {
    setExportAnchorEl(null);
  };

  const handleOpenImport = (event: React.MouseEvent<HTMLButtonElement>) => {
    setImportAnchorEl(event.currentTarget);
  };

  const handleCloseImport = () => {
    setImportAnchorEl(null);
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        padding: "15px 0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {mode === "normal" ? (
        <i
          style={{
            width: "32px",
            height: "32px",
            backgroundImage: "url('/logo/logo.svg')",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            marginTop: "4px",
            marginBottom: "8px",
          }}
        />
      ) : null}
      <IconFontIconButton
        title={t("mind.changeView")}
        iconName={iconName}
        fontSize={30}
        style={{ borderRadius: "unset", width: "100%", height: "68px" }}
        disabled={changed ? true : false}
        onClick={handleClick}
        onMouseEnter={handleClick}
      />
      <Popover
        anchorEl={anchorEl}
        open={open}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        onClose={handleClose}
      >
        <div style={{ padding: "8px" }}>
          <IconFontIconButton
            title=""
            iconName="a-siweidaotu1"
            fontSize={30}
            disabled={changed ? true : false}
            color={viewType === "mutil-tree" ? "#35a6f8" : undefined}
            onClick={() => handleSetViewType("mutil-tree")}
          />
          <IconFontIconButton
            title=""
            iconName="a-luojitu11"
            fontSize={30}
            disabled={changed ? true : false}
            color={viewType === "single-tree" ? "#35a6f8" : undefined}
            onClick={() => handleSetViewType("single-tree")}
          />
          <IconFontIconButton
            title=""
            iconName="a-luojitu1"
            fontSize={30}
            disabled={changed ? true : false}
            color={viewType === "single-mind" ? "#35a6f8" : undefined}
            onClick={() => handleSetViewType("single-mind")}
          />
          <IconFontIconButton
            title=""
            iconName="a-bazhaoyu1"
            fontSize={30}
            disabled={changed ? true : false}
            color={viewType === "mutil-mind" ? "#35a6f8" : undefined}
            onClick={() => handleSetViewType("mutil-mind")}
          />
        </div>
      </Popover>
      <IconFontIconButton
        title={t("toolBar.fullScreen")}
        iconName="quanping"
        fontSize={30}
        style={{ borderRadius: "unset", width: "100%", height: "68px" }}
        onClick={handleFullScreen}
      />
      <IconFontIconButton
        title={t(dark ? "menu.lightMode" : "menu.darkMode")}
        iconName={dark ? "liangse" : "a-anse1"}
        fontSize={30}
        style={{ borderRadius: "unset", width: "100%", height: "68px" }}
        onClick={toggleMode}
      />
      <IconFontIconButton
        title={t("toolBar.theme")}
        iconName="zhuti"
        fontSize={30}
        style={{ borderRadius: "unset", width: "100%", height: "68px" }}
        onClick={handleOpenTheme}
      />
      <Popover
        anchorEl={themeAnchorEl}
        open={themeOpen}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        onClose={handleCloseTheme}
      >
        <div
          style={{
            padding: "15px",
            width: "300px",
            height: "100%",
            position: "relative",
          }}
        >
          <Typography variant="h4" sx={{ margin: "8px 0" }}>
            {t("toolBar.theme")}
          </Typography>
          <Button
            sx={{ position: "absolute", right: 0, top: "25px" }}
            onClick={handleReset}
          >
            {t("toolBar.reset")}
          </Button>
          {!rainbowColor
            ? [
                <Typography variant="h6" key="lineColorTitle">
                  {t("toolBar.lineColor")}
                </Typography>,
                <div key="lineColor" style={boxStyle}>
                  {["#535953", "#FFF", "#35a6f8", "#cb1b45"].map(
                    (color, index) => (
                      <ColorBox
                        key={index}
                        isLine
                        background={color}
                        selected={color === config?.lineColor ? true : false}
                        onClick={(val) => handleClickColor(val, "lineColor")}
                      />
                    )
                  )}
                </div>,
                <Typography key="nodeColorTitle" variant="h6">
                  {t("toolBar.nodeColor")}
                </Typography>,
                <div key="nodeColor" style={boxStyle}>
                  {[
                    "#DC9FB4",
                    "#EEA9A9",
                    "#D7C4BB",
                    "#FAD689",
                    "#D9CD90",
                    "#FCFAF2",
                    "#dfedf9",
                    "#f2e7f9",
                    "#ffe3e8",
                    "#fae8cd",
                    "#d5f2e6",
                    "#e7ecf0",
                  ].map((color, index) => (
                    <ColorBox
                      key={index}
                      background={color}
                      selected={color === config?.nodeColor ? true : false}
                      onClick={(val) => handleClickColor(val, "nodeColor")}
                    />
                  ))}
                </div>,
              ]
            : null}

          <FormControlLabel
            control={
              <Checkbox
                checked={rainbowColor}
                onChange={handleChangeRainbowColor}
              />
            }
            label={t("toolBar.rainbowColor")}
          />
          <Typography variant="h6">{t("toolBar.backgroundColor")}</Typography>
          <div style={boxStyle}>
            {[
              "#46558c",
              "#9c5d9e",
              "#c14c6b",
              "#c14f4b",
              "#d19235",
              "#29835d",
              "#24807b",
              "#68767f",
              "#dfedf9",
              "#f2e7f9",
              "#ffe3e8",
              "#fae8cd",
              "#d5f2e6",
              "#e7ecf0",
            ].map((color, index) => (
              <ColorBox
                key={index}
                background={color}
                selected={color === config?.background ? true : false}
                onClick={(val) => handleClickColor(val, "background")}
              />
            ))}
          </div>
          <Typography variant="h6">{t("toolBar.wallpaper")}</Typography>
          <div style={boxStyle}>
            {wallpapers.map((wallpaper: any, index) => (
              <ColorBox
                key={index}
                background={wallpaper.url}
                selected={wallpaper.url === config?.background ? true : false}
                onClick={(val) => handleClickColor(val, "background")}
              />
            ))}
            <Button sx={{ position: "absolute", top: "-50px", right: "0px" }}>
              {`+${t("toolBar.custom")}`}
              <input
                type="file"
                accept="image/jpeg,image/png"
                style={inputStype}
                onChange={(e: any) => customBackground(e)}
              />
            </Button>
          </div>
          <Button fullWidth onClick={() => setPage(page + 1)}>
            更多
          </Button>
        </div>
      </Popover>
      {mode === "normal" ? (
        <IconFontIconButton
          key="import"
          title={t("mind.import")}
          iconName="daoru"
          fontSize={30}
          style={{ borderRadius: "unset", width: "100%", height: "68px" }}
          onClick={handleOpenImport}
        ></IconFontIconButton>
      ) : null}
      <Popover
        anchorEl={importAnchorEl}
        open={importOpen}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        onClose={handleCloseImport}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Button color="inherit">
            {t("mind.file")}
            <input
              type="file"
              accept=".mind"
              style={inputStype}
              onChange={(e: any) => handleImport("file", e)}
            />
          </Button>
          <Button color="inherit">
            OPML
            <input
              type="file"
              accept=".opml"
              style={inputStype}
              onChange={(e: any) => handleImport("opml", e)}
            />
          </Button>
        </div>
      </Popover>
      {mode === "normal" ? (
        <IconFontIconButton
          key="export"
          title={t("mind.export")}
          iconName="daochu"
          fontSize={30}
          style={{ borderRadius: "unset", width: "100%", height: "68px" }}
          onClick={handleOpenExport}
        />
      ) : null}

      <Popover
        anchorEl={exportAnchorEl}
        open={exportOpen}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        onClose={handleCloseExport}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Button color="inherit" onClick={() => handleExport()}>
            {t("mind.file")}
          </Button>
          <Button color="inherit" onClick={() => handleExport("opml")}>
            OPML
          </Button>
          <Button color="inherit" onClick={() => handleExport("txt")}>
            TXT
          </Button>
          <Button
            color="inherit"
            sx={{ textTransform: "unset" }}
            onClick={() => handleExport("md")}
          >
            Markdown
          </Button>
          <Button color="inherit" onClick={() => exportImage("svg")}>
            SVG
          </Button>
          <Button color="inherit" onClick={() => exportImage("png")}>
            PNG
          </Button>
          <Button color="inherit" onClick={() => exportImage("pdf")}>
            PDF
          </Button>
        </div>
      </Popover>
      {mode === "normal" ? <div style={{ flex: 1 }} /> : null}
      <IconFontIconButton
        title=""
        iconName="chexiao"
        disabled={undoDisabled}
        fontSize={30}
        style={{ borderRadius: "unset", width: "100%", height: "68px" }}
        onClick={handleUndo}
      />
      <IconFontIconButton
        title=""
        iconName="huifu"
        disabled={redoDisabled}
        fontSize={30}
        style={{ borderRadius: "unset", width: "100%", height: "68px" }}
        onClick={handleRedo}
      />
      <IconFontIconButton
        title=""
        iconName="a-gengduo1"
        fontSize={30}
        style={{ borderRadius: "unset", width: "100%", height: "68px" }}
        onClick={handleOpenOptions}
      />
      {/* <IconFontIconButton
        title=""
        iconName="zhongyingwenqiehuan"
        fontSize={30}
        style={{ borderRadius: "unset", width: "100%", height: "68px" }}
        onClick={handleOpenLanguage}
      /> */}
      <Popover
        anchorEl={languageAnchorEl}
        open={languageOpen}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        onClose={handleCloseLanguage}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Button
            color={i18n.language === "zh-CN" ? "primary" : "inherit"}
            onClick={() => changeLanguage("zh-CN")}
          >
            简体字
          </Button>
          <Button
            color={i18n.language === "zh-TW" ? "primary" : "inherit"}
            onClick={() => changeLanguage("zh-TW")}
          >
            繁體字
          </Button>
          <Button
            color={i18n.language === "en" ? "primary" : "inherit"}
            onClick={() => changeLanguage("en")}
          >
            English
          </Button>
          <Button
            color={i18n.language === "ja" ? "primary" : "inherit"}
            onClick={() => changeLanguage("ja")}
          >
            日本語
          </Button>
        </div>
      </Popover>
      <Popover
        anchorEl={optionsAnchorEl}
        open={Boolean(optionsAnchorEl)}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        onClose={handleCloseOptions}
      >
        <div
          style={{ width: "130px", display: "flex", flexDirection: "column" }}
        >
          {mode === "simple" ? (
            <Button color="inherit" onClick={handleOpenImport}>
              {t("mind.import")}
            </Button>
          ) : null}
          {mode === "simple" ? (
            <Button color="inherit" onClick={handleOpenExport}>
              {t("mind.export")}
            </Button>
          ) : null}
          <Button
            color="inherit"
            onClick={() => {
              setOptionsAnchorEl(null);
              setTaskStatOpen(true);
            }}
          >
            {t("toolBar.taskStat")}
          </Button>
          <Button color="inherit" onClick={handleOpenLanguage}>
            {t("toolBar.language")}
          </Button>
          <Button color="inherit" onClick={handleToggleMode}>
            {t(`toolBar.${mode === "normal" ? "simple" : "normal"}Mode`)}
          </Button>
        </div>
      </Popover>
      <TaskStat
        open={taskStatOpen}
        handleClose={() => setTaskStatOpen(false)}
      />
    </div>
  );
}

function ColorBox({
  background,
  selected,
  isLine,
  onClick,
}: {
  background: string;
  selected?: boolean;
  isLine?: boolean;
  onClick: (value: string) => void;
}) {
  return (
    <Box
      sx={{
        width: "66px",
        height: "40px",
        background: isLine
          ? "unset"
          : /^#[a-zA-Z0-9]*/gm.test(background)
          ? background
          : `url("${background}?imageView2/2/h/132")`,
        backgroundColor: isLine ? "grey.200" : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
        borderRadius: "8px",
        border: selected ? "3px solid" : "unset",
        borderColor: "primary.main",
        cursor: "pointer",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
      onClick={() => onClick(background)}
    >
      {isLine ? (
        <IconFont name="buju" fontSize={28} color={background} />
      ) : null}
    </Box>
  );
}
