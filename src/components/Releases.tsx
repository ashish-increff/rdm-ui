import React, { useState, useEffect } from "react";
import {
  Box,
  FormControl,
  FormLabel,
  HStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  useTheme,
  useColorMode,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  useColorModeValue,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import componentService from "../services/component-service";
import releaseService from "../services/release-service";
import ToastManager from "../utils/ToastManager";
import { getTableStyles } from "./Styles";
import { Component, Release } from "../utils/Modal";

interface CustomMenuProps {
  label: string;
  selected: string | null;
  options: string[];
  onChange: (value: string) => void;
  isDisabled?: boolean;
}

const CustomMenu: React.FC<CustomMenuProps> = ({
  label,
  selected,
  options,
  onChange,
  isDisabled = false,
}) => {
  const theme = useTheme();
  const { colorMode } = useColorMode();

  return (
    <FormControl width="200px" isDisabled={isDisabled}>
      <FormLabel
        mb={2}
        color={
          colorMode === "dark" ? theme.colors.white : theme.colors.gray[700]
        }
      >
        {label}
      </FormLabel>
      <Menu>
        <MenuButton
          as={Button}
          bg={
            colorMode === "dark"
              ? theme.colors.gray[800]
              : theme.colors.gray[100]
          }
          borderColor={
            colorMode === "dark"
              ? theme.colors.gray[600]
              : theme.colors.gray[300]
          }
          _hover={{
            borderColor:
              colorMode === "dark"
                ? theme.colors.gray[500]
                : theme.colors.gray[400],
            bg:
              colorMode === "dark"
                ? theme.colors.gray[700]
                : theme.colors.gray[200],
          }}
          _active={{
            bg:
              colorMode === "dark"
                ? theme.colors.gray[600]
                : theme.colors.gray[300],
          }}
          borderWidth="1px"
          borderRadius="md"
          textAlign="left"
          width="100%"
          rightIcon={<ChevronDownIcon />}
          color={
            colorMode === "dark" ? theme.colors.white : theme.colors.gray[700]
          }
          isDisabled={isDisabled}
        >
          {selected || `Select ${label}`}
        </MenuButton>
        <MenuList
          bg={
            colorMode === "dark" ? theme.colors.gray[800] : theme.colors.white
          }
          borderColor={theme.colors.gray[300]}
          borderWidth="1px"
          borderRadius="md"
          boxShadow="md"
        >
          {options.map((option) => (
            <MenuItem
              key={option}
              onClick={() => onChange(option)}
              _hover={{
                bg:
                  colorMode === "dark"
                    ? theme.colors.gray[600]
                    : theme.colors.gray[100],
              }}
              color={
                colorMode === "dark"
                  ? theme.colors.white
                  : theme.colors.gray[700]
              }
            >
              {option}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    </FormControl>
  );
};

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
    if (type === "ALL" || type === null) {
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
        <CustomMenu
          label="Component"
          selected={selectedComponent}
          options={components.map((c) => c.name)}
          onChange={setSelectedComponent}
        />
        <CustomMenu
          label="Release Type"
          selected={selectedReleaseType}
          options={["SPRINT", "FEATURE", "BUG_FIX", "ALL"]}
          onChange={setSelectedReleaseType}
          isDisabled={!selectedComponent}
        />
      </HStack>
      <Box mt={8}>
        {loading ? (
          <Spinner size="xl" />
        ) : (
          <Table colorScheme={colorScheme} sx={tableStyles}>
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>Version</Th>
                <Th>Release Type</Th>
                <Th>Description</Th>
                <Th>Contains Bug</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredReleases.length > 0 ? (
                filteredReleases.map((release, index) => (
                  <Tr key={index}>
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
