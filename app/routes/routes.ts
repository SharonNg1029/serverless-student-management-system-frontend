import { type RouteConfig, layout, route, index } from "@react-router/dev/routes";

export default [
  {
    id: "root-layout",
    file: "./root.tsx",
    children: [
      index("./page.tsx"),
      route("login", "./pages/login.tsx"),
      route("home", "./pages/home.tsx"),
      route("dashboard", "./pages/dashboard.tsx"),
      route("students", "./pages/students.tsx"),
      route("courses", "./pages/courses.tsx"),
    ],
  },
] satisfies RouteConfig;

