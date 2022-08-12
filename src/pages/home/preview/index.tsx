import Typography from "@mui/material/Typography";
import { Box } from "@mui/material";
import { useTranslation } from "react-i18next";

export default function Preview() {
  const { t } = useTranslation();
  return (
    <Box sx={{ textAlign: "center", marginTop: "20vh" }}>
      <Typography variant="h1" component="div" gutterBottom>
        {t("page.page2")}
      </Typography>
    </Box>
  );
}
