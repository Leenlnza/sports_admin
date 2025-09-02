"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { BookOpen, Users, Search, Plus, LogOut, AlertCircle } from "lucide-react"

interface Equipment { _id: string; name: string; category: string; description: string; total: number; available: number; }
interface Member { _id: string; name: string; email: string; phone: string; }
interface BorrowRecord { _id: string; userId: string; equipmentId: string; equipmentName: string; borrowDate: string; returnDate: string; status: "borrowed" | "returned"; }

interface AdminDashboardProps { username: string; onLogout: () => void }

export function AdminDashboard({ username, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [equipments, setEquipments] = useState<Equipment[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [borrowRecords, setBorrowRecords] = useState<BorrowRecord[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  // Form new equipment
  const [newName, setNewName] = useState("")
  const [newCategory, setNewCategory] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [newTotal, setNewTotal] = useState(1)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [eqRes, mbRes, brRes] = await Promise.all([
        fetch("/api/equipment"), fetch("/api/users"), fetch("/api/borrow_records")
      ])
      const [eqData, mbData, brData] = await Promise.all([eqRes.json(), mbRes.json(), brRes.json()])
      setEquipments(eqData)
      setMembers(mbData)
      setBorrowRecords(brData)
      setLoading(false)
    } catch (err) { console.error(err); setLoading(false) }
  }

  const handleReturn = async (brId: string, eqId: string) => {
    const res = await fetch(`/api/borrow_records/${brId}/return`, { method: "PUT" })
    if (!res.ok) return alert("คืนไม่สำเร็จ")
    setBorrowRecords(prev => prev.map(br => br._id === brId ? { ...br, status: "returned" } : br))
    setEquipments(prev => prev.map(eq => eq._id === eqId ? { ...eq, available: eq.available + 1 } : eq))
  }

  // Filter
  const filteredEquipments = equipments.filter(eq => eq.name.toLowerCase().includes(searchTerm.toLowerCase()) || eq.category.toLowerCase().includes(searchTerm.toLowerCase()))
  const filteredMembers = members.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.email.toLowerCase().includes(searchTerm.toLowerCase()) || m.phone.includes(searchTerm))
  const filteredBorrowRecords = borrowRecords.filter(br =>
    br.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    members.find(m => m._id === br.userId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <div className="min-h-screen flex items-center justify-center"><BookOpen className="h-10 w-10 animate-spin text-primary" /></div>

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur-md shadow-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3"><BookOpen className="h-8 w-8 text-primary" /><h1 className="text-2xl font-bold text-foreground">Lcc sports</h1></div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="ค้นหา..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-64 pl-10" />
            </div>
            <Button variant="outline" size="sm" onClick={onLogout} className="gap-2"><LogOut className="h-4 w-4" /> ออกจากระบบ</Button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="container mx-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 border-b border-muted">
            <TabsTrigger value="overview" className="hover:bg-muted/50">ภาพรวม</TabsTrigger>
            <TabsTrigger value="equipments" className="hover:bg-muted/50">อุปกรณ์</TabsTrigger>
            <TabsTrigger value="borrow_records" className="hover:bg-muted/50">การยืม-คืน</TabsTrigger>
            <TabsTrigger value="members" className="hover:bg-muted/50">สมาชิก</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <Card className="hover:shadow-md transition-shadow"><CardHeader><CardTitle>อุปกรณ์ทั้งหมด</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{equipments.length}</CardContent></Card>
              <Card className="hover:shadow-md transition-shadow"><CardHeader><CardTitle>อุปกรณ์ที่ถูกยืม</CardTitle></CardHeader><CardContent className="text-2xl font-bold text-secondary">{equipments.filter(eq => eq.available < eq.total).length}</CardContent></Card>
              <Card className="hover:shadow-md transition-shadow"><CardHeader><CardTitle>การยืมที่ใช้งานอยู่</CardTitle></CardHeader><CardContent className="text-2xl font-bold text-accent">{borrowRecords.filter(br => br.status==="borrowed").length}</CardContent></Card>
              <Card className="hover:shadow-md transition-shadow"><CardHeader><CardTitle>สมาชิกทั้งหมด</CardTitle></CardHeader><CardContent className="text-2xl font-bold">{members.length}</CardContent></Card>
              <Card className="hover:shadow-md transition-shadow"><CardHeader><CardTitle>อุปกรณ์เกินกำหนด</CardTitle></CardHeader><CardContent className="text-2xl font-bold text-destructive">{borrowRecords.filter(br => br.status==="borrowed" && new Date()>new Date(br.returnDate)).length}</CardContent></Card>
            </div>
          </TabsContent>

          {/* Equipments Tab */}
          <TabsContent value="equipments" className="space-y-6">
            <Card>
              <CardHeader className="flex justify-between items-center">
                <div><CardTitle>จัดการอุปกรณ์</CardTitle><CardDescription>รายการอุปกรณ์ทั้งหมด</CardDescription></div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="gap-2"><Plus className="h-4 w-4" /> เพิ่มอุปกรณ์</Button>
                  </DialogTrigger>
                  <DialogContent className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white/30 backdrop-blur-md shadow-lg border rounded-lg">
                    <DialogHeader><DialogTitle>เพิ่มอุปกรณ์ใหม่</DialogTitle><DialogDescription>กรอกข้อมูลอุปกรณ์ที่ต้องการเพิ่ม</DialogDescription></DialogHeader>
                    <div className="space-y-2 mt-2">
                      <Input placeholder="ชื่ออุปกรณ์" value={newName} onChange={e => setNewName(e.target.value)} />
                      <Input placeholder="หมวดหมู่" value={newCategory} onChange={e => setNewCategory(e.target.value)} />
                      <Input placeholder="คำอธิบาย" value={newDescription} onChange={e => setNewDescription(e.target.value)} />
                      <Input type="number" placeholder="จำนวนทั้งหมด" value={newTotal} onChange={e => setNewTotal(Number(e.target.value))} />
                    </div>
                    <DialogFooter>
                      <Button className="w-full" onClick={async () => {
                        if(!newName||!newCategory||!newDescription||newTotal<=0) return alert("กรุณากรอกข้อมูลครบ")
                        const res = await fetch("/api/equipment",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:newName,category:newCategory,description:newDescription,total:newTotal,available:newTotal})})
                        if(!res.ok) return alert("เพิ่มอุปกรณ์ไม่สำเร็จ")
                        const eq = await res.json()
                        setEquipments(prev=>[...prev,eq])
                        setNewName(""); setNewCategory(""); setNewDescription(""); setNewTotal(1)
                      }}>เพิ่ม</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredEquipments.map(eq => (
                    <div key={eq._id} className="flex justify-between items-center p-4 border rounded-lg hover:shadow-sm transition-shadow">
                      <div>
                        <h3 className="font-medium">{eq.name}</h3>
                        <p className="text-xs text-muted-foreground">หมวดหมู่: {eq.category}</p>
                        <p className="text-xs text-muted-foreground">{eq.description}</p>
                      </div>
                      <Badge variant={eq.available>0?"default":"secondary"}>{eq.available>0?"พร้อมให้ยืม":"ถูกยืมหมด"}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Borrow Records */}
          <TabsContent value="borrow_records" className="space-y-6">
            <Card>
              <CardHeader><CardTitle>การยืม-คืน</CardTitle><CardDescription>รายการยืม-คืนทั้งหมด</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                {filteredBorrowRecords.map(br => (
                  <div key={br._id} className="flex justify-between items-center p-4 border rounded-lg hover:shadow-sm transition-shadow">
                    <div>
                      <h3 className="font-medium">{br.equipmentName}</h3>
                      <p className="text-sm text-muted-foreground">ผู้ยืม: {members.find(m=>m._id===br.userId)?.name||"ไม่พบสมาชิก"}</p>
                      <p className="text-xs text-muted-foreground">ยืม: {new Date(br.borrowDate).toLocaleDateString()} | คืน: {new Date(br.returnDate).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={br.status==="borrowed"?"default":"secondary"}>{br.status==="borrowed"?"กำลังยืม":"คืนแล้ว"}</Badge>
                      {br.status==="borrowed"&&<Button size="sm" variant="outline" onClick={()=>handleReturn(br._id, br.equipmentId)}>คืน</Button>}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Members */}
          <TabsContent value="members" className="space-y-6">
            <Card>
              <CardHeader><CardTitle>สมาชิก</CardTitle><CardDescription>รายการสมาชิกทั้งหมด</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                {filteredMembers.map(m => (
                  <div key={m._id} className="flex justify-between items-center p-4 border rounded-lg hover:shadow-sm transition-shadow">
                    <div><h3 className="font-medium">{m.name}</h3><p className="text-xs text-muted-foreground">{m.email} | {m.phone}</p></div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  )
}
