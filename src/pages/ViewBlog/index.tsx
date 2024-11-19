import { Box, Avatar, Button, Typography, FormControl, FormLabel, RadioGroup, useColorScheme, FormControlLabel, Radio } from '@mui/material';
import { useTranslation } from 'react-i18next';

function ViewBlog() {
    const { t, i18n } = useTranslation();
  
    return (
        <>
        

        <Box display='flex' alignItems='center'  width={200} height={75}>
            <Avatar alt="QinFeng" src='./images/avatar.jpg' sx={{ 
                width: 60, 
                height: 60,
                boxShadow: '4px 4px 4px 4px rgba(0, 0, 0, 0.3)',
                marginRight: 2,
            }} />
            <Box>
                <Typography fontSize={25} fontWeight={600} fontFamily='Poppins'>
                    {t('QinFeng')}
                </Typography>
                <Typography fontSize={15} fontWeight={400} color='#C3C4C6' fontFamily='Poppins'>
                    {t('welcome')}
                </Typography>
            </Box>
        </Box>
     
        </>
    );
}

export default ViewBlog;