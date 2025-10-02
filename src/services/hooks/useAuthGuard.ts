import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { tokenService } from '../auth/tokenService';
import { onboardService } from '../onboard/onboardService';

export const useAuthGuard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const hasAccessToken = !!tokenService.getAccessToken();
    const isOnboarded = onboardService.isOnboarded();
    const currentPath = location.pathname;
    
    // 토큰 없이도 접근 가능한 페이지들
    const publicPaths = [
      '/login',
      '/signup/extra-info',
      '/splash',
      '/onboard/1',
      '/onboard/2'
    ];
    
    const isPublicPath = publicPaths.includes(currentPath);

    // 1. 토큰이 없는 경우
    if (!hasAccessToken) {
      if (!isPublicPath) {
        // 보호된 페이지에 접근하려고 하면 로그인으로 리다이렉트
        navigate('/login', { replace: true });
        return;
      }
      // 공개 페이지는 그대로 접근 허용
      return;
    }

    // 2. 토큰은 있지만 온보딩이 안된 경우
    if (hasAccessToken && !isOnboarded) {
      if (currentPath === '/splash' || currentPath.startsWith('/onboard/')) {
        // 이미 온보딩 관련 페이지에 있으면 그대로 허용
        return;
      }
      // 다른 페이지에 있으면 스플래시로 리다이렉트
      navigate('/splash', { replace: true });
      return;
    }

    // 3. 토큰도 있고 온보딩도 완료된 경우
    if (hasAccessToken && isOnboarded) {
      if (currentPath === '/login') {
        // 로그인 페이지에 있으면 홈으로 리다이렉트
        navigate('/', { replace: true });
        return;
      }
      if (currentPath === '/splash' || currentPath.startsWith('/onboard/')) {
        // 온보딩 관련 페이지에 있으면 홈으로 리다이렉트
        navigate('/', { replace: true });
        return;
      }
      // 정상 접근 허용
      return;
    }
  }, [location.pathname, navigate]);

  return {
    hasToken: !!tokenService.getAccessToken(),
    isAuthenticated: !!tokenService.getAccessToken() && onboardService.isOnboarded()
  };
};
