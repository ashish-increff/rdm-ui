import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Input,
  Flex,
  Checkbox,
  IconButton,
  VStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Stack,
  useTheme,
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

const DeploymentGroups = () => {
  const theme = useTheme();
  const [components, setComponents] = useState<Component[]>([]);
  const [releaseOptions, setReleaseOptions] = useState<
    Record<string, OptionType[]>
  >({});
  const [loadingComponents, setLoadingComponents] = useState<boolean>(true);
  const [loadingReleases, setLoadingReleases] = useState<
    Record<string, boolean>
  >({});
  const [searchValue, setSearchValue] = useState("");
  const [deploymentGroups, setDeploymentGroups] = useState<DeploymentGroup[]>(
    []
  );
  const [loadingDeployments, setLoadingDeployments] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchByVersion, setSearchByVersion] = useState(false);
  const [componentReleaseGroups, setComponentReleaseGroups] = useState<
    { id: number; component: string; release: string }[]
  >([{ id: 1, component: "", release: "" }]);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

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
      setLoadingComponents(false);

      response.data.forEach((component) => {
        fetchReleases(component.name);
      });
    } catch (error) {
      console.error(error);
      ToastManager.error("Error Loading Components", (error as Error).message);
      setLoadingComponents(false);
    }
  };

  const fetchReleases = async (componentName: string) => {
    setLoadingReleases((prevState) => ({
      ...prevState,
      [componentName]: true,
    }));

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
    } finally {
      setLoadingReleases((prevState) => ({
        ...prevState,
        [componentName]: false,
      }));
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

    setLoadingDeployments(true);
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
    } finally {
      setLoadingDeployments(false);
    }
  };

  const handleSearchByReleasedVersion = async (
    releasedVersions: Record<string, string>
  ) => {
    try {
      const response = await deploymentGroupService.search({
        releasedVersions,
      });
      // handle the response as needed
      ToastManager.success("Success", "Search completed successfully.");
    } catch (error) {
      ToastManager.error("Error during search", (error as Error).message);
    }
  };

  return (
    <Box padding="4" boxShadow="lg" borderRadius="md">
      <Stack spacing={4}>
        <Flex>
          <Input
            placeholder="Deployment Group Name"
            maxW="220px"
            mr={4}
            backgroundColor="white"
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

        <SearchByReleasedVersion
          checkboxLabel="Search By Released Version"
          onSearch={handleSearchByReleasedVersion}
        />
      </Stack>

      <Table colorScheme="gray" mt="15px">
        <Thead backgroundColor="white">
          <Tr>
            <Th boxShadow="md">Name</Th>
            <Th boxShadow="md">Released Versions</Th>
            <Th boxShadow="md">Description</Th>
            <Th boxShadow="md">Remarks</Th>
            <Th boxShadow="md">Action</Th>
          </Tr>
        </Thead>
        <Tbody>
          {loadingDeployments ? (
            // You can show a loading message or leave this block empty to just show an empty table until data loads
            <Tr>
              <Td colSpan={5} textAlign="center">
                Loading...
              </Td>
            </Tr>
          ) : (
            deploymentGroups.map((group) => (
              <Tr key={group.name} _hover={{ bg: "gray.100" }}>
                <Td>{group.name}</Td>
                <Td>
                  {Object.entries(group.releasedVersions).map(
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
            ))
          )}
        </Tbody>
      </Table>

      <DeploymentGroupModal isOpen={isOpen} onClose={closeModal} />
    </Box>
  );
};

export default DeploymentGroups;
