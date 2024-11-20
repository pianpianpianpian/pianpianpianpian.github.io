import { Box, Avatar, Button, Typography, FormControl, FormLabel, RadioGroup, useColorScheme, FormControlLabel, Radio } from '@mui/material';
import { useTranslation } from 'react-i18next';
import themeStore from '../../utils/theme/theme';
import { observer } from 'mobx-react-lite';

function AvatarBar() {
    const { t, i18n } = useTranslation();
  
    return (
        <>
        <Box display='flex' alignItems='center' height={75} sx={{
            backgroundColor: themeStore.theme.palette.background.default, 
            color: themeStore.theme.palette.text.primary ,
        }}>
            <Avatar alt="QinFeng" src='./images/avatar.jpg' sx={{ 
                width: '3.6rem', 
                height: '3.6rem',
                boxShadow: '0 4px 6px 0 rgba(0, 0, 0, 0.5)',
                marginRight: 2,
            }} />
            <Box>
                <Box display='flex' alignItems='center'>
                    <Typography fontSize={ '1.2rem'} fontWeight={600} fontFamily='Poppins' color={themeStore.theme.palette.text.primary}>
                        {t('qinFeng')}
                </Typography>
                {/* <Typography fontSize={'1rem'} fontWeight={400} color={themeStore.theme.palette.secondary.main} fontFamily='Poppins'>
                    (o^^o •°)
                </Typography> */}
                </Box>
                <Typography fontSize={'0.75rem'} fontWeight={300} color={themeStore.theme.palette.divider} sx={{marginTop: '0.25rem'}} fontFamily='Poppins'>
                    {t('publishedIn')} 2024  ·  11  ·  20
                </Typography>
            </Box>
        </Box>
     
        </>
    );
}

export default observer(AvatarBar);