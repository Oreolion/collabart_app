"use client";
import { useState, useCallback } from "react";
import ProjectPlayer from "@/components/ProjectPlayer";

const PlayerWrapper = () => {
  const [showPlayer, setShowPlayer] = useState(true);

  const handleClosePlayer = useCallback(() => {
    setShowPlayer(false);
  }, []);

  console.log("PlayerWrapper rendering, showPlayer:", showPlayer);

  return showPlayer ? <ProjectPlayer onClose={handleClosePlayer} /> : null;
};

export default PlayerWrapper;