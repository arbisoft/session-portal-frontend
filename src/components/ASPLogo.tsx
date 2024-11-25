import useTheme from "@mui/material/styles/useTheme";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Image from "next/image";

export default function Logo() {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: theme.spacing(2),
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          marginTop: theme.spacing(2),
        }}
      >
        <Image src="/assets/logo.png" alt="ASP Logo" height={70} width={70} />
      </Box>
      <Box
        sx={{
          display: "inline-block",
          textAlign: "center",
          flex: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "right",
            marginRight: theme.spacing(1),
          }}
        >
          <Typography
            sx={{
              fontSize: "12px",
              letterSpacing: "0.1em",
              color: theme.palette.text.primary,
            }}
          >
            V1
          </Typography>
        </Box>
        <Typography
          sx={{
            fontSize: "42px",
            letterSpacing: "0.1em",
            color: theme.palette.text.primary,
            lineHeight: 1,
          }}
        >
          ARBISOFT
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            marginTop: theme.spacing(0.5),
          }}
        >
          <Typography
            sx={{
              fontSize: "24px",
              letterSpacing: "0.1em",
              color: theme.palette.text.secondary,
              lineHeight: 1,
            }}
          >
            SESSION
          </Typography>
          <Typography
            sx={{
              fontSize: "24px",
              letterSpacing: "0.1em",
              color: theme.palette.text.primary,
              lineHeight: 1,
              marginLeft: theme.spacing(1),
            }}
          >
            PORTAL
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
