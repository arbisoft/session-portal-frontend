import React from "react";

import { faker } from "@faker-js/faker";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Skeleton from "@mui/material/Skeleton";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import useSidebar from "@/hooks/useSidebar";

import { StyledMenuItem, MenuStack, SidebarContainer, TagsContainer, Text } from "./styled";

const loadingTags: string[] = Array(10)
  .fill("")
  .map(() => faker.lorem.words(1));

const Sidebar = () => {
  const searchParams = useSearchParams();
  const { arePlaylistsLoading, tags, playlists } = useSidebar();

  const tag = searchParams?.get("tag");
  const playlist = searchParams?.get("playlist");

  return (
    <SidebarContainer data-testid="sidebar-container" as="nav" aria-label="Video navigation sidebar">
      <MenuStack>
        {arePlaylistsLoading ? (
          <MenuList aria-busy="true" aria-label="Loading playlists" data-testid="loading">
            {loadingTags.map((item, index) => (
              <MenuItem key={index} disabled aria-hidden="true">
                <Box display="flex" justifyContent="space-between" alignItems="center" width="90%" mb={1}>
                  <Skeleton variant="rounded" width="15%" height={20} />
                  <Skeleton width="76%" height={25} />
                </Box>
              </MenuItem>
            ))}
          </MenuList>
        ) : (
          <MenuList sx={{ pt: 0 }} aria-label="Video playlists">
            <StyledMenuItem
              component={Link}
              href="/videos"
              selected={!playlist && !tag}
              data-testid="sidebar-item-All"
              aria-current={!playlist && !tag ? "page" : undefined}
            >
              <Image
                src="/assets/images/sidebar-item-icon.svg"
                alt="sidebar item icon"
                width={18}
                height={12}
                aria-hidden="true"
              />
              <Text variant="bodySmall" title="All videos">
                All videos
              </Text>
            </StyledMenuItem>

            {playlists.map((item) => (
              <StyledMenuItem
                component={Link}
                href={`/videos?playlist=${encodeURIComponent(item.name)}`}
                key={item.id}
                selected={item.name === playlist}
                data-testid={`sidebar-item-${item.name}`}
                aria-current={item.name === playlist ? "page" : undefined}
              >
                <Image
                  src="/assets/images/sidebar-item-icon.svg"
                  alt="sidebar item icon"
                  width={18}
                  height={12}
                  aria-hidden="true"
                />
                <Text variant="bodySmall" title={item.name}>
                  {item.name}
                </Text>
              </StyledMenuItem>
            ))}
          </MenuList>
        )}

        <TagsContainer data-testid="sidebar-tags" aria-label="Video tags" role="list">
          {tags.map((item) => (
            <Chip
              key={item.id}
              data-testid={`sidebar-tags-${item.name}`}
              label={`#${item.name}`}
              variant={tag === item.name ? "filled" : "outlined"}
              size="small"
              component={Link}
              href={`/videos?tag=${encodeURIComponent(item.name)}`}
              clickable
              aria-pressed={tag === item.name}
              role="button"
            />
          ))}
        </TagsContainer>
      </MenuStack>
    </SidebarContainer>
  );
};

export default Sidebar;
