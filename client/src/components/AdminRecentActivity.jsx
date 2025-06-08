import { useEffect, useState } from "react";
import { fetchRecentActivity } from "./utils";

export default function AdminRecentActivity({ user }) {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    async function fetchActivity() {
      setLoading(true);
      try {
        const activityData = await fetchRecentActivity(user.role);
        if (!ignore) {
          setActivity(activityData);
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message);
          setLoading(false);
        }
      }
    }
    fetchActivity();
    return () => {
      ignore = true;
    };
  }, [user.role]);

  function extractAndFormatDate(str) {
    const dateRegex =
      /(\d{1,2})[/-](\d{1,2})[/-](\d{4}),?\s*(\d{1,2})[:.](\d{2})[:.](\d{2})/;
    const match = str.match(dateRegex);
    if (!match) return str;
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const year = parseInt(match[3], 10);
    const hour = parseInt(match[4], 10);
    const minute = parseInt(match[5], 10);
    const second = parseInt(match[6], 10);
    const date = new Date(year, month, day, hour, minute, second);
    if (user.role === "admin") {
      date.setHours(date.getHours() + 7);
    }
    const pad = (n) => n.toString().padStart(2, "0");
    const formatted = `${pad(date.getDate())}/${pad(
      date.getMonth() + 1
    )}/${date.getFullYear()}, ${pad(date.getHours())}.${pad(
      date.getMinutes()
    )}.${pad(date.getSeconds())}${user.role === "admin" ? " (UTC+7)" : ""}`;
    return str.replace(dateRegex, formatted);
  }

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!activity.length)
    return <p className="text-gray-500">No recent activity.</p>;
  return (
    <ul className="divide-y divide-gray-200">
      {activity.map((item, i) => (
        <li key={i} className="py-2 text-gray-700 text-sm">
          {extractAndFormatDate(item)}
        </li>
      ))}
    </ul>
  );
}
