import React, { useEffect, useState } from "react";
import clientService from "../services/client-service";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Td,
  Tooltip,
  Flex,
  Button,
  Input,
  Link,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  FormControl,
  FormLabel,
  HStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
  Text,
} from "@chakra-ui/react";
import Select from "react-select";
import {
  addClientsCsvData,
  addClientsCsvName,
  updateClientsCsvData,
  updateClientsCsvName,
} from "../utils/SampleTemplatesData";
import InfoPopover from "./InfoPopover";
import {
  bulkAddClientsFields,
  bulkUpdateClientsFields,
} from "./InformativeFields";
import { handleDownloadTemplate } from "../utils/Helper";
import { Client } from "../utils/Modal";
import ToastManager from "../utils/ToastManager";
import SearchByReleasedVersion from "./SearchByReleasedVersion";
import { CustomInput, CustomTh } from "../utils/CustomComponents";
import { HandleFileUpload } from "../utils/HandleFileUpload";
import { saveAs } from "file-saver";
import componentService from "../services/component-service";

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [name, setName] = useState("");
  const [liveDeploymentGroup, setLiveDeploymentGroup] = useState("");
  const [deploymentOnHold, setDeploymentOnHold] = useState<boolean | null>(
    null
  );
  const [deploymentPriority, setDeploymentPriority] = useState<number | "">("");
  const [isActive, setIsActive] = useState<boolean | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [uploadDisabled, setUploadDisabled] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await clientService.getAll().request;
        setClients(response.data as Client[]);
      } catch (error) {
        ToastManager.error(
          "Error fetching clients",
          "There was an issue fetching the clients data."
        );
      }
    };

    fetchClients();
  }, [toast]);

  const handleSearch = async () => {
    try {
      const response = await clientService.search({
        name: name || null, // Send null if name is an empty string
        liveDeploymentGroup: liveDeploymentGroup || null, // Send null if liveDeploymentGroup is an empty string
        deploymentOnHold: deploymentOnHold, // Already a boolean
        deploymentPriority:
          deploymentPriority === "" ? null : deploymentPriority, // Send null if deploymentPriority is an empty string
        isActive: isActive, // Already a boolean
      });
      setClients(response.data as Client[]);
      ToastManager.success("Success", "Search completed successfully.");
    } catch (error) {
      ToastManager.error(
        "Search Error",
        "There was an issue performing the search."
      );
    }
  };
  const handleSearchWithoutParam = async () => {
    try {
      const response = await clientService.search({});
      setClients(response.data as Client[]);
      setIsModalOpen(false);
    } catch (error) {
      ToastManager.error(
        "Search Error",
        "There was an issue performing the search."
      );
    }
  };

  const handleManageClientsClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFile(null); // Reset file input on modal close
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    setSelectedFile(file);
    setUploadDisabled(!file);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    // Add your file upload logic here

    console.log(selectedFile);
    ToastManager.success(
      "File Uploaded.",
      "The file has been uploaded successfully."
    );
    handleCloseModal();
  };

  const yesNoOptions = [
    { value: true, label: "Yes" },
    { value: false, label: "No" },
  ];

  const priorityOptions = [1, 2, 3, 4, 5].map((priority) => ({
    value: priority,
    label: priority,
  }));

  const handleSelectChange =
    (setter: React.Dispatch<React.SetStateAction<boolean | null>>) =>
    (selectedOption: any) => {
      setter(selectedOption ? selectedOption.value : null);
    };

  const handleSearchByReleasedVersion = async (
    componentVersions: Record<string, string>
  ) => {
    try {
      const response = await clientService.searchByComponent({
        componentVersions,
      });
      setClients(response.data as Client[]);
      resetForm();
      ToastManager.success("Success", "Search completed successfully.");
    } catch (error) {
      ToastManager.error("Error during search", (error as Error).message);
    }
  };
  const [resetKey, setResetKey] = useState(0);

  const resetForm = () => {
    setName("");
    setLiveDeploymentGroup("");
    setDeploymentOnHold(null);
    setDeploymentPriority("");
    setIsActive(null);
    setResetKey((prevKey) => prevKey + 1); // Update the key to force re-render
  };

  const onUncheck = () => {
    resetForm();
    handleSearchWithoutParam();
  };
  const handleCancel = () => {
    setIsOpen(false);
    setSelectedFile(null);
    setFileErrors([]);
    setUploadDisabled(true);
  };

  return (
    <Box mt="0" pt="0" padding="4">
      <Flex mb={4} alignItems="center" wrap="wrap">
        <Flex direction="row" wrap="wrap" mb={4} gap={4}>
          <FormControl id="name" w={{ base: "100%", md: "auto" }}>
            <FormLabel fontWeight="bold">Client Name</FormLabel>
            <CustomInput
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormControl>
          <FormControl
            id="liveDeploymentGroup"
            w={{ base: "100%", md: "auto" }}
          >
            <FormLabel fontWeight="bold">Live Deployment Group</FormLabel>
            <CustomInput
              placeholder="Deployment Group"
              value={liveDeploymentGroup}
              onChange={(e) => setLiveDeploymentGroup(e.target.value)}
            />
          </FormControl>
          <FormControl id="deploymentOnHold" w="190px">
            <FormLabel fontWeight="bold">Deployment On Hold</FormLabel>
            <Select
              key={`deploymentOnHold-${resetKey}`}
              placeholder="Select"
              options={yesNoOptions}
              onChange={handleSelectChange(setDeploymentOnHold)}
              value={yesNoOptions.find(
                (option) => option.value === deploymentOnHold
              )}
              isClearable
            />
          </FormControl>
          <FormControl id="deploymentPriority" w="190px">
            <FormLabel fontWeight="bold">Deployment Priority</FormLabel>
            <Select
              key={`deploymentPriority-${resetKey}`}
              placeholder="Select"
              options={priorityOptions}
              onChange={(option) =>
                setDeploymentPriority(option ? option.value : "")
              }
              value={priorityOptions.find(
                (option) => option.value === deploymentPriority
              )}
              isClearable
            />
          </FormControl>
          <FormControl id="isActive" w="190px">
            <FormLabel fontWeight="bold">Is Active</FormLabel>
            <Select
              key={`isActive-${resetKey}`}
              placeholder="Select"
              options={yesNoOptions}
              onChange={handleSelectChange(setIsActive)}
              value={yesNoOptions.find((option) => option.value === isActive)}
              isClearable
            />
          </FormControl>
        </Flex>
        <Flex alignItems="center">
          <Button
            colorScheme="blue"
            onClick={handleSearch}
            mr={4}
            ml={4}
            mt={3}
          >
            Search
          </Button>
          <Button colorScheme="blue" onClick={handleManageClientsClick} mt={3}>
            Manage Clients
          </Button>
        </Flex>
        <div>
          <SearchByReleasedVersion
            onSearch={handleSearchByReleasedVersion}
            onUncheck={onUncheck}
          />
        </div>
      </Flex>
      <Table>
        <Thead backgroundColor="white">
          <Tr>
            <CustomTh>Name</CustomTh>
            <CustomTh>Component : Version</CustomTh>
            <CustomTh>
              Live <br />
              Deployment Group
            </CustomTh>
            <CustomTh>
              Primary
              <br /> POC
            </CustomTh>
            <CustomTh>
              Secondary
              <br /> POC
            </CustomTh>
            <CustomTh>
              Deployment <br /> On Hold
            </CustomTh>
            <CustomTh>
              Deployment
              <br /> Priority
            </CustomTh>
            <CustomTh>Is Active</CustomTh>
          </Tr>
        </Thead>

        <Tbody>
          {clients.length > 0 ? (
            clients.map((client) => (
              <Tr key={client.name} _hover={{ bg: "gray.100" }}>
                <Td minWidth={130}>
                  <Link
                    href={
                      client.domainUrl.startsWith("http://") ||
                      client.domainUrl.startsWith("https://")
                        ? client.domainUrl
                        : `http://${client.domainUrl}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    _hover={{ textDecoration: "underline" }}
                  >
                    {client.name}
                  </Link>
                </Td>
                <Td>
                  {Object.entries(client.componentVersions).map(
                    ([key, value]) => (
                      <Flex key={key}>
                        <Box as="span" minW="100px">
                          {key}
                        </Box>
                        <Box as="span">: {value}</Box>
                      </Flex>
                    )
                  )}
                </Td>
                <Td>{client.liveDeploymentGroup}</Td>
                <Td>
                  <Tooltip label={client.primaryPocEmail} placement="top">
                    {client.primaryPocName}
                  </Tooltip>
                </Td>
                <Td>
                  <Tooltip label={client.secondaryPocEmail} placement="top">
                    {client.secondaryPocName}
                  </Tooltip>
                </Td>
                <Td>{client.deploymentOnHold ? "Yes" : "No"}</Td>
                <Td>{client.deploymentPriority}</Td>
                <Td>{client.isActive ? "Yes" : "No"}</Td>
              </Tr>
            ))
          ) : (
            <Tr>
              <Td colSpan={8}>No matching Client Found</Td>
            </Tr>
          )}
        </Tbody>
      </Table>
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        closeOnOverlayClick={false}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalBody>
            <Tabs>
              <TabList>
                <Tab>Add Clients</Tab>
                <Tab>Update Clients</Tab>
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
                    <FormControl>
                      <FormLabel>Upload Client(s)</FormLabel>
                      <Input
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                      />
                      <Flex
                        justifyContent="flex-end"
                        alignItems="center"
                        mt={2}
                      >
                        <Link
                          onClick={(e) => {
                            e.preventDefault();
                            handleDownloadTemplate(
                              addClientsCsvData,
                              addClientsCsvName
                            );
                          }}
                          color="teal.500"
                          marginRight="2"
                        >
                          Download Template
                        </Link>
                        <InfoPopover
                          fields={bulkAddClientsFields}
                          color="teal.500"
                        />
                      </Flex>
                    </FormControl>
                    {fileErrors.length > 0 && (
                      <Box mt={4} color="red.500">
                        <Text fontWeight="bold">
                          Note: After fixing problems, please re-attach the file
                          again
                        </Text>
                        <Box mt={2}>
                          {fileErrors.map((error, index) => (
                            <Text key={index}>{error}</Text>
                          ))}
                        </Box>
                      </Box>
                    )}
                    <HStack justifyContent="flex-end" mt={4}>
                      <Button onClick={handleCloseModal}>Cancel</Button>
                      <Button
                        ml={4}
                        isDisabled={uploadDisabled}
                        onClick={() =>
                          HandleFileUpload({
                            selectedFile,
                            setFileErrors,
                            handleCancel,
                            ToastManager,
                            createService: componentService.bulkCreate,
                            updateService: componentService.bulkUpdate,
                            requiredHeaders: [
                              "name",
                              "liveDeploymentGroup",
                              "domainUrl",
                              "deploymentOnHold",
                              "deploymentPriority",
                              "primaryPocEmail",
                              "secondaryPocEmail",
                              "isActive",
                              "componentVersions",
                            ],
                            onSuccess: handleSearchWithoutParam, // Provide success callback
                            tab: "add", // Include the current tab value
                          })
                        }
                        colorScheme="blue"
                      >
                        Upload
                      </Button>
                    </HStack>
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
                    <FormControl>
                      <FormLabel>Upload Client(s)</FormLabel>
                      <Input
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                      />
                      <Flex
                        justifyContent="flex-end"
                        alignItems="center"
                        mt={2}
                      >
                        <Link
                          onClick={(e) => {
                            e.preventDefault();
                            handleDownloadTemplate(
                              updateClientsCsvData,
                              updateClientsCsvName
                            );
                          }}
                          color="teal.500"
                          marginRight="2"
                        >
                          Download Template
                        </Link>
                        <InfoPopover
                          fields={bulkUpdateClientsFields}
                          color="teal.500"
                        />
                      </Flex>
                    </FormControl>
                    <HStack justifyContent="flex-end" mt={4}>
                      <Button onClick={handleCloseModal}>Cancel</Button>
                      <Button
                        ml={4}
                        isDisabled={uploadDisabled}
                        onClick={() =>
                          HandleFileUpload({
                            selectedFile,
                            setFileErrors,
                            handleCancel,
                            ToastManager,
                            createService: componentService.bulkCreate,
                            updateService: componentService.bulkUpdate,
                            requiredHeaders: ["name"],
                            optionalHeaders: [
                              "domainUrl",
                              "deploymentOnHold",
                              "deploymentPriority",
                              "primaryPocEmail",
                              "secondaryPocEmail",
                              "isActive",
                            ],
                            onSuccess: handleSearchWithoutParam, // Provide success callback
                            tab: "update", // Include the current tab value
                          })
                        }
                        colorScheme="blue"
                      >
                        Upload
                      </Button>
                    </HStack>
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

export default Clients;
