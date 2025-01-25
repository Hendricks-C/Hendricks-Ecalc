import LoginBox from '../components/loginBox'
function Login() {

  return (
    <> 
      <div className='flex flex-row justify-evenly items-center'>
        <div>
          <img src="../assets/react.svg" alt="Hendricks Foundation" />
        </div>
        <div>
          <LoginBox />
        </div>
      </div>
    </>
  )
}

export default Login