"use client";

import { useState } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminTable from "@/components/admin/AdminTable";
import UserDetailModal from "@/components/admin/users/UserDetailModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { formatDate } from "@/lib/format";
import type { User } from "@/types/store";

type PendingAction =
  | { type: "lock"; user: User }
  | { type: "unlock"; user: User }
  | { type: "role"; user: User };

const filterStyle =
  "h-11 rounded-lg border border-line bg-white px-3 text-sm text-ink focus:border-primary focus:outline-none focus:ring-[3px] focus:ring-primary-soft";

function simplify(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d");
}

// Nội dung hộp thoại xác nhận cho từng thao tác.
function describeAction(action: PendingAction) {
  const name = action.user.fullName;

  if (action.type === "lock") {
    return {
      title: "Khóa tài khoản",
      message: `Khóa tài khoản của ${name}? Người này sẽ không thể đăng nhập cho đến khi được mở khóa.`,
      confirmLabel: "Khóa tài khoản",
    };
  }

  if (action.type === "unlock") {
    return {
      title: "Mở khóa tài khoản",
      message: `Mở khóa tài khoản của ${name}? Người này có thể đăng nhập trở lại.`,
      confirmLabel: "Mở khóa",
    };
  }

  const toAdmin = action.user.role === "user";

  return {
    title: "Đổi quyền tài khoản",
    message: toAdmin
      ? `Cấp quyền Admin cho ${name}? Người này sẽ vào được khu vực quản trị.`
      : `Thu hồi quyền Admin của ${name}? Người này sẽ trở thành người dùng thường.`,
    confirmLabel: toAdmin ? "Cấp quyền Admin" : "Thu hồi quyền",
  };
}

// Trang quản lý người dùng: xem, tìm kiếm, khóa/mở khóa và phân quyền Admin/User.
export default function UsersAdminView() {
  const { users, currentUser, setUserLocked, setUserRole } = useAuth();
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");
  const [viewing, setViewing] = useState<User | null>(null);
  const [pending, setPending] = useState<PendingAction | null>(null);

  const needle = simplify(search.trim());
  const visible = users.filter(
    (user) =>
      (!needle ||
        simplify(`${user.fullName} ${user.email} ${user.phone}`).includes(needle)) &&
      (roleFilter === "all" || user.role === roleFilter),
  );

  function handleConfirm() {
    if (!pending) {
      return;
    }

    const { type, user } = pending;
    const result =
      type === "role"
        ? setUserRole(user.id, user.role === "admin" ? "user" : "admin")
        : setUserLocked(user.id, type === "lock");

    if (result.ok) {
      showToast("Đã cập nhật tài khoản.");
    } else {
      showToast(result.message, "error");
    }

    setPending(null);
  }

  const dialog = pending ? describeAction(pending) : null;

  return (
    <>
      <AdminPageHeader
        title="Quản lý người dùng"
        description="Khóa/mở khóa tài khoản và phân biệt quyền Admin, User."
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <input
          type="search"
          aria-label="Tìm người dùng"
          placeholder="Tìm theo tên, email, số điện thoại..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className={`${filterStyle} min-w-[220px] flex-1`}
        />
        <select
          aria-label="Lọc theo quyền"
          value={roleFilter}
          onChange={(event) =>
            setRoleFilter(event.target.value as "all" | "admin" | "user")
          }
          className={filterStyle}
        >
          <option value="all">Mọi quyền</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
      </div>

      <p className="mb-3 text-sm text-ink-muted">
        Hiển thị <strong className="text-ink">{visible.length}</strong> / {users.length}{" "}
        tài khoản
      </p>

      <AdminTable
        columns={[
          "Người dùng",
          "Số điện thoại",
          "Quyền",
          "Trạng thái",
          "Ngày tạo",
          "Thao tác",
        ]}
        rowCount={visible.length}
        emptyMessage="Không tìm thấy người dùng phù hợp."
      >
        {visible.map((user) => {
          const isSelf = user.id === currentUser?.id;

          return (
            <tr key={user.id}>
              <td className="px-4 py-3">
                <p className="font-semibold text-navy">
                  {user.fullName}
                  {isSelf && (
                    <span className="ml-2 text-xs font-normal text-ink-muted">
                      (Bạn)
                    </span>
                  )}
                </p>
                <p className="text-xs text-ink-muted">{user.email}</p>
              </td>
              <td className="whitespace-nowrap px-4 py-3">{user.phone}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                    user.role === "admin"
                      ? "bg-navy text-white"
                      : "bg-surface text-ink-muted"
                  }`}
                >
                  {user.role === "admin" ? "Admin" : "User"}
                </span>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                    user.isLocked
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {user.isLocked ? "Đã khóa" : "Hoạt động"}
                </span>
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-ink-muted">
                {formatDate(user.createdAt)}
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                <button
                  type="button"
                  onClick={() => setViewing(user)}
                  className="min-h-10 px-2 font-semibold text-primary hover:underline"
                >
                  Xem
                </button>
                <button
                  type="button"
                  disabled={isSelf}
                  onClick={() =>
                    setPending({ type: user.isLocked ? "unlock" : "lock", user })
                  }
                  className="min-h-10 px-2 font-semibold text-red-600 hover:underline disabled:cursor-not-allowed disabled:text-ink-muted disabled:no-underline"
                >
                  {user.isLocked ? "Mở khóa" : "Khóa"}
                </button>
                <button
                  type="button"
                  disabled={isSelf}
                  onClick={() => setPending({ type: "role", user })}
                  className="min-h-10 px-2 font-semibold text-navy hover:underline disabled:cursor-not-allowed disabled:text-ink-muted disabled:no-underline"
                >
                  {user.role === "admin" ? "Thu quyền" : "Cấp Admin"}
                </button>
              </td>
            </tr>
          );
        })}
      </AdminTable>

      {viewing && (
        <UserDetailModal
          // Lấy bản mới nhất trong kho để thông tin luôn đúng sau khi khóa/đổi quyền.
          user={users.find((user) => user.id === viewing.id) ?? viewing}
          onClose={() => setViewing(null)}
        />
      )}

      {pending && dialog && (
        <ConfirmDialog
          title={dialog.title}
          message={dialog.message}
          confirmLabel={dialog.confirmLabel}
          danger={pending.type === "lock"}
          onConfirm={handleConfirm}
          onCancel={() => setPending(null)}
        />
      )}
    </>
  );
}
