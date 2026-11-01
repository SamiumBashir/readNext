import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { isUserAdmin } from "@/lib/admin";
import {
  getAllUsersAdmin,
  getUserDetailsWithBorrows,
  toggleUserStatus,
} from "@/services/user.service";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 }
      );
    }

    if (!isUserAdmin(session.user)) {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden: Curator administrator privilege required.",
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (userId) {
      const data = await getUserDetailsWithBorrows(userId);
      if (!data.user) {
        return NextResponse.json(
          { success: false, message: "User not found in system." },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        user: data.user,
        borrows: data.borrows,
      });
    }

    const users = await getAllUsersAdmin();

    return NextResponse.json({
      success: true,
      users,
      total: users.length,
    });
  } catch (error) {
    console.error("API GET /api/admin/users error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to retrieve users." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 }
      );
    }

    if (!isUserAdmin(session.user)) {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden: Curator administrator privilege required.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, status } = body;

    if (!userId || !["active", "suspended"].includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid userId and status ('active' or 'suspended') are required.",
        },
        { status: 400 }
      );
    }

    const success = await toggleUserStatus(userId, status);

    if (!success) {
      return NextResponse.json(
        { success: false, message: "Failed to update user status." },
        { status: 404 }
      );
    }

    revalidatePath("/admin");

    return NextResponse.json({
      success: true,
      message: `User status updated to ${status}.`,
      status,
    });
  } catch (error) {
    console.error("API PATCH /api/admin/users error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error occurred while updating user status.",
      },
      { status: 500 }
    );
  }
}

