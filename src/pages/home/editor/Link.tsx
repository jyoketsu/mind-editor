import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { LazyLoadImage } from "react-lazy-load-image-component";

export default function Link({
  anchorEl,
  initUrl,
  initText,
  handleOK,
  handleClose,
}: {
  anchorEl: null | HTMLElement;
  initUrl: string;
  initText: string;
  handleOK: (url: string, text: string) => void;
  handleClose: () => void;
}) {
  const { t } = useTranslation();
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");

  useEffect(() => {
    setUrl(initUrl);
    setText(initText);
  }, [initUrl, initText]);

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
          width: "400px",
          maxWidth: "90vw",
          padding: "15px",
        }}
      >
        <Typography variant="h5" sx={{ marginBottom: "15px" }}>
          {t("mind.link")}
        </Typography>
        <TextField
          fullWidth
          size="small"
          label={t("mind.linkUrl")}
          sx={{ marginBottom: "15px" }}
          value={url}
          onPaste={(e) => e.stopPropagation()}
          onChange={(e) => setUrl(e.target.value)}
        />
        <TextField
          fullWidth
          size="small"
          label={t("mind.linkText")}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div
          style={{
            marginTop: "15px",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Button
            variant="outlined"
            sx={{ marginRight: "8px" }}
            onClick={handleClose}
          >
            {t("mind.cancel")}
          </Button>
          <Button variant="contained" onClick={() => handleOK(url, text)}>
            {t("mind.ok")}
          </Button>
        </div>
      </Box>
    </Menu>
  );
}
