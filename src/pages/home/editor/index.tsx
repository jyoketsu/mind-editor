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
import { getStartAdornment, getEndAdornment } from "./components";
import Illustrations from "./Illustrations";
import Link from "./Link";
import Config from "../../../interface/Config";

let timeout: NodeJS.Timeout;
let configLoaded = false;

const Editor = React.forwardRef(
  (
    {
      viewType,
      config,
      handleClickNode,
    }: {
      viewType: string;
      config: Config | null;
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
    const [illustrationAnchorEl, setIllustrationAnchorEl] =
      useState<null | HTMLElement>(null);
    const [linkAnchorEl, setLinkAnchorEl] = useState<null | HTMLElement>(null);
    const [initUrl, setInitUrl] = useState("");
    const [initText, setInitText] = useState("");

    useImperativeHandle(ref, () => ({
      handleAddChild,
      handleAddNext,
      handleDelete,
      resetMove,
      addNote,
      addIcon,
      addIllustration,
      addLink,
      getSelectedIds: () => treeRef.current.getSelectedIds(),
      getNodes: () => treeRef.current.saveNodes(),
      updateNodesByIds: (nodes: NodeMap, ids: string[], data: any) => {
        treeRef?.current?.updateNodesByIds(nodes, ids, data);
      },
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
    }, [treeData, config]);

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
          handleChange();
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

    function addNote() {
      const nodeKey =
        treeRef.current.getSelectedId() || treeRef.current.getSelectedIds()[0];
      setContextMenuTargetNodeKey(nodeKey);
      handleAddNote(nodeKey);
    }

    function addIcon() {
      const nodeKey =
        treeRef.current.getSelectedId() || treeRef.current.getSelectedIds()[0];
      setContextMenuTargetNodeKey(nodeKey);
      handleOpenIcon(nodeKey);
    }

    function addIllustration() {
      const nodeKey =
        treeRef.current.getSelectedId() || treeRef.current.getSelectedIds()[0];
      setContextMenuTargetNodeKey(nodeKey);
      handleOpenIllustration(nodeKey);
    }

    function addLink() {
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
        document.getElementById(
          `tree-node-${nodeKey || contextMenuTargetNodeKey}`
        )
      );
    }

    function handleAddNote(nodeKey?: string) {
      const data = treeRef.current.saveNodes();
      const node = data.data[nodeKey || contextMenuTargetNodeKey];
      if (!node) return;
      let endAdornmentContent = node.endAdornmentContent || {};
      if (!endAdornmentContent.note) {
        endAdornmentContent = { ...endAdornmentContent, note: <p></p> };
      }
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
      handleCloseContextMenu();
    }

    function handleDeleteNote() {
      const data = treeRef.current.saveNodes();
      treeRef.current.updateNodeById(data.data, contextMenuTargetNodeKey, {
        endAdornment: undefined,
        endAdornmentWidth: undefined,
        endAdornmentHeight: undefined,
        endAdornmentContent: null,
      });
      handleCloseContextMenu();
    }

    function handleOpenNote(nodeKey: string, event: any) {
      const data = treeRef.current.saveNodes();
      const node = data.data[nodeKey];
      if (node) {
        setNote(node.endAdornmentContent?.note);
        setContextMenuTargetNodeKey(nodeKey);
        setNoteAnchorEl(event.currentTarget);
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
      setContextMenuTargetNodeKey(nodeKey);
      handleOpenIcon(nodeKey);
    }

    function handleOpenIllustration(nodeKey?: string) {
      setIllustrationAnchorEl(
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
              blockHeight={30}
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
              blockHeight={30}
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
          <Divider />
          <MenuItem onClick={() => handleOpenIcon()}>{t("icon.icon")}</MenuItem>
          <MenuItem onClick={() => handleOpenIllustration()}>
            {t("illustration.illustration")}
          </MenuItem>
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
          <Divider />
          <MenuItem onClick={handleDeleteNote}>{t("mind.deleteNote")}</MenuItem>
          <MenuItem onClick={handleDeleteImage}>
            {t("mind.deleteImage")}
          </MenuItem>
          <MenuItem onClick={handleDelete}>{t("mind.delete")}</MenuItem>
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
      </Box>
    );
  }
);

export default Editor;
