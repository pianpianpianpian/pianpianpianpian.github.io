import { styled } from "@mui/material/styles";

import { Box, BoxProps } from '@mui/material';

const AppBarHeight = 64;

export const MainContentContainer = styled(Box)<BoxProps>(({ theme }) => ({
    component: 'main',
    backgroundColor: theme.palette.background.default,
    flexGrow: 1,
    height: `calc(100vh - ${AppBarHeight}px)`,
    overflow: 'auto',
  }));