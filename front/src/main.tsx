import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import SignupPage from './auth/signup.tsx'
import LoginPage from './auth/login.tsx'
import ProfilePage  from './general/profile.tsx'
import Layout from './general/layout.tsx'
import SearchPage from './general/search.tsx'
import ForgotPasswordPage from './auth/password-reset.tsx'
import VerifyCodePage from './auth/verify-code.tsx'
import MakeNewPasswordPage from './auth/newPassword.tsx'
import AccountPage from './general/account.tsx'
import SettingsPage from './general/settings.tsx'
import GroupsPage from './general/groups.tsx'
import VerifyEmail from './auth/verifyEmail.tsx'
import ChatPage from './general/chat.tsx'
import ChatsPage from './general/chats.tsx'
import GroupPage from './general/group.tsx'
import { PublicRoute } from './PublicRoute.tsx'

const router = createBrowserRouter([
  {path: '/', element: 
    <PublicRoute>
      <SignupPage/>
    </PublicRoute>
  },
  {path: '/login', element: 
    <PublicRoute>
      <LoginPage/>
    </PublicRoute>
  },
  {path: "forgot-password", element: <ForgotPasswordPage/>},
  {path: "verify-code", element: <VerifyCodePage/>},
  {path: "password-reset", element: <MakeNewPasswordPage/>},
  {path: "verify-email", element: <VerifyEmail/>},
  {path: "/profile", element: <Layout/>, children: [
    {path: "", element: <ProfilePage/>},
    {path: "search", element: <SearchPage/>},
    {path: "search/account/:id", element: <AccountPage/>},
    {path: "settings", element: <SettingsPage/>},
    {path: "groups", element: <GroupsPage/>},
    {path: "chat/:id", element: <ChatPage/>},
    {path: "chats", element: <ChatsPage/>},
    {path: "account/:id", element: <AccountPage/>},
    {path: "groups/:id", element: <GroupPage/>}
  ]}
])

createRoot(document.getElementById('root')!).render(
  <RouterProvider router={router}/>
)