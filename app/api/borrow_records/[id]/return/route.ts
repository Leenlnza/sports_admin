// app/api/borrow_records/[id]/route.ts
import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise
    const db = client.db("lcc_sports_new") // ใช้ฐานจริง
    const recordId = params.id

    const record = await db.collection("borrow_records").findOne({ _id: new ObjectId(recordId) })
    if (!record) return NextResponse.json({ error: "Borrow record not found" }, { status: 404 })

    // อัปเดตสถานะ borrow record
    await db.collection("borrow_records").updateOne(
      { _id: new ObjectId(recordId) },
      { $set: { status: "returned", returnDate: new Date() } }
    )

    // เพิ่ม available ของอุปกรณ์
    await db.collection("equipment").updateOne(
      { name: record.equipmentName },
      { $inc: { available: 1 } }
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Failed to return equipment" }, { status: 500 })
  }
}
