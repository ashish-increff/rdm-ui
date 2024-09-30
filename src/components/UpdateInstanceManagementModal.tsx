import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Input,
  useToast,
  Box,
  Radio,
  RadioGroup,
} from "@chakra-ui/react";
import instanceService from "../services/instance-service";
import { handleError } from "../utils/ErrorHandler";
import ToastManager from "../utils/ToastManager";

interface UpdateInstanceManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateSuccess: () => void;
  instanceId: number;
  instanceName: string;
  primaryPocEmail: string;
  secondaryPocEmail: string;
  deploymentOnHold: boolean;
}

const UpdateInstanceManagementModal: React.FC<
  UpdateInstanceManagementModalProps
> = ({
  isOpen,
  onClose,
  onUpdateSuccess,
  instanceId,
  instanceName,
  primaryPocEmail,
  secondaryPocEmail,
  deploymentOnHold,
}) => {
  const toast = useToast();

  const [formData, setFormData] = useState({
    primaryPocEmail: primaryPocEmail,
    secondaryPocEmail: secondaryPocEmail,
    deploymentOnHold: deploymentOnHold ? "True" : "False", // Store as string
  });

  useEffect(() => {
    // Reset form data when modal opens
    setFormData({
      primaryPocEmail: primaryPocEmail,
      secondaryPocEmail: secondaryPocEmail,
      deploymentOnHold: deploymentOnHold ? "True" : "False",
    });
  }, [isOpen, primaryPocEmail, secondaryPocEmail, deploymentOnHold]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (value: string) => {
    setFormData((prev) => ({ ...prev, deploymentOnHold: value }));
  };

  const handleSubmit = async () => {
    try {
      await instanceService.updateInstanceManagement(
        instanceId,
        formData.primaryPocEmail,
        formData.secondaryPocEmail,
        formData.deploymentOnHold === "True" // Convert back to boolean
      );
      ToastManager.success(
        "Success",
        "Instance management updated successfully."
      );
      onUpdateSuccess();
      onClose();
    } catch (error) {
      const errorMessage = handleError(
        error,
        "Error updating instance management"
      );
      ToastManager.error("Error", errorMessage);
    }
  };

  // Validation function to check if all required fields are filled
  const isFormValid = () => {
    return formData.primaryPocEmail.trim() !== "";
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      closeOnOverlayClick={false}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Update Instance Management</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box
            maxW="2xl"
            mx="auto"
            p={6}
            borderWidth={1}
            borderRadius="lg"
            boxShadow="lg"
          >
            <FormLabel>Instance</FormLabel>
            <Input mb={3} value={instanceName} disabled />
            <FormControl isRequired>
              <FormLabel>Primary POC Email</FormLabel>
              <Input
                name="primaryPocEmail"
                value={formData.primaryPocEmail}
                onChange={handleChange}
                placeholder="Enter Primary POC Email"
                type="email"
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Secondary POC Email</FormLabel>
              <Input
                name="secondaryPocEmail"
                value={formData.secondaryPocEmail}
                onChange={handleChange}
                placeholder="Enter Secondary POC Email"
                type="email"
              />
            </FormControl>
            <FormControl mt={4} isRequired>
              <FormLabel>Deployment On Hold</FormLabel>
              <RadioGroup
                value={formData.deploymentOnHold}
                onChange={handleRadioChange}
                mt={2}
              >
                <Radio value="True" mr={3}>
                  True
                </Radio>
                <Radio value="False">False</Radio>
              </RadioGroup>
            </FormControl>
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="gray" onClick={onClose} mr={3}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isDisabled={!isFormValid()}
          >
            Submit
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UpdateInstanceManagementModal;
