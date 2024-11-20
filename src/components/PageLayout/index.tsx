import { Outlet } from "@mui/icons-material";
import PageHeader from "../PageHeader";
import { MainContentContainer } from "./styles";
import { Box } from "@mui/material";

const PageLayout = () => {
    return (
        <Box>
            <PageHeader />
            <MainContentContainer>
                <Outlet />
            </MainContentContainer>
        </Box>
    )
}

export default PageLayout;