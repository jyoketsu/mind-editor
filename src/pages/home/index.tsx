import {
  Box,
  IconButton,
  Menu,
  Slide,
  Typography,
  Fade,
  createTheme,
  Card,
} from "@mui/material";
import KeyboardIcon from "@mui/icons-material/Keyboard";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../redux/hooks";
import { setDark, setLoading } from "../../redux/reducer/commonSlice";
import {
  convert2Md,
  convert2Opml,
  convert2Text,
  exportFile,
  getSearchParamValue,
  isColorDark,
  isImageDarkOrLight,
  opml2json,
} from "../../utils/util";
import {
  TreeData,
  getDoc,
  saveDoc,
  setApi,
  setChanged,
  setDocData,
  setQiniuRegion,
  setQiniuDomain,
} from "../../redux/reducer/serviceSlice";
import Toolbar from "./Toolbar";
import Editor from "./editor";
import NodeToolbar from "./NodeToolbar";
import qiniuUpload from "../../utils/qiniu";
import api from "../../utils/api";
import Config from "../../interface/Config";
import ShortcutDialog from "./Shortcut";
import _, { set } from "lodash";
import "./GlobalCssMenu.css";

const isMac = /macintosh|mac os x/i.test(navigator.userAgent);
let timeout: NodeJS.Timeout;

export default function Home() {
  const { t } = useTranslation();
  const location = useLocation();
  const getDataApi = useAppSelector((state) => state.service.getDataApi);
  const getUptokenApi = useAppSelector((state) => state.service.getUptokenApi);
  const changed = useAppSelector((state) => state.service.changed);
  const docData = useAppSelector((state) => state.service.docData);
  const patchDataApi = useAppSelector((state) => state.service.patchDataApi);
  const qiniuDomain = useAppSelector((state) => state.service.qiniuDomain);
  const qiniuRegion = useAppSelector((state) => state.service.qiniuRegion);

  const [viewType, setViewType] = useState<string>(
    localStorage.getItem("VIEW_TYPE") || "mutil-tree"
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const dispatch = useAppDispatch();
  const editorRef = useRef<any>(null);
  const [config, setConfig] = useState<Config | null>(null);
  const [shortcutVisible, setShortcutVisible] = useState(false);
  const [history, setHistory] = useState<TreeData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  // const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mode, setMode] = useState<"normal" | "simple">(
    window.self !== window.top
      ? "simple"
      : (localStorage.getItem("MODE") as "normal" | "simple") || "normal"
  );

  useEffect(() => {
    editorRef?.current?.resetMove();
    localStorage.setItem("VIEW_TYPE", viewType);
  }, [viewType]);

  useEffect(() => {
    const token = getSearchParamValue(location.search, "token");
    const getDataApiQuery = getSearchParamValue(location.search, "getDataApi");
    const patchDataApiQuery = getSearchParamValue(
      location.search,
      "patchDataApi"
    );
    const getUptokenApiQuery = getSearchParamValue(
      location.search,
      "getUptokenApi"
    );
    if (token && getDataApiQuery && patchDataApiQuery && getUptokenApiQuery) {
      const getDataApi = JSON.parse(decodeURIComponent(getDataApiQuery));
      const patchDataApi = JSON.parse(decodeURIComponent(patchDataApiQuery));
      const getUptokenApi = JSON.parse(decodeURIComponent(getUptokenApiQuery));
      dispatch(
        setApi({
          getDataApi,
          patchDataApi,
          getUptokenApi,
          token,
        })
      );
    }

    const qiniuRegion = getSearchParamValue(location.search, "qiniuRegion");
    if (qiniuRegion) {
      dispatch(setQiniuRegion(qiniuRegion));
    }
    const qiniuDomain = getSearchParamValue(location.search, "qiniuDomain");
    if (qiniuDomain) {
      dispatch(setQiniuDomain(qiniuDomain));
    }
  }, [viewType]);

  useEffect(() => {
    if (getDataApi) {
      dispatch(getDoc(getDataApi));
    }
  }, [getDataApi]);

  useEffect(() => {
    if (docData?.config) {
      setConfig(docData.config);
      if (localStorage.getItem("DARK") === null) {
        const background = docData.config.background;
        if (/^#[a-zA-Z0-9]*/gm.test(background)) {
          const isDark = isColorDark(background);
          if (isDark) {
            dispatch(setDark(true));
          } else {
            dispatch(setDark(false));
          }
        } else {
          isImageDarkOrLight(background, (isDark: boolean) => {
            if (isDark) {
              dispatch(setDark(true));
            } else {
              dispatch(setDark(false));
            }
          });
        }
      }
    }
    if (docData && history.length === 0) {
      setHistory([_.cloneDeep(docData)]);
      setHistoryIndex(0);
    }
  }, [docData]);

  const handleExport = (type?: string) => {
    const data = editorRef.current.getNodes();
    // if (config) {
    //   data.config = config;
    // }
    if (data) {
      const root = data.data[data.rootKey];
      if (type === "opml") {
        const xml = convert2Opml(data);
        exportFile(xml, `${root.name}.opml`);
      } else if (type === "txt") {
        const str = convert2Text(data);
        exportFile(str, `${root.name}.txt`, "text/plain");
      } else if (type === "md") {
        const str = convert2Md(data);
        exportFile(str, `${root.name}.md`, "text/markdown");
      } else {
        exportFile(JSON.stringify(data), `${root.name}.mind`, "text/xml");
      }
    }
  };

  const handleChange = (type: string, event: any) => {
    const file = event.target.files[0];
    if (!file || !patchDataApi) return;
    const reader = new FileReader();
    reader.onload = function fileReadCompleted() {
      // console.log(reader.result);
      if (reader.result && typeof reader.result === "string") {
        let data;
        if (type === "file" && reader.result.includes("rootKey")) {
          data = JSON.parse(reader.result);
        }
        if (type === "opml") {
          data = opml2json(reader.result);
        }
        if (data) {
          dispatch(setDocData(data));
          dispatch(
            saveDoc({
              patchDataApi,
              data,
            })
          );
        }
      }
    };
    reader.readAsText(file);
  };

  const handleAddChild = () => {
    // setAnchorEl(null);
    editorRef?.current?.handleAddChild();
  };

  const handleAddNext = () => {
    // setAnchorEl(null);
    editorRef?.current?.handleAddNext();
  };

  const handleDelete = () => {
    // setAnchorEl(null);
    editorRef?.current?.handleDelete();
  };

  const handleAddNote = (anchorEl?: HTMLElement) => {
    editorRef?.current?.addNote(anchorEl);
  };

  const handleAddIcon = (anchorEl?: HTMLElement) => {
    editorRef?.current?.addIcon(anchorEl);
  };

  const handleLink = (anchorEl?: HTMLElement) => {
    editorRef?.current?.addLink(anchorEl);
  };

  const handleAddIllustration = (anchorEl?: HTMLElement) => {
    editorRef?.current?.addIllustration(anchorEl);
  };

  const handleClickNode = (node: any) => {
    if (!node) {
      setSelectedIds([]);
    } else if (Array.isArray(node)) {
      setSelectedIds(node.map((item) => item._key));
      // if (mode === "simple") {
      //   setAnchorEl(document.getElementById(`tree-node-${node[0]._key}`));
      // }
    } else {
      setSelectedIds([node._key]);
      // if (mode === "simple") {
      //   setAnchorEl(document.getElementById(`tree-node-${node._key}`));
      // }
    }
  };

  const handleCheckBox = () => {
    editorRef.current.setCheckBox();
  };

  const handleBack = () => {
    editorRef.current.clearSelectedNodes();
    setSelectedIds([]);
  };

  const handleUpdateNode = (key: string, value?: string) => {
    const selectedIds = editorRef.current.getSelectedIds();
    if (selectedIds.length) {
      const res = editorRef.current.getNodes();
      const firstNode = res.data[selectedIds[0]];
      const data: { [_key: string]: string | boolean | undefined } = {};
      if (key === "color") {
        data[key] = value;
      } else if (key === "textDecoration") {
        if (firstNode[key] === "underline") {
          delete data[key];
        } else {
          data[key] = "underline";
        }
      } else {
        data[key] = !firstNode[key];
      }
      editorRef?.current?.updateNodesByIds(res.data, selectedIds, data);
    }
  };

  const handleFileChange = async (files: FileList) => {
    const selectedIds = editorRef.current.getSelectedIds();
    if (!selectedIds.length) return;
    const file = files[0];
    if (file.type.startsWith("image/")) {
      if (getUptokenApi) {
        const res: any = await api.request.get(getUptokenApi.url, {
          ...getUptokenApi.params,
          ...{ token: api.getToken() },
        });
        if (res.statusCode === "200" || res.status === 200) {
          const upToken = res.statusCode ? res.result : res.data;
          try {
            dispatch(setLoading(true));
            const url = await qiniuUpload(
              upToken,
              file,
              qiniuRegion,
              qiniuDomain
            );
            dispatch(setLoading(false));
            if (
              typeof url === "string" &&
              url.startsWith(qiniuDomain || "https://cdn-icare.qingtime.cn/")
            ) {
              let img = new Image();
              img.src = url;
              img.onload = async () => {
                const height = 200 / (img.width / img.height);
                const data = editorRef.current.getNodes();
                const patchData = {
                  imageUrl: url,
                  imageWidth: 200,
                  imageHeight: height,
                };
                editorRef?.current?.updateNodesByIds(
                  data.data,
                  selectedIds,
                  patchData
                );
              };
            }
          } catch (error) {
            console.log("---error---", error);
            alert("error!");
          }
        } else {
          console.log("---error!!!---", res);
          alert("error!");
        }
      }
    }
  };

  const handleSetConfig = (config: Config) => {
    setConfig(config);
  };

  const handleSave = () => {
    clearTimeout(timeout);
    dispatch(setChanged(true));
    timeout = setTimeout(() => {
      const data = editorRef.current.getNodes();
      if (config) {
        data.config = config;
      }
      if (data && patchDataApi) {
        dispatch(
          saveDoc({
            patchDataApi,
            data,
          })
        );
      }
    }, 2000);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      dispatch(setDocData(history[historyIndex - 1]));
      setHistoryIndex(historyIndex - 1);
      handleSave();
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      dispatch(setDocData(history[historyIndex + 1]));
      setHistoryIndex(historyIndex + 1);
      handleSave();
    }
  };

  function handleKeyDown(event: React.KeyboardEvent) {
    const commandKey = isMac ? event.metaKey : event.ctrlKey;
    if (commandKey) {
      if (event.key === "z") {
        if (event.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
    }
  }

  function exportImage(type: "svg" | "png" | "pdf") {
    editorRef.current.exportImage(type);
  }

  function handleToggleMode() {
    const newMode = mode === "normal" ? "simple" : "normal";
    localStorage.setItem("MODE", newMode);
    setMode(newMode);
  }

  const nodeToolbar = (
    <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
      <NodeToolbar
        selectedIds={selectedIds}
        mode={mode}
        handleCheckBox={handleCheckBox}
        handleAddChild={handleAddChild}
        handleAddNext={handleAddNext}
        handleAddNote={handleAddNote}
        handleAddIcon={handleAddIcon}
        handleAddIllustration={handleAddIllustration}
        handleFileChange={(files: FileList) => handleFileChange(files)}
        handleDelete={handleDelete}
        handleExport={handleExport}
        handleImport={handleChange}
        handleLink={handleLink}
        handleUpdateNode={handleUpdateNode}
        handleBack={handleBack}
      />
    </div>
  );
  const toolBar = (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <Toolbar
        viewType={viewType}
        config={config}
        undoDisabled={historyIndex === 0 || historyIndex === -1 ? true : false}
        redoDisabled={
          historyIndex === -1 || historyIndex + 1 === history.length
            ? true
            : false
        }
        mode={mode}
        handleSetViewType={setViewType}
        handleSetConfig={handleSetConfig}
        handleUndo={handleUndo}
        handleRedo={handleRedo}
        handleExport={handleExport}
        handleImport={handleChange}
        exportImage={exportImage}
        handleToggleMode={handleToggleMode}
      />
    </div>
  );

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        // display: "grid",
        // gridTemplateRows: "48px 1fr",
        // overflow: "hidden",
        background: config?.background
          ? /^#[a-zA-Z0-9]*/gm.test(config.background)
            ? config.background
            : `url("${config.background}")`
          : "unset",
        backgroundColor: config?.background ? undefined : "background.default",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div onKeyDown={handleKeyDown}>
        <Editor
          ref={editorRef}
          readonly={false}
          viewType={viewType}
          config={config}
          history={history}
          historyIndex={historyIndex}
          handleSetHistory={setHistory}
          handleSetHistoryIndex={setHistoryIndex}
          handleClickNode={handleClickNode}
        />
        <Box
          sx={{
            position: "absolute",
            top: mode === "normal" ? "14px" : undefined,
            bottom: mode === "simple" ? "14px" : undefined,
            left: "17px",
            width: "58px",
            height: mode === "normal" ? "calc(100% - 28px)" : undefined,
            overflow: "hidden",
            backgroundColor: "background.paper",
            backdropFilter: "blur(18px) brightness(0.9)",
            boxShadow: 2,
            borderRadius: "8px",
          }}
        >
          {mode === "normal"
            ? [
                <Slide
                  key="nodeToolBar"
                  direction="right"
                  in={selectedIds.length ? true : false}
                  mountOnEnter
                  unmountOnExit
                >
                  {nodeToolbar}
                </Slide>,
                <Slide
                  key="toolBar"
                  direction="right"
                  in={!selectedIds.length ? true : false}
                  timeout={500}
                  mountOnEnter
                  unmountOnExit
                >
                  {toolBar}
                </Slide>,
              ]
            : toolBar}
        </Box>
        <Box sx={{ position: "absolute", top: "15px", right: "15px" }}>
          <Typography
            sx={{ color: "text.secondary", fontSize: "14px", padding: "0 5px" }}
          >
            {changed ? t("mind.changed") : t("mind.saved")}
          </Typography>
        </Box>
        <IconButton
          sx={{ position: "absolute", bottom: "15px", right: "15px" }}
          onClick={() => setShortcutVisible(true)}
        >
          <KeyboardIcon />
        </IconButton>
        <ShortcutDialog
          open={shortcutVisible}
          handleClose={() => setShortcutVisible(false)}
        />
        {/* {mode === "simple" ? (
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            onClose={() => setAnchorEl(null)}
          >
            <NodeToolbar
              selectedIds={selectedIds}
              mode={mode}
              handleCheckBox={handleCheckBox}
              handleAddChild={handleAddChild}
              handleAddNext={handleAddNext}
              handleAddNote={handleAddNote}
              handleAddIcon={handleAddIcon}
              handleAddIllustration={handleAddIllustration}
              handleFileChange={(files: FileList) => handleFileChange(files)}
              handleDelete={handleDelete}
              handleExport={handleExport}
              handleImport={handleChange}
              handleLink={handleLink}
              handleUpdateNode={handleUpdateNode}
              handleBack={handleBack}
              horizontal={true}
            />
          </Menu>
        ) : null} */}
        {mode === "simple" ? (
          <i
            style={{
              position: "absolute",
              left: "29px",
              top: "8px",
              width: "32px",
              height: "32px",
              backgroundImage: "url('/logo/logo.svg')",
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              marginTop: "4px",
              marginBottom: "8px",
            }}
          />
        ) : null}
      </div>
      {mode === "simple" ? (
        <Card
          sx={{
            position: "absolute",
            left: 0,
            right: 0,
            margin: "auto",
            bottom: "55px",
            width: "fit-content",
          }}
        >
          <NodeToolbar
            selectedIds={selectedIds}
            mode={mode}
            handleCheckBox={handleCheckBox}
            handleAddChild={handleAddChild}
            handleAddNext={handleAddNext}
            handleAddNote={handleAddNote}
            handleAddIcon={handleAddIcon}
            handleAddIllustration={handleAddIllustration}
            handleFileChange={(files: FileList) => handleFileChange(files)}
            handleDelete={handleDelete}
            handleExport={handleExport}
            handleImport={handleChange}
            handleLink={handleLink}
            handleUpdateNode={handleUpdateNode}
            handleBack={handleBack}
            horizontal={true}
          />
        </Card>
      ) : null}
    </Box>
  );
}
