import saveAs from "file-saver";

export const handleDownloadTemplate = (dummyData: BlobPart, fileName:string) => {
    const blob = new Blob([dummyData], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, fileName);
  };