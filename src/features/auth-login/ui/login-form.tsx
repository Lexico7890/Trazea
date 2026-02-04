import { Button } from "@/shared/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/shared/ui/field"
import { Input } from "@/shared/ui/input"
import { Eye, EyeOff } from "lucide-react"
import { useState } from "react"
import { useLogin } from "../lib/useLogin"
import { cn } from "@/shared/lib"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { login, resetPassword, isLoading } = useLogin()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await resetPassword(email);
  };

  return (
    <div
      className={cn(
        "relative flex flex-col gap-4 rounded-2xl overflow-hidden p-[2px] w-full max-w-md",
        className
      )}
      {...props}
    >
      {/* Capa de la luz giratoria con estela */}
      <div className="absolute inset-[-100%] animate-border-spin moving-light-gradient-trail" />

      {/* Contenido principal con fondo oscuro */}
      <div className="relative z-10 flex flex-col gap-6 bg-gray-800/95 backdrop-blur-sm p-8 rounded-2xl">
        <Card className="border-none shadow-none p-0 bg-transparent">
          <CardHeader className="text-center pb-2">
            <img src="/minca_logo.svg" alt="Minca Logo" className="size-16 mx-auto mb-4 rounded-xl" />
            <CardTitle className="text-2xl font-bold tracking-wider text-white uppercase">
              Minca Inventory
            </CardTitle>
            <CardDescription className="text-gray-400 mt-2">
              {isResettingPassword
                ? "Ingresa tu correo para recuperar tu contraseña"
                : "Log in to manage your fleet"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {isResettingPassword ? (
              <form onSubmit={handleResetSubmit}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="reset-email" className="text-gray-300 text-sm">
                      Email Address
                    </FieldLabel>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500/20"
                    />
                  </Field>
                  <Field>
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold py-3 rounded-lg shadow-lg shadow-red-500/25 transition-all duration-300"
                      disabled={isLoading}
                    >
                      {isLoading ? "Enviando..." : "Enviar enlace de recuperación"}
                    </Button>
                  </Field>
                  <Field>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full text-gray-400 hover:text-white hover:bg-gray-700/50"
                      onClick={() => setIsResettingPassword(false)}
                      disabled={isLoading}
                    >
                      Volver al Login
                    </Button>
                  </Field>
                </FieldGroup>
              </form>
            ) : (
              <form onSubmit={handleSubmit}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="email" className="text-gray-300 text-sm">
                      Email Address
                    </FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500/20"
                    />
                  </Field>
                  <Field>
                    <div className="flex items-center">
                      <FieldLabel htmlFor="password" className="text-gray-300 text-sm">
                        Password
                      </FieldLabel>
                      <button
                        type="button"
                        className="ml-auto text-sm text-red-400 hover:text-red-300 transition-colors"
                        onClick={() => setIsResettingPassword(true)}
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        autoComplete="current-password"
                        placeholder="********"
                        onChange={(e) => setPassword(e.target.value)}
                        className="pr-10 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-red-500 focus:ring-red-500/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-300 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </Field>
                  <Field className="pt-2">
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold py-3 rounded-lg shadow-lg shadow-red-500/25 transition-all duration-300 hover:shadow-red-500/40"
                      disabled={isLoading}
                    >
                      {isLoading ? "Iniciando sesión..." : "Login to Dashboard"}
                    </Button>
                  </Field>
                </FieldGroup>
              </form>
            )}
          </CardContent>
        </Card>
        <FieldDescription className="text-center text-gray-500 text-xs">
          By continuing, you agree to our{" "}
          <a href="#" className="underline underline-offset-2 hover:text-red-400 transition-colors">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="underline underline-offset-2 hover:text-red-400 transition-colors">
            Privacy Policy
          </a>.
        </FieldDescription>
      </div>
    </div>
  )
}