import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Radio,
  RadioGroup,
  Textarea,
  Button,
  Box,
} from "@chakra-ui/react";
import deploymentService from "../services/deployment-service";
import ToastManager from "../utils/ToastManager";
import { handleError } from "../utils/ErrorHandler";

interface EndDeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  id: number;
  instance: string;
  destinationDeploymentGroup: string;
}

const EndDeploymentModal: React.FC<EndDeploymentModalProps> = ({
  isOpen,
  onClose,
  id,
  instance,
  destinationDeploymentGroup,
}) => {
  const [outcome, setOutcome] = useState<string>(""); // Change from null to empty string
  const [remarks, setRemarks] = useState<string>("");

  const handleEndDeployment = async () => {
    const isSuccessful = outcome === "Success";

    try {
      await deploymentService.endDeployment(id, isSuccessful, remarks);
      ToastManager.success("Success", "Deployment ended successfully");
      onClose();
    } catch (error) {
      const errorMessage = handleError(error, "Error ending deployment");
      ToastManager.error("Error", errorMessage);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>End Deployment</ModalHeader>
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
            <Box mb={4}>
              <FormControl mb={4}>
                <FormLabel>Instance</FormLabel>
                <Input value={instance} isDisabled />
              </FormControl>

              <FormControl mb={4}>
                <FormLabel>Destination Deployment Group</FormLabel>
                <Input value={destinationDeploymentGroup} isDisabled />
              </FormControl>

              <FormControl mb={4}>
                <FormLabel>
                  Outcome <span style={{ color: "red" }}>*</span>
                </FormLabel>
                <RadioGroup onChange={setOutcome} value={outcome}>
                  <Box>
                    <Radio value="Success" mr={4}>
                      Success
                    </Radio>
                    <Radio value="Failure">Failure</Radio>
                  </Box>
                </RadioGroup>
              </FormControl>

              <FormControl mb={4}>
                <FormLabel>Remarks</FormLabel>
                <Textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter your remarks here"
                />
              </FormControl>
            </Box>
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose} mr={3}>
            Close
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleEndDeployment}
            isDisabled={!outcome}
          >
            End
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EndDeploymentModal;
