import React, { useState } from "react";

import Image from "next/image";

import useSidebar from "@/hooks/useSidebar";

import { MenuItem, MenuStack, SidebarContainer, Text } from "./styled";
import { SidebarProps } from "./types";

const Sidebar = ({ handleSidebarToggle }: SidebarProps) => {
  const { sidebarItems } = useSidebar();
  const [selected, setSelected] = useState("");

  const handleClick = (item: string) => {
    setSelected(item);
    handleSidebarToggle?.();
  };

  return (
    <SidebarContainer data-testid="sidebar-container">
      <MenuStack>
        {sidebarItems.map((item) => (
          <MenuItem key={item} $isSelected={item === selected} onClick={() => handleClick(item)}>
            <Image src="/assets/images/sidebar-item-icon.svg" alt={item} width={18} height={12} />
            <Text>{item}</Text>
          </MenuItem>
        ))}
      </MenuStack>
    </SidebarContainer>
  );
};

export default Sidebar;
