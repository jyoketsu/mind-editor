import { Box, Button, ButtonBase, Popover } from "@mui/material";
import IconFontIconButton from "../../components/common/IconFontIconButton";
import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from "react";
import useMediaQuery from "@mui/material/useMediaQuery";

export default function NodeToolbar({
  selectedIds,
  mode,
  handleCheckBox,
  handleAddChild,
  handleAddNext,
  handleAddNote,
  handleAddIcon,
  handleAddIllustration,
  handleFileChange,
  handleDelete,
  handleExport,
  handleImport,
  handleLink,
  handleUpdateNode,
  handleBack,
  horizontal,
}: {
  selectedIds: string[];
  mode: "normal" | "simple";
  handleCheckBox: () => void;
  handleAddChild: () => void;
  handleAddNext: () => void;
  handleAddNote: (anchorEl: HTMLElement) => void;
  handleAddIcon: (anchorEl: HTMLElement) => void;
  handleAddIllustration: (anchorEl: HTMLElement) => void;
  handleFileChange: (files: FileList) => void;
  handleDelete: () => void;
  handleExport: (type?: string) => void;
  handleImport: (type: string, e: any) => void;
  handleLink: (anchorEl: HTMLElement) => void;
  handleUpdateNode: (key: string, value?: string) => void;
  handleBack: () => void;
  horizontal?: boolean;
}) {
  const { t } = useTranslation();
  const fullButtons = useMediaQuery("(min-height:960px)");
  const [styleAnchorEl, setStyleAnchorEl] = useState<null | HTMLElement>(null);
  const styleOpen = Boolean(styleAnchorEl);
  const [moreAnchorEl, setMoreAnchorEl] = useState<null | HTMLElement>(null);
  const moreOpen = Boolean(moreAnchorEl);
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const exportOpen = Boolean(exportAnchorEl);
  const [importAnchorEl, setImportAnchorEl] = useState<null | HTMLElement>(
    null
  );
  const importOpen = Boolean(importAnchorEl);

  function handleInputFileChange(event: any) {
    const files = event.target.files;
    handleFileChange(files);
  }

  const handleOpenStyle = (event: React.MouseEvent<HTMLButtonElement>) => {
    setStyleAnchorEl(event.currentTarget);
  };

  const handleCloseStyle = () => {
    setStyleAnchorEl(null);
  };

  const handleOpenMore = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMoreAnchorEl(event.currentTarget);
  };

  const handleCloseMore = () => {
    setMoreAnchorEl(null);
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

  const moreButtons = useMemo(
    () => [
      <IconFontIconButton
        key="illustration"
        title={t("illustration.illustration")}
        iconName="chatu"
        fontSize={30}
        style={{
          borderRadius: "unset",
          width: horizontal ? "48px" : "100%",
          height: horizontal ? "48px" : "68px",
        }}
        hideText={horizontal}
        onClick={(event: React.MouseEvent<HTMLButtonElement>) =>
          handleAddIllustration(event.currentTarget)
        }
      />,
      <IconFontIconButton
        key="addNodeImage"
        title={t("mind.addNodeImage")}
        iconName="tupian1"
        fontSize={30}
        hideText={horizontal}
        style={{
          borderRadius: "unset",
          width: horizontal ? "48px" : "100%",
          height: horizontal ? "48px" : "68px",
        }}
      >
        <input
          accept="image/*"
          type="file"
          style={inputStype}
          onChange={handleInputFileChange}
        />
      </IconFontIconButton>,
      selectedIds.length === 1 ? (
        <IconFontIconButton
          key="link"
          title={t("mind.link")}
          iconName="lianjie"
          fontSize={30}
          style={{
            borderRadius: "unset",
            width: horizontal ? "48px" : "100%",
            height: horizontal ? "48px" : "68px",
          }}
          hideText={horizontal}
          onClick={(event: React.MouseEvent<HTMLButtonElement>) =>
            handleLink(event.currentTarget)
          }
        />
      ) : null,
      selectedIds.length === 1 ? (
        <IconFontIconButton
          key="import"
          title={t("mind.import")}
          iconName="daoru"
          fontSize={30}
          style={{
            borderRadius: "unset",
            width: horizontal ? "48px" : "100%",
            height: horizontal ? "48px" : "68px",
          }}
          hideText={horizontal}
          onClick={handleOpenImport}
        ></IconFontIconButton>
      ) : null,
      selectedIds.length === 1 ? (
        <IconFontIconButton
          key="export"
          title={t("mind.export")}
          iconName="daochu"
          fontSize={30}
          style={{
            borderRadius: "unset",
            width: horizontal ? "48px" : "100%",
            height: horizontal ? "48px" : "68px",
          }}
          hideText={horizontal}
          onClick={handleOpenExport}
        />
      ) : null,
    ],
    [selectedIds]
  );

  return (
    <Box
      className="nodeToolBarWrapper"
      sx={{
        width: "100%",
        height: "100%",
        paddingBottom: horizontal ? "unset" : "15px",
        display: "flex",
        flexDirection: horizontal ? "row" : "column",
        alignItems: "center",
      }}
    >
      {!horizontal ? (
        <IconFontIconButton
          iconName="jiantou"
          fontSize={16}
          style={{
            borderRadius: "unset",
            width: "100%",
            height: "33px",
            // borderTop: "1px solid",
            // borderBottom: "1px solid",
            // borderColor: "divider",
            margin: "12px 0",
          }}
          onClick={handleBack}
        />
      ) : null}
      {!horizontal && selectedIds.length === 1 ? (
        <IconFontIconButton
          title={t("mind.addChild")}
          iconName="a-tongjijiedian1x"
          fontSize={30}
          style={{
            borderRadius: "unset",
            width: horizontal ? "48px" : "100%",
            height: horizontal ? "48px" : "68px",
          }}
          hideText={horizontal}
          onClick={handleAddChild}
        />
      ) : null}
      {!horizontal && selectedIds.length === 1 ? (
        <IconFontIconButton
          title={t("mind.addNext")}
          iconName="a-xiajijiedian1x"
          fontSize={30}
          style={{
            borderRadius: "unset",
            width: horizontal ? "48px" : "100%",
            height: horizontal ? "48px" : "68px",
          }}
          hideText={horizontal}
          onClick={handleAddNext}
        />
      ) : null}
      <IconFontIconButton
        title={t("toolBar.task")}
        iconName="wancheng"
        fontSize={30}
        style={{
          borderRadius: "unset",
          width: horizontal ? "48px" : "100%",
          height: horizontal ? "48px" : "68px",
        }}
        hideText={horizontal}
        onClick={handleCheckBox}
      />

      <IconFontIconButton
        title={t("toolBar.style")}
        iconName="yangshi"
        fontSize={30}
        style={{
          borderRadius: "unset",
          width: horizontal ? "48px" : "100%",
          height: horizontal ? "48px" : "68px",
        }}
        hideText={horizontal}
        onClick={handleOpenStyle}
      />
      <Popover
        anchorEl={styleAnchorEl}
        open={styleOpen}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        onClose={handleCloseStyle}
      >
        <div style={{ padding: "8px", display: "flex", alignItems: "center" }}>
          <IconFontIconButton
            title=""
            iconName="B1"
            fontSize={30}
            hideText={horizontal}
            onClick={() => handleUpdateNode("bold")}
          />
          <IconFontIconButton
            title=""
            iconName="I"
            fontSize={30}
            hideText={horizontal}
            onClick={() => handleUpdateNode("italic")}
          />
          <IconFontIconButton
            title=""
            iconName="u"
            fontSize={30}
            hideText={horizontal}
            onClick={() => handleUpdateNode("textDecoration")}
          />
          {[
            "#595959",
            "#fbbfbc",
            "#f8e6ab",
            "#e2c6d6",
            "#bacefd",
            "#a9efe6",
            "#dfee96",
            "#dee0e3",
          ].map((color) => (
            <div
              key={color}
              style={{
                width: "23px",
                height: "23px",
                background: color,
                margin: "0 3px",
              }}
              onClick={() =>
                handleUpdateNode(
                  "color",
                  color === "#595959" ? undefined : color
                )
              }
            />
          ))}
        </div>
      </Popover>
      <IconFontIconButton
        title={t("icon.icon")}
        iconName="tubiao"
        fontSize={30}
        style={{
          borderRadius: "unset",
          width: horizontal ? "48px" : "100%",
          height: horizontal ? "48px" : "68px",
        }}
        hideText={horizontal}
        onClick={(event: React.MouseEvent<HTMLButtonElement>) =>
          handleAddIcon(event.currentTarget)
        }
      />
      {selectedIds.length === 1 ? (
        <IconFontIconButton
          title={t("mind.addNote")}
          iconName="beizhu"
          fontSize={30}
          style={{
            borderRadius: "unset",
            width: horizontal ? "48px" : "100%",
            height: horizontal ? "48px" : "68px",
          }}
          hideText={horizontal}
          onClick={(event: React.MouseEvent<HTMLButtonElement>) =>
            handleAddNote(event.currentTarget)
          }
        />
      ) : null}

      {fullButtons ? [moreButtons] : null}

      {!fullButtons ? (
        <IconFontIconButton
          title={t("toolBar.more")}
          iconName="gengduo"
          fontSize={30}
          style={{
            borderRadius: "unset",
            width: horizontal ? "48px" : "100%",
            height: horizontal ? "48px" : "68px",
          }}
          hideText={horizontal}
          onClick={handleOpenMore}
        />
      ) : null}

      <Popover
        anchorEl={moreAnchorEl}
        open={moreOpen}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        onClose={handleCloseMore}
      >
        <div style={{ padding: "15px" }}>{moreButtons}</div>
      </Popover>
      <div style={{ flex: 1 }} />
      <IconFontIconButton
        title={t("mind.delete")}
        iconName="a-shanchu1x"
        fontSize={30}
        style={{
          borderRadius: "unset",
          width: horizontal ? "48px" : "100%",
          height: horizontal ? "48px" : "68px",
        }}
        hideText={horizontal}
        onClick={handleDelete}
      />
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
        </div>
      </Popover>
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
    </Box>
  );
}
