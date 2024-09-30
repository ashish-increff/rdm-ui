import Papa from "papaparse";
import ToastManager from "./ToastManager";
import { AxiosResponse } from "axios";
import clientService from "../services/instance-service";
import { handleError } from "./ErrorHandler";

interface FileUploadOptions {
  selectedFile: File | null;
  setFileErrors: React.Dispatch<React.SetStateAction<string[]>>;
  handleCancel: () => void;
  ToastManager: typeof ToastManager;
  createService: (entities: any[]) => Promise<AxiosResponse<any, any>>;
  updateService: (entities: any[]) => Promise<AxiosResponse<any, any>>;
  requiredHeaders: string[];
  optionalHeaders?: string[]; // New property for optional headers
  onSuccess: () => void;
  tab: string;
}

type CSVRow = Record<string, string>;

export const HandleFileUpload = async (options: FileUploadOptions) => {
  const {
    selectedFile,
    setFileErrors,
    handleCancel,
    ToastManager,
    createService,
    updateService,
    requiredHeaders,
    optionalHeaders = [], // Default to an empty array if not provided
    onSuccess,
    tab,
  } = options;

  if (!selectedFile) {
    setFileErrors(["No file selected"]);
    return;
  }

  Papa.parse<CSVRow>(selectedFile, {
    header: true,
    skipEmptyLines: true,
    complete: async (result) => {
      const data: CSVRow[] = result.data;

      console.log("Parsed CSV data:", data);

      const validateCSV = (data: CSVRow[]) => {
        if (data.length === 0) {
          setFileErrors(["No data found in the file"]);
          return false;
        }

        const headers = Object.keys(data[0]);
        const errors: string[] = [];

        // Check for missing mandatory headers
        requiredHeaders.forEach((header) => {
          if (!headers.includes(header)) {
            errors.push(`Missing mandatory header: ${header}`);
          }
        });

        console.log("Errors:", errors);
        if (errors.length > 0) {
          setFileErrors(errors);
          return false;
        }
        return true;
      };

      if (validateCSV(data)) {
        const invalidRows = data.filter((row) =>
          requiredHeaders.some((header) => !row[header])
        );

        if (invalidRows.length > 0) {
          const error = new Error(
            "All required fields must be present in each row."
          );
          console.error(error);
          setFileErrors([error.message]);
          ToastManager.error("Error Uploading File", error.message);
          return;
        }

        // Filter valid data (rows with at least one required header populated)
        const validData = data.filter((row) =>
          requiredHeaders.some((header) => row[header])
        );

        try {
          const formattedData = validData.map((row) => {
            const formattedRow: Record<string, string | boolean | object | null> = {};

            // Process mandatory headers
            requiredHeaders.forEach((header) => {
              let value: string | null = row[header] || null;
              if (value === "") {
                value = null;
              }

              if (header === "componentVersions" && value) {
                value = value.replace(/[“”]/g, '"');
                try {
                  value = JSON.parse(value);
                } catch (e) {
                  console.error("Invalid JSON in componentVersions:", value);
                  setFileErrors(["Invalid JSON format in componentVersions"]);
                  return;
                }
              }

              if (header === "deploymentOnHold" || header === "isActive") {
                formattedRow[header] = value?.toLowerCase() === "true";
              } else {
                formattedRow[header] = value;
              }
            });

            // Process optional headers
            optionalHeaders.forEach((header) => {
              let value: string | null = row[header] || null;
              if (value === "") {
                value = null;
              }

              formattedRow[header] = value;
            });

            return formattedRow;
          });

          if (tab === "update") {
            await clientService.bulkUpdate(formattedData);
            ToastManager.success(
              "Components Updated",
              "Successfully updated components."
            );
          } else {
            console.log("Creating new components:", formattedData);
            await clientService.bulkCreate(formattedData);
            ToastManager.success(
              "Components Added",
              "Successfully added new components."
            );
          }
          onSuccess();
          handleCancel();
        } catch (error) {
          console.error("Error during service call:", error);
          const errorMessage = handleError(error, "Error Uploading File");
          setFileErrors([errorMessage]);
        ToastManager.error("Error ", errorMessage);
        }
      }
    },
    error: (error) => {
      console.error("Error parsing CSV:", error);
      let errorMessage = (error as Error).message;
      if (errorMessage.includes("The requested file could not be read")) {
        errorMessage =
          "Error in Parsing CSV file. File was modified after attaching.";
      }
      setFileErrors([errorMessage]);
      ToastManager.error("Error Parsing File", errorMessage);
    },
  });
};
