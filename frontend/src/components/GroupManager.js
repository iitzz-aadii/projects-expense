import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "../App";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Users,
  Plus,
  DollarSign,
  Calculator,
  UserPlus,
  Receipt,
  TrendingUp,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

const API = process.env.REACT_APP_BACKEND_URL + "/api";

const GroupManager = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupExpenses, setGroupExpenses] = useState([]);
  const [groupSettlement, setGroupSettlement] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);

  // Form states
  const [newGroup, setNewGroup] = useState({ name: "", description: "" });
  const [newExpense, setNewExpense] = useState({
    amount: "",
    description: "",
    category: "Food",
    split_among: [],
  });
  const [newMember, setNewMember] = useState({ name: "", email: "" });

  useEffect(() => {
    if (user) {
      fetchGroups();
    }
  }, [user]);

  useEffect(() => {
    if (selectedGroup) {
      fetchGroupExpenses();
      fetchGroupSettlement();
    }
  }, [selectedGroup]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`${API}/groups`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setGroups(data);
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast.error("Failed to load groups");
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupExpenses = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API}/groups/${selectedGroup.id}/expenses`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      setGroupExpenses(data);
    } catch (error) {
      console.error("Error fetching group expenses:", error);
      toast.error("Failed to load group expenses");
    }
  };

  const fetchGroupSettlement = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API}/groups/${selectedGroup.id}/settlement`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      setGroupSettlement(data);
    } catch (error) {
      console.error("Error fetching settlement:", error);
      toast.error("Failed to load settlement data");
    }
  };

  const createGroup = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API}/groups`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newGroup),
      });

      if (response.ok) {
        toast.success("Group created successfully!");
        setShowCreateGroup(false);
        setNewGroup({ name: "", description: "" });
        fetchGroups();
      } else {
        toast.error("Failed to create group");
      }
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error("Failed to create group");
    }
  };

  const addGroupExpense = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API}/groups/${selectedGroup.id}/expenses`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...newExpense,
            amount: parseFloat(newExpense.amount),
            split_among: selectedGroup.members.map((m) => m.user_id),
          }),
        }
      );

      if (response.ok) {
        toast.success("Expense added successfully!");
        setShowAddExpense(false);
        setNewExpense({
          amount: "",
          description: "",
          category: "Food",
          split_among: [],
        });
        fetchGroupExpenses();
        fetchGroupSettlement();
      } else {
        toast.error("Failed to add expense");
      }
    } catch (error) {
      console.error("Error adding expense:", error);
      toast.error("Failed to add expense");
    }
  };

  const addGroupMember = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API}/groups/${selectedGroup.id}/members`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...newMember,
            user_id: `friend-${Date.now()}`,
          }),
        }
      );

      if (response.ok) {
        toast.success("Member added successfully!");
        setShowAddMember(false);
        setNewMember({ name: "", email: "" });
        fetchGroups();
      } else {
        toast.error("Failed to add member");
      }
    } catch (error) {
      console.error("Error adding member:", error);
      toast.error("Failed to add member");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600">
            Please log in to manage groups
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 text-3d">
            Group Expense Manager
          </h1>
          <p className="text-xl text-gray-600">
            Split expenses with friends and track who owes what
          </p>
        </div>

        <Tabs defaultValue="groups" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="groups">My Groups</TabsTrigger>
            <TabsTrigger value="expenses">Group Expenses</TabsTrigger>
            <TabsTrigger value="settlement">Settlement</TabsTrigger>
          </TabsList>

          <TabsContent value="groups" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-gray-900">
                Your Groups
              </h2>
              <Dialog open={showCreateGroup} onOpenChange={setShowCreateGroup}>
                <DialogTrigger asChild>
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Group
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Group</DialogTitle>
                    <DialogDescription>
                      Create a group to start sharing expenses with friends
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={createGroup} className="space-y-4">
                    <div>
                      <Label htmlFor="groupName">Group Name</Label>
                      <Input
                        id="groupName"
                        value={newGroup.name}
                        onChange={(e) =>
                          setNewGroup({ ...newGroup, name: e.target.value })
                        }
                        placeholder="e.g., College Friends"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="groupDescription">Description</Label>
                      <Input
                        id="groupDescription"
                        value={newGroup.description}
                        onChange={(e) =>
                          setNewGroup({
                            ...newGroup,
                            description: e.target.value,
                          })
                        }
                        placeholder="e.g., Expense sharing with college friends"
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Create Group
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group) => (
                <Card
                  key={group.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    selectedGroup?.id === group.id
                      ? "ring-2 ring-emerald-500"
                      : ""
                  }`}
                  onClick={() => setSelectedGroup(group)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-3d">{group.name}</span>
                      <Badge variant="secondary">
                        {group.members.length} members
                      </Badge>
                    </CardTitle>
                    <CardDescription>{group.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        Members: {group.members.map((m) => m.name).join(", ")}
                      </div>
                      <div className="text-xs text-gray-500">
                        Created:{" "}
                        {new Date(group.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="expenses" className="space-y-6">
            {selectedGroup ? (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Expenses for {selectedGroup.name}
                  </h2>
                  <div className="space-x-2">
                    <Dialog
                      open={showAddExpense}
                      onOpenChange={setShowAddExpense}
                    >
                      <DialogTrigger asChild>
                        <Button className="bg-emerald-600 hover:bg-emerald-700">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Expense
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Group Expense</DialogTitle>
                          <DialogDescription>
                            Add an expense that will be split among all group
                            members
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={addGroupExpense} className="space-y-4">
                          <div>
                            <Label htmlFor="expenseAmount">Amount (₹)</Label>
                            <Input
                              id="expenseAmount"
                              type="number"
                              step="0.01"
                              value={newExpense.amount}
                              onChange={(e) =>
                                setNewExpense({
                                  ...newExpense,
                                  amount: e.target.value,
                                })
                              }
                              placeholder="0.00"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="expenseDescription">
                              Description
                            </Label>
                            <Input
                              id="expenseDescription"
                              value={newExpense.description}
                              onChange={(e) =>
                                setNewExpense({
                                  ...newExpense,
                                  description: e.target.value,
                                })
                              }
                              placeholder="e.g., Dinner at restaurant"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="expenseCategory">Category</Label>
                            <Select
                              value={newExpense.category}
                              onValueChange={(value) =>
                                setNewExpense({
                                  ...newExpense,
                                  category: value,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Food">Food</SelectItem>
                                <SelectItem value="Transport">
                                  Transport
                                </SelectItem>
                                <SelectItem value="Entertainment">
                                  Entertainment
                                </SelectItem>
                                <SelectItem value="Utilities">
                                  Utilities
                                </SelectItem>
                                <SelectItem value="Housing">Housing</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button type="submit" className="w-full">
                            Add Expense
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                    <Dialog
                      open={showAddMember}
                      onOpenChange={setShowAddMember}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add Member
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Group Member</DialogTitle>
                          <DialogDescription>
                            Add a new member to this group
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={addGroupMember} className="space-y-4">
                          <div>
                            <Label htmlFor="memberName">Name</Label>
                            <Input
                              id="memberName"
                              value={newMember.name}
                              onChange={(e) =>
                                setNewMember({
                                  ...newMember,
                                  name: e.target.value,
                                })
                              }
                              placeholder="Friend's name"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="memberEmail">Email</Label>
                            <Input
                              id="memberEmail"
                              type="email"
                              value={newMember.email}
                              onChange={(e) =>
                                setNewMember({
                                  ...newMember,
                                  email: e.target.value,
                                })
                              }
                              placeholder="friend@email.com"
                              required
                            />
                          </div>
                          <Button type="submit" className="w-full">
                            Add Member
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <div className="space-y-4">
                  {groupExpenses.map((expense) => (
                    <Card
                      key={expense.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <h3 className="font-semibold text-lg text-3d">
                              {expense.description}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span className="flex items-center">
                                <Receipt className="h-4 w-4 mr-1" />
                                {expense.category}
                              </span>
                              <span className="flex items-center">
                                <Users className="h-4 w-4 mr-1" />
                                Paid by {expense.paid_by_name}
                              </span>
                              <span className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-1" />
                                {formatCurrency(
                                  expense.amount / expense.split_among.length
                                )}{" "}
                                per person
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-emerald-600">
                              {formatCurrency(expense.amount)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(expense.date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  Select a Group
                </h3>
                <p className="text-gray-500">
                  Choose a group from the "My Groups" tab to view expenses
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="settlement" className="space-y-6">
            {selectedGroup && groupSettlement ? (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Settlement for {selectedGroup.name}
                  </h2>
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    Total: {formatCurrency(groupSettlement.total_expenses)}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Calculator className="h-5 w-5 mr-2" />
                        Member Balances
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {Object.entries(groupSettlement.member_balances).map(
                        ([userId, balance]) => {
                          const member = selectedGroup.members.find(
                            (m) => m.user_id === userId
                          );
                          return (
                            <div
                              key={userId}
                              className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                            >
                              <span className="font-medium">
                                {member?.name || "Unknown"}
                              </span>
                              <span
                                className={`font-bold ${
                                  balance > 0
                                    ? "text-green-600"
                                    : balance < 0
                                    ? "text-red-600"
                                    : "text-gray-600"
                                }`}
                              >
                                {balance > 0 ? "+" : ""}
                                {formatCurrency(balance)}
                              </span>
                            </div>
                          );
                        }
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Settlements Needed
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {groupSettlement.settlements.length > 0 ? (
                        groupSettlement.settlements.map((settlement, index) => (
                          <div
                            key={index}
                            className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500"
                          >
                            <div className="font-medium text-blue-900">
                              {settlement.debtor_name} owes{" "}
                              {settlement.creditor_name}
                            </div>
                            <div className="text-lg font-bold text-blue-700">
                              {formatCurrency(settlement.amount)}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-gray-500">
                          <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                          <p>All settled up! No payments needed.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  Select a Group
                </h3>
                <p className="text-gray-500">
                  Choose a group from the "My Groups" tab to view settlement
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GroupManager;
