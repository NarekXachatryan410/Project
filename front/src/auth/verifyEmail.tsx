import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, Mail } from "lucide-react"
import { Axios } from "../api/api" // your Axios instance
import { useNavigate } from "react-router-dom"

export default function VerifyEmail() {
  const [code, setCode] = useState(Array(6).fill(""))
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const inputs = useRef<(HTMLInputElement | null)[]>([])
  const [resending, setResending] = useState(false)
  const navigate = useNavigate()  

  // handle typing
  const handleChange = (value: string, index: number) => {
    const newCode = [...code]
    newCode[index] = value.toUpperCase()
    setCode(newCode)

    // auto focus next
    if (value && index < 5) inputs.current[index + 1]?.focus()
  }

  const handleSubmit = async () => {
    setError("")
    setLoading(true)
    try {
      const joined = code.join("")
      const email = localStorage.getItem("pendingEmail") // assuming you saved user email on signup
      const res = await Axios.post("/verifyEmail", { email, code: joined })

      if (res.data?.message) {
        setSuccess(true)
        setTimeout(() => {
            navigate('/login')
        }, 2000)
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Invalid or expired code")
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
     try {
      const email = localStorage.getItem("pendingEmail");
      if (!email) return alert("Email missing");
      setResending(true);
      const res = await Axios.post("/resend", { email });
      alert(res.data.message);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to resend code");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-100 via-white to-emerald-50">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="bg-white p-10 rounded-3xl shadow-2xl max-w-md w-full text-center"
      >
        <AnimatePresence>
          {!success ? (
            <motion.div
              key="verify"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex justify-center mb-6">
                <motion.div
                  animate={{ rotate: [0, -5, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 4 }}
                >
                  <Mail className="text-emerald-500" size={50} />
                </motion.div>
              </div>

              <h1 className="text-2xl font-semibold text-gray-800 mb-2">Verify your email</h1>
              <p className="text-gray-500 mb-8">
                Enter the 6-digit code we sent to your email
              </p>

              <div className="flex justify-center gap-3 mb-6">
                {code.map((digit, i) => (
                  <motion.input
                    key={i}
                    ref={(el) => (inputs.current[i] = el)}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(e.target.value, i)}
                    className="w-12 h-14 text-center border-2 rounded-xl text-lg font-semibold focus:border-emerald-500 outline-none transition-all"
                    whileFocus={{ scale: 1.1 }}
                  />
                ))}
              </div>

              {error && <p className="text-red-500 mb-3 text-sm">{error}</p>}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmit}
                disabled={loading}
                className="bg-emerald-500 text-white font-medium py-3 rounded-2xl w-full shadow-md hover:bg-emerald-600 transition-all"
              >
                {loading ? "Verifying..." : "Verify"}
              </motion.button>

              <p className="text-gray-400 text-sm mt-5">
                Didn’t get the code?{" "}
                <span className="text-emerald-500 cursor-pointer hover:underline" onClick={handleResend}>
                  Resend
                </span>
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center"
            >
              <CheckCircle2 className="text-emerald-500" size={70} />
              <h2 className="text-xl font-semibold text-gray-800 mt-4">Verified Successfully!</h2>
              <p className="text-gray-500 mt-2">Redirecting to login...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
