import FileStatus from "../types/file-status";

export default function FileSelectErrorDialog(props: {
    handleClose: () => void;
    duplicate_new_files: FileStatus[];
    duplicate_new_old_files: FileStatus[];
}) {
    const { handleClose, duplicate_new_files, duplicate_new_old_files } = props;

    return (
        <section className="backdrop">
            <div className="error-modal">
                <span className="close" onClick={handleClose}>&times;</span>
                <h2>These Files will not be chosen</h2>
                <span className="content">
                    { duplicate_new_files.length > 0 &&
                        <div className="info-card">
                            <h3>Duplicate Files Name</h3>
                            <div className="file-list">
                                { duplicate_new_files.map((file, idx) => 
                                    <p key={idx}>
                                        {file.name}
                                    </p>)
                                }
                            </div>
                        </div>
                    }

                    { duplicate_new_files.length > 0 && duplicate_new_old_files.length > 0 &&
                        <div className="line"></div>
                    }

                    { duplicate_new_old_files.length > 0 &&
                        <div className="info-card">
                            <h3>File Already Selected</h3>
                            <div className="file-list">
                                { duplicate_new_old_files.map((file, idx) => 
                                    <p key={idx}>
                                        {file.name}
                                    </p>)
                                }
                            </div>
                        </div>
                    }
                </span>
            </div>
        </section>
    );
}