import { Avatar} from '@mui/material';

export default function AvatarIcon({img, size}) {
    return (
        <Avatar src={img} sx={{width: size, height: size}}/>
    )
}