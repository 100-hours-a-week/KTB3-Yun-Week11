import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/Login";
import SingupPage from "./pages/Signup";
// import PostsListPage from './pages/PostsList'
// import PostDetailPage from './pages/PostDetail'
// import PostingPage from './pages/Posting'
// import PostEditingPage from './pages/PostEditing'
// import MyPage from './pages/MyPage'
// import PasswordEditingPage from './pages/PasswordEditing'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        {
          <Route path="/signup" element={<SingupPage />} />
          // <Route path="/posts" element={<PostsListPage />} />
          // <Route path="/post" element={<PostDetailPage />} />
          // <Route path="/newpost" element={<PostingPage />} />
          // <Route path="/editpost" element={<PostEditingPage />} />
          // <Route path="/mypage" element={<MyPage />} />
          // <Route path="/newpassword" element={<PasswordEditingPage />} />
        }
      </Routes>
    </BrowserRouter>
  );
}

export default App;
