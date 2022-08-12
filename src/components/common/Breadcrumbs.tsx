import { Box } from "@mui/material";
import React, { useEffect, useState } from "react";
import { MiniMenu } from "tree-graph-react";
import NodeMap from "tree-graph-react/dist/interfaces/NodeMap";
import Node from "tree-graph-react/dist/interfaces/Node";
import { getAncestor } from "../../utils/util";

interface Props {
  nodeKey: string;
  nodeMap: NodeMap;
  handleClick: Function;
}

export default function BreadNav({ nodeKey, nodeMap, handleClick }: Props) {
  const [nodePath, setNodePath] = useState<Node[]>([]);

  useEffect(() => {
    const node = nodeMap[nodeKey];
    if (!node) {
      return;
    }
    const nodePath = getAncestor(node, nodeMap, true);
    setNodePath(nodePath);
  }, [nodeKey, nodeMap]);

  return (
    <Box
      sx={{ display: "flex", position: "absolute", top: 0, left: 0, zIndex: 2 }}
    >
      {nodePath.map((node, index) => (
        <NavItem
          key={node._key}
          node={node}
          nodeMap={nodeMap}
          isFirst={index === 0 ? true : false}
          onClick={handleClick}
        />
      ))}
      {nodePath.length ? (
        <svg width="30px" height="32px" viewBox="0 0 30 32" version="1.1">
          <path d="M0,0L18,16,L0,32,L0,0Z" fill="#dfdfdf"></path>
        </svg>
      ) : null}
    </Box>
  );
}

interface NavItemProps {
  node: Node;
  nodeMap: NodeMap;
  isFirst?: boolean;
  onClick?: Function;
}
function NavItem({ node, nodeMap, isFirst, onClick }: NavItemProps) {
  const [hover, setHover] = useState(false);

  function handleClick() {
    if (onClick) {
      onClick(node);
    }
  }

  function handleClickMenuNode(clickNode: any) {
    if (onClick) {
      onClick(clickNode);
    }
  }

  function handleMouseEnter() {
    setHover(true);
  }

  function handleMouseLeave() {
    setHover(false);
  }

  return (
    <Box
      sx={{
        position: "relative",
        color: "#131212",
        height: "35px",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Box
        sx={{
          backgroundColor: "#DFDFDF",
          height: "32px",
          fontSize: "16px",
          display: "flex",
        }}
      >
        {!isFirst ? (
          <svg width="20px" height="32px" viewBox="0 0 20 32">
            <path
              d="M0,0L15,16L0,32"
              stroke="#f0f0f0"
              strokeWidth="2px"
              fill="none"
            ></path>
          </svg>
        ) : null}
        <span
          onClick={handleClick}
          style={{
            cursor: "pointer",
            lineHeight: "30px",
            paddingLeft: isFirst ? "15px" : 0,
            maxWidth: "150px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {node.name || "未命名节点"}
        </span>
        {hover && nodeMap ? (
          <div style={{ position: "absolute", top: "34px", left: 0 }}>
            <MiniMenu
              nodes={nodeMap}
              startId={node._key}
              columnSpacing={0.1}
              normalFirstLevel={true}
              backgroundColor="#DFDFDF"
              color="#131212"
              selectedBackgroundColor="#cb1b45"
              handleClickNode={(node: any) => handleClickMenuNode(node)}
            />
          </div>
        ) : null}
      </Box>
    </Box>
  );
}
