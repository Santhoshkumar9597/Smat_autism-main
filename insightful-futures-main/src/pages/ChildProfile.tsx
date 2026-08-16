import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AppHeader from "@/components/AppHeader";

const ChildProfile = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    childName: "",
    age: "",
    gender: "",
    guardianName: "",
    guardianPhone: "",
    guardianEmail: "",
  });

  const childId = `AUT-${String(Math.floor(1000 + Math.random() * 9000))}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("childProfile", JSON.stringify({ ...form, childId, testDate: new Date().toISOString() }));
    navigate("/upload");
  };

  return (
    <div className="min-h-screen bg-background font-body">
      <AppHeader />
      <main className="container mx-auto px-4 py-10 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="shadow-lg border-none">
            <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
              <CardTitle className="flex items-center gap-2 font-heading">
                <UserPlus className="w-5 h-5" /> Child Profile Setup
              </CardTitle>
              <p className="text-sm text-primary-foreground/80">Child ID: {childId}</p>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Child's Name</Label>
                    <Input required value={form.childName} onChange={e => setForm(f => ({ ...f, childName: e.target.value }))} placeholder="Enter name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Age (Years)</Label>
                    <Input required type="number" min={1} max={18} value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} placeholder="e.g. 4" />
                  </div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select required value={form.gender} onValueChange={v => setForm(f => ({ ...f, gender: v }))}>
                      <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h3 className="font-heading font-semibold mb-3 text-foreground">Guardian Information</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Guardian Name</Label>
                      <Input required value={form.guardianName} onChange={e => setForm(f => ({ ...f, guardianName: e.target.value }))} placeholder="Full name" />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <Input value={form.guardianPhone} onChange={e => setForm(f => ({ ...f, guardianPhone: e.target.value }))} placeholder="+91 ..." />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Email</Label>
                      <Input type="email" value={form.guardianEmail} onChange={e => setForm(f => ({ ...f, guardianEmail: e.target.value }))} placeholder="guardian@email.com" />
                    </div>
                  </div>
                </div>
                <Button type="submit" className="w-full font-heading font-bold">
                  Continue to Upload →
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default ChildProfile;
