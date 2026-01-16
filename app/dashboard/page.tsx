"use client";
import {
  Gamepad2,
  Users,
  Trophy,
  Search,
  Bell,
  Settings,
  LogOut,
  Target,
  Zap,
  Award,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useRouter } from "next/navigation";
import { useGames } from "../../api/queries";

export default function PlaySyncDashboard() {
  const router = useRouter();
  const { data: games, isLoading, error } = useGames();

  // Sample data for charts (fallback if no API data)
  const weeklyData = [
    { day: "Mon", hours: 3, wins: 5 },
    { day: "Tue", hours: 4, wins: 7 },
    { day: "Wed", hours: 2, wins: 3 },
    { day: "Thu", hours: 5, wins: 8 },
    { day: "Fri", hours: 6, wins: 10 },
    { day: "Sat", hours: 8, wins: 12 },
    { day: "Sun", hours: 7, wins: 9 },
  ];

  const gameDistribution = games ? games.map((game: any, index: number) => ({
    name: game.name || `Game ${index + 1}`,
    value: game.value || Math.floor(Math.random() * 20) + 5,
    color: ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0", "#d1fae5"][index % 5]
  })) : [
    { name: "Valorant", value: 35, color: "#10b981" },
    { name: "Apex Legends", value: 25, color: "#34d399" },
    { name: "CS:GO", value: 20, color: "#6ee7b7" },
    { name: "Fortnite", value: 15, color: "#a7f3d0" },
    { name: "Others", value: 5, color: "#d1fae5" },
  ];

  const topPlayers = [
    { rank: 1, name: "ShadowNinja", score: 2850, wins: 145, avatar: "🥇" },
    { rank: 2, name: "ProGamer99", score: 2720, wins: 138, avatar: "🥈" },
    { rank: 3, name: "EliteSniper", score: 2650, wins: 132, avatar: "🥉" },
    { rank: 4, name: "QuickShot", score: 2580, wins: 128, avatar: "👤" },
    { rank: 5, name: "TacticalKing", score: 2510, wins: 125, avatar: "👤" },
    { rank: 6, name: "GameMaster", score: 2480, wins: 121, avatar: "👤" },
    { rank: 7, name: "StealthMode", score: 2450, wins: 118, avatar: "👤" },
    { rank: 8, name: "VictoryRush", score: 2420, wins: 115, avatar: "👤" },
  ];

  const activePlayers = [
    { id: 1, name: "AlphaWolf", status: "online", game: "Valorant", level: 45 },
    {
      id: 2,
      name: "BetaStrike",
      status: "online",
      game: "Apex Legends",
      level: 38,
    },
    { id: 3, name: "GammaForce", status: "in-game", game: "CS:GO", level: 52 },
    { id: 4, name: "DeltaRush", status: "online", game: "Fortnite", level: 41 },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error loading dashboard: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Gamepad2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-800">PlaySync</span>
            </div>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search players, games..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-600 hover:text-green-600 transition">
                <Bell className="w-6 h-6" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 text-gray-600 hover:text-green-600 transition">
                <Settings className="w-6 h-6" />
              </button>
              <button className="p-2 text-gray-600 hover:text-red-600 transition">
                <LogOut className="w-6 h-6" />
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                JD
              </div>
              <button
                onClick={() => router.push("/games")}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 
                 text-white font-semibold rounded-xl 
                 shadow-md hover:shadow-lg 
                 hover:scale-105 transition-all"
              >
                🎮 Join Game
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-green-600 text-sm font-semibold">+12%</span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">
              Active Players
            </h3>
            <p className="text-3xl font-bold text-gray-800">1,284</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Trophy className="w-6 h-6 text-emerald-600" />
              </div>
              <span className="text-emerald-600 text-sm font-semibold">
                +8%
              </span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">
              Total Wins
            </h3>
            <p className="text-3xl font-bold text-gray-800">845</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-blue-600 text-sm font-semibold">+15%</span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">Win Rate</h3>
            <p className="text-3xl font-bold text-gray-800">68%</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-purple-600 text-sm font-semibold">+5%</span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">
              Hours Played
            </h3>
            <p className="text-3xl font-bold text-gray-800">235h</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Weekly Performance */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Weekly Performance
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="hours"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: "#10b981", r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="wins"
                  stroke="#34d399"
                  strokeWidth={3}
                  dot={{ fill: "#34d399", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Game Distribution */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Game Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={gameDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {gameDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {gameDistribution.map((game: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: game.color }}
                    ></div>
                    <span className="text-gray-600">{game.name}</span>
                  </div>
                  <span className="font-semibold text-gray-800">
                    {game.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Leaderboard and Active Players */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Players Leaderboard */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Award className="w-5 h-5 text-green-600" />
                Top Players Leaderboard
              </h3>
              <button className="text-sm text-green-600 hover:text-green-700 font-semibold">
                View All
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Rank
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">
                      Player
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">
                      Score
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">
                      Wins
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topPlayers.map((player) => (
                    <tr
                      key={player.rank}
                      className="border-b border-gray-100 hover:bg-green-50 transition"
                    >
                      <td className="py-4 px-4">
                        <span className="text-2xl">{player.avatar}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-gray-800">
                          {player.name}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-green-600 font-bold">
                          {player.score}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-gray-600">{player.wins}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Players */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-6">
              Active Players
            </h3>
            <div className="space-y-4">
              {activePlayers.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-green-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {player.name.substring(0, 2)}
                      </div>
                      <div
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                          player.status === "online"
                            ? "bg-green-500"
                            : "bg-yellow-500"
                        }`}
                      ></div>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">
                        {player.name}
                      </p>
                      <p className="text-xs text-gray-500">{player.game}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-green-600">
                      Lv {player.level}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition">
              Find Players
            </button>
          </div>
        </div>

        {/* Test Sentry Error Reporting */}
        <div className="mt-8 text-center">
          <button
            onClick={() => {
              throw new Error("Test error for Sentry");
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Test Sentry Error
          </button>
        </div>
      </div>
    </div>
  );
}
