import React, { useEffect, useState, useTransition } from "react";

import CancelIcon from "@mui/icons-material/Cancel";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
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
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";

import { logoutAndClearCookie } from "@/app/login/actions";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";
import useNavigation from "@/hooks/useNavigation";
import { selectIsStaff, selectUserInfo } from "@/redux/login/selectors";
import { loginActions } from "@/redux/login/slice";
import { persistor } from "@/redux/store/configureStore";

import ThemeToggle from "../ThemeToggle";

import { CancelIconWrapper, Logo, NavbarRightArea, Search, SearchIconWrapper, StyledAppBar, StyledInputBase } from "./styled";

interface NavbarProps {
  onDrawerToggle?: VoidFunction;
  shouldShowDrawer?: boolean;
  isDrawerOpen?: boolean;
}

function Navbar({ onDrawerToggle, shouldShowDrawer, isDrawerOpen = false }: NavbarProps) {
  const dispatch = useDispatch();
  const { navigateTo } = useNavigation();
  const searchParams = useSearchParams();
  const { isFeatureEnabled } = useFeatureFlags();
  const theme = useTheme();

  const isDarkModeVisible = isFeatureEnabled("darkModeSwitcher");

  const userInfo = useSelector(selectUserInfo);
  const isStaff = useSelector(selectIsStaff);

  const [searchQuery, setSearchQuery] = useState("");
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const search = searchParams?.get("search");

  const [avatarButton, setAvatarButton] = useState<HTMLElement | null>(null);
  const [, startTransition] = useTransition();

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
    setAvatarButton(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
    if (avatarButton) {
      avatarButton.focus();
    }
  };

  const handleLogout = async () => {
    handleCloseUserMenu();

    // Clear Redux state and persist
    dispatch(loginActions.logout());
    await persistor.purge();
    persistor.persist();

    // Clear cookie via server action
    startTransition(async () => {
      await logoutAndClearCookie();
    });
  };

  const handleSearch = (searchEvent: React.FormEvent<HTMLFormElement>) => {
    searchEvent.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed.length > 0) {
      navigateTo("searchResult", { search: trimmed });
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    navigateTo("videos");
  };

  useEffect(() => {
    setSearchQuery(search ?? "");
  }, [search]);

  const menuId = "navbar-profile-menu";

  return (
    <StyledAppBar data-testid="navbar" role="banner">
      <Container maxWidth={false}>
        <Toolbar disableGutters>
          {shouldShowDrawer && (
            <IconButton
              data-testid="open-drawer"
              sx={{ marginRight: theme.spacing() }}
              edge="start"
              color="inherit"
              aria-label={isDrawerOpen ? "close drawer" : "open drawer"}
              aria-expanded={isDrawerOpen}
              aria-controls="sidebar-drawer"
              onClick={onDrawerToggle}
              onKeyDown={(event) => {
                // Allow closing with Enter/Space for full keyboard control
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onDrawerToggle?.();
                }
              }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Logo data-testid="navbar-logo" href="/videos" aria-label="Go to videos homepage">
            <Image src={"/assets/images/apple-icon.png"} width={24} height={24} alt="Arbisoft logo" data-testid="arbisoftLogo" />
            <Typography variant="h6" noWrap sx={{ display: { xs: "none", md: "flex" }, marginLeft: theme.spacing(1) }}>
              Arbisoft Sessions Portal
            </Typography>
          </Logo>

          <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
            <Search onSubmit={handleSearch} role="search" aria-label="Search sessions" data-testid="navbar-search-form">
              <label
                htmlFor="navbar-search-input"
                style={{ position: "absolute", left: -9999, top: "auto", width: 1, height: 1, overflow: "hidden" }}
              >
                Search sessions
              </label>

              <StyledInputBase
                id="navbar-search-input"
                value={searchQuery}
                onChange={(inputEvent: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(inputEvent.target.value)}
                placeholder="Search..."
                inputProps={{
                  "aria-label": "Search sessions",
                  "data-testid": "search-query",
                }}
              />

              {searchQuery.length > 0 && (
                <CancelIconWrapper data-testid="cancelIcon" onClick={handleClearSearch} aria-label="Clear search" size="small">
                  <CancelIcon />
                </CancelIconWrapper>
              )}
              <SearchIconWrapper
                type="submit"
                aria-label="Submit search"
                data-testid="SearchIconButton"
                sx={{ marginLeft: theme.spacing(1) }}
              >
                <SearchIcon data-testid="SearchIcon" aria-hidden="true" />
              </SearchIconWrapper>
            </Search>
          </Box>

          <NavbarRightArea>
            {isDarkModeVisible && <ThemeToggle />}
            <Tooltip title="Open settings" enterDelay={300}>
              <IconButton
                size="large"
                data-testid="avatar-btn"
                id="avatar-btn"
                onClick={handleOpenUserMenu}
                sx={{ p: 0 }}
                aria-label="Open account settings"
                aria-controls={anchorElUser ? menuId : undefined}
                aria-haspopup="true"
                aria-expanded={Boolean(anchorElUser)}
              >
                <Avatar variant="rounded" alt={userInfo.full_name?.toString()} src={userInfo.avatar?.toString()} />
              </IconButton>
            </Tooltip>
            <Menu
              id={menuId}
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
              slotProps={{
                root: {
                  "aria-labelledby": "avatar-btn",
                  role: "menu",
                },
              }}
            >
              {isStaff && (
                <MenuItem role="menuitem" component={Link} href="/upload-video" onClick={handleCloseUserMenu}>
                  <Typography component="span">Upload a video</Typography>
                </MenuItem>
              )}

              <MenuItem
                data-testid="Logout"
                onClick={() => {
                  handleLogout();
                }}
                role="menuitem"
              >
                <Typography component="span">Logout</Typography>
              </MenuItem>
            </Menu>
          </NavbarRightArea>
        </Toolbar>
      </Container>
    </StyledAppBar>
  );
}

export default Navbar;
