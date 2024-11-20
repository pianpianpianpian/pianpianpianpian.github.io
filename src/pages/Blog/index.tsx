import { Typography, Box } from '@mui/material';
import { observer } from 'mobx-react-lite';
import themeStore from '../../utils/theme/theme';
function Blog() {
    return (
        <Box sx={{
            marginTop: 3,
        }}>
        <Typography fontSize={'2.2rem'} fontWeight={600} fontFamily='Poppins' color={themeStore.theme.palette.error.main} lineHeight={1.2}>
            6 Tricks in JavaScript That Will Make You Feel Like a Pro
            </Typography>
            <Typography mt={3} fontSize={'1.5rem'}  fontFamily='Poppins' fontWeight={300} color={themeStore.theme.palette.text.secondary} lineHeight={1.2}>
                With these simple commands and tricks, you’ll be able to create really cool stuff in JavaScript without any effort!
            </Typography>
        </Box>
    )
}

export default observer(Blog);