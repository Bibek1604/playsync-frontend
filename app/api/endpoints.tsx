export const ENDPOINTS = {
    // Auth endpoints on backend are namespaced under /auth
    RegisterUser: "/auth/register/user",
    RegisterAdmin: "/auth/register/admin",
    LoginUser: "/auth/login",
    RefreshToken: "/auth/refresh-token",
    // Health or root can be used for simple connectivity checks
    Health: "/",
    // User and games endpoints
    UserProfile: "/user",
    Games: "/games",
};
