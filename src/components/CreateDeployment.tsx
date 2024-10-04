import React, { useState, useEffect } from "react";
import {
  Box,
  FormControl,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  Button,
  useTheme,
  HStack,
  VStack,
  IconButton,
} from "@chakra-ui/react";
import Select from "react-select";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import deploymentGroupService from "../services/deployment-group-service";
import instanceService from "../services/instance-service";
import ToastManager from "../utils/ToastManager";
import { DeploymentGroup, Instance } from "../utils/Modal";

const CreateDeployment = () => {
  const theme = useTheme();
  const [deploymentGroups, setDeploymentGroups] = useState<DeploymentGroup[]>(
    []
  );
  const [instances, setInstances] = useState<Instance[]>([]);

  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [instanceSelection, setInstanceSelection] =
    useState<string>("selected");
  const [instanceData, setInstanceData] = useState<any[]>([
    { instance: null, scriptRequired: "True", isUrgent: "False" },
  ]);

  useEffect(() => {
    fetchDeploymentGroups();
    fetchInstances();
  }, []);

  const fetchDeploymentGroups = async () => {
    try {
      const { request } = deploymentGroupService.getAll<DeploymentGroup>();
      const response = await request;
      setDeploymentGroups(response.data);
    } catch (error) {
      ToastManager.error(
        "Error loading deployment groups",
        (error as Error).message
      );
    }
  };

  const fetchInstances = async () => {
    try {
      const { request } = instanceService.getAll<Instance>();
      const response = await request;
      setInstances(response.data);
    } catch (error) {
      ToastManager.error("Error loading instances", (error as Error).message);
    }
  };

  const handleSelectChange = (selectedOption: any) => {
    setSelectedGroup(selectedOption ? selectedOption.value : null);
  };

  const handleInstanceSelectionChange = (value: string) => {
    setInstanceSelection(value);
  };

  const handleInstanceDataChange = (
    index: number,
    field: string,
    value: any
  ) => {
    const newInstanceData = [...instanceData];
    newInstanceData[index][field] = value;
    setInstanceData(newInstanceData);
  };

  const handleAddInstance = () => {
    setInstanceData([
      ...instanceData,
      { instance: null, scriptRequired: "True", isUrgent: "False" },
    ]);
  };

  const handleRemoveInstance = (index: number) => {
    const newInstanceData = [...instanceData];
    newInstanceData.splice(index, 1);
    setInstanceData(newInstanceData);
  };

  const isAddInstanceButtonDisabled = () => {
    return instanceData.some(
      (data) =>
        data.instance === null ||
        data.scriptRequired === null ||
        data.isUrgent === null
    );
  };

  const handleCreateDeployments = () => {
    ToastManager.success(
      "Success",
      "Creating deployments for all instances..."
    );
    // Add your deployment creation logic here
  };

  return (
    <Box padding="4" maxW="lg">
      <VStack spacing={4} align="start" w="100%">
        {/* Upper Section with Deployment Group Select and Radio Buttons */}
        <VStack spacing={4} align="start" w="100%">
          <FormControl>
            <HStack align="center" spacing={8} w="100%">
              <FormLabel fontWeight="bold" minW="150px">
                Deployment Group
              </FormLabel>
              <Box flex="1">
                <Select
                  placeholder="Select Deployment Group"
                  options={deploymentGroups.map((group) => ({
                    value: group.name,
                    label: group.name,
                  }))}
                  onChange={handleSelectChange}
                  styles={{
                    container: (base) => ({ ...base, width: "100%" }),
                    control: (base) => ({ ...base, minWidth: "300px" }),
                  }}
                />
              </Box>
            </HStack>
          </FormControl>

          <FormControl>
            <HStack align="center" spacing={8} w="100%">
              <FormLabel fontWeight="bold" minW="142px">
                Required For
              </FormLabel>
              <Box flex="1">
                <RadioGroup
                  onChange={handleInstanceSelectionChange}
                  value={instanceSelection}
                >
                  <Stack direction="row" spacing={4}>
                    <Radio value="selected">Selected Instances</Radio>
                    <Radio value="all">All Instances</Radio>
                  </Stack>
                </RadioGroup>
              </Box>
            </HStack>
          </FormControl>
        </VStack>

        {/* Lower Section with Instances, Script Required, Is Urgent */}
        {instanceSelection === "selected" && (
          <VStack align="start" w="100%">
            {/* Headings for the select groups */}
            <HStack spacing={4} align="center" w="100%" pl="195px">
              <Box flex="2" textAlign="center">
                <FormLabel fontWeight="bold">Instances</FormLabel>
              </Box>
              <Box flex="1.5" textAlign="center" minWidth="400px" pl="235px">
                <FormLabel fontWeight="bold">Is Urgent</FormLabel>
              </Box>
            </HStack>

            {instanceData.map((data, index) => (
              <HStack
                key={index}
                spacing={4}
                align="center"
                w="100%"
                pl="195px"
              >
                <Box flex="2">
                  <Select
                    placeholder="Select Instance"
                    options={instances.map((instance) => ({
                      value: instance.name,
                      label: instance.name,
                    }))}
                    value={data.instance}
                    onChange={(option) =>
                      handleInstanceDataChange(index, "instance", option)
                    }
                    styles={{
                      container: (base) => ({ ...base, width: "100%" }),
                      control: (base) => ({ ...base, minWidth: "300px" }),
                    }}
                  />
                </Box>

                <Box flex="1">
                  <Select
                    options={[
                      { value: "True", label: "True" },
                      { value: "False", label: "False" },
                    ]}
                    value={{
                      value: data.isUrgent,
                      label: data.isUrgent,
                    }}
                    onChange={(option) =>
                      handleInstanceDataChange(index, "isUrgent", option?.value)
                    }
                    defaultValue={{ value: "False", label: "False" }}
                    styles={{
                      container: (base) => ({ ...base, width: "100%" }),
                      control: (base) => ({ ...base, minWidth: "150px" }),
                    }}
                  />
                </Box>
                {instanceData.length > 1 && (
                  <IconButton
                    aria-label="Delete instance"
                    icon={<DeleteIcon />}
                    onClick={() => handleRemoveInstance(index)}
                  />
                )}
              </HStack>
            ))}
            <HStack mt={4} pl="195px">
              <Button
                leftIcon={<AddIcon />}
                colorScheme="teal"
                onClick={handleAddInstance}
                isDisabled={isAddInstanceButtonDisabled()}
                width={180}
              >
                Instance
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleCreateDeployments}
                ml={4}
                isDisabled={isAddInstanceButtonDisabled()}
              >
                Create Deployments
              </Button>
            </HStack>
          </VStack>
        )}

        {instanceSelection === "all" && (
          <HStack align="center" spacing={8}>
            <FormLabel minW="150px" />
            <Button
              flex="1"
              colorScheme="blue"
              onClick={handleCreateDeployments}
            >
              Create Deployments
            </Button>
          </HStack>
        )}
      </VStack>
    </Box>
  );
};

export default CreateDeployment;
