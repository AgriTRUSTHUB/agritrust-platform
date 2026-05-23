import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PiggyBank, TrendingUp, Shield, Star, ArrowRight,
  Plus, Minus, Lock, Leaf, ChevronRight, Info, Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ACCOUNT_TIERS = [
  {
    name: "AgriSave Starter",
    minBalance: 0,
    maxBalance: 5000,
    interestRate: 6.5,
    color: "bg-amber-500",
    features: ["No minimum balance", "Monthly interest payments", "Free mobile deposits", "Basic transaction alerts"],
  },
  {
    name: "AgriSave Growth",
    minBalance: 5000,
    maxBalance: 50000,
    interestRate: 8.0,
    color: "bg-[#1A6B3A]",
    features: ["NAD 5,000 minimum balance", "Weekly interest payments", "Harvest Finance pre-approval", "Priority support"],
    recommended: true,
  },
  {
    name: "AgriSave Premium",
    minBalance: 50000,
    maxBalance: null,
    interestRate: 10.5,
    color: "bg-[#2196F3]",
    features: ["NAD 50,000 minimum balance", "Daily interest accrual", "Dedicated relationship manager", "Investment portfolio access"],
  },
];

const TRANSACTION_HISTORY = [
  { id: 1, type: "credit", description: "Harvest sale proceeds — Maize 500kg", amount: 4000, date: "2026-05-14", balance: 12200 },
  { id: 2, type: "credit", description: "Monthly interest payment — April", amount: 82.50, date: "2026-04-30", balance: 8200 },
  { id: 3, type: "debit", description: "Loan repayment — Harvest Finance #HF-004", amount: 1500, date: "2026-04-15", balance: 8117.50 },
  { id: 4, type: "credit", description: "Barter trade settlement — Millet exchange", amount: 2800, date: "2026-04-02", balance: 9617.50 },
  { id: 5, type: "debit", description: "Equipment purchase — Irrigation pipes", amount: 3400, date: "2026-03-20", balance: 6817.50 },
  { id: 6, type: "credit", description: "Cattle sale — 3 head", amount: 12000, date: "2026-03-10", balance: 10217.50 },
];

const GOALS = [
  { name: "New Irrigation System", target: 25000, saved: 12200, deadline: "Dec 2026", color: "bg-[#1A6B3A]" },
  { name: "Seed Stock for Next Season", target: 8000, saved: 5400, deadline: "Aug 2026", color: "bg-[#F5A623]" },
  { name: "Solar Panel Installation", target: 40000, saved: 9800, deadline: "Mar 2027", color: "bg-[#2196F3]" },
];

export default function AgriSave() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  const currentBalance = 12200;
  const currentTier = ACCOUNT_TIERS[1];
  const monthlyInterest = (currentBalance * currentTier.interestRate) / 100 / 12;
  const annualProjection = currentBalance * (1 + currentTier.interestRate / 100);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8 text-center">
        <PiggyBank className="h-16 w-16 text-[#1A6B3A] opacity-60" />
        <h2 className="font-playfair text-2xl font-bold">AgriSave Account</h2>
        <p className="text-muted-foreground max-w-md">Sign in to access your savings account, earn interest, and set financial goals for your farm.</p>
        <Link href="/login"><Button className="bg-[#1A6B3A] text-white">Sign In to Continue</Button></Link>
      </div>
    );
  }

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) { toast({ title: "Invalid amount", description: "Please enter a valid deposit amount.", variant: "destructive" }); return; }
    toast({ title: "Deposit Initiated", description: `NAD ${amount.toLocaleString()} deposit is being processed. Funds will reflect within 1 business day.` });
    setDepositAmount("");
    setShowDeposit(false);
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) { toast({ title: "Invalid amount", description: "Please enter a valid withdrawal amount.", variant: "destructive" }); return; }
    if (amount > currentBalance) { toast({ title: "Insufficient funds", description: "Withdrawal amount exceeds your available balance.", variant: "destructive" }); return; }
    toast({ title: "Withdrawal Submitted", description: `NAD ${amount.toLocaleString()} will be transferred to your linked bank account within 24 hours.` });
    setWithdrawAmount("");
    setShowWithdraw(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-[#1A6B3A] text-white px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center">
              <PiggyBank className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-playfair text-2xl font-bold">AgriSave</h1>
              <p className="text-green-200 text-sm">Agricultural Savings Account</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-2 bg-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-green-200 text-sm">Available Balance</p>
                  <p className="text-4xl font-bold">NAD {currentBalance.toLocaleString()}</p>
                </div>
                <Badge className="bg-[#F5A623] text-white border-0">{currentTier.name}</Badge>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div>
                  <p className="text-green-200 text-xs">Interest Rate</p>
                  <p className="text-xl font-bold">{currentTier.interestRate}% p.a.</p>
                </div>
                <div>
                  <p className="text-green-200 text-xs">Monthly Earnings</p>
                  <p className="text-xl font-bold">NAD {monthlyInterest.toFixed(0)}</p>
                </div>
                <div>
                  <p className="text-green-200 text-xs">Annual Projection</p>
                  <p className="text-xl font-bold">NAD {annualProjection.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <Button onClick={() => { setShowDeposit(true); setShowWithdraw(false); }} className="bg-[#F5A623] hover:bg-[#e09612] text-white border-0">
                  <Plus className="h-4 w-4 mr-1" /> Deposit
                </Button>
                <Button onClick={() => { setShowWithdraw(true); setShowDeposit(false); }} variant="outline" className="border-white text-white bg-white/10 hover:bg-white/20">
                  <Minus className="h-4 w-4 mr-1" /> Withdraw
                </Button>
              </div>
            </div>
            <div className="bg-white/10 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <p className="text-green-200 text-sm mb-1">FarmScore Boost</p>
                <p className="text-sm text-white">Your savings balance improves your FarmScore credit rating</p>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-green-200 text-xs">Savings contribution</span>
                  <span className="text-white font-bold">+45 pts</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full">
                  <div className="h-2 bg-[#F5A623] rounded-full" style={{ width: "45%" }} />
                </div>
              </div>
              <Link href="/farmscore">
                <Button variant="outline" size="sm" className="border-white text-white bg-white/10 hover:bg-white/20 mt-4 w-full">
                  View FarmScore <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {(showDeposit || showWithdraw) && (
        <div className="px-6 py-4 bg-muted/50 border-b border-border">
          <div className="max-w-6xl mx-auto">
            <Card className="border-[#1A6B3A]/20 max-w-md">
              <CardHeader>
                <CardTitle className="text-base">{showDeposit ? "Deposit Funds" : "Withdraw Funds"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="txn-amount">Amount (NAD)</Label>
                  <Input
                    id="txn-amount"
                    type="number"
                    value={showDeposit ? depositAmount : withdrawAmount}
                    onChange={e => showDeposit ? setDepositAmount(e.target.value) : setWithdrawAmount(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={showDeposit ? handleDeposit : handleWithdraw} className="bg-[#1A6B3A] text-white">
                    Confirm {showDeposit ? "Deposit" : "Withdrawal"}
                  </Button>
                  <Button variant="outline" onClick={() => { setShowDeposit(false); setShowWithdraw(false); }}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <div className="px-6 py-10">
        <div className="max-w-6xl mx-auto space-y-10">
          <div>
            <h2 className="font-playfair text-2xl font-bold mb-6">Savings Goals</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {GOALS.map((goal) => {
                const pct = Math.round((goal.saved / goal.target) * 100);
                return (
                  <Card key={goal.name} className="border-border">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="font-semibold text-foreground text-sm">{goal.name}</h3>
                        <Badge variant="outline" className="text-xs">{goal.deadline}</Badge>
                      </div>
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>NAD {goal.saved.toLocaleString()}</span>
                          <span>NAD {goal.target.toLocaleString()}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full">
                          <div className={`h-2 ${goal.color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      <p className="text-sm font-medium text-foreground">{pct}% complete</p>
                    </CardContent>
                  </Card>
                );
              })}
              <Card className="border-dashed border-2 border-muted-foreground/30 flex items-center justify-center min-h-[140px] cursor-pointer hover:border-[#1A6B3A]/50 transition-colors">
                <CardContent className="p-6 text-center">
                  <Plus className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Add New Goal</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div>
            <h2 className="font-playfair text-2xl font-bold mb-6">Account Tiers</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {ACCOUNT_TIERS.map((tier) => (
                <Card key={tier.name} className={`border-border relative ${tier.recommended ? "ring-2 ring-[#1A6B3A]" : ""}`}>
                  {tier.recommended && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-[#1A6B3A] text-white border-0">
                        <Star className="h-3 w-3 mr-1 fill-current" /> Your Current Tier
                      </Badge>
                    </div>
                  )}
                  <CardHeader>
                    <div className={`h-10 w-10 rounded-lg ${tier.color} flex items-center justify-center mb-2`}>
                      <PiggyBank className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-base">{tier.name}</CardTitle>
                    <p className="text-2xl font-bold text-[#1A6B3A]">{tier.interestRate}% <span className="text-sm font-normal text-muted-foreground">p.a.</span></p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {tier.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Shield className="h-3.5 w-3.5 text-[#1A6B3A] mt-0.5 flex-shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-playfair text-2xl font-bold mb-6">Recent Transactions</h2>
            <Card className="border-border">
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {TRANSACTION_HISTORY.map((txn) => (
                    <div key={txn.id} className="flex items-center justify-between px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className={`h-9 w-9 rounded-full flex items-center justify-center ${txn.type === "credit" ? "bg-green-100" : "bg-red-100"}`}>
                          {txn.type === "credit"
                            ? <Plus className="h-4 w-4 text-green-600" />
                            : <Minus className="h-4 w-4 text-red-600" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{txn.description}</p>
                          <p className="text-xs text-muted-foreground">{txn.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold text-sm ${txn.type === "credit" ? "text-green-600" : "text-red-600"}`}>
                          {txn.type === "credit" ? "+" : "-"}NAD {txn.amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">Bal: NAD {txn.balance.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-[#1A6B3A]/5 border border-[#1A6B3A]/20 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-[#1A6B3A]/10 flex items-center justify-center flex-shrink-0">
                <Info className="h-5 w-5 text-[#1A6B3A]" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">NAMFISA Regulated</h3>
                <p className="text-sm text-muted-foreground">AgriSave accounts are regulated by the Namibia Financial Institutions Supervisory Authority (NAMFISA). All deposits are insured up to NAD 100,000 per account holder through the Namibia Deposit Guarantee Fund.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
