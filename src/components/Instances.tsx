import React, { useEffect, useState } from "react";
import instanceService from "../services/instance-service";
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
  Link,
  FormControl,
  FormLabel,
  useToast,
} from "@chakra-ui/react";
import Select from "react-select";
import { Instance } from "../utils/Modal";
import ToastManager from "../utils/ToastManager";
import SearchByReleasedVersion from "./SearchByReleasedVersion";
import { CustomInput, CustomTh } from "../utils/CustomComponents";
import { handleError } from "../utils/ErrorHandler";
import AddInstanceModal from "./AddModalComponent";
import AddInstanceComponentModal from "./AddInstanceComponentModal";
import { FaUserEdit } from "react-icons/fa";
import { TbDatabaseEdit } from "react-icons/tb";
import UpdateInstanceManagementModal from "./UpdateInstanceManagementModal";
import UpdateInstanceDetailsModal from "./UpdateInstanceDetailsModal";

const Instances = () => {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [name, setName] = useState("");
  const [liveDeploymentGroup, setLiveDeploymentGroup] = useState("");
  const [deploymentOnHold, setDeploymentOnHold] = useState<boolean | null>(
    null
  );
  const [status, setStatus] = useState<string | null>(null); // Changed from isActive to status
  const toast = useToast();
  const [show, setShow] = useState<{ [key: string]: boolean }>({});
  const [searchButtonDisabled, setSearchButtonDisabled] = useState(false);
  const [isAddInstanceModalOpen, setAddInstanceModalOpen] = useState(false);
  const [isAddInstanceComponentModalOpen, setAddInstanceComponentModalOpen] =
    useState(false);
  const [isUpdateModalOpen, setUpdateModalOpen] = useState(false);
  // Add state to manage selected instance data
  const [selectedInstanceId, setSelectedInstanceId] = useState<number | null>(
    null
  );
  const [selectedInstanceName, setSelectedInstanceName] = useState<string>("");
  const [primaryPocEmail, setPrimaryPocEmail] = useState("");
  const [secondaryPocEmail, setSecondaryPocEmail] = useState("");
  const [selectedDeploymentOnHold, setSelectedDeploymentOnHold] =
    useState<boolean>(false);

  const handleUpdateInstanceClick = (instance: Instance) => {
    setSelectedInstanceId(instance.id);
    setSelectedInstanceName(instance.name);
    setPrimaryPocEmail(instance.primaryPocEmail);
    setSecondaryPocEmail(instance.secondaryPocEmail);
    setSelectedDeploymentOnHold(instance.deploymentOnHold);
    setUpdateModalOpen(true);
  };

  const [isUpdateDetailsModalOpen, setUpdateDetailsModalOpen] = useState(false);
  const [sqlMachineName, setSqlMachineName] = useState("");
  const [gceBucket, setGceBucket] = useState("");
  const [apiUrl, setApiUrl] = useState("");
  const [urlMap, setUrlMap] = useState("");
  const [authDomain, setAuthDomain] = useState("");
  const [projectId, setProjectId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [orgId, setOrgId] = useState("");

  const handleUpdateDetailsClick = (instance: Instance) => {
    setSelectedInstanceId(instance.id);
    setSelectedInstanceName(instance.name);
    setSqlMachineName(instance.sqlMachineName);
    setGceBucket(instance.gceBucket);
    setApiUrl(instance.apiUrl);
    setUrlMap(instance.urlMap);
    setAuthDomain(instance.authDomain);
    setProjectId(instance.projectId);
    setZoneId(instance.zoneId);
    setOrgId(instance.orgId);
    setUpdateDetailsModalOpen(true);
  };

  const handleToggle = (
    event: React.MouseEvent<HTMLAnchorElement>,
    instance: Instance
  ) => {
    event.preventDefault();
    setShow((prevState) => ({
      ...prevState,
      [instance.name]: !prevState[instance.name],
    }));

    if (!show[instance.name]) {
      setSelectedInstanceId(instance.id);
      setSelectedInstanceName(instance.name);
    } else {
      setSelectedInstanceId(null);
      setSelectedInstanceName("");
    }
  };

  const yesNoOptions = [
    { value: true, label: "Yes" },
    { value: false, label: "No" },
  ];

  useEffect(() => {
    fetchInstances();
  }, [toast]);

  const fetchInstances = async () => {
    try {
      const response = await instanceService.getAll().request;
      setInstances(response.data as Instance[]);
    } catch (error) {
      const errorMessage = handleError(error, "Error Uploading File");
      ToastManager.error("Error fetching instances", errorMessage);
    }
  };

  const handleSearch = async () => {
    try {
      const response = await instanceService.search({
        name: name || null,
        liveDeploymentGroup: liveDeploymentGroup || null,
        deploymentOnHold: deploymentOnHold,
        instanceStatus: status, // Use status instead of isActive
      });
      setInstances(response.data as Instance[]);
      ToastManager.success("Success", "Search completed successfully.");
    } catch (error) {
      const errorMessage = handleError(error, "Error Uploading File");
      ToastManager.error("Error fetching instances", errorMessage);
    }
  };

  const handleSearchWithoutParam = async () => {
    try {
      const response = await instanceService.search({});
      setInstances(response.data as Instance[]);
    } catch (error) {
      const errorMessage = handleError(error, "Error Uploading File");
      ToastManager.error("Error fetching instances", errorMessage);
    }
  };

  const handleAddInstanceClick = () => {
    setAddInstanceModalOpen(true);
  };

  const handleAddInstanceComponentClick = () => {
    setAddInstanceComponentModalOpen(true);
  };

  const statusOptions = [
    { value: "NEW", label: "New" },
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
  ];

  const handleSelectChange =
    (setter: React.Dispatch<React.SetStateAction<string | null>>) =>
    (selectedOption: any) => {
      setter(selectedOption ? selectedOption.value : null);
    };

  const handleSearchByReleasedVersion = async (
    componentVersions: Record<string, string>
  ) => {
    try {
      const response = await instanceService.searchByComponent({
        componentVersions,
      });
      setInstances(response.data as Instance[]);
      resetForm();
      ToastManager.success("Success", "Search completed successfully.");
    } catch (error) {
      const errorMessage = handleError(error, "Error Uploading File");
      ToastManager.error("Error fetching instances", errorMessage);
    }
  };

  const [resetKey, setResetKey] = useState(0);

  const resetForm = () => {
    setName("");
    setLiveDeploymentGroup("");
    setDeploymentOnHold(null);
    setStatus(null); // Reset status
    setResetKey((prevKey) => prevKey + 1);
  };

  const onUncheck = () => {
    resetForm();
    handleSearchWithoutParam();
    setSearchButtonDisabled(false);
  };

  const onCheck = () => {
    setSearchButtonDisabled(true);
  };

  return (
    <Box mt="0" pt="0" padding="4">
      <Flex mb={4} alignItems="center" wrap="wrap">
        <Flex direction="row" wrap="wrap" mb={4} gap={4}>
          <FormControl id="name" w={{ base: "100%", md: "auto" }}>
            <FormLabel fontWeight="bold">Name</FormLabel>
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

          <FormControl id="status" w="190px">
            {" "}
            {/* Changed from isActive to status */}
            <FormLabel fontWeight="bold">Status</FormLabel>
            <Select
              key={`status-${resetKey}`}
              placeholder="Select"
              options={statusOptions}
              onChange={handleSelectChange(setStatus)} // Update setter to setStatus
              value={statusOptions.find((option) => option.value === status)} // Update value to status
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
          <Button colorScheme="teal" onClick={handleAddInstanceClick} mt={3}>
            Add Instance
          </Button>
          <AddInstanceModal
            isOpen={isAddInstanceModalOpen}
            onClose={() => setAddInstanceModalOpen(false)}
            onAddSuccess={fetchInstances}
          />
          <AddInstanceComponentModal
            isOpen={isAddInstanceComponentModalOpen}
            onClose={() => setAddInstanceComponentModalOpen(false)}
            instanceId={selectedInstanceId!} // Ensure it's not null
            instanceName={selectedInstanceName}
            onAddSuccess={fetchInstances}
          />
          <UpdateInstanceManagementModal
            isOpen={isUpdateModalOpen}
            onClose={() => setUpdateModalOpen(false)}
            onUpdateSuccess={fetchInstances}
            instanceId={selectedInstanceId!}
            instanceName={selectedInstanceName}
            primaryPocEmail={primaryPocEmail}
            secondaryPocEmail={secondaryPocEmail}
            deploymentOnHold={selectedDeploymentOnHold}
          />
          <UpdateInstanceDetailsModal
            isOpen={isUpdateDetailsModalOpen}
            onClose={() => setUpdateDetailsModalOpen(false)}
            onUpdateSuccess={fetchInstances}
            instanceId={selectedInstanceId!}
            instanceName={selectedInstanceName}
            sqlMachineName={sqlMachineName}
            gceBucket={gceBucket}
            apiUrl={apiUrl}
            urlMap={urlMap}
            authDomain={authDomain}
            projectId={projectId}
            zoneId={zoneId}
            orgId={orgId}
          />
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

      <Box overflowX="scroll">
        <Table>
          <Thead backgroundColor="white">
            <Tr>
              <CustomTh>Name</CustomTh>
              <CustomTh>Client</CustomTh>
              <CustomTh>Live Deployment Group</CustomTh>
              <CustomTh>Deployment Group Tag</CustomTh>
              <CustomTh>Latest Deployment Group Tag </CustomTh>
              <CustomTh>Next Deployment Group</CustomTh>
              <CustomTh>Primary POC</CustomTh>
              <CustomTh>Secondary POC</CustomTh>
              <CustomTh>Deployment On Hold</CustomTh>
              <CustomTh>Status</CustomTh>
              <CustomTh>SQL Machine Name</CustomTh>
              <CustomTh>GCE Bucket</CustomTh>
              <CustomTh>API URL</CustomTh>
              <CustomTh>URL Map</CustomTh>
              <CustomTh>Auth Domain</CustomTh>
              <CustomTh>Project ID</CustomTh>
              <CustomTh>Zone ID</CustomTh>
              <CustomTh>Org ID</CustomTh>
              <CustomTh>Actions</CustomTh>
            </Tr>
          </Thead>

          <Tbody>
            {instances.length > 0 ? (
              instances.map((instance) => (
                <>
                  <Tr key={instance.name} _hover={{ bg: "gray.100" }}>
                    <Td>
                      <Link
                        onClick={(event) => handleToggle(event, instance)}
                        style={{ cursor: "pointer", color: "#3182ce" }}
                      >
                        {instance.name}
                      </Link>
                    </Td>
                    <Td>{instance.client}</Td>
                    <Td>
                      {instance.liveDeploymentGroup
                        ? instance.liveDeploymentGroup
                        : "-"}
                    </Td>
                    <Td>
                      {instance.deploymentGroupTag
                        ? instance.deploymentGroupTag
                        : "-"}
                    </Td>
                    <Td>
                      {instance.latestDeploymentGroupTag &&
                      instance.latestDeploymentGroupTag !==
                        instance.deploymentGroupTag
                        ? instance.latestDeploymentGroupTag
                        : "-"}
                    </Td>
                    <Td>
                      {instance.nextDeploymentGroup
                        ? instance.nextDeploymentGroup
                        : "-"}
                    </Td>
                    <Td>
                      <Tooltip label={instance.primaryPocEmail} placement="top">
                        <span>{instance.primaryPocName}</span>
                      </Tooltip>
                    </Td>
                    <Td>
                      <Tooltip
                        label={instance.secondaryPocEmail}
                        placement="top"
                      >
                        <span>{instance.secondaryPocName}</span>
                      </Tooltip>
                    </Td>
                    <Td>{instance.deploymentOnHold ? "Yes" : "No"}</Td>
                    <Td>{instance.status}</Td> {/* Display status here */}
                    <Td>{instance.sqlMachineName}</Td>
                    <Td>{instance.gceBucket}</Td>
                    <Td>{instance.apiUrl}</Td>
                    <Td>{instance.urlMap}</Td>
                    <Td>{instance.authDomain}</Td>
                    <Td>{instance.projectId}</Td>
                    <Td>{instance.zoneId}</Td>
                    <Td>{instance.orgId}</Td>
                    <Td>
                      <Box display="flex" alignItems="center" gap="4">
                        <FaUserEdit
                          color="#4299e1"
                          style={{ cursor: "pointer" }}
                          title="Update Instance Management"
                          size="1.5em"
                          onClick={() => handleUpdateInstanceClick(instance)}
                        />
                        <TbDatabaseEdit
                          color="#00B5D8"
                          style={{ cursor: "pointer" }}
                          title="Update Instance Details"
                          size="1.5em"
                          onClick={() => handleUpdateDetailsClick(instance)}
                        />
                      </Box>
                    </Td>
                  </Tr>
                  {show[instance.name] && (
                    <Tr>
                      <Td colSpan={5}>
                        <Box
                          borderWidth="1px"
                          borderRadius="lg"
                          overflow="hidden"
                        >
                          <Table variant="simple" backgroundColor="white">
                            <Thead>
                              <Tr>
                                <CustomTh>Component</CustomTh>
                                <CustomTh>Type</CustomTh>
                                <CustomTh>Version</CustomTh>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {instance.componentVersions.map(
                                ({ name, type, version }) => (
                                  <Tr key={name} _hover={{ bg: "gray.100" }}>
                                    <Td>{name}</Td>
                                    <Td>{type}</Td>
                                    <Td>{version ? version : "-"}</Td>
                                  </Tr>
                                )
                              )}
                            </Tbody>
                          </Table>
                        </Box>
                        <Button
                          colorScheme="teal"
                          mt={3}
                          onClick={handleAddInstanceComponentClick}
                        >
                          Add Components
                        </Button>
                      </Td>
                    </Tr>
                  )}
                </>
              ))
            ) : (
              <Tr>
                <Td colSpan={4}>No matching Instance Found</Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default Instances;
