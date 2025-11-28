import OtpVerification from "@/components/otp-verification"

export default function VerifyOtpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, #9ca3af 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />
      <OtpVerification />
    </div>
  )
}
