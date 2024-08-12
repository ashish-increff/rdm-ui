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
import Select, { SingleValue } from "react-select";
import { FaEdit } from "react-icons/fa";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
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

  const getFilteredComponents = (index: number) => {
    const selectedComponents = componentReleaseGroups.map(
      (group) => group.component
    );

    return components
      .filter(
        (component) =>
          !selectedComponents.includes(component.name) ||
          component.name === componentReleaseGroups[index].component
      )
      .map((component) => ({
        value: component.name,
        label: component.name,
      }));
  };

  const handleSelectChange = (
    selectedOption: SingleValue<OptionType>,
    componentName: string,
    index: number,
    field: "component" | "release"
  ) => {
    const newGroups = [...componentReleaseGroups];

    if (field === "component") {
      newGroups[index].component = selectedOption ? selectedOption.value : "";
      newGroups[index].release = ""; // Reset release when component changes
    } else {
      newGroups[index].release = selectedOption ? selectedOption.value : "";
    }

    setComponentReleaseGroups(newGroups);
  };

  const handleAddComponent = () => {
    if (
      !componentReleaseGroups.some(
        (group) => !group.component || !group.release
      )
    ) {
      setComponentReleaseGroups([
        ...componentReleaseGroups,
        { id: componentReleaseGroups.length + 1, component: "", release: "" },
      ]);
    }
  };

  const handleRemoveComponent = (id: number) => {
    setComponentReleaseGroups(
      componentReleaseGroups.filter((group) => group.id !== id)
    );
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

  const handleCheckboxChange = () => {
    if (!searchByVersion) {
      // Checkbox is being checked, reset the selections
      setComponentReleaseGroups([{ id: 1, component: "", release: "" }]);
      setSearchValue("");
    } else {
      // Checkbox is being unchecked, fetch the default data
      handleSubmit();
    }
    setSearchByVersion(!searchByVersion);
  };

  return (
    <Box
      padding="4"
      boxShadow="lg"
      bg={theme.colors.gray[50]}
      borderRadius="md"
    >
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
          <Button colorScheme="green" onClick={openModal}>
            Add Group
          </Button>
        </Flex>

        <Flex alignItems="center">
          <Checkbox
            isChecked={searchByVersion}
            onChange={handleCheckboxChange}
            mr={2}
            ml={2}
            sx={{
              "& .chakra-checkbox__control": {
                borderColor: searchByVersion ? "transparent" : "black", // Black border when unchecked, transparent when checked
                borderWidth: "2px", // Set the border width
              },
            }}
          />
          <span onClick={(e) => e.preventDefault()}>
            Search By Released Version
          </span>
        </Flex>

        {searchByVersion && (
          <VStack spacing={4} align="start">
            {componentReleaseGroups.map((group, index) => (
              <Flex key={group.id} align="center" width="full">
                <div style={{ width: "220px", marginRight: "10px" }}>
                  <Select
                    placeholder="Select Component"
                    options={getFilteredComponents(index)}
                    value={
                      group.component
                        ? { value: group.component, label: group.component }
                        : null
                    }
                    onChange={(option) =>
                      handleSelectChange(
                        option,
                        group.component,
                        index,
                        "component"
                      )
                    }
                  />
                </div>
                <div style={{ width: "220px" }}>
                  <Select
                    placeholder="Select Release"
                    options={releaseOptions[group.component] || []}
                    value={
                      group.release
                        ? { value: group.release, label: group.release }
                        : null
                    }
                    isDisabled={!group.component}
                    onChange={(option) =>
                      handleSelectChange(
                        option,
                        group.component,
                        index,
                        "release"
                      )
                    }
                  />
                </div>
                {index > 0 && (
                  <IconButton
                    aria-label="Remove"
                    icon={<DeleteIcon />}
                    ml={2}
                    onClick={() => handleRemoveComponent(group.id)}
                  />
                )}
              </Flex>
            ))}
            <Flex width="full" align="center">
              <Button
                onClick={handleAddComponent}
                leftIcon={<AddIcon />}
                mr={2}
                isDisabled={componentReleaseGroups.some(
                  (group) => !group.component || !group.release
                )}
              >
                Add Component
              </Button>
              <Button
                onClick={() => handleSubmit("release")}
                colorScheme="blue"
                isDisabled={componentReleaseGroups.some(
                  (group) => !group.component || !group.release
                )}
              >
                Search
              </Button>
            </Flex>
          </VStack>
        )}
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
                <Td>{group.description}</Td>
                <Td>{group.remarks}</Td>
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
