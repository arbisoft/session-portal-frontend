import React from "react";

import { faker } from "@faker-js/faker";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Skeleton from "@mui/material/Skeleton";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

import useNavigation from "@/hooks/useNavigation";
import useSidebar from "@/hooks/useSidebar";

import { StyledMenuItem, MenuStack, SidebarContainer, TagsContainer, Text } from "./styled";

const loadingTags: string[] = Array(10)
  .fill("")
  .map(() => faker.lorem.words(1));

const Sidebar = () => {
  const { navigateTo } = useNavigation();
  const searchParams = useSearchParams();

  const { arePlaylistsLoading, tags, playlists } = useSidebar();

  const tag = searchParams?.get("tag");
  const playlist = searchParams?.get("playlist");

  return (
    <SidebarContainer data-testid="sidebar-container">
      <MenuStack>
        {arePlaylistsLoading ? (
          <MenuList data-testid="loading">
            {loadingTags?.map((item) => (
              <MenuItem key={item}>
                <Box display="flex" justifyContent="space-between" alignItems="center" width="90%" mb={1}>
                  <Skeleton variant="rounded" width="15%" height={20} />
                  <Skeleton width="76%" height={25} />
                </Box>
              </MenuItem>
            ))}
          </MenuList>
        ) : (
          <MenuList sx={{ pt: 0 }}>
            <StyledMenuItem selected={!playlist && !tag} onClick={() => navigateTo("videos")} data-testid={"sidebar-item-All"}>
              <Image src="/assets/images/sidebar-item-icon.svg" alt="All videos" width={18} height={12} />
              <Text variant="bodySmall" title="All videos">
                All videos
              </Text>
            </StyledMenuItem>
            {playlists.map((item) => (
              <StyledMenuItem
                key={item.id}
                selected={item.name === playlist}
                onClick={() => {
                  navigateTo("videos", { playlist: item.name });
                }}
                data-testid={`sidebar-item-${item.name}`}
              >
                <Image src="/assets/images/sidebar-item-icon.svg" alt={item.name} width={18} height={12} />
                <Text variant="bodySmall" title={item.name}>
                  {item.name}
                </Text>
              </StyledMenuItem>
            ))}
          </MenuList>
        )}
        <TagsContainer data-testid="sidebar-tags">
          {tags.map((item) => (
            <Chip
              data-testid={`sidebar-tags-${item.name}`}
              key={item.id}
              onClick={() => {
                navigateTo("videos", { tag: item.name });
              }}
              label={`#${item.name}`}
              variant={tag === item.name ? "filled" : "outlined"}
              size="small"
            />
          ))}
        </TagsContainer>
      </MenuStack>
    </SidebarContainer>
  );
};

export default Sidebar;
