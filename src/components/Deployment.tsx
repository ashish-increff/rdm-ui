import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  SimpleGrid,
  Input,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Td,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Text,
} from "@chakra-ui/react";
import { IoTimer } from "react-icons/io5";
import Select, { SingleValue } from "react-select";
import instanceService from "../services/instance-service";
import deploymentGroupService from "../services/deployment-group-service";
import { handleError } from "../utils/ErrorHandler";
import ToastManager from "../utils/ToastManager";
import { formatISO } from "date-fns";
import { DeploymentGroup, Instance } from "../utils/Modal"; // Adjust this import according to your type structure
import deploymentService from "../services/deployment-service";
import downtimeService from "../services/downtime-service";
import { CustomTh } from "../utils/CustomComponents";

const Deployment = () => {
  const [deploymentGroups, setDeploymentGroups] = useState<DeploymentGroup[]>(
    []
  );
  const [instances, setInstances] = useState<Instance[]>([]);
  const [selectedSourceGroup, setSelectedSourceGroup] = useState<SingleValue<{
    value: number;
    label: string;
  }> | null>(null);
  const [selectedDestinationGroup, setSelectedDestinationGroup] =
    useState<SingleValue<{ value: number; label: string }> | null>(null);
  const [selectedInstance, setSelectedInstance] = useState<SingleValue<{
    value: number;
    label: string;
  }> | null>(null);
  const [isUrgent, setIsUrgent] = useState<boolean | null>(null);
  const [status, setStatus] = useState<string>("READY_FOR_DEPLOYMENT");
  const [startDownTime, setStartDownTime] = useState<string>("");
  const [endDownTime, setEndDownTime] = useState<string>("");
  const [deploymentData, setDeploymentData] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedDeployment, setSelectedDeployment] = useState<any>(null); // Store selected deployment for downtime request
  const [requestedStartTime, setRequestedStartTime] = useState<string>("");
  const [requestedEndTime, setRequestedEndTime] = useState<string>("");
  const toast = useToast();

  useEffect(() => {
    const fetchData = async () => {
      await fetchDeploymentGroups();
      await fetchInstances();
      handleSearch(); // Trigger search after fetching groups and instances
    };
    fetchData();
  }, []);

  const fetchDeploymentGroups = async () => {
    try {
      const { request } = deploymentGroupService.getAll<DeploymentGroup>();
      const response = await request;
      setDeploymentGroups(response.data);
    } catch (error) {
      const errorMessage = handleError(
        error,
        "Error fetching deployment groups"
      );
      ToastManager.error("Error fetching deployment groups", errorMessage);
    }
  };

  const formatDateToLocal = (dateString?: string) => {
    if (!dateString) return "--";
    return new Date(dateString).toLocaleString();
  };

  const fetchInstances = async () => {
    try {
      const response = await instanceService.getAll().request;
      setInstances(response.data as Instance[]);
    } catch (error) {
      const errorMessage = handleError(error, "Error fetching instances");
      ToastManager.error("Error fetching instances", errorMessage);
    }
  };

  const handleSearch = async () => {
    const requestBody = {
      sourceDeploymentGroupId: selectedSourceGroup
        ? selectedSourceGroup.value
        : null,
      destinationDeploymentGroupId: selectedDestinationGroup
        ? selectedDestinationGroup.value
        : null,
      instanceId: selectedInstance ? selectedInstance.value : null,
      isUrgent,
      status,
      startDownTime: startDownTime ? formatISO(new Date(startDownTime)) : null,
      endDownTime: endDownTime ? formatISO(new Date(endDownTime)) : null,
    };

    try {
      const response = await deploymentService.search(requestBody);
      setDeploymentData(response.data);
      ToastManager.success("Success", "Deployment data fetched successfully");
    } catch (error) {
      const errorMessage = handleError(error, "Error searching deployments");
      ToastManager.error("Error searching deployments", errorMessage);
    }
  };

  const handleDowntimeRequest = async () => {
    if (selectedDeployment) {
      const requestBody = {
        deploymentId: selectedDeployment.id,
        requestedStartTime: requestedStartTime
          ? formatISO(new Date(requestedStartTime))
          : null,
        requestedEndTime: requestedEndTime
          ? formatISO(new Date(requestedEndTime))
          : null,
      };

      try {
        await downtimeService.create(requestBody);
        ToastManager.success("Success", "Downtime requested successfully");
        setIsModalOpen(false);
        // Optionally, reset requested times
        setRequestedStartTime("");
        setRequestedEndTime("");
      } catch (error) {
        const errorMessage = handleError(error, "Error requesting downtime");
        ToastManager.error("Error requesting downtime", errorMessage);
      }
    }
  };
  const statuses = [
    { value: "CREATED", label: "CREATED" },
    { value: "MIGRATION_AWAITED", label: "MIGRATION_AWAITED" },
    { value: "READY_FOR_DOWNTIME", label: "READY_FOR_DOWNTIME" },
    { value: "DOWNTIME_REQUESTED", label: "DOWNTIME_REQUESTED" },
    { value: "READY_FOR_DEPLOYMENT", label: "READY_FOR_DEPLOYMENT" },
    { value: "DOWNTIME_BREACHED", label: "DOWNTIME_BREACHED" },
    { value: "ON_HOLD", label: "ON_HOLD" },
    { value: "PROCESSING", label: "PROCESSING" },
    { value: "COMPLETED", label: "COMPLETED" },
    { value: "FAILED", label: "FAILED" },
    { value: "CANCELLED", label: "CANCELLED" },
  ];

  return (
    <Box p={4}>
      <SimpleGrid columns={{ base: 1, md: 5 }} spacing={4}>
        <FormControl>
          <FormLabel>Instance</FormLabel>
          <Select
            placeholder="Select Instance"
            options={instances.map((group) => ({
              value: group.id,
              label: group.name,
            }))}
            onChange={setSelectedInstance}
            isClearable
          />
        </FormControl>
        <FormControl>
          <FormLabel>Source Deployment Group</FormLabel>
          <Select
            placeholder="Select Source Group"
            options={deploymentGroups.map((group) => ({
              value: group.id,
              label: group.name,
            }))}
            onChange={setSelectedSourceGroup}
            isClearable
          />
        </FormControl>

        <FormControl>
          <FormLabel>Destination Deployment Group</FormLabel>
          <Select
            placeholder="Select Destination Group"
            options={deploymentGroups.map((group) => ({
              value: group.id,
              label: group.name,
            }))}
            onChange={setSelectedDestinationGroup}
            isClearable
          />
        </FormControl>

        <FormControl>
          <FormLabel> Urgent</FormLabel>
          <Select
            placeholder="Select urgency"
            options={[
              { value: true, label: "Yes" },
              { value: false, label: "No" },
            ]}
            onChange={(selectedOption) =>
              setIsUrgent(selectedOption?.value ?? null)
            }
            isClearable
          />
        </FormControl>

        <FormControl>
          <FormLabel>Status</FormLabel>
          <Select
            placeholder="Select status"
            options={statuses} // Add more options as necessary
            value={{ value: status, label: status }}
            onChange={(selectedOption) =>
              setStatus(selectedOption?.value ?? "")
            }
            isClearable
          />
        </FormControl>

        <FormControl>
          <FormLabel>Start Down Time</FormLabel>
          <Input
            type="datetime-local"
            value={startDownTime}
            onChange={(e) => setStartDownTime(e.target.value)}
          />
        </FormControl>

        <FormControl>
          <FormLabel>End Down Time</FormLabel>
          <Input
            type="datetime-local"
            value={endDownTime}
            onChange={(e) => setEndDownTime(e.target.value)}
          />
        </FormControl>

        <Button
          onClick={handleSearch}
          colorScheme="blue"
          mt={8}
          maxWidth="300px"
          mr={20}
        >
          Search
        </Button>
      </SimpleGrid>

      <Box mt={10}>
        {/* Display count of items */}
        <Box mb={4} textAlign="right">
          Showing{" "}
          <Text as="span" fontWeight="bold" fontSize="2xl">
            {deploymentData.length}
          </Text>{" "}
          {deploymentData.length === 1 ? "result" : "results"}
        </Box>
        <Table variant="simple">
          <Thead>
            <Tr>
              <CustomTh>ID</CustomTh>
              <CustomTh>Instance</CustomTh>
              <CustomTh>Source Deployment Group</CustomTh>
              <CustomTh>Destination Deployment Group</CustomTh>
              <CustomTh>Status</CustomTh>
              <CustomTh>Urgent</CustomTh>
              <CustomTh>Start Downtime</CustomTh>
              <CustomTh>End Downtime</CustomTh>
              <CustomTh>Start Time</CustomTh>
              <CustomTh>End Time</CustomTh>
              <CustomTh>Actions</CustomTh>
            </Tr>
          </Thead>
          <Tbody>
            {deploymentData.length === 0 ? (
              <Tr>
                <Td colSpan={11}>No matching deployments found</Td>
              </Tr>
            ) : (
              deploymentData.map((data) => (
                <Tr key={data.id} _hover={{ bg: "gray.100" }}>
                  <Td>{data.id}</Td>
                  <Td>{data.instanceName}</Td>
                  <Td>
                    {data.sourceDeploymentGroupName
                      ? data.sourceDeploymentGroupName
                      : "-"}
                  </Td>
                  <Td>{data.destinationDeploymentGroupName}</Td>
                  <Td>{data.status}</Td>
                  <Td>{data.isUrgent ? "Yes" : "No"}</Td>
                  <Td>
                    {data.startDownTime
                      ? formatDateToLocal(data.startDownTime)
                      : "-"}
                  </Td>
                  <Td>
                    {data.endDownTime
                      ? formatDateToLocal(data.endDownTime)
                      : "-"}
                  </Td>
                  <Td>
                    {data.startTime ? formatDateToLocal(data.startTime) : "-"}
                  </Td>
                  <Td>
                    {data.endTime ? formatDateToLocal(data.endTime) : "-"}
                  </Td>
                  <Td>
                    <IoTimer
                      color="#4299e1"
                      style={{ cursor: "pointer" }}
                      title="Request Downtime"
                      size="1.7em"
                      onClick={() => {
                        setSelectedDeployment(data);
                        setIsModalOpen(true);
                      }}
                    />
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Box>

      {/* Details Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Request Downtime</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box
              maxW="6xl"
              mx="auto"
              p={6}
              borderWidth={1}
              borderRadius="lg"
              boxShadow="lg"
            >
              <FormControl mb={4}>
                <FormLabel>Instance</FormLabel>
                <Input value={selectedDeployment?.instanceName} isDisabled />
              </FormControl>
              <FormControl mb={4}>
                <FormLabel>ID</FormLabel>
                <Input value={selectedDeployment?.id} isDisabled />
              </FormControl>
              <FormControl mb={4}>
                <FormLabel>Requested Start Time</FormLabel>
                <Input
                  type="datetime-local"
                  value={requestedStartTime}
                  onChange={(e) => setRequestedStartTime(e.target.value)}
                />
              </FormControl>
              <FormControl mb={4}>
                <FormLabel>Requested End Time</FormLabel>
                <Input
                  type="datetime-local"
                  value={requestedEndTime}
                  onChange={(e) => setRequestedEndTime(e.target.value)}
                />
              </FormControl>
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => setIsModalOpen(false)} mr={3}>
              Close
            </Button>
            <Button onClick={handleDowntimeRequest} colorScheme="blue">
              Submit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Deployment;
