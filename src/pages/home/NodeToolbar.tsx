import { Box, Popover } from "@mui/material";
import IconFontIconButton from "../../components/common/IconFontIconButton";
import { useTranslation } from "react-i18next";
import { useState } from "react";

export default function NodeToolbar({
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
}: {
  handleCheckBox: () => void;
  handleAddChild: () => void;
  handleAddNext: () => void;
  handleAddNote: () => void;
  handleAddIcon: () => void;
  handleAddIllustration: () => void;
  handleFileChange: (files: FileList) => void;
  handleDelete: () => void;
  handleExport: () => void;
  handleImport: (e: any) => void;
  handleLink: () => void;
  handleUpdateNode: (key: string, value?: string) => void;
}) {
  const { t } = useTranslation();
  const [styleAnchorEl, setStyleAnchorEl] = useState<null | HTMLElement>(null);
  const styleOpen = Boolean(styleAnchorEl);

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

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        padding: "15px 0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <IconFontIconButton
        title={t("mind.addChild")}
        iconName="a-xiajijiedian1x"
        fontSize={30}
        style={{ borderRadius: "unset", width: "100%", height: "68px" }}
        onClick={handleAddChild}
      />
      <IconFontIconButton
        title={t("mind.addNext")}
        iconName="a-tongjijiedian1x"
        fontSize={30}
        style={{ borderRadius: "unset", width: "100%", height: "68px" }}
        onClick={handleAddNext}
      />
      <IconFontIconButton
        title={t("toolBar.task")}
        iconName="wancheng"
        fontSize={30}
        style={{ borderRadius: "unset", width: "100%", height: "68px" }}
        onClick={handleCheckBox}
      />
      <IconFontIconButton
        title={t("toolBar.style")}
        iconName="yangshi"
        fontSize={30}
        style={{ borderRadius: "unset", width: "100%", height: "68px" }}
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
            onClick={() => handleUpdateNode("bold")}
          />
          <IconFontIconButton
            title=""
            iconName="I"
            fontSize={30}
            onClick={() => handleUpdateNode("italic")}
          />
          <IconFontIconButton
            title=""
            iconName="u"
            fontSize={30}
            onClick={() => handleUpdateNode("textDecoration")}
          />
          {[
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
              onClick={() => handleUpdateNode("color", color)}
            />
          ))}
        </div>
      </Popover>
      <IconFontIconButton
        title={t("icon.icon")}
        iconName="tubiao"
        fontSize={30}
        style={{ borderRadius: "unset", width: "100%", height: "68px" }}
        onClick={handleAddIcon}
      />
      <IconFontIconButton
        title={t("mind.addNote")}
        iconName="beizhu"
        fontSize={30}
        style={{ borderRadius: "unset", width: "100%", height: "68px" }}
        onClick={handleAddNote}
      />
      <IconFontIconButton
        title={t("illustration.illustration")}
        iconName="chatu"
        fontSize={30}
        style={{ borderRadius: "unset", width: "100%", height: "68px" }}
        onClick={handleAddIllustration}
      />
      <IconFontIconButton
        title={t("mind.addNodeImage")}
        iconName="tupian1"
        fontSize={30}
        style={{ borderRadius: "unset", width: "100%", height: "68px" }}
      >
        <input
          accept="image/*"
          type="file"
          style={{
            opacity: 0,
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
          onChange={handleInputFileChange}
        />
      </IconFontIconButton>
      <IconFontIconButton
        title={t("mind.link")}
        iconName="lianjie"
        fontSize={30}
        style={{ borderRadius: "unset", width: "100%", height: "68px" }}
        onClick={handleLink}
      />
      <IconFontIconButton
        title={t("mind.import")}
        iconName="daoru"
        fontSize={30}
        style={{ borderRadius: "unset", width: "100%", height: "68px" }}
      >
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
          onChange={(e: any) => handleImport(e)}
        />
      </IconFontIconButton>
      <IconFontIconButton
        title={t("mind.export")}
        iconName="daochu"
        fontSize={30}
        style={{ borderRadius: "unset", width: "100%", height: "68px" }}
        onClick={handleExport}
      />
      <div style={{ flex: 1 }} />
      <IconFontIconButton
        title={t("mind.delete")}
        iconName="a-shanchu1x"
        fontSize={30}
        style={{ borderRadius: "unset", width: "100%", height: "68px" }}
        onClick={handleDelete}
      />
    </Box>
  );
}
