import {
  HStack,
  Image,
  Switch,
  Text,
  useColorMode,
  Box,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  VStack,
  Link as ChakraLink,
  useColorModeValue,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { useRef } from "react";
import { Link as RouterLink } from "react-router-dom";
import logo from "../assets/image/logo.png";
import {
  navStyles,
  drawerContentStyles,
  drawerHeaderStyles,
  drawerBodyStyles,
  linkStyles,
} from "./Navbar.styles";

const Navbar = () => {
  const { toggleColorMode, colorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef(null);
  const drawerContentBg = useColorModeValue("gray.200", "gray.800");

  return (
    <>
      <Box
        as="nav"
        sx={{
          ...navStyles,
          backgroundColor: colorMode === "dark" ? "gray.800" : "white",
          zIndex: 30, // Increase the z-index to be higher
        }}
      >
        <HStack spacing="15px">
          {" "}
          {/* Reduced spacing */}
          <IconButton
            icon={<HamburgerIcon />}
            variant="outline"
            ref={btnRef}
            onClick={onOpen}
            aria-label="Open Menu"
            size="sm"
          />
          <RouterLink to="/">
            <Image src={logo} boxSize="25px" alt="logo" />
          </RouterLink>
          <RouterLink to="/">
            <Text fontSize="lg" fontWeight="bold">
              {" "}
              Release And Deployment Management
            </Text>
          </RouterLink>
        </HStack>
        {/*
<HStack spacing="5px" alignItems="center">
  <Text fontSize="sm">Dark Mode</Text>
  <Switch isChecked={colorMode === "dark"} onChange={toggleColorMode} />
</HStack>
*/}
      </Box>

      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent sx={{ ...drawerContentStyles }}>
          <DrawerCloseButton />
          <DrawerHeader sx={drawerHeaderStyles}>All Screens</DrawerHeader>
          <DrawerBody sx={drawerBodyStyles}>
            <VStack align="start" width="100%">
              <LinkWrapper to="/components" onClose={onClose} color="red.500">
                Components
              </LinkWrapper>
              <LinkWrapper to="/clients" onClose={onClose} color="red.500">
                Clients
              </LinkWrapper>
              <LinkWrapper to="/releases" onClose={onClose} color="green.500">
                Releases
              </LinkWrapper>
              <LinkWrapper
                to="/deployment-groups"
                onClose={onClose}
                color="green.500"
              >
                Deployment Groups
              </LinkWrapper>
              <LinkWrapper to="/scripts" onClose={onClose} color="green.500">
                Scripts
              </LinkWrapper>
              <LinkWrapper
                to="/create-deployment"
                onClose={onClose}
                color="blue.500"
              >
                Create Deployment
              </LinkWrapper>
              <LinkWrapper
                to="/manage-deployment"
                onClose={onClose}
                color="blue.500"
              >
                Manage Deployment
              </LinkWrapper>
              <LinkWrapper to="/downtime" onClose={onClose} color="purple.500">
                DownTime
              </LinkWrapper>
              <LinkWrapper
                to="/manage-users"
                onClose={onClose}
                color="orange.500"
              >
                Manage Users
              </LinkWrapper>
              <LinkWrapper to="/audit-log" onClose={onClose} color="orange.500">
                Audit Log
              </LinkWrapper>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

const LinkWrapper = ({
  to,
  children,
  onClose,
  color,
}: {
  to: string;
  children: React.ReactNode;
  onClose: () => void;
  color: string;
}) => {
  const hoverBgColor = useColorModeValue("gray.400", "gray.200");

  return (
    <Box width="100%" _hover={{ backgroundColor: hoverBgColor }}>
      <ChakraLink
        as={RouterLink}
        to={to}
        onClick={onClose}
        color={color}
        sx={{
          ...linkStyles,
          width: "100%",
          textDecoration: "none",
          display: "block",
          padding: "8px",
          _hover: { textDecoration: "none" },
        }}
      >
        {children}
      </ChakraLink>
    </Box>
  );
};

export default Navbar;
