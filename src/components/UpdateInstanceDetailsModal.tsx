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
  HStack,
  Box, // Import HStack
} from "@chakra-ui/react";
import instanceService from "../services/instance-service";
import { handleError } from "../utils/ErrorHandler";
import ToastManager from "../utils/ToastManager";

interface UpdateInstanceDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateSuccess: () => void;
  instanceId: number;
  instanceName: string;
  sqlMachineName: string;
  gceBucket: string;
  apiUrl: string;
  urlMap: string;
  authDomain: string;
  projectId: string;
  zoneId: string;
  orgId: string;
}

const UpdateInstanceDetailsModal: React.FC<UpdateInstanceDetailsModalProps> = ({
  isOpen,
  onClose,
  onUpdateSuccess,
  instanceId,
  instanceName,
  sqlMachineName,
  gceBucket,
  apiUrl,
  urlMap,
  authDomain,
  projectId,
  zoneId,
  orgId,
}) => {
  const toast = useToast();

  const [formData, setFormData] = useState({
    sqlMachineName,
    gceBucket,
    apiUrl,
    urlMap,
    authDomain,
    projectId,
    zoneId,
    orgId,
  });

  useEffect(() => {
    // Reset form data when modal opens
    setFormData({
      sqlMachineName,
      gceBucket,
      apiUrl,
      urlMap,
      authDomain,
      projectId,
      zoneId,
      orgId,
    });
  }, [
    isOpen,
    sqlMachineName,
    gceBucket,
    apiUrl,
    urlMap,
    authDomain,
    projectId,
    zoneId,
    orgId,
  ]);

  // Validation function to check if all required fields are filled
  const isFormValid = () => {
    return (
      formData.sqlMachineName !== "" &&
      formData.gceBucket !== "" &&
      formData.apiUrl !== "" &&
      formData.urlMap !== "" &&
      formData.authDomain !== "" &&
      formData.projectId !== "" &&
      formData.zoneId !== "" &&
      formData.orgId !== ""
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      await instanceService.updateInstanceDetails(instanceId, formData);
      ToastManager.success("Success", "Instance details updated successfully.");
      onUpdateSuccess();
      onClose();
    } catch (error) {
      const errorMessage = handleError(
        error,
        "Error updating instance details"
      );
      ToastManager.error("Error", errorMessage);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      closeOnOverlayClick={false}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Update Instance Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box
            maxW="4xl"
            mx="auto"
            p={6}
            borderWidth={1}
            borderRadius="lg"
            boxShadow="lg"
          >
            <FormLabel>Instance</FormLabel>
            <Input mb={3} value={instanceName} disabled />

            {Object.keys(formData).map((key, index) => {
              // Create pairs of fields
              if (index % 2 === 0) {
                return (
                  <HStack spacing={4} key={key}>
                    <FormControl isRequired>
                      <FormLabel mt={3}>
                        {key.charAt(0).toUpperCase() +
                          key.slice(1).replace(/([A-Z])/g, " $1")}
                      </FormLabel>
                      <Input
                        name={key}
                        value={formData[key as keyof typeof formData]}
                        onChange={handleChange}
                        placeholder={`Enter ${
                          key.charAt(0).toUpperCase() + key.slice(1)
                        }`}
                        type="text"
                      />
                    </FormControl>
                    {index + 1 < Object.keys(formData).length && (
                      <FormControl isRequired>
                        <FormLabel>
                          {Object.keys(formData)
                            [index + 1].charAt(0)
                            .toUpperCase() +
                            Object.keys(formData)
                              [index + 1].slice(1)
                              .replace(/([A-Z])/g, " $1")}
                        </FormLabel>
                        <Input
                          name={Object.keys(formData)[index + 1]}
                          value={
                            formData[
                              Object.keys(formData)[
                                index + 1
                              ] as keyof typeof formData
                            ]
                          }
                          onChange={handleChange}
                          placeholder={`Enter ${
                            Object.keys(formData)
                              [index + 1].charAt(0)
                              .toUpperCase() +
                            Object.keys(formData)[index + 1].slice(1)
                          }`}
                          type="text"
                        />
                      </FormControl>
                    )}
                  </HStack>
                );
              }
              return null; // No need to return anything for odd indices
            })}
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

export default UpdateInstanceDetailsModal;
