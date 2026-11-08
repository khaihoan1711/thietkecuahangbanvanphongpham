"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { usePersistentState } from "@/hooks/usePersistentState";
import { seedUsers } from "@/data/seed-users";
import { readText, removeKey, STORAGE_KEYS, writeText } from "@/lib/storage";
import type { ActionResult, Address, User, UserRole } from "@/types/store";

type RegisterInput = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
};

type ProfileInput = {
  fullName: string;
  email: string;
  phone: string;
};

type AuthContextValue = {
  users: User[];
  // Người đang đăng nhập (null nếu chưa đăng nhập hoặc tài khoản bị khóa)
  currentUser: User | null;
  isAdmin: boolean;
  isReady: boolean;
  register: (input: RegisterInput) => ActionResult;
  login: (email: string, password: string, remember: boolean) => ActionResult;
  logout: () => void;
  updateProfile: (input: ProfileInput) => ActionResult;
  updateAddress: (address: Address) => void;
  changePassword: (currentPassword: string, newPassword: string) => ActionResult;
  setUserLocked: (userId: string, locked: boolean) => ActionResult;
  setUserRole: (userId: string, role: UserRole) => ActionResult;
  resetUsers: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers, usersReady] = usePersistentState<User[]>(
    STORAGE_KEYS.users,
    seedUsers,
    Array.isArray,
  );
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);
  const [sessionReady, setSessionReady] = useState(false);

  // Đọc trạng thái đăng nhập sau khi trình duyệt tải xong.
  // "Ghi nhớ đăng nhập" lưu ở localStorage, nếu không thì chỉ lưu ở sessionStorage.
  useEffect(() => {
    const saved =
      readText(STORAGE_KEYS.session, "local") ??
      readText(STORAGE_KEYS.session, "session");

    setSessionUserId(saved);
    setSessionReady(true);
  }, []);

  // Tài khoản bị khóa sẽ bị coi như chưa đăng nhập.
  const foundUser = users.find((user) => user.id === sessionUserId);
  const currentUser = foundUser && !foundUser.isLocked ? foundUser : null;

  function startSession(userId: string, remember: boolean) {
    removeKey(STORAGE_KEYS.session);
    writeText(STORAGE_KEYS.session, userId, remember ? "local" : "session");
    setSessionUserId(userId);
  }

  function register(input: RegisterInput): ActionResult {
    const email = normalizeEmail(input.email);

    if (users.some((user) => user.email === email)) {
      return { ok: false, message: "Email này đã được đăng ký." };
    }

    const newUser: User = {
      id: `u-${Date.now().toString(36)}`,
      fullName: input.fullName.trim(),
      email,
      phone: input.phone.trim(),
      password: input.password,
      role: "user",
      isLocked: false,
      createdAt: new Date().toISOString(),
    };

    setUsers((current) => [...current, newUser]);
    // Đăng ký xong thì đăng nhập luôn.
    startSession(newUser.id, true);

    return { ok: true };
  }

  function login(email: string, password: string, remember: boolean): ActionResult {
    const user = users.find((item) => item.email === normalizeEmail(email));

    if (!user || user.password !== password) {
      return { ok: false, message: "Email hoặc mật khẩu không đúng." };
    }

    if (user.isLocked) {
      return {
        ok: false,
        message: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ cửa hàng.",
      };
    }

    startSession(user.id, remember);

    return { ok: true };
  }

  function logout() {
    removeKey(STORAGE_KEYS.session);
    setSessionUserId(null);
  }

  // Cập nhật một phần thông tin của người đang đăng nhập.
  function patchCurrentUser(patch: Partial<User>) {
    if (!currentUser) {
      return;
    }

    setUsers((current) =>
      current.map((user) =>
        user.id === currentUser.id ? { ...user, ...patch } : user,
      ),
    );
  }

  function updateProfile(input: ProfileInput): ActionResult {
    if (!currentUser) {
      return { ok: false, message: "Bạn cần đăng nhập để thực hiện thao tác này." };
    }

    const email = normalizeEmail(input.email);
    const emailTaken = users.some(
      (user) => user.id !== currentUser.id && user.email === email,
    );

    if (emailTaken) {
      return { ok: false, message: "Email này đã được dùng bởi tài khoản khác." };
    }

    patchCurrentUser({
      fullName: input.fullName.trim(),
      email,
      phone: input.phone.trim(),
    });

    return { ok: true };
  }

  function updateAddress(address: Address) {
    patchCurrentUser({ address });
  }

  function changePassword(currentPassword: string, newPassword: string): ActionResult {
    if (!currentUser) {
      return { ok: false, message: "Bạn cần đăng nhập để thực hiện thao tác này." };
    }

    if (currentUser.password !== currentPassword) {
      return { ok: false, message: "Mật khẩu hiện tại không đúng." };
    }

    patchCurrentUser({ password: newPassword });

    return { ok: true };
  }

  function setUserLocked(userId: string, locked: boolean): ActionResult {
    if (locked && currentUser?.id === userId) {
      return { ok: false, message: "Bạn không thể khóa chính tài khoản của mình." };
    }

    setUsers((current) =>
      current.map((user) =>
        user.id === userId ? { ...user, isLocked: locked } : user,
      ),
    );

    return { ok: true };
  }

  function setUserRole(userId: string, role: UserRole): ActionResult {
    if (currentUser?.id === userId) {
      return { ok: false, message: "Bạn không thể đổi quyền của chính mình." };
    }

    setUsers((current) =>
      current.map((user) => (user.id === userId ? { ...user, role } : user)),
    );

    return { ok: true };
  }

  function resetUsers() {
    setUsers(seedUsers);
    logout();
  }

  return (
    <AuthContext.Provider
      value={{
        users,
        currentUser,
        isAdmin: currentUser?.role === "admin",
        isReady: usersReady && sessionReady,
        register,
        login,
        logout,
        updateProfile,
        updateAddress,
        changePassword,
        setUserLocked,
        setUserRole,
        resetUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth phải nằm trong AuthProvider.");
  }

  return context;
}
