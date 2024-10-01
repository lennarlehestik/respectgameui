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

const customCenteredSwal = (text) => {
  return MySwal.fire({
    text: text,
    position: 'center',
    showConfirmButton: true,
    background: '#fff',
    color: 'black'
  });
};

const customModalSwal = (title, text, confirmButtonText, onConfirm) => {
  return MySwal.fire({
    title: title,
    text: text,
    confirmButtonColor: '#3085d6',
    confirmButtonText: confirmButtonText,
  }).then((result) => {
    if (result.isConfirmed && onConfirm) {
      onConfirm();
    }
  });
};

export { customSwal, customCenteredSwal, customModalSwal };