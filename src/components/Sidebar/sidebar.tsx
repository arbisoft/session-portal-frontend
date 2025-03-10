import React, { useState } from "react";

import { faker } from "@faker-js/faker";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Image from "next/image";

import useNavigation from "@/hooks/useNavigation";
import useSidebar from "@/hooks/useSidebar";
import { Tag } from "@/models/Events";

import { MenuItem, MenuStack, SidebarContainer, Text } from "./styled";
import { SidebarProps } from "./types";

const loadingTags: string[] = Array(5)
  .fill("")
  .map(() => faker.lorem.words(1));

const Sidebar = ({ handleSidebarToggle }: SidebarProps) => {
  const { navigateTo } = useNavigation();
  const { sidebarItems, isDataLoading } = useSidebar();

  const [selected, setSelected] = useState("");

  const handleClick = (item: Tag) => {
    setSelected(item.name);
    handleSidebarToggle?.();
    item.id === 0 ? navigateTo("videos") : navigateTo("videos", { tag: item.id });
  };

  return (
    <SidebarContainer data-testid="sidebar-container">
      <MenuStack>
        {isDataLoading
          ? loadingTags?.map((item) => (
              <Box key={item} display="flex" justifyContent="space-between" alignItems={"center"} width="90%">
                <Skeleton variant="rounded" width="20%" height={30} />
                <Skeleton width="76%" height={25} />
              </Box>
            ))
          : sidebarItems.map((item) => (
              <MenuItem key={item.id} $isSelected={item.name === selected} onClick={() => handleClick(item)}>
                <Image src="/assets/images/sidebar-item-icon.svg" alt={item.name} width={18} height={12} />
                <Text data-testid={`sidebar-item-${item.name}`}>{item.name}</Text>
              </MenuItem>
            ))}
      </MenuStack>
    </SidebarContainer>
  );
};

export default Sidebar;
