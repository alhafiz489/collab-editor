import { useCallback, useEffect, useState } from "react";
import ReactQuill from "react-quill-new";
import { io } from "socket.io-client";

import "react-quill-new/dist/quill.snow.css";
import "./App.css";

const SAVE_INTERVAL_MS = 2000;
const DOCUMENT_ID = "document-1";

function App() {
  const [socket, setSocket] = useState(null);
  const [value, setValue] = useState("");

  useEffect(() => {
    const s = io("http://localhost:3001");
    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.emit("get-document", DOCUMENT_ID);

    socket.once("load-document", (document) => {
      setValue(document);
    });
  }, [socket]);

  const handleChange = useCallback(
    (content, delta, source) => {
      setValue(content);

      if (source !== "user") return;
      if (!socket) return;

      socket.emit("send-changes", content);
    },
    [socket],
  );

  useEffect(() => {
    if (!socket) return;

    const handler = (content) => {
      setValue(content);
    };

    socket.on("receive-changes", handler);

    return () => {
      socket.off("receive-changes", handler);
    };
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

      <ReactQuill theme="snow" value={value} onChange={handleChange} />
    </div>
  );
}

export default App;
