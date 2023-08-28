import Box from "@mui/material/Box";
import Menu from "@mui/material/Menu";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";
import { LazyLoadImage } from "react-lazy-load-image-component";
import PushPinIcon from "@mui/icons-material/PushPin";
import IconButton from "@mui/material/IconButton";

const work = [
  "https://cdn-notes.qingtime.cn/D04CF33A.svg",
  "https://cdn-notes.qingtime.cn/661CEC74.svg",
  "https://cdn-notes.qingtime.cn/F83D96CF.svg",
  "https://cdn-notes.qingtime.cn/D005DF18.svg",
  "https://cdn-notes.qingtime.cn/720282BB.svg",
  "https://cdn-notes.qingtime.cn/24DA2028.svg",
  "https://cdn-notes.qingtime.cn/EF86045A.svg",
];
const travel = [
  "https://cdn-notes.qingtime.cn/5DD18EEC.svg",
  "https://cdn-notes.qingtime.cn/EB970BF6.svg",
  "https://cdn-notes.qingtime.cn/02E6BD7A.svg",
  "https://cdn-notes.qingtime.cn/2F493CDD.svg",
  "https://cdn-notes.qingtime.cn/85784D4B.svg",
  "https://cdn-notes.qingtime.cn/D5C9DEDE.svg",
  "https://cdn-notes.qingtime.cn/D60F0FAC.svg",
  "https://cdn-notes.qingtime.cn/54E0420E.svg",
];
const holiday = [
  "https://cdn-notes.qingtime.cn/1502B726.svg",
  "https://cdn-notes.qingtime.cn/2E99DD0F.svg",
  "https://cdn-notes.qingtime.cn/A3815C42.svg",
  "https://cdn-notes.qingtime.cn/0A685104.svg",
  "https://cdn-notes.qingtime.cn/030B1BE1.svg",
  "https://cdn-notes.qingtime.cn/64316F74.svg",
  "https://cdn-notes.qingtime.cn/6D758BA3.svg",
  "https://cdn-notes.qingtime.cn/C5BAF536.svg",
];
const food = [
  "https://cdn-notes.qingtime.cn/04A59900.svg",
  "https://cdn-notes.qingtime.cn/CDDE40EA.svg",
  "https://cdn-notes.qingtime.cn/FA08FE10.svg",
  "https://cdn-notes.qingtime.cn/F098B183.svg",
  "https://cdn-notes.qingtime.cn/1989B082.svg",
  "https://cdn-notes.qingtime.cn/621EF3E2.svg",
  "https://cdn-notes.qingtime.cn/D2F6EA0D.svg",
];
const others = [
  "https://cdn-notes.qingtime.cn/C6E691CA.svg",
  "https://cdn-notes.qingtime.cn/F90276C0.svg",
  "https://cdn-notes.qingtime.cn/E6FE685C.svg",
  "https://cdn-notes.qingtime.cn/A3ED8D9D.svg",
  "https://cdn-notes.qingtime.cn/C79B62EE.svg",
  "https://cdn-notes.qingtime.cn/703E7980.svg",
];

export function IllustrationsMenu({
  anchorEl,
  pin,
  handleClick,
  handleClose,
  handleClickPin,
}: {
  anchorEl: null | HTMLElement;
  pin: boolean;
  handleClick: (url: string, width: number, height: number) => void;
  handleClose: () => void;
  handleClickPin: () => void;
}) {
  const { t } = useTranslation();
  const style = {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    columnGap: "12px",
    rowGap: "12px",
    marginBottom: "24px",
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
      // PaperProps={{
      //   style: {
      //     height: "100vh",
      //   },
      // }}
      onClose={handleClose}
    >
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
        <Typography variant="h5">{t("illustration.illustration")}</Typography>
        <IconButton onClick={handleClickPin}>
          <PushPinIcon color={pin ? "primary" : undefined} />
        </IconButton>
      </Box>
      <Illustrations handleClick={handleClick} />
    </Menu>
  );
}

export function Illustrations({
  handleClick,
}: {
  handleClick: (url: string, width: number, height: number) => void;
}) {
  const { t } = useTranslation();
  const style = {
    display: "grid",
    gridTemplateColumns: "repeat(4,1fr)",
    columnGap: "12px",
    rowGap: "12px",
    marginBottom: "24px",
  };
  return (
    <Box
      sx={{
        width: "420px",
        padding: "0 15px",
        height: "calc(100vh - 170px)",
        // maxHeight: "calc(100vh - 120px)",
        overflow: "auto",
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
      <Box sx={style}>
        {travel.map((item, index) => (
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
        {t("illustration.holiday")}
      </Typography>
      <Box sx={style}>
        {holiday.map((item, index) => (
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
        {t("illustration.food")}
      </Typography>
      <Box sx={style}>
        {food.map((item, index) => (
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
        {t("illustration.others")}
      </Typography>
      <Box sx={style}>
        {others.map((item, index) => (
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
    </Box>
  );
}
