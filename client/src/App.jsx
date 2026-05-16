import { useCallback, useEffect, useRef, useState } from "react";
import ReactQuill from "react-quill-new";
import { io } from "socket.io-client";

import "react-quill-new/dist/quill.snow.css";
import "./App.css";

const SAVE_INTERVAL_MS = 2000;
const DOCUMENT_ID = "document-1";
const USER_NAME = "User " + Math.floor(Math.random() * 1000);

function App() {
  const [socket, setSocket] = useState(null);
  const [value, setValue] = useState("");
  const [remoteCursor, setRemoteCursor] = useState(null);

  const quillRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const s = io("http://localhost:3001");
    setSocket(s);

    return () => s.disconnect();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.emit("get-document", DOCUMENT_ID);

    socket.once("load-document", (document) => {
      setValue(document);
    });
  }, [socket]);

  const sendCursorPosition = useCallback(() => {
    if (!socket) return;

    const editor = quillRef.current?.getEditor();
    if (!editor) return;

    const range = editor.getSelection();
    if (!range) return;

    socket.emit("send-cursor", {
      range,
      name: USER_NAME,
      color: "red",
    });
  }, [socket]);

  const handleChange = useCallback(
    (content, delta, source) => {
      setValue(content);

      if (source !== "user") return;
      if (!socket) return;

      socket.emit("send-changes", content);
      sendCursorPosition();
    },
    [socket, sendCursorPosition],
  );

  useEffect(() => {
    if (!socket) return;

    const handler = (content) => {
      setValue(content);
    };

    socket.on("receive-changes", handler);

    return () => socket.off("receive-changes", handler);
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const interval = setInterval(() => {
      sendCursorPosition();
    }, 300);

    return () => clearInterval(interval);
  }, [socket, sendCursorPosition]);

  useEffect(() => {
    if (!socket) return;

    const handler = ({ range, name, color }) => {
      const editor = quillRef.current?.getEditor();
      const wrapper = wrapperRef.current;

      if (!editor || !wrapper || !range) return;

      const bounds = editor.getBounds(range.index);
      const editorRect = editor.root.getBoundingClientRect();
      const wrapperRect = wrapper.getBoundingClientRect();

      setRemoteCursor({
        name,
        color,
        left: editorRect.left - wrapperRect.left + bounds.left,
        top: editorRect.top - wrapperRect.top + bounds.top,
        height: bounds.height,
      });
    };

    socket.on("receive-cursor", handler);

    return () => socket.off("receive-cursor", handler);
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const interval = setInterval(() => {
      socket.emit("save-document", value);
    }, SAVE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [socket, value]);

  return (
    <div className="container">
      <h1>Realtime Collaborative Editor</h1>

      <p className="username">You are: {USER_NAME}</p>

      <div className="editor-wrapper" ref={wrapperRef}>
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={value}
          onChange={handleChange}
        />

        {remoteCursor && (
          <div
            className="live-cursor"
            style={{
              left: remoteCursor.left,
              top: remoteCursor.top,
              height: remoteCursor.height,
              backgroundColor: remoteCursor.color,
            }}
          >
            <span style={{ backgroundColor: remoteCursor.color }}>
              {remoteCursor.name}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
