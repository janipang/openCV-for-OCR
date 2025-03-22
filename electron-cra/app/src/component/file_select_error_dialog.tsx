import './file_select_error_dialog.css';
import FileStatus from "../types/file-status";

export default function FileSelectErrorDialog(props: {
    handleClose: () => void;
    duplicate_new_files: FileStatus[];
    duplicate_new_old_files: FileStatus[];
}) {
    const { handleClose, duplicate_new_files, duplicate_new_old_files } = props;

    return (
        <section className="backdrop" onClick={() => handleClose()}>
            <div className="file-error-modal">
                <span className="top-bar">
                    <button className="close" onClick={() => handleClose()}>
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000">
                            <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/>
                        </svg>
                    </button>
                </span>
                <span className="content">
                    <h2>These Files will not be chosen</h2>
                    { duplicate_new_files.length > 0 &&
                        <div className="info-card">
                            <h3>Duplicate Files!</h3>
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
                            <h3>File Already Existed</h3>
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
                <span className="bottom-bar">
                    <button className="ok" onClick={() => handleClose()}>OK</button>
                </span>
            </div>
        </section>
    );
}