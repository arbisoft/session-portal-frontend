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

import { Logo, Search, SearchIconWrapper, StyledInputBase } from "./styled";

const settings = ["Profile", "Account", "Dashboard"];

function Navbar() {
  const dispatch = useDispatch();
  const userInfo = useSelector(selectUserInfo);

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
            <Search>
              <StyledInputBase placeholder="Search..." inputProps={{ "aria-label": "search" }} />
              <SearchIconWrapper>
                <SearchIcon data-testid="SearchIcon" />
              </SearchIconWrapper>
            </Search>
          </Box>
          <Box sx={{ flexGrow: 0, width: 240, display: "flex", justifyContent: "flex-end" }}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
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
                <MenuItem key={setting} onClick={handleCloseUserMenu}>
                  <Typography>{setting}</Typography>
                </MenuItem>
              ))}
              <MenuItem onClick={handleLogout}>
                <Typography>Logout</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;
