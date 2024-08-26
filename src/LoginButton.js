import {usePrivy} from '@privy-io/react-auth';
import './App.css'

function LoginButton() {
  const {ready, authenticated, login, logout} = usePrivy();
  // Disable login when Privy is not ready or the user is already authenticated
  const disableLogin = !ready || (ready && authenticated);

  return (
    <>
    {!authenticated ?
    <button className="getstartedbutton" onClick={login}>
      Login test button
    </button>
    :
    <button className="getstartedbutton" onClick={logout}>
      Log out
    </button>
  }
    </>
  );
}

export {LoginButton};