import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import Typography from "@mui/material/Typography";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";
import { flag, office, priority, study, symbol, progress } from "./components";
import { Box } from "@mui/material";

export default function Icons({
  anchorEl,
  handleClickIcon,
  handleClose,
  handleDelete,
  iconCategory,
}: {
  anchorEl: null | HTMLElement;
  handleClickIcon: (category: string, index: number) => void;
  handleClose: () => void;
  handleDelete: (category: string) => void;
  iconCategory?: string;
}) {
  const { t } = useTranslation();
  const headStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "15px",
  };
  const contentStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
  };

  return (
    <Menu
      anchorEl={anchorEl}
      sx={{ padding: "unset" }}
      open={Boolean(anchorEl)}
      anchorOrigin={{
        vertical: anchorEl?.tagName === "g" ? "bottom" : "top",
        horizontal: anchorEl?.tagName === "g" ? "left" : "right",
      }}
      onClose={handleClose}
    >
      <Box
        sx={{
          maxWidth: "420px",
          padding: "0 15px",
        }}
      >
        {!iconCategory ? (
          <Box sx={headStyle}>
            <Typography variant="h6" gutterBottom>
              {t("icon.priority")}
            </Typography>
          </Box>
        ) : null}
        {!iconCategory || iconCategory === "priority" ? (
          <Box sx={contentStyle}>
            {priority.map((item, index) => (
              <svg
                key={index}
                viewBox="0 0 1024 1024"
                version="1.1"
                width="28"
                height="28"
                style={{ margin: "5px" }}
                onClick={() => handleClickIcon("priority", index)}
              >
                <rect x={0} y={0} width="1024" height="1024" fillOpacity={0} />
                {item}
              </svg>
            ))}
            {iconCategory ? (
              <IconButton onClick={() => handleDelete("priority")}>
                <DeleteIcon />
              </IconButton>
            ) : null}
          </Box>
        ) : null}
        {!iconCategory ? (
          <Box sx={headStyle}>
            <Typography variant="h6" gutterBottom>
              {t("icon.progress")}
            </Typography>
          </Box>
        ) : null}
        {!iconCategory || iconCategory === "progress" ? (
          <Box sx={contentStyle}>
            {progress.map((item, index) => (
              <svg
                key={index}
                viewBox="0 0 1024 1024"
                version="1.1"
                width="28"
                height="28"
                style={{ margin: "5px" }}
                onClick={() => handleClickIcon("progress", index)}
              >
                <rect x={0} y={0} width="1024" height="1024" fillOpacity={0} />
                {item}
              </svg>
            ))}
            {iconCategory ? (
              <IconButton onClick={() => handleDelete("progress")}>
                <DeleteIcon />
              </IconButton>
            ) : null}
          </Box>
        ) : null}
        {!iconCategory ? (
          <Box sx={headStyle}>
            <Typography variant="h6" gutterBottom>
              {t("icon.flag")}
            </Typography>
          </Box>
        ) : null}
        {!iconCategory || iconCategory === "flag" ? (
          <Box sx={contentStyle}>
            {flag.map((item, index) => (
              <svg
                key={index}
                viewBox="0 0 1024 1024"
                version="1.1"
                width="28"
                height="28"
                style={{ margin: "5px" }}
                onClick={() => handleClickIcon("flag", index)}
              >
                <rect x={0} y={0} width="1024" height="1024" fillOpacity={0} />
                {item}
              </svg>
            ))}
            {iconCategory ? (
              <IconButton onClick={() => handleDelete("flag")}>
                <DeleteIcon />
              </IconButton>
            ) : null}
          </Box>
        ) : null}
        {!iconCategory ? (
          <Box sx={headStyle}>
            <Typography variant="h6" gutterBottom>
              {t("icon.study")}
            </Typography>
          </Box>
        ) : null}
        {!iconCategory || iconCategory === "study" ? (
          <Box sx={contentStyle}>
            {study.map((item, index) => (
              <svg
                key={index}
                viewBox="0 0 1024 1024"
                version="1.1"
                width="28"
                height="28"
                style={{ margin: "5px" }}
                onClick={() => handleClickIcon("study", index)}
              >
                <rect x={0} y={0} width="1024" height="1024" fillOpacity={0} />
                {item}
              </svg>
            ))}
            {iconCategory ? (
              <IconButton onClick={() => handleDelete("study")}>
                <DeleteIcon />
              </IconButton>
            ) : null}
          </Box>
        ) : null}
        {!iconCategory ? (
          <Box sx={headStyle}>
            <Typography variant="h6" gutterBottom>
              {t("icon.office")}
            </Typography>
          </Box>
        ) : null}
        {!iconCategory || iconCategory == "office" ? (
          <Box sx={contentStyle}>
            {office.map((item, index) => (
              <svg
                key={index}
                viewBox="0 0 1024 1024"
                version="1.1"
                width="28"
                height="28"
                style={{ margin: "5px" }}
                onClick={() => handleClickIcon("office", index)}
              >
                <rect x={0} y={0} width="1024" height="1024" fillOpacity={0} />
                {item}
              </svg>
            ))}
            {iconCategory ? (
              <IconButton onClick={() => handleDelete("office")}>
                <DeleteIcon />
              </IconButton>
            ) : null}
          </Box>
        ) : null}
        {!iconCategory ? (
          <Box sx={headStyle}>
            <Typography variant="h6" gutterBottom>
              {t("icon.symbol")}
            </Typography>
          </Box>
        ) : null}
        {!iconCategory || iconCategory === "symbol" ? (
          <Box sx={contentStyle}>
            {symbol.map((item, index) => (
              <svg
                key={index}
                viewBox="0 0 1024 1024"
                version="1.1"
                width="28"
                height="28"
                style={{ margin: "5px" }}
                onClick={() => handleClickIcon("symbol", index)}
              >
                <rect x={0} y={0} width="1024" height="1024" fillOpacity={0} />
                {item}
              </svg>
            ))}
            {iconCategory ? (
              <IconButton onClick={() => handleDelete("symbol")}>
                <DeleteIcon />
              </IconButton>
            ) : null}
          </Box>
        ) : null}
      </Box>
    </Menu>
  );
}
