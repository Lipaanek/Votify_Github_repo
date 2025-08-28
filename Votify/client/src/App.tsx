import './App.css'

function App() {

  return (
    <>
      <div className='top_bar'>
        <button>View Groups</button>
        <button>Create Group</button>
      </div>
      <div className="logo">
        <image>
          <img src='./src/assets/voxplatform_logo.png'></img>
        </image>
      </div>
      <h1>VoxPlatform</h1>
      <p>VoxPlatform, the best voting online service under the sun. Try now for free.</p>
      <div className='action_selection'>
        <button>Login</button>
        <button>Create Account</button>
      </div>
      
    </>
  )
}

export default App
