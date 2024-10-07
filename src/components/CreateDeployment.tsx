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
import deploymentService from "../services/deployment-service"; // Import your deployment service
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
    { instance: null, isUrgent: false },
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
    setInstanceData([...instanceData, { instance: null, isUrgent: false }]);
  };

  const handleRemoveInstance = (index: number) => {
    const newInstanceData = [...instanceData];
    newInstanceData.splice(index, 1);
    setInstanceData(newInstanceData);
  };

  const isAddInstanceButtonDisabled = () => {
    return instanceData.some(
      (data) => data.instance === null || data.isUrgent === null
    );
  };

  const handleCreateDeployments = async () => {
    if (!selectedGroup) {
      ToastManager.error("Error", "Please select a deployment group.");
      return;
    }

    const deploymentPayload = {
      destinationDeploymentGroupId: parseInt(selectedGroup, 10),
      isDeploymentRequiredForAllClients: instanceSelection === "all",
      instanceDeploymentForms:
        instanceSelection === "selected"
          ? instanceData.map((data) => ({
              instanceId: parseInt(data.instance.value, 10),
              isUrgent: data.isUrgent,
            }))
          : [],
    };

    try {
      await deploymentService.create(deploymentPayload);
      ToastManager.success("Success", "Deployments created successfully.");

      // Reset the form state
      setSelectedGroup(null);
      setInstanceSelection("selected");
      setInstanceData([{ instance: null, isUrgent: false }]); // Reset instance data to initial state
    } catch (error) {
      ToastManager.error("Error", (error as Error).message);
    }
  };

  // Format deployment groups into the required format for react-select
  const formattedDeploymentGroups = deploymentGroups.map((group) => ({
    value: group.id.toString(),
    label: group.name,
  }));

  // Format instances similarly
  const formattedInstances = instances.map((instance) => ({
    value: instance.id.toString(),
    label: instance.name,
  }));

  // Get already selected instances
  const selectedInstanceValues = instanceData
    .filter((data) => data.instance)
    .map((data) => data.instance.value);

  // Filter out already selected instances
  const availableInstances = formattedInstances.filter(
    (instance) => !selectedInstanceValues.includes(instance.value)
  );

  return (
    <Box padding="4" maxW="lg">
      <VStack spacing={4} align="start" w="100%">
        <VStack spacing={4} align="start" w="100%">
          <FormControl>
            <HStack align="center" spacing={8} w="100%">
              <FormLabel fontWeight="bold" minW="150px">
                Deployment Group
              </FormLabel>
              <Box flex="1">
                <Select
                  placeholder="Select Deployment Group"
                  options={formattedDeploymentGroups}
                  onChange={handleSelectChange}
                  value={
                    formattedDeploymentGroups.find(
                      (group) => group.value === selectedGroup
                    ) || null
                  }
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
                  <Stack direction="row" spacing={2}>
                    <Radio value="selected" ml={2}>
                      Selected Instances
                    </Radio>
                    <Radio value="all">All Instances</Radio>
                  </Stack>
                </RadioGroup>
              </Box>
            </HStack>
          </FormControl>
        </VStack>

        {instanceSelection === "selected" && (
          <VStack align="start" w="100%">
            <HStack spacing={4} align="center" w="100%" pl="195px">
              <Box flex="2" textAlign="center">
                <FormLabel fontWeight="bold">Instances</FormLabel>
              </Box>
              <Box flex="1.5" textAlign="center" minWidth="400px" pl="220px">
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
                    options={availableInstances} // Use filtered options
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
                      { value: true, label: "True" },
                      { value: false, label: "False" },
                    ]}
                    value={{
                      value: data.isUrgent,
                      label: data.isUrgent.toString(),
                    }}
                    onChange={(option) =>
                      handleInstanceDataChange(index, "isUrgent", option?.value)
                    }
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
                isDisabled={isAddInstanceButtonDisabled() || !selectedGroup} // Disable if no group selected
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
              isDisabled={!selectedGroup} // Disable if no group selected
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
