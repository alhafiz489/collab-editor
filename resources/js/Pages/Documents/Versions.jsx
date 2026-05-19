import { Head, router } from "@inertiajs/react";

export default function Versions({ document, versions }) {
    return (
        <>
            <Head title="Version History" />

            <div className="versions-page">
                <div className="versions-header">
                    <div>
                        <button
                            className="back-btn"
                            onClick={() =>
                                router.visit(`/documents/${document.id}/edit`)
                            }
                        >
                            ← Back
                        </button>

                        <h1>{document.title}</h1>

                        <p>Version History</p>
                    </div>
                </div>

                <div className="versions-list">
                    {versions.map((version) => (
                        <div key={version.id} className="version-card">
                            <div className="version-top">
                                <h3>Version #{version.id}</h3>

                                <span>
                                    {new Date(
                                        version.created_at,
                                    ).toLocaleString()}
                                </span>
                            </div>

                            <div className="version-content">
                                {version.content
                                    ? version.content
                                          .replace(/<[^>]+>/g, "")
                                          .slice(0, 300)
                                    : "No content"}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
