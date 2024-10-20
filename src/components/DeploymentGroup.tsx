import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Stack,
  Link,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import Select from "react-select";
import { FaEdit } from "react-icons/fa";
import deploymentGroupService from "../services/deployment-group-service";
import DeploymentGroupModal from "./DeploymentGroupModal";
import DeploymentGroupUpdateModal from "./DeploymentGroupUpdateModal";
import ToastManager from "../utils/ToastManager";
import { DeploymentGroup } from "../utils/Modal";
import SearchByReleasedVersion from "./SearchByReleasedVersion";
import { CustomInput, CustomTh } from "../utils/CustomComponents";
import { handleError } from "../utils/ErrorHandler";

const DeploymentGroups = () => {
  const [searchValue, setSearchValue] = useState("");
  const [deploymentGroups, setDeploymentGroups] = useState<DeploymentGroup[]>(
    []
  );
  const [name, setName] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchByVersion, setSearchByVersion] = useState(false);
  const [componentReleaseGroups, setComponentReleaseGroups] = useState<
    { id: number; component: string; release: string }[]
  >([{ id: 1, component: "", release: "" }]);

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedDeploymentGroup, setSelectedDeploymentGroup] =
    useState<DeploymentGroup | null>(null);

  const openAddModal = () => setIsAddModalOpen(true);
  const closeAddModal = () => setIsAddModalOpen(false);
  const [show, setShow] = useState<{ [key: string]: boolean }>({});
  const [resetKey, setResetKey] = useState(0);
  const openUpdateModal = (group: DeploymentGroup) => {
    setSelectedDeploymentGroup(group);
    setIsUpdateModalOpen(true);
  };

  const [type, setType] = useState<string | null>(null);

  const typeOptions = [
    { value: "REGULAR", label: "REGULAR" },
    { value: "ADHOC", label: "ADHOC" },
  ];

  const handleSelectChange =
    (setter: React.Dispatch<React.SetStateAction<string | null>>) =>
    (selectedOption: any) => {
      setter(selectedOption ? selectedOption.value : null);
    };

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

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setSearchValue(newValue);
  };

  useEffect(() => {
    fetchDeploymentGroups();
  }, []);

  const handleSearch = async () => {
    try {
      const response = await deploymentGroupService.searchDeploymentGroups(
        name || "",
        type || ""
      );
      setDeploymentGroups(response.data as DeploymentGroup[]);
      ToastManager.success("Success", "Search completed successfully.");
    } catch (error) {
      const errorMessage = handleError(
        error,
        "Error fetching Deployment Groups"
      );
      ToastManager.error("Error fetching Deployment Groups", errorMessage);
    }
  };

  const fetchDeploymentGroups = async () => {
    try {
      const response = await deploymentGroupService.getAll<DeploymentGroup>()
        .request;
      setDeploymentGroups(response.data || []);
    } catch (error) {
      ToastManager.error(
        "Error Fetching Deployment Groups",
        (error as Error).message
      );
    }
  };

  const handleSearchByReleasedVersion = async (
    releasedVersions: Record<string, string>
  ) => {
    try {
      const response = await deploymentGroupService.search({
        releasedVersions,
      });
      ToastManager.success("Success", "Search completed successfully.");
    } catch (error) {
      ToastManager.error("Error during search", (error as Error).message);
    }
  };

  return (
    <Box padding="4" boxShadow="lg" borderRadius="md">
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

          <FormControl id="type" w="190px">
            <FormLabel fontWeight="bold">Type</FormLabel>
            <Select
              key={`type-${resetKey}`}
              placeholder="Select"
              options={typeOptions}
              onChange={handleSelectChange(setType)}
              value={
                typeOptions.find((option) => option.value === type) ?? null
              }
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
          <Button colorScheme="teal" onClick={openAddModal} mt={3}>
            Add Group
          </Button>
        </Flex>
      </Flex>
      <Stack spacing={4}>
        <Flex ml={100}>OR</Flex>
        <SearchByReleasedVersion
          checkboxLabel="Search By Released Version"
          onSearch={handleSearchByReleasedVersion}
        />
      </Stack>

      <Table colorScheme="gray" mt="15px">
        <Thead backgroundColor="white">
          <Tr>
            <Th boxShadow="md">Name</Th>
            <Th boxShadow="md">Type</Th>
            <Th boxShadow="md">Description</Th>
            <Th boxShadow="md">Action</Th>
          </Tr>
        </Thead>
        <Tbody>
          {deploymentGroups.length === 0 ? (
            <Tr>
              <Td colSpan={4}>No matching deployment groups found.</Td>
            </Tr>
          ) : (
            deploymentGroups.map((group) => (
              <>
                <Tr key={group.name} _hover={{ bg: "gray.100" }}>
                  <Td>
                    <Link
                      onClick={(event) => handleToggle(event, group.name)}
                      style={{ cursor: "pointer", color: "#3182ce" }}
                    >
                      {group.name}
                    </Link>
                  </Td>
                  <Td>{group.type}</Td>
                  <Td>{group.description ? group.description : "-"}</Td>
                  <Td>
                    <FaEdit
                      color="#4299e1"
                      style={{ cursor: "pointer" }}
                      title="Edit Deployment Group"
                      size="1.5em"
                      onClick={() => openUpdateModal(group)}
                    />
                  </Td>
                </Tr>
                {show[group.name] && (
                  <Tr>
                    <Td colSpan={2}>
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
                            {group.releaseVersions.map(({ name, version }) => (
                              <Tr key={name} _hover={{ bg: "gray.100" }}>
                                <Td>{name}</Td>
                                <Td>{version ? version : "-"}</Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </Box>
                    </Td>
                  </Tr>
                )}
              </>
            ))
          )}
        </Tbody>
      </Table>

      <DeploymentGroupModal isOpen={isAddModalOpen} onClose={closeAddModal} />
      <DeploymentGroupUpdateModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        name={selectedDeploymentGroup?.name || ""}
        id={selectedDeploymentGroup?.id || 0}
        description={selectedDeploymentGroup?.description || ""}
        releaseVersions={selectedDeploymentGroup?.releaseVersions || []}
      />
    </Box>
  );
};

export default DeploymentGroups;
