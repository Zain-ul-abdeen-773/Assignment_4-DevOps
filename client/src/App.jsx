import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import api from "./lib/api";

const trendData = [
  { month: "Jan", accuracy: 86 },
  { month: "Feb", accuracy: 88 },
  { month: "Mar", accuracy: 89 },
  { month: "Apr", accuracy: 92 },
  { month: "May", accuracy: 93 },
  { month: "Jun", accuracy: 94 }
];

const statusStyles = {
  Deployed: "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/40 shadow-[0_0_18px_rgba(52,211,153,0.45)]",
  Staging: "bg-amber-500/20 text-amber-200 ring-1 ring-amber-400/40 shadow-[0_0_18px_rgba(251,191,36,0.35)]",
  Training: "bg-sky-500/20 text-sky-200 ring-1 ring-sky-400/40 shadow-[0_0_18px_rgba(56,189,248,0.35)]",
  Archived: "bg-slate-500/20 text-slate-200 ring-1 ring-slate-400/40 shadow-[0_0_18px_rgba(148,163,184,0.35)]",
  Shadow: "bg-fuchsia-500/20 text-fuchsia-200 ring-1 ring-fuchsia-400/40 shadow-[0_0_18px_rgba(217,70,239,0.35)]"
};

const initialForm = {
  name: "",
  framework: "",
  task_type: "",
  accuracy: "",
  status: "Deployed"
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
};

const formatAccuracy = (value) => {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return "-";
  return `${numeric.toFixed(1)}%`;
};

export default function App() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchModels = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/models");
      setModels(response.data);
    } catch (err) {
      setError("Unable to load models. Check the backend connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  const avgAccuracy = useMemo(() => {
    if (models.length === 0) return 0;
    const total = models.reduce(
      (sum, model) => sum + Number(model.accuracy || 0),
      0
    );
    return total / models.length;
  }, [models]);

  const activeDeployments = useMemo(() => {
    const activeStatuses = new Set(["Deployed", "Staging"]);
    return models.filter((model) => activeStatuses.has(model.status)).length;
  }, [models]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        accuracy: Number(formData.accuracy)
      };

      await api.post("/models", payload);
      setShowModal(false);
      setFormData(initialForm);
      await fetchModels();
    } catch (err) {
      setError("Failed to register model. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/3 h-96 w-96 rounded-full bg-indigo-500/20 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-fuchsia-500/20 blur-[140px]" />
        <div className="absolute top-1/3 right-1/4 h-72 w-72 rounded-full bg-sky-500/10 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-10">
        <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-200/70">
              AI Model Registry
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-transparent bg-gradient-to-r from-indigo-300 via-fuchsia-300 to-sky-300 bg-clip-text text-glow">
              Enterprise Model Command Center
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-300/80">
              Govern, register, and deploy AI models with a real-time pulse on
              performance, status, and operational readiness.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowModal(true)}
            className="group inline-flex items-center gap-2 rounded-full border border-indigo-400/50 bg-indigo-500/20 px-5 py-2 text-sm font-semibold text-indigo-100 shadow-[0_0_25px_rgba(99,102,241,0.5)] transition"
          >
            Register New Model
            <span className="text-indigo-200 transition group-hover:translate-x-1">
              →
            </span>
          </motion.button>
        </header>

        <section className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            {
              label: "Total Models",
              value: models.length.toString().padStart(2, "0"),
              hint: "Across all frameworks"
            },
            {
              label: "Avg Accuracy",
              value: `${avgAccuracy.toFixed(1)}%`,
              hint: "Weighted by registry"
            },
            {
              label: "Active Deployments",
              value: activeDeployments.toString().padStart(2, "0"),
              hint: "Live in prod or staging"
            }
          ].map((card) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="glass-card neon-ring rounded-2xl p-6"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                {card.label}
              </p>
              <p className="mt-4 text-3xl font-semibold text-white">
                {card.value}
              </p>
              <p className="mt-2 text-xs text-slate-400">{card.hint}</p>
            </motion.div>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Performance Trend
                </p>
                <h2 className="mt-2 text-lg font-semibold text-white">
                  Accuracy Momentum
                </h2>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-300">
                Last 6 months
              </span>
            </div>

            <div className="mt-6 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="accuracyGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#818cf8" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#818cf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis dataKey="month" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" domain={[80, 100]} />
                  <Tooltip
                    contentStyle={{
                      background: "#0f172a",
                      border: "1px solid rgba(148,163,184,0.2)",
                      borderRadius: "12px",
                      color: "#e2e8f0"
                    }}
                    labelStyle={{ color: "#cbd5f5" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="accuracy"
                    stroke="#818cf8"
                    fill="url(#accuracyGlow)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="glass-card rounded-2xl p-6"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Registry Pulse
            </p>
            <h2 className="mt-2 text-lg font-semibold text-white">
              Operational Signals
            </h2>
            <div className="mt-6 space-y-4 text-sm text-slate-300">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span>Model Health Index</span>
                <span className="text-emerald-300">98.2%</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span>Avg Latency</span>
                <span className="text-sky-300">42ms</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span>Drift Monitoring</span>
                <span className="text-fuchsia-300">Stable</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Security Posture</span>
                <span className="text-indigo-200">Hardened</span>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Model Registry
                </p>
                <h2 className="mt-2 text-lg font-semibold text-white">
                  Live Inventory
                </h2>
              </div>
              {error && (
                <span className="rounded-full bg-rose-500/20 px-4 py-1 text-xs text-rose-200">
                  {error}
                </span>
              )}
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-xs uppercase text-slate-400">
                  <tr>
                    <th className="pb-3">Model</th>
                    <th className="pb-3">Framework</th>
                    <th className="pb-3">Task Type</th>
                    <th className="pb-3">Accuracy</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Registered</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading && (
                    <tr>
                      <td className="py-6 text-slate-400" colSpan={6}>
                        Loading models...
                      </td>
                    </tr>
                  )}
                  {!loading && models.length === 0 && (
                    <tr>
                      <td className="py-6 text-slate-400" colSpan={6}>
                        No models found. Register your first model.
                      </td>
                    </tr>
                  )}
                  {!loading &&
                    models.map((model) => (
                      <tr key={model.id} className="text-slate-200">
                        <td className="py-4 font-semibold text-white">
                          {model.name}
                        </td>
                        <td className="py-4">{model.framework}</td>
                        <td className="py-4">{model.task_type}</td>
                        <td className="py-4">{formatAccuracy(model.accuracy)}</td>
                        <td className="py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                              statusStyles[model.status] ||
                              "bg-white/10 text-slate-200"
                            }`}
                          >
                            {model.status}
                          </span>
                        </td>
                        <td className="py-4 text-slate-300">
                          {formatDate(model.created_at)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </section>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-lg rounded-2xl bg-slate-900/80 p-6 backdrop-blur-xl border border-white/10"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Register Model
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-white">
                    New Registry Entry
                  </h3>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 transition hover:text-slate-200"
                >
                  ✕
                </button>
              </div>

              <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
                <div>
                  <label className="text-xs uppercase text-slate-400">Model Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-indigo-400/60"
                    placeholder="Aegis Vision Model"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-xs uppercase text-slate-400">Framework</label>
                    <input
                      type="text"
                      name="framework"
                      value={formData.framework}
                      onChange={handleChange}
                      required
                      className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-indigo-400/60"
                      placeholder="PyTorch"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase text-slate-400">Task Type</label>
                    <input
                      type="text"
                      name="task_type"
                      value={formData.task_type}
                      onChange={handleChange}
                      required
                      className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-indigo-400/60"
                      placeholder="Image Classification"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-xs uppercase text-slate-400">Accuracy (%)</label>
                    <input
                      type="number"
                      name="accuracy"
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.accuracy}
                      onChange={handleChange}
                      required
                      className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-indigo-400/60"
                      placeholder="94.2"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase text-slate-400">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2 text-sm text-white outline-none focus:border-indigo-400/60"
                    >
                      <option>Deployed</option>
                      <option>Staging</option>
                      <option>Training</option>
                      <option>Shadow</option>
                      <option>Archived</option>
                    </select>
                  </div>
                </div>

                <div className="mt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-full bg-indigo-500/80 px-5 py-2 text-sm font-semibold text-white shadow-[0_0_20px_rgba(99,102,241,0.45)] transition hover:bg-indigo-500"
                  >
                    {submitting ? "Registering..." : "Register Model"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
