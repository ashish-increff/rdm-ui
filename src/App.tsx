import { Box, Grid, GridItem } from "@chakra-ui/react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import { Component } from "react";
import Components from "./components/Components";
import Clients from "./components/Clients";
import Crumb from "./components/Crumb";

const App = () => {
  return (
    <>
      <Navbar></Navbar>
      <Crumb></Crumb>
      <Box paddingTop={{ base: "100px", md: "130px" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/components" element={<Components />} />
          <Route path="/clients" element={<Clients />} />
        </Routes>
      </Box>
    </>
  );
};

export default App;
