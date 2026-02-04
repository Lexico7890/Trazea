import { LoginForm } from "@/features/auth-login";


export function LoginPage() {
    return (
        <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600">
            <LoginForm />
        </div>
    )
}