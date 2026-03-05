import { Suspense } from "react";
import { LogOut } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";

export default function UnauthorizedPage() {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10 bg-muted/30">
            <div className="max-w-md w-full text-center space-y-6 bg-card p-10 rounded-xl border shadow-sm">
                <div className="bg-destructive/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                    <LogOut className="text-destructive h-8 w-8" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight">Access Denied</h1>
                    <p className="text-muted-foreground">
                        Your account is not authorized to access the Admin Panel. You may need to be approved by an administrator.
                    </p>
                </div>

                <Suspense fallback={null}>
                    <LogoutButton
                        className="w-full flex items-center justify-center gap-2 mt-4"
                        redirectTo="/auth/login"
                    >
                        <>
                            <LogOut className="h-4 w-4" />
                            Sign out and try another account
                        </>
                    </LogoutButton>
                </Suspense>
            </div>
        </div>
    );
}
