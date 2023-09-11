import "./Note.scss";
import Box from "@mui/material/Box";
import Menu from "@mui/material/Menu";
import { EditorView } from "@tiptap/pm/view";
import { useEditor, EditorContent, JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { useEffect, useState } from "react";
import api from "../../../utils/api";
import qiniuUpload from "../../../utils/qiniu";
import Loading from "../../../components/common/Loading";
import IconFontIconButton from "../../../components/common/IconFontIconButton";

export default function Note({
  anchorEl,
  getUptokenApi,
  handleClose,
  data,
}: {
  anchorEl: null | HTMLElement;
  getUptokenApi: any;
  handleClose: (json: JSONContent) => void;
  data?: JSONContent;
}) {
  const [loading, setLoading] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit, Image],
    content: "<p></p>",
    editorProps: {
      handleDOMEvents: {
        paste(view: EditorView, event: ClipboardEvent) {
          if (event.clipboardData && event.clipboardData.files.length) {
            const text = event.clipboardData?.getData("text/plain");
            if (text) {
              return false;
            }
            event.preventDefault();
            const files = event.clipboardData.files;
            insertFiles(view, files, view.state.selection.to, true);
            return true;
          } else {
            return false;
          }
        },
        drop(view: EditorView, event: DragEvent) {
          const coordinates = view.posAtCoords({
            left: event.clientX,
            top: event.clientY,
          });
          if (
            coordinates &&
            event.dataTransfer &&
            event.dataTransfer.files.length
          ) {
            event.preventDefault();
            const files = event.dataTransfer.files;
            insertFiles(
              view,
              files,
              coordinates.pos,
              view.state.selection.to === coordinates.pos ? true : false
            );
            return true;
          } else {
            return false;
          }
        },
      },
    },
  });

  useEffect(() => {
    if (editor) {
      if (data) {
        editor.commands.setContent(data);
      } else {
        editor.commands.clearContent();
      }
      editor.commands.focus("start");
    }
  }, [data]);

  function closeNote() {
    if (editor) {
      const json = editor.getJSON();
      handleClose(json);
    }
  }

  const insertFiles = async (
    view: EditorView,
    files: FileList,
    pos: number,
    inSelection: boolean
  ) => {
    const { schema } = view.state;
    if (!getUptokenApi) return;
    for (let index = 0; index < files.length; index++) {
      const file = files[index];

      if (!file.type.startsWith("image/")) continue;
      try {
        if (index === 0) {
          setLoading(true);
        }
        const res: any = await api.request.get(getUptokenApi.url, {
          ...getUptokenApi.params,
          ...{ token: api.getToken() },
        });
        if (res.statusCode === "200") {
          const upToken = res.result;
          const url = await qiniuUpload(upToken, file);
          const node = schema.nodes.image.create({
            src: url,
          });
          const transaction = view.state.tr.insert(
            inSelection ? pos + index + 1 : pos + index,
            node
          );
          view.dispatch(transaction);
        }

        if (index === files.length - 1) {
          setLoading(false);
        }
      } catch (e) {
        console.log("---error---", e);
      }
    }
  };

  return (
    <Menu
      anchorEl={anchorEl}
      sx={{ padding: "unset" }}
      open={Boolean(anchorEl)}
      anchorOrigin={{
        vertical: anchorEl?.tagName === "g" ? "bottom" : "top",
        horizontal: anchorEl?.tagName === "g" ? "left" : "right",
      }}
      onClose={closeNote}
    >
      <Box
        sx={{
          width: "40vw",
          height: "50vh",
          padding: "0 15px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {editor ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <IconFontIconButton
              title=""
              iconName="B"
              fontSize={15}
              disabled={!editor.can().chain().focus().toggleBold().run()}
              onClick={() => editor.chain().focus().toggleBold().run()}
            />
            <IconFontIconButton
              title=""
              iconName="a-xieti1x"
              fontSize={15}
              onClick={() => editor.chain().focus().toggleItalic().run()}
              disabled={!editor.can().chain().focus().toggleItalic().run()}
            />
            <IconFontIconButton
              title=""
              iconName="a-s1x"
              fontSize={15}
              onClick={() => editor.chain().focus().toggleStrike().run()}
              disabled={!editor.can().chain().focus().toggleStrike().run()}
            />
            <IconFontIconButton
              title=""
              iconName="a-daima1x"
              fontSize={15}
              onClick={() => editor.chain().focus().toggleCode().run()}
              disabled={!editor.can().chain().focus().toggleCode().run()}
            />

            {/* <button
              onClick={() => editor.chain().focus().unsetAllMarks().run()}
            >
              clear marks
            </button> */}
            {/* <button onClick={() => editor.chain().focus().clearNodes().run()}>
              clear nodes
            </button> */}
            {/* <button
              onClick={() => editor.chain().focus().setParagraph().run()}
              className={editor.isActive("paragraph") ? "is-active" : ""}
            >
              paragraph
            </button> */}
            <IconFontIconButton
              title=""
              iconName="a-youxuliebiao1x"
              fontSize={15}
              onClick={() => editor.chain().focus().toggleBulletList().run()}
            />
            <IconFontIconButton
              title=""
              iconName="a-wuxuliebiao1x"
              fontSize={15}
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
            />
            <IconFontIconButton
              title=""
              iconName="a-daimakuai1x"
              fontSize={15}
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            />
            <IconFontIconButton
              title=""
              iconName="a-yinyong1x"
              fontSize={15}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
            />
            <IconFontIconButton
              title=""
              iconName="a-H11x"
              fontSize={15}
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
            />
            <IconFontIconButton
              title=""
              iconName="a-H21x"
              fontSize={15}
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
            />
            <IconFontIconButton
              title=""
              iconName="a-H31x"
              fontSize={15}
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()
              }
            />

            <IconFontIconButton
              title=""
              iconName="a-H41x"
              fontSize={15}
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 4 }).run()
              }
            />
            <IconFontIconButton
              title=""
              iconName="a-H51x"
              fontSize={15}
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 5 }).run()
              }
            />
            <IconFontIconButton
              title=""
              iconName="a-H61x"
              fontSize={15}
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 6 }).run()
              }
            />
            <IconFontIconButton
              title=""
              iconName="a-fengexian1x"
              fontSize={15}
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
            />

            {/* <button onClick={() => editor.chain().focus().setHardBreak().run()}>
              hard break
            </button> */}
            {/* <button
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().chain().focus().undo().run()}
            >
              undo
            </button> */}
            {/* <button
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().chain().focus().redo().run()}
            >
              redo
            </button> */}
            {/* <button
              onClick={() => editor.chain().focus().setColor("#958DF1").run()}
              className={
                editor.isActive("textStyle", { color: "#958DF1" })
                  ? "is-active"
                  : ""
              }
            >
              purple
            </button> */}
          </Box>
        ) : null}
        <div id="note-editor" style={{ flex: 1, overflow: "auto" }}>
          <EditorContent editor={editor} />
        </div>

        {loading ? <Loading /> : null}
      </Box>
    </Menu>
  );
}
