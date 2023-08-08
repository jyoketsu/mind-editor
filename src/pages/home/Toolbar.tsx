import { useTranslation } from "react-i18next";
import IconFontIconButton from "../../components/common/IconFontIconButton";
import Divider from "@mui/material/Divider";
import { useMemo, useState } from "react";
import Popover from "@mui/material/Popover";
import screenfull from "screenfull";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { setDark } from "../../redux/reducer/commonSlice";
import Button from "@mui/material/Button";

export default function Toolbar({
  viewType,
  handleSetViewType,
}: {
  viewType: "mutil-tree" | "single-tree" | "mutil-mind" | "single-mind";
  handleSetViewType: (
    viewType: "mutil-tree" | "single-tree" | "mutil-mind" | "single-mind"
  ) => void;
}) {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const dark = useAppSelector((state) => state.common.dark);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [languageAnchorEl, setLanguageAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const languageOpen = Boolean(languageAnchorEl);

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

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOpenLanguage = (event: React.MouseEvent<HTMLButtonElement>) => {
    setLanguageAnchorEl(event.currentTarget);
  };

  const handleCloseLanguage = () => {
    setLanguageAnchorEl(null);
  };

  const handleFullScreen = () => {
    if (screenfull.isEnabled) {
      screenfull.request();
    }
  };

  const toggleMode = () => {
    dispatch(setDark(!dark));
  };

  const changeLanguage = (lan: string) => {
    i18n.changeLanguage(lan);
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
      <IconFontIconButton
        title={t("mind.changeView")}
        iconName={iconName}
        fontSize={30}
        onClick={handleClick}
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
            color={viewType === "mutil-tree" ? "#35a6f8" : undefined}
            onClick={() => handleSetViewType("mutil-tree")}
          />
          <IconFontIconButton
            title=""
            iconName="a-luojitu11"
            fontSize={30}
            color={viewType === "single-tree" ? "#35a6f8" : undefined}
            onClick={() => handleSetViewType("single-tree")}
          />
          <IconFontIconButton
            title=""
            iconName="a-luojitu1"
            fontSize={30}
            color={viewType === "single-mind" ? "#35a6f8" : undefined}
            onClick={() => handleSetViewType("single-mind")}
          />
          <IconFontIconButton
            title=""
            iconName="a-bazhaoyu1"
            fontSize={30}
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
      <div style={{ flex: 1 }} />
      <IconFontIconButton
        title=""
        iconName="zhongyingwenqiehuan"
        fontSize={30}
        onClick={handleOpenLanguage}
      />
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
            简化字
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
    </div>
  );
}
