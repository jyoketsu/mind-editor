import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import Typography from "@mui/material/Typography";
import DeleteIcon from "@mui/icons-material/Delete";
import PushPinIcon from "@mui/icons-material/PushPin";
import { useTranslation } from "react-i18next";
import { flag, office, priority, study, symbol, progress } from "./components";
import { Box } from "@mui/material";

export function IconsMenu({
  anchorEl,
  pin,
  handleClickIcon,
  handleClose,
  handleDelete,
  handleClickPin,
  iconCategory,
}: {
  anchorEl: null | HTMLElement;
  pin: boolean;
  handleClickIcon: (category: string, index: number, batch?: boolean) => void;
  handleClose: () => void;
  handleDelete: (category: string) => void;
  handleClickPin: () => void;
  iconCategory?: string;
}) {
  const { t } = useTranslation();
  return (
    <Menu
      anchorEl={anchorEl}
      sx={{ padding: "unset" }}
      open={Boolean(anchorEl)}
      anchorOrigin={{
        vertical: anchorEl?.tagName === "g" ? "bottom" : "top",
        horizontal: anchorEl?.tagName === "g" ? "left" : "right",
      }}
      PaperProps={{
        style: {
          maxHeight: "100vh",
        },
      }}
      onClose={handleClose}
    >
      {!iconCategory ? (
        <Box
          sx={{
            borderBottom: "1px solid",
            borderBottomColor: "divider",
            padding: "0px 15px 8px 15px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h5">{t("icon.icon")}</Typography>
          <IconButton onClick={handleClickPin}>
            <PushPinIcon color={pin ? "primary" : undefined} />
          </IconButton>
        </Box>
      ) : null}
      <Icons
        handleClickIcon={handleClickIcon}
        handleDelete={handleDelete}
        iconCategory={iconCategory}
      />
    </Menu>
  );
}

export function Icons({
  handleClickIcon,
  handleDelete,
  iconCategory,
}: {
  handleClickIcon: (category: string, index: number, batch?: boolean) => void;
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
    <Box
      sx={{
        maxWidth: "420px",
        padding: "0 15px",
        height: iconCategory ? undefined : "calc(100vh - 170px)",
        overflow: "auto",
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
              onClick={() => handleClickIcon("priority", index, !iconCategory)}
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
              onClick={() => handleClickIcon("progress", index, !iconCategory)}
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
              onClick={() => handleClickIcon("flag", index, !iconCategory)}
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
              onClick={() => handleClickIcon("study", index, !iconCategory)}
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
              onClick={() => handleClickIcon("office", index, !iconCategory)}
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
              onClick={() => handleClickIcon("symbol", index, !iconCategory)}
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
  );
}
