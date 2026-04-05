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

const API_URL = "https://dam-project-zbht.onrender.com/latest";

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [latest, setLatest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const res = await axios.get(API_URL);

        if (!isMounted || !res.data) return;

        const water = res.data.waterLevel;

        const newPoint = {
          time: new Date().toLocaleTimeString(),
          waterLevel: water,
        };

        setLatest(res.data);
        setLoading(false);

        setData((prev) => {
          const updated = [...prev, newPoint];
          return updated.slice(-20);
        });

      } catch (err) {
        console.error("API Error:", err.message);
      }
    };

    fetchData();

    // ⚡ Faster polling (2 sec)
    const interval = setInterval(fetchData, 2000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const getLevelColor = (level) => {
    if (level < 40) return "blue";
    if (level < 70) return "green";
    if (level < 90) return "orange";
    return "red";
  };

  return (
    <div className="dashboard">

      <div className="header">🌊 Smart Dam Control Panel</div>

      {loading && <div style={{ textAlign: "center" }}>Loading data...</div>}

      {latest && (
        <div className="grid">

          {/* Water Level */}
          <div className="card">
            <div className="label">Water Level</div>
            <div className={`value ${getLevelColor(latest.waterLevel)}`}>
              {latest.waterLevel}%
            </div>

            <div className="progress">
              <div
                className="progress-fill"
                style={{ width: `${latest.waterLevel}%` }}
              ></div>
            </div>
          </div>

          {/* Vibration */}
          <div className="card">
            <div className="label">Vibration</div>
            <div className={`value ${latest.vibration === "SAFE" ? "green" : "red"}`}>
              {latest.vibration}
            </div>
          </div>

          {/* Gate Status */}
          <div className="card">
            <div className="label">Gate Status</div>
            <div className={`value ${latest.gateStatus === "CLOSED" ? "green" : "red"}`}>
              {latest.gateStatus}
            </div>
          </div>

          {/* Time */}
          <div className="card">
            <div className="label">Last Update</div>
            <div>{new Date(latest.timestamp).toLocaleTimeString()}</div>
          </div>

        </div>
      )}

      {/* Chart */}
      <div className="chart-container">
        <h3>📈 Water Level Trend</h3>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid stroke="#333" />
            <XAxis dataKey="time" stroke="#ccc" />
            <YAxis stroke="#ccc" domain={[0, 100]} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="waterLevel"
              stroke="#38bdf8"
              strokeWidth={3}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};

export default Dashboard;