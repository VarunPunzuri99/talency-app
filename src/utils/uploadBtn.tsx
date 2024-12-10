export const UploadButton = ({ name, setFiles }) => {

    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    const handleChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > MAX_FILE_SIZE) {
          alert('File size exceeds the maximum limit of 10MB. Please upload a smaller file.');
          return;
        }
        setFiles((prev) => ({
          ...prev,
          [name]: e.target.files[0]
        }));
      }
    };
  
    return (
      <>
        <label className="uploadLabel">
          <input
            type="file"
            onChange={handleChange}
          />
          Upload
        </label>
      </>
    );
  };
  