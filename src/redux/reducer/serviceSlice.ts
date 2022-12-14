import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import NodeMap from "tree-graph-react/dist/interfaces/NodeMap";
import api from "../../utils/api";
import { guid } from "../../utils/util";

interface Api {
  url: string;
  params: object;
  responseName?: string;
  docDataName?: string;
}

interface TreeData {
  rootKey: string;
  data: NodeMap;
}

interface ServiceState {
  getDataApi: Api | null;
  patchDataApi: Api | null;
  getUptokenApi: Api | null;
  docData: TreeData | null;
  changed: boolean;
}

const initialState: ServiceState = {
  getDataApi: null,
  patchDataApi: null,
  getUptokenApi: null,
  docData: null,
  changed: false,
};

export const getDoc = createAsyncThunk(
  "service/getDoc",
  async (getDataApi: Api) => {
    const res: any = await api.request.get(getDataApi.url, getDataApi.params);
    return res;
  }
);

export const saveDoc = createAsyncThunk(
  "service/saveDoc",
  async (params: { patchDataApi: Api; data: TreeData }) => {
    const dataParam: any = {};
    dataParam[params.patchDataApi.docDataName || "detail"] = params.data;
    const res: any = await api.request.patch(params.patchDataApi.url, {
      ...params.patchDataApi.params,
      ...dataParam,
    });
    return res;
  }
);

export const serviceSlice = createSlice({
  name: "service",
  initialState,
  reducers: {
    setApi: (
      state,
      action: PayloadAction<{
        getDataApi: Api;
        patchDataApi: Api;
        getUptokenApi: Api;
        token: string;
      }>
    ) => {
      state.getDataApi = action.payload.getDataApi;
      state.patchDataApi = action.payload.patchDataApi;
      state.getUptokenApi = action.payload.getUptokenApi;
      api.setToken(action.payload.token);
    },
    setChanged: (state, action: PayloadAction<boolean>) => {
      state.changed = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getDoc.fulfilled, (state, action: PayloadAction<any>) => {
      const responseName = state.getDataApi?.responseName;
      const docDataName = state.getDataApi?.docDataName;
      const response = responseName
        ? action.payload[responseName]
        : action.payload.data;
      const data = docDataName ? response[docDataName] : response.detail;
      if (data) {
        state.docData = data;
      } else {
        const defaultData = getDefaultData();
        state.docData = defaultData;
      }
    });
    builder.addCase(saveDoc.fulfilled, (state, action: PayloadAction<any>) => {
      state.changed = false;
    });
  },
});

export const { setApi, setChanged } = serviceSlice.actions;

export default serviceSlice.reducer;

const getDefaultData = () => {
  let data: any = {};
  const defaultRootKey = guid(8, 16);
  const childId1 = guid(8, 16);
  const childId2 = guid(8, 16);
  const childId3 = guid(8, 16);
  data[defaultRootKey] = {
    _key: defaultRootKey,
    name: "untitled",
    father: "",
    sortList: [childId1, childId2, childId3],
  };
  data[childId1] = {
    _key: childId1,
    name: "untitled",
    father: defaultRootKey,
    sortList: [],
  };
  data[childId2] = {
    _key: childId2,
    name: "untitled",
    father: defaultRootKey,
    sortList: [],
  };
  data[childId3] = {
    _key: childId3,
    name: "untitled",
    father: defaultRootKey,
    sortList: [],
  };
  return { rootKey: defaultRootKey, data };
};
