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
import ToastManager from "../utils/ToastManager";
import { DeploymentGroup } from "../utils/Modal";

const CreateDeployment = () => {
  const theme = useTheme();
  const [deploymentGroups, setDeploymentGroups] = useState<DeploymentGroup[]>(
    []
  );
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [clientSelection, setClientSelection] = useState<string>("selected");
  const [clientData, setClientData] = useState<any[]>([
    { client: null, scriptRequired: "True", isUrgent: "False" },
  ]);

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

  const handleSelectChange = (selectedOption: any) => {
    setSelectedGroup(selectedOption ? selectedOption.value : null);
  };

  const handleClientSelectionChange = (value: string) => {
    setClientSelection(value);
  };

  const handleClientDataChange = (index: number, field: string, value: any) => {
    const newClientData = [...clientData];
    newClientData[index][field] = value;
    setClientData(newClientData);
  };

  const handleAddClient = () => {
    setClientData([
      ...clientData,
      { client: null, scriptRequired: "True", isUrgent: "False" },
    ]);
  };

  const handleRemoveClient = (index: number) => {
    const newClientData = [...clientData];
    newClientData.splice(index, 1);
    setClientData(newClientData);
  };

  const isAddClientButtonDisabled = () => {
    return clientData.some(
      (data) =>
        data.client === null ||
        data.scriptRequired === null ||
        data.isUrgent === null
    );
  };

  const handleCreateDeployments = () => {
    ToastManager.success("Success", "Creating deployments for all clients...");
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
              <FormLabel fontWeight="bold" minW="150px">
                Required For
              </FormLabel>
              <Box flex="1">
                <RadioGroup
                  onChange={handleClientSelectionChange}
                  value={clientSelection}
                >
                  <Stack direction="row" spacing={4}>
                    <Radio value="selected">Selected Clients</Radio>
                    <Radio value="all">All Clients</Radio>
                  </Stack>
                </RadioGroup>
              </Box>
            </HStack>
          </FormControl>
        </VStack>

        {/* Lower Section with Clients, Script Required, Is Urgent */}
        {clientSelection === "selected" && (
          <VStack align="start" w="100%">
            {/* Headings for the select groups */}
            <HStack spacing={4} align="center" w="100%" pl="190px">
              <Box flex="2" textAlign="center">
                <FormLabel fontWeight="bold">Clients</FormLabel>
              </Box>
              <Box flex="1.5" textAlign="center" minWidth="400px" pl="235px">
                <FormLabel fontWeight="bold">Script Required</FormLabel>
              </Box>
              <Box flex="1" textAlign="center" minWidth="150px">
                <FormLabel fontWeight="bold">Is Urgent</FormLabel>
              </Box>
            </HStack>

            {clientData.map((data, index) => (
              <HStack
                key={index}
                spacing={4}
                align="center"
                w="100%"
                pl="185px"
              >
                <Box flex="2">
                  <Select
                    placeholder="Select Client"
                    options={deploymentGroups.map((group) => ({
                      value: group.name,
                      label: group.name,
                    }))}
                    value={data.client}
                    onChange={(option) =>
                      handleClientDataChange(index, "client", option)
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
                      value: data.scriptRequired,
                      label: data.scriptRequired,
                    }}
                    onChange={(option) =>
                      handleClientDataChange(
                        index,
                        "scriptRequired",
                        option?.value
                      )
                    }
                    defaultValue={{ value: "True", label: "True" }}
                    styles={{
                      container: (base) => ({ ...base, width: "100%" }),
                      control: (base) => ({ ...base, minWidth: "150px" }),
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
                      handleClientDataChange(index, "isUrgent", option?.value)
                    }
                    defaultValue={{ value: "False", label: "False" }}
                    styles={{
                      container: (base) => ({ ...base, width: "100%" }),
                      control: (base) => ({ ...base, minWidth: "150px" }),
                    }}
                  />
                </Box>
                {clientData.length > 1 && (
                  <IconButton
                    aria-label="Delete client"
                    icon={<DeleteIcon />}
                    onClick={() => handleRemoveClient(index)}
                  />
                )}
              </HStack>
            ))}
            <HStack mt={4} pl="185px">
              <Button
                leftIcon={<AddIcon />}
                colorScheme="teal"
                onClick={handleAddClient}
                isDisabled={isAddClientButtonDisabled()}
                width={180}
              >
                Client
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleCreateDeployments}
                ml={4}
              >
                Create Deployment
              </Button>
            </HStack>
          </VStack>
        )}

        {clientSelection === "all" && (
          <HStack align="center" spacing={8}>
            <FormLabel minW="150px" />
            <Button
              flex="1"
              colorScheme="blue"
              onClick={handleCreateDeployments}
              isDisabled={isAddClientButtonDisabled()}
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
