import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Flex,
  Link,
  VStack,
  Heading,
  Text,
  useColorMode,
} from "@chakra-ui/react";
import componentService from "../services/component-service";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import InfoPopover from "./InfoPopover";
import { bulkUploadComponentFields } from "./InformativeFields";
import ToastManager from "../utils/ToastManager"; // Import the ToastManager
import { getTableStyles } from "./Styles";
import { Component } from "../utils/Modal";

const Components = () => {
  const [components, setComponents] = useState<Component[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [uploadDisabled, setUploadDisabled] = useState(true);

  const { colorMode } = useColorMode();
  const tableStyles = getTableStyles(colorMode);

  const fetchComponents = async () => {
    try {
      const { request } = componentService.getAll<Component>();
      const response = await request;
      setComponents(response.data);
    } catch (error) {
      console.error(error);
      ToastManager.error("Error Loading Components", (error as Error).message);
    }
  };

  useEffect(() => {
    fetchComponents();
  }, []);

  useEffect(() => {
    setUploadDisabled(!selectedFile || fileErrors.length > 0);
  }, [selectedFile, fileErrors]);

  const bgColor = useColorModeValue("white", "gray.800");
  const colorScheme = useColorModeValue("blue", "teal");
  const inputColor = useColorModeValue("black", "white");
  const placeholderColor = useColorModeValue("gray.500", "gray.300");

  const filteredComponents = components.filter((component) =>
    component.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCancel = () => {
    setIsOpen(false);
    setSelectedFile(null); // Clear selected file
    setFileErrors([]); // Clear file errors
    setUploadDisabled(true); // Reset upload button state
  };

  const handleManageClick = () => {
    setIsOpen(true);
  };

  const handleDownloadTemplate = () => {
    const dummyData = "name,pocEmail\nMANDATORY\nCOMPONENT_NAME,POC_EMAIL";
    const blob = new Blob([dummyData], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "sample-component-upload.csv");
  };

  const validateCSV = (data: any) => {
    const requiredHeaders = ["name", "pocEmail"];
    const headers = Object.keys(data[0]);
    const errors: string[] = [];

    requiredHeaders.forEach((header) => {
      if (!headers.includes(header)) {
        errors.push(`Missing header: ${header}`);
      }
    });

    if (errors.length > 0) {
      setFileErrors(errors);
      return false;
    }

    return true;
  };

  const handleFileUpload = async (tab: string) => {
    if (!selectedFile) {
      setFileErrors(["No file selected"]);
      setUploadDisabled(true); // Disable upload on error
      return;
    }

    Papa.parse(selectedFile, {
      header: true,
      complete: async (result) => {
        let data = result.data;
        console.log("Parsed data:", data);

        if (validateCSV(data)) {
          // Filter out rows where either 'name' or 'pocEmail' is blank, but not both
          const invalidRows = data.filter(
            (row: any) =>
              (!row.name && row.pocEmail) || (row.name && !row.pocEmail)
          );

          // If there are any invalid rows, throw an error
          if (invalidRows.length > 0) {
            const error = new Error(
              "Both 'name' and 'pocEmail' are required in all rows."
            );
            console.error(error);
            setFileErrors([error.message]);
            ToastManager.error("Error Uploading File", error.message);
            return;
          }

          // If all rows are valid, proceed with the upload
          // Ignore rows where both 'name' and 'pocEmail' are blank
          data = data.filter((row: any) => row.name || row.pocEmail);

          try {
            const components = data.map((row: any) => ({
              name: row.name,
              pocEmail: row.pocEmail || null,
            }));
            if (tab === "update") {
              await componentService.bulkUpdate(components);
              ToastManager.success(
                "Components Updated",
                "Successfully updated components."
              );
            } else {
              await componentService.bulkCreate(components);
              ToastManager.success(
                "Components Added",
                "Successfully added new components."
              );
            }
            fetchComponents();
            handleCancel(); // Call handleCancel to reset the form and close the modal
          } catch (error) {
            console.error(error);
            setFileErrors([(error as Error).message]);
            ToastManager.error(
              "Error Uploading File",
              (error as Error).message
            );
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
        setUploadDisabled(true); // Disable upload on error
        ToastManager.error("Error Parsing File", errorMessage);
      },
    });
  };

  return (
    <Box padding="4" boxShadow="lg" bg={bgColor}>
      <HStack marginBottom="4">
        <Input
          placeholder="Search Component"
          maxW="250px"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          sx={{
            "::placeholder": {
              color: placeholderColor,
            },
          }}
        />
        <Button colorScheme="blue" onClick={handleManageClick}>
          Manage Components
        </Button>
      </HStack>
      <Table colorScheme={colorScheme} sx={tableStyles}>
        <Thead>
          <Tr>
            <Th fontWeight="bold">Component Name</Th>
            <Th fontWeight="bold">POC Name</Th>
            <Th fontWeight="bold">POC Email</Th>
          </Tr>
        </Thead>
        <Tbody>
          {filteredComponents.length === 0 ? (
            <Tr>
              <Td colSpan={3}>No matching Component Found</Td>
            </Tr>
          ) : (
            filteredComponents.map((component, index) => (
              <Tr key={index}>
                <Td>{component.name}</Td>
                <Td>{component.pocName ? component.pocName : "-"}</Td>
                <Td>{component.pocEmail ? component.pocEmail : "-"}</Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>
      <Modal isOpen={isOpen} onClose={handleCancel} closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent>
          <ModalBody>
            <Tabs>
              <TabList>
                <Tab>Add Components</Tab>
                <Tab>Update Components</Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
                  <Box
                    maxW="md"
                    mx="auto"
                    p={6}
                    borderWidth={1}
                    borderRadius="lg"
                    boxShadow="lg"
                  >
                    <VStack spacing={4} align="stretch">
                      <Heading as="h3" size="sm">
                        Upload Component(s)
                      </Heading>
                      <FormControl>
                        <Input
                          type="file"
                          accept=".csv"
                          p={1}
                          borderColor="gray.300"
                          borderRadius="md"
                          onClick={(event) => {
                            event.currentTarget.value = "";
                          }}
                          onChange={(event) => {
                            setSelectedFile(
                              event.target.files ? event.target.files[0] : null
                            );
                            setFileErrors([]); // Clear errors when new file is selected
                          }}
                        />
                        <Flex
                          justifyContent="flex-end"
                          alignItems="center"
                          mt={2}
                        >
                          <Link
                            onClick={handleDownloadTemplate}
                            color="teal.500"
                            marginRight="2"
                          >
                            Download Template
                          </Link>
                          <InfoPopover
                            fields={bulkUploadComponentFields}
                            color="teal.500"
                          />
                        </Flex>
                      </FormControl>
                      {fileErrors.length > 0 && (
                        <Box mt={4} color="red.500">
                          <Text fontWeight="bold">
                            Note: After fixing problems, please re-attach the
                            file again
                          </Text>
                          <Box mt={2}>
                            {fileErrors.map((error, index) => (
                              <Text key={index}>{error}</Text>
                            ))}
                          </Box>
                        </Box>
                      )}
                      <Flex justifyContent="flex-end" mt={4}>
                        <Button colorScheme="gray" onClick={handleCancel}>
                          Cancel
                        </Button>
                        <Button
                          colorScheme="blue"
                          ml={4}
                          isDisabled={uploadDisabled} // Disable based on the state
                          onClick={() => handleFileUpload("add")}
                        >
                          Upload
                        </Button>
                      </Flex>
                    </VStack>
                  </Box>
                </TabPanel>
                <TabPanel>
                  <Box
                    maxW="md"
                    mx="auto"
                    p={6}
                    borderWidth={1}
                    borderRadius="lg"
                    boxShadow="lg"
                  >
                    <VStack spacing={4} align="stretch">
                      <Heading as="h3" size="sm">
                        Upload Component(s)
                      </Heading>
                      <FormControl>
                        <Input
                          type="file"
                          accept=".csv"
                          p={1}
                          borderColor="gray.300"
                          borderRadius="md"
                          onClick={(event) => {
                            event.currentTarget.value = "";
                          }}
                          onChange={(event) => {
                            setSelectedFile(
                              event.target.files ? event.target.files[0] : null
                            );
                            setFileErrors([]); // Clear errors when new file is selected
                          }}
                        />
                        <Flex
                          justifyContent="flex-end"
                          alignItems="center"
                          mt={2}
                        >
                          <Link
                            onClick={handleDownloadTemplate}
                            color="teal.500"
                            marginRight="2"
                          >
                            Download Template
                          </Link>
                          <InfoPopover
                            fields={bulkUploadComponentFields}
                            color="teal.500"
                          />
                        </Flex>
                      </FormControl>
                      {fileErrors.length > 0 && (
                        <Box mt={4} color="red.500">
                          <Text fontWeight="bold">
                            Note: After fixing problems, please re-attach the
                            file again
                          </Text>
                          <Box mt={2}>
                            {fileErrors.map((error, index) => (
                              <Text key={index}>{error}</Text>
                            ))}
                          </Box>
                        </Box>
                      )}
                      <Flex justifyContent="flex-end" mt={4}>
                        <Button colorScheme="gray" onClick={handleCancel}>
                          Cancel
                        </Button>
                        <Button
                          colorScheme="blue"
                          ml={4}
                          isDisabled={uploadDisabled} // Disable based on the state
                          onClick={() => handleFileUpload("update")}
                        >
                          Upload
                        </Button>
                      </Flex>
                    </VStack>
                  </Box>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Components;
