import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import "./Note.scss";
import Menu from "@mui/material/Menu";
import Typography from "@mui/material/Typography";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";
import { flag, office, priority, study, symbol, progress } from "./components";

export default function Icons({
  anchorEl,
  handleClickIcon,
  handleClose,
  handleDelete,
}: {
  anchorEl: null | HTMLElement;
  handleClickIcon: (category: string, index: number) => void;
  handleClose: () => void;
  handleDelete: (category: string) => void;
}) {
  const { t } = useTranslation();
  const headStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  return (
    <Menu
      anchorEl={anchorEl}
      sx={{ padding: "unset" }}
      open={Boolean(anchorEl)}
      onClose={handleClose}
    >
      <Box
        sx={{
          width: "420px",
          padding: "0 15px",
        }}
      >
        <Box sx={headStyle}>
          <Typography variant="h6" gutterBottom>
            {t("mind.priority")}
          </Typography>
          <IconButton onClick={() => handleDelete("priority")}>
            <DeleteIcon />
          </IconButton>
        </Box>
        <Box>
          {priority.map((item, index) => (
            <svg
              key={index}
              viewBox="0 0 1024 1024"
              version="1.1"
              width="28"
              height="28"
              onClick={() => handleClickIcon("priority", index)}
            >
              <rect x={0} y={0} width="1024" height="1024" fillOpacity={0} />
              {item}
            </svg>
          ))}
        </Box>
        <Box sx={headStyle}>
          <Typography variant="h6" gutterBottom>
            {t("mind.progress")}
          </Typography>
          <IconButton onClick={() => handleDelete("progress")}>
            <DeleteIcon />
          </IconButton>
        </Box>
        <Box>
          {progress.map((item, index) => (
            <svg
              key={index}
              viewBox="0 0 1024 1024"
              version="1.1"
              width="28"
              height="28"
              onClick={() => handleClickIcon("progress", index)}
            >
              <rect x={0} y={0} width="1024" height="1024" fillOpacity={0} />
              {item}
            </svg>
          ))}
        </Box>
        <Box sx={headStyle}>
          <Typography variant="h6" gutterBottom>
            {t("mind.flag")}
          </Typography>
          <IconButton onClick={() => handleDelete("flag")}>
            <DeleteIcon />
          </IconButton>
        </Box>
        <Box>
          {flag.map((item, index) => (
            <svg
              key={index}
              viewBox="0 0 1024 1024"
              version="1.1"
              width="28"
              height="28"
              onClick={() => handleClickIcon("flag", index)}
            >
              <rect x={0} y={0} width="1024" height="1024" fillOpacity={0} />
              {item}
            </svg>
          ))}
        </Box>
        <Box sx={headStyle}>
          <Typography variant="h6" gutterBottom>
            {t("mind.study")}
          </Typography>
          <IconButton onClick={() => handleDelete("study")}>
            <DeleteIcon />
          </IconButton>
        </Box>
        <Box>
          {study.map((item, index) => (
            <svg
              key={index}
              viewBox="0 0 1024 1024"
              version="1.1"
              width="28"
              height="28"
              onClick={() => handleClickIcon("study", index)}
            >
              <rect x={0} y={0} width="1024" height="1024" fillOpacity={0} />
              {item}
            </svg>
          ))}
        </Box>
        <Box sx={headStyle}>
          <Typography variant="h6" gutterBottom>
            {t("mind.office")}
          </Typography>
          <IconButton onClick={() => handleDelete("office")}>
            <DeleteIcon />
          </IconButton>
        </Box>
        <Box>
          {office.map((item, index) => (
            <svg
              key={index}
              viewBox="0 0 1024 1024"
              version="1.1"
              width="28"
              height="28"
              onClick={() => handleClickIcon("office", index)}
            >
              <rect x={0} y={0} width="1024" height="1024" fillOpacity={0} />
              {item}
            </svg>
          ))}
        </Box>
        <Box sx={headStyle}>
          <Typography variant="h6" gutterBottom>
            {t("mind.symbol")}
          </Typography>
          <IconButton onClick={() => handleDelete("symbol")}>
            <DeleteIcon />
          </IconButton>
        </Box>
        <Box>
          {symbol.map((item, index) => (
            <svg
              key={index}
              viewBox="0 0 1024 1024"
              version="1.1"
              width="28"
              height="28"
              onClick={() => handleClickIcon("symbol", index)}
            >
              <rect x={0} y={0} width="1024" height="1024" fillOpacity={0} />
              {item}
            </svg>
          ))}
        </Box>
      </Box>
    </Menu>
  );
}
