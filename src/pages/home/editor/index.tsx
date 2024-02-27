import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Slide,
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
  setDocTreeData,
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
import { Icons, IconsMenu } from "./Icons";
import { getStartAdornment, getEndAdornment } from "./components";
import { IllustrationsMenu, Illustrations } from "./Illustrations";
import Link from "./Link";
import Config from "../../../interface/Config";
import IconFontIconButton from "../../../components/common/IconFontIconButton";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { Close } from "@mui/icons-material";

let timeout: NodeJS.Timeout;
let configLoaded = false;

const Editor = React.forwardRef(
  (
    {
      readonly,
      viewType,
      config,
      history,
      historyIndex,
      zoomRatio,
      handleSetHistory,
      handleSetHistoryIndex,
      handleClickNode,
    }: {
      readonly: boolean;
      viewType: string;
      config: Config | null;
      history?: TreeData[];
      historyIndex?: number;
      zoomRatio?: number;
      handleSetHistory?: (history: TreeData[]) => void;
      handleSetHistoryIndex?: (index: number) => void;
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
    const [contextMenuTargetNode, setContextMenuTargetNode] =
      useState<CNode | null>(null);
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
    const [iconPin, setIconPin] = useState(false);
    const [illPin, setIllPin] = useState(false);
    const [tabValue, setTabValue] = useState("");

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
      exportImage: (type: "svg" | "png" | "pdf") => {
        treeRef?.current.exportImage(type);
      },
    }));

    const handleChange = useCallback(
      (skipHistory?: boolean) => {
        clearTimeout(timeout);
        dispatch(setChanged(true));

        if (!skipHistory && history) {
          const data = getData();
          const historyArr = [...history, data];
          if (history.length > 10) {
            historyArr.shift();
          }
          if (handleSetHistory) {
            handleSetHistory(historyArr);
          }
          if (handleSetHistoryIndex) {
            handleSetHistoryIndex(historyArr.length - 1);
          }
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
        // 打开note后，屏蔽fileChange，不然在note中黏贴也会触发
        const noteEl = document.getElementById("note-editor");
        if (noteEl) {
          return;
        }
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
      let data = treeRef.current.saveNodes();
      dispatch(setDocTreeData(data));
      setTimeout(() => {
        setRootKey(node._key);
        resetMove();
      }, 500);
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
      // 打开note后，屏蔽fileChange，不然在note中黏贴也会触发
      const noteEl = document.getElementById("note-editor");
      if (noteEl) {
        return;
      }

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
      const data = treeRef.current.saveNodes();
      const node = data.data[nodeKey];
      setContextMenuTargetNode(node);
      setContextMenuTargetNodeKey(nodeKey);
      setAnchorEl(event.currentTarget);
    }

    function handleCloseContextMenu() {
      setAnchorEl(null);
      setContextMenuTargetNodeKey("");
      setContextMenuTargetNode(null);
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

    function handleClickIcon(category: string, index: number, batch?: boolean) {
      let iconJson: any = {};
      iconJson[category] = index;
      const selectedIds = treeRef.current.getSelectedIds();
      const data = treeRef.current.saveNodes();
      if (batch && selectedIds.length > 1) {
        const startAdornmentContent = { ...iconJson };
        treeRef.current.updateNodesByIds(data.data, selectedIds, {
          startAdornment: getStartAdornment(
            startAdornmentContent,
            handleClickNodeIcon
          ),
          startAdornmentWidth:
            Object.keys(startAdornmentContent).length * (18 + 2),
          startAdornmentHeight: 18,
          startAdornmentContent,
        });
      } else {
        const id =
          contextMenuTargetNodeKey ||
          treeRef.current.getSelectedId() ||
          treeRef.current.getSelectedIds()[0];
        const node = data.data[id];
        if (node) {
          let startAdornmentContent = node.startAdornmentContent || {};
          startAdornmentContent = { ...startAdornmentContent, ...iconJson };
          treeRef.current.updateNodeById(data.data, id, {
            startAdornment: getStartAdornment(
              startAdornmentContent,
              handleClickNodeIcon
            ),
            startAdornmentWidth:
              Object.keys(startAdornmentContent).length * (18 + 2),
            startAdornmentHeight: 18,
            startAdornmentContent,
          });
        }
      }

      handleCloseIcons();
      setTimeout(() => {
        const svgWrapperElement: any = document.querySelector(".svg-wrapper");
        if (svgWrapperElement) {
          svgWrapperElement.focus();
        }
      }, 500);
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
      const selectedIds = treeRef.current.getSelectedIds();
      if (selectedIds.length > 1) {
        treeRef.current.updateNodesByIds(data.data, selectedIds, {
          imageUrl: url,
          imageWidth,
          imageHeight,
        });
      } else {
        const id =
          contextMenuTargetNodeKey ||
          treeRef.current.getSelectedId() ||
          treeRef.current.getSelectedIds()[0];
        treeRef.current.updateNodeById(data.data, id, {
          imageUrl: url,
          imageWidth,
          imageHeight,
        });
      }
      handleCloseIllustration();
      setTimeout(() => {
        const svgWrapperElement: any = document.querySelector(".svg-wrapper");
        if (svgWrapperElement) {
          svgWrapperElement.focus();
        }
      }, 500);
    }

    async function handleSetLink(url: string, text: string) {
      const nodeKey = treeRef.current.getSelectedId();
      const data = treeRef.current.saveNodes();
      const node = data.data[nodeKey];
      if (!node) return;
      // const res: any = await api.getUrlInfo(url);
      // if (res.status === 200) {

      // }
      // const icon = res.icon;
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
          name: text,
          // imageUrl: icon,
          // imageWidth: 50,
          // imageHeight: 50,
        }
      );
      setLinkAnchorEl(null);
    }

    async function handleChangeNodeText(nodeKey: string, text: string) {
      const urlReg =
        /(([\w-]{1,}\.+)+([a-zA-Z]+)(\/#\/)*\/*[\w\/\?=&%.]*)|(http:\/\/([\w-]{1,}\.+)+([a-zA-Z]+)(\/#\/)*\/*[\w\/\?=&%.]*)|(https:\/\/([\w-]{1,}\.+)+([a-zA-Z]+)(\/#\/)*\/*[\w\/\?=&%.]*)/gm;
      if (urlReg.test(text)) {
        const matchList = text.match(urlReg);
        const data = treeRef.current.saveNodes();
        const node = data.data[nodeKey];
        if (!node) return;
        if (!matchList?.length) return;
        const url = matchList[0];
        // const res: any = await api.getUrlInfo(url);
        // if (res.status === 200) {

        // }
        // const icon = res.icon;
        let endAdornmentContent = node.endAdornmentContent || {};
        endAdornmentContent = {
          ...endAdornmentContent,
          link: { url, text: "" },
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
            name: text,
            // imageUrl: icon,
            // imageWidth: 50,
            // imageHeight: 50,
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
              disabled={readonly}
              singleColumn={viewType.startsWith("single-")}
              handleChange={handleChange}
              itemHeight={48}
              pathWidth={2}
              pathColor={config?.lineColor || (darkMode ? "#FFF" : "#535953")}
              nodeColor={config?.nodeColor || "#e3e3e3"}
              hoverBorderColor={darkMode ? "#FFE4E1" : undefined}
              paddingLeft={1000}
              paddingTop={1000}
              rainbowColor={config?.rainbowColor}
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
              handleChange={handleChange}
              // handleChangeNodeText={(nodeId: string, text: string) =>
              //   handleChangeNodeText(nodeId, text)
              // }
              disabled={readonly}
              pathWidth={2}
              pathColor={config?.lineColor || (darkMode ? "#FFF" : "#535953")}
              nodeColor={config?.nodeColor || "#e3e3e3"}
              // backgroundColor={darkMode ? "#212121" : undefined}
              hoverBorderColor={darkMode ? "#FFE4E1" : undefined}
              selectedBorderColor={darkMode ? "#FF0000" : undefined}
              paddingLeft={1000}
              paddingTop={1000}
              rainbowColor={config?.rainbowColor}
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
        }
      } else {
        return <div></div>;
      }
    }, [
      rootKey,
      treeData,
      darkMode,
      handleChange,
      viewType,
      handlePasteText,
      config,
    ]);

    return (
      <div
        className="editor"
        style={{
          width: "100%",
          height: "100vh",
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
            position: "absolute",
            left: 0,
            top: 0,
          }}
          rightClickToStart={true}
        >
          <div style={{ transform: `scale(${zoomRatio || 1})` }}>{tree}</div>
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
            iconName="a-tongjijiedian1x"
            fontSize={23}
            dividerSize={5}
            style={contextMenuStyle}
            onClick={handleAddChild}
          />
          <IconFontIconButton
            title={t("mind.addNext")}
            iconName="a-xiajijiedian1x"
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

          {contextMenuTargetNode?.endAdornmentContent?.note ? (
            <IconFontIconButton
              title={t("mind.deleteNote")}
              iconName="a-shanchu1x"
              fontSize={23}
              dividerSize={5}
              style={contextMenuStyle}
              onClick={handleDeleteNote}
            />
          ) : null}
          {contextMenuTargetNode?.imageUrl ? (
            <IconFontIconButton
              title={t("mind.deleteImage")}
              iconName="a-shanchu1x"
              fontSize={23}
              dividerSize={5}
              style={contextMenuStyle}
              onClick={handleDeleteImage}
            />
          ) : null}

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
        <IconsMenu
          anchorEl={iconsAnchorEl}
          handleClickIcon={handleClickIcon}
          handleClose={handleCloseIcons}
          handleDelete={handleDeleteIcon}
          iconCategory={iconCategory}
          pin={iconPin}
          handleClickPin={() => {
            setIconPin(!iconPin);
            if (!iconPin) {
              setTabValue("icon");
              setIconsAnchorEl(null);
            }
          }}
        />
        <IllustrationsMenu
          anchorEl={illustrationAnchorEl}
          handleClick={handleClickIllustration}
          handleClose={handleCloseIllustration}
          pin={illPin}
          handleClickPin={() => {
            setIllPin(!illPin);
            if (!illPin) {
              setTabValue("ill");
              setIllustrationAnchorEl(null);
            }
          }}
        />
        <Slide
          direction="right"
          in={iconPin || illPin}
          mountOnEnter
          unmountOnExit
        >
          <Paper
            elevation={3}
            sx={{ position: "absolute", top: "55px", right: "15px" }}
          >
            <Tabs
              value={tabValue}
              onChange={(event: React.SyntheticEvent, newValue: string) =>
                setTabValue(newValue)
              }
            >
              {iconPin ? <Tab label={t("icon.icon")} value="icon" /> : null}
              {illPin ? (
                <Tab label={t("illustration.illustration")} value="ill" />
              ) : null}
            </Tabs>
            <IconButton
              sx={{ position: "absolute", top: "5px", right: "8px" }}
              onClick={() => {
                if (tabValue === "icon") {
                  setTabValue("ill");
                  setIconPin(false);
                }
                if (tabValue === "ill") {
                  setTabValue("icon");
                  setIllPin(false);
                }
              }}
            >
              <Close />
            </IconButton>
            {iconPin && tabValue === "icon" ? (
              <Icons
                handleClickIcon={handleClickIcon}
                handleDelete={handleDeleteIcon}
                iconCategory={iconCategory}
              />
            ) : null}
            {illPin && tabValue === "ill" ? (
              <Illustrations handleClick={handleClickIllustration} />
            ) : null}
          </Paper>
        </Slide>

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
