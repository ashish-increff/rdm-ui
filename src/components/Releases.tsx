import React, { useState, useEffect } from "react";
import {
  Box,
  FormControl,
  FormLabel,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  useColorModeValue,
  useTheme,
  useColorMode,
} from "@chakra-ui/react";
import Select from "react-select";
import componentService from "../services/component-service";
import releaseService from "../services/release-service";
import ToastManager from "../utils/ToastManager";
import { getTableStyles } from "./Styles";
import { Component, Release } from "../utils/Modal";

const Releases = () => {
  const [components, setComponents] = useState<Component[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(
    null
  );
  const [selectedReleaseType, setSelectedReleaseType] = useState<string | null>(
    null
  );
  const [releases, setReleases] = useState<Release[]>([]);
  const [filteredReleases, setFilteredReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const colorScheme = useColorModeValue("blue", "teal");
  const { colorMode } = useColorMode();
  const tableStyles = getTableStyles(colorMode);

  const fetchComponents = async () => {
    try {
      const { request } = componentService.getAll<Component>();
      const response = await request;
      setComponents(response.data); // Assuming response.data contains the array of components
    } catch (error) {
      ToastManager.error("Error Loading Components", (error as Error).message);
    }
  };

  const fetchReleases = async (componentName: string) => {
    setLoading(true);
    try {
      const response = await releaseService.getByComponentName<Release[]>(
        componentName
      );
      setReleases(response.data); // Assuming response.data contains the array of releases
      setFilteredReleases(response.data);
    } catch (error) {
      ToastManager.error("Error Loading Releases", (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const filterReleases = (type: string | null) => {
    if (type === null) {
      setFilteredReleases(releases);
    } else {
      setFilteredReleases(
        releases.filter((release) => release.releaseType === type)
      );
    }
  };

  useEffect(() => {
    fetchComponents();
  }, []);

  useEffect(() => {
    if (selectedComponent) {
      fetchReleases(selectedComponent);
      setSelectedReleaseType(null); // Reset release type when component changes
    }
  }, [selectedComponent]);

  useEffect(() => {
    filterReleases(selectedReleaseType);
  }, [selectedReleaseType, releases]);

  return (
    <Box p={4} bg={useTheme().colors.background} color={useTheme().colors.text}>
      <HStack align="start" spacing={4}>
        <FormControl width="200px">
          <FormLabel>Component</FormLabel>
          <Select
            value={
              selectedComponent
                ? { label: selectedComponent, value: selectedComponent }
                : null
            }
            onChange={(option) =>
              setSelectedComponent(option ? option.value : null)
            }
            options={components.map((c) => ({
              label: c.name,
              value: c.name,
            }))}
          />
        </FormControl>
        <FormControl width="200px" isDisabled={!selectedComponent}>
          <FormLabel>Release Type</FormLabel>

          <Select
            value={
              selectedReleaseType
                ? { label: selectedReleaseType, value: selectedReleaseType }
                : null
            }
            onChange={(option) =>
              setSelectedReleaseType(option ? option.value : null)
            }
            options={[
              { label: "SPRINT", value: "SPRINT" },
              { label: "FEATURE", value: "FEATURE" },
              { label: "BUG_FIX", value: "BUG_FIX" },
            ]}
            isClearable
            isDisabled={!selectedComponent}
          />
        </FormControl>
      </HStack>
      <Box mt={8}>
        {loading ? (
          <Spinner size="xl" />
        ) : (
          <Table colorScheme="gray">
            <Thead backgroundColor="white">
              <Tr>
                <Th boxShadow="md">Name</Th>
                <Th boxShadow="md">Version</Th>
                <Th boxShadow="md">Release Type</Th>
                <Th boxShadow="md">Description</Th>
                <Th boxShadow="md">Contains Bug</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredReleases.length > 0 ? (
                filteredReleases.map((release, index) => (
                  <Tr key={index} _hover={{ bg: "gray.100" }}>
                    <Td>{release.name}</Td>
                    <Td>{release.componentVersion}</Td>
                    <Td>{release.releaseType}</Td>
                    <Td
                      sx={{
                        maxWidth: "300px",
                        whiteSpace: "pre-wrap",
                        wordWrap: "break-word",
                      }}
                    >
                      {release.description ? release.description : "-"}
                    </Td>
                    <Td color={release.containsBug ? "red.500" : "inherit"}>
                      {release.containsBug ? "Yes" : "No"}
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan={5}>No data to show</Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        )}
      </Box>
    </Box>
  );
};

export default Releases;
