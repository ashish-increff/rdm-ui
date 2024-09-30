import React, { useState } from "react";
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
  SimpleGrid,
  Radio,
  RadioGroup,
  useToast,
  Box,
} from "@chakra-ui/react";
import instanceService from "../services/instance-service";
import { handleError } from "../utils/ErrorHandler";
import ToastManager from "../utils/ToastManager";

interface AddInstanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSuccess: () => void;
}

const AddInstanceModal: React.FC<AddInstanceModalProps> = ({
  isOpen,
  onClose,
  onAddSuccess,
}) => {
  const toast = useToast();

  // Initial form data state
  const initialFormData = {
    name: "",
    client: "",
    sqlMachineName: "",
    gceBucket: "",
    apiUrl: "",
    urlMap: "",
    authDomain: "",
    projectId: "",
    zoneId: "",
    orgId: "",
    primaryPocEmail: "",
    secondaryPocEmail: "",
    deploymentOnHold: false,
  };

  const [formData, setFormData] = useState(initialFormData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDeploymentChange = (value: string) => {
    setFormData((prev) => ({ ...prev, deploymentOnHold: value === "true" }));
  };

  // Function to reset the form
  const resetForm = () => {
    setFormData(initialFormData);
  };

  const handleSubmit = async () => {
    try {
      await instanceService.create(formData);
      ToastManager.success("Success", "Instance created successfully.");
      resetForm(); // Reset the form after successful submission
      onAddSuccess();
      onClose();
    } catch (error) {
      const errorMessage = handleError(error, "Error creating instance");
      ToastManager.error("Error", errorMessage);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="6xl"
      closeOnOverlayClick={false}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add Instance</ModalHeader>
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
            <SimpleGrid columns={[1, 2, 3]} spacing={4}>
              {Object.keys(formData)
                .filter((key) => key !== "deploymentOnHold") // Exclude deploymentOnHold from input fields
                .map((key) => (
                  <FormControl
                    key={key}
                    isRequired={[
                      "name",
                      "client",
                      "sqlMachineName",
                      "gceBucket",
                      "apiUrl",
                      "urlMap",
                      "authDomain",
                      "projectId",
                      "zoneId",
                      "orgId",
                      "primaryPocEmail",
                    ].includes(key)}
                  >
                    <FormLabel htmlFor={key}>
                      {key.charAt(0).toUpperCase() +
                        key.slice(1).replace(/([A-Z])/g, " $1")}
                    </FormLabel>
                    <Input
                      id={key}
                      name={key}
                      value={formData[key as keyof typeof formData] as string}
                      onChange={handleChange}
                      placeholder={`Enter ${
                        key.charAt(0).toUpperCase() + key.slice(1)
                      }`}
                      type={key.includes("Email") ? "email" : "text"}
                    />
                  </FormControl>
                ))}
              <FormControl>
                <FormLabel>Deployment on Hold</FormLabel>
                <RadioGroup
                  onChange={handleDeploymentChange}
                  value={formData.deploymentOnHold.toString()}
                >
                  <Radio value="true" mr={2}>
                    True
                  </Radio>
                  <Radio value="false">False</Radio>
                </RadioGroup>
              </FormControl>
            </SimpleGrid>
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="gray" onClick={onClose} mr={3}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleSubmit}>
            Submit
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddInstanceModal;
