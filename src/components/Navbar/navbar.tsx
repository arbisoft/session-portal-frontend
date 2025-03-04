import { useState } from "react";

import SearchIcon from "@mui/icons-material/Search";
import YouTube from "@mui/icons-material/YouTube";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useDispatch, useSelector } from "react-redux";

import { selectUserInfo } from "@/redux/login/selectors";
import { loginActions } from "@/redux/login/slice";
import { persistor } from "@/redux/store/configureStore";

import ThemeToggle from "../ThemeToggle";
import { Logo, Search, SearchIconWrapper, StyledInputBase } from "./styled";

const settings = ["Profile", "Account", "Dashboard"];

function Navbar() {
  const dispatch = useDispatch();
  const userInfo = useSelector(selectUserInfo);

  const [searchQuery, setSearchQuery] = useState("");
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

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

  const handleSearchQuery = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <AppBar position="static" data-testid="navbar">
      <Container maxWidth={false}>
        <Toolbar disableGutters>
          <Logo>
            <YouTube />
            <Typography variant="h6" noWrap sx={{ display: { xs: "none", md: "flex" } }}>
              Arbisoft Sessions Portal
            </Typography>
          </Logo>

          <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
            <Search onSubmit={handleSearchQuery}>
              <StyledInputBase
                placeholder="Search..."
                inputProps={{ "aria-label": "search" }}
                value={searchQuery}
                onInput={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              />
              <SearchIconButton type="submit">
                <SearchIcon data-testid="SearchIcon" />
              </SearchIconButton>
            </Search>
          </Box>
          <Box sx={{ flexGrow: 0, width: 240, display: "flex", justifyContent: "flex-end" }}>
            <Tooltip title="Open settings">
              <IconButton data-testid="avatar-btn" onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar variant="rounded" alt={userInfo.full_name ?? ""} src={userInfo.avatar ?? ""} />
              </IconButton>
            </Tooltip>
            <Menu
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
              {settings.map((setting) => (
                <MenuItem data-testid={setting} key={setting} onClick={handleCloseUserMenu}>
                  <Typography>{setting}</Typography>
                </MenuItem>
              ))}
              <MenuItem onClick={handleLogout}>
                <Typography>Logout</Typography>
              </MenuItem>
              <MenuItem disableRipple disableTouchRipple>
                <ThemeToggle />
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;
