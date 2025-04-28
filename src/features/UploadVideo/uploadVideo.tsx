"use client";

import React, { useState } from "react";

import Box from "@mui/material/Box";

import VideoForm from "./form";
import VideoPicker from "./videoPicker";

const FileUpload = () => {
  const [videoFile, setVideoFile] = useState<File | undefined>();

  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      {!videoFile ? <VideoPicker onFileSelect={setVideoFile} /> : <VideoForm />}
    </Box>
  );
};

export default FileUpload;
