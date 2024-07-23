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
  Link,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { useColorModeValue } from "@chakra-ui/react";
import { useRef } from "react";
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
          <Image
            src="https://static.increff.com/assets/favicon.ico?v=2"
            boxSize="30px"
            alt="logo"
          />
          <Text fontSize="lg" fontWeight="bold">
            Release And Deployment Management
          </Text>
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
            <VStack align="start">
              <Link
                href="#"
                sx={{ ...linkStyles, _hover: { textDecoration: "underline" } }}
              >
                Components
              </Link>
              <Link
                href="#"
                sx={{ ...linkStyles, _hover: { textDecoration: "underline" } }}
              >
                Clients
              </Link>
              <Link
                href="#"
                sx={{ ...linkStyles, _hover: { textDecoration: "underline" } }}
              >
                Releases
              </Link>
              <Link
                href="#"
                sx={{ ...linkStyles, _hover: { textDecoration: "underline" } }}
              >
                Deployment Groups
              </Link>
              <Link
                href="#"
                sx={{ ...linkStyles, _hover: { textDecoration: "underline" } }}
              >
                Deployment
              </Link>
              <Link
                href="#"
                sx={{ ...linkStyles, _hover: { textDecoration: "underline" } }}
              >
                DownTime
              </Link>
              <Link
                href="#"
                sx={{ ...linkStyles, _hover: { textDecoration: "underline" } }}
              >
                Manage Users
              </Link>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Navbar;
