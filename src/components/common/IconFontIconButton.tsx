import ButtonBase from "@mui/material/ButtonBase";
import IconFont from "./IconFont";
import React from "react";
import { Tooltip } from "@mui/material";

export default function IconFontIconButton({
  title,
  iconName,
  fontSize,
  color,
  disabled,
  dividerSize = 0,
  style,
  children,
  className,
  onClick,
  onMouseEnter,
  hideText,
}: {
  title?: string;
  iconName: string;
  fontSize: number;
  color?: string;
  disabled?: boolean;
  dividerSize?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseEnter?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  hideText?: boolean;
}) {
  const button = (
    <ButtonBase
      className={className || "iconfont-button"}
      sx={{
        borderRadius: "8px",
        padding: "5px",
        filter: `opacity(${disabled ? 0.5 : 1})`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        "&:hover": {
          backgroundColor: "action.hover",
        },
        ...style,
      }}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      <IconFont name={iconName} fontSize={fontSize} color={color} />
      <div
        style={{ width: `${dividerSize}px`, height: `${dividerSize}px` }}
      ></div>
      {title && !hideText ? <span>{title}</span> : null}
      {children}
    </ButtonBase>
  );
  return hideText && title ? (
    <Tooltip title={title} placement="top">
      {button}
    </Tooltip>
  ) : (
    button
  );
}
