import { Head, router, usePage, Link } from "@inertiajs/react";
import { useState } from "react";

export default function Index({ documents }) {
    const { auth } = usePage().props;

    const [title, setTitle] = useState("");
    const [search, setSearch] = useState("");

    const createDocument = () => {
        if (!title) return;

        router.post("/documents", {
            title,
        });

        setTitle("");
    };

    const filteredDocuments = documents.filter((doc) =>
        doc.title.toLowerCase().includes(search.toLowerCase()),
    );

    return (
        <>
            <Head title="Documents" />

            <div className="dashboard">
                <div className="dashboard-header">
                    <div>
                        <h1>My Documents</h1>
                        <p>Create and collaborate in real-time</p>
                    </div>

                    <div className="dashboard-user">
                        <div className="user-badge">
                            {auth.user.name.charAt(0).toUpperCase()}
                        </div>

                        <span>{auth.user.name}</span>

                        <Link
                            href={route("logout")}
                            method="post"
                            as="button"
                            className="logout-btn"
                        >
                            Logout
                        </Link>
                    </div>
                </div>

                <div className="dashboard-top">
                    <input
                        type="text"
                        placeholder="Search documents..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <div className="create-box">
                        <input
                            type="text"
                            placeholder="Document title..."
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />

                        <button onClick={createDocument}>+ New Document</button>
                    </div>
                </div>

                <div className="document-grid">
                    {filteredDocuments.map((doc) => (
                        <div
                            key={doc.id}
                            className="document-card"
                            onClick={() =>
                                router.visit(`/documents/${doc.id}/edit`)
                            }
                        >
                            <h3>{doc.title}</h3>

                            <p>
                                Created:{" "}
                                {new Date(doc.created_at).toLocaleString()}
                            </p>

                            <button
                                className="history-btn"
                                onClick={(e) => {
                                    e.stopPropagation();

                                    router.visit(
                                        `/documents/${doc.id}/versions`,
                                    );
                                }}
                            >
                                Version History
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
