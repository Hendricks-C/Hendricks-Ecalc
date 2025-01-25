import RegisterBox from '../components/registerBox'
function Register() {

  return (
    <>
      <div className='flex flex-row justify-evenly items-center'>
        <div>
          <img src="../assets/react.svg" alt="Hendricks Foundation" />
        </div>
        <div>
          <RegisterBox />
        </div>
      </div>
    </>
  )
}

export default Register