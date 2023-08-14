import Dialog from "@mui/material/Dialog";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";

export default function ShortcutDialog({
  open,
  handleClose,
}: {
  open: boolean;
  handleClose: () => void;
}) {
  const { t } = useTranslation();
  const isMac = /macintosh|mac os x/i.test(navigator.userAgent);
  const commandKey = isMac ? "⌘" : "Ctrl";
  return (
    <Dialog open={open} maxWidth="md" onClose={handleClose}>
      <Box
        sx={{
          width: "100%",
          minWidth: 320,
          bgcolor: "background.paper",
        }}
      >
        <List>
          <ListItem>
            <ListItemText primary={t("shortcut.enter")} />
            <Typography variant="body2" color="text.secondary">
              【Enter】
            </Typography>
          </ListItem>
          <ListItem>
            <ListItemText primary={t("shortcut.tab")} />
            <Typography variant="body2" color="text.secondary">
              【Tab】
            </Typography>
          </ListItem>
          <ListItem>
            <ListItemText primary={t("shortcut.cut")} />
            <Typography variant="body2" color="text.secondary">
              {`【${commandKey}】+ 【X】`}
            </Typography>
          </ListItem>
          <ListItem>
            <ListItemText primary={t("shortcut.paste")} />
            <Typography variant="body2" color="text.secondary">
              {`【${commandKey}】+ 【V】`}
            </Typography>
          </ListItem>
          <ListItem>
            <ListItemText primary={t("shortcut.shiftLeft")} />
            <Typography variant="body2" color="text.secondary">
              【Shift】+【←】
            </Typography>
          </ListItem>
          <ListItem>
            <ListItemText primary={t("shortcut.shiftRight")} />
            <Typography variant="body2" color="text.secondary">
              【Shift】+【→】
            </Typography>
          </ListItem>

          <ListItem>
            <ListItemText primary={t("shortcut.arrowUp")} />
            <Typography variant="body2" color="text.secondary">
              【↑】
            </Typography>
          </ListItem>
          <ListItem>
            <ListItemText primary={t("shortcut.arrowRight")} />
            <Typography variant="body2" color="text.secondary">
              【→】
            </Typography>
          </ListItem>
          <ListItem>
            <ListItemText primary={t("shortcut.arrowDown")} />
            <Typography variant="body2" color="text.secondary">
              【↓】
            </Typography>
          </ListItem>
          <ListItem>
            <ListItemText primary={t("shortcut.arrowLeft")} />
            <Typography variant="body2" color="text.secondary">
              【←】
            </Typography>
          </ListItem>

          <ListItem>
            <ListItemText primary={t("shortcut.delete")} />
            <Typography variant="body2" color="text.secondary">
              【Backspace】或【Delete】
            </Typography>
          </ListItem>
        </List>
        <Divider />
      </Box>
    </Dialog>
  );
}
