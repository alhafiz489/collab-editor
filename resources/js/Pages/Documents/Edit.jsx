import { Head, router, usePage } from "@inertiajs/react";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import ReactQuill from "react-quill";

import "react-quill/dist/quill.snow.css";

export default function Edit({ document }) {
    const { auth } = usePage().props;

    const [content, setContent] = useState(document.content || "");
    const [saving, setSaving] = useState(false);
    const [remoteMouse, setRemoteMouse] = useState(null);

    const channelRef = useRef(null);
    const remoteUpdate = useRef(false);
    const saveTimer = useRef(null);

    useEffect(() => {
        const channel = window.Echo.private(`document.${document.id}`);

        channelRef.current = channel;

        channel.listenForWhisper("typing", (event) => {
            remoteUpdate.current = true;
            setContent(event.content || "");
        });

        channel.listenForWhisper("mouse", (event) => {
            setRemoteMouse(event);
        });

        return () => {
            window.Echo.leave(`document.${document.id}`);
        };
    }, [document.id]);

    const sendMousePosition = (e) => {
        channelRef.current?.whisper("mouse", {
            x: e.clientX,
            y: e.clientY,
            name: auth.user.name,
        });
    };

    const handleChange = (value, delta, source) => {
        setContent(value);

        if (remoteUpdate.current) {
            remoteUpdate.current = false;
            return;
        }

        if (source !== "user") return;

        channelRef.current?.whisper("typing", {
            content: value,
        });

        clearTimeout(saveTimer.current);

        saveTimer.current = setTimeout(() => {
            saveDocument(value);
        }, 2000);
    };

    const saveDocument = async (latestContent) => {
        setSaving(true);

        await axios.put(`/documents/${document.id}`, {
            content: latestContent,
        });

        setSaving(false);
    };

    return (
        <>
            <Head title={document.title} />

            <div className="editor-page" onMouseMove={sendMousePosition}>
                <div className="editor-header">
                    <div>
                        <button
                            className="back-btn"
                            onClick={() => router.visit("/documents")}
                        >
                            ← Back
                        </button>

                        <h1>{document.title}</h1>
                    </div>

                    <div>
                        <button
                            className="history-btn"
                            onClick={() =>
                                router.visit(
                                    `/documents/${document.id}/versions`,
                                )
                            }
                        >
                            Version History
                        </button>

                        <span className="save-status">
                            {saving ? "Saving..." : "Saved"}
                        </span>
                    </div>
                </div>

                <div className="editor-wrapper">
                    <ReactQuill
                        theme="snow"
                        value={content}
                        onChange={handleChange}
                    />
                </div>

                {remoteMouse && (
                    <div
                        className="remote-mouse"
                        style={{
                            left: remoteMouse.x,
                            top: remoteMouse.y,
                        }}
                    >
                        <span>{remoteMouse.name}</span>
                    </div>
                )}
            </div>
        </>
    );
}
