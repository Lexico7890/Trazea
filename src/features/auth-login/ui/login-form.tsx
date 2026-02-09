import { Button } from "@/shared/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/shared/ui/field"
import { Input } from "@/shared/ui/input"
import { Eye, EyeOff, Phone } from "lucide-react"
import { useState } from "react"
import { useLogin } from "../lib/useLogin"
import { cn } from "@/shared/lib"
import { Checkbox } from "@/shared/ui/checkbox"

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
    <div className={cn("relative min-w-96 w-[500px]", className)} {...props}>
      {/* Estela estática detrás - posicionada a la izquierda */}
      {/* Estela izquierda superior */}
      <div
        className="absolute -left-32 top-1/4 w-96 h-[500px] rounded-full opacity-60 animate-float-1"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(246, 59, 59, 0.6) 0%, rgba(246, 59, 59, 0.3) 30%, rgba(246, 59, 59, 0.1) 60%, transparent 100%)',
        }}
      />

      {/* Estela derecha inferior */}
      <div
        className="absolute -right-32 top-3/4 w-96 h-[500px] rounded-full opacity-60 animate-float-2"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(246, 59, 59, 0.6) 0%, rgba(246, 59, 59, 0.3) 30%, rgba(246, 59, 59, 0.1) 60%, transparent 100%)',
        }}
      />

      {/* Formulario principal */}
      <div className="relative z-10 rounded-xl bg-background/10 md:border md:border-gray-800 flex flex-col gap-2 p-6">
        <Card className="border-none shadow-none p-0 bg-transparent">
          <CardHeader className="text-center space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <img src="/minca_logo.svg" alt="Minca Logo" className="size-10 mx-auto" />
                <CardTitle className="text-2xl orbitron-title">Minca Inventory System</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">Bienvenido de vuelta</p>
            </div>
          </CardHeader>
          <CardContent>
            {isResettingPassword ? (
              <form onSubmit={handleResetSubmit}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="reset-email">Email</FieldLabel>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Enviando..." : "Enviar enlace de recuperación"}
                    </Button>
                  </Field>
                  <Field>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full"
                      onClick={() => setIsResettingPassword(false)}
                      disabled={isLoading}
                    >
                      Volver al Login
                    </Button>
                  </Field>
                </FieldGroup>
              </form>
            ) : (
              <div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <FieldGroup className="space-y-2">
                    <Field>
                      <FieldLabel htmlFor="email" className="text-base font-medium">Email</FieldLabel>
                      <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12"
                      />
                    </Field>
                    <Field className="space-y-2">
                      <div className="flex items-center justify-between">
                        <FieldLabel htmlFor="password" className="text-base font-medium">Password</FieldLabel>
                        <button
                          type="button"
                          className="text-sm text-red-600 hover:text-red-700 underline-offset-4 hover:underline transition-colors"
                          onClick={() => setIsResettingPassword(true)}
                        >
                          Forgot your password?
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
                          className="pr-10 h-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                          ) : (
                            <Eye className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </Field>
                    <Field orientation="horizontal" data-invalid>
                      <Checkbox
                        id="terms-checkbox-invalid"
                        name="terms-checkbox-invalid"
                        aria-invalid
                      />
                      <FieldLabel htmlFor="terms-checkbox-invalid">
                        Recuérdame
                      </FieldLabel>
                    </Field>
                    <Field>
                      <Button type="submit" className="w-full btn-red-gradient text-white h-12 text-base font-medium" disabled={isLoading}>
                        {isLoading ? "Iniciando sesión..." : "Login"}
                      </Button>
                    </Field>
                  </FieldGroup>
                </form>

                <div className="divider">
                  <span>OR</span>
                </div>

                <div className="space-y-3">
                  <Button type="button" className="w-full btn-secondary h-12 text-base font-medium">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continuar con Google
                  </Button>
                  <Button type="button" className="w-full btn-secondary h-12 text-base font-medium">
                    <Phone className="w-5 h-5 mr-2" />
                    Continuar con Teléfono
                  </Button>
                </div>

                <footer className="text-center pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">© 2024 Minca Electric. All rights reserved.</p>
                </footer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}