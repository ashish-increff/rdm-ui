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
  VStack,
} from "@chakra-ui/react";
import { FcApprove } from "react-icons/fc";
import instanceService from "../services/instance-service";
import { Instance, DowntimeData } from "../utils/Modal";
import { handleError } from "../utils/ErrorHandler";
import ToastManager from "../utils/ToastManager";
import { formatISO } from "date-fns";
import Select, { SingleValue } from "react-select";
import { CustomTh } from "../utils/CustomComponents";
import downtimeService from "../services/downtime-service";

const Downtime = () => {
  const [instances, setInstances] = useState<Instance[]>([]);
  const [downtimeData, setDowntimeData] = useState<DowntimeData[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<SingleValue<{
    value: number;
    label: string;
  }> | null>(null);
  const [requestedStartTime, setRequestedStartTime] = useState<string>("");
  const [requestedEndTime, setRequestedEndTime] = useState<string>("");
  const [status, setStatus] = useState<string>("REQUESTED");
  const [deploymentId, setDeploymentId] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedDowntime, setSelectedDowntime] = useState<DowntimeData | null>(
    null
  );
  const [givenStartTime, setGivenStartTime] = useState<string>("");
  const [givenEndTime, setGivenEndTime] = useState<string>("");
  const toast = useToast();

  const options = [
    { value: "REQUESTED", label: "REQUESTED" },
    { value: "APPROVED", label: "APPROVED" },
  ];

  const formatDateToLocal = (dateString?: string) => {
    if (!dateString) return "--";
    return new Date(dateString).toLocaleString();
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchInstances();
      await handleSearch();
    };
    fetchInitialData();
  }, []);

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
      instanceId: selectedInstance ? selectedInstance.value : null,
      requestedStartTime: requestedStartTime
        ? formatISO(new Date(requestedStartTime))
        : null,
      requestedEndTime: requestedEndTime
        ? formatISO(new Date(requestedEndTime))
        : null,
      status: status || null,
      deploymentId: deploymentId || null,
    };

    try {
      const response = await downtimeService.search(requestBody);
      setDowntimeData(response.data as DowntimeData[]);
    } catch (error) {
      const errorMessage = handleError(error, "Error searching downtime");
      ToastManager.error("Error searching downtime", errorMessage);
    }
  };

  const handleOpenModal = (data: DowntimeData) => {
    setSelectedDowntime(data);
    setGivenStartTime("");
    setGivenEndTime("");
    setIsModalOpen(true);
  };

  const handleApprove = async () => {
    const requestBody = {
      givenStartTime: givenStartTime
        ? formatISO(new Date(givenStartTime))
        : null,
      givenEndTime: givenEndTime ? formatISO(new Date(givenEndTime)) : null,
    };

    if (selectedDowntime) {
      try {
        await downtimeService.approveDowntime(selectedDowntime.id, requestBody);
        ToastManager.success("Success", "Downtime approved successfully");
        await handleSearch(); // Refresh the data after approval
        setIsModalOpen(false); // Close the modal
      } catch (error) {
        const errorMessage = handleError(error, "Error approving downtime");
        ToastManager.error("Error approving downtime", errorMessage);
      }
    }
  };

  const isStartButtonDisabled = !givenStartTime || !givenEndTime;

  return (
    <Box p={4}>
      <SimpleGrid columns={{ base: 1, md: 3, lg: 6 }} spacing={4}>
        <FormControl>
          <FormLabel>Instance</FormLabel>
          <Select
            placeholder="Select Instance"
            options={instances.map((instance) => ({
              value: instance.id,
              label: instance.name,
            }))}
            onChange={(newValue) => setSelectedInstance(newValue)}
            isClearable
          />
        </FormControl>

        <FormControl>
          <FormLabel>Requested Start Time</FormLabel>
          <Input
            type="datetime-local"
            value={requestedStartTime}
            onChange={(e) => setRequestedStartTime(e.target.value)}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Requested End Time</FormLabel>
          <Input
            type="datetime-local"
            value={requestedEndTime}
            onChange={(e) => setRequestedEndTime(e.target.value)}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Status</FormLabel>
          <Select
            placeholder="Select status"
            options={options}
            value={options.find((option) => option.value === status)}
            onChange={(selectedOption) =>
              setStatus(selectedOption?.value ?? "")
            }
            isClearable
          />
        </FormControl>

        <FormControl>
          <FormLabel>Deployment ID</FormLabel>
          <Input
            placeholder="Enter Deployment ID"
            value={deploymentId}
            onChange={(e) => setDeploymentId(e.target.value)}
          />
        </FormControl>

        <Button
          onClick={handleSearch}
          colorScheme="blue"
          mt={8}
          width="full" // Full width on mobile
        >
          Search
        </Button>
      </SimpleGrid>

      <Box className="table-container" mt={10} overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <CustomTh>Instance Name</CustomTh>
              <CustomTh>Deployment ID</CustomTh>
              <CustomTh>Requested Start Time</CustomTh>
              <CustomTh>Requested End Time</CustomTh>
              <CustomTh>Given Start Time</CustomTh>
              <CustomTh>Given End Time</CustomTh>
              <CustomTh>Status</CustomTh>
              <CustomTh>Action</CustomTh>
            </Tr>
          </Thead>
          <Tbody>
            {downtimeData.length === 0 ? (
              <Tr>
                <Td colSpan={8}>No matching Downtime Found</Td>
              </Tr>
            ) : (
              downtimeData.map((data) => (
                <Tr key={data.id} _hover={{ bg: "gray.100" }}>
                  <Td>{data.instanceName}</Td>
                  <Td>{data.deploymentId}</Td>
                  <Td>{formatDateToLocal(data.requestedStartTime)}</Td>
                  <Td>{formatDateToLocal(data.requestedEndTime)}</Td>
                  <Td>{formatDateToLocal(data.givenStartTime)}</Td>
                  <Td>{formatDateToLocal(data.givenEndTime)}</Td>
                  <Td>{data.status}</Td>
                  <Td>
                    {data.status === "REQUESTED" ? (
                      <FcApprove
                        color="#4299e1"
                        style={{ cursor: "pointer" }}
                        title="Approve Downtime"
                        size="1.5em"
                        onClick={() => handleOpenModal(data)}
                      />
                    ) : (
                      "-"
                    )}
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Box>

      {/* Approve Downtime Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        closeOnOverlayClick={false}
      >
        <ModalOverlay />
        <ModalContent maxW={{ base: "90%", md: "600px" }}>
          <ModalHeader>Approve Downtime</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Instance Name</FormLabel>
                <Input value={selectedDowntime?.instanceName} isDisabled />
              </FormControl>
              <FormControl>
                <FormLabel>Deployment ID</FormLabel>
                <Input value={selectedDowntime?.deploymentId} isDisabled />
              </FormControl>
              <FormControl>
                <FormLabel>Requested Start Time</FormLabel>
                <Input
                  value={formatDateToLocal(
                    selectedDowntime?.requestedStartTime
                  )}
                  isDisabled
                />
              </FormControl>
              <FormControl>
                <FormLabel>Requested End Time</FormLabel>
                <Input
                  value={formatDateToLocal(selectedDowntime?.requestedEndTime)}
                  isDisabled
                />
              </FormControl>
              <FormControl>
                <FormLabel>
                  Given Start Time <span style={{ color: "red" }}>*</span>
                </FormLabel>
                <Input
                  type="datetime-local"
                  value={givenStartTime}
                  onChange={(e) => setGivenStartTime(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>
                  Given End Time <span style={{ color: "red" }}>*</span>
                </FormLabel>
                <Input
                  type="datetime-local"
                  value={givenEndTime}
                  onChange={(e) => setGivenEndTime(e.target.value)}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button
              colorScheme="blue"
              onClick={handleApprove}
              ml={3}
              isDisabled={isStartButtonDisabled}
            >
              Approve
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Downtime;
