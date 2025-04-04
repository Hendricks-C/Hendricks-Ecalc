import Alert from "../components/alert";
import { useLocation } from 'react-router-dom'

function Welcome() {
  const location = useLocation();
  const showBadgeAlert = location.state?.alertText;
  console.log(showBadgeAlert);
  return (
    <div>
      {showBadgeAlert && <Alert text={showBadgeAlert} show={true} />}
      <h1>Welcome to the app!</h1>
    </div>
  );
}

export default Welcome;