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
import componentService from "../services/component-service";
import { handleError } from "../utils/ErrorHandler";
import { FaExternalLinkAlt } from "react-icons/fa";

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [name, setName] = useState("");
  const [liveDeploymentGroup, setLiveDeploymentGroup] = useState("");
  const [deploymentOnHold, setDeploymentOnHold] = useState<boolean | null>(
    null
  );
  const [isActive, setIsActive] = useState<boolean | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [uploadDisabled, setUploadDisabled] = useState(true);
  const [show, setShow] = useState<{ [key: string]: boolean }>({});
  const [searchButtonDisabled, setSearchButtonDisabled] = useState(false);

  const handleToggle = (
    event: React.MouseEvent<HTMLAnchorElement>,
    name: string
  ) => {
    event.preventDefault();
    setShow((prevState: { [key: string]: boolean }) => ({
      ...prevState,
      [name]: !prevState[name],
    }));
  };

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await clientService.getAll().request;
        setClients(response.data as Client[]);
      } catch (error) {
        const errorMessage = handleError(error, "Error Uploading File");
        ToastManager.error("Error fetching clients", errorMessage);
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
        isActive: isActive, // Already a boolean
      });
      setClients(response.data as Client[]);
      ToastManager.success("Success", "Search completed successfully.");
    } catch (error) {
      const errorMessage = handleError(error, "Error Uploading File");
      ToastManager.error("Error fetching clients", errorMessage);
    }
  };
  const handleSearchWithoutParam = async () => {
    try {
      const response = await clientService.search({});
      setClients(response.data as Client[]);
      setIsModalOpen(false);
    } catch (error) {
      const errorMessage = handleError(error, "Error Uploading File");
      ToastManager.error("Error fetching clients", errorMessage);
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
      const errorMessage = handleError(error, "Error Uploading File");
      ToastManager.error("Error fetching clients", errorMessage);
    }
  };
  const [resetKey, setResetKey] = useState(0);

  const resetForm = () => {
    setName("");
    setLiveDeploymentGroup("");
    setDeploymentOnHold(null);
    setIsActive(null);
    setResetKey((prevKey) => prevKey + 1); // Update the key to force re-render
  };

  const onUncheck = () => {
    resetForm();
    handleSearchWithoutParam();
    setSearchButtonDisabled(false);
  };

  const onCheck = () => {
    setSearchButtonDisabled(true);
    console.log("Disabled True");
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
            isDisabled={searchButtonDisabled}
          >
            Search
          </Button>
          <Button colorScheme="blue" onClick={handleManageClientsClick} mt={3}>
            Manage Clients
          </Button>
        </Flex>
      </Flex>
      <div style={{ display: "flex", justifyContent: "center" }}>OR</div>
      <Flex mb={7}>
        <div>
          <SearchByReleasedVersion
            onSearch={handleSearchByReleasedVersion}
            onUncheck={onUncheck}
            onCheck={onCheck}
          />
        </div>
      </Flex>

      <Table>
        <Thead backgroundColor="white">
          <Tr>
            <CustomTh>Name</CustomTh>
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
              Domain <br />
              Url
            </CustomTh>
            <CustomTh>
              Is <br />
              Active
            </CustomTh>
          </Tr>
        </Thead>

        <Tbody>
          {clients.length > 0 ? (
            clients.map((client) => (
              <React.Fragment key={client.name}>
                <>
                  <Tr key={client.name} _hover={{ bg: "gray.100" }}>
                    <Td>
                      <Link
                        onClick={(event) => handleToggle(event, client.name)}
                        style={{ cursor: "pointer", color: "#3182ce" }}
                      >
                        {client.name}
                      </Link>
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
                    <Td>
                      <a
                        href={client.domainUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        color="#3182ce"
                      >
                        <FaExternalLinkAlt color="#3182ce" />
                      </a>
                    </Td>
                    <Td>{client.isActive ? "Yes" : "No"}</Td>
                  </Tr>
                  {show[client.name] && (
                    <Tr>
                      <Td colSpan={8}>
                        <Box
                          borderWidth="1px"
                          borderRadius="lg"
                          overflow="hidden"
                        >
                          <Table variant="simple" backgroundColor="white">
                            <Thead>
                              <Tr>
                                <CustomTh>Component</CustomTh>
                                <CustomTh>Version</CustomTh>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {client.componentVersions.map(
                                ({ name, version }) => (
                                  <Tr key={name} _hover={{ bg: "gray.100" }}>
                                    <Td>{name}</Td>
                                    <Td>{version}</Td>
                                  </Tr>
                                )
                              )}
                            </Tbody>
                          </Table>
                        </Box>
                      </Td>
                    </Tr>
                  )}
                </>
              </React.Fragment>
            ))
          ) : (
            <Tr>
              <Td colSpan={8}>No matching Client Found</Td>
            </Tr>
          )}
        </Tbody>
      </Table>
    </Box>
  );
};

export default Clients;
