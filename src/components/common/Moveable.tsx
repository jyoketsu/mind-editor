import React, { useState, useImperativeHandle } from "react";

export interface Props {
  children: React.ReactNode;
  style?: any;
  rightClickToStart?: boolean;
  scrollable?: boolean;
  scrollStep?: number;
}

const gapTime = 16.666;
let spaceKeyDown = false;
let lastTime = 0;
let clickX = 0;
let clickY = 0;

export const Moveable = React.forwardRef(
  (
    { style, rightClickToStart, scrollable, scrollStep = 23, children }: Props,
    ref
  ) => {
    // 暴露方法
    useImperativeHandle(ref, () => ({
      reset: () => {
        setTranslateX(0);
        setTranslateY(0);
      },
    }));
    const [translateX, setTranslateX] = useState(0);
    const [translateY, setTranslateY] = useState(0);
    const [started, setStarted] = useState(false);

    const handleMoveStart = (e: React.MouseEvent<HTMLElement>) => {
      // 左键
      if (e.button === 0) {
        if (!rightClickToStart || spaceKeyDown) {
          clickX = e.clientX;
          clickY = e.clientY;
          setStarted(true);
        }
      } else if (e.button === 2) {
        e.preventDefault();
        // 右键
        if (rightClickToStart) {
          clickX = e.clientX;
          clickY = e.clientY;
          setStarted(true);
        }
      }
    };

    const handleTouchStart = (e: React.TouchEvent<HTMLElement>) => {
      e.preventDefault();
      clickX = e.touches[0].clientX;
      clickY = e.touches[0].clientY;
      setStarted(true);
    };

    const handleMove = (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();
      if (started) {
        let time = new Date().getTime();
        if (time - lastTime > gapTime || !lastTime) {
          let movedX = 0;
          let movedY = 0;
          movedX = e.clientX - clickX;
          movedY = e.clientY - clickY;

          setTranslateX(translateX + movedX);
          setTranslateY(translateY + movedY);

          clickX = e.clientX;
          clickY = e.clientY;

          lastTime = time;
        }
      }
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLElement>) => {
      e.preventDefault();
      if (started) {
        let time = new Date().getTime();
        if (time - lastTime > gapTime || !lastTime) {
          let movedX = 0;
          let movedY = 0;
          movedX = e.touches[0].clientX - clickX;
          movedY = e.touches[0].clientY - clickY;

          setTranslateX(translateX + movedX);
          setTranslateY(translateY + movedY);

          clickX = e.touches[0].clientX;
          clickY = e.touches[0].clientY;

          lastTime = time;
        }
      }
    };

    const handleWheel = (e: any) => {
      if (scrollable) {
        if (e.deltaY < 0) {
          setTranslateY(translateY + scrollStep);
        } else {
          setTranslateY(translateY - scrollStep);
        }
      }
    };

    const handleMoveEnd = () => {
      setStarted(false);
    };

    const handleContextMenu = (e: React.MouseEvent<HTMLElement>) => {
      if (rightClickToStart) {
        e.preventDefault();
      }
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === " " && !spaceKeyDown) {
        spaceKeyDown = true;
      }
    };
    const handleKeyUp = (event: React.KeyboardEvent) => {
      if (event.key === " ") {
        spaceKeyDown = false;
      }
    };

    const propsStyle = style || {};
    return (
      <div
        style={{
          ...{
            position: "relative",
            width: "100%",
            height: "100%",
            cursor: started ? "grabbing" : "auto",
          },
          ...propsStyle,
        }}
        onContextMenu={handleContextMenu}
        onMouseDown={handleMoveStart}
        onMouseUp={handleMoveEnd}
        onMouseLeave={handleMoveEnd}
        onMouseMove={handleMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMoveEnd}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onWheel={handleWheel}
      >
        <div
          style={{
            position: "relative",
            width: "fit-content",
            transform: `translate(${translateX}px,${translateY}px)`,
          }}
        >
          {children}
        </div>
      </div>
    );
  }
);
