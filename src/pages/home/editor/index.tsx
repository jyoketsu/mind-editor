import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
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
import {
  TreeData,
  saveDoc,
  setChanged,
} from "../../../redux/reducer/serviceSlice";
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
import { getStartAdornment, getEndAdornment } from "./components";
import Illustrations from "./Illustrations";
import Link from "./Link";
import Config from "../../../interface/Config";
import IconFontIconButton from "../../../components/common/IconFontIconButton";

let timeout: NodeJS.Timeout;
let configLoaded = false;

const Editor = React.forwardRef(
  (
    {
      viewType,
      config,
      history,
      historyIndex,
      handleSetHistory,
      handleSetHistoryIndex,
      handleClickNode,
    }: {
      viewType: string;
      config: Config | null;
      history: TreeData[];
      historyIndex: number;
      handleSetHistory: (history: TreeData[]) => void;
      handleSetHistoryIndex: (index: number) => void;
      handleClickNode: (node: CNode) => void;
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
    const [iconCategory, setIconCategory] = useState("");
    const [illustrationAnchorEl, setIllustrationAnchorEl] =
      useState<null | HTMLElement>(null);
    const [linkAnchorEl, setLinkAnchorEl] = useState<null | HTMLElement>(null);
    const [initUrl, setInitUrl] = useState("");
    const [initText, setInitText] = useState("");

    const contextMenuStyle: React.CSSProperties = {
      padding: "10px 12px",
      margin: "2px 0",
      borderRadius: "unset",
      width: "100%",
      flexDirection: "row",
      justifyContent: "flex-start",
    };

    useImperativeHandle(ref, () => ({
      handleAddChild,
      handleAddNext,
      handleDelete,
      resetMove,
      addNote,
      addIcon,
      addIllustration,
      addLink,
      handleChange,
      getSelectedIds: () => treeRef.current.getSelectedIds(),
      getNodes: () => treeRef.current.saveNodes(),
      updateNodesByIds: (nodes: NodeMap, ids: string[], data: any) => {
        treeRef?.current?.updateNodesByIds(nodes, ids, data);
      },
      clearSelectedNodes: () => {
        treeRef?.current.setselectedId("");
        treeRef?.current.setSelectedNodes([]);
      },
    }));

    const handleChange = useCallback(
      (skipHistory?: boolean) => {
        clearTimeout(timeout);
        dispatch(setChanged(true));
        

        if (!skipHistory) {
          const data = getData();
          const historyArr = [...history, data];
          if (history.length > 10) {
            historyArr.shift();
          }
          handleSetHistory(historyArr);
          handleSetHistoryIndex(historyArr.length - 1);
        }

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
      },
      [treeData, config, history, historyIndex]
    );

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
          if (item.startAdornmentContent) {
            item.startAdornment = getStartAdornment(
              item.startAdornmentContent,
              handleClickNodeIcon
            );
            item.startAdornmentWidth =
              Object.keys(item.startAdornmentContent).length * (18 + 2);
            item.startAdornmentHeight = 18;
          }
          if (item.endAdornmentContent) {
            item.endAdornment = getEndAdornment(item.endAdornmentContent, {
              note: handleOpenNote,
              link: handleOpenLink,
            });
            item.endAdornmentWidth =
              Object.keys(item.endAdornmentContent).length * (18 + 2);
            item.endAdornmentHeight = 18;
          }
        });
        setTreeData(data);
        setRootKey(docData.rootKey);
      }
    }, [docData]);

    useEffect(() => {
      if (config) {
        if (configLoaded) {
          handleChange(true);
        } else {
          configLoaded = true;
        }
      }
    }, [config]);

    function getData() {
      if (treeRef && treeRef.current) {
        let data = treeRef.current.saveNodes();
        if (treeData && treeData.viewType) {
          data.viewType = treeData.viewType;
        }
        if (config) {
          data.config = config;
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
                  treeRef.current.updateNodeById(data.data, nodeKey, patchData);
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

    function handleContextMenu(nodeKey: string, event: any) {
      setContextMenuTargetNodeKey(nodeKey);
      setAnchorEl(event.currentTarget);
    }

    function handleCloseContextMenu() {
      setAnchorEl(null);
      setContextMenuTargetNodeKey("");
    }

    function handleAddChild() {
      const nodeKey =
        treeRef.current.getSelectedId() || treeRef.current.getSelectedIds()[0];
      treeRef.current.addChild(contextMenuTargetNodeKey || nodeKey);
      handleCloseContextMenu();
    }

    function handleAddNext() {
      const nodeKey =
        treeRef.current.getSelectedId() || treeRef.current.getSelectedIds()[0];
      treeRef.current.addNext(contextMenuTargetNodeKey || nodeKey);
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

    function addNote(anchorEl?: HTMLElement) {
      const nodeKey =
        treeRef.current.getSelectedId() || treeRef.current.getSelectedIds()[0];
      setContextMenuTargetNodeKey(nodeKey);
      handleAddNote(nodeKey, anchorEl);
    }

    function addIcon(anchorEl?: HTMLElement) {
      const nodeKey =
        treeRef.current.getSelectedId() || treeRef.current.getSelectedIds()[0];
      setContextMenuTargetNodeKey(nodeKey);
      handleOpenIcon(nodeKey, anchorEl);
    }

    function addIllustration(anchorEl?: HTMLElement) {
      const nodeKey =
        treeRef.current.getSelectedId() || treeRef.current.getSelectedIds()[0];
      setContextMenuTargetNodeKey(nodeKey);
      handleOpenIllustration(nodeKey, anchorEl);
    }

    function addLink(anchorEl?: HTMLElement) {
      const nodeKey =
        treeRef.current.getSelectedId() || treeRef.current.getSelectedIds()[0];
      const data = treeRef.current.saveNodes();
      const node = data.data[nodeKey];
      if (!node) return;
      const link = node.endAdornmentContent?.link;
      if (link) {
        setInitText(link.text);
        setInitUrl(link.url);
      } else {
        setInitText("");
        setInitUrl("");
      }
      setContextMenuTargetNodeKey(nodeKey);
      setLinkAnchorEl(
        anchorEl ||
          document.getElementById(
            `tree-node-${nodeKey || contextMenuTargetNodeKey}`
          )
      );
    }

    function handleAddNote(nodeKey?: string, anchorEl?: HTMLElement) {
      const data = treeRef.current.saveNodes();
      const node = data.data[nodeKey || contextMenuTargetNodeKey];
      if (!node) return;
      let endAdornmentContent = node.endAdornmentContent || {};
      if (!endAdornmentContent.note) {
        endAdornmentContent = { ...endAdornmentContent, note: <p></p> };
        treeRef.current.updateNodeById(
          data.data,
          nodeKey || contextMenuTargetNodeKey,
          {
            endAdornment: getEndAdornment(endAdornmentContent, {
              note: handleOpenNote,
              link: handleOpenLink,
            }),
            endAdornmentWidth:
              Object.keys(endAdornmentContent).length * (18 + 2),
            endAdornmentHeight: 18,
            endAdornmentContent,
          }
        );
      }

      handleOpenNote(node._key, null, anchorEl);
      setAnchorEl(null);
    }

    function handleDeleteNote() {
      const data = treeRef.current.saveNodes();
      const node = data.data[contextMenuTargetNodeKey];
      if (node) {
        const endAdornmentContent = { ...node.endAdornmentContent };
        if (endAdornmentContent) {
          delete endAdornmentContent["note"];
          treeRef.current.updateNodeById(data.data, contextMenuTargetNodeKey, {
            endAdornment: getEndAdornment(endAdornmentContent, {
              note: handleOpenNote,
              link: handleOpenLink,
            }),
            endAdornmentWidth:
              Object.keys(endAdornmentContent).length * (18 + 2),
            endAdornmentHeight: 18,
            endAdornmentContent,
          });
          handleCloseContextMenu();
        }
      }
    }

    function handleOpenNote(
      nodeKey: string,
      event: any,
      anchorEl?: HTMLElement
    ) {
      const data = treeRef.current.saveNodes();
      const node = data.data[nodeKey];
      if (node) {
        setNote(node.endAdornmentContent?.note);
        setContextMenuTargetNodeKey(nodeKey);
        setNoteAnchorEl(
          anchorEl ||
            document.getElementById(
              `tree-node-${nodeKey || contextMenuTargetNodeKey}`
            ) ||
            event.currentTarget
        );
      }
    }

    function handleOpenLink(nodeKey: string) {
      const data = treeRef.current.saveNodes();
      const node = data.data[nodeKey];
      if (node) {
        const url = node.endAdornmentContent.link.url;
        if (url.includes("http")) {
          window.open(url, "_blank");
        } else {
          window.open(`http://${url}`, "_blank");
        }
      }
    }

    function handleCloseNote(json: JSONContent) {
      const data = treeRef.current.saveNodes();
      const node = data.data[contextMenuTargetNodeKey];
      if (node) {
        const endAdornmentContent = node.endAdornmentContent || {};
        endAdornmentContent["note"] = json;
        treeRef.current.updateNodeById(data.data, contextMenuTargetNodeKey, {
          endAdornmentContent,
        });
        setNoteAnchorEl(null);
        setContextMenuTargetNodeKey("");
      }
    }

    function handleCloseIcons() {
      setIconsAnchorEl(null);
      setContextMenuTargetNodeKey("");
      setTimeout(() => {
        setIconCategory("");
      }, 500);
    }

    function handleOpenIcon(nodeKey?: string, anchorEl?: HTMLElement) {
      setIconsAnchorEl(
        anchorEl ||
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
        let startAdornmentContent = node.startAdornmentContent || {};
        startAdornmentContent = { ...startAdornmentContent, ...iconJson };
        treeRef.current.updateNodeById(data.data, contextMenuTargetNodeKey, {
          startAdornment: getStartAdornment(
            startAdornmentContent,
            handleClickNodeIcon
          ),
          startAdornmentWidth:
            Object.keys(startAdornmentContent).length * (18 + 2),
          startAdornmentHeight: 18,
          startAdornmentContent,
        });
        handleCloseIcons();
      }
    }

    function handleDeleteIcon(category: string) {
      const data = treeRef.current.saveNodes();
      const node = data.data[contextMenuTargetNodeKey];
      if (node) {
        const startAdornmentContent = { ...node.startAdornmentContent };
        if (startAdornmentContent) {
          delete startAdornmentContent[category];
          treeRef.current.updateNodeById(data.data, contextMenuTargetNodeKey, {
            startAdornment: getStartAdornment(
              startAdornmentContent,
              handleClickNodeIcon
            ),
            startAdornmentWidth:
              Object.keys(startAdornmentContent).length * (18 + 2),
            startAdornmentHeight: 18,
            startAdornmentContent,
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
      setIconCategory(category);
      setContextMenuTargetNodeKey(nodeKey);
      handleOpenIcon(nodeKey);
    }

    function handleOpenIllustration(nodeKey?: string, anchorEl?: HTMLElement) {
      setIllustrationAnchorEl(
        anchorEl ||
          document.getElementById(
            `tree-node-${nodeKey || contextMenuTargetNodeKey}`
          )
      );
      setAnchorEl(null);
    }

    function handleCloseIllustration() {
      setIllustrationAnchorEl(null);
      setContextMenuTargetNodeKey("");
    }

    function handleClickIllustration(
      url: string,
      imageWidth: number,
      imageHeight: number
    ) {
      const data = treeRef.current.saveNodes();
      if (contextMenuTargetNodeKey) {
        treeRef.current.updateNodeById(data.data, contextMenuTargetNodeKey, {
          imageUrl: url,
          imageWidth,
          imageHeight,
        });
        handleCloseIllustration();
      }
    }

    function handleSetLink(url: string, text: string) {
      const nodeKey = treeRef.current.getSelectedId();
      const data = treeRef.current.saveNodes();
      const node = data.data[nodeKey];
      if (!node) return;
      let endAdornmentContent = node.endAdornmentContent || {};
      endAdornmentContent = { ...endAdornmentContent, link: { url, text } };
      treeRef.current.updateNodeById(
        data.data,
        nodeKey || contextMenuTargetNodeKey,
        {
          endAdornment: getEndAdornment(endAdornmentContent, {
            note: handleOpenNote,
            link: handleOpenLink,
          }),
          endAdornmentWidth: Object.keys(endAdornmentContent).length * (18 + 2),
          endAdornmentHeight: 18,
          endAdornmentContent,
        }
      );
      setLinkAnchorEl(null);
    }

    function handleChangeNodeText(nodeKey: string, text: string) {
      const urlReg =
        /(([\w-]{1,}\.+)+(com|cn|org|net|info)(\/#\/)*\/*[\w\/\?=&%.]*)|(http:\/\/([\w-]{1,}\.+)+(com|cn|org|net|info)(\/#\/)*\/*[\w\/\?=&%.]*)|(https:\/\/([\w-]{1,}\.+)+(com|cn|org|net|info)(\/#\/)*\/*[\w\/\?=&%.]*)/g;
      if (urlReg.test(text)) {
        const matchList = text.match(urlReg);

        const data = treeRef.current.saveNodes();
        const node = data.data[nodeKey];
        if (!node) return;
        if (!matchList?.length) return;
        let endAdornmentContent = node.endAdornmentContent || {};
        endAdornmentContent = {
          ...endAdornmentContent,
          link: { url: matchList[0], text: "" },
        };
        treeRef.current.updateNodeById(
          data.data,
          nodeKey || contextMenuTargetNodeKey,
          {
            endAdornment: getEndAdornment(endAdornmentContent, {
              note: handleOpenNote,
              link: handleOpenLink,
            }),
            endAdornmentWidth:
              Object.keys(endAdornmentContent).length * (18 + 2),
            endAdornmentHeight: 18,
            endAdornmentContent,
            name: text.replace(matchList[0], ""),
          }
        );
      }
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
              pathWidth={2}
              pathColor={config?.lineColor || (darkMode ? "#FFF" : "#535953")}
              nodeColor={config?.nodeColor || undefined}
              // backgroundColor={undefined}
              hoverBorderColor={darkMode ? "#FFE4E1" : undefined}
              selectedBorderColor={darkMode ? "#FF0000" : undefined}
              paddingLeft={1000}
              paddingTop={1000}
              showDeleteConform={handledeleteConform}
              handlePasteText={handlePasteText}
              handleFileChange={handleFileChange}
              handleContextMenu={handleContextMenu}
              handleClickNodeImage={(url) => setUrl(url || "")}
              handleClickNode={handleClickNode}
              handleChangeNodeText={(nodeKey: string, text: string) =>
                handleChangeNodeText(nodeKey, text)
              }
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
              showChildNum={true}
              handleChange={handleChange}
              // handleChangeNodeText={(nodeId: string, text: string) =>
              //   handleChangeNodeText(nodeId, text)
              // }
              pathWidth={2}
              pathColor={config?.lineColor || (darkMode ? "#FFF" : "#535953")}
              nodeColor={config?.nodeColor || undefined}
              // backgroundColor={darkMode ? "#212121" : undefined}
              hoverBorderColor={darkMode ? "#FFE4E1" : undefined}
              selectedBorderColor={darkMode ? "#FF0000" : undefined}
              paddingLeft={1000}
              paddingTop={1000}
              showDeleteConform={handledeleteConform}
              handlePasteText={handlePasteText}
              handleFileChange={handleFileChange}
              handleContextMenu={handleContextMenu}
              handleClickNodeImage={(url) => setUrl(url || "")}
              handleClickNode={handleClickNode}
            />
          );
        }
      } else {
        return <div></div>;
      }
    }, [rootKey, treeData, darkMode, handleChange, viewType, handlePasteText]);

    return (
      <div
        className="editor"
        style={{
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
          <IconFontIconButton
            title={t("mind.addChild")}
            iconName="a-xiajijiedian1x"
            fontSize={23}
            dividerSize={5}
            style={contextMenuStyle}
            onClick={handleAddChild}
          />
          <IconFontIconButton
            title={t("mind.addNext")}
            iconName="a-tongjijiedian1x"
            fontSize={23}
            dividerSize={5}
            style={contextMenuStyle}
            onClick={handleAddNext}
          />
          <Divider />
          <IconFontIconButton
            title={t("icon.icon")}
            iconName="tubiao"
            fontSize={23}
            dividerSize={5}
            style={contextMenuStyle}
            onClick={() => handleOpenIcon()}
          />
          <IconFontIconButton
            title={t("illustration.illustration")}
            iconName="chatu"
            fontSize={23}
            dividerSize={5}
            style={contextMenuStyle}
            onClick={() => handleOpenIllustration()}
          />
          <IconFontIconButton
            title={t("mind.addNodeImage")}
            iconName="tupian1"
            fontSize={23}
            dividerSize={5}
            style={contextMenuStyle}
          >
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
          </IconFontIconButton>

          <IconFontIconButton
            title={t("mind.addNote")}
            iconName="beizhu"
            fontSize={23}
            dividerSize={5}
            style={contextMenuStyle}
            onClick={() => handleAddNote()}
          />
          <Divider />
          <IconFontIconButton
            title={t("mind.deleteNote")}
            iconName="a-shanchu1x"
            fontSize={23}
            dividerSize={5}
            style={contextMenuStyle}
            onClick={handleDeleteNote}
          />
          <IconFontIconButton
            title={t("mind.deleteImage")}
            iconName="a-shanchu1x"
            fontSize={23}
            dividerSize={5}
            style={contextMenuStyle}
            onClick={handleDeleteImage}
          />
          <IconFontIconButton
            title={t("mind.delete")}
            iconName="a-shanchu1x"
            fontSize={23}
            dividerSize={5}
            style={contextMenuStyle}
            onClick={handleDelete}
          />
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
          iconCategory={iconCategory}
        />
        <Illustrations
          anchorEl={illustrationAnchorEl}
          handleClick={handleClickIllustration}
          handleClose={handleCloseIllustration}
        />
        <Link
          anchorEl={linkAnchorEl}
          initUrl={initUrl}
          initText={initText}
          handleOK={handleSetLink}
          handleClose={() => setLinkAnchorEl(null)}
        />
        {loading ? <Loading /> : null}
      </div>
    );
  }
);

export default Editor;
