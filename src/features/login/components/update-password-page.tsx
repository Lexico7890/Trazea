import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useLogin } from "@/features/login/hooks/useLogin"
import { useState } from "react"
import { cn } from "@/lib/utils"

export function UpdatePasswordPage() {
  const { updatePassword, isLoading } = useLogin();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (password.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres");
        return;
    }
    setError(null);
    await updatePassword(password);
  };

  return (
    <div className="flex h-screen items-center justify-center">
        <div
        className={cn(
            "relative flex flex-col gap-4 rounded-xl overflow-hidden p-[1px] w-full max-w-sm",
        )}
        >
        <div className="absolute inset-[-100%] animate-border-spin moving-light-gradient" />

        <div className="relative bg-card z-10 flex flex-col gap-6 bg-background p-6 rounded-xl">
            <Card className="border-none shadow-none p-0">
            <CardHeader className="text-center">
                <CardTitle className="text-xl">Actualizar Contraseña</CardTitle>
                <CardDescription>
                Ingresa tu nueva contraseña
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit}>
                <FieldGroup>
                    <Field>
                    <FieldLabel htmlFor="password">Nueva Contraseña</FieldLabel>
                    <Input
                        id="password"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    </Field>
                    <Field>
                    <FieldLabel htmlFor="confirmPassword">Confirmar Contraseña</FieldLabel>
                    <Input
                        id="confirmPassword"
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    </Field>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <Field>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Actualizando..." : "Actualizar Contraseña"}
                    </Button>
                    </Field>
                </FieldGroup>
                </form>
            </CardContent>
            </Card>
        </div>
        </div>
    </div>
  )
}
