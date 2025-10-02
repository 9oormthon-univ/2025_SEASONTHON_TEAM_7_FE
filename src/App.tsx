import { BrowserRouter, Route, Routes } from "react-router-dom";
import {
  Home,
  Labs,
  Login,
  ExtraInfo,
  Chat,
  ChatRoom,
  Review,
  Notification,
  Decide,
  Splash,
  Onboard1,
  Onboard2,
} from "./pages";
import My from "./pages/My";
import { MyReview } from "./pages/MyReview";
import HomeChatRequest from "./pages/Home/HomeChatRequest";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import { LayoutProvider } from "./contexts/LayoutProvider";
import { ChatLab } from "./components/chat";
import ScrollToTop from "./utils/scrollToTop";
import { useAuthGuard } from "./services/hooks/useAuthGuard";

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

function AppContent() {
  // 전역 인증 가드 적용
  useAuthGuard();
  
  return (
    <LayoutProvider>
      <Layout>
        <ScrollToTop />
        <Routes>
            {/* 온보딩 페이지 */}
            <Route path="/splash" element={<Splash />} />
            <Route path="/onboard/1" element={<Onboard1 />} />
            <Route path="/onboard/2" element={<Onboard2 />} />
            
            {/* 공개 페이지 */}
            <Route path="/" element={<Home />} />
            <Route path="/labs" element={<Labs />} />
            <Route path="/chat-request" element={<HomeChatRequest />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/chatlab" element={<ChatLab />} />
            <Route path="/chat/:chatRoomId" element={<ChatRoom />} />
            <Route path="/review" element={<Review />} />
            <Route path="/notification" element={<Notification />} />
            <Route path="/profile" element={<My />} />
            <Route path="/my-reviews" element={<MyReview />} />
            <Route path="/notification/decide/:refId" element={<Decide />} />

            {/* 비인증 사용자만 접근 가능 (로그인, 회원가입 등) */}
            <Route
              path="/login"
              element={
                <ProtectedRoute requireAuth={false}>
                  <Login />
                </ProtectedRoute>
              }
            />
            <Route
              path="/signup/extra-info"
              element={
                <ProtectedRoute requireAuth={false}>
                  <ExtraInfo />
                </ProtectedRoute>
              }
            />
        </Routes>
      </Layout>
    </LayoutProvider>
  );
}

export default App;
