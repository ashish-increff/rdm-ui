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
} from "@chakra-ui/react";
import { FaEdit } from "react-icons/fa";
import deploymentGroupService from "../services/deployment-group-service";
import DeploymentGroupModal from "./DeploymentGroupModal";
import DeploymentGroupUpdateModal from "./DeploymentGroupUpdateModal";
import ToastManager from "../utils/ToastManager";
import { DeploymentGroup } from "../utils/Modal";
import SearchByReleasedVersion from "./SearchByReleasedVersion";
import { CustomInput, CustomTh } from "../utils/CustomComponents";

const DeploymentGroups = () => {
  const [searchValue, setSearchValue] = useState("");
  const [deploymentGroups, setDeploymentGroups] = useState<DeploymentGroup[]>(
    []
  );
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

  const openUpdateModal = (group: DeploymentGroup) => {
    setSelectedDeploymentGroup(group);
    setIsUpdateModalOpen(true);
    console.log("selectedDeploymentGroup", selectedDeploymentGroup?.name);
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

  type OptionType = {
    value: string;
    label: string;
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setSearchValue(newValue);
  };

  useEffect(() => {
    handleSubmit();
  }, []);

  const handleSubmit = async (type?: "release" | "name") => {
    let name: string | null = null;
    let releasedVersions: Record<string, string> | null = null;

    if (type === "release") {
      releasedVersions = componentReleaseGroups.reduce((acc, group) => {
        if (group.release !== "") {
          const componentVersion = group.release.split(":")[0].trim();
          acc[group.component] = componentVersion;
        }
        return acc;
      }, {} as Record<string, string>);
    } else if (type === "name") {
      name = searchValue;
      setSearchByVersion(false);
    }

    try {
      const response =
        // await deploymentGroupService.search<SearchDeploymentGroup>({
        //   name,
        //   releasedVersions,
        // });
        await deploymentGroupService.getAll<DeploymentGroup>().request;
      setDeploymentGroups(response.data || []);
      if (type === "name" || type === "release") {
        ToastManager.success(
          "Success",
          "Deployment Groups Loaded Successfully"
        );
      }
    } catch (error) {
      ToastManager.error(
        "Error Searching Deployment Groups",
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
      <Stack spacing={4}>
        <Flex>
          <CustomInput
            placeholder="Deployment Group Name"
            maxW="220px"
            mr={4}
            value={searchValue}
            onChange={handleInputChange}
          />
          <Button
            colorScheme="blue"
            mr="15px"
            isDisabled={!searchValue}
            onClick={() => handleSubmit("name")}
          >
            Search
          </Button>
          <Button colorScheme="teal" onClick={openAddModal}>
            Add Group
          </Button>
        </Flex>
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
          {deploymentGroups.map((group) => (
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
                    onClick={() => openUpdateModal(group)} // Pass the current group to the function
                  />
                </Td>
              </Tr>
              {show[group.name] && (
                <Tr>
                  <Td colSpan={2}>
                    <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
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
          ))}
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
