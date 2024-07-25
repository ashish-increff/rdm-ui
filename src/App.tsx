import { Box, Grid, GridItem } from "@chakra-ui/react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import { Component } from "react";
import Components from "./components/Components";
import Clients from "./components/Clients";
import Crumb from "./components/Crumb";
import Releases from "./components/Releases";

const App = () => {
  return (
    <>
      <Navbar></Navbar>
      <Crumb></Crumb>
      <Box paddingTop={{ base: "100px", md: "110px" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/components" element={<Components />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/releases" element={<Releases />} />
        </Routes>
      </Box>
    </>
  );
};

export default App;
