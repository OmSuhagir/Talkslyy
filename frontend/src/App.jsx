import { Routes, Route, Navigate } from 'react-router'
import LoginPage from './pages/LoginPage.jsx'
import HomePage from './pages/HomePage'
import NotificationPage from './pages/NotificationPage'
import CallPage from './pages/CallPage'
import ChatPage from './pages/ChatPage'
import OnboardingPage from './pages/OnboardingPage'
import './index.css';
import PageLoader from './components/PageLoader.jsx'
import useAuthUser from './hooks/useAuthUser.js'
import { Toaster } from 'react-hot-toast'
import SignUpPage from './pages/SignupPage'
import Layout from './components/Layout.jsx'
import { useThemeStore } from './store/useThemeStore.js'

const App = () => {

  const { isLoading, authUser } = useAuthUser();

  const {theme, setTheme} = useThemeStore();

  const isAuthenticated = Boolean(authUser);
  const isOnboarded = authUser?.isOnboarded;

  // const {data:authData, isLoading, error} = useQuery({
  //   queryKey:["authUser"],
  //   queryFn: async () => {
  //     const res = await axiosInstance.get("/auth/me");
  //     return res.data;
  //   },
  //   retry: false
  // })

  // const authUser = authData?.user;


  if (isLoading) return (
        <PageLoader />
  )

  return (
    <div className="h-full" data-theme={theme}>

      <Routes>
        <Route path='/' element={isAuthenticated && isOnboarded ? (
          <Layout showSidebar={true}>
            <HomePage />
          </Layout>
        ) : (
          <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
        )} />

        <Route
          path="/signup"
          element={
            !isAuthenticated ? <SignUpPage /> : <Navigate to={isOnboarded ? "/" : "/onboarding"} />
          }
        />
        
         <Route
          path="/login"
          element={
            !isAuthenticated ? <LoginPage /> : <Navigate to={isOnboarded ? "/" : "/onboarding"} />
          }
        />

        <Route
          path="/notification"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout showSidebar={true}>
                <NotificationPage />
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />

        <Route
          path="/call/:id"
          element={
            isAuthenticated && isOnboarded ? (
              <CallPage />
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />
        
        <Route path='/chat/:id' element={isAuthenticated ? <Layout>
          <ChatPage />
        </Layout> : <Navigate to='/login' />} />
        
       <Route
          path="/onboarding"
          element={
            isAuthenticated ? (
              !isOnboarded ? (
                <OnboardingPage />
              ) : (
                <Navigate to="/" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />

      </Routes>

      <Toaster></Toaster>
    </div>
    
  )
  
}
  

export default App
