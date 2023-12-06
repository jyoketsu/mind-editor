import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { getDoc } from "../../redux/reducer/serviceSlice";

export default function TaskStat({
  open,
  handleClose,
}: {
  open: boolean;
  handleClose: () => void;
}) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const docData = useAppSelector((state) => state.service.docData);
  const getDataApi = useAppSelector((state) => state.service.getDataApi);
  const changed = useAppSelector((state) => state.service.changed);
  const [totalTask, setTotalTask] = useState(0);
  const [completed, setCompleted] = useState(0);

  useEffect(() => {
    if (getDataApi && open && !changed) {
      dispatch(getDoc(getDataApi));
    }
  }, [getDataApi, open, changed]);

  useEffect(() => {
    let totalTask = 0;
    let completed = 0;
    if (docData?.data) {
      const keys = Object.keys(docData.data);
      for (let index = 0; index < keys.length; index++) {
        const key = keys[index];
        const node = docData.data[key];
        if (node.showCheckbox) {
          totalTask++;
          if (node.checked) {
            completed++;
          }
        }
      }
    }
    setTotalTask(totalTask);
    setCompleted(completed);
  }, [docData]);

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute" as "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          boxShadow: 24,
          padding: "15px",
          borderRadius: "8px",
        }}
      >
        <Typography id="transition-modal-title" variant="h5" component="h2">
          {t("toolBar.taskStat")}
        </Typography>
        <Typography sx={{ mt: 2 }}>{`${t(
          "toolBar.completed"
        )}: ${completed}`}</Typography>
        <Typography sx={{ mt: 2 }}>{`${t(
          "toolBar.totalTask"
        )}: ${totalTask}`}</Typography>
      </Box>
    </Modal>
  );
}
