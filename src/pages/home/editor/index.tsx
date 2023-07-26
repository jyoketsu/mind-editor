import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Menu,
  MenuItem,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { Mind, Tree } from "tree-graph-react";
import _ from "lodash";
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
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
import api from "../../../utils/api";
import qiniuUpload from "../../../utils/qiniu";
import React from "react";
import ImageViewer from "./ImageViewer";
import Note from "./Note";
import { JSONContent } from "@tiptap/react";
import Loading from "../../../components/common/Loading";
import Icons from "./Icons";
import { getNoteComp } from "./components";

let timeout: NodeJS.Timeout;

const Editor = React.forwardRef(
  (
    {
      viewType,
    }: {
      viewType: "mutil-tree" | "single-tree" | "mutil-mind" | "single-mind";
    },
    ref
  ) => {
    const { t } = useTranslation();
    const treeRef = useRef<any>(null);
    const moveRef = useRef<any>(null);
    const location = useLocation();
    const dispatch = useAppDispatch();
    const darkMode = useAppSelector((state) => state.common.dark);
    const docData = useAppSelector((state) => state.service.docData);
    const patchDataApi = useAppSelector((state) => state.service.patchDataApi);
    const getUptokenApi = useAppSelector(
      (state) => state.service.getUptokenApi
    );
    const [treeData, setTreeData] = useState<any>(null);
    const [rootKey, setRootKey] = useState<string | null>(null);
    const [openDelConfirm, setOpenDelConfirm] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [url, setUrl] = useState<string | null>(null);
    const open = Boolean(anchorEl);
    const [contextMenuTargetNodeKey, setContextMenuTargetNodeKey] =
      useState("");
    const [noteAnchorEl, setNoteAnchorEl] = useState<null | HTMLElement>(null);
    const [note, setNote] = useState<JSONContent>();
    const [loading, setLoading] = useState(false);
    const [iconsAnchorEl, setIconsAnchorEl] = useState<null | HTMLElement>(
      null
    );

    useImperativeHandle(ref, () => ({
      handleAddChild,
      handleAddNext,
      handleDelete,
      resetMove,
      addNote,
      addIcon,
    }));

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

    useEffect(() => {
      if (docData) {
        const data = _.cloneDeep(docData);
        Object.keys(data.data).forEach((key) => {
          const item = data.data[key];
          if (item.customItemContent) {
            item.customItem = getNoteComp(
              item.customItemContent,
              handleOpenNote,
              handleClickNodeIcon
            );
            item.customItemWidth =
              Object.keys(item.customItemContent).length * (18 + 2);
            item.customItemHeight = 18;
          }
        });
        setTreeData(data);
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
      resetMove();
    }

    function resetMove() {
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
        treeRef.current.deleteNode(contextMenuTargetNodeKey);
        setOpenDelConfirm(false);
        handleCloseContextMenu();
      }
    };

    function handleInputFileChange(event: any) {
      const files = event.target.files;
      handleFileChange(contextMenuTargetNodeKey, "", files);
      handleCloseContextMenu();
    }

    async function handleFileChange(
      nodeKey: string,
      nodeName: string,
      files: FileList
    ) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        if (nodeKey !== rootKey) {
          if (getUptokenApi) {
            const res: any = await api.request.get(getUptokenApi.url, {
              ...getUptokenApi.params,
              ...{ token: api.getToken() },
            });
            if (res.statusCode === "200") {
              const upToken = res.result;
              try {
                setLoading(true);
                const url = await qiniuUpload(upToken, file);
                setLoading(false);
                if (
                  typeof url === "string" &&
                  url.startsWith("https://cdn-icare.qingtime.cn/")
                ) {
                  let img = new Image();
                  img.src = url;
                  img.onload = async () => {
                    const height = 200 / (img.width / img.height);
                    const data = treeRef.current.saveNodes();
                    const patchData = nodeName
                      ? {
                          name: nodeName,
                          imageUrl: url,
                          imageWidth: 200,
                          imageHeight: height,
                        }
                      : {
                          imageUrl: url,
                          imageWidth: 200,
                          imageHeight: height,
                        };
                    treeRef.current.updateNodeById(
                      data.data,
                      nodeKey,
                      patchData
                    );
                  };
                }
              } catch (error) {
                alert("error!");
              }
            } else {
              alert("error!");
            }
          }
        }
      }
    }

    function handleContextMenu(nodeKey: string, event: any) {
      setContextMenuTargetNodeKey(nodeKey);
      setAnchorEl(event.currentTarget);
    }

    function handleCloseContextMenu() {
      setAnchorEl(null);
      setContextMenuTargetNodeKey("");
    }

    function handleAddChild() {
      treeRef.current.addChild(contextMenuTargetNodeKey);
      handleCloseContextMenu();
    }

    function handleAddNext() {
      treeRef.current.addNext(contextMenuTargetNodeKey);
      handleCloseContextMenu();
    }

    function handleDelete() {
      setOpenDelConfirm(true);
    }

    function handleDeleteImage() {
      const data = treeRef.current.saveNodes();
      treeRef.current.updateNodeById(data.data, contextMenuTargetNodeKey, {
        imageUrl: "",
        imageWidth: 0,
        imageHeight: 0,
      });
      handleCloseContextMenu();
    }

    function addNote() {
      const nodeKey = treeRef.current.getSelectedId();
      setContextMenuTargetNodeKey(nodeKey);
      handleAddNote(nodeKey);
    }

    function addIcon() {
      const nodeKey = treeRef.current.getSelectedId();
      setContextMenuTargetNodeKey(nodeKey);
      handleOpenIcon(nodeKey);
    }

    function handleAddNote(nodeKey?: string) {
      const data = treeRef.current.saveNodes();
      const node = data.data[nodeKey || contextMenuTargetNodeKey];
      if (!node) return;
      let customItemContent = node.customItemContent || {};
      if (!customItemContent.note) {
        customItemContent = { ...customItemContent, note: <p></p> };
      }
      treeRef.current.updateNodeById(
        data.data,
        nodeKey || contextMenuTargetNodeKey,
        {
          customItem: getNoteComp(
            customItemContent,
            handleOpenNote,
            handleClickNodeIcon
          ),
          customItemWidth: Object.keys(customItemContent).length * (18 + 2),
          customItemHeight: 18,
          customItemContent,
        }
      );
      handleCloseContextMenu();
    }

    function handleDeleteNote() {
      const data = treeRef.current.saveNodes();
      treeRef.current.updateNodeById(data.data, contextMenuTargetNodeKey, {
        customItem: undefined,
        customItemWidth: undefined,
        customItemHeight: undefined,
        customItemContent: null,
      });
      handleCloseContextMenu();
    }

    function handleOpenNote(nodeKey: string, event: any) {
      const data = treeRef.current.saveNodes();
      const node = data.data[nodeKey];
      if (node) {
        setNote(node.customItemContent?.note);
        setContextMenuTargetNodeKey(nodeKey);
        setNoteAnchorEl(event.currentTarget);
      }
    }

    function handleCloseNote(json: JSONContent) {
      const data = treeRef.current.saveNodes();
      const node = data.data[contextMenuTargetNodeKey];
      if (node) {
        const customItemContent = node.customItemContent || {};
        customItemContent["note"] = json;
        treeRef.current.updateNodeById(data.data, contextMenuTargetNodeKey, {
          customItemContent,
        });
        setNoteAnchorEl(null);
        setContextMenuTargetNodeKey("");
      }
    }

    function handleCloseIcons() {
      setIconsAnchorEl(null);
      setContextMenuTargetNodeKey("");
    }

    function handleOpenIcon(nodeKey?: string) {
      setIconsAnchorEl(
        document.getElementById(
          `tree-node-${nodeKey || contextMenuTargetNodeKey}`
        )
      );
      setAnchorEl(null);
    }

    function handleClickIcon(category: string, index: number) {
      let iconJson: any = {};
      iconJson[category] = index;
      const data = treeRef.current.saveNodes();
      const node = data.data[contextMenuTargetNodeKey];
      if (node) {
        let customItemContent = node.customItemContent || {};
        customItemContent = { ...customItemContent, ...iconJson };
        treeRef.current.updateNodeById(data.data, contextMenuTargetNodeKey, {
          customItem: getNoteComp(
            customItemContent,
            handleOpenNote,
            handleClickNodeIcon
          ),
          customItemWidth: Object.keys(customItemContent).length * (18 + 2),
          customItemHeight: 18,
          customItemContent,
        });
        handleCloseIcons();
      }
    }

    function handleDeleteIcon(category: string) {
      const data = treeRef.current.saveNodes();
      const node = data.data[contextMenuTargetNodeKey];
      if (node) {
        const customItemContent = { ...node.customItemContent };
        if (customItemContent) {
          delete customItemContent[category];
          treeRef.current.updateNodeById(data.data, contextMenuTargetNodeKey, {
            customItem: getNoteComp(
              customItemContent,
              handleOpenNote,
              handleClickNodeIcon
            ),
            customItemWidth: Object.keys(customItemContent).length * (18 + 2),
            customItemHeight: 18,
            customItemContent,
          });
          handleCloseIcons();
        }
      }
    }

    function handleClickNodeIcon(
      nodeKey: string,
      category: string,
      index: number,
      event: any
    ) {
      setContextMenuTargetNodeKey(nodeKey);
      handleOpenIcon(nodeKey);
    }

    const tree = useMemo(() => {
      if (
        rootKey &&
        treeData &&
        treeData.rootKey &&
        treeData.data &&
        treeData.data[treeData.rootKey]
      ) {
        if (viewType.includes("-tree")) {
          return (
            <Tree
              ref={treeRef}
              startId={rootKey}
              nodes={treeData.data}
              handleClickDot={(node: CNode) => handleClickDot(node)}
              // handleChangeNodeText={(nodeId: string, text: string) =>
              //   handleChangeNodeText(nodeId, text)
              // }
              showChildNum={true}
              singleColumn={viewType.startsWith("single-")}
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
              handleFileChange={handleFileChange}
              handleContextMenu={handleContextMenu}
              handleClickNodeImage={(url) => setUrl(url || "")}
            />
          );
        } else {
          return (
            <Mind
              ref={treeRef}
              singleColumn={viewType.startsWith("single-")}
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
              handleFileChange={handleFileChange}
              handleContextMenu={handleContextMenu}
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

    return (
      <Box
        className="editor"
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
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
          }}
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
        <Menu anchorEl={anchorEl} open={open} onClose={handleCloseContextMenu}>
          <MenuItem onClick={handleAddChild}>{t("mind.addChild")}</MenuItem>
          <MenuItem onClick={handleAddNext}>{t("mind.addNext")}</MenuItem>
          <MenuItem>
            <span>{t("mind.addNodeImage")}</span>
            <input
              accept="image/*"
              type="file"
              style={{
                opacity: 0,
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
              }}
              onChange={handleInputFileChange}
            />
          </MenuItem>
          <MenuItem onClick={() => handleAddNote()}>
            {t("mind.addNote")}
          </MenuItem>
          <MenuItem onClick={() => handleOpenIcon()}>{t("mind.icon")}</MenuItem>
          <MenuItem onClick={handleDelete}>{t("mind.delete")}</MenuItem>
          <MenuItem onClick={handleDeleteImage}>
            {t("mind.deleteImage")}
          </MenuItem>
          <MenuItem onClick={handleDeleteNote}>{t("mind.deleteNote")}</MenuItem>
        </Menu>
        <ImageViewer url={url} handleClose={() => setUrl(null)} />
        {getUptokenApi ? (
          <Note
            data={note}
            anchorEl={noteAnchorEl}
            getUptokenApi={getUptokenApi}
            handleClose={handleCloseNote}
          />
        ) : null}
        <Icons
          anchorEl={iconsAnchorEl}
          handleClickIcon={handleClickIcon}
          handleClose={handleCloseIcons}
          handleDelete={handleDeleteIcon}
        />
        {loading ? <Loading /> : null}
      </Box>
    );
  }
);

export default Editor;
