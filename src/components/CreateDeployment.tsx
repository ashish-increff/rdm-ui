import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Grid,
  Select,
  useTheme,
} from "@chakra-ui/react";
import deploymentGroupService from "../services/deployment-group-service";
import ToastManager from "../utils/ToastManager";
import { DeploymentGroup } from "../utils/Modal";

const CreateDeployment = () => {
  const theme = useTheme();
  const [deploymentGroups, setDeploymentGroups] = useState<DeploymentGroup[]>(
    []
  );
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  useEffect(() => {
    fetchDeploymentGroups();
  }, []);

  const fetchDeploymentGroups = async () => {
    try {
      const response = await deploymentGroupService.search({
        name: null,
        releasedVersions: null,
      });
      setDeploymentGroups(response.data);
    } catch (error) {
      ToastManager.error(
        "Error loading deployment groups",
        (error as Error).message
      );
    }
  };

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedGroup(event.target.value);
  };

  const handleSubmit = () => {
    if (selectedGroup) {
      ToastManager.success(
        "Success",
        `Selected Deployment Group: ${selectedGroup}`
      );
      // Additional logic for submitting the selected deployment group
    } else {
      ToastManager.error("Error", "Please select a deployment group");
    }
  };

  return (
    <Box padding="4" maxW="md" mx="auto">
      <FormControl mb={4}>
        <FormLabel fontWeight="bold">Deployment Group</FormLabel>
        <Select
          placeholder="Select Deployment Group"
          onChange={handleSelectChange}
          value={selectedGroup || ""}
        >
          {deploymentGroups.map((group) => (
            <option key={group.name} value={group.name}>
              {group.name}
            </option>
          ))}
        </Select>
      </FormControl>

      <Button colorScheme="blue" onClick={handleSubmit}>
        Submit
      </Button>
    </Box>
  );
};

export default CreateDeployment;
