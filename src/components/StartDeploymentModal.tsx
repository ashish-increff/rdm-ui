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
  Checkbox,
  Button,
  Box,
} from "@chakra-ui/react";
import Select from "react-select";
import deploymentService from "../services/deployment-service";
import ToastManager from "../utils/ToastManager";
import { handleError } from "../utils/ErrorHandler";

interface StartDeploymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  id: number;
  instance: string;
  destinationDeploymentGroup: string;
}

const StartDeploymentModal: React.FC<StartDeploymentModalProps> = ({
  isOpen,
  onClose,
  id,
  instance,
  destinationDeploymentGroup,
}) => {
  const [pythonVersion, setPythonVersion] = useState<string | null>(null);
  const [pythonScriptVersion, setPythonScriptVersion] = useState<string | null>(
    null
  );
  const [skipPreMigration, setSkipPreMigration] = useState<boolean>(false);
  const [skipBackup, setSkipBackup] = useState<boolean>(false);
  const [skipOsPatch, setSkipOsPatch] = useState<boolean>(false);
  const [disableStartNotification, setDisableStartNotification] =
    useState<boolean>(false);

  const pythonVersionOptions = [
    { value: "3.9", label: "3.9" },
    { value: "3", label: "3" },
  ];

  const pythonScriptVersionOptions = [
    { value: "2.7", label: "2.7" },
    { value: "3", label: "3" },
  ];

  const handleStartDeployment = async () => {
    const requestBody = {
      pythonVersion,
      pythonScriptVersion,
      skipPreMigration,
      skipBackup,
      skipOsPatch,
      disableStartNotification,
    };

    try {
      await deploymentService.startDeployment(id, requestBody);
      ToastManager.success("Success", "Deployment started successfully");
      onClose();
    } catch (error) {
      const errorMessage = handleError(error, "Error starting deployment");
      ToastManager.error("Error", errorMessage);
    }
  };

  const isStartButtonDisabled = !pythonVersion || !pythonScriptVersion;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Start Deployment</ModalHeader>
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
            <Box>
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
                  Python Version <span style={{ color: "red" }}>*</span>
                </FormLabel>
                <Select
                  options={pythonVersionOptions}
                  placeholder="Select Python Version"
                  onChange={(selectedOption) =>
                    setPythonVersion(selectedOption?.value || null)
                  }
                  isClearable
                />
              </FormControl>
              <FormControl mb={4}>
                <FormLabel>
                  Python Script Version <span style={{ color: "red" }}>*</span>
                </FormLabel>
                <Select
                  options={pythonScriptVersionOptions}
                  placeholder="Select Python Script Version"
                  onChange={(selectedOption) =>
                    setPythonScriptVersion(selectedOption?.value || null)
                  }
                  isClearable
                />
              </FormControl>
              <FormControl mb={4}>
                <Checkbox
                  isChecked={skipPreMigration}
                  onChange={(e) => setSkipPreMigration(e.target.checked)}
                >
                  Skip Pre-Migration
                </Checkbox>
              </FormControl>
              <FormControl mb={4}>
                <Checkbox
                  isChecked={skipBackup}
                  onChange={(e) => setSkipBackup(e.target.checked)}
                >
                  Skip Backup
                </Checkbox>
              </FormControl>
              <FormControl mb={4}>
                <Checkbox
                  isChecked={skipOsPatch}
                  onChange={(e) => setSkipOsPatch(e.target.checked)}
                >
                  Skip OS Patch
                </Checkbox>
              </FormControl>
              <FormControl mb={4}>
                <Checkbox
                  isChecked={disableStartNotification}
                  onChange={(e) =>
                    setDisableStartNotification(e.target.checked)
                  }
                >
                  Disable Start Notification
                </Checkbox>
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
            onClick={handleStartDeployment}
            isDisabled={isStartButtonDisabled}
          >
            Start
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default StartDeploymentModal;
