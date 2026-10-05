Angular JWT integration samples

Files provided:
- auth.service.ts — simple service that calls /api/user/authenticate and stores JWT in localStorage
- auth.interceptor.ts — HTTP interceptor that attaches Authorization: Bearer <token> and handles 401 responses
- auth.guard.ts — simple route guard that redirects to /login when not authenticated

Usage:
1. Add AuthInterceptor to your AppModule providers:

  providers: [
	{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ]

2. Wire up AuthGuard on protected routes and use AuthService.login/logout in your login component.

Security notes:
- Store production tokens securely; localStorage is simple but vulnerable to XSS. Consider using HttpOnly cookies if needed.
- Do not store signing keys or secrets in frontend code.
