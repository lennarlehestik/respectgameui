import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const customSwal = (text) => {
  return MySwal.fire({
    text: text,
    position: 'bottom-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    toast: true,
    background: '#fff',
    color: 'black',
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
      toast.addEventListener('click', Swal.close);
    }
  });
};

export default customSwal;