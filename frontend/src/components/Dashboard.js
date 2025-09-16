import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  CreditCard,
  TrendingUp,
  Target,
  DollarSign,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Activity,
} from "lucide-react";
import useScrollReveal from "../hooks/useScrollReveal";
import use3DTilt from "../hooks/use3DTilt";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);

  // 3D Effects
  const headerRef = useScrollReveal(0.2);
  const statsRef = useScrollReveal(0.1);
  const contentRef = useScrollReveal(0.1);
  const quickActionsRef = use3DTilt(15);
  const savingsRef = use3DTilt(10);

  useEffect(() => {
    // Check if user is authenticated before fetching data
    const token = localStorage.getItem("token");
    if (token) {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [expensesRes, budgetsRes, savingsRes, analyticsRes] =
        await Promise.all([
          axios.get(`${API}/expenses`, { headers }),
          axios.get(`${API}/budgets`, { headers }),
          axios.get(`${API}/savings-goals`, { headers }),
          axios.get(`${API}/analytics/expense-summary`, { headers }),
        ]);

      setExpenses(expensesRes.data.slice(0, 5)); // Recent 5 expenses
      setBudgets(budgetsRes.data);
      setSavingsGoals(savingsRes.data);
      setAnalytics(analyticsRes.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      Food: "bg-orange-100 text-orange-800",
      Travel: "bg-blue-100 text-blue-800",
      "Study Material": "bg-purple-100 text-purple-800",
      Personal: "bg-pink-100 text-pink-800",
      Other: "bg-gray-100 text-gray-800",
    };
    return colors[category] || colors["Other"];
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  const token = localStorage.getItem("token");
  if (!token) {
    return (
      <div className="p-8 space-y-8 animate-slide-in parallax-container">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to Your Dashboard
            </h2>
            <p className="text-gray-600 mb-6">
              Please log in to view your financial overview
            </p>
            <Button
              onClick={() => (window.location.href = "/login")}
              className="btn-primary interactive-3d glow"
            >
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-slide-in parallax-container">
      {/* Header */}
      <div
        ref={headerRef}
        className="flex justify-between items-center scroll-reveal"
      >
        <div>
          <h1 className="text-4xl font-bold text-gray-900 text-3d animate-float">
            Dashboard
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            Welcome back! Here's your financial overview.
          </p>
        </div>
        <div className="flex space-x-3">
          <Button className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Quick Add Expense
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div
        ref={statsRef}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
      >
        <Card className="glass card-hover card-stack interactive-3d animate-slide-in-left">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Expenses
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(analytics.total_expenses || 0)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {analytics.expense_count || 0} transactions
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-xl floating-icon magnetic">
                <CreditCard className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="glass card-hover card-stack interactive-3d animate-slide-in-left"
          style={{ animationDelay: "0.1s" }}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Budgets
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {budgets.length}
                </p>
                <p className="text-sm text-emerald-600 mt-1 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1 floating-icon" />
                  On track
                </p>
              </div>
              <div className="p-3 bg-emerald-100 rounded-xl floating-icon magnetic">
                <DollarSign className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="glass card-hover card-stack interactive-3d animate-slide-in-right"
          style={{ animationDelay: "0.2s" }}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Savings Goals
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {savingsGoals.length}
                </p>
                <p className="text-sm text-blue-600 mt-1 flex items-center">
                  <Target className="h-3 w-3 mr-1 floating-icon" />
                  In progress
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl floating-icon magnetic">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="glass card-hover card-stack interactive-3d animate-scale-in"
          style={{ animationDelay: "0.3s" }}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(analytics.total_expenses * 0.3 || 0)}
                </p>
                <p className="text-sm text-orange-600 mt-1 flex items-center">
                  <Activity className="h-3 w-3 mr-1 floating-icon" />
                  30% of total
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl floating-icon magnetic">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div ref={contentRef} className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Expenses */}
        <div className="xl:col-span-2">
          <Card className="glass card-hover interactive-3d scroll-reveal">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-3d">
                  Recent Expenses
                </CardTitle>
                <CardDescription>Your latest spending activity</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="btn-secondary magnetic"
              >
                View All
                <ArrowUpRight className="h-4 w-4 ml-2 floating-icon" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {expenses.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300 floating-icon" />
                    <p>No expenses recorded yet</p>
                    <p className="text-sm">Start tracking your spending!</p>
                  </div>
                ) : (
                  expenses.map((expense, index) => (
                    <div
                      key={expense.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 transition-all duration-300 hover:scale-105 hover:shadow-lg interactive-3d"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-white rounded-lg shadow-sm magnetic">
                          <CreditCard className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {expense.notes || "Expense"}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge
                              variant="secondary"
                              className={`${getCategoryColor(
                                expense.category
                              )} magnetic`}
                            >
                              {expense.category}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {formatDate(expense.date)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-red-600 text-lg">
                          -{formatCurrency(expense.amount)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Savings */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card
            ref={quickActionsRef}
            className="glass card-hover interactive-3d scroll-reveal"
          >
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-3d">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full btn-primary justify-start interactive-3d glow">
                <Plus className="h-4 w-4 mr-3 floating-icon" />
                Add Expense
              </Button>
              <Button className="w-full btn-secondary justify-start interactive-3d magnetic">
                <Target className="h-4 w-4 mr-3 floating-icon" />
                Set Budget
              </Button>
              <Button className="w-full btn-secondary justify-start interactive-3d magnetic">
                <TrendingUp className="h-4 w-4 mr-3 floating-icon" />
                View Analytics
              </Button>
            </CardContent>
          </Card>

          {/* Savings Progress */}
          <Card
            ref={savingsRef}
            className="glass card-hover interactive-3d scroll-reveal"
          >
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-3d">
                Savings Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              {savingsGoals.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <Target className="h-8 w-8 mx-auto mb-3 text-gray-300 floating-icon" />
                  <p className="text-sm">No savings goals yet</p>
                  <Button
                    className="mt-3 btn-primary interactive-3d glow"
                    size="sm"
                  >
                    Create Goal
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {savingsGoals.slice(0, 3).map((goal, index) => {
                    const progress =
                      (goal.current_amount / goal.target_amount) * 100;
                    return (
                      <div
                        key={goal.id}
                        className="space-y-2 interactive-3d"
                        style={{ animationDelay: `${index * 0.2}s` }}
                      >
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-gray-900">
                            {goal.title}
                          </span>
                          <span className="text-gray-600">
                            {formatCurrency(goal.current_amount)} /{" "}
                            {formatCurrency(goal.target_amount)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 morph">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-teal-600 h-3 rounded-full transition-all duration-700 shimmer"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500">
                          {progress.toFixed(1)}% complete
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
