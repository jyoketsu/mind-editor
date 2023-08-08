import { Box, Slide, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../redux/hooks";
import { setLoading } from "../../redux/reducer/commonSlice";
import { exportFile, getSearchParamValue } from "../../utils/util";
import {
  getDoc,
  saveDoc,
  setApi,
  setDocData,
} from "../../redux/reducer/serviceSlice";
import Toolbar from "./Toolbar";
import Editor from "./editor";
import NodeToolbar from "./NodeToolbar";
import qiniuUpload from "../../utils/qiniu";
import api from "../../utils/api";

export default function Home() {
  const { t } = useTranslation();
  const location = useLocation();
  const getDataApi = useAppSelector((state) => state.service.getDataApi);
  const getUptokenApi = useAppSelector((state) => state.service.getUptokenApi);
  const changed = useAppSelector((state) => state.service.changed);
  const docData = useAppSelector((state) => state.service.docData);
  const patchDataApi = useAppSelector((state) => state.service.patchDataApi);
  const [viewType, setViewType] = useState<
    "mutil-tree" | "single-tree" | "mutil-mind" | "single-mind"
  >("mutil-tree");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const dispatch = useAppDispatch();
  const editorRef = useRef<any>(null);

  useEffect(() => {
    const viewtype: any = localStorage.getItem("VIEW_TYPE");
    if (viewtype) {
      setViewType(viewtype);
    }
  }, []);

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
  }, []);

  useEffect(() => {
    if (getDataApi) {
      dispatch(getDoc(getDataApi));
    }
  }, [getDataApi]);

  const handleExport = () => {
    if (docData) {
      const root = docData.data[docData.rootKey];
      exportFile(JSON.stringify(docData), `${root.name}.mind`);
    }
  };

  const handleChange = (event: any) => {
    const file = event.target.files[0];
    if (!file || !patchDataApi) return;
    const reader = new FileReader();
    reader.onload = function fileReadCompleted() {
      // console.log(reader.result);
      if (
        reader.result &&
        typeof reader.result === "string" &&
        reader.result.includes("rootKey")
      ) {
        const data = JSON.parse(reader.result);
        dispatch(setDocData(data));
        dispatch(
          saveDoc({
            patchDataApi,
            data,
          })
        );
      }
    };
    reader.readAsText(file);
  };

  const handleAddChild = () => {
    editorRef?.current?.handleAddChild();
  };

  const handleAddNext = () => {
    editorRef?.current?.handleAddNext();
  };

  const handleDelete = () => {
    editorRef?.current?.handleDelete();
  };

  const handleAddNote = () => {
    editorRef?.current?.addNote();
  };

  const handleAddIcon = () => {
    editorRef?.current?.addIcon();
  };

  const handleLink = () => {
    editorRef?.current?.addLink();
  };

  const handleAddIllustration = () => {
    editorRef?.current?.addIllustration();
  };

  const handleClickNode = (node: any) => {
    if (!node) {
      setSelectedIds([]);
    } else if (Array.isArray(node)) {
      setSelectedIds(node.map((item) => item._key));
    } else {
      setSelectedIds([node._key]);
    }
  };

  const handleCheckBox = () => {
    if (selectedIds.length) {
      const res = editorRef.current.getNodes();
      const firstNode = res.data[selectedIds[0]];
      const data = {
        showCheckbox: !firstNode.showCheckbox,
        checked: false,
      };
      editorRef?.current?.updateNodesByIds(res.data, selectedIds, data);
    }
  };

  const handleFileChange = async (files: FileList) => {
    if (!selectedIds.length) return;
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
            dispatch(setLoading(true));
            const url = await qiniuUpload(upToken, file);
            dispatch(setLoading(false));
            if (
              typeof url === "string" &&
              url.startsWith("https://cdn-icare.qingtime.cn/")
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
            alert("error!");
          }
        } else {
          alert("error!");
        }
      }
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "grid",
        gridTemplateRows: "69px 1fr",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          padding: "0 15px",
          boxSizing: "border-box",
          borderBottom: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.head",
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Mind
        </Typography>
        <div style={{ flex: 1 }}></div>
        <Typography
          sx={{ color: "text.secondary", fontSize: "14px", padding: "0 5px" }}
        >
          {changed ? t("mind.changed") : t("mind.saved")}
        </Typography>
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "68px 1fr",
          overflow: "hidden",
        }}
      >
        <Box sx={{ backgroundColor: "background.slide" }}>
          <Slide
            direction="right"
            in={selectedIds.length ? true : false}
            mountOnEnter
            unmountOnExit
          >
            <div style={{ width: "100%", height: "100%" }}>
              <NodeToolbar
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
              />
            </div>
          </Slide>
          <Slide
            direction="right"
            in={!selectedIds.length ? true : false}
            timeout={500}
          >
            <div style={{ width: "100%", height: "100%" }}>
              <Toolbar viewType={viewType} handleSetViewType={setViewType} />
            </div>
          </Slide>
        </Box>
        <Editor
          ref={editorRef}
          viewType={viewType}
          handleClickNode={handleClickNode}
        />
      </Box>
    </Box>
  );
}
