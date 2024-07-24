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
        }}
      >
        <HStack spacing="15px">
          <IconButton
            icon={<HamburgerIcon />}
            variant="outline"
            ref={btnRef}
            onClick={onOpen}
            aria-label="Open Menu"
          />
          <RouterLink to="/">
            <Image
              src="https://static.increff.com/assets/favicon.ico?v=2"
              boxSize="30px"
              alt="logo"
            />
          </RouterLink>
          <RouterLink to="/">
            <Text fontSize="lg" fontWeight="bold">
              Release And Deployment Management
            </Text>
          </RouterLink>
        </HStack>
        <HStack spacing="8px" alignItems="center">
          <Text>Dark Mode</Text>
          <Switch isChecked={colorMode === "dark"} onChange={toggleColorMode} />
        </HStack>
      </Box>

      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent
          sx={{ ...drawerContentStyles, backgroundColor: drawerContentBg }}
        >
          <DrawerCloseButton />
          <DrawerHeader sx={drawerHeaderStyles}>Menu</DrawerHeader>
          <DrawerBody sx={drawerBodyStyles}>
            <VStack align="start" width="100%">
              <LinkWrapper to="/components" onClose={onClose}>
                Components
              </LinkWrapper>
              <LinkWrapper to="/clients" onClose={onClose}>
                Clients
              </LinkWrapper>
              <LinkWrapper to="/releases" onClose={onClose}>
                Releases
              </LinkWrapper>
              <LinkWrapper to="/deployment-groups" onClose={onClose}>
                Deployment Groups
              </LinkWrapper>
              <LinkWrapper to="/deployment" onClose={onClose}>
                Deployment
              </LinkWrapper>
              <LinkWrapper to="/downtime" onClose={onClose}>
                DownTime
              </LinkWrapper>
              <LinkWrapper to="/manage-users" onClose={onClose}>
                Manage Users
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
}: {
  to: string;
  children: React.ReactNode;
  onClose: () => void;
}) => {
  const hoverBgColor = useColorModeValue("gray.400", "gray.200");

  return (
    <Box width="100%" _hover={{ backgroundColor: hoverBgColor }}>
      <ChakraLink
        as={RouterLink}
        to={to}
        onClick={onClose}
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
