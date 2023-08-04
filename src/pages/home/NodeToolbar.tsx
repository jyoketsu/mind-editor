import Box from "@mui/material/Box";
import IconFontIconButton from "../../components/common/IconFontIconButton";
import { useTranslation } from "react-i18next";

export default function NodeToolbar({
  handleCheckBox,
}: {
  handleCheckBox: () => void;
}) {
  const { t } = useTranslation();
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
        title={t("nodeTool.task")}
        iconName="wancheng"
        fontSize={30}
        onClick={handleCheckBox}
      />
    </Box>
  );
}
