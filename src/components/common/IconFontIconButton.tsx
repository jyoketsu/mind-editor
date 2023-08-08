import ButtonBase from "@mui/material/ButtonBase";
import IconFont from "./IconFont";
import React from "react";

export default function IconFontIconButton({
  title,
  iconName,
  fontSize,
  color,
  disabled,
  style,
  children,
  onClick,
}: {
  title: string;
  iconName: string;
  fontSize: number;
  color?: string;
  disabled?: boolean;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <ButtonBase
      sx={{
        borderRadius: "8px",
        padding: "5px",
        filter: `opacity(${disabled ? 0.5 : 1})`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        ...style,
      }}
      disabled={disabled}
      onClick={onClick}
    >
      <IconFont name={iconName} fontSize={fontSize} color={color} />
      {title ? <span>{title}</span> : null}
      {children}
    </ButtonBase>
  );
}
