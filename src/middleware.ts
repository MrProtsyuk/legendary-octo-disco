import { withAuth } from "next-auth/middleware";

// Protects everything under /admin/* at the routing layer (§7).
// Unauthenticated requests are redirected to /admin/login (pages.signIn).
export default withAuth({
  pages: {
    signIn: "/admin/login",
  },
});

export const config = {
  // Everything under /admin except the login page itself.
  matcher: ["/admin/((?!login).*)", "/admin"],
};
