import { LoginForm } from "@/features/auth-login";

export function LoginPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      <div
        className="absolute inset-0 flex items-start justify-center"
        style={{
          maskImage: "linear-gradient(to bottom, black 0%, transparent 60%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 60%)",
        }}
      >
        <img
          src="/trazea-icon.svg"
          alt=""
          className="w-[90vh] h-[90vh] opacity-20"
          aria-hidden="true"
        />
      </div>

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(80,0,0,0.8) 50%, rgba(0,0,0,0.9) 100%)",
        }}
      />

      <div className="relative z-10 flex h-screen">
        <div className="flex w-full items-center justify-center">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
