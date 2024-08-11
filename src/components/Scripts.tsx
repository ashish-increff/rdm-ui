import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Grid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useTheme,
  Flex,
} from "@chakra-ui/react";
import Select, { SingleValue } from "react-select";
import scriptService from "../services/script-service";
import deploymentGroupService from "../services/deployment-group-service";
import ToastManager from "../utils/ToastManager";
import { DeploymentGroup, Script } from "../utils/Modal";

const Scripts = () => {
  const theme = useTheme();
  const [deploymentGroups, setDeploymentGroups] = useState<DeploymentGroup[]>(
    []
  );
  const [selectedSourceGroup, setSelectedSourceGroup] = useState<string | null>(
    null
  );
  const [selectedDestinationGroup, setSelectedDestinationGroup] = useState<
    string | null
  >(null);
  const [selectedScriptType, setSelectedScriptType] = useState<string | null>(
    null
  );
  const [scripts, setScripts] = useState<Script[]>([]);

  const scriptTypes = [
    { value: "PRE_MIGRATION", label: "PRE_MIGRATION" },
    { value: "MIGRATION", label: "MIGRATION" },
    { value: "POST_MIGRATION", label: "POST_MIGRATION" },
    { value: "VALIDATION", label: "VALIDATION" },
    { value: "POST_VALIDATION", label: "POST_VALIDATION" },
  ];

  useEffect(() => {
    fetchData();
    handleSearch({}); // Call handleSearch with an empty object when the component loads
  }, []);

  const fetchData = async () => {
    try {
      const deploymentGroupsResponse = await deploymentGroupService.search({
        name: null,
        releasedVersions: null,
      });
      setDeploymentGroups(deploymentGroupsResponse.data);
    } catch (error) {
      ToastManager.error("Error loading data", (error as Error).message);
    }
  };

  const handleSelectChange =
    (setter: React.Dispatch<React.SetStateAction<string | null>>) =>
    (selectedOption: SingleValue<{ value: string; label: string }>) => {
      setter(selectedOption ? selectedOption.value : null);
    };

  const handleSearch = async (searchParams = {}) => {
    try {
      const response = await scriptService.search({
        sourceDeploymentGroupName: selectedSourceGroup,
        destinationDeploymentGroupName: selectedDestinationGroup,
        scriptType: selectedScriptType,
        ...searchParams, // Spread searchParams to allow custom params
      });
      setScripts(response.data);
      ToastManager.success("Sucess", "Scripts loaded successfully");
    } catch (error) {
      ToastManager.error("Error searching scripts", (error as Error).message);
    }
  };

  const openAddScriptModal = () => {
    // Logic to open modal for adding a new script
  };

  return (
    <Box
      padding="4"
      boxShadow="lg"
      bg={theme.colors.gray[50]}
      borderRadius="md"
    >
      <Grid templateColumns="repeat(4, 1fr)" gap={4} mb={4}>
        <FormControl>
          <FormLabel fontWeight="bold">Source Deployment Group</FormLabel>
          <Select
            options={deploymentGroups.map((group) => ({
              value: group.name,
              label: group.name,
            }))}
            isClearable
            onChange={handleSelectChange(setSelectedSourceGroup)}
          />
        </FormControl>
        <FormControl>
          <FormLabel fontWeight="bold">Destination Deployment Group</FormLabel>
          <Select
            options={deploymentGroups.map((group) => ({
              value: group.name,
              label: group.name,
            }))}
            isClearable
            onChange={handleSelectChange(setSelectedDestinationGroup)}
          />
        </FormControl>
        <FormControl>
          <FormLabel fontWeight="bold">Script Type</FormLabel>
          <Select
            options={scriptTypes}
            isClearable
            onChange={handleSelectChange(setSelectedScriptType)}
          />
        </FormControl>
        <Flex alignItems="end">
          <Button colorScheme="blue" onClick={() => handleSearch()} mr="15px">
            Search
          </Button>
          <Button colorScheme="green" onClick={openAddScriptModal}>
            Add Script
          </Button>
        </Flex>
      </Grid>

      <Table colorScheme="gray" mt="40px">
        <Thead backgroundColor="white">
          <Tr>
            <Th boxShadow="md">Source Deployment Group</Th>
            <Th boxShadow="md">Destination Deployment Group</Th>
            <Th boxShadow="md">Script Type</Th>
            <Th boxShadow="md">Link</Th>
          </Tr>
        </Thead>
        <Tbody>
          {scripts.length === 0 ? (
            <Tr>
              <Td colSpan={4}>No scripts found</Td>
            </Tr>
          ) : (
            scripts.map((script, index) => (
              <Tr key={index} _hover={{ bg: "gray.100" }}>
                <Td>{script.sourceDeploymentGroupName}</Td>
                <Td>{script.destinationDeploymentGroupName}</Td>
                <Td>{script.scriptType}</Td>
                <Td>
                  <a
                    href={script.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "underline", color: "blue" }}
                  >
                    {script.link}
                  </a>
                </Td>
              </Tr>
            ))
          )}
        </Tbody>
      </Table>
    </Box>
  );
};

export default Scripts;
