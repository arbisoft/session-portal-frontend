import React, { useEffect, useState } from "react";

import CancelIcon from "@mui/icons-material/Cancel";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import YouTube from "@mui/icons-material/YouTube";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useTheme } from "@mui/material/styles";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";

import { useFeatureFlags } from "@/hooks/useFeatureFlags";
import useNavigation from "@/hooks/useNavigation";
import { selectUserInfo } from "@/redux/login/selectors";
import { loginActions } from "@/redux/login/slice";
import { persistor } from "@/redux/store/configureStore";

import ThemeToggle from "../ThemeToggle";

import { CancelIconWrapper, Logo, NavbarRightArea, Search, SearchIconWrapper, StyledInputBase } from "./styled";

function Navbar({ onDrawerToggle, shouldShowDrawer = false }: { onDrawerToggle?: VoidFunction; shouldShowDrawer?: boolean }) {
  const dispatch = useDispatch();
  const { navigateTo } = useNavigation();
  const searchParams = useSearchParams();
  const { isFeatureEnabled } = useFeatureFlags();
  const theme = useTheme();

  const isDarkModeVisible = isFeatureEnabled("darkModeSwitcher");
  const isUploadVideoVisible = isFeatureEnabled("uploadVideo");

  const userInfo = useSelector(selectUserInfo);

  const [searchQuery, setSearchQuery] = useState("");
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const search = searchParams?.get("search");

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = async () => {
    dispatch(loginActions.logout());
    await persistor.purge();
    persistor.persist();
    handleCloseUserMenu();
  };

  const handleSearch = (searchEvent: React.FormEvent) => {
    searchEvent.preventDefault();
    if (searchQuery.length > 0) {
      navigateTo("searchResult", { search: searchQuery });
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    navigateTo("videos");
  };

  useEffect(() => {
    setSearchQuery(search ?? "");
  }, [search]);

  return (
    <AppBar position="sticky" data-testid="navbar">
      <Container maxWidth={false}>
        <Toolbar disableGutters>
          {shouldShowDrawer && (
            <IconButton
              color="inherit"
              data-testid="open-drawer"
              sx={{ marginRight: theme.spacing() }}
              aria-label="open drawer"
              edge="start"
              onClick={onDrawerToggle}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Logo data-testid="navbar-logo" onClick={() => navigateTo("videos")}>
            <YouTube />
            <Typography variant="h6" noWrap sx={{ display: { xs: "none", md: "flex" } }}>
              Arbisoft Sessions Portal
            </Typography>
          </Logo>

          <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
            <Search onSubmit={handleSearch}>
              <StyledInputBase
                value={searchQuery}
                onChange={(inputEvent: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(inputEvent.target.value)}
                placeholder={"Search..."}
                inputProps={{ "aria-label": "search", "data-testid": "search-query" }}
              />

              {searchQuery.length > 0 && (
                <CancelIconWrapper data-testid="cancelIcon" onClick={handleClearSearch}>
                  <CancelIcon />
                </CancelIconWrapper>
              )}

              <SearchIconWrapper>
                <SearchIcon data-testid="SearchIcon" />
              </SearchIconWrapper>
            </Search>
          </Box>
          <NavbarRightArea>
            <Tooltip title="Open settings">
              <IconButton data-testid="avatar-btn" onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar variant="rounded" alt={userInfo.full_name ?? ""} src={userInfo.avatar ?? ""} />
              </IconButton>
            </Tooltip>
            <Menu
              data-testid="profile-menu"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {isUploadVideoVisible && (
                <MenuItem onClick={() => navigateTo("uploadVideo")}>
                  <Typography>Upload a video</Typography>
                </MenuItem>
              )}
              <MenuItem data-testid="Logout" onClick={handleLogout}>
                <Typography>Logout</Typography>
              </MenuItem>
              {isDarkModeVisible && (
                <MenuItem disableRipple disableTouchRipple>
                  <ThemeToggle />
                </MenuItem>
              )}
            </Menu>
          </NavbarRightArea>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;
