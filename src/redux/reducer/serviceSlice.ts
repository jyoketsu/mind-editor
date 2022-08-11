import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../utils/api";

interface Api {
  url: string;
  params: object;
  responseName?: string;
  docDataName?: string;
}

interface ServiceState {
  getDataApi: Api | null;
  patchDataApi: Api | null;
  getUptokenApi: Api | null;
  docData: any;
}

const initialState: ServiceState = {
  getDataApi: null,
  patchDataApi: null,
  getUptokenApi: null,
  docData: null,
};

export const getDoc = createAsyncThunk(
  "service/getDoc",
  async (getDataApi: Api) => {
    const res: any = await api.request.get(getDataApi.url, getDataApi.params);
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
  },
  extraReducers: (builder) => {
    builder.addCase(getDoc.fulfilled, (state, action: PayloadAction<any>) => {
      const responseName = state.getDataApi?.responseName;
      const docDataName = state.getDataApi?.docDataName;
      const response = responseName
        ? action.payload[responseName]
        : action.payload.data;
      state.docData = docDataName ? response[docDataName] : response.detail;
    });
  },
});

export const { setApi } = serviceSlice.actions;

export default serviceSlice.reducer;
