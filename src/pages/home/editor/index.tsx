import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { Mind, Tree } from "tree-graph-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { useLocation } from "react-router-dom";
import {
  getSearchParamValue,
  plainTextToNaotuFormat,
} from "../../../utils/util";
import { Moveable } from "../../../components/common/Moveable";
import { saveDoc, setChanged } from "../../../redux/reducer/serviceSlice";
import CNode from "tree-graph-react/dist/interfaces/CNode";
import NodeMap from "tree-graph-react/dist/interfaces/NodeMap";
import Breadcrumbs from "../../../components/common/Breadcrumbs";

let timeout: NodeJS.Timeout;

export default function Editor() {
  const { t } = useTranslation();
  const treeRef = useRef<any>(null);
  const moveRef = useRef<any>(null);
  const location = useLocation();
  const dispatch = useAppDispatch();
  const darkMode = useAppSelector((state) => state.common.dark);
  const docData = useAppSelector((state) => state.service.docData);
  const patchDataApi = useAppSelector((state) => state.service.patchDataApi);
  const viewType = getSearchParamValue(location.search, "viewType") || "mutil";
  const [treeData, setTreeData] = useState<any>(null);
  const [rootKey, setRootKey] = useState<string | null>(null);
  const [openDelConfirm, setOpenDelConfirm] = useState(false);

  const handleChange = useCallback(() => {
    clearTimeout(timeout);
    dispatch(setChanged(true));
    timeout = setTimeout(() => {
      const data = getData();
      if (data && patchDataApi) {
        dispatch(
          saveDoc({
            patchDataApi,
            data,
          })
        );
      }
    }, 4000);
  }, [treeData]);

  const handleImport = useCallback((text?: string) => {
    let newData: NodeMap = {};

    function generateNode(node: any, fatherId: string) {
      let children = node.children;
      let sortList = [];
      for (let index = 0; index < children.length; index++) {
        const child = children[index];
        sortList.push(child.data.id);
        generateNode(child, node.data.id);
      }
      newData[node.data.id] = {
        _key: node.data.id,
        name: node.data.text,
        father: fatherId,
        sortList: sortList,
      };
    }
    const targetText = text;
    if (targetText) {
      const data = treeRef.current.saveNodes();
      const selectedId = treeRef.current.getSelectedId() || data.rootKey;

      let targetNode = data.data[selectedId];

      const nodes = plainTextToNaotuFormat(targetText);
      let sortList = targetNode.sortList;
      for (let index = 0; index < nodes.length; index++) {
        const node = nodes[index];
        generateNode(node, selectedId);
        sortList.push(node.data.id);
      }

      targetNode.sortList = sortList;
      data.data = { ...data.data, ...newData };
      setTreeData(data);
    }
  }, []);

  const handlePasteText = useCallback(
    (text: string) => {
      if (text) {
        handleImport(text);
      }
    },
    [handleImport]
  );

  const tree = useMemo(() => {
    if (
      rootKey &&
      treeData &&
      treeData.rootKey &&
      treeData.data &&
      treeData.data[treeData.rootKey]
    ) {
      if (viewType === "mutil" || viewType === "single") {
        return (
          <Tree
            ref={treeRef}
            startId={rootKey}
            nodes={treeData.data}
            handleClickDot={(node: CNode) => handleClickDot(node)}
            // handleChangeNodeText={(nodeId: string, text: string) =>
            //   handleChangeNodeText(nodeId, text)
            // }
            singleColumn={viewType === "single" ? true : false}
            handleChange={handleChange}
            itemHeight={35}
            blockHeight={30}
            pathWidth={2}
            pathColor={darkMode ? "#FFF" : "#535953"}
            backgroundColor={undefined}
            hoverBorderColor={darkMode ? "#FFE4E1" : undefined}
            selectedBorderColor={darkMode ? "#FF0000" : undefined}
            showDeleteConform={handledeleteConform}
            fontWeight={800}
            handlePasteText={handlePasteText}
          />
        );
      } else {
        return (
          <Mind
            ref={treeRef}
            singleColumn={viewType === "mind-oneway" ? true : false}
            startId={rootKey}
            nodes={treeData.data}
            handleClickDot={(node: CNode) => handleClickDot(node)}
            handleChange={handleChange}
            // handleChangeNodeText={(nodeId: string, text: string) =>
            //   handleChangeNodeText(nodeId, text)
            // }
            itemHeight={38}
            blockHeight={30}
            pathWidth={2}
            pathColor={darkMode ? "#FFF" : "#535953"}
            backgroundColor={darkMode ? "#212121" : undefined}
            hoverBorderColor={darkMode ? "#FFE4E1" : undefined}
            selectedBorderColor={darkMode ? "#FF0000" : undefined}
            showDeleteConform={handledeleteConform}
            fontWeight={800}
            handlePasteText={handlePasteText}
          />
        );
      }
    } else {
      return <div></div>;
    }
  }, [
    rootKey,
    treeData,
    darkMode,
    handleChange,
    // handleChangeNodeText,
    viewType,
    handlePasteText,
  ]);

  useEffect(() => {
    if (docData) {
      setTreeData(JSON.parse(JSON.stringify(docData)));
      setRootKey(docData.rootKey);
    }
  }, [docData]);

  function getData() {
    if (treeRef && treeRef.current) {
      let data = treeRef.current.saveNodes();
      if (treeData && treeData.viewType) {
        data.viewType = treeData.viewType;
      }
      return data;
    }
  }

  function handleClickDot(node: CNode) {
    setRootKey(node._key);
    if (moveRef && moveRef.current) {
      moveRef.current.reset();
    }
  }

  function handledeleteConform() {
    setOpenDelConfirm(true);
  }
  const handleCloseDelConfirm = () => {
    setOpenDelConfirm(false);
  };
  const handleDeleteNode = () => {
    if (treeRef && treeRef.current) {
      treeRef.current.deleteNode();
      setOpenDelConfirm(false);
    }
  };

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {rootKey && treeData && treeData.data ? (
        <Breadcrumbs
          nodeKey={rootKey}
          nodeMap={treeData.data}
          handleClick={(node: CNode) => setRootKey(node._key)}
        />
      ) : null}
      <Moveable
        ref={moveRef}
        scrollable={true}
        style={{ display: "flex", justifyContent: "center" }}
        rightClickToStart={true}
      >
        {tree}
      </Moveable>
      <Dialog
        sx={{ "& .MuiDialog-paper": { width: "80%", maxHeight: 435 } }}
        maxWidth="xs"
        open={openDelConfirm}
      >
        <DialogTitle>{t("mind.deleteTitle")}</DialogTitle>
        <DialogContent dividers>{t("mind.deleteContent")}</DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleCloseDelConfirm}>
            {t("mind.cancel")}
          </Button>
          <Button onClick={handleDeleteNode}>{t("mind.ok")}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
