import { Box, Button } from "@mui/material";
import { useEffect, useState } from "react";
import NodeMap from "tree-graph-react/dist/interfaces/NodeMap";
import Node from "tree-graph-react/dist/interfaces/Node";
import { getAncestor } from "../../utils/util";
import { useLocation } from "react-router-dom";

interface Props {
  nodeKey: string;
  nodeMap: NodeMap;
  handleClick: Function;
}

export default function BreadNav({ nodeKey, nodeMap, handleClick }: Props) {
  const [nodePath, setNodePath] = useState<Node[]>([]);
  const location = useLocation();

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
      className="bread-nav"
      sx={{
        display: "flex",
        alignItems: "center",
        position: "absolute",
        top: "10px",
        left: location.pathname === "/editor" ? "84px" : "15px",
        zIndex: 2,
      }}
    >
      {nodePath.map((node, index) => [
        <Button
          key="path"
          variant="text"
          color="inherit"
          sx={{ minWidth: "unset" }}
          onClick={() => handleClick(node)}
        >
          {node.name}
        </Button>,
        index + 1 < nodePath.length ? <span key="divider">/</span> : null,
      ])}
    </Box>
  );
}
