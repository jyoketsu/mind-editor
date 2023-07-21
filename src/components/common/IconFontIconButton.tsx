import Tooltip from "@mui/material/Tooltip";
import ButtonBase from "@mui/material/ButtonBase";
import IconFont from "./IconFont";

export default function IconFontIconButton({
  title,
  iconName,
  fontSize,
  color,
  onClick,
}: {
  title: string;
  iconName: string;
  fontSize: number;
  color?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <Tooltip title={title}>
      <ButtonBase
        sx={{ borderRadius: "50%", padding: "5px" }}
        onClick={onClick}
      >
        <IconFont name={iconName} fontSize={fontSize} color={color} />
      </ButtonBase>
    </Tooltip>
  );
}
