import { Button } from "@/shared/ui/button";
import { useLogin } from "../lib/useLogin";
import { cn } from "@/shared/lib";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { loginWithGoogle, isGoogleLoading } = useLogin();

  return (
    <div
      className={cn(
        "flex flex-col md:flex-row w-full items-center justify-center gap-6",
        className
      )}
      {...props}
    >
      {/* Efecto de onda eléctrica */}
      <div className="absolute w-full h-24 pointer-events-none flex items-center justify-center z-10">
        <div className="absolute w-full h-px bg-red-900/30" />
        <svg
          className="absolute w-full h-full mix-blend-screen opacity-80"
          preserveAspectRatio="none"
          viewBox="0 0 1000 40"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 0 20 L 150 20 L 160 5 L 175 35 L 190 10 L 205 30 L 215 20 L 450 20 L 460 10 L 475 35 L 490 5 L 505 25 L 515 20 L 750 20 L 760 5 L 775 35 L 790 10 L 805 30 L 815 20 L 950 20 L 960 10 L 975 35 L 990 10 L 1000 20"
            fill="none"
            stroke="#ff3333"
            strokeWidth=".5"
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength="300"
            style={{
              strokeDasharray: "40 960",
              animation: "electric-dash 6s linear infinite, electric-glow 2s ease-in-out infinite alternate"
            }}
          />
        </svg>
        <style>{`
          @keyframes electric-dash {
            0% { stroke-dashoffset: 1040; }
            100% { stroke-dashoffset: 40; }
          }
          @keyframes electric-glow {
            0% { opacity: 0.6; filter: drop-shadow(0 0 3px rgba(255, 51, 51, 0.6)); }
            100% { opacity: 1; filter: drop-shadow(0 0 10px rgba(255, 51, 51, 1)); }
          }
        `}</style>
      </div>
      <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-4 z-50">
        <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4">
          <img src="/trazea-icon.svg" alt="Trazea Logo" className="size-20" />
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white orbitron-title">Trazea</h1>
            <p className="text-lg text-gray-300">Bienvenido de vuelta</p>
          </div>

        </div>

        <div className="hidden md:block h-12 w-px bg-red-600" />

        <div className="grid h-12 overflow-hidden rounded-md relative cursor-pointer md:cursor-auto">
          {/* Texto que aparece desde abajo */}
          <div
            className={cn(
              "col-start-1 row-start-1 flex w-full h-full items-center justify-center rounded-md transition-transform duration-500 ease-in-out z-10",
              isGoogleLoading ? "translate-y-0" : "translate-y-full"
            )}
          >
            <p className="text-white text-base font-semibold animate-pulse">
              Redirigiendo a Google...
            </p>
          </div>

          {/* Botón original que se va hacia arriba */}
          <div
            className={cn(
              "col-start-1 row-start-1 w-full h-full transition-transform duration-500 ease-in-out z-20",
              isGoogleLoading ? "-translate-y-full" : "translate-y-0"
            )}
          >
            <Button
              type="button"
              className="w-full bg-red-400 hover:bg-red-500 h-12 text-base font-medium cursor-pointer"
              onClick={loginWithGoogle}
              disabled={isGoogleLoading}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="font-semibold">Continuar con Google</span>
            </Button>
          </div>
        </div>
      </div>


      <footer className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
        <p className="text-sm text-gray-500">© 2024 Trazea. All rights reserved.</p>
      </footer>
    </div>
  );
}
