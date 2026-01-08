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
import { useState } from "react"
import { useLogin } from "../lib/useLogin"
import { cn } from "@/shared/lib"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { login, resetPassword, isLoading } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await resetPassword(email);
  };

  return (
    // 1. Contenedor principal: relativo, con bordes redondeados y overflow hidden para contener la luz
    <div
      className={cn(
        "relative flex flex-col gap-4 rounded-xl overflow-hidden p-[1px]", // p-[1px] define el grosor del borde brillante
        className
      )}
      {...props}
    >
      {/* 2. Capa de la luz giratoria: Se posiciona absolutamente detrás del contenido */}
      <div className="absolute inset-[-100%] animate-border-spin moving-light-gradient" />

      {/* 3. Contenido principal: Debe tener un fondo sólido (bg-background) y estar encima (z-10/relative) */}
      <div className="relative bg-card z-10 flex flex-col gap-6 bg-background p-6 rounded-xl">
        <Card className="border-none shadow-none p-0"> {/* Removemos bordes y padding extra de la Card interna */}
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Minca Inventory System</CardTitle>
            <CardDescription>
              {isResettingPassword
                ? "Ingresa tu correo para recuperar tu contraseña"
                : "Logueate con tu correo y contraseña"}
            </CardDescription>
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
              <form onSubmit={handleSubmit}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <div className="flex items-center">
                      <FieldLabel htmlFor="password">Password</FieldLabel>
                      <button
                        type="button"
                        className="ml-auto text-sm underline-offset-4 hover:underline"
                        onClick={() => setIsResettingPassword(true)}
                      >
                        Forgot your password?
                      </button>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      autoComplete="current-password"
                      placeholder="********"
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Iniciando sesión..." : "Login"}
                    </Button>
                  </Field>
                </FieldGroup>
              </form>
            )}
          </CardContent>
        </Card>
        <FieldDescription className="text-center">
          By clicking continue, you agree to our <a href="#" className="underline underline-offset-2 hover:text-primary">Terms of Service</a>{" "}
          and <a href="#" className="underline underline-offset-2 hover:text-primary">Privacy Policy</a>.
        </FieldDescription>
      </div>
    </div>
  )
}