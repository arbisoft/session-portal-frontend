import React, { useState } from "react";

import Image from "next/image";

import useSidebar from "@/hooks/useSidebar";

import { MenuItem, MenuStack, SidebarContainer, Text } from "./styled";
import { SidebarProps } from "./types";

const Sidebar = (props: SidebarProps) => {
  const { handleSiebarToggle } = props; // Keep this line, we'll fix the usage below
  const { sidebarItems } = useSidebar();
  const [selected, setSelected] = useState<string>("");

  const handleClick = (item: string) => {
    setSelected(item);
    if (handleSiebarToggle) {
      handleSiebarToggle();
    }
  };

  return (
    <SidebarContainer>
      <MenuStack>
        {sidebarItems.map((item) => (
          <MenuItem
            key={item}
            isSelected={item === selected}
            onClick={() => handleClick(item)} // Call the new function
          >
            <Image src="/assets/images/sidebar-item-icon.svg" alt={item} width={18} height={12} />

            <Text>{item}</Text>
          </MenuItem>
        ))}
      </MenuStack>
    </SidebarContainer>
  );
};

export default Sidebar;
