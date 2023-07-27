import Box from "@mui/material/Box";
import Menu from "@mui/material/Menu";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";
import { LazyLoadImage } from "react-lazy-load-image-component";

const work = [
  "https://cdn-notes.qingtime.cn/E799C4B4.svg",
  "https://cdn-notes.qingtime.cn/E799C4B4.svg",
  "https://cdn-notes.qingtime.cn/E799C4B4.svg",
  "https://cdn-notes.qingtime.cn/D463CF80.svg",
  "https://cdn-notes.qingtime.cn/722B0FF2.svg",
];

const travel = [
  "https://cdn-notes.qingtime.cn/E799C4B4.svg",
  "https://cdn-notes.qingtime.cn/D463CF80.svg",
];

const holiday = [
  "https://cdn-notes.qingtime.cn/E799C4B4.svg",
  "https://cdn-notes.qingtime.cn/D463CF80.svg",
];
const food = [
  "https://cdn-notes.qingtime.cn/E799C4B4.svg",
  "https://cdn-notes.qingtime.cn/D463CF80.svg",
];
const others = [
  "https://cdn-notes.qingtime.cn/E799C4B4.svg",
  "https://cdn-notes.qingtime.cn/D463CF80.svg",
];

export default function Illustrations({
  anchorEl,
  handleClick,
  handleClose,
}: {
  anchorEl: null | HTMLElement;
  handleClick: (url: string, width: number, height: number) => void;
  handleClose: () => void;
}) {
  const { t } = useTranslation();
  const style = {
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    columnGap: "5px",
    rowGap: "5px",
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
        <Typography variant="h6" gutterBottom>
          {t("illustration.work")}
        </Typography>
        <Box sx={style}>
          {work.map((item, index) => (
            <LazyLoadImage
              key={index}
              src={item}
              width="100%"
              height="100%"
              draggable={false}
              onClick={() => handleClick(item, 134, 134)}
            />
          ))}
        </Box>
        <Typography variant="h6" gutterBottom>
          {t("illustration.travel")}
        </Typography>
        <Typography variant="h6" gutterBottom>
          {t("illustration.holiday")}
        </Typography>
        <Typography variant="h6" gutterBottom>
          {t("illustration.food")}
        </Typography>
        <Typography variant="h6" gutterBottom>
          {t("illustration.others")}
        </Typography>
      </Box>
    </Menu>
  );
}
