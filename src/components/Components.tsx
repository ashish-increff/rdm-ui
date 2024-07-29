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
  IconButton,
  useColorMode,
} from "@chakra-ui/react";
import { FaEdit } from "react-icons/fa";
import { useForm, useWatch } from "react-hook-form";
import componentService from "../services/component-service";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import InfoPopover from "./InfoPopover";
import { bulkUploadComponentFields } from "./InformativeFields";
import ToastManager from "../utils/ToastManager"; // Import the ToastManager
import { getTableStyles } from "./Styles";

interface Component {
  componentName: string;
  pocName?: string;
  pocEmail?: string;
}

const Components = () => {
  const [components, setComponents] = useState<Component[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [uploadDisabled, setUploadDisabled] = useState(true);
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(
    null
  ); // State for selected component

  const { colorMode } = useColorMode();
  const tableStyles = getTableStyles(colorMode);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    control,
  } = useForm<Component>({
    mode: "onChange",
  });

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
    // Update uploadDisabled state based on file selection and errors
    setUploadDisabled(!selectedFile || fileErrors.length > 0);
  }, [selectedFile, fileErrors]);

  const bgColor = useColorModeValue("white", "gray.800");
  const colorScheme = useColorModeValue("blue", "teal");
  const inputColor = useColorModeValue("black", "white");
  const placeholderColor = useColorModeValue("gray.500", "gray.300");

  const filteredComponents = components.filter((component) =>
    component.componentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onSubmit = async (data: Component) => {
    // Convert empty strings to null
    const formattedData = {
      ...data,
      pocName: data.pocName || null,
      pocEmail: data.pocEmail || null,
    };

    try {
      if (selectedComponent) {
        // If editing, update the component
        await componentService.testUpdate(formattedData);
        ToastManager.success(
          "Component Updated",
          "Successfully updated the component."
        );
      } else {
        // If adding new, create the component
        await componentService.bulkCreate([formattedData]);
        ToastManager.success(
          "Component Added",
          "Successfully added new component."
        );
      }
      fetchComponents();
      handleCancel(); // Call handleCancel to reset the form and close the modal
    } catch (error) {
      console.error(error);
      const err = error as any;
      const errorMessage = err.response?.data?.message || err.message;
      ToastManager.error(
        selectedComponent
          ? "Error Updating Component"
          : "Error Adding Component",
        errorMessage
      );
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    reset(); // Reset form fields
    setSelectedFile(null); // Clear selected file
    setFileErrors([]); // Clear file errors
    setUploadDisabled(true); // Reset upload button state
    setSelectedComponent(null); // Reset selected component
  };

  const handleAddClick = () => {
    reset({ componentName: "", pocName: "", pocEmail: "" });
    setSelectedComponent(null);
    setIsOpen(true);
  };

  const componentName = useWatch({
    control,
    name: "componentName",
    defaultValue: "",
  });

  const handleDownloadTemplate = () => {
    const dummyData =
      "componentName,pocName,pocEmail\nMANDATORY\nCOMPONENT_NAME,POC_NAME,POC_EMAIL";
    const blob = new Blob([dummyData], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "sample-component-upload.csv");
  };

  const validateCSV = (data: any) => {
    const requiredHeaders = ["componentName", "pocName", "pocEmail"];
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

  const handleFileUpload = async () => {
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

        // Validate headers before filtering rows
        if (validateCSV(data)) {
          // Filter out empty rows after validation
          data = data.filter(
            (row: any) => row.componentName && row.componentName.trim() !== ""
          );

          try {
            const components = data.map((row: any) => ({
              componentName: row.componentName,
              pocName: row.pocName || null,
              pocEmail: row.pocEmail || null,
            }));
            await componentService.bulkCreate(components);
            fetchComponents();
            handleCancel(); // Call handleCancel to reset the form and close the modal
            ToastManager.success(
              "Components Added",
              "Successfully added new components."
            );
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

  const handleEditClick = (component: Component) => {
    setSelectedComponent(component);
    reset(component);
    setIsOpen(true);
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
        <Button colorScheme="blue" onClick={handleAddClick}>
          Add Component
        </Button>
      </HStack>
      <Table colorScheme={colorScheme} sx={tableStyles}>
        <Thead>
          <Tr>
            <Th fontWeight="bold">Component Name</Th>
            <Th fontWeight="bold">POC Name</Th>
            <Th fontWeight="bold">POC Email</Th>
            <Th fontWeight="bold">Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {filteredComponents.length === 0 ? (
            <Tr>
              <Td colSpan={4}>No matching Component Found</Td>
            </Tr>
          ) : (
            filteredComponents.map((component, index) => (
              <Tr key={index}>
                <Td>{component.componentName}</Td>
                <Td>{component.pocName ? component.pocName : "-"}</Td>
                <Td>{component.pocEmail ? component.pocEmail : "-"}</Td>
                <Td>
                  <IconButton
                    size="sm"
                    colorScheme="blue"
                    aria-label="Edit"
                    icon={<FaEdit />}
                    onClick={() => handleEditClick(component)} // Handle edit click
                  />
                </Td>
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
                <Tab>
                  {selectedComponent ? "Edit Component" : "Add New Component"}
                </Tab>
                {!selectedComponent && <Tab>Bulk Upload</Tab>}
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
                    <form onSubmit={handleSubmit(onSubmit)}>
                      <FormControl
                        isRequired
                        isInvalid={!!errors.componentName}
                        mb={4}
                      >
                        <FormLabel>Component Name</FormLabel>
                        <Input
                          {...register("componentName", { required: true })}
                          autoComplete="off"
                          isDisabled={!!selectedComponent} // Disable if editing
                        />
                        <FormErrorMessage>
                          {errors.componentName && "Component Name is required"}
                        </FormErrorMessage>
                      </FormControl>
                      <FormControl mb={4}>
                        <FormLabel>POC Name</FormLabel>
                        <Input {...register("pocName")} autoComplete="off" />
                      </FormControl>
                      <FormControl mb={4}>
                        <FormLabel>POC Email</FormLabel>
                        <Input {...register("pocEmail")} autoComplete="off" />
                      </FormControl>
                      <HStack justifyContent="flex-end" mt={4}>
                        <Button colorScheme="gray" onClick={handleCancel}>
                          Cancel
                        </Button>
                        <Button
                          colorScheme="blue"
                          type="submit"
                          isDisabled={!componentName}
                        >
                          Submit
                        </Button>
                      </HStack>
                    </form>
                  </Box>
                </TabPanel>
                {!selectedComponent && (
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
                              // This will clear the previous file as soon as the file input is clicked
                              event.currentTarget.value = "";
                            }}
                            onChange={(event) => {
                              setSelectedFile(
                                event.target.files
                                  ? event.target.files[0]
                                  : null
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
                            onClick={handleFileUpload}
                          >
                            Upload
                          </Button>
                        </Flex>
                      </VStack>
                    </Box>
                  </TabPanel>
                )}
              </TabPanels>
            </Tabs>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Components;
