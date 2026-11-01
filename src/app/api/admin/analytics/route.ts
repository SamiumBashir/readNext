import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { isUserAdmin } from "@/lib/admin";
import { getDashboardAnalytics } from "@/services/borrow.service";

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

    const analytics = await getDashboardAnalytics();

    return NextResponse.json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error("API GET /api/admin/analytics error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to compute dashboard analytics." },
      { status: 500 }
    );
  }
}
