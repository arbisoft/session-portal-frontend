import React, { useId, useState } from "react";

import { faker } from "@faker-js/faker";
import FilterListIcon from "@mui/icons-material/FilterList";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Skeleton from "@mui/material/Skeleton";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import FilterSortMenu from "@/components/FilterSortMenu";
import useSidebar from "@/hooks/useSidebar";
import useVideoFilters from "@/hooks/useVideoFilters";
import { ANALYTICS_CATEGORY, GA_EVENTS, trackEvent } from "@/utils/analytics";

import { HomeMenuList, HomeRow, StyledMenuItem, MenuStack, SidebarContainer, TagsContainer, Text } from "./styled";

const loadingTags: string[] = new Array(10).fill("").map(() => faker.lorem.words(1));

const HOME_LABEL = "Home";
// Kept as the analytics value so historical sidebar_playlist_select data stays comparable after the rename.
const HOME_ANALYTICS_LABEL = "All Videos";

const Sidebar = () => {
  const searchParams = useSearchParams();
  const { arePlaylistsLoading, tags, playlists } = useSidebar();
  const { availableYears, clearFilters, setSort, setYear, sort, year } = useVideoFilters();
  const [filterAnchor, setFilterAnchor] = useState<HTMLElement | null>(null);
  const isFilterMenuOpen = Boolean(filterAnchor);
  // The sidebar is mounted twice when the drawer is available (desktop column + drawer), so ids must be unique.
  const idPrefix = useId();
  const filterButtonId = `${idPrefix}-filter-button`;
  const filterMenuId = `${idPrefix}-filter-menu`;

  const tag = searchParams?.get("tag");
  const playlist = searchParams?.get("playlist");

  return (
    <SidebarContainer data-testid="sidebar-container" as="nav" aria-label="Video navigation sidebar">
      <MenuStack>
        <HomeRow>
          <HomeMenuList role="none">
            <StyledMenuItem
              component={Link}
              href="/videos"
              selected={!playlist && !tag}
              data-testid="sidebar-item-All"
              aria-current={!playlist && !tag ? "page" : undefined}
              tabIndex={0}
              role="link"
              onClick={() =>
                trackEvent(GA_EVENTS.SIDEBAR_PLAYLIST_SELECT, ANALYTICS_CATEGORY.SIDEBAR, { playlist: HOME_ANALYTICS_LABEL })
              }
            >
              <Image
                src="/assets/images/sidebar-item-icon.svg"
                data-testid="sidebar-item-icon"
                alt=""
                width={18}
                height={12}
                aria-hidden="true"
              />
              <Text variant="bodySmall" title={HOME_LABEL}>
                {HOME_LABEL}
              </Text>
            </StyledMenuItem>
          </HomeMenuList>

          <IconButton
            id={filterButtonId}
            data-testid="sidebar-filter-button"
            aria-label="Filter and sort videos"
            aria-haspopup="menu"
            aria-expanded={isFilterMenuOpen}
            aria-controls={isFilterMenuOpen ? filterMenuId : undefined}
            title="Filter and sort"
            onClick={(event) => {
              // The drawer closes on any click inside it; opening the menu must not unmount the sidebar that owns it.
              event.stopPropagation();
              setFilterAnchor(event.currentTarget);
            }}
          >
            <FilterListIcon aria-hidden="true" />
          </IconButton>
        </HomeRow>

        <FilterSortMenu
          anchorEl={filterAnchor}
          availableYears={availableYears}
          id={filterMenuId}
          labelledBy={filterButtonId}
          sort={sort}
          year={year}
          onClose={() => setFilterAnchor(null)}
          onSortChange={setSort}
          onYearChange={setYear}
          onClear={clearFilters}
        />

        {arePlaylistsLoading ? (
          <MenuList aria-busy="true" aria-label="Loading playlists" data-testid="loading">
            {loadingTags.map((item, index) => (
              <MenuItem key={`${item}-${index}`} disabled aria-hidden="true" tabIndex={-1}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "90%", mb: 1 }}>
                  <Skeleton variant="rounded" width="15%" height={20} />
                  <Skeleton width="76%" height={25} />
                </Box>
              </MenuItem>
            ))}
          </MenuList>
        ) : (
          <MenuList sx={{ pt: 0 }} aria-label="Video playlists" role="menu">
            {playlists.map((item) => (
              <StyledMenuItem
                key={item.id}
                component={Link}
                href={`/videos?playlist=${encodeURIComponent(item.name)}`}
                selected={item.name === playlist}
                data-testid={`sidebar-item-${item.name}`}
                aria-current={item.name === playlist ? "page" : undefined}
                tabIndex={0}
                role="menuitem"
                onClick={() => trackEvent(GA_EVENTS.SIDEBAR_PLAYLIST_SELECT, ANALYTICS_CATEGORY.SIDEBAR, { playlist: item.name })}
              >
                <Image
                  src="/assets/images/sidebar-item-icon.svg"
                  data-testid="sidebar-item-icon"
                  alt=""
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
              aria-current={tag === item.name}
              role="link"
              tabIndex={0}
              onClick={() => trackEvent(GA_EVENTS.TAG_SELECT, ANALYTICS_CATEGORY.SIDEBAR, { tag: item.name, source: "sidebar" })}
            />
          ))}
        </TagsContainer>
      </MenuStack>
    </SidebarContainer>
  );
};

export default Sidebar;
