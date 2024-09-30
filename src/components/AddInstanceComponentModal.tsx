import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Select,
  FormControl,
  FormLabel,
  useToast,
  Input,
  Box,
} from "@chakra-ui/react";
import componentService from "../services/component-service";
import instanceService from "../services/instance-service";
import { Component } from "../utils/Modal";
import ToastManager from "../utils/ToastManager";
import { handleError } from "../utils/ErrorHandler";

interface AddInstanceComponentModalProps {
  isOpen: boolean;
  onClose: () => void;
  instanceId: number;
  instanceName: string;
  onAddSuccess: () => void;
}

const AddInstanceComponentModal: React.FC<AddInstanceComponentModalProps> = ({
  isOpen,
  onClose,
  instanceId,
  instanceName,
  onAddSuccess,
}) => {
  const [components, setComponents] = useState<Component[]>([]);
  const [selectedComponents, setSelectedComponents] = useState<string[]>([""]);
  const toast = useToast();

  useEffect(() => {
    const fetchComponents = async () => {
      try {
        const { request } = componentService.getAll<Component>();
        const response = await request;
        setComponents(response.data);
      } catch (error) {
        const errorMessage = handleError(error, "Error fetching components");
        ToastManager.error("Error fetching components", errorMessage);
      }
    };

    fetchComponents();
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Reset selected components when modal opens
      setSelectedComponents([""]);
    }
  }, [isOpen]);

  const handleComponentChange = (index: number, value: string) => {
    const updatedComponents = [...selectedComponents];
    updatedComponents[index] = value;
    setSelectedComponents(updatedComponents);
  };

  const addComponentSelect = () => {
    setSelectedComponents((prev) => [...prev, ""]);
  };

  const handleSubmit = async () => {
    try {
      const componentIds = selectedComponents
        .map(Number)
        .filter((id) => !isNaN(id));

      await instanceService.addInstanceComponents(instanceId, componentIds);
      ToastManager.success(
        "Components added",
        "Components have been successfully added to the instance."
      );
      onAddSuccess();

      onClose(); // Close the modal after success
    } catch (error) {
      const errorMessage = handleError(error, "Error adding components");
      ToastManager.error("Error adding components", errorMessage);
    }
  };

  const getAvailableComponents = (index: number) => {
    const selectedIds = selectedComponents.filter((_, i) => i !== index);
    return components.filter(
      (component) => !selectedIds.includes(String(component.id))
    );
  };

  const isSubmitDisabled = selectedComponents.some(
    (componentId) => !componentId
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      closeOnOverlayClick={false}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Components</ModalHeader>
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
            <FormControl>
              <FormLabel>Instance</FormLabel>
              <Input value={instanceName} disabled />
              <FormLabel mt={3}>Components</FormLabel>
              {selectedComponents.map((componentId, index) => (
                <Select
                  key={index}
                  placeholder="Select component"
                  value={componentId}
                  onChange={(e) => handleComponentChange(index, e.target.value)}
                  mt={2}
                >
                  {getAvailableComponents(index).map((component) => (
                    <option key={component.id} value={component.id}>
                      {component.name}
                    </option>
                  ))}
                </Select>
              ))}
              <Button
                mt={4}
                colorScheme="teal"
                onClick={addComponentSelect}
                isDisabled={isSubmitDisabled}
              >
                + Component
              </Button>
            </FormControl>
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="gray" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            onClick={handleSubmit}
            isDisabled={isSubmitDisabled}
          >
            Submit
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddInstanceComponentModal;
