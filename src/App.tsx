import { Box, Grid, GridItem } from "@chakra-ui/react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import { Component } from "react";
import Components from "./components/Components";
import Clients from "./components/Clients";

const App = () => {
  return (
    <>
      <Navbar></Navbar>

      <Box paddingTop={{ base: "50px", md: "60px" }}>
        {" "}
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
