import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Input,
  Grid,
  FormControl,
  FormLabel,
  useTheme,
  Flex,
  Text as ChakraText,
  Stack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
} from "@chakra-ui/react";
import { FaEdit } from "react-icons/fa";
import Select, { SingleValue } from "react-select";
import componentService from "../services/component-service";
import releaseService from "../services/release-service";
import deploymentGroupService from "../services/deployment-group-service";
import DeploymentGroupModal from "./DeploymentGroupModal";
import {
  Component,
  Release,
  SearchDeploymentGroup,
  DeploymentGroup,
} from "../utils/Modal";
import ToastManager from "../utils/ToastManager";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";

const Deployment = () => {
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
  const [selectedReleases, setSelectedReleases] = useState<
    Record<string, string>
  >({});
  const [deploymentGroups, setDeploymentGroups] = useState<DeploymentGroup[]>(
    []
  ); // Always initialize as an empty array
  const [loadingDeployments, setLoadingDeployments] = useState<boolean>(false); // State for loading

  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);
  const initialSelects = [
    { id: 1, value1: "Component1", value2: "v1.0" },
    { id: 2, value1: "Component2", value2: "v2.0" },
  ];

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
        [componentName]: [{ value: "All", label: "All" }, ...options],
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

  const handleSelectChange = (
    selectedOption: SingleValue<OptionType>,
    componentName: string
  ) => {
    if (selectedOption) {
      setSelectedReleases((prev) => ({
        ...prev,
        [componentName]:
          selectedOption.value === "All" ? "All" : selectedOption.value,
      }));
    } else {
      setSelectedReleases((prev) => ({
        ...prev,
        [componentName]: "All",
      }));
    }
  };

  const handleSubmit = async (type?: "release" | "name") => {
    let name: string | null = null;
    let releasedVersions: Record<string, string> | null = null;

    if (type === "release") {
      releasedVersions = Object.keys(selectedReleases).reduce((acc, key) => {
        const selectedValue = selectedReleases[key];
        if (selectedValue !== "All") {
          const componentVersion = selectedValue.split(":")[0].trim();
          acc[key] = componentVersion;
        }
        return acc;
      }, {} as Record<string, string>);
    } else if (type === "name") {
      name = searchValue;
    }

    setLoadingDeployments(true); // Start loading
    try {
      const response =
        await deploymentGroupService.search<SearchDeploymentGroup>({
          name,
          releasedVersions,
        });
      setDeploymentGroups(response.data || []); // Ensure response data is always an array
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
      setLoadingDeployments(false); // Stop loading
    }
  };

  return (
    <Box
      padding="4"
      boxShadow="lg"
      bg={theme.colors.gray[50]}
      borderRadius="md"
    >
      {loadingComponents ? null : ( // <Spinner size="sm" />
        <Grid
          templateColumns={[
            "repeat(1, 1fr)",
            "repeat(4, 1fr)",
            "repeat(6, 1fr)",
          ]}
          gap={4}
          alignItems="start"
          w="full"
        >
          {components.map((component, i) => (
            <FormControl key={i}>
              <FormLabel fontWeight="bold">{component.name}</FormLabel>
              {loadingReleases[component.name] ? null : ( // <Spinner size="sm" />
                <Select
                  placeholder="All"
                  options={
                    releaseOptions[component.name] || [
                      { value: "All", label: "All" },
                    ]
                  }
                  isClearable
                  isSearchable
                  menuPlacement="auto"
                  menuShouldScrollIntoView={true}
                  onChange={(option) =>
                    handleSelectChange(option, component.name)
                  }
                />
              )}
            </FormControl>
          ))}

          <Button
            onClick={() => handleSubmit("release")}
            colorScheme="blue"
            alignSelf="end"
            maxWidth="80px"
          >
            Search
          </Button>
        </Grid>
      )}
      <Flex justifyContent="center" alignItems="center" my={4}>
        <ChakraText mx={2}>OR</ChakraText>
      </Flex>

      <Stack mb={4}>
        <FormLabel fontWeight="bold" mb="0">
          Name
        </FormLabel>
        <Flex>
          <Input
            placeholder="Deployment Group Name"
            maxW="230px"
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
      </Stack>

      {loadingDeployments ? null : ( // <Spinner size="xl" />
        <Table colorScheme="gray">
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
            {deploymentGroups.length === 0 ? (
              <Tr>
                <Td colSpan={5}>No matching Deployment Group Found</Td>
              </Tr>
            ) : (
              deploymentGroups.map((group, index) => (
                <Tr key={index} _hover={{ bg: "gray.100" }}>
                  {" "}
                  {/* Row hover effect */}
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
                    <IconButton
                      aria-label="Edit"
                      icon={<FaEdit />}
                      size="sm"
                      variant="ghost"
                    />
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      )}
      <DeploymentGroupModal
        isOpen={isOpen}
        onClose={closeModal}
        modalHeader="Add Deployment Group"
      />
    </Box>
  );
};

export default Deployment;
