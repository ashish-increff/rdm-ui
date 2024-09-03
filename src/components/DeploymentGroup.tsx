import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Input,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Stack,
  useTheme,
  Link,
} from "@chakra-ui/react";
import { FaEdit } from "react-icons/fa";
import componentService from "../services/component-service";
import releaseService from "../services/release-service";
import deploymentGroupService from "../services/deployment-group-service";
import DeploymentGroupModal from "./DeploymentGroupModal";
import ToastManager from "../utils/ToastManager";
import {
  Component,
  Release,
  SearchDeploymentGroup,
  DeploymentGroup,
} from "../utils/Modal";
import SearchByReleasedVersion from "./SearchByReleasedVersion";
import { CustomInput, CustomTh } from "../utils/CustomComponents";

const DeploymentGroups = () => {
  const theme = useTheme();
  const [components, setComponents] = useState<Component[]>([]);
  const [releaseOptions, setReleaseOptions] = useState<
    Record<string, OptionType[]>
  >({});
  const [searchValue, setSearchValue] = useState("");
  const [deploymentGroups, setDeploymentGroups] = useState<DeploymentGroup[]>(
    []
  );
  const [isOpen, setIsOpen] = useState(false);
  const [searchByVersion, setSearchByVersion] = useState(false);
  const [componentReleaseGroups, setComponentReleaseGroups] = useState<
    { id: number; component: string; release: string }[]
  >([{ id: 1, component: "", release: "" }]);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);
  const [show, setShow] = useState<{ [key: string]: boolean }>({});

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
    fetchComponents();
    handleSubmit();
  }, []);

  const fetchComponents = async () => {
    try {
      const response = await componentService.getAll<Component>().request;
      setComponents(response.data);

      response.data.forEach((component) => {
        fetchReleases(component.name);
      });
    } catch (error) {
      console.error(error);
      ToastManager.error("Error Loading Components", (error as Error).message);
    }
  };

  const fetchReleases = async (componentName: string) => {
    try {
      const response = await releaseService.getByComponentName<Release[]>(
        componentName
      );
      const releases = response.data;
      const options = releases.map((release) => ({
        value: release.componentVersion + ": " + release.name,
        label: release.componentVersion + ": " + release.name,
      }));

      setReleaseOptions((prevOptions) => ({
        ...prevOptions,
        [componentName]: [...options],
      }));
    } catch (error) {
      ToastManager.error("Error Loading Releases", (error as Error).message);
    }
  };

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
        await deploymentGroupService.search<SearchDeploymentGroup>({
          name,
          releasedVersions,
        });
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
          <Button colorScheme="teal" onClick={openModal}>
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
            <Th boxShadow="md">Description</Th>
            <Th boxShadow="md">Remarks</Th>
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

                <Td>{group.description ? group.description : "-"}</Td>
                <Td>{group.remarks ? group.remarks : "-"}</Td>
                <Td>
                  <Button
                    size="sm"
                    leftIcon={<FaEdit />}
                    onClick={() => console.log("Edit")}
                  ></Button>
                </Td>
              </Tr>
              {show[group.name] && (
                <Tr>
                  <Td colSpan={8}>
                    <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
                      <Table variant="simple" backgroundColor="white">
                        <Thead>
                          <Tr>
                            <CustomTh>Component</CustomTh>
                            <CustomTh>Version</CustomTh>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {Object.entries(group.releasedVersions).map(
                            ([key, value]) => (
                              <Tr key={key} _hover={{ bg: "gray.100" }}>
                                <Td>{key}</Td>
                                <Td>{value}</Td>
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
          ))}
        </Tbody>
      </Table>

      <DeploymentGroupModal isOpen={isOpen} onClose={closeModal} />
    </Box>
  );
};

export default DeploymentGroups;
