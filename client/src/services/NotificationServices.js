import { toast } from 'react-toastify';

/* react toastify notifications */

export const toastWarn = (message) => {
    toast.warning(message, {
        position: 'top-center',
        autoClose: 1700,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined
    });
};

export const toastSuccess = (message) => {
    toast.success(message, {
        position: 'top-center',
        autoClose: 1700,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined
    })
}