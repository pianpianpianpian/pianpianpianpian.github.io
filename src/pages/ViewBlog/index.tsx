import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';
import themeStore from '../../utils/theme/theme';
import AvatorBar from '../../components/AvatorBar';
import Blog from '../../pages/Blog';
import { Box, Container } from '@mui/material';

function ViewBlog() {
    const { t, i18n } = useTranslation();
    return (
        <Box sx={{
            padding: '20rem', 
            paddingTop: 3,
            backgroundColor: themeStore.theme.palette.background.default,
        }}>
            <Container maxWidth="xl">
                <AvatorBar />
                <Blog />
            </Container>
        </Box>
    );
}

export default observer(ViewBlog);