import React, { useState } from "react";

import { faker } from "@faker-js/faker";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Image from "next/image";
import { useRouter } from "next/navigation";

import useSidebar from "@/hooks/useSidebar";
import { Tag } from "@/models/Events";
import useLanguage from "@/services/i18n/use-language";

import { MenuItem, MenuStack, SidebarContainer, Text } from "./styled";
import { SidebarProps } from "./types";

const loadingTags: string[] = Array(5)
  .fill("")
  .map(() => faker.lorem.words(1));

const Sidebar = ({ handleSidebarToggle }: SidebarProps) => {
  const router = useRouter();
  const language = useLanguage();
  const { sidebarItems, isDataLoading } = useSidebar();

  const [selected, setSelected] = useState("");

  const handleClick = (item: Tag) => {
    setSelected(item.name);
    handleSidebarToggle?.();
    router.push(item.id === 0 ? `/${language}/videos` : `/${language}/videos?tag=${item.id}`);
  };

  return (
    <SidebarContainer>
      <MenuStack>
        {isDataLoading
          ? loadingTags?.map((item) => (
              <Box key={item} display="flex" justifyContent="space-between" alignItems={"center"} width="90%">
                <Skeleton variant="rounded" width="20%" height={30} />
                <Skeleton width="76%" height={25} />
              </Box>
            ))
          : sidebarItems.map((item) => (
              <MenuItem key={item.id} isSelected={item.name === selected} onClick={() => handleClick(item)}>
                <Image src="/assets/images/sidebar-item-icon.svg" alt={item.name} width={18} height={12} />
                <Text>{item.name}</Text>
              </MenuItem>
            ))}
      </MenuStack>
    </SidebarContainer>
  );
};

export default Sidebar;
