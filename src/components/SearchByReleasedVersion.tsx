import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Flex,
  Checkbox,
  IconButton,
  VStack,
  Stack,
} from "@chakra-ui/react";
import Select, { SingleValue } from "react-select";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import componentService from "../services/component-service";
import releaseService from "../services/release-service";
import ToastManager from "../utils/ToastManager";
import { Component, Release } from "../utils/Modal";

type OptionType = {
  value: string;
  label: string;
};

interface SearchByReleasedVersionProps {
  checkboxLabel?: string;
  onSearch: (releasedVersions: Record<string, string>) => Promise<void>;
  onUncheck?: () => void; // New prop to handle uncheck logic
  onCheck?: () => void; // Optional check handler
}

const SearchByReleasedVersion: React.FC<SearchByReleasedVersionProps> = ({
  checkboxLabel = "Search By Released Version",
  onSearch,
  onUncheck, // Optional uncheck handler
  onCheck,
}) => {
  const [components, setComponents] = useState<Component[]>([]);
  const [releaseOptions, setReleaseOptions] = useState<
    Record<string, OptionType[]>
  >({});
  const [searchByVersion, setSearchByVersion] = useState(false);
  const [componentReleaseGroups, setComponentReleaseGroups] = useState<
    { id: number; component: string; release: string }[]
  >([{ id: 1, component: "", release: "" }]);

  useEffect(() => {
    fetchComponents();
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

  const handleSearch = async () => {
    const releasedVersions = componentReleaseGroups.reduce((acc, group) => {
      if (group.release !== "") {
        const componentVersion = group.release.split(":")[0].trim();
        acc[group.component] = componentVersion;
      }
      return acc;
    }, {} as Record<string, string>);

    await onSearch(releasedVersions);
  };

  const handleCheckboxChange = () => {
    if (searchByVersion) {
      // Checkbox is being unchecked
      if (onUncheck) onUncheck(); // Call the uncheck handler if provided
    } else {
      // Checkbox is being checked
      handleCheck();
      if (onCheck) onCheck(); // Call the check handler if provided
    }
    setSearchByVersion(!searchByVersion);
  };

  const handleCheck = () => {
    // Logic for when the checkbox is checked
    setComponentReleaseGroups([{ id: 1, component: "", release: "" }]);
  };

  return (
    <Box>
      <Stack spacing={4}>
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
          <span>{checkboxLabel}</span>
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
                      handleSelectChange(option, index, "component")
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
                      handleSelectChange(option, index, "release")
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
                colorScheme="teal"
                leftIcon={<AddIcon />}
                mr={2}
                isDisabled={componentReleaseGroups.some(
                  (group) => !group.component || !group.release
                )}
              >
                Component
              </Button>
              <Button
                onClick={handleSearch}
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
    </Box>
  );
};

export default SearchByReleasedVersion;
