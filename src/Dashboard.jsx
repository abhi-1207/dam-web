import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const API = "https://dam-project-zbht.onrender.com";

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [latest, setLatest] = useState(null);
  const [mode, setMode] = useState("AUTO");

  // 🔄 FETCH DATA
  const fetchData = async () => {
    try {
      const res = await axios.get(`${API}/dashboard`);

      if (!res.data) return;

      setLatest(res.data);
      setMode(res.data.mode); // 🔥 sync with backend

      const newPoint = {
        time: new Date().toLocaleTimeString(),
        waterLevel: res.data.waterLevel,
      };

      setData((prev) => [...prev.slice(-20), newPoint]);

    } catch (err) {
      console.error("API Error:", err.message);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  // 🔥 MODE SWITCH
  const changeMode = async (newMode) => {
    try {
      await axios.post(`${API}/mode`, { mode: newMode });
      fetchData(); // 🔥 refresh after change
    } catch (err) {
      console.error(err);
    }
  };

  // 🔥 GATE CONTROL
  const controlGate = async (status) => {
    try {
      if (mode !== "MANUAL") {
        alert("Switch to MANUAL mode first");
        return;
      }

      await axios.post(`${API}/gate`, { status });

      // 🔥 refresh immediately
      fetchData();

    } catch (err) {
      console.error(err);
    }
  };

  const getLevelColor = (level) => {
    if (level < 40) return "blue";
    if (level < 70) return "green";
    if (level < 90) return "orange";
    return "red";
  };

  return (
    <div className="dashboard">

      {/* NAVBAR */}
      <div className="navbar">
        <h2>🌊 Smart Dam</h2>

        <div>
          <button
            className={mode === "AUTO" ? "active" : ""}
            onClick={() => changeMode("AUTO")}
          >
            AUTO
          </button>

          <button
            className={mode === "MANUAL" ? "active" : ""}
            onClick={() => changeMode("MANUAL")}
          >
            MANUAL
          </button>
        </div>
      </div>

      {latest && (
        <>
          {/* DATA */}
          <div className="grid">

            <div className="card">
              <div>Water Level</div>
              <h2 className={getLevelColor(latest.waterLevel)}>
                {latest.waterLevel}%
              </h2>
            </div>

            <div className="card">
              <div>Vibration</div>
              <h2 className={latest.vibration === "SAFE" ? "green" : "red"}>
                {latest.vibration}
              </h2>
            </div>

            <div className="card">
              <div>Gate</div>
              <h2>{latest.gateStatus}</h2>
            </div>

            <div className="card">
              <div>Temperature</div>
              <h2>{latest.temperature}°C</h2>
            </div>

          </div>

          {/* AUTO MODE */}
          {mode === "AUTO" && (
            <div className="chart-container">
              <h3>📈 Water Level Trend</h3>

              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                  <CartesianGrid stroke="#333" />
                  <XAxis dataKey="time" stroke="#ccc" />
                  <YAxis domain={[0, 100]} stroke="#ccc" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="waterLevel"
                    stroke="#38bdf8"
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* MANUAL MODE */}
          {mode === "MANUAL" && (
            <div className="manual-control">
              <h3>🎮 Gate Control</h3>

              <button onClick={() => controlGate("OPEN")}>
                OPEN GATE
              </button>

              <button onClick={() => controlGate("CLOSED")}>
                CLOSE GATE
              </button>
            </div>
          )}
        </>
      )}

    </div>
  );
};

export default Dashboard;